# PR #169: feat: #170 Multi-App Sliced Design — src/ as a graph of apps

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/169
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/multi-app-sliced-design-7bn3oq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-16T11:59:18Z
- **Updated:** 2026-10-28T02:05:29Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 128cef9). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T03** `src/blog/pages/documents/ui/article-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-28T01:58:54Z — "preexisting но всё же, вот эта кухня с `something={slots[som…" → [↓](#t03)
- **T04** `src/maya/pages/home/ui/maya-home-page.tsx`:36 — unresolved — last: @vzakharov (human) 2026-10-28T02:02:27Z — "тоже надо as; ещё линтерное правило, что если вещь с одним и…" → [↓](#t04)
- **R01** review by @vzakharov (human) — 2026-10-28T02:05:29Z → [↓](#r01)

---

## Body

## Summary

- **What:** `src/` stops being one Feature-Sliced Design tree and becomes a set of apps — `kernel`, `shell`, `blog`, `music`, `mushrooms`, `vova`, `lsa`, `bible`, `basilisk` — each an FSD tree of its own, composed along a graph in `src/masd.json` where each app lists its parents, declared above it. `vova` is a composition of `blog`, `music` and `mushrooms`, which is what vovazakharov.com is.
- **Why:** FSD's rules are computed over the whole repo, so a self-contained app (music, the mushrooms game) collapses into one `pages/` slice holding everything, and the shared kernel ends up knowing leaf apps (`shared/content` imports the song schema and the basilisk case frontmatter).
- **The rule:** an app that extends `blog` *is* `blog` — an import may target the same app or an ancestor, only a strictly lower layer, through the slice's public API. A site's router only maps URLs to apps: each site's sitemap belongs to its leaf app, which hands its routes to kernel's sitemap factory, and the router's `sitemap.ts` only re-exports it. A relative import stays inside its slice, segmented layer or app `scripts/`, everything past that goes by `@/` — `vova/no-relative-escape`, whose one exemption, the files bare Node runs, is derived from `package.json`.
- **Per-site pnpm entries take the site as an argument** — `pnpm content:og vova --check`, `pnpm build maya`, a bare `pnpm build` still every site — through `scripts/site-task.sh`, instead of one entry per site.
- **This PR is the whole of MASD, eaten in bites** (see the plan). Slice 1, on this branch: the move, both checkers driven by the graph, a cross-app significance check replacing Steiger's `insignificant-slice` (which a spike showed is wrong per app root), the collection registry inverted, imports grouped one app at a time in graph order, each sitemap on its leaf app, and the game on a root layout of its own with a dusk that no longer reads the colour scheme.
- **The rest lands here too**, each slice as a PR based on this branch, opened once the previous one's threads are resolved: sites named by domain, app scripts inside their apps, the message catalogue inverted, music as an app with real pages, and a measure for a one-page app with mushrooms restructured under it.

The plan: `docs/plans/multi-app-sliced-design.paused.md`.

## QA Checklist

- [ ] `builds` — `./scripts/vet.sh` passes: all four sites build, lint, Steiger per app root, `masd-check`, tests.
- [ ] `lattice` — an upward import (`basilisk/entities` → `kernel/features`) and a same-layer cross-app import (`basilisk/entities` → `blog/entities`) each fail `pnpm lint`.
- [ ] `significance` — a `kernel` slice used once inside `kernel` and twice from `blog` passes `masd-check`; one used by a single slice anywhere fails it.
- [ ] `sites` — each of the four sites renders its home, an article and the feed unchanged (`/preview`).
- [ ] `sitemap` — each site's `/sitemap.xml` lists the same URLs as on `main`: vovazakharov.com's carries the CV, case studies, blog and music catalogue; basilisk, bible and lsa carry their collections alone.
- [ ] `game` — `/mushrooms` renders without the theme toggle, and a fresh meadow opens in full day in a light and a dark system theme alike.
- [ ] `music-links` — vovazakharov.com's home links to `/music`, and a moved song's old URL still lands on the 404's moved-song notice.
- [ ] `relative-escape` — a relative import from `src/basilisk/shared/` into `src/kernel/` fails `pnpm lint:check`; `src/kernel/scripts/render-mermaid.ts`, which bare Node runs, keeps its relative imports and passes.
- [ ] `site-task` — `pnpm content:og maya --check` and `pnpm dev bible` run for the named site; a bare `pnpm build` builds every site; `pnpm dev` with no site fails naming the usage.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `builds` | integration | ✅ | `scripts/vet.sh` itself |
| `lattice` | integration | ❌ | Fixture files with an upward and a same-layer cross-app import, asserted to fail the generated boundaries policies; `eslint/masd-graph.test.ts` covers the graph they come from, not the policies |
| `significance` | unit | ✅ | `scripts/masd-check.test.ts` — slice used by two descendants vs. by one slice |
| `sites` | manual-only | — | Rendering correctness needs `/preview`; the build only proves each route renders |
| `sitemap` | e2e | ❌ | Build each site on `main` and the branch, diff the URL sets in `out/sitemap.xml` |
| `game` | unit | ✅ | `meadow-opening.test.ts` pins a fresh meadow to full day; the missing toggle is a `/preview` look |
| `music-links` | e2e | ❌ | Assert the built home links `/music` and the 404 carries the moved-song notice for an old song path |
| `relative-escape` | unit | ✅ | `eslint/rules/no-relative-escape.test.ts` — slice, layer and scripts homes, a bare-Node library, four escapes |
| `site-task` | integration | ❌ | Run `scripts/site-task.sh` with an echo template for one site, `--every`, and no site |

Closes #170
Closes #171

https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe
https://claude.ai/code/session_01S2jJtYpfBsib4tLTc8eM2u
https://claude.ai/code/session_01Vjv6g7vLNAMP6Z39YupG1q

https://claude.ai/code/session_012TzSzF1UMvkGzxb9jonqD3
https://claude.ai/code/session_01G8kJJMVk41ha3KrSd2pEby

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-16T11:59:40Z — "Proposed squash body: ``` Feature-Sliced Design's rules are…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-16T11:59:40Z

[https://github.com/vzakharov/vovazakharov.com/pull/169#issuecomment-6215014885](https://github.com/vzakharov/vovazakharov.com/pull/169#issuecomment-6215014885)

Proposed squash body:

```
Feature-Sliced Design's rules are computed over the whole repository,
so a self-contained app collapsed into a single pages/ slice holding
everything (music, the mushrooms game), and the shared kernel knew the
leaf apps it served: shared/content imported the song schema and the
basilisk case frontmatter.

src/ is now a set of apps, each an FSD tree of its own, composed along
a graph in src/masd.json where each app lists its parents above it,
which is what keeps the graph acyclic. An app that extends blog is
blog: an import may target the same app or an ancestor, only a
strictly lower layer, through the slice's public API. Where a
collection lives stays kernel's; what it holds moved to the app that
owns it. A site's router only maps URLs to apps; each site's sitemap
belongs to its leaf app, so vova, a composition of blog, music and
mushrooms, gathers the CV and music routes, and the others list their
collections alone.

Both checkers read the graph. eslint-plugin-boundaries generates its
policies from it; Steiger runs once per app root, with
insignificant-slice replaced by scripts/masd-check.ts, which counts a
slice's references across the composition and flags an abstract app
with a single child, because Steiger sees one root's references only.
Imports sort one group per app in graph order, so a file's imports
read as its composition, its own app last, and a relative import stays
inside its slice, segmented layer or app scripts/, the rest going by
@/ (vova/no-relative-escape) bar the files bare Node runs. Per-site
pnpm entries take the site as an argument: pnpm build vova.

The game renders on a root layout of its own, without the theme
toggle, and a fresh meadow always opens in full day: dusk is a game
mechanic, not a reading of the colour scheme.

Closes #170
Closes #171

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (human) — COMMENTED

_2026-10-28T02:05:29Z_

[https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5676855673](https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5676855673)

и из предыдущей сессии:

> Адрес и рисунок игрушки, а также общие строки (название сайта, подпись, «Табл. N», название и описание игрушки) переехали в общий для Майи src/maya/shared/config и src/maya/shared/i18n. Причина: главная и страница игрушки — соседние слайсы и не могут читать друг у друга.

почему тогда сразу в shared? страницы же много откуда могут импортить

> В src/mushrooms/scripts/build-mushroom-artifact.ts осталась своя копия корня репозитория вместо общего REPO_ROOT из kernel — правка в одну строку, если хочешь.

конечно

_19 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved — last: @vzakharov (agent) 2026-10-26T05:35:16Z — "Записал в план следующим укусом, перед 5b — b956465. По прав…" → [↓](#t01)
- **T02** `src/basilisk/scripts/lib/basilisk-card.ts`:1 — unresolved — last: @vzakharov (agent) 2026-10-26T08:45:36Z — "Записал в слайс 7 плана — 0bf2015 (на ветке укуса 5c, #214;…" → [↓](#t02)
- **T03** `src/blog/pages/documents/ui/article-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-28T01:58:54Z — "preexisting но всё же, вот эта кухня с `something={slots[som…" → [↓](#t03)
- **T04** `src/maya/pages/home/ui/maya-home-page.tsx`:36 — unresolved — last: @vzakharov (human) 2026-10-28T02:02:27Z — "тоже надо as; ещё линтерное правило, что если вещь с одним и…" → [↓](#t04)

<a id="t01"></a>

### `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved

```diff
@@ -0,0 +1,10 @@
+import { articleCollection } from '@/kernel/shared/content';
```

**@vzakharov (human)** — 2026-10-26T01:38:34Z

не оч понятно почему это находится в kernel если collection -- блоговая штука?

**@vzakharov (agent)** — 2026-10-26T02:06:06Z

Потому что там его держат kernel'овские же фабрики, а не потому что коллекции — kernel'овская штука. Из kernel за `shared/content` держатся: фабрика сайтмапа (добавляет маршруты коллекций), фабрика фидов, `constructMetadata` (ссылки на фиды в `<head>`) и скрипты kernel'а (`content-tree`, `read-collection`, `public-markdown`, плюс `PUBLIC_DIR` и `contentHash` в `og-job` и `render-mermaid`). Снаружи kernel его импортируют только blog и его потомки — basilisk, bible, music, maya, vova; ни shell, ни lsa, ни mushrooms. То есть это блоговая штука.

Предлагаю переезд в `blog/shared/content` отдельным укусом слона:
- в kernel остаются общие `PUBLIC_DIR` и `contentHash`, которым коллекции не нужны;
- сайтмап kernel'а берёт только маршруты, а маршруты коллекций к ним добавляет app-слой blog'а — так же, как сейчас vova добавляет маршруты CV и музыки;
- фабрика фидов и скрипты, читающие коллекции, переезжают в blog;
- `constructMetadata` получает ссылки на фиды аргументом.

Объём — около 80 файлов с импортами плюс эти четыре развязки. Беру следующим укусом, перед 5b (рекомендую), или пока оставить?

**@vzakharov (human)** — 2026-10-26T02:15:17Z

/plainly поясни как будет выглядеть в результате структура пжст

**@vzakharov (agent)** — 2026-10-26T02:31:58Z

Итог одной фразой: kernel перестаёт знать о коллекциях вообще, всё про статьи живёт в blog, а сайты без статей (lsa, игра) получают голый kernel.

```
src/kernel/
  shared/config/      + PUBLIC_DIR — где лежит public/ сайта, коллекции ему не нужны
  shared/lib/content-hash.ts      — хэш исходников, им пользуются og-карточки
  shared/seo/construct-metadata.ts — метаданные страницы, без фидов
  app/lib/sitemap.ts  — sitemap(routes): только маршруты, которые ему дали
  scripts/lib/og-job.ts — как сейчас
  (shared/content и app/lib/feed.ts уходят)

src/blog/
  shared/content/     — реестр коллекций, документы, фронтматтер, рендер, плагины, фиды, авторы
  shared/seo/         — constructMetadata blog'а: kernel'овский + фиды сайта
  app/lib/sitemap.ts  — kernel'овский sitemap + маршруты коллекций
  app/lib/feed.ts     — collectionFeed
  scripts/            — render-mermaid, content-tree, read-collection, public-markdown
  entities/document, pages/documents — как сейчас
```

Цепочка такая: коллекции нужны только сайтам со статьями, а все они наследуют blog, поэтому blog — самое низкое место, где их видят все потребители. Kernel держался за них лишь потому, что его же фабрики сайтмапа, фидов и метаданных их читали. Если эти фабрики будут принимать маршруты и фиды снаружи, держаться станет не за что. Своя `constructMetadata` в blog нужна, чтобы любая страница под blog по-прежнему получала ссылки на фиды и ничего не передавала руками.

Пример, что поменяется в коде:

```ts
// sites/maya/app/blog/[...slug]/page.tsx
import { articleCollection } from '@/blog/shared/content'; // было @/kernel/…

// src/lsa/app/lib/sitemap.ts — сайт без статей
export default sitemap();          // kernel'овский, реестр не трогает

// src/vova/app/lib/sitemap.ts
export default blogSitemap([...CV_ROUTES, ...MUSIC_ROUTES]); // blog добавит коллекции сам
```

**@vzakharov (human)** — 2026-10-26T05:29:00Z

да, хорошо

**@vzakharov (agent)** — 2026-10-26T05:35:16Z

Записал в план следующим укусом, перед 5b — b956465. По правилу слона он начнётся отдельным PR на ветку `claude/multi-app-sliced-design-7bn3oq`, когда на #169 не останется открытых тредов (ещё два ниже — оба вопросы).

---

<a id="t02"></a>

### `src/basilisk/scripts/lib/basilisk-card.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T02:26:07Z

а к слову вопрос, что за скрипты такие, которые мы запускаем не на "bare node"? кто их вообще и где запускает, и являются ли они технически скриптами?

**@vzakharov (agent)** — 2026-10-26T02:32:04Z

Это всё, что запускается через `tsx`, а не через `node`. Технически да, скрипты: у каждого есть точка входа, которую кто-то запускает из командной строки, а `scripts/lib/*` — их библиотеки.

Кто запускает:
- **руками**, через записи в `package.json`: `content:og <site>` и `content:pdf <site>` (рендер карточек и PDF), `music:scaffold` и `music:masters`, `basilisk:reflections`, `play:mushrooms`, `sweep:mushrooms`, `artifact:mushrooms`;
- **vet**: `content:og <site> --check`, `content:pdf vova --cv-pages`, `music:masters check`, а тесты все идут через `node --import tsx`;
- **деплой**: экшен `render-pdfs` после сборки каждого сайта запускает `tsx src/<site>/scripts/render-pdf.ts --from-out`;
- **скилл** `/file-basilisk-case` запускает `content:og basilisk` для новой карточки.

Голый Node им не подходит, потому что они дотягиваются до кода приложения, а тот написан под бандлер: импорты без расширений, алиас `@/`, JSON-каталоги без import attribute, модули с `server-only`, который `render-og` гасит через `--conditions=react-server`. Голым Node запускается только то, что этого кода не касается: чекеры (`check:*`), `styles:codegen`, `render-mermaid` и `music:untold`. Они держатся на модулях, которые пишут расширения и обходятся без алиаса.

**@vzakharov (human)** — 2026-10-26T05:29:46Z

а зачем мы вообще что-то через node запускаем а не всё через tsx?

**@vzakharov (agent)** — 2026-10-26T05:35:18Z

Особой причины нет: начиная с Node 22.18 `node file.ts` работает из коробки — Node сам вырезает типы, — и скрипты, которым не нужен алиас, так и писали. Выигрыш — старт без загрузки `tsx`, это 0,2–0,5 с на запуск (замерил: пустой старт 29 мс против 240, `check:masd` 0,6 с против 1,2, `check:prose-quotes` 1,4 против 1,55). Таких записей в `package.json` около дюжины, и vet гоняет их параллельными джобами, так что в сумме это секунды, а может, и вовсе ничего.

А платим за это вторым режимом импортов. Под голым Node алиаса нет, поэтому эти файлы ходят по `src/` относительным путём с расширением, а всё остальное — через `@/`. Отсюда:
- `eslint/bare-node.ts`, который существует только чтобы вычислить исключение из `vova/no-relative-escape`;
- две формулировки правила в `masd.md` (под `tsx` — алиас, под голым Node — относительный путь с `.ts`);
- `list-untold-songs` остаётся в «дедушкином» блоке именно по этой причине.

Предлагаю всё перевести на `tsx` и сделать это в слайсе 7, который и так убирает дедушкины импорты скриптов: каждое `node <file>.ts` становится `tsx <file>.ts`, файлы уходят на `@/`, `bare-node.ts` с исключением и второй режим в `masd.md` удаляются. `personas/tools/` (`random-words`, `whisper-lexicon`) не трогаю — это дом Майи, ей и решать. Добавить в слайс 7?

**@vzakharov (human)** — 2026-10-26T06:27:02Z

давай.

> дедушкины импорты

ну ты скажешь))

**@vzakharov (agent)** — 2026-10-26T08:45:36Z

Записал в слайс 7 плана — 0bf2015 (на ветке укуса 5c, #214; в ветку слона попадёт с её мерджем): каждое `node <file>.ts` становится `tsx <file>.ts`, файлы уходят на `@/`, `bare-node.ts` с исключением и второй режим импортов в `masd.md` удаляются, `personas/tools/` остаётся Майе.

---

<a id="t03"></a>

### `src/blog/pages/documents/ui/article-page.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-10-28T01:58:54Z

preexisting но всё же, вот эта кухня с `something={slots[something].(document)}`, повторяемая много раз, говорит мне что что-то здесь не так с идиоматичностью, понимаешь о чём я?

---

<a id="t04"></a>

### `src/maya/pages/home/ui/maya-home-page.tsx`:36 — unresolved

```diff
@@ -41,23 +18,22 @@ import {
… 21 lines elided …
+import { messages as mayaMessages } from '@/maya/shared/i18n';
+import { MayaByline, plateNumber } from '@/maya/entities/maya';
 
+import { messages } from '../i18n';
```

**@vzakharov (human)** — 2026-10-28T02:02:27Z

тоже надо as; ещё линтерное правило, что если вещь с одним и тем же именем импортируется из разных модулей, оба импорта должны быть с `as` to avoid confusion. Unless you think it's a bad idea?

---

## Timeline (status, references, and other events)

- **2026-10-16T12:28:50Z** @vzakharov renamed from «feat: Multi-App Sliced Design — src/ as apps composed along a tree» to «feat: Multi-App Sliced Design — src/ as apps composed along a graph».
- **2026-10-16T12:31:05Z** @vzakharov cross-referenced this pull request from [#170 Multi-App Sliced Design: src/ as composed apps](https://github.com/vzakharov/vovazakharov.com/issues/170).
- **2026-10-16T12:31:06Z** @vzakharov cross-referenced this pull request from [#171 MASD core: the app graph, the move, both checkers and the inverted schema registry](https://github.com/vzakharov/vovazakharov.com/issues/171).
- **2026-10-16T21:46:33Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5551116833.
- **2026-10-17T08:15:49Z** @vzakharov cross-referenced this pull request from [#172 Name the site routers by domain: apps/<id>/ → sites/<domain>/](https://github.com/vzakharov/vovazakharov.com/issues/172).
- **2026-10-17T08:15:51Z** @vzakharov cross-referenced this pull request from [#173 Each app owns its namespace of the message catalogue](https://github.com/vzakharov/vovazakharov.com/issues/173).
- **2026-10-17T08:15:52Z** @vzakharov cross-referenced this pull request from [#174 Music as an app: album, artist, song and radio as real pages](https://github.com/vzakharov/vovazakharov.com/issues/174).
- **2026-10-17T08:15:54Z** @vzakharov cross-referenced this pull request from [#175 What is a page in a one-page app: a measure beside insignificant-slice](https://github.com/vzakharov/vovazakharov.com/issues/175).
- **2026-10-17T08:18:14Z** @vzakharov renamed from «feat: Multi-App Sliced Design — src/ as apps composed along a graph» to «feat: #170 Multi-App Sliced Design — src/ as apps composed along a graph».
- **2026-10-20T17:02:43Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5588667192.
- **2026-10-20T17:46:46Z** @vzakharov renamed from «feat: #170 Multi-App Sliced Design — src/ as apps composed along a graph» to «feat: #170 Multi-App Sliced Design — src/ as a graph of apps».
- **2026-10-20T18:17:42Z** @vzakharov cross-referenced this pull request from [#178 refactor: move each site's router from apps/ to sites/<id>/](https://github.com/vzakharov/vovazakharov.com/pull/178).
- **2026-10-24T11:16:43Z** @vzakharov cross-referenced this pull request from [#205 refactor: #170 the catalogue's model joins music/shared/catalogue](https://github.com/vzakharov/vovazakharov.com/pull/205).
- **2026-10-25T19:21:58Z** @vzakharov cross-referenced this pull request from [#207 refactor: #170 the player as music's feature, music's app layer](https://github.com/vzakharov/vovazakharov.com/pull/207).
- **2026-10-26T01:45:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5646475712.
- **2026-10-26T02:28:55Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5646726048.
- **2026-10-26T06:32:02Z** @vzakharov cross-referenced this pull request from [#209 feat(basilisk): file BAS-0027, Ben, hit with a truck for a YouTube video](https://github.com/vzakharov/vovazakharov.com/pull/209).
- **2026-10-26T06:33:43Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/67cc3549297d9409888c87e6447b37a7c5dcf4a9.
- **2026-10-26T06:57:07Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/0449706b51e7ac7e5b5a87ae2d6ecf885852940c.
- **2026-10-26T07:01:45Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/7e757abfa38ef0224298e047c42aac748ef7a78b.
- **2026-10-26T07:21:23Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/00a7d7718170845bac7ff62ad7b9e4a43b6c56a1.
- **2026-10-26T07:21:39Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/14065f2bab19fbcc62b247d2464a4e012d8b9023.
- **2026-10-26T08:44:47Z** @vzakharov cross-referenced this pull request from [#214 refactor: #170 music's pages, each a slice of its own](https://github.com/vzakharov/vovazakharov.com/pull/214).
- **2026-10-27T20:07:33Z** @vzakharov cross-referenced this pull request from [#216 refactor: #170 significance by modularity, the mushroom game in slices](https://github.com/vzakharov/vovazakharov.com/pull/216).
- **2026-10-28T02:05:29Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5676855673.
