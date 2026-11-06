# Island, bite 1 — the thinnest descent

The contract is `docs/plans/world-game-zoltan-syama/bite-1.md`: what exists when
it is done, the calls it builds to, and how the member talks to the lead. This
file is the bite's gate and its record: `## Eaten so far` and
`## Rest of the bite` go here as the work runs, and a pause names what is built
and what is left.

The island's own plan, `docs/plans/world-game-zoltan-syama.in-progress.md`, is
the lead's, claimed by the lead's session; this bite never edits it, and its
standing constraints hold here too.

## This bite

The contract's nine calls, built as one-step agents (Opus, each in its own
worktree, pushing every passing step to `island/bite-1-descent`), briefed from
`docs/remove-before-merging/island/bite-1-descent/brief-common.md`. Paths are
the plan's; an agent may move a file inside its own slice and says so.

### Interfaces every step builds to

- **Units and frame.** The runtime works in metres, float64 on the CPU. World
  origin is the planet's centre, `+Y` its axis; the island's centre is the unit
  vector `c = (cos 10°, sin 10°, 0)`, east there `e = (0, 0, -1)`, north
  `n = (-sin 10°, cos 10°, 0)`. `R = 6 371 000`.
- **The island plane** is local `(x east, y north)` metres around the centre,
  mapped to the sphere azimuthally equidistant: `d = |(x, y)|`,
  `u = (x·e + y·n)/d`, point `(R + h)(cos(d/R)·c + sin(d/R)·u)`, and its
  inverse. Home: `src/island/shared/globe/` (S0), which also declares the
  `Coast` type below, since `entities/coast` and `entities/terrain` cannot
  import each other.
- **Coast data** — `src/island/entities/coast/` exports
  `coast: { kmPerPixel: number; rings: [number, number][][] }`, every ring a
  closed outer boundary in kilometres on the island plane, counter-clockwise,
  the first ring the main body (S1). The data reaches `terrain` only as an
  argument, passed by the page.
- **Height** — `src/island/entities/terrain/` exports
  `heightAt(field, seed, x, y): number` (metres above sea level, negative
  offshore; plane metres in) over the signed-distance field
  `buildCoastField(coast)` builds once, in the worker (S2, landed).
- **Tiles** — the same slice exports `TileKey = { level; x; y }` over the
  island's square (level 0 is the whole square, side `S` metres, a power-of-two
  split), `selectTiles(eye: Vec3, …): TileKey[]` splitting while a tile's extent
  over its distance from the eye exceeds a screen-share bound, and
  `fillTile(key, coast, seed)` → a fixed `N×N` grid (with a skirt) of positions
  relative to the tile's own centre (float32), that centre (float64), normals
  and heights (S3).
- **Eye** — `src/island/features/eye/` exports a pure model: state (position on
  the plane, height above ground), `step(state, input, dt)` with sideways speed
  proportional to height and height changing multiplicatively, and a DOM adapter
  binding wheel, pinch, `PageUp`/`PageDown`, `Q`/`E`, arrows/`WASD`, drag (S4).
- **Play hook** — the page exposes, only when the URL carries `?play`,
  `window.__island = { ready(): Promise<void>; setHeight(m): Promise<void>; step(ms): void; frameMs(): number[] }`:
  `setHeight` resolves once every tile the view selects is uploaded; `step`
  advances a seeded clock with the real one frozen (P).
- **Floating origin.** Every mesh is placed relative to the eye in float64 each
  frame, so float32 precision holds at two metres over a 6,371 km planet (S5).

### Steps

- [x] **S0** — the app: `src/island/` registered in `src/masd.json` with parent
      `scene`, `vova` gaining it; `globe`; the route
      `sites/vova/app/(game)/island/page.tsx` beside `/mushrooms`, out of the
      sitemap, rendering a client canvas page that says nothing yet.
- [x] **Wave 1, in parallel once S0 lands**, disjoint by slice:
  - **S1** — `entities/coast`: the pure tracer (call 1) with tests, the script
    `src/island/scripts/trace-coast.ts` decoding the webp through the tree's
    Chromium (no new image dependency), and the committed `coast.json`; reports
    the words that survived the island floor.
  - **S2** — `entities/terrain` height (call 4), tests on a synthetic coast.
  - **S3** — `entities/terrain` tiles and the quadtree (call 5) as pure
    functions; S2's `heightAt` reached by its signature, its file
    `model/height.ts` S2's alone and stubbed by S3 only if absent. The slice's
    `index.ts` is shared, each adding only its own export lines.
  - **S4** — `features/eye` (call 7), tests on the model.
  - **P** — `src/island/scripts/play-island.ts` and `pnpm play:island` (call 9),
    against the play hook above, red until S5.
