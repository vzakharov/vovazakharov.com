# Cube board: the deep-floors discussion as ideas

The task, as asked: «Давай занесем на доску все что тут пообсуждали как идеи» —
put every idea from the deep-floors discussion on the cube board. Routed through
`/task` with no plan (outcome 2); this file exists only because the session
paused for its context budget.

## Done

- 5ddbed42 — two new zones on the cube board:
  `src/cube-board/app/config/cube/deep.yaml` (`z-deep`, 12 stickies and a line
  to the trophy zone) and `src/cube-board/app/config/cube/trophies.yaml`
  (`z-trophies`, 6 stickies), in the free row at y −1000 right of «How far is
  never». `pnpm board refile` is a no-op over them; `pnpm board build` and
  `snapshot` render them without overlap at fit.

## Left

- `/go` Step 3: `/polish` over the branch (the board copy is prose a person
  reads).
- `/go` Step 4: `/pr` — no PR exists yet, so it creates one; then
  `/five-percent`.
- Whether the published board artifact is republished is the operator's call:
  the board's `db` may hold live edits `pnpm board sync` must fold back first.

## Decisions

- The ideas go in as two zones, not into the existing «Iteration one» zone: they
  are a discussion of what comes after, not of iteration one.
- Ideas are yellow, problem/framing cards the zone's colour, a ruled-out card
  gray, matching the board's existing use.
