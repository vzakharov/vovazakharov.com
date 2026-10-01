# p3a-input — hand-over note

Package: bite 12 P3 step 1 — `eye-input` + keys + footstep voice, no scene
wiring.

## Done

1. Step 1 (see `git log -- src/pages/mushrooms/model/walk.ts`):
   - `model/walk.ts` + test — the pure drag/keys machine over `pan.ts`'s
     heading crop and `stride.ts`: radial slop, axis lock at the crossing,
     1:1 azimuth turn with pan's glide, the stride's chase for a vertical
     drag (rows clamped to the seam), `heldStill` for P4's long press,
     `refit` keeping heading and place.
   - `ui/scene/view-inverse.ts` + test — screen → plane / layout px /
     `Ground` (`planeUnder`, `layoutOf`, `layoutUnder`, `groundOfLayout`,
     `groundUnder`).
   - `ui/scene/eye-input.ts` — `EyeInput`, the Phaser shell (`Crop`'s
     successor; `pan-input.ts` stays until the wiring swaps it).
   - `keyboard.ts` — `↑`/`↓` as `StepKey`; `letGoPan` → `letGoMove`.
     `instrument-input.ts`'s `playTheFlowers` ignores step keys while it
     still takes a `Crop`.

## Left

- Step 2: `MeadowSound.step(side)`, the footfall helper, the level render;
  the keyboard plays only the flowers in view.

## Decided

- The vertical chase's reference row is the slop's crossing (not the press),
  so nothing jumps at the crossing and the settled row lags the lift by the
  slop, as the spec's "minus the slop lag" and pan's 1:1 rule have it.
- The turn feeds `pan.ts` the screen x warped to `F·atan((x−cx)/F)`, so its
  1:1 follow, velocity and glide are exact in angle without touching
  `pan.ts`; at the crossing the pan is handed a press already panning from
  the crossing point.
- A press stops both axes (pan's `press`, the stride's `chaseFrom`); a
  horizontal lock leaves the stride's chase at aim 0, so the eye never moves.
