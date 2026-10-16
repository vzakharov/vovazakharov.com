# muthur sync 439f78f..29efa2d

The task: `/update-muthur claimed`, five source commits, PR #163.

## Done

- 4242dc8 (#203) manual relay offer: take, 83f0872
- 639f92d (#206) relay caption: take, 7bd5881
- bfd1a40 (#205) polish subagent: take, e5da230
- b4741cf (#204) conflict resolution commit: take, e62ad7e (sync-branch via
  staged copy; finalize hunks over local lines)

- 29efa2d (#202) cost ledger, `.claude/costs/` half: translate, 76e0c3f. The
  operator said yes («берём»). The local operator-silent gate now gates only the
  branch's display copy; the ledger takes every turn, so `flush-row.sh` is gone
  and `/relay` no longer runs it. All 11 `.claude/costs/test_*.py` pass.

## Left

- #202's `/finalize` half. Regenerate each file with a three-way merge from the
  source clone (`scripts/muthur-sync.sh clone tmp/muthur-source`): base
  `29efa2d^:<path>`, theirs `29efa2d:<path>`, ours the local file, via
  `git merge-file -p --diff3`.
  - `finalize/SKILL.md` is **staged** (002c853, its description gains
    `/finalize revoke`): merge into
    `.claude/staged/.claude/skills/finalize/SKILL.md.staged`, never the real
    file. Three conflicts are expected. Keep this repo's merge-is-deploy and
    `styles:codegen` lines, and drop its `flush-row.sh` step (line ~240), since
    the script is gone. The attestation must write
    `<!-- finalize-attestation <sha> -->`, which `lib/finalized.py` reads.
  - `finalize/base-advanced.md`, `merge.md` and `revoke.md` are new: take them,
    checking that `merge.md` keeps this repo's local merge lines.
  - `check-merge/SKILL.md` merges cleanly (its pointer to `base-advanced.md`).
  - Skip the `update-muthur/SKILL.md` hunk (the local procedure carries no
    "never sync cost rows" section; the watermark note covers it), plus
    `detemplate/`, `ADOPTING.md` and the catalog, all declined.
- The migration, which the operator approved: run
  `python3 .claude/costs/ledger.py backfill`, check that `cost-ledger` holds
  every session id under `.claude/costs/sessions/` on `origin/main`, then
  `git rm -r .claude/costs/sessions` (this branch's display copies included,
  once the backfill has carried them).
- Watermark boundary: 29efa2d. The source has since moved to bb62c02 (#199
  multi-repo sessions, #207 `[attn adopters]` attest only a verified head);
  those two belong to the next sync.
- Then: watermark bump last, refresh PR body and squash proposal.

No vet run yet (that is `/finalize`). No polish run: every port so far is a
verbatim take, which `/update-muthur` Step 8 keeps out of the passes.
