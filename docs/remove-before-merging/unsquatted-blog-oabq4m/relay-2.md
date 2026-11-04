# Relay 2 — unsquatted blog, bite 1 half built

## 1. Standing constraints

None stated beyond the repo's own conventions.

## 2. The conversation

This session had no operator messages of its own. It opened on
`/relay take claude/unsquatted-blog-oabq4m — План одобрен и на паузе, первый заход ещё не начат`
and ran relay 1's Next step, `/go` on the paused plan, until the context budget
warning at ~260k stopped it.

**Agent** (the only turn): it picked the plan up again (c9f2cc6d) and built
half of bite 1, delegating the FSD move to a Sonnet subagent. It paused for the
context budget and relayed (verbatim in Last agent turn). The merge of the
subagent's move came after that turn ended: bf85037b, then the pause and this
relay.

## 3. Intent

Unchanged from relay 1 (`relay-1.md` § 3): a blog on unsquatted.com run by the
Unnamed, four holiday posts with live domain widgets, post 1 (Singles’ Day)
first for the operator to tune on preview, all in PR #249, merged by 10.11.

## 4. Decisions

Relay 1's § 4 stands; this session added:

- **Widget components come through `ArticleSlots`, not the `Collection`
  handle** (the plan's § 2 said the handle). The feed, the collection index and
  the scripts hold `articleCollection(id)` handles that can't carry client
  components, yet they compile the same markdown. So the blog registry entry
  lists the widget **names** (`widgets: ['domains', 'name']`,
  `collectionWidgets`). `remarkContentDirectives` compiles a named directive
  into a `figure.content-widget` placeholder. It carries the attributes, the
  text of each list item in the body, and the source file
  (`src/blog/shared/content/widget-element.ts`, `widgetPlaceholder`). The body
  stays inside as the fallback the feed shows. `ArticleSlots` returns
  `widgets: WidgetComponents`, and `ProseContent` maps `figure` to them, throwing
  on a placeholder with no component. **Attribute validation is the owner
  component's job**, and it names `placeholder.source` in its throw.
- **Embargo**: `src/blog/shared/content/embargo.ts`, applied in
  `listDocuments` and `loadDocument`. `CONTENT_AS_OF=YYYY-MM-DD` overrides the
  build day. That is how a preview can show post 1 before its date, but
  `.github/workflows/preview.yml` does not pass it yet.
- **Daily deploy**: `deploy.yml` `schedule` `17 0 * * *`, and the gate selects
  unsquatted alone on `schedule`.
- **FSD cut** (bf85037b): the site copy went to `src/unsquatted/shared/i18n`.
  The domain noun went to `src/unsquatted/entities/domain` (verdict, label,
  rows, price, prices, `ZoneRow` in `ui/zone-row.tsx`), the likes to
  `features/like`, and the share menu to `widgets/field-tools`. The domain's
  pure logic is behind `entities/domain/index.node-safe.ts`. `Zoned` and
  `TypedName` moved to the entity's `rows.ts`.
- **Post 1's picks** (`picks.yaml`, `post: singles-day`): `letmeal.one`
  (pattern `*al.one`), `monachal.com`, `baresticks.com`, `onlyones.day`,
  `cartforone.com`, `boughtmyself.com`. Two planned `domains` lists: "a party
  of one" (`letmeal.one`, `monachal.com`, `baresticks.com`) and the sale (the
  other three). `name` widgets for `single` and `solo`. The post's slug is
  `singles-day`.
- **Author link**: `unnamed` → `collectionRoute('unsquatted-blog')` (`/blog`),
  relative, as the Clerk's is.

## 5. Errors and dead ends

- The subagent's worktree started from `main`, so `merge --ff-only` failed; it
  reset onto 37ad2a14 instead. Its commit was squash-merged cleanly.
- `publishingDay`'s `NodeJS.ProcessEnv` parameter failed the typecheck in the
  test (`NODE_ENV` required); it now takes `Partial<Record<string, string>>`.
- A first tagline ending in a closing quote failed `picks.ts`'s full-sentence
  regex, so the tagline was reworded.
- `pnpm lint:check <paths>` reports ~1255 "parserOptions.project" parsing
  errors when given directories; `npx eslint --fix <dirs>` over the touched
  directories ran clean. Vet's own lint run is the judge.

## 6. State

- **Branch** `claude/unsquatted-blog-oabq4m`, pushed; head e12233cd before this
  file's commit.
- **PR** https://github.com/vzakharov/vovazakharov.com/pull/249 (draft). Its
  body and the squash proposal
  (`docs/remove-before-merging/unsquatted-blog-oabq4m/squash-message.md`) are
  relay 1's and don't yet mention the slots deviation.
- **Plan** `docs/plans/unsquatted-blog.paused.md`. `## Eaten so far` lists what
  is built, and the head of `## Rest of the bite` says what is left.
- **Checks**: typecheck, lint:fsd, check:masd, masd:clusters, check:cycles,
  check:poison and format:check pass, and so do the blog content and unsquatted
  tests (119). Vet has not been run. `pnpm build unsquatted` fails until
  `sites/unsquatted/public/blog/` exists.
- Nothing else is running: the keepalive watcher stops with this session, and
  there is no PR subscription or check-in.
- **Estimate**: this session 6 h senior developer + 1 h middle analyst + 1 h
  senior persona. Remainder, handed on:
  - 7 h senior developer — routers, the index page, the widgets, the stamp and
    the two-way check, the dice nudge, the preview's `CONTENT_AS_OF`;
  - 1 h middle designer — tuning the real widgets against the mockups;
  - 8 h senior persona — four posts, their reflections;
  - 3 h middle analyst — three naming runs and the fact checks.

