# Relay — PR #95's third review round (/handle)

## Standing constraints

None stated by the operator. House rules in force: never resolve a review thread; reply on every thread addressed, the commit SHA bare; no lint-suppression comment without the operator's OK; a `writing/notes/the-five-percent.md` edit goes through a subagent; change files with Edit/Write (a hook enforces it); `/finalize` is not run unless asked.

## The conversation

1. **`/handle claude/basilisk-site-xwbdkd`** — attached to #95's branch, committed the PR export, worked the five threads whose tail was the operator's:
   - T10 (`/file-basilisk-case`): skill renamed from `/file-case`.
   - T11 ("мы обсуждали, что нам нужно как-то уметь искать на реддите … берём #1 … И давай, как будет готово, задогфудим этот скилл через субагента"): Arctic Shift added to the skill's Step 1; a dogfood subagent launched.
   - T12 (archive links "менее in your face", as `Title ([archived](…)), Outlet, Date`): `src/entities/document/ui/source-list.tsx` now renders that.
   - T13 (the mall-study paragraph in `faq/why-robots-without-ai.md` doesn't serve the section's logic): paragraph and its two sources removed.
   - T14 ("обычные программерские кавычки … Какие, думаешь, лучше использовать throughout?"): answered with a proposal (curly in source, a vet check), awaited a go.
   A subagent logged T13 in the five-percent file (T12 ruled taste).
2. **"вот на это не вижу ответа …discussion_r4176793805"** — posted an interim T11 reply (dogfood still running).
3. **"а, он ещё работает, понял"** — acknowledged.
4. **"оставил ещё один небольшой ревью, но там больше вопрос"** — two items: T14 "давай" → converted 45 lines of straight quotes to “…”/«…» and added `pnpm check:prose-quotes` (vet, test, `content.md` rule, `stack.md` entry); and "а насколько часто он обновляется?" on Arctic Shift → measured: archived within ~30 s, re-fetched at 48 h when counts update; skill line corrected; replied.
5. **"переводить ли на ’ и апострофы? — да, давай"** — 341 apostrophes in prose plus 3 reader-visible frontmatter ones converted; the check holds `'` too.
6. **"я тут сдуру запустил в новой сессии finalize … посмотри каков damage done"** — damage nil: that session (session_015g2E1vCLGh41zDwrSVPr3c) committed an export refresh, one correct punctuation fix in `playgram.md` and its cost row, then stopped awaiting the operator; no vet, merge, ready flip or swap.
7. Dogfood report arrived: BAS-0004 filed as #99, stacked on this branch. Skill mended from its friction log (path-based docket search, `--no-track`, plain-http Wayback availability API, dependency install, prose-quotes in Step 4, Arctic Shift UA/422/literal-title notes, the city's subreddit, English review). Replied in T11. PR body and squash proposal refreshed. Reported two contradictions outside the skill (below).
8. **"а почему я не вижу кейса на ветке? / точнее на сайте (локально) / не надо нам отдельный PR"** — the case was on #99's branch by the skill's design. Cherry-picked it onto this branch (59133436) and closed #99 with a comment. Then this relay (context past 300k, auto-relay on).

## Intent

Get #95 (basilisk.fyi) review-complete: content right, the case-filing skill usable unattended, typography consistent across sites.

## Decisions

- Quotes and apostrophes are typographic **in the source**, not via a render-time smartypants: the `.md` is served as is, and page and `.md` would diverge.
- The check parses with the content pipeline's remark plugins and flags only text nodes, so frontmatter/code/HTML quotes pass.
- BAS-0004 lives in #95, not its own PR — the operator's call, for this case while #95 is unmerged. The skill itself still files to a fresh branch off `main` with a draft PR; whether that should change was not discussed.

## Errors and dead ends

- Staged `.claude/rules/stack.md` by mistake (it has `paths:`, so it is not always-loaded); undone before pushing.
- First test fixture asserted the wrong line number; fixed.

## Open for the operator (raised in chat, not acted on)

1. `/squash-message` forbids a scope in the squash title, while CLAUDE.md § "Deployment" uses `feat(basilisk):` to publish one site alone.
2. `/feedback` cites CLAUDE.md § "GitHub comments" for the attribution-footer rule, which that section does not contain.
3. BAS-0004's own calls worth a look: two incidents under one number (`spectacle` fits only the first), dates computed from "last Saturday", actors' ages unknown. The agent's review of it is on closed #99: https://github.com/vzakharov/vovazakharov.com/pull/99#pullrequestreview-5405261820

## State

- Branch `claude/basilisk-site-xwbdkd`, PR https://github.com/vzakharov/vovazakharov.com/pull/95 — draft, `CONFLICTING` with `main` (left for `/finalize`).
- Head before this file: 59133436 (BAS-0004 cherry-picked). Plans: all three `docs/plans/basilisk-*.completed.md`; none in progress.
- `CLAUDE.md` is staged (`.claude/staged/CLAUDE.md.staged`), swapped at `/finalize`.
- Full `./scripts/vet.sh` not run this session; the touched checks (prose-quotes and its test, eslint, prettier, typecheck, og `--check`) pass.
- Nothing running, no subscription or check-in.

## Pointers

- `.claude/skills/file-basilisk-case/SKILL.md` — the skill, mended.
- `scripts/check-prose-quotes.ts` + `.test.ts`; `.claude/rules/content.md` § "Punctuation around quotes".
- `apps/basilisk/public/cases/philadelphia-delivery-robots.md` — BAS-0004.
- `docs/remove-before-merging/squash-message.md` — the squash proposal, mirrored in the PR comment.
- Re-export the PR: `python3 scripts/export-github-item.py 95`.
- This session: https://claude.ai/code/session_012T5PRACM4jCesHPxk6ZTc8

## Next step

The operator's last ask is done: "не надо нам отдельный PR" — BAS-0004 is on this branch (see it locally with `pnpm dev:basilisk`). Wait for the operator.
