# Clouds — the march, hand-over note

Branch `claude/island-beauty-clouds-march`. Package: the cloud march as seen
from the ground, from low flight and from inside (items 1, 2 and 5 of
`clouds.md` § "What is wrong"). Merges `claude/island-beauty-clouds` now and
then; the field's shape is that member's.

## Where it stands

- **Split.** `ui/cloud-step.ts` reads the field at a point of a ray and lights
  one step; `ui/cloud-march.ts` lays the steps; `ui/cloud-nodes.ts` keeps
  `along`, `glanced` and `shade` with their signatures. `CloudFrame` moved to
  `ui/cloud-rays.ts` beside `EyeFrame`, so `cloud-step.ts` can name it without
  a cycle.
- **From orbit** (eye over `HIGHEST_TOP`) the four even steps are kept as
  they were, so the view from orbit does not change (frames differ by JPEG
  noise only).
- **Under the highest tops** the ray searches before it steps: reads of the
  two coarsest octaves, padded by `SEARCH_PAD` and `TOP_PAD` so they err
  early, at distances spaced geometrically from `max(from, 40 m)` to the
  stretch's end; at the first read inside a cloud a secant between it and the
  read before, one regula-falsi read, and the crossing is placed continuously.
  Four full steps start one first step short of it and lengthen geometrically
  to the stretch's end.

## Cost, value-noise reads per cloudy ray, eye under 12 km

Map 4, cyclones about 3, meso at the stretch's two ends 2–7, search up to 8
reads of 2 octaves each, 16 (more where there are streets), full samples 5 of
2–5 octaves each 10–25, sunward 0 from under the base and up to 4 over it.
About 35 typical, 55 at worst, against a budget of about 38: still to bring
down.

## Still wrong

- Thin horizontal streaks at the horizon from the ground.
- Inside a cloud: featureless grey.
- Low sun, night and `shade` against `along` not yet shot.
