# Bite 11 — package "core" hand-over

## Done

- Step 1: `model/pan.ts` + `pan.test.ts` — the crop's pure state.

## Left

- Step 2: the world camera and layout.
- Step 3: the minimal scroll in `meadow-scene.ts`.

## Decided

- `pan.ts` API: `openingPan(view)`, `leftAt(pan, time)`, `press`/`move`/
  `release` (finger x in screen CSS px, time in seconds as `motion.ts`),
  `isPanning`, `isMoving`, `step(pan, ±1, time)`, `recrop(pan, view, time)`,
  and the one conversion pair `worldOf`/`screenOf`. `View` is
  `{ width, unit, world }`.
- The slop re-anchors where it is crossed, so the crop never jumps 10 px
  when a pan starts; from there it is 1:1.
- A glide is an exponential ease from the release position to
  `clamp(position + velocity × 0.325 s)` over 6 time constants (~2 s), so at
  a world's end it eases into the clamp rather than stopping dead. A release
  after the finger rested 0.1 s does not glide; release speed is capped at
  5000 px/s.
- A key step is 0.4 of the screen's width, eased (cubic out) over 0.25 s;
  presses during a step add to its goal.
- A press stops a glide or a step where it stands.
- A re-crop stops a glide or a step; a pressed finger pans on from the new
  crop.
