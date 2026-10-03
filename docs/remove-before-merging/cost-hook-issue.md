# Package C — cost rows only on operator turns

Done in one step: the `Stop` hook commits a session's cost row only when the
operator has written since the last committed row; `.claude/costs/flush-row.sh`
commits regardless, run by `/relay` (end of Step 2) and `/finalize` (before the
attestation). `.claude/costs/CLAUDE.md` § "When a row is committed" is the
contract; `test_stop_hook.py`'s `WhenARowIsCommittedTest` covers it.

Decided beyond the brief:

- `/relay` flushes at the end of Step 2, not Step 1: the summary is most of the
  last turn's spend, and Step 3's successor pushes to the same branch.
- A session no operator ever wrote into (a peer- or trigger-started one) commits
  its first row and then only on a flush.

Left: filing the upstream issue on vzakharov/muthur (draft in the report).
