# step0-cruise — hand-over note

Package: step 0, the pace half — `model/cruise.ts`, `model/pan.ts` (optional
ends, explicit cruise), `model/stride.ts`, and their tests.

## Done

- Step 1 (bf61e347): `cruise.ts` + `cruise.test.ts`; `pan.ts` drives its
  keys through `cruise`, and a pan with a `turn` (`turnOf(focal)`) is a
  heading — no ends, wraps once round, cruises at `TURN_CRUISE`.
  `pan.test.ts` untouched, 30/30 before and after. `Cruised`/`Paced`/`Placed`
  are the shared bases the type-overlap gate asked for;
  `scripts/lib/play-pan-keys.ts`'s `Turning` takes `Cruised`.
- Step 2 (00c7d22f): `stride.ts` + `stride.test.ts` — keys, the glade room, the rim
  slide, the drag's chase.

## Left

- Nothing in this package. The walking agent (P3) consumes the API.

## Decided

- The heading-crop tests live in `cruise.test.ts`, `pan.test.ts` being frozen.
- The room ahead is the ray's distance to the rim **plus the slide along it**
  to where the rim stands square to the walk. The bare ray distance would
  brake every slanting walk to a stop at first contact, which the "slides,
  never stops dead" line rules out. Head-on the two are the same.
- At the rim the walk slides at its full pace along the arc (the move's
  direction projected onto the tangent), not at pace × sin — so the slide
  ends in finite time, braked to rest exactly where the rim turns square.
- `chaseFrom` stops the eye where it stands (pace 0), as pan's `press` stops
  the crop; while a chase runs the keys wait, and take over after it ends.
- Position is a plain `Point`, the heading a number passed to `tick` and
  `chaseFrom`; `forwardOf(heading)` matches `ground.ts`'s `Eye` (0 looks
  along `+y`, growing turns toward `+x`).
