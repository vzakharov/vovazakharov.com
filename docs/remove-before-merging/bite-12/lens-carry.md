# lens-carry — hand-over note

Package: the half-depth package's carried items (`drop-in.md`'s and
`v-near.md`'s Left), each re-measured under the panoramic lens.

## How the releases are measured

A scratch script (not committed): every screen of `VIEWPORTS` × 11 headings
(−0.6 … 0.6) × 11 screen columns × 17 perch distances (0.62 ·
`CLUMP_DISTANCE` … `D_SEE`) × 3 kinds, the seat two insect sizes over the
foot, kept where `drawnInsect` shows the perch on the screen and `entry`
gives no `out`; the real `steer`, 60 fps, the leg `min(ARRIVAL, the kind's
mid flying time)`. "Hidden" is the time `drawnInsect` draws nothing before
the leg arrives. 28 779 legs.

## Done

1. **A flier sinks by its ground point** (`sunkOver` in `view.ts`,
   `flownAt` in `insect-away.ts`, used by `drawnAt` and `offHost`): past the
   brow, an insect in the air is lowered as far as `sunk` lowers the ground
   point under it, not mirrored about its own middle.

   |                      | median | p95 | p99  | max  | legs hidden > 150 ms |
   | -------------------- | ------ | --- | ---- | ---- | -------------------- |
   | before (middle)      | 50 ms  | 233 | 1317 | 1483 | 1767 (6.1 %)         |
   | after (ground point) | 33 ms  | 50  | 67   | 133  | 0                    |

   New test: `insect-away.test.ts` "sinks a flier past the brow by the
   ground under it" (red on the old source).

## Left

2–6 of the package, `fliers.test.ts`, the frames.
