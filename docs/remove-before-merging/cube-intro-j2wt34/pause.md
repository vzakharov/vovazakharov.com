# The pause of 2026-11-12 23:12Z

Every child pushed and waits for the word "resume". Each entry is the child's own pause report, condensed: head, done, red or half-done, what it does first. **Several of the lead's messages between 22:37Z and 23:09Z reached the children late or never** (walk, shell and sky say so; sea got ten at once after the pause), so "resume" carries the whole list again rather than "see my last message".

## core — 6de69066 (wip; the lead at 420476f1 merged in)

- Done: steps 2–4 (2ac8a67d). In the wip: the sky map out — `skyRadiance(dir, lod)` a pure function, group 0 the frame block alone, visible to VERTEX and FRAGMENT; `kit.skyMap`, `kit.mips`, `SKY_MAP`, `SKY_MAPPING` gone. The ladder's flag: `OutdoorFrame.ladder: boolean` (type `Laddered`), WGSL `frame.state.x` = 1 while it stands, set from the frame hook's optional `ladder`.
- Red: eslint `vova/no-default-true` on the ladder default in `cube-scene.ts` (invert to `ladderGone`); `masd:clusters` fails after the merge, not looked at; shell's four lint errors.
- First: the flag's name, then tell shell and walk; `masd:clusters`; re-shoot; the `Pose` ↔ `Outside` handover at the doorway (ask walk about scale on `Outside`); walk's ask — `setEye` taking `moving` quads.

## sky — 85105b1c (the lead at 52ad477b merged in)

- Done, compiles, never looked at: the sky as pure functions under `src/cube/shared/sky/` — an atmosphere model in TS fitted at module load (~165 ms) to a closed form, `clearSky(dir)`; `aerial()` and `skyRadiance(dir, lod)` filled, no sun disc at any lod; clouds as lattice noise on the kit's hash with a rolled salt, hour-periodic, marched each frame into a quarter-size target of that frame; `skyLayer` in `pages/cube/ui/sky-layer.ts`.
- It rewrote the light in `shared/outside/sun.ts` from its model: sun [8, 4.88, 2.14], sky [1.01, 1.44, 2.39], new `GROUND_FILL` [0.16, 0.12, 0.07], `HORIZON_FILL`, `SUN_WHITE`. **The sky outweighs the 9° sun on flat ground again** — "what the physics gives". Sand's first frames went grey-blue under such a fill; judge it on frames before accepting.
- Red: no frame since the rewrite, cost unmeasured against 3 ms; lint, masd, type-overlap not run; no tests.
- First: frames, cloud shapes and the march's cost; tests; gates.

## sea — 218db0f0 (not merged with core's step 2)

- **218db0f0 is the FFT reference**, the head of `claude/cube-intro-sea`. Sea may push only its own branch, so there is no `-sea-fft` branch; the commit is the ref, and the analytic sum goes on top of it in new commits.
- Done: spectrum and four FFT cascades in compute; `waterLevel` as closed-form surf and swash with a WGSL-run twin test; the sea as a `LayerMaker` (root `SEA` from `@/cube/shared/sea`): polar mesh with a measured sector, Fresnel, glitter, water body, the bed through shallow water, foam, the surface from underneath. 31 tests.
- Breaks the newer rules: the wave maps and the sky-map binding are textures; the spectrum's phases come from its own hash and Box–Muller, not `rollWith`; the swell's drift and set are hand-written constants. Already compliant: no frame-to-frame state.
- Red: never run in core's renderer; not in `OUTDOOR_SHADERS`; gates not run; glitter tiles from high up; the breaker's band too uniform a white.
- First: merge core, wire in, shoot core's eyes; the analytic sum; `sandBed`; `shoreWetness` for sand; the WGSL-in-Node kit in `shared/lib`.

## sand — 420476f1 (the lead's own head; nothing red)

