# Neural Space Grok Prompt System

Complete guide for using Grok to generate dual-content articles (simplified + scientific) in JSON format.

---

## 📚 Files in This Directory

### **For Quick Reference**
- **`QUICK_START.md`** — 30-second version. Start here.
- **`COPY_PASTE_PROMPT.md`** — Ready-to-paste prompt for Grok. Just fill in your topic.

### **For Understanding**
- **`grok-article-generator.md`** — Full technical reference. How everything works.
- **`EXAMPLES.md`** — Real before/after examples. See the difference.

### **For Verification**
- **`TONE_CHECKLIST.md`** — Checklist before publishing. Make sure article passes quality gates.

---

## ⚡ 60-Second Start

1. **Open Grok/Claude**
2. **Paste** `COPY_PASTE_PROMPT.md` (all of it)
3. **Replace** the bracketed sections with your topic info
4. **Get** JSON output
5. **Go to** Neural Space `/dashboard/articles/new`
6. **Click** "Importer JSON" and paste
7. **Click** "Importer" → Done
8. **Add** cover image, category, publish

---

## 🎯 What This System Does

### Input
You give Grok:
- Topic (what's the discovery?)
- Sources (papers, news, research)
- Audience level (general / mixed / technical)
- Angle (what makes this unique?)

### Output
Grok returns JSON with:
- **Metadata**: title, summary, reading time, word count
- **Simplified version**: Engaging, narrative, accessible
- **Scientific version**: Rigorous, cited, technical

### Result
Both versions auto-populate in Neural Space editor → publish immediately

---

## ✨ Key Features

### Simplified Version (Comprendre simplement)
- **Strong hook** in first 3 lines (surprise/question/stakes)
- **Human story** (who discovered it, why they were researching)
- **Why now?** (immediate, current relevance)
- **Progressive complexity** (simple → technical)
- **Reader-focused** (what changes for them?)

### Scientific Version (Version scientifique)
- **Citations everywhere** (Author Year format)
- **Mechanism explained** (how does it work?)
- **Limitations acknowledged** (what we still don't know)
- **Field implications** (where does this fit?)
- **Full bibliography** (with DOI)

---

## 🚀 Workflow

```
Research/Topic → Grok Prompt → JSON Output → Import to Neural Space → Publish
```

**Time**: ~10 minutes per article
**Quality**: Consistent structure, strong hooks, proper citations
**Bonus**: Two versions from one prompt

---

## 📖 Hook Examples (Copy These Patterns)

**Surprising Fact Hook**
- "Every time you sleep, your brain is deliberately erasing memories."
- "Your cells have a repair crew—and it's getting tired."

**Pressing Question Hook**
- "What if cancer's biggest advantage isn't that it mutates, but that it cooperates?"
- "What if your gut bacteria are more responsible for your mood than your therapist?"

**Clear Stakes Hook**
- "The thing keeping you alive might also be slowly breaking your DNA."
- "We've been wrong about aging—and now we know why."

---

## ✅ Pre-Publish Checklist

### Simplified Version
- [ ] Hook in sentence 1
- [ ] "Why now?" answered by sentence 3
- [ ] Human story included
- [ ] Complexity builds gradually
- [ ] Ends with reader takeaway
- [ ] Reads like curious friend, not Wikipedia

### Scientific Version
- [ ] Every claim cited (Author Year)
- [ ] Mechanisms explained clearly
- [ ] Limitations noted
- [ ] Bibliography complete with DOI
- [ ] Technical but not jargon-soup
- [ ] Field context clear

### Both
- [ ] Title is curiosity-driven, not generic
- [ ] Summary has stakes + human element
- [ ] Reading time realistic
- [ ] Word count matches content

**All checked?** → Ready to publish

---

## 🤔 Common Questions

**Q: What if Grok's output isn't perfect?**
A: Ask it to adjust specific sections: "Make the intro 20% punchier" or "Add more mechanisms to the scientific section."

**Q: Do I need to edit after importing?**
A: Usually not. But you can add details, citations, or refine tone in the editor if needed.

**Q: What about images?**
A: Import the JSON first, then add cover image in the Neural Space editor before publishing.

**Q: Can I use this for existing articles?**
A: Yes. Edit any article, check "Dual content" checkbox, import JSON. It will populate both versions.

**Q: What if I only want one version?**
A: Still use the prompt (gives both), but only publish the one you want. The other stays in draft.

---

## 📊 File Organization

```
lib/prompts/
├── README.md (this file)
├── QUICK_START.md (start here)
├── COPY_PASTE_PROMPT.md (use this for Grok)
├── grok-article-generator.md (full reference)
├── EXAMPLES.md (before/after examples)
└── TONE_CHECKLIST.md (quality verification)
```

---

## 🎓 Learning Path

**First time?** → `QUICK_START.md` → `COPY_PASTE_PROMPT.md`

**Want to understand?** → `EXAMPLES.md` → `grok-article-generator.md`

**Before publishing?** → `TONE_CHECKLIST.md`

**Need full reference?** → `grok-article-generator.md`

---

## 💡 Pro Tips

1. **Save Grok output** in a text file before importing:
   ```
   article-title-yyyy-mm-dd.json
   ```

2. **Include specific sources**: Don't say "some research." Say "Smith et al. (2023) in Cell Metabolism."

3. **Mention the lab**: "A team at UC Berkeley led by Dr. X was trying to..." adds credibility.

4. **Iterate with Grok**: If output needs work, ask for specific edits rather than regenerating.

5. **Batch articles**: Generate 3-4 articles at once, then import them one by one.

---

## 🔗 Integration with Neural Space

### Article Editor
- `/dashboard/articles/new` → Import JSON
- `/dashboard/articles/[id]/edit` → Check "Dual content" box, then import
- Both versions populate automatically
- Read time and word count auto-calculated

### Article Page
- Reader sees simplified version by default
- Two tabs appear below header
- Click to switch: "Comprendre simplement" ↔ "Version scientifique"
- Both versions fully rendered with proper styling

### Analytics Dashboard
- Can track engagement by version
- Word count split (if needed)
- Future: version-specific metrics

---

## 📝 Example Workflow

**Step 1: Find your topic**
"DNA repair mechanisms and aging" from Beck et al. 2023

**Step 2: Prepare Grok input**
```
Topic: DNA Repair and Aging
Sources: Beck et al. (2023) Cell Metabolism; Nature News articles
Audience: Mixed
Angle: Recent breakthroughs change everything we thought about aging
```

**Step 3: Paste and run**
Use `COPY_PASTE_PROMPT.md`, replace bracketed sections, submit to Grok

**Step 4: Get JSON**
Grok returns full article in JSON format

**Step 5: Import to Neural Space**
`/dashboard/articles/new` → Click "Importer JSON" → Paste → Click "Importer"

**Step 6: Finalize**
Add cover image, choose category, add tags if desired, click "Publier"

**Result**: Live article with both versions, strong hook, proper citations, ready for readers

---

## 🎯 Success Metrics

Your article is successful if:
- ✓ Simplified version hooks reader in first 3 lines
- ✓ Reader keeps scrolling past paragraph 2
- ✓ Scientific version has citations for every claim
- ✓ Article answers "why now?"
- ✓ Both versions include human element
- ✓ Complexity builds gradually (not dumped all at once)

---

## Need Help?

1. **Quick reference**: `QUICK_START.md`
2. **Examples**: `EXAMPLES.md`
3. **Full prompt**: `COPY_PASTE_PROMPT.md`
4. **Detailed guide**: `grok-article-generator.md`
5. **Pre-publish check**: `TONE_CHECKLIST.md`

---

**Last updated**: 2026-06-06
**Grok prompt version**: 2.0 (with dual-content output)
