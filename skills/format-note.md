# Format Note

Clean up and format Obsidian notes for maximum readability while preserving the original voice and text.

## What this skill does

1. **Fixes formatting issues:**
   - Corrects spacing (removes extra blank lines, fixes inconsistent spacing)
   - Aligns text properly
   - Cleans up copy-paste artifacts
   - Ensures consistent markdown formatting

2. **Adds metadata:**
   - Auto-adds relevant backlinks using [[WikiLinks]] for entities mentioned (companies, people, projects)
   - Auto-adds appropriate tags (e.g., #meeting, #project, #technical)
   - Places metadata at the top of the note in a clean format

3. **Preserves content:**
   - Does NOT change the actual text or rewrite content
   - Does NOT autocorrect spelling or grammar
   - Does NOT modify intentional stylistic choices
   - Maintains the author's voice and word choices

## Instructions

When the user invokes this skill on a note:

1. **Read the note** completely to understand its content and context

2. **Identify metadata to add:**
   - Scan for company names (e.g., Coval, Zoom, Hippocratic, Speak, etc.)
   - Scan for people names
   - Scan for project names
   - Determine note type (meeting, technical doc, project note, etc.)

3. **Format the note:**
   - Add YAML frontmatter at the top with:
     - `tags:` array with relevant tags
     - Other metadata as appropriate
   - Add backlinks section right after frontmatter or at the top if no frontmatter
   - Fix spacing issues:
     - Remove excessive blank lines (max 2 consecutive blank lines)
     - Ensure consistent spacing around headers
     - Fix indentation issues
     - Clean up bullet point formatting
   - Ensure proper markdown syntax:
     - Headers have proper spacing
     - Lists are properly formatted
     - Code blocks are properly formatted
     - Links are properly formatted

4. **Preserve original content:**
   - Keep ALL original text exactly as written
   - Do NOT rephrase or rewrite anything
   - Do NOT fix spelling unless it's clearly a typo from copy-paste
   - Do NOT change capitalization or punctuation
   - Do NOT add or remove words

5. **Output the formatted note** using the Edit or Write tool

## Example

### Before:
```
Had a meeting with zoom about integrating coval


discussed the following:
- technical integration
- timeline


- next steps


They mentioned their API


```

### After:
```
---
tags: [meeting]
---

Related: [[Coval]] | [[Zoom]]

Had a meeting with zoom about integrating coval

Discussed the following:
- technical integration
- timeline
- next steps

They mentioned their API
```

## Usage

Invoke with: `/format-note` or "format this note"

The skill will:
1. Ask which note to format (or use the currently open note)
2. Read the note
3. Apply formatting fixes
4. Add relevant backlinks and tags
5. Save the formatted version
