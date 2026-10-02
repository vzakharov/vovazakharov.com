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

## Left

1. Apply `tail-turn.patch`. Rewrite the tabL test in `insect-drawn.test.ts`
   so the turn follows the unsunk step.
2. Run `insect-drawn`, `insect-frame` and `insect-seat` tests, then
   typecheck, prettier and eslint. Commit.
3. Rebuild the probe. Run tabL `meadow` to check the watch loosening, then
   phoneL `meadow`, then phoneP `meadow`.
4. Add Russian lines in `to-check.md` for both watch loosenings: frames past
   the brow, and the whole window in view.
5. Correct `tail-face.md`'s attribution of the tabL bend.