- [x] **S5** — the scene (calls 5–6): `WebGPURenderer` falling back to WebGL 2,
      the depth buffer it chooses, the sea sphere, the worker entry filling
      tiles from their keys and the pool running it, the eye wired, the play
      hook.
- [x] **F** — the play run: frames at five heights on a phone and a desktop,
      committed to the working directory; the orchestrator looks at them beside
      the drawing, then a fix round.
- [ ] **Fix round** — `pnpm type-overlap` names `CoastGrid`, `TileKey`,
      `LatticePoint`, `Octave` and `Eye`/`Placed` against each other and the
      kernel's typings, since the base's new shared types landed after wave 1;
      and the play script's `median` and error capture move to `scene`'s
      `scripts/lib`, with an `awaitPromise` option on `cdp.ts`'s `evaluate`.
- [ ] **Tail** — `/polish`, vet green, PR body saying what each call became,
      frames posted to the lead through memo.

## Calls made in the build

- **The tracer finds the sea, not the land** (S1's first run kept ink words as
  land and split the main body along pale pencil, because bare paper and pale
  pencil overlap in saturation across the photo; a global threshold beat by
  this): a barrier is ink, closed by a 1–2 px dilation, or colour clearly above
  the _local_ paper's; the sea is flood-filled from the frame through
  non-barrier; land is the rest; a ring is kept only if enough of its interior
  is coloured, which drops words and the legend whatever their size.
- **Narrow lagoons close** (the bay below Рабу, mouths ~2 px): letting the sea
  back in through bare ink reopened them but split Апатин and Стамбулица off the
  main body, so the trace keeps them as land. Words count as land nowhere: a
  ring needs coloured pixels at least 2 px clear of ink, which every word scores
  0 on and every island 0.17 or more.
- **The sea is a surface per tile, not one sphere** (a sphere mesh fine enough
  still sags hundreds of metres between vertices, visible at 2 m): each tile
  fills a sea grid with height 0 beside its land grid, a coarse globe at R − 1
  500 m covers the planet outside the tile square, and log depth
  (`logarithmicDepthBuffer`) carries orbit to 2 m on both backends, where the
  reversed buffer needs an extension headless WebGL lacks.
- **The first frames read as one island** at orbit (the drawn outline, its arms
  and islets) and the descent is continuous with no holes; three things fail
  "plain-looking at every height", fixed in a second round: the sky is black at
  every height (it turns from space-black at orbit to a pale day blue by ~100
  km, by log height, the limb's glow left to a later bite); a portrait phone
  crops the globe at orbit (the camera's vertical fov widens so the horizontal
  one is never under 50°, and drag reads the same fov, so the ground still
  follows the finger); the coast steps at 1 000 km (tiles split finer where they
  straddle the coast, or the split ratio drops to 0.5 if the count holds under
  ~500 — the agent measures both). Underwater ground fades from sand to the
  sea's colour by −20 m, so a skirt that wins a depth tie between tiles draws as
  sea rather than as a sand speck.
- **Relief reads at every height** (the lead, on the first frames: "10 km is one
  flat olive field, and 2 m is a flat plain to a ruler-straight horizon … The
  test is that 10 km and 100 m each show hills you could point at"): the noise's
  mid and fine octaves carry hills of tens to hundreds of metres down to each
  level's grid spacing, still a pure function of position and seed; the ground
  is shaded by slope against one sun and its exposure lifted, so height reads by
  light and not only by colour bands. The pale patches on the heights are the
  snowline and stay; clouds are a later bite.
- **`Coast` stays outer rings only**: the lake by Цитадель falls into the land
  until the lakes bite (call 5), rather than widening the type now.

## DRY notes

- **The CDP driver is `scene`'s** (`src/scene/scripts/lib/cdp.ts`), shared with
  `pnpm play:mushrooms`; the island's play script adds only its own steps.
- **The tracer is one module**, run by the coastline script now and by the
  browser at star 7.
