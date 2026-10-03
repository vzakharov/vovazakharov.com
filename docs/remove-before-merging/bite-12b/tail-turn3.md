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

Green, on 74574f4. Over 5257 frames (the same count as tail-turn's runs):
fastest turn 34.80 rad/s (a fly, within its kind's limit), so bee-12's
31.74 is gone. The worst heading was 0.25 rad off its way, and 0 frames in
flight were over 0.3 off (butterfly of 4740, fly of 249, bee of 448). The
most any flier turned round on one leg was 0.77 times. `insect-drawn.ts` is
untouched. No frames were copied: none show anything new about fliers at the
sides.

Left: nothing in this package. tabL and phoneP were not re-run on this
loosening; it can only make them greener, since it judges fewer frames.
