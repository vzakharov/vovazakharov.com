# dash-cap — a fly's or bee's dash no faster than across its own screen

The plan's decision (§ "Rest of the bite", «мухи и пчёлы стали перелетать
слишком быстро», re-decided after f736ec2): a dash is never faster than the
kind's dash across **the screen it is flying on**, the longest leg each
screen allowed before 3ddb960; a longer leg takes longer, its last strides
still at the kind's pace; shorter legs keep their timing exactly.

## Units — read this first

`paced` reads `Places`, which are in **butterfly sizes** (`perch-sight.ts`
divides screen px by `layout.insectSize`), not ground ("world") units. The
plan's "≈6 world units" is the tablet's screen in ground units
(`WORLD_ACROSS` 5.764). In butterfly sizes a screen is
`layout.width / layout.insectSize` — the tablet's **1180 / 60 = 19.67**.
Measured legs (`perchSight` over 5 visits, butterfly sizes):

| screen          | screen across | longest leg | median | p90  |
| --------------- | ------------- | ----------- | ------ | ---- |
| tablet          | 19.7          | 38.5        | 11.3   | 24.7 |
| tablet portrait | 9.5           | 44.5        | 12.9   | 28.8 |
| phone           | 6.5           | 30.6        | 9.6    | 19.5 |
| phone sideways  | 14.1          | 19.8        | 5.5    | 11.7 |
| small phone     | 5.3           | 25.3        | 7.3    | 15.6 |
| desktop         | 28.5          | 44.6        | 13.1   | 28.9 |

## How it reaches `paced`

`perchSight` gives `Sight` an `across` beside `places` (one line in
`perch-sight.ts`: `across: layout.width / unit`). `Sight` already flows
whole into the reducer's actions and `Perches` (`game.ts` spreads it), so
`game.ts` and `insects.ts` needed no change; `flight.ts` reads it with
`places` (`Placed`) in `firstFlight`, `nextFlight` and `flightAway`. Without
`across` (only tests, and the scene's empty sight, which has no `places`
either) a dash is uncapped.

## Per screen, before and after

The fastest dash on each screen's longest leg, at the kind's mean `flying`
time, in butterfly sizes a second (screen widths a second in brackets).
"Before 3ddb960" is the screen-wide world, where no leg outran the screen;
"uncapped" is 3ddb960 to f736ec2; "tablet cap" is f736ec2. The cap now is
each screen's own width, so "now" is "before 3ddb960" on every screen.

| screen          | fly before / now | fly uncapped | fly tablet cap | bee before / now | bee uncapped | bee tablet cap |
| --------------- | ---------------- | ------------ | -------------- | ---------------- | ------------ | -------------- |
| tablet          | 60 (3.1)         | 122 (6.2)    | 60 (3.1)       | 36 (1.8)         | 74 (3.8)     | 36 (1.8)       |
| tablet portrait | 27 (2.8)         | 141 (14.9)   | 60 (6.3)       | 15 (1.6)         | 86 (9.1)     | 36 (3.8)       |
| phone           | 17 (2.6)         | 96 (14.7)    | 60 (9.2)       | 9 (1.4)          | 58 (9.0)     | 36 (5.5)       |
| phone sideways  | 42 (3.0)         | 60 (4.3)     | 60 (4.3)       | 25 (1.8)         | 36 (2.6)     | 36 (2.6)       |
| small phone     | 13 (2.5)         | 78 (14.7)    | 60 (11.3)      | 7 (1.3)          | 47 (8.9)     | 36 (6.8)       |
| desktop         | 89 (3.1)         | 142 (5.0)    | 60 (2.1)       | 54 (1.9)         | 87 (3.0)     | 36 (1.3)       |

The longest leg's whole time, uncapped / tablet cap / now, in seconds:

| screen          | fly                | bee                |
| --------------- | ------------------ | ------------------ |
| tablet          | 1.53 / 1.84 / 1.84 | 2.46 / 2.99 / 2.99 |
| tablet portrait | 1.53 / 1.94 / 2.84 | 2.46 / 3.15 / 4.75 |
| phone           | 1.53 / 1.71 / 2.95 | 2.46 / 2.77 / 5.05 |
| phone sideways  | 1.53 / 1.53 / 1.67 | 2.46 / 2.47 / 2.70 |
| small phone     | 1.53 / 1.62 / 3.04 | 2.46 / 2.62 / 5.34 |
| desktop         | 1.53 / 1.95 / 1.71 | 2.46 / 3.16 / 2.76 |

On a narrow screen a world-crossing leg now takes 2–3.5× as long as it did
uncapped, most of it off screen (the leg is 4–5 screens long); median legs
(5.5–13 sizes) are under or near each screen's cap and barely change.

## On the tablet

Distances in ground units on the sideways tablet (× 3.41 sizes a unit):

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

## Done

- f736ec2: the cap at one tablet-wide constant (`TABLET_ACROSS`).
- The cap is each screen's own width: `Sight.across` from `perchSight`,
  read by `paced`; `TABLET_ACROSS` retired. `FLIGHT_HABITS`, `slowest`,
  `dashing` and `Sight` docstrings state it.
- `flight.test.ts`: pace, dash and cap tests run on every `VIEWPORTS`
  screen with its own `across` (`meadowLayout` width / `insectSize`); a new
  test pins a phone's cap at its own width, slower than the tablet's over the
  same way.
- Green (da93055): `flight`, `flight-kinds`, `flight-in`, `insect-motion`,
  `insects`, `perch-sight`; `pnpm typecheck`, `pnpm type-overlap`;
  `ui/scene/fliers.test.ts` 48/48 (5 min 32 s), run after merging the
  branch at e05a7f2.

## Left

Nothing.
