# Plan wording the handling groups reported

For `docs/plans/mushroom-game-syama.in-progress.md`: fold § "This bite" into
§ "Eaten so far" item 8 as what the review's handling changed, then drop
§ "This bite". Item 8 states what is true now; these are the groups' notes.

- **A (5461df1, 1a7cba4, 142c968, 484e0b6):** a door refuses a tap only to a
  nearer door whose tap area also holds it (`tappedDoor`, `ui/scene/door-tap.ts`).
  The selection's ground ring is as wide as the foot (`footWidth` at the
  drawn turn), meeting the band at its corners. `strokeShape` closes each
  outline itself; the play run checks the band for gaps (`scripts/lib/play-band.ts`).
- **C (35b553c, b8fcb0e):** a chanterelle's every fill at hue 20–30°. Porcini
  browns, shaded and hazed, held out of the weak-edge band a sweep of
  `inkFor` finds (0.021–0.050 today), not a hand-written one. `HEAVY_FOOT`
  darkens a foot at least 0.37 of its cap across.
- **S (b508116, 0ed5733, 065bb2f, 14227ae):** `mushroom-profile.ts` gains
  `funnelEdge` and the russula's dish; the chanterelle's rim runs `lobes`
  whole crests. `mushroom-outline.ts` gains `inkWidth` and `gillLines`: a
  porcini's sponge and a russula's gills hang as a band under the dome,
  drawn up round the stem. `icon-genes.ts` holds the pictograms' genes and
  size, Phaser-free. `MOUTH_LINE` lives in `chanterelle-outline.ts`.
- **F (2718390):** flowers live in `flower-layout.ts`, placed against the
  union of both meadows' feet; a seeded flower is clear of every control's
  drawn circle and at most half hidden by the clump the visit opens with
  (`clump-shade.ts`), on the screen it opens on and on it turned, and kept
  only where both have room; later sizes map it by proportion. Decision
  "Flowers stay put" adds: placed on the visit's opening screen and its turn.
- **L (d271393, b416c45, 262145b, 79bc4cd):** replace "Every stem stands tall
  enough … not by height" with: the clump stands each species' foot by its
  own shift (`CLUMP_SHIFT`, `clump-layout.ts`), so the porcini reads stout
  by a short barrel of a stem (visible stem ~0.58 of its cap, the fly
  agaric's ~0.8). Replace "`capReach` … the layout's reach is the painter's"
  with: the painter stays inside the layout's bound (`speciesReach`,
  `maxReach`). Bees keep clear of the feet standing now and of every
  species' place in free slots (`claimedPlaces`).
- **§ "Rest of the elephant", Open:** drop the porcini, chanterelle and
  flowers-off-feet clauses — all three are met. Keep the rest.
