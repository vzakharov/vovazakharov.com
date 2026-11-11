> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# The shrinking cube, iteration zero

A first-person maze game at `/cube` on vovazakharov.com: 64 floors stacked
inside one cube, each floor a perfect maze of rooms, the player half as big on
each floor down. Every floor has exactly one hole, and finding the hole on floor
_n_ is a search over `4^(n−1)` rooms that no client can shortcut, because the
hole is a SHA-256 commitment. Floor 64 is "never" (~2^126 rooms). The design
discussion behind it is
`docs/remove-before-merging/hash-maze-cube-m6wq80/relay-1.md`.

Vova's ask, verbatim (the go-ahead this plan answers to):

> давай не артефактик а сразу построим нулевую итерацию игры -- nothing fancy,
> а-ля вольфенштейновская отрисовка (но true 3D, так как будем смотреть
> вниз/вверх), на чистом webgpu 1- 64 этажа, т.е. уменьшение х2 на каждом
> уровне; на первом этаже 1 комната 2- без бутылочки, каждая нора тебя
> автоматически уменьшает x2; "дверь" -- просто отсутствующая стена в комнате 3-
> нора (в полу, не в стене), должна находиться там, где у следующего лабиринта
> есть комната, т.е. в одной из четвертей комнаты а не посередине 4- через нору
> должно быть видно следующую комнату (вниз) и наоборот (вверх) 5- уменьшение
> происходит когда становишься на норку и нажимаешь рубильник рядом на стене
> (проваливаешься посреди уменьшения, когда становишься "достаточно маленьким
> чтобы провалиться", при эмом изменение масштаба для глаз отрисовывается в
> реальном времени, без скачков); у каждого следующего уровня другой оттенок
> стен комнат 6- всё что связано с сидами, рандомностью итп переиспользовать из
> строящегося "острова" (/island; также ещё недостроенной части в #266 …). Это
> значит что применимое нужно выносить в отдельный абстрактный подапп и
> использовать в обоих аппах

then: «island-board тоже переиспользуем и выносим общее в board»; «под "Общим в
борде" я имел в виду не карточки а механизмы»; «подход к обновлению борды тот же
-- после всех интересностей; на первую итерацию засунуть то что пока обсуждали,
со скриншотами из артефактов (но всё должно быть на английском)».

## The world

### Geometry

- **The cube is the unit.** Floor `n` (1…64) is a `2^(n−1)` × `2^(n−1)` grid of
  rooms, room side `2^−(n−1)`, room height `0.5 ×` side. Floors stack directly:
  floor `n`'s ceiling is floor `n−1`'s floor slab, so the stack's height is the
  Zeno sum `0.5 + 0.25 + …`, which closes the cube at 1. Floor 1 has a lid.
- **In metres, floor 1's room is 5 × 5 m and 2.5 m high**, so the cube is 5 m on
  every side, and the player on every floor is a person to that floor's room:
  eye at 1.6 m, a 0.6 m collision circle. Every proportion below is that room
  taken as 1. Floor 64's room is ~5 · 10⁻¹⁹ m; from floor 53 on a room is
  smaller than a proton.
- **Under every room lie exactly four rooms of the floor below**, one per
  quarter. A hole is a square in the middle of one quarter, side `0.08 ×` room
  side (0.4 m on floor 1), so it opens onto the middle of the room below it
  (point 3).
- **Rooms are addressed `(n, x, y)` with `x, y` BigInt** (`< 2^63` on floor 64);
  every number the renderer sees is relative to the player (below).

### The maze: recursive division, computed locally

Floor `n` is a quadtree of depth `n−1`. In every block, its four quadrants are
joined by three of the four edges between them (which one is omitted is hashed),
and each joined edge has one door, a missing wall, at a hashed position along
it. Each quadrant is the same construction one level down, so the floor is a
perfect maze: every room reachable, exactly one route between any two.

**Whether a wall is open is a function of that one wall**, never of a built
grid: the wall between `x` and `x+1` belongs to the block at the level where the
two indices first differ (the trailing ones of `x`), and is open iff that block
keeps that edge and its door sits at this row. That is O(level) hashes, so a
floor of 2^126 rooms costs what a floor of four does. Door positions on edges
longer than 2^32 rooms take two words.

**The maze's randomness is a typed `roll` schema, never a path spelled by hand**
— the interface Vova asked for on the island («по continent/2/river/1/length --
надо сразу думать о каком-то строго типизированном интерфейсе»), which
`round-world` built as `roll`:

```ts
const blockKey = roll.key({ n: roll.int, level: roll.int, x: roll.big, y: roll.big });
const edgeKey = roll.key(['north', 'east', 'south', 'west']); // a block's inner walls
const Maze = roll.struct({
  block: roll.over(blockKey, roll.struct({
    omit: roll.pick(4),
    door: roll.over(edgeKey, roll.wide()),
  })),
});
// maze.block.at({ n, level, x, y }).door.at('east') — typed, read on demand
```

A leaf's path is still its place in the tree followed by its keys
(`block/<n>/<level>/<x>/<y>/door/east`), derived from the schema and hashed by
`dice`'s `pathHash` (MurmurHash3; the maze is scenery, so it needs speed and
spread, not cryptography). What `round-world`'s `roll` lacks is a rule over keys
it cannot list: `rollWith` decodes the whole tree and a `table` fills a flat
array, and a floor of 2^126 rooms has no whole. So `dice` adds, beside the
verbatim vocabulary, **`roll.over(key, of)`** — one `of` over every value of
`key`, never enumerated, decoded by `.at(key)` when asked, of which `table` is
the finite case laid out in advance; **`roll.key`**, a key's type and how it
spells its path segments, as a record of typed parts or a closed list;
**`roll.pick(k)`**, an integer leaf on `[0, k)`; and **`roll.wide()`**, a door
position on an edge longer than 2^32 rooms, read from two words at `…/0` and
`…/1`. `Rolled<S>` maps an `over` to its `.at` lookup, so the cube's code never
sees a path or a raw word.

