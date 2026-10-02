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

- **P1b, mushroom half** (`feat(mushrooms): turn the mushrooms' light with
  the heading`):
  - `mushroom-bed.ts`: `place` keeps on `Shown` a `lightsAt(heading)`
    closure (`mushroomLights` from the opening's place toward the layout's
    sun, at that heading) and `sunFrom`, its ground light at the opening
    heading. `paintLit` (which absorbed `paintBody`) lights at
    `this.view?.eye.heading ?? OPENING_EYE.heading`, sets `lighting` and
    `paintedSunSide` (the headed ground light's `toward.x`), and paints
    body, house **and shadow**. `follow` hands each entry `sunSide:
headedLight(sunFrom, heading).toward.x`; every due one goes through
    `paintLit`, a haze-only one included (it relights at the current
    heading too).
  - `repaint-queue.ts`: `Siding` is required in `Hazing`; tests updated.
  - `mushroom-light.ts`: `MushroomLights<Lit>` names `mushroomLights`'
    return. New test: `headedLight` of the opening ground light equals the
    ground light at any heading, bit for bit — the drift the bed judges is
    the side it paints.
  - S3's leftover: the growth puff's reach and the tap puff and boing pitch
    read the drawn size (`size · stands.zoom`); the tap puff through a
    `Puffing` whose `size` is a getter, so it stays live as the eye walks.

## Left

- **P1b, flower half** — in `flower-bed.ts`: pass the heading as
  `flowerLight`'s fifth argument, and join the flowers to the same queue
  (spec § 8), carrying their `toward.x` as `paintedSunSide` (`Siding` is
  required now, so a flower's `Hazing` must carry both).
- `house-view.ts`'s door puff (`puffFrom(…, body, …)`) still reads the
  body's unzoomed `size`; the fix that serves both callers is in
  `spores.ts` (`Puffing` carrying the drawn zoom), which this package did
  not own.
- `mushroom-bed.ts` is 479 lines, past the ~450 rule of thumb.
- P2 — mottles from the lawn's cells: needs `lawn.ts` (L's), not started.

## Decided

- `α` is per thing: each thing's opening light (from where it stands toward
  the screen's sun) gives its own azimuth, so at `OPENING_EYE` everything is
  lit exactly as today and turning shifts every azimuth by the heading.
- The sun counts as ahead of the opening eye (`cos α ≥ 0`); turned round
  (`heading = π`) every thing is lit from the mirrored side.
