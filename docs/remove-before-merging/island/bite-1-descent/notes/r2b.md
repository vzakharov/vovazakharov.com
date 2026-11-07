# R2b — type-overlap and the backend on the play hook

Done:

- `FilledTile` and `Held` intersect `TileKeyed`; `TilePool`, `TileMeshes` and
  `IslandScene` intersect `CanDispose`. Shapes unchanged; `pnpm type-overlap`
  clean.
- `IslandPlayHook.backend(): string` (what `IslandScene.backend()` returns),
  implemented from the scene; `play-island.ts` prints it per screen at the head
  of the frame-time line.

Left: nothing. Not checked: a play run (not asked for).
