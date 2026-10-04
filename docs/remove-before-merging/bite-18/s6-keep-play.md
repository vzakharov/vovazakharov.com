# S6 — the `keep` play (hand-over)

## Done

- **Step 1, a browser context per play** (`scripts/play-mushrooms.ts`, 439 → 412
  lines with step 2). `open` creates a `Target.createBrowserContext` and passes
  its id to `createTarget`; `Page.close` disposes it after the play.
  `Page.reload(hash?)` reloads (or opens `/mushrooms<hash>` through
  `about:blank`, so `#new` loads as an opened link, not a hash edit) and
  re-installs the probe once a fresh game is up (`window.__left` marks the old
  page). The hand-written static server gave way to `print-origin.ts`'s
  `withPrintOrigin`, which now computes its own `REPO_ROOT` instead of
  importing `content-tree.ts` (that module resolves a site on import).
  - Run `--screens tabL --plays meadow`: five failures on taps at butterfly-4
    ("reached other at (933, 501)"); the base script on the same build fails
    with the same five lines, so they predate this step.
- **Step 2, `scripts/lib/play-keep.ts`**, `keep` last in `PLAYS`. Every play in
  `PLAYS` runs by default, so `keep` does too, and fails until S5 keeps.
  Grows two (four mushrooms), puts one window in the newest, plants on the
  nearest tuft, taps the sun and steps to full dusk, waits 1.5 s wall clock
  for the write, reloads, then opens `#new`. Reads: `__probe.state()`
  (mushrooms, houses), `__probe.dusk()`, `location.hash`, and
  `__probe.scene.meadow.planted` ids directly — no probe read is missing.
  - Run `--plays keep` today: setup holds (`keep-before` shows dusk, four
    mushrooms, a window); fails as expected on hash `""` not `#1`, meadow not
    back, day not dusk, `#new` staying `#new` not `#2`.

## Left

- After S5: `flock …/tmp/site.lock pnpm play:mushrooms --screens tabL --plays
keep,meadow`, and look at `keep-before`, `keep-after`, `keep-new`.
