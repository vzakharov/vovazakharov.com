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

- **`fliers.test.ts` on S3 (5e80fb4): green**, 48/48, 5 min 22 s.

## I2

**Landed** (see `git log --grep "air round the eye"`): `ui/scene/air-spots.ts`
(the plane lattice, `airOf`/`airSpots`/`airAlofts`/`airAloftOf`, `clumpRow`,
`AIR_BELOW`, `EVERY_ONE`), `ui/scene/widest-spans.ts`, and `pointCrowdings`
rewritten, with `perch-crowding.test.ts` checking it against every-two-asked
(the old algorithm) — same pairs, same pairings, same order, 0 to 1200
points.

**`airOf` per anchor at 1180×820: median 2.4–3.0 ms** (walk in 2-unit
steps 2.95, p90 4.9; turn by 0.3 rad 2.6; ~655 spots, ~3,400 pairs), from
5.0 ms after the patch as handed over. Profiled, where the time went:
`Object.fromEntries` of `places` with keys never seen before cost 2.4 ms of
it (V8 interns each new key; a plain assign loop is 4× cheaper, and a
spread into another object is as dear) — a 2-unit step renews ~85 % of the
cells, so most keys are new. Fixes: `places` entered one by one; each cell's
id and perch name kept from the last anchor and reused (`namedCell`; −0.5 ms
median, p90 halved); `pointCrowdings` an x-sweep collecting pairs as
`first·n + second` numbers and sorting them (1.07 ms, from 2.3). `spotsAt`
itself is 0.65 ms. Under budget, so neither the plane crowding nor a coarser
snap was measured.

**Wiring landed** (`git log --grep "wire the air lattice"`; the patch is gone):

- `perch-sight.ts`: own air code, `WIDEST_SPANS`/`widestOn`, `clumpRow`,
  `AIR_BELOW`, `EVERY_ONE` dropped and imported. The anchor is read off the
  stand (`layout.mushrooms.anchor`, which `anchoredStand` sets), so
  `perchSight(stand)` keeps its signature (a departure from the old note's
  `perchSight(stand, anchor)`). Air ids, crowding and places from
  `airOf(layout, anchor)`; `seaterOn`'s air case `airSpots(layout, anchor)`;
  `footRows` lost the air rows; `places` built by an assign loop (spreading
  650 fresh keys costs ~3 ms).
- `perches.ts`: `alofts = airAlofts(layout, anchor)` (plane already); air
  names in `placed` from those alofts; `hosts(perch)` falls back to
  `airAloftOf` for an air spot no longer offered.
- Tests: the old grid's checks (`airSpots` across the whole width, the air
  crowded by `WIDEST_SPAN`, drawn via `ofLayout` over the clump's row, the
  air at the clump's distance) are gone from `perch-sight.test.ts`;
  `air-spots.test.ts` checks the lattice instead: more spots than
  butterflies, inside the world, from six eyes; 500–800 spots at 1180×820;
  heights in the band; each spot at `placeOfAloft` of its aloft from the eye
  it is offered round, drawn there, its `fromEye` the place's; names and
  alofts kept between eyes; `airAloftOf` = `airAlofts`; air crowded iff
  nearer on screen than a butterfly's widest wings. `fliers.test.ts` 48/48
  (5 min 9 s), perch-sight 50/50, perches, insect-away, perch-crowding green.
- `pnpm type-overlap` was red on `air-spots.ts` (I2's landing): `Spot`'s
  `aloft` now `Pick<Pose, 'aloft'>`, `Air`'s `alofts` `Pick<PerchHosts,
  'alofts'>`, the cell's `{ id, name }` now `WithId & { key }`, the
  lattice's `pitch` renamed `spacing` (it collided with `Buzz`'s).

## I3 — shown by the view

Landed (`git log --grep "shown by the view"`). `Onscreen` gains `downTo`
(the screen's foot, `view.height / insectSize`) and `far` (`D_SEE`), and
`isShown` asks `x` inside the edges, `y ≤ downTo − inset`, `fromEye ≤ far`.
Departure: the spec's names `bottom`/`brow` — `brow` is `WayOut`'s place
already, and `bottom`, `foot`, `lowest` each collide with another type's
member in `pnpm type-overlap`. Tests: `flight-in.test.ts` (`isShown` past
each edge, the foot and the brow; a release whose every perch is past the
brow or under the foot flies out of view first), `perch-sight.test.ts`
(a shown perch drawn above the screen's foot; from eyes stepped back 6–14
units, perches the edges hold past the brow are not shown). flight,
flight-kinds, insect-away, game, perch-sight green.

## I4 — scoped, not built

Blocked on the plane foot on `Host` ("Needs: the beds package's plane foot
on `Host`"): `Host` (`bed-place.ts`) is still `Standing & { laidFoot }`, and
both places that build one, `mushroom-bed.ts` `capTop` (`{ laidFoot: laid,
stands }`) and `flower-bed.ts` `seat` (`{ laidFoot: laid.place, stands }`),
are off limits to I (P1b and L″ hold them). Design for whoever builds it:

- `Host = Standing & { laidFoot: Point; foot: Point; opening: number }` —
  `foot` the plane foot (mushroom `Shown`'s `Footed` foot, flower
  `laid.foot`), `opening` the distance it is laid at (`Shown.opening`;
  `CLUMP_DISTANCE` for a flower laid off the opening, per L's `laidOf`).
- `seatAloft`'s fallback: px off the laid foot to clump units by
  `opening / focal` (s.md); `across = (seat.x − laidFoot.x)·k`,
  `h = (laidFoot.y − seat.y)·k`; aloft `{ x: foot.x + across·cos(heading),
  y: foot.y − across·sin(heading), h }` (the eye frame's x on the plane, as
  `unanchored` turns it).
- Test in `insect-seat.test.ts`: a grown mushroom's seat, its host undrawn
  (off a side, too near), lands at the seat the drawn path gives one frame
  earlier, not at the clump's distance ahead of the opening eye.

## Left

- I4 (blocked, above) (S2's `seatAloft` fallback regression,
  `s.md` § "For package I"), I5.
