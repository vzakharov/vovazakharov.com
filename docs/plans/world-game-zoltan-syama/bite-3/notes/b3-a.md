# b3-a — step A hand-over (schema and series)

Branch `wt/b3-a`, base `6e584e7a`. b3-a stopped at the context budget; b3-a2
finished step A (below).

## Done (all in `src/island/entities/terrain/world/model/`, tests beside each)

- `hash.ts`: `pathHash(world)(path)` = MurmurHash3 seed 0 of
  `key₀, key₁, UTF-8(path)` (R1), resuming from the keyed state; `murmur3`
  unchanged in output; the world-number rule admits `"0"`; `worldHash` (counter)
  kept.
- `roll.ts`: `roll.struct/uniform/normal/word/table`,
  `rollWith(schema, source)`, `Rolled<S>`; a table decodes to
  `{ values: Float64Array, at(key) }`. `WordSource` is the seam for pinned rows
  (step B).
- `world-schema.ts`: `harmonicIndex(L)` (slot `l²+l+m−1`, path `l/m`),
  `worldSchema(L)` per R3, `rollWorld(N, L)`.
- `legendre.ts` (recursion, column fill, direct table), `sphere-grid.ts`
  (Gauss–Legendre grid), `sphere-series.ts` (`synthesize`, `analyze`).
- `land-series.ts`: `kneeEnvelope`, `PROBE_ENVELOPE`, `SEA_MEAN = −0.556`,
  `SEA_SPREAD = 0.1`, `fieldDeviation`, `landSeries`.
- `land-measure.ts`: `landShare`, `landmasses` (8-connected, wraps in φ, joins
  across each pole) — the frame script's measures.
- 65 model tests pass; `tsc -p tsconfig.json` clean.

## Decisions and numbers

- **Grid**: Gauss–Legendre, `L + 1 = 512` rings × `1024` longitudes (least power
  of two ≥ `2L + 2`, for the radix-2 FFT). Exact quadrature for products up to
  degree `L`, no ring on a pole; ring pairs share one recursion by `(−1)^{l+m}`
  and one complex FFT (north re, south im).
- **Pole underflow**: a ring's orders stop once `|P_mm| < 1e−280`.
- **Timing, Node 24, this container**: synthesis at L = 511 **~175 ms**,
  analysis ~190 ms, setup 12 ms, hash + decode of the 262,144 leaves ~145 ms.
- **Round trip** at L = 511, unit-normal coefficients: max error **1.4e−13**
  relative (tests hold 1e−11 at L = 16, 31, 128).
- **√2** sits in the harmonic (`Y_lm = √2·P_lm·cos mφ`), not in `c_lm`. The
  probe has no √2, which halves its `m ≠ 0` variance against `m = 0`; ours is
  isotropic. A departure from the probe, flagged.
- **Sea**: the decode is in units of the field's expected deviation σ
  (`c_00 = √(4π)·σ·(SEA_MEAN + SEA_SPREAD·sea)`), so it carries over to another
  envelope's scale. Spread 0.1 is my call: worlds 1–50 at L = 511 average
  **29.0%** land (sd 3.1%, range 23–36%); spread 0.2 would range 12–47%.

## Done by b3-a2 (successor)

- **R8**: two rules in `hash.ts`. `isWorldNumber` / `assertWorldNumber` /
  `worldHash` keep the game's positive integers, so `#0` still opens #1
  (`world-hash.test.ts` passes unchanged); `pathHash` alone admits `"0"`. Step
  B7 widens `isWorldNumber` when the game switches over.
- **Lint and gates**: the four errors fixed, `DEGREE` → `LAND_DEGREE`.
  `type-overlap` found three more, fixed by: `RingGrid = Gridded & {x, weights}`
  (scene's `Gridded`; `rings` is `rows`, and the grid carries no `degree` —
  `synthesize`/`analyze` read it from the recursion), a table's `size` is
  `slots` in a `Slotted` base `TableIndex` and `Table` share, and the PNG's
  image is kernel's `Sized`. All of tests, tsc, eslint, `check:masd`,
  `check:cycles`, `masd:clusters`, `type-overlap` pass.
- **Barrels**: `world/index.ts` and `terrain/index.ts` export `pathHash`,
  `rollWith`, `WordSource`, `Lookup`, `worldSchema`, `rollWorld`, `World`,
  `Harmonic`, `LAND_DEGREE`, `kneeEnvelope`, `PROBE_ENVELOPE`, `Envelope`,
  `landSeries`, `sphereTransform`, `SphereTransform`, `RingGrid`, `synthesize`,
  `landShare`, `landmasses`; the `index.test-only.ts` pair `analyze`,
  `harmonicSlot`, `fieldDeviation`, `SEA_MEAN`, `SEA_SPREAD`.
- **R6**:
  `pnpm frame:island <world…> [--knee 6] [--slope 2] [--degree 511] [--out tmp/island/worlds.png]`
  (`src/island/scripts/frame-worlds.ts`, the PNG encoder in
  `scripts/lib/indexed-png.ts` with its test). One row per GL ring, `φ = 0` at
  the left, worlds stacked under a white rule; six worlds in 2.5 s.

## Worlds 2–7, knee 6, slope 2, L = 511 (`b3-a-worlds.png`)

| World |  Land | Landmasses > 1% | Largest |
| ----: | ----: | --------------: | ------: |
|     2 | 27.3% |               8 |   34.2% |
|     3 | 25.9% |              15 |   30.3% |
|     4 | 29.4% |              11 |   33.2% |
|     5 | 32.6% |               6 |   78.3% |
|     6 | 32.0% |               9 |   51.9% |
|     7 | 26.6% |              13 |   27.5% |
| Probe |       |            6–10 |  25–63% |

Three of six land in the probe's count range (2, 5, 6) and five of six in its
largest-share range; 3, 4 and 7 break into more landmasses (11–15) and 5's
largest holds 78%. Likely cause, unmeasured: the isotropic `√2` gives the
`m ≠ 0` terms twice the probe's variance at equal envelope, so the field is
rougher at every degree than the probe's — step C's envelope fit is where that
settles.
