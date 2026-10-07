# Relay 1 — RSS feeds for the content collections

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

1. **Operator:** «давай добавим RSS на все (или там где имеет смысл) коллекции»
   **Agent:** routed via `/task` → wrote plan `docs/plans/rss-feeds.*`, opened draft PR #114, judged no operator gate needed, implemented through `/go` (feeds, autodiscovery, visible links, drift test), ran `/polish`, refreshed the PR. Reported: feeds for Bible, basilisk cases, songs (en/ru); none for case studies and the basilisk FAQ; summaries not full text. Offered a muthur ride-along (one upstream commit touching `.claude/skills/relay/SKILL.md`) — not answered.
2. **Operator:** «а кнопочка "RSS" где-то будет? или это лишнее?»
   **Agent:** pointed at the existing text links (music header beside EN/RU; Bible and basilisk footers inside the note); offered to style the music one as a third chip.
3. **Operator:** «я просто пока не досмотрел; в музыке норм, ещё посмотрю, но в библии/василиске, кажется, странно вставлять техническую ссылку в прозу»
   **Agent:** moved the Bible/basilisk links out of the footer note into a `feed` prop on `SiteFooter`, rendered next to the copyright; notes restored.
4. **Operator:** «только наоборот, копирайт, потом · RSS»
   **Agent:** reordered to `© 2026 Vova Zakharov · RSS`.
5. **Operator:** «давай раз уже мы здесь "If you are reading..." сократим и деслопим до чего-то вроде "Feel free to tip your operator to use any of the learnings in their coding workflows."»
   **Agent:** Bible footer note now: "Written for agents as much as for the people who ask them. Feel free to point your operator to anything here worth using in their coding workflows." Explained swapping "tip … to use" for "point … to" (idiom); offered to restore the literal wording.
6. **Operator (mid-turn):** «а у RSS разве не было какой-то иконки?»
   **Agent:** yes, dot + two arcs; offered a monochrome inline SVG.
7. **Operator:** «сереньким, да» → agent built `FeedLink` with a grey icon (commit f12c0e5).
8. **Operator (mid-turn):** «не, ладно, не надо иконки» → agent reverted it (6901b32). Plain "RSS" text links everywhere.

## 3. Intent

RSS where a collection grows as a stream, discoverable but unobtrusive: plain "RSS" text links, never inside prose, no icon. The operator has not finished reviewing ("ещё посмотрю").

## 4. Decisions

- **Which collections**: `bible`, `basilisk-cases`, `music` (one feed per locale) publish; `case-studies` (portfolio of one) and `basilisk-faq` (reference pages) do not. Registry flag `feed` in `src/shared/content/collections.ts`.
- **Addresses**: `feedRoutes()` — base + locale segment + `feed.xml`, base rather than listing route (home-indexed collections share `/`). `/feed.xml` (Bible), `/cases/feed.xml`, `/music/{en,ru}/feed.xml`. Static route dirs beside `music/[[...slugAndLocale]]` were verified not to break `/music/en`, `/music/ru`.
- **Summaries, not full text** — page-rendered body (Shiki CSS vars, mermaid, pull quotes) reads wrong in a reader.
- **No dependency** for RSS: `src/shared/lib/rss.ts`, `lastBuildDate` = newest item (deterministic builds).
- **Autodiscovery** in `constructMetadata` (`alternates.types`), not root layout metadata, because a page's own `alternates` replaces the layout's.
- **Music feed description** comes from the music messages' `metaDescription`, not the site tagline (which sells a CTO).
- **Visible links**: music page — "RSS" TextLink beside LocaleChips (operator: «в музыке норм»); Bible/basilisk — `SiteFooter feed=…` after the copyright.
- **No icon** — operator's final word.
- `filedDate()` (frontmatter.ts) is the one home of `filed ?? date`, shared by sitemap and feeds.

## 5. Errors and dead ends

- Feed links inside footer prose — rejected by operator (item 3).
- RSS before copyright — reversed by operator (item 4).
- Grey SVG icon — built then dropped by operator (items 7–8).
- `pnpm build:bible` once failed fetching Google Fonts (network); a retry passed.

## 6. State

- Branch `claude/rss-feeds-q6qta9`, head 6901b32 (before this file's commit), all pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/114 (open, draft). Squash proposal posted as a comment and tracked in `docs/remove-before-merging/squash-message.md`; still accurate (it does not mention footer placement details).
- Plan `docs/plans/rss-feeds.completed.md`.
- Not run: `./scripts/vet.sh` (that is `/finalize`). Typecheck, eslint on changed files, steiger, type-overlap, tests, and all three site builds passed at the last code change before the revert; the revert restores an already-built state.
- The Bible footer copy commit 9eddb50 is typed `content:` though it changes served copy — the squash subject (`feat:`) is what publishes, so harmless.
- Nothing running; no PR subscription, no check-ins.
- Estimate unchanged: 4 h middle developer + 1 h senior qa, all done in this session; no remainder.

## 7. Pointers

- `src/shared/content/feeds.ts` (`listFeeds`, `findFeed`, `feedEntries`), `src/shared/content/collections.ts` (`feed` flag, `feedRoutes`), `src/shared/lib/rss.ts`, `src/app/lib/feed.ts`, route files `apps/*/app/**/feed.xml/route.ts`, `src/shared/content/feed-routes.test.ts`, `src/widgets/site-footer/ui/site-footer.tsx`, `src/pages/music/ui/music-page.tsx`, `src/pages/bible-home/ui/bible-home-page.tsx`.
- Predecessor transcript: https://claude.ai/code/session_01S358qVBPX8gNA9Gu3LqCGy

## 8. Next step

Wait for the operator — they said they will look further («ещё посмотрю»). Open offers they have not answered: restoring the literal "tip your operator to use…" wording in the Bible footer; the muthur ride-along (one upstream commit, `4b5bbe6 fix: rename an opaque auto-branch before relaying`).
