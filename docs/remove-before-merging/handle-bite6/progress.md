# Handling bite 6's review (5331309763) — paused for the operator's quota

First paused on the operator's word ("кажется сейчас кончится недельная квота… когда я скажу, когда она сбросится"). Resume on their "continue".

Done and pushed:

- Plan decisions for the review: 6a87e91.
- T54 mute drops sounds 91849d5; T55 bee rest flutter 739b348; T58 fly jitter 635f59a; T57 sun in the sky 77d0bbd; nit buzzing-gene helper 36c0b1a; sun split to `sun-layout.ts` + horizon dedupe edbf253.
- T51 planting by this screen e1db096; T56 bee on the rim 0a36044.
- T53 tap nearest body c53c421; T59 new heading watch e8e53f7; judgment calls: deferred sight 00cd630, aim reset + take-off bob 7a10e93.
- Artifact build script `pnpm artifact:mushrooms` fc3677d (not yet published).

Left:

- `perch.md` beside this file: T50, T52, T53 air spread, T59 test half, catchability, two nits — built but uncommitted, in `perch.patch` (`git apply` it); the old tests need fixing against it and new tests writing. Small-phone bees still roam 56% (ask < 40%).
- `heading.md`: ebb4b2c landed; the heading watch still fails on 4 of 5 screens (a fly's last ~100 ms before landing; a butterfly flying in from off screen). `pnpm play:mushrooms` exits 1 until it lands.
- Then: play run green, frames to `frames/bite-6/`, publish the Artifact and post its URL on the PR, reply on T50–T59 and the review body, `/polish`, `/pr`, megabeast notes, and the loop's next step (bite 7 or `/relay /go`).

Shared brief for the subagents: `tmp/handle-bite6/common.md` (not committed; recreate from its gist — invariants from the plan's decisions, no suppressions, ≤450 lines, explicit `git add`, merge never rebase, no GitHub posts).
