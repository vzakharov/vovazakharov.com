# insect-plane — spec (research package, firm)

The plan's decision (`lens-carry.md` round 3): an insect's points are plane
points, and its drawn size is its own size over its distance from the eye.
This note says how to build it. §1–§3 are the model and the properties it
holds, condensed from rounds 1–2; **§ "Round 3" is the build**: the veer
(R3.1), the cost (R3.2) and the packages (R3.3). Sizes are option (a)
throughout (decided with the operator, plan, cc06116b).

Units: plane lengths in the clump's size (`CLUMP_DISTANCE`, CD = 8.64 of
them, is the opening eye's distance to the clump); screen lengths in CSS px;
zoom as a ratio (×) to the insect's size at CD; insect speeds in butterfly
sizes a second.

## 1. The model (built in `insect-frame.ts`, `ip-frame.md`)

- **`Aloft = Point & { h }`**: a plane point and a height over it, both in
  the clump's size. Resize-invariant, so `toUnits`/`fromUnits` and `Stage`'s
  `world`/`unit` drop out of the insect path.
- **The leg's frame** (R2.1): the opening layout's pinhole stood at the eye
  and turned to a centre azimuth `c` fixed as the leg sets off.
  `θ = wrapped(azimuth − c) / SPREAD`, `forward = d · cos θ`,
  `x = middleOf(view) + focal · tan θ` (world px), `y = pin.y +
(EYE_HEIGHT − h) · focal / forward`; back by `atan`, `d = forward / cos θ`.
  `c` is the eye's heading at set-off clamped so both ends lie within
  `FRAME_MARGIN = SPREAD · 0.9` (1.77 rad) of it (`centreOf`). Facing anything
  on the screen the clamp does not bite, so at the opening eye the frame _is_
  the layout and the leg is today's leg. Turning the eye moves no framed
  point; walking moves them by true parallax.
- **Depth along a leg**: `1/forward` mixed straight by `flown` (`mixD`) —
  today's row mix at the opening eye, never nearer than the nearer end.
- **Drawn**: `drawnAloft(view, aloft)` — zoom `CD / ahead`, sunk by the
  ground under it, `undefined` at `ahead ≤ 0` or buried.
- `steer`'s `size` is the insect's size × the zoom `mixD` gives at last
  frame's `flown`. `steer`, `flightPoint`, perch choice, `onscreenOf`,
  crowding and the air grid's ids are unchanged: the model keeps layout units.

## 2. What it holds (rounds 1–2, measured on `ip2/` prototypes)

1. **Facing the clump, against today** (R2.1, heading 0, the perch-shown
   release, real `steer`, 60 fps): drawn middle apart p99 / max, px —
   tablet 2.1 / 3.5, tablet portrait 2.1 / 3.0, phone 0.3 / 1.4, sideways
   phone 1.0 / 2.6, small phone 0.0 / 6.8, desktop 3.3 / 5.8. **Bound: p99
   ≤ 4 px, max ≤ 12 px**. Round 1's angle gaze (`x = arc · azimuth`) missed it
   by up to 224 px: `steer`'s `setOffFor` picks the bow's side by a near-tie
   against fixed rest angles, and a gaze chord tipped 13–21 legs a screen to
   the other side; only the eye's own heading as the frame's centre
   reproduces today's sides. The 6.8 px is one bow tie (1 of 462 legs).
2. **Sizes change by design**: plane / today's zoom 0.648 at the brow to
   1.48 at the front caps facing the clump.
3. **Looking back holds** (R2.2, straight legs; R3.1 for bowed ones): a
   release start → out and start → a shown perch drawn on 200 of 201
   samples (the one is the start, under the brow by design); zoom at landing
   equals the perched insect's, |Δ| ≤ 2.2e-16.
4. **A perched insect tracks its cap** (R2.3, 33 600 samples): its zoom over
   its cap's is constant per host to 3.6e-16 — `CD / the host's opening
