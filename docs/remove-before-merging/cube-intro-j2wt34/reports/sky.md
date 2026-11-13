# Sky — reports to the lead, newest first

## 2026-11-13 — relief back, grain still gone, cost back; lead merged at c86c511f

Frames: `opposite`, `wake-sea`, and the approved eye as `approved-eye` with
`approved-eye-cloud-pair` (sand's cloud above, mine below).

- **Modelling.** A sample is shaded by how far the billows stand out of the body
  there, so creases are darker than knobs; the outline keeps its knobs at every
  distance and fine billows reach farther off. The soft near-miss outline is
  gone.
- **Grain.** Still none: the crossing is still placed and sampled at one depth.
  A ray that grazes less cloud than that depth shows a thin lit wisp instead of
  nothing.
- **Cost.** The opposite view at 756×491 on SwiftShader: 1040–1200 ms, against
  1000–1180 ms for 54b3c2c7 timed alongside. The +50% was the crossing's extra
  readings of the cloud standing beside the march's own; the crossing is now
  placed by the march's next two steps.
- **The approved eye.** Cirrus is 54b3c2c7's again: the fibre octave I added
  last round was finer than the sky's texels at any distance and showed as
  dotted moiré, so it is out, and overhead streaks are as soft as they were.
  Nothing round the sun or in the light changed. The sun's bloom in my shot is
  smaller than in sand's frame; that is the lens as your branch has it now, not
  the sky. The cloud differs in two ways: a taller dome (your flat-tops item)
  and a slightly dimmer bright rim.
- **The base (added after the message).** The operator told me a cloud's
  underside read as too even an arc. A base now rises in places with the
  cloud's own lumps, up to a quarter of its height; the crown is untouched.
  `approved-eye`, the pair and `opposite` are re-shot with it; `wake-sea` is from
  just before it.
- **Not done.** The two mushrooms at the far left and right of `opposite`: each
  is a near cloud, its grey underside turned to the eye, overlapping farther
  ones at the same height in the frame. The uneven base softens the cap's line
  but the pairing still reads as a mushroom.

`cloudGlance` and `cloudVeil` moved to `sky/cloud-veil.ts` (`CLOUD_VEIL`), which
`outside/sky.ts` now needs; `clouds.ts` is at 338 lines. Gates green:
typecheck, 73 of 73 shaders, lint, the sky's 7 tests, type-overlap, check:masd,
masd:clusters, check:cycles.

## 2026-11-13 ~11:45Z — your three items; lead merged first (118c0bd7)

Frames re-shot: `wake-sea`, `opposite`, `up`, and `bench-side`, `bench-anti`,
`bench-cloud`.

1. **Grain on far cumulus — gone.** The cause was the march, not the billows:
   each texel's first sample of a cloud landed at a different depth, so
   neighbours were lit differently. The crossing is now refined once and the
   first sample taken a set 47 m under the skin. Billows narrower than a couple
   of the sky's texels at a cloud's distance are left out as well.
2. **Flat tops.** The crown now falls toward the rim, the lowest clouds stand
   taller (height 0.95–1.35 of the radius, was 0.7–1.25), and the footprint's
   noise is gentler, which is what made cliffs and table tops. What still reads
   as a slab in `opposite`, far left and far right, is a near cloud's flat base
   in front of farther heaps; its own top is a dome.
3. **Overhead streaks.** A fibre octave is added where the sheet is within 40 km
   of the eye. In `up` the streaks now show strands; they are still soft,
   because the sky is drawn at a quarter of the screen each way and that is the
   limit of it.

**The price.** Clean far clouds read flatter: front-lit, away from the sun,
they are near-uniform white with less modelling than the grainy ones had, and
their outlines show the quarter-size texels despite a new share-of-a-texel
edge. The marched pass is about half again as dear on SwiftShader (the opposite
view 1100 → 1500–1850 ms at 756×491, readings noisy): one more sample per
crossing and a shaded near miss per cloud edge.

Gates green as before: typecheck, 73 of 73 shaders, lint, the sky's 7 tests.
`clouds.ts` is at 397 lines; the next addition there splits the cirrus out.

## 2026-11-13 ~10:55Z — done bar hardware timing; head 54b3c2c7 plus this file

Also sent as a message at ~10:50Z (reported delivered). Your branch is merged in
at 22c02e4c; 68 commits of yours are newer than that.

**The light (job 3).** I kept the model's light, as you ruled: sun [8.00, 4.84,
2.11], sky fill [0.48, 0.60, 0.91], ground [0.05, 0.04, 0.02], horizon [1.11,
1.29, 1.22]. The pair is `frames/sky/light-pair-wake-cube.webp` and
`light-pair-ladder-foot.webp`: left the model's light, right sun [8, 4.96, 2.64]
with sky [0.65, 0.87, 1.2]. They are nearly the same frame; the second only
lifts shaded sand and the cube's shaded faces a touch toward blue. What makes
the sun view look wrong is the lens: the model puts the sky 5° from the sun at
about 41 and 20° away at about 7, against 8 for a sunlit white face, and at
exposure 0.3 the shoulder flattens all of that to white.

