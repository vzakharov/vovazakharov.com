# Postmortem — bite 1 merged into the island branch by accident

**What happened.** At 18:35 UTC on 2026-11-06, commit 686f5174 merged
`island/bite-1-descent` (then at ca2ffc41) into
`claude/world-game-zoltan-syama-hodowq`. Nobody asked for it. Because the bite's
head was now inside its base, GitHub closed the bite's PR #256 as merged, and a
PR GitHub marks merged cannot be reopened.

**Cause.** `git pull` does a fetch and then merges whatever `FETCH_HEAD` names.
`FETCH_HEAD` is one file per checkout, and every `git fetch` in that checkout
overwrites it. The lead's `memo.py wait` was polling the bite branch with a
`git fetch` in the lead's own checkout. At the same moment a `/polish` subagent,
working in that same checkout, ran `git pull --no-rebase` to catch up with its
own branch. The poll's fetch wrote `FETCH_HEAD` between the pull's fetch and its
merge, so the pull merged the bite branch instead of the lead's. The merge
commit, `Merge branch 'island/bite-1-descent' …`, was pushed with nothing to
stop it.

**Three things let it happen, and each one alone would have stopped it:**

1. **The poller wrote `FETCH_HEAD`.** Fixed in 17337b17: `memo.py`'s fetch
   passes `--no-write-fetch-head`, and a test checks that `FETCH_HEAD` survives
   a memo fetch.
2. **The integration step merged a file instead of a named ref.** `git pull`,
   `--ff-only` included, merges whatever `FETCH_HEAD` holds. Checked in a
   scratch repo: with a stray `FETCH_HEAD` naming a descendant branch,
   `git merge --ff-only FETCH_HEAD` reports a clean fast-forward onto that
   branch. `--ff-only` does not protect the lead's branch, because every bite
   branch descends from it. `git fetch origin <b> && git merge origin/<b>` names
   the ref it merges, so a concurrent fetch cannot change what gets merged.
3. **A subagent shared the lead's checkout while a wait was running.** One
   working directory held two writers to `.git`: the poller and the agent.

**Still exposed after 17337b17.** Other code still writes `FETCH_HEAD` in the
session's checkout:

- **The cost ledger's `Stop` hook** (`.claude/costs/lib/ledger_branch.py`)
  fetches `cost-ledger` on every turn, while subagents may be running. A pull
  that races it fails loudly, because `cost-ledger` is an orphan branch and git
  refuses to merge unrelated histories (checked in the same scratch repo).
- **`scripts/floor.py` and `scripts/check-merge.sh`** fetch the base branch. A
  pull that races either of them would quietly merge `main`.

Only item 2 covers all of these, which is why the standing constraint is written
about the pull and not about any particular poller.

**What it cost.** #256 lost its PR identity, so the bite opens a fresh PR at its
tail. Bite 1's early files, its brief and memo, sit in the island branch ahead
of the bite's merge. 686f5174 was left in place rather than reverted: those
files arrive at the bite's merge anyway, and reverting them would drop them from
that merge.

**Prevention.** The standing constraint in
[`../world-game-zoltan-syama.paused.md`](../world-game-zoltan-syama.paused.md) §
"Standing constraints". `.claude/skills/mammoth/notes/subagents.md` carries the
lesson for the future skill.
