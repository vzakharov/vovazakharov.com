# PR #53: feat: build the music catalogue from markdown, in two languages, with a player

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/53
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/music-section-lmf89w
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-16T22:15:57Z
- **Updated:** 2026-09-23T09:45:38Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **`/music` is a content collection, in two languages.** One markdown file per song under `apps/vova/public/music/`, compiled to its own page at build time by the pipeline that already serves case studies and served raw at the same route plus `.md`. One file carries both languages: the language-agnostic half — date, master, project, credits, the words — stays at the top of the frontmatter, and only `title`, `description` and the story are stated per locale. The body is cut on HTML-comment markers (`lang:<locale>` for the story, `lyrics:<language>` for the words), so the authored file still reads as prose wherever it is read raw.
- **The locale is the last segment, as the CV spells it.** `/music`, `/music/<locale>`, `/music/<slug>` and `/music/<slug>/<locale>`, the short forms being aliases of the addressed language rather than pages of their own. The union that parses "a head, optionally a locale" now lives in `shared/i18n` and both callers spell only what differs. That also settles the seam `.claude/rules/content.md` left open — a cut is a dotted suffix, a locale is a trailing segment, and the two positions cannot collide. A slug that reads as a language fails the build, `/music/ru` being the index in Russian.
- **Where the words are not in the reader's language, a crib runs beside them** stanza for stanza; a mismatched stanza count fails the build, a parallel text out by one being worse than none. Each language is one element holding all its stanzas, the rows shared through a subgrid, so a selection stays in one language; a narrow screen scrolls the pair sideways rather than interleaving it. The words are rendered by the page, one element per line, so a line break survives without two invisible spaces at the end of it.
- **A phrase or a line can carry the author's note, genius.com-style.** Authored as a markdown footnote in the lyrics section — `[phrase][^label]` for a phrase, a bare `[^label]` for the line — so the raw file shows it as one; on the page a dotted underline opens it on hover where there is a mouse and on a press everywhere, a click pinning it. A page shows only the notes in its own language, and a marker without a definition, an unused definition or a whole-line note sharing its line fail the build.
- **The player keeps both languages in its queue.** It is mounted by the layout — which is what lets a track survive a navigation — and the layout sits above the segment that names a language, so the bar reads the language off the address — `addressLocale`, the site's locale-in-the-tail convention, now stated whole in `shared/i18n` — and switches with the page instead of stopping the music.
- **The metadata the review asked for lands in the same frontmatter:** `project` as a list with the artist first and features after, validated against a six-project registry; `explicit`, which the scaffolder already read off the master's file name and threw away; `credits.lyrics` and `credits.music` as lists of people in contribution order; and `album` against a registry carrying each release's name — once, or per language where it went out under two. Song dates show to the month — the day a recording carries is the day its project reached git, not the day anything happened.
- **The ten documents are the author's.** Every story and every lyric comes from the review of this PR, verbatim in Russian and translated into English, with the drafts they replace gone. `.claude/rules/content.md` gains the section that says how material with its author in the room is handled, so the next batch does not re-learn it.

Deferred, with tickets: the case studies' title moving into frontmatter is #62 (it feeds two render pipelines that hash their sources); a streaming transcode beside each lossless master is #64; the player bar staying up across the whole site, with a close button, is #82; links to the platforms a song or project is on are #84; phrase notes in ordinary prose, with footnotes in print, are #85.

## QA Checklist

