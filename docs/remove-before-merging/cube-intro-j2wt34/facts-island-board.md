# Fact sheet: the island app and the design board

Read on 2026-11-12 from `claude/cube-intro-j2wt34` (one commit over `origin/main` ecc8703e) and `origin/claude/cube-review-perf` at ee317d10. Everything below was read in the named file unless a line says "inferred" or "not read".

Not read, so not vouched for: `src/cube/pages/**` (the cube's renderer), `src/board/pages/**` except `canvas/api/runtime.ts` and `canvas/model/store.ts`, `src/island/scripts/**`, the island's quadtree and tile-fill, `.claude/skills/review-board/SKILL.md`, `scripts/masd-check.README.md`, and the island board's `names`, `worlds`, `scale`, `forecast`, `perf`, `mammoth`, `bite1` files beyond a keyword search.

## Part A. The island

### Renderer and techniques today

- **three.js `WebGPURenderer` from `three/webgpu`**, which falls back to WebGL 2 by itself; `antialias: true`, `logarithmicDepthBuffer: true` ("the one depth mode both backends keep from orbit to two metres"). `src/island/pages/island/ui/island-scene.ts`. `backend()` reports `'webgpu'` or `'webgl2'`.
- **Materials are TSL node materials**, not hand-written WGSL: three `MeshLambertNodeMaterial`s (`land`, `sea`, `ocean`) in `src/island/pages/island/ui/ground-lighting.ts`, coloured by a `height` vertex attribute through `attribute`, `mix`, `smoothstep` from `three/tsl`.
- **Camera at the origin.** Every mesh is placed at its float64 centre minus the eye each frame, so only the small remainder reaches the GPU (`tile-meshes.ts`, `draw`). `NEAR = 0.5`, `FAR = 4 * (R + MAX_HEIGHT)`, FOV 50° on the narrower axis.
- **Terrain** is a quadtree of tiles over a 16 384 km square (`TILE_SQUARE`), levels 3 to 18, 65 x 65 vertices a tile (about 0.98 m spacing at level 18), split while a tile's side exceeds its distance from the eye. Tiles are filled in web workers (`tile-pool.ts`, `tile-worker.ts`, `tile-protocol.ts`) and sent as typed arrays. `src/island/entities/terrain/tile/model/tile.ts`.
- **Height** is `heightAt(field, seed, x, y, finest)` in `src/island/entities/terrain/height/model/height.ts`: a plateau rising inland (1000 m over 180 km), a sea floor falling offshore (3500 m over 30 km), plus 17 octaves of value noise from 400 km down to 6 m, each octave faded out within one wavelength of the coastline, and a 15 m lowland floor inland.
- **Coast** is a hand-drawn map traced once into vector rings (`src/island/entities/coast/model/coast.json`, kilometres on the plane, parsed with zod in `coast.ts`), then turned into a signed-distance grid, positive inland (`entities/terrain/coast-field`). `entities/coast/model/sea.ts` is image processing for the tracer (the land mask of the photographed drawing), not water rendering.

### Units, scale, determinism

- **Metres, float64, planet-centred.** `src/island/shared/globe/globe.ts`: `R = 6_371_000`, world origin the planet's centre, `+Y` its axis, the island plane local `(x east, y north)` metres around `CENTRE` (10° N), mapped azimuthally equidistant by `planeToWorld` / `worldToPlane`.
- **Scale**: the island is about 5 000 km across on an Earth-sized planet; the eye goes from `MIN_HEIGHT = 2` m to `MAX_HEIGHT = 20_000_000` m (`features/eye/model/eye.ts`).
- **Seed**: one constant, `SEED = 1`, in `src/island/pages/island/lib/tile-protocol.ts`, "the same in every worker and on the main thread". It is not read from the URL.
- **Noise** is `valueNoise(noiseSalt(seed, layer), u, v)` in `height/model/value-noise.ts`: an integer lattice hash through `Math.imul`, quintic fade, "integer arithmetic only on the lattice, so the same `(seed, layer, x, y)` gives the same value on every engine". CPU side only.
- **`dice`** (`src/dice/shared/roll/`) is the cube's seeded-roll app. `eslint/masd-graph.ts` `WAITING_APPS` holds it as an abstract app with one child on the operator's yes of 2026-11-11: "island, whose terrain rolls its world on dice's roll (branch island/round-world)". So the island is expected to take its randomness from `dice`, as the cube does. `masd.json` today: `"island": ["scene"]`, `"cube": ["scene", "dice"]`.

### Sky and water code that exists

- **Sky**: a flat background colour only. `skyColour(height)` in `pages/island/lib/sky-colour.ts` blends `SPACE_COLOUR 0x05070c` to `DAY_COLOUR 0xa9cbee` by the logarithm of height between 20 000 km and 100 km. No atmosphere, no clouds, no sun disc.
- **Sun**: one `DirectionalLight`, elevation 20°, azimuth 315° (north-west), colour `0xfff2dc`, built twice with different intensities for land and sea (`sunToward`, `intensityFor` in `lib/sun.ts`); plus one `HemisphereLight` kept overhead of the eye.
- **Sea**: a flat mesh at height zero over each tile's lattice, Lambert-lit, coloured by the sea floor's depth beneath it (`GROUND_STOPS` in `lib/land-colour.ts`: deep `0x0b3462` at -1500 m, through turquoise at -6 m, to sand `[0.86, 0.8, 0.6]` at 0 m and up to `SHORE_TOP = 20` m). Outside the tiles, a sphere of radius `R - 1500` in one flat `SEA_COLOUR`. No waves, no reflection, no foam, no surf.
- So nothing the cube intro needs exists in the island yet. What it does have that an ocean would reuse: the sand and shallow-water colour ramp, the sun-direction helper, the value noise.

### What `scene` is

- `"scene": ["kernel"]`, parent of `mushrooms`, `origami`, `board`, `island` and `cube`. It mounts nothing.
- `src/scene/shared/lib/plane.ts` (25 lines): base types only, `Abscissa`, `Ordinate`, `Point`, `Centred<P>`, `Zooming`, `Zoomed`, `Scaling`, `Gridded`, `Distant`. These are the single home for members several scene apps' types share (the `type-overlap` gate).
- `src/scene/scripts/lib/`: `cdp.ts` (headless Chromium over CDP, 241 lines), `page-errors.ts`, `in-turn.ts`, `median.ts`, used by each game's play and film scripts.
- It holds no rendering code, no noise, no colour, no shader.

### What the island board says about sea and sky

- `web-ocean` (image, `island.yaml`): "Inspiration: Noniv/web-ocean — what a browser can do with sea and sky. Nothing copied."
- `later-1` (sticky, `island/later.yaml`): "The sea bite: the general feel of web-ocean, sea and sky. A sun glint from orbit is optional, not required"
- `star-4` (`island/star.yaml`, zone "The north star — in no order"): "A sea that is a sea at every height, from glitter seen from orbit to waves at the shore"
- `star-1`: "The whole island from orbit, real enough to pass for a satellite photo, clouds drifting over it"
- `star-2`: "The dive through the cloud layer, and the shift from spirit to bird"
- `star-9`: "Infinite worlds: <url>#<seed> makes a whole world, the same for everyone down to a pebble on the beach. Ours is one exact world among them, and maybe the one every other world starts from. Under discussion."
- `call-3` (`island/calls.yaml`): "One coastline + one seed fix the world to the last pebble. Nothing stored but the coastline (and, one day, what players change)"
- `call-5`: "Two tiers: whole-map things (rivers to the sea, climate) computed once; everything finer a pure function of a tile's key"
- `call-6`: "three.js WebGPURenderer, falling back to WebGL 2 by itself: one code path, tiles filled in workers"
- `later-4`: "The shore is too straight … A later bite roughens it below one pixel of the drawing, so the drawn shape holds"

### Where the cube's ocean, sky and sand should live (my recommendation, not a finding)

Keep it in the cube now, in a slice of its own, written so the later move is a rename; do not put it in `scene/shared` yet unless the operator says yes to that.

The rule text that decides it, all from `.claude/rules/masd.md`:

- Cube and island cannot share sideways: "An import targets the same app or an ancestor, a strictly lower layer … so is any import between apps neither of which is the other's ancestor." The eventual shared home is fixed too: a shared block "drops to a lower layer, in the lowest app both consumers inherit", which is `scene`.
- But a home with one consumer is not yet earned: "No insignificant slices. A slice with a single upward consumer belongs _inside_ that consumer." "A slice whose one consumer would hold nothing else is that consumer." "Nothing goes into `shared` to quiet a checker." "an entity waits for code about the noun, not the mere idea of one." And for a new abstract app: "a `game` between `kernel` and `mushrooms` waits for a second game."
- The escape hatch exists and has a precedent: a slice whose consumer has not landed "carries `// masd-disable insignificant -- <what earns it>` in its `index.ts` on the operator's yes", and `dice` sits in `WAITING_APPS` on exactly such a yes, naming the island as the second child. So "put it in `scene` now" is available, but it is the operator's call, not the lead's.
- A sea and a sky are nouns, and "`shared/` carries no business logic, so code about one noun belongs in its entity". `scene` has no `entities/` layer today; whether a `scene/shared/<purpose>` segment with one consumer passes `check:masd` I did not verify (`scripts/masd-check.README.md` unread).

What makes the later move cheap, whichever home is chosen:

- Import nothing of the cube's from the ocean, sky and sand code: only `kernel`, `scene`, `dice`. Then the move to `scene` is `git mv` plus import paths.
- Metres, sea level at zero, sun as an elevation and azimuth (the island already has `sunToward(elevation, azimuth)`), seed passed in as an argument.
- Keep the deterministic maths (wave spectrum, sky model, cloud noise) as pure functions separate from the GPU glue. The island draws through three's TSL node materials; the cube, per the other branch's notes (inferred, not read), is hand-written WGSL in TS strings with its own pipelines. So what the island can take unchanged is the maths and, at best, WGSL functions through three's WGSL-function node; the pipelines will not carry over.
- Expect a scale gap: the island needs a sea from 2 m to 20 000 km on a sphere with a logarithmic depth buffer and eye-relative float64 placement. A flat ocean around a tiny island covers only the low end of `star-4`.

## Part B. The design board

### Three different things called "board"

- **The design board** (this part): `src/board` (engine), `src/cube-board` and `src/island-board` (content), built by `pnpm board`. MASD: `"board": ["scene"]`, `"island-board": ["board"]`, `"cube-board": ["board"]`.
- **The review board**: `.claude/artifacts/src/review-board/`, built by `node .claude/artifacts/src/review-board/scripts/build.ts`, a diff-card board for a PR, linked from a `<!-- review-board` sticky comment. PR #275's is https://claude.ai/artifact/1QrH94uoE3AHkQ4Wsxdwte. Unrelated code and a different artifact.
- **"The plan is the board"**: `.claude/hooks/board-notice.py` treats a `docs/plans/*.md` that opens with `**The plan is the board**` as declaring a design board, with one line per claude.ai organization: ``- `<organization key>`: https://claude.ai/artifact/<id>``, the key being the first 12 hex of SHA-256 of `CLAUDE_CODE_ORGANIZATION_UUID`. It reminds the lead to `watch` and `open` it and counts operator messages since the last publish. It stays silent on a branch whose working directory holds a `memo.md`.

There is no `CLAUDE.md` or `README` under `src/board`, `src/cube-board` or `src/island-board`. The documentation is the header comments of `scripts/board.ts`, `scripts/lib/board-file.ts`, `scripts/lib/board-files.ts` and `entities/item/model/item.ts`.

### The item schema

File form (`src/board/scripts/lib/board-file.ts`), one YAML document:

- The board's own file (`app/config/cube.yaml`) has `title:` and `items:`. A zone file has `items:` only.
- Every item: `id` (must match `^[\w-]{1,64}$`, unique across all the board's files, or the build throws "item X appears twice"), `type` (`sticky`, `zone`, `image`, `text`, `line`), `updated: [<ISO 8601 with Z>, <author>]`. The author is `agent:<role>` for a session (the cube board uses `agent:cube`, the island's `agent:lead`) or a `u_…` user id for a person.
- `box`, positional, then a trailing word: sticky `[x, y, w, colour]`; zone `[x, y, w, h]` or `[x, y, w, h, colour]`; image `[x, y, w]`; text `[x, y, size]` or `[x, y, w, size]`. Colours: yellow, pink, blue, green, orange, purple, gray. Sizes: h1, h2, body.
- `text` is each type's one text: a sticky's text, a zone's title, an image's caption, a line's label.
- A line has `ends: [from, to]` or `[from, to, dashed]`, and optionally `spiral: cw`. An end may be a zone, any placed item, or another line.
- `src:` on an image is `images/<file>`; the file itself sits beside the zone files in `app/config/<board>/` and is copied to `images/` at build. Existing ones are `.webp`.
- `icon:` on a sticky or zone: one emoji, or `icons/<name>.svg` from `app/config/<board>/icons/`.
- `done: true` ticks a sticky. `deleted: true` is a tombstone and is kept for good, so an older copy never brings the item back.

How files include each other: there is no include directive. `readBoardFiles` reads `<board>.yaml` plus every `*.yaml` in the directory of the same name, in name order. Which file an item lives in is derived, never chosen (`board-files.ts`, `homeOf`): a zone lives in `<its id less "z-">.yaml`; a sticky, image or text lives in the smallest live zone that contains the midpoint of its top edge, else in the board's own file; a line lives with the item it starts from; a deleted item stays where it was. `pnpm board refile <board.yaml>` and every `sync` re-derive this for every item and move items between files.

### Build, publish, sync

- `pnpm board build src/cube-board/app/config/cube.yaml [<out>]` writes `tmp/board/cube/index.html` (for the Artifact tool), `local.html` (wrapped, for a browser from disk), `images/` and `icons/`. The page bundles `@/board/pages/board` with esbuild and bakes every item in as JSON. Budget: 160 KB for the page, or the build throws.
- Publishing is the Artifact tool on that `index.html` with `images/` and `icons/` as supporting files. The page uses the runtime capabilities `db`, `user` and `assets` (`canvas/api/runtime.ts`).
- Live edits made in the artifact are rows in its `db` collection `items`, one document per item, doc id = item id. `pnpm board sync <board.yaml> <rows> [<assets>]` folds rows newer than the repo back into the YAML; uploaded images must first be fetched into `<assets>`.
- `pnpm board snapshot <out> <png>` renders the built page with headless Chromium, used for the case study's picture.
- **Where the cube board's artifact URL is recorded: I did not find it.** No `docs/plans/` exists on this branch, `origin/main` or the other branch; a grep of the tree for `claude.ai/artifact` finds only a test fixture, hook tests and one calculator link in `cube/space.yaml`. The cube's old plan at `b72e15cf:docs/plans/cube-beauty.paused.md` has no "plan is the board" header. The coordinator has to get the URL from the other session or from `Artifact` `list`.
- An artifact is seen only by the account that published it (hook docstring, and relay-1: an old board was a 404 from another account).

### History and versions

- **The board keeps no history of its own states.** A grep of `src/board` for slider, timelapse, history and replay finds nothing. There is no time slider.
- `updated` drives one thing: the merge. `mergeItems` in `item.ts` takes, per item id, the copy with the newer `updated` (compared as strings), a tie going to the overlay; order follows the base, new ids after. The page shows baked items overlaid with db rows overlaid with unsaved local edits (`canvas/model/store.ts`).
- So the board's history is git history of the YAML, plus whatever the artifact platform keeps per publish. What "version N" means on the platform side is not stated anywhere in the repo.

### What the other branch added (origin/claude/cube-review-perf, PR #275)

Four commits touch `src/cube-board`, oldest first: f1fec36d, 825da932, 7136ff81, 8cd2fed3. All authored `agent:cube`, stamped 2026-11-12T21:00 to 21:40Z. Net against `origin/main`:

- `cube.yaml`: `img-price-time`, image at `[2320, 2740, 900]`, appended at the end.
- `cube/space.yaml`: sticky `graf-price-time` at `[1368, 2180, 244, yellow]` and line `l-price-time` (`graf-price-time` to `img-price-time`), appended at the end.
- `cube/best-of.yaml`, new: zone `z-best-of` at `[3640, 3060, 1880, 640, purple]` with images `img-best-60`, `img-best-19`, `img-best-09`.
- `cube/one.yaml`: zone `z-one` widened from 1395 to 1880 and restamped; sticky `one-7` at `[5008, 110, 244, yellow]` inserted right after the zone.
- Four new images: `best-09-carpets.webp`, `best-19-my-house.webp`, `best-60-depth-buffer.webp`, `price-by-time-chart.webp`.
- Each of the four commits also rewrites a cost row, `.claude/costs/…/3/89b245e4-c40b-58b7-8505-3bc160ae0a60.json`.

`relay-2.md` and `todo.md` say nothing about how the design board is published. `todo.md` § 5 cites the board's `one-5` and `graf-price-time` stickies as the record of the pricing idea. In `relay-1.md` the operator's «добавим на борду» was read as the review board and never confirmed.

### What would make two branches' board edits conflict

- **Same-file appends.** New items go at the end of a file, and the other branch already appended to `cube.yaml` and `cube/space.yaml`. An item this branch appends to either conflicts textually on cherry-pick or merge. A new zone in a new file with new image files does not.
- **The cost row riding in each commit.** A cherry-pick of a board commit carries a `.claude/costs/` file; relay-2 § 5 records that this conflicts and is dropped with `git rm`, the `cost-ledger` branch holding the row.
- **Derived homes.** An item written into the "wrong" file still builds, but the next `refile` or `sync` on either branch moves it, which shows as a delete in one file and an add in another. Place items so their file is the one `homeOf` names.
- **Duplicate ids** across the two branches fail the build once both land.
- **Overlapping geometry.** Taken on the other branch: `z-best-of` covers x 3640 to 5520, y 3060 to 3700; `img-price-time` sits at x 2320 to 3220 from y 2740; `z-one` now reaches x 5520. A new zone overlapping these changes which zone existing items resolve to.
- **`updated` against live edits.** If anyone edited an item in the artifact, its db row is newer than the YAML, and a YAML edit with an older or equal stamp will not show until `sync` runs or the stamp is later. Stamps are hand-written, so two branches can also write the same item with stamps in the wrong order; the later string wins regardless of commit order.
- **Publishing from two branches.** A publish replaces the whole baked page with that branch's items. Published from a branch that lacks the other's commits, the board loses the other's items (only db rows survive). One branch should be the only publisher, and it should publish only after the cherry-picks are in.
- **Linear history.** Both branches fork from ecc8703e. The other branch already contains a merge of `origin/main` (1fddc881); its board commits come after it, so they cherry-pick cleanly onto anything that has `main`.
