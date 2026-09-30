# Bite 11 — package "scene" hand-over

## Done

- Step 1: drag pans. `ui/scene/pan-input.ts`'s `Crop` holds the `Pan`
  (moved out of `meadow-scene.ts`), listens to Phaser's pointer down, move,
  up and up-outside, and is the one home of screen↔world (`toScreen`,
  `toWorld`, `shows`), each through `pan.ts`'s `screenOf`/`worldOf`. The
  scene scrolls the camera to it every frame in `update` and on paint.

## Left

- Steps 2–6.

## Decided

- A press on anything fixed on the screen (scroll factor 0 — every control
  and picker button, nothing else interactive) does not pan.
- Only the pointer that pressed first moves the crop until it lifts.
- Pointer samples carry the event's own `timeStamp` (the frames' clock), so
  velocity is measured between events, not frames.
