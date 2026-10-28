# Relay 1 — CV and Playgram case study from the job-search profile

## 1. Standing constraints

- "Открой черновой PR в vovazakharov.com; ничего не мерджи."
- "Не добавлять ничего из раздела «Чего нет»" — the profile's "Чего нет" list:
  Kafka, gRPC, n8n and Make, 1C and Bitrix24 integrations, React Native, high
  load, managing a staff of people.

## 2. The conversation

**Operator (opening prompt):**

> Обнови CV и кейс-стади Playgram по профилю Вовы, собранному в репе
> vzakharov/life (PR https://github.com/vzakharov/life/pull/252, файл
> work/job-search/profile.md на ветке claude/hh-batch-3-k0x09l — прочитай через
> `gh api 'repos/vzakharov/life/contents/work/job-search/profile.md?ref=claude/hh-batch-3-k0x09l' --jq .content | base64 -d`).
>
> 1. CV (оба варианта, dev и CTO, все языки): добавить то, что у Вовы есть, а в
>    CV нет — в первую очередь стек из своего бота mitko (aiogram 3, FastAPI,
>    SQLAlchemy, PostgreSQL + pgvector, PydanticAI;
>    https://github.com/vzakharov/mitko), Redis и очереди в DDB (Django Q2,
>    Django Channels), и вообще всё из раздела «Что есть» профиля, что уместно
>    показывать людям. Ссылаться на PR #252 в life как на источник. Не добавлять
>    ничего из раздела «Чего нет».
> 2. Кейс-стади Playgram (apps/vova/public/case-studies/playgram.md и его
>    переводы, если есть): добавить метрику против команды на Bubble — с 21.05
>    по 10.08.2026 около четырёх релизов в неделю, столько же, сколько у двух
>    разработчиков на Bubble (124 релиза с 22.12.2025 по 11.07.2026), но в
>    каждом в среднем 8 изменений против 3 (~2,5× изменений в неделю), 712 из
>    806 PR окна — Вовины; с оговорками: до 11.07 это в основном перенос
>    существующего, заметки 4.x пишет скилл /release и они дробнее. Источник —
>    bubble/bubble-release-notes.md и docs/release-notes/ в
>    Playgramai/playgramapp; перепроверь подсчёт сам. Пометить, что +65% (6,8 →
>    11,2) — это Вова против себя же с агентами послабее. И исправить «250 000
>    lines of production TypeScript»: это вместе с тестами (~114 тыс.
>    продакшена, ~116 тыс. тестов — work/playgram/retrospective.md в life).
>
> Открой черновой PR в vovazakharov.com; ничего не мерджи.

Agent: routed rung 1 → `/task` → planless (`/go` § "Planless entry"). Recounted
in playgramapp: Bubble 124 releases / 202 days = 4.3 a week, 3.15 changes per
release; 4.x 21.05–10.08 = 82 days, 48 main releases (66 with 18 hotfixes) =
4.1 a week, 8.5 changes per release (counting top-level bullets under the
change sections — Fixes, Fix, Features & changes, Features & parity, Styling,
Change, Setup scripts, Design & refactors — not Highlights/Notes/Root
cause/Follow-ups/Migrations), so ≈2.6× the changes a week; 806 merged PRs in the
window, 712 by vzakharov (GitHub search). Noted the "production TypeScript" fix
was already on `main`. Then edited.

**Operator:** "48 релизов за 82 дня — 82 дня это что конкретно, какие отсечки?"

Agent: 21.05.2026 (`4.0.0`) to 10.08.2026 (`4.4.3`) inclusive; 48 = main
releases without hotfixes (4.0.0–22, 4.1.0–10, 4.2.0–3, 4.3.0–5, 4.4.0–3); 66
with hotfixes; Bubble window 22.12.2025–11.07.2026 inclusive = 202 days.

**Operator:** "а чего ты не смотришь на сами рендеры, может так понятнее станет,
что резать?"

Agent: rasterized the PDFs with `pdftoppm` and looked; found the CTO bullet
about 2.5× wrapped one word in ru and pushed the English-for-Kids block whole
onto page 2, cascading everything; shortened that bullet to one line.

**Operator:** "да пофиг на эти Flows, они все равно уже давно мёртвые:)"

Agent: removed Flows from both catalogues; cto/ru and both en now fit; dev/ru
still prints 4 pages — the 4th blank, content ending flush at page 3's bottom.
Then paused for the context budget (verbatim in Last agent turn).

## 3. Intent

Bring the public CV (both variants, en + ru) and the Playgram case study up to
date with the profile in life PR #252, without overclaiming: every figure
checked, the caveats kept. Draft PR only, no merge.

