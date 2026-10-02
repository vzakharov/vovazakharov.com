# Bite 12b — the insects on the plane (spec section, package I)

Units: plane lengths in the clump's size (`CLUMP_DISTANCE` = 8.64 of them);
`D_SEE` (the brow) = 13.33, `V_NEAR` = 5.01, `SPREAD` = 1.962 (printed from
`model/ground.ts` and `ui/scene/view.ts` under tsx). Paths under
`src/pages/mushrooms/`. Builds on spec.md § 3 (re-anchoring) and its step 0.

## 1. Reconciled: endless-field.md § "The insects on the plane"

**Done in bite 12** (the insect-plane packages, `bite-12/insect-plane.md`):

- **Legs with height, in a plane frame.** `Aloft = Point & { h }`
  (`model/flight-frame.ts:16`); a leg is steered in the frame turned to a
  centre azimuth fixed at set-off (`centreOf`, `:47`; `framedOf`, `:62`),
  every `Place` carries its plane `pose` (`placeOf`, `:111`) and a leg is
  timed as drawn (`pairFramed`, `:145`). `insect-view.ts` flies every leg
  in that frame (`:203-207`); it computes nothing in layout px any more.
- **Leaving at any heading.** `legEnd`/`leavingAloft`
  (`ui/scene/insect-away.ts:153`, `:131`) and `awayPlaces` (`:184`) are
  built from the current `view`, fixed on the plane at a leg's first frame.
- **A release facing away no longer flies in unseen.** `firstFlight`
  (`model/flight.ts:286`) picks a first perch the screen shows
  (`shownOf`, `model/flight-in.ts:123`), else flies out by the side nearer
  its perch (`outFirst`, `outWay`); `entryAloft` (`insect-away.ts:233`)
  sets off over the brow of the current view.
- **A leg ending behind the eye hidden — retired.** Culling is now by the
  drawn extent (`insect-drawn.ts:97`) and by `ahead > 0`
  (`insect-frame.ts:98`): an insect is hidden only while it truly is
  behind the eye or off the screen, which is correct, not an accepted case.
- **"Entry from the view's edge"** was replaced in bite 12 by "comes up over
  the brow" (`entryAloft`), already view-relative. Nothing to build (§ 4.2).

**Left** — every piece still read at the opening eye or in its layout px:

1. **Perch places in opening-layout px.** `perchSight`
   (`ui/scene/perch-sight.ts:268`) seats caps and flowers through
   `placeIn(layout.mushrooms, …)` and `flowersOf(stand)` on the opening
   layout, divides by `insectSize` (`:326`) and measures `fromEye` at the
   opening rows (`:322`); `Perches.see` (`ui/scene/perches.ts:39-66`) runs
   them back to the plane with `aloftOfLayout` (`:58`). After step 0 a
   mushroom outside ±3.08 rad of the opening heading has no `Ground`, so it
   is no perch at all.
2. **Caps offered anywhere.** `perchesOf` (`model/game.ts:220-222`) offers
   every mushroom; `nextPerch` (`model/flight.ts:230`) weighs caps and
   flowers by spotted pull only, never by distance (only `roamFrom`'s air is
   weighed by `stride`, `:207`). On an endless field an insect would pick a
   cap 100 units off as readily as one at its feet.
3. **Air fixed in the opening wedge.** `airGrid` (`perch-sight.ts:231`) lays
   a grid over the opening world in px; `airAlofts` (`:360`) puts it on the
   plane at the clump's row: measured, 110 (844×390) to 770 (1920×1080)
   spots, azimuth ±1.19–1.21 rad of heading 0, 8.64–10.60 units from the
   opening eye, `h` 1.17 to 4.1–5.6, column pitch 0.39–0.98 units. Walk
   away or turn round and the air stays behind.
4. **`onscreenOf`'s x-only test.** `isShown` (`model/flight-in.ts:41`)
   tests `place.x` between the edges alone; `onscreenOf`
   (`perch-sight.ts:406`) fills only `left`/`right`/`inset`. A perch past
   the brow or under the screen's foot counts as shown — rare in the glade,
   the common case on an open field.
5. **`seatAloft`'s fallback** (`ui/scene/insect-seat.ts:58-62`): a host not
   drawn is placed by `aloftOfLayout(view, seat, on.laidFoot.y)`, i.e. read
   as laid at the opening eye.
6. **Take-offs unpanned.** `MeadowSound.takeOff`/`shy`
   (`ui/scene/sound.ts:269`, `:274`) play centred; callers
   `insect-view.ts:388,390`, `arrivals.ts:66`. `panned` (`synth.ts:108`) is
   there, used by footsteps only (`sound.ts:265`).

**Retires:** the opening-eye reading in 1, 3, 4 and 5. The layout-px code
itself stays as the re-anchoring seam (§ 4.1).

