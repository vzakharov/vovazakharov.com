# Cube renderer fact sheet (for the outdoor-intro build)

Read from the tree on branch `claude/cube-intro-j2wt34`. Paths are relative to `src/cube/` unless they start with `src/`, `scripts/` or `.claude/`.

**Coverage, so nobody trusts a gap.** Read in full: `pages/cube/ui/{renderer,programs,cube-scene,cube-mesh,reflection,reflection-shader,bloom}.ts`, `pages/cube/lib/{shader,mesh,vertex,camera,matrix,room-look,room-state,palette,play}.ts`, `entities/theme/kit/**` (all but `hash.ts`), `entities/theme/catalogue/config/floors.ts`, `entities/theme/workplace/config/{01-reception,workplace}.ts`, `entities/world/model/{frame,quad,geometry,walls,mount,setting,pose,room,rooms,maze}.ts`, `entities/world/index.ts`, `shared/lib/{room-shape,surface}.ts`, `.claude/rules/masd.md`, `CLAUDE.md`.

**NOT read (the reader ran out of context budget): sections 5 and 6 are therefore partial and nothing was run.** Unread: `scripts/*.ts`, `scripts/lib/cube-page.ts`, `src/scene/**`, `.claude/skills/mammoth/notes/{play-run-and-frames,gates}.md`, `.claude/rules/{testing,stack}.md`, `pages/cube/ui/{cube-canvas.tsx,hearing,poster-board,sign-board}.ts`, `features/decor/**`, `features/player/**` (hands, collision), `entities/world/model/{traits,hole,lever,sale,landing}.ts`, `shared/lib/{clock,colour,thing,sides}.ts`. Every statement below that leans on one of these is marked **(unverified)**.

## 1. Frame anatomy

One `GPUCommandEncoder` per frame, built in `Renderer.draw(shot)` (`pages/cube/ui/renderer.ts:227`). `Shot = Clock & Seen & { clear: Rgb; lens: number }`, i.e. `{ viewProjection: Float32Array, eye: Vec3, clear, lens, seconds, hour }`.

Passes, in order:

1. **Scene pass** (`renderer.ts:235`). Three colour attachments from `reflection.attachments(width, height, clear)` (`reflection.ts:161`), all `loadOp: 'clear'`, `storeOp: 'store'`, no blending, no MSAA:
   - location 0 `light` — mip level 0 of the `scene` texture, `SCENE_FORMAT = 'rgba16float'` (`bloom.ts:6`). Cleared to `{ r,g,b: shot.clear, a: NOWHERE }`, `NOWHERE = 1e4` (`renderer.ts:53`). The texture has `min(BLUR_LEVELS = 6, floor(log2(max(w,h))) + 1)` mip levels.
   - location 1 `mirror` — `rgba16float`, cleared to 0. `rgb` = the lamps' fallback light, `a` = mirror strength (0 = not a mirror).
   - location 2 `plane` — `rgba16float`, cleared to 0. `xyz` = the plane normal the reflection bounces off, `w` = metres of blur per metre the reflected ray runs.
   - depth: `DEPTH_FORMAT = 'depth32float'` (`programs.ts:8`), made in `targetsOf()` with usage `RENDER_ATTACHMENT` only (not sampleable), `depthClearValue: 0`, `depthLoadOp: 'clear'`, `depthStoreOp: 'discard'`.
   - draws: `rooms` (pipeline `faces`), then `moving` (pipeline `faces`), then each board (pipeline `boards`, bind group 1 = its texture). One `setPipeline` + `draw(count, 1, firstVertex)` per `FloorRange`.
2. **Mip halving** (`reflection.run`, `reflection.ts:193`): one full-screen pass per scene mip level 1..N, each reading the level above (`HALVE_SHADER`).
3. **Reflection** (`REFLECTION_SHADER`, entry `reflectionMain`): full-screen into `lit` (`rgba16float`, full size, one level). Output `vec4f(light.rgb + mirror.a * shown, light.a)`. `reflection.run` returns the `lit` view; that is what bloom and the lens read.
4. **Bloom** (`bloom.run`, `bloom.ts:177`): `LEVELS = 5` textures, each half the last starting at half size, `rgba16float`. `bright` (keeps only what exceeds 1.0 in the largest channel, divided by 5) → 4 × `down` → 4 × `up` (additive blend). Returns level 0's view.
5. **Lens pass** (`renderer.ts:259`): into `context.getCurrentTexture()` (format `navigator.gpu.getPreferredCanvasFormat()`, `alphaMode: 'opaque'`), pipeline `programOf(shot.lens).lens`, `draw(3)`. Bind group 1 is created every frame from `lit`, the glow view and a linear sampler.

