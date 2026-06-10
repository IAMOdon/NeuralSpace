# Coherence — Roadmap: from screen-aware to screen-native

The thesis: Coherence is not a chatbot with a screenshot button. It is an
ambient colleague that watches the same screen as the user, **decides
internally when something matters**, and **acts** — with the user's consent.
The student on a university portal whose deadline quietly becomes a calendar
proposal is the canonical moment. Everything below serves that moment.

---

## Phase 1 — Awareness Engine (the MVP core)

Today, awareness is a snapshot taken when the user asks. Continuity means a
timeline.

**`AwarenessEngine`** (new, replaces SuggestionManager's polling heart):
- Event-driven sampling: app activation, window-title change (AX notifications),
  browser URL change, plus a slow heartbeat (~20s) while monitoring is on.
- Maintains a rolling `ScreenMoment` timeline: `(timestamp, app, windowTitle,
  url, textDigest)` — last ~30 minutes, in memory, never persisted (privacy).
- The timeline is given to the model on every request: "what the user has been
  doing", not just "what is on screen this second".

**`InsightPolicy`** — the internal yes/no on speaking up:
- Detectors run locally on captured text (cheap, no API): dates/deadlines
  (NSDataDetector), errors/stack traces (coding), citations/DOIs (research),
  prices, addresses.
- Per-profile policy decides if a detection is worth surfacing
  (deadline on a portal → yes for Learning; error in terminal → yes for
  Coding; date in a random article → no).
- **Anti-Clippy budget**: max N proactive cards per hour, per-app mute list,
  one-click "not for this app" on every proactive card. Proactivity that
  annoys gets turned off and never re-earned — the budget is the feature.

## Phase 2 — Capabilities (hands, not just eyes)

Three tiers of "doing", same trust contract for all of them:

**Tier 1 — Tell** (exists): answer from screen context.

**Tier 2 — Guide** ("where do I click to see my Twitter profile insights?"):
- The AX tree we already read for text also exposes every interactive
  element with role, label, and screen frame. `UIGuide`:
  1. Snapshot the focused window's interactive elements (label + frame).
  2. Ask the model: given the goal and these elements, what is the next step?
  3. Draw a click-through halo overlay on the target element's frame with a
     one-line caption ("Click 'More' — Analytics lives under it").
  4. Re-snapshot after the user clicks; repeat until the goal screen.
- This is tutoring inside any app, grounded in what is actually on screen —
  no stale help-center screenshots.

**Tier 3 — Do** ("find it for me"):
- Same loop, but the orb performs the step itself via `AXPress` /
  `AXUIElementSetAttributeValue` (CGEvent click on the element's frame as
  fallback for AX-hostile apps).
- Safety: visible step trail card while running, every step logged, Esc or
  mouse movement aborts instantly, never runs in password fields or payment
  pages (detector-gated), capped step count.

**API-backed capabilities** (`CapabilityRegistry`):
- `calendar.createEvent` (EventKit) — the first one. Detector finds
  "Project due May 22" → card: *"Add 'Project deadline' to Calendar, May 22?"*
  → one click → EKEvent written. Requires Calendar permission + entitlement.
- `reminders.create` (EventKit), `notes.save` (already exists), `url.open`,
  `clipboard.copy`. Later: email draft, file actions.

Contract for every tier: AI proposes → user confirms (or invoked it
explicitly) → capability runs visibly → receipt on the card.
Confirmation-first is the trust model.

## Phase 3 — Hearing (meetings become first-class)

Today the app hears the mic on demand. It does not hear the system.
- **System audio** via ScreenCaptureKit `SCStream` audio output (macOS 13+):
  capture what the speakers are playing (the other side of the call).
- **Meeting detection**: meeting app frontmost (Zoom/Meet/Teams already
  listed) + system audio activity → propose entering meeting mode.
- In meeting mode: continuous transcription (local SFSpeechRecognizer first,
  Gemini audio for quality later), rolling notes, and the Phase-1 detectors
  run on the transcript — a spoken "deadline next Friday" becomes the same
  calendar proposal as a seen one. Same policy, same budget, same card UX.

## Phase 4 — A real voice

AVSpeechSynthesizer sounds robotic and hurts comprehension.
- Replace with **Gemini TTS** (`gemini-2.5-flash-preview-tts`) — same API key
  the app already has; natural prosody; streamed PCM through AVAudioEngine.
- System voice stays as offline fallback.
- Barge-in (interrupt the orb mid-sentence) needs echo cancellation
  (`setVoiceProcessingEnabled`) — attempt after TTS lands.

## Phase 5 — Chat UI coherence

- One shared message-bubble component (user pill / assistant markdown flow)
  used by AI Assist and Meeting Ask — same paddings, same MarkdownText, same
  CoherenceSurface tokens.
- Header pattern (mini orb + wordmark + profile chip) shared across panels.
- Suggestion cards adopt the surface + accept capability buttons (Phase 2).

---

## Order of attack and why

1. **Phase 1** is the moat — detection + judgment is what "screen aware" sells.
2. **Phase 2 (calendar + Guide tier)** lands immediately after: calendar
   proves see → judge → propose → act; Guide proves the orb can point at the
   real screen. Both demo brilliantly. The Do tier follows once Guide's
   element-grounding is reliable.
3. **Phase 4 (voice)** is cheap (API already integrated) and transforms
   perceived quality.
4. **Phase 3 (hearing)** is the deepest engineering (audio routing, continuous
   transcription cost) — start after the seen-loop is proven.
5. **Phase 5** rides along with every phase touching UI.

## Engineering invariants (learned the hard way)

- Never capture or read our own windows; all capture targets the remembered
  external app.
- Every floating surface needs shadow headroom: window ≥ content +
  max-shadow-extent on all sides, and `NSHostingView.clipsToBounds = false`
  (macOS 14 clips by default).
- Proactive anything is opt-out-able per app, budgeted per hour.
- Timeline/context stays in memory; nothing leaves the machine except the
  model request the user can see in the context chips.
