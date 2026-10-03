#!/bin/bash
# Commit and push this session's cost row now, whoever started the turn: the run
# a session makes before its last turn, which an agent often starts and the
# `Stop` hook then skips. `.claude/costs/CLAUDE.md` § "When a row is committed".
#
# Exits 0 once the row is on origin, and otherwise says what is outstanding.

set -o pipefail
say() { echo "flush-row.sh: $*" >&2; }

session="${CLAUDE_CODE_SESSION_ID:-}"
[ -n "$session" ] || { say "CLAUDE_CODE_SESSION_ID is not set, so there is no session to flush"; exit 1; }

shopt -s nullglob
transcripts=("$HOME"/.claude/projects/*/"$session".jsonl)
[ "${#transcripts[@]}" -eq 1 ] || {
  say "expected one transcript for session $session under ~/.claude/projects, found ${#transcripts[@]}"
  exit 1
}

root="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)" || exit 1

jq -n --arg session "$session" --arg transcript "${transcripts[0]}" --arg cwd "$root" '{
  hook_event_name: "Stop",
  session_id: $session,
  transcript_path: $transcript,
  cwd: $cwd,
  stop_hook_active: false
}' | CLAUDE_PROJECT_DIR="$root" "$root/.claude/costs/hooks/stop-session-cost.sh" --flush
