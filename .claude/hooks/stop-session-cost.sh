#!/bin/bash
# The `Stop` hook the launcher config is repointed at by `patch-launcher-hooks.sh`.
# Prices the session and commits the row, then runs the command it displaced —
# passed as its arguments — and exits with its status.
#
# Wrapping rather than sitting beside it is the whole point: hooks for one event
# run in parallel, so a second `Stop` hook writing to the working tree races the
# harness's own check of that tree. In here the two are sequential.
#
# Two contracts hold whatever else changes:
#   - the wrapped command runs even when everything above it failed, because it
#     is a safety check this repo borrowed rather than owns;
#   - its exit status and stderr reach the harness unaltered, because that is
#     how it ends a turn.

# The displaced command arrives unquoted, as however many words it was written
# with, so that a leading `~` in it is still a tilde when `sh -c` sees it.
wrapped="$*"
payload="$(cat)"

run_ledger() {
  . "$(dirname "${BASH_SOURCE[0]}")/lib.sh" || return 0
  command -v jq >/dev/null || return 0
  command -v node >/dev/null || return 0

  local transcript root branch row
  transcript="$(field transcript_path)"
  root="${CLAUDE_PROJECT_DIR:-$(field cwd)}"
  [ -n "$transcript" ] && [ -f "$transcript" ] || return 0
  [ -n "$root" ] && [ -f "$root/costs/prices.json" ] || return 0

  # A row is a branch's to carry. On the trunk there is no branch to carry it,
  # and a hook that commits to `main` behind the operator's back is worse than a
  # missing row.
  branch="$(git -C "$root" branch --show-current 2>/dev/null)" || return 0
  case "$branch" in '' | main | master) return 0 ;; esac

  row="$(node "$root/scripts/session-cost.ts" \
    --transcript "$transcript" \
    --session-id "$(field session_id)" \
    --row-path)" || { say "pricing failed; row not written"; return 0; }

  git -C "$root" diff --quiet HEAD -- "$row" 2>/dev/null && return 0
  # `commit -- <path>` stages nothing else, so work the agent has in flight
  # stays where it is.
  git -C "$root" add -- "$row" || return 0
  git -C "$root" commit -q -m "chore: session cost row" -- "$row" || return 0
  git -C "$root" push -q origin "$branch" 2>/dev/null ||
    say "row committed but not pushed; the wrapped check will say so"
}

run_ledger

[ -n "$wrapped" ] || exit 0
printf '%s' "$payload" | sh -c "$wrapped"
exit $?
