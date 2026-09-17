> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# A song in two languages, and the metadata the review asked for

The review of [#53](https://github.com/vzakharov/vovazakharov.com/pull/53) asked
for one thing before any edit lands: **decide how a song page carries two
languages.** Everything else the review turned up — the title field, projects as
an array, the explicit marker, authorship, albums — lands in the same
frontmatter, so it is all one decision and this file is that decision.

Nothing here is implemented. The ten songs still hold their scaffolded
frontmatter and their draft prose, and the corrected lyrics and the author's own
stories are sitting in the PR threads waiting for the shape to put them in.

## 1. One file per song, not one per locale

**Recommendation: one `<slug>.md`, with the language-agnostic fields at the top
level and a per-locale block for the few strings that vary.**

The review named both options. Separate files lose on three counts:

- **The WET half is the bigger half.** `date`, `status`, `language`, `repo`,
  `audio`, `seconds`, `explicit`, `project`, `credits` and the lyrics themselves
  are the same in both languages. Only `title`, `description` and the story
  differ. Two files means duplicating the majority, or a third shared file that
  neither of them is.
- **`<slug>.<locale>.md` is already taken.** `.claude/rules/content.md` § "The
  locale seam" notes the convention and, in the same breath, that it collides
  with `<slug>.<variant>.md` — a cut and a locale cannot share one dotted
  suffix. Choosing the single-file shape retires that collision instead of
  resolving it.
- **The raw `.md` route serves the authored file.** `/music/slime.md` is a real
  URL. One file means one honest source, not a language-picked fragment.

What it costs: the longest file (`slime.md`) reaches roughly 200 lines with both
stories, the lyrics and their translation. That is a document, not a module, and
the ~450-line rule of thumb is about logic.

The shape:

```yaml
---
date: 2024-11-18
status: done
language: instrumental # what the vocal is sung in
repo: june
audio: https://raw.githubusercontent.com/vovas-music/june/main/breathe.flac
seconds: 293
explicit: false
project: [Полуживые, GENERATED] # first is the artist, the rest are features
album: vagabond
credits:
  lyrics: Vova Zakharov # omitted means the author; stated when it is not
en:
  title: Breathe
  description: …
ru:
  title: Повелитель ветра
  description: …
---
<!-- lang:en -->

The story, in English.

<!-- lang:ru -->

Та же история, по-русски.
```

The locale token is an HTML comment rather than a heading: it disappears in
every markdown renderer, so the raw `.md` reads as prose and the page's heading
outline stays the author's. A section with no token belongs to every locale,
which is what an instrumental with nothing to say twice will use.

**Both locales are required where one is required.** A schema that accepts a
missing `ru.title` accepts a half-translated catalogue and says nothing about
it; the build failing on the missing key is the loud version. Where a
translation genuinely does not exist yet, that is what the `status` field is
for, per question 2 below.

## 2. The lyric block, and why trailing spaces have to go

**The glitch the review asked me to look for is real, and it is in the birdie
commit** (ec2f556). Markdown needs two trailing spaces to make a line break, and
the lines added by hand do not have them. `apps/vova/public/music/birdie.md`
lines 28–31, 40–41, 46–49, 51–53, 59–68 and 73–81 render as run-on paragraphs:

```
Птичка! Флай, с**а, флай! Птичка! Хай ин зэ скай, на!
```

That will happen again on every hand-edit, because the fix is invisible
whitespace at the end of a line nobody can see.

**Recommendation: lyrics stop being prose.** They move into their own fenced
block, rendered with `white-space: pre-line`, where a newline is a line and a
blank line is a stanza:

````markdown
## Lyrics

```lyrics
Опять рассвет стучится в окно
Он светит в глаз, но там ему темно

Ты видишь цель, она тебя
Ты убиваешь её любя
```
````

The author writes what was sung and nothing else. No trailing spaces, no
punctuation rules, no Suno section markers — those get stripped when the lyric
is taken from a Suno prompt, per the review's own note.

**Parallel reading is stanza-for-stanza**, per the review. A second block,
`lyrics:en` beside a Russian `lyrics`, is the translation; the two are split on
blank lines and zipped by index into a two-column table when the page's locale
is not the sung language. **Unequal stanza counts fail the build** — a
misaligned parallel text is worse than none, and this is the one place where
silence would be invisible on the page.

Where there is no translation block, the page shows the original alone.
`june`/Breathe has no vocal at all and gets no section.

## 3. `name` becomes `title`

The review settled it: frontmatter carries the title, the page puts it in the
`<h1>`, and it is called `title` for a song so there is no `title` vs `name`
dichotomy anywhere. Under §1 it is per-locale, which is what lets `june` be
_Breathe_ in English and _Повелитель ветра_ in Russian — one song, one slug, one
page, two names.

Case studies keep lifting their title out of the body's leading `# ` unless
question 6 says otherwise, and `.claude/rules/content.md` § "Frontmatter" is
rewritten to say which collection does which and why.

## 4. `project` becomes an array, and the roster grows

First element is the artist, the rest are features — the review's own rule, and
what the player bar and the track list both read. `Полуживые feat. Грёбаный бал`
is `[Полуживые, Грёбаный бал]`.

The roster the review names is six, not three:

| Project      | What it is                | Link                                   |
| ------------ | ------------------------- | -------------------------------------- |
| GENERATED    | English metal/core        | —                                      |
| Полуживые    | the Russian-language home | [t.me/papareka](https://t.me/papareka) |
| Downtemple   | already in the registry   | —                                      |
| Грёбаный бал | the harder/trap side      | [t.me/fknball](https://t.me/fknball)   |
| за/обложкой  | Russian pop               | —                                      |
| Yoohie       | features on GENERATED     | —                                      |

A feature means, in the review's words, that the song can be shown to someone
you show the other project to. Worth stating in `music-projects.ts` — it is the
rule that decides every future assignment, and it is not derivable from the
data.

What the review assigns:

| Song       | `project`                     |
| ---------- | ----------------------------- |
| birdie     | `[Грёбаный бал]`              |
| crossroads | `[GENERATED, Yoohie]`         |
| first      | `[Полуживые, Грёбаный бал]`   |
| june       | `[Полуживые, GENERATED]`      |
| letim      | `[за/обложкой, GENERATED]`    |
| rak        | `[Грёбаный бал]`              |
| reka-2     | `[Полуживые]`                 |
| sashas     | `[Полуживые]`                 |
| slime      | `[Грёбаный бал, за/обложкой]` |
| wereback   | `[GENERATED, Yoohie]`         |

`wereback` is `[GENERATED]` in the review's own line and `GENERATED, Yoohie` on
the _Cheer The Fuck Up_ listing it also points at; the table takes the listing.
Question 3 confirms or overrides it.

## 5. `explicit`, and the marker it renders

A boolean, and **the scaffolder already knows it** — `scaffold-song.ts` reads
the 🅴 off the master's filename and currently uses it only for a comment. It
fills the field instead. `birdie` and `wereback` are the two, and the page and
the track list show 🅴 beside the title.

## 6. Credits

`credits.lyrics` and `credits.music`, both optional, both meaning "the author"
when absent. `sashas` states `lyrics: Sasha Zakharova`.

Partial authorship stays prose. `reka-2`'s closing stanza is the author's
father's rendering of Thích Nhất Hạnh, and `sashas` has one verse by a different
hand than the rest — a field that tried to hold that would be a paragraph with a
colon in it. The story says it; the field says who wrote the song.

## 7. Albums, as a registry and not yet a collection

Two albums reach this batch:

- **Cheer The Fuck Up** — `crossroads`, `wereback`, `letim`. Cover art lives in
  the `ctfu` repository.
- **Vagabond** / **Скиталец: по следам Конюхова** — `june`. Localized title,
  localized artist order, cover generated by a Flux model trained on Konyukhov's
  own paintings.

**Recommendation: an `album` slug in frontmatter plus a registry in
`shared/config`**, carrying each album's per-locale title, its artist and its
cover — and no album pages in this PR. The song pages can then link an album
name without anything to route to, and the day albums get pages, the data is
already written. A full `albums` content collection is its own piece of work and
would double this PR.

## 8. One plain fix

`crossroads` says `language: ru` and is sung in English. Under §1 the field
keeps its meaning — what the vocal is in, independent of what the page is
rendered in.

## 9. Hosting: the masters stay where they are

The review asks whether the FLACs should be vendored into this repository.
**Recommendation: no, and for a reason worth writing down.**

The ten masters are roughly a quarter of a gigabyte. Git keeps every version of
a binary forever, GitHub Pages publishes the whole `out/` directory on every
deploy, and both sites already build twice per vet run — so vendoring pays that
weight on every clone, every build and every deploy, permanently, for files that
never change. `vovas-music` is the author's own organization, serves byte
ranges (which is what lets the player seek) and costs this repository nothing.

The real problem with the current arrangement is not where the files live but
what they weigh: a listener on a phone pays 25–30 MB to hear one song. That is
the argument for an **optional** second field — a streaming transcode at
128–192 kbps beside the lossless master, the player preferring it and the page
linking the master for anyone who wants it. It is not in this plan's scope, and
it is the first thing to do if the catalogue is ever meant for a stranger rather
than a reader who came for the writing.

## DRY notes

- **The per-locale block is a shared shape, not a song's.** `title` and
  `description` per locale is what any localized document will want, so the
  schema half lives in `shared/content/frontmatter.ts` beside the base
  frontmatter, and the song schema composes it. The case-study schema does not
  take it yet — question 6 decides whether it ever does.
- **The locale token and the stanza split are one parser, used twice.** Both
  cut a body into labelled parts on a marker; both live in
  `shared/content/` as one function taking the marker, not two near-copies.
  Their _callers_ differ (one keys by locale, one zips by index), which is where
  the difference belongs.
- **`project` and `album` are one registry pattern.** Both are a slug in
  frontmatter resolving to a record in `shared/config` with a display name and a
  link. They are deliberately **not** unified into one "entity" type: an album
  has a cover and a track order, a project has a channel, and the intersection
  is two fields — a shared base for the two fields and separate records for the
  rest, which is what `pnpm type-overlap` floor 2 asks for anyway.
- **Nothing new is extracted for the explicit marker.** It is one boolean read
  in two places (the track list, the song page header), and both already read
  the same frontmatter object.
- **The scaffolder's 🅴 detection is reused, not re-derived.** It exists and is
  currently thrown away into a comment; §5 is a wiring change, not a new parse.

## Open questions

Each carries a recommendation, and the recommendation is written into the plan
above as the single approach — so an unanswered question means the
recommendation stands, not that the work is blocked.

1. **Do music pages become the site's first localized _routes_?** (a) Yes —
   `/ru/music/<slug>` alongside the English one, which means the whole content
   pipeline learns locales in this PR. (b) **Recommended:** no — the files carry
   both languages now, the page renders the site's current surface, and the
   route work is its own change. This PR is already 70-odd files; making it the
   one that localizes routing makes it un-reviewable.

2. **Who writes the lyric translations?** (a) **Recommended:** I draft
   plain-sense cribs, marked in the file as a crib rather than a singing
   version, and you replace what offends. (b) The translation blocks stay empty
   until you write them, and the parallel table simply does not render. A crib
   for _first_ or _reka-2_ is a translation of something written for a person
   who died; say the word and I will leave those two alone whichever way the
   rest goes.

3. **`wereback`'s project** — `[GENERATED]` as you wrote it, or
   `[GENERATED, Yoohie]` as the _Cheer The Fuck Up_ listing shows? Recommended:
   the listing.

4. **`june`'s artist order.** You wrote `Полуживые feat. GENERATED`; the
   _Vagabond_ listing has it the other way (`Breathe (feat. Полуживые)`), which
   reads as the order being per-release rather than per-song. Recommended: your
   line wins — one canonical order per song, and the story says the rest.

5. **Albums now or later?** Recommended: the registry stub of §7 now, pages
   later.

6. **Do case studies also move their title into frontmatter?** Recommended: not
   in this PR. It touches the PDF and OG pipelines, which hash their sources,
   and it buys nothing until a case study needs two languages.

7. **What "keep the current stanza format" means.** You asked for your recorded
   words with the existing formatting kept. My reading: your words verbatim,
   your line breaks, your stanza divisions — and what stays "current" is the
   file's conventions, i.e. no Suno section markers, no repeated chorus elided
   silently. §2 removes the punctuation and hard-break question entirely, since
   the block takes lines as written. Say if you meant the opposite — that the
   repeated choruses should be cut the way the draft transcriptions cut them.

## The order of work, once this is approved

1. Schema and rules first: per-locale frontmatter, `title`, `project` array,
   `explicit`, `credits`, `album`, the project and album registries,
   `.claude/rules/content.md` rewritten to match.
2. The lyric block and the parallel table: parser, renderer, stanza-count check,
   styles.
3. The ten documents: the author's stories from the threads, the corrected
   lyrics, projects, credits, explicit flags, `crossroads`'s language.
4. English cribs for the Russian lyrics, subject to question 2.
5. `/polish`, then the PR body and the squash proposal against what it became.
