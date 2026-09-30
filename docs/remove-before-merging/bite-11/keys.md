# Bite 11 — package "keys" hand-over

## Done

- 362f232, 2cddaab. Step 1: a held arrow turns the crop. `model/pan.ts` drops the key's step
  (`step`, `STEP_ACROSS`, `STEP_DURATION`) for a `keys` motion — the left
  edge, its `pace` in px/s and which arrows are held — moved by
  `tick(pan, seconds)`; `holdKey` / `letGoKey` feed it. `pan-input.ts`'s
  `Crop` ticks the pan by the scene clock's advance whenever the crop is
  read (`current()`), so the scene itself is untouched; `hold`/`letGo`
  replace `step`. `keyboard.ts`'s `listenForKeys` takes an `onLetGo` for a
  pan key's `keyup` (any modifiers) and for both pan keys on the canvas's
  `blur`; `instrument-input.ts` wires it. The play run's `Page` trades
  `press` for `key(key, 'keyDown' | 'keyUp', repeat?)` and gains
  `trace(frames, expression, schema)` (headless frames, one read each);
  the key checks moved out of `play-pan.ts` into `scripts/lib/play-pan-keys.ts`.

- Play run green on tabL and phoneP (probe build of 362f232 in a worktree,
  2cddaab's trace fix on top): each arrow held 36 frames cruises at exactly
  the cruise (590 px/s tabL, 195 phoneP), turns the crop 0.3 of a screen,
  1/16 of a screen of it coasting after the release; both end walks rest
  exactly at the end, slowing every frame into it.

## Left

- Nothing in the package. Seen, not this package's: on tabL both end drags
  were skipped ("nothing at the world's … end with bare ground beside it"),
  the grass now covering the ground round every cap there; phoneP ran both.
  Not checked against a baseline.

## Decided

- **Cruise `CRUISE_ACROSS` 0.5 screen widths a second** (590 px/s on a
  tablet held sideways, 195 on a phone upright): the world is two tablet
  screens, so an end-to-end sweep from the middle takes about a second —
  slow enough to watch the meadow go by, not so slow a child waits on it.
- **Ease `KEY_EASE` 0.25 s each way, as one steady acceleration** (2
  screens/s²): the crop's position eases in and out quadratically, and a
  release from cruise coasts 1/16 of a screen. A 0.1 s tap nudges ~2% of a
  screen (24 px on a tablet).
- **Toward a world's end the pace is capped at √(2·a·room)**, the curve on
  which the same acceleration brings it to rest exactly at the end, so a held
  key stops soft there without a separate glide.
- **A tick integrates at most 0.1 s** (a frame after the tab was away) in
  sub-steps of at most 1/240 s, each exact for its constant acceleration;
  60, 30 and 144 fps land within float noise of each other (checked in
  `pan.test.ts`).
- **A key pressed during a glide takes it over with the glide's pace, capped
  at the cruise** rather than zeroing it, so the stop is not a jolt; a
  finger pressed during a key's turn stops it where it stands, and a key
  pressed while a finger holds the crop is ignored (re-press to turn).
- The glide's motion kind is `glide` (was `ease`, with a `curve` field only
  the step used).
- Losing focus lets go of both arrows: a `keyup` the canvas never hears would
  otherwise turn the crop to the world's end.
