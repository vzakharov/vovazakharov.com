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

- (this commit) The crop API; `pickFoot`'s `within` span
  (`model/placement.ts`); the wash (below).

## Left

- Step 1: `MUSHROOM_SLOTS` 12 and the suite's checks (opening crop six in
  99%, twelve over the world).
- Step 2: edge margin and wash tests against the world in
  `meadow-rules.test.ts`; `mushroom-patch.test.ts`'s tablet fingertip bound.
- Step 4: `scripts/sweep-mushrooms.ts`.

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
