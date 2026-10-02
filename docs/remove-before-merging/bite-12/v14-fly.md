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

2. **A fly never hangs still** — it fit the flight model without reopening
   it. A kind's habits carry `hopping: Hops | undefined`
   (`{ every, range }`; the fly's `{ every: 280, range: 0.7 }`, the
   butterfly's and the bee's `undefined`); `legTo` puts it on the span
   (`Span.hops`, beside `dash`) of a leg to the air only. `hopAt` in
   `insect-motion.ts` is the offset, in the insect's sizes, a pure function
   of the clock, the leg's arrival and the insect's phase: 0 until arrival,
   then in every 280 ms round one 70 ms smoothstep jerk to a new spot drawn
   uniformly in a disc of 0.7 sizes, its moment in the round drawn too, so
   the rhythm is irregular. `steer` (`insect-steering.ts`) adds it, times
   the drawn size, to the flight's point; the body does not turn for a hop.
   A next leg already sets off from where the flier was drawn
   (`InsectView.reconcile`), so a hop cut short never jumps.
   - **Departure: `insect-steering.ts` is touched** (one import, three
     lines), though not in the package's file list: it is where the drawn
     point is made, and the alternative homes are `insect-view.ts` (off
     limits) or `insect-paths.ts`' `flightPoint`, which has no size to
     scale the hop by.
   - The play's watches leave it alone: the heading check and the hover
     overlap check read only frames before arrival; a hop's fastest frame,
     0.36 fly sizes = 0.20 butterfly sizes, is under the veer bound
     (1.1 × 0.46).

## Left

3. `fliers.test.ts`, the tabL play and its frames.
