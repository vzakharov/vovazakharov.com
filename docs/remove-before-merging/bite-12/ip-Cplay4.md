# ip-Cplay4 — veer: the dash bound from the curve, landing looking back where there is room

## Done

- Step 1 + 2 (this commit): `scripts/lib/veer-dash.ts` `dashPeak(kind)` samples
  the game's own flight curve (`flightPoint` in `insect-paths.ts`, where the
  dash lives; `insect-motion.ts` holds no curve) over a 30 s straight leg timed
  at the kind's `cruising`, dashing as `FLIGHT_HABITS` says, from still and
  mid-flight, bowed both ways, flutter left out. `flicks`: fly and bee
  `step / zoom ≤ 1.1 × dashPeak · butterfly`; butterfly alone `≤ width/20`
  drawn. The worst steps past a bound are logged with their legs.
- `play-veer.ts`: the out-by-the-side releases stay at π; then the 24-heading
  sweep runs (its frames dropped) and the landing releases, `perchesBack` and
  `satBack` run at the heading farthest from 0 with `arrivals.roomy()`, logged.

## Finding: the curve's peak is not 65 / 48

`dashPeak` at 60 px butterflies: **fly 41.6 px a frame, bee 23.5** (bounds
45.8 / 25.8). The plan's ~65 / ~48 are the play's measured peaks (`ip-Cplay3`
finding 2), not the curve's. A short leg's dash is over in a frame or two and
peaks lower still (28 px for a 1-size fly leg), so the long-leg figure is the
curve's ceiling.

## Runs (92742db, probe build, one screen per call)

| check                             | tabL                                | phoneP                                            |
| --------------------------------- | ----------------------------------- | ------------------------------------------------- |
| landing heading chosen            | 1.83                                | 4.97 (−1.31; 1.57 had no room at that point)      |
| out by the side at π, drawn ≥ 95% | pass (381/383, 88/88, 167/168)      | pass (432/436, 66/66, 120/121)                    |
| landing: each kind sat drawn      | pass (butterfly, fly 5th try, bee)  | butterfly, bee pass; **fly fail**: 6/6 to the air |
| `+` grew a mushroom               | pass                                | pass                                              |
| flower planted off a tuft         | **fail** (picker opened, no flower) | **fail** (same)                                   |
| `satBack` ≥ 0.97                  | pass                                | pass                                              |
| walk into a hover ≤ bound         | pass (1.70× vs 1.82)                | not played (none hovered in 80 looks)             |
| zoom (fade ≤ 2.45, free ≤ bound)  | pass (1.70, 1.60)                   | pass (1.33, 1.34)                                 |
| butterfly ≤ width/20 drawn        | pass (12 px vs 59)                  | pass (7 px vs 20)                                 |
| fly ≤ 45.8 own size               | **fail**: 71 steps, most 90.5       | **fail**: 33 steps, most 85.8                     |
| bee ≤ 25.8 own size               | **fail**: 67 steps, most 57.7       | **fail**: 80 steps, most 33.3                     |
| blinks                            | 0, 0                                | 0, 0                                              |
| frame JS median                   | 22.3 ms                             | **27.5 ms** (over 26)                             |

Where the worst steps fall: fly-15 `away→air` released at the landing heading
(90.5 / 85.8, drawn 72 / 67 px); fly-22 `cap→away` at heading 0 (88.9); fly-26
`air→cap` in the walk-in (89.5 at zoom 1.61, 144 px drawn, the eye walking);
bee-5 `flower→away` at 1.83, sustained ~57 over flown 0.43–0.53. An `away`
leg is timed off `places`' point just past the side, but drawn to
`offAloft`, worked out each frame from the eye where it now stands — a
suspect for the excess, untraced. On phoneP the bee's worst are `flower→flower`/`air→flower` at
31–33, 1.3–1.4× the curve.

The flower failure is the script's or the game's, not yet told apart:
`perchesBack` taps the nearest tuft, the picker opens, the first colour and
the first shape are tapped as `play-tufts.ts` does, and `meadow.planted`
does not grow. Untraced.

Frames (`frames/bite-12/insect-plane/`): `tabL-back-butterfly-leaving-by-the-side-drawn`,
`tabL-opening-small-on-back-caps-vs-near`, `tabL-back-1.83-fly-small-on-grown-edge-cap`,
`tabL-walk-in-fly-veering-past-near-the-eye`, `phoneP-back-4.97-grown-cap-and-flowers`.
At the landing heading the room is at the screen's edge: the mushroom grows at
the far left on tabL, the far right on phoneP.

## Left

- Decide the dash bound: the curve's peak (41.6 / 23.5) is under what the
  game draws; the worst is on `away` legs and the walk-in, the bee's on
  phoneP on ordinary flower legs.
- Trace the flower that is not planted; the fly that never perches in view
  on phoneP (6 tries).
