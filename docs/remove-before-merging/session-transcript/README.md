# Session transcript — raw data for the handling agent

The Claude Code session that built this branch, committed here so a later
session (which runs in a fresh container without `~/.claude/`) can read the raw
data behind the branch's decisions. **Remove before merging** — this whole
directory is swept at squash.

- `a3be30ae-…​.jsonl` — the transcript, one JSON record per line. One API
  response is written as several records (one per content block), each carrying
  that response's whole `usage`; the operator's messages, the agent's replies,
  and every tool call and result are all in here.
- `a3be30ae-…/tool-results/toolu_*.txt` — a tool result too large to inline,
  referenced from the transcript by the `toolu_` id in its filename.

Read a specific turn with `jq -c 'select(.type=="user" or .type=="assistant")'`
over the `.jsonl`, or grep for a phrase and widen from the matching line.
