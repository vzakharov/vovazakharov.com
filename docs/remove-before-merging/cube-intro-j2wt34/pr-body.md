## Summary

- **`/cube` starts outside.** The player wakes on a small sand island before sunset; the black cube hangs 1.1 m over the sand, a wooden ladder leans to a doorway in its top band, and climbing it leads into floor 1's room, lit by the low sun through that doorway. A walk resumed from its address, or cheated to a floor, starts inside as before.
- **The scenario.** After waking the player turns by themselves, and the hero says "hmm?" once the cube is whole in view. On the ladder the gaze goes aside and comes back forward before the doorway, both hands on the rungs. The ladder is gone once climbed: the first step off the sill is refused with a look down and "The ladder is gone", the second drops the body to the sand. A reload after the waking skips it (`#awake`), and a step off writes nothing to the address.
- **The pace is a walk**, indoors and out. Shift runs while held and a double tap keeps the other pace; the hint for it shows from floor 3 down. A run's footfalls come as often as a walk's.
- **The outside is layers in the cube's own scene pass** — sky, sand, shell, sea — drawn from an eye that is a pose inside or a point in world metres, through a lens that gets used to the light it looks at. Nothing is authored: the sky is a function of direction, the sea an FFT ocean whose one `waterLevel` also wets the sand and times the surf's sound, the island a height function, the shell's bands the floors' own heights. An eye under a wave or under the sea sees the water's body.
- **Three drawing qualities out of doors**, cycled on `Q`: the canvas at 1, 0.75 or 0.5 of the screen's resolution for the frames that draw the outside, deeper floors always at the screen's own. The key's hint shows once the outside draws under 55 frames a second.
- **Floor 1 under the real sun.** The room sits a quarter-turn in its shell so the doorway's beam ends on the pill's shelf, and what stands in the beam is lit by it and shades the room. The lever is a pill on a shelf (E to take, Y to swallow, N to put down).
- **Sound** gains the surf, footsteps by ground, the rungs and the swallow.
- **Around the code**: `src/cube/CLAUDE.md` states the world's four rules; `/carte-blanche` is the mode the build ran under; `pnpm outside:cube`, `scenes:cube`, `pill:cube` and `grip:cube` shoot frames headlessly.

