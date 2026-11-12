# The outside: the contract every package builds to

The lead's design for the cube's intro, for every child session. Read this, then `facts-render.md`, `facts-play.md`, `facts-island-board.md`, `facts-frames-gates.md` and `facts-sound-floor1.md` in this directory as your package needs them (the last two may still be landing — `git fetch origin claude/cube-intro-j2wt34` and look again). The plan, with the operator's brief verbatim, is `docs/plans/cube-intro.in-progress.md`; only the lead edits it. A decision here that turns out wrong against the code is reported to the lead with what you measured, not worked around in private.

## What is being built

The player wakes lying on the shore of a tiny sand island at golden hour, feet in the swash, looking out to sea at the low sun. They get up, turn round, and see the cube: 5 × 5 × 5 m, hanging about a metre over the sand, black with grey bands whose heights halve downward (the floors' own slabs), an open doorway in the top band and an ordinary ladder leaning to its sill. They can walk the island and swim out. Nearing the cube, a scripted look under it: nothing holds it up. At the ladder, E climbs up and through the doorway into floor 1's room, which is lit by that same sun through the doorway and nothing else. From there the game is the game, except that every lever is now a pill on a small shelf.

The bar, in the operator's words: «он должен быть отрисован супер-пупер, прям супер-пупер, не отличишь от настоящего. И вода, с прибоем и шумом, и солнце и облака в небе -- всё, разумеется, процедурно-детерминированно». The first run's verdict on a first attempt was «это на пару порядков лучше чем было но это не уровень AAA». Look at your own frames and iterate on what you see; a package is not done when it compiles.

## Rules that hold for every package

- **Determinism, in place and in time**: two people at the same point at the same moment see and hear the same thing. No `Math.random`, no frame-count state that changes the picture, no input-dependent noise. Randomness comes from the cube's seeded rolls (`src/dice`, and the hash pieces in `src/cube/entities/theme/kit/lib/hash.ts` for WGSL).
- **Every motion is periodic in the hour.** The shared clock gives `seconds` into the hour (0–3600) and `hour`. Anything that moves — waves, swash, clouds, hum — is a function of `seconds` that returns to itself at 3600, so nothing jumps on the hour and nothing needs a large float. A wave spectrum's frequencies are quantised to multiples of 2π/3600; a cloud field drifts a whole number of its tiles per hour.
- **Everything procedural**: no image, mesh or audio asset. Textures are drawn in code.
- **No outside services, no new runtime dependency** without the lead's word.
- **The repo's conventions are not negotiable**: MASD (`.claude/rules/masd.md`), the linters, no lint-suppression comments, no `interface`, `pnpm type-overlap`, kebab-case, and **no text file over 400 lines** — split at a seam before you reach it. Several files you may touch are already near it (`cube-canvas.tsx` 362, `geometry.ts` 346, `hands.ts` 327, `play.ts` 313, `renderer.ts` 297, `cube-scene.ts` 270). «Чистый, красивый, сухой код».
- **Tests**: anything that is a pure function of its input gets a `node:test` beside it (`.claude/rules/testing.md`). A WGSL function with a TS twin gets a test that the twin is what the WGSL says where that is checkable.
- **Never touch `main`, open no PR, publish no preview, ask the operator nothing.** Work on your own branch, push every step that passes, `wip:`-commit every few files (a container can restart without warning). Commit subjects use the repo's prefixes.
- **Before you report**: quick gates green for what you touched (`facts-frames-gates.md`), `/dry` and `/tend-prose` run over your own diff, frames of your work under `docs/remove-before-merging/cube-intro-j2wt34/frames/<package>/` committed (a handful, `.webp` or `.png`, each under 300 KB) with one line each on what it shows.
- **Report** with `mcp__claude-code-remote__send_message` to `session_01DaohkEr63nSs6fbnbbEpGd`: your branch and head, what is built and wired, what is left, what you need changed outside your files, each place you departed from this contract and why. Then end your turn; the lead's next message wakes you. Report early as well as at the end: the first time you have a frame worth looking at, say so.

## The world frame

- **W, in metres**: x east, y up, z south, right-handed; still sea level is y = 0. The cube's own frame C (`entities/world/model/frame.ts`) is floor 1's room sides with its origin at the north-west corner of floor 1's room on its slab, so `W = CUBE_AT + 5 · C`, no rotation. In C the cube is x, z ∈ [0, 1], y ∈ [−0.5, 0.5].
- **"East" is the frame's word, not the world's.** The sun's azimuth is defined as the doorway wall's outward normal, whichever wall that is.
- **The sun does not move**: elevation 9°, azimuth the doorway's normal. `SUN_DIR` (unit, toward the sun) is one TS constant, interpolated into every shader that needs it.
- **The cube hovers with its underside 1.1 m over the sand beneath it**, above the island's crest. At 9° its shadow starts about 7 m behind it, so the sand under it is sunlit.
- **The staging line** runs from the cube out through the doorway toward the sun: ladder at the doorway, then about 30 m of gently falling beach, then the waterline where the player wakes, feet seaward. The island is small — some 90 m along that line, 45 m across, the crest about 1.6 m over the sea — and falls away steeper on the far side.

## One renderer, one HDR target

The cube's renderer (`src/cube/pages/cube/ui/renderer.ts`) stays the only one. The outside joins its scene pass; `facts-render.md` § 4 has the constraints, of which these bind everyone:

- Three colour targets, all `rgba16float`, no blending, no MSAA; depth `depth32float`, reversed-Z (`depthCompare: 'greater'`), not readable.
- **Target 0's alpha is metres from the eye**, not opacity; `1e4` means sky. Target 1's alpha is mirror strength: write 0 unless you mean to be a screen-space mirror.
- Nothing translucent in the scene pass. Water shows its bed by computing it (below), not by blending over it.
- Draw order in the scene pass: sky backdrop, sand, the cube's shell and ladder, the rooms and what moves in them, the sea.
- The far plane outside is 20 km; sight (`FAR` = 24 room sides) stays what `sight()` uses for rooms. Reversed-Z in float keeps the precision.

**Light, in the scene's own linear units**, where floor 1's lamps are 1.5 and bloom starts at 1.0:

- A white Lambert face square to the sun shows `SUN_LIGHT` ≈ 8 × (1.0, 0.62, 0.33). Flat ground gets `sin 9°` ≈ 0.156 of that.
- The sky lights a white upward face to about 2.6, bluer than the sun. `SKY_FILL` and a ground-bounce term come from the sky package; until then the core's placeholders.
- So dry sand on the flat sits near 1.5–2, a sunlit wall inside the room near 4 and blooming, the sun's disc in the hundreds. The outside's own lens exposes for that; floor 1's lens (exposure 1) sees the doorway overexposed, as an eye in a dim room would.

## The seam (package `core`)

`core` lands the pieces two or more packages need, with their final signatures and placeholder bodies, so everyone else builds against them from the first hour:

- **Where the eye is**: a union the page holds — inside (`Pose`, as today) or outside (`{ eye: Vec3 in W, yaw, elevation }`). `cube-scene.ts` renders an outside eye with floor 1's room as the fixed mesh frame, so the real room shows through the doorway. The `?play` hook gains a way to set an outside eye, so any package can shoot an outside frame headlessly.
- **`OutdoorFrame` uniforms**, one buffer bound as group 0 for outdoor pipelines: `viewProjection` (W → clip), its inverse, `eye` (W), `sun` (`SUN_DIR`), `clock` (seconds, hour, canvas size).
- **A layer shape** every outdoor drawer has: made from the device and the shared layouts, an optional `prepare(encoder, frame)` for its own passes before the scene pass (FFT, sky map), `draw(pass)` inside it, `dispose()`. The renderer holds the layers in the order above.
- **WGSL pieces with TS twins**, each one a single source interpolated both ways where it can be:
  - `islandHeight(xz) -> f32` — metres over still sea level, negative under water. Body owned by `sand`.
  - `waterLevel(xz, t) -> f32` — the sea's slow surface: still level plus surge and swash, without wind waves. `waterLevel > islandHeight` means under water now. Body owned by `sea`. The sand's wetness, the surf's sound and the waves on the player's feet all read this one function, which is what keeps them in step.
  - `cubeShadow(p) -> f32` — 1 in sun, 0 in the shadow of the cube and the ladder, soft with distance. Body owned by `shell`.
  - `skyRadiance(dir, lod)` — a sample of the sky map (equirectangular `rgba16float`, mipped), for reflections and fill. Map owned by `sky`.
- **The outside lens**: tone mapping and exposure for an eye outdoors, since lenses are per floor today.
- **Where the code lives.** The maths and WGSL of sky, sea and sand import nothing of the cube's but `shared` — only `kernel`, `scene`, `dice` beyond that — because the island game (`src/island`) is to take them later; `core` settles the slice names with the MASD checkers, and says so in its first report.

## Packages

Each is a child session on `claude/cube-intro-<name>`, cut from the lead's branch; merge `origin/claude/cube-intro-core` as soon as it has the seam, and the lead's branch whenever told.

- **core** — the seam above.
- **sky** — atmosphere at a 9° sun, the sun's disc and glow, clouds that look like clouds at sunset, the sky map; `SUN_LIGHT`, `SKY_FILL` as numbers the model gives.
- **sea** — open water to the horizon (spectrum, displacement, glitter path under the sun, foam, the colour of depth), the shore (shoaling, breaking, swash running up the beach and draining back), the bed seen through shallow water by computing `islandHeight` and the sand's colour under a refracted ray; `waterLevel`.
- **sand** — the island's shape, the sand (grain, ripples, the sparkle of low sun, damp and wet bands by `waterLevel`'s recent reach), the cube's and ladder's long shadows on it, footprints if they come cheap; `islandHeight`.
- **shell** — the cube from outside (the bands, a material that is not of this world and plays in the low sun as far as black and grey allow), the doorway cut through floor 1's wall with its reveal, the ladder, the sunbeam inside floor 1 falling on floor, walls, bench and plant, the ceiling panels off; `cubeShadow`.
- **walk** — moving outside (terrain underfoot, wading, swimming with no edge), where a session starts and when the intro plays, the three scripted scenes (waking, the look under the cube, the climb; and the climb back down), the body seen from its own eyes.
- **pill** — the lever becomes a pill on a shelf at the lever's place; hands that can hold it; take, to the mouth, swallow, shrink; the first-time inspection with its Y/N prompt.
- **sound** — surf timed by `waterLevel`, wind, the cube's hum placed in space, a groan on waking, the ladder, the swallow, footsteps on sand and in water.
- **board** — the coordinator for the design board (running).
