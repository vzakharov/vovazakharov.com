# v17-play — tests and tabL veer, meadow after v16-capaway

Under the play-run rule, at `912644f4` (game code as at `74ed8ec0`). No game
fix committed. Frames in `frames/bite-12/v17/`.

## Unit tests not run since the last three fixes

All pass: `perches.test` (2), `perch-sight.test` (68), `insect-away.test`
(7), `fliers.test` (48, 4 min 22 s alone).

## The play run — `--screens tabL --plays veer,meadow`

Deterministic: three runs at HEAD gave the same overs to the step.

- **Fly over-bound steps: 88, worst 71.0 px own size against 38.1** (v16:
  81, worst 163.9). Not gone. By leg, from a local tally (not committed):
  - cap→away cut mid-flight, 58: fly-10 (cut air→cap at 0.10 of its time)
    ×5, fly-15 (cap→cap at 0.57) ×11, fly-24 (cap→cap at 0.71) ×20, fly-29
    (cap→cap at 0.47) ×22, the worst;
  - cap→away from rest, 9: fly-21 ×7 (6.9 s, drawn x −31 → 1194), fly-26,
    fly-30;
  - cap→cap whole, 14: fly-3, fly-26, fly-29, fly-31; cap→air 2; air→cap 5
    (fly-33 at heading −0.36 ×4, fly-20).
- **Bee overs: 21, worst 29.8 against 25.8** — bee-8 ×13 and bee-17 ×8,
  all flower→flower: the known small class, unchanged.
- **Shying fly's heading in `meadow`: passes.** Fly 0 of 252 travelling
  frames over 0.3 rad. The watch's worst, 0.37 rad, is **butterfly-1**
  (away→away left at 23 733 ms, `steering.heldAt` that very frame), a red
  still standing; 81 of 3676 butterfly frames over 0.3.
- Other reds as before: a fly drawn 27.3 px across, under 30 (`LEAST_SPANS`).

## The frame budget — the container, not the code

| run                             | tree        | median            |
| ------------------------------- | ----------- | ----------------- |
| veer,meadow, with the build     | HEAD        | 30.7 ms over 769  |
| veer, `--no-build`              | HEAD        | 33.7, 32.1 (535)  |
| veer,meadow, with the build     | **f584982** | **32.1 ms** (757) |
| veer,meadow, right after        | HEAD        | 29.0 ms (769)     |
| veer,meadow, rebuilt for frames | HEAD        | 29.0 ms (769)     |

f584982 gave 22.9 ms for v15 and gives 32.1 now, back to back with HEAD's
29.0, the load average 3–4.6 on 4 cores. So nothing since is slower; no
code changed for it.

## Tried and reverted — the drawn share for a cut leg

Hypothesis: `placesFlying` takes the time-flown share, but a fly dashes
(0.85 of its way in 0.24 of its time), so it is drawn farther along. Tried
`progress` (`insect-paths.ts`) with the leg's dash, from still. Result:
86 overs, **worst 162.6** (fly-22 back). The samples show why: the drawn
`flown` at the cut is neither share — 6.5 s cap→cap legs drawn 0.05 at 0.21
of their time (fly-22), 0.22 at 0.24 (fly-18), 0.88 at 0.47 (fly-29);
1.3 s fly-15 0.92 at 0.57. The scene steers every flight (`steer`: turns,
lift-off, bow), so only the scene knows where a flier is drawn.

A fix is a design change: the scene hands the model where it drew a flier
re-legged mid-flight (say, a place per insect in the `Sight` it dispatches,
which `onward` times from), not a curve the model guesses. Not built.

## Left

- The design call above; the cap→away-from-rest class (fly-21, 6.9 s
  across the whole screen) and the cap→cap whole overs are separate.
- butterfly-1's 0.37 rad heading.
- phoneP veer, not run.
