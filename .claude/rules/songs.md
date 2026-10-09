---
description: What a song is beyond any other document — its title, frontmatter, slug, hidden state, body markers, romanization and lyric notes — and how a draft of material whose author is in the room is written
paths:
  - apps/*/public/music/**
  - apps/*/app/music/**
  - src/pages/music/**
  - src/shared/music-catalogue/**
  - docs/music/**
  - scripts/check-song-titles.ts
  - scripts/check-masked-words.ts
  - scripts/check-stanza-repeats.ts
  - scripts/list-hidden-songs.ts
  - scripts/scaffold-song.ts
  - scripts/vet-songs.sh
---

# Songs

Everything in `content.md` holds for a song; this file is what a song adds.

## Frontmatter

**A song states its title in frontmatter**, where an article lifts its own from a leading `# `. Two things make it a field rather than a heading: the player bar shows it as `Title — Artist`, so deriving it would mean parsing prose to render a control, and one song can have two names — `breathe` is _Breathe_ in English and _Повелитель ветра_ in Russian, and a leading `# ` can only be one of them. A song body therefore opens without a `# `, and the page puts the locale's title in the `<h1>` — the same header slot a case study's lifted heading fills. Moving the case studies to the same shape is [#62](https://github.com/vzakharov/vovazakharov.com/issues/62); their titles feed `content:og` and `content:pdf`, which hash their sources, so the move costs a re-render of every card and PDF.

The top-level `title` is the song's own name: the one in the language it is sung in (or `titleLanguage`'s), the English one for an instrumental or a title in neither locale's language. A locale states `title` only where it differs from that: a string is the name the song goes by there (`breathe`'s `ru`), and `title: { transliteration, translation }`, either key optional, keeps the song's name and glosses it — the name in the locale's letters, shown only where the reader cannot read its script, and what it means in the locale's language. A locale never carries both, a gloss being of the name it keeps. A title written as a romanization — `Mithqāl`, `Ágios o skopós` — sets `titleTransliterated: true` and shows in italics wherever it appears, the player's lock-screen metadata aside; a locale's own name for the song never does.

A song's frontmatter carries what the markdown cannot: the master's URL and duration (both read by the scaffolder), `status`, `language` — what the vocal is in, independent of what the page is rendered in — `project` as a list with the artist first and features after, `explicit`, `album`, and `credits.lyrics` / `credits.music` as lists of people in contribution order, absent meaning the author alone — each name in either locale's spelling from `shared/music-catalogue/people.ts`, which shows it in the reader's. The project and album names are enums in `shared/music-catalogue`, beside the schema that reads it all, so a typo fails the build rather than quietly rendering an artist nobody has; how each is shown and addressed is `pages/music`'s.

**A song's slug is its name in English, chosen once.** The file name is the address, and a static export has no redirects, so renaming a published song breaks every link to it. An English title is taken as it stands; a Russian one is translated, by the reference it rests on rather than word for word (`moroz` → `frost-the-governor`, after «Мороз-воевода»; `mu-icok-new` → `little-peasant`, after «мужичок с ноготок»), unless it is a name or a sound with nothing to translate (`lyoli`, `chikh-pykh`); a title in any other language is kept, transliterated (`minem-babay`, `agios-o-skopos`). Then lowercase, words joined by hyphens, punctuation and a leading “the”/“a” dropped, and a long title cut to its most recognisable part (`stricken-deer`). A short form the title is already known by stays: an acronym (`ctfu`), a number (`sonnet-74`, `2girls1fridge`), a one-word genre (`requiem`). An album's slug follows the same rule.

**Audio and lyrics a song arrives without** — an album file to split, lyrics to hear off the recording, a mix to master — are `scripts/song-intake/CLAUDE.md`'s, read before touching the audio.

**`hidden: true` stays on a song until it has a description and a story in both languages**, and a story arriving brings its `description` in both locales with it. `pnpm music:hidden` writes what each one still lacks to `docs/music/hidden-songs.md`, and the song vet fails while that list is stale.

## Body

**A song's body is cut on markers, not headings.** `<!-- lang:en -->` and `<!-- lang:ru -->` open the story in each language; `<!-- lyrics:ru -->` and `<!-- lyrics:en -->` hold the words, the key being the language they are in rather than the page's. Words never arrive alone: the crib in the other locale's language — `lyrics:en` under Russian words, `lyrics:ru` under English — is written with them, and a phrase sung in a language other than its column's carries a footnote there translating it. Identical consecutive stanzas are one stanza closed by `x2`, `x3` …, which `pnpm check:stanza-repeats --fix` writes. Anything before the first marker belongs to every locale. The marker is an HTML comment because the authored file is read raw — on GitHub, and at its own `.md` URL — and anything else would be markup the reader has to look past. The lyrics are rendered by the page rather than by the markdown pipeline, one element per line, so a line break is a line break and needs no two invisible spaces at the end of it. The one inline mark they take is `_…_`, which sets a transliteration in italics: a word sung in another script is written in the column's letters — in-the-flesh's English sings _Poekhali!_, not «Поехали!» — and a transliteration is italic wherever the page shows one, a title's gloss included.

**Words in a script the reader may not read carry a romanization** under `<!-- lyrics:<language>-latn -->`, lowercase — `lyrics:ar-latn` for `mithqal`. It matches the words stanza for stanza and line for line and carries no notes, which hang off the words; either slip fails the build. A switch, off by default, sets each romanized line in italics under its own — beside the script, never in place of it, which is what makes Latin letters acceptable under a Quranic phrase.

**A note in the lyrics is a footnote in its lyrics section** — `[phrase][^label]` hangs it off that phrase, a bare `[^label]` at the end of a line off the whole line — ending consecutive lines of a stanza, off all of them as one block, which is how a note on several lines is written rather than as one on the first saying how far it reaches — and `[^label]: …` on a line of its own below the verse says it, in one line of markdown. GitHub renders a footnote as one and leaves the phrase's brackets standing around the words it is about, which is why it is not a syntax of the site's own; labels are unique across the file for the same reason, so the two languages' notes are suffixed `-ru` and `-en`. A note is in the language of the text it hangs off, and the page shows only the notes of the column in its own language — the crib's on a page whose language is not the one sung, the words' own on a page in it. A marker with no definition, a definition nothing carries, and a whole-line note sharing its line with another each fail the build.

## Material whose author is in the room

A song's story and its words are the author's, not the pipeline's, and that changes how a draft of one is written and what a review of it means.

- **A draft written without the author is a proposal, not a record.** What a repository holds and what a recogniser heard are the only inputs an agent has; a channel post, an old thread or a listing is the same kind of input. None of it establishes what a song is about or where it came from, so a draft says what it was built from and is replaced wholesale when the author answers. **This is not an error being corrected** — a draft is the best reading available without the facts, and calling it a mistake afterwards mislabels the one thing it was for. Say what changed, not what was wrong.
- **The author's comment is the body, verbatim.** Text in a review comment is how he wants the page to read, save for slips, formatting and paragraphing, unless he says otherwise; a `---` after it separates the verbatim part from instructions about it. Translating into the other language is the agent's, and so is the blurb; retelling the story in better words is not. It is too personal to come from anywhere but him.
- **Nothing is explained on his behalf.** He writes for people who already know him, so a fact he left out was left out. Adding the line of context a stranger would want takes the piece away from the reader it was written for.
- **The words are set as verse.** His lines and stanzas, every line capitalized, his punctuation kept, the repeats he sings and the drafts elided; Suno's control markers (`[Chorus]`, vocal directions), its stress marks, phonetic respellings, drawn-out syllables (`Insi-ide`, `(а-аа)`) and pause ellipses are instructions to a singer, not part of the song, and do not travel — the words are set as a person would write them. An ellipsis a published poem prints is the poem's and stays.
- **A word is written out, in both columns and the frontmatter.** An expletive is not masked (`f*ck`, `х*й`), whatever the source did; `pnpm check:masked-words` fails on the common forms.
- **Russian is written with ё** wherever the word has it — `её`, `ещё`, `нём`, `идёт` — including in a published translation that printed `е`. Where the letter changes the word (`все`/`всё`, `небо`/`нёбо`), the sense decides, never a blind replace.
