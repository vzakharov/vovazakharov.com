# Bite 3 — the member's build calls

The contract (`../bite-3.md`) leaves these to the member. Each is settled here
before the brief that cites it; an agent that cannot keep one stops and reports
with numbers rather than picking another.

## Step A — the schema and the series

- **R1. The hash by path.** `H(N, path)` is MurmurHash3 (today's `murmur3`) of
  the message `key₀, key₁, UTF-8 bytes of path` under seed 0, the key derived
  from the number's digits as in bite 2. A world number is a non-negative
  integer's decimal string with no leading zeros, so `"0"` is one (Earth). Bite
  2's counter `H(N, i)` goes with the word indexing.
- **R2. The `roll` vocabulary** is one module of the world model:
  `roll.struct({…})`, `roll.uniform(lo, hi)`, `roll.normal()` (unit normal),
  `roll.word()` (the raw 32-bit word) and `roll.table(index, leaf)`, the index
  naming its keys and how each spells its path segments (`(l, m)` → `<l>/<m>`).
  A leaf's path is its place in the tree joined by `/`, never a string written
  by hand. The decoded type is derived from the schema
  (`Rolled<typeof schema>`), and a table decodes to a typed lookup backed by a
  flat typed array, never an object per key: the harmonic table has 262,143
  entries.
- **R2a. No package does it** (search 2026-11-09, the contract's call 3):
  schema-driven generators (`fast-check`, `@anatine/zod-mock` over faker,
  `json-schema-faker`) draw from one sequential stream, so a leaf added shifts
  every later value — what call 3 forbids; counter-based generators
  (`squares-rng`, Random123 ports) give random access by an integer counter, not
  by a path, and carry no schema; `@thi.ng/random` and `d3-random` are
  sequential distributions. Gen- and Pyro-style addressed choices have no
  maintained JS port. Each covers one of the four wants (typed schema, path
  keys, random access by key, pinned values); the hash by path is bite 2's
  `murmur3`, and the vocabulary on it is about a hundred lines.
- **R3. The schema this bite** is
  `{ land: { sea: normal, harmonic: table over 1 ≤ l ≤ L, −l ≤ m ≤ l of normal }, noise: { seed: word } }`.
  `land/sea` is the degree-0 coefficient; its decode (a mean and a spread on the
  unit normal) is set so the average land share over random worlds is ~29% —
  measured over at least 50 worlds, and the two constants pinned by a test.
  `a_lm = env(l) · normal` for `l ≥ 1`, `env` the probe's `(36 + l²)^-1` (knee
  6, slope 2) until step C measures Earth's.
- **R4. The series** uses real orthonormal spherical harmonics with the probe's
  convention (`sphere.py`'s `legendre`, `m > 0` on `cos mφ`, `m < 0` on
  `sin |m|φ`, and say in a docstring where any `√2` sits). Synthesis is a
  Legendre recursion per ring and a real FFT along each ring; analysis is its
  inverse by quadrature on the same grid. The grid's shape (equiangular or
  Gauss–Legendre latitudes, how many rings and longitudes, at least `2L + 2`
  longitudes and `L + 1` rings) is the step's call, written here once measured:
  it must make synthesis then analysis return every `a_lm` to 1e-9 relative, and
  it must not cost the worker more than ~1.5 s of the 3 s budget at `L = 511` in
  Node on this container (the field's distance pass and the tiles need the
  rest).
- **R5. Additive.** The new modules sit beside bite 2's in
  `src/island/entities/terrain/world/model/`; nothing the game runs today
  changes in this step. `layout.ts`, `dome.ts`, `mask.*`, `square.ts` and the
  planar field go when step B switches the game over.
- **R6. The step's frame** is a script in `src/island/scripts/` with a `pnpm`
  entry that renders worlds to an equirectangular land/sea PNG and prints, per
  world, the land share, the landmasses over 1% of the land and the largest's
  share. It is the tool the Done table reuses at step C, so it takes the world
  numbers and the envelope as arguments.
