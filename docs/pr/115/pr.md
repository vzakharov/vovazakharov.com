# PR #115: feat(vova): hidden song catalogue, music index tabs, one title shape

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/115
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/music-catalogue-hidden-ldz252
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-07T06:35:11Z
- **Updated:** 2026-10-09T07:50:16Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 20

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at fb83796). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T02** `apps/vova/public/music/nazovi.md`:1 — unresolved — last: @vzakharov (human) 2026-10-09T04:42:34Z — "декабрь 2025" → [↓](#t02)
- **T03** `apps/vova/public/music/assets/artists/generated.jpg`:1 — unresolved — last: @vzakharov (human) 2026-10-09T05:33:37Z — "давай как и эпл музик брать картинки артиста из последнего а…" → [↓](#t03)
- **T04** `apps/vova/public/music/birdie.md`:148 — unresolved — last: @vzakharov (human) 2026-10-09T05:54:40Z — "тогда и тут давай на английском эхом Why should I be fucking…" → [↓](#t04)
- **T05** `apps/vova/public/music/caprice.md`:13 — unresolved — last: @vzakharov (human) 2026-10-09T05:56:07Z — "хм, а где перевод и транслитерация? нужно сделать вет, чтобы…" → [↓](#t05)
- **T06** `apps/vova/public/music/chaos-always-wins.md`:55 — unresolved — last: @vzakharov (human) 2026-10-09T05:56:31Z — "на английском подсказка не нужна" → [↓](#t06)
- **T07** `apps/vova/public/music/heres-to-the-virus.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T06:30:14Z — "давай с восклицательным знаком" → [↓](#t07)
- **T08** `apps/vova/public/music/horizons.md`:48 — unresolved — last: @vzakharov (human) 2026-10-09T06:33:25Z — ""сказываются на нашем отражении" -- кажется, как-то более ли…" → [↓](#t08)
- **T09** `apps/vova/public/music/ignite.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T06:33:49Z — "Зажигаем" → [↓](#t09)
- **T10** `apps/vova/public/music/last-christmas.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T06:35:56Z — "В прошлое Рождество или Прошлым Рождеством, посмотри как луч…" → [↓](#t10)
- **T11** `apps/vova/public/music/mobius.md`:1 — unresolved — last: @vzakharov (human) 2026-10-09T06:39:47Z — "там выше писал про перевод/транслитерацию, но понял, что не…" → [↓](#t11)
- **T12** `apps/vova/public/music/peta.md`:98 — unresolved — last: @vzakharov (human) 2026-10-09T07:24:27Z — ""самой" тут не очень понятно к чему. Можно сказать типа "При…" → [↓](#t12)
- **T13** `apps/vova/public/music/protintro.md`:29 — unresolved — last: @vzakharov (human) 2026-10-09T07:25:26Z — "Trust me отдельным абзацем" → [↓](#t13)
- **T14** `apps/vova/public/music/s74.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T07:26:38Z — "давай просто Ты не терзайся / Do not torment yourself" → [↓](#t14)
- **T15** `apps/vova/public/music/tvoya-l-vina.md`:19 — unresolved — last: @vzakharov (human) 2026-10-09T07:29:08Z — "думаю, в названиях песен, названия которых -- первая строка,…" → [↓](#t15)
- **T16** `apps/vova/public/music/two-girls-one-fridge.md`:33 — unresolved — last: @vzakharov (human) 2026-10-09T07:29:34Z — "аллюзия на two girls one cup (можно без ссылки 🙈 )" → [↓](#t16)
- **T17** `apps/vova/public/music/utro.md`:66 — unresolved — last: @vzakharov (human) 2026-10-09T07:30:42Z — "если там дальше повторения, то просто x(количество раз)" → [↓](#t17)
- **T18** `scripts/check-masked-words.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:32:59Z — "давай всё проверки, связанные с песнями, завяжем на изменени…" → [↓](#t18)
- **T19** `scripts/check-prose-quotes.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:33:40Z — "к этому (и другим аналогичным, захватывающим остальную прозу…" → [↓](#t19)
- **T20** `src/pages/music/lib/music-metadata.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:35:02Z — "а картинки генерим, кстати? и на альбомы, и на песни, и на а…" → [↓](#t20)
- **T21** `src/shared/song/names.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:45:07Z — "shared/music-catalogue? если про это, а то кажется что "song…" → [↓](#t21)

---

## Body

## Summary

- **`hidden: true`** in any document's frontmatter: the page is built and reachable at its address, but no listing carries it — collection indexes, the music player's queue, the sitemap — and the page is marked `noindex`. One predicate, `isListed` in `shared/content`, decides it, applied where documents are listed and never where they are routed. `SHOW_HIDDEN=1 pnpm dev:<site>` makes it list everything, so going back from a hidden song lands on an index that still carries it; a build ignores the variable.
- **A hidden song plays from its own page**: the play control takes a track rather than a queue position, and a track the queue does not hold joins its end (`append` in the player reducer, covered by `player-state.test.ts`).
- **147 masters from `vovas-music` are now song pages, all hidden**, `description: TBD` in both languages, beside the ten songs already on the site. Words come from his Suno profile and his review, set as verse: Suno's control markers, stress marks, drawn-out syllables and pause ellipses do not travel (`.claude/rules/content.md`), while a published poem's own punctuation stays. Two masters not in `vovas-music` (`protintro`, `blues`) are hosted on the site itself under `/music/assets/`, so `repo` is optional.
- **`/music` opens on three lines of intro and a «Shuffle all» button**, which plays the whole public catalogue in a fresh shuffle from its top (`shuffleAll` in the player reducer, tested); the pull quote and the SoundCloud, Suno and GitHub lines are gone.
- **The index is three tabs, Artists / Albums / Songs**, each its own static page — `/music`, `/music/albums`, `/music/songs`, the same under `/music/all/` and in Russian — so `songs` is now a reserved song slug. Artists is a grid of artist tiles (two to a row on a phone, four from `md`); Albums every album newest first, with its artist and years; Songs the full track list. An artist page shows its albums as a cover grid, newest first by the latest song date, since albums carry no release date, and among them the songs on no album that the artist leads, as tiles linking to the song («Single · 2025»); an album page numbers its tracks from `track` and states its length the way streaming services do («10 песен, 33 минуты»). The same pages under `/music/all/…` carry the hidden songs too — `noindex`, out of the sitemap, linked only from hidden songs. On a song page the artists and the album are links, underlined on hover (`NameLink` in `shared/ui`), and so is each artist in the player bar; the credits sit under the lyrics, a line for music and then one for lyrics.
- **Only the song schema stays in `shared`**: `src/shared/song` holds the frontmatter schema and the project and album names it validates against, with an `index.node-safe.ts` for the scaffolder and the tests; how projects and albums are shown, addressed, billed and pictured is `pages/music/lib` (`projects.ts`, `albums.ts`). Seven artists have a picture on the grid and eleven albums a cover — the five newest taken from Apple Music, since their repositories hold none.
- **One title per song**: every one of the 157 songs states its `title` once at the top level, a locale only where it differs, and a gloss as `title: { transliteration, translation }`. The line under a title shows only when the title is in a script the reader doesn't read, its translation with no language prefix (`title-gloss.ts`, with tests; `titleLanguage` stays in the schema, though nothing reads it now), and transliterations are set in italics there and in the lyrics (`_…_`, `lyric-inline.ts`).
- **Second review round's content**: albums «Папа-море» and «We Made AI Sing Our Old Shite», the project «Листопад», credit corrections, about 45 sourced notes on the lyrics, lyrics cut to what is sung (with u4's ending restored), ё written in the Russian columns, and expletives written out — `pnpm check:masked-words`, now in vet, fails on a word masked with asterisks.
- **What made the catalogue possible**: `language` became a list (main language first), with Tatar, Arabic, Polish, Latin, Chinese, French, German, Italian and Spanish; a song sung wholly in one of them shows a crib in the reader's language beside its words. Albums and projects joined their registries, and a project can be billed under another name per language (Yoohie is «Йухи» on Russian pages). The same whole-line `[^label]` ending consecutive lines gives the group one note. `pnpm music:scaffold --spec <file>` takes the master and the authored fields.

**Known, not fixed here**: the PR is `CONFLICTING` with `main`; `/finalize` merges the base.

## For Vova: what is open, so you can overrule it

- **Names that are proposals**: «Онык» for «Минем бабай»; the album `polzat` is titled «Сильней любви» with its slug kept.
- **Slugs** are untouched for now, as you asked, save Киндерштайн's, now `kinderstein` — this is the reminder.
- **Artist pictures** are what Apple Music shows for each artist, mostly its latest release's cover (Vagabond for GENERATED, «Папа-река» for Полуживые).
- **«Минем бабай»** has no Tatar words on file, so its page has no lyrics yet.
- Every guessed master, project and language carries a `<!-- For Vova to check: … -->` comment in its song file: `grep -l "For Vova to check" apps/vova/public/music/*.md`.

## QA Checklist

- [ ] `hidden-off-index` — `/music` and `/ru/music` show only the artists of public songs; the player's next/previous never reaches a hidden song.
- [ ] `show-hidden` — under `SHOW_HIDDEN=1 pnpm dev:vova`, `/music` shows every artist `/music/all` does, and «← Music» from a hidden song keeps them; under plain `pnpm dev:vova`, and in `pnpm build:vova`'s export with the variable set, it shows only the public ones.
- [ ] `hidden-page` — `/music/babay` renders, plays, and the player bar shows it while it plays; next from it goes to the start of the queue.
- [ ] `hidden-sitemap` — no hidden song's address and nothing under `/music/all/` is in `/sitemap.xml`.
- [ ] `hidden-noindex` — a hidden song's page and every `/music/all/…` page carry `<meta name="robots" content="noindex">`; a public song's page does not.
- [ ] `intro` — `/music` and `/music/ru` open on three lines of intro, no pull quote, no SoundCloud, Suno or GitHub line.
- [ ] `shuffle-all` — «Shuffle all» («Всё вперемешку») starts the player on a shuffled public queue from its top, with shuffle on; pressing it again starts a different order.
- [ ] `index-tabs` — `/music` heads its list with Artists / Albums / Songs, Artists current; `/music/albums` lists every album newest first under artist · years; `/music/songs` lists every public song; each tab works under `/music/all/` and in Russian (`/music/albums/ru`), and the language switch keeps the tab.
- [ ] `artist-grid` — the Artists tab is a grid of artist tiles, four to a row on desktop and two on a phone, each name said once; a tile's name opens the artist.
- [ ] `artist-singles` — `/music/all/artists/generated` shows `crossout` among its albums as a tile «Single · 2024» opening the song; `chp` (Yoohie featuring за/обложкой) is a tile on Йухи's page and not on за/обложкой's.
- [ ] `player-billing` — while a featured song plays, each artist in the player bar links to their page; the lock screen shows the billing as plain text.
- [ ] `song-credits` — `/music/40days` shows «Music: Vladimir Zakharov Sr.» then «Words: Vladimir Zakharov Sr.» under its lyrics, and nothing about credits in the line under the title; a song with no `credits` shows no such line.
- [ ] `artist-pictures` — on `/music/all` the tiles of GENERATED, Полуживые, Downtemple, за/обложкой, Йухи, Trending Today and Дамы и господа show a picture; the rest show their name.
- [ ] `album-grid` — `/music/all/artists/poluzhivye` shows its albums as tiles, covers on «Папа-река» and «Кому на Руси жить хорошо», newest first.
- [ ] `quran-notes` — `/music/mithqal/ru` carries a note on each verse's first appearance naming its sura and verse, each linking to quran.com's Russian page; `/music/mithqal/en` the same in English.
- [ ] `succumb-note` — `/music/succumb/ru` carries the so come / succumb note and, on the first «Не хочу быть рабом своего гнева», the note that the refrain is the person answering his anger; `/music/succumb/en` carries only the latter.
- [ ] `album-page` — `/music/all/albums/papa-more` numbers its tracks and states its length on its own line under artist · year («N песен, M минут» on the Russian page).
- [ ] `song-links` — on a song page the artists and album are links, underlined only on hover; a hidden song's links go to `/music/all/…`.
- [ ] `everything-index` — `/music/all/en` lists all 157 songs, `/music/all/ru` the same in Russian.
- [ ] `title-gloss` — `/music/agios-o-skopos` shows «Agios o Skopos · Holy Is the Purpose» under its English title, the transliteration in italics, and no line under «Предназначение» on the Russian page.
- [ ] `lyric-italics` — `/music/in-the-flesh` sets _Poekhali!_ in italics in its English column.
- [ ] `retitled` — `/music/protintro` is titled “Hello, Human”, glossed «Здравствуй, человек» on the Russian page.
- [ ] `new-albums` — «Папа-море», «We Made AI Sing Our Old Shite» and the project «Листопад» each have a page under `/music/all/…`.
- [ ] `yo` — `/ru/music/rank` writes ё in its Russian column (нём, её, ещё).
- [ ] `unmasked` — `/music/fuck-religion` writes its expletives out; a masked word added to any song fails `pnpm check:masked-words`.
- [ ] `multi-line-note` — `/music/wangwei` shows one note over the three lines it covers.
- [ ] `site-master` — `/music/protintro` and `/music/blues` play from `/music/assets/` and show no «source» link.
- [ ] `multi-language` — `/music/trisagion` names Russian, Latin and English, in that order, in both locales; `/music/babay` names Tatar.
- [ ] `localized-project` — a Yoohie song (e.g. `/music/because-of-you-2`) is billed «Йухи» on its Russian page and in the player bar, and «Yoohie» everywhere in English.
- [ ] `scaffold-spec` — `pnpm music:scaffold --spec <file>` on a spec naming a master in a repository with several root FLACs writes a song file in the new title shape that passes `pnpm format:check`.

| Item                | Automatable | Covered? | Notes                                                                       |
| ------------------- | ----------- | -------- | --------------------------------------------------------------------------- |
| `hidden-off-index`  | e2e         | ❌       | Build, then assert the exported `/music` HTML holds no hidden-only artist   |
| `show-hidden`       | e2e         | ❌       | Done by hand in dev: 5 artists without the flag, 12 with it, as `/music/all` |
| `hidden-page`       | e2e         | ❌       | Drive the built page in a headless browser, press play, read the bar        |
| `hidden-sitemap`    | e2e         | ❌       | Grep `out/sitemap.xml` for every hidden slug and `/music/all/`              |
| `hidden-noindex`    | e2e         | ❌       | Grep the exported pages for the robots meta                                 |
| `intro`             | manual-only | —        | Copy and layout read on the page                                            |
| `shuffle-all`       | unit        | ✅       | `player-state.test.ts` — fresh order from its top, stays shuffled; the button is manual |
| `index-tabs`        | e2e         | ❌       | Assert the export has each tab's page in both catalogues and locales        |
| `artist-grid`       | manual-only | —        | Tile layout and wrapping across breakpoints                                 |
| `artist-singles`    | unit        | ❌       | `artistReleases` is pure: singles under the lead artist only, newest first  |
| `player-billing`    | unit        | ✅       | `player-state.test.ts` — `billingText`; the links in the bar are manual     |
| `song-credits`      | e2e         | ❌       | Assert on the exported song page's credit lines and their order             |
| `artist-pictures`   | e2e         | ❌       | Seen in the build: the four public artists' pictures are in `/music`'s HTML |
| `album-grid`        | unit        | ❌       | Album order by latest song date, ties in registry order                     |
| `quran-notes`       | e2e         | ❌       | The build fails on a dangling note; the links were checked to answer 200    |
| `succumb-note`      | e2e         | ❌       | Assert on the exported HTML of both locales                                 |
| `album-page`        | unit        | ✅       | `duration.test.ts` — length line and plurals; track column is manual        |
| `song-links`        | manual-only | —        | Hover styling on the rendered page                                          |
| `everything-index`  | e2e         | ❌       | Grep the exported `/music/all/en` HTML for every slug                       |
| `title-gloss`       | unit        | ✅       | `title-gloss.test.ts` — which locale shows which gloss; italics are manual  |
| `lyric-italics`     | unit        | ✅       | `lyric-inline.test.ts` — `_…_` marks and escaped underscores                |
| `retitled`          | e2e         | ❌       | Grep the exported page's `<h1>` per locale                                  |
| `new-albums`        | e2e         | ❌       | Assert the exported album and project pages exist                           |
| `yo`                | manual-only | —        | Which words take ё is a reading in context                                  |
| `unmasked`          | unit        | ✅       | `check-masked-words.test.ts`, and the gate runs in vet                      |
| `multi-line-note`   | unit        | ✅       | `lyric-notes.test.ts` — consecutive lines sharing a label                   |
| `site-master`       | e2e         | ❌       | Assert the exported page's audio `src` is the site path                     |
| `multi-language`    | unit        | ❌       | Frontmatter schema reads a string or a list into a list                     |
| `localized-project` | unit        | ✅       | `music-projects.test.ts` — the name per locale; the rendering is manual     |
| `scaffold-spec`     | integration | ❌       | Run the CLI on a fixture spec, compare the written file                     |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_015tjJ7Lp81228tVcuqYLP6d

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-07T06:35:29Z — "Proposed squash title/body: ``` feat(vova): hidden song cata…" → [↓](#c01)
- **C02** @vzakharov (human) — 2026-10-08T21:08:23Z — "почему-то затерялись два комментария, не вижу для них даже п…" → [↓](#c02)
- **C03** @vzakharov (agent) — 2026-10-08T21:27:24Z — "Оба не потерялись, а не показываются: в PR 310 изменённых фа…" → [↓](#c03)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-07T06:35:29Z

[https://github.com/vzakharov/vovazakharov.com/pull/115#issuecomment-6032423822](https://github.com/vzakharov/vovazakharov.com/pull/115#issuecomment-6032423822)

Proposed squash title/body:

```
feat(vova): hidden song catalogue, music index tabs, one title shape (pr #115)
```

```
The vovas-music organization holds far more masters than the site
lists, most of them not ready to show. A document now takes
`hidden: true`: its page is built and served at its address, but no
listing, player queue or sitemap carries it, and it is noindex. One
predicate in shared/content decides what is listed, and lists
everything under `SHOW_HIDDEN=1 pnpm dev:<site>`, never in a build. A
hidden song plays from its own page, joining the end of the queue.

147 masters land as hidden song pages, their words set as verse with
sourced notes: Suno's markers, drawn-out syllables and pause ellipses
do not travel, Russian is written with ё, and expletives are written
out, which the check:masked-words vet gate holds.

/music opens on a short intro and a "Shuffle all" button, then tabs
for artists, albums and songs, each a static page; an artist page
shows its albums and singles as covers, newest first, and an album
page numbers its tracks and states its length. Twins under /music/all
carry the hidden songs too, noindex and out of the sitemap. Artists
link from the song page and the player bar, credits sit under the
lyrics, and only the song schema lives in shared/song. A song states
its title once, a locale only where it differs, with a
{transliteration, translation} gloss shown to a reader who cannot read
the title's script.

To carry the catalogue, a song's language is a list, main language
first, with nine languages added; albums and projects join their
registries, a project can be billed under another name per language,
and music:scaffold takes a spec naming the master and its fields.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (human) on 2026-10-08T21:08:23Z

[https://github.com/vzakharov/vovazakharov.com/pull/115#issuecomment-6069084532](https://github.com/vzakharov/vovazakharov.com/pull/115#issuecomment-6069084532)

почему-то затерялись два комментария, не вижу для них даже поля ответ:

https://github.com/vzakharov/vovazakharov.com/pull/115#discussion_r4219153134

https://github.com/vzakharov/vovazakharov.com/pull/115#discussion_r4223096349

---

<a id="c03"></a>

### Comment by @vzakharov (agent) on 2026-10-08T21:27:24Z

[https://github.com/vzakharov/vovazakharov.com/pull/115#issuecomment-6069380419](https://github.com/vzakharov/vovazakharov.com/pull/115#issuecomment-6069380419)

Оба не потерялись, а не показываются: в PR 310 изменённых файлов, а GitHub во вкладке файлов рисует только первые 300 — sultan.md и utro.md по алфавиту в хвосте, так что ветки на них там не видны и ответить в них негде. На оба я уже ответил в самих ветках, обе правки в a8d1017:

- [«Побег»](https://github.com/vzakharov/vovazakharov.com/pull/115#discussion_r4223701354): Виктор «Никсон» Сазонов добавлен к папе в авторы музыки (в pobeg.md);
- [«Доброе утро»](https://github.com/vzakharov/vovazakharov.com/pull/115#discussion_r4223701602): слова и музыка — «Славик, друг Андрея Мокрушина».

Ссылки выше открывают ветки и на вкладке Conversation.

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (human) — COMMENTED

_2026-10-08T19:16:55Z_

[https://github.com/vzakharov/vovazakharov.com/pull/115#pullrequestreview-5461709471](https://github.com/vzakharov/vovazakharov.com/pull/115#pullrequestreview-5461709471)

см. ниже

_186 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/f-ec.md`:1 — unresolved — last: @vzakharov (agent) 2026-10-08T20:29:14Z — "Работа по этому ревью закончена — напоминаю про слаги, как т…" → [↓](#t01)
- **T02** `apps/vova/public/music/nazovi.md`:1 — unresolved — last: @vzakharov (human) 2026-10-09T04:42:34Z — "декабрь 2025" → [↓](#t02)
- **T03** `apps/vova/public/music/assets/artists/generated.jpg`:1 — unresolved — last: @vzakharov (human) 2026-10-09T05:33:37Z — "давай как и эпл музик брать картинки артиста из последнего а…" → [↓](#t03)
- **T04** `apps/vova/public/music/birdie.md`:148 — unresolved — last: @vzakharov (human) 2026-10-09T05:54:40Z — "тогда и тут давай на английском эхом Why should I be fucking…" → [↓](#t04)
- **T05** `apps/vova/public/music/caprice.md`:13 — unresolved — last: @vzakharov (human) 2026-10-09T05:56:07Z — "хм, а где перевод и транслитерация? нужно сделать вет, чтобы…" → [↓](#t05)
- **T06** `apps/vova/public/music/chaos-always-wins.md`:55 — unresolved — last: @vzakharov (human) 2026-10-09T05:56:31Z — "на английском подсказка не нужна" → [↓](#t06)
- **T07** `apps/vova/public/music/heres-to-the-virus.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T06:30:14Z — "давай с восклицательным знаком" → [↓](#t07)
- **T08** `apps/vova/public/music/horizons.md`:48 — unresolved — last: @vzakharov (human) 2026-10-09T06:33:25Z — ""сказываются на нашем отражении" -- кажется, как-то более ли…" → [↓](#t08)
- **T09** `apps/vova/public/music/ignite.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T06:33:49Z — "Зажигаем" → [↓](#t09)
- **T10** `apps/vova/public/music/last-christmas.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T06:35:56Z — "В прошлое Рождество или Прошлым Рождеством, посмотри как луч…" → [↓](#t10)
- **T11** `apps/vova/public/music/mobius.md`:1 — unresolved — last: @vzakharov (human) 2026-10-09T06:39:47Z — "там выше писал про перевод/транслитерацию, но понял, что не…" → [↓](#t11)
- **T12** `apps/vova/public/music/peta.md`:98 — unresolved — last: @vzakharov (human) 2026-10-09T07:24:27Z — ""самой" тут не очень понятно к чему. Можно сказать типа "При…" → [↓](#t12)
- **T13** `apps/vova/public/music/protintro.md`:29 — unresolved — last: @vzakharov (human) 2026-10-09T07:25:26Z — "Trust me отдельным абзацем" → [↓](#t13)
- **T14** `apps/vova/public/music/s74.md`:18 — unresolved — last: @vzakharov (human) 2026-10-09T07:26:38Z — "давай просто Ты не терзайся / Do not torment yourself" → [↓](#t14)
- **T15** `apps/vova/public/music/tvoya-l-vina.md`:19 — unresolved — last: @vzakharov (human) 2026-10-09T07:29:08Z — "думаю, в названиях песен, названия которых -- первая строка,…" → [↓](#t15)
- **T16** `apps/vova/public/music/two-girls-one-fridge.md`:33 — unresolved — last: @vzakharov (human) 2026-10-09T07:29:34Z — "аллюзия на two girls one cup (можно без ссылки 🙈 )" → [↓](#t16)
- **T17** `apps/vova/public/music/utro.md`:66 — unresolved — last: @vzakharov (human) 2026-10-09T07:30:42Z — "если там дальше повторения, то просто x(количество раз)" → [↓](#t17)
- **T18** `scripts/check-masked-words.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:32:59Z — "давай всё проверки, связанные с песнями, завяжем на изменени…" → [↓](#t18)
- **T19** `scripts/check-prose-quotes.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:33:40Z — "к этому (и другим аналогичным, захватывающим остальную прозу…" → [↓](#t19)
- **T20** `src/pages/music/lib/music-metadata.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:35:02Z — "а картинки генерим, кстати? и на альбомы, и на песни, и на а…" → [↓](#t20)
- **T21** `src/shared/song/names.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-09T07:45:07Z — "shared/music-catalogue? если про это, а то кажется что "song…" → [↓](#t21)

<a id="t01"></a>

### `apps/vova/public/music/f-ec.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-07T10:44:20Z

так, только ща понял, что у нас же слаги сикось-накось. Пока не правим, чтобы не поломать дифф, но как доделаешь работу по этому ревью напомни мне чтоб я не забыл.

**@vzakharov (agent)** — 2026-10-07T13:00:59Z

Слаги не трогал, в конце работы по ревью напомню.

**@vzakharov (agent)** — 2026-10-08T20:29:14Z

Работа по этому ревью закончена — напоминаю про слаги, как ты просил: «так, только ща понял, что у нас же слаги сикось-накось. Пока не правим, чтобы не поломать дифф, но как доделаешь работу по этому ревью напомни мне чтоб я не забыл».

---

<a id="t02"></a>

### `apps/vova/public/music/nazovi.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-07T11:33:25Z

О что случайно нашёл, оказывается альбом я уже называл и список песен составлял:

Ни для кого и для всех

1. Просто устал (3:18)
2. На пальцы (4:45)
3. Я куплю тебе дом (4:52)
4. Назови меня по имени (3:51)
5. Там (3:28)
6. Метель (4:17)
7. Призрачный блюз (2:56)
8. Уходи (3:54)
9. Окна (4:45)

так что предыдущий запрос про 5 песен изменить на эти 9 песен пока

**@vzakharov (agent)** — 2026-10-07T13:01:42Z

Сделал альбом «Ни для кого и для всех» по твоему списку, вместо тех пяти — e7302ed. Нет только трека 7 «Призрачный блюз»: в каталоге для него нет мастера (ghost.md — это английский «Ghost of Yesterday» Downtemple). Где он лежит?

**@vzakharov (human)** — 2026-10-07T17:38:22Z

[Призрачный блюз.mp3](./attachments/default.mp3)

```
￼

[Acoustic Intro]

[Verse 1]

Сколько долгих лет
Вдоль по дорогам
Где цели нет
Да и причин немного

Не умирает
Кто не живёт
При́зрачный блюз
По пути
Туда где никто не ждёт

[Verse 2, dubstep build up]

Перевернуть
Всё, что не сбы́лось
Ты выбрал путь
Или тебя он выбрал

Кто не узнает
Тот и поймёт
Призрачный блюз
Ты иди
Куда-то да приведёт

[Drop and sax solo]

[Coda]

Не умирает
Кто не живёт
При́зрачный блюз
Ты иди
Куда-то да приведёт
```

Автор музыки -- Андрей Мокрушин

**@vzakharov (agent)** — 2026-10-07T19:00:30Z

Сделал скрытую страницу «Призрачный блюз» (`blues`), трек 7 в «Ни для кого и для всех», музыка Андрея Мокрушина, мастер лежит на сайте (`/music/assets/blues.mp3`), английский подстрочник — cbd8bbd. Дата пока сегодняшняя — когда песня сделана?

**@vzakharov (human)** — 2026-10-09T04:42:34Z

декабрь 2025

---

<a id="t03"></a>

### `apps/vova/public/music/assets/artists/generated.jpg`:1 — unresolved

**@vzakharov (human)** — 2026-10-09T05:33:37Z

давай как и эпл музик брать картинки артиста из последнего альбома программно, а не держать их отдельно

---

<a id="t04"></a>

### `apps/vova/public/music/birdie.md`:148 — unresolved

```diff
@@ -137,11 +139,13 @@ So fucking high!
… 1 line elided …
 Aren’t there girls enough, what do I want with this untouchable one?
 Too much honour, chasing you over roofs and treetops?
-Why the fuck would I be the sad one, what did you even do to me?
+[Why the fuck would I be the sad one][^marfusha-en], what did you even do to me?
 They’re right, you know, women are nothing but trouble:
 I’ll forget you and drive on,
 And I don’t care who you’re with or where you are.
 
+[^marfusha-en]: An echo of «Эх, Марфуша, нам ли быть в печали!» — “Oh, Marfusha, why should we be sad!” — sung by Bunsha, the false tsar, at the feast in Gaidai’s [_Ivan Vasilievich: Back to the Future_](https://en.wikipedia.org/wiki/Ivan_Vasilievich:_Back_to_the_Future).
+
```

**@vzakharov (human)** — 2026-10-09T05:54:40Z

тогда и тут давай на английском эхом Why should I be fucking sad

---

<a id="t05"></a>

### `apps/vova/public/music/caprice.md`:13 — unresolved

```diff
@@ -1,19 +1,19 @@
… 12 lines elided …
 explicit: false
 hidden: true
 en:
-  title: 'Каприс Каркасси'
```

**@vzakharov (human)** — 2026-10-09T05:56:07Z

хм, а где перевод и транслитерация? нужно сделать вет, чтобы для песен на *не*английском всегда была транслитерация и перевод названия в английском, для песен на английском -- перевод

---

<a id="t06"></a>

### `apps/vova/public/music/chaos-always-wins.md`:55 — unresolved

```diff
@@ -50,7 +50,9 @@ Building your utopia, but we were always near.
… 1 line elided …
 
 This ain’t your playground,
-It’s another plague round!
+It’s another [plague round][^plague-round-en]!
+
+[^plague-round-en]: A homophone of “playground,” the line before.
```

**@vzakharov (human)** — 2026-10-09T05:56:31Z

на английском подсказка не нужна

---

<a id="t07"></a>

### `apps/vova/public/music/heres-to-the-virus.md`:18 — unresolved

```diff
@@ -11,11 +12,10 @@ album: ghosts
… 6 lines elided …
-  title: 'Here’s to the Virus'
-  titleTranslation: 'За вирус'
+  title:
+    translation: 'За вирус'
```

**@vzakharov (human)** — 2026-10-09T06:30:14Z

давай с восклицательным знаком

---

<a id="t08"></a>

### `apps/vova/public/music/horizons.md`:48 — unresolved

```diff
@@ -53,16 +45,8 @@ Watching from within the darkness at a newborn day, taking grievance at its unbr
… 5 lines elided …
-Сказываются на нашем отражении
-До точки перелома,
-Где уже ничто не может дать нам покоя.
+Дыры в наших сердцах, трещины в нашем доверии сказываются на нашем отражении до точки перелома, где уже ничто не может дать нам покоя.
```

**@vzakharov (human)** — 2026-10-09T06:33:25Z

"сказываются на нашем отражении" -- кажется, как-то более литературно можно сказать

---

<a id="t09"></a>

### `apps/vova/public/music/ignite.md`:18 — unresolved

```diff
@@ -11,11 +12,10 @@ album: ignite
… 6 lines elided …
-  title: 'Ignite'
-  titleTranslation: 'Вспыхнуть'
+  title:
+    translation: 'Вспыхнуть'
```

**@vzakharov (human)** — 2026-10-09T06:33:49Z

Зажигаем

---

<a id="t10"></a>

### `apps/vova/public/music/last-christmas.md`:18 — unresolved

```diff
@@ -11,11 +12,10 @@ album: nsfl
… 6 lines elided …
-  title: 'Last Christmas'
-  titleTranslation: 'Прошлое Рождество'
+  title:
+    translation: 'Прошлое Рождество'
```

**@vzakharov (human)** — 2026-10-09T06:35:56Z

В прошлое Рождество или Прошлым Рождеством, посмотри как лучше (в тексте соответстенно)

---

<a id="t11"></a>

### `apps/vova/public/music/mobius.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-09T06:39:47Z

там выше писал про перевод/транслитерацию, но понял, что не всегда язык заголовка совпадает с языком песни (например, в инструментальных нет языка). Давай правило: titleLanguage вверху фронтматтера, если любое из следующего: а) отличается от языка песни, б) у песни несколько языков, в) песня инструментальная

---

<a id="t12"></a>

### `apps/vova/public/music/peta.md`:98 — unresolved

```diff
@@ -88,7 +90,9 @@ Once and for all.
… 9 lines elided …
+Положить конец их страданиям[^peta-ru]
+Раз и навсегда.[^peta-ru]
+
+[^peta-ru]: Приют самой PETA в Норфолке (Вирджиния) усыпляет большинство животных, которых принимает, — [по её же отчётам властям штата](https://en.wikipedia.org/wiki/People_for_the_Ethical_Treatment_of_Animals#Euthanasia), 95% в 2011 году и больше 80% в 2014-м, — и называет это милосердием.
```

**@vzakharov (human)** — 2026-10-09T07:24:27Z

"самой" тут не очень понятно к чему. Можно сказать типа "Приют PETA -- название которой обыгрывает название песни --"

---

<a id="t13"></a>

### `apps/vova/public/music/protintro.md`:29 — unresolved

```diff
@@ -10,42 +11,27 @@ seconds: 77
… 29 lines elided …
-Uncover the harmony within the chaos and lend an ear to uncertainty.
-For in the dissonance, you will find your verity.
-Trust me.
+Do not fear the strange, the unknown, the eerie. Uncover the harmony within the chaos and lend an ear to uncertainty. For in the dissonance, you will find your verity. Trust me.
```

**@vzakharov (human)** — 2026-10-09T07:25:26Z

Trust me отдельным абзацем

---

<a id="t14"></a>

### `apps/vova/public/music/s74.md`:18 — unresolved

```diff
@@ -12,13 +13,12 @@ hidden: true
 credits:
   lyrics: ['William Shakespeare']
 en:
-  title: 'Ты не терзайся и когда за мной'
-  transliteration: 'Ty ne terzaysya i kogda za mnoy'
-  titleTranslation: 'Do not torment yourself, and when for me'
+  title:
+    transliteration: 'Ty ne terzaysya i kogda za mnoy'
+    translation: 'Do not torment yourself, and when for me'
```

**@vzakharov (human)** — 2026-10-09T07:26:38Z

давай просто Ты не терзайся / Do not torment yourself

---

<a id="t15"></a>

### `apps/vova/public/music/tvoya-l-vina.md`:19 — unresolved

```diff
@@ -13,13 +14,12 @@ hidden: true
 credits:
   lyrics: ['William Shakespeare', 'Самуил Маршак']
 en:
-  title: 'Твоя ль вина, что милый образ твой'
-  transliteration: 'Tvoya l vina, chto milyy obraz tvoy'
-  titleTranslation: 'Is it your fault that your dear image'
+  title:
+    transliteration: 'Tvoya l vina, chto milyy obraz tvoy'
+    translation: 'Is it your fault that your dear image'
```

**@vzakharov (human)** — 2026-10-09T07:29:08Z

думаю, в названиях песен, названия которых -- первая строка, в конце стоит ставить многоточие?

---

<a id="t16"></a>

### `apps/vova/public/music/two-girls-one-fridge.md`:33 — unresolved

**@vzakharov (human)** — 2026-10-09T07:29:34Z

аллюзия на two girls one cup (можно без ссылки 🙈 )

---

<a id="t17"></a>

### `apps/vova/public/music/utro.md`:66 — unresolved

```diff
@@ -59,15 +60,15 @@ ru:
… 4 lines elided …
-Моя (моя) любовь (любовь)
-Когда увижу (когда увижу)
-Тебя (тебя) я вновь (вновь)
+Доброе утро
+Моя любовь
+Когда увижу
+Тебя я вновь
```

**@vzakharov (human)** — 2026-10-09T07:30:42Z

если там дальше повторения, то просто x(количество раз)

---

<a id="t18"></a>

### `scripts/check-masked-words.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-09T07:32:59Z

давай всё проверки, связанные с песнями, завяжем на изменения в их md-шках, чтобы не гонялись на не связанных с ними пиарах.

---

<a id="t19"></a>

### `scripts/check-prose-quotes.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-09T07:33:40Z

к этому (и другим аналогичным, захватывающим остальную прозу), не относится

---

<a id="t20"></a>

### `src/pages/music/lib/music-metadata.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-09T07:35:02Z

а картинки генерим, кстати? и на альбомы, и на песни, и на артистов (где есть)? давай генерить.

---

<a id="t21"></a>

### `src/shared/song/names.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-09T07:45:07Z

shared/music-catalogue? если про это, а то кажется что "song" слишком узко (а /music нельзя потому что так называется page)

---

## Timeline (status, references, and other events)

- **2026-10-07T06:43:10Z** @vzakharov renamed from «feat(vova): a music catalogue checklist and a hidden flag for songs» to «feat(vova): hidden documents, and a checklist of every music master».
- **2026-10-07T07:48:59Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/115#pullrequestreview-5439203216.
- **2026-10-07T08:16:34Z** @vzakharov renamed from «feat(vova): hidden documents, and a checklist of every music master» to «feat(vova): hidden documents, and 119 masters as hidden song pages».
- **2026-10-07T08:16:55Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/2fc2e61b65d3f8e48a2484de1a42751d5a23e4b3.
- **2026-10-07T09:12:07Z** @vzakharov renamed from «feat(vova): hidden documents, and 119 masters as hidden song pages» to «feat(vova): hidden documents, and 150 masters as hidden song pages».
- **2026-10-07T12:07:10Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/115#pullrequestreview-5440544314.
- **2026-10-07T19:08:13Z** @vzakharov renamed from «feat(vova): hidden documents, and 150 masters as hidden song pages» to «feat(vova): hidden documents, artist pages, 147 hidden song pages».
- **2026-10-08T19:16:29Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/115#pullrequestreview-5453901697.
- **2026-10-08T19:16:55Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/115#pullrequestreview-5461709471.
- **2026-10-08T19:24:08Z** @vzakharov cross-referenced this pull request from [#170 PR export: warn on a large review up front and route it through subagents](https://github.com/vzakharov/muthur/issues/170).
- **2026-10-08T19:32:52Z** @vzakharov cross-referenced this pull request from [#171 feat: warn on a large PR review up front, route it through subagents](https://github.com/vzakharov/muthur/pull/171).
- **2026-10-08T20:31:27Z** @vzakharov renamed from «feat(vova): hidden documents, artist pages, 147 hidden song pages» to «feat(vova): hidden song catalogue, artist and album pages, one title shape».
- **2026-10-09T04:53:00Z** @vzakharov renamed from «feat(vova): hidden song catalogue, artist and album pages, one title shape» to «feat(vova): hidden song catalogue, music index tabs, one title shape».
- **2026-10-09T07:45:30Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/115#pullrequestreview-5466099779.