**What the frames show (job 2).** In `frames/sky/`: `wake-sea`, `wake-cube`,
`ladder-foot`, `doorway-out`, `under`, `sun`, `opposite`, `up`, and four
`bench-*` of the sky alone. The operator told me directly the earlier shapes
were wrong (cirrus curling like oil on water, cumulus like cotton balls), so
both were rewritten: a cumulus is a heap on a flat base whose footprint is its
own noise, so no two are one shape; the cirrus is straight streaks in patches,
askew to the wind so they do not fan out of the sun. `wake-sea` and `opposite`
are the ones to look at first. Not yet a photograph: far cumulus read a little
grainy at quarter size, and the streaks straight overhead are soft.

**`skyRadiance(dir, lod)` (job 4).** The disc at lod 0 only, gone by 0.5; under
1 the fitted air, glow, cirrus and each cumulus lit as a whole without a march;
from 1 up a cheap path (smoothed air, the sun's halo, the clouds as the cover
they make), drawn toward the sky's mean as the lobe widens; mixed between 0.5
and 1 so there is no seam. Sea and shell know.

**Cost.** No GPU here, so these are operation counts and SwiftShader ratios, not
milliseconds on an M2 Pro.

| What                                    | Work per pixel                                         | SwiftShader            |
| --------------------------------------- | ------------------------------------------------------ | ---------------------- |
| Marched sky pass, quarter size each way | up to 48 march steps where a ray meets a cloud         | 600–1300 ms at 756×491 |
| Backdrop, full size                     | one texture read and the disc                          | 70–130 ms at 1512×982  |
| `skyRadiance`, lod ≥ 1                  | about 35 vector operations (≈110 scalar, 5 exp, 3 pow) | 10–29 ms               |
| `skyRadiance`, lod < 1                  | about 2000 scalar operations, some 60 hash rounds      | 200–500 ms             |

Whether the march fits 3 ms needs a real GPU; if it does not, the step count
(48) and the pass's scale (4) are the two dials.

**Page frames' cost.** A page frame takes 85–160 s to shoot in this container,
the sky's march being most of it; shooting two eyes in one command once had the
container killed, so they are shot one at a time.

**Green.** typecheck, shaders:cube (73 of 73), lint over my directories, the
sky's 7 tests, type-overlap, check:masd, masd:clusters, check:cycles, prettier.
`/dry` and `/tend-prose` are run over the diff. Every seed is rolled; the field
drifts one whole tile an hour, and a test holds that.

**Outside my files.** `pointHash` in `shared/lib/wgsl-hash.ts`. The sky's
exports are `ATMOSPHERE`, `CLOUD_TILE`, `CLOUD_LANE`, since lint refuses a name
another module holds; nothing outside the sky imported the old ones. The model
imports `clamp01` and `smoothstep` from `shared/lib/ease.ts`.

**Left.** Timing on real hardware; the grain on distant cumulus; the lens
toward the sun, which is core's.