- [ ] `index` — `/music` and `/music/ru` list ten songs newest first, each row a title, its billing, its duration and a play button, with a small square E after the title of the two explicit ones.
- [ ] `song-page` — `/music/slime/en` and `/music/slime/ru` render that locale's title, blurb and story, with the date to the month and the credits where a song has them, and `.md` / `source` at the far end of the facts line.
- [ ] `alias` — `/music/slime` renders the English page and its canonical link points at `/music/slime/en`; `/music` does the same for the index.
- [ ] `lyrics-parallel` — on a page whose language is not the sung one, the words and their crib sit side by side stanza for stanza, each stanza level with its crib; dragging a selection down one column selects only that language; on a phone the pair scrolls sideways and never interleaves.
- [ ] `lyrics-single` — on a page in the sung language, the words run in one column, every line its own line.
- [ ] `line-notes` — on `/music/slime/en` the crib's one noted line and two noted phrases are dotted; with a mouse each opens its English note on hover and closes on leaving, a click pins it until a click outside or Escape; on a phone a tap opens it. `/music/slime/ru` shows the Russian notes on the words instead, and `/music/birdie/ru` shows none.
- [ ] `switch` — the EN/RU chips move between the same song's two pages, and the current one is inert.
- [ ] `playback-across-languages` — start a track, switch language, and it keeps playing with its title in the new language.
- [ ] `queue` — next and previous move through the list and wrap; previous restarts the current track when it is more than 3 s in; shuffle reorders and stepping back through a shuffled queue returns where it came from.
- [ ] `keyboard` — space toggles, `←`/`→` seek 5 s, `shift`+`←`/`→` change track, and none of it fires while focus is in a text field.
- [ ] `media-session` — on a phone, the lock screen shows the song's title in the page's language and its billing, and its buttons drive the same queue.
- [ ] `guards` — a song file missing one locale's `title`, an unknown project, or a stanza count that disagrees with its crib each fail `pnpm build` rather than rendering.
- [ ] `raw-markdown` — `/music/slime.md` serves the authored file, both languages in it.
- [ ] `sitemap` — `/sitemap.xml` lists each song once per language and not the alias.
- [ ] `themes` — the lyric columns and the locale chips are legible in both themes.

| Item                        | Automatable | Covered?     | Notes                                                                        |
| --------------------------- | ----------- | ------------ | ---------------------------------------------------------------------------- |
| `index`                     | yes         | build        | `pnpm build` renders both; appearance checked with `/preview`                |
| `song-page`                 | yes         | build        | ditto, both locales                                                          |
| `alias`                     | yes         | build        | `generateStaticParams` emits all 33 addresses; the canonical is in the head  |
| `lyrics-parallel`           | partly      | build        | the markup builds; alignment and the phone's sideways scroll checked in headless Chromium |
| `lyrics-single`             | yes         | build        | —                                                                            |
| `line-notes`                | partly      | build        | the notes are in the static HTML; hover, pin, outside click and tap driven once through Playwright, not in the suite |
| `switch`                    | yes         | build        | links are static; `current` is derived from the route                        |
| `playback-across-languages` | no          | —            | manual-only: no route to the audio host from this machine                    |
| `queue`                     | yes         | `pnpm test`  | `player-state.test.ts` covers shuffle stability, wrapping, restart threshold |
| `keyboard`                  | partly      | no           | handlers are shared with the queue, which is tested; binding is not          |
| `media-session`             | no          | —            | manual-only, device-specific                                                 |
| `guards`                    | yes         | build        | each is a throw or a schema rejection at read time                           |
| `raw-markdown`              | yes         | build        | `public/` is copied into `out/` verbatim                                     |
| `sitemap`                   | yes         | build        | derived from the collection registry's `localized` flag                      |
| `themes`                    | no          | —            | checked by eye via `/preview`; no automated contrast gate                    |

