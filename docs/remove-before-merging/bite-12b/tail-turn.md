# Package tail-turn — hand-over note

The two phoneL `meadow` reds from `tail-phoneL.md`. Stopped at the context
line: the work is traced and a fix drafted, but not finished. The draft is
`tail-turn.patch` beside this note (`git apply` it). Nothing in source is
committed yet.

## Baseline (70fc342 reverted locally, phoneL `meadow` once)

- Turn rate: **gone**. The fastest turn was 21.60 rad/s (a bee, at its own
  limit). So the butterfly's 24.01 rad/s **comes in with 70fc342**.
- Heading: **already there**. bee-12 faced 1.48 rad off at 80350 ms, the same
  leg. So it does not come from 70fc342.

## Red 1 — butterfly-1, 24.01 rad/s at 35217 ms: a game red, from 70fc342

- Cause: `bentTurn` reads the body's direction from two points it draws one
  px apart. Those points are drawn _after_ the brow sinks them (`sunk` in
  `view.ts`). Past `D_SEE`, `sunk` mirrors the foot's rows about the brow.
  That mirror keeps positions continuous but bends the drawn direction
  sharply.
- Numbers, per frame: the steering turn held at -1.336 the whole time.
  Meanwhile the drawn rotation went -1.191 (35183), -1.226, -1.626 (35217),
  -1.749. At the same moment the foot's distance crossed `D_SEE` 13.330:
  the step's two ends stood at 13.315/13.324, then 13.322/13.331, then
  13.328/13.337. The snap happened off screen: x -40, drawn half-span 25,
  screen width 844.
- It is still a game red, because it also happens in view. A flier going
  straight away over the brow at the screen's middle (h 1.5) has its drawn
  step flip from 0 to π the moment its foot crosses the brow. Measured on
  phoneL's view: the body would flip round to face down the screen in one
  frame.
- Drafted fix (in the patch): `sinkingAloft` also returns `placed` (the point
  before the sink), and `bentTurn` steps between `placed` points. A new test
  sweeps a flier across the brow and checks it never turns more than 0.005
  per 0.5 px. With the old reading that check fails at 0.043.

### What the fix breaks, and what is left

- `insect-drawn.test.ts`'s tabL test ("points a flier skimming the grass…")
  fails with the fix. It expects the drawn sunk way. At its point
  (608, 449.5, forward 13) the foot is past the brow (13.65). The drawn way
  there is -1.224, the unsunk way -1.052, against a frame turn of -1.1. So
  70fc342's gain on tabL came from following the brow's mirror, not from the
  skim or the screen's lay as `tail-face.md` says. That test wants
  rewriting so the turn follows the unsunk step.
- With the fix, tabL `meadow` goes red again: butterfly-1 faced 0.43 rad off
  at 25183 ms, and 102 of 6260 butterfly frames were over 0.3. What is left
  of the gap is the sinking slide, which is not the way the flier flies.
  The patch's `flier-watch.ts` change stops judging the heading on frames
  where the flier is past the brow (`shown.drawn` farther than `D_SEE` from
  the eye). The tabL re-run with that change was cut off by the container
  restart, so it is **unmeasured**. If it holds, that loosening needs its
  Russian line in `to-check.md`.

## Red 2 — bee-12 faced 1.52 rad off at 80350 ms: a harness red

- Cause: bee-12's first leg came in from away. It flew out past the left
  side (`stretch`'s `out`) and turned round off screen to reach `flower-1`.
  The watch judges the body's turn at the window's middle frame (80200,
  18 frames for a bee) against the way from the first frame (80050) to now.
  But it checks only that _now_ is on screen. At 80200 the bee stood at
  x -43.7 with a drawn half-span of 27, so wholly out of view, and the window
  straddles the U-turn.
- Numbers: all six bee frames over 0.3 (80333–80417) have their middle
  frame off screen. Every frame whose middle is in view was 0.08 off or less.
  In view (from 80283) the body was 0.16 off its drawn motion at most, while
  moving fast. The U-turn (80133–80267) happened entirely off screen.
- Drafted loosening (in the patch): judge a heading only when the first, the
  middle and the current frame are all in view. Not yet run, and no line in
  `to-check.md` yet.

## tail-turn2 (builds the patch; the orchestrator's call in `waves.md`)

- Step 1: the patch applied (its `insect-drawn.ts` hunk by hand, the doc
  block having been reworded by polish since), `tail-turn.patch` deleted.
  The tabL test now asks that the body follow the step's unsunk `placed`
  way (within 0.01) and not its sinking slide (over 0.1 off it). The three
  insect test files, typecheck, prettier and eslint green.

- Step 2: both loosenings have their Russian lines in `to-check.md`;
  `tail-face.md`'s tabL bend is credited to the brow's sink.

- Step 3, the probe of 2d5283a, `meadow` once each:
  - tabL: green. Worst heading 0.25; butterflies over 0.3 off 0 of 5914;
    fastest turn 35.25 rad/s (fly, within its limit).
  - phoneP: green. Worst heading 0.23; over 0.3 off 0 everywhere; fastest
    turn 33.77 rad/s (fly).
  - phoneL: **red**. bee-12 turned 31.74 rad/s at 80217 ms against its
    kind's 21.62. Headings green: worst 0.25, 0 over 0.3. The butterfly's
    24.01 and bee-12's 1.52 rad are both gone.

## Left — phoneL's bee-12 turn rate, not fixed (likely a harness red)

- The run is deterministic (5257 frames, every count as in tail-turn's
  runs), and the patch moves no flier, so bee-12 flies the leg traced
  above: its U-turn spans 80133–80267, and at 80200 it stood at x −43.7,
  half-span 27, wholly off screen; it is in view from 80283.
- The turn-rate check judges every frame the body is drawn
  (`shown.container.visible`), and `reachesScreen` draws a body until a
  whole span, not half, is past the edge. So 80217 is judged while no
  child sees the bee.
- Why it is faster now: `bentTurn` maps the frame turn through the
  unsunk step, whose bend grows toward the screen's sides. A U-turn sweeps
  the frame turn through every way, and in some ways the drawn way turns
  faster than the frame's (1.47× here, past the side). Before 70fc342 the
  bee's fastest was 21.60; 70fc342's sunk reading was never measured for
  this bee (the butterfly's 24.01 outranked it).
- Not traced: whether 80217's frame is on screen, and how fast an
  on-screen U-turn at the side spins. The fix this points to is one more
  loosening (judge the turn rate only while the body's middle is on screen,
  as the heading is), which is the orchestrator's call, not this package's.