## 2. Design

**The anchor.** Everything below is judged at spec § 3's snapped anchor
`A` (position to 0.5 units, heading to ≈0.04 rad), so it changes a few
times a second while walking. `anchored(A, p)`/`unanchored(A, p)` and
`groundOfPlane` come from step 0; the snap and a stand anchored at `A` are
§ 3's (see I0).

**Perches stored and judged on the plane** (re-anchored, code kept):

- `perchSight(stand)` runs unchanged on **the stand anchored at `A`**:
  seats, tracks, crowdings (`crowdings`, `pointCrowdings`) and `roomFor`
  are its own code. `Perches.see(stand, A)` takes each place back with
  `unanchored(A, aloftOfLayout(…))`, and `places` are framed from the plane
  per frame as today (`sightFrom`, `perches.ts:76`). At `A = OPENING_EYE`
  the anchoring is the identity, so every perch test holds bit for bit.
- **Which perches an insect chooses among: those within
  `PERCH_REACH = D_SEE` (13.33) of `A` on the plane** — what the child sees
  by turning round where he stands. A cap is offered where the scene places
  it: `perchesOf` takes `caps` as the mushrooms `sight.places` names (all
  of them when `places` is absent, as in the model tests), so the filter
  lives in `perchSight` alone. Flowers keep today's world-edge test on the
  anchored layout, so a flower is a perch inside the anchored wedge
  (±1.2 rad) in reach; caps anywhere in reach, as today caps anywhere in the
  frame. At the opening eye every opening perch stands nearer than the brow,
  so the set is today's.
- An insect sitting on a perch that leaves the reach keeps it until its
  leg ends; `isOffered` (`flight.ts:382`) then fails, so it does not settle
  again and takes the next leg among what is in reach: **the insects follow
  the child**, and a far mushroom has insects once he walks to it.
- `see()` reruns when `A` changes, in `MeadowScene.walk`
  (`meadow-scene.ts:218`), besides today's resize, regrow and sow.

**Air spots round the eye: a plane lattice in the anchored wedge.**

- Cells of a square lattice on the plane, pitch `p` = today's rule in plane
  units: the narrowest kind's widest span over `camera.unit` (halved where
  the coarse set cannot seat `EVERY_ONE`, as `seatsEveryOne` does today).
  Named by cell, `air-<i>-<j>`, so walking never renames a spot.
