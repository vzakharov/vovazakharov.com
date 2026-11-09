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
