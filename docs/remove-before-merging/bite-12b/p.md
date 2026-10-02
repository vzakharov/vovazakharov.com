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

- **P1b, flower half** (`feat(mushrooms): turn the flowers' light with the
heading`):
  - `draw-flower.ts`: `FlowerPainting` (`openingLight`, `drawIn`,
    `paintedSunSide`) and `paintFlowerLit(painting, heading)`, which paints
    in `headedLight(openingLight, heading)` and keeps its `toward.x`.
  - `flower-bed.ts`: `paint` keeps on each flower a `painting` whose
    `openingLight` is `flowerLight` from `stood.place` (the opening's place,
    so a planted flower laid at `laidFlower`'s {x:0,z:0} still lights from
    where it stands) and paints it at the eye's heading (`OPENING_EYE`'s
    before the first `follow`). `follow` hands every drawn flower to
    `repaintsDue` with `haze`/`painted` 0 (flowers are painted with no
    haze) and `sunSide: headedLight(openingLight, heading).toward.x`.
  - Test (`mushroom-light.test.ts`): `headedLight` of a flower's opening
    light equals `flowerLight` at any heading, bit for bit, and is the
    opening light itself at the opening heading.

## Left

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
- The flowers run `repaintsDue` in their own bed, so a turning frame
  repaints up to 2 mushrooms **and** 2 flowers: one queue across both beds
  needs `meadow-scene.ts` (off limits) to gather both beds' `Hazing`. A
  flower's repaint is a stem and a head, far under a mushroom's.
- The flower's painting lives on its own `painting` record, not on `Shown`:
  `Pick<Siding, 'paintedSunSide'> & Sprouted` on both beds' `Shown` trips
  `pnpm type-overlap`'s combination floor, and `mushroom-shown.ts` was off
  limits.
- `flower-bed.ts` is 485 lines (443 before), past the ~450 rule of thumb;
  the paint helpers went to `draw-flower.ts` to keep it there.
- The sun counts as ahead of the opening eye (`cos α ≥ 0`); turned round
  (`heading = π`) every thing is lit from the mirrored side.
