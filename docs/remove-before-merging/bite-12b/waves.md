# Bite 12b — the build's waves (orchestrator's log)

Each agent's report lands here as it arrives, so a restart costs nothing.

## Before the waves

- 743fa2c — `model/anchor.ts` (`anchorOf`, `sameAnchor`, `ANCHOR_STEP` 0.5,
  `ANCHOR_TURN` = 0.5 / `D_SEE`), `D_SEE` moved to `model/ground.ts`
  (re-exported by `view.ts`), and step 0's seeded-bed round-trip test. I0
  is done by this commit.

## Wave 1 (launched together)

| Package | Step(s)           | Note   | Report                                                                                                                                                                                                                                                                                              |
| ------- | ----------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R       | R1, R2 if context | `r.md` | R1 1d54062: rim gone, `roomAhead` removed outright; R2 8fd62de: wash rule → `sun-layout.test.ts` against `browRow` (stricter). Touched `scripts/lib/play-walk.ts` to type-check: rim check removed, its replacement (↓ 12 s walks back STRIDE_CRUISE × (12 − eased) ±0.05) left to the play package |
| S       | S1                | `s.md` | S1 d4ad46f: `offSides` in `bedPlace`, overhang `SIDE_OVERHANG` 1.5 × drawn height (= a tuft's), no bed edit needed; for L: `FlowerBed.paint` places before `drawFlower` sizes the head, so a new flower off a side shows a frame late (re-place after drawing)                                      |
| L       | L1, L2 if context | `l.md` | L1 299d871: `tuft-tap.ts` split out (99 lines), `tufts.ts` 345; `middleOf` exported; no behaviour change; L2 not started (context)                                                                                                                                                                  |
| I       | I1                | `i.md` |                                                                                                                                                                                                                                                                                                     |

## Wave 2 (launched as inputs free up)

- L2 — after L1's report; note `l.md`.
- R3 — after R2; note `r.md`.
- S2 — after S1; note `s.md`.
- P1 — after S1; note `p.md` (beds' wiring left as P1b).

## Queued

- S2, S3 (after S1); L2/L3 (after L1; L3 after S2's anchored layout);
  P1 (after S1), P2 (after L2); I2, I3 (after I1), I4, I5 (after S);
  R3; the play package (play-walk after R1, the dense approach after S).
