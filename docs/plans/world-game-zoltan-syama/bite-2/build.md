# Bite 2 — the member's build calls

The contract (`../bite-2.md`) leaves these to the member. Each is settled here
before the brief that cites it; an agent that cannot keep one stops and reports
with numbers rather than picking another.

## The world's square and grid

- **B1. The square** is 10,400 km on a side, centred at plane point (1,045,000,
  −271,500) m — the drawing's bounding-box centre, the probe's square
  (`probe.py`'s 5.06 km × 2048). Constants in the world model, never read from
  `coast.json` at run time; a test asserts every ring lies inside with the sea
  margin. Off the square is ocean.
- **B2. The grid** is 1024 × 1024 nodes over the square (10.2 km cells, eight
  per finest wave at K = 128), filled once per world by a 2D inverse FFT in the
  tile worker.

## The field

- **B3. Harmonics**: every `k` with `|kx|, |ky| ≤ 128` in the half-plane
  (`ky > 0`, or `ky = 0` and `kx ≥ 0`), `k = 0` included; the field is real, so
  each carries its conjugate. Each has two words: a phase (uniform on `[0, 2π)`)
  and an amplitude factor (unit normal). Its amplitude is `e(k) · factor`,
  `e(k) = s · max(|k|, 1)^-2`, `s` fixed (a constant, computed once and pinned
  by a test) so the waves' expected spread is 0.45 of the dome's height (1). The
  modes with `|k| ≤ 1.5` take a tenth of `e(1.5)`: at full envelope the four
  `|k| = 1` modes carried two-thirds of the spread, tilted the dome, ran land
  share from 3% to 29% and pushed world 5 onto the square's edge; dropping them
  (the probe's choice: 13–22% land, no edge, `bite-2/notes/b2-s1-worlds-*.png`)
  would leave our fitted island no way to carry its own lowest modes. A tenth
  keeps the dropped look for random worlds and leaves ours room within the
  normal decode's tails.
- **B4. Parameter layout**: word 0–4 the dome (centre x, centre y, radius a,
  radius b, turn), word 5 the per-tile noise seed (the raw word; ours is 1,
  today's `SEED`), word 6 on the harmonics in a fixed order, phase then factor.
- **B5. Words are 32 bits.** `H(N, i)` is a counter-mode hash of the world
  number's decimal string (any length — `#<N>` is opaque, hashed whole) and the
  index `i`; `W(N, i) = H(N, i) XOR M(i)`. A uniform decodes as
  `lo + (hi − lo) · (w + 0.5) / 2^32`, a normal by inverse CDF of the same `u`;
  the encoder the fit uses is the decoder's inverse to the nearest word.
- **B6. The mask** lives at `src/island/entities/terrain/world/model/mask.json`
  (base64 of little-endian `uint32`, with `K` beside it), not beside
  `coast.json` as call 5 says: the game must not reach the coast entity, and the
  world model reads its mask from its own slice. Until the fit lands it is all
  zeros (world 1 is then just `H(1, ·)`).
- **B7. Height**: the grid stores a pseudo-distance in metres, `d = f / |∇f|`,
  the gradient floored at a quarter of the dome's own slope so a plateau reads
  as far inland rather than dividing by zero. `CoastField`'s shape and
  `sampleCoastField` stay, so `heightAt`, the quadtree's split and the detail
  cut read it unchanged — call 1's "rising function of `f`" is this one.

## Code homes

- **B8.** The world model is a sub-slice `src/island/entities/terrain/world/`
  beside `coast-field/`: hash, decode, layout, FFT, synthesis to a `CoastField`.
  The fit is `src/island/scripts/fit-world.ts` (`pnpm island:fit-world`); the
  tracer's lakes change stays in `entities/coast` and `scripts/trace-coast.ts`.
  `buildCoastField` stays as the fit's rasterizer.

## Steps

- **S1** world model (B1–B8) with tests ∥ **S2** the tracer keeps the drawn
  holes, `coast.json` regenerated (call 9).
- **S3** the fit (calls 5, 6) on S1 + S2 ∥ **S4** the worker, the URL hash and
  the rebuild (calls 7, 8, 10) on S1.
- **S5** frames at five heights, worlds 2–6, the overlay.
