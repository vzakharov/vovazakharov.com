# Bite 11 — package "flowers" hand-over

## Stash recovery (first flowers agent)

A `git stash` of the shared tree took other agents' edits; two files needed
their owners (`mushroom-room.ts`, package 2; `keyboard.test.ts`, package 4).
Their pre-stash edits are in `stash@{0}` ("WIP on
claude/mushroom-game-syama-lbirv7: 71165ac"); recover with
`git merge-file <working copy> <(git show 71165ac:<path>) <(git show stash@{0}:<path>)`,
then drop the stash.

## Done

- Step 1, sight against the world (this commit):
  - `flowerInSight` tests the seat against the world's edges (`0..camera.world`,
    `0..height`) by the wingspan; no control's tap circle.
  - `airGrid` spans `0..camera.world` and keeps off no control; the away spots
    stand at `−reach` and `camera.world + reach`.
  - Butterflies' `slowest` 2 → 4 (`model/flight-habits.ts`, outside the
    package's list, owned by no package). Cause of the red catch test: a
    butterfly's flight past `slowest` strides takes `slowest` times its pace
    and simply flies faster, and with flowers across the world a leg runs up
    to 12–14 strides (it was ≤ 6.6 across the tablet's screen), so the long
    ones flew twice as fast as before. The world is twice the tablet's screen,
    so twice the cap keeps the fastest crossing no faster than the tablet's
    was. Caught share now 0.80–0.95 on every screen (≥ 0.7 asserted).
  - `fliers.test.ts`: `AIR_UNMET` (small phone) removed — the world's air grid
    now seats all ten apart there.

## Left

Steps 2–5 of the package.