https://claude.ai/code/session_01YAo9pnqgf8VyXET1RaWz1G

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-16T22:16:17Z — "Proposed squash title/body: ``` feat: build the music catalo…" → [↓](#c01)
- **C02** @vzakharov (human) — 2026-09-22T19:09:56Z — "наверное, после мерджа из мейн некоторые замечания протухли…" → [↓](#c02)
- **C03** @vzakharov (agent) — 2026-09-22T20:35:05Z — "Угадал наполовину: протух один — про сокращение `the-five-pe…" → [↓](#c03)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-16T22:16:17Z

[https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5705354003](https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5705354003)

Proposed squash title/body:

```
feat: build the music catalogue from markdown, in two languages (pr #53)
```

```
The music page was three Spotify embeds and a paragraph, while the
songs sat in 238 Reaper repositories under the vovas-music
organization with no description, topic or README between them —
nothing a site could read. So the catalogue starts by writing it down,
and it is written in both of the languages the songs are sung and
talked about in.

Songs become a content collection: one markdown file per song under
apps/vova/public/music/, compiled to its own page by the pipeline that
serves case studies and served raw at the same route plus .md. One
file carries both languages — only the title, the blurb and the story
are stated per locale, the body cut on HTML-comment markers that
vanish wherever the file is read raw. The mechanical fields are read,
not typed: the duration off the master's FLAC header, the explicit
marker off its file name, the date off the repository's first commit.

The pages put the locale last, as the CV does — /music/<slug>/<locale>,
the short forms aliases of the addressed language — which settles the
collision the content rule left open: a cut is a dotted suffix, a
locale a trailing segment. Where the words are not in the reader's
language a crib runs beside them stanza for stanza, a count that
disagrees failing the build; each language is one element, so a
selection stays in one, and a narrow screen scrolls the pair sideways.
A phrase or a line can carry the author's note, a markdown footnote in
the file that opens on hover or press on the page, and a page shows
only the notes in its own language.

A player rides in the music route's layout, which is what lets a track
keep playing from the index into a song and between its two languages.
It is the audio element itself and no dependency: the work is the
queue, a pure reducer a test covers, handed over as build-time props
so no part of the content pipeline reaches the browser.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (human) on 2026-09-22T19:09:56Z

[https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5782394544](https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5782394544)

наверное, после мерджа из мейн некоторые замечания протухли -- адаптируйся по ситуации

---

<a id="c03"></a>

### Comment by @vzakharov (agent) on 2026-09-22T20:35:05Z

[https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5783724635](https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5783724635)

Угадал наполовину: протух один — про сокращение `the-five-percent.md` субагентом до 300 строк. Main уже принёс ровно этот порядок. Остальные были в силе и отвечены по тредам.

Коротко, что изменилось:

- **Слова:** 9ea9ec8.
- **Заметки к строкам, «genius»:** 106bcfc.
- **Рефакторинг плеера и схемы, убранная заглушка со Spotify:** efff142.
- **Постоянный бар по всему сайту:** вынесен в #82.
- **Четыре «пока не делай, только ответь»** (лейаут и дети, механика локалей, выделение текста, локаль без пропса) — ответы в тредах, без изменений в коде.

---

## Review threads

_52 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/crossroads.md`:2 — unresolved — last: @vzakharov (agent) 2026-09-17T15:30:12Z — "Принято, и это чище, чем строка с «feat.» внутри: массив раз…" → [↓](#t01)
- **T02** `apps/vova/public/music/letim.md`:7 — unresolved — last: @vzakharov (agent) 2026-09-17T16:47:43Z — "Учёл. Альбом заведён как реестр: `album: ctfu` во фронтматте…" → [↓](#t02)
- **T03** `src/pages/music/lib/music-locale.ts`:1 — unresolved — last: @vzakharov (human) 2026-09-23T08:18:52Z — "тут пропустил коммент -- но я так понимаю это та же дискусси…" → [↓](#t03)
- **T04** `src/pages/music/lib/music-route-params.ts`:1 — unresolved — last: @vzakharov (human) 2026-09-23T08:17:53Z — "А можно ли это как-то формализовать в общий, typesafe парсер…" → [↓](#t04)
- **T05** `src/shared/ui/back-to-home.tsx`:14 — unresolved — last: @vzakharov (agent) 2026-09-23T08:12:00Z — "Отчасти ту. Серверная половина лейаута локаль узнать не може…" → [↓](#t05)
- **T06** `apps/vova/public/music/birdie.md`:94 — unresolved — last: @vzakharov (human) 2026-09-23T08:44:54Z — "тут была ошибка в транскрипции, только заметил, должно быть…" → [↓](#t06)
- **T07** `apps/vova/public/music/first.md`:113 — unresolved — last: @vzakharov (human) 2026-09-23T09:30:16Z — "Musima Resonata — классическая гитара восточногерманской фаб…" → [↓](#t07)
- **T08** `apps/vova/public/music/slime.md`:82 — unresolved — last: @vzakharov (human) 2026-09-23T09:34:18Z — "перепроверить капитализацию цитаты, я писал по наитию" → [↓](#t08)
- **T09** `src/pages/music/ui/explicit-badge.tsx`:1 — unresolved — last: @vzakharov (human) 2026-09-23T09:36:50Z — "А тут его же используем? А то выглядит кривовато (опять же v…" → [↓](#t09)
- **T10** `src/pages/music/ui/lyrics.tsx`:46 — unresolved — last: @vzakharov (human) 2026-09-23T09:37:18Z — "хммм, а это что за загагулина?" → [↓](#t10)
- **T11** `src/pages/music/ui/lyrics.tsx`:59 — unresolved — last: @vzakharov (human) 2026-09-23T09:37:48Z — "что значит "held back" тут?" → [↓](#t11)
- **T12** `src/pages/music/ui/music.module.scss`:57 — unresolved — last: @vzakharov (human) 2026-09-23T09:38:55Z — "археология?" → [↓](#t12)
- **T13** `src/pages/music/ui/song-list.tsx`:29 — unresolved — last: @vzakharov (human) 2026-09-23T09:40:46Z — "а зачем мы тут переименовываем explicit в marked?" → [↓](#t13)
- **T14** `src/shared/content/frontmatter.ts`:111 — unresolved — last: @vzakharov (human) 2026-09-23T09:42:58Z — "а поясни пжст, не уезжает ли у нас в результате зод на фронт…" → [↓](#t14)
- **T15** `src/shared/content/lyric-notes.ts`:1 — unresolved — last: @vzakharov (human) 2026-09-23T09:43:55Z — "что-то у нас в shared/content становится много чисто-музычно…" → [↓](#t15)

<a id="t01"></a>

### `apps/vova/public/music/crossroads.md`:2 — unresolved

```diff
@@ -0,0 +1,47 @@
+---
+name: Crossroads
```

**@vzakharov (human)** — 2026-09-17T12:28:34Z

project GENERATED feat. Yoohie

Для feat давай сделаем так: поле project принимает массив, первый элемент считается основным исполнителем, остальные -- "фитами"

**@vzakharov (agent)** — 2026-09-17T15:30:12Z

Принято, и это чище, чем строка с «feat.» внутри: массив разбирать не надо, а плеер и список треков читают его одинаково.

Форма: `project: [GENERATED, Yoohie]` — первый элемент исполнитель, остальные фиты. Схема валидирует каждый элемент по реестру, так что опечатка в названии проекта роняет билд, а не тихо рисует несуществующего артиста.

Правило «фит — это когда песню можно показать тому, кому показываешь другой проект» кладу в `music-projects.ts` рядом с реестром: оно решает каждое будущее назначение и из данных не выводится.

Про этот трек — `[GENERATED, Yoohie]`, сходится с тем, что видно на листинге Cheer The Fuck Up.

---

<a id="t02"></a>

### `apps/vova/public/music/letim.md`:7 — unresolved

```diff
@@ -0,0 +1,49 @@
… 3 lines elided …
+date: 2024-12-27
+status: done
+language: ru
+# project: one of GENERATED, Полуживые, Downtemple
```

**@vzakharov (human)** — 2026-09-17T12:45:45Z

`за/обложкой` (русский поп проект) feat. GENERATED (English metal/core)

с альбома-"компиляции" (но все "артисты" мои) Cheer The Fuck Up:

<img width="300" height="300" alt="Image" src="./attachments/bc3ba650-a1c4-4a45-a390-3c3ae95468fc.png" />

(наверное в лучшем качестве обложку можно взять из репы ctfu)

Кстати, Crossroads и We're Back (для него projects возьми тоже оттуда) оттуда же, а вот полный список:

<img width="367" height="505" alt="Image" src="./attachments/5a6648ed-b237-4f05-a3ea-f2bec2cd38cb.png" />

**@vzakharov (agent)** — 2026-09-17T15:30:18Z

`[за/обложкой, GENERATED]` — и оба уходят в реестр проектов вместе с описанием, что есть что (русский поп / English metal-core), потому что из данных это не выводится.

Про Cheer The Fuck Up: беру. С листинга забираю и проекты для соседей — `crossroads` и `wereback` получают `[GENERATED, Yoohie]`. Обложку возьму из репы `ctfu`, как советуешь.

Альбом предлагаю оформить как реестр в `shared/config` — слаг в фронтматтере песни, а название, исполнитель и обложка в реестре; страниц альбомов в этом PR не делать (§7 плана, вопрос 5). Так CTFU и Vagabond/Скиталец описываются уже сейчас, а работа по страницам остаётся отдельной.

Заодно отмечу очевидное, но приятное: альбом-«компиляция», где все артисты — ты, это довольно точная иллюстрация к тому, зачем вообще нужен реестр проектов с ссылками. Иначе это выглядит как сборник, а не как один человек в шести шапках.

**@vzakharov (human)** — 2026-09-17T15:47:54Z

оставляю с той же целью

**@vzakharov (agent)** — 2026-09-17T16:47:43Z

Учёл. Альбом заведён как реестр: `album: ctfu` во фронтматтере у `letim`, `crossroads` и `wereback`, а Cheer The Fuck Up с его исполнителем — в `shared/config/music-albums.ts` (034e04f). Страница пишет «С альбома Cheer The Fuck Up» под заголовком.

Обложку из репы `ctfu` пока не тащу: в реестре нет поля под неё, и заводить его ради строки, которую никто не рендерит, — лишнее. Появятся страницы альбомов — появится и поле.

Проекты с листинга разложил: `crossroads` и `wereback` — `[GENERATED, Yoohie]`, `letim` — `[за/обложкой, GENERATED]`. Реестр проектов теперь из шести штук, и у каждого может быть канал (t.me/fknball, t.me/papareka) и артист на Spotify — отдельно, потому что это разные вещи: у гостя нет ни того, ни другого, и это как раз то, что делает список фитов и список релизов одним списком, а не двумя.

---

<a id="t03"></a>

### `src/pages/music/lib/music-locale.ts`:1 — unresolved

**@vzakharov (human)** — 2026-09-22T18:10:27Z

чё-то хачный какой-то вариант... пока не меняй, но есть какие-то опции. может лейаут как-то "говорить" со своими детьми?

**@vzakharov (agent)** — 2026-09-22T20:34:40Z

Прямого канала «дети → лейаут» в App Router нет: данные текут только вниз, а лейаут рендерится независимо от страницы, так что страница не может передать ему пропс. Варианты:

1. **`useSelectedLayoutSegments()`** — официальный хук, которым клиентский компонент в лейауте читает активные сегменты под собой. Это и есть «лейаут спрашивает детей», но разбор остаётся: из catch-all придёт `['slime', 'ru']`. Меньше хака по форме, не по сути.
2. **Страница говорит сама.** Крошечный клиентский `<PlayerLocale locale="ru" />` на каждой музыкальной странице кладёт локаль в контекст плеера. Страница берёт её из `params`, где она уже разобрана, так что парсинга нет. Цена — эффект, то есть кадр рассинхрона при навигации; в статическом HTML его не видно, бар до выбора трека не рендерится.
3. **Локаль первым сегментом**, и тогда лейаут `[locale]` получает её из `params`. Подвох: смена языка — это смена сегмента, React пересоздаст всё под ним, и музыка остановится, если плеер не поднять выше `[locale]`. Подробнее — в треде про `music-route-params.ts`.

Я бы взял 2: парсинг уходит, а локаль приходит оттуда же, откуда её берёт сама страница. Пока не трогаю.

**@vzakharov (human)** — 2026-09-23T08:18:52Z

тут пропустил коммент -- но я так понимаю это та же дискуссия что и выше?

---

<a id="t04"></a>

### `src/pages/music/lib/music-route-params.ts`:1 — unresolved

**@vzakharov (human)** — 2026-09-22T18:11:39Z

общее замечание по пиару: что-то вижу очень много какой-то подкапотной механики по рутам-путям-локалям и т.п. Опять же, пока ничего не меняй, но поясни, стандартный ли это подход, если нет, что привело к необходимости вводить такие пляски, и что можно было бы поменять в бОльшей картинке, чтобы они были не нужны?

**@vzakharov (agent)** — 2026-09-22T20:34:41Z

Нет, не стандартный. Стандарт для next-intl — локаль первым сегментом (`app/[locale]/…`) плюс middleware, который редиректит или переписывает адрес без префикса. Наши пляски — от трёх вещей:

1. **Static export.** Middleware нет, как и редиректов с rewrites. Поэтому адрес без локали (`/music/slime`) не может переехать: он обязан быть отдельной страницей-алиасом с canonical на `/en`. Отсюда `LocaleTail`, `localeTailAddresses`, `musicAddressDefaults`.
2. **Локаль последним сегментом**, как у CV (`/cv/cto/ru`). Раз она в хвосте, каждой секции нужен свой optional catch-all, который сам разбирает «слаг, может быть, локаль», и защита от слага, который читается как локаль (`/music/ru`). Отсюда `parseMusicSegments` и проверка в `listSongDocuments`.
3. **Лейаут выше сегмента с локалью** и потому её не видит. Отсюда `pathLocale` в плеере, лейблы на обоих языках в лейауте и пропс `label` у `BackToHome`.

Что поменять в большой картине: локаль первым сегментом — `app/[locale]/…`, `generateStaticParams` на этом уровне, `setRequestLocale` в лейауте. Тогда лейаут и любой серверный компонент знают локаль, catch-all'ы становятся обычными `[slug]`, а `pathLocale`, `parseMusicSegments`, `musicAddressDefaults` и `LocaleTail` уходят. Цена:

- меняются адреса CV, а в статике старые сохраняются только страницами с meta-refresh;
- английский без префикса — либо дублирующее дерево без `[locale]`, либо `/` становится редиректом на `/en`;
- чтобы музыка не останавливалась при смене языка, плеер живёт выше `[locale]`, в корневом лейауте, и это ровно та работа, что в #82.

Если делать — отдельным тикетом, и лучше вместе с #82: оба трогают один корневой лейаут. Пока ничего не меняю.

**@vzakharov (human)** — 2026-09-23T07:52:34Z

Не, локаль первым сегментом это какая-то хрень вообще изначально. Правильно ли я понимаю, что текущая механика фактически формализует конвенцию "локаль у нас в хвосте", причём работать это будет не только для музыки, а в принципе для любых страниц которые мы уже локализуем или будем локализовать (при условии, что они тоже придерживаются этой конвенции)?

**@vzakharov (agent)** — 2026-09-23T08:11:56Z

Да, так и есть. Конвенция теперь целиком лежит в `shared/i18n/locales.ts`, и правило i18n её формулирует. `LocaleTail` и `localeTailAddresses` перечисляют адреса любой секции, `localizedRoute` строит ссылку, `addressLocale` читает локаль из адреса. Последний раньше жил в музыке как `pathLocale`, я его перенёс. 20e0006

На долю секции остаётся одно: разобрать сегменты _перед_ локалью, потому что их форму знает только она. У CV это вариант, у музыки слаг (плюс индекс `/music/ru`). Это `parseCvSegments` и `parseMusicSegments`, по десятку строк. Новая страница с локалью в хвосте получает всё общее даром и пишет только свой разбор.

**@vzakharov (human)** — 2026-09-23T08:17:53Z

А можно ли это как-то формализовать в общий, typesafe парсер сегментов: функцию с текстовым параметром локатора (music, cv и т.д.), объект с ключами-локаторами и значениями-функциями, или что-то такое, И чтобы был чекер/тест/линт, который убеждается, что настроенные app routes этому соответствуют?

---

<a id="t05"></a>

### `src/shared/ui/back-to-home.tsx`:14 — unresolved

```diff
@@ -1,11 +1,17 @@
… 8 lines elided …
-export function BackToHome() {
+export type BackToHomeProps = Partial<Labeled>;
+
+/** The label is a prop because a localized page has to say it in its own language. */
+export function BackToHome({
+  label = '← Back to the home page',
+}: BackToHomeProps) {
```

**@vzakharov (human)** — 2026-09-22T18:41:22Z

а рандомный компонент не может знать про то, в какой мы локали (без парсинга урла -- так что это в тему того же обсуждения выше)? какие-нибудь сторы-шморы, цустанды-шмустанды (хотя вроде это всё про client-side, а у нас статика)? Опять же, just asking for now

**@vzakharov (agent)** — 2026-09-22T20:34:52Z

Серверный компонент — может, и next-intl делает именно это через `setRequestLocale` / `getLocale()`: под капотом React `cache()`, хранилище на время одного рендера. На сборке статики оно работает так же, как на сервере. Подвох в том, кто кладёт значение: лейаут и страница рендерятся независимо, так что положить может только тот, кто сам знает локаль из `params`. Сейчас это только страница — при локали в хвосте лейаут её не знает. Значит, для `BackToHome`, который рендерит страница, такое хранилище сработало бы уже сейчас, а для плеера в лейауте нет.

Zustand и прочие клиентские сторы не помогут: HTML собирается при сборке, и стор должен быть наполнен ещё во время пререндера, то есть кто-то выше опять должен знать локаль. На клиенте это свелось бы к тому же контексту, что уже есть.

Итого: пропс у `BackToHome` — следствие локали в хвосте, а не отсутствия механизма. С локалью первым сегментом (тред про `music-route-params.ts`) он уйдёт сам. Пока не трогаю.

**@vzakharov (human)** — 2026-09-23T07:55:59Z

А можно ли сделать, чтобы лейаут знал про локаль -- по той схеме, которую выше обсудили (если в хвосте en или ru -- значит, это локаль)? Или я не ту проблему пытаюсь решить?

(Если ту и изменение makes sense, то реализуй сразу.)

**@vzakharov (agent)** — 2026-09-23T08:12:00Z

Отчасти ту. Серверная половина лейаута локаль узнать не может: App Router не передаёт ей сегменты ниже неё, а у статической сборки нет запроса, из которого прочитать адрес. Клиентская половина может, и плеер так уже делал. Реализовал то, что имеет смысл: чтение локали из хвоста адреса стало общей функцией `addressLocale` в `shared/i18n`, рядом с остальной конвенцией, и правило i18n это фиксирует. Теперь любой клиентский компонент над страницей читает язык одинаково. 20e0006

`BackToHome` оставил с пропсом. Он серверный и рендерится страницей, а страница язык знает. Чтобы он узнавал язык сам, его пришлось бы сделать клиентским и слать в браузер подписи на обоих языках. Это дороже, чем одна строка, переданная сверху.

---

<a id="t06"></a>

### `apps/vova/public/music/birdie.md`:94 — unresolved

**@vzakharov (human)** — 2026-09-23T08:44:54Z

тут была ошибка в транскрипции, только заметил, должно быть "Но пока, рождённый ползать, я с тобой летаю"

На строке на английском подсказка что это отсылка к "Рожденный ползать — летать не может" из "Песин о Соколе" Горького

---

<a id="t07"></a>

### `apps/vova/public/music/first.md`:113 — unresolved

```diff
@@ -110,6 +110,8 @@ song.
 Где мы споём
 В две гитары с тобой
 
+[^musima-ru]: Musima Resonata — классическая гитара восточногерманской фабрики Musima из Маркнойкирхена, 1960–70-х. [Подробнее](https://share.google/aimode/IK8kPWbhpdjk8fzUI)
```

**@vzakharov (human)** — 2026-09-23T09:30:16Z

Musima Resonata — классическая гитара восточногерманской фабрики Musima, которая была очень популярна в средне-позднем СССР.

---

<a id="t08"></a>

### `apps/vova/public/music/slime.md`:82 — unresolved

```diff
@@ -77,6 +77,12 @@ Halt die Klappe, молчанье на вес
… 2 lines elided …
 
+[^medvedev-ru]: Аллюзия на «Денег нет, но вы держитесь» Медведева.
+
+[^adieu-ru]: Вместе со следующей фразой на немецком — аллюзия на «Adieu, Goodbye, Auf Wiedersehen» (Rammstein — Adieu).
```

**@vzakharov (human)** — 2026-09-23T09:34:18Z

перепроверить капитализацию цитаты, я писал по наитию

---

<a id="t09"></a>

### `src/pages/music/ui/explicit-badge.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-09-23T09:36:50Z

А тут его же используем? А то выглядит кривовато (опять же vertical alignment + size)

<img width="160" height="83" alt="Image" src="https://github.com/user-attachments/assets/54bd6de3-1aff-4000-be8a-8ce6923362c1" />

---

<a id="t10"></a>

### `src/pages/music/ui/lyrics.tsx`:46 — unresolved

```diff
@@ -30,50 +36,82 @@ export function Lyrics({ lyrics, locale }: LyricsProps) {
… 18 lines elided …
+        <Box className={classes['lyricsScroll']}>
+          <Box
+            className={classes['lyricsColumns']}
+            __vars={{ '--stanzas': String(stanzas.length) }}
```

**@vzakharov (human)** — 2026-09-23T09:37:18Z

хммм, а это что за загагулина?

---

<a id="t11"></a>

### `src/pages/music/ui/lyrics.tsx`:59 — unresolved

```diff
@@ -30,50 +36,82 @@ export function Lyrics({ lyrics, locale }: LyricsProps) {
… 32 lines elided …
-function StanzaColumn({ stanzas }: WithStanzas) {
+type LyricsColumnProps = WithStanzas & {
+  lang: Locale;
+  /** The crib column, held back so the sung words read first. */
```

**@vzakharov (human)** — 2026-09-23T09:37:48Z

что значит "held back" тут?

---

<a id="t12"></a>

### `src/pages/music/ui/music.module.scss`:57 — unresolved

```diff
@@ -46,35 +53,38 @@
   font-variant-numeric: tabular-nums;
 }
 
+// One mixin for two pseudo-elements that cannot share a selector list: a
+// browser drops a whole rule over the vendor pseudo it does not know.
```

**@vzakharov (human)** — 2026-09-23T09:38:55Z

археология?

---

<a id="t13"></a>

### `src/pages/music/ui/song-list.tsx`:29 — unresolved

**@vzakharov (human)** — 2026-09-23T09:40:46Z

а зачем мы тут переименовываем explicit в marked?

---

<a id="t14"></a>

### `src/shared/content/frontmatter.ts`:111 — unresolved

```diff
@@ -91,19 +76,39 @@ const songFieldsSchema = baseFrontmatterSchema.extend({
… 33 lines elided …
  * masters, credits, the words — is the bigger half, so a file per locale would
- * duplicate most of it.
+ * duplicate most of it. A key per locale, each required, which is what makes it
+ * exhaustive: a document carrying `en` and no `ru` fails the build instead of
+ * publishing a half-translated catalogue quietly.
  */
-const songFrontmatterSchema = songFieldsSchema.and(localizedTextsSchema);
+const songFrontmatterSchema = songFieldsSchema.extend(
+  byLocale(() => localizedTextSchema),
+);
```

**@vzakharov (human)** — 2026-09-23T09:42:58Z

а поясни пжст, не уезжает ли у нас в результате зод на фронт --  то чего мы хотели избежать через 6a945c8?

---

<a id="t15"></a>

### `src/shared/content/lyric-notes.ts`:1 — unresolved

**@vzakharov (human)** — 2026-09-23T09:43:55Z

что-то у нас в shared/content становится много чисто-музычного. Либо давай в shared/music, либо, что наверное надо было спросить раньше: почему не в какой-то вышележащий слой? есть конфликты по восходящим импортам?

---

## Timeline (status, references, and other events)

- **2026-09-17T01:03:35Z** @vzakharov renamed from «docs: plan the music catalogue and its player» to «feat: build the music catalogue from markdown, with a player».
- **2026-09-17T15:15:35Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/53#pullrequestreview-5235387062.
- **2026-09-17T15:38:15Z** @vzakharov cross-referenced this pull request from [#62 Move the case-study title into frontmatter, as songs do](https://github.com/vzakharov/vovazakharov.com/issues/62).
- **2026-09-17T16:29:26Z** @vzakharov cross-referenced this pull request from [#64 Offer a streaming transcode beside each song's lossless master](https://github.com/vzakharov/vovazakharov.com/issues/64).
- **2026-09-17T16:44:39Z** @vzakharov renamed from «feat: build the music catalogue from markdown, with a player» to «feat: build the music catalogue from markdown, in two languages, with a player».
- **2026-09-22T18:43:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/53#pullrequestreview-5279083632.
- **2026-09-22T20:30:50Z** @vzakharov cross-referenced this pull request from [#82 Keep the player bar up across the whole site, with a close button](https://github.com/vzakharov/vovazakharov.com/issues/82).
- **2026-09-23T08:08:12Z** @vzakharov cross-referenced this pull request from [#84 Link songs and projects to the platforms they are on](https://github.com/vzakharov/vovazakharov.com/issues/84).
- **2026-09-23T08:08:13Z** @vzakharov cross-referenced this pull request from [#85 Notes on a phrase in prose: a popover on screen, a footnote in print](https://github.com/vzakharov/vovazakharov.com/issues/85).
- **2026-09-23T09:45:38Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/53#pullrequestreview-5288750817.
