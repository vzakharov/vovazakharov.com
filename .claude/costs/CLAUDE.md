# The API-rate cost ledger

`sessions/<YYYY-MM>/<branch>/<N>/<session-id>.json` records what a session would
have cost at Claude API rates. The subscription price hides that number, and the
point of having it is to know the size of the bill before subscription pricing
stops being a bargain.

What holds only for one part of the ledger loads with the files it governs, as a
path-scoped rule in `.claude/rules/`:

- **`costs-transcript.md`** — what a transcript holds and how it is priced, and
  what names a session.
- **`costs-orientation.md`** — the orientation phase and its mark.
- **`costs-telemetry.md`** — the `api_request` events and their receiver.
- **`costs-stop-hook.md`** — the `Stop` hook beside the harness's own check.
- **`costs-estimates.md`** — the human-hour estimate.
- **`costs-report.md`** — `report.py`, `contribution.py`, a row's
  `operatorWords`, and the check against Claude Code's own total.

## Where rows live

**`cost-ledger` is the source of truth**: an orphan branch on `origin` holding
every row where § "Where a row is filed" places it, named once in
`lib/ledger_branch.py`. The default branch carries none. The `Stop` hook writes
the row there every turn, on every branch and the trunk alike, so a session
counts whether or not its work merges.

**A branch also carries a display copy until it is finalized**, so its PR's diff
shows what the work cost. It rides the agent's own commits:
`hooks/stage-cost-row.sh`, a `PreToolUse` hook on `Bash`, prices the session and
stages its row before a `git commit` runs, and nothing commits it otherwise. So
the copy is as of the session's last commit, and a session that never commits
leaves none — the ledger counts it all the same. The hook stages nothing where
the row would be wrong in the commit; its comments name each case.

Finalized means the PR's last `<!-- finalize-attestation <sha> -->` names a SHA
that `HEAD` still contains, and nothing after it touches more than rows. GitHub
is asked until the answer is yes, and the yes is cached in
`tmp/costs/finalized/<branch>`; a work commit after the SHA sends the question
back. `/finalize` carries the copies into the ledger and deletes them before the
branch lands, and `/finalize revoke` withdraws the attestation.

**Readers union the ledger with the default branch's tree**, one row per session
id, the later by `lib/rows.py`'s `recency` winning. The tree side is how a
repository that has not migrated still counts, and how a copy that reached the
trunk without `/finalize` is counted once.

What each failure costs:

- **A push that loses the ledger's tip** to another session re-reads it and
  rebuilds, up to three tries, taking the next ordinal where the winner took the
  one it planned on, so a rebuild loses none. After the third, or on a failed
  fetch, the hook blocks the stop once with git's message. The next turn's row
  covers the missed one, so only a session's last turn can be lost, and only
  when nobody acts on the block.
- **A GitHub query that fails** counts as not finalized: the commit carries its
  display copy and the next asks again. It is the ledger's one silent fallback,
  approved for that call site alone, and its worst case is a copy on a branch
  that merges after it, which the union counts once.

## Where a row is filed

The ledger reads as what each branch cost, session by session, and only the
ledger sees every session on a branch, so it decides the path. The display copy
goes where the local copy of the ledger files it (`ledger.py path-for`), which
is as fresh as the last `Stop` hook's fetch, so a session's first commit before
its first `Stop` can take an ordinal the ledger then gives another session; its
next commit moves it. `lib/filing.py` holds the rules.

- **`<YYYY-MM>` is the month of the branch's first filed session**, fixed once
  the branch has a directory, so a branch never splits across months: the trunk
  stays in its first month for good. A branchless row goes under its own month's
  `.no-branch/`, a name git forbids as a ref component.
- **`<N>` is one past the highest ordinal the branch holds**, so a gap is never
  reused, and a branch name reused after deletion continues the old numbering.
- **A row moves only when its session changes branch** — an auto-branch rename,
  an attach — taking the new branch's next ordinal; its old path goes in the
  same commit, on the ledger and on the branch.
- **Every ledger write re-files whatever is not at its place**: a month-only
  path, a duplicate copy, two sessions in one ordinal, one branch under two
  months. That pass is the migration, run by a repository's first write on this
  code, and what folds in the month-only rows a branch without it keeps writing.
  Its steady state lists names and reads no row. A collision keeps the
  earlier-started session in place; a backfill numbers by start time.
- **A month directory does not bound when its rows started**, so readers take
  rows at any depth and filter a period by each row's start. A `report.py` older
  than this layout reads only the files directly under a month and undercounts a
  migrated repository until its checkout updates.

## The totals

**The totals are never written to disk.** They are wholly derived from the rows,
so a file of them committed beside its own sources would be a merge conflict on
every branch that ran a session — and settling one by summing the two sides
double-counts every session both of them saw. The rows themselves never collide:
one file per session id.

**The rows can be.** A row in a shape the ledger no longer writes — a key it
dropped, an estimate comment its parts now carry — is read in the current one. A
tree row is rewritten on disk, named on stderr, an ordinary change to commit; a
ledger row is reshaped in memory only, since writing it back would be a commit
on another branch. So the reader keeps every shape the ledger still holds a row
in.

## What the totals do not cover

- **Each compact, without events.** The transcript records the compaction call
  without its `usage` — the boundary record carries `preTokens`, the summary
  arrives as a `user` record — so only the events price it. One compaction of a
  230k-token context with a warm cache measured about $0.22, most of it output.
- **A rate that changed after a row was written.** Each row records the
  `pricesAsOf` it was priced under and is never re-priced — its transcript is
  usually gone by then — so a table update applies forward only, and `report.py`
  prints the table's age and how many rows were priced under an older one. The
  unpriced-pair error catches a **new** `(model, speed)` pair and is blind to a
  number that changed; the `cost-state` comparison (`costs-report.md`) is what
  covers that.
- **Repositories the token cannot reach.** `--all-my-repos` sees what the `gh`
  user sees, so an organization that enforces SAML SSO is out of reach until the
  token is authorized for it.
