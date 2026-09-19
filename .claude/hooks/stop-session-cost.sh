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

# Every git call here is against the project root rather than whichever
# directory the hook was spawned in.
repo() { git -C "$root" "$@"; }

# `status --porcelain`, not `diff HEAD`: a session's first row is an untracked
# file, which a diff against HEAD reports as no change at all. Bare, it asks the
# same of the whole tree.
dirty() { [ -n "$(repo status --porcelain -- "$@" 2>/dev/null)" ]; }

# A row is a branch's to carry. On the trunk there is no branch to carry it, and
# a hook that commits to `main` behind the operator's back is worse than a
# missing row.
branch="$(repo branch --show-current 2>/dev/null)"
case "$branch" in '' | main | master) exit 0 ;; esac
upstream="origin/$branch"

# The harness's check leaves nothing on disk — it reads the tree and writes to
# stderr — so the only way to let it finish first is to watch for its process.
# Its script is the other thing it leaves: absent, there is no check to wait for
# and this is an ordinary local session. Every way this can fail (no `pgrep`, a
# renamed script, a look that lands before the process is spawned, a check that
# hangs) falls back to racing it, which is what the closing verdict covers.
harness_check="${HOME}/.claude/stop-hook-git-check.sh"

# The processes this hook runs under. The check is a sibling of this hook, never
# an ancestor, so an ancestor carrying its name in a command line is something
# that merely mentions it — a shell invoking it, a test driving it — and waiting
# on one would outlast the turn.
ancestry() {
  local pid=$$
  while [ "${pid:-0}" -gt 1 ]; do
    printf ' %s' "$pid"
    pid="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d '[:space:]')"
  done
  printf ' '
}

ancestors=''

harness_check_running() {
  local hit
  for hit in $(pgrep -f stop-hook-git-check 2>/dev/null); do
    case "$ancestors" in *" $hit "*) ;; *) return 0 ;; esac
  done
  return 1
}

wait_out_harness_check() {
  [ -f "$harness_check" ] || return 0
  command -v pgrep >/dev/null && command -v ps >/dev/null || return 0

  local waited=0 seen=no
  ancestors="$(ancestry)"
  while harness_check_running; do
    seen=yes
    sleep 0.05
    waited=$((waited + 1))
    [ "$waited" -lt 100 ] || {
      say "the harness's Stop check has run for 5s; writing the row without waiting for it"
      return 0
    }
  done

  # TEMPORARY — remove once it has answered whether the look lands while the
  # check is still running, which is the whole of whether this wait does
  # anything. `seen=no` on every turn means it does not.
  mkdir -p "$root/tmp" &&
    printf '%s seen=%s waited=%sms\n' "$(date -u +%FT%TZ)" "$seen" \
      "$((waited * 50))" >>"$root/tmp/harness-check-wait.log"
}

# What the run did, which decides whether this hook has anything to say at the
# end. Only the states that touch git can be mistaken for the agent's own work.
state=none

run_ledger() {
  local transcript row
  transcript="$(field transcript_path)"
  [ -n "$transcript" ] && [ -f "$transcript" ] || return 0

  # Nothing above this line touches the working tree, so this is the last moment
  # the check can be let past — and the latest one, which is what makes the look
  # for its process land after that process exists.
  wait_out_harness_check

  row="$(node "$root/scripts/session-cost.ts" \
    --transcript "$transcript" \
    --session-id "$(field session_id)" \
    --row-path)" || { state=unpriced; return 0; }

  dirty "$row" || return 0

  # `commit -- <path>` stages nothing else, so work the agent has in flight
  # stays where it is.
  repo add -- "$row" &&
    repo commit -q -m "chore: session cost row" -- "$row" ||
    { state=uncommitted; return 0; }

  state=committed
  repo push -q origin "$branch" 2>/dev/null && state=pushed
}

run_ledger

# True when the harness's check would refuse this turn: its two conditions, read
# after the row is in. Reading it later than that check did is the point — it
# may have looked while the row was still a working-tree change.
outstanding() {
  dirty && return 0
  repo rev-parse -q --verify "$upstream" >/dev/null 2>&1 || return 1
  [ "$(repo rev-list "$upstream..HEAD" --count 2>/dev/null || echo 0)" -gt 0 ]
}

case "$state" in
  # Blocking is how a `Stop` hook reaches the agent at all, so it is spent only
  # where a block is already happening — and never on a re-fired `Stop`, which
  # the harness's check bails out of and a hook that can block must bail with,
  # or the two would hold the turn open forever.
  committed | uncommitted | pushed)
    if [ "$(field stop_hook_active)" != "true" ] && outstanding; then
      case "$state" in
        pushed) did="committed and pushed" ;;
        committed) did="committed but not pushed" ;;
        *) did="written but not committed" ;;
      esac
      say "this session's cost row is ${did}. A git check complaining above may be counting it rather than your work: read \`git status\` before acting, push whatever is outstanding, and then just stop — the check passes on the next try and nothing here needs redoing."
      exit 2
    fi
    ;;
  unpriced) say "pricing failed; no cost row written this turn" ;;
esac

exit 0
