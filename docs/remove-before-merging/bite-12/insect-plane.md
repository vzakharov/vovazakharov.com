# insect-plane — spec (research package, unfinished)

The plan's decision (`lens-carry.md` round 3): an insect's points are plane
points, and its drawn size is its own size over its distance from the eye.
This note says how to build it. Round 1 (§1–§4, Open, Left) set the model;
**§ "Round 2" supersedes it where they differ**: the gaze is the leg's
frame (R2.1), and Open 1 is decided, option (a).

## 1. The model: where an insect is

- **`Aloft = Point & { h: number }`**: a plane point (the clump's size, the
  plane `viewOf` takes) and a height over it, same units. Resize-invariant by
  construction, so `toUnits`/`fromUnits` and `Stage`'s `world`/`unit` drop out
  of the leg's start.
- **The gaze**, the 2-D space `steer` runs in: for a view, `x = arc ·
azimuth` (absolute plane azimuth from the eye, not off its heading),
  `y = pinhole.y + (EYE_HEIGHT − h) · focal / d` (the row before `bendAt`
  bends it). Turning the eye leaves every gaze point where it is, so `steer`'s
  drift and facing see nothing when the child turns; walking moves them by
  true parallax. Each leg's points are unwrapped about the leg's start
  (`ref + arc · wrapped((x − ref)/arc)`), and every point keeps last frame's
  branch (`new = last + wrapped(raw − last)`), so a leg never flips round
  the eye when the eye walks across its line.
- **Depth along a leg**: `1/d` mixed straight by `flown` (`alongOf`, kept),
  `d` the distance from the eye. This is today's row mix at the opening eye
  (a row is linear in `1/opening`) and never dips through the eye.
- **Back to the world**: gaze point + `d` → `Aloft` (azimuth `x/arc`, the
  plane point `d` along it, `h` from `y`). **Drawn**: `viewOf(view, eye,
plane, h)`, `zoom = CLUMP_DISTANCE / ahead`, sunk by the ground point under
  it (`sunkOver` with `viewOf(plane, 0)`), hidden at `ahead ≤ 0` or
  `buried`. Prototype: `<scratchpad>/ip/proto.mts`.
- `steer`'s `size` is the insect's size times the zoom the `1/d` mix gives
  at last frame's `flown` (its flutter and thresholds scale with how big it
  is drawn). `steer`, `flightPoint`, the model's timing, cruise, perch
  choice, `Places`, `onscreenOf`, crowding and the air grid's ids are
  unchanged: the model keeps layout units.

## 2. Module by module

