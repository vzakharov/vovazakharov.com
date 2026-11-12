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
