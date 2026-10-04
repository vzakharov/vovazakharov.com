# Package gb — the seam's grass looks into only the cells its band crosses

Done; landed as one commit on the shared branch.

## What changed

`shownSeam` used to measure every live seam tuft's distance from the eye on
every frame: all 81 live cells × `SEAM_PER_CELL` (35) = 2,835 tufts. It now
takes the seam cut by cell (`seamPatches`: runs of tufts that stand in one
cell, in the seam's order, so laid end to end they give the seam back). It
looks into a cell's tufts only when the cell crosses the band
(`crossesSeam`: the cell's nearest point is closer than `D_SEE + PALE_SPAN`
and its farthest is beyond `D_SEE - SEAM_BAND`, with a 1e-9 leeway so
rounding never drops a tuft). `Grass` re-cuts the patches only when
`LiveLawn.seam` changes, which happens when the eye crosses into a new cell.

The output is identical. `ground-seam.test.ts` checks it with `deepEqual`
against the old every-tuft filter, on every viewport over 14 eyes (stepping,
turning, at dusk 0.5). The draw order is the same too, because the patches
keep the seam's order.

## Counts (tufts whose distance a frame measures)

|                                          | cells looked into    | tufts looked into       |
| ---------------------------------------- | -------------------- | ----------------------- |
| before                                   | 81 (every live cell) | 2,835                   |
| after, opening eye, tabL                 | 44                   | 1,540                   |
| after, mean over all viewports × 14 eyes | —                    | 1,352.5 of 2,835 (48 %) |

Every frame still runs one cheap test per live cell (81 of them). Counts come
from the test and a scratch script that was not landed; no ms were measured.

## Left, if dusk still needs it

The band is 2.2 units deep and a cell is 4 wide, so half the cells still
cross it. Two further cuts would keep the output identical:

- Test only the cells inside the view's horizontal field of view, not the
  whole ring. Roughly another 2×.
- Cut the seam into sub-cells. The draw order would then need restoring,
  because sub-cells break the seam's order.

`pnpm type-overlap` already reports three groups on the shared branch
(`line-course.ts`/`stride.ts`/`walk.ts`/`map-view.ts`), none from this package.
