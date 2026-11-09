# Bite 1 — the thinnest descent

The contract the lead hands the member who builds bite 1. Its sticker on the
board points here; the board's north star and calls
(`src/island-board/app/config/island/star.yaml`, `calls.yaml`) are what it
stands on, and each call it settles is written below rather than re-argued in
the build.

## What exists when it is done

`/island` on vovazakharov.com opens on the whole island seen from orbit, the
coastline Zoltan and Syama drew, on a planet that curves away at the edges.
Scrolling, pinching or a key takes the eye down, continuously and with no
loading screen, until it hovers a couple of metres over the ground; moving
sideways at any height covers ground in proportion to the height. That is the
whole bite: a world you can fall into, plain-looking at every height.

## Calls

1\. **The tracer is one pure TypeScript module**, RGBA pixels in, polygons out:
a land mask (paper is anything near white and low in saturation; coloured fill
and the ink line both count as land), marching squares, holes under an area
floor filled, islands under an area floor dropped, then Douglas–Peucker. It runs
in a script now and in the browser later (star 7), so it imports nothing that
needs either.

2\. **The traced coastline is committed data**: one script reads
`src/island-board/app/config/island/map-zoltan-syama.webp` (the only copy in the
tree, 1400×993), and writes the polygons in kilometres to a JSON the game
imports. The game never reads the image (call 2). The map's lettering and its
legend sit on paper and fall out with the mask; any word drawn over the sea that
survives is dropped by the island floor, and the member says which survived.

3\. **Scale**: the main body is about 5,000 km across, on a planet of radius
6,371 km (call 1); the island's centre sits at latitude 10° N. The script fixes
km-per-pixel from the main body's width and writes it beside the polygons.

4\. **Height is a pure function of position and the seed** (call 3): a plateau
rising with distance from the coast, plus a few octaves of value noise whose
amplitude grows inland, sea floor below zero offshore. No rivers, lakes or
fractal coast yet (calls 4–5 are later bites); the function's signature takes a
seed so they slot in.

5\. **Terrain is a quadtree of tiles keyed by `(level, x, y)`** over the
island's square, each tile a fixed grid whose vertices are bent onto the sphere,
split by the eye's distance so a tile covers roughly the same share of the
screen at every height. Tiles are filled in a worker (call 6), from the key
alone; the main thread only uploads them. The sea is the sphere itself at radius
R.

6\. **Renderer**: three.js `WebGPURenderer`, letting it fall back to WebGL 2
(call 6). The depth range from orbit to two metres is handled by a logarithmic
or reversed depth buffer, whichever the renderer supports on both paths; the
member says which.

7\. **The eye is the spirit** (star 5): no bob, fast, height changes on wheel,
pinch, `PageUp`/`PageDown` or `Q`/`E`; sideways on arrows/`WASD` and on drag,
speed proportional to height, so going far means climbing. Bird and walker are
later bites.

8\. **Where it lives**: `src/island/` (call 7), an app whose parent is `scene`
(as `mushrooms` and `origami`), `vova` gaining it as a parent, routed at
`sites/vova/app/(game)/island/page.tsx` beside `/mushrooms`. Not in the sitemap
until the game ships.

9\. **Looking**: a play script in `src/island/scripts/` on `scene`'s
`scripts/lib/cdp.ts`, as `pnpm play:mushrooms` does: build, serve, step a seeded
clock, and shoot the page at five heights — orbit, 1,000 km, 10 km, 100 m, 2 m —
on a phone and a desktop screen, failing on any page error and printing a
frame-time median beside the load average. Each frame is looked at beside the
drawn map.

## Out of the bite

Clouds, the bird, the walker, the coast fractalling, rivers and lakes, forests,
sea glitter and waves, your own map, towns. Each is a later bite on the board.

## Done when

- `/island` builds in the static export and the five heights read as one island,
  checked by eye against the drawing, frames committed to the bite's working
  directory and posted to the lead through memo;
- vet is green on the bite branch;
- its PR, based on `claude/world-game-zoltan-syama-hodowq`, carries the frames
  and a body saying what each call became.

The lead merges the bite once vet is green and it has looked at the frames, then
publishes `/preview live` (mammoth 4).

## For the member

- Talk to the lead with `python3 scripts/memo/memo.py post --as member` and wait
  with `wait --as member`; a question the work can go on past is posted and not
  waited on.
- Orchestrate: one build step per agent, the model named on every `Agent` call
  (Opus), each agent in its own worktree and pushing every passing step
  (`.claude/skills/mammoth/notes/subagents.md`).
- The board is the lead's: propose a change to it through memo.
