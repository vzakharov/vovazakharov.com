---
description: What a song is beyond any other document — its title, frontmatter, slug, optional hook, body markers, romanization and lyric notes — and how a draft of material whose author is in the room is written
paths:
  - sites/*/public/music/**
  - sites/*/app/**/music/**
  - src/music/**
  - docs/music/**
---

# Songs

Everything in `content.md` holds for a song; this file is what a song adds.

## Frontmatter

**A song states its title in frontmatter**, where an article lifts its own from
a leading `# `. Two things make it a field rather than a heading: the player bar
shows it as `Title — Artist`, so deriving it would mean parsing prose to render
a control, and one song can have two names — `breathe` is _Breathe_ in English
and _Повелитель ветра_ in Russian, and a leading `# ` can only be one of them. A
song body therefore opens without a `# `, and the page puts the locale's title
in the `<h1>` — the same header slot a case study's lifted heading fills. Moving
the case studies to the same shape is
[#62](https://github.com/vzakharov/vovazakharov.com/issues/62); their titles
feed `content:og` and `content:pdf`, which hash their sources, so the move costs
a re-render of every card and PDF.

The top-level `title` is the song's own name: the one in the language it is sung
in (or `titleLanguage`'s), the English one for an instrumental or a title in
neither locale's language. A locale states `title` only where it differs from
that: a string is the name the song goes by there (`breathe`'s `ru`), and
`title: { translation }` keeps the song's name and says what it means in the
locale's language. A locale never carries both, a gloss being of the name it
keeps. **A title in a script the locale's reader may not read shows in Latin
letters**, in italics, until the reader switches to the original: Russian by
rule (`music/shared/catalogue/romanize.ts`), anything else by a hand-written
`titleLatin` — `Mithqāl`, `Ágios o skopós` — which also overrides the rule for a
name with an established Latin spelling. A title neither spells fails the build.

A song's frontmatter carries what the markdown cannot: its `repo`, the master's
duration (read by the scaffolder), `lossy` where the master is itself an MP3,
and `mp3Bytes`, the feeds' enclosure size, which the tag run writes — no file
URL, every one being derived from `repo` and the billing
(`music/shared/catalogue/song-files.ts`), the player streaming the MP3, or a
FLAC master's MP4 rewrap for a reader asking for lossless, while the downloads
keep the FLAC, `video` where it has one — its `src` a site-root path, its words
timed beside it as `<src>.<language>.vtt` per lyrics column (the build fails
without the sung one's; `src/music/scripts/song-intake/CLAUDE.md` § "Captions"),
and its `offsetSeconds`, where the master starts on it; opened from a button
beside the play control rather than linked in the story, so that starting it can
pause the player — `language` — what the vocal is in, independent of what the
page is rendered in — `project` as a list with the artist first and features
after, `explicit`, `segue` where the song runs into its release's next track,
which a shuffle then never parts it from, `album`, and `credits.lyrics` /
`credits.music` as lists of people in contribution order, absent meaning the
author alone — each name in either locale's spelling from
`music/shared/catalogue/people.ts`, which shows it in the reader's. **Each album
and artist is a file**, `albums/<slug>.md` and `artists/<slug>.md`, its slug the
file's name and everything else the catalogue knows of it in its frontmatter —
`albumFrontmatterSchema` and `artistFrontmatterSchema` say what. An album has a
cover when `assets/covers/<slug>.jpg` exists. A song's `album` and `project`
must name one of those files, `music/shared/catalogue/catalogue-names.ts`
reading them off the directory, so a typo fails the build rather than quietly
rendering an artist nobody has. **`artists/generated.md` is GENERATED, an artist
like the others** — the one with the most songs — never a general story of
Vova's music: a note spanning several artists goes on each of their pages.

**A song's slug is its name in English, chosen once.** The file name is the
address, and a static export has no redirects, so renaming a published song
breaks every link to it. An English title is taken as it stands; a Russian one
is translated, by the reference it rests on rather than word for word (`moroz` →
`frost-the-governor`, after «Мороз-воевода»; `mu-icok-new` → `little-peasant`,
after «мужичок с ноготок»), unless it is a name or a sound with nothing to
translate (`lyoli`, `chikh-pykh`); a title in any other language is kept,
transliterated (`babay-minem`, `agios-o-skopos`). Then lowercase, words joined
by hyphens, punctuation and a leading “the”/“a” dropped, and a long title cut to
its most recognisable part (`stricken-deer`). A short form the title is already
known by stays: an acronym (`ctfu`), a number (`sonnet-74`, `2girls1fridge`), a
one-word genre (`requiem`). An album's slug follows the same rule.

**A song's audio lives in its `vovas-music` repository**:
`src/music/scripts/song-intake/CLAUDE.md` § "A song's repository" says what it
holds, where a change to its mix or master is made, and how a new song gets one.
**A master's file names and tags are derived from the frontmatter** by
`pnpm music:masters tag`, `<Artist> - <Title>` in each spelling the song's pages
show: a title, billing, album, credit, lyric or cover edit leaves them stale,
which `pnpm music:masters check` in vet reports and the build fails on once the
name moves, until the song is re-run. **Audio and lyrics a song arrives
without** — an album file to split, lyrics to hear off the recording, a mix to
master — are `src/music/scripts/song-intake/CLAUDE.md`'s, read before touching
the audio.

**A song publishes whatever it has.** Its `hook` is optional, in both locales or
neither: the line under the song's name that makes someone press play — a
question, a turn, an image it opens on — never a summary of what the song is
about, and the page's meta description too. Its one mark is `~~…~~`, words meant
to be seen crossed out — in the meta description and the feed too. A joke struck
in one locale's hook is struck in the other's too, in that language's own idiom.
**A hook earns its words one by one**: the fewest that pull, often a line of the
song standing on its own, unquoted, unless the song's story holds a better hook
than its words do. Quotation marks belong to someone's words being quoted: a
line from the story, a line the song itself sings as a quotation (a son's
question in `20`), or a quote inside the hook's own sentence. A gloss explaining
the line is overthinking it. **The hook is the agent's to write, unasked**, once
the song has a story: a song is left without one only while it has none. The
author's oxymorons («Этот жар — всё, что тебе нужно, чтобы не сгореть») are his
signature, and a song that has one offers it first. An album's or an artist's
file carries its hook the same way, under each locale's key. `pnpm music:untold`
writes what each song still lacks to `docs/music/untold-songs.md`, and the song
vet fails while that list is stale.

## Body

**A song's body is cut on markers, not headings.** `<!-- lang:en -->` and
`<!-- lang:ru -->` open the story in each language; `<!-- lyrics:ru -->` and
`<!-- lyrics:en -->` hold the words, the key being the language they are in
rather than the page's. Words never arrive alone: the crib in the other locale's
language — `lyrics:en` under Russian words, `lyrics:ru` under English — is
written with them, and a phrase sung in a language other than its column's
carries a footnote there translating it. Identical consecutive stanzas are one
stanza closed by `x2`, `x3` …, which `pnpm check:stanza-repeats --fix` writes.
Anything before the first marker belongs to every locale. A song or album set in
a concept album's world tells that world under `<!-- universe:<locale> -->`,
which the page shows where the file puts it beside the `lang:` story: the first
of the two is never headed, and the second is headed by what it is — behind the
scenes for the story, its kind for the prelude. **The test is the voice, not the
subject: could a narrator inside the world say it?** What happens there passes,
told as fiction; anything that speaks _about_ the song — what it echoes or
quotes, how it opens, unfolds or sounds, how it was made — fails, however short
and however much it is about the world's god, and goes behind the scenes. The
world is the agent's literary telling of the author's plot, the dictation being
the plot and never the text; the page's hook is the seed it grows from. **A song
resting on someone else's text — a poem it sets, a song it covers — tells that
source's story under `<!-- source:<locale> -->`** in the same slot — when and
why it was written, where it appeared, what it was later set to — so the
author's own story follows behind the scenes; a file has one or the other.
Unlike his story the source's is the agent's to write, from sources, each fact
one a source states. The marker is an HTML comment because the authored file is
read raw — on GitHub, and at its own `.md` URL — and anything else would be
markup the reader has to look past. The lyrics are rendered by the page rather
than by the markdown pipeline, one element per line, so a line break is a line
break and needs no two invisible spaces at the end of it. The one inline mark
they take is `_…_`, which sets a transliteration in italics: a word sung in
another script is written in the column's letters — in-the-flesh's English sings
_Poekhali!_, not «Поехали!» — and a transliteration is italic wherever the page
shows one, a title's Latin spelling included.

**Who sings is noted on the sung words, for reference.**
`<!-- voice: Кирилл -->`, `<!-- voice: Майя, Кирилл -->` for a duet, or a bare
`male`, `female`, `duet` where a song has no characters, on its own line above a
stanza, holds from that stanza until the next note. The notes are free text,
read by whoever writes about the song (Майя's reflections), never by the build:
the verse reader drops any line that is a whole HTML comment, so a note of
another kind (`<!-- solo -->`) needs no code either.

**Words mostly in a script the reader may not read show in Latin letters**: from
a section under `<!-- lyrics:<language>-latn -->`, lowercase — `lyrics:ar-latn`
for `mithqal` — else, for Russian, by rule; any other language without one fails
the build. A section matches the words stanza for stanza and line for line and
carries no notes, which hang off the words; either slip fails the build. The
page's current language chip switches the words between spellings with the
names, Latin first. **`keepsScript: true` keeps the original in Latin mode**,
the romanization in italics under each line rather than in its place — the words
only, the title switching like any name: Latin letters standing in for a Quranic
phrase are what scholars object to, and a reading aid under it is what they
accept.

**A note in the lyrics is a footnote in its lyrics section** —
`[phrase][^label]` hangs it off that phrase, a bare `[^label]` at the end of a
line off the whole line — ending consecutive lines of a stanza, off all of them
as one block, which is how a note on several lines is written rather than as one
on the first saying how far it reaches — and `[^label]: …` on a line of its own
below the verse says it, in one line of markdown. GitHub renders a footnote as
one and leaves the phrase's brackets standing around the words it is about,
which is why it is not a syntax of the site's own; labels are unique across the
file for the same reason, so the two languages' notes are suffixed `-ru` and
`-en`. A note is in the language of the text it hangs off, and the page shows
only the notes of the column in its own language — the crib's on a page whose
language is not the one sung, the words' own on a page in it. A marker with no
definition, a definition nothing carries, and a whole-line note sharing its line
with another each fail the build.

## Material whose author is in the room

A song's story and its words are the author's, not the pipeline's, and that
changes how a draft of one is written and what a review of it means.

- **A draft written without the author is a proposal, not a record.** What a
  repository holds and what a recogniser heard are the only inputs an agent has;
  a channel post, an old thread or a listing is the same kind of input. None of
  it establishes what a song is about or where it came from, so a draft says
  what it was built from and is replaced wholesale when the author answers.
  **This is not an error being corrected** — a draft is the best reading
  available without the facts, and calling it a mistake afterwards mislabels the
  one thing it was for. Say what changed, not what was wrong.
- **The author's comment is the body, verbatim.** Text in a review comment is
  how he wants the page to read, save for slips, formatting and paragraphing,
  unless he says otherwise; a `---` after it separates the verbatim part from
  instructions about it. Translating into the other language is the agent's, and
  so is the blurb; retelling the story in better words is not. It is too
  personal to come from anywhere but him. The two preludes are the exceptions (§
  "Body"): a concept album's world, told in the agent's words from his plot, and
  a source's story, from sources.
- **A dictation is speech, and a page is writing.** What reaches a story is his
  facts in his first person, written down: the fillers, hedges and asides to the
  transcriber go («скажем», «наверное», «так сказать», «ты, Клод, …»), and with
  them a doubt he voiced about a fact, which keeps the fact off the page rather
  than hedging it there. A general note in a dictation — the covers, the
  platforms, the tooling — stays in the dictation; it is kept for later, not
  spread over every story it touches.
- **A change to a song's story or words is checked against its reflection.**
  Майя's `<slug>.maya.reflections.md` may quote or answer what changed; where it
  does, she adds a closing paragraph per `persona-reflections.md`.
- **Nothing is explained on his behalf.** He writes for people who already know
  him, so a fact he left out was left out. Adding the line of context a stranger
  would want takes the piece away from the reader it was written for.
- **The words are set as verse.** His lines and stanzas, every line capitalized,
  his punctuation kept, the repeats he sings and the drafts elided; Suno's
  control markers (`[Chorus]`, vocal directions), its stress marks, phonetic
  respellings, drawn-out syllables (`Insi-ide`, `(а-аа)`) and pause ellipses are
  instructions to a singer, not part of the song, and do not travel — the words
  are set as a person would write them. An ellipsis a published poem prints is
  the poem's and stays.
- **A word is written out, in both columns and the frontmatter.** An expletive
  is not masked (`f*ck`, `х*й`), whatever the source did;
  `pnpm check:masked-words` fails on the common forms. The exception is a mask
  the recording itself carries — a word bleeped on the track, as the author's
  choice — which stays masked and is named in the frontmatter's `masked`, the
  word as written keyed to the reason (`our-punk-rock`'s `про**ли`).
- **Russian is written with ё** wherever the word has it — `её`, `ещё`, `нём`,
  `идёт` — including in a published translation that printed `е`. Where the
  letter changes the word (`все`/`всё`, `небо`/`нёбо`), the sense decides, never
  a blind replace.
