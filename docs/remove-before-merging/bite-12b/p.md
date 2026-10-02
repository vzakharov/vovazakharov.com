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
- **P2 — mottles from the lawn's cells: built and green**
  (`feat(mushrooms): mottles on the plane, grown by the lawn's cells`). The
  draft's code was right; two of its test assertions were not:
  - "Wider than deep" assumes a true pinhole's foreshortening. The scene's
    projection is linear in azimuth (`arc = focal / SPREAD`, `SPREAD` 1.96),
    so a plane patch's screen depth-to-width is `EYE_HEIGHT · SPREAD / d`
    = 8.15 / d: over 1 nearer than 8.15, 0.63 at the brow. A round patch near
    the screen's foot draws taller than wide, as every plane spacing does.
    The test now asserts what lying flat means here: a patch foreshortens as
    it lies farther ahead, every outer point under `browRow`, the outer ring
    round the inner.
  - "None past the brow" expected a mottle 5 ahead drawn, but the screen's
    foot on tabL is about 7.7 ahead (5 draws at y 1257 of 820), so the
    off-screen skip rightly drops it; the probe is now 9 ahead.
  - `Mottle.along` became `lengthways`, `ShownMottle.colour` `tint`, and the
    types build on `WithMiddle`, `Wide`, `Translucent` (`pnpm type-overlap`).
  - Seen at 10× alpha on tabL (opening frame) the mottles lie flat under the
    tufts and flowers and thin out before the brow. **At the bite-11 values
    (`MOTTLE_TONE` 0.3, `MOTTLE_ALPHA` 0.16 over two rings) they are all but
    invisible**: a 2–5 % shift of the ground. Raising them is a look call,
    left open.

  The draft, as it was, added
  `ui/scene/mottles.ts` (`Mottle` on the plane — `middle`, `across`,
  `along`, `angle`, `deep`; `mottleIn`, `shownMottles` projecting two rings
  of 16 plane points each through `viewOf`, fading to nothing as the far
  edge nears `D_SEE`, skipped near/behind the eye or off screen;
  `paintMottles` as a path, so the module loads under node;
  `MOTTLE_DEPTH` between `DEPTHS.ground` and `.brow`; tone and alpha the
  old bite-11 mottles' — `MOTTLE_TONE` 0.3, `MOTTLE_ALPHA` 0.16 over two
  rings, outer 1.3× wider), `lawn.ts` `cellLawn` (3 mottles drawn from
  the cell's stream **after** its tufts, so the tufts are unchanged) and
  `LiveLawn.mottles`, and `tufts.ts`'s `Grass` drawing them in `update`
  when the view changes (a graphics at `MOTTLE_DEPTH`) — `tufts.ts` was
  not on the package's list.

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
