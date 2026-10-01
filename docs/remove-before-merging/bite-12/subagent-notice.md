# subagent-notice — hand-over note

**Done.** The context-budget `PostToolUse` hook gives a subagent its own notice
at 170k (`CONTEXT_BUDGET_SUBAGENT`) of its own context, once per climb per
subagent, instead of exiting on `agent_id`. The main session's notices are
unchanged.

- Path: a subagent's call carries `agent_id` and the **parent's**
  `transcript_path` (and `session_id`); the hook reads
  `${transcript_path%.jsonl}/subagents/agent-<agent_id>.jsonl`, falling back to
  a `find` under that `subagents/` directory for a transcript filed one level
  down. Settled from the Claude Code binary's hook-input builder
  (`transcript_path` is the session's, `agent_id` the subagent's) and checked by
  running the hook on this agent's own transcript.
- Every record there is `isSidechain: true`, so the sidechain filter applies to
  the main reading only.
- State: `tmp/context-budget/<session_id>.agent-<agent_id>`.
- Tests: `TheSubagentNotice` in `.claude/context-budget/test_context_budget.py`.

**Left.** Nothing.
