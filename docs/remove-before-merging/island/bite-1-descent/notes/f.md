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

Also fixed: orbit filled 128 tiles for 64 roots, since `selected()` asked for
`[...ROOTS, ...keys]` and the selection holds the roots too; the ask is now
de-duplicated by `tileId`.

Numbers (final build, scratch instrumentation, not committed), desktop / phone:
field build 343–425 / 340–454 ms per worker; tiles uploaded and median fill ms
per height — orbit 64 (1.5 / 1.6), 1000km 28 (1.3 / 1.4), 10km 100 (1.0 /
0.9), 100m 64 (0.9 / 0.9), 2m 0; frame median 0.9 / 1.0 ms over 25 frames at
load average ~3.7 / 3.6 / 3.2 on 4 cores.

Phone frames match desktop; at orbit the globe is wider than the portrait
screen and is cut at both sides.

Left:

- R1's type-overlap tidy for page types (`FilledTile`, `Held` → `TileKeyed`;
  `TilePool`, `IslandScene`, `TileMeshes` → `CanDispose`), deferred.
