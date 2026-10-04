# Package b — the village: hand-over note

Calls 8–11 of `bite-17.md`. Paths under `src/pages/mushrooms/ui/scene/`.

## Done (typecheck, lint, knip, type-overlap clean; never looked at on screen)

- **Call 8, windows glow** — in source, **not yet seen in a play run**.
  - `palette-creatures.ts` `windowLit` (0xffb840, a deeper amber than the pane).
  - `windows-lit.ts` (pure, tested): `windowsLit(dusk, now, phase)` =
    `smooth((duskness(dusk, now − delay) − 0.3) / 0.45)`, the delay
    `phase / 2π × LIT_DELAY_MOST` (1.5 s) off the house's mushroom's
    `phaseOf`. Delaying the meadow's own `duskness` makes the lights also go
    out house by house at morning, and a dark page (`FULL_DUSK`) lit from the
    first frame.
  - `window-glow.ts`: `paintGlow` repaints the house's windows into a second
    graphics through `draw-house.ts`'s `paintWindows` (extracted from
    `paintHouse`) with a tone that turns `windowPane` to `windowLit` and
    pre-washes every other colour with `PALETTE.duskWash` at
    `DUSK_WASH_DEEPEST` (now exported), so a fully lit window sits on its
    washed house seamlessly; a soft halo of four `windowLit` circles at 0.1
    alpha under each. `coveredAt` tests a window's middle against the
    `drawnMushrooms` nearer than the house.
  - `house-view.ts`: each `HouseView` owns its `glow` graphics, copied to the
    house's transform each frame at `lights.depth`, alpha `windowsLit`;
    repainted only when the windows shown change (popping, a nearer mushroom
    over a window's middle, a worm's open window — those three are left to
    the house) or the house goes stale.
  - Wiring: `DuskView.lights` (`Lights = Pick<Meadow, 'dusk'> & Layered`, set
    each `update`) → `MushroomBed.update(t, wetness, lights)` →
    `HouseView.update(t, body, lights)`. `meadow-scene.ts` changed one line,
    no growth.

## Left

1. **Look at call 8**: extend `scripts/lib/play-dusk.ts`'s `dusk` play to
   furnish a house (house button) before the sun's tap and shoot it at dusk
   (tabL, phoneP). Watch for: the halo's softness (`HALO_*` in
   `window-glow.ts`), a perched insect over a window (the glow draws over
   insects — `coveredAt` checks only mushrooms), the washed frame matching
   the house under rain at dusk (the rain's wash is not pre-applied, so frames
   there are a shade lighter than the cap).
2. **Call 9, flowers close**: `flower-closing.ts`'s closing as
   `max(rain's, dusk level)`; bees plant nothing while `dusky`. Decide
   whether closing flowers shut an open flower picker (`a-light.md`
   § Decided leaves it open).
3. **Call 10, fliers settle** (`model/flight-habits.ts` by `dusky`); run
   `fliers.test.ts` (~6 min) once at the end.
4. **Call 11, mice run**: a `tick` rule in the reducer running a mouse
   between two in-sight doors every 6–12 s (seeded) via `mouse-run.ts`; a
   house with no mouse to spare peeks.
5. Frames `docs/remove-before-merging/frames/bite-17/b-*.png`.

## Decided

- The glow lives with each house (`HouseView.glow`), not in `DuskView`: it
  follows its house's transform and repaint cycle, and `DuskView` only hands
  it `lights`. `meadow-scene.ts` does not grow.
- A window under a nearer mushroom's middle-test, or opened by a worm, stays
  unlit rather than drawn over what is in front of it (call 7 puts every
  light above everything under the HUD, so occlusion has to be tested).
