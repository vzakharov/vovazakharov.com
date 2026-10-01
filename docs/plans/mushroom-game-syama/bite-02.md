# Bite 2 — The meadow alive, and heard

What bite 2 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

2. **The meadow alive, and heard.** Clouds drift, the grass sways in a gust
   seen travelling across it, mushrooms breathe; a tap wobbles a mushroom
   (squash and stretch that keeps its volume, and a rock, over about two
   seconds) and puffs two rings of opaque spores that shrink away. Seven seeded flowers sway and bloom open when
   tapped, each chiming its own note. A breeze, the odd bird, pop, boing and
   chime are synthesized; a mute pictogram sits top left. What the next bites
   build on:
   - `model/motion.ts`: every movement a pure function of the clock —
     `breath`, `sway`, `wobble` and `bloom` of the time since a tap, `drift`,
     `widthFor`. The scene's `update` sets every scale, rotation and drift
     from the layout and the clock, so a resize never interrupts a movement;
     a new creature's idle loop and its tap reaction go there, tested.
   - Bases: `Seeded` (`random.ts`), `Bent` (`geometry.ts`), `Phased`
     (`motion.ts`), `Footing` (`layout.ts`: a foot and a size). A creature's
     loop phase comes from its seed (`phaseOf` in the scene).
   - `model/flower-genes.ts` and `draw-flower.ts`: a flower is a container on
     its foot holding a stem graphics and a head graphics, so sway turns the
     container and bloom scales the head. `meadowLayout` takes the visit seed and
     places flowers by it: each jittered off a slot by its own stream (so a
     resize keeps it), kept only where `clearOfFeet` holds, sized off the
     clump's unit so a flower is always shorter than a stem — bite 6's bees
     plant through the same check. A mushroom's shadow is its own graphics,
     never rotated. `colour.ts` holds `mix` and
     `nudgeHue`; `grass.ts` draws the seam's grass and the tufts each frame,
     `tufts.ts` tends the tufts; `spores.ts` puffs; `hud.ts` draws the mute button.
   - `sound.ts`: `MeadowSound`, built on the first tap's release (a browser's
     activation rule) and playing then whatever was asked before it; the
     scene's field is `voice`, since `Phaser.Scene` owns `sound`. A mute suspends
     the whole synth once faded, and `settle()` keeps it suspended while muted
     or hidden. The mute is
     remembered in `localStorage` and falls back to unmuted where storage
     throws — the one silent fallback in the game, awaiting the operator's
     approval on the PR.
   - Taps land on hit areas no smaller than `TAP_RADIUS` (32 CSS px); the
     front-most object takes the tap, depth being where its foot stands.