**The scene target's `a` channel is distance, not opacity**: metres from the eye to the point shaded (`s.far = length(position - eye) * ROOM.x`, `lib/shader.ts:63`), `1e4` where nothing was drawn. The reflection pass reconstructs positions from it (`shownAt`, `sceneFar`) because depth is discarded. Half-float, so about 0.4 % precision (`BLUNT`).

**Depth is reversed-Z — confirmed.** `perspective()` in `lib/camera.ts:57` maps near to clip z 1 and far to 0; pipelines use `depthCompare: 'greater'`, `depthWriteEnabled: true` (`programs.ts:131`). `cullMode: 'back'`, default front face CCW; a `Quad`'s corners are CCW seen from the side its normal points to.

**Camera** (`lib/camera.ts`): `FOV_Y = 70°` vertical; `NEAR = 0.004`, `FAR = 24` (exported), both in room sides of a whole person's floor, multiplied by `unit`. `viewProjection(pose, eye, aspect, unit)`; `forward(pose)` = `[cos(pitch)cos(yaw), sin(pitch), cos(pitch)sin(yaw)]` (yaw 0 = east/+x, π/2 = south/+z). Right-handed view, y up. On floor 1 at scale 1: near 2 cm, far 120 m. Matrices are column-major `Float32Array(16)`; `lib/matrix.ts` has `multiply(a, b)` and `inverse(m)`.

**Uniform block** — `UNIFORM_FLOATS = 24` (`lib/shader.ts:6`), WGSL `struct Uniforms`, written in `renderer.ts:229`:

- floats 0–15 `viewProjection: mat4x4f`
- floats 16–19 `eye: vec4f` — eye xyz in the mesh's frame (units: room sides of the mesh's floor), w = 1
- floats 20–23 `clock: vec4f` — x seconds into the shared clock's hour, y which hour, z canvas width px, w canvas height px

The reflection pass has its own buffer, `VIEW_FLOATS = 40` (`reflection-shader.ts:5`): `viewProjection`, `inverse` (clip → frame), `eye` (xyz, w = `ROOM_METRES` = metres per frame unit), `size` (width, height, focal length, top blur level).

**Vertex layout** — `lib/vertex.ts`, everything derived from `FIELDS`; `VERTEX_WORDS = 16`, stride 64 bytes, shader locations 0–8 in this order:

- 0 `position: vec3f` — in the eye's frame
- 1 `normal: vec3f`
- 2 `local: vec3f` — in the face's own room, in that room's sides from its north-west floor corner (the shader multiplies by `ROOM.x` to get metres: `s.p`)
- 3 `tex: vec2f` — 0..1 across the face, a board's place in its texture
- 4 `kind: u32` — index in `SURFACES`
- 5 `seed: u32` — the room's own random word
- 6 `flags: u32` — the room's packed `RoomState` (see § 2)
- 7 `paint: u32` — `0xRRGGBB`, 0 = no paint
- 8 `cell: u32` — room column low 6 bits | row low 6 bits << 8

`u32` members are `@interpolate(flat)` in `Varying`. `SURFACES` (`shared/lib/surface.ts`), index = kind: wall, floor, owned, ceiling, trim, plate, handle, metal, wood, plastic, fabric, glass, screen, paper, foliage, rubber, skin.

**Bind group layouts** (`programs.ts:69`): `uniform` (group 0: binding 0 buffer, VERTEX|FRAGMENT); `board` (group 1: binding 0 texture, 1 sampler); `lens` (group 1: binding 2 scene texture, 3 glow texture, 4 sampler). All five group-1 bindings are declared in the one shader module; each pipeline layout carries only the group it uses (`faces`: uniform only).

## 2. How a floor is shaded

**Assembly.** `shaderOf(n)` (`pages/cube/lib/shader.ts:136`) = `floorSource(themeOf(n), STAGE)`. `floorSource` (`entities/theme/kit/model/theme.ts:51`) = `diagnostic(off, derivative_uniformity);` + `assemble([theme.shader, STUFF, wgsl('stage', STAGE, CORE)])`. `assemble` (`kit/lib/wgsl.ts:26`) walks each piece's `needs` depth-first and emits each piece once, by `id`; two different pieces with one id throw. A piece is `wgsl(id, listing, ...needs)`.

