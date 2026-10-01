# p1f-reds — hand-over note

Package: the plan's `## Rest of the bite` item 1, "Built (d396ca72…)" — the
clump's patch scaled, then the two reds left since 86503fb. Starting point
`p1e-patch.md`.

## Done

- `mushroom-patch.ts`: the clump's patch is `scaledPatch(CLUMP_PATCH, camera)`
  — 12 px at the tablet's unit, × unit ÷ tablet unit, between 8 and 12
  (`LEAST_PATCH`, shared with `grownPatch`). Per screen: tablet, tablet
  portrait, desktop 12; phone 9.35; small phone 8 (7.56 floored); phone held
  sideways 8 (5.7 floored).
  Tests: `mushroom-patch` 33/33, `mushroom-room` 7/7, `meadow-rules` 12/12.

## Left

- `layout.test.ts` "grows 12 over the world" on the phone held sideways.
- `clump-layout.test.ts` "wider cap farther in under 20% of pairs".
- Lead from another agent: since 86503fb no mushroom grows behind the opening
  clump on tabL, phone, sideways and small phone.