distance`, 0.648 at the brow to 1.72 at `V_NEAR`.
5. **Pace** (R2.4): a leg's time is its length at its kind's cruise,
   measured in sizes as drawn where it flies — built by `ip-pace` (R3.3).

## Round 3

Prototype: `ip-measures.patch` (`git apply`, adds `ip3/`: `proto.ts`,
`legs.ts` — a leg flown by the real `steer` at 60 fps — `world.ts`,
`veer.ts`, `back.ts`, `bench.ts`; `node --import tsx <file>` from `ip3/`).
Never source. Leg time in the prototype: its length in the set-off frame in
drawn butterfly sizes at the cruise (butterfly 1, fly 7, bee 4.6 sizes/s),
≥ 0.3 s.

### R3.1 The veer — decided

**Each frame's `Aloft` is pushed radially out on the plane from the eye**
(`veered`): untouched past `R_V + w`, at `R_V` inside `R_V − w`, on the C¹
parabola `R_V + (d − R_V + w)² / 4w` between, azimuth and height kept.

**Decision (orchestrator, from the numbers below)**:

- **`R_V = V_NEAR · bendAt(pinholeOf(view), 0)`**, the bend at the screen's
  edge, constant per screen, so a veered insect's zoom is ≤ 1.72× (the
  nearest drawn mushroom's) anywhere on the screen, edge included:

  | screen          | bend at the edge | R_V (CD) | R_V (clump sizes) |
  | --------------- | ---------------- | -------- | ----------------- |
  | tablet          | 1.077            | 0.625    | 5.40              |
  | tablet portrait | 1.013            | 0.588    | 5.08              |
  | phone           | 1.014            | 0.588    | 5.08              |
  | phone sideways  | 1.167            | 0.677    | 5.85              |
  | small phone     | 1.015            | 0.589    | 5.09              |
  | desktop         | 1.116            | 0.647    | 5.59              |

- **`w = 0.1 · CD`** (0.864 clump sizes) on every screen.
- **A leg to or from a seat inside `R_V + w` fades the veer out over the
  last (first) 0.3 of the way**, so the insect lands exactly on its seat:
  `keep = (1 − s₀ · (1 − smooth(flown / 0.3))) · (1 − s₁ · (1 −
smooth((1 − flown) / 0.3)))`, `sᵢ = clamp((R_V + w − dᵢ) / w, 0, 1)` for a
  seat end at distance `dᵢ` (0 for an air or away end), the push scaled by
  `keep` (`d' = d + keep · (veered(d) − d)`). **Accepted cost**: up to ~2.4×
  zoom during the fade, standing by a perch.
- **Accepted pending play**: a few one-frame flicks (a drawn step > width/20
  px) of a fly passing very near; package C's play looks for them.

**Measured** (`veer.ts`, seeds 1 and 42, 3 legs a pair). Scenarios: `grid`
(eyes at x ∈ −6..6 step 3, y ∈ {2, 5, 8, 11} clump sizes, 4 headings, legs
among seats and 40 air spots), `by a perch` (eye 0.3 and 0.6 CD in front of
each of 12 seats, facing it), `walk-in` (eye walks at `STRIDE_CRUISE`
through a hovering air-perch insect, lateral offsets 0, 0.1, 0.3 CD). Max
zoom while the middle is on the screen, no veer → the decision (butterfly /
fly):

| screen          | grid                  | by a perch            | walk-in           |
| --------------- | --------------------- | --------------------- | ----------------- |
| tablet          | 7.45→1.82 / 5.35→1.89 | 5.79→2.38 / 4.24→2.11 | 200.6→1.72 / same |
| tablet portrait | 5.44→1.72 / 4.82→1.72 | 3.26→1.82 / 4.85→1.93 | 6.42→1.72         |
| phone           | 5.04→1.72 / 9.49→1.72 | 4.69→2.07 / 3.81→1.94 | 1.19 both         |
| phone sideways  | 7.05→1.89 / 12.5→1.74 | 9.08→2.24 / 6.17→2.10 | 17.8→1.72         |
| small phone     | 5.99→1.84 / 20.3→1.72 | 3.70→1.95 / 3.71→2.00 | 2.04→1.72         |
| desktop         | 5.23→1.88 / 5.36→1.98 | 5.19→1.89 / 5.73→1.99 | 20.5→1.72         |

- At the opening eye no leg comes within 0.5 CD and zoom ≤ 1.10×: the veer
  changes nothing there.
- Grid legs passing within 1 / 0.5 / 0.25 CD: 84–88% / 36–42% / 8–12% with
  no veer; with it 13–17% / 3–6% remain within 0.5 / 0.25 CD, every one a
  leg with a seat end inside `R_V + w` (the fade).
