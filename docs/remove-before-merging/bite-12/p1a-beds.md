# p1a-beds — hand-over note

Package: bite 12 P1, the operator's grass fix and step 1 (`follow(view)` on
the beds). Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. The grass fix (`tufts.ts`, `grass.ts`, `tufts.test.ts`,
   `palette-backdrop.ts`), as the operator's latest rule has it: the ground
   grows a lawn of plain tufts, the seam's three blades, at the pre-bite-10
   density (`TUFTS_PER_1000PX` 52, from `grass.ts` before 610e7f74, then
   per 1000 px of the screen, which was the world), spread down the ground as
   then (`[0.1, 0.98] ** 1.4`). Every tuft is a planting spot; a tuft where
   no flower fits (`plantableIn`: `roomIn`, `headClear`, `bareToTap`) is not
   drawn and does not answer, and comes back once what kept it away goes. A
   tap lands on the nearest standing tuft in reach. No bud; `bud`/`budLit`
   gone from the palette. Frames: `frames/bite-12/grass-before.png`,
   `grass-after.png` (tablet landscape 1180×820, V8 seed 42).

## Left

- Step 2 of this package: `follow(view)` on `mushroom-bed.ts`,
  `flower-bed.ts`, `house-view.ts` with a pure placement helper and its
  opening-identity test. Not started.

## Decided

- The ground's tufts are grown once per layout from the scene's `growing`
  stream (`growTufts(layout, kept, random)`), kept on their feet across a
  resize, trimmed or topped up to `mostTufts` of the new world; which stand
  is `tendTufts(stand, grown)`, a pure filter, so the grass never moves.
- Dropped from bite 10's tuft rules: the reach-apart spacing, `TUFT_LEAST`
  (tufts are drawn at their natural size; tap reach stays `TUFT_REACH`),
  the cap of 6 per 1000 px, and the grid fallback that guaranteed one tuft.
  Kept: fit (`roomIn`, `headClear`), bare to a finger, a planted tuft gone,
  the cream glow on the open one, the share of barren meadows on 280×600.
- `PALETTE.sprout`/`sproutDark` are unused now; left in place (palette
  edits were limited to the bud colours).
- `Grass.refuse` and `Planter`'s refusal stay: a standing tuft always takes a
  flower now, so the head-shake is reached only through a stale tend.
- `tufts.test.ts` takes about 5½ minutes (≈106 tufts per meadow on the
  tablet, each fit-tested per turn).
- `scripts/lib/play-tufts.ts` reads `grass.tufts`, which is still the
  standing tufts, so its "every tuft takes a flower" checks hold.
