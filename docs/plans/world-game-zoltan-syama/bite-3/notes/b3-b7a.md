# b3-b7a — the switch (B7a), hand-over

Base 8c616760, branch `wt/b3-b7a`. Stopped at the 170k context notice.

## Done (pushed)

- **b8b3ed04 worker path**: `openSphereWorld(world)` in `sphere-world.ts`
  (pinned row's series via a new `buildSphereWorld(world, { source, series,
  envelope, times })` options entry, seed always rolled — S14); worker builds it
  async, fills await one `world` promise (queued, in order, none throws);
  protocol carries `SphereField`, `CubeCell`, `TileMesh<CubeCell>`, plus a
  `failed` reply (a rejection in a worker reaches no `error` listener) the pool
  reports; pool sorts by `capGap` from the eye; tile cover on cube keys
  (`parentOf` stops at `CUBE_MIN_LEVEL`, `within` per face, `nearestFirst(keys,
  eye)`). `#0` accepted (`isWorldNumber` one regex, `OUR_WORLD` in `hash.ts`,
  `mask.ts` imports it). B4's two findings (`SPHERE_GROUND_SLOPE`, height's
  `CoastDistance`). Barrels export the sphere set. Tests: sphere-world (#1
  opened from the row: 1.27% land vs the rolled 34%, 10° N 0° 60 km inland),
  hash, world-hash (`#0` → `'0'`), cube quadtree/detail — 103 pass.
- **next commit, scene**: `island-scene.ts` on the globe eye (roots 6 × 16,
  `selectCubeTiles`, ground by direction, `STILL` under play, opening
  `openingOf(Number(world))`, `moveTo(lat°, lon°, m)` keeping the heading);
  `tile-meshes.ts` on cube keys. `tsc -p sites/vova` green; light untouched.

## Numbers

- World 2 in Node: roll 150, synthesis 456, contour 267, sweep 792 = 1666 ms.
  #1 via `openSphereWorld`: ~930–1590 ms. Field copy to main 16 MB per world.

## Left (B7a)

1. `model/tile-cover.test.ts` — still plane keys (root `pnpm typecheck` red on
   it alone, 12 errors): port to cube keys (parent across levels, `within` per
   face, nearest by angle incl. a face edge).
2. `ui/play-hook.ts` + `shared/play/play-hook.ts`: `moveTo(lat, lon, m)`
   docstring (types still say plane x/y; the scene already takes degrees), add
   `buildMs()` (pool's `Built.buildMs` — the scene must keep it from
   `started.field`).
3. `model/lowland.test.ts` port to the sphere (still planar, passes as is).
4. `en.json` S7 hint rows (↑/↓ look, E Q climb, right-drag, two-finger drag).
5. `island-canvas.tsx`: nothing needed for `#0` (`worldOfHash` takes it).
6. Gates not yet run on the scene commit: eslint (ran `--fix`, clean),
   `check:masd`, `check:cycles`, `masd:clusters`, `type-overlap`.
7. B7a′ untouched: `play-island.ts` INLET, `film-descent.ts`, `play-tab.ts`,
   `scripts/lib/azimuthal.ts` (their `moveTo` calls pass plane metres, now read
   as degrees — wrong until ported).
