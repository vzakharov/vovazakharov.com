# Bite 11 — package "room" hand-over

## The API package "scene" wires (stable)

`roomFor(stand, seed, crop?)` and `keptRoom(find?, fits?)` in
`ui/scene/mushroom-room.ts`. `crop` is `Pick<Crop, 'toWorld'>`, `Crop` being
`pan-input.ts`'s class, so the scene passes its crop as it is:

```ts
private readonly room = keptRoom();
// in roomNow():
return stand && this.room(stand, this.upcoming, this.crop);
```

With a crop, the foot is drawn across the stretch of the world the screen
shows now, the cap stands inside `EDGE_MARGIN` of both the screen's edges and
the world's, and every control, open picker and the sun's rays keep off it
where they stand over the world now (`toWorld`). Without one — the sweeps'
forests — the whole world, which no control stands over.

`keptRoom` keeps a foot found while the stand and seed are the same and the
foot still fits the crop asked for (`fitsCrop`: edges and controls only,
cheap), so a pan costs no search while the room stays in sight; a room not
found is looked for again once the crop's left edge has moved.

## Done

- 558e309: the crop API; `pickFoot`'s `within` span (`model/placement.ts`);
  the wash (below). `mushroom-room.test.ts` covers the kept room over a pan
  and a `+` growing inside the crop at the opening crop and both world ends.
- (this commit) `MUSHROOM_SLOTS` 12. Measured over every tenth visit, 200
  per screen: twelve fit the world in 200 of 200 on every `VIEWPORTS` screen;
  grown `+` by `+` on the opening crop, at least six fit in 200 of 200 on
  every screen (twelve in all but 1 phone visit, which holds 10, and 2
  small-phone visits, which hold 11). Scratch script: `tmp/room/measure.ts`.
- `mushroom-room.ts`'s edits lost to package 3's stash were rewritten by hand
  (not merged from the stash); 558e309 holds the whole of them.

## Left

- Step 1's tests: in `layout.test.ts`, "grows six" should become "at least
  six in 99% on the opening crop" (`opened(…, true, openingCrop)`, `>= 6`)
  plus "twelve over the world" (measured 100%, so a floor of 0.99), and the
  caps' span test should grow on the opening crop. Today the test still
  counts `=== MUSHROOM_SLOTS` over the world, which passes (every visit
  reaches twelve) under a message that says six.
- Step 2, not run since the change: `meadow-rules.test.ts` (its edge margin
  already tests `world`; its wash test should use `nearestTheSun`; its
  controls test mixes screen controls with world places and should grow on
  the opening crop and map the controls through `openingCrop`), and
  `mushroom-patch.test.ts`. The tablet fingertip bound was red at 25.3%
  against 25% before any change here; a likely cause, not yet acted on:
  `mushroom-patch.ts`'s `tappedIn` counts the screen's controls at their
  screen x as if in the world, so mushrooms in the world's left half lose
  patch to controls that do not stand there. The fix I had settled on:
  drop the controls from `Tapped` (a pan can slide any cap under a button,
  accepted by the plan; the new mushroom's keep-off is `roomFor`'s), then
  re-measure every bound over twelve.
- Step 4: `scripts/sweep-mushrooms.ts`.
- Not re-run with twelve: every other forest sweep (`opened(…, true)`), in
  packages 3's tests too — each now grows twelve over the whole world.

## Decided

- **The wash keeps off every foot on every crop.** The sun stands on the
  screen and the world pans under it, so `washReach` measures each frame
  extreme at the nearest any crop brings it to the sun (`nearestTheSun` in
  `sun-layout.ts`: across, the crops at the world's two ends bound it). A
  place's height and size both grow linearly down the band, so the extremes
  bound every foot, and `trialOn` no longer tests the wash. `washRings` lost
  its `standing` argument (every caller passed `[]`).
- **A new cap stands wholly on screen**, inside the edge margin of the crop
  as well as of the world, so the child sees the whole mushroom grow.

## Touched outside the package's files

- `ui/scene/layout.ts`: `washRings(layout)` (one line).
- `ui/scene/visit-play.ts`: `opened(…, cropOf?)` grows each mushroom in the
  crop `cropOf(layout)` gives, and `openingCrop(layout)`; absent a crop the
  forest grows over the whole world.
