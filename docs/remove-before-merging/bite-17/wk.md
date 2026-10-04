# wk — a drag holds the gait and height it was pressed at

Review `review-read2.md` item 4.

## Done

- `model/walk.ts`: `Drag` carries the `gait` and `eyeHeight` read at the
  press (`pressAt`). The lock (`lockAt`), the step's aim (`stepAim` in
  `follow`) and the chase the lock starts (`locking`) read them through
  `pressedLens`, never the walk's current gait or rise, so a gait flip or a
  press inside the 0.5 s rise no longer jumps a step's aim or feeds the fling.
  The next press takes up the new gait and height.
- `model/walk.test.ts`: "holds the height it was pressed at…" — press in
  flight, lock a step, flip to steps at 0.1 s, let the rise finish, move 1 px:
  the eye moves at most that row's ground span at the pressed height, and the
  lift flings nothing. It failed before the fix (moved 2.18 against 0.023 on
  the tablet).

## Left

Nothing in this step. The drawn eye still rises or settles during a drag
(`lensAt` reads the current height for the render), so the ground drifts a
little under a resting finger while the 0.5 s ease runs; only the walk's own
aim stays fixed.
