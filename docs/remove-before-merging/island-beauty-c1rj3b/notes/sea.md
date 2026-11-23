# Sea package — hand-over notes

Branch `claude/island-beauty-sea`, cut from the lead's `57bc01ae`, with the
lead's `f9c587ad` merged in.

## Report, 2026-11-22

Closing: the shallows fix (`fef69dff`, below) is merged; "Cost per sea
fragment" ranks where the sea's 90–125 ms goes, and "Left" is the hand-over.

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

- **Wave groups by phase drift** (`lib/island-sea.wgsl`): `seaGroups(field, grain)`
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

## Shallows (`fef69dff`)

The cream smudges along the dune beach were the sea's own body colour: it is
`GROUND_STOPS` by the floor's depth (`lib/land-colour.ts`, read by both
backends), which ran from turquoise at −6 m straight to sand at 0. On a gentle
beach that ramp is hundreds of metres wide, and the floor's bars smeared it
out to sea. Two stops at −1.2 m and −0.3 m now hold the water turquoise until
the last decimetres. `frames/0016-sea-2-dunes-300m-before.jpg` / `-after.jpg`;
the 60 m and 2 m pair were still rendering when the run closed.

## Cost per sea fragment

Read off the shader, WebGPU fine look; nothing timed. The operator's numbers
at the dune place (M2 Pro): facing the sea 159 ms swift / 203 ms fine, facing
inland 68 / 79, plain 13 both ways.

What one rippled sea fragment runs (`seaColour` in `lib/island-sea.wgsl`, wired
in `ui/sea-surface.ts` and `ui/ground-lighting.ts`'s `ripple()`):

- **Ripples**: 64 waves summed once, slope only and analytic (no height, no
  differences): ~96 ALU ops and one `cos` a wave, ~6 200 in all, plus ~14 a
  band for the fold, before the cuts below.
- **Drift**: `seaGroups`, 8 hashes (one per lattice corner, both fields from
  each), ~250 ops. No texture reads anywhere.
- **Swell**: `seaSwellAt` three times — the mask, the level, and the level
  0.4 m ahead, so the swell's normal is by a forward difference — plus
  `seaTau`/`brokenAt` for the surf. Each is the shore's closed forms
  (`SHORE_LEVEL`, `WETNESS`, `SHORE_CUSPED`); a few hundred ops together.
- **Reflected sky**: two full `radiance` calls (`ui/sky-nodes.ts`), `mirrored`
  and `overhead`. Each is the dome's single scattering for two lamps (sun and
  moon, each with its own column and phase terms) plus a cloud glance
  (`clouds.glanced`: the regime's noise, one cumulus octave, the meso cells,
  and the clouds' lamps). `overhead` is the zenith, one value for the whole
  frame, recomputed per fragment before the cuts below.
- **Air and shadow**: `aerial` as on the land — the 4-step cloud march along
  the ray, `clouds.shade` for the cloud shadow (no shadow map), and the
  air's scattering. The same cost land pays, so not the sea's difference.
- **Lamps**: the five lights' Lambert still runs under a black `colorNode`;
  cheap.

**Where the extra 90–125 ms goes, ranked guess:**

1. **Overdraw with no early depth test.** The logarithmic depth is written by
   the fragment shader (`depthNode`), and the sea's mask discards, so neither
   early-Z nor Apple's hidden-surface removal skips a covered fragment. Every
   sea layer under a pixel is shaded in full: the ocean globe (`ocean-globe.ts`,
   drawn first under every tile and rippled in the fine look), the tile's
   sea, the stand-in's sea where it overlaps finer tiles, and, within 2.5 km,
   the sea mesh lying 1.5 cm over the sand, discarded only after the mask's
   swell is evaluated (WGSL's discard leaves a helper invocation that may run
   on). Facing the sea, a sea pixel is shaded two or three times over.
   The globe is under the inland view too, so part of the 68 ms is it.
2. **The two sky radiances**, mostly their cloud glances: per fragment, per
   layer, of the same order as the ripples or more.
3. **The ripples**, ~6 500 ops with 64 transcendentals.
4. **The swell**, three or four closed-form evaluations.

## Cuts made, one commit each

None is timed here: WebGPU does not run in this container. Each is meant to
change nothing visible; the WebGL2 coast frame, which draws none of this, is
the only frame compared.

1. **`d9663518` — dry sand.** `seaColour` returns at once where `seaLies`
   discards, so the sea mesh over sand pays the swell twice and nothing else.
   Look at: the shoal and the swash line.
2. **`29fb923d` — `overhead` per vertex.** `vertexStage(radiance(zenith))`:
   two dome-and-cloud evaluations a triangle rather than a fragment. A uniform
   would need the radiance on the CPU, which exists only as nodes. Look at: the
   sea's tone under a broken sky.
3. **`46c5688b` — `mirrored` per vertex on tiles.** The globe, whose triangles
   are kilometres, keeps it per fragment (`wide`). Look at: clouds reflected
   near the eye, and the far horizon.
4. **`6aee19b3` — unseen waves skip their phase and `cos`.** The loop cannot
   stop at a band: `hidden` sums every wave's share. Look at: the glitter
   path at low sun.
5. **`b2ae0ecd` — swift only.** The mirrored sky without the cloud glance
   (`radiance`'s `cloudless`), and the four finest bands into `hidden`
   (`bands` in `seaColour` and the twin). The look reaches the sea through
   `dress` → `ripple(seen, swift)` → `surface.colour(…, { swift })`. Look at:
   swift's glitter path and clouds in the water.

**Not cut: the globe under the tiles.** It is still rippled where tiles cover
it; cuts 4 and 5 make it cheaper, not absent. Skipping it under the tiles
needs a coverage test the globe's shader does not have.

**Early-Z** stays lost to two things together: the log depth written per
fragment (`depthNode`), and the mask's `discard`. Getting it back means the
tiles writing depth from the vertex stage (reversed-Z float depth instead of
log depth), and the sea's mask moving out of `discard` (the sea mesh clipped to
the water geometrically). Neither is started.

## Left

A stranger's list, each item standalone:

- **Measure before cutting.** The `?without=ripples,sea-sky,…` switch (the
  speed member's) times each part on the operator's machine; check the ranking
  above against it, the globe's overdraw first.
- **The ocean globe under tiles** (`ui/ocean-globe.ts`,
  `ui/ground-lighting.ts` `ripple()`): stop rippling it where tiles cover it.
- **Early-Z**, as above: vertex-stage depth and no `discard` on the sea.
- **Groups stand still** while waves run through them; real groups travel at
  half the phase speed. Moving them costs ×8 on the field reads; accepted as
  is.
- **The 60 m and 2 m shallows frames**: `pnpm shoot:island --shot
dunes-60m:43.733,10.266,60,164,15,22.8156` (and `dunes-2m:…,2,…`) on WebGL2,
  to confirm what the 300 m pair shows.
