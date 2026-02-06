---
allowed-tools: [Read, Edit, Write, Grep]
description: Add entries to the Bloviate custom dictionary
argument-hint: ["phrase" "variation1, variation2, ..."]
---

# Bloviate Dictionary

Add entries to the Bloviate speech-to-text custom dictionary at `/Users/bronson/personal/bloviate/custom_dictionary.yaml`.

## Usage

```
/bloviate-dictionary "Kubernetes" "kuber netties, cube earnest ease"
/bloviate-dictionary "React hooks" "react hooks, react ooks"
/bloviate-dictionary "Matt Riese"
```

## Process

1. **Parse the arguments:**
   - First quoted string = the correct phrase
   - Second quoted string (optional) = comma-separated list of misheard variations
   - If no arguments provided, ask the user for the phrase and variations

2. **Read the dictionary** at `/Users/bronson/personal/bloviate/custom_dictionary.yaml`

3. **Check for duplicates:**
   - Search for an existing entry with the same phrase (case-insensitive)
   - If found, ask the user whether to merge new variations into the existing entry or skip

4. **Determine placement:**
   - Look at the existing category comments in the file to find the best section:
     - `# Git commands` - git-related commands
     - `# Common misrecognitions` - general terms, tools, tech
     - `# Dev tools and commands` - development tools and CLI commands
     - `# Products, services, and platforms` - company/product names
     - `# Acronyms and internal terms` - abbreviations like API, SDK
     - `# People and places` - names of people or locations
     - `# Add your own custom phrases below` - catch-all at end
   - Place the new entry at the end of the matching section

5. **Generate variations if none provided:**
   - If the user didn't supply variations, generate likely misheard transcriptions:
     - Lowercase version
     - Spaced-out version (e.g., "GitHub" -> "git hub")
     - Common phonetic mishearings
   - Show the generated variations to the user for confirmation before adding

6. **Add the entry** using the Edit tool with this format:
   ```yaml
   - phrase: "ExactPhrase"
     variations:
       - "variation one"
       - "variation two"
   ```
   - Add `match: "whole_word"` if the phrase is short (1-2 characters or a common English word that should only match as a standalone word)

7. **Confirm** what was added and where in the file

## Dictionary Format Reference

```yaml
entries:
  # Section comment
  - phrase: "Correct Text"
    variations:
      - "how it might be misheard"
      - "another misheard version"

  - phrase: "ShortWord"
    match: "whole_word"
    variations:
      - "misheard version"
```

## Important Rules

- **Preserve file structure** - do not reformat or reorder existing entries
- **Match existing style** - use the same indentation (2 spaces) and quoting style
- **No duplicate phrases** - always check before adding
- **Variations should be lowercase** or match how a transcription engine would output them
- **Keep it focused** - only add entries that are genuinely misheard by speech-to-text
