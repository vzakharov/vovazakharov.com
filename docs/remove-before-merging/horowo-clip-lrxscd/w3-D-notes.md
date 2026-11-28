# Wave 3, package D — the breakdown and the ending

Branch `claude/horowo-clip-w3-d-lrxscd`. Everything below is built, pushed and
passes the package gates; nothing is in flight.

## What is built

- **`BREAKDOWN_SHOTS`** — `src/clip/pages/horowo-clip/ui/shots-breakdown.ts`,
  96.1 s to the film's end, every span read off the master:

  | Span (s)       | Shot                                                 |
  | -------------- | ---------------------------------------------------- |
  | 96.136–103.3   | riff 1: `chewing`, ½-beat + kick cuts, fury 0.3→0.7  |
  | 97.33–97.51    | dropout: hard black                                  |
  | 103.3–105.523  | hole 1: `stillHole(wardHole)`                        |
  | 105.523–112.7  | riff 2: fury 0.6→1                                   |
  | 106.56–106.75  | dropout: hard black                                  |
  | 112.7–114.724  | hole 2: `staringHead([113.2, 113.8, 114.3])`         |
  | 114.724–115.02 | the wash: ¼-beat cuts, fury 1                        |
  | 115.02–124.7   | `pullBack`: the ward and the globe, then three steps |

  `pullBack` steps out at 117.25, 118.95 and 120.65 (the ward window, the
  hospital, the globe in the paws), and the tube goes off over the last 1.5 s.
  `POSTROLL` is unchanged.

- **`@/clip/widgets/ending`**, in three sub-slices:
  - `breakdown/`: `chewing`, `type Fury`, `stillHole`, `staringHead`, `STABS`
  - `pull-back/`: `pullBack`
  - `palette/`: `ENDING_PALETTE`
- **`torn`** (`@/clip/shared/tape`): a Drawing laid down in slipped, replayed
  and stretched strips.
- **`HELD_AT`** (`@/clip/entities/bunny`) and the snow globe's
  `plaqueFace: 'dots'` option, so the plaque can read `T.ME/FKNBALL`.

## The pool

`BREAKDOWN_POOL` sits at the top of `shots-breakdown.ts`, and the riffs cut
between its pictures. To add a storyline, put its `Drawing` in the array, for
example the rocket ears or the spoon bunny's back view. Interleave it to have it
come up early, since `chewing` steps through the pool from the front and never
shows the same picture twice in a row. `wardHole` must stay exported from
`@/clip/widgets/ward`, because hole 1 freezes it.

## Measured on the master

The vocal stem stops at 89.6 s, so every time above comes from the master.
`tmp/probe-shout.ts`, which is not committed, prints the energy in the
400–2500 Hz band and its three strongest peaks every 20 ms.

- **Last «Хорошо!» at 115.02 s.** This is the sharpest onset in the vocal band
  inside the wash. Its peaks sit near 474–538 Hz with a formant near 870 Hz,
  close to the chant's shouts at 85.0 and 88.02 s (560–600 Hz, formants near
  860–900 and 1100 Hz).
  - The other candidate is a burst at 114.36–114.84 s, 0.48 s long. Its peaks
    near 452–474 Hz move over the held chord (732/754 Hz), but it has no formant
    near 870 Hz.
  - If listening says 114.36 is the shout, change `LAST_SHOUT` and shorten
    `HOLE_2` to end there.
- **Hole 2's chord** changes at 113.22, 113.82 and 114.30 s. Its peaks shift as
  a set: 538/560/581 → 560/732/754 Hz.
- **The master falls silent** at 117.2 s.

## Next

The package needs nothing more. The lead still has to do the following:

- Wire the new storylines into `BREAKDOWN_POOL`.
- Write `T.ME/FKNBALL` once. Today it is spelled out in both
  `pull-back/ui/ward-close.ts` and `shared/tape/test-card.ts`.
- Decide whether to add a shared stage fill: the full-frame `fillRect` appears
  15 times in `src/clip`.
- Run the build and `vet.sh`.