- Longest time a giant (drawn span > half the screen's width) holds the
  screen: up to 9.4 s with no veer (phone, butterfly), 1.1–3.0 s walking
  in; **0 s with the veer** on every screen but one 0.12 s (small phone, by
  a perch).
- Zoom above 1.72× is only the fade by a seat inside `R_V` (up to 2.38×,
  tablet): that seat's host is culled by `V_NEAR`, so the seat is below the
  screen's foot and the sitter lands there. No pops (a sitter hidden while
  drawn inside the screen) in any run. `R_V = V_NEAR` alone gives 1.86–1.92×
  where the edge `R_V` holds 1.72×.
- `w` 0.1 vs 0.25 CD: same max zoom, drawn jumps within ±3 px.
- Flicks (a drawn step > width/20 px in one frame): the veer adds them for
  flies passing near the eye — tablet 0 → 4, sideways phone 3 → 13 (by a
  perch), phone 42 → 46 (pre-existing): the radial push slides the point
  round the `R_V` circle fast when the raw leg passes very near.

**A bowed leg looking back** (`back.ts`, run for this round): a release
flown by the real `steer` in the leg's frame with the decided veer, headings
π and π ± 0.035, from (0, 18) clump sizes at the clump's caps and from the
opening eye at three perches stood behind it (0.6 · `D_SEE` out), start →
every shown perch and start → out past either side, every kind:

| screen          | legs | drawn on ≥ 95% of frames | median | least | seat legs landed drawn |
| --------------- | ---- | ------------------------ | ------ | ----- | ---------------------- |
| tablet          | 249  | 247                      | 98.0%  | 91.5% | 213 / 213              |
| tablet portrait | 99   | 99                       | 98.6%  | 97.3% | 63 / 63                |
| phone           | 114  | 114                      | 98.6%  | 97.2% | 78 / 78                |
| phone sideways  | 252  | 252                      | 98.2%  | 96.7% | 216 / 216              |
| small phone     | 114  | 114                      | 98.4%  | 97.1% | 78 / 78                |
| desktop         | 234  | 234                      | 98.0%  | 95.5% | 198 / 198              |

The misses are the start's first 2–3 frames, under the brow by design. The
two tablet legs under 95% are flies from (0, 18) whose bow carries them back
out past the brow (13.7–13.8 clump sizes from the eye, the brow at
`D_SEE` = 13.3) for 3–4 frames (~60 ms) just after they rise over it — a
blink at the brow, on the C play list.

### R3.2 The cost — negligible

`bench.ts`, 400 000 insects × 5 rounds, best round, run with one other test
process on 4 cores (it matches the earlier contaminated run to 0.02 µs):

| path                                                | per insect | 30 insects |
| --------------------------------------------------- | ---------- | ---------- |
| today's `drawnInsect`, a host at either end         | 1.56 µs    | 46.7 µs    |
| today's `drawnInsect`, no host                      | 0.64 µs    | 19.3 µs    |
| the frame: two `framedOf`, back, veer, `drawnAloft` | 0.91 µs    | 27.3 µs    |

The frame path is cheaper than today's worst; either is ~0.1% of the 26 ms
median frame budget (`scripts/lib/frame-budget.ts`). `steer` is the same on
both and left out.

### R3.3 The packages — firm

Shared by every package: `brief-common.md`; each commits only what
type-checks. **A and B are additive** — they add the plane-terms functions
beside today's, which stay live and green — and **C switches the insect over
and deletes the old path** in A's and B's files after both have landed. So A
and B never touch the same file, and nothing breaks between packages.

**Order**: `ip-veer` (in progress) → A; B now (after `ip-pace` reports); A ∥
B (disjoint files); C after both. Pace is done but its play judgement, which
C's play run covers.

#### `ip-veer` — the decided veer (in progress, another agent)

`insect-frame.ts`: the veer per screen (`near = V_NEAR · bendAt(pinholeOf(
view), 0)`, `width = 0.1 · CD`) and the seat-end fade of R3.1. A reads its
note (`ip-veer.md`) for the names it lands; if the fade's `keep` is not
there, A adds it to `insect-frame.ts` as R3.1 words it.

