# Bite 12b — the endless field (spec, partial)

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

## What is left

1. § 2, the insects: read `ui/scene/insect-view.ts`, `insect-away.ts`,
   `insect-shown.ts`, `perch-sight.ts`, `perches.ts`, `model/flight-frame.ts`,
   `model/flight-in.ts` and state what endless-field.md § "The insects on the
   plane" already has.
2. `follow`'s per-frame cost at 96 mushrooms plus flowers, from
   `mushroom-bed.ts`/`flower-bed.ts`/`bed-place.ts`, against the 26 ms median.
3. The lawn's cell size, seed per cell, live cells (derive from
   `mostTufts`' density and `D_SEE` ≈ 13.33), and `tendTufts`' cost on an
   anchored layout.
4. Light by heading (`repaint-queue.ts`, `model/light.ts`), mottles
   (`grain.ts`), `nearestTheSun`/`acrossFromSun`, `openingCrop`, `rebloom`.
5. The package cut checked file by file, the play package, and the
   `to-check.md` hand checks.
