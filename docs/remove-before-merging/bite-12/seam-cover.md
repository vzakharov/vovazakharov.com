# seam-cover — hand-over note

Package: the rim defect of `## Rest of the bite` item 4 — a thing past
`D_SEE` standing whole on the far hill where the near crest dips below its
foot. Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. The rule (`view.ts` `sunk`, `buried`): a thing whose foot lies past
   `D_SEE` is drawn sunk below the ground's top row by as much as its foot
   would stand above it (`y + 2·F·E·(1/D_SEE − 1/ahead)`), so its foot is
   never above the ground's top row, which every near crest stands above
   (the near crest's lowest point is 0.4 of the near band above
   `groundTop`). Continuous at `D_SEE` (no jump), sinking as it recedes.
   - `bed-place.ts`: `bedPlace` draws through `sunk` (flowers, mushrooms,
     the house, and the perch hosts the insects read from them); `depth`
     stays the unsunk row, so the farther still sorts behind;
     `BEHIND_HILLS` −4.5 → −3.5, between the near hills (−4) and the
     ground (−3), so the ground picture (drawn from `groundTop + reach`
     down) covers a sinking thing from the foot up.
   - `tufts.ts`: `shownSprouts` places through `sunk`.
   - `insect-view.ts` `screenOf`: through `sunk`, hidden once `buried`
     (sunk below the ground's top row), since an insect draws over
     everything and nothing would cover it.
   - Tests: `view.test.ts` (no jump at `D_SEE`, sinks monotonically,
     buried past it, untouched this side, every camera, four eyes);
     `bed-place.test.ts` (foot below `groundTop`, depth in (−4, −3), the
     farther behind, parts in order).

## Decided

- **Sunk under the ground, not covered by the near hills.** The plan's
  "drawn under the near hills, so they cover it from the foot up" cannot
  hold without a pop: the near crest is never lower than 0.4 of the near
  band above `groundTop` (tabL: 32 px), and a flower at `D_SEE` is about
  that tall, so the moment it crossed the seam the near hills hid it
  whole. Under the ground and sinking, it goes from the foot up with no
  jump, and its foot can never stand on a far hill.
- The depth numbers −4/−3 duplicate `paint-backdrop.ts`'s private
  `DEPTHS`, as −5/−4 did.
