## Summary

- **`/cube` starts outside.** The player wakes on a small sand island before sunset; the black cube hangs 1.1 m over the sand, a wooden ladder leans to a doorway in its top band, and climbing it leads into floor 1's room, lit by the low sun through that doorway. The ladder is gone once climbed; stepping off the sill drops the body back to the sand. A walk resumed from its address, or cheated to a floor, starts inside as before.
- **The outside is layers in the cube's own scene pass** — sky, sand, shell, sea — drawn from an eye that is a pose inside or a point in world metres, through a lens that gets used to the light it looks at. Nothing is authored: the sky is a function of direction, the sea an FFT ocean whose one `waterLevel` also wets the sand and times the surf's sound, the island a height function, the shell's bands the floors' own heights.
- **Floor 1 under the real sun.** The room sits a quarter-turn in its shell so the doorway's beam ends on the pill's shelf, and what stands in the beam shades the room. The lever is a pill on a shelf (E to take, Y to swallow, N to put down).
- **Sound** gains the surf, footsteps by ground, the rungs and the swallow.
- **Around the code**: `src/cube/CLAUDE.md` states the world's four rules; `/carte-blanche` is the mode the build ran under; `pnpm outside:cube`, `scenes:cube`, `pill:cube` and `grip:cube` shoot frames headlessly.

Based on `claude/cube-review-perf` (#275), whose frame-rate meter on `F` this branch carries. Preview: slot 2, https://preview2.vovazakharov.com/cube.

## Brought together as it stands

The operator's word, with the week's limit running out: «по реализации есть ещё мелкие нарекания, но кончаются недельные лимиты, поэтому давай собирать как есть». Left undone, by package (each one's `reports/<name>.md` under `docs/remove-before-merging/cube-intro-j2wt34/` has the detail):

- **shell** — the bench in floor 1's beam shades itself (the fix is in `slabShade`); its pin test still reads `standingBoxes`; the indoor frames predate the room's quarter-turn.
- **sand** — the wet sand's edge retreats along too even a front; a pixel-wide sand-coloured line across the swash near (−19, 21).
- **sea** — an arc of foam stands off the west shore in the frame from above, and the cube's shadow lies on the water as sharp and dark as on the sand; neither judged.
- **walk**, **pill**, **sea**, **shell** — `/dry` and `/tend-prose` over their own diffs. `/polish` has not run on this branch; `/finalize` runs it before anything lands.
- **`./scripts/vet.sh` is red on two checks**, both in the `source` job of [run 43428585850](https://github.com/vzakharov/vovazakharov.com/actions/runs/43428585850) on 79d82bca; every build, the lint, the type check and the tests pass. `knip` names 47 unused exports and 20 unused exported types across `src/cube/` — what parallel packages exported for each other and nobody took. Steiger's `fsd/shared-lib-grouping` counts 19 modules in `src/cube/shared/lib` against its threshold of 15. Neither is fixed here.
- **Not decided**: the title («нравилось звучание cubed away»).

## QA Checklist

- [ ] `wake` — open `/cube` with no fragment: the lids part, the body sits up, stands and turns to the cube whole in frame, about 15 s; "Press any key" skips nothing it should not.
- [ ] `beach` — walk the sand to the waterline and back: the surf is heard where it is seen, footsteps change with the ground, the wet sand follows the waves.
- [ ] `bands` — from the ladder's foot the cube reads as black with graphite-satin bands, no construction grey, no pink or brown.
- [ ] `climb` — at the ladder's foot "Press E to climb the ladder": hands land on the rungs, a cue to each; inside, the ladder is gone from the doorway.
- [ ] `dazzle` — in the room the doorway is a white dazzle that eases as the eye turns to it, and the room darkens then recovers on turning away.
- [ ] `beam` — the doorway's light lies across the floor and ends on the pill's shelf; the hole is out of it.
- [ ] `pill` — "Press E to take the pill", then "Press Y to swallow, N to put down": N puts it back; Y shrinks the body, which can then drop through the hole to floor 2.
- [ ] `step-off` — walk out through the doorway at full and at half height: a fall to the sand, unhurt, and no ladder back.
- [ ] `resume` — reload from a fragment written on floor 2 or deeper: the walk starts inside, no island scene.
- [ ] `meter` — press `F` out of doors and inside: frames a second and the GPU's stages show and hide.
- [ ] `no-webgpu` — a browser without WebGPU still gets the one-line notice.

| Item        | Automatable | Covered? | Notes                                                                                                                                |
| ----------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `wake`      | manual-only | —        | `pnpm scenes:cube --scenes waking` shoots the storyboard; the timing is pinned in `features/player` tests, the look is an eye's call |
| `beach`     | manual-only | —        | Sound against picture, and how wet sand reads                                                                                        |
| `bands`     | manual-only | —        | `pnpm outside:cube --eyes ladder-foot`; a look judged against `frames/shell/bands-abc-*.webp`                                        |
| `climb`     | unit        | ✅       | `threshold.test.ts` and the scenes' tests hold the rung cues, the eye passing inside once, `ladderGone`                              |
| `dazzle`    | unit        | ✅       | `adaptation` is a pure function with tests; how it feels is manual                                                                   |
| `beam`      | unit        | ✅       | `reception-beam-boxes.test.ts` pins the boxes; the stage's shelf is held against the planted pill                                    |
| `pill`      | unit        | ✅       | `features/player` tests play the take, the answer and the shrink; `pnpm play:cube` shoots it                                         |
| `step-off`  | unit        | ✅       | `threshold.test.ts`: `isPastSill`, `onSill`, the fall at either height                                                               |
| `resume`    | unit        | ❌       | `startOf` with a fragment yields `ashore: false`; no test names it                                                                   |
| `meter`     | manual-only | —        | Needs a real GPU: SwiftShader has no `timestamp-query` to speak of                                                                   |
| `no-webgpu` | manual-only | —        | A browser setting                                                                                                                    |

https://claude.ai/code/session_016Z4TKqfdhduUecpY8zFSAJ
