---
allowed-tools: [Read, Edit, Write, Glob, Grep, mcp__strava-activity__fetch_strava_activity]
description: Sync Strava activities to daily notes
argument-hint: [today | yesterday | this-week | YYYY-MM-DD | YYYY-MM-DD:YYYY-MM-DD]
---

# Strava Sync

Fetch Strava activity data and add it to daily notes in this Obsidian vault.

## Usage

```
/strava-sync                    # Sync today's activities
/strava-sync today              # Sync today's activities
/strava-sync yesterday          # Sync yesterday's activities
/strava-sync this-week          # Sync all days from this week
/strava-sync 2026-01-15         # Sync a specific date
/strava-sync 2026-01-01:2026-01-15  # Sync a date range
```

## Process

1. **Parse the argument** to determine which date(s) to sync:
   - No argument or "today" → today's date
   - "yesterday" → yesterday's date
   - "this-week" → Monday through today of current week
   - Single date (YYYY-MM-DD) → that specific date
   - Date range (YYYY-MM-DD:YYYY-MM-DD) → all dates in range (inclusive)

2. **For each date**, do the following:

   a. **Fetch Strava data** using `mcp__strava-activity__fetch_strava_activity` with the date in YYYY-MM-DD format

   b. **Find the daily note** for that date. Notes are stored at:
      - Path pattern: `{year}/{Month}/Month  DD  YYYY.md` (note: two spaces)
      - Example: `2026/January/January  15  2026.md`
      - Some older notes use single space: `Month DD YYYY.md`

   c. **Read the daily note** to check its current state

   d. **Update the note** with Strava data:
      - If note has no `## Daily Activity Log` section, add it at the end
      - If note has `### Strava Activities` already, replace that subsection
      - Otherwise, add `### Strava Activities (Month Day)` under Daily Activity Log

3. **Report results** showing which notes were updated and what activities were found

## Strava Data Format

The MCP tool returns formatted markdown like:
```markdown
- **Ride**: [Morning Ride](https://www.strava.com/activities/123) • 12.5 mi • 1h 10m • 10.7 mph avg • 491ft elevation • 49 achievements
- **Run**: [Evening Run](https://www.strava.com/activities/456) • 3.1 mi • 28m • 9:02/mi pace
```

Or if no activities:
```markdown
- No activities recorded
```

## Daily Note Section Format

Insert/update this structure in daily notes:

```markdown
## Daily Activity Log

### Strava Activities (January 15)
- **Ride**: [Morning Ride](https://www.strava.com/activities/123) • 12.5 mi • 1h 10m
```

## Important Rules

1. **Preserve existing content** - Only modify the Strava Activities section
2. **Handle missing notes gracefully** - If a daily note doesn't exist, skip it and report
3. **Rate limiting** - Strava API has limits (~100 calls). For large ranges, warn the user
4. **Date format matters** - Use YYYY-MM-DD for the API, "Month Day" for the section header

## Date Parsing Reference

Convert YYYY-MM-DD to note path:
- `2026-01-15` → year=2026, month=January, day=15
- Note path: `2026/January/January  15  2026.md`

Month names: January, February, March, April, May, June, July, August, September, October, November, December

## Error Handling

- If Strava returns an authentication error, inform user to check `.mcp.json` credentials
- If daily note not found, report and continue with other dates
- If rate limited, stop and report which dates were completed

## Output

After syncing, report:
- Total dates processed
- Notes updated (with activity counts)
- Notes skipped (not found)
- Any errors encountered
