> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Sync vzakharov/muthur 460e110 → 0f16275

Eight source commits, taken whole in one PR (no split: the source's own split
instruction at #187 is an ordering within the sync, not a session boundary).
One local commit per rationale, in source order; the watermark bumps last.

## Order

1. **70cbc4b — relay at a context-budget pause by default** (take). Hook, test,
   CLAUDE.md of `.claude/context-budget/`, `/relay`, `/go`; drop
   `auto-relay/vzakharov`, add the `manual-relay/` switch.
2. **b296641 — keepalive renewals, park by default** (take). `[attn adopters]`:
   no `CACHE_KEEPALIVE*` is set in this environment or any
   `.claude/settings*.json`, so nothing to rename; the report tells the operator
   where else to look.
3. **6631e06 — `MUTHUR_` prefix on muthur's env variables** (take). Same
   `[attn adopters]` check, same result: none set.
4. **4e5c041 + c75ea67 — no tables in agent-facing Markdown** (translate). The
   rule is an `opt-in: ask`, taken under the watermark's `optIn`. Rule file,
   `check-markdown-tables.sh` in the vet fan-out, the tables in adopted files
   converted as the source did, and this repo's own agent-facing tables
   (`.claude/rules/*`, nested `CLAUDE.md`s) converted too. `test_markdown_tables.py`
   stays declined with `scripts/test_*.py`. CLAUDE.md's routing ladder goes
   through its staged copy.
5. **86f2ade — squash on the PR title, propose only the body** (translate):
   `/squash-message` keeps its `<type>[(<site>)]:` scope rule; the deploy gate
   reads the subject's prefix only, so GitHub's ` (#n)` suffix changes nothing
   there.
6. **a8b1d06 — English renewal-line example** (take).
7. **0f16275 — hard-wrap Markdown at 80** (translate, per its `Adopters:`
   paragraph: tooling only, reflow with our own).
   - Wrap through the prettier already in `package.json` rather than the
     source's `npx`-pinned `scripts/prettier.sh`: an override in
     `.prettierrc.json` sets `proseWrap: always` for the in-scope globs, and the
     existing `format:check` in vet enforces it — so no `check-markdown-wrap.sh`.
   - **Scope: agent-facing and repo-doc Markdown** — every `CLAUDE.md`,
     `.claude/**/*.md`, `docs/plans/`, `README.md`, `src/**/*.md`,
     `scripts/**/*.md`. **Not** the content trees: `apps/*/public/` (served
     pages and their raw `.md` variants — a reflow there is a site change),
     `writing/` (copy-exact drafts pasted into channels that keep newlines) and
     `docs/music/` (transcripts). Recommended; the alternative is the source's
     "all tracked Markdown".
   - `format-md.sh` PostToolUse hook, translated to call the local prettier
     (and to wrap a `*.md.staged` copy as Markdown).
   - `.prettierignore` gains the squash proposal's home.
   - `check-skill-catalog.sh` citation fix (verbatim).
   - Rule file `.claude/rules/markdown-wrap.md`, worded for this repo.
   - Then one reflow commit; `CLAUDE.md` and `voice.md` reflow in their staged
     copies.
8. **Watermark** → `0f16275`, `markdown.md` and `markdown-wrap.md` into
   `adopted`.

## DRY notes

- The wrap reuses the repo's own prettier and its `format:check` vet line rather
  than adding a second prettier and a second check; the hook is the one new
  caller.
- The tables check is the source's script, verbatim; no local twin exists.