#### Pace — `ip-pace` (built)

Files: `flight.ts`, `flight-timing.ts`, `flight-in.ts`, `perch-sight.ts`,
`scripts/lib/play-buzzers.ts`, their tests. Built: `Habits.cruise`
(butterfly 0.95, fly 7, bee 4.6 sizes/s); `paced` flies max(`flown`,
length / cruise), no ceiling; `slowest`, `across`, `ARRIVAL`, `arriving`
gone; a fixed `Dash` per kind (fly 0.7 of the way in 0.25 of the time, bee
0.6 in 0.3, butterfly none); the out-of-view stretch timed at the cruise
over half the shown width (`Leg.out`). Step 2: `Place = Point & { q }`,
`apartIn` = layout length × `logMean(q₀, q₁) / CD`; `q` comes through the
one seam `perchDistance(layout, row)` in `perch-sight.ts` (today the opening
eye's), which B swaps. Left with it: the `fliers.test.ts` result and play
judgement of the cruise numbers and dash shapes (C's play).

#### A — away and seat (files: `insect-away.ts`, `insect-seat.ts`, `insect-frame.ts` after `ip-veer`; their tests)

Calls `insect-frame.ts`: `drawnAloft`, the veer and its fade; adds
`aloftAt`.

1. **`aloftAt` and the way in and out.** `insect-frame.ts`
   `aloftAt(view, at: Point, distance): Aloft` — the plane point the screen
   point `at` (CSS px) stands over at that distance (`alongSight`), at the
   height that draws it at `at.y`: `h = EYE_HEIGHT − (at.y − pin.y) ·
distance / (focal · bendAt(pin, at.x))` (`ip3/back.ts`'s `at`).
   `insect-away.ts`: `entryAloft(view, side, away, seated?: Point)` →
   `{ from: Aloft, out?: Aloft }`, `from` = `{ ...alongSight(camera, eye, x,
D_SEE + PAST_BROW), h: 0 }` at `x` the screen's middle (or half way to
   the seat's drawn `x`) — always defined, so no `groundNear` and no
   `pastEnd` fallback; `out` = `offAloft(view, side, away, OUT_AHEAD ·
D_SEE)`; `offAloft(view, side, away, distance)` = `aloftAt` of the point
   past `side` at `away.drop`. Tests: `aloftAt` → `drawnAloft` round-trips to
   1e-9 px over every screen and 8 headings; `entryAloft` defined and its
   `out` drawn past the edge looking back (π, π ± 0.035).
2. **The insect drawn.** `insect-seat.ts`: `drawnFlier(view, raw: Aloft,
flown, ends)` — the veer with its seat-end fade (`ends`: each end's
   distance from the eye and whether it is a seat), then `drawnAloft`;
   `seatedZoom(host) = CD / host.stands.ahead`. Tests: the sitter's zoom
   equals `drawnAloft`'s at its seat, |Δ| < 1e-3; a leg to a seat inside
   `R_V + w` ends on the seat to 1e-9; a leg with air ends never comes
   within `R_V − 1e-9` of the eye; "its own size at the opening" rewritten
   to `CD / ahead`.

Ends with: `insect-frame.test.ts`, `insect-away.test.ts`,
`insect-seat.test.ts` and `pnpm typecheck` green, pushed.

#### B — perches (files: `perch-sight.ts`, `perches.ts`, `perch-hosts.ts`, `mushroom-bed.ts` `capTop`, `flower-bed.ts` `seat`, `flower-sight.ts` `flowerLift`; the `Perched`/`PerchAt` type lines of `insect-view.ts`; their tests)

Calls `insect-frame.ts`: `Aloft`, `framedOf`.

1. **Air perches and distances.** `perch-sight.ts`: `airAlofts(layout)` —
   each air spot as a fixed world `Aloft` through `ofLayout`'s own
   construction over the clump's row (`spread` at CD, `h = (clumpRow − y) ·
perPx`; `ip3/world.ts`); `perchDistance` (pace's seam) returns each
   perch's `forward` in the eye's own heading frame (`framedOf(view,
eye.heading, aloft).forward`; a bed host's `stands.ahead`), which at the
   opening eye is today's `rowAt(...).opening`, so pace's `q` test holds
   unchanged there. `perches.ts` carries the air `Aloft`s to the hosts.
   Tests: `perch-sight.test.ts` (`q` at the opening unchanged; an air
   `Aloft` drawn where today's air point is, to 0.1 px at the opening eye).
2. **The seat as the host draws it.** `Perched` and `PerchAt` move to
   `perch-hosts.ts` (`insect-view.ts` imports them); `Perched` gains
   `drawn: Point`, the seat in CSS px as the host draws it this frame, and
   an air perch's `aloft`. `flowerLift` splits into the host part (`disc`,
   at host zoom) and the insect part (`ABOVE_CENTRE · size` etc., at the
   insect's zoom `CD / host.stands.ahead`), so legs stay on the head when the
   two zooms differ; `capTop` and `seat` fill `drawn`. Tests:
   `perch-sight.test.ts`, `flower-plots.test.ts`, `tufts.test.ts`, every
   other test importing a touched module, then `fliers.test.ts` alone
   (~6 min).

Ends with: `fliers.test.ts` and `pnpm typecheck` green, pushed.

#### C — the view (files: `insect-view.ts`, `insect-shown.ts`, `meadow-scene.ts`, a new `insect-leg.ts` if `insect-view.ts` passes ~450 lines, a new `scripts/lib/play-veer.ts` and its line in `scripts/play-mushrooms.ts`; deletions in A's and B's files)

Calls `insect-frame.ts`: `centreOf`, `framedOf`, `aloftFramed`, `mixD`,
`aloftAt`; `drawnFlier`, `seatedZoom`; `entryAloft`, `offAloft`.

1. **The insect on the plane.** `insect-shown.ts`: `from: Aloft`, the
   `row` fields become forward distances, `OverRow` goes. `insect-view.ts`:
   a leg sets off with `c = centreOf(eye, from, to)`; each frame frames its
   fixed start and its end (a seat: `aloftAt(view, perched.drawn, host
distance)`; air: `perched.aloft`; away: `offAloft`), steers in frame px
   with `size` × the `mixD` zoom, takes the point back by `aloftFramed` at
   `mixD(...)` and draws it with `drawnFlier`; a sitter at `seatedZoom`.
   `View | undefined` goes (`viewAt(camera, OPENING_EYE)` before the first
   fit). `see()` takes B's distances; `meadow-scene.ts` wires them.
   Deletes: `toUnits`, `fromUnits`, `Stage`'s `world`/`unit`, `groundAlong`,
   `pastEnd`, `OverRow`, the old `entry`/`offScreen`/`drawnAt`/`flownAt`
   (`insect-away.ts`); `drawnInsect`, `offHost` (`insect-seat.ts`);
   `footRows`/`FootRows` and `airSpots` if unused (`perch-sight.ts`);
   `lens-carry-round3.patch` is obsolete. Tests: `insect-away`,
   `insect-seat`, `insect-frame`, `insect-tap`, `insect-layout`,
   `perch-sight`, `walking`, then `fliers.test.ts` alone.
2. **Play checks** (`scripts/lib/play-veer.ts`, a `veer` play in
   `PLAYS`), on tabL and phoneP:
   - **looking back**: the eye turned π; every insect in the air drawn on
     ≥ 95% of its frames through a release, landing drawn;
   - **a walk into a hovering insect**: the eye walked at `STRIDE_CRUISE`
     through an air perch's sitter; its zoom ≤ 1.72 · `bendAt` at its
     drawn x, its span never over half the screen's width;
   - **the fly flick**: drawn steps > width/20 px in one frame counted and
     logged per fly, frames of the worst kept as `veer-*.png`; logged, not
     failed (accepted pending play);
   - a frame of the fade standing by a perch (up to ~2.4×) and of the
     brow blink (R3.1) to look at.

   Run `flock /home/user/vovazakharov.com/tmp/site.lock pnpm play:mushrooms
--screens tabL,phoneP` (the whole play, which also times the frame
   budget), then look at the frames.

Ends with: the play green on tabL and phoneP, the frames looked at and
described in C's note (flicks, fade, blink, pace), pushed.

## Left

Nothing for research. What only play settles is C's step 2: whether the
fly flicks, the ~2.4× fade by a perch and the brow blink read as wrong, and
pace's cruise numbers and dash shapes; any change they call for goes back to
the orchestrator with the frames.
