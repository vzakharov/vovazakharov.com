---
description: A cost row's human-hour estimate — the senior-hour unit and its rate tables, a repository's own roles on cost-ledger, the subject line, the landing gate, and what the figure cannot tell apart
paths:
  - .claude/costs/estimate.py
  - .claude/costs/check_estimates.py
  - .claude/costs/lib/estimate_model.py
  - .claude/costs/lib/hours.py
  - .claude/costs/rates.json
  - .claude/costs/hooks/estimate-notice.sh
  - .claude/costs/test_estimate.py
  - .claude/costs/test_check_estimates.py
  - .claude/costs/test_estimate_notice.py
---

# Human-hour estimates

Part of the cost ledger, `.claude/costs/CLAUDE.md`; paths below are relative to
`.claude/costs/`.

A row's `estimate` says how much work the session's spend bought, so the ledger
can price a unit of human work done by an agent and watch that price move —
including whether the same work started costing more. It is the task split into
parts, each the hours one role at one grade would spend on it and the reason for
them. A revision replaces it, so its history is git's.
`hooks/estimate-notice.sh` is the agent-facing home of when and how to set one.

- **The unit is a senior-hour**: an hour of a senior developer, the role and
  grade `rates.json` rates at 1. The table holds a multiplier per role and per
  grade, a part being worth hours × both, and is applied when the report reads a
  row, so retuning one re-rates the whole history alike and the trend stays
  comparable with itself.
- **A repository adds roles of its own in `rates.repo.json` on `cost-ledger`**,
  beside the rows they rate, so a sync of the shared table never collides with
  them. Each is `{"multiplier", "grade", "work"}`, booked at that one grade, so
  its hours land in that grade's column of the report and no estimate, command
  or table has an ungraded path.
  - **The ledger is its only home**, because the rows are written there from
    every branch: a table per branch would leave rows that only an unmerged
    branch could rate. `estimate.py role set` and `role drop` write it through
    the same append the `Stop` hook uses, so `git log cost-ledger` is its
    history; `check_estimates.py` fails a tree copy, and `ledger.py backfill`
    carries one over.
  - **It only adds.** `role set` refuses a role `rates.json` rates, and
    `role drop` refuses a role ledger rows book that the shared table does not
    rate, so every role a row names stays rateable.
  - **A role the shared table takes up later keeps the repository's multiplier
    for that repository's rows**, since they were booked against it, and the
    report, `check_estimates.py` and the notice each name both rates;
    `role drop` adopts the shared one.
- **`subjectLine` names what the session did**, as a conventional commit subject
  of at most 72 characters, so a row reads like a log entry. Its scope is left
  out where it would only repeat the row's branch. It is part of the estimate
  rather than a field beside it, so `set` requires it and a revision replaces it
  with the parts.
- **Of the row's copy and a running session's pending one, the later wins.**
  That is how a `--session` edit to a running session's row survives its next
  `Stop`, and how the session's own later `set` overrides that edit.
- **A branch lands with an estimate on every session it carries, and every such
  row whole.** `check_estimates.py`, in the vet run, fails one without: the
  notice sets no deadline, and a `Stop` hook would ask before the size of the
  work is known. Whole means every key the current writer writes, and no null
  `subjectLine`, `operatorWords` or `branchLines` — a zero is a count, a null is
  a row that never counted — since a row a later field postdates otherwise lands
  silently short of it. `estimate.py set --session` rewrites a row in the
  current shape, so it is the fix for both.
- **It sizes the task, never the session's pace.** It moves when the task does —
  scope added, a difficulty no estimator would have foreseen, a relay handing
  the rest on. A model that booked its own detours as extra hours would hide
  exactly the regression the figure exists to show.
- **A part's reason is the case for the team, not a summary of the work.** What
  was done is already in the row and the commits; what nothing else carries is
  why that part is that role, at that grade, for those hours — and only that
  lets a reader check the figure rather than take it. It sits on the part it
  justifies, so the one is never read without the other. An older row carries
  one comment for the whole; where it names each part as
  `<grade> <role>: <reason>`, the report moves it onto the parts, and where it
  does not, it stays as written, since placing it would be a guess.

**What the figure cannot tell apart:** the estimator is the model under
measurement, so a changed model may estimate differently too — a person's
`--session` revision is the check, and the row's history in git shows which
figures one touched; and a heavier `CLAUDE.md` or a new mandatory pass raises
the dollars per senior-hour with no change to the model at all.
