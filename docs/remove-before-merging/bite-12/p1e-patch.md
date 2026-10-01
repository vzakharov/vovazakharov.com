# p1e-patch — hand-over note

Package: the plan's `## Rest of the bite` item 1, "Decided" — a grown
mushroom's patch scales with the drawn size. Starting point `p1d-taps.md`.

## Done

- `mushroom-patch.ts`: `grownPatch(camera)` is `GROWN_PATCH` (16) times the
  screen's `camera.unit` over the tablet held sideways' (1180×820,
  `TABLET_UNIT`, read off `meadowCamera`), clamped to `[8, 16]`
  (`LEAST_GROWN_PATCH`). `patchFloor` takes the camera; `patchesAround`
  carries the new mushroom's patch as `Around.grown`, which `keepsPatches`
  reads; `patchlessIn`'s default floor reads `stand.layout.camera`
  (`scripts/sweep-mushrooms.ts`'s `() => FINGERTIP` call still fits).
  `mushroom-room.ts` and `meadow-camera.ts` unchanged.
- Read as "shrinks": a screen drawing the clump larger than the tablet
  (desktop, tablet portrait) keeps 16, not more.

Patch per screen (unit → px): tablet 170.6 → 16, tablet portrait 289.1 → 16,
desktop 224.6 → 16, phone 132.9 → 12.47, phone held sideways 81.1 → 8
(7.61 floored), small phone 107.5 → 10.08.

Mushrooms after growing to `MUSHROOM_SLOTS` over 10 visits (`VISITS[0..9]`):

| screen              | base (pads) | now, scaled | in the opening view |
| ------------------- | ----------- | ----------- | ------------------- |
| tablet              | 120         | 120         | 120                 |
| tablet portrait     | 120         | 120         | 120                 |
| desktop             | 120         | 120         | 120                 |
| phone               | 120         | 120         | 93                  |
| phone held sideways | 120         | 120         | 120                 |
| small phone         | 120         | 120         | 92                  |

Anywhere in the world every screen reaches 120, so no screen's floor goes to 8. In the opening view (a child who never moves) the portrait phones stop
short of 12 per visit — the base reached 120 there — though the plan holds
that view to `CROP_HOLDS` 6 (`layout.test.ts`), which 9.3 a visit clears.
Measured in the opening view: phone 120/118/118/97 at 9/10/11/12 px, small
phone 113/95/92/92; both 120 at 8. 430×932 (13.8 px) 94, 412×915 (13.2 px)
96, both 120 at 10; 1024×768 (15 px) 120.

## Tests

Pass: `meadow-rules` 12/12, `mushroom-room` 7/7, `mushroom-tap` 15/15,
`flower-layout` 43/43, `insect-layout` 13/13, `sun-layout` 19/19.
`mushroom-patch` 30/33; `LEAST_HEAD_SHARE` 0.72 holds (worst 73.0%, tablet
in the opening view, as before). `layout`: pending.

**Red before this package, not from it** (both red at bc13de6, green at
7a94a1c):

- `mushroom-patch`, phone held sideways ×3: the opening clump alone
  (no mushroom grown) leaves `mushroom-1` no `CLUMP_PATCH` 12 px patch,
  visits 237573 and 9819563 — the back cap's crescent, with the pad gone.
  Over all 2000 visits, clump alone, failures at 12/11/10/9 px: sideways
  47/16/5/0, 280×600 2/0/0/0, every other screen 0. Options (not picked,
  the plan names no clump patch): `CLUMP_PATCH` 9 everywhere; or the clump's
  patch scaled by the same factor as the grown one (12 → phone 9.4, small
  phone 7.6, sideways 6 at a 0.5 floor).
- `clump-layout` "wider cap farther in under 20% of pairs": tablet 589 of
  2250 (26%) at bc13de6 and now, 318 at 7a94a1c; phone, sideways and small
  phone fail too. Not this package's file.

## Left

- `fliers.test.ts` once.
- `openingCrop` → `openingView` with the scripts' owner.
