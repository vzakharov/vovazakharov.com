# PR #94: chore: cap CLAUDE.md, cost-aware relays and a cold-cache guard

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/94
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/claude-md-cap-and-relay-pricing-al9359
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-30T21:36:14Z
- **Updated:** 2026-10-02T14:41:23Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

The repo we vendor agent infrastructure from, vzakharov/muthur, moved seven commits; this ports them.

- **A size cap on what loads every turn** — `scripts/check-claude-md-size.sh` fails vet when `CLAUDE.md` plus its `@`-imports pass 30,000 characters, and holds a branch that crossed to 29,000. Today: 28,032 with this branch's staged copy.
- **Cost-aware relays** — the context budget's warning and pause lines move to where `/relay` starts paying off, capped at 200k/300k, and the notice carries the dollars; the new **cold-cache guard** stops the first prompt after the prompt cache expired and prices carrying on against a fresh session. A dated model id (`claude-haiku-4-5-20251001`) now prices at its undated row.
- **A directory's conventions live in its own `CLAUDE.md`** — `.claude/rules/skills.md` → `.claude/skills/CLAUDE.md`, and the adopter sweep moves `.claude/rules/writing.md` → `writing/CLAUDE.md`. `logos.md` stays a rule: a `CLAUDE.md` under `apps/*/public/` would be published with the site.
- **Loop fixes** — a skill named inside another's argument is written bare (`/relay go`), since the Claude app refuses a nested slash command; `/task` Step 3 gates on alternatives landing far apart rather than on irreversibility; «Вова» in Russian replies.

`CLAUDE.md` and the `/from-branch` and `/relay` descriptions change through staged copies, swapped in at `/finalize`. Until then vet fails on one line: the live `CLAUDE.md` still names `.claude/rules/writing.md`.

### Triage

| Source commit | Verdict | Why |
| --- | --- | --- |
| 637319b size cap | take + translate | script verbatim; wired into this repo's `vet.sh` fan-out and `stack.md`. `scripts/test_claude_md_size.py` skipped — `scripts/test_*.py` is declined |
| 892c8ac dated model id | take | |
| 915ebe4 priced budget lines | take | catalog row skipped (catalog declined) |
| 5675523 bare skill names | take | descriptions via staging |
| 3322c8f `/task` gate | take | re-applied by hand over prettier's formatting |
| f1bccc4 cold-cache guard | take (operator's yes) | vet loop translated into the fan-out; catalog row skipped |
| b7805f2 nested `CLAUDE.md` | translate | kept this repo's catalog-less skills paragraph; added the served-directory exception; `tend-prose` cites homes 4 and 5, which the source's copy still misnumbers as 3 and 4. `ADOPTING.md` and catalog hunks skipped (declined) |

Every commit's `.claude/costs/sessions/` rows skipped — that directory is each repo's own.

## QA Checklist

- [ ] `size-cap` — `scripts/check-claude-md-size.sh` prints `ok — … 28032/30000 chars`, and appending 3,000 characters to the staged `CLAUDE.md` makes it fail with the "cut N more" message.
- [ ] `priced-lines` — in a session past ~200k tokens, the context-budget notice quotes a relay's up-front cost and saving in dollars.
- [ ] `cold-cache` — return to a session idle past its cache TTL: the first prompt is stopped with a price, resending it (or `!`) goes through, and `/compact` passes untouched.
- [ ] `bare-skill` — `/from-branch <branch> finalize` in the Claude app sends and runs `/finalize` after attaching.
- [ ] `nested-rules` — reading a file under `writing/` loads `writing/CLAUDE.md`; reading one under `.claude/skills/` loads `.claude/skills/CLAUDE.md`.
- [ ] `vet-after-swap` — after `scripts/staged.sh swap`, `./scripts/vet.sh` is green.

| Item | Automatable | Covered? | Notes |
| --- | --- | --- | --- |
| `size-cap` | unit | ❌ | the source's `scripts/test_claude_md_size.py` covers it there; declined here |
| `priced-lines` | unit | ✅ | `.claude/context-budget/test_context_budget.py`, `.claude/costs/test_restart.py` |
| `cold-cache` | unit | ✅ | `.claude/cold-cache/test_cold_cache.py` |
| `bare-skill` | manual-only | — | the refusal is the Claude app's client-side check |
| `nested-rules` | manual-only | — | harness loading behaviour |
| `vet-after-swap` | integration | ✅ | `./scripts/vet.sh` at `/finalize` |

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-30T21:36:50Z — "Proposed squash title/body: ``` chore: cap CLAUDE.md, cost-a…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-30T21:36:50Z

[https://github.com/vzakharov/vovazakharov.com/pull/94#issuecomment-5920160593](https://github.com/vzakharov/vovazakharov.com/pull/94#issuecomment-5920160593)

Proposed squash title/body:

```
chore: cap CLAUDE.md, cost-aware relays and a cold-cache guard (pr #94)
```

```
The agent infrastructure this repo vendors from vzakharov/muthur moved,
and its changes apply here.

What every turn pays for is now bounded and priced. vet fails when
CLAUDE.md and its @-imports pass 30,000 characters, and a branch that
crossed that lands at 29,000. The context budget's warning and pause
sit where /relay starts paying off, capped at 200k/300k, and quote the
dollars. A cold-cache guard stops the first prompt after the prompt
cache expired and prices carrying on against a fresh session. A dated
model id prices at its undated row instead of dropping the ledger row.

One directory's conventions live in that directory's CLAUDE.md, which
loads when a scoped rule would and sits beside the code:
.claude/skills/CLAUDE.md and writing/CLAUDE.md replace their rule
files. .claude/rules/ keeps globs no directory bounds, and a served
directory, where a CLAUDE.md would be published.

A skill named inside another's argument is written bare (/relay go),
since the Claude app refuses a nested slash command, and /task gates
on alternatives landing far apart rather than on irreversibility.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/skills/update-muthur/watermark.json`:65 — unresolved — last: @vzakharov (human) 2026-10-02T14:41:10Z — "оставь в muthur тикет чтобы поправить пжст" → [↓](#t01)

<a id="t01"></a>

### `.claude/skills/update-muthur/watermark.json`:65 — unresolved

```diff
@@ -58,8 +61,11 @@
… 2 lines elided …
     ".claude/skills/sync-branch/",
-    ".claude/skills/tend-prose/",
+    {
+      ".claude/skills/tend-prose/": "taken with one fix the source still lacks: § \"Rule or README?\" cites the two rule homes as 4 and 5, the rows the homes table gives them. The source's copy says \"homes 3 and 4\", a numbering its own table no longer has."
```

**@vzakharov (human)** — 2026-10-02T14:41:10Z

оставь в muthur тикет чтобы поправить пжст

---

## Timeline (status, references, and other events)

- **2026-10-02T14:41:23Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/94#pullrequestreview-5393113747.
