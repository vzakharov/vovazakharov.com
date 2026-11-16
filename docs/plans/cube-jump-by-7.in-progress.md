# The cube: portals that jump by 7, and floors reshuffled into ensembles

## Goal

Two changes to the cube, one branch:

1. **Portal jumps peak at multiples of 7.** Today a spoke climbs one floor three
   times in four, and a hub drops by the mirror of that, so nearly every portal
   moves you one floor. Under the new law both directions weigh a jump of `d`
   floors by

   `f(d) = Σⱼ (4/9)^|7j − d| · 4^−(j − 1)`, j from 1 to ⌈d/7⌉ + 1

   — peaks at 7, 14, 21…, each further multiple four times rarer, and each floor
   away from the nearest multiple 2.25 times rarer, to either side («Вовин-2»,
   chosen in the simulations artifact). Shorter jumps are not forbidden, only
   rarer.

2. **Floor themes follow the ensembles.** Floor `n` takes its theme from
   ensemble `(n − 1) mod 6`, in the order of the «Ансамбли куба» proposal, so a
   jump of 7 — which is 1 mod 6 — always lands in the next ensemble, the next
   chapter of the life.

The work fits one session, so it is taken whole.

## Settled with the operator

- The law above, `P = 7`.
- The bottom stays at floor 66.
- **No extra landings on 66** (`land = 0%`): the bottom gets what the law sends
  and nothing more. Floors 64–65 end up nearly all spokes, so a portal there
  throws the player back up — the «трамплин». Measured on the model: a player
  ends a jump on 66 4.1% of the time against 7.3% for floor 6, and a player
  starting on 6 first reaches 66 after a median of 41 jumps.
- **A floor with two or more portals keeps at least one hub**, so floor 7 (four
  portals) is reachable from below; without it, its fair hub share rounds to
  zero and no spoke ever leads there.
- The floors where random jumping concentrates are **магниты**: 6 (service
  corridor), 66 (hallway), 13 (attic), 7 (garage). A player thrown back up from
  near the bottom walks down through the hatches, or goes back and tries other
  portals.
- The reshuffle ships in this branch.
- **Floor 13 is the attic** — where what is a pity to throw away is carried,
  over every house on the street, metaphorically as much as physically — and
  **floor 7 the garage**, «the car taken away for good», one floor under the red
  floor of 6.

## Design

The reference for every number is `jump-model.js` in the artifact «Куб -
симуляции» (https://claude.ai/artifact/Gf2FbMjCKfXwD8jHSgw8nw, tab «Прыжок через
7», default settings). The game reproduces its
`network(f, { P: 7, land: 0, minHub: true })`.

### The law, in integers

`f` is rational, so it is computed exactly as a `bigint`: with `E = 60` and
`J = 10` bounding every exponent on floors 6–66,
`W(d) = Σⱼ 4^|7j−d| · 9^(E − |7j−d|) · 4^(J − (j − 1))`. Only ratios of `W` are
ever used. Its constants — the period 7, the off-peak ratio 9/4, the
per-multiple ratio 4 — join `PORTALS` in `portal-counts.ts`.

**No floating-point
`**`on a non-power-of-two base anywhere**: ECMAScript does not require`Math.pow` to round the same on every engine, and the world must be the same on any machine (`src/cube/CLAUDE.md`). Floats appear only in `+
− × ÷`of`Number`s converted from `bigint`s, which IEEE fixes exactly.

### Spoke bands

Floor `n`'s spokes (`S(n) = K(n) − H(n)`) fall into **bands** by how far up they
lead. Band `d` (1 ≤ d ≤ n − 6, floor `n − d` holding a hub) gets
`S(n) · W(d) / ΣW` spokes, rounded by largest remainder (ties to the smaller
`d`) so the bands sum to `S(n)` exactly. Spokes are numbered band by band: spoke
`j` of floor `n` lies in the band whose run holds it, at index `i` in it, and
leads to hub `i mod H(n − d)` of floor `n − d`, always the same one.

The table of band starts and sizes, floors 7–66, is built once at module load
(~1,800 `bigint`s) and replaces `hubsAbove` / `globalOf` / `hubAt`, whose global
hub numbering the bands make unnecessary.

### Hub counts

A floor's hub count keeps today's fairness rule: the share `h` at which a portal
opened at random moves a player down as far as up, `h · drop = (1 − h) · climb`,
then `H = round(h · K)` at the existing `SHARE_SCALE`, capped at the widest band
that holds the floor's hubs (no hub without a floor to land on), floored at 1 on
a floor of two or more portals. Floor 6 is all hubs, 66 none.

`climb` is the floor's mean band distance; `drop` is a hub's mean drop over the
floors it reaches (below). Hubs depend on bands and bands on hubs, so the counts
come from **a fixed 12 passes** of the model's iteration — bands from the last
pass's hubs, then hubs bottom-up — starting from `H = K/2`. On the model the
largest relative change per pass falls about 40-fold each time, reaching float
precision by pass 10; a fixed count keeps the result independent of how a
rounding near the end flips.

### Where a hub leads

