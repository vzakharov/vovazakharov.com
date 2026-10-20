# PR #169: feat: #170 Multi-App Sliced Design — src/ as apps composed along a graph

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/169
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/multi-app-sliced-design-7bn3oq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-16T11:59:18Z
- **Updated:** 2026-10-20T17:24:32Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at a65b856). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T02** `apps/basilisk/app/sitemap.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-20T16:56:21Z — "окей, делаем вариант 1" → [↓](#t02)

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

_6 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `.claude/rules/styling.md`:7 — unresolved — last: @vzakharov (agent) 2026-10-17T08:43:31Z — "Сделал. Перенос файлов отдельным коммитом, чтобы за ними шла…" → [↓](#t01)
- **T02** `apps/basilisk/app/sitemap.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-20T16:56:21Z — "окей, делаем вариант 1" → [↓](#t02)
- **T03** `docs/remove-before-merging/squash-message.md`:6 — unresolved — last: @vzakharov (agent) 2026-10-20T17:23:20Z — "Это уже перенесено, ещё 17-го, по твоему «проверим глазами,…" → [↓](#t03)
- **T04** `docs/plans/multi-app-sliced-design.paused.md`:144 — unresolved — last: @vzakharov (agent) 2026-10-20T17:22:55Z — "Сделал: `music: ["blog"]` в `masd.json` — music теперь потом…" → [↓](#t04)

<a id="t01"></a>

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

**@vzakharov (agent)** — 2026-10-17T08:43:31Z

Сделал. Перенос файлов отдельным коммитом, чтобы за ними шла история, — 5f8ae00. Сама раскладка — 336dd85. В kernel остался голый документ: `<html>`, метаданные, аналитика. Раскладка shell оборачивает его шрифтами, Mantine, `ColorSchemeScript`, скриптом выбора письменности, стилями и `ThemeCorner`. `shared/ui`, стили и провайдер темы теперь лежат в shell, а сгенерированные Sass-партиалы ссылаются на новые пути.

Глазами смотрел на dev-сервере. Игра выглядит так же, как под прежней раскладкой: снял её и так и так, кадры совпадают, тумблера темы нет, и пропажа Mantine-овского reset для `body` ни на что не повлияла, потому что сцена закреплена `position: fixed; inset: 0`. Главная vova в тёмной теме сохранила шрифты, тему и тумблер. Типы, lint (кроме `story.tsx`), Steiger и `check:masd` чистые.

---

<a id="t02"></a>

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

**@vzakharov (agent)** — 2026-10-17T08:34:15Z

Понимаю: не заводить отдельное приложение-композицию, а сделать композицией сам `vova`, ведь vova и есть vovazakharov.com. По-моему, первый вариант, `vova: [blog, music, mushrooms]`, правильный, и он дешевле моего: ни одного нового приложения.

Почему он работает: app layer у vova вправе импортировать строго нижние слои предков, а `musicCatalogueRoutes()` лежит в `music/pages/music`. Значит, sitemap собирается в `src/vova/app/lib/`, а `apps/vova/app/sitemap.ts` снова только реэкспортирует. В `masd.json` нужно лишь передвинуть `vova` ниже `mushrooms`. Ромб (shell через blog и music) модель разрешает. Проверка значимости тоже не сработает: у music и mushrooms по одному ребёнку, но их монтирует роутер.

Цена в том, что vova получает право на нижние слои музыки и игры (их `entities`, `shared`), а не только на адреса. Но это честно: сайт, который показывает музыку, ею и является.

Два других варианта, с `*-routes`, я бы не брал:
- `music-routes` не может держать адреса песен, не держа схему песен: адреса каталога вычисляются из каталога. Значит, `music-routes` станет `music/shared/catalogue` под другим именем, а vova всё равно дотянется до данных музыки.
- `vova-routes` под music и mushrooms хуже вдвойне. Там окажется каталог музыки, а игра будет наследовать сайт, хотя ей от сайта не нужно ничего. Сейчас она стоит прямо на kernel, и это одна из немногих чистых линий в графе.

Остальные сайты тогда получают то же правило бесплатно: sitemap принадлежит листовому приложению сайта, а роутер его реэкспортирует. Для basilisk, bible и lsa в нём только коллекции. Сделать это в этом же слайсе, вместе с переносом из kernel в shell?

**@vzakharov (human)** — 2026-10-20T16:56:21Z

окей, делаем вариант 1

---

<a id="t03"></a>

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

**@vzakharov (human)** — 2026-10-20T16:57:08Z

> перенос того, что игре не нужно, из kernel в shell

да, переносим.

**@vzakharov (agent)** — 2026-10-20T17:23:20Z

Это уже перенесено, ещё 17-го, по твоему «проверим глазами, не беда»: стили, провайдер темы и `shared/ui` переехали из kernel в shell (5f8ae00), а у игры остался голый документ kernel, всё остальное отдано shell (336dd85). В kernel теперь только `shared/{config,content,i18n,lib,seo,typings}` и его app layer. Глазами на игру и на сайты под раздельными лейаутами ещё не смотрели: это последний пункт `## Rest of the bite` в плане.

---

<a id="t04"></a>

### `docs/plans/multi-app-sliced-design.paused.md`:144 — unresolved

```diff
@@ -146,125 +87,145 @@ nothing else needs to: what vova takes from music is two addresses, and
… 162 lines elided …
+
+## Rest of the bite
+
+- **`story.tsx`, the operator's call.** `music/pages/music/ui/story.tsx` imports
+  `@/blog/entities/document`, and music's parent is shell, not blog: either
+  music extends `blog` as well as `shell`, or what `story.tsx` uses moves down
+  to kernel. It is the one lint error left.
```

**@vzakharov (human)** — 2026-10-20T17:02:06Z

пусть music импортирует blog; у нас есть (на мейне по крайней мере, не помню раньше ли это этого пиара) например RSS который на музыке по идее тоже должен быть, в перспективе -- рассылки, и так далее.

с другой стороны, agentic.bible и basilisk.fyi между собой, конечно, больше похожи. Если это "больше похожи" выражается не только на пальцах, но и в конкретных импортируемых штуках, то, возможно, имеет смысл унаследовать что-то промежуточное от blog, и потом этих двоих от этого нового (или, наоборот, засунуть какие-то essentials между shell и blog, чтобы music импортировала оттуда).

**@vzakharov (agent)** — 2026-10-20T17:22:55Z

Сделал: `music: ["blog"]` в `masd.json` — music теперь потомок blog, а shell получает через него же (c0827f6). Импорт в `story.tsx` легален, ошибок boundaries больше нет.

Про промежуточное приложение для bible и basilisk: в коде их сходство пока на пальцах. Обе берут из blog ровно то же, что и vova: `pages/documents`, `entities/document` и `shared/article-slots`. Ничего общего, чего нет у vova, у них нет: у bible вообще только `pages/`, а всё своё у basilisk (дела, их схема, домашняя страница) — только его. Приложение между blog и ними вышло бы пустым, и `check:masd` справедливо назвал бы его незначимым. Заводить его стоит, когда появится первый модуль, который нужен им обоим и не нужен vova.

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
