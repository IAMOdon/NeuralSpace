# Grok Prompt Examples

## How to Use the Prompt

### Step 1: Prepare Your Input

You'll give Grok (or Claude) this information:

```
Topic: DNA Repair Mechanisms and Cellular Aging
Sources: 
  - Beck et al. (2023) "Senescence-associated DNA repair" Cell Metabolism
  - Nature News article on NAD+ and longevity
Audience Level: Mixed (curious general readers + some scientific background)
Angle: Why recent discoveries about cellular repair are changing our understanding of aging
```

### Step 2: Ask Grok

```
I'm writing for a science platform called Neural Space. We publish articles in two versions: 
simplified (accessible, narrative) and scientific (rigorous, technical).

[PASTE THE FULL GROK ARTICLE GENERATION PROMPT from grok-article-generator.md]

Now, write an article about:
Topic: DNA Repair Mechanisms and Cellular Aging
Sources: Beck et al. (2023) "Senescence-associated DNA repair" Cell Metabolism, Nature News articles on NAD+ and longevity
Audience Level: Mixed
Angle: Why recent discoveries about cellular repair are changing our understanding of aging

Output the result as JSON ready to import.
```

### Step 3: Import into Neural Space

1. Go to `/dashboard/articles/new` or edit an existing article
2. Click "Import JSON" button (bottom of editor)
3. Paste the complete JSON output
4. The system automatically populates:
   - Title, summary, reading time
   - Simplified version (Comprendre simplement)
   - Scientific version (Version scientifique)
5. Click "Importer"
6. Review, add cover image, choose category, publish

---

## Real Example: Before vs After

### BEFORE (Your Current Tone)

**Title**: "New Research on DNA Repair and Aging"

**Intro**: "Scientists have discovered new information about how cells repair DNA and how this relates to aging. This research could have important implications for understanding the aging process."

**Problem**: 
- No hook
- No sense of urgency or relevance
- No human element
- Generic

---

### AFTER (Using the Grok Prompt)

**Title**: "Your Cells Have a Repair Crew—And It's Getting Tired"

**Simplified Intro (STRONG)**: 
"At this very moment, your cells are under attack. Not from viruses or bacteria, but from the sun, pollution, and the simple act of existing. For decades, cells fought back perfectly. But in your 30s, 40s, and beyond, something breaks. The repair crew gets slower, makes mistakes, and eventually stops showing up entirely. Last month, researchers at UC Berkeley cracked why—and it's not what anyone expected."

**Why This Works**:
- Immediate hook (present tense, personal)
- Stakes explained (why readers should care)
- Narrative setup ("the repair crew")
- "Why now" (recent discovery, surprising angle)
- Leads naturally into explanation

---

## Example JSON Output (Abbreviated)

```json
{
  "metadata": {
    "title": "Your Cells Have a Repair Crew—And It's Getting Tired",
    "summary": "Researchers discovered why our cellular repair mechanisms fail with age—and a promising new approach to restore them. This changes everything we thought we knew about aging.",
    "readingTimeMin": 8,
    "wordCount": 2100
  },
  "simplified": {
    "intro": "At this very moment, your cells are under attack... [FULL HOOK]",
    "body": [
      {
        "section": "How Your Cells Stay Young",
        "content": "Think of your cells like a house...",
        "subSections": [
          {
            "title": "The Repair System",
            "content": "This system has a name in science: DNA repair..."
          }
        ]
      },
      {
        "section": "What Goes Wrong",
        "content": "In your 20s, this system works flawlessly...",
        "subSections": []
      }
    ],
    "conclusion": "The practical takeaway? We may be on the verge of slowing the aging process not with supplements or diets, but by restarting the biological repair system we've always had."
  },
  "scientific": {
    "intro": "Cellular senescence represents a critical transition in aging biology... (Beck et al., 2023)",
    "body": [
      {
        "section": "NAD+ Depletion and Sirtuin Activity",
        "content": "Recent work demonstrates that NAD+ levels decline precipitously with age... [TECHNICAL EXPLANATION WITH CITATIONS]",
        "subSections": [...]
      }
    ],
    "bibliography": [
      {
        "authors": "Beck, J. L., Smith, K., Johnson, R.",
        "year": 2023,
        "title": "Senescence-associated DNA repair mechanisms and their restoration",
        "journal": "Cell Metabolism",
        "doi": "10.1016/j.cmet.2023.08.015"
      }
    ]
  }
}
```

---

## Tips for Using Grok

1. **Be specific about your angle**: Don't just say "aging research." Say "Why we were wrong about aging—and how the latest research changes everything."

2. **Include real sources**: The better your sources, the better the output. Include DOIs when possible.

3. **Mention the human story**: "Who discovered this? In what lab? Were they trying to find this, or did they stumble on it?"

4. **Ask Grok to self-check**: After generating, ask: "Does the simplified version have a strong hook? Does the scientific version properly cite all claims?"

5. **Iterate**: If the JSON isn't perfect, ask Grok to adjust specific sections:
   - "Make the intro 20% punchier"
   - "Add more mechanism detail to the scientific section"
   - "Include a specific example or statistic"

---

## Why This Works for Neural Space

**For Readers**:
- Simplified version gets them hooked and teaches them something
- Scientific version satisfies their curiosity with rigor
- Both versions are on the same page, so they can "level up" as they read

**For SEO/Virality**:
- Strong hooks → higher click-through rates
- Narrative structure → better engagement metrics
- Two versions → appeals to both casual browsers and specialists

**For Your Workflow**:
- One prompt → two finished articles
- Consistent quality and structure
- Less editing needed (Grok follows the pattern)
- Easy to import and publish in minutes
