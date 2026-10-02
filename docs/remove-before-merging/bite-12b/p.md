# Package P — hand-over

## Done

- **P1 — light by heading, through the repaint queue** (commit: see the
  branch log, `feat: light by heading through the repaint queue`).
  - `model/light.ts`: `headedLight(light, heading)` — `toward.x` becomes
    `sin(α − heading)`, `α = asin(toward.x)` the azimuth the opening eye sees
    the sun at (ahead of it), computed as `x·cos h − √(1−x²)·sin h` so heading
    0 returns `toward.x` bit-exact; `toward.y` kept (so `toward` is no longer
    unit off the opening heading, as the spec says).
  - `ui/scene/mushroom-light.ts`: `mushroomLights` and `flowerLight` take a
    trailing `heading`, defaulting to `OPENING_EYE.heading`; the beds'
    current calls are untouched and light exactly as before.
  - `ui/scene/repaint-queue.ts`: `SIDE_DRIFT = 0.1`; `Hazing` gains
    `Partial<Siding>` (`sunSide`, `paintedSunSide` — named so, since `side`
    overlaps `baking.ts`'s `FaceFrame` in `pnpm type-overlap`); `repaintsDue`
    takes a thing whose haze or sun side drifted past its threshold, nearest
    first, `REPAINTS_PER_FRAME` a frame. A thing with no sides is judged by
    haze alone, so `mushroom-bed.ts` compiles unchanged.

## Left

- **P1b (needs S2/L2 to let go of the beds) — the feature does not show
  until this lands:**
  - In `mushroom-bed.ts`: keep the heading the bed last painted at; in
    `place`, pass `this.view?.eye.heading` (the view's eye heading — check
    what `View` carries after S2) as `mushroomLights`' fifth argument, and
    store on `Shown` the body light's unheaded `toward.x` at paint plus
    `paintedSunSide` = the headed ground light's `toward.x`. In `follow`,
    give each `hazing` entry `sunSide: headedLight(unheadedGround,
heading).toward.x` and `paintedSunSide: shown.paintedSunSide`; for each
    due one, re-run the light (`mushroomLights` at the new heading), set
    `shown.lighting` and `paintedSunSide`, repaint body **and shadow**
    (`drawMushroomShadow` with the new ground light). Then make `Siding`
    required in `Hazing` (drop `Partial`).
  - In `flower-bed.ts`: pass the heading as `flowerLight`'s fifth argument,
    and join the flowers to the same queue (spec § 8), carrying their
    `toward.x` as `paintedSunSide`.
- P2 — mottles from the lawn's cells (after L2).

## Decided

- `α` is per thing: each thing's opening light (from where it stands toward
  the screen's sun) gives its own azimuth, so at `OPENING_EYE` everything is
  lit exactly as today and turning shifts every azimuth by the heading.
- The sun counts as ahead of the opening eye (`cos α ≥ 0`); turned round
  (`heading = π`) every thing is lit from the mirrored side.
