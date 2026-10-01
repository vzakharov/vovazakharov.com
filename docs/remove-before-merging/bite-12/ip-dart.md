# ip-dart — the fly catchable again under the cruise

Fix round for `fliers.test.ts`' "caught by a tap aimed where it was a moment
ago, 7 times in 10" after `ip-pace.md`.

## The measure stands

At a9827e74~1 (before pace) the test passed on all six screens: fly
0.71–0.85, bee 0.70–0.84. It models a child's tap landing 200 ms behind the
insect, within a 32 px finger (`TAP_RADIUS`), at any moment of a flight —
which holds for a steady cruise as it did before: a fly at an even 7 sizes a
second moves 84 px in 200 ms on the tablet and is caught 0% of the time.

## Cause

Not the dash on short legs: with the dash only on legs past 3 sizes the
worst fly falls to 0.36, past 6 to 0.32 — the dash is what makes a fly
catchable, its slow coming-in being most of the flight's time. The cause is
the coming-in speed, `cruising × (1 − way) / (1 − time)`: fly 7 × 0.25 =
1.75, bee 4.6 × 0.375 = 1.73 sizes a second. A size is 86.7 px on the
tablet held upright (60 on the tablet), so there it moves ~30 px in 200 ms,
at the finger's edge before zigzag and flutter; fly and bee both fell to
0.43 there (the bee's failure was hidden behind the fly's).

## Fix (`flight-habits.ts`)

| kind | cruise  | dash        | dash speed | coming in   |
| ---- | ------- | ----------- | ---------- | ----------- |
| fly  | 7 → 5   | 0.85 in 0.2 | 28 → 21    | 1.75 → 0.94 |
| bee  | 4.6 → 4 | 0.75 in 0.2 | 16 → 15    | 1.73 → 1.25 |

(sizes a second). Beaten, measured worst screen fly / bee: cruise 7 with a
0.85 dash (0.699 — and a 30 sizes/s dart); cruise 5 at 0.8 (0.726, at the
cliff); dash only past a length (0.36 / 0.42).

## After

Fly: tablet 0.75, upright 0.73, phone 0.75, sideways 0.76, small 0.75,
desktop 0.76. Bee 0.75–0.80. `fliers.test.ts` 48/48.
