---
description: The cost ledger's report and contribution figures — what report.py sums and how it reads other repositories, a row's operatorWords split, and the one-way check against Claude Code's own running total
paths:
  - .claude/costs/report.py
  - .claude/costs/contribution.py
  - .claude/costs/post_words.py
  - .claude/costs/lib/totals.py
  - .claude/costs/lib/github.py
  - .claude/costs/lib/period.py
  - .claude/costs/lib/words.py
  - .claude/costs/test_totals.py
  - .claude/costs/test_contribution.py
  - .claude/costs/test_github.py
  - .claude/costs/test_period.py
---

# The report

Part of the cost ledger, `.claude/costs/CLAUDE.md`; paths below are relative to
`.claude/costs/`.

`python3 .claude/costs/report.py` sums the rows five ways every run — by month,
week and day, by the branch that spent it with the pull requests it touched
named beside it, and by operator — then orientation's averages, the calls only
the events saw, by `query_source`, as a share of the spend of the rows priced
with events, the dollars per senior-hour over the estimated rows, by month,
week, day and model, and a period's estimated hours by role and grade, in plain
hours; `--json` prints the lot. `--month`, `--week` or `--day`, each named or
`cur` / `prev`, narrows the whole report to the sessions that started in it;
without one, the hours cover the current UTC month. The spend is the branch's
rather than each PR's, since a session that touched two would otherwise be
counted twice.

**Across repositories, the rows are read off GitHub.** `--all-my-repos` reads
`cost-ledger` and the default branch's tree of every repository the `gh` user
can reach, unioned per repository as `.claude/costs/CLAUDE.md` § "Where rows
live" unions them, and `--repo` just the ones named, so nothing needs cloning. A
`report.py` older than the ledger branch reads the tree alone and undercounts a
migrated repository. A repository counts by its ledger, not muthur's watermark:
the ledger is opt-in, so a watermark alone has nothing to count. A row GitHub
truncates stops the run, since a missing one understates every total it belongs
to, and these rows are never written back: they are another branch's to change.
Each row is rated by this checkout's `rates.json` plus the `rates.repo.json` on
its own repository's `cost-ledger`, since it may name a role only that
repository rates.

**`contribution.py` is one branch's figures** — dollars, senior-hours, the
operator's words and the branch's lines per extension — now, or `--at` a past
moment off the ledger commit before it, as a timelapse frame reads them. Its
header says how `--at` reads a row from before `operatorWords` was counted.

**A row's `operatorWords` splits into `chat`, `review` and `threads`.** `chat`
is read off the transcript; `review` sums `reviewPosts`, a person's posts on the
PRs the session exported, which `scripts/export-github-item.py` hands to
`post_words.py`; `threads` sums `threadPosts`, their comments in a board's
threads, which the session holding the board keeps in `threads.json` beside its
zone files (`{comment id: body}`) and pipes to `post_words.py --kind thread`.
Both are counted without quotes and fenced blocks, for the next row write to
fold in, and the branch counts a post once however many of its rows hold it.

## Checking the arithmetic

The table has no published source to check itself against, but the transcript
can carry a second opinion: `cost-state` records, where Claude Code writes its
own running total for the session. The last one lands in the row as
`claudeCodeTotalUsd`, and `report.py` compares. Not every Claude Code build
writes them, so a row without one is reported as unchecked rather than passed.

**The comparison runs one way only, and that is what makes it sound.** Both
figures count the same session upward, and Claude Code's is read out of the very
file the row was priced from — so it was written at or before the moment the row
was. A row coming out **under** it has missed a source. A row coming out over it
means only that the session kept going, which every row's last turn does.

Without events, a row misses what Claude Code counts and the transcript does not
record as a response: prompt suggestions, which are full-context calls on the
session's own model, and each compact's own request. They measured a few percent
of a session's spend; reading a subagent's file short of its spend was seven,
which is the failure this check exists to catch. A row with events has them in
its total.

**The usage panel is not a third opinion, and what breaks it is compaction.**
Against a session that has never compacted it agrees to within 1%, and each
compaction after that puts it out by tens of dollars across a window in which
the transcript gains no responses at all. Its "Cost" also disagrees with its own
Breakdown's cost row, by different factors on different cards — so the gap is
not a unit or a stale rate, which would miss by one factor in both.
anthropics/claude-code#95837 carries the measurements and asks which figure is
authoritative.
