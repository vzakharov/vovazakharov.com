# b3-b7at — the rest of B7a, hand-over

Base 0994e722, branch `wt/b3-b7at`. Done; nothing left of B7a's tail.

## Done (pushed)

- **41d3a949** `tile-cover.test.ts` on cube keys (13 tests): stand-ins from the
  tile's own face only, none above a root, nearest-first by angle from the eye
  direction, a face edge included (`neighbour(…, 'right')`). Root
  `pnpm typecheck` green.
- **af7bd56e** play hook: `moveTo(lat°, lon°, m)` in both files, `buildMs()` on
  the hook and on `IslandScene`. The scene keeps `{ of: generation, ms }` from
  `started.field` and throws `field not built` until the current pool's field
  lands, so after `setWorld` it never reports the old world's build.
- **e4c580b6** `lowland.test.ts` on the sphere: `openSphereWorld(OUR_WORLD)`, a
  1 M-point Fibonacci lattice, 19 342 directions inland (546 within 5 km of the
  coast, deepest 632 km), `heightAtSphere` ≥ 0 at every cut. ~3 s.
- **a0f495e1** `en.json` hint rows per S7 (no `ru` beside it).

## Decisions

- `island-scene.ts` stands at exactly 400 lines; the generation-tagged build
  time saves the reset line a plain `number | null` needed in `setWorld`.

## Gates (whole branch, at a0f495e1)

typecheck, `check:masd`, `check:cycles`, `masd:clusters`, `type-overlap` green;
eslint clean on touched files; tests 27/27 incl. `line-limit`.