| module                                                               | today                                                                                                                               | becomes                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `view.ts`                                                            | `ofLayout`, `layoutOfPlane`, `rowAt` place a layout point over a row; `placedAt` zoom `opening/ahead`                               | adds `gazeOf`, `aloftAt`, `drawnAloft` (or a new `insect-gaze.ts`, ~80 lines, to keep `view.ts` the meadow's); `ofLayout` stays for beds                                                                                                                                                                                                                                                                                                       |
| `insect-away.ts`                                                     | `drawnAt`/`flownAt` over a row; `entry` via `groundAlong` → layout, `groundNear`, `pastEnd` fallback; `offScreen` via `layoutAtRow` | `entry` returns `Aloft`s: start `alongSight(x, D_SEE + PAST_BROW)`, `h 0` — always defined, so **`groundNear` and the `pastEnd` fallback go**; `out` `offScreen` at `OUT_AHEAD · D_SEE`; `offScreen(view, side, away, d)` = the screen point past the edge at `drop`, back to an `Aloft` at distance `d` (always defined: **`pastEnd` goes** from insects); `toUnits`/`fromUnits`, `OverRow` go; `reachesScreen`, `PAST_BROW`, `awayDown` stay |
| `insect-seat.ts`                                                     | sitting: `onSeat` at host zoom; flying: `drawnAt` plus `offHost` carry blend                                                        | sitting: the host's drawn seat, insect at `CLUMP_DISTANCE / host.stands.ahead`; flying: `drawnAloft`. The end of a leg _is_ the host's drawn seat (screen → gaze each frame, `d` the host's `distance`), so the `offHost` blend goes; the start is a fixed `Aloft` taken where it was drawn                                                                                                                                                    |
| `insect-view.ts`                                                     | `from` in units, `fromRow`/`row` mix, `seated` layout point                                                                         | `from: Aloft`, `fromD`; the `row` fields become distances; steering in gaze; no `View                                                                                                                                                                                                                                                                                                                                                          | undefined`(before the first fit,`viewAt(camera, OPENING_EYE)`, which is what the eye fits to) |
| `insect-shown.ts`                                                    | `OverRow`, `fromRow`, `from` units                                                                                                  | `Aloft`/distance fields, same shape otherwise                                                                                                                                                                                                                                                                                                                                                                                                  |
| `perch-hosts.ts`, `mushroom-bed.capTop`, `flower-bed.seat`           | `Perched` layout point + `on` host                                                                                                  | `Perched` gains the seat as the host draws it on the screen; a flower's `flowerLift` splits into the host part (`disc`, at host zoom) and the insect part (`ABOVE_CENTRE · size` etc., at insect zoom) so legs stay on the head when the two zooms differ                                                                                                                                                                                      |
| air perches (`airSpots` → `Perches.air`)                             | layout point over `clumpRow`                                                                                                        | `Aloft` via `ofLayout`'s own construction over the clump's row (`spread` at `CLUMP_DISTANCE`, height `(clumpRow − y)·perPx`), fixed in the world                                                                                                                                                                                                                                                                                               |
| `perch-sight.ts` `footRows`, `clumpRow`                              | rows per perch for the flier's mix                                                                                                  | distance per perch from the eye, read each frame from `stands.distance` (bed hosts) or the `Aloft` (air) — `FootRows` goes                                                                                                                                                                                                                                                                                                                     |
| `insect-tap.ts`, `insect-look`, `insect-voices`                      | screen px                                                                                                                           | unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `flight*.ts`, `insect-steering.ts`, `insect-paths.ts`, `arrivals.ts` | model                                                                                                                               | unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                      |

`lens-carry-round3.patch` is obsolete (its edge-over-row start is replaced
by a plane start); `groundNear` and `pastEnd` go from the insect path;
`offScreen` survives in plane terms.

## 3. Checkable properties and their measures

1. **Facing the clump, against today** — `<scratchpad>/ip/facing.mts`
   (`WT=<worktree> node --import tsx ../ip/facing.mts`, `H=` headings):
   the perch-shown release, real `steer`, 60 fps, today vs the prototype, at
   the opening eye, heading 0. Drawn middle apart (px):

   | screen          | median | p95  | p99  | max   |
   | --------------- | ------ | ---- | ---- | ----- |
   | tablet          | 0.6    | 7.3  | 28.4 | 130.5 |
   | tablet portrait | 0.2    | 2.1  | 4.0  | 6.6   |
   | phone           | 0.1    | 1.0  | 2.0  | 8.3   |
   | phone sideways  | 0.6    | 9.4  | 33.7 | 101.8 |
   | small phone     | 0.1    | 0.8  | 1.6  | 6.8   |
   | desktop         | 1.2    | 17.7 | 83.7 | 224.2 |

   The wide screens' tails are not explained yet (§ "Open" 2). Proposed
   bound once explained: p99 ≤ 4 px, max ≤ 12 px.

2. **Size facing the clump changes by design** (§ "Open" 1): plane/today
   zoom 0.648–0.67 at the release's start (the brow), 0.648–1.48 at the
   perch, by `scaleAt(z)` of the perch's ground.
3. **Looking back** (headings π, π ± 0.035, every screen): a release with
   and without a perch shown drawn on ≥ 95% of 201 samples, start → `out`
   and start → perch; its zoom at landing equals the perched insect's
   (`CLUMP_DISTANCE / ahead` both, |Δ| < 1e-3). Measure to write:
   `lc/back-leg.mts` ported to `proto.mts` (not run).
4. **A perched insect tracks its cap**: drawn insect px / drawn cap px
   constant per host over an eye grid × headings (spread < 1e-9). Holds
   today too; the new property is (3)'s equality. Measure not written.

## 4. Packages (provisional)

- **Step 0 — the gaze** (`view.ts` or `insect-gaze.ts` + its test): `Aloft`,
  `gazeOf` with the branch-keeping unwrap, `aloftAt`, `drawnAloft`. Tests:
  `view.test.ts`, the new file. Nothing draws through it yet.
- **A — away and seat** (`insect-away.ts`, `insect-seat.ts`, their tests):
  `entry`/`offScreen` in `Aloft`, `drawnInsect` on gaze, `offHost` out.
  Re-runs `insect-away.test.ts`, `insect-seat.test.ts` (the "its own size at
  the opening" test is rewritten to `CLUMP_DISTANCE / ahead`).
- **B — perches** (`perch-hosts.ts`, `perches.ts`, `perch-sight.ts`
  `footRows`/air, `mushroom-bed.capTop`, `flower-bed.seat`, the lift split):
  re-runs `perch-sight.test.ts`, `flower-plots.test.ts`, `tufts.test.ts`,
  then `fliers.test.ts` alone (~6 min).
- **C — the view** (`insect-view.ts`, `insect-shown.ts`, `meadow-scene.ts`
  wiring): depends on A and B; play-check frames tabL / phoneP, looking back.

## Open — where the decision may not hold as worded

1. **Decided (a)**, with the operator (plan, cc06116b). **"Facing the clump nothing moves" vs "sized by distance".** Today every
   insect is drawn the same size at the opening eye whatever its depth
   (`insect-seat.test.ts` asserts it). Sized by distance, an insect on the
   back caps is 0.65× today's, on the front ones up to 1.11–1.48×, and a
   release comes over the brow at 0.65×. Positions can hold; sizes cannot.
   Options: (a) accept — the insect matches its cap and the brow, as the
   decision says; (b) size by the thing's distance from the plane's origin
   over `ahead` — today's sizes at the opening, no shrink looking back from
   it, but an insect near the origin seen from afar is drawn tiny against its
   cap and a release's zoom does not match a perched one's: beaten by
   property 3. The spec builds (a); the orchestrator confirms.
2. **Explained and fixed in R2.1.** **The wide-screen tails in (1)**: 101–224 px on tablet, sideways phone
   and desktop. Suspects: `steer`'s `size` changing frame to frame (the
   `1/d` zoom) moving its flutter and facing; the leg's bow measured on a
   gaze length that differs from the layout's off the middle (angle vs
   tangent). Re-run with `size` fixed to see which.
3. **Per frame**: not measured. By count the new path is cheaper (two
   `viewOf` and three `atan2`/`hypot` per insect, against today's up to six
   `ofLayout`, each a `spread` and a `viewOf`); a micro-benchmark against
   `drawnInsect` belongs with step 0. Budget 26 ms median
   (`scripts/lib/frame-budget.ts`).

## Round 2

Scratch scripts: `<scratchpad>/ip2/` (`proto.mts`, `facing.mts` with the
switches below), never committed. Sizes are option (a) throughout.

### R2.1 The facing tails: the bow's side, then the frame

**Cause: the leg's bow flips side, not its size.** Facing the clump, at
heading 0, `facing.mts` with each suspect switched off (p99 / max px; the
frame run is `MODE=tan CENTRE=clamp`, and on the tall screens gives
2.1 / 3.0, 0.3 / 1.4, 0.0 / 6.8):

| run                                          | tablet     | sideways phone | desktop     |
| -------------------------------------------- | ---------- | -------------- | ----------- |
| round 1's gaze                               | 28.4 / 130 | 33.7 / 102     | 83.7 / 224  |
| `size` fixed (`FIX`)                         | 28.3 / 130 | 33.7 / 102     | 82.6 / 220  |
| no flutter (`FLUT=0`)                        | 28.0 / 130 | 33.8 / 101     | 82.6 / 219  |
| no bow, no zigzag (`NOBOW`, `FIX`, `FLUT=0`) | 5.7 / 7.3  | —              | 12.3 / 15.2 |
| bow forced to today's side (`SAMEBOW`)       | 9.2 / 17.4 | 11.3 / 18.2    | 19.2 / 31.5 |
| **the leg's frame (below)**                  | 2.1 / 3.5  | 1.0 / 2.6      | 3.3 / 5.8   |

`steer`'s `setOffFor` picks the bow's side by the least body swing, against
the perch's rest facing and the seat's turn, which are fixed angles on the
points' axes. On 13 / 21 / 19 legs (of 426 / 455 / 409; 0–3 on the tall
screens) the two sides come out within a hair, and the gaze's slightly
different chord direction tips it: the leg then bows the other way, up to
`arc · chord` off. It is a tie today too: a 1 px shift of today's own start
flips 11–18 legs a screen. What is left with the side forced is the shape:
the gaze is linear in azimuth, the layout in its tangent (the opening crop's
pinhole: `x = focal · tan(θ)`, `θ` the gathered azimuth, up to 0.6 rad on
the sideways phone), so the same cubic bows differently off the middle.

