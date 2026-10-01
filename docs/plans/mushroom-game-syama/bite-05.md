# Bite 5 — The butterfly

What bite 5 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

5. **The butterfly.** A butterfly button heads a column on the left, as the
   drawing has it; a press flies one in from off screen on a curve, and it
   goes between flowers and caps, drinking at a head, resting on a cap facing
   up the screen with its wings slowly opening and closing, bobbing as it
   lands. A tap on one at rest sends it off with a trill. A butterfly on a
   sinking mushroom flies off; past four, the oldest flies away. What the
   next bites build on:
   - `model/insect-genes.ts` (`Insect = WithId & InsectSeed`, `insectGenes`;
     `Nudged` is the hue-nudge base mushroom and insect genes share, in
     `random.ts` with `pick`), `model/insect-outline.ts` (the shapes and
     `wingspan`, read by painter and layout alike).
   - `model/flight.ts`: `Perch` (a flower or a cap by id, `away` by side,
     built from `PerchKind` and `SIDES`, which the probe's schema derives
     from), `Leg`, `Flight`; the next leg a pure function of seed, leg count
     and what the scene can see — the flowers in sight and the perches too
     close together, from `ui/scene/perch-sight.ts` — skipping perches other
     fliers hold. `model/insects.ts`: `Flier`, `INSECT_LIMITS` and the
     reducer helpers; `evicted` counts the releasing kind only. `game.ts`
     gains `insects`, `released` and `release`, `startle`, `tick`; `tick`
     and `startle` hand back the same `Meadow` when nothing changed, and the
     scene skips reconciling then.
   - `model/insect-motion.ts` (ms, where `motion.ts` is seconds):
     `flightPoint`, `heading`, `tilt`, `wingBeat`, `landingBob`; the body's
     turn (`bodyTurn`, continuous across ±π), a leg cut short mid-air
     carrying its lift and speed on, `drinking` and `proboscis`, and
     `drinkDip`, which the scene applies to the flower's head. A tap on a
     resting butterfly goes through to what it sits on.
   - `draw-insect.ts` paints hind wings, fore wings and body into three
     graphics in one container; `insect-view.ts` owns the butterflies on
     screen, starting each leg from the last drawn point as a screen
     fraction and following its perch each frame (`MushroomBed.capTop`).
     Butterflies draw above the meadow and under the buttons, and take the
     tap first; `hit-areas.ts` gains `TappedFigure`. `sound.ts` gains
     `trill`; `hud.ts` `drawButterflyButton`.
   - Placement: level with `+` on tablets, desktop and phone portrait; beside
     the mute on phone landscape and a 320 px phone. `insect-layout.test.ts`
     holds the butterfly's size (at least 52 px, narrower than any clump
     cap). `scripts/lib/play-insects.ts` plays releases, the limit, taps and
     a sinking perch on every screen; a step draws only its last frame, so a
     full run takes ~2.5 minutes.
