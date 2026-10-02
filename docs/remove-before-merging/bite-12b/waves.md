# Bite 12b — the build's waves (orchestrator's log)

Each agent's report lands here as it arrives, so a restart costs nothing.

## Before the waves

- 743fa2c — `model/anchor.ts` (`anchorOf`, `sameAnchor`, `ANCHOR_STEP` 0.5,
  `ANCHOR_TURN` = 0.5 / `D_SEE`), `D_SEE` moved to `model/ground.ts`
  (re-exported by `view.ts`), and step 0's seeded-bed round-trip test. I0
  is done by this commit.

## Wave 1 (launched together)

| Package | Step(s)           | Note   | Report                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ----------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R       | R1, R2 if context | `r.md` | R1 1d54062: rim gone, `roomAhead` removed outright; R2 8fd62de: wash rule → `sun-layout.test.ts` against `browRow` (stricter). Touched `scripts/lib/play-walk.ts` to type-check: rim check removed, its replacement (↓ 12 s walks back STRIDE_CRUISE × (12 − eased) ±0.05) left to the play package                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| S       | S1                | `s.md` | S1 d4ad46f: `offSides` in `bedPlace`, overhang `SIDE_OVERHANG` 1.5 × drawn height (= a tuft's), no bed edit needed; for L: `FlowerBed.paint` places before `drawFlower` sizes the head, so a new flower off a side shows a frame late (re-place after drawing)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| L       | L1, L2 if context | `l.md` | L1 299d871: `tuft-tap.ts` split out (99 lines), `tufts.ts` 345; `middleOf` exported; no behaviour change; L2 not started (context)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| I       | I1                | `i.md` | **Landed a2f04e1**: new `ui/scene/anchored-stand.ts` (`anchoredStand(stand, anchor)`, `placeAnchored` — S and L reuse these); `PERCH_REACH`; `Perches.see(stand, anchor)`; `perchesOf` caps from `places`; `meadow-scene.ts` re-sees on `perchAnchorOf` change. **Orchestrator's calls:** (1) `PERCH_REACH` = max(`D_SEE`, the world frame's far corner) = 15.91, kept — opening caps stand up to 15.21 out, so `D_SEE` would drop today's perches; the anchoring, not the reach, makes insects follow. (2) Re-see measured 17–28 ms at 96 (budget 4): perches snap coarser (`perchAnchorOf`, 2 units / 0.3 rad, spec-insects § 4.5), kept; I2 caches the air grid by camera to cut it. **`fliers.test.ts` not yet run on I1 — the next I agent runs it first.** |

## Wave 2 (launched as inputs free up)

- L2 — after L1's report; note `l.md`. **Landed 6524db4**: new `lawn.ts` (CELL 4, 14 tufts/cell, `liveCells` ~80 cells/~1100 tufts since D_SEE is 13.33, `LiveLawn.round` regrows on a cell crossing); `Grass` tends only `tendedIn(view)` (half a screen + one screen of heading, re-tend on 0.5 units / half a screen; ~370 tufts on tabL, est. 15–35 ms per re-tend, unmeasured — the play run measures it); tufts placed by `placedAt` and sized by screen row (`tuftSizeAt`), not `bedPlace`'s zoom; `leaveTufts(grownAt)`; `PALE_SPAN` exported from `repaint-queue.ts`. Until L3, far from the start the grass mostly vanishes (rules still at the opening eye).
- R3 — after R2; note `r.md`. **Landed 795c18b**: `openingCrop`, `rebloom`, `BLOOM_WIDEST` gone; readers use `viewAt(camera, OPENING_EYE)`. **Package R done.**
- S2 — after S1; note `s.md`.
- P1 — after S1; note `p.md` (beds' wiring left as P1b). **Landed f499e9f**: `headedLight(light, heading)` (exact at heading 0), `mushroomLights`/`flowerLight` take `heading` (defaults to the opening's), `SIDE_DRIFT` 0.1, optional `Siding` (`sunSide`, `paintedSunSide`) on `Hazing`. Each thing keeps its own α from its opening light; facing away lights the mirrored side. **Nothing shows until P1b** (mushroom-bed.ts and flower-bed.ts wiring, step by step in `p.md`) — launch after S2 frees mushroom-bed.ts.

- S2 — after S1; note `s.md`. **Landed c0e804c**: `MushroomGround.anchor`; `placeIn` anchors each stored foot (identity at `OPENING_EYE`), `undefined` where no ground; `anchoredGround(ground, anchor)` (same object while the anchor stays) is how a caller judges from an eye; `laidOf` lays a non-clump mushroom at `{x:0,z:0}`, `FOREST_SIZE`, `opening = CLUMP_DISTANCE`, so it paints once; a mushroom grown behind the opening eye is now painted. Regression flagged for I4: `seatAloft`'s fallback for an undrawn host reads the paint frame as opening px. S2 missed I1's `anchored-stand.ts` (not on origin when it looked): **two anchoring paths now coexist**.

## Wave 3 (launched together)

S3, L3, I (fliers.test.ts first, then I2–I5) and Play launched at once
from 233b3b6, each in its own worktree; P1b waits on S3 and L3. Reports
land below as they arrive.

- **I** — 240fcdc. `fliers.test.ts` green on I1 (48/48, 5 min 25 s). I2
  half-built as `i2-air-spots.patch` (new `air-spots.ts` plane lattice,
  `widest-spans.ts`, a swept `pointCrowdings` not yet checked against the
  old one): 647–663 cells at 1180×820, but `airOf` costs ~8.5 ms per
  anchor (3 ms crowding, the rest `spotsAt`'s ~6600-cell loop) against the
  4 ms budget, and its wiring lies in `perch-sight.ts` (S3's). I3–I5 not
  started. **Orchestrator's call:** a fresh I agent takes `perch-sight.ts`
  once S3 reports, applies the patch, profiles `spotsAt` first, and only
  if it stays over budget measures crowding on the plane against a coarser
  snap and reports both before choosing; then I3, I4 (S2's `seatAloft`
  fallback), I5.
- **L** — f58cfef (L3a): the depth band is the child's planting only
  (`inFlowerBand`), bees' rings and `standingFlowers` keep to none;
  `FlowerBed.paint` re-stands at drawn height. Departure taken: a bee's
  flower may stand with its foot below the screen where its head is in
  sight. Found (l.md): a ring slot is parent + offset in whatever frame
  the parent arrives in, so from another anchor it lands elsewhere (depth
  ×y²/74.6), and `standingFlowers` judges spacing in the opening's frame.
  **Orchestrator's call, over L's "parent's own frame" proposal:** a ring
  slot is an offset **on the plane**, in ground units round the parent's
  plane foot, so no frame enters it and no anchor moves it — step 0's rule
  that a stored foot is a plane point, extended to bee flowers. The
  offsets are sized so that at the opening a ring lands within half a
  tuft of where it does today (a test pins it); spacing (`headsApart`,
  `clearOfFeet`) is judged in plane distance, which anchoring keeps. It
  beat the proposal because the proposal keeps a frame per parent and a
  clamp to "the nearest point of the opening's flower ground", a second
  geometry to keep right forever. The 48 cap: a constant and a counting
  helper in `game.ts`, enforced in `roomFor`/`roomIn`, as L proposed. The
  next L agent gets `anchored-stand.ts` once S3 reports.
- **S3** — 0fd8923 (one anchoring path: `placeAnchored` gone, `placeIn`
  on `anchoredGround`), f790400 (`MUSHROOM_SLOTS` 12 within `D_SEE` of the
  new foot via `isCrowdedAt`, `FIELD_MUSHROOMS` 96 for `isFull`), 90f77f7
  (`roomFor`/patches from `anchorOf(view.eye)`, `groundIn`, `viewFrom`).
  **Package S done.** Its departures, all kept: `roomFor` returns a plane
  `Footed`, re-grounded by `fitsView` (one-line edits in `arrivals.ts`,
  `visit-play.ts`, `tufts.test.ts`); `standing-weighed.ts` edited;
  `roomFor` reads no `D_SEE` cut (opening caps stand to 15.9);
  `mushroom-patch.test.ts` judges each forest from the eye it grew at.
  Left over: `fliers.test.ts` not run on S3 (the next I agent runs it
  first); spore puffs and the boing read `shown.size` unzoomed;
  `pnpm type-overlap` red on two groups in `lawn.ts` (the next L agent's).

- **Play** — 9e89d44, bbdd458 (note `play.md`; tabL only). `checkBack`:
  ↓ 12 s lands 19.000 at let-go, 19.200 at rest, as expected. The
  dense-forest approach is two clusters walked through (4 s of ↓ apart).
  Probe `__probe.hitches()`: lawn re-tend 17 ms median / 151 ms worst, its
  frames 49 ms against 19 ms plain — **a real hitch past the 26 ms
  budget**; perch re-see +6 ms. Harness red loosened (to-check.md): the
  walk-up stops at `CLOSE` × the size it set off at. Reds handed on: `+`
  19 units out judged from the opening eye (S3 landed it; the scene wiring
  is L′'s), no tufts far from the start (L′'s L3). **Orchestrator's call:**
  the re-tend hitch is the tail's — spread the re-tend over frames or
  shrink its sector — after L′ reports; the tail's play run covers the
  other four screens on a quieter machine.

## Wave 4 (launched together)

I′ (`perch-sight.ts` handed over: fliers on S3, I2's patch wired and
profiled, then I3–I5), L′ (`anchored-stand.ts` handed over: plane ring
offsets, the rest of L3, `lawn.ts`'s overlap) and P1b's mushroom half
(`mushroom-bed.ts`; the flower half waits on L′).

- **P1b, mushrooms** — 132c6eaf: `Shown.lightsAt(heading)` and `sunFrom`,
  `paintLit` (body, house, shadow) at the eye's heading, `follow` feeds
  `sunSide`/`paintedSunSide`; `Siding` now required in `Hazing`; exact at
  the opening heading (a test pins `headedLight` against the ground light).
  S3's leftover fixed in the bed (puff reach and boing pitch from the drawn
  size). Departures kept: a closure on `Shown` instead of p.md's stored
  `toward.x` (`turnedLight` and `headedLight` don't commute); a haze-only
  repaint relights too. **Left for the tail:** `mushroom-bed.ts` is 479
  lines — split along a seam; the door puff (`house-view.ts`) reads the
  unzoomed size — `spores.ts`'s `Puffing` carries the drawn zoom. P1b's
  flower half and P2 (`lawn.ts`) after L′.
- **L′** — 72d4d4b3 (`Lawn = Seeded & Pick<Stand, 'layout'>`, the overlap
  gate green), eee8f5ce (steps 2–5 designed in `l.md` § "L3b", not
  built). Measured the ring call: no fixed plane offset lands within half
  a tuft of today's ring (p50 ~1.8 tufts, worst 8–14), options (a) plane
  offsets, bar dropped, (b) layout offsets from the stored foot, (c) both
  with a seam. **Orchestrator's call: (a), B = 1.5** (its best fit). The
  half-tuft bar was mine and guarded nothing a player sees: a bee's ring
  is laid fresh each visit, so there is no ring anyone remembers for it to
  move from; (a) is right in perspective everywhere and keeps one
  geometry, where (b) goes wild off the opening and (c) adds a seam.
  `standingFlowers`' spacing goes to plane distance with it. On step 2:
  the rules read out to ~2·`D_SEE` + `PALE_SPAN` + 1 so the 48 count is
  exact, the cut stand cached per mushrooms list and anchor, as L′
  designed. A tuft's tap is judged at the anchor the grass last tended at,
  so a shown tuft never shakes its head.

- **I′** — 138d9cbc: `fliers.test.ts` green on S3 (48/48); the air
  lattice (`air-spots.ts`, `widest-spans.ts`) and a swept
  `pointCrowdings` pinned against the old one by `perch-crowding.test.ts`;
  `airOf` 2.4–3.0 ms median per anchor (budget 4), so the fallbacks went
  unmeasured. Wiring as `i2-wiring.patch` (source type-checks, tests not
  repointed). Kept: `perchSight(stand)` reads the anchor off
  `layout.mushrooms.anchor`; air `fromEye` from the anchored view;
  shared pairings arrays. I3–I5 not started.

- **L″** — 9a7d9116: a bee's ring on the plane (`ringFoot(parent, ring,
  anchor)`, `RING_DEPTH` 1.5, turned by the anchor's heading), planted
  flowers spaced by plane distance; the seeded bed keeps its screen
  spacing (`apartOnGround`/`clearOnGround`, private) so the opening is
  unchanged — kept. Step 2 half-built as `l3c-step2.patch` (the cut stand
  inside `anchoredStand`, `STAND_REACH`, caches, `judgedFrom`,
  `takesFlower(stand, foot, eye)`); left in `l.md` § "L3c". Steps 3–5 not
  started.

- **I″** — f83d06cb (I2 wired: perches on the air lattice; fliers 48/48,
  `air-spots.test.ts` 27; `type-overlap` green again), 335641d9 (I3:
  `Onscreen.downTo`/`far`, a perch counts as shown only above the bottom
  edge and short of the brow). I4 blocked: `Host` needs `foot` and
  `opening`, built in `mushroom-bed.ts` `capTop` and `flower-bed.ts`
  `seat` (design in `i.md` § "I4"). I5 not started; `fliers.test.ts` not
  rerun after I3. **Orchestrator's call:** I4 and I5 go to one I agent
  after L‴ reports, holding both beds' host builders; meanwhile a tail
  agent splits `mushroom-bed.ts` (479 lines) and fixes the door puff in
  `spores.ts`, so I4 lands on the split bed.

- **Bed** — c7def3f0 (`mushroom-shown.ts` split out: `Shown`,
  `unplacedShown`, `paintLit`; the bed 407 lines, `capTop` stays there for
  I4), f262b748 (`Puffing` carries `stands`, `drawnSize` in `spores.ts`;
  door and window puffs at the drawn size). Done; note `bed.md`.

- **L‴** — 1cebd29d (tufts and planting judged from the anchor,
  `Grass.tendedAt()`), 56a1df46 (`FLOWER_SLOTS` 48, `flowersCrowdAt`),
  9253ea69 (`Scened.view`; play `walk,tufts` green on tabL, both reds
  cleared), 89df10e1 (planted flowers laid in their own frame,
  `laidFlower`). **Package L done.** Kept: `view` moved from `Arriving` to
  `Scened`; `tapTuft` judges at the tended eye, the picker and keys at the
  view's. Handed on to the tail's play agent: `play-buzzers.ts:90` reads
  `scaleY`, now growth × `stands.zoom` (divide by it), and a bee drawn
  29.1 px under 30 on tabL `planting`, red before step 4 too. For I4:
  `FlowerBed.seat` reads `laid.place`, so an undrawn host's
  `seatAloft` fallback puts a planted flower's seat at the clump's spot.

## Wave 6 (launched together)

I‴ (I4 with both beds' host builders, I5, `fliers.test.ts` once) and
P1b's flower half with P2 (`flower-bed.ts` paint and follow, `lawn.ts`);
the two share only `flower-bed.ts`, I‴ touching `seat` alone.

- **P1b, flowers** — ae2b474d: `FlowerPainting` and `paintFlowerLit` in
  `draw-flower.ts`, `follow` queues every drawn flower by heading; exact
  at the opening (a test). P2 red as `p2-mottles.patch` (7 of 9
  `mottles.test.ts` fail: flat at every heading, none past the brow).
  **Calls:** the flowers' own repaint queue is kept (up to 2+2 repaints a
  frame turning; the play run measures it, and only a hitch earns
  `meadow-scene.ts` one shared queue); P2 editing `tufts.ts` (where
  `Grass` lives) is fine; `flower-bed.ts` at 485 lines is split once I‴
  is off its `seat`.

- **I‴** — 1c90f641 (I4: `Host` gains `foot` and `opening`; the undrawn
  fallback from the host's plane foot, within 6 % of the drawn seat),
  938ee5b4 (I5: `panOf`, take-offs and shies panned). `fliers.test.ts`
  48/48 on the merged tree in 1 min 52 s (5 min before: the tail checks
  it still runs all 48 at full length). Departures kept, both measured:
  the sideways offset × `SPREAD`, and across the line of sight to the
  foot rather than the heading (18 % → under 5 %); a seeded flower's
  `opening` is `gathered(foot).y`. **Package I done.**

- **Flower bed** — ab236a5e: `flower-shown.ts` split out (`Shown`,
  `laidOut`, `unplacedShown`, `paintShown`), the bed 422 lines, `seat`
  stays. Done; note `fbed.md`.

- **P2** — de93f382: mottles on the plane from the lawn's cells
  (`mottles.ts`, `cellLawn`, `LiveLawn.mottles`); the code was right, two
  assertions were not (this lens draws a ground patch 8.15/d as deep as
  wide, so "wider than deep" fails near; a mottle 5 ahead is below tabL's
  bottom edge). Fields renamed for `type-overlap`. **At the planned
  strength (tone 0.3, alpha 0.16) the mottles are all but invisible** — a
  look call for the tail, from a frame at the opening and one far out.

**The build is done**: every package of 12b has landed. Left is the tail
(below).

## Wave 5

L″ builds `l.md` § "L3b" steps 1 (call (a)) to 5; then P1b's flower half
and P2, which share `flower-bed.ts` and `lawn.ts` with it.

## Next wave

In this order of launch; parallel where files are disjoint.

1. **S3** — `roomFor`/patches from the current eye (`anchoredGround(layout.mushrooms, anchorOf(eye))`), the per-area cap (12 within `D_SEE`, 96 on the field) in `model/game.ts`. First: fold I1's `placeAnchored` into `placeIn` on an anchored ground (perch-sight's two call sites) so one anchoring path remains; `anchoredStand`'s seeded-flower re-standing stays.
2. **L3** (beside S3, disjoint files) — `plantableIn`/`bareToTap`/`groundFor`/`flowerInSight` judged from the anchor via `anchoredStand`/`anchoredGround`, reading only what stands within `D_SEE`; the bee ring with no band; the 48-flower area cap; `FlowerBed.paint` re-places after `drawFlower` (S1's note); flowers off the opening laid in their own frame like S2's mushrooms. Wire the anchored ground into `meadow-scene.ts`'s rule calls.
3. **I-fliers** — run `fliers.test.ts` on I1 alone first (a red is fixed by its own agent); then I2 (air spots, air grid cached by camera), I3, I4 (fixes S2's seat fallback regression), I5.
4. **P1b** after S3 frees `mushroom-bed.ts` and L3 frees `flower-bed.ts` (steps in `p.md`); P2 (mottles from `lawn.ts` cells).
5. **Play** (`scripts/` only, beside the waves): `play-walk.ts`'s "↓ held 12 s walks back STRIDE_CRUISE × (12 − eased) ±0.05" (R1 removed the rim check), the dense-forest approach (§ 6), measure L2's re-tend and I1's re-see hitches.
6. The tail: fold, `/polish`, play run, frames to `frames/bite-12b/`, the Artifact, `/pr`; the review session.

## The tail (session at relay depth 8)

- **tail-play** — 25fae6b (planting's two reds were the harness's: a
  planted flower's `scaleY` is growth × `stands.zoom`, so divide; the bee is
  40.3 px at its own size, 29.1 px drawn on a far flower at depth 0.72 —
  the floor held at own size, the drawn size in to-check.md), 98fe9dd
  (`fliers.test.ts` whole: 48 × 1201 ticks to 300 s; faster because L3's
  48-flower cap halves the bees' plantings and each re-see costs less),
  dc8adaf (tabL full run, frames). **tabL reds left:** a butterfly never
  rests on a cap to tap through (`play-insects.ts:343`); looking back, six
  flies all take air (`play-veer.ts:270`, likely the one cap held by a
  butterfly — a harness red); fly one-frame steps to 82.6 px against
  38.1 near the end of an air→cap leg at the right edge (suspected seat
  moving as I4's undrawn fallback flips — a game red if so); bee steps to
  34.0 against 25.8. Four screens unplayed. **Orchestrator's call:** one
  agent takes the four reds (game reds fixed, harness reds loosened into
  to-check.md); the four screens after it, a play per call to stay under
  the foreground limit.

- **tail-lawn** — 838b087 (the re-tend spread: `tending.ts`, the tuft
  rules moved out of `tufts.ts`, `TEND_SLICE` 60 tufts a frame after a
  0.3 ms gather; a scene-asked `Grass.tend` stays whole and cancels a
  slice run), 4605c4a (mottles `MOTTLE_TONE` 0.7, `MOTTLE_ALPHA` 0.4; at
  0.8/0.5 overlaps smudge far out). tabL approach: frames carrying lawn
  work 43.3 → 26.7 ms median against 23.7 without; call median 18.2 →
  1.2 ms. **Kept:** spreading over shrinking the sector. **Handed on:** the
  probe times only `Grass.tend`, so `tendOn`/`retend` go into
  `hitches.tend` — given to tail-fliers, which owns `mushroom-probe.ts`.

- **tail-fliers** — 3c7d9b6: the fly's 82.6 px steps were the game's, not
  I4's seat (steady to ±0.3 px): a leg setting off from a perch the sight
  no longer places (after any turn) fell back to the random flight time,
  613 ms to cross from behind the eye; `placesSetOff` now times it from
  where the insect was last drawn (a test). Worst fly step 45.3 against
  50.8. Bee darts after a half-turn: a harness red, `DASH_SLACK` 1.1 →
  1.15, to-check.md. Looking back releases the fly first. **Left:**
  `fliers.test.ts` after `placesSetOff`, one tabL `veer` to confirm, red 3
  (`play-insects.ts:343`), the probe's `tendOn`/`retend`, four screens.
  **Orchestrator's call:** one agent takes them in that order.
