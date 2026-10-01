# Bite 6 — The fly and the bee — the MPP line

What bite 6 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

6. **The fly and the bee — the MPP line.** Fly and bee buttons join the
   butterfly's column on the left; a press flies one in with its own buzz.
   Flies zigzag fast and settle mostly on the spotted fly agarics, where they
   jitter, rub their legs and hop; bees bob from flower to flower with
   pollen specks in their baskets, and a bee leaving a flower it pollinated
   plants a new one in a ring round it, which grows out of the ground and
   blooms with a chime. Every control in the drawing now works. What the
   next bites build on:
   - `model/`: `insect-genes.ts` (`INSECT_KINDS`, `InsectBody`, `Buzzing`,
     `GenesOf<K>`), `fly-genes.ts`, `bee-genes.ts`; `insect-outline.ts`
     `buzzWing`. `flight.ts` `FLIGHT_HABITS[kind]` (a bee is never offered a
     cap, and never settles back on the flower it leaves); `Perches` carries
     `spotted`, `Sight` a `Plot` (`room`, `seededFlowers`). `insects.ts`
     `INSECT_LIMITS` 4/3/3. `pollen.ts`: `FLOWER_LIMIT` 14, `Sown`,
     `Meadow.planted`, a bee's `pollen`, `specksAt`. `insect-paths.ts` holds
     the per-kind path (`PATH_SHAPES`); `buzz-rest.ts` the rest fidgets, in
     the insect's size units, cut off where they stand on a startle.
   - `ui/scene/`: `flower-bed.ts` owns every flower, seeded and planted;
     `flower-plots.ts` places them, a planted one in one of six ring slots in
     its parent's size; `flower-sight.ts` offers a slot only when it is on
     the ground, clear of feet and heads and in sight on this screen and the
     same screen turned. `draw-fly.ts`, `draw-bee.ts`, `draw-buzz.ts` (wings
     as their own graphics, a translucent fan aloft); `insect-look.ts` per
     kind's parts and fidgets; `insect-voices.ts` and `synth.ts` the buzzes.
     A body's turn is capped at 10.8 rad/s; a landed flier keeps the heading
     it landed on (the fix for bite 5's head-down butterfly). Air spots
     nearer than the widest wingspan are crowded pairs.
   - Placement: a column under the mute on tablets and desktop, a row beside
     the mute on phones; on a 320 px phone the fly and bee buttons share the
     pickers' band and hide while one is open.
   - The play run has a fifth screen (`phoneS`, 320 px) and `--screens`;
     `play-buzzers.ts` and `flier-watch.ts` fail it on a turn over 0.2 rad a
     frame, a settled flier not facing up, overlapping hoverers or a drawn
     span under the floor.
   - Its review (5331309763, T50–T59) is handled: fliers crowd by their own
     kinds' seats and spans, and give way to waiting bees (`perch-room.ts`);
     the air grid seats every limit where the screen allows and a flier with
     nowhere to go hovers; a long flight is capped per kind (`slowest`) and
     darts, then comes in at its kind's pace; a flier faces the way its
     moving perch carries it (`insect-steering.ts`); a released cap settles
     over 1.3 s and a reselect swells on from where it stands (`motion.ts`);
     the sun stands whole in the sky over a valley in the far hills. The play
     run's heading watch is over one bob and passes on every screen.
