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

1. **Done (b2) — call 8 looked at**: the `dusk` play furnishes both opening
   mushrooms (every window, a door) before the sun's tap; frames
   `frames/bite-17/b-windows-*.png`. Tuned on sight: a pale rim round every
   lit frame (the glow decided `haloFor` against the _washed_ cap, so it
   rimmed frames the house does not — `paintWindows` now takes the cap tone
   to decide against); the halo's four rings stepped visibly (now eight at
   0.05, reach 1.3); lit from 0.15 over 0.5 (was 0.3 over 0.45), since the
   panes went a muddy brown under the wash before lighting. Not checked: a
   perched insect over a window (`coveredAt` checks only mushrooms), rain at
   dusk (the rain's wash is not pre-applied, so frames there are a shade
   lighter than the cap).
2. **Done (b2) — call 9, flowers close**: `bedClosing(wetness, duskness)`
   (`flower-closing.ts`, the greater) drives `FlowerBed.update`; `perchesOf`
   offers no `room` while `dusky`, so bees plant nothing (game.test: by day
   three bees plant within a minute, at dusk none); the `dusk` turn shuts an
   open flower picker, as rain does (`a-light.md` Decided updated). Frame
   `b-flowers-tabL.png`. A closed flower's tap was not played at dusk.
3. **Call 10, fliers settle** — in progress on `wt/b3` (not landed): rules
   and wings in source, typecheck/lint clean, `roost.test.ts` and every
   flight/insect model test pass (bd7659f6). `model/roost.ts`:
   `roostedPerches` marks `Perches.dusky`; `nextPerch` then seeks
   `Habits.roost` first (butterfly cap, bee flower, fly either), never roams
   by choice, settles back where it was with nothing open; `isDue` skips the
   stay's end while `sitsOut` (on its roost at dusk; after the moon's tap,
   until a seeded wake `WAKE_MS` 2–5 s). Wings at rest close by
   `wingsShut(duskLevel)` (0 at 0.5, shut at 0.9) through
   `InsectView.update(t, perchAt, dusk?.level)` — one line in
   `meadow-scene.ts`. **Done (b3), seen on tabL**: the `dusk` play releases
   a butterfly after furnishing, waits at dusk for it on a cap
   (`play-roost.ts`), checks its fore wings are drawn at most 0.15 of open
   (folded), shoots it whole and close, and checks it stays past its stay.
   Frames `frames/bite-17/b3-butterfly-*-tabL.png`. Found on sight: the
   wings sat open at dusk in plays only — `flier-watch.ts` and
   `veer-watch.ts` wrap `InsectView.update` and dropped its new third
   argument; both now forward it. `fliers.test.ts` green (52). phoneP not
   played. Known red, not b3's: on tabL "the moon’s tap did not turn the
   light toward day" — it fails the same with the roost wait skipped.
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
