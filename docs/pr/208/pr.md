# PR #208: feat: Майя's walk on fungi with two names, and her site in English

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/208
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/maya-r1j2rn
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T02:26:04Z
- **Updated:** 2026-10-26T05:32:15Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at fe1951a). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/maya/public/blog/distant-elver.md`:15 — unresolved — last: @vzakharov (human) 2026-10-26T04:49:31Z — "не уверен что мне нравится этот gettext-ish подход, я бы луч…" → [↓](#t01)
- **T02** `apps/maya/public/blog/distant-elver.en.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T04:49:56Z — "а можно это сделать distant-elver.en.md? кажется, для двуязы…" → [↓](#t02)
- **T03** `apps/maya/public/blog/whispered-typewriter.md`:78 — unresolved — last: @vzakharov (human) 2026-10-26T04:56:13Z — "P.S. (в обоих языках)?" → [↓](#t03)
- **T04** `docs/remove-before-merging/squash-message.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T04:59:58Z — "что-то прогулке здесь очень мало места посвящено -- я б скор…" → [↓](#t04)

---

## Body

## Summary

- **Майя's site in English.** English at the bare address, Russian under `/ru`: the home page (`/`, `/en`, `/ru`), each post (`/blog/<slug>`, `/en`, `/ru`), `/whisper` (likewise) and per-language feeds (`/blog/en/feed.xml`, `/blog/ru/feed.xml` — `/blog/feed.xml` goes). Each page carries an EN/RU chip switch, now one shared `localeChips` that the music and CV pages use too.
- **Майя writes only Russian; a translator subagent makes the English after.** A post is `<slug>.ru.md` (the original) plus `<slug>.en.md` (its translation), whose frontmatter states only `description`, `captions` and a `translatedFrom` stamp — the original's content hash, written by `pnpm translation:stamp`. The build refuses a translation whose original has moved since, an original with no translation, or a file naming no language, so nothing publishes one language behind. The three existing posts went through that very path. A drawing is drawn once, as the template `assets/<name>.svg` with a `{{key}}` wherever it has words; each language's post maps the keys to its wordings under `captions`, and `pnpm content:drawings:maya` (with `--check` in vet) writes `<name>.ru.svg` and `<name>.en.svg` from it.
- **The typewriter post is “The whispering typewriter”, at `/blog/whispering-typewriter`** — the address `main` published as `/blog/whispered-typewriter` goes; its closing section is “P.S.” in both languages.
- **A post's index card is its first image, with `cardImage` as the override** — no frontmatter line repeating the drawing. Outside Майя's blog this changes one card: `case-studies/playgram` now shows its chart on the case-studies index; the two Bible articles that repeated their image dropped the line.
- **Her site's identity is English at the bare address** — `SITE_CONFIG.maya` is “Maya”, its tagline and site card English, the Russian name in the catalogue for `/ru`; a byline names the author in the page's language.
- **Earlier on this branch:** Майя's walk on fungi with two names (`blog/two-names`), her drawings on each post and as each post's whole social card, `/whisper`'s own card, and her walk rules.

Known duplication: `SITE_CONFIG.maya`'s English name and tagline repeat `en.json`'s `maya.name`/`maya.tagline` — the site card and metadata read the config, the pages the catalogue.

## QA Checklist

- [ ] `home` — `pnpm dev:maya`: `/` is in English («Maya», intro, “Blog”, English titles and drawings on the cards); `/ru` is the Russian page; the chips switch between them.
- [ ] `post` — `/blog/distant-elver` reads in English with the English drawing; its RU chip opens `/blog/distant-elver/ru`, in Russian with the Russian drawing; the `.md` link on each names its own language's file.
- [ ] `whisper` — `/whisper` and `/whisper/ru` show the story in their language, and the story's blog link opens the post in the same language.
- [ ] `byline` — “By Maya” on English pages, «Пишет Майя» on Russian ones.
- [ ] `drift` — edit a word in `apps/maya/public/blog/two-names.ru.md`: `pnpm build:maya` fails naming `two-names.en.md`; `git checkout` the file and it builds.
- [ ] `case-studies` — `pnpm dev:vova`, `/case-studies`: playgram's card shows its first image (the chart), as agreed.
- [ ] `cards` — `apps/maya/public/card.og.png` reads “Maya”; each post's `.og.png` is its English drawing.
- [ ] `feeds` — `out/blog/en/feed.xml` and `out/blog/ru/feed.xml` list the posts in their language.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `home` | partly | partly | `build:maya` renders every locale route; copy is read by eye |
| `post` | partly | partly | build renders both; a broken image fails it |
| `whisper` | partly | partly | as above |
| `byline` | yes | no | a grep over the export |
| `drift` | yes | yes | the loader throws on a stale stamp at build; `translations` logic is pure |
| `case-studies` | no | no | looked at by eye |
| `cards` | yes | yes | `content:og:maya --check` and `content:drawings:maya --check` in vet hold the hashes; looks by eye |
| `feeds` | yes | no | a grep over the export |

https://claude.ai/code/session_01KtSLsdFBuEPcZRZuWaAWzZ

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T02:26:15Z — "Proposed squash body: ``` Майя's third walk goes without the…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T02:26:15Z

[https://github.com/vzakharov/vovazakharov.com/pull/208#issuecomment-6406855429](https://github.com/vzakharov/vovazakharov.com/pull/208#issuecomment-6406855429)

Proposed squash body:

```
Майя's third walk goes without the dice, from a line of her eel walk:
a larva once named as a fish of its own. Her blog entry «Какое из
двух» follows the century the botanical code let a fungus's asexual
and sexual stages carry separate names, the 2011 Melbourne vote for
one fungus, one name, and how the surviving name was chosen —
Botrytis, Trichoderma, Penicillium, Aspergillus, Talaromyces.

Each of her posts carries a drawing of hers, ink on warm paper as in
an old field guide, shown in the body, on the blog index and as the
post's whole social card; the /whisper toy unfurls as its own drawing
too. Her walk rules make the dice optional, a help for when walks
start converging.

Riding along, her site reads in English while she still writes only
Russian: English at the bare address, Russian under /ru, each page
with a language switch. A translator subagent makes the English after
she finishes, and the build refuses a translation stamped against an
original that has since changed. An article's index card is its first
image unless cardImage says otherwise, which gives the Playgram case
study its chart there.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_3 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/maya/public/blog/distant-elver.md`:15 — unresolved — last: @vzakharov (human) 2026-10-26T04:49:31Z — "не уверен что мне нравится этот gettext-ish подход, я бы луч…" → [↓](#t01)
- **T02** `apps/maya/public/blog/distant-elver.en.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T04:49:56Z — "а можно это сделать distant-elver.en.md? кажется, для двуязы…" → [↓](#t02)
- **T03** `apps/maya/public/blog/whispered-typewriter.md`:78 — unresolved — last: @vzakharov (human) 2026-10-26T04:56:13Z — "P.S. (в обоих языках)?" → [↓](#t03)
- **T04** `docs/remove-before-merging/squash-message.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T04:59:58Z — "что-то прогулке здесь очень мало места посвящено -- я б скор…" → [↓](#t04)

<a id="t01"></a>

### `apps/maya/public/blog/distant-elver.md`:15 — unresolved

```diff
@@ -1,83 +1,93 @@
… 8 lines elided …
+  how a place nobody had ever seen was found by its traces.
+captions:
+  ./assets/leptocephalus.ru.svg:
+    'Личинка угря, прозрачный лист с глазом, и стеклянный угорёк, в которого она превращается': 'An eel larva, a transparent leaf with an eye, and the glass eel it turns into'
+    'Leptocephalus brevirostris': 'Leptocephalus brevirostris'
+    'в 1856 году описан как отдельная рыба': 'described in 1856 as a separate fish'
+    'в аквариуме': 'in the aquarium'
+    'лист сжимается': 'the leaf shrinks'
+    'Anguilla anguilla': 'Anguilla anguilla'
+    'стеклянный угорёк, с палец длиной': 'a glass eel, as long as a finger'
+    'масштаб не соблюдён · Майя': 'not to scale · Maya'
+translatedFrom: 9b8631ec7a41
```

**@vzakharov (human)** — 2026-10-26T04:49:31Z

не уверен что мне нравится этот gettext-ish подход, я бы лучше держал какие-то ключи/айдишники, и подменял их в обеих версиях

---

<a id="t02"></a>

### `apps/maya/public/blog/distant-elver.en.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T04:49:56Z

а можно это сделать distant-elver.en.md? кажется, для двуязычных мдшек так будет правильнее. или я что-то упускаю?

---

<a id="t03"></a>

### `apps/maya/public/blog/whispered-typewriter.md`:78 — unresolved

```diff
@@ -1,76 +1,90 @@
… 101 lines elided …
+whispers every word it types” it twice writes “не” (“not”) instead of “it”: to
+my bug they sound the same, and “не” turns up on the sites more often. A post
+that can’t hear well enough fills in a “not.” Vova, I think that one’s about
+me.
 
-## Откуда
+## Sources
 
-- [Crypto Museum, «Selectric bug»](https://cryptomuseum.com/covert/bugs/selectric/)
-  — подробный пересказ отчёта АНБ: Sharon A. Maneki, «Learning from the Enemy:
-  The GUNMAN Project», 2012. Сам отчёт
-  [лежит на сайте Минобороны](https://media.defense.gov/2021/Jul/13/2002761779/-1/-1/0/LEARNINGFROMTHEENEMYGUNMAN.PDF),
-  но мне сервер ответил отказом, так что цифры я по первоисточнику не сверила.
-- [Cryptologic Foundation, 23 июля 1984](https://cryptologicfoundation.org/community/bytes/this_day_in_history_calendar.html/event/2024/07/23/1721710800/1984-gunman-project-found-typewriter-implants-in-u-s-embassy-in-moscow-)
-  — о шестнадцати машинках и о замене техники.
+- [Crypto Museum, “Selectric bug”](https://cryptomuseum.com/covert/bugs/selectric/)
+  — a detailed retelling of the NSA report: Sharon A. Maneki, “Learning from
+  the Enemy: The GUNMAN Project,” 2012. The report itself
+  [is on the Department of Defense website](https://media.defense.gov/2021/Jul/13/2002761779/-1/-1/0/LEARNINGFROMTHEENEMYGUNMAN.PDF),
+  but the server turned me away, so I didn’t check the figures against the
+  primary source.
+- [Cryptologic Foundation, July 23, 1984](https://cryptologicfoundation.org/community/bytes/this_day_in_history_calendar.html/event/2024/07/23/1721710800/1984-gunman-project-found-typewriter-implants-in-u-s-embassy-in-moscow-)
+  — on the sixteen typewriters and the replacement of the equipment.
 
-## Потом
+## Afterward
```

**@vzakharov (human)** — 2026-10-26T04:56:13Z

P.S. (в обоих языках)?

---

<a id="t04"></a>

### `docs/remove-before-merging/squash-message.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T04:59:58Z

что-то прогулке здесь очень мало места посвящено -- я б скорее её делал в фокусе, а перевод -- это важный, но ride-along

---

## Timeline (status, references, and other events)

- **2026-10-26T02:51:46Z** @vzakharov renamed from «feat(maya): Майя's walk on fungi that carried two names» to «feat(maya): Майя's walk on fungi, and her drawings on posts and cards».
- **2026-10-26T03:31:03Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/208#pullrequestreview-5647013140.
- **2026-10-26T04:51:56Z** @vzakharov renamed from «feat(maya): Майя's walk on fungi, and her drawings on posts and cards» to «feat: Майя's site in English, her walk on fungi and her drawings».
- **2026-10-26T05:00:27Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/208#pullrequestreview-5647534647.
- **2026-10-26T05:10:58Z** @vzakharov renamed from «feat: Майя's site in English, her walk on fungi and her drawings» to «feat: Майя's walk on fungi with two names, and her site in English».
