# Relay 6 — unsquatted blog, embargo removed, lede and share done

## 1. Standing constraints

- «не надо делать превью, другая ветка с ними работает» (from relay 5) —
  publish nothing to preview.vovazakharov.com from this branch; look on the dev
  server only.

## 2. The conversation

The session opened on
`/relay take claude/unsquatted-blog-oabq4m — Блог переименован в Names and Dates, пост и индекс выглядят как на мокапах; остались вопрос о сборке до 9.11, весёлый лид, кнопка share, полировка и PR`.

**Agent**: attached, resumed the plan, began fixing the pre-9.11 build with
option (a) (a reserved `nothing-released` param).

**Operator** (two messages mid-turn): «какой эмбарго, ты о чём?» / «все посты
должны быть видны сразу»

**Agent**: explained the embargo came from the first session's plan; reverted
the (a) fix and removed the embargo entirely (ba839ac5); wrote the lede after
the mockup's and the labelled "share" trigger (11d561d6); looked at the post in
light, dark and phone; asked whether the lede suits or the Unnamed should be
cheekier, and whether the daily deploy should come back for `shownUntil`
`(verbatim in Last agent turn)`.

## 3. Intent

Unchanged from relay 1 (`relay-1.md` § 3): a blog on unsquatted.com run by the
Unnamed, four holiday posts with live domain widgets, post 1 (Singles’ Day)
tuned first, all in PR #249, merged by 10.11 — now with **every post visible
from the merge on**, no release by date.

## 4. Decisions

Relays 1–5's § 4 stand, except the embargo. This session:

- **No embargo** (operator: «все посты должны быть видны сразу»):
  `embargo.ts` and its test deleted; `documents.ts`, `deploy.yml` (daily
  schedule) and `preview.yml` (`as-of`) restored to `main`'s;
  `listWrittenDocuments` gone, `post-links.ts` checks and links over
  `listPrimaryDocuments`. The daily deploy went with it; whether to bring it
  back for `shownUntil`'s daily resolution is asked, unanswered.
- **Lede** (`description` of `singles-day.md`): "Four ones in a row started as a
  joke in a Nanjing dorm and became the biggest shopping day on Earth. Here are
  the names it left lying around." Not yet confirmed. The post's OG card was
  re-rendered for it.
- **Share trigger**: `ShareMenu` takes `labelled` (icon + `copy.share`, an
  `UnstyledButton`); the widget card passes it, styled in
  `widget-card.module.scss` `.share` (hairline border, lowercase). On a phone it
  wraps under the checker link; the agent judged that fine.

## 5. Errors and dead ends

- Option (a) for the pre-9.11 build (a reserved param rendering 404) was built,
  then reverted unused once the operator ruled out the embargo.
- Playwright `waitUntil: 'networkidle'` never settles on the post (live
  lookups); `load` plus a 5 s wait works (`tmp/shots/shoot.cjs`, not
  committed).

## 6. State

- **Branch** `claude/unsquatted-blog-oabq4m`, pushed; head 3bd49c2c before this
  park's commit.
- **PR** https://github.com/vzakharov/vovazakharov.com/pull/249, draft,
  `CONFLICTING` against `main` (for `/finalize`). Body and squash proposal still
  relay 1's — they describe the embargo and daily deploy, which no longer exist.
- **Plan** `docs/plans/unsquatted-blog.paused.md`; `## Rest of the bite` lists
  `/polish full` and `/pr`.
- **Checks**: `pnpm build unsquatted` passes (dated 4.11); `tsc` for unsquatted
  and eslint on touched files pass; `content:og unsquatted` current. No vet.
- **Estimate**: this session 0.75 h senior developer + 0.5 h middle designer +
  0.25 h senior persona. Remainder handed on: 5.75 h senior persona (three posts
  and their reflections); 2 h middle analyst (three naming runs and fact
  checks); 1 h middle designer (widget checks on the new posts).
- Nothing running; no keepalive.

## 7. Pointers

