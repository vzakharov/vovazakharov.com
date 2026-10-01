# The context budget hook

`hooks/post-tool-context-budget.sh` tells the agent when its session's context
crosses 200k tokens (a warning) and 300k (the pause), so work is left resumable
before a compact or a dead session takes the choice away. What the agent does on
each notice is `@.claude/skills/go/SKILL.md` § "Stopping partway releases the
plan".

- **`PostToolUse`, not `UserPromptSubmit`.** The lines are crossed mid-turn, in
  the long autonomous stretches where no operator prompt arrives to fire on.
  `PostToolUse` fires after every tool call and its `additionalContext` reaches
  the model before its next step.
- **The reading is what the last request sent**: the last main-chain assistant
  record's `input_tokens + cache_read_input_tokens + cache_creation_input_tokens`.
  `output_tokens` is left out — the next request carries it, and the next
  reading counts it then. A session starts at around 100k (system prompt, tools,
  `CLAUDE.md`), so the warning line is about one baseline of work away.
- **The main chain only**, for the session's reading: `isSidechain` records are
  skipped, as is the `<synthetic>` placeholder Claude Code writes for a turn no
  model served — whose zeroed usage would read as a compact and re-arm the
  notices.
- **A subagent gets its own notice, read off its own transcript.** Its tool call
  carries `agent_id` but the parent's `transcript_path`; its own is
  `<transcript_path minus .jsonl>/subagents/agent-<agent_id>.jsonl`, where every
  record is a sidechain one. At 170k it is told to commit what passes, bring its
  hand-over note current and report — never to pause the plan, which would
  release it while its parent works on.
- **Each notice fires once per climb.** `tmp/context-budget/<session_id>` holds
  the highest level announced, `<session_id>.agent-<agent_id>` a subagent's; a
  reading back under the first line clears it, so a compact re-arms the notices.
  A notice that cannot be recorded is not sent, since it would otherwise repeat
  on every tool call.
- **Anything unreadable is silence**, never an error: a missing notice costs a
  warning, a hook failing on every tool call costs the session.

`CONTEXT_BUDGET_WARN`, `CONTEXT_BUDGET_PAUSE` and `CONTEXT_BUDGET_SUBAGENT`
override the three lines, in tokens — set them in `.claude/settings.local.json`'s `env` to tune without
editing a tracked file.
