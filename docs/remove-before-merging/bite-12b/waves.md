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

## Next wave

In this order of launch; parallel where files are disjoint.

1. **S3** — `roomFor`/patches from the current eye (`anchoredGround(layout.mushrooms, anchorOf(eye))`), the per-area cap (12 within `D_SEE`, 96 on the field) in `model/game.ts`. First: fold I1's `placeAnchored` into `placeIn` on an anchored ground (perch-sight's two call sites) so one anchoring path remains; `anchoredStand`'s seeded-flower re-standing stays.
2. **L3** (beside S3, disjoint files) — `plantableIn`/`bareToTap`/`groundFor`/`flowerInSight` judged from the anchor via `anchoredStand`/`anchoredGround`, reading only what stands within `D_SEE`; the bee ring with no band; the 48-flower area cap; `FlowerBed.paint` re-places after `drawFlower` (S1's note); flowers off the opening laid in their own frame like S2's mushrooms. Wire the anchored ground into `meadow-scene.ts`'s rule calls.
3. **I-fliers** — run `fliers.test.ts` on I1 alone first (a red is fixed by its own agent); then I2 (air spots, air grid cached by camera), I3, I4 (fixes S2's seat fallback regression), I5.
4. **P1b** after S3 frees `mushroom-bed.ts` and L3 frees `flower-bed.ts` (steps in `p.md`); P2 (mottles from `lawn.ts` cells).
5. **Play** (`scripts/` only, beside the waves): `play-walk.ts`'s "↓ held 12 s walks back STRIDE_CRUISE × (12 − eased) ±0.05" (R1 removed the rim check), the dense-forest approach (§ 6), measure L2's re-tend and I1's re-see hitches.
6. The tail: fold, `/polish`, play run, frames to `frames/bite-12b/`, the Artifact, `/pr`; the review session.
