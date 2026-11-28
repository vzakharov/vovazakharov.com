---
description: How the cost ledger's Stop hook runs beside the harness's own Stop check — why a row left in the tree is put back, how the hook waits the check out, and when it blocks the stop
paths:
  - .claude/costs/hooks/stop-session-cost.sh
  - .claude/costs/test_stop_hook.py
---

# Running beside the harness's Stop check

Part of the cost ledger, `.claude/costs/CLAUDE.md`; paths below are relative to
`.claude/costs/`.

The harness registers its own `Stop` hook in `~/.claude/launcher-settings.json`
— `stop-hook-git-check.sh`, which ends a turn with exit 2 on a tree that is
unclean, holds untracked files, or is ahead of its remote. **Hooks for one event
run in parallel**, so whatever `hooks/stop-session-cost.sh` does to the tree is
done while that check may be reading it.

**The hook leaves the branch alone and the tree clean.** It prices the row into
`tmp/` and writes it to the ledger only. A copy of the session's row it finds
differing from `HEAD` is one no commit took — staged by
`hooks/stage-cost-row.sh` for a commit that left it out (`git commit -- <path>`,
a failed commit, a command that only mentioned one), along with the removal of
the copy it moved from, or written by a hand run of `session_cost.py` — and each
goes back to `HEAD`'s copy, or out of the index and tree where `HEAD` has none.
Nothing is lost: the ledger holds the turn's row, and the next commit stages a
fresh one.

**It waits the check out before that put-back.** That check leaves nothing on
disk — it reads the tree and writes to stderr — so its process is the only thing
there is to wait on, and the hook polls for it by name at the last moment before
anything it does can touch the tree, which is after the ledger write: that
touches no file in it. A match that is an **ancestor** of the hook is not the
check: the check is a sibling, and an ancestor carrying the name is a shell that
merely mentions it, so waiting on one would outlast the turn.

**A row the check read before the put-back is named to the agent**: where it was
all that kept the tree unclean, the hook exits 2 with one line saying so — the
only channel a `Stop` hook has to the agent, spent solely where the check's own
exit 2 is already continuing the turn. A put-back that fails exits 2 too, with
the commands that do it by hand. It bails on a re-fired `Stop`
(`stop_hook_active`) exactly as the harness's check does: two hooks that can
both block and neither bail would hold the turn open forever.

**A turn that cannot be priced blocks the stop once**, with the pricing error's
last line — the missing `(model, speed)` pair, as a row to add to `prices.json`.
Anything quieter loses the session from the ledger without anyone knowing. The
same `stop_hook_active` bail applies, and the next turn's row prices the whole
transcript, so nothing is lost by stopping.

**The arrangement is read from the launcher's config, not assumed.** All of the
above holds only while `~/.claude/launcher-settings.json` registers that check;
a harness that renames or drops it leaves this hook waiting on a process that
never runs, and every paragraph here describing a race that is over. So the hook
reads that registration each turn and writes to stderr when the entry is gone:
adjusting quietly is what would leave the rest of this file false.
