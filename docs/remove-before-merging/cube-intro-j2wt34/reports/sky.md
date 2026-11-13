# Sky — reports to the lead, newest first

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