- **R7. Taken from A's build** (`notes/b3-a.md`): the grid is Gauss–Legendre,
  512 rings × 1024 longitudes, round trip 1.4e-13; synthesis ~175 ms and the
  262,144-leaf hash and decode ~145 ms in Node. The `√2` sits in the harmonic,
  not the coefficient, so the field is isotropic (the probe's `m = 0` terms
  carry twice the others' variance). `land/sea` decodes as
  `c₀₀ = √(4π) · σ · (−0.556 + 0.1 · sea)`, `σ` the field's expected spread, so
  the constants carry to any envelope: worlds 1–50 average 29.0% land (23–36%).
- **R8. `"0"` is a world number for the hash only until B7.** The game's URL
  keeps reading `#0` as #1 until the switch, so step A changes nothing the game
  runs.

## Step B — the cube, the eye and #1

`notes/b3-map.md` is the design and the cut (B1–B8); these settle its open
calls.

- **S1. The height's distance** is bite 2's B7 true distance on the sphere (the
  lead, memo 04:02): the contract's "as bite 2 does" means what bite 2 does now.
- **S2. The cube map** is equal-angle (`b3-map.md` § 2.1: cell edges within
  1.41×, an exact inverse), a face edge landing on exactly ±1.
- **S3. The coast field's grid** follows A's measured synthesis cost: the finest
  that keeps the world build within the 3 s budget: 1024 × 2048, the series
  synthesised onto it directly (~4× R7's 175 ms), its distance pass measured in
  B2 against the rest of the budget.
- **S4. The light is the contract's call 12** (full moon), which replaced the
  sun turned with the eye: the sun fixed in space, a full moon opposite, the
  planet turned under them by time, a world opening at local noon over its
  start, time keys clear of movement and call 13's keys. It goes in B7 with the
  scene.
- **S5. The coast slice comes back under `src/island/scripts/lib/`**, beside the
  azimuthal map, so no `masd-disable` marker is needed: only the fit reads it.
- **S6. #0 is the random world `H(0, ·)`** in step B's frames; step C pins it.
- **S7. Look up and down is the contract's call 13**, an addition to B5's sphere
  eye (`notes/b3-b5.md`): ↑/↓ tilt the view, E/Q climb and descend. It is a step
  of its own on `features/eye/` before B7, or B7's if B7's agent has room;
  touch's look is that agent's call, reported.
- **S8. Every world but #0 opens at #1's opening** (B5's `openingOf`): the
  contract names only #0 and #1.
- **S9. Row #1** (B6, `notes/b3-b6.md`): clipped target ±500 km, 0.68% of the
  drawn land wrong (bite 2: 0.63% on its plane), all five lakes water; 8 bits
  per word with one scale per degree, 256 KB packed, 351 KB as JSON; 7 bits
  rises to 0.76%.

## Where the bite stands (for the next orchestrator)

- **Landed on `island/round-world`**: A (schema, series, frame script), B1
  (cube, geo), B2 (sphere coast field; a world builds in 1.0–1.4 s in Node), B3
  (cube tiles and quadtree; the key is `CubeCell`), B5 (sphere eye), B6 (fit,
  pinned row #1), each with its note. `tsc` is clean on the merge.
- **Gates**: `type-overlap` and root `tsc` green (c872f5cd); B2's frame drawn
  (`notes/b3-b2-field.png`). Still red: knip on the barrels' exports nothing
  reads yet (`notes/b3-b6.md` § "Tail" lists them) — B4 and B7 read most, and
  whatever is left unread after B8 goes.
- **B6's tail landed**: B6's files pass every gate; `notes/b3-b6-world1.png`
  shows #1 as the same island at ~10° N on the +X meridian (30 of 6,667 land
  nodes disagree with the drawn rings, all on the coast).
- **Nothing runs at the relay.**
- **S7 landed** (`notes/b3-s7.md`): ↑/↓ look, clamped between straight down and
  5° above the sea's horizon; E/Q climb; a two-finger vertical drag looks on
  touch. Until B7 the planar game's ↑/↓ do nothing and its hint still says they
  climb; B7 wires the hint and the globe eye's `STILL`.
- **Next**: B4 (height and fill on the sphere, running); then B7 (the switch,
  with S4's light and S7 if not done), B8 (retire the plane, film the seams),
  step C (Earth), the tail. The memo with the lead is current to 04:35 (calls 12
  and 13).
