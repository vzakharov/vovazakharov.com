# md — day outings keep a reach (review-read1 item 2)

Done: a house's own outing (`MouseRuns.watchOuting`) asks
`outingTarget` in `model/mouse-run.ts`, which keeps its run to doors
within `OUTING_REACH` (2.5 clump sizes, the old `RUN_REACH`). A door tap
(`answerTap`) and a dusk outing (`nightRan` → `runTarget`) still reach any
door in sight. Tests: `mouse-run.test.ts` § "reach" — tap 8 apart runs,
`runTarget` 8 apart runs, own outing 8 apart makes no run (failed before
the gate), and one within reach runs.

Left: nothing. bite-17.md call 11 ("Day keeps runs tap-only") is the
orchestrator's to restate: by day a house's own outings still run, to a
near door only.
