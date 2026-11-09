# b3-a — step A hand-over (schema and series)

Branch `wt/b3-a`, base `6e584e7a`. Stopped at the context budget; the frame
script (R6) is not written.

## Done (all in `src/island/entities/terrain/world/model/`, tests beside each)

- `hash.ts`: `pathHash(world)(path)` = MurmurHash3 seed 0 of `key₀, key₁,
  UTF-8(path)` (R1), resuming from the keyed state; `murmur3` unchanged in
  output; the world-number rule admits `"0"`; `worldHash` (counter) kept.
- `roll.ts`: `roll.struct/uniform/normal/word/table`, `rollWith(schema,
  source)`, `Rolled<S>`; a table decodes to `{ values: Float64Array, at(key) }`.
  `WordSource` is the seam for pinned rows (step B).
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

- **Grid**: Gauss–Legendre, `L + 1 = 512` rings × `1024` longitudes (least
  power of two ≥ `2L + 2`, for the radix-2 FFT). Exact quadrature for products
  up to degree `L`, no ring on a pole; ring pairs share one recursion by
  `(−1)^{l+m}` and one complex FFT (north re, south im).
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

## Left

- **Lint**, 4 errors: `hash.test.ts` `message` shadowing (rename the inner
  `message` in the old `worldHash` test), `land-measure.ts` `no-loop-func`
  (`visit` closes over `top`; hoist the stack push) and `.sort` →
  `.toSorted`, `world-schema.ts` `DEGREE` clashes with `pages/island/lib/sun.ts`
  (rename, e.g. `LAND_DEGREE`). Then `check:masd`, `check:cycles`,
  `masd:clusters`, `type-overlap` — none run yet.
- **Barrels**: nothing exported yet from `world/index.ts` /
  `index.test-only.ts`.
- **R6 frame script** `src/island/scripts/frame-worlds.ts` + `pnpm` entry:
  args world numbers, `--knee`, `--slope`; `rollWorld` → `landSeries` →
  `synthesize` → `landShare`/`landmasses`; equirectangular PNG (rows are GL
  rings, near-uniform in θ; `node:zlib` deflate + `crc32` suffice), worlds 2–7
  to `notes/b3-a-worlds.png`, the table here.
- **Cross-file**: `src/island/pages/island/lib/world-hash.test.ts` pins `#0` →
  world 1; with `"0"` a world number it now opens world `0` and fails. Not my
  file; step B or the orchestrator settles it.
