# Coherence — Architecture

## What the app does

Coherence is a macOS overlay AI assistant. It runs as a menu-bar accessory with a
floating **orb** that is the product's face: it breathes when idle, pulses while
reading the screen, spins while thinking, glows when an answer lands, and wears
the color of the active **profile**. Clicking the orb opens the AI Assist chat.

The product adapts to who is using it through **ContextProfiles**:

| Profile | For | Context sent to the model | Model |
|---|---|---|---|
| General | everyone | active-window screenshot + URL | flash-lite |
| Coding | engineers | AX text of focused window (exact code, no OCR) | flash |
| Research | scientists | screenshot (equations/figures survive only as pixels) + URL | flash |
| Learning | students | screenshot + URL, tutor persona | flash |
| Professional | writers | AX window text, editor persona | flash-lite |

The profile auto-detects from the frontmost app (Cursor/Xcode/terminals → Coding;
Preview/Zotero/RStudio → Research; Books/Anki → Learning; Word/Mail/Slack →
Professional) and, in browsers, the current URL (arxiv/pubmed → Research,
github/stackoverflow → Coding, …). The user can pin a profile from the chip in
the assist panel.

## Core surfaces

- **AI Assist** (`Cmd+Shift+1` or click the orb): streaming chat panel
- **Quick Capture** (`Cmd+Shift+2`): instant note capture (GRDB-backed)
- **Live Suggestions** (`Cmd+Shift+O` or orb menu): selection-triggered
  suggestion cards in the top-right stack
- **Meeting Assist** (`Cmd+Shift+Option+Space`): audio transcription top bar
- **Voice Note** (orb menu): record → transcribe → profile-aware response

## Data flow

```
Shortcut / orb click
        ↓
AIContextManager.captureCurrentContext()      ← publishes isCapturing (orb pulses)
    ├── captureSelectedText()                 → AX selected text (always)
    ├── getBrowserURL()                       → AppleScript (Chrome/Safari)
    ├── ContextProfileManager.updateProfileForCurrentApp(browserURL:)
    └── per the profile's ContextStrategy:
        ├── readFocusedWindowText()           → AX tree text (instant, exact)
        ├── WindowCaptureManager.captureActiveWindow()  → ScreenCaptureKit
        │       └── jpegDataForUpload()       → ≤1568px JPEG 0.6 (~150 KB)
        └── performOCR()                      → Vision (reading order fixed)
        ↓
GeminiAPIService.sendMessage()
    → systemInstruction = profile persona (native Gemini field)
    → POST …:streamGenerateContent?alt=sse    ← tokens stream into the UI
    → history: old screenshots stripped, trimmed on user-turn boundaries
        ↓
AIAssistView renders the stream; OrbStateModel animates the orb
```

## Key components

| Component | Role |
|---|---|
| `ContextProfile` / `ContextProfileManager` | Persona, model routing, context strategy, auto-detection — the product's brain |
| `OrbStateModel` | Folds all service activity into one orb state (listening/error/capturing/thinking/ready/aware/idle) |
| `CoherenceOrb` | The orb visual + state animations (single source of truth, reused in onboarding) |
| `AIContextManager` | Profile-driven context capture; publishes `isCapturing` |
| `WindowCaptureManager` | ScreenCaptureKit active-window capture, downscale/encode, Vision OCR |
| `GeminiAPIService` | Streaming SSE chat, one-shot queries, audio; typed `GeminiError` published as `lastError` |
| `SuggestionManager` | Selection polling → profile-aware suggestion generation |
| `SuggestionStackManager` | Notification-card stack (top-right) |
| `InputEventManager` | CGEventTap global shortcuts (AI Assist, Quick Capture, Live Suggestions, Meeting) |
| `NotesDatabase` (GRDB) | Notes persistence + FTS5 search |
| `KeychainStore` | Gemini API key storage |

## Project layout

- `Coherence/` — the app target (file-system-synchronized group). All app code lives here.
- `CoherenceTests/` — unit tests (`@testable import Coherence`): notes DB, storage migration.
- `CoherenceUITests/` — a single launch smoke test.

## Privacy model

- Context capture is **visible**: the orb pulses during capture, and the assist
  panel shows chips for every attached source (screenshot / window text / URL)
  with one-click removal.
- Captures target the **active window**, not the whole display.
- The pasteboard suggestion trigger is **opt-in** (`suggestOnCopy`, default off).
- All overlay windows set `sharingType = .none` (excluded from screen recording).
- API key lives in the Keychain; requests put it in a header, never the URL.

## Known debt / next steps

1. `SuggestionManager` still polls selection on a 0.3s timer; an `AXObserver`
   on `kAXSelectedTextChangedNotification` would make it event-driven.
2. No crash reporting / analytics.
3. Release infrastructure: notarization pipeline, Sparkle EdDSA keys + appcast.
4. BYO-API-key model is fine for open source but a hosted proxy is needed for
   a consumer product.
5. `SettingsView.swift` is a 1,200-line monolith worth splitting.
