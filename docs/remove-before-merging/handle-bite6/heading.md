# Heading group (T59 flight fix) — done, heading watch passing

## Done

- **ebb4b2c**: the flight step lives in pure `model/insect-steering.ts`. A
  flier turns before it flies, and heads over one flutter bob.
- **678b2e9**: a flier faces the way its moving perch carries it.
  - The cause of both failure kinds was the perch moving (a cap beckoning,
    or bouncing from a tap). The point rides the live `end`, but the body
    headed for the stale `aim`, and a still hop kept its old heading.
  - `steer` reads the way the flight goes over one bob (`stride` in
    `insect-paths.ts`). It reads it to the live end, drifting at the speed
    the perch moved since the last frame (`Steering.perch`, reset on a new
    leg and on a repaint).
  - It faces that way above 0.8 sizes/s. Below 0.4 it faces the way it
    meant to (toward `aim`, or `SetOff.meant` on a still leg), and between
    the two it blends (`GOING`, `facingWay`).
  - A NaN bow is fixed: a leg with no curve that set off near a half turn
    from its heading used to vanish.
  - New tests in `insect-steering.test.ts`: flying to beckoning caps (fails
    before at 0.37–0.39 rad), a still hop on a beckoning cap, and the NaN leg.
- **38b2ac3**: `scripts/play-mushrooms.ts` `step` counts frames. Summing
  `FRAME_MS` used to run one frame twice per call now and then. The watch
  then saw part of a bob, and a bee read 0.32 rad on tabP.

## Measurements (worst heading, rad; bound 0.3)

| Screen | ebb4b2c | 678b2e9 + step fix, at 678b2e9's tree | at 38b2ac3 (with the perch group's 52295ea/8321601) |
| ------ | ------- | ------------------------------------- | --------------------------------------------------- |
| tabL   | 1.41    | 0.26                                  | 0.27                                                |
| tabP   | 0.47    | 0.25                                  | 0.30                                                |
| phoneP | 2.68    | 0.21                                  | not run                                             |
| phoneL | 0.38    | 0.23                                  | not run                                             |
| phoneS | 0.29    | 0.24                                  | not run                                             |

The most turning round on one leg stayed at or under 0.72 everywhere. The
run before the perch group's commits exited 0 on all five screens.

## Left

1. **The play at 38b2ac3 exits 1 on tabL/tabP**, from the perch checks and
   not the heading watch. The failures read "butterfly-N never reached a
   perch nor roamed" and "the butterfly sent away is still in the meadow".
   Two causes are possible:
   - the perch group's 52295ea/8321601;
   - 38b2ac3, which plays slightly less time per `step` than the old
     double-stepping did.

   To settle it, play a worktree at 38b2ac3 with 38b2ac3 reverted. The
   phones were not played at 38b2ac3.

2. The harness still fails its hardest cases. These are a fly hopping on,
   or re-landing on, a cap bouncing at the full 20% tap depth: 0.38 rad and
   1.5 turns. The play never hits them, and the watch passes.

## Harness

`heading/sim.ts.txt` is the harness. Copy it to
`tmp/handle-bite6/heading/sim.ts` so that its `../../../src` imports resolve,
then run `node --import tsx tmp/handle-bite6/heading/sim.ts 60`.

- It flies `steer` the view's way to a cap that moves (breath, a tap's
  bounce, a beckon) and reads each leg as the flier watch does.
- It prints the worst heading and spin per scenario and screen. The
  scenarios are `hop`, `same` (a startle back onto the cap it sat on) and
  `in` (from off screen).
- `STILL=1` freezes the cap, `TRACE='<scenario> seed N <kind> <width>'`
  prints the watched frames, and `ALL=` prints every frame.

## State

Done. The tabL failure was the beckon's release stopping a cap dead
mid-swell, which no one-bob read of the perch can foresee; the beckon now
dies over a whole swell (290612d, test in `insect-steering.test.ts`). The
play exits 0 on all five screens, worst heading tabL 0.25, tabP 0.26,
phoneP 0.21, phoneL 0.22, phoneS 0.22 rad; lint (d6281d4) and
`pnpm type-overlap` (6a5680f) are clean.
