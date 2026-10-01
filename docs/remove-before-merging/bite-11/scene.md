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

- Steps 4–5 (one commit): `Controls.paint` takes `toScreen` (the scene
  passes `crop.toScreen`, now a bound arrow like `toWorld`) for the flower
  picker's tuft and both fly-out origins. `InsectView` takes the crop:
  away is `crop.toWorld` of just past the screen's edge; a leg's `from` is
  kept in ground units from the world's midline across, a share of the
  height down; a leg in from away picks its edge on its first frame — the
  one nearer where `perchAt` stands its perch on screen, the seed's side if
  the perch has nowhere to be — and a departure keeps its seed's side. Any
  first-perch-in-view choice package 3 adds plugs in with no change here.
  `roomNow` passes `this.crop` to `keptRoom`'s finder (558e309).
- The stash of the shared tree cost nothing here: `keyboard.test.ts`'s
  arrow test is in 1fc17fd, and `keyboard.ts`, `instrument.ts`,
  `instrument-input.ts`, `flower-bed.ts` and `meadow-scene.ts` all hold
  steps 1–2 as committed; nothing needed recovering from `stash@{0}`.

## Left

- **Not yet looked at**: step 3's bakes have passed tests, typecheck and
  lint but no one has seen them render. Check first (probe build, CDP at
  tablet 1180×820@2 and phone 390×844@3): no gap or seam between columns,
  the hills sliding at their parallax on a drag, the sun's widened valley.
- Step 6 looked at (`look/`, production build, touch drags over CDP; each
  load is a fresh visit, so the frames of one screen are not one meadow):
  no seam between bake columns, nor between the ground and the hills at
  either world end; far hills slide ~0.3 of the ground (tablet: ground
  +484 px to the left end, the farthest range +147 px). The sun's parted
  valley reads as a low range behind the near hills on both screens, not
  as a hole. Seen wrong, not this package's: seam grass (`grass.ts`,
  `0..width`) and the sprouting tufts (`tufts.ts`) cover only the world's
  left stretch — both world-end-right frames show a bare horizon and no
  sprouts.
- The controls' tuft and fly-out targets are taken at the controls' last
  paint (every dispatch): a pan with the flower picker open leaves it
  folding back to where the tuft stood on screen then.

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
