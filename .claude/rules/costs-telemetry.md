---
description: The cost ledger's telemetry receiver — what Claude Code's api_request events add to a row, what they cannot, and why the environment rather than the repository switches the export on
paths:
  - .claude/costs/hooks/start-telemetry-receiver.sh
  - .claude/costs/hooks/telemetry_receiver.py
  - .claude/costs/lib/billed.py
  - .claude/costs/test_telemetry.py
  - .claude/costs/test_billed.py
---

# Telemetry

Part of the cost ledger, `.claude/costs/CLAUDE.md`; paths below are relative to
`.claude/costs/`.

`hooks/start-telemetry-receiver.sh` starts a receiver on `127.0.0.1:4318` at
`SessionStart`, and each `api_request` event Claude Code exports to it lands in
`tmp/telemetry/<session-id>.jsonl`, stripped to its numbers and a few named
fields. `lib/billed.py` joins them to the priced responses by request id.

**The events' worth is the calls the transcript never records.** Where a
response and its event are both there, the table and the event price it alike
once the event's output count stands in for the record's, so the response keeps
the table's price and the event checks it; the row warns when the two drift
apart. An event no response matches is such a call — a prompt suggestion, a
compaction — and goes into `total` and `byRate` at the event's price, and into
`telemetry.unseen` by its `query_source`, which takes values the documentation
does not list (`sdk` for a web session's main thread, `prompt_suggestion`,
`compact`). A compaction's `billedUsd` is the `compact`-tagged call nearest its
boundary. An event does not split its cache write by TTL, so an unseen call's
write is filed under the 5-minute tokens. Events are only as complete as the
receiver's uptime: what Claude Code sent before it started, or after the row was
written, is in no row. The hook also runs after every tool call and starts a
receiver that is missing. That covers a session that checked out a branch
carrying the hook, which registers it with `SessionStart` already past, and a
receiver that died.

**The export is the environment's to switch on, never the repository's.** Claude
Code ignores its OpenTelemetry exporter variables in a project's
`.claude/settings.json` (code.claude.com/docs/en/env-vars), reading them only
from the process environment, user settings and managed settings — so, in a web
session, the cloud environment's own variables. Where they do not point at the
receiver, the hook starts nothing and prints a notice naming them; its list is
the one home of what to set. Claude Code strips `OTEL_*` from every process it
spawns, so the hook reads them from the `claude` process's own environment.
`NO_PROXY` stays off it: the environment's own list already exempts `127.0.0.1`,
and a value set beside the others replaces it.
