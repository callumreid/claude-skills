---
allowed-tools: [Read, Edit, Write, Glob, Grep]
description: Format Obsidian notes for readability while preserving original voice
argument-hint: [optional: path to note file]
---

# Format Note

Clean up and format Obsidian notes for maximum readability while preserving the original voice and text.

## Task

Format an Obsidian note by:
1. Fixing spacing and alignment issues (especially from copy-paste)
2. Adding relevant backlinks using [[WikiLinks]] for entities mentioned
3. Adding appropriate tags (e.g., #meeting, #project, #technical)
4. Preserving ALL original text exactly as written

## Process

1. **Identify the note to format:**
   - If user provides a file path, use that
   - Otherwise, ask which note to format
   - Read the note completely

2. **Analyze content:**
   - Scan for company names (Coval, Zoom, Hippocratic, Speak, Volley, etc.)
   - Scan for people names
   - Scan for project names
   - Determine note type (meeting, technical, project, daily note, etc.)

3. **Format the note:**
   - Add YAML frontmatter with tags array if appropriate
   - Add backlinks section using format: `Related: [[Entity1]] | [[Entity2]]`
   - Fix spacing issues:
     - Remove excessive blank lines (max 2 consecutive)
     - Ensure consistent spacing around headers
     - Fix indentation issues
     - Clean up bullet point formatting
   - Ensure proper markdown syntax

4. **Preserve original content:**
   - Keep ALL original text exactly as written
   - Do NOT rephrase or rewrite
   - Do NOT fix spelling unless clearly a copy-paste artifact
   - Do NOT change capitalization, punctuation, or word choices

5. **Save the formatted note** using Edit tool

## Critical Rules

- **NO CONTENT CHANGES:** Only fix formatting, spacing, and add metadata
- **PRESERVE VOICE:** Do not autocorrect or modify the author's writing style
- **ADD VALUE:** Only add backlinks and tags that are clearly relevant
- **MAINTAIN STRUCTURE:** Keep the original note structure intact

## Output

The formatted note with:
- Clean, consistent spacing
- Relevant backlinks at the top
- Appropriate tags in frontmatter
- All original text preserved exactly

## Example Usage

```
/format-note "Coval - Zoom - 01-26-2026.md"
```

Or simply:
```
/format-note
```

Then specify which note when prompted.
