# muthur sync 439f78f..29efa2d

The task: `/update-muthur claimed`, five source commits, PR #163.

## Done

- 4242dc8 (#203) manual relay offer: take, 83f0872
- 639f92d (#206) relay caption: take, 7bd5881
- bfd1a40 (#205) polish subagent: take, e5da230
- b4741cf (#204) conflict resolution commit: take, e62ad7e (sync-branch via
  staged copy; finalize hunks over local lines)

## Left

- 29efa2d (#202) `[attn adopters]` cost ledger on an orphan `cost-ledger`
  branch. **Blocked on the operator**: the ported Stop hook pushes `cost-ledger`
  to origin, and the migration (`python3 .claude/costs/ledger.py backfill`,
  check the ledger holds every session main does,
  `git rm -r .claude/costs/sessions`) needs their yes. Do not apply any of #202
  to the working tree before the yes: the Stop hook runs from the tree, so an
  uncommitted port pushes the branch too.
  - It is a translate, not a take: local `stop-session-cost.sh` diverges (70
    lines), and `flush-row.sh` and `hooks/last_operator_record.py` are
    local-only. Also local diffs in `CLAUDE.md`, `lib/estimate.py`,
    `lib/restart.py`, `lib/pricing.py`, `rates.json`, `report.py`,
    `session_cost.py`, `test_estimate.py`, `test_restart.py`,
    `test_stop_hook.py`, `hooks/estimate-notice.sh`.
  - #202 also splits `/finalize` into `base-advanced.md`, `merge.md`,
    `revoke.md` and points `/check-merge` at `base-advanced.md`; port with it,
    keeping the local finalize lines (flush-row, merge-is-deploy, styles:codegen
    autofix). `flush-row.sh`'s role likely changes once rows go to the ledger
    branch.
  - Skip its `update-muthur/SKILL.md` hunk (the local procedure carries no
    "never sync cost rows" section; the watermark note covers it), `detemplate/`
    and `ADOPTING.md` (declined), catalog (declined).
- On a no to #202: watermark boundary b4741cf (first-parent, last commit
  triaged), #202 left for a later sync. On a yes: port it here, boundary
  29efa2d.
- Then: watermark bump last, refresh PR body and squash proposal.

No vet run yet (that is `/finalize`). No polish run: every port so far is a
verbatim take, which `/update-muthur` Step 8 keeps out of the passes.
