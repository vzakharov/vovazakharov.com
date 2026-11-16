# R2a — sky, phone fov, coast steps

Done, each its own commit:

1. Sky: `lib/sky-colour.ts` blends space (orbit) into pale day blue by 100 km,
   by log height; the scene sets `scene.background` every frame.
2. Phone fov: `fovFor(aspect)` in `features/eye/model/pose.ts` widens the
   vertical fov on portrait so the horizontal one is 50°; `poseOf(eye, aspect)`
   takes the screen aspect; the drag reads `groundPerScreen(aspect)` of the
   element. `GROUND_PER_SCREEN` is gone.
3. Coast: `selectTiles(at, { coast })` — a tile whose centre is within its side
   of the coast splits at a quarter of the split ratio (`COAST_FINER = 2`).

Tile counts (eye over (0,0), selection size), orbit / 1000km / 10km / 100m / 2m:

- ratio 1 (before): 64 / 40 / 96 / 160 / 160
- (a) ratio 0.5: 64 / 112 / 368 / 580 / 580 — over 500, and the 1000 km coast
  still level 5/6 on the left of the frame, visibly stepped
- (b) coast one level finer: 64 / 106 / 114 / 169 / 169 — coast tiles in the
  1000 km frame barely moved (4 at level 5, 2 at level 6)
- (b) coast two levels finer (kept): 64 / 301 / 138 / 172 / 172 — every coast
  tile in the frame at level 6 (8 km cells)
- (b) three levels: 1000km 832 — rejected

Frame medians (phone / desktop): (a) 2.0 / 2.0 ms; (b, kept) 1.9 / 1.2 ms.

Surprised: most of (b)'s 301 tiles at 1000 km are coast off-screen; the
selection has no frustum cull.
