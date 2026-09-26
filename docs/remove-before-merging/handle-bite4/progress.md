# Handling bite 4's review — progress

Review: https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5327262595
(8 threads, none answered yet).

## Done (committed, not vetted)

- `stemHalfWidth(genes, t)` split out of `stemOutline` (`model/mushroom-outline.ts`),
  for fitting a door to the stem at any height.
- Portrait clump retuned in `ui/scene/layout.ts`: `CLUMP_DOWN.portrait` [0.74, 0.8]
  (was [0.64, 0.82]), a new `CLUMP_STEP` per orientation. The steps were retuned
  again in 330dd6d (below).
- **1. Door height per visit** — 330dd6d. `doorStations` in `model/house.ts`
  (sill just above the ground, a station every 0.05 of `t` for as long as the
  frame plus a line keeps clear of the dome and gills: 8–14 stations; width
  0.7 of the stem's narrowest width along the frame, clamped so the frame keeps
  1.25 lines inside the stem). `DOOR_FRAME`, `doorway`, `paintedDoor`, `onStem`
  live in the model now. New pure `ui/scene/door-sight.ts` (`standingAt`, taken
  over from `layout.test.ts`; `sightOf`; `doorInSight`). `MushroomBed` seats every
  door in on `paint`, and a door going in on `reconcile` (a doorless house has no
  seat until its door goes in, which is when a seat on `reconcile` would be read,
  so the result is the same as seating every doorless house and cheaper per tap).
  Deviations: the pick needs 80% of the painted door **and** of the doorway in
  sight (painted alone passed doors whose doorway showed 75–79%, which the
  review's sweep rejects); stations run up to under the cap rather than stopping
  at t = 0.6; the clump steps are retuned to landscape [0.02, -0.04] (was
  [0.08, -0.06]) and portrait [0.22, -0.1] (was [0.14, -0.08]), because with the
  earlier steps no station at all showed 80% of the doorway on 2% of landscape
  visits and 21% of tablet-portrait visits. The steps put the crossing low in
  landscape (the door stands above it) and high in portrait (the door stands at
  the foot).
- **6. Frame test** — 330dd6d. `house.test.ts` checks, at every station of all
  8000 mushrooms, points a line (`MUSHROOM_INK`) outside the painted frame, off
  each vertex along both edges' outward normals, all inside `stemOutline`; and
  that the stations rise from a sill 0.018–0.030 above the ground to a frame clear of
  the dome and gills.
- **2. Door hit area** — 43698d4. `doorHitArea` in the new Phaser-free
  `ui/scene/door-reach.ts` (not `draw-house.ts`, which loads Phaser through
  `shapes.ts`): a circle round the door's middle of `max(TAP_RADIUS, painted
door's reach)`, widened by `1 / cos(π / ROUND_STEPS)` so the polygon's chords
  keep outside it. `ellipse` moved to `model/geometry.ts`. `layout.test.ts`:
  every station of 100 visits' mushrooms, in every slot on every screen, is at
  least `2 × TAP_RADIUS` across and holds the painted door (~0.2 s per screen).
- **3. Mouse floor** — 2ea224a. `mouseScale` / `mouseHead` in `door-reach.ts`;
  `paintMouse` scales by `max(1, 28 px / head width)`, clips to above the sill
  when scaled, and paints a body ellipse under the head (always; in a wide
  door it shows as shoulders in the doorway). `HouseView.drawnHead` (on screen,
  times the graphics' scale) and the probe's `mouse(id).head` report it, ready
  for finding 7's play step. `layout.test.ts` checks head ≥ 28 px at every
  station/slot/screen.
- **4. Spots** — b569160, 380d893 (type-overlap). `paintedSpots(genes, house)`
  in `model/house.ts` drops spots within a line of ink of a furnished window's
  square (`PANE`); `MushroomBed` draws with them and redraws when a window drops
  one. The plan's bite-4 summary line now says so. `house.test.ts`: 2000 seeds,
  every window count, no painted spot overlaps a furnished pane and exactly the
  touching ones are dropped.
- **5. Target** — 32d6b36 (another agent): `newestWithRoom` in `model/game.ts`.
- **8. Door tap vs picker** — 2645fb9. No behaviour change: a door tap leaves
  an open picker open, as a mushroom tap leaves the house picker open. Written
  into the plan's § "Decisions the whole game carries" and as a comment at the
  handler.
- `sweep-door.ts` removed — 9891994 (it failed `tsc`).
- **7. Play run** — 3c92655, frames 3b9c1c9. `__probe.topAt(point)` asks
  the scene's own hit test (topmost only) what a tap reaches; the door step
  asserts it is the door at each door's middle, then taps and checks the
  mouse. Both clump mushrooms get a door and both are played, back first
  (`h3-mouse-back`/`-front`). `__probe.mouse(id).head` is asserted ≥ 28 px
  and printed. `4a-sinking` shoots the furnished mushroom `−` takes, 20
  frames into its sink, asserting its house is shown and scaled with it.
  `__probe.mushroom` now returns the point nearest the cap's middle that
  reaches that mushroom (the tablet-portrait back cap's middle is behind the
  front cap). **The run fails on phones**: the back (selected) mouse's head
  is drawn 27.4 px (phoneP, phoneL; front 28.2, tabL 30.1/32.5, tabP
  32.3/33.2). `mouseScale` floors the head at rest; the drawn head is
  times the graphics' `scaleX`, which `widthFor(breath + beckon)` takes
  under 1 on a breathing, selected mushroom (27.4 / 28 = 0.979). Open:
  floor against the narrowest pose, or accept the at-rest floor.

## Measured (by `sweep-door.ts`, since removed: `door-sight.ts` supersedes it)

The best door height on the back stem shows ≥80% of the door on this share of visits:

| screen                            | before | after the retune |
| --------------------------------- | ------ | ---------------- |
| tablet / phone landscape, desktop | 0.98   | 0.98 (unchanged) |
| tablet portrait                   | 0.80   | 0.996            |
| phone portrait                    | 0.60   | 1.0              |
| small phone                       | 0.58   | 1.0              |

Widening the landscape steps too (0.12 / -0.08) made landscape worse (0.86), which is
why the step is per orientation. A door at the stem's foot is hidden on every visit
(0% at t ≤ 0.3), so the door has to move up.

Those numbers ran high: the sweep's t = 0.05 station stood partly underground, and
underground points counted as in sight. Measured with `doorInSight` (2000 visits,
the back door's doorway, which the layout test asserts), after 330dd6d:

| screen                            | back doors under 80% | worst | median |
| --------------------------------- | -------------------- | ----- | ------ |
| tablet / phone landscape, desktop | 0 of 2000            | 0.81  | 0.89   |
| tablet portrait                   | 0 of 2000            | 0.88  | 1.00   |
| phone portrait, small phone       | 0 of 2000            | 1.00  | 1.00   |

Before the step retune (steps as in the table above, same pick), 2% of landscape and
22% of tablet-portrait back doors had no station showing 80% of the doorway. The
landscape margin is thin (worst 0.81): a step change there wants the door sweep re-run.

## Design decided, not yet written

1. **Door height per visit** (finding 1): done, see § "Done".
2. **Door hit area** (finding 2): done, see § "Done".
3. **Mouse floor** (finding 3): done, see § "Done".
4. **Spots** (finding 4): done, see § "Done".
5. **Target** (finding 5): done, see § "Done".
6. **Frame test** (finding 6): done, see § "Done".
7. **Play run** (finding 7): done, see § "Done" (one open question there).
8. **Nit** (finding 8): done, see § "Done".

Then reply on every thread, `/polish`, `/pr`, fill the megabeast notes, and relay.
