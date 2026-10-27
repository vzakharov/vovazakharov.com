> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Vet Vova's English against a word-frequency list

From the review of #212
([thread](https://github.com/vzakharov/vovazakharov.com/pull/212#discussion_r4385734308)):
the English of an article presented as Vova's is checked against the N thousand
most frequent English words, with an allow list for the rare words he likes
(`copacetic`) and lyrics left out. The same review
([thread](https://github.com/vzakharov/vovazakharov.com/pull/212#discussion_r4385608878))
asks for a **stop list** — words never used at all — starting with `of the lot`
and `pesky`.

## What a trial sweep already shows

Run over `the-five-percent.en.md` as it stood before cf6e84a (1,100 words), with
wordfreq's ranked English list, single words only, capitalised words skipped:

| N      | flagged | of the idioms Vova named, caught            |
| ------ | ------- | ------------------------------------------- |
| 5,000  | 55      | pesky, wobbly, crooked, hotshot (+ `blank`) |
| 10,000 | 32      | pesky, wobbly, crooked, hotshot             |
| 20,000 | 16      | pesky, wobbly, hotshot                      |
| 30,000 | 8       | hotshot                                     |
| 50,000 | 4       | —                                           |

Three things follow:

- **Frequency catches the odd word, never the odd phrase.** `of the lot` and
  `draw a blank` are made of the commonest words there are; only a phrase list
  catches them. That is why the stop list is a list of phrases, not a list of
  words.
- **Most noise is inflection and tokenising, not vocabulary.** At 20k the rest
  of the list is `fattest`, `paraphrased`, `prefixes`, `deliberated` (base forms
  common), `doesn`/`isn` (a curly apostrophe split the word), and
  `translatedfrom` (frontmatter). Folding inflections and reading prose nodes
  only removes all of those.
- **Domain words are the real allow-list material**: `repository`, `registry`,
  `bottleneck`, `persona`, `parameter` at 10k. They are plain to this blog's
  readers.

## The approach

### 1. The word list: wordfreq, vendored

`scripts/lib/word-frequency/en.txt` holds wordfreq's top 50,000 English words,
ranked, one per line (~400 KB), written by a small
`scripts/lib/word-frequency/export.py` that is run by hand, not in vet. Vet
reads the text file, so no Python package joins the toolchain. wordfreq's data
is CC BY-SA 4.0: the file carries the attribution in a header comment.

### 2. What counts as Vova's English

A document whose frontmatter says `author: vova` — the field the byline already
renders — read in its English form:

- a `translated` collection's `<slug>.en.md` when its original's author is
  `vova` (the translation itself states no author);
- an unlocalized document's whole body (case studies, the Bible);
- a song whose lyrics credit is Vova alone: only its `lang:en` story, by way of
  `localeProse(body, 'en')` from `src/pages/music/lib/sections.ts`. Lyrics,
  `universe:` and `source:` preludes are never read — the first is sung, the
  other two are the agent's by `songs.md`.

Everywhere: prose text nodes only (`proseSpans` from
`scripts/lib/public-markdown.ts`), so code, links and frontmatter are never
read, and `>` blockquotes are skipped, being someone else's words. basilisk.fyi
(the Clerk) and mayawonders.com (Майя) never qualify, having no `author: vova`
document.

### 3. Matching

- **Tokens**: letters with an inner apostrophe, curly or straight, folded to `'`
  and lowercased (`doesn’t` → `doesn't`, which the list carries).
- **Proper nouns are skipped**: a capitalised word not at a sentence's start. A
  sentence-initial word is checked lowercased.
- **Inflections fold**: a word passes when it or a naive base form is in the top
  N — `-s/-es/-ies`, `-ed/-d/-ied`, `-ing`, `-er/-est/-ier/-iest`, with doubled
  consonant and dropped `e` undone (`fattest` → `fat`, `deliberated` →
  `deliberate`). Over-folding only ever lets a word through, never flags one.
- **Hyphenated compounds** are checked part by part.

### 4. The two lists

Both in `scripts/lib/word-frequency/`, one entry per line, `# reason` allowed
after it:

- **`allow.txt`** — words that pass at any N. Seeded with `copacetic`; the rest
  is filled from the sweep (§ 5).
- **`stop.txt`** — words and phrases that fail at any N, matched across line
  breaks and case, each word's regular inflections folded the same way (`pesky`
  catches `peskier`); an irregular form is a line of its own (`drew a blank`
  beside `draw a blank`). Seeded with `of the lot` and `pesky`.

`draw a blank`, `wobbly`, `crooked` and `hotshot` go in neither list up front:
Vova named them too idiomatic, but below stop-list level. They are what the
sweep is checked against — at the chosen N each must flag (all but
`draw a blank` do at 10k), and they land in the sweep report for his call.

### 5. Two bites, one PR

**Bite 1 — the sweep.** `pnpm words:sweep [--n 5000,10000,20000,30000]` prints,
per N, every flagged word with its count and the files it is in, and writes the
same to `tmp/word-sweep.md`. The report goes on this PR as a comment, a table
per N, so Vova marks each word: allow, replace, or stop. `pnpm check:stop-words`
lands in vet in this bite already — the stop list is settled and the corpus is
clean of it today.

**Bite 2 — the gate**, after his marks: the allow and stop lists filled from
them, N fixed (recommended: **10,000**, the smallest N that catches all three of
the single words he named, adjustable once the allow list exists), replacements
made in the documents, and `pnpm check:rare-words` joins vet.

One script, `scripts/check-words.ts`, serves all three entries; each mode is a
flag.

### 6. Where the agent learns of it

The translating agent is the one reaching for idioms, so
`.claude/rules/lsa-voice.md` (or whichever rule governs translating Vova's
articles — to confirm on bite 1) gets one line: the stop list and the gate exist
and are run before handing a translation over. The lists themselves are the
content; the rule only points.

## Tests

`scripts/check-words.test.ts` (node:test): tokenising (curly apostrophes,
hyphens, sentence-initial capitals vs. proper nouns), inflection folding both
ways, phrase matching across line breaks and inflections, and section selection
on a song fixture (lyrics and preludes never read).

## DRY notes

- **Reused**: `proseSpans`, `findingLines`, `lineAt`, `frontmatterSpan` and
  `publicMarkdownFiles` from `scripts/lib/public-markdown.ts`, the same helpers
  `check-masked-words.ts` stands on; `localeProse` from
  `src/pages/music/lib/sections.ts` for a song's English story, rather than a
  second marker parser (`scripts/lib/stanza-repeats.ts` parses lyrics only, so
  it does not fit).
- **Not shared**: the frontmatter read of `author`. `documents.ts` owns the
  schema but is `server-only`; the script reads the one field with `gray-matter`
  and a one-key zod schema, as `check-masked-words.ts` does for `masked`.
  Importing the full schema would mean the `react-server` condition for one
  string.
- **One script for three entries** rather than three scripts: the corpus walk
  and tokeniser are the bulk of it, and the modes differ only in which list they
  test against.

## Open questions

Each has a recommendation already in force above, so silence keeps it.

1. **Word list source.** (a) wordfreq, vendored — recommended: ranked, current,
   multi-corpus, includes contractions. (b) SUBTLEX-US — film subtitles, closer
   to spoken English, older and needs a download by hand. (c) Google's 10k list
   — too short to try other N.
2. **Inflection folding.** (a) Fold naive base forms — recommended; it removed
   four of the sixteen false flags at 20k. (b) Exact forms only — simpler,
   noisier.
3. **Corpus.** (a) `author: vova` documents plus his songs' English stories —
   recommended. (b) Articles only, songs left out. (c) Also the agent's own
   English (Bible articles by other authors, preludes) — not what was asked.
4. **N for the gate.** (a) 10,000 — recommended, per § 5. (b) 20,000 — about
   half the flags, misses `crooked`. Settled for real after the sweep.
5. **Stop list's reach.** (a) The same corpus — recommended. (b) Every English
   document on every site, personas included — `pesky` would be banned from Майя
   too, which is her voice, not his.
