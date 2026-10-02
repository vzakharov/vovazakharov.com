# Package tail-probe — hand-over note

Steps 2 and 3 of `tail-screens.md`.

## Done

- **Step 2, the sliced re-tend timed:** the probe wraps `Grass.retend` (the
  gather) and `Grass.tendOn` (each 60-tuft slice) beside `Grass.tend`, all
  into `__probe.hitches().tend` (`scripts/lib/mushroom-probe.ts`), so the
  approach play's "frames carrying one" count slice frames as lawn frames;
  its note now names them "the lawn's tending calls (whole re-tends,
  gathers, slices)" (`scripts/lib/play-approach.ts`). No game-side change:
  the private methods are plain instance-reachable methods, and `follow`'s
  `this.` calls reach the instance's wrapper first. Neither file has a unit
  test.

- **Step 3, tabL `veer`:** the reordered looking-back releases all play
  (every release took the air, drawn on all its flight frames in view; the
  cap and flower landings drawn sat). One red, the harness's: 4 bee
  one-frame steps over the 1.15 `DASH_SLACK` bound, the most 30.6 px at its
  own size against 28.8 (bee-8 flower→air, lifted 0.77: 1.22 of the dash
  curve), and bee-5 air→flower at 31.2 against 31.0. The bound is empirical
  (the curve leaves out flutter, jitter and the leg's depth timed as one
  framed length), the operator already waved through odd flight speeds
  (`to-check.md` § Checked, "Скорости перелётов"), so `DASH_SLACK` went to
  1.25 and a hand check went into `to-check.md` § "Хвост 12b, проба". Re-run
  green, the same numbers (the play is seeded): 3 min, 5½ min. Frames:
  `frames/bite-12b/tabL-veer-back-perched-reordered.png`,
  `tabL-veer-back-bee-darts-off-flower.png`.

## Left

- Nothing of steps 2–3.
