#!/bin/bash
# `PostToolUse` hook: tell the agent when the context its session carries
# crosses the warn line and again at the pause line, once per climb — or, on a
# subagent's tool call, tell that subagent once when its own context crosses the
# subagent line. `.claude/context-budget/CLAUDE.md` carries what the reading is
# and why it is taken here; the procedure the main notices point at is `/go`'s.

. "$(dirname "${BASH_SOURCE[0]}")/../../hooks/lib.sh" || exit 0
read_payload
need_command jq "no context-budget reading this tool call."

warn="${CONTEXT_BUDGET_WARN:-200000}"
pause="${CONTEXT_BUDGET_PAUSE:-300000}"
subagent_line="${CONTEXT_BUDGET_SUBAGENT:-170000}"
[[ "$warn" =~ ^[0-9]+$ && "$pause" =~ ^[0-9]+$ && "$subagent_line" =~ ^[0-9]+$ ]] || {
  say "CONTEXT_BUDGET_WARN / CONTEXT_BUDGET_PAUSE / CONTEXT_BUDGET_SUBAGENT must be whole token counts; no reading taken."
  exit 0
}

root="$(project_root)"
transcript="$(field transcript_path)"
session="$(field session_id)"
agent="$(field agent_id)"
[ -n "$root" ] && [ -n "$transcript" ] || exit 0
case "$session" in '' | */* | .*) exit 0 ;; esac

state_dir="$root/tmp/context-budget"
state_file="$state_dir/$session"
floor="$warn"
if [ -n "$agent" ]; then
  [[ "$agent" =~ ^[A-Za-z0-9_-]+$ ]] || exit 0
  # A subagent's call carries the parent session's `transcript_path`; its own
  # transcript sits beside it, in `<session>/subagents/`, or one directory
  # further down for a subagent the harness files under a subdirectory.
  subagents="${transcript%.jsonl}/subagents"
  transcript="$subagents/agent-$agent.jsonl"
  [ -f "$transcript" ] || transcript="$(find "$subagents" -name "agent-$agent.jsonl" -print -quit 2>/dev/null)"
  state_file="$state_file.agent-$agent"
  floor="$subagent_line"
fi
[ -f "$transcript" ] || exit 0

# Read from the end: the transcript runs to megabytes and this runs on every tool
# call. `first` stops jq at the first match, which is also why there is no
# `pipefail` here — `tac` dying of the closed pipe is the intended exit. Every
# record in a subagent's own transcript is a sidechain one, so the sidechain
# filter applies to the main session's alone.
reading="$(tac "$transcript" | grep -F '"type":"assistant"' | jq -rn --argjson subagent "$([ -n "$agent" ] && echo true || echo false)" '
  first(
    inputs
    | select(.type == "assistant" and ($subagent or (.isSidechain | not)))
    | select(.message.model != "<synthetic>")
    | .message.usage // empty
    | (.input_tokens // 0) + (.cache_read_input_tokens // 0) + (.cache_creation_input_tokens // 0)
  )' 2>/dev/null)"
[[ "$reading" =~ ^[0-9]+$ ]] || exit 0

# Under the first line again means a compact landed, which re-arms the notices.
if [ "$reading" -lt "$floor" ]; then
  rm -f "$state_file"
  exit 0
fi

if [ -n "$agent" ]; then
  level=report
else
  level=warn
  [ "$reading" -lt "$pause" ] || level=pause
fi
announced="$(cat "$state_file" 2>/dev/null)"
case "$announced:$level" in pause:* | warn:warn | report:report) exit 0 ;; esac

# No record of the notice means it would fire again on every tool call after
# this one, so a notice that cannot be recorded is not sent.
mkdir -p "$state_dir" && printf '%s\n' "$level" >"$state_file" || {
  say "cannot write $state_file; context-budget notice withheld."
  exit 0
}

k() { echo "$(($1 / 1000))k"; }
past() { echo "Context budget: this session is carrying ~$(k "$reading") tokens of context, past the $(k "$1") $2 line."; }
stopping='`@.claude/skills/go/SKILL.md` § "Stopping partway releases the plan" — which also covers work that has no plan yet'
finish=100000
nearly_done() { echo "First judge whether the work is nearly done — the open bite, when the plan has a \`## This bite\` section: by your own estimate, under ~$(k "$finish") more tokens of context to finish$1. If it is, finish it, and say in your report that you did and why rather than stopping."; }

case "$level" in
  warn)
    notice="$(past "$warn" warning)

$(nearly_done " — roughly, less than half of what this session has already carried")

Otherwise get the work to a committed, pushed stopping point and tell the operator, offering two ways on: \`/compact\` in this session, or \`/relay\` to a new one (\`@.claude/skills/relay/SKILL.md\`), which writes a summary of this session for its successor and releases the plan first per ${stopping}. Do neither unasked at this level: at $(k "$pause") this notice returns as the pause itself."
    ;;
  pause)
    notice="$(past "$pause" pause)

$(nearly_done "")

Otherwise pause now, without asking: follow ${stopping}. Push, tell the operator the session was paused for its context budget, and end the turn with the \`/go <branch>\` handoff block."
    ;;
  report)
    notice="Context budget: you are a subagent, and your own context is carrying ~$(k "$reading") tokens, past the $(k "$subagent_line") line where a subagent stops.

Wrap up now: commit and push what passes, bring your hand-over note current if your brief keeps one — what is done, what is left — and report to your caller. Do not touch the plan file: pausing or releasing the plan belongs to the session that holds it, not to you. Your caller can continue from your report with a fresh agent."
    ;;
esac

emit_context "$notice"