Hub `g` of floor `m` **reaches** floor `m + d` iff `g < band(m + d, d)` — iff
that band holds a spoke for it. Each minute it rolls (the same
`portal/hub/{n}/{hub}/{epoch}` draws as today) a floor among those it reaches,
weighted `W(d)`, then one of its spokes there: band indices `g, g + H(m), …`
below the band's size. Every hub reaches at least one floor, by the cap above.

A spoke leads to its hub by the band arithmetic, O(60) per portal, deep floors
included.

### Themes

`floors.ts` becomes six lists of eleven themes, one per ensemble, and
`themeOf(n)` reads `ENSEMBLES[(n − 1) mod 6][⌊(n − 1) / 6⌋]`. The `TRADED` swap
goes: 66 is the hallway by the list itself. The order is the proposal's
(artifact «Ансамбли куба», https://claude.ai/artifact/VB4vSqUriZCGsrep7U2WJM),
except that the two home-life magnets trade places with themes further down: the
garage and the kitchen swap (7 ↔ 31), the attic and the bathroom (13 ↔ 43).

- **Home life** (1, 7, 13…): reception, garage, attic, laundry, supermarket,
  kitchen, guest room, bathroom, den, cold room, test card.
- **Work** (2, 8, 14…): open plan, stairwell, parking level, metro platform,
  conference hotel, airport gate, server floor, greybox, texture test, normal
  map, point cloud.
- **Childhood** (3, 9, 15…): school corridor, painted sky, drawing, nursery,
  underpass, ball pit, gymnasium, mall atrium, ice rink, grandmother, figure.
- **Hobbies** (4, 10, 16…): indoor pool, arcade, cinema corridor, glow golf,
  aquarium tunnel, darkroom, crystal, circuit board, cut paper, casino, sixteen
  colour.
- **Science** (5, 11, 17…): clean room, wafer, wet lab, agar, gel, fluorescence,
  micrograph, membrane, stained section, tunnelling scan, bubble chamber.
- **Madness** (6, 12, 18…): service corridor, remembered, incubator, missing
  texture, wireframe, depth buffer, home, one bit, static, clear colour,
  hallway.

No theme reads its own floor number (checked: the kits take none), so the move
changes where each stands and nothing in how it looks.

### The board

On the cube board, `portals.yaml`'s `p-go-net` gets the new law, and a card each
for the magnets and the trampoline; `ensembles.yaml`'s zone stops saying «not in
code yet».

### The artifact

The «Этаж нашего мира» tab routes portals by the old law (`portal-model.js`) and
says they lead where the game's do. Once the game's version stands,
`portal-model.js` is ported to it — bands, hub counts, the roll over reachable
floors — and its hub, spoke and target figures are checked against the game's
own on floors 6–10.

## Tests

`portal-counts.test.ts` and `portals.test.ts` are rewritten where they pin the
old law (the 182 spokes of floor 6's hub, «one floor down three times in four»,
`globalOf`); the placement tests stand as they are. New cases:

- the bands of every floor sum to its spokes, and band `d` is empty exactly
  where floor `n − d` holds no hub;
- floor 6 is all hubs, 66 all spokes, floor 7 holds one hub;
- every hub reaches at least one floor; a hub's spoke on the floor it rolled
  leads back to it, on shallow floors exhaustively and on deep ones by sample;
- **the law, read off the counts:** a floor-30 hub's chances of dropping 7, 14
  and 1 floors, and floor 65's hub share (≈ 0.9%), each against the model's
  figure to a stated tolerance;
- one more pass moves no floor's hub count by more than one part in 10⁹;
- every theme stands on exactly one floor, and floor 1 is still reception.

The deep-floor timing test stays.

## Files

- `src/cube/entities/world/model/portal-counts.ts` — the law, the bands, the hub
  counts, spoke ↔ hub arithmetic. Split at its natural seam (the law and bands
  into `portal-bands.ts`) if it nears the 400-line limit.
- `src/cube/entities/world/model/portals.ts` — `floorBelow` and `hubTarget` on
  the reachable floors; `spokeTarget` by bands.
- `src/cube/entities/theme/catalogue/config/floors.ts` — the ensembles.
- The two tests above;
  `src/cube-board/app/config/cube/{portals,ensembles}.yaml`.

## DRY notes

- **One law, one home.** `W(d)` serves both the bands (a spoke's climb) and the
  hub's roll (its drop), as the model's single `f` does; nothing re-derives it.
- **Draws reuse `drawBelow`** over the reachable floors' total, as `floorBelow`
  does over `dropWeight` today; `dropWeight`, `meanDrop`, `hubsAbove`,
  `globalOf` and `hubAt` go, with no caller left (`hint.ts` reads only `PORTALS`
  and `portalNumbered`).
- **The model is not imported.** `jump-model.js` is float simulation code in an
  artifact; the game's exact `bigint` version is its own, and the tests pin it
  to the model's numbers rather than sharing code with it.
- **The ensembles are the list, not a mapping beside it.** One array of arrays
  replaces `BANDS` and `TRADED`; the floor of a theme is computed, never written
  down twice.

## Resolved forks

Floor 13 was put to the operator as a fork (garage, cold room, den, or the
bathroom kept); the operator chose the attic for 13 and the garage for 7. The
artifact's floor tab was a choice between a line flagging the old law and a
port; the operator asked for the port, once the game's version stands.