Kit pieces (`entities/theme/kit/lib/`, barrel `entities/theme/kit/index.ts`): `CORE` (`Surf`, `Material`, `Mirror`, `Lens`, `ROOM`, `matte/polished/glowing/embossed`, flag readers), `HASH` (`hashOf`, `unitOf`, `cellHash`, `valueNoise`, `fbm`, `worley`), `LIGHT` (`Lamps`, `lampReach`, `cornerShade`, `lampGlow`, `roomLight`), `FINISH` (`plaster`, `tiling`, `carpet`, `damp`, `band`), `STUFF` (`stuff(s)` for the decor kinds, `painted`, `ownedMark`), `GRADE` (`haze`, `tonemap`, `through`, `grain`, `vignette`), and `ordinary(id, look)` which generates `lamps()`, `themeLight` and `themeLens` from numbers.

**Where a theme plugs in.** A `FloorTheme` (`kit/model/theme.ts:24`) is `{ name, air, pillar, dark, shader, sound, decor }`; its `shader` must define `themeMaterial(s: Surf) -> Material`, `themeLight(s: Surf, m: Material) -> vec3f`, `themeLens(l: Lens) -> vec3f`. `themeOf(n)` lives in `entities/theme/catalogue/config/floors.ts`.

**Floor 1 is `RECEPTION`, `entities/theme/workplace/config/01-reception.ts`** (floors 1–8 are `WORKPLACE_FLOORS` in `workplace.ts`). It writes `themeMaterial` (WALL → `panelled`, FLOOR/OWNED → `terrazzo`, CEILING → `tiled`, default → `stuff`) and takes light and lens from `ordinary('reception', { air, lamp: [1.5, 1.38, 1.14], ambient: [0.012, 0.011, 0.01], grid: 2, panel: [1.2, 1.2], stutter: 0, visibility: 70, exposure: 1, glow: 0.1, fringe: 0.004, vignette: 0.3, noise: 0.012 })`. `air = linear(hex(0x17140f))`, `pillar: 0.03`, `dark: 0`. The terrazzo floor is polished (gloss 0.55–0.9), so the floor is a screen-space mirror.

