# Bite 9, ground group: paused (second time)

## Committed

- 379346ef: `model/ground.ts`, one ground table in `clump-layout.ts` and `layout.ts`, the camera. The whole `layout.test.ts` passes (66 tests). The phone held sideways was 26% over its cover limit. A search (`tmp/bite9/ground/search.ts`) over the clump shifts on every screen, all 16 species pairs and 2000 visits fixed it: the front porcini went from `{0.12, 0}` to `{0.12, 0.12}` and the back porcini from `{-0.05, 0.16}` to `{-0.03, 0.24}`. The worst cover there is now 23.1%. Every back doorway is at least 80.7% in sight, and every back cap at least 51.7% in view.
- 016e2a99: the `mushroom-tap.ts` comment now cites `ZOOM_FLOOR`.
- `ground.patch` was deleted in 379346ef. The one beside this note is new (see below).

## In the tree, not committed (`ground.patch` holds the same diff)

- `layout.test.ts` has a new test: every cap in every slot is drawn at least `2 × TAP_RADIUS` across, measured from the drawn cap box. With the committed floor it **fails** on the phone held sideways and on the small phone (a fly agaric in mushroom-3 is 63.6 px across). The committed floor divides by the `capWidth` gene. A cap drawn turned (lean + splay + tilt + the stem's bend) and rounded at its rim is up to 11% narrower than that gene.
- `layout.ts`: `narrowestCap(splay)` measures the drawn cap box at every corner of the genes it depends on (`CAP_TURNS`, plus 0 where a range spans 0, on the canvas with y flipped), and `ZOOM_FLOOR` is taken per slot. With that, the finger test passes on every screen. The floor goes from 127 to 142.6 px, and that breaks two other tests:
  - small phone: a fly agaric in mushroom-2 goes past the edge, because the floor now overrides the width limit;
  - phone held sideways: mushroom-0's fly agaric covers mushroom-4's porcini by 25%.
  - The flower-plots test "stands in sight where it was planted…" fails on the small phone for both opening states. This was not checked against the committed code.

## What was tried

The forest slots were made 12% larger (0.72, 0.71, 1.12, 1.2) so the floor came back down to 127, with slot 3 at `x = 0.76`. The small phone then still went past the edge on slot 2 or 3. On the phone held sideways, the back porcini came out 36–49% covered by slot 2 whatever the clump shift. That route is worse, and it was reverted.

## Left

1. Fit the drawn-cap floor. Options: extend `tmp/bite9/ground/search.ts` to rebuild the camera for candidate forest feet `x`/sizes, taking the edge constraint as `ZOOM_FLOOR × LENS.reach ≤ 148` on the small phone. Or narrow the forest's turn (`FOREST_SPLAY`) so the drawn cap is wider. Or cap the lean/tilt corner. Or give phoneL a deeper band for the cover (the orchestrator's fallback).
2. `COMMON_FRAME` (±0.62, −0.7 to 2.6) does not hold the forest feet (x up to ±1.15, z −0.94 to 3). Either derive it from what every camera shows, or fix the `FOREST_FEET` comment that says "inside the common frame".
3. `model/ground.test.ts`: the frame is shown on every viewport, and a rotation keeps ground points. For the second, test that `(x − centre)/size`, `(y − groundTop)/ground` and `size/unit` per slot are equal across `VIEWPORTS`.
4. Lint, type-overlap and knip; the other suites; the probe build and the tabL/phoneL play frames.
