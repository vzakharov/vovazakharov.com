# Bite 11 — package "core" hand-over

## Done

- Step 1 (19b7306): `model/pan.ts` + `pan.test.ts` — the crop's pure state.
- Step 2 (8971c9b): the world camera and layout.
- Step 3 (this commit): the minimal scroll. `meadow-scene.ts` holds a `Pan`,
  opened on the clump (`openingPan`) and re-cropped on every paint/resize
  (`recrop`), and sets `cameras.main.setScroll(leftAt(pan, clock), 0)` in
  `paint`. `setScrollFactor(0)` on the `far`, `near` and `wash` bakes, the
  clouds and the grain strips (`paint-backdrop.ts`), and every button face
  (`button.ts`, which every control and picker button is made by).

## Left

- Not run: a production build (`flock tmp/site.lock pnpm build:vova`) and a
  `/preview` look at the scrolled scene — stopped on the orchestrator's
  context call. Typecheck and lint are green.
- For package "scene": the drag input, the key pan, parallax, tiled bakes,
  the fly-out origin conversion, and setting the scroll per frame in
  `update` once the crop moves on its own (today only `paint` sets it).
- The `near` bake (hills and ground in one) is still screen-sized, so it is
  fixed on the screen (scroll factor 0), and the grain with it. Seam grass
  and tufts (`tufts.ts`/`grass.ts`, off limits) scroll with the world but
  seam grass is still drawn over world x `0..width`, so on the opening crop
  it covers only the screen's left part (tablet: screen x −492..688).

## Decided

- `pan.ts` API: `openingPan(view)`, `leftAt(pan, time)`, `press`/`move`/
  `release` (finger x in screen CSS px, time in seconds as `motion.ts`),
  `isPanning`, `isMoving`, `step(pan, ±1, time)`, `recrop(pan, view, time)`,
  and the one conversion pair `worldOf`/`screenOf`. `View` is
  `Pick<Camera, 'width' | 'world' | 'unit'>`, so a `Camera` is a `View`.
- The slop re-anchors where it is crossed, so the crop never jumps 10 px
  when a pan starts; from there it is 1:1.
- A glide is an exponential ease from the release position to
  `clamp(position + velocity × 0.325 s)` over 6 time constants (~2 s), so at
  a world's end it eases into the clamp rather than stopping dead. A release
  after the finger rested 0.1 s does not glide; release speed is capped at
  5000 px/s.
- A key step is 0.4 of the screen's width, eased (cubic out) over 0.25 s;
  presses during a step add to its goal.
- A press stops a glide or a step where it stands. A re-crop stops a glide
  or a step; a pressed finger pans on from the new crop.
- **The zoom is today's opening zoom on every screen**: `composedUnit`,
  capped so the screen still shows `LEAST_ACROSS` (0.87) either side and the
  opening clump's caps. Plain `composedUnit` would zoom a phone upright in
  from unit 133 to 219, cutting the opening clump off the screen (it needs
  ≤ 158). Nothing the meadow has used changes it.
- `Camera.world` = `2 × (EDGE_MARGIN + (WORLD_ACROSS + beyond) × unit)`, so a
  cap on the world frame's side stands inside the margin at the world's
  edge; `midline` = `world / 2`. `WORLD_ACROSS` = 5.764 (2 × the tablet's
  2.882); the tablet's world is 2163 px.
- `MEADOW_FRAME` (in `meadow-camera.ts`) replaces `meadowFrame(screen)` and
  `frameFor`: `{ across: WORLD_ACROSS, ...FRAME_DEPTH }` on every screen.
- `meadowLayout(width, height, seed, openers = [])`. The seeded bed is
  placed once through the tablet's camera (`BED_SCREEN`, any camera places
  it on the same ground), across the world frame, with no controls in its
  way (they are screen-fixed); `FLOWER_SPOTS.landscape`, since 1180 > 820.
  Package "flowers" reworks the bed itself.
- The sun keeps its rays off the clump where the screen shows it at the
  opening crop (`openingCrowns`, via `screenOf`).
- `washRings(layout, [])`: the wash no longer shrinks for the mushrooms
  used, and `washReach` still measures the screen-fixed sun against world
  places (`everyPlace`) — package "room" (owner of `sun-layout.ts`) to
  reconcile.

## Touched outside the package's files (type-check forced)

- `flower-layout.ts`: `FlowerGround` picks `world`, `cameraOf` sets it and
  `midline = world / 2`; `headsAcross` removed; header comment.
- `flower-plots.ts`: `usedIn` removed.
- `meadow-scene.ts`: `opening`/`used()` replaced by `openers`.
- `placement.test.ts`: the six-screen spread test is one test on
  `MEADOW_FRAME`.
- `meadow-rules.test.ts`: the turn test deleted; the edge-margin rule
  measured against the world's width.

## Tests left red for other packages

- `fliers.test.ts`: bees roam 68–69% on phone, small phone, tablet portrait
  (the seeded bed now spreads across the world, and `flowerInSight` still
  tests the screen's edges) — package "flowers"/sight.
- `mushroom-patch.test.ts`: "at most 25% under a fingertip on a tablet" —
  package "room".
