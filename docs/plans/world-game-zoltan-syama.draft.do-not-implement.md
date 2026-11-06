> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Island — exploring the world Zoltan and Syama drew

A descent onto the world Zoltan and Syama drew (`vzakharov/life` →
`family/world-map-zoltan-syama/`): the whole island from near space with clouds
drifting below, down through the cloud layer as a bird, then on foot. No towns,
people or animals yet — an untouched world to explore. Detail is generated as it
comes into view: coastline and climate from orbit, rivers and hills on the way
down, where each tree stands only once you are close.

The player never sees themselves; how they move says what they are — a
**spirit** above the clouds (no bob, fast, speed growing with altitude), a
**bird** below them (gliding down its own path, flapping to climb), a **walker**
at the ground (as in the mushroom meadow).

Inspiration: [Noniv/web-ocean](https://github.com/Noniv/web-ocean) — proof of
what a browser can do with sea and sky; nothing copied.

**Shape: a mammoth** — an elephant eaten by a team rather than a session at a
time, steering by a north star rather than a schedule. Nothing past the open
bite is laid out: each next bite is chosen when the last one lands, from what it
showed — the step that looked hard turning out easy, and the other way round.

## Load-bearing calls

Only the ones every later bite stands on; everything else is a bite's call.

- **Real scale, as the README measured it** — Arc is the DR Congo, the island
  some 5 000 km across, on a planet of Earth's radius with ocean all around. So
  going far means going up: take off, climb above the clouds, and there the
  higher you are the faster you move. The mechanics are worked out as the bites
  meet them.
- **A drawn map is the game's input, and any child's drawing could be one.**
  White is water, everything else is land. The drawing is traced once into a
  vector coastline, and the game builds from the vector, never from the image;
  Zoltan and Syama's is the first, copied into the repo as the source it is
  traced from. Relief, climate and the rest are derived from the coastline and
  one seed, deterministically — the same world on every visit, down to the last
  pebble, with nothing stored but the coastline. Rivers are an open question.
- **The coast fractals as you approach.** The traced vector is only the coarse
  shape; capes, coves and rocks are added level by level as the coast comes
  closer.
- **Two tiers of generation:** what needs the whole map to be right (rivers
  running to the sea, climate) is computed once from the coastline; everything
  finer is a pure function of a tile's key, computed when that tile comes into
  view.
- **three.js with `WebGPURenderer`**, which falls back to WebGL 2 by itself: one
  code path, the materials written once in TSL and compiled to either. The cost
  is staying off what WebGL 2 lacks, compute shaders first — tiles are filled in
  workers rather than on the GPU. The fallback also renders the headless frames
  every review looks at.
- **`src/island/`, served at `/island` on vovazakharov.com** in the `(game)`
  route group beside `/mushrooms`.

## How the mammoth is eaten

After `vzakharov/sc-hub`'s `scripts/memo.py` and `/workday` runbook: one
**lead** session holds this plan and the PR; **members** are separate cloud
sessions, each building one bite on a branch of its own.

- **A bite** is a branch off this one with a PR based on it, its contract a file
  in `docs/plans/world-game-zoltan-syama/`. The lead writes it; the member opens
  on `/go <bite-branch>`.
- **The channel** is a memo file on each bite branch, written by
  `scripts/memo.py`: the member posts at milestones and when blocked, the lead
  answers there. The lead waits on every open bite with one background `wait`.
  Living on branches rather than session ids, it survives either side relaying.
- **The lead merges** a bite once vet is green and it has looked at the frames.
  Whenever something new is there to see, the lead publishes `/preview live` and
  says so; the operator steers from it at any time.
- **Several bites run at once** where their files do not overlap; how many is
  the lead's call each time, from what is open.
- **Status is a mind map artifact**, the north star at its centre and the bites
  around it, rendered from a bite index (`status.json`) and republished whenever
  a bite changes state.
- **What works and what doesn't goes into `.claude/skills/mammoth/notes/`** —
  the unfinished skill from the mushroom run, renamed from `megabeast`; this is
  its second data point and the first with parallel members.
  `vzakharov/vovazakharov.com#101` (`/golem`) is a reading for ideas, not a
  source to cherry-pick.

## Rest of the elephant — the north star

Where this is going, in no order — what gets built when is the bites' to find:

- the whole island from orbit, real enough to pass for a satellite photo, clouds
  drifting over it;
- the dive through the cloud layer, and the shift from spirit to bird;
- the land taking shape on the way down — a coast that fractals, hills, rivers,
  lakes, forests, and finally single trees, rocks and grass;
- a sea that is a sea at every height, from glitter seen from orbit to waves at
  the shore;
- the three bodies, each read from how it moves: spirit, bird, walker, and the
  ways between them, travel far by climbing;
- a phone in a child's hands as much as a laptop;
- your own map: a drawing loaded in the browser becomes a world the same way.

Beyond it: towns at the drawn cities, borders, people, animals.

## This bite — bite 0: the team's tooling

The lead's own, before any member exists.

1. **`scripts/memo.py`**, ported from sc-hub with its traps intact; sides become
   `lead`/`member`, the channel is per branch, `wait` watches several branches
   and exits on the first with news.
2. **`status.json`** — the bite index — and **`scripts/mammoth-map.ts`**, which
   renders it into a one-page mind map, published as an artifact.
3. **`.claude/skills/megabeast/` → `.claude/skills/mammoth/`**, with every
   pointer at it.
4. **The first step toward the star**, chosen then: its contract, and its member
   started. The likely one is the thinnest descent from orbit to the ground over
   the traced island, since everything else hangs off it.

## What a studio would put on it

A forecast for comparing with the ledger at the end, each row's hours booked as
it goes: about 3 100 hours, seven people, the busiest of them for five months.

- graphics programmer, senior — 800 h: level of detail across six orders of
  magnitude, atmosphere, clouds, water;
- technical artist, senior — 640 h: the procedural land and its look, coast,
  biomes, vegetation;
- gameplay programmer, senior — 320 h: the three bodies, controls, touch;
- environment artist, middle — 480 h: trees, rocks, textures;
- game designer, senior — 240 h: the bodies' feel, travel, the north star;
- QA, middle — 240 h; producer, senior — 320 h; audio engineer, senior — 80 h.

## DRY notes

- **memo.py is a port, not a share** — sc-hub is another repo with other sides.
  Both adopt `vzakharov/muthur`; if lead/member proves itself, it goes upstream
  there at the mammoth's end.
- **`status.json` is the only list of bites.** This plan names none; the mind
  map is rendered from it, never hand-kept.
- **The notes keep their one home under the new name**: `plan/elephant.md` and
  `update-muthur/divergence.md` point at `mammoth/notes/README.md`, and nothing
  keeps a `megabeast` alias.
- **The tracer is one pure TypeScript module**, run by the build for the shipped
  map and, later, in the browser for a drawing someone loads — never two
  implementations.
- **Nothing is shared with mushrooms up front** — a 2D Phaser side view and a 3D
  three.js world share little. Whatever turns out shared (the walker's stride,
  say) moves down to `scene` when a bite finds it, not before.
