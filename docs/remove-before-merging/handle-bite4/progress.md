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

## Measured (`sweep-door.ts` here, `npx tsx` from the repo root, ~40 s per screen set)

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
2. **Door hit area** (finding 2): a circle of `max(TAP_RADIUS, door reach)` round
   the door's middle, built by a pure function in `draw-house.ts`, which gets tested.
3. **Mouse floor** (finding 3): `paintMouse` scales the mouse by
   `max(1, 28 px / head width)`. When it is scaled, it is clipped to everything above
   the sill instead of the doorway, so it leans out. It gets a body ellipse under the head so
   a leaning mouse is not a floating head.
4. **Spots** (finding 4): skip painting a spot that touches a furnished pane
   plus a margin. Test over `house.test.ts`'s 2000 seeds.
5. **Target** (finding 5): `house` opening with nothing selected selects the
   newest mushroom with room. With nothing selected, `target` falls back to the newest mushroom
   with room for the piece. Tests in `game.test.ts`.
6. **Frame test** (finding 6): done, see § "Done".
7. **Play run** (finding 7): tap the door through the scene's hit test, play the
   back door, sink a furnished mushroom mid-frame, and read the mouse's drawn size
   through the probe.
8. **Nit** (finding 8): keep a door tap from closing the picker, as a mushroom tap
   does (the door is part of the mushroom, a flower is meadow), and write that into
   the plan's decisions.

Then reply on every thread, `/polish`, `/pr`, commit the frames worth showing to
`docs/remove-before-merging/frames/bite-4/`, fill the megabeast notes, and relay.
