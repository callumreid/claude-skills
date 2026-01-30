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
