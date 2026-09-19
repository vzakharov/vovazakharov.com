> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

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
  thinking block, each tool call), each carrying that response's *whole* usage.
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

So our work does not run *beside* the harness check; it runs *before* it, in the
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
4. **`.claude/hooks/stop-session-cost.sh`** — the wrapper: read the payload once
   (stdin is a pipe), run the ledger guarded, commit and push the row, then hand
   the same payload to the harness script and exit with its status.
5. **`.claude/hooks/patch-launcher-hooks.sh`** — the `SessionStart` patcher.
   Silent when there is no launcher file (a local CLI session, where there is
   nothing to patch); loud into session context when the file is there but its
   `Stop` entry is not the shape this patch knows, and it leaves it untouched.
   Idempotent: a launcher already pointing at the wrapper is a no-op.
6. **Registration and prose** — the patcher into `.claude/settings.json`, one
   line for `costs/` in CLAUDE.md § "Repository layout", and
   `.claude/rules/costs.md` for the mechanism, which is load-bearing and
   entirely non-obvious from the files themselves.
7. **`pnpm costs`** — the monthly rollup over `costs/sessions/**`, which is what
   the whole thing is for.

## DRY notes

- **The pricer is genuinely shared** and lives once, in `scripts/session-cost.ts`:
  the `Stop` hook prices one session, the rollup prices many, and a second copy
  of the TTL arithmetic is exactly the drift this repo's type-overlap gate exists
  to catch in types.
- **The two new shell hooks reuse `.claude/hooks/lib.sh`** (`read_payload`,
  `field`, `say`, `need_command`) rather than re-rolling the payload read. Its
  `emit_context` is `UserPromptSubmit`-shaped and does not fit `SessionStart`,
  so the patcher reports through `say` instead of growing a second emitter for
  one caller.
- **No shared abstraction over the two hooks.** They share `jq -r` and nothing
  else — one wraps a foreign script, the other rewrites a foreign config. A
  common "hook base" would name a similarity that is not there.
- **The price table is not derived from anything**, which looks like a violation
  of "derive types from the source of truth" and is not: there is no source of
  truth to derive from. The TypeScript type for a rate set *is* derived from the
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

The `Stop` wrapper takes effect in the session that installs it — the CLI is
launched with `--settings` pointing at the launcher file and reloads hook edits
live. The `SessionStart` patcher cannot fire in that session, so it is run by
hand once, and the claim that it re-applies itself automatically stays unproven
until the next resume. It is checked then, by eye, rather than assumed.
