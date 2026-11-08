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

- **B9. Edge taper**: the waves are periodic, so land reached the square's edge
  in worlds 2 and 37 and ran past it by extrapolation. The waves are multiplied
  by a smoothstep window, 1 within 0.40 of the side from the middle and 0 at
  0.48 per axis, so the edge band is the dome alone, deep sea. Ours reaches
  ~0.34 and sits inside it.

- **B10. The fit's target is the rings' signed distance unclipped**, one field
  unit per `r · side` (`r` our dome's radius), not call 5's clipped one. A clip
  flattens the far sea while the dome keeps falling, so `target − dome` carries
  more `k = 0` and `|k| = 1` than the nine lowest modes can hold (at most |c| ≈
  0.124 under B3): every clip from 20 to 1000 km left 50–95% of the land wrong.
  Unclipped, the far slope matches the dome's, and a trial came to 1.2% wrong.
  It stays a smooth target, which is what the clip was for: not the binary
  mask's step.

## Code homes

- **B8.** The world model is a sub-slice `src/island/entities/terrain/world/`
  beside `coast-field/`: hash, decode, layout, FFT, synthesis to a `CoastField`.
  The fit is `src/island/scripts/fit-world.ts` (`pnpm fit:island`); the tracer's
  lakes change stays in `entities/coast` and `scripts/trace-coast.ts`.
  `buildCoastField` stays as the fit's rasterizer.

## Done

S1–S4 are on `island/worlds`, one squash commit each, the agents' reports in
`notes/b2-s*.md`: the lakes (cd2b63b9e), the world model (38df2b9ed), the worker
and URL (399edb996), the fit (e99fa5867: 0.63% of the land wrong, all five lakes
back, the strait closed — its cost is with the lead through memo).

## Left

- **`check:masd` fails on `entities/coast`** — only scripts reach it since
  call 10. Asked of the operator: a `masd-disable insignificant` marker in its
  `index.ts` (the tracer a player's map will run in the browser) or moving it
  under `src/island/scripts/lib/`. Their answer decides.
- **eslint in `src/island/scripts/lib/fit-grid.ts`**:
  `Omit<CoastField, 'distance'>` trips `vova/no-pick-omit`; export `CoastGrid`
  from `terrain/coast-field` through the terrain barrel and build on it.
- **knip**: unused re-exports in the terrain barrels (`ifft2`, `DOME_PARAMS`,
  `MASK`, `parseMask`, `worldWords`, `Complex`, …) — trim to what the game, the
  fit and the tests import.
- **S5, frames**: `/island` world 1 at the five heights (orbit, 1,000 km, 10 km,
  100 m, 2 m) on a phone and a desktop beside today's frames
  (`src/island-board/app/config/island/descent-*.webp`), via `pnpm play:island`
  / `film:island` (both take `--world`); `/island#2`–`#6` at orbit and 1,000 km,
  posted to the lead through memo.
- **The tail**: `/polish`, `/sync-branch` against `island/stretch-2`, vet, and
  the PR onto `island/stretch-2` with the frames and what each call became.