Based on `claude/cube-review-perf` (#275), whose frame-rate meter on `F` this branch carries. Preview: slot 2, https://preview2.vovazakharov.com/cube.

## Brought together as it stands

The operator's word, with the week's limit running out: «по реализации есть ещё мелкие нарекания, но кончаются недельные лимиты, поэтому давай собирать как есть». Left undone (each package's `reports/<name>.md` under `docs/remove-before-merging/cube-intro-j2wt34/` has the detail):

- **What the outside costs.** On an M2 Pro at the screen's own resolution the scene stage takes 59.5 ms waking on the sand and 42.6 ms in floor 1's room, against 3.6 ms on floor 2: every pixel of sand and sea is worked out from formulas each frame, and floor 1 pays for the beach behind its walls. The quality levels are this PR's answer; drawing nothing hidden, thinning the sand with distance and baking what the clock does not move are the next round's.
- **shell** — the indoor frames in the reports predate the room's quarter-turn.
- **sand** — the wet sand's edge retreats along too even a front; a pixel-wide sand-coloured line across the swash near (−19, 21); for an eye inside a crest but over the still sea, sand just under the water is drawn dry.
- **sea** — an arc of foam stands off the west shore in the frame from above, and the cube's shadow lies on the water as sharp and dark as on the sand; neither judged. An eye under water looking steeply up sees the sky.
- **Not decided**: the title («нравилось звучание cubed away»).

## QA Checklist

- [ ] `wake` — open `/cube` with no fragment: "Press any key", the lids part, the body sits up and stands facing the sea; nothing turns the eye for the player.
- [ ] `hmm` — turn until the cube is whole in view: the hero says "hmm?", once.
- [ ] `beach` — walk the sand to the waterline and back: the surf is heard where it is seen, footsteps change with the ground, the wet sand follows the waves.
- [ ] `pace` — the body walks; Shift held runs; a double tap of Shift keeps running and another keeps walking; a run's footsteps are as frequent as a walk's.
- [ ] `under-wave` — wade out until a crest passes over the eye: the frame below the surface is dark teal, never grey.
- [ ] `quality` — press `Q` on the island: "Quality: medium", then low, then high; edges coarsen, the clouds do not turn to blocks. On a slow machine "Press Q to change the quality" shows by itself.
- [ ] `bands` — from the ladder's foot the cube reads as black with graphite-satin bands, no construction grey, no pink or brown.
- [ ] `climb` — at the ladder's foot "Press E to climb the ladder": both hands on the rungs, the gaze aside and back before the doorway; inside, the ladder is gone.
- [ ] `dazzle` — in the room the doorway is a white dazzle that eases as the eye turns to it, and the room darkens then recovers on turning away.
- [ ] `beam` — the doorway's light lies across the floor and ends on the pill's shelf; the bench standing in it is lit.
- [ ] `step-off` — walk out through the doorway: the first time the body stops, looks down, "The ladder is gone"; the second time it falls to the sand, unhurt.
- [ ] `pill` — "Press E to take the pill", then "Press Y to swallow, N to put down": N puts it back; Y shrinks the body, which can then drop through the hole to floor 2.
- [ ] `sharp-below` — at low quality, fall through floor 1's hole: floor 2 draws at the screen's full sharpness.
- [ ] `run-hint` — on reaching floor 3 "Hold Shift to run, double-tap to keep running" shows until Shift is pressed.
- [ ] `reload` — reload on the island after the waking: the body stands awake, no waking scene; reload from a fragment written on floor 2 or deeper: the walk starts inside.
- [ ] `meter` — press `F` out of doors and inside: frames a second and the GPU's stages show and hide.
- [ ] `no-webgpu` — a browser without WebGPU still gets the one-line notice.

| Item          | Automatable | Covered? | Notes                                                                                                    |
| ------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `wake`        | unit        | ✅       | `scenes.test.ts` holds the waking's end facing the sea; the look is an eye's call                        |
| `hmm`         | unit        | ✅       | `sight.test.ts` (`seesWhole`) and `abroad.test.ts` hold the cue, once                                    |
| `beach`       | manual-only | —        | Sound against picture, and how wet sand reads                                                            |
| `pace`        | unit        | ✅       | `pace.test.ts` (hold and double tap), `play.test.ts` and `roam.test.ts` (a run steps as often as a walk) |
| `under-wave`  | manual-only | —        | `pnpm outside:cube --at 45,0,30 --yaw 200 --pitch -8` shoots it; the colour is an eye's call             |
| `quality`     | unit        | ✅       | `quality.test.ts`: the levels, the cycle, the frame-rate mark; the look is manual                        |
| `bands`       | manual-only | —        | `pnpm outside:cube --eyes ladder-foot`; a look judged against `frames/shell/bands-abc-*.webp`            |
| `climb`       | unit        | ✅       | `threshold.test.ts`, `scenes.test.ts`, `intro-stage.test.ts` (both hands drawn, one in sight)            |
| `dazzle`      | unit        | ✅       | `adaptation` is a pure function with tests; how it feels is manual                                       |
| `beam`        | unit        | ✅       | `reception-beam-boxes.test.ts` pins the boxes; `pnpm outside:cube --eyes in-beam` shoots the bench       |
| `step-off`    | unit        | ✅       | `abroad.test.ts` (`refusedAt`, `findsLadderGone`) and `threshold.test.ts`                                |
| `pill`        | unit        | ✅       | `features/player` tests play the take, the answer and the shrink; `pnpm play:cube` shoots it             |
| `sharp-below` | manual-only | —        | The level's reach is one line in `cube-scene.ts`; a canvas's size needs a browser                        |
| `run-hint`    | manual-only | —        | The hint is `walk.ts`'s, which no test mounts                                                            |
| `reload`      | unit        | ✅       | `start.test.ts`: `ashore` is `asleep`, `awake` or null by fragment                                       |
| `meter`       | manual-only | —        | Needs a real GPU: SwiftShader has no `timestamp-query` to speak of                                       |
| `no-webgpu`   | manual-only | —        | A browser setting                                                                                        |

https://claude.ai/code/session_016Z4TKqfdhduUecpY8zFSAJ
