# b3-b7map — B7's map: the switch to the sphere

Base cd452cb8, branch `wt/b3-b7map`. Read and design only. Paths under
`src/island/`. Stopped at the context budget before checking: how the build
exposes its commit, `sky-colour.test.ts`/`sun.test.ts`/`tile-cover.test.ts`
contents, `film-descent.ts` past line 140, `play-tab.ts` past line 80. Those
are flagged where they matter.

## 1. Call sites (planar → sphere)

### pages/island/lib/tile-worker.ts

- :9-14,72-73 `buildWorldField(world)`, `worldSeed(world)` →
  `buildSphereWorld(world)` (`entities/terrain/world/model/sphere-world.ts`,
  not in any barrel yet). **Gap**: `buildSphereWorld` is sync and takes a
  `WordSource`; the pinned row (`pinnedSeries(world)`, async, a `Float64Array`
  series) has no way in. Add `buildSphereWorld(world, { series? })` or a
  `worldSeries(world): Promise<Float64Array>` = `pinnedSeries ?? landSeries(rollWorld…)`,
  the seed always from the roll (`noise/seed` of `H(N,·)`). #1's hills change
  (bite 2's seed was `worldSeed` over the mask) — expected, say so in the PR.
- :84 `if (world === null) throw` — **init becomes async** (the pinned
  `import()`), so fills that arrive before it must queue (one promise `ready`
  awaited in the handler), not throw.
- :42-55 `fillTile(key, (x,y,f) => heightAt(field,seed,x,y,f), {finest: detailCut(eye, field)})`
  → `fillCubeTile(key, (p,f) => heightAtSphere(d, seed, p, f), { finest: cubeDetailCut(eye, d) })`,
  `d = (p) => sampleSphereField(field, p)`; sea `fillCubeTile(key, () => 0)`.
- :7,44 `GridCell` → `CubeCell` (`shared/globe`).

### pages/island/lib/tile-protocol.ts

- :3,11,48 `CoastField` → `SphereField` (`coast-field`); :38 `key: GridCell` →
  `CubeCell`; :20 `TileKeyed`/`TileMesh` → `TileMesh<CubeCell>` (B4b made them
  generic). The field copy to the main thread: `SphereField` is 1024×2048
  Float64 ≈ 16 MB structured-cloned once per world; fine, but say it.

### pages/island/lib/tile-pool.ts

- :3,105-111 `worldToPlane(eye)` + `nearestFirst(keys, x, y)` →
  `nearestFirst(keys, eye)` by `capGap(tileCap(key), unit(eye))` (angle from
  the eye), coarser first at a tie. :53,31 `GridCell` → `CubeCell`; :66,87
  `tileId` → `cubeTileId`. :15 "~4 MB" field → ~16 MB (two workers ≈ 32 MB +
  the main copy: phone memory figure to report).

### pages/island/model/tile-cover.ts (+ tile-cover.test.ts)

- :4-7 `parentOf` → add `face`, root at `CUBE_MIN_LEVEL` (no level-0 tile on a
  face: stop at `CUBE_MIN_LEVEL`, else `ancestorsOf` walks to level 0 of a face,
  harmless but never held). :16-19 `within` adds `inner.face === outer.face`.
  :2,34,63 `tileId` → `cubeTileId`. :77-95 `distanceTo`/`nearestFirst` (plane
  rects via `tileRect`) → by `capGap`. Generic over the key would keep both
  until B8; recommended: switch to `CubeCell` outright (§ 2).

### pages/island/ui/island-scene.ts

- :13-29 imports: `GridCell`, `CoastField`, `heightAt`, `MIN_LEVEL`,
  `selectTiles`, `tileId` → `CubeCell`, `SphereField`, `heightAtSphere` +
  `sampleSphereField`, `CUBE_MIN_LEVEL`, `selectCubeTiles`, `cubeTileId`.
- :30-41 eye: `Eye, eyeAt, GroundAt, IDLE, poseOf, step, withHeading,
  withHeight` → the globe set (`GlobeEye`, `globeEyeAt`, `GlobeGroundAt`,
  `STILL`, `globePoseOf`, `stepOnGlobe`, `withGlobeHeading`, `withGlobeHeight`;
  barrel `features/eye/index.ts:12-26`), the aliases dropped when the planar
  ones go.
- :77-80 `groundOf(field, seed)` `(x,y) => heightAt(...)` →
  `(p) => heightAtSphere((q) => sampleSphereField(field, q), seed, p)`.
- :97-101 `ROOTS` 4^MIN_LEVEL plane cells → 6 × 4^`CUBE_MIN_LEVEL` = 96
  `CubeCell`s over `FACES`.
- :142,195 `coast: CoastField` → a `CoastDistance` built once per field.
- :225-229 `selectTiles(at, {coast, frustum, ground})` →
  `selectCubeTiles(at, { coast, frustum, ground })` (ground by direction).
- :290 `step(eye, play ? IDLE : controls.read(), …)` → `stepOnGlobe(…, play ?
  STILL : controls.read(), …)` (S7).
- :306 `eyeAt({x:0,y:0,height:MAX_HEIGHT})` →
  `globeEyeAt(openingOf(Number(world)), groundAt)` (or the hash pose, call 15).
  `setWorld` (:345) leaves the eye — keep (call 10 does not ask a re-open).
- :56-57,332-338 `moveTo(x, y, m)` → `moveTo(lat°, lon°, m)` per B5's note:
  `eyeAt({lat, lon, height: m, heading: headingOf(from)}, groundAt)`.
- :262,267 `globe`, `sky.position` — unchanged (sky stays over the eye).

### pages/island/ui/tile-meshes.ts

- :13,43 `GridCell` → `CubeCell`; :15,130 `MIN_LEVEL` → `CUBE_MIN_LEVEL`;
  :16,93,98,104,117 `tileId` → `cubeTileId`.

### pages/island/ui/play-hook.ts, shared/play/play-hook.ts

- play-hook.ts:14 and shared/play/play-hook.ts:12-13 `moveTo(x, y, m)` plane
  metres → `moveTo(lat, lon, m)` degrees. Add `buildMs(): number` (pool's
  `Built.buildMs`, `tile-pool.ts:38`) for B7's printed build time, and
  `where(): string` (call 15) so a script can read the line.

### pages/island/lib/world-hash.ts (+ test), entities/terrain/world/model/hash.ts

- hash.ts:60,68-69 `isWorldNumber` `/^[1-9]\d*$/` → `/^(?:0|[1-9]\d*)$/` (the
  existing `HASHED_NUMBER`; R8 ends); its docstring :63-67 changes; `worldHash`
  (:88, bite 2 counter, `assertWorldNumber`) is B8's to delete.
- world-hash.ts:8-11 `worldOfHash` → `placeOfHash(hash): { world, pose? }`
  (§ 3.2). `OUR_WORLD` comes from `world/model/mask.ts:8`, which B8 deletes:
  move it beside `isWorldNumber` in `hash.ts` in step a.

### pages/island/lib/sun.ts, ui/ground-lighting.ts, lib/sky-colour.ts

- sun.ts:1 `CENTRE, EAST, NORTH` (shared/globe's plane frame) → § 3.1.
- ground-lighting.ts:86-93 one `sunToward(20, 315)` set once → sun direction
  updated per frame by time; night fill (§ 3.1).

### pages/island/ui/controls-hint.tsx, config/messages/en.json

- en.json:10 `"↑ ↓": "climb, descend"` → "look up, down"; add `"E Q"` "climb,
  descend", time keys, where key; :12 `"Right-drag"` → "turn, look up and
  down"; touch add `"Two-finger drag"` "look up, down". controls-hint.tsx needs
  no code change (rows from JSON).

### pages/island/ui/island-canvas.tsx

- :27-35 `worldOfHash` + `setWorld` on `hashchange` → parse place; a
  hash carrying a pose moves the eye too; the scene's own pose writes (call 15)
  must not re-trigger it (`history.replaceState`, which fires no `hashchange`).

### features/eye

- globe-eye.ts:15,87 `planeToWorld(0,0)` for `ISLAND_OPENING` — the one plane
  read left in the sphere eye; B8 replaces it by a lat/lon constant
  (`unitToLatLon` of it, printed once) when `planeToWorld` leaves
  `shared/globe`.
- pose.ts:5,99 planar `poseOf` — B8 deletes; `poseFrom`, `pitchAt`,
  `groundPerScreen` (eye-controls.ts:5) stay.
- eye-controls.ts:3 `shortest` from planar `eye.ts` (twist) — stays, B8 keeps it.

### entities/terrain barrels (step a adds)

- `entities/terrain/index.ts`: export `buildSphereWorld`, `SphereField`,
  `sampleSphereField`, `heightAtSphere`, `selectCubeTiles`, `cubeDetailCut`,
  `CoastDistance`, `fillCubeTile`, `cubeTileId`, `CUBE_MIN_LEVEL`, `tileCap`,
  `capGap`. Planar exports kept until B8 (or dropped where (a) drops the
  reader, § 2).
- B4's two findings: `quadtree/model/cube-quadtree.ts:12,50,54` reads
  `GROUND_SLOPE` → `SPHERE_GROUND_SLOPE` (height barrel already exports it);
  `quadtree/model/cube-split.ts:20` declares `CoastDistance` → delete, import
  height's (`height/index.ts:3`), update `cube-detail.ts:23`,
  `cube-quadtree.ts:14`, `cube-quadtree.test-kit.ts:20`, quadtree barrel :3
  (re-export height's or drop).

### Tests that read the plane in pages/island

- `model/lowland.test.ts:4-41` (`buildWorldField`, `heightAt`, `SQUARE`,
  plane `sampleCoastField`): port to the sphere — directions in a cap around
  #1, `heightAtSphere(...) >= 0` inland at the same cuts — or delete with
  B8. Recommend porting in (a): it is the game's own sea-inland guard.
- `model/tile-cover.test.ts`, `lib/world-hash.test.ts`, `lib/sun.test.ts`,
  `lib/sky-colour.test.ts` change with their modules.

### Scripts

- play-island.ts:78-87 `INLET` `moveTo(515_000, 1_750_000, 1_500_000)`,
  `(510_000, 1_250_000, 300_000)` plane m → lat/lon degrees, computed once via
  `scripts/lib/azimuthal.ts` (it has `worldToPlane` only; add the inverse
  `planeToWorld` back there, or compute the constants with the globe's
  before B8 and hard-code them, comment naming the plane point).
- film-descent.ts:64-88 `LANDING (499_000, 1_113_200)`, `START (0,0)`,
  `descentAt` interpolates plane x/y → lat/lon of both, interpolate along the
  great circle (slerp of units, then `unitToLatLon`); :131 `moveTo(x,y,m)` →
  `moveTo(lat,lon,m)`.
- lib/play-tab.ts:21,43-54 `OUR_WORLD`, `assertWorldNumber` (accepts `0` once
  `isWorldNumber` does), `playPath` — add an optional pose suffix for call 15's
  round-trip test.
- fit-sphere.ts, lib/sphere-fit.ts, lib/fit-drawn.ts: plane only through
  `scripts/lib/azimuthal.ts` and `buildCoastField` — untouched by B7 (call 8).

## 2. The cut

Planar path: **dropped from the page in B7a** (worker, pool, cover, scene,
meshes, hook switch together; a shim would double the page and every type).
The planar **entities** stay, unread by the page, until B8 deletes them —
knip goes red on them meanwhile, which B8 clears.

**B7a — the switch** (one agent, full). Files: `pages/island/lib/tile-worker.ts`,
`tile-protocol.ts`, `tile-pool.ts`, `model/tile-cover.ts(+test)`,
`model/lowland.test.ts`, `ui/island-scene.ts`, `ui/tile-meshes.ts`,
`ui/play-hook.ts`, `shared/play/play-hook.ts`, `lib/world-hash.ts(+test)`,
`ui/island-canvas.tsx`, `config/messages/en.json` (S7 rows only),
`entities/terrain/index.ts`, `world/index.ts`, `world/model/sphere-world.ts`
(series entry), `world/model/hash.ts` (+`OUR_WORLD`), `quadtree/model/cube-split.ts`,
`cube-quadtree.ts`, `cube-detail.ts`, `cube-quadtree.test-kit.ts`,
`quadtree/index.ts`, `scripts/play-island.ts`, `scripts/film-descent.ts`,
`scripts/lib/play-tab.ts`, `scripts/lib/azimuthal.ts`. Light untouched (the
sun stays `sunToward(20,315)` over `CENTRE`: #1 looks as today, far side dim).
Ends: `tsc`, eslint, `check:masd`, `check:cycles`, `masd:clusters`,
`type-overlap` green; tests: tile-cover (cube keys: parent across levels,
`within` per face, nearest by angle incl. a face edge), world-hash (`#0`
opens), lowland ported, sphere-world (pinned series path: #1's field from the
row), worker init-queue if extracted pure; `pnpm play:island` five heights on
#1 phone+desktop plus `--world 0` and `--world 2` orbit, build ms printed.
Leaves: light, time, where.
If it does not fit: split off **B7a′** = scripts (play-island, film-descent,
play-tab, azimuthal) — B7a then ends on `tsc` with the scripts' `moveTo` calls
fixed minimally and five-height frames only.

**B7b — call 12 light and time** (one agent, small). Files: `lib/sun.ts(+test)`,
new `lib/day.ts(+test)` (pure: sun direction for time and world),
`ui/ground-lighting.ts`, `lib/sky-colour.ts(+test)`, `ui/island-scene.ts`
(time state, per-frame light update), `features/eye/ui/eye-controls.ts`
(time keys, or a separate `bindTimeKeys` in pages), `config/messages/en.json`
(time rows). Ends: tests — at t=0 the sun stands at #1's/#0's opening's local
noon; a day turns the sun 2π about the polar axis; moon = −sun; night fill
never zero; keys don't collide with `BOUND`. Frames: #1 orbit at noon and
midnight, #0 orbit from four sides.

**B7c — call 15 where** (one agent, small). Files: new
`pages/island/lib/place-hash.ts(+test)` (grammar, pure), `lib/world-hash.ts`
(folded into it), `ui/island-canvas.tsx`, `ui/island-scene.ts` (`where()`,
`placeAt(pose)`), new `lib/where-line.ts(+test)` (format, pure),
`ui/play-hook.ts`, `shared/play/play-hook.ts`, `en.json` (where row),
`scripts/lib/play-tab.ts` (pose path), build-commit plumbing (§ 3.2). Ends:
tests — parse∘format round trip to the printed precision; bad pose → bare
world; `#0@…`; frame: `island.where()` from a flown spot, reopened by its
hash, two frames equal by eye (Done row).

B7b and B7c touch `island-scene.ts`, `en.json`, `play-hook` — run them one
after the other, or B7c second on B7b's head.

## 3. Design

### 3.1 Call 12: sun, moon, time

- **Now**: `sun.ts:10` `sunToward(20°, 315°)` over `CENTRE`'s horizon,
  set once in `ground-lighting.ts:86-93` on two `DirectionalLight`s (land
  2.7, sea 1.58 irradiance via `intensityFor`), plus `HemisphereLight` sky
  0.9 kept over the eye (`island-scene.ts:267`).
- **Fixed in space, planet turned**: rather than rotate every tile, rotate the
  light: the sun's world direction at time `t` is `S(t) = Rz(−ω t) · S₀`
  (polar axis is the globe's pole axis — check `latLonToUnit`'s: B5 says
  Greenwich `+X`, east `−Z`, so the pole is `±Y`; turn about it), `ω = 2π`
  per game day. Equivalent on screen to the planet turning, no mesh moves.
- **Noon over the start**: keep today's look by
  `S₀ = sunToward(20°, 315°)` built in `û₀`'s local frame
  (`northAt(û₀)`, east = north × up), so #1 at t=0 is today's light exactly
  and #0 opens lit the same way over the Mediterranean. `sunToward` takes
  the frame instead of `CENTRE/EAST/NORTH` (drops `shared/globe`'s plane
  frame — one less B8 reader). The "noon" is the opening's chosen low sun,
  not overhead; say so to the lead (open call 1).
- **Moon**: a third `DirectionalLight` at `−S(t)`, colour cool `0xb4c4e8`,
  irradiance ~0.25 on land/sea (≈ 1/10 of the sun's, readable), plus the
  hemisphere fill dimmed by how night it is under the eye: `day =
  clamp(dot(S, up_eye)·k)`, sky intensity `mix(0.35, 0.9, day)`,
  sky colour toward `0x6070a0` at night. Never black: Lambert + 0.35 fill +
  moon ≥ ~25% of day on level ground. `ocean` material takes moon too.
- **Sky colour**: `skyColour(height)` → `skyColour(height, day)`: below
  100 km blend `DAY_COLOUR` with a night blue `0x1a2440` by `day`; space
  unchanged.
- **Time keys** (free per S7: T , . [ ]): `[` / `]` scrub back/forward
  (held: 1 game hour per real second, Shift ×6), `T` pauses/resumes. Default
  running at 1 day per 20 min? Recommend **paused at start** so frames and
  "#1 looks as today" hold; `T` starts it (open call 2). Time state lives in
  the scene beside the eye; play has `setTime(hours)` on the hook for
  frames. Keys bind by `code` (`BracketLeft`, `BracketRight`, `KeyT`), not
  in the eye's `BOUND` (time is not the eye's): a `bindTimeKeys(window)` in
  `pages/island/ui/` sharing eye-controls' modifier guard.

### 3.2 Call 15: where

- **Line** (one line, copy to clipboard and `console.log`):
  `island <commit> #<world>@<lat>,<lon>,<height>,<heading>,<pitch> t=<hh:mm> tiles=<levels>`.
  `lat/lon` from `unitToLatLon(eye.at)` deg 5 dp (~1 m); `height` m 1 dp;
  `heading` `headingOf(eye)` deg 1 dp; `pitch` = the look: `eye.look` deg 1 dp
  (pitch-from-height is derived; storing look round-trips exactly — the hash
  field named pitch carries look, open call 3); time from § 3.1.
- **Commit**: not checked (budget). Look for `NEXT_PUBLIC_*` sha in
  `sites/vova/next.config.ts` / `src/kernel/shared/config`; if absent, add
  `env: { NEXT_PUBLIC_COMMIT: git rev-parse --short HEAD }` in the site's
  `next.config.ts` (build-time, static-export-safe), `"dev"` when unset.
  Outside `src/` — the orchestrator's call who edits `sites/vova/`.
- **Tiles under the eye**: the levels of the held drawn tiles whose cap holds
  the nadir (`tileHolds`/`sphereToFace(eye.at)`) — one level, plus the min/max
  over `shown` within a few caps: `tiles=17 (12–17)`.
- **Key**: `KeyP` ("place") copies; not in S7's list but free (check:
  `BOUND` has W A S D, arrows, E Q, PageUp/PageDown). `island.where()` on
  `globalThis.island` (non-play too; distinct from `PLAY_HOOK` `__island`).
- **Hash grammar**: `#<world>[@<lat>,<lon>,<height>,<heading>,<pitch>]`, world
  `0|[1-9]\d*`, numbers decimal (sign, dot). Pure `parsePlace(hash)` →
  `{ world, pose?: Opening & { look } }`; lat ∈ [−90,90], lon wrapped, height
  clamped by `eyeAt`, any field bad → pose dropped, world kept. `formatPlace`
  its inverse. File `pages/island/lib/place-hash.ts`, beside
  `world-hash.ts` (replaces it).
- **Live hash**: the scene does not rewrite the hash while flying (noise in
  history); `where` writes it with `replaceState` on the key press only.

## 4. Open calls

1. **Noon**: today's low NW sun at t=0 (recommended — #1 "looks as today") vs
   the sun overhead at local noon (literal; flatter relief).
2. **Time at start**: paused (recommended: frames reproducible, the opening
   as today) vs running slowly.
3. **Pitch in the hash**: the look offset (exact round trip, recommended) vs
   the absolute pitch (readable; the parser converts by `pitchAt(height)`).
4. **The planar path**: dropped from the page in B7a, entities kept till B8
   (recommended) vs a shim switch until B8 (doubles the page's types).
5. **#1's seed** changes to the rolled `noise/seed`: hills differ from bite 2
   (recommended, one source of truth) vs pin bite 2's `worldSeed('1')` in the
   row.
6. **Commit plumbing** touches `sites/vova/next.config.ts`: B7c's to edit, or
   the orchestrator's.

## 5. Play and frames

- `pnpm play:island`: five heights unchanged (`setHeight` is pose-free); the
  INLET shots move to lat/lon (§ 1 Scripts); print `buildMs()` per screen;
  `--world 0` must be accepted (`assertWorldNumber`). B7a owns it (or B7a′).
- `pnpm film:island`: `LANDING`/`START` to lat/lon, slerped. B7a(′); B8 then
  films the face-edge and pole flights.
- B7b adds `setTime` to the hook and a noon/midnight pair; B7c the where
  round-trip frame via `call('where')` and a pose `playPath`.
- Frames go to `docs/remove-before-merging/island/bite-1-descent/frames`
  by default (play-island.ts:51-57) — pass `--out` for bite 3's.
