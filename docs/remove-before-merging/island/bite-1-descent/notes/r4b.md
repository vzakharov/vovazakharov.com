# R4b — wiring the terrain fixes (paused at the subagent context budget)

## Done (pushed, 5cec2ed37 + style 9f7f754cc)

1. `fillTile(key, sample, { finest })`: `finest?: (x, y) => number`; per vertex the cut is `max(finest(x, y), 2·spacing)`.
2. `WorkerRequest` `fill` carries `eye: Vec3`; the worker fills with `{ finest: detailCut(eye) }`; `TilePool.want(keys, eye: Vec3)` (plane point for `nearestFirst` via `worldToPlane`); scene calls `pool.want(missing, at)`.
3. Scene `selected()`: `selectTiles(at, { coast, frustum: frustumOf(forward, up, fov, aspect), ground: groundAt })`; reselects also when `forward` turns past `RESELECT_TURN = cos(0.05)` (half the frustum's 0.1 rad margin) or `camera.aspect` changes. `selection` gained `forward`, `aspect`.
4. Tests: `terrain/model/detail.test.ts` (adjacent-level tiles agree bit for bit along their shared edge under `detailCut`, and disagree under the old per-tile cut; the cut never goes finer than the coarser neighbour's 2·spacing); `quadtree.test.ts` § "in a view" (frustum drops every tile wholly 10 km+ behind and keeps ones ahead; horizon drops a tile 1 000 km ahead, keeps 200 km); `pages/island/model/lowland.test.ts` (500×500 grid over the real coast's bbox, every inland point ≥ 0 at cuts 0/2/60/2000/60000 m — the pre-R4 `height.ts` had 918 of 64 487 inland points below 0). New `terrain/index.test-only.ts` exports `sampleCoastField` for it.
5. Checks: typecheck, eslint over the terrain slice + `pages/island/{lib,model}` + scene, prettier (fixed two pre-existing lines in `model/tile-cover*.ts`; `lib/land-colour.ts` — R3b's — failed `prettier --check` before R3b's last push, not re-checked since), `pnpm check:masd`, terrain + page suites 57/57.

## Tile counts (eye over (0,0), heading 0, real coast, `tmp/r4b/measure.ts` in the worktree; orbit / 1000 km / 10 km / 100 m / 2 m)

| | desktop 1440×900 | phone 390×844 |
|---|---|---|
| before (R4's table, no frustum) | 60 / 300 / 128 / 159 / 159 | same |
| `ground` passed, no frustum | 60 / 300 / 128 / 159 / 159 | same |
| frustum + ground (as wired) | 60 / 45 / 26 / 103 / 86 | 60 / 68 / 32 / 89 / 76 |

`selectTiles` with frustum + ground: 2–6 ms per reselect.

## Left

1. Coordinator's additions after R3b: drop per-vertex `colours` from `tile-protocol.ts` (`Land`, `filledBuffers`) and `tile-worker.ts` (`landColours`), checking `ui/tile-meshes.ts` no longer reads them (that file is open for this only); export terrain's `borderLoop` (`model/tile-fill.ts`) through the terrain index and make `lib/colour-heights.ts` use it, deleting its `borderWalk` copy.
2. Play run, desktop and phone, five heights: scratch copy (`git archive HEAD` → tar into the scratchpad; no rsync in the container), `pnpm install --offline`, `pnpm build vova`, `pnpm play:island --no-build --out <dir>`; frame medians; two or three frames proving seam and puddle fixes into `notes/r4/` (not `frames/`). Report per height: hills lit/shadowed, the pale skirt seam lines at 1 000 km gone, sea colour as before, and what shows of R4's stale-cut limit (`held` keeps a tile's first eye's cut).

## Surprised

- `ground` changes no count: per-tile relief needs `GROUND_SLOPE·side < HIGHEST_GROUND`, i.e. tiles under ~500 m, and those are never near the horizon or a frustum edge that matters. The frustum does all the cutting.
- With culling, `held.evict` drops tiles behind the eye, so turning around refills them.
