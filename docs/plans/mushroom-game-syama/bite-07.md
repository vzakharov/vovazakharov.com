# Bite 7 — Atmosphere

What bite 7 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

7. **Atmosphere.** The meadow has air between its layers and one light.
   The sky pales from a softer blue through near-white to a warm cream at
   the hills, and the sun sits in a clean gold halo; three hill ranges
   recede toward a shared `air`, each misting at its foot and lit on the
   slopes that face the sun; the ground runs lit and yellower far to deeper
   near under soft seeded patches and a grain, meeting the hills on a
   wavering seam; grass is toned by distance. Every creature is inked in the
   dark of its own fill pulled toward an indigo (Syama's pen), heavier in
   shade and thinner toward the light, legs and feelers tapering; shade,
   shine, rim light and cast shadows come from where the sun actually is,
   warm lights over cool shadows. The fly agaric stays red with white spots;
   the HUD discs keep their even ring. What the next bites build on:
   - The colour table is three modules: `palette.ts` (shared: `air`,
     `inkCool`, `ink`…; merges the other two into `PALETTE`),
     `palette-backdrop.ts` and `palette-creatures.ts`.
   - `model/light.ts`: `sunLight(layout)` (a unit vector toward the sun,
     screen axes) and `PICTOGRAM_LIGHT`; the scene hands the light to every
     bed and painter, and a resize repaints, so a turn moves it.
   - `ink.ts`: `inkFor(fill)` takes the fill as drawn, haze included; the
     ink or the fill stands 3:1 off every ground down to `groundDeep`, the
     ink always stands off its fill — a darker line round a light or mid
     fill, the fill's own hue a little lighter round one dark enough to
     stand off every ground itself — and no ink is darker than
     `INK_LEAST`; `lineInk` strokes feelers; `innerInk`, `weightedOutline` (an underlay pushed out by the
     light), `taperedLine`, `facingArc`, `shadowFall`; `colour.ts` is
     Phaser-free, with `darken`, `luminance`, `contrast`. A new creature
     (bite 8's species) is inked and lit through these.
   - The backdrop is `paint-sky.ts` and `paint-land.ts` behind
     `paintBackdrop`'s layer contract; `backdrop-tones.ts` the derived
     colours, `grain.ts` one seeded canvas texture under the grass. No Phaser
     filters and no gradient fills: bands and that one texture.
   - Insects are lit from the sun whatever their heading: each is painted
     in its own frame with the sun turned to match (`turnedLight`), and its
     lit parts are painted again whenever it turns past π/8 (`litTurn`);
     clear wings keep a plain edge. The house stands on its
     mushroom's shadow.
   - The spec and the references' reading are in
     `docs/remove-before-merging/atmosphere/look.md`.
   - Its review (5340556382, T60–T73) is handled: the backdrop and the
     button faces are baked once a paint, and the play run fails a screen
     past a 26 ms median frame (`scripts/lib/frame-budget.ts`) and a flier
     turning past its `TURN_RATE` or lit past `LIGHT_STEP`; the halo fades
     to nothing in four smoothstep layers painted as shaded cells, the hills
     parting wider than it; the wash stops short of every slot's foot; each
     mushroom and flower takes its light from where it stands, the side
     shade scaled by how sideways the sun is; the shine goes down before
     the spots; the stem's foot stands level and rounded over a centred
     contact shadow.
