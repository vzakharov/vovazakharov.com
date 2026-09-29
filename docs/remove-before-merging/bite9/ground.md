# Bite 9, ground group: paused

`ground.patch` beside this note holds the work. Apply it with `git apply docs/remove-before-merging/bite9/ground.patch`. It adds `src/pages/mushrooms/model/ground.ts` and changes `ui/scene/layout.ts` and `ui/scene/clump-layout.ts`. It type-checks. It does not pass `layout.test.ts` yet, so it has not been committed as source.

## Done

- **`model/ground.ts`** (Phaser-free):
  - `Ground { x, z }` is a point on the ground, in the clump's size. `x` runs across from the frame's middle; `z` runs into the distance from the clump's front foot.
  - `Camera` is `Sized & { groundTop, ground, centre, unit }`.
  - `project(camera, point)` returns `{ x, y, scale, haze, depth }`. It is today's projection: the depth share goes to `y` linearly, `scale = depthScale(down) / depthScale(CLUMP_DOWN)`, and haze is `hazeAt`, moved here from `layout.ts`. `depthScale` also moved here. `depth` is `y`.
  - `COMMON_FRAME { left, right, near, far }` and `inFrame(point)`.
  - `fitCamera(screen, lens)`. `Lens = { reach, margin, floor }` is passed in, because the finger and the edge margin are ui constants.
  - `unit = max(floor, min(composed as today, ground × UNIT_PER_BAND, (w/2 − margin) / reach))`.
  - `Hazed` moved here, and `layout.ts` re-exports it.
- **`clump-layout.ts`**: one ground table for every screen, `CLUMP_FEET` plus `CLUMP_SHIFT` in ground units. `standOn(camera, foot, size, splay)` returns a `Placement`. `clumpSlots(camera)` no longer clamps to the edge, so nothing moves on the ground per screen.
- **`layout.ts`**:
  - `FOREST_FEET` is one ground table, and `slotsOn(camera)` projects the slots through the camera.
  - `ZOOM_FLOOR` is `2·TAP_RADIUS / (least capWidth × least slot size at unit 1)`. It replaces `FINGER_SIZE`.
  - `LENS.reach` is measured from the slots at unit 1 using `maxReach`.
  - `meadowCamera(w, h)` builds the camera, and `MeadowLayout.camera` carries it.
  - Flowers keep their unit on `camera.unit`, and their feet are `everyPlace(mushrooms)`.
  - `layout.mushrooms` keeps its `SlotPlaces[]` shape, so `mushroom-bed`, `flower-bed`, `perch-sight` and the rest are unchanged. They already draw what the camera projected.

## Measured (full `layout.test.ts`, 2000 visits, one config back from the patch)

Every invariant held on every screen but one: the phone held sideways. There, one forest cap covers another by **25–26%**, against a limit of **25%**:

- With the current slot 4 at `x = −1.15`: mushroom-3 (front-right) covers the clump's front porcini by 26%.
- With slot 4 at `−1.03`: the clump's back cap covers slot 4 by 25.x%.

The cause is that the phone held sideways is at the zoom floor (unit 127, ground band 156 px). The small phone is at the floor and at its width limit together (unit 127, 1–2 px of edge margin to spare on slots 2–3). With one table, the phone held sideways can have no more room across than the small phone has, and it has no more depth.

Worst cover per screen, before → after:

| Screen              | Before | After            |
| ------------------- | ------ | ---------------- |
| tablet              | 14.7%  | 17.5%            |
| tablet portrait     | 21.1%  | 17.3%            |
| phone               | 8.9%   | 12.3%            |
| phone held sideways | 0%     | 25–26% (fails)   |
| small phone         | 24.4%  | 16.1%            |
| desktop             | 14.7%  | 17.5%            |

The clump's size (unit, px), before → after:

| Screen              | Before | After |
| ------------------- | ------ | ----- |
| tablet              | 361    | 171   |
| tablet portrait     | 345    | 300   |
| phone               | 160    | 138   |
| phone held sideways | 172    | 127   |
| small phone         | 130    | 127   |
| desktop             | 475    | 225   |

Landscape now stands the portrait arrangement, with the back row above and beside the clump, and more meadow either side. The clump on the landscape tablet is half today's size. That is the cost of one table.

## Left

1. Get the phone held sideways under 25%. Options: a smaller `x` for the front porcini shift (0.065 passed cover, but the door test then sat at 80.7%, right at the limit), a deeper ground band on landscape (0.55·H broke the controls tests), or report the trade to the operator.
2. Add `model/ground.test.ts`, covering: the frame is shown on every viewport; a rotation keeps ground points; the zoom floor measured from the drawn cap box on every slot and screen, by adding a width check to `capsOfForest` in `layout.test.ts`. Then break the code once to see each test fail.
3. Run the other suites that read `meadowLayout`: flower-layout, flower-plots, perch-sight, sun-layout, ink, insect-layout, mushroom-light, mushroom-outline, backdrop-tones.
4. Update the header comment of `layout.ts`, the `mushroom-tap.ts` comment citing `FINGER_SIZE` (the tap agent's file), and run lint, type-overlap and knip.
5. Probe build, then play tabL and phoneP, with frames going to `tmp/bite9/ground/`.