## 4. Decisions

- **Case studies have no translations** (English only, unlocalized
  collection), so "переводы" became the `.mini.md` and `.nano.md` cuts, which
  got the Bubble comparison and the +65% caveat in short form.
- **"250 000 lines of production TypeScript" was already fixed on `main`**
  (table row reads "about 114,000 of production code and 116,000 of tests"; CV
  says "tests included"), so nothing to change there.
- **PR #252 is cited as the source in the commit/PR body, not in the CV page**:
  life is private, a public CV link to it would be dead.
- **C++ (olympiads/university, not production) left out** of the CV stack: the
  stack lines are one locale-free string and C++ needs a qualifier; profile says
  letters mention it as "с института". The product-mindset line went into the
  dev variant's `workingStyle` (en + ru) — shown on the profile page, not in the
  PDF.
- **"с агентами послабее" rendered as "weaker agent tooling"** in the case study
  (before 25 April: 3–5 local agents).
- **Page ceiling (3 pages, `CV_PAGE_CEILING`) forced cuts**: mitko took
  Unfindables' slot; Flows removed at the operator's word; stack trimmed (no
  APScheduler, Alembic, Postmark, Mixpanel, S3; backend reads `Django, FastAPI,
aiogram; Postgres + pgvector, Drizzle, SQLAlchemy, Weaviate, Redis, Django
Q2` — Django Channels and DRF are only in the DDB experience line / not at all
  now; check `src/pages/cv/lib/cv-stack.ts`); DDB stack line `Django + DRF,
PostgreSQL + pgvector, Redis, Vue + TypeScript`; ru JobGenie shortened to
  "ИИ-ассистент соискателя: помогает и откликаться на вакансии, и придумывать
  новые роли."

## 5. Errors and dead ends

- Measuring page fill by text bounding boxes misled; looking at the rasterized
  pages (operator's suggestion) found the real cause (a whole-block page-break
  cascade from page 1).
- A background build raced an edit: the PDF cache (`apps/vova/public/cv/*/
pdf-renders.json`, gitignored) recorded the new source hash against a stale
  render. Fix: delete those two manifests and re-render.
- A `pgrep -f "next build"` wait loop matched itself and hung; don't.

## 6. State

- Branch `feat/cv-profile-gaps`, pushed; head `4c5403e` (all edits so far). No
  PR opened yet. No CI, subscription or check-in running.
- **Open problem**: `/cv/dev/ru` prints 4 pages (last one blank); cto/en,
  cto/ru, dev/en print 3. Content ends flush at page 3's bottom, so about one
  more line must go from dev/ru's page 3 (or the 2.5× ru bullet / mitko line
  checked again).
- Estimate: this session 2 h senior analyst + 1.5 h senior copywriter;
  remainder handed on: 0.5 h senior copywriter — "fitting the last CV edition
  under the page ceiling and writing the PR needs judgement on what copy to
  cut".

## 7. Pointers

- `src/pages/cv/lib/cv-stack.ts`, `src/shared/config/tech-stacks.ts`,
  `src/shared/i18n/messages/{en,ru}.json` (cv.experience.playgram.items,
  cv.experience.independent.items, cv.whatIOffer.blocks.workingStyle).
- `apps/vova/public/case-studies/playgram{,.mini,.nano}.md`.
- PDF check: `pnpm -s build:vova && PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome pnpm -s content:pdf:vova --from-out`,
  then `pdftoppm -r 50 -png apps/vova/public/cv/dev/ru.pdf <scratch>/x` and
  Read the PNGs.
- Profile: `gh api 'repos/vzakharov/life/contents/work/job-search/profile.md?ref=claude/hh-batch-3-k0x09l' --jq .content | base64 -d`.
- Counts: `gh repo clone Playgramai/playgramapp`; files
  `bubble/bubble-release-notes.md`, `docs/release-notes/*.md`; PRs via
  `gh api -X GET search/issues -f q="repo:Playgramai/playgramapp is:pr is:merged merged:2026-05-21..2026-08-10 [author:vzakharov]"`.
- Predecessor transcript: https://claude.ai/code/session_01DaohkCGarfY7S3Mh2V1b5n

## 8. Next step

Get `/cv/dev/ru` down to 3 pages (look at the renders), run the vet, then `/pr`
for a **draft** PR citing life PR #252 as the source — "Открой черновой PR в
vovazakharov.com; ничего не мерджи." Report to the operator what was cut for the
page ceiling (Unfindables, Flows, trimmed stack items, shortened ru JobGenie)
and that C++ was left out.
