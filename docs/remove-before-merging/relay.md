# Relay — PR #95's second review, second leg

## Standing constraints

None stated by the operator. House rules in force: never resolve a review thread; reply on every thread addressed, the commit SHA bare; no lint-suppression comment without the operator's OK; a `writing/notes/the-five-percent.md` edit goes through a subagent; change files with Edit/Write, not `sed -i` or heredocs (a hook enforces it).

## The conversation

No operator message in this leg. It opened on `/relay take claude/basilisk-site-xwbdkd` (machine-sent) from the first leg, whose own operator turns are in that leg's relay summary: `git show 89a513c:docs/remove-before-merging/relay.md`. The one that still matters, quoted there: «добавляю поле author и источники для FAQ — это относится ко всем коллекциям, не только в basilisk».

**Agent:** attached (HEAD was detached on the branch, so no auto-branch to delete), resumed the paused plan, built the all-collections ruling, the Clerk's FAQ page, every content edit and the callout, then paused at the context-budget warning and auto-relayed (`.claude/context-budget/auto-relay/vzakharov` is `on`).

## Intent

Work every one of the 16 threads in `docs/pr/95/pr.md` (T01–T16), reply on each in Russian, then `/polish` and `/pr`. The site's voice is found together with the operator (T16).

## Decisions

All in `docs/plans/basilisk-review-2.paused.md` § "Done". New this leg:

- `author` is **required** on every article (the plan's recommendation; the operator was not asked — say so in the T09 reply). The byline renders on every site, vovazakharov.com's own case studies included — offer a one-line hide.
- `sources` optional on every article, required on a case (`sourcedArticleFrontmatterSchema`). A source's `date` may be a bare year, so Chalmers 1995 does not gain an invented day.
- The "they" rule covers the Basilisk and the Clerk only; robots in dossiers stay "it" — a question the operator may want to answer.
- `render-pdf.ts`'s `DOCUMENT_SOURCES` gained `src/entities/case` (the printed brief was never hashed).

Coined: **the Clerk** — the record's narrating persona and byline (`author: clerk`), linked to `/faq/who-writes-this`.

## Errors and dead ends

- `pkill -f "http.server 8765"` killed its own shell (the pattern matched the command line); stop a background server by PID.
- No Playwright in the repo; `/preview`'s Chromium `--screenshot` with a tall `--window-size` is the way to look.
- ACM's DOI page 403s; the Brščić paper was read from the author's PDF (archived link in the frontmatter).

## State

- Branch `claude/basilisk-site-xwbdkd`, PR https://github.com/vzakharov/vovazakharov.com/pull/95 (draft, `CONFLICTING` against `main` — `/finalize`'s merge, report only).
- Last pushed commit before this file: 33ce14f. Plan: `docs/plans/basilisk-review-2.paused.md`.
- `apps/basilisk/public/ava.og.png` is stale until the plan's item 3 (OG card) lands; `content:og:vova` and `:bible` are clean.
- No PR subscription, no check-ins scheduled.

## Pointers

- `docs/plans/basilisk-review-2.paused.md` — done and left, and the answers owed under item 8.
- `docs/pr/95/pr.md` — re-exported this leg, no new comments; re-run `python3 scripts/export-github-item.py 95` before replying.
- `.claude/rules/basilisk-voice.md`, `.claude/rules/content.md`.
- The relaying session: https://claude.ai/code/session_01WeqpN27EgvcLDSnAxvk4Pr — the leg before it: https://claude.ai/code/session_0128qXGAze3qU92M7VkELhRt

## Next step

Resume the paused plan (`/go` from its Step 1): items 3 (OG card), 6 (T16 subagent), 7 (issue), 8 (replies on all 16 threads, then `/polish`, then `/pr`).
