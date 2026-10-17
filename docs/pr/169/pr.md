# PR #169: feat: #170 Multi-App Sliced Design — src/ as apps composed along a graph

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/169
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/multi-app-sliced-design-7bn3oq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-16T11:59:18Z
- **Updated:** 2026-10-17T08:31:52Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 46e0a5b). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/rules/masd.md`:1 — unresolved — last: @vzakharov (human) 2026-10-17T08:25:09Z — "так, сейчас я вижу изменения только по конкретному коммиту (…" → [↓](#t01)
- **T02** `.claude/rules/styling.md`:7 — unresolved — last: @vzakharov (human) 2026-10-17T08:25:26Z — "проверим глазами, не беда" → [↓](#t02)
- **T03** `apps/basilisk/app/sitemap.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-17T08:31:52Z — "о, твой "1" звучит хорошо и, кажется, вполне идиоматически:…" → [↓](#t03)

---

## Body

## Summary

- **What:** `src/` stops being one Feature-Sliced Design tree and becomes a set of apps — `kernel`, `shell`, `blog`, `vova`, `lsa`, `bible`, `basilisk`, `music`, `mushrooms` — each an FSD tree of its own, composed along a graph in `src/masd.json` where each app lists its parents, declared above it.
- **Why:** FSD's rules are computed over the whole repo, so a self-contained app (music, the mushrooms game) collapses into one `pages/` slice holding everything, and the shared kernel ends up knowing leaf apps (`shared/content` imports the song schema and the basilisk case frontmatter).
- **The rule:** an app that extends `blog` *is* `blog` — an import may target the same app or an ancestor, only a strictly lower layer, through the slice's public API. A site's router only maps URLs to apps, its sitemap included; addresses stay kernel's.
- **This PR is the whole of MASD, eaten in bites** (see the plan). Slice 1, on this branch: the move, both checkers driven by the tree, a cross-app significance check replacing Steiger's `insignificant-slice` (which a spike showed is wrong per app root), the collection registry inverted, imports grouped one app at a time in graph order, and the game on a root layout of its own with a dusk that no longer reads the colour scheme.
- **The rest lands here too**, each slice as a PR based on this branch, opened once the previous one's threads are resolved: sites named by domain, app scripts inside their apps, the message catalogue inverted, music as an app with real pages, and a measure for a one-page app with mushrooms restructured under it.

The plan: `docs/plans/multi-app-sliced-design.paused.md`.

## QA Checklist

- [ ] `builds` — `./scripts/vet.sh` passes: all four sites build, lint, Steiger per app root, `masd-check`, tests.
- [ ] `lattice` — an upward import (`basilisk/entities` → `kernel/features`) and a same-layer cross-app import (`basilisk/entities` → `blog/entities`) each fail `pnpm lint`.
- [ ] `significance` — a `kernel` slice used once inside `kernel` and twice from `blog` passes `masd-check`; one used by a single slice anywhere fails it.
- [ ] `sites` — each of the four sites renders its home, an article, the sitemap and the feed unchanged (`/preview`).
- [ ] `game` — `/mushrooms` renders without the theme toggle, and a fresh meadow opens in full day in a light and a dark system theme alike.
- [ ] `music-links` — vovazakharov.com's home links to `/music`, and a moved song's old URL still lands on the 404's moved-song notice.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `builds` | yes | vet | |
| `lattice` | yes | partly | a fixture test for the generated policies would cover it |
| `significance` | yes | planned | `masd-check.test.ts` |
| `sites` | partly | build only | rendering correctness needs `/preview` |
| `game` | partly | no | `meadowOpening` is pure, so a test can pin a fresh meadow to `FULL_DAY` |
| `music-links` | partly | build only | |

Closes #170
Closes #171

https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe
https://claude.ai/code/session_01S2jJtYpfBsib4tLTc8eM2u

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
owns it. A site's router only maps URLs to apps, its sitemap included.

Both checkers read the graph. eslint-plugin-boundaries generates its
policies from it; Steiger runs once per app root, with
insignificant-slice replaced by scripts/masd-check.ts, which counts a
slice's references across the composition and flags an abstract app
with a single child, because Steiger sees one root's references only.
Imports sort one group per app in graph order, so a file's imports
read as its composition, its own app last.

The game renders on a root layout of its own, without the theme
toggle, and a fresh meadow always opens in full day: dusk is a game
mechanic, not a reading of the colour scheme.

Closes #170
Closes #171

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_3 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `.claude/rules/masd.md`:1 — unresolved — last: @vzakharov (human) 2026-10-17T08:25:09Z — "так, сейчас я вижу изменения только по конкретному коммиту (…" → [↓](#t01)
- **T02** `.claude/rules/styling.md`:7 — unresolved — last: @vzakharov (human) 2026-10-17T08:25:26Z — "проверим глазами, не беда" → [↓](#t02)
- **T03** `apps/basilisk/app/sitemap.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-17T08:31:52Z — "о, твой "1" звучит хорошо и, кажется, вполне идиоматически:…" → [↓](#t03)
- **T04** `eslint/rule-groups/import-sort.ts`:1 — unresolved — last: @vzakharov (agent) 2026-10-17T08:19:11Z — "Сделал. Правило — 542eb9e: группы строятся из `masd.json`, п…" → [↓](#t04)
- **T05** `docs/remove-before-merging/squash-message.md`:6 — unresolved — last: @vzakharov (agent) 2026-10-17T08:19:13Z — "Сделано: #172–#175 закрыты, их содержание перенесено в план…" → [↓](#t05)
- **T06** `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved — last: @vzakharov (agent) 2026-10-17T08:19:14Z — "Записал в план как слайс 3 (d1b8809): `src/<app>/scripts/` к…" → [↓](#t06)

<a id="t01"></a>

### `.claude/rules/masd.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T17:08:24Z

я хотел бы где-то, может на временной ветке или ещё как, сравнить бывший fsd.md против нынешнего masd.md; хочу понять что мы взяли, что удалили, что добавили

**@vzakharov (agent)** — 2026-10-16T21:55:39Z

Сделал ветку `compare/fsd-vs-masd`: от `main`, один коммит, в котором текст `fsd.md` заменён текстом `masd.md`, так что GitHub показывает их как дифф одного файла: https://github.com/vzakharov/vovazakharov.com/compare/main...compare/fsd-vs-masd. Ветка только для чтения и никуда не мёрджится; скажи, когда удалить.

Коротко, что вышло.

**Взяли почти дословно**: описание слоёв, «entity нужно заслужить», куда опускается блок, общий для двух страниц (теперь «в самое нижнее приложение, которое наследуют оба»), `entities/document` без модели, public API, два суффиксных барреля, `shared/lib` без корневого барреля, сегменты по назначению, kebab-case, фабрики страниц в роутере, исключение `no-ui-in-app`, ловушки про Pages Router, `@/`, next-intl и контентный пайплайн. Пути и примеры переписаны на `<app>/<layer>/…`.

**Убрали**
- Отдельное правило `app → pages → … → shared`: теперь это часть модели («своё приложение или предок, строго нижний слой»).
- Обоснование «app layer — это `src/app`» и «страницы всех сайтов лежат рядом в `src/pages/`», то есть ровно то, что MASD заменяет.
- Ловушку про `shared/music-catalogue` и цикл через `collection-schemas.ts`: реестр схем инвертирован, цикла больше нет. Осталась одна строчка про имя `catalogue`.
- «Steiger сам ловит insignificant-slice»: по одному корню он этого посчитать не может.

**Добавили**
- Раздел «The model»: композиция вместо зависимости, тот же слой между приложениями считается импортом вбок, нет барреля на уровне приложения, можно несколько родителей и ромб, приложение без предков — обычный FSD.
- `masd.json`: порядок «родитель выше ребёнка» как проверка ацикличности, insignificant app, «у каждого приложения есть папка, у каждой папки есть запись».
- Три проверки вместо двух, `check:masd` среди них, и `masd-graph.ts` как единственный загрузчик графа.
- Правило, что `app` и `shared` сегментированы, а не нарезаны на слайсы, поэтому потомок накладывает свои на предковые как одно целое. Это исключение FSD для `shared`, протянутое через приложения.
- Раздел про роутеры: роутер только сопоставляет URL с приложениями, sitemap принадлежит ему (`sitemap(mountedRoutes)`), две корневые раскладки через route groups.
- Ловушка: `masd-graph.ts` импортирует относительными путями и с расширениями.

**@vzakharov (human)** — 2026-10-17T08:06:11Z

хорошо, спасибо; эту ветку держать бы в актуальности -- чтобы при любом изменении masd.md можно было прийти в неё и смотреть историю

**@vzakharov (agent)** — 2026-10-17T08:19:09Z

Записал это в план постоянным правилом слона (d1b8809): за каждым коммитом, меняющим `masd.md`, следует коммит в `compare/fsd-vs-masd`. Он заменяет текст `fsd.md` текущим `masd.md`, поверх, без force-push. Так история файла на той ветке и есть история `masd.md` против `fsd.md`. Первый такой коммит уже есть: c4eb491 (в `masd.md` появилась сортировка импортов среди читателей графа).

Открытый вопрос: держать ли это правило и после мерджа, когда план уедет в `docs/masd.md`. Если да, ему нужен дом, который загружается при правке `masd.md`; сейчас такого нет.

**@vzakharov (human)** — 2026-10-17T08:25:09Z

так, сейчас я вижу изменения только по конкретному коммиту (это going forward я и так буду видеть), а мне на той ветке нужно видеть "всё что изменилось относительно fsd", так что я б сказал как раз amend & force push каждый раз, если нет другого механихма.

И нет, после мерджа это не нужно.

---

<a id="t02"></a>

### `.claude/rules/styling.md`:7 — unresolved

```diff
@@ -1,10 +1,10 @@
… 2 lines elided …
 paths:
-  - src/app/styles/**
-  - src/app/ui/theme-provider.tsx
+  - src/kernel/app/styles/**
+  - src/kernel/app/ui/theme-provider.tsx
   - styles/**
-  - src/shared/ui/css-color.ts
+  - src/kernel/shared/ui/css-color.ts
```

**@vzakharov (human)** — 2026-10-16T17:14:22Z

что-то из этого (/kernel) используется в mushrooms? если нет, это в shell

**@vzakharov (agent)** — 2026-10-16T21:55:40Z

Нет: сама игра ничего из этого не использует — ни Mantine, ни токены `--color-*`, ни `cssColor`, ни `prose`. Всё это достаётся ей только транзитом: `(game)/layout.tsx` берёт `RootLayout` из kernel, а он импортирует `globals.scss` и `print.scss` и оборачивает страницу в `ThemeProvider` (Mantine, тема, `ColorSchemeScript`). То есть игра сейчас тащит CSS и провайдер, которые ей не нужны.

В shell получится переносить шире, чем список в `paths:`:
1. `kernel/app/styles/*` и `theme-provider.tsx` → `shell/app/`.
2. `kernel/shared/ui` целиком → `shell/shared/ui`. `css-color.ts` лежит в этом сегменте, а компоненты рядом с ним построены на Mantine и токенах, так что kernel не может оставить их себе, не импортируя shell снизу вверх. Внутри kernel `shared/ui` никто не использует, снаружи — только потомки shell и три скрипта.
3. `RootLayout` kernel-а сжимается до `<html>`, метаданных и аналитики. Шрифты, `mantineHtmlProps`, `ColorSchemeScript`, глобальные стили, `ThemeProvider` и скрипт выбора письменности (его CSS живёт в `globals.scss`) добавляет раскладка shell, вместе с `ThemeCorner`.

Проверять придётся глазами: игра потеряет Mantine-овский reset для `body`, так что нужен её `/preview`. Сделаю, как скажешь.

**@vzakharov (human)** — 2026-10-17T08:25:26Z

проверим глазами, не беда

---

<a id="t03"></a>

### `apps/basilisk/app/sitemap.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T17:19:17Z

почему раньше (ре)экспортили просто функцию, а теперь вызываем?

**@vzakharov (agent)** — 2026-10-16T21:55:41Z

Потому что kernel больше не может сам знать адреса vova и music. Раньше `sitemap.ts` делал `export { default } from '@/app/lib'`, а сам sitemap в `src/app/lib` импортировал `pages/cv` и `pages/music`, чтобы добавить их адреса. Теперь это импорт снизу вверх: vova и music — потомки kernel. Поэтому адреса смонтированных приложений передаёт роутер, а `sitemap(mountedRoutes)` — фабрика, которая возвращает функцию для Next. Передать маршруты аргументом самой этой функции нельзя: Next вызывает default export со своими аргументами.

basilisk, bible и lsa сверх коллекций ничего не монтируют, поэтому у них `sitemap()` без аргументов. Можно было бы экспортировать из kernel ещё и готовую функцию для них, но это было бы второе имя для одного и того же ради пары скобок.

**@vzakharov (human)** — 2026-10-17T08:04:10Z

хмм. подход понял. интересно, какие могут быть альтернативы. сходу пришли в голову, не проверяя на адекватность пока:

1- перечеслять адреса на уровне kernel, типа каталога
2- сделать НАДприложение над всеми (антипод kernel), который может импортить всех, его не может импортить никто
3- что-то ещё до чего я не додумался

что думаешь?

**@vzakharov (agent)** — 2026-10-17T08:19:10Z

По-моему, второй вариант уже реализован: «надприложение, которое может импортить всех и которое не импортит никто» — это и есть роутер. `apps/<site>/app/` вправе входить в public API любого приложения, а импортировать его нельзя; только он один на сайт, а не один на всех. Sitemap у каждого сайта свой, поэтому надприложение над всеми сайтами знало бы о чужих приложениях, и каждому сайту всё равно пришлось бы выбирать из него своё.

Первый вариант, каталог адресов в kernel, работает только для статических адресов, и они уже там лежат (`PAGE_ROUTES`, `COLLECTIONS`, `MUSIC_ROUTE`). Динамические (страницы CV по локалям, адреса каталога музыки) вычисляются из данных приложения: `musicCatalogueRoutes()` читает песни через схему музыки. Чтобы kernel перечислял их сам, ему снова пришлось бы знать схему песен. Это та самая зависимость, которую мы только что инвертировали.

Ещё два варианта, которые я вижу:
1. **Приложение-композиция на каждый сайт в `src/`**: у `vovazakharov-com` родители `vova`, `music`, `mushrooms`. MASD это позволяет (несколько родителей, ромб), и тогда сборка sitemap уходит из роутера в его app layer, а роутер снова только реэкспортирует. По сути это твой вариант 2, но для одного сайта. Цена: четыре приложения, которые ничего не делают, кроме композиции.
2. **Sitemap из результата сборки**: после `next build` пройти `out/` по `*.html` и записать `sitemap.xml`. Перечислять не нужно никому, и sitemap не может пропустить страницу (сейчас папки роутера и константы адресов сверяются вручную, этому посвящён #86). Цена: `lastModified` и приоритеты придётся добирать из данных отдельно, и это шаг после сборки вместо конвенции Next.

Что предлагаю: оставить как есть. Вариант 1 я записал в план как вопрос для слайса 2, где сайты получают имена по доменам и, значит, собственную идентичность (d1b8809). Вариант 2 стоит брать, только если sitemap действительно начнёт расходиться с маршрутами.

**@vzakharov (human)** — 2026-10-17T08:31:52Z

о, твой "1" звучит хорошо и, кажется, вполне идиоматически: vovazaharov.com-как-приложение это и есть то, кому нужно значть про музыку и грибы. НО почему б нам в таком случае не сделать просто

```yaml
vova: [blog, music, mushrooms]
```
или

```yaml
music-routes: [kernel]
mushroom-routes: [kernel]
music: [music-routes]
mushrooms: [mushroom-routes]
vova: [blog, music-routes, mushrooms-routes]
```

или

```yaml
vova-routes: [kernel]
music: [vova-routes]
mushrooms: [vova-routes]
vova: [blog, vova-routes]
```

понимаешь о чём я?

---

<a id="t04"></a>

### `eslint/rule-groups/import-sort.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T17:22:52Z

так... давай подумаем стоит ли группировать таки по аппам, начиная от базовых, типа сначала все импорты из kernel, потом из shell (там где применимо), и только в конце из себя; в каждой группе сортируя как сейчас.

за и против?

нарисуй пока без правок на каком-то показательном примере, как будет

**@vzakharov (agent)** — 2026-10-16T21:55:43Z

Вот как это выглядит на `blog/pages/documents/ui/article-page.tsx`, ничего не меняя в коде.

Сейчас группы идут по слоям, а приложения внутри перемешаны по алфавиту:

```ts
import { Box, Container, Group, Stack } from '@mantine/core';
import { notFound } from 'next/navigation';

import type { ArticleSlots } from '@/blog/shared/article-slots';
import { SITE_CONFIG } from '@/kernel/shared/config';
import { … } from '@/kernel/shared/content';
import { pick } from '@/kernel/shared/lib/collections';
import { constructArticleMetadata } from '@/kernel/shared/seo/index.server-only';
import type { WithParams } from '@/kernel/shared/typings';
import { hoverDim, TextLink } from '@/kernel/shared/ui';

import { ProseContent, SourceList } from '@/blog/entities/document';

import { SiteFooter } from '@/shell/widgets/site-footer';

import { ArticleHeader } from './article-header';
```

По приложениям, от базового к себе, а внутри группы слои как сейчас:

```ts
import { Box, Container, Group, Stack } from '@mantine/core';
import { notFound } from 'next/navigation';

import { SITE_CONFIG } from '@/kernel/shared/config';
import { … } from '@/kernel/shared/content';
import { pick } from '@/kernel/shared/lib/collections';
import { constructArticleMetadata } from '@/kernel/shared/seo/index.server-only';
import type { WithParams } from '@/kernel/shared/typings';
import { hoverDim, TextLink } from '@/kernel/shared/ui';

import { SiteFooter } from '@/shell/widgets/site-footer';

import type { ArticleSlots } from '@/blog/shared/article-slots';
import { ProseContent, SourceList } from '@/blog/entities/document';

import { ArticleHeader } from './article-header';
```

Внутри группы приложения слои идут без пустой строки: в `simple-import-sort` внутренний массив регэкспов сортирует по номеру совпавшего регэкспа, так что группа `blog` — это `['^@/blog/shared/', '^@/blog/entities/', …, '^@/blog/app/']`.

**За**
- Файл читается как композиция: сначала то, что унаследовано от самого базового, в конце своё. По набору групп сразу видно, из каких приложений файл собран.
- «Своё в конце» получается само. Импортировать можно только предков, а предки в `masd.json` объявлены выше, так что порядок групп — это порядок графа, и приложение файла в нём всегда последнее. В роутерах, которые импортируют кого угодно, порядок тот же, графовый и детерминированный.
- Группы генерируются из графа (eslint его и так загружает). Новое приложение — новая группа без правки сортировки.
- Уходит костыль, при котором роутеры сортируют `@/kernel/app` последним, потому что слойная сортировка видит в нём верхний слой.

**Против**
- Слой перестаёт быть первым ключом: у файла из `blog` импорты `kernel/shared` и `blog/entities` попадают в разные группы, и насколько низко файл дотягивается, видно чуть хуже. Внутри группы слойный порядок остаётся.
- Пустых строк больше: по группе на каждое приложение в цепочке. У страницы vova это kernel, shell, blog, vova.
- Один массовый автофикс по всему дереву с шумным диффом. Я бы сделал его отдельным коммитом в этом же PR.

Я за: читается лучше, а настраивается проще, чем сейчас.

**@vzakharov (human)** — 2026-10-17T08:01:29Z

да, ок

**@vzakharov (agent)** — 2026-10-17T08:19:11Z

Сделал. Правило — 542eb9e: группы строятся из `masd.json`, по одной на приложение, слои внутри группы по порядку. Автофикс отдельным коммитом, 1e62af2 (50 файлов, только порядок импортов). `article-page.tsx` вышел ровно таким, как в примере выше, а роутеры больше не ставят `@/kernel/app` в конец.

---

<a id="t05"></a>

### `docs/remove-before-merging/squash-message.md`:6 — unresolved

```diff
@@ -0,0 +1,33 @@
… 1 line elided …
+
+```
+Feature-Sliced Design's rules are computed over the whole repository,
+so a self-contained app collapsed into a single pages/ slice holding
+everything (music, the mushrooms game), and the shared kernel knew the
```

**@vzakharov (human)** — 2026-10-16T17:23:55Z

ирония в том что по состоянию на сейчас ничего не изменилось, хотя обсуждали, например, что у музыки будут отдельная pages/... на каждую, а роутиться они будут внутри /music/app (см. транскрипт самой первой сессии, если из relay-1.md это не видно: https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe)

с грибами отдельная история, пока пропускаем

**@vzakharov (agent)** — 2026-10-16T21:55:44Z

Справедливо. Тело сквоша начинается с того, что музыка схлопнулась в один `pages/`-слайс, а этот PR переносит музыку как есть: `src/music/pages/music/` всё ещё один слайс, и маршрутизация по-прежнему внутри `music-route.tsx`. В первой сессии мы договорились резать это отдельно: `app/` музыки и настоящие страницы альбома, артиста, песни и радио — это слайс 4 плана, #174 (игра — #175). Но из текста сквоша этого не видно, и он читается так, будто проблема уже решена.

Два варианта:
1. Оставить музыку на #174 и переписать тело сквоша честно: этот PR даёт модель, граф и проверки, а музыка и игра переезжают как есть, и их разрезка — это #174 и #175. Рекомендую этот вариант: в PR уже 860 файлов.
2. Затянуть #174 в этот PR.

Какой выбираешь?

**@vzakharov (human)** — 2026-10-17T07:59:14Z

блин, упустил я это. Отдельным слайсом -- это правильно; но все слайсы должны были быть частью этого пиара-слона, а не отдельными тикетами. Закрывай, переноси сюда в виде rest of the elephant.

давай при этом изменим методику выполнения слона: вместо работы на одном пиаре, каждый новый слайс делается пиаром, чья база -- этот; rationale -- слишком много коммитов и веток обсуждений. при этом необходмое условие начала нового слайса -- все комменты на прошлом закрыты (иначе непонятно было бы как вызывать /handle, так как он привязан к одной ветке).

задогфудим такой подход тут, если получится ок перенесём в muthur. но пока мы в любом случае ещё не закончили с этим.

**@vzakharov (agent)** — 2026-10-17T08:19:13Z

Сделано: #172–#175 закрыты, их содержание перенесено в план как `## Rest of the elephant`, а методика записана в его раздел «How this elephant is eaten» (d1b8809). Каждый следующий слайс — PR с базой на этой ветке, и начинается он только тогда, когда все треды на предыдущем закрыты (для слайса 2 это треды #169). #169 теперь закрывает #170 и #171; описание PR и заголовок обновлены.

Остаток слайса 1 записан в плане как `## Rest of the bite`. В нём два решения за тобой: `story.tsx` и перенос того, что игре не нужно, из kernel в shell (тред на `styling.md`). Слайс 2 не начнётся, пока они открыты, по твоему же правилу.

Один вопрос по методике: вливается ли PR слайса в ветку слона до того, как начнётся следующий слайс? Я исхожу из «да», чтобы каждый слайс строился на предыдущем; тогда вопрос только в том, кто нажимает merge, ты или агент по твоему слову.

---

<a id="t06"></a>

### `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T21:45:31Z

вот есть смутное ощущение, что аппо-специфичные скрипты тоже должны жить где-то в своих аппах, как считаешь? а то мы рисовали-рисовали красоты, а в scripts/lib как был граббаг так и остался

**@vzakharov (agent)** — 2026-10-16T21:55:50Z

Ощущение верное. Из 84 файлов в `scripts/lib/` примерно 35 относятся к игре (`play-*`, `mushroom-probe-*`, `veer-*`, `flier-watch`…), около десятка к музыке (`song-*`, `music-*`, `stanza-repeats`…), несколько к basilisk (`basilisk-card`, `docket`) и к vova (`cv-card`). Плюс верхнеуровневые скрипты: `play-mushrooms.ts`, `sweep-mushrooms.ts`, `veer-away.ts`, `scaffold-song.ts`, `check-song-titles.ts`…

Что предлагаю: `src/<app>/scripts/`, папку рядом со слоями приложения. Проверил: Steiger на `src/basilisk` с такой папкой молчит, неизвестную папку в корне он слоем не считает. Тогда:
- скрипт приложения может импортировать своё приложение и его предков через public API (включая `index.node-safe.ts`, для этого он и существует), а в boundaries это ещё один тип элемента, `script`, с теми же правилами наследования. Чужое приложение нельзя, как и везде;
- `scripts/` в корне остаётся за обвязкой репозитория и агента (`vet.sh`, `staged.sh`, `export-github-item.py`, `masd-check.ts`…), а общие помощники для скриптов приложений (`cdp.ts`, `chromium.ts`, `argv.ts`) уезжают в `src/kernel/scripts/`;
- удаление приложения удаляет и его инструменты.

Против: меняются пути в `package.json` и в навыках, которые называют эти скрипты, а питоновские скрипты вроде `letter-basilisk-seal.py` оказываются под `src/`.

Альтернатива попроще — `scripts/<app>/` в корне: тот же склад, только разложенный по полкам, и без правил импорта.

Это сотня файлов и все ссылки на них, так что я бы сделал это отдельным слайсом, а не в этом PR. Завести issue?

**@vzakharov (human)** — 2026-10-17T08:00:01Z

делаем (основной вариант), слайсом слона.

**@vzakharov (agent)** — 2026-10-17T08:19:14Z

Записал в план как слайс 3 (d1b8809): `src/<app>/scripts/` как элемент `script` в boundaries с теми же правилами наследования, общие помощники в `src/kernel/scripts/`, в корневом `scripts/` остаётся обвязка репозитория и агента. Поставил его раньше музыки и игры, чтобы при их перестройке скрипты уже лежали в своих приложениях и переезжали вместе с ними. Переименование сайтов от этого не зависит и остаётся слайсом 2.

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
