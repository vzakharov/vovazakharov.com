# Clouds — the march, hand-over note

Branch `claude/island-beauty-clouds-march`. Package: the cloud march as seen
from the ground, from low flight and from inside (items 1, 2 and 5 of
`clouds.md` § "What is wrong"). The field's shape is the clouds member's.

## Where it stands

- **Split.** `ui/cloud-step.ts` reads the field at a point of a ray and lights
  one step; `ui/cloud-march.ts` lays the steps; `ui/cloud-nodes.ts` keeps
  `along`, `glanced` and `shade` with their signatures and hands `cloudSteps`
  the sun beside its kit.
- **From orbit** (eye over `HIGHEST_TOP`) the four even steps stay, with the
  clouds member's `sheet` read once where the ray enters the layer for the
  waves under two steps long.
- **Under the highest tops** the ray searches before it steps: up to four
  reads of the two coarsest octaves, padded by `SEARCH_PAD` and `TOP_PAD` so
  they err early, at distances spaced geometrically from `max(from, 40 m)` to
  the stretch's end; at the first read inside a cloud a secant between it and
  the read before and one regula-falsi read place the crossing continuously.
  Six full steps start one first step short of it and lengthen geometrically
  to the stretch's end. Within 600 m of the eye a cloud takes down to 15 % of
  what it would, so an eye among clouds sees past the nearest wisps.

## Cost, value-noise reads per cloudy ray, eye under 12 km

Counted from the code paths, not measured on the GPU.

- **Baseline:** 19.
- **This march:** map 4, cyclones about 3, meso at the stretch's two ends
  2–7, search up to 6 reads of 2 octaves (12), full samples 7 of 2–5 octaves
  (14–35), sunward 0 from under the base and up to 4 over it. About 40
  typical, about 60 at worst: about twice the baseline typically, three times
  at worst.
- **Swift** pays a sixteenth of that through its buffer.
- **From orbit** unchanged from the clouds member's march.

## Left

- Thin horizontal streaks at the horizon from the ground.
- Inside a cloud: soft lighter and darker masses, but no wisps.
- Low sun, night and `shade` against `along` not shot.
- Reads over budget: a one-octave search with a wider pad, or meso read once
  per ray, are the first savings to try.
- Frame time on the software raster not compared before and after.
