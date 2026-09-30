# Bite 11 — package "scene" hand-over

## Done

- Step 1: drag pans. `ui/scene/pan-input.ts`'s `Crop` holds the `Pan`
  (moved out of `meadow-scene.ts`), listens to Phaser's pointer down, move,
  up and up-outside, and is the one home of screen↔world (`toScreen`,
  `toWorld`, `shows`), each through `pan.ts`'s `screenOf`/`worldOf`. The
  scene scrolls the camera to it every frame in `update` and on paint.

- Step 2: keys. `ArrowLeft`/`ArrowRight` are `{ kind: 'pan' }` key actions
  (`keyboard.ts`, a held key's repeats ignored as for every key) that step
  the crop; the instrument's keys are `PlayedKey` (`instrument.ts`'s
  `key` takes that — one-line type edit outside the package). A played key
  opens only the flowers of its sound the crop shows
  (`FlowerBed.answer(sound, shows)` — `flower-bed.ts`, outside the package,
  owned by no one).

- Step 3: parallax and tiled bakes. `parallax.ts` holds `PARALLAX` (fixed
  0, far 0.3, near 0.6, ground 1) and `layerSpan(view, factor)`, the stretch
  of a layer the screen shows over every crop. The backdrop is five baked
  pictures — sky (with the sun) and wash fixed, far hills (farthest + far
  ranges), near hills, ground — each baked in columns ≤ `WIDEST_TEXTURE`
  (2048) texels wide (`pictureColumns` in `baking.ts`) and only over the
  rows its layer covers; explicit negative depths (`DEPTHS`) stack them, so
  a column a resize adds lands in place. The skylines, the seam
  (`groundSeam`) and the mottles run across their layer's span, as many
  swells/points/patches to a screen's width as before; the grain's strips
  span the world and scroll with it. `skyline.ts` is taken as this
  package's (it is the paint's pure half; no one else owns it).

## Left

- Steps 4–6.

## Decided

- A press on anything fixed on the screen (scroll factor 0 — every control
  and picker button, nothing else interactive) does not pan.
- Only the pointer that pressed first moves the crop until it lifts.
- **The far hills are parted under the sun along the whole stretch the sun
  sweeps over them as the crop pans** (the sun is fixed, the far layer
  slides at 0.3), so no far hill ever stands on the rays at any crop
  (`skyline.test.ts` checks five crops). The parting's floor sags
  `PARTED_SAG` (0.2 radii) midway so it never runs level. Visible cost: the
  valley under the sun is 0.3 × (world − screen) wider than before —
  ~295 px on a tablet, ~350 px on a phone upright, nearly its whole width.
- Pointer samples carry the event's own `timeStamp` (the frames' clock), so
  velocity is measured between events, not frames.