### The hole: one per floor, a SHA-256 commitment

**Exactly one room per floor has a hole.** The world is one world: a second hole
would drop the player onto the same floor below, so it would be a second key to
the same door, and the lock would open at the first one found. So "every hole
shrinks you" (point 2) reads as: the hole itself is the shrinking, and there is
one per floor.

- **The world file holds 63 commitments**,
  `c_n = SHA-256("<seed>/hole/<n>/<x>/<y>")`, where `(x, y)` is the room on
  floor `n+1` that the hole of floor `n` drops into. A room on floor `n` has the
  hole iff one of its four children hashes to `c_n`: four digests per room,
  cached, through WebCrypto (`crypto.subtle`, async; also in Node's tests), no
  dependency.
- **Planted and forgotten.** `src/cube/scripts/plant.ts` draws each landing room
  with `crypto.getRandomValues`, writes the seed and commitments, and keeps no
  answer anywhere. Nobody, the author included, can skip a floor. Tests plant a
  small world of their own whose answers they keep.
- **Secrecy of the seed buys nothing**, so the seed is public and the client
  generates everything; the one thing that must not exist in the client is the
  answer, and it does not exist anywhere.

### The player

- **Body diameter `0.12 ×` room side, eye at `0.32 ×`** (0.6 m and 1.6 m on
  floor 1); **walk at `0.28 ×` room side a second** (1.4 m/s), **mouse look with
  pointer lock (pitch to ±89°), collision as a circle against present walls.**
  Desktop only in iteration zero.
- **The lever** sits on whichever of the hole quarter's two outer walls is
  present (the x-wall first); where both are doors, on a post at that corner.
  `E` pulls it when the player stands over the hole and the lever is within
  `0.16 ×` room side (0.8 m, an arm's reach and a step).
- **Shrinking is continuous**: scale `s(t) = 2^(−t/3 s)` from 1 to ½. The body
  stops resting on the slab once its diameter is under the hole's side (at
  `s ≈ 0.67`: on floor 1 a body of 0.4 m, eye at 1.07 m, over a 0.4 m hole); it
  falls under gravity, still shrinking, and lands on floor `n+1` at `s = ½`,
  which is a full-size player of that floor. Then the frame is rebased to floor
  `n+1`'s units, an exact change of units the eye cannot see.
- **Wall hue per floor** by the golden angle: `hue_n = n × 137.508° mod 360`.

## The renderer: plain WebGPU

- **No three.js.** One render pipeline, WGSL, vertex = position + normal +
  colour, one uniform buffer (view-projection), depth test, Lambert from a fixed
  light plus a floor-tinted ambient, distance fog. `@webgpu/types` is already a
  dev dependency.
- **Floating origin.** Geometry is built in doubles relative to the player's
  room and divided by the player's scale before it becomes float32, so floor 64
  renders like floor 1.
- **What is drawn**: floor `n`'s rooms within a radius of the player (walls with
  their door gaps, the floor slab with its hole cut as four rects), floor
  `n+1`'s rooms under that footprint (seen through the hole, point 4), and floor
  `n−1`'s slabs and room above (its hole is this room's ceiling hole, point 4
  upwards). The vertex buffer rebuilds when the room set changes.
- **No WebGPU** shows a one-line message; iteration zero has no fallback.

## Apps

`src/masd.json` grows three entries, parents above children:

