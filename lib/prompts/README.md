# Neural Space Grok Prompt System

Complete guide for using Grok to generate dual-content articles (simplified + scientific) in JSON format.

---

## 📚 Files in This Directory

### **FOR ACTUALLY GENERATING ARTICLES** (START HERE)
- **`GROK_PROMPT_EXTENDED.md`** ⭐ — **USE THIS ONE**. Full-length prompt that produces 1500-3000 word articles.
- **`WHY_SHORT_OUTPUT.md`** — Explains why the old prompt was short + validation checklist

### **For Understanding**
- **`grok-article-generator.md`** — Full technical reference (background info, structure principles)
- **`EXAMPLES.md`** — Real before/after examples of what good articles look like

### **For Quick Reference**
- **`QUICK_START.md`** — 30-second overview
- **`TONE_CHECKLIST.md`** — Pre-publish quality verification

### **Deprecated** (Don't use anymore)
- ~~`COPY_PASTE_PROMPT.md`~~ — Old version, produces short articles. Use `GROK_PROMPT_EXTENDED.md` instead.

---

## ⚡ 60-Second Start

1. **Open Grok/Claude**
2. **Go to**: `lib/prompts/GROK_PROMPT_EXTENDED.md`
3. **Copy EVERYTHING** (the entire prompt)
4. **Paste into Grok**
5. **Fill in the 5 fields at bottom**:
   - Topic
   - Sources (with years)
   - Audience
   - Angle
   - Key finding
6. **Submit** → Get full JSON (should be 2000+ words)
7. **Paste JSON into** `/dashboard/articles/new` → Click "Importer JSON"
8. **Publish**

---

## ⚠️ Critical: Use the EXTENDED Prompt

**PROBLEM**: Old prompt produced short, underdeveloped articles (400-600 words)

**SOLUTION**: New prompt forces full-length development (1500-3000 words)

**What changed**:
- Explicit minimum word counts for each section
- Each body section must be 300-400 words (flowing paragraphs)
- Specific mechanisms explained, not just outcomes
- Before/after examples showing proper length

**See**: `WHY_SHORT_OUTPUT.md` for detailed explanation

---

## 🎯 What This System Does

