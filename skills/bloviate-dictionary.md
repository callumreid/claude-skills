# Bloviate Dictionary

Add entries to the Bloviate speech-to-text custom dictionary.

## What this skill does

1. **Adds new phrases** to the custom dictionary at `/Users/bronson/personal/bloviate/custom_dictionary.yaml`
2. **Auto-generates variations** if none are provided (common phonetic mishearings)
3. **Places entries** in the correct section based on category (git commands, products, people, etc.)
4. **Prevents duplicates** by checking for existing entries before adding

## Instructions

When the user invokes this skill:

1. **Parse inputs** - get the correct phrase and optional variations
2. **Read the dictionary** file
3. **Check for duplicates** (case-insensitive match on phrase)
4. **Determine the right section** based on content category
5. **Generate variations** if not provided, confirm with user
6. **Add the entry** using Edit tool, preserving file structure
7. **Report** what was added

## Entry format

```yaml
- phrase: "Correct Phrase"
  variations:
    - "misheard version"
    - "another version"
```

Use `match: "whole_word"` for short phrases that are common English words.

## Usage

Invoke with: `/bloviate-dictionary "phrase" "variation1, variation2"` or "add X to my bloviate dictionary"

The skill will:
1. Check for existing entries
2. Find the right section in the file
3. Generate/confirm variations
4. Add the entry and confirm
