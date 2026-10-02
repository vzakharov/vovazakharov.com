# v16-capaway — the tabL veer cap→away red

## The cause: a leg set off mid-flight is timed from the perch it never reached

The hypothesis (a cap grown at a turned eye gets a wrong `Aloft` from
`aloftOfLayout`) is **wrong**. Measured at seed 3, tabL, forest grown at
headings 1.5, 1.83, −1.83 (`opened(..., viewIn)`), eye at (0, 0):

- Each cap's foot: `planeOf(foot)` equals `aloftOfLayout(place, place.y)`
  to two decimals, every cap, grown turned or not.
- Each cap's seat: `aloftAt(view, bed-drawn seat, stands.distance)` against
  `Perches`' `Aloft`, headings 0 to π: within 0.1–0.6 of a size across,
  ≤ 0.12 in height.
- cap→away timed (`apartIn` over `sightFrom`) vs the framed chord
  (`veer-away.ts`'s `drawnLength`): ×0.97–1.08 for every cap, both sides,
  at heading 0 and the growing heading.

The red, from a dump of the veer play's samples at HEAD (`ee5fadec`), fly-10:

- leg 11 air→cap departs 120 883 ms, at heading 1.83, due 125 416;
- leg 12 cap→away departs 121 350, 467 ms later, the eye just faced to 0:
  a fly release at the kind's limit evicts the oldest (`released` →
  `flightAway`), mid-flight.
- `onward` times leg 12 from `leg.to`'s place (the cap), while
  `legSetOff` draws it from `shown.drawn`, where the fly was: by the air spot,
  on the screen's far side. Drawn x −31 → 1217 over 1 329 ms, the
  fastest frame 162 px.

Every mid-flight re-leg goes through `onward`: an eviction (`flightAway`),
a shy (`startled` while aloft), a leg whose perch stops being offered
(`isDue`).

## Built

- `model/flight-timing.ts` `placesFlying(places, leg, now)`: `leg.to`'s
  place moved to the time-flown share of the way from `leg.from`'s place
  (x, y straight, `1 / fromEye` straight, as the frame mixes it). Unchanged
  at or past arrival, for a leg from `away`, and where either end is placed
  nowhere.
- `model/flight.ts` `onward` times the next leg with it.
- `flight.test.ts` § flightAway: a fly 10 % along a 100-size leg, evicted
  to an away spot 5 sizes behind its start, is timed for 15 sizes. Fails at
  HEAD (21 000 ms against 3 000), passes now.
- Passing: `flight.test` (24), `insects.test`, `flight-in.test`,
  `roaming.test`, eslint, prettier, `pnpm typecheck`, `pnpm type-overlap`.

## Left

- Not run: `perches.test`, `perch-sight.test`, `insect-away.test`,
  `fliers.test.ts` (~6 min; v16-play's `firstFlight` change has still never
  had it run).
- Not done: the play run after the fix (`--screens tabL --plays veer,meadow`)
  and the frames. At HEAD the veer play alone gave: 81 fly over-bound steps,
  most 163.9 px own size against 38.1 (fly-10, fly-22, cap→away); 21 bee
  steps, most 29.8 against 25.8 (bee-17 flower→flower); frame median
  32.8 ms over 535.
- The time-flown share is an approximation. The drawn flight eases off its
  perch (flown 0.05 at 217 ms into fly-10's leg), so a re-leg right after
  take-off is timed from a little farther along than it is drawn.
- A leg in from away that gets cut short is still timed from its `to`. Its
  drawn way in (the entry over the brow, or out of view first) does not
  stand at the sight's away spot.