**Fix: steer in the leg's frame — the layout, stood at the eye.** The
opening layout is a pinhole on `gathered(plane)` at the plane's origin,
looking at azimuth 0. The leg's frame is the same pinhole stood at the eye
and turned to a centre azimuth `c` fixed as the leg sets off:

- `θ = wrapped(azimuth − c) / SPREAD`, `q = d · cos θ`;
  `x = pin.x + focal · tan θ`, `y = pin.y + (EYE_HEIGHT − h) · focal / q`.
- Depth along the leg: `1/q` mixed straight by `flown`, `q` the forward
  distance in the frame — today's row mix exactly at the opening eye.
- Back: `θ = atan((x − pin.x)/focal)`, azimuth `c + SPREAD · θ`, `d = q / cos θ`,
  `h = EYE_HEIGHT − (y − pin.y) · q / focal`.
- **`c` is the eye's heading at set-off, clamped so both ends lie within
  `M` of it**: `c = clamp(heading, a_hi − M, a_lo + M)`, the ends' azimuths
  taken the short way round, `M = SPREAD · 0.9` (1.77 rad; `tan 0.9 = 1.26`
  at the frame's edge). A chord spans at most π, so `2M > π` always has room.
  Facing anything on the screen the clamp does not bite (the screen's
  half-width is at most 0.97 rad of azimuth, desktop), so at the opening the
  frame is today's layout and the leg is today's leg.
- The frame is fixed for the leg: turning the eye moves no framed point;
  walking moves them by true parallax, as round 1's gaze did. The frame's one
  singular line is `|θ| = π/2`, an azimuth `SPREAD · π/2` (176°) off `c`;
  the clamp keeps the ends 1.77 rad inside it, and R2.5 measures how close a
  walking eye brings a mid-leg point.

Its residual against today is the 1/q mix against today's row (equal at the
opening eye) and the 1–4 px of `sunkOver` and the zoom on `steer`'s flutter;
the 6.8 px max on the small phone is one bow tie (1 / 462), as it is in every
run. **The bound holds: p99 ≤ 4 px, max ≤ 12 px on every screen** (worst
desktop 3.3 / 5.8). Centring the frame on the leg's middle azimuth or its
start instead (heading-free) brings the flips back (p99 27 / 13 px on
tablet): the chord's direction against the fixed rest angles is what the
side turns on, so only the eye's own heading reproduces today. Round 1's
§1 gaze (`x = arc · azimuth`) is superseded by this frame; its
branch-keeping unwrap is not needed (the clamp keeps ends inside the frame).

## Left

Measures R2.2–R2.6 (looking back, the cap, the near pass, the frame cost),
then the packages firmed up.
