# ip-Cplay4 — veer: the dash bound from the curve, landing looking back where there is room

## Done

- Step 1 + 2 (this commit): `scripts/lib/veer-dash.ts` `dashPeak(kind)` samples
  the game's own flight curve (`flightPoint` in `insect-paths.ts`, where the
  dash lives; `insect-motion.ts` holds no curve) over a 30 s straight leg timed
  at the kind's `cruising`, dashing as `FLIGHT_HABITS` says, from still and
  mid-flight, bowed both ways, flutter left out. `flicks`: fly and bee
  `step / zoom ≤ 1.1 × dashPeak · butterfly`; butterfly alone `≤ width/20`
  drawn. The worst steps past a bound are logged with their legs.
- `play-veer.ts`: the out-by-the-side releases stay at π; then the 24-heading
  sweep runs (its frames dropped) and the landing releases, `perchesBack` and
  `satBack` run at the heading farthest from 0 with `arrivals.roomy()`, logged.

## Finding: the curve's peak is not 65 / 48

`dashPeak` at 60 px butterflies: **fly 41.6 px a frame, bee 23.5** (bounds
45.8 / 25.8). The plan's ~65 / ~48 are the play's measured peaks (`ip-Cplay3`
finding 2), not the curve's. A short leg's dash is over in a frame or two and
peaks lower still (28 px for a 1-size fly leg), so the long-leg figure is the
curve's ceiling.

## Left

- Step 3: build, tabL and phoneP runs; step 4: frames.