- `docs/plans/unsquatted-blog.paused.md` — the contract for what is left.
- `mockups/pages.cjs` and the PNGs beside this file — the look.
- `src/unsquatted/widgets/field-tools/ui/field-tools.tsx` (`ShareMenu`),
  `src/unsquatted/pages/post/ui/widget-card.tsx`,
  `src/unsquatted/pages/home/picks/model/post-links.ts`.
- `sites/unsquatted/public/blog/singles-day.md` — the post and its lede.
- Transcripts: this session
  https://claude.ai/code/session_01DaohkE55NLPZ6Shpfu2Rvp; relay 5's
  https://claude.ai/code/session_01DaohkFAogh4KgWtaRvvsd9; earlier ones in
  `relay-5.md` § 7.

## 8. Next step

Resume the paused plan with `/go` from its Step 1 (go-ahead «так го :)»,
recorded in 413dadb3): `/polish full` (7019c3bd ran only `/dry`), then `/pr`,
whose refresh must drop the embargo and daily deploy from the body and the
squash proposal. No preview.

Pending with the operator, ask again if unanswered and carry on: does the lede
suit, or should the Unnamed be cheekier; should the daily deploy come back for
`shownUntil`. Bite 2 (the other three posts) follows only after the operator
reviews bite 1.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Подключился к ветке `claude/unsquatted-blog-oabq4m` (PR #249, черновик), читаю relay-5.

Чиню сборку до 9.11 по варианту (a) и проверяю её билдом с датой 5.11.

Убираю эмбарго целиком: все посты публикуются сразу при мердже.

Проверяю сборку без эмбарго.

Лид переписан; теперь делаю кнопку «⤴ share» в виджетах.

Now the widget card's usage:

Кнопка «share» с подписью готова в коде; проверяю токен цвета, типы и снимаю пост на dev-сервере.

Скриншоты сняты, смотрю их против мокапов.

Вова, привет. Я продолжаю сессию https://claude.ai/code/session_01DaohkFAogh4KgWtaRvvsd9.

**Про эмбарго.** Его придумал не ты, а план первой сессии, и там он ушёл одной строкой: «каждый пост прячется до своей даты». Посты лежали в репозитории, но сборка пропускала всё, что датировано позже дня сборки. Каждый пост должен был выходить в свой день через ежедневный автодеплой. Отсюда и проблема со сборкой до 9.11: пост 1 был единственным и спрятанным, страниц блога не оставалось вообще, и экспорт Next на этом падал.

Раз все посты должны быть видны сразу, я вырезал эмбарго целиком (ba839ac5). Ушли сама проверка даты, переменная `CONTENT_AS_OF`, поле даты в превью-воркфлоу и ежедневный автодеплой. `documents.ts`, `deploy.yml` и `preview.yml` теперь такие же, как на `main`. Сегодня, 4.11, `pnpm build unsquatted` проходит, пост собирается, вопрос про 9.11 закрыт. Если ежедневный деплой всё-таки нужен, чтобы `shownUntil` в `picks.yaml` срабатывал день в день, а не при следующем мердже, скажи, верну.

**Лид**, ближе к мокапу (11d561d6):

> Four ones in a row started as a joke in a Nanjing dorm and became the biggest shopping day on Earth. Here are the names it left lying around.

Это почти дословно мокап. Подходит, или пусть Unnamed похулиганит сильнее? Карточку поста для соцсетей я перерисовал под новый текст.

**Кнопка share** в виджетах теперь как на мокапе: значок, слово «share» и тонкая рамка. Пост я посмотрел на dev-сервере в светлой и тёмной теме и на ширине телефона, всё как на мокапах. Единственное отличие: на телефоне «share» уходит на отдельную строку под ссылкой на чекер, места в строке не хватает. По-моему, так и надо. Превью не трогал.

Осталось `/polish full` (из прошлого прогона полировки прошёл только поиск дублей кода) и обновление описания PR #249. Пока ты смотришь лид, займусь ими.
```
