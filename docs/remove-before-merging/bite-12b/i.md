# Package I — hand-over note

## Done

- **I1** — perches judged at an anchor, in reach (commit: see `git log --grep "perches judged"`).
  - `ui/scene/anchored-stand.ts` (new): `anchoredStand(stand, anchor)` moves every
    mushroom's and planted flower's foot with `anchored`, re-stands each seeded
    flower's layout place at its anchored foot (a new layout object, `flowers`
    replaced), drops whatever lands in the sliver behind the eye with no ground,
    and keeps bee flowers ringed round their anchored parent. At `OPENING_EYE`
    it returns the stand itself. `placeAnchored(ground, mushroom)` is `placeIn`
    with the opening clump's size and splay kept (the bed lays the clump out
    once at the opening eye; `openingIndex` fails on an anchored foot). S and L
    can use both.
  - `perch-sight.ts`: `PERCH_REACH`, caps and flowers filtered by it; caps placed
    through `placeAnchored`.
  - `perches.ts`: `see(stand, anchor = OPENING_EYE)` on the anchored stand, every
    place and air aloft taken back with `unanchored`; `perchAnchorOf` (2 units,
    0.3 rad).
  - `model/game.ts` `perchesOf`: caps (and spotted) only those `sight.places`
    names; all when there are no places.
  - `meadow-scene.ts`: `see()` at `perchAnchorOf(eye)`, rerun from `walk` when
    `sameAnchor` says it moved.

## Decided / departures

- `PERCH_REACH` is `max(D_SEE, the world frame's far corner)` = 15.91, not
  `D_SEE`: opening caps stand up to 15.21 from the opening eye, so `D_SEE`
  breaks the opening identity (`perches.test.ts`, 8 `flower-plots.test.ts`
  cases fail). Options: (a) as built; (b) `D_SEE`, rewriting those tests.
  Since caps also need `placeIn`'s world frame and flowers the world edges,
  the reach removes nothing the anchored frame keeps: the following is done by
  the anchoring itself.
- `perchSight` at 96 mushrooms on one anchored stand (1180×820, synthetic
  lattice forest): median 17–28 ms, min 6–11 ms; today's opening `perchSight`
  at 96 is ~10 ms with the layout warm. Past the 4 ms budget, so the perches'
  snap is coarsened per spec § 4.5 (2 units, 0.3 rad); each re-see is still a
  one-frame hitch.

## Left

- `fliers.test.ts` not run for I1 (orchestrator wrap-up); run it next.
- I2–I5.
