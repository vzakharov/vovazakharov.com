#!/bin/bash
# `Stop` hook: price the session and commit its cost row to the branch.
#
# It runs beside the harness's own `Stop` check — the one that refuses to end a
# turn on an unclean or unpushed tree — rather than around it, because the CLI
# reads the launcher's settings once at startup and never again, so a hook
# registered from this repo cannot displace one the launcher registered.
# Running beside it means racing it for the working tree, which is survivable
# and is what the closing verdict here is for. `.claude/rules/costs.md` carries
# the shape of that race and what it costs.

. "$(dirname "${BASH_SOURCE[0]}")/lib.sh" || exit 0
read_payload
need_command jq "the session's cost row was not written"
need_command node "the session's cost row was not written"

root="$(project_root)"
[ -n "$root" ] && [ -f "$root/costs/prices.json" ] || exit 0

# A row is a branch's to carry. On the trunk there is no branch to carry it, and
# a hook that commits to `main` behind the operator's back is worse than a
# missing row.
branch="$(git -C "$root" branch --show-current 2>/dev/null)"
case "$branch" in '' | main | master) exit 0 ;; esac

# What the run did, which decides whether this hook has anything to say at the
# end. Only the states that touch git can be mistaken for the agent's own work.
state=none

run_ledger() {
  local transcript row
  transcript="$(field transcript_path)"
  [ -n "$transcript" ] && [ -f "$transcript" ] || return 0

  row="$(node "$root/scripts/session-cost.ts" \
    --transcript "$transcript" \
    --session-id "$(field session_id)" \
    --row-path)" || { state=unpriced; return 0; }

  # `status --porcelain`, not `diff HEAD`: the first row of a session is an
  # untracked file, which a diff against HEAD reports as no change at all.
  [ -n "$(git -C "$root" status --porcelain -- "$row" 2>/dev/null)" ] || return 0

  # `commit -- <path>` stages nothing else, so work the agent has in flight
  # stays where it is.
  git -C "$root" add -- "$row" &&
    git -C "$root" commit -q -m "chore: session cost row" -- "$row" ||
    { state=uncommitted; return 0; }

  state=committed
  git -C "$root" push -q origin "$branch" 2>/dev/null && state=pushed
}

run_ledger

# True when the harness's check would refuse this turn: its two conditions, read
# after the row is in. Reading it later than that check did is the point — it
# may have looked while the row was still a working-tree change.
outstanding() {
  [ -n "$(git -C "$root" status --porcelain 2>/dev/null)" ] && return 0
  git -C "$root" rev-parse -q --verify "origin/$branch" >/dev/null 2>&1 || return 1
  [ "$(git -C "$root" rev-list "origin/$branch..HEAD" --count 2>/dev/null || echo 0)" -gt 0 ]
}

case "$state" in
  # Blocking is how a `Stop` hook reaches the agent at all, so it is spent only
  # where a block is already happening — and never on a re-fired `Stop`, which
  # the harness's check bails out of and a hook that can block must bail with,
  # or the two would hold the turn open forever.
  committed | uncommitted | pushed)
    if [ "$(field stop_hook_active)" != "true" ] && outstanding; then
      say "the session's cost row is ${state}. A git check complaining above may be counting it rather than your work: read \`git status\` before acting, push whatever is outstanding, and then just stop — the check passes on the next try and nothing here needs redoing."
      exit 2
    fi
    ;;
  unpriced) say "pricing failed; no cost row written this turn" ;;
esac

exit 0
