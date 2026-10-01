# ip-C1 — the switch-over (step 1 of package C): not built

Contract: `insect-plane.md` § R3.3 package C, step 1. My context ran out
while I was reading and designing, so no source has landed.
`ip-C1.patch` (`git apply`) holds the one edit I made: `insect-away.ts` with
the old path cut out (`Stage`, `Seen`, `flownAt`, `drawnAt`, `pastEnd`,
`offScreen`, `OverRow`, `groundAlong`, `groundNear`, `turnSide`, `entry`,
`toUnits`, `fromUnits`). `reachesScreen` now takes a `View` that is always
defined. The rest of the tree does not type-check against it yet.

## Findings that save the next agent a read

- **`fliers.test.ts` never touches `InsectView`.** It runs at the model
  level through `perchSight`, `seatAt`, `airSpots` and `flightPoint`, so the
  view switch can only move it through `perch-sight.ts` edits. It also uses
  `airSpots`, and `perchSight` uses `airSpots` itself, so **`airSpots`
  stays**. `footRows` is used only inside `perchSight` (for `fromEye` at
  the opening eye), by `perches.ts` and by `perch-sight.test.ts`. Once
  `see()` stops returning `FootRows`, it can become private. Once
  `InsectView` stops using `clumpRow`, `clumpRow` is used only by
  `airAlofts`, `footRows` and the tests.
- **`scripts/lib/mushroom-probe.ts` `insect()`** reads `shown.at`,
  `shown.end` and `shown.row` through `scene.eye.toScreen(point, row)`.
  `play-insects.ts`' `perched` uses that pair as an "at equals end" check.
  It has to change together with `Shown`. The cheapest fix: return `at` and
  `end` as frame px points, with no conversion. They are equal at a landing,
  which is all the check needs.
- **`meadow-scene.ts`**: the tick (line ~217), `startle` (~334) and
  `Arrivals`' `sight` (~104) all read `perches.sight`. Feed all three
  through `perches.sightFrom(view)`. `see()` (~427) passes `FootRows` to
  `insects.see`, which goes away. Pass `InsectView` a
  `() => this.eye.view() ?? viewAt(this.requireLayout().camera, OPENING_EYE)`.
- `flower-bed.ts` `seat` sizes the insect part of the lift at
  `CD / stands.ahead`, which is the foot's bend. `seatedZoom` takes the bend
  at the seat. The two zooms differ by ≤ 1.2% at a rim, which is sub-px.
  Left as B built it.

## The design I had settled on (not built; take it or change it)

- `Shown`: `from: Aloft` (where it was **drawn** last frame, veered,
  fidget included, bob excluded); `centre: number | undefined`, set on a
  leg's first frame by `centreOf(eye, from, end)` and not reset by `paint`;
  `at: Point` and `end: Framed | undefined`, both frame px (`end` is the
  fallback while a perch has nowhere to be, taken back by `aloftFramed`);
  `flown: number`, last frame's, which gives `steer` its size;
  `out: Aloft | undefined`. `fromRow`, `row` and `OverRow` go.
- Per frame: `start = framedOf(view, c, from)`; the end is
  - for a seat: `aloftAt(view, perched.drawn, perched.on.stands.distance)`;
  - for an air perch: `perched.aloft`;
  - for an away leg: `offAloft(view, side, away, distance)`, at the
    distance `from` stands from the eye;
  - while flying out: `out`.

  `z = CD / mixD(start.forward, end.forward, shown.flown)`. `steer`'s
  `size` and `motion.flutter` are scaled by `z`. Bob and fidget are added
  in frame px × `z`. Then `flown = alongOf(point, start, end)` and
  `raw = aloftFramed(view, c, { ...point, forward: mixD(..., flown) })`,
  drawn through the veer.

- **`SeatEnds.from` = the leg's `from` on every leg not in from away**,
  not only one leaving a seat. A leg started mid-flight, or from a hovering
  air sitter inside the veer band, then starts exactly where the insect was
  drawn. Re-veering an already-veered point in the band would jump it by up
  to `w/4` ≈ 0.22 CD. This goes beyond "seat ends" and needs the
  orchestrator's yes.
- The veered `Aloft` has to come back from the draw call to become the next
  leg's `from`, including while the insect is hidden. So `drawnFlier` should
  return `{ aloft, drawn: Placed | undefined }` (its one test adapts), or
  split into `veeredFlier` + `drawnAloft`. Under knip, an unused production
  `drawnFlier` would be flagged.
- A sitter on a cap or flower is drawn at
  `perched.drawn + (offset + bob) · seatedZoom`. It is hidden as the old
  `onSeat` hid it: when the host is not drawn, or when it is behind and
  below the brow. Nectar is drawn at `onHost(perched.on, perched.nectar)`.
- `seatedZoom(view, host, drawn) = CD · bendAt(pinholeOf(view), drawn.x) /
host.stands.distance` (ip-A's fix). Tighten `insect-seat.test.ts`'s rim
  bound from 0.015 to 1e-3, and pass `drawn = stands` (the foot) in the
  "in scale with its cap" test.
- `Perched` becomes a union: a seat `{ on, drawn, nectar? }` or air
  `{ aloft }`. The world-px `Point` part is then read by nothing in the view
  path. Check `perch-crowding` before dropping it.
- `insect-away.test.ts`: delete the `entry` block except the
  `reachesScreen` case (drop its `undefined`-view line). Of
  `insect-seat.test.ts`, keep only `drawnFlier`/`seatedZoom`. Rewrite "its
  own size at the opening" as `CD / ahead`.

## Left

All of step 1, then step 2 (tests for `flowerLiftAt` and for `seat`'s and
`capTop`'s `drawn`).
