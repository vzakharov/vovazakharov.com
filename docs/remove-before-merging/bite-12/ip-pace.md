# ip-pace — a leg's time is its length at the kind's cruise

Contract: `insect-plane.md` § R2.4 and the plan's § "Rest of the bite"
(«летит себе и летит»; `ARRIVAL` «убрать»).

## Units

`Places` are butterfly sizes (`perch-sight.ts` divides px by
`layout.insectSize`); `Habits.cruise` is butterfly sizes a second. The
tablet shows 19.7 sizes across.

## Step 1 — cruise, no ceiling, `ARRIVAL` gone

- `Habits`: `slowest` gone; `cruise` (sizes a second) added — butterfly
  0.95 (today's 3-size stride over its mean 3.15 s `flying`), fly 7, bee 4.6.
  `stride` stays: it is `nextPerch`'s nearness weighting, not timing.
- `paced` (`flight-timing.ts`): flight = max(`flown`, length / cruise) —
  the R2.4 `stretch = length / pace (≥ 1)` with the pace the cruise over the
  leg's own `flying` draw, so every leg past its `flying` time flies at
  exactly the cruise; `flown` where the length is unknown.
- `dashing` is a fixed `Dash` shape per kind, applied to every leg with a
  length, never scaled by distance: fly 0.7 of the way in 0.25 of the time
  (dash 2.8× cruise ≈ 20 sizes/s, about a tablet screen a second; in at
  0.4×), bee 0.6 in 0.3 (2× ≈ 9 sizes/s; in at 0.57×). Butterfly none.
- `Sight.across`, `Placed.across`, dash-cap's four tests gone; new tests in
  `flight.test.ts`: length at cruise past `flying`, twice the way twice the
  time, the same dash at every length, `flying` with no length.
- `ARRIVAL`, `arriving` gone (`flight-in.ts`); a release to a perch in view
  flies at cruise.
- The out-of-view stretch (`outFirst`), unbounded by `ARRIVAL`, would have
  been the leg's own time again — a butterfly's world-long first leg 40 s
  out of view crossing half a screen. Instead it is timed at the cruise
  over its own way, `outWay(onscreen)` = half the shown width; `Leg.out`
  carries it so `outOfView(leg)` (read by `insect-view.ts`, unchanged)
  returns it; half the flight for a leg without it. Tablet: fly ~1.4 s,
  bee ~2.1 s, butterfly ~10 s.
- `scripts/lib/play-buzzers.ts`' `SIGHT_LOOKS` bounded by a 46-size leg at
  the fly's cruise instead of `flying × slowest`.

## Step 2 — timed by drawn length

Not started.

## Left

Step 2, step 3's depth test.
