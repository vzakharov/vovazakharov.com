# v-near — hand-over note

Package: the frame budget walking into the forest, by spec §5's mitigation
(raise `V_NEAR` first). Files: `src/pages/mushrooms/ui/scene/view.ts` (the
constant), `view.test.ts`, the frames
`docs/remove-before-merging/frames/bite-12/v-near-*.png`.

## Done

- `V_NEAR = 0.58 * CLUMP_DISTANCE` (5.01 at `CLUMP_DISTANCE` 8.64), was 2.
  Stated as a share of `CLUMP_DISTANCE` so it follows the plane units when
  the field of view widens (plan aba53f0).
- `view.test.ts` unchanged: it pins no number, only the invariant that every
  species' tallest head is below the screen's foot at `V_NEAR` on every
  camera, and it holds at 0.58.

## Measured (tabL, `--plays approach`, probe builds, `--no-build`)

The approach play's "walking into the forest and turning there" median over
its 659 frames. The machine is shared with other build agents, so each run
carries its 1-minute load average at the start and end (4 cores).

| `V_NEAR` | share of `CLUMP_DISTANCE` | forest walk median | whole screen | load start → end       |
| -------- | ------------------------- | ------------------ | ------------ | ---------------------- |
| 2        | 0.23                      | 67.7 ms            | 66.1 ms      | 0.9 → 6.2 (with build) |
| 2        | 0.23                      | 56.4 ms            | 53.6 ms      | 2.4 → 5.2              |
| 2        | 0.23                      | 50.9 ms            | 48.9 ms      | 4.8 → 4.2              |
| 4        | 0.46                      | 39.2 ms            | 40.1 ms      | 5.0 → 4.3              |
| 5        | 0.58                      | 31.8 ms            | 32.3 ms      | 4.9 → 6.0              |
| 5        | 0.58                      | **24.7 ms**        | 25.0 ms      | 1.3 → 5.2              |

- The relay's idle 33.5 ms at 2 was not reproduced: no run at 2 started on
  a quiet machine (other agents' `fliers.test.ts` held two cores). Under
  matched load 2 → 5 cuts the median ~44 % (56.4 → 31.8); the one quiet run
  at 5 holds the budget at 24.7 ms.
- Not tried: 3 (built, not played: the sweep was stopped for the plane-unit
  change). The ceiling, 0.613 (5.30): the fly agaric's tallest head leaves
  the screen's foot there, the first species to; past it the cull would hide
  a cap still on the screen. Porcini 5.85, chanterelle 5.59, russula 5.62.
  Every screen's foot is at the same distance (7.78), so the ceiling is the
  same on all five.

## How near a mushroom gets before it hides

Nothing visible changes. A mushroom is hidden at 5.0 ahead, and by then even
the tallest fly agaric's cap is below the screen's foot; nearer than ~5.3 it
is wholly off the bottom of the screen. The closest-approach frames
(`tabL-final-near`, `tabL-final-close-turn`) are byte-identical at 2, 4 and
5; `final-tap` differs only in a 152×36 px sky corner (cloud drift).
What the raise saves is drawing mushrooms that are already off the screen.

## Left

- The five-screen run at the final HEAD re-measures the budget there.
- After the plane units halve, re-measure: the share is what carries over,
  the ceiling (0.61) is the screen-foot geometry and may move with the focal.

## Decided

- 0.58 rather than the measured 5.0 exactly (0.579): a round share, 0.2 %
  apart.
- An insect is hidden by the same cull (`insect-away.ts`), and an insect
  flies higher than a cap, so one flying near the eye now hides at 5.0 ahead
  rather than 2, possibly while still on the screen. Not played; flagged.
