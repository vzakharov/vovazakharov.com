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
time. Written in broad strokes on purpose: each wave is planned when it starts,
against what the waves before it built.

## Load-bearing calls

Only the ones every later bite stands on; everything else is a wave's call.

- **Real scale, as the README measured it** — Arc is the DR Congo, the island
  some 5 000 km across, on a planet of Earth's radius with ocean all around. So
  going far means going up: take off, climb above the clouds, and there the
  higher you are the faster you move. The mechanics are worked out as the waves
  meet them.
- **A drawn map is the game's input, and any child's drawing could be one.**
  White is water, everything else is land. The drawing is traced once into a
  vector coastline, and the game builds from the vector, never from the image;
  Zoltan and Syama's is the first, copied into the repo as the source it is
  traced from. Relief, climate and the rest are derived from the coastline and
  one seed, deterministically — the same world on every visit. Rivers are an
  open question for the land wave.
- **The coast fractals as you approach.** The traced vector is only the coarse
  shape; capes, coves and rocks are added level by level as the coast comes
  closer.
- **Two tiers of generation:** what needs the whole map to be right (rivers
  running to the sea, climate) is computed once from the coastline; everything
  finer is a pure function of a tile's key, computed when that tile comes into
  view.
- **three.js with `WebGPURenderer`** (falls back to WebGL 2 by itself).
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
  The operator's stops are the wave ends: `/preview live`, then the next wave on
  the operator's word.
- **Status is a mind map artifact**, rendered from a bite index (`status.json`)
  and republished whenever a bite changes state.
- **What works and what doesn't goes into `.claude/skills/megabeast/notes/`** —
  the unfinished skill from the mushroom run; this is its second data point and
  the first with parallel members.

## Rest of the mammoth

- **Wave 1 — skeleton**, one member, since it sets the interfaces: the app and
  route, the drawing traced into a vector coastline, a first terrain with level
  of detail, a flat ocean and plain sky, the spirit's descent from orbit to the
  ground, and a scripted descent capturing frames for every later review.
- **Wave 2 — in parallel:** sky and clouds; land (the fractal coast, relief,
  rivers, lakes, biomes); ocean; movement (bird, walker, the transitions, travel
  by altitude, touch).
- **Wave 3:** vegetation; performance and phones; sound; your own map — a
  drawing loaded in the browser, traced the same way.
- **Beyond this mammoth:** towns at the drawn cities, borders, people, animals.

## This bite — bite 0: the team's tooling

The lead's own, before any member exists.

1. **`scripts/memo.py`**, ported from sc-hub with its traps intact; sides become
   `lead`/`member`, the channel is per branch, `wait` watches several branches
   and exits on the first with news.
2. **`status.json`** — the bite index — and **`scripts/elephant-map.ts`**, which
   renders it into a one-page mind map, published as an artifact.
3. **Wave 1's contract**, and its member started.

## DRY notes

- **memo.py is a port, not a share** — sc-hub is another repo with other sides.
  Both adopt `vzakharov/muthur`; if lead/member proves itself, it goes upstream
  there at the mammoth's end.
- **`status.json` is the only list of bites.** This plan names none; the mind
  map is rendered from it, never hand-kept.
- **The tracer is one pure TypeScript module**, run by the build for the shipped
  map and, later, in the browser for a drawing someone loads — never two
  implementations.
- **Nothing is shared with mushrooms up front** — a 2D Phaser side view and a 3D
  three.js world share little. Whatever turns out shared (the walker's stride,
  say) moves down to `scene` when a bite finds it, not before.
