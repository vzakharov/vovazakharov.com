# Handle bite 9 — angle group (one viewing angle; T101, T102, T97)

Paused for the night at the orchestrator's word, partway through step 1.

## Done

- **55e4512** — step 4: `Sky` (sun-layout.ts) picks `width` and `horizon`
  off `MeadowLayout`; `pnpm type-overlap` is clean.

## In `angle.patch`, not committed

The patch type-checks but four test files fail (below), so it is not
source yet. The same edits are also still uncommitted in the working tree
(ground.ts, flower-layout.ts, layout.ts, meadow-camera.ts, sun-layout.ts);
`git apply` the patch only onto a clean copy of those files.

- `UP_PER_Z` (exported) is the one angle, `1 / (BAND_DEPTH × UNIT_PER_BAND)`
  = 0.481. It is what tablet landscape and desktop already had, 0.492 on
  tablet portrait. It is also the flattest angle that still shows the
  frame's back row with its caps above the clump's. `fitCamera` sets
  `ground = unit × BAND_DEPTH × UP_PER_Z`, with `groundTop = height − ground`.
  Because of that, `seen × unit` is the on-screen offset on every camera.
  The test asked for in step 1 is not written yet.
- `foreshortening()` and `FORESHORTENING` are deleted. `leastRise`
  (flower-layout.ts) uses `UP_PER_Z` alone.
- `horizonAt(groundTop) = 0.7 × groundTop`, which is the old ratio on
  tablets. `placeSun` takes `{ width, height, horizon }`.
- `mostUnit` caps the unit so the ground band takes at most the lower half
  of a tall screen or 0.4 of a wide one. `floorOn` lets the zoom floor give
  way to that cap.

## Why it stopped: a phone held sideways cannot keep all its rules at one angle

At 0.481, the zoom floor's 127 px unit on a 390 px tall screen needs 63% of
the height for ground. Three versions were measured:

- **Floor holds (ground up to 63%)**: the sky is 146 px. The fly and bee
  buttons give way to the open picker on the sideways phone too. The sun
  shrinks to r 8 and its halo has a flat patch. On screens about 300 px tall
  `placeSun` throws, because no sun fits.
- **Floor gives way (the patch, ground ≤ 0.4)**: sideways phone unit is
  81 px and its frame is 4.6 across. The sky, controls and sun are as
  before. These tests fail: narrowest cap a finger across
  (`mushroom-genes`, `mushroom-tap`), cap outline detail an ink line
  (`mushroom-outline`), and butterfly narrower than any cap
  (`insect-layout`). All of them come from the floor, which is T98's to
  lower. A meadow grown sideways and turned upright would refit to about
  37 px (it is 60 px today).
- **Caps of 0.5 and 0.55** break both sets of rules.

This is a call for the operator: which rule gives way on a phone held
sideways. Options: the floor (continue with the patch and rewrite those
four tests with T98), the sky (the floor-holds version plus a sun that
fits a short sky), or a second angle on short screens (reopens the
decision). Steps 2, 3 and 5 wait on this.

## Left

Step 1: the choice above, then the `seen` test on every VIEWPORT and on
412×915 and its turn. Steps 2, 3 and 5 as the brief gives them.

## Reply drafts

- T101/T102/T97: not yet. They depend on the call above.