- Half-done: six frames of the merged tree shot in its `tmp/`, not yet looked at.
- First: judge them (pink or gold under the real lens, the sea's edge), fix the albedo; then `shoreWetness` and the test kit when sea lands them.

## shell — 480f5650

- Done: doorway cut (in `world/model/geometry.ts`, 390 lines); floor 1's sun (kit `sunlit`); `DOOR_LADDER` facts and `LADDER_WGSL` (renamed from `LADDER`); vector ops in `shared/lib/vec.ts`; real `cubeShadow`; shell mesh, material, shader and layer (`pages/cube/lib/shell-{mesh,material,shader}.ts`, `ui/shell-layer.ts` exporting `shellLayer`). Lint green.
- Red: `pnpm type-overlap`, one group — `level: number` in `shared/outside/beam.ts` `End`; a rename.
- Half-done: judged only on its own stand, not in the renderer; ladder wood too bright in full sun, underside faint; no outside frames committed.
- First: the overlap; merge the lead; its layer in core's stand-in's place (`OUTDOOR_SHADERS.shell`, the renderer's `MAKERS`); re-shoot under the real sun; the ladder's flag from core.

## walk — 4385dc60

- Done: scene engine, outside controller, four tracks, legs, threshold, all tested; bare `/cube` asleep on the shore → waking → roam → climb on E into floor 1 as a `Pose`; `pnpm scenes:cube` shoots a scene every half second. Core merged up to 0e1081af.
- **Still has what the operator cut**: a look-under scene, and "E by the doorway goes back down". To be: no look-under; the ladder gone once climbed (it writes core's flag); out by stepping off the sill, a 3.6 m fall unhurt, at full or half height; no way back in.
- Half-done: the waking strip, 29 of 39 frames in `tmp/` — 1.5–5 s is near-featureless white (2.6× exposure too much), and the sit-up shows only sand and haze, no sea line or cube: retime.
- First: merge the lead and core; shell's ladder facts in place of its placeholder; the cuts above; strips under `frames/walk/`; hands on rungs with pill's `RUNG_GRIP`.

## pill — 113f5749 (the lead at ed5e98f8 merged in)

- Done: shelf and pill on every floor at the lever's place (lever gone); hand poses, `RUNG_GRIP`, `hand`, `padOf`; the act E → pinch → before the eyes → mouth → shrink; floor 1 holds and asks Y/N; the pill back on its shelf the first frame the shelf is out of sight, nothing stored.
- Red: 7 lint findings; gates not re-run since the merge.
- **Not told yet**: the prompt says "swallow", not "drink" (the operator, on the board).
- First: lint, gates, merge the lead, shoot floors 1, 2, 5 in the doorway's sun, the rung grip.

## sound — 96459da7

- Done: every cue; the outside as sub-slice `features/sound/outdoors` (surf read off `waterLevel`, wind, the cube's hum, doorway muffling); `Hearing.outside(at, nowMs)` and `Hearing.body(cues, at)`; bench `pnpm sound:cube`. 82 tests, lint and masd green.
- Red: `pnpm type-overlap`, two renames on its side.
- First: the overlap; merge the lead and pass the outside eye from the page; re-measure on the real sea. Needs: walk emitting `step` with `ground`, `rung`, `splash`, `say 'waking'`; pill emitting `pill` and `swallow`; shell setting `LADDER_MATERIAL`.

## board — 9fd5e233, version 57, clean

- Last card: `intro-ghosts` (sticky, `box: [6400, -1240, 280, purple]`) in `src/cube-board/app/config/cube/intro.yaml`. Rebuild with `pnpm -s board build src/cube-board/app/config/cube.yaml`, then `pnpm -s board refile …`; output `tmp/board/cube/index.html`, 163 items.
- **The artifact's comment subscription belonged to the stopped session.** Its successor takes over watching the artifact, or the operator's comments sent to Claude reach nobody.

# What the stopped sessions' last messages add (read 2026-11-13)

No session edited, committed or pushed anything after its pause report. What their tails say beyond the entries above:

## core

- Lint was 14 errors in all: its own `vova/no-default-true` at `cube-scene.ts` 280:24; the rest are shell's, fixed on shell's branch.
- The frame block ends with a `state` member after `clock`. `src/cube/shared/outside/outside.test.ts` was rewritten by script minutes before the commit (a new test, "binds nothing but the frame") — read it over. 72 of 72 shaders, 73 tests.
- `ladder` on the frame hook is optional and "stands unless false" — the default the lint objects to.
- It never told sky and sea that `SKY` has no binding now.
- On the doorway handover: floor 1's mesh is already the outside eye's frame, so no rebuild; verify no dropped frame.
- A package may point its `OUTDOOR_SHADERS` entry at its `shared/<name>` root, as sand does: that is the intended pattern.

## sky

- There is no sun disc or halo in `skyRadiance` at any lod; both live in the backdrop only. The lead wants the disc at lod 0 and only a halo above it.
- `cloudVeil` plus the clear-sky formula costs more than the few dozen operations a pixel the sea's reflection path was promised.
- Expect a merge conflict in `pages/cube/ui/sky-layer.ts` against core's stand-ins (`pages/cube/lib/sky-shader.ts`, `shared/outside/daylight.ts`); resolve for the pure function, no sky-map `prepare`.
- The renderer does not call `skyLayer` yet. Shaders registered as `sky: [SKY_SHADER]` and `skyClouds: [SKY_CLOUD_SHADER]`; the layer is `skyLayerAt(scale)`, its target `rgba16float`. The fit is within 1.7% of the model.
- Files: `src/cube/shared/sky/{atmosphere,clear-sky,cloud-field,cloud-noise,clouds,sky-fit,sky-light,sky-shader,sun-glow,index}.ts`; edited `shared/outside/{sun,sky,aerial,index}.ts`. The first shot was to be `pnpm outside:cube` at yaw −31°.
- Its `SKY_FILL` [1.01, 1.44, 2.39] is about double the lead's [0.65, 0.87, 1.2]; it meant to justify it with numbers or re-check the model after the first frame.

## sea

- The layer is `pages/cube/ui/sea-layer.ts` with `./sea-wave-field` (`createWaveField`); four frames under `frames/sea/`. Core's 0e1081af and 2ac8a67d are not merged. GPU time unmeasured (SwiftShader only); the line limit not run.
- Not started: `seaHeightAt`, `rollWith`, the sun at −31°.
- It wanted a `claude/cube-intro-sea-fft` branch before starting the analytic sum. There is none and none is needed: 218db0f0 stays an ancestor of everything built on top.
- The bed is a plain colour until sand's `fn sandBed(xz: vec2f, depth: f32) -> vec3f` (piece `SAND_COLOUR` from `@/cube/shared/sand`).

## sand

- It never read its message queue, so nothing the lead sent after ~22:40Z reached it. "Done" is everything it reported at 08539b3c. Its six frames were in its own container: re-shoot.

## shell

- Every room frame and the beam's tuning were made under the old sun: redo. Its blurred-reflection lookups read the sky map: rewrite on `skyRadiance(dir, lod)`. The material's hash salts and the ladder's paint are unchecked against `roll`.
- The ladder is wood; the lead prefers aluminium. `LADDER_MATERIAL: 'aluminium' | 'wood'` in `src/cube/shared/lib/acoustics.ts` defaults to aluminium.
- It added vector ops in `shared/lib/vec.ts` beside the world entity's (`src/cube/entities/world/model/quad.ts`); making that one import from the shared file is still to do.
- Additive edits in others' files: `shared/outside/index.ts`, `cube-shadow.ts` (needs `SUN_DISC` and `LADDER_WGSL`), `world/index.ts` (`WALL_HALF` re-exported from `shared/lib/room-shape`).
- The overlap is `End` in `src/cube/shared/outside/beam.ts` against `Backdrop` in `src/mushrooms/entities/landscape/ui/paint-backdrop.ts`.
- Unwritten: the test pinning `RECEPTION_SHRUBS` to the furnished plants. Untuned: leaf transmission, the dust shaft. The floor's glare at the sill is to go from white to the sun's colour with the carpet's speckle showing.

## sound

- Wind level went 0.12 → 0.16 after the last bench run, not re-measured. `cube-canvas` still passes `player.pose`, not the outside eye. `pages/cube/ui/hearing.ts` stays.
- The overlaps: `Listener.facing` in `src/cube/features/sound/outdoors/model/mix.ts` (against mushrooms' `Faced`) and `Stack.share` in `.../outdoors/model/hum.ts` (against `GrainStrip`).
- A scripted rename went in seconds before the commit — `sampleRate` → `takenAt` in `src/cube/scripts/lib/cue-takes.ts`, `yaw` → `facing`, a new `Sounding = Timed & Resonant` in `features/sound/dsp/lib/dsp.ts`; 82 tests passed after it. Read it over.
- From the lead's late messages: audit every noise seed against `roll` / `rollWith`; the surf needs a TS twin of `waterLevel` (names from sea); the jump off the sill reuses `landing` with ground `sand` — check it scales at half height and tell walk which cue.
- Measured: the hum is −4 dB under its masker at the waking spot, +8 dB at the ladder, +12 dB under the cube.

## walk

- `src/cube/pages/cube/lib/start.ts` went into the wip commit unreviewed. 142 tests. The descent and the look-under are written and wired — to be taken out.
- The outside controller must take the body's scale (eye height, stride, swimming) for the half-height exit. The eyelids come from `OUTSIDE_LENS` (exposure and eyelids 0…1), and the waking scene opens them.
- Still to merge: the lead, core's newer commits, sound's cue names (`origin/claude/cube-intro-sound`).
- The lead asked that the climb's last frame look down the beam at the pill's shelf.
