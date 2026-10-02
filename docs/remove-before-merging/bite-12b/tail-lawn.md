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
    median 26.7 ms against 23.7.

## Left

- Step 2 (mottles' strength), step 3 (`to-check.md`).
