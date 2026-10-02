# v14-fly — the fly's softer dash, and no hanging still

Contract: the plan's § "Rest of the bite" → "The operator's play of version
14", bullets "A fly never hangs still" and "The fly's dash is softened".

## Done

1. **The dash softened** — the fly's `dashing` in `model/flight-habits.ts`
   goes from `{ time: 0.2, way: 0.85 }` to `{ time: 0.3, way: 0.85 }`: the
   same 85% of the way, over half as long again, so the burst's peak drops
   by a third. A leg's time is untouched (its length at `cruising` 5). The
   curve's own fastest frame (`scripts/lib/veer-dash.ts`'s `dashPeak`,
   which samples `flightPoint` and so moves with the habit by itself) goes
   0.694 → 0.460 butterfly sizes a frame (41.6 → 27.6 px at 60 px a size);
   the bee's stays 0.391. The coming-in, `cruising · (1 − way) / (1 − time)`,
   goes 0.94 → 1.07 sizes a second — still near the size a second the catch
   bound wants, under the bee's 1.25.

## Left

2. The hover's hops.
3. `fliers.test.ts`, the tabL play and its frames.
