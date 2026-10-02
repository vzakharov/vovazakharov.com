# Package S — hand-over note

## Done

- **S1 — the side cull** (`ui/scene/bed-place.ts`): `bedPlace`, given a
  height, now also hides a thing whose foot stands past a screen side by more
  than `SIDE_OVERHANG` (1.5) of its drawn height (`offSides`). Mushroom-bed
  and flower-bed pick it up unchanged through `viewedOrLaid`, which already
  passes each one's height (`shown.tall`, `headR - headY`). No change in
  `mushroom-bed.ts`, `flower-bed.ts` or `view.ts` was needed.
- Tests in `bed-place.test.ts`: the overhang covers every mushroom's widest
  reach (cap at most 0.66 of its height, cast shadow 0.81); a thing behind or
  beside the eye within D_SEE is not drawn; one past a side by 0.1 or 0.9 of
  its overhang is drawn, by 1.1 is not; at the opening eye every mushroom and
  flower whose drawn reach touches the screen is drawn exactly as before.

## Decided

- The overhang is measured in the thing's own drawn **height**, the one size
  `bedPlace` already receives, rather than a new width argument, so
  flower-bed needs no edit. 1.5 heights also equals a tuft's
  `BLADE_OVERHANG` (3 sizes over its 2-size height), so `shownSprouts`
  draws exactly what it did.
- Things called with no height (layout tests, flower-cover, perch readers)
  are not side-culled, as they are not sunk-away-culled.

## For package L (flower-bed.ts)

- `FlowerBed.paint` stands a new flower before `drawFlower` sets `headR` and
  `headY`, so its first stand passes height 0: a flower whose foot is off a
  side by any amount is hidden until the next `follow` (next frame). Same
  pre-existing shape as the sunk-away cull; one frame at most. Standing it
  again after `drawFlower` would close it.

## Done — S2, the anchored layout (`clump-layout.ts`, `layout.ts`, `bed-place.ts`, `mushroom-bed.ts`)

- `MushroomGround` carries `anchor: Eye` (`OPENING_EYE` in `standMeadow`).
  `placeIn` moves the stored foot onto `OPENING_EYE` with `anchored` (skipped,
  so bit-exact, at `OPENING_EYE`), returns `undefined` where `gathered` has no
  ground, and keeps the clump's size/splay by `openingIndex` of the _stored_
  foot. So `coversOn`, `mushroomFeet`, tuft-tap, perch-sight and every other
  `placeIn` caller judge from an eye by being handed
  `{ ...layout, mushrooms: anchoredGround(layout.mushrooms, anchor) }`.
- `anchoredGround(ground, anchor)` returns the same object while the anchor
  stays (`sameAnchor`), `ground` itself at its own anchor, so a cache keyed
  per ground (e.g. `coversOn`'s) holds until the anchor snaps.
- `laidOf(camera, footed): Laid` (`Placement & { opening }`): the bed's paint.
  Opening clump as the opening eye stands it; every other mushroom at
  `{x: 0, z: 0}` (the clump's distance, straight ahead), `FOREST_SIZE`.
  `bedPlace`/`viewedOrLaid` take an optional `opening`, and the bed passes
  it, so drawn size = laid size · `opening / ahead` — the same size the
  forest's opening layout gave (tested). Painted once, never per anchor.
  A mushroom grown behind the opening eye is now painted (before, `place`
  returned early).
- Tests (`clump-layout.test.ts`): identity at `OPENING_EYE`; `anchoredGround`
  stays one object; a mushroom behind the opening eye is unplaced at the
  opening, placed from an anchor facing it exactly as `placeOf` places its
  anchored foot; a grown mushroom's laid placement is the same whatever eye,
  and it draws at the forest's size from two anchors; the clump keeps its
  opening layout.

## Decided (S2)

- The anchor rides on `MushroomGround`, not on moved feet. I1's uncommitted
  `anchored-stand.ts` (in `wt-i`) moves feet and keeps the clump's size via a
  WeakMap (`placeAnchored`); with S2, `placeIn` on an anchored ground does
  that, so `placeAnchored` can collapse to `placeIn` and the mushrooms need
  not be moved. Its flowers still need moving (the layout's `flowers` stays
  as the opening laid it — that is L's/I's).
- Light: the bed lights a mushroom from `placeIn(layout.mushrooms, …)`
  (the opening's place, as before) and falls back to its laid place only
  where the layout has none. P1's light by heading replaces this.

## For package I

- `capTop`'s seat point and `on.laidFoot` are in the bed's **paint** frame
  now. `onHost(on, at)` stays exact (drawn = stands + offset · zoom, both of
  one frame), but `seatAloft`'s fallback (`aloftOfLayout(view, seat,
laidFoot.y)`, host not drawn) reads it as opening world px, which for a
  grown mushroom is wrong: an insect sat on a grown mushroom that goes
  undrawn (off a side, too near) is put aloft at the clump's distance
  straight ahead of the opening eye. I4 (seat fallback from the host's plane
  foot) fixes it; `Shown.opening` is the scale it needs (laid px per clump
  unit = `opening / focal`).

## S3 — in progress (`wt/s3`)

- **One anchoring path**: `placeAnchored` is gone. `anchoredStand` no longer
  moves mushroom feet; it hands the stand's layout
  `anchoredGround(layout.mushrooms, anchor)`, and perch-sight's two call
  sites (`seaterOn`'s cap, `footRows`) call `placeIn` on it. A cap's reach
  test (`inReach`) measures the stored foot from the ground's anchor (equal,
  the anchoring being rigid, to the anchored foot from `OPENING_EYE`).
  Seeded and planted flowers are still moved as before.

## Left

- S3 (roomFor / patches from the current eye, the per-area cap): see the
  S3 section. `roomFor` still uses `placeOnGround`/`placeOf` at the opening.
- Nobody yet hands the rules an anchored ground: meadow-scene (I1) / L3
  wire `anchoredGround(layout.mushrooms, anchorOf(eye))`.
- Spore puffs (`puffSpores`, `puffFrom`) and the boing's pitch read
  `shown.size` unzoomed, so for a grown mushroom they follow the paint size
  (the clump's distance), not its drawn size.
