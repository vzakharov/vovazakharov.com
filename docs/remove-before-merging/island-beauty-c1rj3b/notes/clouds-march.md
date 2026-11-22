# Clouds — the march, hand-over note

Branch `claude/island-beauty-clouds-march`. Package: the cloud march as seen
from the ground, from low flight and from inside (items 1, 2 and 5 of
`clouds.md` § "What is wrong"). Merges `claude/island-beauty-clouds` now and
then; the field's shape is that member's.

## Where it stands

- **Split.** `ui/cloud-step.ts` reads the field at a point of a ray and lights
  one step; `ui/cloud-march.ts` lays the steps; `ui/cloud-nodes.ts` keeps
  `along`, `glanced` and `shade` with their signatures.
- **From orbit** (eye over `HIGHEST_TOP`) the four even steps are kept as
  they were, so the view from orbit does not change.
- **Under the highest tops** the ray searches before it steps: coarse reads
  (octave 0 only, padded by `SEARCH_PAD` and `TOP_PAD` so they err early) at
  distances spaced geometrically from `max(from, 40 m)` to the stretch's end;
  at the first read inside a cloud a secant between it and the read before,
  one regula-falsi read, and the crossing is placed continuously. Four full
  steps, each twice the one before, start one first step short of it.

## Cost, value-noise reads per cloudy ray, eye under 12 km

Map 4, cyclones about 3, meso at the stretch's two ends 2–7, search up to 8
(one octave each, twice where there are streets), full samples 5 of 2–5
octaves each 10–25, sunward 0 from under the base and up to 4 over it.
To be measured on frames.

## Next

1. Shoot ground, 3 km, 10.6 km, in-cloud, low sun, night; compare orbit.
