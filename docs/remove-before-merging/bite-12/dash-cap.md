# dash-cap — a fly's or bee's dash no faster than across a tablet

The plan's decision (§ "Rest of the bite", «мухи и пчёлы стали перелетать
слишком быстро»): a dash is never faster than the kind's dash across a
sideways tablet's screen; a longer leg takes longer, its last strides still
at the kind's pace; shorter legs keep their timing exactly.

## Units — read this first

`paced` reads `Places`, which are in **butterfly sizes** (`perch-sight.ts`
divides screen px by `layout.insectSize`), not ground ("world") units. The
plan's "≈6 world units" is the tablet's screen in ground units
(`WORLD_ACROSS` 5.764). In butterfly sizes that screen is **1180 / 60 =
19.67** (the tablet's butterfly sits at the 60 px floor). Measured legs
(`perchSight` over 5 visits, butterfly sizes):

| screen          | screen across | longest leg | median | p90  |
| --------------- | ------------- | ----------- | ------ | ---- |
| tablet          | 19.7          | 38.5        | 11.3   | 24.7 |
| tablet portrait | 9.5           | 44.5        | 12.9   | 28.8 |
| phone           | 6.5           | 30.6        | 9.6    | 19.5 |
| phone sideways  | 14.1          | 19.8        | 5.5    | 11.7 |
| small phone     | 5.3           | 25.3        | 7.3    | 15.6 |
| desktop         | 28.5          | 44.6        | 13.1   | 28.9 |

The cap is built at the tablet's screen in butterfly sizes
(`TABLET_ACROSS` in `flight-habits.ts`, pinned to `meadowLayout(1180, 820)`
by a test). Read as 6 butterfly sizes instead, the cap would slow most legs
on every screen (median legs are 10–13 sizes): a fly across the tablet's
screen would take 2.85× its `flying` time instead of 1.8×.

## Speeds before and after

Dash speed in butterfly sizes a second at the kind's mean `flying` time
(fly 850 ms, bee 1450 ms), and the whole leg's time. Distances in ground
units on the sideways tablet (× 3.41 sizes a unit):

| kind | units | sizes | dash before | dash after | leg before | leg after |
| ---- | ----- | ----- | ----------- | ---------- | ---------- | --------- |
| fly  | 3     | 10.2  | 29.2        | 29.2       | 1.53 s     | 1.53 s    |
| fly  | 6     | 20.5  | 62.7        | 60.0       | 1.53 s     | 1.54 s    |
| fly  | 9     | 30.7  | 96.1        | 60.0       | 1.53 s     | 1.71 s    |
| fly  | 12    | 40.9  | 129.6       | 60.0       | 1.53 s     | 1.88 s    |
| bee  | 3     | 10.2  | 16.9        | 16.9       | 2.46 s     | 2.46 s    |
| bee  | 6     | 20.5  | 37.7        | 36.0       | 2.46 s     | 2.49 s    |
| bee  | 9     | 30.7  | 58.4        | 36.0       | 2.46 s     | 2.77 s    |
| bee  | 12    | 40.9  | 79.2        | 36.0       | 2.46 s     | 3.06 s    |

Taken as butterfly sizes, 3/6/9/12 are all under the cap and unchanged
(fly 5.6/15.4/25.2/35.0, bee 2.2/8.3/14.4/20.5 sizes a second).

## Done

- `paced` (`flight.ts`): past `TABLET_ACROSS` a dashing kind's dash time
  grows with the leg at the dash speed it had across `TABLET_ACROSS`; its
  last `(1 − dashing) × slowest` strides stay at its pace. At or under it the
  stretch, dash share and way are the same numbers as before.
- `FLIGHT_HABITS`, `slowest`, `dashing` docstrings state the contract.
- `flight.test.ts`: the tablet constant pinned to the layout; the pace test
  runs dashers up to a tablet across; the dash test checks the last strides'
  pace at every length; a new test pins the cap (1.5×, 2×, 3× a tablet
  across dash at the tablet's speed and take longer).
- Green (f736ec2): `flight`, `flight-kinds`, `flight-in`, `insect-motion`,
  `insects`; `pnpm typecheck`; `ui/scene/fliers.test.ts` 48/48 (6 min 10 s),
  run after merging the branch at 87250a8.

## Left

Nothing.
