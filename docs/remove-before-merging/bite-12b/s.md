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
- **The cap** (`model/game.ts`): `MUSHROOM_SLOTS` (12) now counts the
  mushrooms within `D_SEE` of a new foot (`isCrowdedAt(meadow, foot)`);
  `FIELD_MUSHROOMS` (96) bounds the field (`isFull`, which the picker and
  `controls.ts`'s `growable` read). `grow` refuses at either.

- **`roomFor` / patches from the current eye** (`mushroom-room.ts`): judged
  on `anchoredStand(stand, anchorOf(view.eye))` (opening eye absent a view),
  the view re-expressed in the anchored frame (`viewFrom`), and the found
  ground grown back to the plane with `grownOn(anchor, …)`. **`roomFor` now
  returns `Footed`** (plane foot + lean), not a layout `Ground`, so a room
  kept across an anchor move stays the same plane point; `fitsView` takes it
  and re-grounds it at the current anchor. Callers dispatch `...foot`:
  `arrivals.ts`, `visit-play.ts`, `tufts.test.ts` (one line each).
  `roomFor` also refuses a foot `isCrowdedAt` (the area cap, so `+` shakes
  its head).
- `clump-layout.ts`: `groundIn(ground, foot)` — the anchored layout ground
  of a stored foot — shared by `placeIn`, `roomFor`, the patches.
- `standing-weighed.ts` (`standingOn`): stands mushrooms by `placeIn` on a
  `MushroomGround`, skipping unplaced ones, cached per ground (survives
  `anchoredStand`'s fresh layouts while the anchor stays). Was `placeOf`.
- `mushroom-patch.ts`: `patchFloor` reads the depth of the anchored ground
  (`floorOn`), so a far grown mushroom's floor follows the eye.
- Tests: `mushroom-patch.test.ts` judges each forest from the eye it grew
  at (`anchoredStand`); `mushroom-room.test.ts`'s "no room facing away"
  became "grows behind the opening eye facing away, on screen".

## Decided (S3)

- No `D_SEE` filter on what `roomFor` reads: opening-frame mushrooms stand
  up to 15.9 out (PERCH_REACH's reason), so a D_SEE cut would drop
  occluders; `placeIn`'s world bounds already limit it to the anchored crop.
- The area cap counts within `D_SEE` of the **new foot** (bite-12b.md),
  over the whole stored field, not of the eye.

## Left

- `fliers.test.ts` not run on S3 (perch-sight changed; ~6 min).
- `pnpm type-overlap` reports two groups in `lawn.ts` (L2's), not S3's.
- Spore puffs / boing pitch read `shown.size` unzoomed (S2's note).