- Offered: cells whose centre is `CLUMP_DISTANCE`–`AIR_FAR` (10.6, today's
  far edge) from `A` and within `AIR_WEDGE` (1.2 rad, today's) of `A`'s
  heading. Measured count at 1180×820 (`p` ≈ 0.26): sector 45 sq units, ≈
  650 cells against today's 564.
- Height per cell from its own seed, in the band today's grid spans on that
  layout (its bottom and top rows' `h`).
- Crowding among air spots is judged where the anchored view draws them
  (`pointCrowdings` over their screen points at `A`), not by plane distance:
  two cells one behind the other on a sight overlap on screen whatever their
  plane distance (§ 4.4).

**Entry from the view's edge** stays bite 12's: over the brow of the
current view (`entryAloft`). What changes is what "shown" means: `Onscreen`
gains `bottom` (the screen's foot) and `brow` (`D_SEE`), and `isShown` asks
`x` inside the edges, `y` above `bottom − inset` and `fromEye ≤ brow`.

**Take-offs panned by azimuth.** `panOf(eye, point) =
sin(wrap(azimuthOf(eye, point) − eye.heading))`: ±1 at the sides, 0 ahead
and behind (stereo cannot tell front from back: accepted). `takeOff(kind,
pan)` and `shy(kind, pan)` go through `panned`. A tap pans by the tapped
insect's `drawn` aloft; a release by its first perch's pose, read from the
sight's `places` once the reducer has set its leg, 0 where it has none.

**With step 0:** stored feet are plane `Point`s, so distance to `A` is
`distanceBetween(A, foot)` on the stored numbers, and every layout-px read
goes through the anchored stand. `RING_SLOTS` and bee planting are not
this package's.

## 3. Package I

Every step: `pnpm typecheck`, prettier and eslint on its files, its tests
one file at a time. `fliers.test.ts` (~6 min) reruns in I1, I2 and once
after I3.

- **I0 — the anchor (only if no other package owns it).** Needs: step 0.
  `model/anchor.ts` (`anchorOf(eye): Eye`, the snap) and
  `model/anchor.test.ts` (snap is idempotent; moves only past 0.5 units or
  ≈0.04 rad). If spec.md § 4 gives the snap to another package, I waits on
  it and I0 drops.
- **I1 — perches judged at the anchor, in reach.** Needs: step 0, the
  anchored stand. Owns `ui/scene/perch-sight.ts` (reach filter, anchored
  `awayPlaces`), `ui/scene/perches.ts` (`see(stand, anchor)`, `unanchored`),
  `model/game.ts` (`perchesOf`'s caps from `places` only),
  `ui/scene/meadow-scene.ts` (`see()` on an anchor change). Tests:
  `perch-sight.test.ts`, `perches.test.ts`, `game.test.ts`,
  `flower-plots.test.ts`, `tufts.test.ts`, new cases: a cap past
  `PERCH_REACH` is no perch; the identity at `OPENING_EYE`; a perch behind
  the opening eye placed from an anchor facing it. `fliers.test.ts`.
  Measure `perchSight` on one anchored stand at 96 mushrooms; budget 4 ms
  a re-see, else coarsen the perches' snap (§ 4.5).
- **I2 — air round the eye.** Needs: I1. New `ui/scene/air-spots.ts`
  (lattice, `airSpots`, `airAlofts`, `seatsEveryOne`, `AIR_BELOW` moved out
  of `perch-sight.ts`, 421 lines) and `air-spots.test.ts`; `perch-sight.ts`
  imports it; `perch-hosts.ts` unchanged. `fliers.test.ts`' "the air" and
  `overlapAloft` measured on the screen at the opening eye. Tests:
  `air-spots.test.ts`, `perch-sight.test.ts`, `fliers.test.ts`.
- **I3 — shown by the view.** Needs: I1. `model/flight-in.ts` (`Onscreen`
  `bottom`/`brow`, `isShown`), `ui/scene/perch-sight.ts` (`onscreenOf`).
  Tests: `flight-in.test.ts`, `flight.test.ts`, `flight-kinds.test.ts`,
  `insect-away.test.ts`, `perch-sight.test.ts`; new: a perch past the brow
  is not shown, nor one under the foot.
- **I4 — the seat fallback.** Needs: the beds package's plane foot on
  `Host`. `ui/scene/insect-seat.ts` (`seatAloft` from the host's plane foot
  and laid height). Tests: `insect-seat.test.ts`, `insect-drawn.test.ts`.
- **I5 — take-offs panned.** Needs: none past step 0.
  `model/flight-frame.ts` (`panOf`) + `flight-frame.test.ts`;
  `ui/scene/sound.ts`, `sound.test.ts`; `ui/scene/insect-view.ts`,
  `ui/scene/arrivals.ts` (call sites).

**Play checks** (`flock …/tmp/site.lock`): walk ↑ 20 s from the opening:
within 30 s every insect drawn sits or hovers within `D_SEE` of the eye;
turn 180°: air spots are drawn ahead (some insect in view within 20 s);
release facing open grass: the insect comes up over the brow, never pops
in mid-screen.

**Hand checks for `to-check.md`** (Russian):

- **Насекомые идут за ним.** Уйди далеко от грибов и посади там цветок:
  через полминуты бабочки и пчёлы летают рядом, а не остались у старых
  грибов.
- **Выпуск в пустом поле.** Встань спиной к грибам и нажми бабочку: она
  поднимается из-за бровки и летит туда, где её видно, а не появляется
  посреди экрана.
- **Звук взлёта сбоку.** Тапни бабочку у левого края экрана: треск
  взлёта слышен слева.

## 4. Where the plan's calls cannot hold as written

1. **"The layout-px adapter in `insect-view.ts` retires."** There is none
   left there (§ 1). The px that remain are `perchSight`'s seats and
   crowding, and the plan's own re-anchoring call keeps them. (a) Keep them,
   re-anchored (recommended): no new geometry, opening identity, fliers
   tests unchanged in meaning. (b) Plane-native seats and crowding: cap
   seats and flower lifts restated in clump units, ~150–250 new lines
   duplicating `mushroom-bed.ts`/`flower-bed.ts` geometry, every
   perch-sight fixture rewritten.
2. **"Entry from the view's edge."** The code enters over the brow by
   bite 12's design, view-relative already. Building edge entry would undo
   bite 12's arrival work; keep the brow, only "shown" changes (I3).
3. **«Садятся куда хотят».** Taken literally (any perch on the field), an
   insect picks a cap 100 units off: a leg of minutes off screen, and the
   child's meadow empties. (a) Reach `D_SEE` from the anchor (recommended);
   (b) `2·D_SEE`: insects behind the brow most of the time; (c) no reach.
4. **Hovering insects never overlap** holds only from the anchor: crowding
   is judged on its screen, so after a step or turn two held spots may
   overlap for a moment. Accepted as the plan accepts it for rules.
5. **The snap is unmeasured** (spec § 3). `see()` per anchor change costs a
   `perchSight` (crowding is O(perches²)); if I1 measures past 4 ms, the
   perches re-see on a coarser snap (2 units, 0.3 rad) than the rules.
