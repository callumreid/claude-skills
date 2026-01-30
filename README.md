# Claude Skills

Personal collection of Claude Code skills and commands for managing my Obsidian vault (Bronniopollis).

## Skills

### format-note
Clean up and format Obsidian notes for maximum readability while preserving original voice.

**What it does:**
- Fixes spacing and alignment issues from copy-paste
- Adds relevant backlinks using [[WikiLinks]]
- Auto-adds appropriate tags (#meeting, #project, etc.)
- Preserves ALL original text - no rewrites or autocorrect

**Usage:** `/format-note [optional-file-path]`

### strava-sync
Fetch Strava activity data and sync it to daily notes in Obsidian.

**What it does:**
- Pulls activities from Strava API (rides, runs, swims, etc.)
- Adds/updates `## Daily Activity Log` section in daily notes
- Formats with distance, duration, pace/speed, elevation, heart rate

**Usage:**
```
/strava-sync                        # Sync today
/strava-sync yesterday              # Sync yesterday
/strava-sync this-week              # Monday through today
/strava-sync 2026-01-15             # Specific date
/strava-sync 2026-01-01:2026-01-15  # Date range
```

**Requires:** Strava MCP server configured in `.mcp.json`

## Installation

Copy skills to `~/.claude/skills/` and commands to `~/.claude/commands/`:

```bash
cp skills/* ~/.claude/skills/
cp commands/* ~/.claude/commands/
```

## Structure

```
claude-skills/
├── skills/          # Skill definitions
├── commands/        # Slash command definitions
└── README.md
```

## About

Created by Callum Taylor Reid for use with Claude Code and Obsidian vault management.
