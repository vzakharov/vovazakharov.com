# Bite 1 — The meadow, still

What bite 1 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

1. **The meadow, still.** `/mushrooms` (in `PAGE_ROUTES`, so in the sitemap)
   paints a sunny meadow and two spotted fly agarics, fresh on every visit
   and the same across a resize. What the next bites build on:
   - `model/` (Phaser-free, under `node:test`): `random.ts` (`mulberry32`,
     `between`, `nextSeed`), `geometry.ts` (`Point`, `Circle`),
     `mushroom-genes.ts` (`CAP_KINDS`, `Mushroom`, `mushroomGenes` for all
     four caps, `domeHeight`, `firstMushrooms`).
   - `model/mushroom-pose.ts`: where a mushroom's parts stand — the stem a
     quadratic curve bending over by the `stemBend` gene, the cap following
     its turn, `splayed` for a placement that faces a mushroom one way,
     `capReach` and `maxReach` for how far a cap gets from its foot. The
     painter and the layout both read it; `layout.test.ts` runs 500 visits'
     opening clumps through it on every screen and holds every opening cap inside
     `EDGE_MARGIN`, and the sun's glow on screen.
   - `ui/meadow-canvas.tsx` imports `ui/scene/start-game.ts` after mount and
     rethrows a failed load into the error boundary. `start-game.ts` sizes
     the buffer in device pixels itself (Phaser's `RESIZE` would blur a
     retina tablet) and writes the ratio to the registry; the scene's camera
     zooms back to CSS pixels, which `layout.ts` is written in.
   - The opening pair is one clump, as in the drawing: feet close, stems
     crossing, caps leaning apart in a V (`CLUMP_SPLAY`); stems run longer
     than the caps are wide, as Syama drew them.
   - `meadow-scene.ts` repaints on resize into the objects it already has —
     `paintBackdrop` takes and returns its layers in painting order, the
     mushrooms and flowers are kept by id — so a rotation moves them and
     leaves them.
     `paint-backdrop.ts` paints the sky, the rosette sun with a many-ringed
     soft glow, clouds one `Graphics` each so they can drift, two hill
     ranges, and ground opening on the near hills' shade. `draw-mushroom.ts` paints genes in ink, flat fill, tapered shade
     crescents (spots over the cap's, each with its own) and a shine, the
     dome sampled by angle and its rim rounded; `shapes.ts` holds `sample`,
     `petal`, `crescent`, `rounded`, `fillShape`, `strokeShape`;
     `palette.ts` every colour, the canvas's pre-paint background included.
   - Frames come from `pnpm play:mushrooms` (below), with `Math.random`
     seeded so two builds compare frame for frame; Chrome's bare
     `--screenshot` leaves a false strip at the bottom of a canvas page.
