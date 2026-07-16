# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based touch-typing trainer. Static HTML/CSS/JS, no build step, no dependencies, no test suite. It teaches correct finger placement through 20 progressive lessons (starting at the home row `f`/`j` and expanding outward), an on-screen keyboard with per-finger color coding, and a "don't advance until corrected" typing engine that enforces accuracy over speed.

## Running it

There is no build/lint/test command — this is plain static files under `public/` (everything in `public/` is what gets deployed; files outside it, like this CLAUDE.md, are not).

- Open `public/index.html` directly in a browser (double-click / `file://`), or
- Serve it locally for better devtools behavior: `python -m http.server 8123 --directory public` from this directory, then visit `http://localhost:8123`.

To reset all progress during testing, clear `localStorage` (`typingTrainerState` key) or run `localStorage.removeItem('typingTrainerState')` in the console.

## Deployment

Hosted on Firebase (project ID `touch-type-trainer`, config in `firebase.json`/`.firebaserc`), live at https://touch-type-trainer.web.app. Firebase CLI is authenticated as dennishungnguyen@gmail.com and reachable from Claude's Bash tool on this machine — deploy with `npx firebase-tools deploy --only hosting` from this directory. Following the same workflow established for the Japan Trip Planner project: make the edit, verify it locally first, then ask before running the actual deploy — don't auto-deploy after every change.

## Architecture

### Script loading — not ES modules

Scripts are loaded via plain `<script src="...">` tags in `public/index.html`, in dependency order, each attaching its exports to a shared `window.App` namespace object (e.g. `App.Keyboard`, `App.Lessons`). This is deliberate: `type="module"` breaks under `file://` due to CORS, and the app must work by double-clicking `index.html` with no server. Preserve this pattern (and the load order) when adding new files — do not switch to ES modules or bundling.

Load order (each depends on the previous): `fingerMap.js` → `lessons.js` → `keyboard.js` → `typing.js` → `stats.js` → `app.js`.

### Module responsibilities

- **`public/js/fingerMap.js`** — Pure data: `KEY_TO_FINGER` (every key → one of 8 fingers + thumb), `FINGER_COLORS`, `HOME_ROW_KEYS`. Also `shiftFingerFor(key)`/`shiftKeyFor(key)`, which compute the *opposite-hand* Shift key for a given letter (left-hand letters use right Shift and vice versa) rather than a static lookup, since the correct Shift key depends on the target letter's hand.
- **`public/js/lessons.js`** — `LESSONS` array (each lesson declares only its *new* keys; `availableKeys(lessonIndex)` unions all `newKeys` up to and including that lesson) and `generatePracticeText(lessonIndex)`, which generates a practice line in one of two modes:
  - `drill`: pseudo-words sampled from available keys, weighted toward the newest keys — used early when too few letters are unlocked for real words.
  - `words`: filters a small bundled word list (`WORD_LIST`) down to words spellable with unlocked keys, falling back to `drill` if the filtered pool is too small (< 15 words).
- **`public/js/keyboard.js`** — Renders the on-screen keyboard (`buildKeyboard`) and manages visual state: `setNextKeys([...])` highlights the key(s) to press next (a letter plus, for capitals, the required Shift key), `flashKey(key, className)` gives brief correct/error feedback. Finger colors are applied as a `--finger-color` CSS custom property per key, consumed by `css/style.css`.
- **`public/js/typing.js`** — The input/judging engine. Captures `keydown` on `window` (no `<input>` element, so it can intercept every key including Shift/Space and render its own cursor). Core rule: **wrong key does not advance the cursor** — it flags an error and waits for the correct key. This is intentional (see below). Computes WPM/accuracy live via `computeStats()`.
- **`public/js/stats.js`** — Persistence layer. Single versioned JSON blob in `localStorage` under `typingTrainerState`: per-lesson `{unlocked, completed, bestWpm, bestAccuracy, attempts}`, `currentLessonId`, and a capped `history` array (last 200 sessions). `recordSessionResult()` applies the unlock rule and advances `currentLessonId` on pass.
- **`public/js/app.js`** — Screen controller. Five screens (`welcome`, `lessons`, `practice`, `results`, `progress`) toggled via a `.hidden` class on `.screen` elements (no router). Wires `App.Lessons`/`App.Typing`/`App.Stats`/`App.Keyboard` together and owns all DOM event listeners for navigation.

### Key design decisions to preserve

- **Mistake model: don't advance until corrected.** This is a technique trainer, not a speed test — every completed line should have actually been typed correctly key-by-key. Don't change this to a "skip past errors" model without discussing the tradeoff (a very difficult new key can get a user stuck).
- **Unlock gate prioritizes accuracy over speed.** Each lesson's `unlock: {accuracy, wpm}` in `lessons.js` requires both, but WPM thresholds start low and ramp gradually — accuracy is the primary technique gate.
- **Timing starts on the first correct keydown**, not on screen load, so idle time before a user starts typing doesn't deflate WPM.
- **Uppercase/Shift handling**: a target character is judged uppercase via `/[A-Z]/.test(target)`; correctness then requires both the right letter *and* `e.shiftKey`. The on-screen keyboard highlights both the letter and the opposite-hand Shift key together.

### Adding or reordering lessons

Edit the `LESSONS` array in `public/js/lessons.js`. Each entry only needs its *new* keys — `availableKeys()` handles cumulative unlocking automatically, and `generatePracticeText()` will switch to real-word generation automatically once enough letters are unlocked (governed by the 15-word pool-size fallback, not a hardcoded lesson number). If you add lesson entries, `public/js/stats.js` initializes progress for any lesson ID missing from a saved `localStorage` state, so existing users' saves won't break.
