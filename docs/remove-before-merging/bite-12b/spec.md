# Bite 12b — the endless field (spec)

§§ 6–11 below were added by the second spec agent (`spec-rest`); its
numbers are measured at c396659 by a Node benchmark that is not committed.

**Status: partial.** The mapping agent hit its context budget after the
store, the rim and the opening-eye rules were mapped. Done here: § 1 (the
map, for those three), the central design call of § 3 (how the opening-eye
rules move to the current eye), step 0, and the risks found so far. **Not
done:** § 2 (the insects reconciled — none of `insect-view.ts`,
`insect-away.ts`, `insect-shown.ts`, `perch-sight.ts`, `perches.ts`,
`model/flight*.ts` was read), `follow`'s cost at 96 mushrooms, light by
heading, mottles, the play-run changes beyond the rim, and the package cut
beyond a sketch. A fresh agent continues from § "What is left".

Paths are under `src/pages/mushrooms/` unless they say otherwise. Line
numbers are at 389144e.

## 1. The map

### The stored shape

`Ground = {x, z}` (`model/ground.ts:17`), `FlowerFoot = Ground & Scaled`
(`:23`), `Rooted = { foot: FlowerFoot }` (`:25`). Every stored position is
one of these:

- **Mushrooms:** `Footed = { foot: Ground }` (`model/placement.ts:23`),
  `Planted = Mushroom & Housed & Footed` (`model/game.ts:42`); the opening
  feet `OPENING_FEET` (`model/placement.ts:17-20`) and `firstMeadow`
  (`model/game.ts:117-122`); the `grow` action's `Footed` (`model/game.ts:88`).
- **Flowers:** `Sown`/`RootedFlower` (`model/pollen.ts:34`); `Planting`'s
  foot (`model/game.ts:57`), the `tuft`, `flower` and `sow` actions
  (`model/game.ts:94-100`), `withSown` (`:165-170`).
- **Identity by exact equality:** `openingIndex`
  (`model/placement.ts:26-31`, `x === … && z === …`), `sameFoot`
  (`model/game.ts:237-238`). Both break under any round trip through the
  plane, so they must compare the stored plane points, never a converted
  pair.
- **Derived feet stored nowhere but computed in `z`:** `RING_SLOTS`
  (`ui/scene/flower-plots.ts:38-57`, offsets in `{x, z}` × parent size) and
  `ringFoot` (`:85-93`); the seeded bed's feet, recovered from layout px by
  `groundOf` (`ui/scene/flower-plots.ts:195`, `ui/scene/flower-layout.ts:131-137`);
  tufts' feet, `tuftFoot` (`ui/scene/tufts.ts:115-117`) and `leaveTufts`'s
  `{x, z}` copy (`:243-244`).

### Readers of `z` (what step 0 converts)

