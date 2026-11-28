---
description: What a cost row's orientation measures — the mark that ends it, what counts as acting, how re-reads after a compaction are priced, and what the measure misses
paths:
  - .claude/costs/lib/orientation.py
  - .claude/costs/oriented.py
  - .claude/costs/hooks/estimate-notice.sh
  - .claude/costs/test_oriented.py
  - .claude/costs/test_estimate_notice.py
---

# Orientation

Part of the cost ledger, `.claude/costs/CLAUDE.md`; paths below are relative to
`.claude/costs/`.

A row's `orientation` is what the session spent finding its bearings — until it
**marks** them found or first **acts**, whichever comes first — and each of its
`compactions` carries the same measure from that boundary on, plus the re-reads
the summary forced. They feed the call on whether a fresh session or a compact
is the cheaper way to shed context. `lib/orientation.py` holds the definitions.

- **Marking is a Bash call running `python3 .claude/costs/oriented.py` bare**,
  which `hooks/estimate-notice.sh` asks for until the stretch has one. Knowing
  what is what comes before the first edit or answer — a session tracing callers
  before it changes anything is already working — and only the agent can tell
  when. A subagent's mark is its own bearings, not the session's.
  - **A Haiku session is never asked** (`UNMARKED_MODELS`). Asked, it marks on
    its first response, before anything is read, so the phase measures nothing:
    a `/relay take` session then prices its own reorientation at $0 and the
    context budget's warning line comes too early, as if a handoff were free.
    The model is the session's latest `model` attachment or main-chain response,
    so a compaction and a mid-session switch are read alike; a transcript with
    neither is asked.
- **Acting is a write into the repository or a handover to the operator**: an
  `Edit`, `Write` or `NotebookEdit` under the directory the session started in
  and outside its `tmp/`, an `AskUserQuestion` or `ExitPlanMode`, or the
  session's own `end_turn`. A scratch write is how an agent finds its bearings,
  not what it does with them. A subagent's `end_turn` only hands its result back
  to whoever spawned it, but a subagent's edit counts: delegated work is still
  the session starting work. `endedBy` says which ended it, `oriented` for the
  mark, so the report shows how often agents mark.
- **The ending response is left out of the spend**, since its output is the
  mark, the edit or the answer itself.
- **Timestamps order the responses, not file position**, because a subagent's
  spend sits in another file and its clock is what places it against the main
  file's.
- **Each phase stops at the next boundary**, so no response is counted in two.
- **A re-read is an exact repeat of a call made before the latest boundary** — a
  `Read` of the same path and range with no write to it since, or a `Grep`,
  `Glob` or `Bash` with the same input bar its `description` — counted once per
  boundary. Only the session's own calls count: a subagent starts with no
  context the summary could have dropped. The estimate is an estimate because a
  tool result has no `usage`: its tokens are its share, by characters, of the
  cache write of the response it arrived in, and its dollars that write plus a
  cache read on every later response before the next boundary.

**What it misses.** The mark is the agent's word: one made early or late moves
the phase with it, and a forgotten one leaves the phase to end at acting, later
than it did. An edit made through `Bash` is not seen as acting, so such a
session's orientation runs long unless it marks. Re-reads are a floor: a hole
read around — a `cat` after a `Read`, a narrower grep — or one that shows as a
wrong turn goes uncounted, while a repeat that was simply due, a `git status`
before each commit, counts; `byTool` is what lets `Bash` be read apart. The
compaction call itself has no `usage` to price. A resume in a fresh container
reloads the transcript with no boundary to restart at, so what it spends getting
its bearings lands in the work.