### Input
You give Grok:
- Topic (what's the discovery?)
- Sources (papers, citations with years)
- Audience (general / mixed / specialists)
- Angle (what makes this unique/timely?)
- Key finding (main result in 1-2 sentences)

### Output
Grok returns FULL-LENGTH JSON with:
- **Metadata**: title, summary, reading time, word count
- **Simplified version** (1500-2500 words): Engaging narrative for general readers
- **Scientific version** (1800-3000 words): Rigorous, citation-heavy for specialists

### Result
Both versions auto-populate in Neural Space → publish immediately

---

## ✨ Key Requirements (Now Enforced)

### Simplified Version
- **Hook**: First 3 lines (surprise/question/stakes)
- **Human story**: Who discovered it, why they were researching
- **Why now?**: Immediate, current relevance
- **Progressive complexity**: Simple → technical (not all at once)
- **Reader-focused**: What changes for them?
- **Length**: 1500-2500 words minimum

### Scientific Version
- **Citations**: Every claim backed by (Author Year)
- **Mechanisms**: How does it work step-by-step?
- **Data**: Specific metrics, statistics, effect sizes
- **Limitations**: Honest about what we don't know
- **Field implications**: Where does this fit in the research landscape?
- **Bibliography**: Full details with DOI
- **Length**: 1800-3000 words minimum

---

## 📖 Hook Examples (Copy These Patterns)

**Surprising Fact Hook**
- "Every time you sleep, your brain is deliberately erasing memories."
- "Your cells have a repair crew—and it's getting tired."

**Pressing Question Hook**
- "What if cancer's biggest advantage isn't that it mutates, but that it cooperates?"
- "What if your gut bacteria are running your mood more than your brain?"

**Clear Stakes Hook**
- "The thing keeping you alive might also be slowly breaking your DNA."
- "We've been wrong about aging—and now we know exactly why."

---

## 🚀 Workflow

```
Find Research → Open GROK_PROMPT_EXTENDED.md → Copy → Paste in Grok
                                                         ↓
Fill 5 fields → Submit → Get full JSON → Copy JSON → Paste in Neural Space
                                                         ↓
Add cover image → Choose category → Publish
```

**Time**: ~15 minutes per article
**Quality**: Consistent, detailed, properly structured
**Result**: Two professional-quality versions

---

## ✅ Pre-Publish Checklist

### Simplified Version
- [ ] Hook in sentence 1 (not buried)
- [ ] "Why now?" answered by sentence 3
- [ ] Human story/researcher name included
- [ ] Complexity builds gradually (simple → technical)
- [ ] Ends with reader takeaway (not just summary)
- [ ] **Word count 1500+** (not 600)
- [ ] Reads like interesting article, not Wikipedia summary

### Scientific Version
- [ ] Every claim cited (Author Year format)
- [ ] Specific mechanisms explained step-by-step
- [ ] Results include metrics (sensitivity, specificity, p-values)
- [ ] Limitations honestly discussed
- [ ] Bibliography complete with DOI
- [ ] Technical but not jargon-soup
- [ ] **Word count 1800+** (not 700)

### Both
- [ ] Title is curiosity-driven (not generic)
- [ ] Summary has stakes + human element
- [ ] Reading time estimate realistic
- [ ] Specific numbers included (not "many", "some")
- [ ] Researcher names/labs mentioned

**All checked?** → Ready to publish

---

## 🤔 Common Questions

**Q: Why is my JSON output still short?**
A: You're probably using the old `COPY_PASTE_PROMPT.md`. Use `GROK_PROMPT_EXTENDED.md` instead. See `WHY_SHORT_OUTPUT.md` for details.

**Q: What if it's still too short?**
A: See "If It's STILL Too Short" section in `WHY_SHORT_OUTPUT.md` for recovery instructions.

**Q: Do I need to edit after importing?**
A: Usually not. But you can refine tone or add details in the Neural Space editor if needed.

**Q: Can I use this for existing articles?**
A: Yes. Edit article → Check "Dual content" → Import JSON → Both versions populate.

**Q: What about images?**
A: Import JSON first, then add cover image in editor before publishing.

---

## 📊 File Guide

### For Generating Articles
- **`GROK_PROMPT_EXTENDED.md`** ⭐ Main prompt (use this)
- **`WHY_SHORT_OUTPUT.md`** Why old prompt was short + validation

### For Understanding the System
- `grok-article-generator.md` — Technical reference, structure, principles
- `EXAMPLES.md` — Real before/after examples

### For Quick Reference
- `QUICK_START.md` — 30-second version
- `TONE_CHECKLIST.md` — Pre-publish checklist

### Deprecated
- ~~`COPY_PASTE_PROMPT.md`~~ — Don't use (produces short articles)

---

## 🎓 Learning Paths

**First time using this?**
1. Read `QUICK_START.md` (2 minutes)
2. Copy `GROK_PROMPT_EXTENDED.md` and use it
3. Check output against `TONE_CHECKLIST.md`

**Want to understand the theory?**
1. Read `EXAMPLES.md` (see before/after)
2. Read `grok-article-generator.md` (full reference)
3. Then use `GROK_PROMPT_EXTENDED.md`

**Output is too short?**
1. Read `WHY_SHORT_OUTPUT.md` (explains why)
2. Check you're using `GROK_PROMPT_EXTENDED.md` not old prompt
3. Use recovery instructions if needed

**Debugging quality issues?**
1. Use `TONE_CHECKLIST.md` to identify what's missing
2. Ask Grok to expand specific sections
3. See `EXAMPLES.md` for reference level

---

## 💡 Pro Tips

1. **Save Grok output** before importing:
   ```
   article-title-yyyy-mm-dd.json
   ```

2. **Be specific with sources**: Include paper titles, years, authors:
   - BAD: "some recent research"
   - GOOD: "Mukherjee et al. (2026) in Gut; Chang et al. (2022) PNAS"

3. **Mention the human element**: Where, who, why they were researching

4. **Batch articles**: Generate 3-4 at once, import them sequentially

5. **Iterate if needed**: Ask Grok to expand specific sections rather than regenerating

---

## 🔗 Integration with Neural Space

### Workflow
- Create article → Check "Dual content" checkbox
- Click "Importer JSON" button
- Paste full JSON from Grok
- Both versions populate automatically
- Add cover image, category → Publish

### Reader Experience
- Default tab: "Comprendre simplement"
- Click to switch: "Version scientifique"
- Both fully styled and interactive
- All tracking/analytics integrated

### Admin Features
- Edit each version independently
- Save drafts before publishing
- Preview both versions
- Schedule or publish immediately

---

## 📈 Success Metrics

Your article is successful if:
- ✓ Simplified hooks reader in first 3 lines
- ✓ Reader keeps scrolling past paragraph 2
- ✓ Scientific version has citations for every major claim
- ✓ Both versions explain "why now?"
- ✓ Human element (researcher, lab, story) included
- ✓ Complexity builds gradually
- ✓ Article teaches something new

---

## Need Help?

1. **Quick overview**: `QUICK_START.md` (2 min read)
2. **Real examples**: `EXAMPLES.md` (see before/after)
3. **Main prompt**: `GROK_PROMPT_EXTENDED.md` (copy this)
4. **Output too short?**: `WHY_SHORT_OUTPUT.md` (validation + fixes)
5. **Pre-publish check**: `TONE_CHECKLIST.md` (quality gates)
6. **Full reference**: `grok-article-generator.md` (all details)

---

## 🎯 TL;DR

1. Copy `GROK_PROMPT_EXTENDED.md` (everything in it)
2. Paste into Grok
3. Fill in 5 fields: Topic, Sources, Audience, Angle, Key finding
4. Submit
5. Get JSON output (should be 2000+ words)
6. Paste into Neural Space `/dashboard/articles/new`
7. Click "Importer JSON"
8. Add cover image, publish

**Done.** Both versions are live.

---

**Last updated**: 2026-06-06
**Current version**: 2.1 (with EXTENDED prompt)
**Next step**: See `GROK_PROMPT_EXTENDED.md`
