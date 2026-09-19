# The API-rate cost ledger

Every session here is billed to a subscription, and the subscription price says
nothing about what the work would cost at Claude API rates. This records that
second number — per session, in the branch — so a month can be totalled. The
point is not accounting; it is knowing the size of the bill before the day
subscription pricing stops being a bargain.

## Where the numbers come from

The transcript at `~/.claude/projects/<cwd-slug>/<session-id>.jsonl` carries a
`message.usage` object on every assistant record. Four facts about it shape
everything below, all verified against this repo's own transcript:

- **One API response writes several records** — one per content block (a
  thinking block, each tool call), each carrying that response's _whole_ usage.
  Summing records triple-counts a turn that thought and called two tools.
  `message.id` is the key to deduplicate on.
- **Price keys on `(model, speed)`.** `usage.speed` is `standard` or `fast`, and
  fast mode doubles Opus 5's rates. The operator cannot switch it on from here
  today, which is a reason to read the field rather than a reason to assume it.
- **Cache writes are priced by TTL.** `usage.cache_creation` splits into
  `ephemeral_5m_input_tokens` and `ephemeral_1h_input_tokens`, billed at ×1.25
  and ×2 of the input rate; reads are ×0.1 (×0.025 on Fable 5.1).
- **Prices are in no machine-readable source**, so the table is hand-written and
  goes stale silently. An unpriced `(model, speed)` therefore fails loudly
  rather than contributing zero.

Subagent responses carry `isSidechain: true` in the same file. They are real
spend and are counted, broken out so the cost of delegation is visible.

## When it runs, and why that is awkward

The `Stop` hook fires when a response finishes and receives `transcript_path` on
stdin — the right moment, and the file is handed over rather than searched for.

Two facts make the naive version wrong:

- **The harness owns a `Stop` hook already.** `~/.claude/stop-hook-git-check.sh`,
  registered in `/root/.claude/launcher-settings.json`, ends the turn with exit 2
  on an unclean or unpushed tree.
- **Hooks for one event run in parallel**, so a second `Stop` hook writing a file
  races that check for the working tree, and loses on the turns where the check
  reads mid-write.

So our work does not run _beside_ the harness check; it runs _before_ it, in the
same process. A wrapper in this repo replaces the launcher's `Stop` command,
does the ledger, then calls the harness script and propagates its exit code and
stderr unchanged. The launcher rewrites its own files at every start and resume
(both were re-laid to the same nanosecond on this session's resume), so the
patch is re-applied by a `SessionStart` hook that lives here.

The wrapper's own failure must never swallow the harness check: the ledger runs
guarded, the harness call is unconditional.

## Parts, in landing order

1. **`costs/prices.json`** — `(model, speed)` → five absolute rates per MTok
   (`input`, `output`, `cache_write_5m`, `cache_write_1h`, `cache_read`), plus
   `as_of` and the source the numbers were read from. Absolute rather than
   multipliers: there is one hand-maintained table either way, and Fable 5.1's
   odd cache-read rate is then just a number rather than an exception.
2. **`scripts/session-cost.ts`** — reads a transcript, deduplicates by
   `message.id`, groups by `(model, speed)` and sidechain flag, prices each
   group, writes `costs/sessions/<YYYY-MM>/<session-id>.json`. Bare Node type
   stripping, no `tsx`, because it runs on every turn. Unknown `(model, speed)`
   exits non-zero naming what it could not price.
3. **`scripts/session-cost.test.ts`** — the pricer is a pure function of its
   input, which is exactly what this repo's suite is for: deduplication, the TTL
   split, the fast-mode rate, sidechain separation, and the loud failure.
4. **`.claude/hooks/stop-session-cost.sh`** — a `Stop` hook beside the harness's
   own: read the payload once (stdin is a pipe), run the ledger guarded, commit
   and push the row, then re-read the two conditions that check refuses a turn
   over and say one line about the row when they hold.
5. **Registration and prose** — the hook into `.claude/settings.json`, one
   line for `costs/` in CLAUDE.md § "Repository layout", and
   `.claude/rules/costs.md` for the mechanism, which is load-bearing and
   entirely non-obvious from the files themselves.
6. **`pnpm costs`** — the monthly rollup over `costs/sessions/**`, which is what
   the whole thing is for.

## DRY notes

- **The pricer is genuinely shared** and lives once, in `scripts/session-cost.ts`:
  the `Stop` hook prices one session, the rollup prices many, and a second copy
  of the TTL arithmetic is exactly the drift this repo's type-overlap gate exists
  to catch in types.
- **The new hook reuses `.claude/hooks/lib.sh`** (`read_payload`, `field`,
  `say`, `need_command`) rather than re-rolling the payload read. Its
  `emit_context` is `UserPromptSubmit`-shaped, so the `Stop` hook reports
  through `say` instead of growing a second emitter for one caller.
- **The price table is not derived from anything**, which looks like a violation
  of "derive types from the source of truth" and is not: there is no source of
  truth to derive from. The TypeScript type for a rate set _is_ derived from the
  parsed table, so the two cannot drift.

## Accepted costs, and one hole

- **A push per turn.** The row is committed and pushed by the same hook that
  writes it, because the harness check refuses to end a turn on unpushed
  commits. Dozens of small commits per branch, which the squash collapses.
- **The last turn of a session is undercounted.** The transcript is written
  asynchronously and may lag the in-memory conversation, so each run rewrites
  the row from the whole file rather than appending a delta — turn N's run picks
  up turn N−1's tail. Only the final turn has no successor to correct it.
- **An abandoned branch never reaches the total.** Rows land on `main` by merge,
  so work that is thrown away is also thrown out of the ledger — and that
  undercount is biased, not random, since abandoned branches are exactly where
  spend happens without a deliverable. Named here rather than solved: the fix is
  a ledger branch pushed independently of the PR, which costs more machinery than
  the distortion currently justifies.
- **This repository only.** The transcript directory is keyed by working
  directory, so this totals work on this repo. The cross-repo month the operator
  actually wants needs a home outside any one repository; the pieces here are
  written to travel (`/spinoff`, `/update-muthur`) rather than to be rewritten
  there.

## Dogfooding

The hook is registered in this repo's own `.claude/settings.json`, which the CLI
does watch, so it takes effect in the session that adds it. What proved that it
had to be registered there was a probe: a timestamp written at the top of the
wrapper, before any condition could skip it, and an empty file after the turn.
Displacing the launcher's `Stop` command leaves a patched file nobody reads.
