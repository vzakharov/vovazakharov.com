# Tail — lawn (`wt/tail-lawn`) — hand-over note

## Step 1 — the lawn's re-tend spread over frames

- `tending.ts` (new): the tufts' rules moved out of `tufts.ts`
  (`plantableIn`, `tendedIn`, `tendTufts`, `strayed`, re-exported from
  `tufts.ts` for `planter.ts` and the tests) and `Tending`, a re-tend a
  slice a frame: the rules read off the stand on its first step, then
  `TEND_SLICE` = 60 tufts a step, handing back exactly `tendTufts`' result
  on the last (`tending.test.ts`).
- `Grass.follow`: once the eye strays, gathers the tufts round it
  (`retend`: `leaveTufts`, `LiveLawn.round`, `tendedIn`) and judges them
  from the next frame on (`tendOn`); the tufts last tended, and
  `tendedAt()`, stand until the last slice. `Grass.tend` (a planting, `+`,
  `−`, a resize) stays whole and at once, and drops any re-tend under way,
  since the scene reads `holds` straight after it.
- Measured on tabL, `--plays approach` (the probe times `tend` only; for the
  "after" run the probe also timed `tendOn`/`retend` locally, uncommitted):
  - before: re-tends 18, median 18.2 ms (slowest 36.7); their frames median
    43.3 ms against 23.6 for frames carrying neither.
  - after: lawn calls 173, median 1.2 ms (slowest 16.4); their frames
    median 26.7 ms against 23.7. A second run (`approach,walk`, the
    machine busier): calls median 1.6 ms (slowest 16.2), their frames 26.9
    against 25.7; gathering the tufts (`retend`) median 0.3 ms, slowest 0.6,
    so the slowest calls are slices (node: a slice median 0.55 ms, p90 1.3,
    an occasional 15 ms — a cold rule cache on a new anchor, or a GC).
    That run's walk-into-the-forest median, 26.2 ms, is over the 26 ms
    budget, as the frames with no lawn work in it were at 25.7: load.

## Step 2 — the mottles' strength

- `MOTTLE_TONE` 0.3 → 0.7, `MOTTLE_ALPHA` 0.16 → 0.4, judged on tabL's
  walk frames at the opening and 19 units back. 0.8 / 0.5 read as smudges
  where two or three deep mottles overlap far out; 0.7 / 0.4 reads as a
  gentle dapple, quieter than the tufts and flowers. Frames kept in
  `frames/bite-12b/mottles-at-*.png`. No test pins the numbers
  (`mottles.test.ts` green).

## Step 3

- Hand checks in `to-check.md` § "Хвост 12b, лужайка (tail-lawn)".

## Left

- Nothing of this tail. The probe times `Grass.tend` only; the sliced
  re-tend runs in `tendOn`/`retend`, so a probe line timing those (in
  `scripts/lib/mushroom-probe.ts`, not this package's) would keep the
  approach's hitch notes honest.