**What the fragment gets.** `fragmentMain` (`lib/shader.ts:91`): `surfOf(in)` → `themeMaterial(s)` → `ownedMark` if `OWNED` → `sceneOf(s, themeLight(s, m))`. `Surf` (`kit/lib/core.ts:25`): `kind`, `p` (metres from the room's NW floor corner; x east, y up, z south), `uv` (metres across the face, continuous through neighbouring rooms), `normal`, `seed`, `flags`, `cell`, `paint` (linear), `view` (unit, eye → point), `far` (metres), `pixel`, `screen` (0..1), `time`, `hour`. `ROOM = vec3f(5.0, 2.3, 5.0)` metres (`ROOM_METRES = 5`, `CEILING_HEIGHT = ROOM_HEIGHT − SLAB_THICK = 0.5 − 0.04 = 0.46` room sides — so floor 1 is 5 × 5 m, 2.3 m clear under a 0.2 m slab, 2.5 m gross).

**Light is analytic, per fragment, with no shadows and nothing baked** (`kit/lib/light.ts`). `roomLight(s, m, lamps)` = `albedo × (ambient + lamp colour × (reach.x + FILL(0.16) × reach.z)) × cornerShade + emission + highlights`. `lampReach` loops the 3 × 3 rooms around the point × `grid²` panels, each a point light at `ROOM.y − 0.05`, gated by the room flags (closed sides, lit neighbours, ways across corners). `cornerShade` is analytic darkening toward closed walls/floor/ceiling (reach 0.7 m, up to −45 %). The lit ceiling panels are emission: `lampGlow(s, lamps())` = `colour × GLARE(8) × lampMask × lampLevel`, called from the theme's ceiling material (`tiled` in `01-reception.ts`). Furniture is lit by the same function (its `local` is relative to its room, so `s.p` is valid for it) but casts no shadow and receives none.

**Fog.** `haze(colour, s, air, reach)` (`kit/lib/grade.ts:15`) = `mix(air, colour, exp(−far / reach))`, also dimming `mirroring.strength`. Applied inside each floor's `themeLight`, so it is a property of the face's floor, not of the frame.

**Mirror.** `roomLight` sets the private global `mirroring` for a polished upward face (`gloss > 0 && normal.y > 0.9`); `sceneOf` writes it to targets 1 and 2. The fallback is the ceiling panels analytically mirrored.

**Tone mapping / grading is the lens pass**, per floor: `themeLens(l)`; for an `ordinary` floor `tonemap(through(l, glow, fringe) × exposure) × vignette(l, v) + grain(l) × noise` (`kit/lib/ordinary.ts:53`). `through` = scene with red/blue pulled apart toward corners + `glowAt × glow`; `tonemap` = filmic shoulder then gamma 1/2.2. The lens used is the eye's floor's: `lens: lenses.has(at.n) ? at.n : built.pose.n` (`cube-scene.ts:204`).

**`seconds` / `hour`** (`clockAt(now())`, `shared/lib/clock.ts`, shared wall clock) reach WGSL as `s.time`, `s.hour`, `l.time`, `l.hour`. They drive lamp stutter (`lampLevel`), the `SCREEN` stuff's snow and film grain. **They do not drive a time of day; there is no sun anywhere.** A play script's page is stopped at `PLAY_INSTANT`.

**(a) Adding a sun beam into floor 1's room.** Nothing exists to reuse; the cheapest correct shape is analytic, like the lamps:

- New kit piece, e.g. `entities/theme/kit/lib/sun.ts`: `export const SUN = wgsl('sun', …, CORE)` with `fn sunPatch(s: Surf) -> f32`: from `s.p` march back along the constant sun direction to the doorway wall's plane (e.g. `x = ROOM.x` for the east side), take the signed distance of the hit to the doorway rectangle, and return `1 − smoothstep(−w, w, d)` with `w` growing with the distance travelled (penumbra). Then `sunLight = sunColour × max(dot(normal, toSun), 0) × sunPatch(s)`.
- Plug in by giving floor 1 its own `themeLight` in place of `ordinary`'s: `haze(roomLight(s, m, lamps()) + m.albedo * sunLight(s, normalize(s.normal + m.relief)), s, air, visibility)`. Either add an optional field to `ordinary`'s `look` (it generates the function, `kit/lib/ordinary.ts:49`) or write `lamps()`/`themeLight`/`themeLens` by hand in `01-reception.ts` (the file's own comment allows it: "a floor that breaks the picture writes its own in their place").
- Because `s.p` is valid on every quad of the room, the patch lands on floor, walls, bench and plant alike. What you do not get: the plant's shadow on the floor, or the door frame's thickness occluding — add those analytically if wanted.
- The doorway rectangle and sun direction must come from one TS constant interpolated into both the WGSL and the geometry (as `ROOM` is built from `room-shape.ts` in `core.ts:22`), not typed twice.
- The polished floor will mirror the bright doorway through the reflection pass only if the outdoors is actually in the scene target with a sane `a` (see § 4).
- Scale: lamp colour is 1.5, panels glare at ~12, bloom starts at 1.0, exposure 1. A sun patch of albedo × ~8–15 will bloom.

**(b) Switching floor 1's ceiling panels off or dim.** Floor 1 has one room, so theme-wide = that room.

- Dim: lower `lamp` in the `ordinary(...)` call in `01-reception.ts`; it scales both the light and the panels' glare (`lampGlow` uses `lamps.colour`).
- Off: the room's lamp bit is `lampsOn` (`LIT_BIT = 4`, `kit/model/flags.ts`), set in `pages/cube/lib/room-look.ts:38` as `rolled.room.at(room).lamp >= themeOf(room.n).dark`. Raising `dark` on the theme to the top of the lamp roll's range turns every room of the floor off **(range of `lamp` unverified — `entities/world/model/traits.ts` unread)**; with `stutter: 0` the level is then exactly 0 and only `ambient` (0.012) remains.
- Panels dark but room still lit (or the reverse) needs floor 1's own `tiled()` to stop calling `lampGlow`, or its own `lamps()`.

## 3. How geometry gets in

**Types** (`pages/cube/lib/mesh.ts`): `FloorRange = { n, firstVertex, count }`; `Scenery = { data: ArrayBuffer, ranges: readonly FloorRange[] }`; `RoomLook = Placed & Seeded & { flags, cell }`. `pack(quads, lookOf)` sorts quads by `room.n`, emits 6 vertices per quad (fan 0,1,2,0,2,3), one range per floor, and computes `local = (corner − lookOf(room).origin) / roomSide`.

**Renderer entry points** (`renderer.ts`): `upload(scenery)` replaces the rooms; `uploadMoving(scenery)` replaces what moves (hands, figures, happenings), same `faces` pipeline; `uploadBoards(boards: Boards[])` replaces textured boards, `Boards = { id, image: () => canvas-like, scenery }`, texture made once per id (`rgba8unorm`). Every floor in any range must have been `prepare`d (`prepare(floors)` compiles `sourceOf(n)` once per floor; `programOf(n)` throws otherwise).

**Mesh build** — `build(pose, copy, bought)` in `pages/cube/ui/cube-mesh.ts:149`, async, rebuilt whenever the eye's room changes (`meshKey` in `cube-scene.ts`). It returns `{ faces(pulled), stood(moving), boards, signOf, settings }`:

- `sight(pose, FAR, walls)` (`entities/world/model/rooms.ts:204`) → `near` (rooms of the eye's floor reachable by a straight line through open walls, within 24 room sides), `above` (their parents; slabs only), `overhead`, `topmost`; `withBelow` adds `below` = the four children of every near room that has a hole.
- Structure: `faces(rolled, pose, view, holeOf, pulled, owns, pillarOf)` (`entities/world/model/geometry.ts:310`): `slab()` (floor top, hole `shaft`, underside = the ceilings of the four rooms beneath), the `lid` (for an eye on floors 1–2: one `ceiling` quad over the whole cube at `slabHeight(n, 0) − SLAB_THICK`), `walls()` → `roomWalls()` → `wall()`, `pillars()` (kind `trim`, two inward faces per corner), `lever()`.
- Decor: `furnish(setting, themeOf(n).decor)` (`features/decor`), set in the room's own frame (side 1) and stood in the eye's by `inPlace(quads, placed(pose, room))` (`entities/world/model/setting.ts:50`). Boxes come from `box(corner, [p, q, r], room, surface, paint?)` and `face(corner, a, b, room, surface, paint?)` in `entities/world/model/quad.ts`.
- Moving things: each frame `cube-scene.ts:189` gathers `moving` (from `options.onFrame`, i.e. the page — the hands, **unverified**, `features/player/model/hands.ts` unread), `staged` (the play hook's `setPose(pose, among)`) and happenings' quads, and uploads `mesh.stood(seen)`.

**The eye's frame** (`entities/world/model/frame.ts`): origin = north-west corner of the eye's room on its slab; x east, y up, z south; **unit = one room side of the mesh's floor** (`built.pose.n`). `footprint(eye, room) → { east, south, roomSide }` (a room `d` floors down has `roomSide = 2^−d`); `placed(eye, room) → { origin: [east, slabHeight(eye.n, room.n), south], roomSide }`; `slabHeight(n, m) = ROOM_HEIGHT × (2^(n−m) − 1)`; `eyeInFrame(frame, pose) → { eye, side }`; `descend(pose)` re-expresses a pose one floor down. In floor 1's frame the whole cube is `x ∈ [0,1]`, `z ∈ [0,1]`, `y ∈ [−0.5, +0.5]` (1 unit = 5 m): floor 1's slab at y = 0, its ceiling at 0.46, the lid's top at 0.5, floor 2's slab at −0.25, the cube's bottom at −0.5.

**Pose** (`entities/world/model/pose.ts`): `{ n, x: bigint, y: bigint, u, v, yaw, elevation, eyeAbove, scale }`; `u`,`v` in `[0,1)` east/south within the room; `eyeAbove` in room sides over the slab. Floor 1's only room is `{ n: 1, x: 0n, y: 0n }`.

**Cutting a real doorway into floor 1's outer wall.**

- **There is no doorway shape to reuse.** An open side between two rooms is drawn as _nothing_ — the whole wall is absent (`roomWalls` returns `[]` for it) and the corners carry pillars. Walls are single full quads: `wall(corner, run, height, half, front, back)` (`geometry.ts:138`) makes one inward face per existing room, standing `WALL_HALF = 0.012` room sides (6 cm) in from the room's edge.
- **The outer wall is closed in three independent places**: `roomWalls` (`x === last`, `y === last`, `x === 0n`, `y === 0n`, `geometry.ts:187–204`), `mazeWalls` (`isRoom` guards, `walls.ts:40`), and `maze.ts` `isOpenEast/isOpenSouth` (throw past the edge). `closedSides(walls, room)` (`setting.ts:29`) → `RoomState.closed` → flag bits 0–3 (east, south, west, north) feed the shader (`closedAt`, `cornerShade`, `lampsBeside`), decor placement (`Setting.closed`) and, **unverified**, collision (`features/player/model/walls.ts`, `step.ts`).
- **The outer wall has no outside face** (`beside()` is null past the edge, so only the inward quad exists) and back faces are culled: from outside, the cube is invisible. The exterior shell is new geometry.
- Least invasive cut: keep the side _closed_ in `Walls`/flags (so lighting, corner shade and decor still treat it as a wall) and change only the quads — for floor 1's chosen side, replace `wall()`'s single face with the pieces around a rectangle (two jambs' worth of wall + a lintel + optional sill) plus four reveal quads through the wall's thickness. `cut(area, gap)` (`geometry.ts:30`) is the existing precedent for "a rect with a rect hole → up to 4 rects" (used for floor holes), and `shaft()` for the reveal. The player's collision then needs its own exception for that rectangle.
- **The decorative door seen in floor 1** is decor, not structure: `{ thing: 'door', perRoom: 1 }` in `RECEPTION.decor`, defined at `features/decor/config/fittings.ts:122`, placed against a closed side by `furnish` from the room's `grain` **(placement rule unverified)**. It will sit wherever the seed rolls it; an intro doorway must either drop it from floor 1's `decor` or make sure it cannot land on the doorway.

## 4. Seams for an outdoor scene

What the pipeline assumes, and what an outdoor world must honour:

- **Extra pipelines can draw into the same scene pass.** Requirements: same three target formats (`[SCENE_FORMAT, ...MIRROR_FORMATS]`, all `rgba16float`), `depth32float`, reversed-Z (`depthCompare: 'greater'` or `'greater-equal'`), and group 0 compatible with `layouts.uniform` if it wants the frame uniforms. It must write **location 0 `a` = metres from the eye** (or `1e4` for sky), and location 1 `a` = 0 unless it wants to be a mirror.
- **No alpha blending in the scene target** — `a` is distance. Anything translucent (foam, glass, haze cards) must be shaded opaque or composited after the reflection pass.
- **Depth is not readable** (`RENDER_ATTACHMENT` only, `depthStoreOp: 'discard'`). Post passes use `scene.a`.
- **`FAR = 24` room sides = 120 m on floor 1**, and `FAR` is also the sight radius `build()` passes to `sight()`. An ocean to the horizon cannot be mesh; it has to be a full-screen analytic backdrop (ray from the eye per pixel), drawn with depth test off / at the far plane.
- **The frame uniforms carry no inverse view-projection**; a per-pixel ray needs one. The reflection pass's `View` buffer (`reflection.ts:187`, `inverse(viewProjection)`) is the pattern: a pass-owned uniform buffer written each frame.
- **Reflection pass**: screen-space walk, `REACH = 14 m`, 24 steps; samples `scene` mips for blur; where the walk fails it shows `mirror.rgb` (the analytic lamp fallback). Sky pixels (`a = 1e4`) are never "struck", so a floor mirror looking out of the doorway at sky gets the fallback, not sky — unless the sky pixel writes a finite `a`. An ocean that writes mirror strength + plane normal gets the cube reflected in the water for free, within 14 m of ray.
- **Bloom** takes everything over 1.0 in the `lit` target; a sun disc or bright sky blooms by the eye floor's `glow` (0.1 on floor 1).
- **Lens** is per floor and keyed by floor number; `programOf(n)` only knows numbers `themeOf(n)` accepts (1–66). An eye outside has no lens of its own: reuse floor 1's (`lens: 1`) or add an outside program.
- **Indoors assumptions**: `clear` = `airAt(depth)` = the floor theme's `air` colour (floor 1: near-black brown) with `a = NOWHERE` — an open doorway with nothing behind it shows that; `haze` fogs toward the same `air` at `visibility` 70 m; lamps and `cornerShade` read room flags; `surfOf` assumes every vertex belongs to a room (`local`, `cell`, `flags`).
- **The eye cannot be outside today.** `cube-scene.ts` `render()` keys everything on the eye's room: `inEyeRoom(pose)` _descends a floor whenever `eyeAbove < 0`_ (an eye on the sand below floor 1's slab would be re-read as floor 2), `meshKey = roomKey(pose)#generation`, `build()` runs `sight()` from a room. `eyeInFrame` itself is plain arithmetic and works for `u`, `v` outside `[0,1)`.

**Recommended attachment points, least invasive first:**

1. **Backdrop (sky + ocean, optionally sand as an analytic plane/heightfield)**: a new module beside `bloom.ts`/`reflection.ts`, e.g. `pages/cube/ui/outdoors.ts`, exporting `createOutdoors(device)` with its own WGSL, its own uniform buffer (inverse VP, eye, sun direction, clock) and one full-screen pipeline writing the three scene targets, `depthWriteEnabled: false`, `depthCompare: 'always'`. In `renderer.ts` it is one call between `pass.setBindGroup(0, uniformGroup)` and `drawRuns(pass, rooms)` (`renderer.ts:249–250`), plus `dispose`. Reason: it touches no floor shader, no vertex format, no `programs.ts`; rooms then overdraw it by depth, and the doorway shows it. Because it draws first with depth untouched (cleared 0 = far), everything else wins the depth test.
2. **Solid outdoor geometry (cube exterior shell, ladder, sand if meshed)**: reuse `Quad` → `pack` → `VERTEX_LAYOUT` so it gets depth and the `a` channel right, but give it **its own pipeline** in `outdoors.ts` built from the same `VERTEX_LAYOUT` and target list (copy the `pipeline()` closure's descriptor, `programs.ts:112`), with a shader that lights by sun + sky instead of lamps. Avoid routing it through `themeOf`/`pack`'s per-floor ranges as a "floor 0": `roomLooks` → `closedSides`/`rolled.room.at` and `themeOf(0)` are not written for it. `renderer.ts` gains an `uploadOutdoors(data)` and one more `drawRuns`.
3. **Sun into floor 1**: § 2 (a), entirely inside `entities/theme` — no renderer change.
4. **Eye outdoors**: a branch in `cube-scene.ts` `render()` before `inEyeRoom`, giving the outside eye a fixed mesh frame (floor 1's room, `built.pose = { n: 1, x: 0n, y: 0n, … }`), `lens: 1`, and an `eye` computed directly in that frame. `ScenePlay.setPose` takes a `Pose`, so shooting outdoor frames headlessly needs either poses with out-of-range `u`/`v`/`eyeAbove` to be legal there, or a second hook call.

`programs.ts` needs no change for 1–3 unless the outdoor pipelines want to share `layouts.uniform` (then export nothing new — `createPrograms` already returns `layouts`). `renderer.ts` is 297 lines; keep the new code in its own file to stay under 400.

## 5. Looking at a frame headlessly — PARTIAL, NOT RUN

Verified from `pages/cube/lib/play.ts` and `package.json` only:

- `pnpm play:cube` = `scripts/in-site.sh vova tsx src/cube/scripts/play-cube.ts`; `pnpm gallery:cube` = `scripts/in-site.sh vova tsx src/cube/scripts/gallery-cube.ts`; `pnpm shaders:cube` = `tsx src/cube/scripts/shaders-cube.ts`.
- The page opens for a script at `/cube?play` (`PLAY_QUERY = 'play'`): no input, and `window.__cubePlay` (`PLAY_HOOK`) installed, typed `CubePlayHook`: `ready(): Promise<void>`, `setPose(pose: Pose, moving?: readonly Quad[]): Promise<void>` (resolves once a frame of it is on screen — it awaits the mesh rebuild and `device.queue.onSubmittedWorkDone()`), `adapter(): string`, `press(): Promise<void>` (E), `setClock(ms: number): void`. The page opens with the clock stopped at `PLAY_INSTANT = Date.UTC(2026, 10, 1, 12)`.
- A floor-1 pose: `{ n: 1, x: 0n, y: 0n, u: 0.5, v: 0.5, yaw: 0, elevation: 0, eyeAbove: <eye height in room sides, e.g. 0.32 for 1.6 m>, scale: 1 }` (`x`/`y` are BigInt — how the script serialises them across CDP is in the unread `scripts/lib/cube-page.ts`).

Not established: the flags of `play-cube.ts`, whether WebGPU runs in this container's headless Chromium and with which flags/adapter, frame time, output directory, and the copy-paste recipe. Sources to read: `src/cube/scripts/play-cube.ts` (183 lines), `src/cube/scripts/lib/cube-page.ts` (125), `src/scene/scripts/lib/cdp.ts` (241), `.claude/skills/mammoth/notes/play-run-and-frames.md`.

## 6. Gates — PARTIAL, NOT TIMED

Names verified from `CLAUDE.md`, `.claude/rules/masd.md` and `package.json`; none was run or timed, and `.claude/skills/mammoth/notes/gates.md` is unread:

- `./scripts/vet.sh` — the full check, runs on GitHub's runners from the **pushed** head (every site's build, lint, type-check, format-check, repo gates, `pnpm test:all`). Milestones only.
- `pnpm test` (tests the branch reached) / `pnpm test:all` — Node's built-in runner under `tsx`; tests sit beside their module.
- `pnpm shaders:cube` — the cube's shader check (`src/cube/scripts/shaders-cube.ts`; what it compiles with is unverified).
- `pnpm lint:fsd` (Steiger), `pnpm check:masd`, `pnpm check:cycles` (madge, type-only imports count), `pnpm masd:clusters`, `pnpm check:poison`.
- `pnpm type-overlap` — every member two named types share has one home.
- `scripts/line-limit.test.ts` — no text file over 400 lines.

## 7. Traps

- **400-line cap on every text file.** Already close: `pages/cube/ui/cube-canvas.tsx` 362, `entities/world/model/geometry.ts` 346, `features/player/model/hands.ts` 327, `features/player/model/play.ts` 313, `pages/cube/ui/renderer.ts` 297, `pages/cube/ui/cube-scene.ts` 270, `entities/theme/kit/lib/light.ts` 258. A doorway cut added to `geometry.ts` will not fit; put it in a new file.
- **`interface` is banned**; types are `type` aliases, and a member two named types both declare must move to a shared base (`pnpm type-overlap`). Reuse `Sized`, `WithId`, `Seeded`, `Named`, `CanDispose` from `@/kernel/shared/typings`.
- **No lint-suppression comments** without the operator's yes. No `as any`.
- **kebab-case files; imports**: inside a slice relative, across slices only through `index.ts` (or `index.node-safe.ts` / `index.test-only.ts`); `pages/cube` may import `features`, `entities`, `shared`; `entities/theme` and `entities/world` may not import each other (base entities never do); `shared/lib/*` is addressed one file at a time (`@/cube/shared/lib/room-shape`). A new slice with one consumer is "insignificant" and fails `check:masd` — put outdoor code inside `pages/cube` or an existing slice unless it is a real module.
- **WGSL lives in TS template strings** tagged `/* wgsl */`: per-floor pieces as `wgsl(id, listing, ...needs)` in `entities/theme/**`, the stage in `pages/cube/lib/shader.ts`, post passes inline in `bloom.ts` and `reflection-shader.ts`. Backticks inside WGSL doc comments are escaped (`\``). Runtime validation is `getCompilationInfo()`in`programs.ts`for floor shaders only (rejects`prepare`with`line:col message`); `bloom`/`reflection` modules are created without that check, so a new pass's compile error surfaces only as a WebGPU validation error unless you add the same check.
- **`assemble` dedupes by piece id** and throws on two different pieces sharing one; `ordinary(id, …)` makes `${id}/ordinary`.
- **Every floor's shader must define all three theme functions** and the stage calls `ownedMark` from `STUFF`; `diagnostic(off, derivative_uniformity)` heads each shader because materials branch on `kind`.
- **Quad winding decides visibility**: corners CCW seen from the normal's side, `box()` needs a right-handed `[p, q, r]`. `face(corner, a, b, …)` faces `a × b`.
- **`local`/`flags`/`seed`/`cell` come from the quad's `room` via `lookOf`**, so every quad must name a real room; `pack` is the single place doubles narrow to float32.
- **`mirroring` is a `var<private>` global** set by `roomLight`; a custom `themeLight` that skips `roomLight` leaves no mirror, and one that fogs must dim `mirroring.strength` as `haze` does.
- **Coordinates are per-floor units, not metres**: positions in the buffer are room sides of the mesh's floor; WGSL "metres" are `× 5` of that floor's own room. A person of floor 2 sees a 5 m room too.
- **Draw order inside the scene pass matters only for equal depths** (slabs are emitted before walls for that reason); there is no sorting.
- **The mesh is rebuilt on room change, not per frame**; per-frame things go through `uploadMoving`, which re-creates a vertex buffer each frame it is non-empty.
- **Dev outputs go under gitignored `tmp/`**; this directory (`docs/remove-before-merging/`) is meant to be deleted before merge.
