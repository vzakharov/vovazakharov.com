#!/bin/bash
# SessionStart hook: point the launcher's `Stop` hook at `stop-session-cost.sh`,
# which does the cost ledger and then runs whatever it displaced.
#
# The launcher writes `~/.claude/launcher-settings.json` fresh at every start and
# resume, so the patch cannot be applied once — it is re-applied here, from the
# repo, every session. The CLI is launched with `--settings` pointing at that
# file and reloads hook edits without a restart, so the patch takes effect in the
# session that applies it.
#
# It refuses rather than guesses: a launcher config whose `Stop` entry is not the
# single-command shape this knows is left exactly as it is, and said so out loud.
# A silent no-op here would look identical to a working ledger right up until the
# month's total came out wrong.

set -uo pipefail

LAUNCHER="${HOME}/.claude/launcher-settings.json"
ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
WRAPPER="${ROOT}/.claude/hooks/stop-session-cost.sh"

# No launcher file is the ordinary local-CLI session: there is no harness hook to
# wrap and nothing to report.
[ -f "$LAUNCHER" ] || exit 0

command -v jq >/dev/null || {
  echo "session-start: jq is unavailable, so the cost ledger's Stop hook was not installed."
  exit 0
}

shape="$(jq -r '
  if (.hooks.Stop | type) != "array" then "no-stop"
  elif (.hooks.Stop | length) != 1 then "many-groups"
  elif (.hooks.Stop[0].hooks | length) != 1 then "many-hooks"
  elif .hooks.Stop[0].hooks[0].type != "command" then "not-command"
  else "single-command" end
' "$LAUNCHER" 2>/dev/null)" || shape="unreadable"

if [ "$shape" != "single-command" ]; then
  echo "session-start: the launcher's Stop hook is ${shape}, not the single command this repo knows how to wrap — ${LAUNCHER} was left untouched and the cost ledger is NOT running. .claude/rules/costs.md says what the patch expects."
  exit 0
fi

existing="$(jq -r '.hooks.Stop[0].hooks[0].command' "$LAUNCHER")"
case "$existing" in "$WRAPPER"*) exit 0 ;; esac

staged="${LAUNCHER}.staged"
jq --arg cmd "$WRAPPER $existing" \
  '.hooks.Stop[0].hooks[0].command = $cmd' "$LAUNCHER" >"$staged" &&
  mv "$staged" "$LAUNCHER" || {
  rm -f "$staged"
  echo "session-start: could not rewrite ${LAUNCHER}; the cost ledger is NOT running."
  exit 0
}

echo "session-start: the cost ledger's Stop hook is installed, wrapping ${existing}."
