# Quick Start: Using Grok for Neural Space Articles

## The 30-Second Version

You have a prompt that generates articles in two versions (simplified + scientific) as JSON.

### 5-Minute Workflow

1. **Find your source** (paper, news story, research)
2. **Message Grok**:
   ```
   [PASTE the full prompt from grok-article-generator.md]
   
   Topic: [Your topic]
   Sources: [Links/citations]
   Audience: [General/Mixed/Technical]
   Angle: [What's unique about this story?]
   
   Output as JSON.
   ```

3. **Copy the JSON** from Grok's response

4. **Go to Neural Space**: `/dashboard/articles/new`

5. **Click "Importer JSON"** and paste

6. **Click "Importer"** → Both versions are now populated

7. **Add cover image + category → Publish**

---

## Key Prompt Principles (Remember These!)

### SIMPLIFIED VERSION
- **Hook first** (surprising fact, question, or stakes)
- **Why now?** (immediate relevance)
- **Who did it?** (human story)
- **Simple → Complex** (layer explanation)
- **So what?** (what changes for readers?)

### SCIENTIFIC VERSION
- **Citations everywhere** (Author Year)
- **Mechanisms explained** (how does it work?)
- **Limitations acknowledged** (what don't we know?)
- **Field implications** (where does this fit?)
- **Full bibliography** (DOI included)

---

## Example Hooks (Copy These Patterns)

**Surprising fact**: "Every time you sleep, your brain deliberately erases memories."

**Pressing question**: "What if your gut bacteria are running your mood?"

**Clear stakes**: "The thing keeping you alive might also be slowly breaking your DNA."

---

## Common Mistakes to Avoid

❌ **Burying the lede** → HOOK in sentence 1

❌ **Too neutral** → Add personality (curious, not clickbait)

❌ **No citations in simplified** → Still cite, just integrate smoothly

❌ **Citations in scientific without detail** → Full author/year/journal

❌ **Missing "why now"** → Explain relevance to today

---

## Testing Your Output

After importing JSON, ask yourself:

- [ ] Does the simplified intro hook me in 10 seconds?
- [ ] Does it answer "why should I care?"
- [ ] Does the scientific version have citations?
- [ ] Can someone who's not an expert understand both?
- [ ] Is there a human story (researcher, lab, discovery)?

If yes to all → Ready to publish.

---

## Need Help?

- **Full prompt**: See `grok-article-generator.md`
- **Real examples**: See `EXAMPLES.md`
- **Detailed guide**: See `grok-article-generator.md` (full instructions)

---

## Pro Tip

Save Grok's JSON output in a text file before importing. That way if you need to edit, you have the original.

Pattern:
```
article-title-yyyy-mm-dd.json
```

Example:
```
cells-repair-crew-2026-06-06.json
```
