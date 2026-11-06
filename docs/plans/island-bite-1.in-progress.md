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
  `heightAt(coast, seed, x, y): number` (metres above sea level, negative
  offshore; plane metres in), built over a signed-distance field it computes
  once per `(coast)` (S2).
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

- [ ] **S0** — the app: `src/island/` registered in `src/masd.json` with parent
      `scene`, `vova` gaining it; `globe`; the route
      `sites/vova/app/(game)/island/page.tsx` beside `/mushrooms`, out of the
      sitemap, rendering a client canvas page that says nothing yet.
- [ ] **Wave 1, in parallel once S0 lands**, disjoint by slice:
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
- [ ] **S5** — the scene (calls 5–6): `WebGPURenderer` falling back to WebGL 2,
      the depth buffer it chooses, the sea sphere, the worker entry filling
      tiles from their keys and the pool running it, the eye wired, the play
      hook.
- [ ] **F** — the play run: frames at five heights on a phone and a desktop,
      committed to the working directory; the orchestrator looks at them beside
      the drawing, then a fix round.
- [ ] **Tail** — `/polish`, vet green, PR body saying what each call became,
      frames posted to the lead through memo.

## DRY notes

- **The CDP driver is `scene`'s** (`src/scene/scripts/lib/cdp.ts`), shared with
  `pnpm play:mushrooms`; the island's play script adds only its own steps.
- **The tracer is one module**, run by the coastline script now and by the
  browser at star 7.