| File:line                                                     | What it does with `z`                                                                                                                                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model/ground.ts:136,160,251`                                 | `seen`, `project`, `planeOf` — the layout's own maps                                                                                                                                                                            |
| `model/placement.ts:47-50,62-69,88-110`                       | `apartOnScreen` (via `seen`), `drawnFoot`, `pickFoot`'s candidates over `Frame`                                                                                                                                                 |
| `ui/scene/view.ts:58,80-87`                                   | `D_SEE` from `zAt(0)`; `ofGround` takes `planeOf(foot)` and the opening distance `CLUMP_DISTANCE / scaleAt(foot.z)`                                                                                                             |
| `ui/scene/bed-place.ts:59,124`                                | `bedPlace`, `viewedOrLaid` take `Ground`                                                                                                                                                                                        |
| `ui/scene/clump-layout.ts:52-60,79-86,111-122,129-136`        | `standOn`/`placeOf` via `project`; splay by `foot.x` sign; `placeIn` drops a foot outside the opening world; `extremes`                                                                                                         |
| `ui/scene/flower-layout.ts:125-137,165-227,322-355`           | `standingOn`/`groundOf`; `clearOfFeet`, `headsApart`, `headClear` (all `scaleAt(z)` and `leastRise(Δz)`); `spotOn`                                                                                                              |
| `ui/scene/flower-plots.ts:69-71,101-116,123-130`              | the flowers' band `FLOWER_DEPTH` in `z`; `groundFor`; `mushroomFeet` via `groundOf`                                                                                                                                             |
| `ui/scene/mushroom-patch.ts:79-82,156,333`                    | `patchFloor` by `scaleAt(foot.z)`                                                                                                                                                                                               |
| `ui/scene/repaint-queue.ts:50-54`                             | haze from `project(camera, {x:0, z})`                                                                                                                                                                                           |
| `ui/scene/view-inverse.ts:31-40`                              | `groundOfLayout`, `groundUnder` return `Ground`                                                                                                                                                                                 |
| `ui/scene/mushroom-room.ts:172-185,240-289,292`               | `trialOn`, `roomFor`, `fitsView`, `Found`                                                                                                                                                                                       |
| `ui/scene/arrivals.ts:79`                                     | `roomNow(): Ground`                                                                                                                                                                                                             |
| `ui/scene/layout.ts:164-171`                                  | the bed cache key spells `foot.z`                                                                                                                                                                                               |
| `ui/scene/flower-hold.ts:16`, `ui/scene/tufts.ts:213,371,376` | `FlowerFoot` in signatures                                                                                                                                                                                                      |
| `scripts/lib/play-approach.ts:124,133`                        | the probe's foot schema `{x, z}`                                                                                                                                                                                                |
| tests                                                         | `model/ground.test.ts`, `model/placement.test.ts`, `model/planting.test.ts:29`, `ui/scene/flower-hold.test.ts:8`, `ui/scene/flower-layout.test.ts:69`, `ui/scene/bed-place.test.ts:26`, `ui/scene/insect-seat.test.ts:24,34,67` |

### `GLADE` and the rim

- `model/stride.ts:30-36` (`GLADE`, `RIM_KEEP`, `REACH`), `:103-178`
  (`fromCentre`, `onRim`, `toRim`, `meeting`, `roomAhead`, `walk`,
  `inGlade`), `:181` (`standingAt` clamps into the glade), `:268-281`
  (`chaseRoom`), `:295` (`keyed`'s room), module doc `:9-12`.
- `model/walk.ts:101` (`standingAt(OPENING_EYE)` — keeps working).
- `model/stride.test.ts:10,17,26,53-56,95-137,189-194,223,275-305`.
- `scripts/lib/play-walk.ts:24,93,156-163,188` — "↓ held 12 s rests at the
  rim" and the `fromMiddle` check.
- `model/cruise.ts:32` already takes `Infinity` for "no end", so the rim's
  removal is `room: () => Infinity` and `walk` = `plus(at, way, length)`;
  `chaseRoom` reduces to `left` (or `Infinity` when `left ≤ 0`).

### Rules judged at the opening eye

All of these read layout px (`placeOf`, `standingOn`, `layout.flowers`), so
each is the opening eye's judgement:

- `roomFor` (`ui/scene/mushroom-room.ts:240-273`): `MeadowLayout`'s
  `mushrooms.frame` for candidates, `layoutShown(view)` (`ui/scene/eye-crop.ts:117-127`)
  for the span, world edges (`:83`, `:180`), `partsInView`/`doorsKept`
  (`ui/scene/standing-weighed.ts`), `keepsPatches` (`ui/scene/mushroom-patch.ts`).
  `layoutShown` is `undefined` facing the plane's back (`eye-crop.ts:111-116`),
  which is today's "nuh-uh" facing away.
- The flowers: `groundFor` (`ui/scene/flower-plots.ts:101-116`),
  `flowerInSight`'s world-edge test (`ui/scene/flower-sight.ts:260-266`),
  `plantable`/`roomIn` (`:328-370`), the bees' `roomFor` (`:377-394`),
  `coversOn` (`:295-315`, keyed per layout).
- The lawn: `grownTuft` over the whole world (`ui/scene/tufts.ts:120-127`),
  `mostTufts` = world px / 1000 × 52 (`:189-191`), `bareToTap` (`:138-169`),
  `plantableIn` (`:177-186`), `tendTufts` (`:258-260`), `Grass.paint`
  regrowing per layout (`:351-359`). `tufts.ts` is at 433 lines.

## 3. The design (the parts settled)

### The opening-eye rules move to the current eye by re-anchoring

**`viewOf` is invariant under a rigid motion of eye and point together**:
it reads only `dx`, `dy` and `heading` (`model/ground.ts:299-318`). So for an
eye `E = {x, y, heading}`, the plane point `p` is seen from `E` exactly as
`p_E = R(−heading)·(p − E)` is seen from `OPENING_EYE`, and every rule that
reads the opening layout can be run unchanged on **the layout anchored at
`E`**: `p_E`, then `planeOf`'s inverse — `gathered` (`:236-238`), then
`z = zOf(CLUMP_DISTANCE / |gathered|)` from `scaleAt`'s inverse — gives the
`Ground` the rules already speak.

- **Where it is defined:** `gathered` has an image with `y > 0` while
  `|azimuth| < π·SPREAD/2`. `SPREAD` (`:220`) = 2π·170.56·8.64/(4·1180) ≈
  **1.962**, so that is ±3.08 rad: everything but a 0.12 rad sliver straight
  behind the eye. The rules then judge what the eye sees as the opening eye
  judged the opening crop.
- **What it buys:** `roomFor`, the patch rules, `plantableIn`, `groundFor`,
  `bareToTap` and `headClear` keep their code; only their inputs are
  re-anchored. `+` works "anywhere in front of the child" because the
  candidates are `pickFoot`'s over `MEADOW_FRAME` in the anchored layout,
  converted back by `p = E + R(heading)·planeOf(g)`.
- **What it costs:** a rule's answer depends on the eye. A flower planted
  from one eye may crowd a head as seen from another. This is "judged where
  the child stands" (the plan's call) and is accepted, not fixed.
- **The anchor is not the current eye to the float.** `keptRoom`
  (`ui/scene/mushroom-room.ts:317-337`) keeps a room while it `fits` the
  view; re-anchoring every frame would cost a search per step. The anchor
  should be the eye snapped (position to 0.5 clump units, heading to the
  same angle a 0.5 unit step subtends at `D_SEE`, ≈ 0.04 rad) so the
  anchored layout, and every rule cached on it, changes a few times a
  second while walking, not every frame. _Unmeasured_ — the next agent
  times `roomFor` and `tendTufts` on one anchored layout before fixing the
  snap.

### Step 0: the store becomes the plane, alone

- `model/ground.ts`: stored feet become `Point` (plane); `FlowerFoot =
Point & Scaled`; `Rooted` unchanged in name. `Ground {x, z}` stays as the
  **layout's** type, read only by the rules, never stored. New
  `groundOfPlane(point): Ground` (`planeOf`'s inverse) and
  `anchored(eye, point): Point` / `unanchored(eye, point): Point`.
- `OPENING_FEET` becomes `planeOf` of today's two `Ground`s, computed once;
  `openingIndex` and `sameFoot` compare plane points by `===` on the stored
  numbers (never after a conversion).
- `RING_SLOTS` stay offsets in `Ground` from the parent's **anchored**
  ground, so a ring round a seeded flower lands where it lands today.
- Every reader in the table above converts at its entry with
  `groundOfPlane` (step 0 anchors at `OPENING_EYE` only); `ofGround` and
  `bedPlace` take the plane point directly, the opening distance becoming
  `|gathered(p)|`.
- **What proves the opening frame exact:** the existing opening-identity
  tests run unchanged in meaning — `model/ground.test.ts`'s
  `viewOf(OPENING_EYE)` vs `project` sweep, `ui/scene/bed-place.test.ts`,
  `ui/scene/view.test.ts`, `ui/scene/insect-seat.test.ts` — with their
  fixtures built through `planeOf`. Add one: for every `Ground` the sweep
  draws, `groundOfPlane(planeOf(g))` equals `g` within 1e-9, and
  `ui/scene/layout.test.ts`/`flower-layout.test.ts`'s seeded beds are
  bit-for-bit the same feet after the round trip (they are computed in
  `Ground` and stored as `planeOf`, so only the conversion's rounding can
  differ, and it never reaches a comparison).
- `scripts/lib/play-approach.ts:124,133` changes its schema to `{x, y}` in
  the same commit, since it type-checks against the probe.

### The rim goes

- `model/stride.ts`: `GLADE`, `RIM_KEEP`, `REACH`, `fromCentre`, `onRim`,
  `toRim`, `meeting`, `walk`'s slide and `inGlade` go; `roomAhead` returns
  `Infinity`; `chaseRoom` returns the chase's `left` (or `Infinity`);
  `standingAt` stands where asked. `model/stride.test.ts`'s rim cases go;
  "never walks faster than its cruise" stays.
- `scripts/lib/play-walk.ts:156-163`: "↓ held 12 s rests at the rim" goes;
  in its place "↓ held 12 s walks back `STRIDE_CRUISE` × (12 − eased)
  units, ±0.05".

## 4. Packages (sketch — not checked for disjointness past step 0)

- **Step 0** (alone, first): `model/ground.ts`, `model/placement.ts`,
  `model/game.ts`, `model/pollen.ts`, every `ui/scene/` reader in § 1's
  table, `scripts/lib/play-approach.ts`, and their tests.
- **R — the rim and the clear-outs:** `model/stride.ts`,
  `model/stride.test.ts`, `model/motion.ts` (`rebloom`), `ui/scene/sun-layout.ts`
  (`nearestTheSun`/`acrossFromSun`), `ui/scene/meadow-rules.test.ts`,
  `ui/scene/visit-play.ts` (`openingCrop`). Not yet read: confirm each.
- **S — sowing anywhere:** `ui/scene/mushroom-room.ts`, `ui/scene/eye-crop.ts`,
  `ui/scene/mushroom-patch.ts`, `ui/scene/clump-layout.ts`, `ui/scene/arrivals.ts`,
  `model/game.ts` (the per-area cap) — the anchored layout.
- **L — the lawn by cells:** `ui/scene/tufts.ts` (split first: 433 lines),
  `ui/scene/grass.ts`, `ui/scene/flower-plots.ts`, `ui/scene/flower-sight.ts`.
  Depends on S's anchoring helper if it lives in `ui/scene/`; put it in
  `model/ground.ts` at step 0 instead, and S and L are independent.
- **I — insects, P — light and mottles, play:** not specced.

## 5. Risks found so far

- **`placeIn` drops every foot outside the opening world**
  (`ui/scene/clump-layout.ts:111-122`), and `coversOn`, `mushroomFeet` and
  `bareToTap` all go through it. A mushroom grown behind the opening eye is
  invisible to every flower and tuft rule until they read the anchored
  layout. Step 0 must not change this (it holds the opening exact); S and L
  must both replace it, or a walked-to forest lets flowers grow through its
  feet.
- **The flowers' band is a `z` band** (`ui/scene/flower-plots.ts:69-71,106-109`):
  anchored, it means "a flower may be planted only between 0.12 and 0.96 of
  the ground's depth from where the child stands". Bee rings round a far
  flower fail it. Options: keep it anchored (bees plant only in view —
  today's rule), or drop it for planted flowers. The plan does not say.
- **Splay by `foot.x` sign** (`ui/scene/clump-layout.ts:83`): on the plane
  it is the sign of plane `x`, fixed for a mushroom's life — stable, but a
  mushroom grown behind the opening eye leans toward the eye's line as
  often as away. Accepted unless the operator objects.
- **Exact identity across conversion** (`openingIndex`, `sameFoot`): any
  `planeOf`/`groundOfPlane` round trip before an `===` breaks it silently.

§ 2 (the insects) is `spec-insects.md`'s, written in parallel.

## 6. `follow`'s cost at 96 (measured)

Node micro-benchmark at c396659 (tabL 1180×820, unit 170.56 px, world
2163 px; Phaser stubbed; median of 400 runs; not committed):

| What                                                     | Per thing                    | At 96 / 112 / 400                     |
| -------------------------------------------------------- | ---------------------------- | ------------------------------------- |
| a mushroom's `bedPlace` + `hazeAhead` (`follow`'s math)  | 0.46 µs                      | 0.045 ms at 96                        |
| a flower's `bedPlace`                                    | 0.39 µs                      | 0.15 ms at 400                        |
| `shownSprouts` (today's 112 tufts)                       | 0.40 µs                      | 0.044 ms                              |
| `drawMushroom` recorded (= one repaint's JS)             | 0.71 ms                      | 2 a frame: 1.4 ms                     |
| Earcut of one mushroom's 39 fills, 2715 pts, 1 px detail | 0.23–0.52 ms (zoom 0.35–1.5) | **every drawn mushroom, every frame** |

**`follow` itself is not the risk: 0.05 ms at 96.** The risk is Phaser 4
re-tessellating every _visible_ Graphics every frame
(`GraphicsWebGLRenderer.js` → `FillPath.js` runs `Earcut` per fill path; no
bounds culling, `GameObject.willRender` reads only flags). `bedPlace`'s
`drawn` hides only `cull` (`ahead < V_NEAR`) and `sunkAway`, so **a mushroom
behind the eye within D_SEE is drawn off the screen**: at azimuth π,
`bend = hypot(1, π/SPREAD)` = 1.89, `ahead` = 13.33/1.89 = 7.07 > `V_NEAR`
5.01. Today the 12 all stand in front, so it never showed.

How many are drawn: a Monte Carlo of 96 feet sown under the area cap (≤ 12
within `D_SEE` of a new foot, feet ≥ 1.0 apart) in squares 15–60 units wide,
400 eyes each: **at most 36 drawn, at most 19 on a tabL screen** (± 45°
plus a cap's overhang). Uncapped random 96 in a 14.5 disc: 77 drawn, 33 on
screen. The densest case is the small square (two clusters of 12); the
field-wide 96 never bounds it — a 60-unit square gives at most 22 drawn.

Against the budget: the 12-mushroom walk measured 19.7 ms median
(`bite-12/play-final2.md`), of which ~12 × 0.45 ≈ 5.4 ms is Earcut. At 36
drawn: +24 × 0.45 ≈ **+11 ms → ~31 ms, over 26**. With the off-screen ones
hidden, 19 on screen: +7 × 0.45 ≈ **+3 ms → ~23 ms, inside**.

**Verdict: keep 96; the median holds only if `bedPlace` hides what stands
off the screen's sides** (azimuth past the half-screen plus `BLADE_OVERHANG`-
style overhang by the thing's drawn size, as `shownSprouts` already does) —
a step in package S. A lower field ceiling buys nothing: what the screen
draws is bounded by the per-area cap, not the field's. The play package's
approach run is re-aimed at the dense case (24 sown within 15 units, walked
into and turned at) to measure it. Flowers carry the same per-frame Earcut
(stem and head Graphics per `Container`) and have **no cap at all**: the
side cull bounds what is drawn, and `follow`/`update` iterate every flower
on the field (0.39 µs each, fine to ~10⁴).

## 7. The lawn by plane cells

**`tufts.ts` splits first** (433 lines), no behaviour change: `tuft-tap.ts`
(`TUFT_REACH`, `tuftReach`, `tuftAt`, `bareToTap`, `middleOf`) and
`tufts.ts` (growth, `plantableIn`, `tendTufts`, `leaveTufts`,
`shownSprouts`, `Grass`). Tests follow their functions.

- **Density, from today:** 112 tufts (`mostTufts`, world 2163 px) on the
  opening world's ground: azimuth ± 1.24 rad (half-world 1081 px over focal
  1473.6 px, × SPREAD), distance 7.87–12.96 (`GROWN_DOWN` ^ `BACK_BUNCH`) →
  131.7 unit² → **0.85 tufts per unit²**. Today's lawn is ~1.75× denser
  per plane area near (8 units) than far (12.9); a plane-uniform lawn shows
  the near grass a little sparser than today's opening.
- **Cell: a 4 × 4 square of the plane**, ~13.6 tufts each (Poisson-free:
  exactly `round(0.85 × 16)` = 14, positions uniform in the cell), drawn
  from `mulberry32(hash(visitSeed, i, j))` — a cell's grass is a pure
  function of its index, so a walk back finds it. 2-unit cells mean ~200
  live cells of 3–4 tufts; 4 units means ~60 of 14.
- **Live cells:** those within `D_SEE` + `PALE_SPAN` (1.2) + a cell's
  diagonal (5.66) of the eye: ~60 cells, **~800 tufts**; a frame draws
  those `shownSprouts` passes (~70 on tabL, as today). Cells enter and leave
  by the eye's cell, so the set changes when the eye crosses a cell line.
- **Opening identity breaks for tufts** (not for the clump or the seeded
  flowers): the opening lawn is no longer `growTufts`' stream. Accepted by
  the plan's "the grass is the field's"; `tufts.test.ts`' stream-identity
  cases are rewritten against cells.
- **Judged from the current eye:** `plantableIn(stand)` is built on the
  anchored layout (§ 3) and asked only of tufts the eye can see (live cells
  inside ± 3.08 rad); `leaveTufts` stores plane feet.
- **Cost (measured):** `tendTufts` over today's 112 takes **4.5 ms** on the
  opening, **10.6 ms** in a 12-mushroom forest (40–95 µs a tuft, mostly
  `bareToTap`'s 9 tap points per mushroom target and `headClear` over every
  standing flower); `roomFor` 4.0 / 12.8 ms. Over 800 live tufts that is
  **32–76 ms per tend — a dropped frame or four each time.** So: tend only
  the tufts in the view's sector plus one screen either side (~3 × 70), on
  a cell entering it or a change near it (a flower, a mushroom); and
  `plantableIn`'s `standing` flowers and mushroom targets are those within
  `D_SEE` + reach of the eye, never the whole field (otherwise O(field ×
  tufts)).

## 8. Light by heading, and mottles

- Today's light is screen-fixed: `sunLight` (`model/light.ts:18-28`) from
  the ground's middle to the sun's layout point, and `lightAt`
  (`ui/scene/mushroom-light.ts:35-40`) per thing at paint. By heading, the
  `toward.x` a thing is painted with becomes `sin(α_sun − heading)` (the
  sun's azimuth off the heading; the plan's `sin(heading − α_sun)` with the
  sign `toward` uses), `toward.y` from the sun's height, unchanged.
- **Through the queue:** `Hazing` (`repaint-queue.ts:58`) gains the light it
  was painted at; `repaintsDue` takes a thing whose haze **or** side drifts
  past its threshold (side: 0.1 of `sideways`' `FULL_SIDE` 0.6 is a visible
  step), nearest first, `REPAINTS_PER_FRAME` 2. A full turn drifts every
  mushroom's side at once: 19 on screen at 2 a frame clear in 10 frames
  (0.17 s); 36 drawn in 18. Flowers carry their light in `flowerLight`
  (`mushroom-light.ts:69`) and join the same queue. 2 × 0.71 ms repaint =
  1.4 ms a frame while turning, inside the estimate above.
- **Mottles as plane objects, from the lawn's cells:** each cell's seed also
  draws its mottles (a few per cell), stored as plane points and drawn by
  `bedPlace` like tufts, flat on the ground under them. `grain.ts` (63
  lines) keeps the screen-fixed grain.

## 9. The clear-outs

- **`GLADE` and the rim:** § 3 "The rim goes".
- **`nearestTheSun`/`acrossFromSun`** (`sun-layout.ts:225-247`): their only
  reader is `meadow-rules.test.ts:35,213` ("out of the wash"), which asks
  whether any pan of the opening world brings a foot under the wash. On the
  endless field the sun stands at its azimuth on the sky and every foot
  stands on the ground below the brow; `washReach` (`:259-268`) already
  bounds the wash above the farthest foot from every eye. **Recommend: both
  go and the rule goes**, replaced by `washReach`'s own test that the wash's
  outer ring stays above `browLowest` less the farthest place's
  `WASH_FOOT_CLEAR` (`sun-layout.test.ts`).
- **`openingCrop`** (`visit-play.ts:38-40`): readers
  `mushroom-patch.test.ts:16,37`, `layout.test.ts:46,103`,
  `meadow-rules.test.ts:39,79,119`, `scripts/sweep-mushrooms.ts:34,87`.
  Each becomes `viewAt(layout.camera, OPENING_EYE)` inline.
- **`rebloom`** (`model/motion.ts:109-121`, `BLOOM_WIDEST` `:95-102` if
  nothing else reads it): reader only `motion.test.ts:28,77-85`. Both go.

## 10. The package cut

**Step 0, alone:** as § 3 "Step 0", files: `model/ground.ts`,
`model/placement.ts`, `model/game.ts`, `model/pollen.ts`, § 1's table's
`ui/scene/` readers, `scripts/lib/play-approach.ts`, and their tests. It
also adds `lean: -1 | 1` to `Planted` (the side of the growing eye, the
plan's lean call; the opening pair keeps `CLUMP_SPLAY`'s), since it changes
the store.

After step 0, these lists are disjoint (checked by name; a file not listed
is no package's):

- **R — rim and clear-outs:** `model/stride.ts`, `model/stride.test.ts`,
  `model/motion.ts`, `model/motion.test.ts`, `ui/scene/sun-layout.ts`,
  `ui/scene/sun-layout.test.ts`, `ui/scene/meadow-rules.test.ts`,
  `ui/scene/visit-play.ts`, `ui/scene/mushroom-patch.test.ts`,
  `ui/scene/layout.test.ts`. Steps: R1 rim; R2 wash rule; R3 `openingCrop`
  and `rebloom`.
- **S — sowing anywhere and the bed's cull:** `ui/scene/mushroom-room.ts`,
  `ui/scene/eye-crop.ts`, `ui/scene/mushroom-patch.ts`,
  `ui/scene/clump-layout.ts`, `ui/scene/arrivals.ts`,
  `ui/scene/bed-place.ts`, `ui/scene/mushroom-bed.ts`, `ui/scene/view.ts`
  and their tests. Steps: S1 the side cull (§ 6); S2 the anchored layout
  and `placeIn` on it; S3 `roomFor`/patches from the current eye and the
  per-area cap. **`model/game.ts` (the 96 cap) is S's** — no other package
  touches it after step 0.
- **L — the lawn:** `ui/scene/tufts.ts` (+ the new `tuft-tap.ts`),
  `ui/scene/grass.ts`, `ui/scene/flower-plots.ts`, `ui/scene/flower-sight.ts`,
  `ui/scene/flower-bed.ts`, their tests. Steps: L1 split; L2 cells; L3
  judged from the current eye and the bee ring with no band. Needs S2's
  anchoring helper: it lives in `model/ground.ts` from step 0, so L runs
  beside S.
- **P — light and mottles:** `model/light.ts`, `ui/scene/mushroom-light.ts`,
  `ui/scene/repaint-queue.ts`, `ui/scene/grain.ts`, their tests. P2
  (mottles from cells) waits for L2. **Conflict:** P's queue change is read
  by `mushroom-bed.ts` (S); P adds the light to `Hazing` and S1 lands
  first, then P edits `mushroom-bed.ts` in a step of its own after S.
- **I — insects:** `spec-insects.md`'s. Expected to own
  `ui/scene/insect-*.ts`, `ui/scene/perch-*.ts`, `ui/scene/perches.ts`,
  `model/flight*.ts`, `model/insect-*.ts`; others avoid them.
- **Play (scripts/ only, beside the waves):** `scripts/lib/play-walk.ts`
  (§ 3), `scripts/lib/play-approach.ts` after step 0 (the dense-forest
  approach, § 6), `scripts/sweep-mushrooms.ts` (R3's `openingCrop`).

Hand checks for `to-check.md`:

1. Уйди далеко от стартовых грибов — трава есть везде, а вернёшься — та же.
2. Посади гриб за спиной у стартового места — цветы и трава его обходят.
3. Повернись кругом — грибы светятся с той стороны, где солнце.
4. Посади 12 грибов в одном месте — 13-й не растёт, а дальше в поле растёт.
5. Иди в густой лес и крутись — картинка не тормозит.

## 11. Where the calls cannot hold as written

- **"Laid out once at the opening eye" has no layout behind it.**
  `layoutOfPlane`/`gathered` return nothing at `y ≤ 0`, so a mushroom or
  flower grown behind the opening eye has no laid px to paint at. Options:
  lay each thing out at the clump's distance in its own frame
  (`opening = CLUMP_DISTANCE`, size by genes) — one paint, no repaint on a
  re-anchor; or lay out at the current anchor — a re-anchor repaints all
  (0.71 ms × 36 = 26 ms spike). Recommend the first; the opening clump and
  seeded flowers keep their opening layout.
- **The 96 ceiling does not bound the frame** (§ 6); the side cull does.
- **"Rules from the current eye" are O(field)** unless `plantableIn` and
  `roomFor` read only what stands within reach of the eye (§ 7).
- **Flowers have no cap**; with the side cull none is needed for the frame,
  but bee rings keep planting on an endless field. Unmeasured past 400.
- **Unmeasured:** the anchor's snap (§ 3) — `roomFor` 4–13 ms and a tend
  of ~210 tufts 9–20 ms per snap say a snap a few times a second while
  walking costs no median, only an occasional long frame.
