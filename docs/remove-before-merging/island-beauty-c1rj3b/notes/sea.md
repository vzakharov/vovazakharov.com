# Sea package — hand-over notes

Branch `claude/island-beauty-sea`, cut from the lead's `57bc01ae`, with the
lead's `f9c587ad` merged in.

## Report, 2026-11-22

The moiré is gone on the CPU frames and by the measure below. Merge-ready: the
groups (`ed4af3a9`) and a `/dry` pass giving the ripples' share and the period
fold one home each (`c93efbef`), plus these notes and frames; nothing outside
the package's files changed. Not seen on WebGPU — the WGSL compiles clean in
Chromium's WebGPU (SwiftShader), but nothing here can draw it; the first look
at the real sea is the preview's.

## Cause, confirmed

The wind sea was 64 plane waves (8 bands × 8 integer 3D vectors), each
coherent over the planet. At a place only the few lying along the sea and
downwind carry weight — two or three a band — so their beats are a lattice, and
the glint lobe makes it loud. The CPU twin of the old `ripplesAt` reproduces the
operator's frame (`0013-sea-0-operator-moire.jpg`) from 1 km: a woven grid
under the sun.

## Built

- **Wave groups by phase drift** (`lib/sea-wgsl.ts`): `seaGroups(field, grain)`
  reads two slow value-noise fields (one hash per corner gives both) on 32 m
  cells; each wave's phase drifts by its own pair of coefficients times them
  (`Ripple.drift`, `RIPPLE_DRIFTS`), 1 turn for the coarsest band growing ×1.85
  a band. Neighbouring waves of a band drift apart within a few of their own
  lengths, so the beat pattern never repeats. Amplitudes are untouched, so the
  slope variance and `hidden` at any wind are exactly what they were (a test
  pins `hidden`).
- **Seamless and exact**: the fields repeat every `GROUP_PERIOD` = 16 384 m;
  `ui/sea-surface.ts` hands the eye modulo that period in float64 as a second
  anchor (`field`), as it already did for `place` modulo 256 m. The cell index
  wraps at the period, so the eye crossing it moves nothing (tested). Float32 at
  ~10⁵ m keeps the field to ~1 cm, a hundredth of a turn on the finest band.
- **World-keyed**: the hash takes the world's lattice shift, passed in as
  `grain` = `worldCell(vec3(0))` from `ui/lattice-value.ts` (no change there).
- **The band loop is nested**, so a band's place is folded once instead of per
  wave — which pays for the field read.
- `lib/ripples.ts`: the float64 twin of `seaGroups` and `ripplesAt`. Both
  sides' docstrings say a change goes to both.
- `lib/ripples.test.ts`: the regularity measure in the suite.

Beaten, measured: a per-band domain warp by the coarser bands' own horizontal
(Gerstner) displacement — real physics, a `sin` and 4 ops a wave, and no visible
or measured gain over the phase drift alone. 64 m and 128 m cells — better than
the old table but still a faint lattice at 0.5 m a sample (0.27–0.33).

## Measured

Regularity = the glint map's highest autocorrelation past the central lobe
(log glint, Hann window), over top-down maps of 256² samples from the low eye
toward the low sun, wind 7 m/s, six windows each:

| sample | old table | groups      |
| ------ | --------- | ----------- |
| 0.05 m | 0.11–0.25 | 0.12–0.23   |
| 0.5 m  | 0.41–0.47 | 0.13–0.16 ¹ |
| 2 m    | 0.60–0.61 | 0.10–0.12 ¹ |

¹ three windows. The suite's version (128² samples, three windows, at 1 and 4
m) reads 0.51 with the table's phases alone and 0.14–0.16 with the groups,
asserting > 0.4 and < 0.3.

By eye (`frames/0013-sea-1-before.jpg`, `-after.jpg`: 2 m, 60 m, 1 km toward a
sun 6° up): the 1 km weave is gone, 60 m glitter breaks into irregular patches,
2 m glints are scattered blobs. The path still widens with wind (3 vs 12 m/s at
60 m checked) and still leans downwind — the shares are unchanged.

## Cost

Counted in ALU ops a fragment, from the WGSL (no GPU here to time it):

- Old: ~105 a wave × 64 ≈ 6 700, the flat loop refolding `place` and
  recomputing the band's scale for every wave.
- New: ~96 a wave × 64 + ~14 a band × 8 + `seaGroups` ≈ 250 ≈ 6 500.
- So about −3% if the compiler did not already hoist the fold, +4% (the field
  read alone) if it did. No texture reads, two more vec3 inputs.

## Left

- Groups stand still while waves run through them; real groups travel at half
  the phase speed. Drifting the field downwind with time would need it read per
  band (×8 the field's cost) — not worth it until someone sees it.
- The WebGPU look itself: a preview frame of the open sea toward a low sun, and
  the operator's eye on it.
