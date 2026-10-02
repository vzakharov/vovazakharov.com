# ip-away — an away leg timed between the points it is drawn between

## Done

- `ui/scene/plane-place.ts` (new): `aloftOfLayout` and `perchDistance` moved
  out of `perch-sight.ts`, plus `placeOfAloft`, their inverse: a plane point as
  the `Place` a leg is timed by (exact at the opening eye; `undefined` within
  ~3.5° of straight behind the opening eye, which the layout lays out nowhere).
- `insect-away.ts`: `offAloft` takes a **depth** (`perchDistance`'s measure),
  not a distance; `leavingAloft` is the one leaving end (as deep as the start);
  `awayPlaces(layout, view)` and `wayOutOf(layout, view)` are those same points
  as `Places`, at a reference insect (butterfly's widest span, the band's
  middle drop).
- Leaving: `perchSight`'s away spots are `awayPlaces` at the opening eye;
  `Perches.sightFrom` puts the current view's in. `apartIn` measures a leg to
  away level with its start (the drawing's "as deep as it sets off").
- Release out of view: `Onscreen` carries a `WayOut` (`brow`, `outs`) from
  `onscreenOf`; `outWay(wayOut, side)` is `apartOf(brow, out)`; the rest of
  the way is timed from the out point (`outOf`).
- `veer-away.ts` updated to the new API (same measurement).

## veer-away, drawn / timed (eye still)

| leg                   | tabL before | tabL after | phoneP before | phoneP after |
| --------------------- | ----------- | ---------- | ------------- | ------------ |
| leaving, all perches  | 0.53–1.30   | 0.95–1.12  | 0.42–1.86     | 0.95–1.09    |
| released, out of view | 1.15        | 0.91       | 2.06          | 0.91         |
| on from out to air    | 0.25–1.95   | 0.50–2.59  | 0.43–1.96     | 0.49–1.69    |

## Left

- **On from out to the air does not hold**: the out end is now the drawn one,
  but `apartIn`'s layout-across measure itself departs from the drawn chord
  for an air spot far across the world (the frame's tangent against the
  layout's straight line). Perch → perch legs in sight measure 0.99–1.00.
  Needs a decision: time legs on the plane chord, or accept for far legs.
- Out of view 0.91: the brow-to-out chord's logMean against the drawn mix.
- Per-insect span/drop are drawn but timed at the reference insect (veer-away
  measures phase 0, the reference's drop).
- `fliers.test.ts` passes (48/48). A released insect facing a shown perch is still timed
  from `shownOf`'s screen edge but drawn from the brow (not in this package).
