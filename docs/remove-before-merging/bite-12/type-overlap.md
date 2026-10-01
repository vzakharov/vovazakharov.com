# Bite 12 — type-overlap

Done: `pnpm type-overlap` is clean. Type-only; no runtime change. Tests beside
every touched module pass (geometry, ground, motion, mushroom-genes, panorama,
brow, mushroom-light, walking, mushroom-patch, layout, skyline).

Bases introduced, each at the most upstream module its declarers import:

| Base         | Home                       | Replaces the member in                                                                        |
| ------------ | -------------------------- | --------------------------------------------------------------------------------------------- |
| `Tall`       | `model/geometry.ts`        | `BrowBlade`, mushroom-bed `Shown`, `ShadowLayer`                                              |
| `Leaning`    | `model/geometry.ts`        | `MushroomShape`, `BrowBlade`                                                                  |
| `WithCamera` | `model/ground.ts`          | `MeadowLayout`, `Around`                                                                      |
| `Bobbed`     | `model/motion.ts`          | insect `Shown`, `Stepped` (no module both imported; motion is the animation primitives' home) |
| `Azimuthed`  | `ui/scene/panorama.ts`     | `BrowBlade`, `SeamTuft`, `Cloud`                                                              |
| `WithCrest`  | `ui/scene/panorama.ts`     | paint-land `Range`, `FarRange`                                                                |
| `WhetherLit` | `ui/scene/brow.ts` (local) | `BrowBlade`, `ShownBlade`                                                                     |

`ShownBlade.x` reuses `Pick<Point, 'x'>` (as `ShadowLayer` already does), and
its `tip` is now `Point`. Per-type docs a base swallowed moved to an inline
comment on the intersection.

Decided: `lean` is one concept (a lean from upright) in both types, in each
module's units — radians for a mushroom, a sideways share of the seam's reach
for a blade — the same "in its module's units" footing `Topped`/`Point` stand
on, so it got a base rather than a rename.

Left: nothing.
