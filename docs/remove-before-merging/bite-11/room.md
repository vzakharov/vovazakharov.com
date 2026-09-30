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

- Step 1 of the second run (layout.test.ts): at least six on the opening
  crop in 99% (200 of 200 on every screen, 100 of 100 on the small phone),
  twelve over the world in 99% (the same), and the tablet's caps' span grown
  on the opening crop (median 90%, bound 60%). The file takes ~4.6 min.

- Step 2 (this commit): the controls left `mushroom-patch.ts`'s `Tapped`
  (orchestrator's decision). `meadow-rules.test.ts` grows on the opening
  crop, converts the controls and the sun's rays through `openingCrop`,
  keeps each cap inside the edge margin of the crop as well as the world,
  and measures the wash through `nearestTheSun` — green on every screen.
  That test found `washReach` short: it measured the frame's rows at their
  two ends and middle only, but on a screen wider than the world's overhang
  the stretch a pan can bring under the sun lies between them (desktop,
  visit 3: mushroom-12 at x 1896 in the wash, the far row's ends and middle
  all 183+ px across from it). Each row is now measured at its nearest across
  (`acrossFromSun`); desktop's wash 426 → 390 px.
- `mushroom-patch.test.ts` at twelve: every patch test green; the
  fingertip bound red on three screens — tablet 27.1% (bound 25%), tablet
  portrait 3.3% (3%), phone 24.8% (22%). Root cause, from
  `tmp/room/fingertip.ts`: 99%+ of those mushrooms lack a fingertip patch
  standing alone, flowers gone too — their own size, far caps drawn small.
  Per grown mushroom the share barely moved from six to twelve (tablet 36%
  → 32%, phone 27% → 29%, tablet portrait 3.8% → 4.0%); what moved is the mix:
  the opening clump, near and almost never under a fingertip (2 and 19 of
  400), is a third of six and a sixth of twelve. So the bounds, measured at
  six, cannot hold at twelve without loosening: left red for the
  orchestrator.

## Left

- Step 3: `scripts/sweep-mushrooms.ts` to the world and twelve.
- Step 4: every forest-growing test re-run with twelve.
- Step 5: how much the wash shrank per screen.

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
