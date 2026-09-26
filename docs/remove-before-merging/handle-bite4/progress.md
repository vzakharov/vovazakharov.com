# Handling bite 4's review — progress

Review: https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5327262595
(8 threads, none answered yet).

## Done (committed, not vetted)

- `stemHalfWidth(genes, t)` split out of `stemOutline` (`model/mushroom-outline.ts`),
  for fitting a door to the stem at any height.
- Portrait clump retuned in `ui/scene/layout.ts`: `CLUMP_DOWN.portrait` [0.74, 0.8]
  (was [0.64, 0.82]), a new `CLUMP_STEP` per orientation, portrait [0.14, -0.08]
  (landscape keeps the old 0.08 / -0.06). Existing layout tests not yet re-run.

## Measured (`sweep-door.ts` here, `npx tsx` from the repo root, ~40 s per screen set)

The best door height on the back stem shows ≥80% of the door on this share of visits:

| screen                                                       | before     | after the retune |
| ------------------------------------------------------------ | ---------- | ---------------- |
| tablet / phone landscape, desktop                            | 0.98       | 0.98 (unchanged) |
| tablet portrait                                              | 0.80       | 0.996            |
| phone portrait                                               | 0.60       | 1.0              |
| small phone                                                  | 0.58       | 1.0              |

Widening the landscape steps too (0.12 / -0.08) made landscape worse (0.86), which is
why the step is per orientation. A door at the stem's foot is hidden on every visit
(0% at t ≤ 0.3), so the door has to move up.

## Design decided, not yet written

1. **Door height per visit** (finding 1): `house.ts` gets candidate stations
   up the stem (sill above the ground up to about t = 0.6, under the gills), and
   the door's width fits the stem at its station with the frame (`DOOR_FRAME`, moved
   from `draw-house.ts` into the model) and a line's margin. A new pure
   `ui/scene/door-sight.ts` picks the lowest station where ≥80% of the painted door
   lies outside every nearer mushroom's drawn outline, or the most visible one. The
   same module takes over `layout.test.ts`'s `standingAt`. `MushroomBed` computes it
   on `paint` (layout change) for every mushroom, and on `reconcile` only for
   doorless houses, so a door never jumps once it is in.
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
6. **Frame test** (finding 6): test the painted frame inside `stemOutline` with a
   line's margin, at every station.
7. **Play run** (finding 7): tap the door through the scene's hit test, play the
   back door, sink a furnished mushroom mid-frame, and read the mouse's drawn size
   through the probe.
8. **Nit** (finding 8): keep a door tap from closing the picker, as a mushroom tap
   does (the door is part of the mushroom, a flower is meadow), and write that into
   the plan's decisions.

Then reply on every thread, `/polish`, `/pr`, commit the frames worth showing to
`docs/remove-before-merging/frames/bite-4/`, fill the megabeast notes, and relay.
