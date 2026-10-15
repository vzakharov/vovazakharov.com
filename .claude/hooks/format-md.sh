#!/bin/bash
# PostToolUse hook on Edit|Write|MultiEdit: run the project's prettier over the
# Markdown file the tool just touched, so a session never leaves a paragraph on
# one physical line for `pnpm format:check` to find at the vet run.
#
# `.prettierrc.json` decides which Markdown is hard-wrapped and
# `.prettierignore` which is left alone, so this hook carries no list of its
# own. Markdown outside the project is skipped: a draft in the scratchpad is
# likely bound for GitHub, which renders its newlines as line breaks. Claude
# Code reports the rewrite to the agent as a change on disk, so its next edit
# starts from the wrapped text.
#
# A prettier failure exits 2 with prettier's message, which Claude Code shows
# the agent: an edit that went through unformatted in silence would surface
# only at the vet run, far from the edit that caused it.

set -euo pipefail

. "$(dirname "${BASH_SOURCE[0]}")/lib.sh" || exit 0

need_command jq "skipping the Markdown wrap."
read_payload

path="$(jq -r '.tool_input.file_path // empty' <<<"$payload")"
case "$path" in
  *.md | *.md.staged) ;;
  *) exit 0 ;;
esac

root="$(project_root)"
[ -n "$root" ] || exit 0
case "$path" in
  "$root"/*) ;;
  *) exit 0 ;;
esac
[ -f "$path" ] || exit 0

prettier="$root/node_modules/.bin/prettier"
if [ ! -x "$prettier" ]; then
  say "no prettier under node_modules yet; skipping the Markdown wrap."
  exit 0
fi

if ! out="$(cd "$root" && "$prettier" --write --log-level warn "$path" 2>&1)"; then
  say "prettier could not format $path:"$'\n'"$out"
  exit 2
fi