## 7. Pointers

- `docs/plans/unsquatted-blog.paused.md` — the contract for what is left.
- `relay-1.md` beside this file — the planning conversation, verbatim.
- `src/blog/shared/content/{collections,widget-element,embargo}.ts`,
  `plugins/remark-content-directives.ts`, `src/blog/shared/ui/prose-content.tsx`,
  `src/blog/shared/article-slots/article-slots.ts` — the seam.
- `src/unsquatted/shared/content/` — `POSTS`, `occasionStamp`.
- `src/unsquatted/entities/domain/`, `features/like/`, `widgets/field-tools/`
  — what the widgets build on; `pages/home/page/ui/name-checker.tsx` shows
  `ZoneRow` in use.
- `src/basilisk/entities/case/ui/case-slots.tsx` and
  `sites/basilisk/app/cases/[...slug]/page.tsx` — the slots pattern to copy for
  a `pages/post` slice.
- `src/maya/pages/home/`, `src/lsa/pages/lsa-home/` — custom index pages over
  `renderPrimaryDocuments`.
- `personas/unnamed/unnamed.md`, `.claude/rules/unnamed.md`.
- Transcripts: this session
  https://claude.ai/code/session_01DaohkFVQ8is9WA4hHjtj6A; relay 1's
  https://claude.ai/code/session_01DaohkEGHokggMHnD6egoGN.

## 8. Next step

Resume the paused plan with `/go` from its Step 1, and continue bite 1 from the
head of `## Rest of the bite`. The go-ahead is the operator's «так го :)»,
recorded in 413dadb3. The routers come first, then the `pages/post` slice with
its widgets, so that post 1 has a page to land on. Bite 1 ends with post 1 on
preview (`/preview live unsquatted`, with `CONTENT_AS_OF` passed through) and a
pause for the operator's review of tone and look. Refresh the PR body and the
squash proposal for the slots deviation at `/pr`. The merge deadline is 10.11.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Читаю контентный конвейер блога: где встраиваются виджеты и где резать по дате.

Дальше пойдёт код. Сначала шов для виджетов в блоге и эмбарго по дате, потом подключаю unsquatted как блог.

Пишу шов виджетов в блоговом конвейере: директива превращается в заглушку, а компонент для неё даёт сайт.

Now ProseContent:

Теперь эмбарго по дате:

Тесты для эмбарго и для разбора заглушки виджета:

Шов в блоге готов (37ad2a14). Подключаю unsquatted как блог-сайт:

Схема постов готова. Теперь персона: смотрю, как устроена Майя.

Persona и схема в 558b5d7f. Дальше ежедневный деплой в `deploy.yml`:

Пока субагент работает, записываю в план, что съедено.

Вова, я подхватил сессию https://claude.ai/code/session_01DaohkEGHokggMHnD6egoGN. Первый заход сделан наполовину, поста пока нет. Остановился раньше конца захода, потому что контекст подошёл к лимиту: сейчас около 260k при отметке предупреждения 250k. Оставшееся в эту сессию не влезет.

**Что уже в ветке:**
- **Виджеты в блоге** (37ad2a14). Директива в markdown превращается в заглушку-`figure`, и тогда сайт рисует на её месте свой компонент. Блог при этом про unsquatted ничего не знает. Если для виджета нет компонента, сборка падает с именем файла.
- **Пост выходит в свою дату.** Пост с датой позже дня сборки не собирается: нет ни страницы, ни карточки, ни записи в sitemap и фиде. В `deploy.yml` добавлен ежедневный деплой одного unsquatted в 00:17 UTC (f1c8b95c).
- **unsquatted теперь блог-сайт**, у постов есть поле `occasion` со штампом «11.11» (558b5d7f).
- **Unnamed заведён:** `personas/unnamed/unnamed.md` по-русски, плюс правило-указатель.
- **Шесть имён к 11.11** проверены по ранбуку и лежат в каталоге с `post: singles-day` (0f75b92f): `letmeal.one`, `monachal.com`, `baresticks.com`, `onlyones.day`, `cartforone.com`, `boughtmyself.com`. Для виджетов одного слова планирую `single` и `solo`: они заняты, в этом и шутка.

**Где разошёлся с планом** (поправь, если не так):
- Компоненты виджетов приходят не через `Collection`, а через слоты статьи. Так фиды и скрипты собирают посты без доступа к клиентскому коду.
- Список имён виджетов лежит в реестре коллекций блога: строки `domains` и `name`, без кода unsquatted.
- Превью поста до его даты делается через переменную `CONTENT_AS_OF`. В превью-workflow её ещё нужно пробросить.

**Что ещё не проверено:** имена у реальных доменов только что проверены через `names check`, но полный vet по ветке ещё не запускался.

**Что ещё бежит:** субагент переносит вердикты, лайки, цены, строку зоны и меню «поделиться» из `pages/home` на нижние слои FSD, чтобы страница поста могла их взять. Когда он закончит, я проверю его коммит, волью в ветку и передам работу новой сессии со сводкой.

**Что осталось на следующую сессию:** роутеры и страница-индекс блога, сами виджеты, штамп в каталоге с проверкой «пост ↔ каталог», подсказка «Tired of dicing?», проверка фактов, текст поста, отклик и превью.

Если хочешь, чтобы я сначала спрашивал, а потом передавал сессию, скажи.
```
