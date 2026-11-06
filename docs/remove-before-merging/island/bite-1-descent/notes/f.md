# F — first play run

Backend: **WebGL 2 fallback** (headless Chromium, no GPU), read through a
scratch-only `backend()` on the hook (`IslandScene.backend` already exists; the
hook type lives in `shared/play`, outside F's paths).

Worker URL: `new URL('tile-worker.ts', import.meta.url)` bundles. Turbopack
emits `static/chunks/turbopack-worker-*.js` and the pool constructs it. It also
copies the raw source to `static/media/tile-worker.*.ts`, which no chunk
requires: dead, harmless, unverified whether `./` would drop it.

Frames (desktop, after the fix):

- orbit — one island matching the drawn coastline (twin north fingers, west
  arm, south tail, east spit, outlying islets); the sea globe edge clean.
- 1000km — upland and peaks, a coast with a sand band, no holes.
- 10km, 100m — plain lowland green, no holes, faint facet streaks only.
- 2m — horizon flat, near plane fine, sky is the black background.

Fixed: orbit showed sand specks on straight lines over open sea. Painting
sub-sea ground red proved them ground: land and sea skirts of a tile are
coplanar, and where adjacent tiles leave a sub-pixel crack the land skirt
(coloured sand, since all ground under the sea was sand) won the depth tie.
`land-colour.ts` now fades the floor from sand at 0 m to the sea's colour at
−20 m (`SEA_COLOUR`, shared with the sea material), so a lost tie draws as sea.

Numbers (desktop, scratch instrumentation, not committed): field build 319 /
364 ms (two workers); fills per height and median fill ms — orbit 128 (1.4),
1000km 28 (1.2), 10km 100 (0.9), 100m 64 (0.8), 2m 0; frame median 0.8 ms over
25 frames at load average 4.32 / 3.33 / 3.00 on 4 cores.

Left:

- **Roots filled twice**: orbit's 128 fills are 64 roots × 2, since
  `selected()` passes `[...ROOTS, ...keys]` and both hold the roots; nothing
  dedupes by `tileId`. One-line fix in `island-scene.ts`, not yet made.
- Phone frames not run yet.
- R1's type-overlap tidy for page types (`FilledTile`, `Held` → `TileKeyed`;
  `TilePool`, `IslandScene`, `TileMeshes` → `CanDispose`), deferred.
