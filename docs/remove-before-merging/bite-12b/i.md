# Package I — hand-over note

## Done

- **I1** — perches judged at an anchor, in reach (commit: see `git log --grep "perches judged"`).
  - `ui/scene/anchored-stand.ts` (new): `anchoredStand(stand, anchor)` moves every
    mushroom's and planted flower's foot with `anchored`, re-stands each seeded
    flower's layout place at its anchored foot (a new layout object, `flowers`
    replaced), drops whatever lands in the sliver behind the eye with no ground,
    and keeps bee flowers ringed round their anchored parent. At `OPENING_EYE`
    it returns the stand itself. `placeAnchored(ground, mushroom)` is `placeIn`
    with the opening clump's size and splay kept (the bed lays the clump out
    once at the opening eye; `openingIndex` fails on an anchored foot). S and L
    can use both.
  - `perch-sight.ts`: `PERCH_REACH`, caps and flowers filtered by it; caps placed
    through `placeAnchored`.
  - `perches.ts`: `see(stand, anchor = OPENING_EYE)` on the anchored stand, every
    place and air aloft taken back with `unanchored`; `perchAnchorOf` (2 units,
    0.3 rad).
  - `model/game.ts` `perchesOf`: caps (and spotted) only those `sight.places`
    names; all when there are no places.
  - `meadow-scene.ts`: `see()` at `perchAnchorOf(eye)`, rerun from `walk` when
    `sameAnchor` says it moved.

## Decided / departures

- `PERCH_REACH` is `max(D_SEE, the world frame's far corner)` = 15.91, not
  `D_SEE`: opening caps stand up to 15.21 from the opening eye, so `D_SEE`
  breaks the opening identity (`perches.test.ts`, 8 `flower-plots.test.ts`
  cases fail). Options: (a) as built; (b) `D_SEE`, rewriting those tests.
  Since caps also need `placeIn`'s world frame and flowers the world edges,
  the reach removes nothing the anchored frame keeps: the following is done by
  the anchoring itself.
- `perchSight` at 96 mushrooms on one anchored stand (1180×820, synthetic
  lattice forest): median 17–28 ms, min 6–11 ms; today's opening `perchSight`
  at 96 is ~10 ms with the layout warm. Past the 4 ms budget, so the perches'
  snap is coarsened per spec § 4.5 (2 units, 0.3 rad); each re-see is still a
  one-frame hitch.

- **`fliers.test.ts` on I1 (8617f1e): green**, 48/48, 5 min 25 s.

## I2 in progress: `i2-air-spots.patch` (not wired, not tested)

`git apply docs/remove-before-merging/bite-12b/i2-air-spots.patch` from the
repo root. It holds:

- `ui/scene/air-spots.ts` (new): the plane lattice per spec § 2. Pitch and
  height band cached per camera (`latticeOf`; pitch halved where the coarse
  lattice cannot seat `EVERY_ONE` at the opening eye). Cells `air-<i>-<j>`,
  offered `CLUMP_DISTANCE`–`AIR_FAR` (10.6) from the anchor within
  `AIR_WEDGE` (1.2) of its heading, and drawn by the anchored layout a
  butterfly's half span inside the world. `airOf(laid, anchor)` gives
  `spots` (world px at the anchor), `alofts` (true plane), `places` and the
  crowding (`pointCrowdings` on the screen points); it keeps the last 8
  anchors per camera. `airAloftOf(laid, id)` gives any cell from its id, so
  an insect still holding a cell the eye walked away from can be found.
  `clumpRow`, `AIR_BELOW`, `EVERY_ONE`, `seatsEveryOne` moved here (from
  `perch-sight.ts`; that file still has its copies).
- `ui/scene/widest-spans.ts` (new): `WIDEST_SPANS`/`widestOn` moved out
  of `perch-sight.ts` (still has its copies), for air-spots and perch-sight.
- `ui/scene/perch-crowding.ts`: `pointCrowdings` sweeps along x and shares
  the pairings arrays. It should give the same output in the same order.
  **Not checked against the old version yet.**

Measured (1180×820): 647–663 cells (spec says ≈650), 3,300 crowding pairs;
`placeOfAloft` brings today's grid back exactly (error 0). **`airOf` costs
≈ 8.5 ms an anchor**, 3 ms of it `pointCrowdings`, which is still that slow
after the sweep. The rest is the lattice loop in `spotsAt`. That is over the
4 ms budget before perch-sight's own share is counted. The next agent should
profile `spotsAt` first (it walks ~6,600 cells; `placeOfAloft` for the 650
offered takes only 0.3 ms).

**Wiring left. Every piece of it is in `perch-sight.ts`, which is off limits
for package I, so the orchestrator has to apply it or hand it over:**

- `perchSight(stand, anchor = OPENING_EYE)` takes its air from
  `airOf(layout, anchor)`: `air` ids, `aloft` crowding and the air `places`.
  Drop perch-sight's `airOf`/`airGrid`/`airSpots`/`airAlofts`/`AIR_BELOW`/
  `seatsEveryOne`/`EVERY_ONE`/`clumpRow`/`WIDEST_SPANS`/`widestOn` and
  import them instead. `footRows` drops the air rows, and `seaterOn`'s air
  case reads `airSpots(layout)`.
- `perches.ts` (mine): `see` passes `anchor` to `perchSight`. Its `alofts`
  become `airAlofts(layout, anchor)`, already on the plane, so no
  `unanchored`. The air names in `placed` come from those alofts and are not
  run back through `footRows`. `at` falls back to `airAloftOf` for an air
  id that is no longer offered.
- Callers to repoint: `perch-sight.test.ts`, `fliers.test.ts`
  (`airSpots`, `EVERY_ONE`), `insect-away.test.ts`, `perches.test.ts`, and
  `scripts/veer-away.ts` (`airAlofts`; scripts/ is off limits).
- Then run `air-spots.test.ts` (not yet written: names stable across
  anchors, cell count, heights inside the band, crowding on the screen),
  `perch-sight.test.ts`, `perches.test.ts` and `fliers.test.ts`.

## Left

- Finish I2 (above), then I3, I4 (S2's `seatAloft` fallback regression,
  `s.md` § "For package I"), I5.
