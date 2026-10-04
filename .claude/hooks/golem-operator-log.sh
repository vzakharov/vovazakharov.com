#!/bin/bash
# `UserPromptSubmit` and `Stop` hook: the chat half of a `/golem` run's operator
# log — the operator's prompt as it arrives, and the run's reply to it.
# `.claude/skills/golem/operator.md` § "The operator log" says what the log is
# for; `scripts/golem-log-pr.sh` writes its PR half.
#
# Usage:
#   golem-operator-log.sh               as a hook, the event read off the payload
#   golem-operator-log.sh path <root>   print the live log's path, or nothing
#   golem-operator-log.sh flush <root>  move pending replies into the log
#
# **The live log** is `docs/plans/<slug>/operator-log.md` for a slug with no
# `docs/plans/<slug>.completed.md` beside it. A session with none is not a run,
# and that check is all it pays; two live logs are ambiguous, so nothing is
# written and stderr says so. `path` is the rule's one home.
#
# **An entry** is a bold line saying who, when and, for the operator, which
# session, then the text blockquoted: the quote is lossless, and it keeps a `## `
# inside a message from opening a section in a log read by its `## Bite N`
# headings. Entries go at the end of the file; the bite's start writes the
# headings.
#
# **Skipped**, with the reply to it: a subagent's prompt, and a prompt that opens
# with a tag in `INJECTED` — the harness's own, and `<golem-check-in>`, which
# opens every check-in the run schedules (`send_later`, a Routine). A scheduled
# message arrives as plain text: its origin is stamped on the transcript record,
# never on the hook's payload, so the run's tag is the one mark the hook can read.
#
# **The reply waits in `tmp/` until the next prompt** (or a `flush`), because
# the harness's own `Stop` check refuses to end a turn on a tree with uncommitted
# changes: a reply appended at `Stop` would cost every turn of a run one more
# round trip just to commit it. The prompt goes in on the spot, and the session's
# own commits carry it. A logged prompt leaves `<session>.prompt` in the state
# directory, and only a turn that opened on one queues its reply, as
# `<session>.reply`. A `Stop` re-fired after another hook's block is skipped: the
# turn's answer is the first stop's, and what follows is about the block.
#
# Nothing here commits. Off a run it never says anything; on one a failure is
# stderr and exit 1, which shows the operator the line without blocking the turn.

set -uo pipefail

. "$(dirname "${BASH_SOURCE[0]}")/lib.sh" || exit 0

INJECTED='task-notification|wake|webhook-payload|child-session-event|cross-session-message|teammate-message|golem-check-in'

STATE='tmp/golem-operator-log'

# The live log's path, or nothing; status 1 only when it is ambiguous.
find_log() {
  local root=$1 log slug found=()
  for log in "$root"/docs/plans/*/operator-log.md; do
    [ -f "$log" ] || continue
    slug="$(basename "$(dirname "$log")")"
    [ -f "$root/docs/plans/$slug.completed.md" ] || found+=("$log")
  done
  case ${#found[@]} in
  0) return 0 ;;
  1) printf '%s\n' "${found[0]}" ;;
  *)
    say "several live operator logs (${found[*]#"$root/"}); logging to none of them"
    return 1
    ;;
  esac
}

# One entry, ready to append: `**<who>** · <rest>`, then the text quoted.
entry() {
  printf '\n**%s** · %s\n\n' "$1" "$2"
  sed 's/^/> /; s/^> $/>/' <<<"$3"
}

# Pending replies in the order they were queued, appended and then removed.
flush() {
  local dir="$1/$STATE" log=$2 name
  [ -d "$dir" ] || return 0
  # Names are session ids, which the hook path admits only from a safe set.
  while IFS= read -r name; do
    cat -- "$dir/$name" >>"$log" && rm -f -- "$dir/$name" ||
      { say "could not move the pending replies into $log"; return 1; }
  done < <(ls -1tr -- "$dir" | grep '\.reply$')
}

case "${1:-}" in
path)
  find_log "${2:-.}" || exit 1
  exit 0
  ;;
flush)
  log="$(find_log "${2:-.}")" || exit 1
  [ -z "$log" ] || flush "${2:-.}" "$log" || exit 1
  exit 0
  ;;
esac

read_payload

# `project_root` reads the payload's `cwd` only when the project directory is
# unset, so a session that is not a run needs no `jq` to learn it.
root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || {
  need_command jq "the operator log cannot be found."
  root="$(project_root)"
}
[ -n "$root" ] || exit 0
log="$(find_log "$root")" || exit 1
[ -n "$log" ] || exit 0

need_command jq "the operator log misses this turn."
[ -z "$(field agent_id)" ] || exit 0

session="$(field session_id)"
case "$session" in
'' | *[!A-Za-z0-9_-]*)
  say "no usable session id in the payload; the operator log misses this turn"
  exit 1
  ;;
esac
state="$root/$STATE"
mkdir -p -- "$state" || { say "could not create $state"; exit 1; }

now() { date -u +%Y-%m-%dT%H:%M:%SZ; }

session_link() {
  local url
  url="$(session_url)"
  if [ -n "$url" ]; then
    printf '[session](%s)' "$url"
  else
    printf 'local session `%s`' "$session"
  fi
}

# The turn's last assistant text, for a build whose `Stop` payload lacks
# `last_assistant_message`. A line that does not parse is passed over.
reply_from_transcript() {
  local transcript
  transcript="$(field transcript_path)"
  [ -n "$transcript" ] && [ -f "$transcript" ] || return 0
  jq -nr '[inputs | fromjson? | select(.type? == "assistant") | .message.content
    | if type == "array" then [.[] | select(.type? == "text") | .text] | join("\n\n")
      else (. // "") end
    | select(length > 0)] | last // empty' -R "$transcript"
}

case "$(field hook_event_name)" in
UserPromptSubmit)
  flush "$root" "$log" || exit 1
  prompt="$(field prompt)"
  injected="^[[:space:]]*<($INJECTED)([[:space:]>]|$)"
  if [ -z "$prompt" ] || [[ "$prompt" =~ $injected ]]; then
    rm -f -- "$state/$session.prompt"
    exit 0
  fi
  entry Operator "$(now) · $(session_link)" "$prompt" >>"$log" &&
    : >"$state/$session.prompt" ||
    { say "could not append the prompt to $log"; exit 1; }
  ;;
Stop)
  [ "$(field stop_hook_active)" != true ] || exit 0
  [ -f "$state/$session.prompt" ] || exit 0
  rm -f -- "$state/$session.prompt"
  reply="$(field last_assistant_message)"
  [ -n "$reply" ] || reply="$(reply_from_transcript)"
  [ -n "$reply" ] || exit 0
  entry Run "$(now)" "$reply" >>"$state/$session.reply" ||
    { say "could not queue the reply for $log"; exit 1; }
  ;;
esac

exit 0
