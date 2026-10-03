# Package tail-turn3 — hand-over note

phoneL `meadow`'s last red (bee-12 turned 31.74 rad/s at 80217 ms against
its kind's 21.62), left by `tail-turn.md` § "Left".

## Step 1 — the turn rate is judged only on screen (the orchestrator's call)

- `flier-watch.ts` judges a frame's turn (`turnSteps`, `worstTurn`) only
  while the body's middle is on the screen: `onScreen`, the same test the
  heading's `inView` was built from, which is now `onScreen && !sinking`.
  The step onto that frame is what is judged; the frame before may be off.
- Its Russian line is in `to-check.md`.

## Step 2 — phoneL `meadow` once

Not run yet.
