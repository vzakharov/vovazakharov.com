# play-walk — hand-over note

Package: bite 12 P3 step 3, the probe and the play run (spec §4), and the
`walk-*.png` frames. Files: `scripts/play-mushrooms.ts`, `scripts/lib/*`,
`docs/remove-before-merging/frames/bite-12/`.

## Done

1. The probe reads the eye, not the crop (`mushroom-probe.ts`):
   `toScreen`/`toWorld` are the camera's world ↔ the screen by the bob's
   scroll alone (the view places everything); `shows(x)`; `eye()` (place,
   heading, walked, bob, footsteps counted by wrapping `voice.step`, the
   screen); `sun()` (the sun picture's middle across the screen, `null` out
   of view); an insect's `at`/`end` go through `scene.eye.toScreen` over its
   row. `Crop` schema → `Eye`, `Sun`; `ARROWS` adds ↑/↓.
2. `play-walk.ts` replaces `play-pan.ts` and `play-pan-keys.ts` (deleted);
   `play-taps.ts` holds `TAPS`/`BARE_START` they shared. Checks: ↑ eased,
   ≤ cruise, bob in [−A, 0], non-zero walking, 0 at rest, footsteps =
   walked/0.8 ±1; ↓ 12 s rests at the rim (11.5 from (0, 8)); → held a full
   turn one way, ≤ 0.38 rad/s, eased both ends, the sun off screen and back;
   ← held as long returns every bed object within 0.5 px; a sideways drag
   from bare ground turns with the ground under the finger and steps
   nowhere; a drag down the screen walks ≤ cruise; nothing tapped; the
   screen turned keeps heading and place.
3. `play-mushrooms.ts`: `--plays meadow,walk,planting,species,tufts` picks
   plays; every play on its own fresh meadow.

## Left

- Spec §4 not played: opening identity against bite 11, walk through the
  clump, walk up to a back-row mushroom (haze, drawn-only tap), the insect
  after a 180° turn, the frame budget while walking into the forest.
- The rest of `pnpm play:mushrooms` (taps) — see the report.

## Decided

- Frames are shot by the walk play itself (`<screen>-walk-*.png`).