- **`dice`** (no parents): seeded randomness, `shared/roll`: the `roll`
  vocabulary (typed schemas, a leaf's word keyed by its path), its decoders
  (uniform, normal by AS 241) and `pathHash`, taken verbatim with their tests
  from `island/round-world`
  (`src/island/entities/terrain/world/{roll,land/model/hash.ts}`), plus the
  `over`, `key`, `pick` and `wide` the maze needs (§ "The maze"), additive
  beside them. `cube` consumes the vocabulary; `island` switches to it when
  `round-world` lands (see Coordination).
- **`board`** (parent `scene`): the board's mechanisms, out of `island-board`:
  `entities/item`, `pages/board`, `app/styles`, `scripts/` (`board.ts` and its
  lib). The page title comes from the board file's `title`, not a literal.
  `pnpm board <board.yaml>` keeps its arguments, so the island team's commands
  run unchanged.
- **`island-board`** keeps only its cards: `app/config/island.yaml` and
  `island/`, untouched paths; parent `board`.
- **`cube-board`**: the cube's cards, `app/config/cube.yaml` and `cube/`; parent
  `board`.
- **`cube`** (parents `scene`, `dice`): the game. `entities/world` (maze, hole,
  geometry, the planted world JSON), `features/player` (movement, lever,
  shrink), `pages/cube` (canvas, WebGPU renderer, controls hint), `scripts/`
  (`plant.ts`, `play-cube.ts`). `vova` gains `cube` as a parent; the router adds
  `sites/vova/app/(game)/cube/page.tsx` beside `island` and `mushrooms`, kept
  out of the sitemap and the index the way `/island` is.

If `check:masd` refuses a data-only `*-board` app, each gets a
`scripts/board.ts` entry over `board`'s CLI core (the sitemap's pattern: core
low, entry per leaf) and `pnpm board:<name>` runs it.

## DRY notes

- **Shared, moved once**: `roll`, the decoders and `pathHash` into `dice`; the
  board's whole mechanism into `board`. Neither is copied into `cube`.
- **`dice` duplicates `round-world` until that branch lands**, the one
  duplication this plan creates: the code is taken verbatim, and the island lead
  deletes theirs and imports `dice` at their merge. Moving it on `round-world`
  first would block this work on a branch another team holds. The lazy nodes are
  new code in `dice` alone, so they add nothing to that merge but an import.
- **Not moved**: `island`'s `value-noise.ts`. It is seeded randomness too, but
  `round-world` rewrites it (57 lines changed), so moving it now is a guaranteed
  conflict for no gain to the cube, which uses no noise. It joins `dice` in the
  island's own merge.
- **Not shared with `island`**: rendering. The island is three.js on its WebGPU
  backend; the cube is plain WebGPU by Vova's choice, so nothing there is a
  common mechanism yet.
- **SHA-256 lives in `cube`**, not `dice`: one consumer, and WebCrypto is the
  implementation, so the module is the commitment format and nothing else.
- **`scene/scripts/lib/cdp.ts`** drives `play-cube.ts` as it drives the island's
  and mushrooms' plays.

## The board

`cube-board` v1 holds the discussion so far, in English: the hash lock (wall
with one door, ~2^80 ≈ a bitcoin block), field vs wall, the two promises
(passable / never), clicking vs silent locks, pyramid → cube, the shrink factor
`r ≈ 2^(64/N)` and why iteration zero takes `r = 2, N = 64`, the milestones
(stubborn human 100 / 1 000 / 10 000 h, laptop, GPU, ASIC, the bitcoin network,
quantum, never), first person changing nothing for the lock, and this plan's six
points. Screenshots come from the four artifacts, each rendered from a local
copy translated to English (the published artifacts stay as they are):
wall-or-field, two-promises, silent-lock, shrinking-cube. It is published as an
artifact with its `db`, as the island's is, and updated the same way: after
every turn that settles something worth pinning, and at each bite's end, with
`board vN pins …` commits.

## Testing

- **Pure, in the suite**: the maze is perfect on floors 1–7 (BFS over the wall
  predicate: connected, edges = rooms − 1) and the predicate agrees with a full
  recursive build; a planted test world has exactly one hole room per floor and
  it sits over its landing room; `dice`'s tests as they come from `round-world`;
  the shrink: the fall starts where body diameter equals hole side, landing
  scale is ½, and rebasing leaves the eye's world position and view direction
  unchanged to 1e-9.
- **Frames**: `play-cube.ts` on the dev server, headless Chromium with the
  swiftshader flags `cdp.ts` already passes (if WebGPU will not start headless,
  the bite reports it rather than guessing): floor 1 looking down through the
  hole, floor 2 looking up through it, three frames mid-shrink, one mid-fall.

## Rest of the elephant

An elephant in one PR, a bite per session:

1. **`board` and the cube's board v1** — extract the mechanisms, `pnpm board`
   unchanged for the island, cube board v1 built and published.
2. **`dice` and the world model** — `dice` from `round-world`; `cube`'s
   `entities/world`: maze predicate, hole commitments, geometry, `plant.ts` and
   the planted world; all of it tested, nothing drawn.
3. **Walking through floors** — the WebGPU renderer, movement and collision,
   `/cube` routed, holes visible both ways, per-floor hue, frames.
4. **The lever** — lever placement, `E`, continuous shrink, the fall and the
   rebase, frames mid-shrink.

The last squash is `feat(vova):`, which publishes vovazakharov.com with `/cube`
unlinked.

## This bite

Bite 1, as item 1 above.

## Coordination

The island team works on `island/stretch-2` and `island/round-world`. This plan
touches none of their files except moving `island-board`'s code, which neither
branch edits (their board commits change only `app/config/`). `dice` is new.
Once bite 2 lands, a comment on #266 tells the island lead that `dice` holds
`roll` and `pathHash`, and that `round-world` imports them instead of its own
copies; posted only on Vova's yes.
