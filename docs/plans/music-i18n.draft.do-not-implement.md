> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# A song in two languages, and the metadata the review asked for

The review of [#53](https://github.com/vzakharov/vovazakharov.com/pull/53) asked
for one thing before any edit lands: **decide how a song page carries two
languages.** Everything else the review turned up — the title field, projects as
an array, the explicit marker, authorship, albums — lands in the same
frontmatter, so it is all one decision.

Every question this file opened has been answered; the answers are in force
below and recorded verbatim in § "Decisions taken". The one that changed the
shape of the work: **the music section becomes the site's first localized
content routes**, because [#56](https://github.com/vzakharov/vovazakharov.com/pull/56)
bans the client-side i18n runtime outright, so a second language is a second
page or it is nothing.

## 1. One file per song, not one per locale

**One `<slug>.md`, with the language-agnostic fields at the top level and a
per-locale block for the few strings that vary.**

Separate files lose on three counts:

- **The WET half is the bigger half.** `date`, `status`, `language`, `repo`,
  `audio`, `seconds`, `explicit`, `project`, `album`, `credits` and the lyrics
  themselves are the same in both languages. Only `title`, `description` and the
  story differ. Two files means duplicating the majority, or a third shared file
  that neither of them is.
- **`<slug>.<locale>.md` is already taken.** `.claude/rules/content.md` § "The
  locale seam" notes the convention and, in the same breath, that it collides
  with `<slug>.<variant>.md` — a cut and a locale cannot share one dotted
  suffix. §2 resolves that collision from the other side, and the file name is
  not where it gets resolved.
- **The raw `.md` route serves the authored file.** `/music/slime.md` is a real
  URL, and it is locale-less because the file is. One file means one honest
  source, not a language-picked fragment.

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
  lyrics: [Vova Zakharov]
  music: [Vova Zakharov]
en:
  title: Breathe
  description: …
ru:
  title: Повелитель ветра
  description: …
---
```

and a body split by a locale token:

```markdown
<!-- lang:en -->

The story, in English.

<!-- lang:ru -->

Та же история, по-русски.
```

The token is an HTML comment rather than a heading: it disappears in every
markdown renderer, so the raw `.md` reads as prose and the page's heading
outline stays the author's. A section before the first token belongs to every
locale, which is where the lyrics live.

**Both locales are required where one is required.** A schema that accepts a
missing `ru.title` accepts a half-translated catalogue and says nothing about
it; the build failing on the missing key is the loud version.

## 2. The routes: locale last, as the CV spells it

`/music/<slug>/<locale>`, with the locale-less form its alias — exactly the
shape `/cv/cto/ru` already has, and `src/pages/cv/lib/cv-route-params.ts` is the
pattern to copy rather than re-invent. The addresses:

| Address                  | What it is                        |
| ------------------------ | --------------------------------- |
| `/music`                 | the index, default locale         |
| `/music/ru`              | the index in Russian              |
| `/music/<slug>`          | a song, default locale (alias)    |
| `/music/<slug>/<locale>` | a song, canonical                 |
| `/music/<slug>.md`       | the authored file, both languages |

**This is what resolves the seam `.claude/rules/content.md` flagged.** A cut is
a **dotted suffix** on the slug; a locale is a **trailing segment**. They cannot
collide because they are not the same position, and the rule file says so
instead of leaving the question open.

Two things the shape needs guarding:

- **A slug that looks like a locale.** `/music/ru` is the index in Russian, so a
  song whose repository was called `ru` would be unreachable. The schema rejects
  a slug that is a locale, which turns an unreachable page into a build failure.
- **The player is `'use client'`, and #56 bans `next-intl` there.** Its labels
  come down as props from the server page, which is already how the queue
  reaches it. No hook, no provider, no exception to ask for.

Both locales' pages are emitted by `generateStaticParams`, so nothing resolves a
locale at request time — there is no request time.

## 3. Lyrics: their own block, and it must not look like code

**The glitch the review asked me to look for is real, and it is in the birdie
commit** (ec2f556). Markdown needs two trailing spaces to make a line break, and
the lines added by hand do not have them. `apps/vova/public/music/birdie.md`
lines 28–31, 40–41, 46–49, 51–53, 59–68 and 73–81 render as run-on paragraphs:

```
Птичка! Флай, с**а, флай! Птичка! Хай ин зэ скай, на!
```

That will happen again on every hand-edit, because the fix is invisible
whitespace at the end of a line nobody can see.

So lyrics stop being prose — **but not by becoming a fenced code block**, which
is what a first pass reaches for and which renders as `<pre><code>` in the one
place the raw file is read most, GitHub. A container directive instead:

```markdown
:::lyrics{lang=ru}
Опять рассвет стучится в окно,
Он светит в глаз, но там ему темно.

Ты видишь цель, она тебя,
Ты убиваешь её, любя.
:::
```

`remark-directive` parses it; the handler takes the block's **raw source lines**
(via the node's position, not its parsed children) and emits a
`<div class="lyrics">` rendered with `white-space: pre-line` in the prose
typeface. A newline is a line, a blank line is a stanza, nothing depends on
trailing whitespace, and nothing about it is monospace.

**Parallel reading is stanza-for-stanza.** A `:::lyrics{lang=en}` block beside a
Russian one is the translation; both split on blank lines and zip by index into
a two-column layout when the page's locale is not the sung language. **Unequal
stanza counts fail the build** — a misaligned parallel text is worse than none,
and it is the one defect here that would be invisible on the page.

Where there is no translation, the page shows the original alone. `june` has no
vocal and gets no block at all.

### How the words get formatted

The recognized lyrics already have a format, and it is the one that stays. The
words come from the review; the presentation does not:

- **The author's corrections are the text.** Every line the review supplied
  replaces what the recognizer proposed — including whole stanzas and repeated
  choruses the drafts had elided.
- **Punctuation stays.** The review's raw dumps are mostly unpunctuated because
  they were typed for a recognizer to be corrected against, not for a page.
- **Every line starts with a capital**, as verse is set. The drafts lower-cased
  continuation lines, treating a stanza as a sentence; they stop.
- **Suno control markers go.** `[Chorus]`, `[Acoustic guitar intro]`, vocal
  descriptions — none of it is the song. `sashas`'s `[Instrumental waltz outro]`
  moves into the prose, where it says something about the arrangement.
- **Stress marks stay only where they carry sense**, not where they told Suno
  how to sing: `за́руку` in `letim` stays, `слО́й-мО́ря` and `безмо́лвные` go.

## 4. `name` becomes `title`

Frontmatter carries the title, the page puts it in the `<h1>`, and it is called
`title` for a song so there is no `title` vs `name` dichotomy. It is per-locale,
which is what lets `june` be _Breathe_ in English and _Повелитель ветра_ in
Russian — one song, one slug, one page, two names.

Case studies keep lifting their title out of the body's leading `# `. Doing the
same to them means re-rendering every social card and every PDF, which does not
belong in this PR; it is filed as
[#62](https://github.com/vzakharov/vovazakharov.com/issues/62).
`.claude/rules/content.md` § "Frontmatter" says which collection does which and
why, and points at the issue.

## 5. `project` becomes an array, and the roster grows

First element is the artist, the rest are features — and the schema validates
each against the registry, so a typo fails the build instead of quietly
rendering an artist nobody has.

| Project      | What it is                | Link                                   |
| ------------ | ------------------------- | -------------------------------------- |
| GENERATED    | English metal/core        | —                                      |
| Полуживые    | the Russian-language home | [t.me/papareka](https://t.me/papareka) |
| Downtemple   | already in the registry   | —                                      |
| Грёбаный бал | the harder/trap side      | [t.me/fknball](https://t.me/fknball)   |
| за/обложкой  | Russian pop               | —                                      |
| Yoohie       | features on GENERATED     | —                                      |

A feature means, in the review's words, that the song can be shown to someone
you show the other project to. That goes in `music-projects.ts`: it decides
every future assignment and is not derivable from the data.

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

**One order per song, both languages.** The _Vagabond_ listing has `june` the
other way round (`Breathe (feat. Полуживые)`), so the order really is
per-release — and holding that would mean localizing a field that is identical
in the other nine songs. Полуживые leads everywhere; the prose says the rest.

## 6. `explicit`, and the marker it renders

A boolean, and **the scaffolder already knows it** — `scaffold-song.ts` reads
the 🅴 off the master's filename and currently spends it on a comment. It fills
the field instead, so every future song gets it without anyone remembering.
`birdie` and `wereback` are the two; the page and the track list show 🅴 beside
the title.

## 7. Credits are lists of people

`credits.lyrics` and `credits.music`, each an array, each optional, each
defaulting to the author:

```yaml
credits:
  lyrics: [Sasha Zakharova, Vova Zakharov]
```

Order is contribution order, not billing: `sashas` is his sister's poem with one
verse of his, `first` is the author's alone over a harmony his father wrote.
Where a name belongs to someone who did not write the song — `reka-2`'s closing
stanza is the author's father rendering Thích Nhất Hạnh, and rendering him
loosely — that is inspiration rather than authorship and it stays in the prose.

## 8. Albums, as a registry and not yet a collection

Two albums reach this batch:

- **Cheer The Fuck Up** — `crossroads`, `wereback`, `letim`. Cover art in the
  `ctfu` repository.
- **Vagabond** / **Скиталец: по следам Конюхова** — `june`. Localized title,
  cover generated by a Flux model trained on Konyukhov's own paintings.

An `album` slug in frontmatter plus a registry in `shared/config` carrying each
album's per-locale title, its artist and its cover — and no album pages. A song
page can then name its album without anything to route to, and the day albums
get pages the data is already written. A full `albums` collection is its own
piece of work and would double this PR.

## 9. One plain fix

`crossroads` says `language: ru` and is sung in English. The field keeps its
meaning — what the vocal is in, independent of what the page is rendered in.

## 10. Hosting: the masters stay where they are

The ten masters are roughly a quarter of a gigabyte. Git keeps every version of
a binary forever, GitHub Pages publishes the whole `out/` directory on every
deploy, and a vet run builds both sites. Vendoring pays that weight on every
clone, every build and every deploy, permanently, for files that never change.
`vovas-music` is the author's own organization, serves byte ranges — which is
what lets the player seek — and costs this repository nothing.

The real problem is not where the files live but what they weigh: a listener on
a phone pays 25–30 MB for one song. That is the argument for an **optional**
streaming transcode at 128–192 kbps beside the lossless master, the player
preferring it and the page linking the master. Out of scope here, and the first
thing to do if the catalogue is ever aimed at a stranger rather than a reader
who came for the writing.

## DRY notes

- **The locale route is the CV's, not a second one.** `cv-route-params.ts`
  already parses a trailing optional locale out of a catch-all and enumerates
  every address for `generateStaticParams`. The song route wants the same thing
  over a different head segment, so the locale half lifts into `shared/i18n` and
  both callers spell only what differs — the CV its variants, music its slugs.
  Two hand-written copies of "last segment may be a locale" would drift the day
  a third locale lands.
- **The per-locale frontmatter block is a shared shape, not a song's.** `title`
  and `description` per locale is what any localized document will want, so it
  lives in `shared/content/frontmatter.ts` beside the base frontmatter and the
  song schema composes it. The case-study schema does not take it yet
  ([#62](https://github.com/vzakharov/vovazakharov.com/issues/62)).
- **The locale token and the stanza split are one parser used twice.** Both cut
  a body into labelled parts on a marker. One function taking the marker, in
  `shared/content/`, not two near-copies; the callers differ — one keys by
  locale, one zips by index — which is where the difference belongs.
- **`project` and `album` are one registry pattern**, both a slug resolving to a
  record in `shared/config` with a display name and a link. Deliberately not
  unified into one "entity" type: an album has a cover and a track order, a
  project has a channel, and the intersection is two fields. A shared base for
  those two and separate records for the rest, which is what `pnpm type-overlap`
  floor 2 asks for anyway.
- **Nothing new is extracted for the explicit marker** — one boolean read in two
  places that already hold the same frontmatter object.
- **The scaffolder's 🅴 detection is reused, not re-derived.** It exists and is
  currently thrown away into a comment; §6 is a wiring change.

## Decisions taken

Answers from the review, recorded so a later reader does not re-open them:

1. **Localized routes are in scope**, because #56 removes the client-side
   translation runtime — "без рутов кажется никак". Locale goes **last**, as
   `/cv/cto/ru` does.
2. **I write the lyric translations**, including `first` and `reka-2`.
3. **`wereback` is `[GENERATED, Yoohie]`** — as the _Cheer The Fuck Up_ listing
   has it.
4. **`june` is `[Полуживые, GENERATED]` in both languages.** The order does
   differ per release; carrying that is complexity the catalogue does not need
   yet.
5. **Albums: registry now, pages later.**
6. **Case studies keep their heading-derived title**, with
   [#62](https://github.com/vzakharov/vovazakharov.com/issues/62) filed so it is
   not forgotten.
7. **The recognized lyrics' format stays** — punctuation kept, every line
   capitalized, the words replaced by the author's.

## The order of work

1. **Schema and rules.** Per-locale frontmatter, `title`, `project` array,
   `explicit`, `credits`, `album`, the project and album registries,
   `.claude/rules/content.md` rewritten — including the seam §2 resolves.
2. **Routes.** The locale segment lifted out of the CV's parser, the music
   catch-all, `generateStaticParams` over slugs × locales, metadata and
   `hreflang`, the sitemap, the slug-is-not-a-locale guard, and the player's
   labels passed down as props.
3. **The lyric block.** `remark-directive`, the raw-source handler, the
   stanza-count check, the parallel layout, the styles.
4. **The ten documents.** The author's stories from the threads in both
   languages, the corrected lyrics under §3's formatting rules, projects,
   credits, explicit flags, albums, `crossroads`'s language.
5. **English cribs** for the Russian lyrics, marked as cribs rather than singing
   versions.
6. `/polish`, then the PR body and the squash proposal against what it became.

**A note on #56.** It lands in the same area — it is the PR that makes step 2
necessary, and its lint rule is what step 2 has to satisfy. Whichever merges
second takes the merge; nothing here is written to depend on the other landing
first.
