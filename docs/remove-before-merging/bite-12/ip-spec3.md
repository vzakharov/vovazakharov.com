# ip-spec3 — hand-over note

Research package: `insect-plane.md` § "Round 3" written (R3.1 veer, R3.2
cost, R3.3 packages firm), rounds 1–2 condensed into §1–§2, `## Left`
emptied. No source.

- `bench.ts` re-run (one other test process on 4 cores; matches the earlier
  run to 0.02 µs) and `back.ts` run, from `ip-measures.patch` applied in the
  worktree, not committed. `back.ts` was extended locally to print the legs
  under 95%, which is how the brow blink in R3.1 was found.
- Decided here, not by the plan: A and B are additive and C deletes the old
  path; `Perched`/`PerchAt` move to `perch-hosts.ts` (B); `aloftAt` lives in
  `insect-frame.ts` (A, after `ip-veer`); C's play checks go in a new
  `scripts/lib/play-veer.ts`.

Nothing is left in this package. `ip-measures.md`'s Left is done by it.
