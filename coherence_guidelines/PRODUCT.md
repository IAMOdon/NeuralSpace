# Coherence — Product Definition

*This document is the source of truth for who Coherence is for, what the MVP
is, and how it ships. Nothing here is left to randomness; if reality changes,
change this file first.*

---

## One sentence

Coherence is a macOS orb that shares your screen with you: it understands
what you're working on, decides quietly when something deserves your
attention, and acts on it with one click.

## Who it is for

Four personas, one product. The ContextProfile system is the embodiment:

| Persona | Their day | The moment Coherence wins them |
|---|---|---|
| **Student** (Learning) | course portals, PDFs, problem sets | a deadline on the portal becomes a calendar proposal before they thought to note it; a formula gets a worked step-by-step on demand |
| **Researcher** (Research) | papers, figures, stats, LaTeX | asks about the methods section of the PDF on screen and gets a precise, terminology-correct answer with equations intact |
| **Builder** (Coding) | editor + terminal | a stack trace on screen becomes one focused fix with exact replacement code |
| **Everyone** (General/Professional) | browsing, mail, docs | "what am I looking at?", instant rewrites, guidance through unfamiliar UIs ("where do I find my profile analytics?" → the orb points at the button) |

Primary launch audience: **students and researchers** — they are the Neural
Space audience (science media), the pain (deadlines, dense papers) is
constant, and the demo moments are visceral.

## What it changes

Assistants today are *destinations*: you stop working, open a chat, describe
your screen to a model that can't see it. Coherence inverts this — the
assistant is *ambient*: it already sees, it already knows which app you're
in, and the answer arrives where you're looking. The moat is not the model
(Gemini is rented); it is the **awareness layer**: profile detection, the
screen timeline, the insight policy that knows when to stay quiet, and the
AX-grounded capabilities (point at the real button; write the real calendar
event). That layer is ours and compounds.

## The MVP cut

Ship when ALL of these are true, and nothing more:

1. **Aware**: profiles auto-detect; chat/voice/suggestions answer correctly
   about the visible screen and open apps (works today).
2. **Continuous**: the AwarenessEngine timeline exists, and the deadline
   detector produces proactive calendar proposals, budgeted (Roadmap Phase 1
   + calendar capability).
3. **Helpful hands**: Guide tier works in Safari/Chrome + 2 native apps
   (Roadmap Phase 2, Guide).
4. **Listenable**: Gemini TTS voice (Roadmap Phase 4).
5. **Shippable**: notarized DMG, Sparkle with EdDSA, crash reporting,
   onboarding that explains permissions honestly.

Explicitly NOT in MVP: Do-tier automation, system-audio meeting capture,
Windows, team features, hosted accounts (BYO Gemini key at first; hosted
proxy is post-MVP once unit economics are known).

## Distribution: Neural Space

Coherence sells through the Neural Space website (science media) — audience
fit is students/researchers, which matches the launch personas.

- **Product page** on the site: hero is a 30-second screen recording of the
  two demo moments (portal deadline → calendar card; paper question → cited
  answer). Download button → notarized DMG.
- **Update feed**: Sparkle appcast hosted on the same domain
  (e.g. `https://<neural-space-domain>/coherence/appcast.xml`) — the URL must
  be decided before the first public build because it's baked into the app.
- **Editorial flywheel**: Neural Space articles can embed "works with
  Coherence" moments (e.g., a methods-explainer article shows the orb
  answering on that very paper). The media is the funnel.
- **Monetization posture** (decide before MVP, default proposal):
  free 14-day trial → one-time or yearly license, license keys validated
  locally, no account required. BYO API key at launch keeps margins clean;
  a bundled-key tier follows the hosted proxy.

## Positioning vs. the field

- vs. ChatGPT desktop: Coherence is ambient and proactive, on YOUR screen,
  with profile-adapted behavior — not a chat window you visit.
- vs. Cluely-style "invisible" tools: Coherence is **honest** — the orb
  pulses when it reads the screen, context chips show exactly what was sent,
  proactivity is budgeted and mutable. Honesty is the brand; it's also the
  only durable posture for a science-media audience.

## Success criteria for the MVP launch

- Activation: ≥60% of installs complete permissions + first answer.
- The moment: ≥30% of weekly actives accept at least one proactive proposal.
- Retention: 4-week ≥25% for students/researchers cohort.
- Honesty: zero "it spied on me" complaints — every capture visibly signaled.
