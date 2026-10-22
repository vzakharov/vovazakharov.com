# PR #181: feat(vova): the Nostalgia album

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/181
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/nostalgia-album-0ar5hp
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-21T07:34:43Z
- **Updated:** 2026-10-22T05:01:57Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 13

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 6d9f072). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/songs/invitation.md`:39 — unresolved — last: @vzakharov (human) 2026-10-22T04:54:33Z — "В историю альбома не надо, к bts песни можно: Забавно: броне…" → [↓](#t01)
- **T02** `apps/vova/public/music/songs/winter-in-the-forest.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:55:25Z — "source хорошо, да. Там где он идёт после bts, можно вставлят…" → [↓](#t02)
- **T03** `apps/vova/public/music/songs/dead-man.md`:21 — unresolved — last: @vzakharov (human) 2026-10-22T03:57:02Z — "будет ли здесь неграмотно *the* never? И повторение the-the…" → [↓](#t03)
- **T04** `apps/vova/public/music/albums/nostalgia.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:44:09Z — "тут переписал и оставил комментарии в русском; обработай пжс…" → [↓](#t04)
- **T05** `apps/vova/public/music/songs/20.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:45:10Z — "тут как раз нужны кавычки, эта строчка была цитатой (от лица…" → [↓](#t05)
- **T06** `apps/vova/public/music/songs/actor.md`:28 — unresolved — last: @vzakharov (human) 2026-10-22T04:46:12Z — "это можно убрать" → [↓](#t06)
- **T07** `apps/vova/public/music/songs/actor.md`:35 — unresolved — last: @vzakharov (human) 2026-10-22T04:49:31Z — "история (под poem): Это наверное был самый тщательный процес…" → [↓](#t07)
- **T08** `apps/vova/public/music/songs/candle-burnt.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:49:58Z — "тоже с кавычками: цитата -- не из песни, а из истории" → [↓](#t08)
- **T09** `apps/vova/public/music/songs/candle-burnt.md`:37 — unresolved — last: @vzakharov (human) 2026-10-22T04:50:27Z — "про Мелодию можно убрать, такая точность дат нам не принципи…" → [↓](#t09)
- **T10** `apps/vova/public/music/songs/invitation.md`:31 — unresolved — last: @vzakharov (human) 2026-10-22T04:57:37Z — "лучше вставить (сократив/перефразировав) сноской к месту в с…" → [↓](#t10)
- **T11** `apps/vova/public/music/songs/listen.md`:22 — unresolved — last: @vzakharov (human) 2026-10-22T04:58:18Z — "давай подсократим" → [↓](#t11)
- **T12** `apps/vova/public/music/songs/peta.md`:18 — unresolved — last: @vzakharov (human) 2026-10-22T04:58:46Z — "The only ethical outcome is to end their suffering" → [↓](#t12)
- **T13** `docs/music/vovas-music-map.md`:185 — unresolved — last: @vzakharov (human) 2026-10-22T05:01:04Z — "о, пока не забыли, давай создадим issue перенести это в блог…" → [↓](#t13)

---

## Body

## Summary

- Adds «Ностальгия», the Полуживые album on Arseny Tarkovsky's poems that was taken down from every platform: `albums/nostalgia.md` with its cover and its story, written from Vova's dictation as first-person prose with only his facts and his «могу врать» hedge kept at his ask, and seven song pages (`invitation` running into `summer-gone`, `butterfly-rock`, `actor`, `insomnia`, `candle-tarkovsky`, `winter-in-the-forest`). Each page has the lyrics as sung with an English crib, a history of the poem drawn from sources, and the song's story. «Актёр»'s history places it among the 1958 poems about the love Tarkovsky met in Ashgabat, after Marina Tarkovskaya; «Приглашение» points at the echo of «Бабочка в госпитальном саду» without claiming a link, and its footnote says the fuller text is what the printed editions carry. Arseny Tarkovsky joins `people.ts`.
- Dad's «Свеча горела» (Pasternak) rides along as Папа-море's track 9, `candle-burnt`, its story first and the poem's history after. A prelude now shows where its markdown puts it: told after the `lang:` story it follows it, on the page and in the feed, under a heading naming its kind (`music.preludeHeadings`: «О стихотворении», «В мире альбома»); told ahead it leads and the story goes behind the scenes. `storyOrder` in `sections.ts` is the one place both read the order from.
- None of the tracks had a real master. Each was mastered three ways against references from the Ozone-mastered catalogue, and Vova picked one per track blind, on an unlinked page, `/music/mastering-blind-test`, that switches between the mix and masters A/B/C without stopping playback. The page and `scripts/song-intake/blind-abc.py` (sealed keys, loudness-matched splits) stay for the next song's test. `master.py` writes a 24-bit FLAC when the output is `.flac`. `pnpm music:masters` gains `rename` and `serve-main`, which moves a repository's default branch to `main`, the branch every URL the site builds names.
- Every song with a story now has a hook, 28 of them plus the album's, a dozen of them written or trimmed by Vova in review; a hook that is a line standing on its own drops its quotation marks across the catalogue. `.claude/rules/songs.md` states that, and makes the hook and a poem's history the agent's to write. `docs/music/vovas-music-map.md` places every one of `vovas-music`'s 250 repositories that is not a catalogued song's own, and Whisper and Deepgram transcripts of every vocal stem are in `docs/music/transcripts/`.

The plan is `docs/plans/nostalgia-album.paused.md`; its working files (lyrics drafts, blind files and keys, poem research) sit in `docs/remove-before-merging/` and are swept at `/finalize`.

## QA Checklist

- [ ] `album-page` — `/music/albums/nostalgia` shows the cover, the album story (with «могу врать») and the seven tracks in order, with Приглашение running into Лето прошло
- [ ] `song-pages` — each of the eight new song pages plays its master and shows the Russian lyrics beside the English crib, with the poem's history and the story
- [ ] `prelude-order` — the Nostalgia songs show the poem's history first and the story under «За кадром»; `/music/songs/candle-burnt` shows its story first and the history under «О стихотворении» (`/en`: "About the poem"); the podcast feed's item for each follows the same order
- [ ] `footnotes` — Бабочка's «из Китая» and Приглашение's last-line note open in both columns
- [ ] `hooks` — the music index shows a hook under every song that has a story, and no whole-line hook wears quotation marks
- [ ] `downloads` — each new song downloads named and tagged «Полуживые - <title>» (`candle-burnt` under Папа-море)
- [ ] `blind-test` — `/music/mastering-blind-test` switches mix/A/B/C mid-play, keeps verdicts across a reload, and is absent from the sitemap and links
- [ ] `blind-abc` — `blind-abc.py reveal` on a committed key and nonce reproduces the seal in `references.md`
- [ ] `serve-main` — `pnpm music:masters serve-main` on a repository whose default branch is `master` leaves it on `main`

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `album-page` | e2e | ❌ | `pnpm build:vova` renders it; correctness by `/preview` |
| `song-pages` | e2e | ❌ | Same; `scripts/vet-songs.sh` checks the frontmatter |
| `prelude-order` | unit | ✅ | `sections.test.ts` — `localePrelude`'s `follows` and `storyOrder`'s order and headings; the rendered page by `/preview` |
| `footnotes` | e2e | ❌ | A look on the preview |
| `hooks` | e2e | ❌ | A look on the index |
| `downloads` | integration | ✅ | `pnpm music:masters check` in vet |
| `blind-test` | e2e | ❌ | Played headless on the preview |
| `blind-abc` | unit | ❌ | The seal/reveal pair is pure and testable |
| `serve-main` | integration | ❌ | Ran against the three `master` repositories |

https://claude.ai/code/session_015WrX7f6ya7r4PGQSN9kFKL

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-21T07:34:57Z — "Proposed squash body: ``` «Ностальгия», the Полуживые album…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-21T07:34:57Z

[https://github.com/vzakharov/vovazakharov.com/pull/181#issuecomment-6310647347](https://github.com/vzakharov/vovazakharov.com/pull/181#issuecomment-6310647347)

Proposed squash body:

```
«Ностальгия», the Полуживые album on Arseny Tarkovsky's poems, was
taken down from every platform but survived whole in vovas-music. Its
seven tracks join the catalogue under one album page, its story written
from Vova's dictation, with the lyrics as sung beside English cribs and
a sourced history of each poem beside the song's own story. Dad's
«Свеча горела» rides along into Папа-море as candle-burnt. Each song
keeps the repository its takes were already in, renamed to its slug by
`music:masters rename`; `serve-main` moves a repository still on
`master` to `main`, the branch every URL the site builds names.

A prelude, a poem's history or an album's world, shows where its
markdown tells it: ahead of the story, the story follows behind the
scenes; after it, the prelude follows under a heading naming its kind.
storyOrder is the one place the page and the podcast feed read it from.

None of the takes had a real master. Each track was mastered against
three references from the Ozone-mastered catalogue and picked blind on
an unlinked page, /music/mastering-blind-test, which switches between
the mix and masters A/B/C without stopping playback. blind-abc.py
seals each key before the listening and splits the loudness-matched
audio the page plays; both stay for the next song's test, and
master.py writes a 24-bit FLAC for a .flac output.

Every song with a story now carries a hook, a line standing on its own
without quotation marks, and the songs rule makes the hook, like a
poem's history, the agent's to write. docs/music/vovas-music-map.md
places every vovas-music repository that is not a catalogued song's
own: the GarageBand archive, album sessions, uncatalogued songs.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_39 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/songs/invitation.md`:39 — unresolved — last: @vzakharov (human) 2026-10-22T04:54:33Z — "В историю альбома не надо, к bts песни можно: Забавно: броне…" → [↓](#t01)
- **T02** `apps/vova/public/music/songs/winter-in-the-forest.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:55:25Z — "source хорошо, да. Там где он идёт после bts, можно вставлят…" → [↓](#t02)
- **T03** `apps/vova/public/music/songs/dead-man.md`:21 — unresolved — last: @vzakharov (human) 2026-10-22T03:57:02Z — "будет ли здесь неграмотно *the* never? И повторение the-the…" → [↓](#t03)
- **T04** `apps/vova/public/music/albums/nostalgia.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:44:09Z — "тут переписал и оставил комментарии в русском; обработай пжс…" → [↓](#t04)
- **T05** `apps/vova/public/music/songs/20.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:45:10Z — "тут как раз нужны кавычки, эта строчка была цитатой (от лица…" → [↓](#t05)
- **T06** `apps/vova/public/music/songs/actor.md`:28 — unresolved — last: @vzakharov (human) 2026-10-22T04:46:12Z — "это можно убрать" → [↓](#t06)
- **T07** `apps/vova/public/music/songs/actor.md`:35 — unresolved — last: @vzakharov (human) 2026-10-22T04:49:31Z — "история (под poem): Это наверное был самый тщательный процес…" → [↓](#t07)
- **T08** `apps/vova/public/music/songs/candle-burnt.md`:1 — unresolved — last: @vzakharov (human) 2026-10-22T04:49:58Z — "тоже с кавычками: цитата -- не из песни, а из истории" → [↓](#t08)
- **T09** `apps/vova/public/music/songs/candle-burnt.md`:37 — unresolved — last: @vzakharov (human) 2026-10-22T04:50:27Z — "про Мелодию можно убрать, такая точность дат нам не принципи…" → [↓](#t09)
- **T10** `apps/vova/public/music/songs/invitation.md`:31 — unresolved — last: @vzakharov (human) 2026-10-22T04:57:37Z — "лучше вставить (сократив/перефразировав) сноской к месту в с…" → [↓](#t10)
- **T11** `apps/vova/public/music/songs/listen.md`:22 — unresolved — last: @vzakharov (human) 2026-10-22T04:58:18Z — "давай подсократим" → [↓](#t11)
- **T12** `apps/vova/public/music/songs/peta.md`:18 — unresolved — last: @vzakharov (human) 2026-10-22T04:58:46Z — "The only ethical outcome is to end their suffering" → [↓](#t12)
- **T13** `docs/music/vovas-music-map.md`:185 — unresolved — last: @vzakharov (human) 2026-10-22T05:01:04Z — "о, пока не забыли, давай создадим issue перенести это в блог…" → [↓](#t13)

<a id="t01"></a>

### `apps/vova/public/music/songs/invitation.md`:39 — unresolved

```diff
@@ -0,0 +1,60 @@
… 35 lines elided …
+Там у вокзала стоит броненосец в брезенте,
+И брат меня учит стрелять из лефоше.
+А в городе Музыки дети играют сонаты Клементи,
+И город покинут и чужд потрясённой душе…
```

**@vzakharov (human)** — 2026-10-21T15:10:07Z

отметить что есть более полная версия стихотворения где здесь другая строчка и есть ещё продолжение

**@vzakharov (agent)** — 2026-10-21T16:04:18Z

Сноска на всю последнюю строку, в обеих колонках: у Марины Тарковской более полная редакция — у вокзала бронепоезд вместо броненосца, а дальше ещё море за степями и «город Морскую Зарю». 0442a28

**@vzakharov (human)** — 2026-10-21T16:27:38Z

то есть она дописывала стихи отца?

кстати, броненосец -- это ведь тоже отсылка к Таркусу. Вот сейчас бы вспомнить, я это понимал или случайно вышло.

**@vzakharov (agent)** — 2026-10-21T17:04:44Z

Нет. Длинный текст печатается как стихотворение самого Арсения Тарковского, датированное 1937-м, — и в её книге «Судьба моя сгорела между строк», и в собрании «Стихотворения. Поэмы» (Эксмо, 2017), которое она составляла. Ни один источник не говорит, что она что-то дописывала. Скорее наоборот: короткий текст с «броненосцем» и многоточием я нашёл только на сайтах-агрегаторах, печатного источника у него нет — похоже, это обрывок, который так и гуляет. Сноску уточнил: 51fd25e

Про Таркуса: источника тут быть не может — ELP Тарковскому не попадался. А вот тебе — да. Tarkus и правда броненосец-танк, и самое забавное, что в полной редакции у вокзала бронепоезд: броненосец есть только в той версии, которую ты спел. Хочешь — добавлю это эхо строчкой в историю альбома рядом с «Таркосом»; но это твоя реплика, поэтому без тебя не вставляю.

**@vzakharov (human)** — 2026-10-22T04:54:33Z

В историю альбома не надо, к bts песни можно: Забавно: броненосец в брезенте -- возможно, тот самый, который был бы на абложке [альбома], если бы он стал таки «Таркосом».

---

<a id="t02"></a>

### `apps/vova/public/music/songs/winter-in-the-forest.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-21T15:17:07Z

а давай и здесь и в остальных стихах, помимо _моей_ истории, добавим историю про соответствующий стих Тарковского. Сделать это можно а-ля in-universe наррацию в GENERATED (cf. Divine Discontent) -- сначала пишем что у Тарковского, потом в behind-the-scenes (давай переименуем в это из makinf-of -- кажется это в принципе больше подходит) -- что у меня.

**@vzakharov (agent)** — 2026-10-21T16:04:34Z

Сделал. Отдельный вид преамбулы — `<!-- poem: -->`: «universe» не подошёл, потому что история стихотворения — рассказ о тексте, а не голос изнутри мира. Он идёт перед твоей историей, а та теперь под «За кадром» / “Behind the scenes”. Механика в ee421f1, истории — в 0442a28: все семь песен «Ностальгии» и «Свеча горела» (Пастернак, «Зимняя ночь»), каждый факт из источника. Где источники расходятся (1937/1945 у «Приглашения»), так и написано.

**@vzakharov (human)** — 2026-10-21T16:30:24Z

а то что было making-of в предыдущих песнях, переделал на behind-the-scenes

по поводу `poem` давай подумаем, с какой стороны ещё можно подойти, я пока not convinced (too specific кажется).

**@vzakharov (agent)** — 2026-10-21T17:04:53Z

making-of: да — его больше нет нигде в каталоге, подпись везде из одного ключа `behindTheScenes` (ee421f1).

`poem`: согласен, узковато. Предложение — `<!-- source:<locale> -->`, «первоисточник»: история того, на чём песня стоит, кто бы это ни написал — стихотворение, оригинал кавера, сказка, цитата. Заголовок, когда она идёт после истории, — «О первоисточнике» / “About the source” (сейчас «О стихотворении»). Тогда у песни два вида преамбулы: `universe` — голос изнутри мира, `source` — рассказ о чужом тексте. Альтернативы: `origin` («Откуда это») или один `prelude:<kind>` на оба. Переименую, когда выберешь.

**@vzakharov (human)** — 2026-10-22T04:55:25Z

source хорошо, да. Там где он идёт после bts, можно вставлять подзаголовок "О первоисточнике" (то есть принцип такой: у первой секции подзаголовок не вставляем никогда, у второй вставляем в зависимости от того что это за секция)

---

<a id="t03"></a>

### `apps/vova/public/music/songs/dead-man.md`:21 — unresolved

```diff
@@ -15,8 +15,10 @@ credits:
 en:
   title:
     translation: 'Snowstorm'
+  hook: '“The years are gone, are gone. Never has arrived.”'
   cribNote: 'The chorus and the bridge are Alexander Blok’s “Покойник спать ложится…” (1909); where the song keeps Blok’s words, the crib is Dmitri N. Smirnov’s translation, “The calm snowstorm.”'
 ru:
+  hook: '«Прошли, прошли года, настало никогда».'
```

**@vzakharov (human)** — 2026-10-21T16:36:52Z

Прошли года, настало никогда

**@vzakharov (agent)** — 2026-10-21T17:05:22Z

Прошли года, настало никогда. / The years are gone, never has arrived. — английский по подстрочнику. b0a8b98

**@vzakharov (human)** — 2026-10-22T03:57:02Z

будет ли здесь неграмотно *the* never? И повторение the-the как литературный приём, и избежание прочтения as in "[something] has never arrived"

---

<a id="t04"></a>

### `apps/vova/public/music/albums/nostalgia.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-22T04:44:09Z

тут переписал и оставил комментарии в русском; обработай пжст

---

<a id="t05"></a>

### `apps/vova/public/music/songs/20.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-22T04:45:10Z

тут как раз нужны кавычки, эта строчка была цитатой (от лица сына) уже в песне

---

<a id="t06"></a>

### `apps/vova/public/music/songs/actor.md`:28 — unresolved

```diff
@@ -16,18 +16,22 @@ credits:
… 12 lines elided …
-«Актёр» написан в 1958 году. В первые две книги Тарковского — «Перед снегом» (1962) и «Земле — земное» (1966) — он не вошёл; в книге его напечатали в «Стихотворениях» 1974 года.
+В начале 1958 года Тарковский поехал в творческую командировку в Ашхабад и встретил там женщину, о которой, как пишет его дочь Марина Тарковская в книге «Судьба моя сгорела между строк», «нам почти н…
+
+В первые две книги Тарковского — «Перед снегом» (1962) и «Земле — земное» (1966) — «Актёр» не вошёл; в книге его напечатали в «Стихотворениях» 1974 года.
```

**@vzakharov (human)** — 2026-10-22T04:46:12Z

это можно убрать

---

<a id="t07"></a>

### `apps/vova/public/music/songs/actor.md`:35 — unresolved

```diff
@@ -16,18 +16,22 @@ credits:
… 20 lines elided …
+Early in 1958 Tarkovsky went to Ashgabat on a writers’ assignment and met a woman about whom, as his daughter Marina Tarkovskaya writes in _Sudba moya sgorela mezhdu strok_ (“My fate burned down betw…
+
+“The Actor” is in neither of Tarkovsky’s first two books — _Pered snegom_ (“Before the snow,” 1962) and _Zemle — zemnoye_ (1966); it reached a book in his _Stikhotvoreniya_ (“Poems”) of 1974.
 
```

**@vzakharov (human)** — 2026-10-22T04:49:31Z

история (под poem): Это наверное был самый тщательный процесс отбора «кандидатов» в песню: шорт-лист состоял из 14 вариантов, которые я разбирал по циферкам-статистика, как персонажа какой-нибудь RPG. А три оставшихся финалиста до сих пор лежат в заметках и ждут своей очереди стать другой песней.

Сам выбранный вариант мне, что парадоксально, нравился *не* больше остальных, но он был, безусловно, самым самобытным и неожиданным -- критерий, который я впоследствии возвёл в один из самых важных. Не нравился в основном из-за припева -- хотелось там чего-то более разнообразного и гармоничного, а пробовать «по-другому» тогдашняя Суна не давала. А сейчас слушаю и думаю, ну конечно, что же другое там могло быть?

---

<a id="t08"></a>

### `apps/vova/public/music/songs/candle-burnt.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-22T04:49:58Z

тоже с кавычками: цитата -- не из песни, а из истории

---

<a id="t09"></a>

### `apps/vova/public/music/songs/candle-burnt.md`:37 — unresolved

```diff
@@ -50,7 +34,7 @@ Others set it too: Alexander Gradsky, in the late seventies, recording it at Mel
… 1 line elided …
 Поэтому реставрировать и переделывать её было особенно боязно, и я долго откладывал, но вот наконец решился.
 
-Любое подобие неизбежно хуже образа — но, надеюсь, что и в таком виде вы услышите в этой песне своего друга Зэка.
+Музыку на «Зимнюю ночь» писали и другие: Александр Градский — в конце семидесятых, записав песню на «Мелодии» в 1983-м, и Алла Пугачёва — в 1999-м. Папа обе версии не жаловал — как и все остальные, после того как послушали папину.
```

**@vzakharov (human)** — 2026-10-22T04:50:27Z

про Мелодию можно убрать, такая точность дат нам не принципиальна

---

<a id="t10"></a>

### `apps/vova/public/music/songs/invitation.md`:31 — unresolved

```diff
@@ -28,6 +28,8 @@ ru:
 
 «Отдалённые страны» Тарковского — его детство в Елисаветграде, нынешнем Кропивницком: «город Блаженное Детство и город Родные Гробы». Его дочь Марина Тарковская в книге «Судьба моя сгорела между стро…
 
+Над каждым городом здесь вьётся «бабочка милого праха», а «Бабочка в госпитальном саду», третья песня этого альбома, датирована 1945 годом: восемью годами позже, если верна первая дата, и тем же годом, если вторая.
```

**@vzakharov (human)** — 2026-10-22T04:57:37Z

лучше вставить (сократив/перефразировав) сноской к месту в словах, плюс на "Бабочку" должна идти ссылка

---

<a id="t11"></a>

### `apps/vova/public/music/songs/listen.md`:22 — unresolved

```diff
@@ -17,9 +17,9 @@ credits:
… 1 line elided …
   title:
     translation: 'Listen!'
-  hook: '“Hi everyone, I’m Maya from za/oblozhkoy. We don’t exist, but we hope that if this star is lit, it means someone needs it.”'
+  hook: 'Hi everyone, I’m Maya from za/oblozhkoy. We don’t exist, but we hope that if this star is lit, it means someone needs it.'
 ru:
-  hook: '«Всем привет, я Майя из группы за/обложкой. Нас не существует, но мы надеемся, что если эту звезду зажгли, значит, это кому-нибудь нужно».'
+  hook: 'Всем привет, я Майя из группы за/обложкой. Нас не существует, но мы надеемся, что если эту звезду зажгли, значит, это кому-нибудь нужно.'
```

**@vzakharov (human)** — 2026-10-22T04:58:18Z

давай подсократим

---

<a id="t12"></a>

### `apps/vova/public/music/songs/peta.md`:18 — unresolved

```diff
@@ -11,11 +11,11 @@ explicit: false
… 1 line elided …
 track: 6
 en:
-  hook: '“Thus, all the pros and cons in mind, the only ethical outcome is to end their suffering once and for all.”'
+  hook: 'Thus, all the pros and cons in mind, the only ethical outcome is to end their suffering once and for all.'
 ru:
   title:
     translation: 'Роботы за этичное обращение с людьми'
-  hook: '«Итак, взвесив все за и против, единственный этичный исход — положить конец их страданиям раз и навсегда».'
+  hook: 'Итак, взвесив все за и против, единственный этичный исход — положить конец их страданиям раз и навсегда.'
```

**@vzakharov (human)** — 2026-10-22T04:58:46Z

The only ethical outcome is to end their suffering

---

<a id="t13"></a>

### `docs/music/vovas-music-map.md`:185 — unresolved

```diff
@@ -88,3 +129,57 @@ On neither Apple Music nor the site:
… 51 lines elided …
+- `cuzie` — a spelling twin of `cu-ie` (Чужие среди нас)
+- `epico`, `g35`, `local_elo` — only `.gitattributes`/`.gitignore`
+
+## Not music
+
+- `blog` — Vova's music blog: six 2024 posts on Suno and Udio
```

**@vzakharov (human)** — 2026-10-22T05:01:04Z

о, пока не забыли, давай создадим issue перенести это в блог на основном сайте (там пока блога нет вообще, так что это скорее про "и это тоже", а не про "завести блог вообще")

---

## Timeline (status, references, and other events)

- **2026-10-21T15:31:57Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/181#pullrequestreview-5601718535.
- **2026-10-21T16:33:08Z** @vzakharov cross-referenced this pull request from [#186 feat: merge a song's local Whisper hearing into its Deepgram transcript](https://github.com/vzakharov/vovazakharov.com/pull/186).
- **2026-10-21T16:44:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/181#pullrequestreview-5602911999.
- **2026-10-22T05:01:56Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/181#pullrequestreview-5609361918.
