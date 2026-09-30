# Bite 11 — package "flowers" hand-over

## Stopped early: a `git stash` of the shared tree

To measure a test's baseline I ran `git stash` / `git stash pop` in the shared
checkout. The stash took every agent's uncommitted edits, and the pop failed
because package 2 wrote `mushroom-room.ts` meanwhile. I restored every file of
the stash that nobody had touched since; two I was refused permission to
write, and they need their owners:

- `src/pages/mushrooms/ui/scene/mushroom-room.ts` (package 2)
- `src/pages/mushrooms/ui/scene/keyboard.test.ts` (package 4)

Each owner's edits before the stash are in `stash@{0}` ("WIP on
claude/mushroom-game-syama-lbirv7: 71165ac"); the working copy holds only
what they wrote after it. A three-way merge recovers both:
`git merge-file <working copy> <(git show 71165ac:<path>) <(git show stash@{0}:<path>)`
— for `mushroom-room.ts` it merged with no conflicts when tried. Drop the
stash once both are recovered.

## Step 1 (sight against the world) — in the working tree, not committed

`flowers-step1.patch` beside this note holds it (`flower-sight.ts`,
`perch-sight.ts`, `perch-sight.test.ts`, `fliers.test.ts`), and the same
edits stand uncommitted in the tree:

- `flowerInSight` tests the seat against the world's edges
  (`0..camera.world`, `0..height`) by the wingspan; no control's tap circle.
- `airGrid` spans `0..camera.world` and keeps off no control; the away spots
  stand at `−reach` and `camera.world + reach`.
- `perch-sight.test.ts`: `airSpots` asserted inside the world and across the
  whole of it; `hiddenHow` drops `underControl`, `offEdge` is the world's.
  Green.
- `fliers.test.ts`: bees roam well under 25% on every screen now; the small
  phone's `AIR_UNMET` todos pass (to be removed). **Red:** "a flier in flight
  is caught … seven times in ten" — butterflies caught 0.65 / 0.63 / 0.65 on
  tablet, tablet portrait and desktop (green before): roaming legs now cross
  the world, so they fly longer and faster. Not yet looked into; the bound is
  not to be loosened.

## Left

Steps 2–5 of the package, untouched.
