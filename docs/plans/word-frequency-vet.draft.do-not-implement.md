> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Show the agent the rare words in Vova's English

From the review of #212
([thread](https://github.com/vzakharov/vovazakharov.com/pull/212#discussion_r4385734308)):
the English of an article presented as Vova's is read against the N thousand
most frequent English words.

**A rare word is not the fault; a rare word with no punch is.** `pesky humans`
in a riff on AI wiping us out is irony, and stays. `pesky` where a plainer word
says the same is slop. No list can tell those apart, so nothing here passes or
fails a word: whenever an agent writes such an article, a hook shows it the rare
words it just wrote, and the agent decides whether each one earns its place.

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

- **Frequency catches the odd word, never the odd phrase.** `of the lot` and
  `draw a blank` are made of the commonest words there are; only a phrase list
  shows them (§ 4).
- **Most noise is inflection and tokenising, not vocabulary.** `fattest`,
  `paraphrased`, `deliberated` (base forms common), `doesn`/`isn` (a curly
  apostrophe split the word), `translatedfrom` (frontmatter). Folding
  inflections and reading prose nodes only removes them.
- **No N separates live language from ornate idiom.** Vova kept `skewed` (~21k)
  and `blind spot`, and found `pesky` (~25k) and `wobbly` (~28k) too much — and
  found the flattest replacements (`doesn’t make sense to me`, `wrong`, `cool`)
  too dry. The judgement is the agent's, against the sentence, which is the case
  for showing rather than gating.

## The approach

### 1. The word list: wordfreq, vendored

`scripts/lib/word-frequency/en.txt` holds wordfreq's top 50,000 English words,
ranked, one per line (~400 KB), written by
`scripts/lib/word-frequency/export.py`, run by hand. The hook reads the text
file, so no Python package joins the toolchain. wordfreq's data is CC BY-SA 4.0:
the file carries the attribution in a header comment.

### 2. Which files

An article whose frontmatter says `author: vova`, in English:

- a `translated` collection's `<slug>.en.md` when its original's author is
  `vova` (the translation itself states no author);
- an unlocalized document (case studies, the Bible).

Songs are left out. Prose text nodes only (`proseSpans` from
`scripts/lib/public-markdown.ts`), so code, links and frontmatter are never
read, and `>` blockquotes are skipped, being someone else's words.

### 3. Matching

- **Tokens**: letters with an inner apostrophe, curly or straight, folded to `'`
  and lowercased (`doesn’t` → `doesn't`, which the list carries).
- **Proper nouns are skipped**: a capitalised word not at a sentence's start.
- **Inflections fold**: a word counts as common when it or a naive base form is
  in the top N — `-s/-es/-ies`, `-ed/-d/-ied`, `-ing`, `-er/-est/-ier/-iest`,
  doubled consonant and dropped `e` undone (`fattest` → `fat`).
- **Hyphenated compounds** are checked part by part.
- **N = 5,000** to start, one constant, widened once the hook's output shows
  where it costs more attention than it buys.

### 4. Phrases

An idiom is made of common words, so frequency cannot see it. Two sources, shown
exactly as a rare word is and under the same judgement, labelled as idioms:

- **Wiktionary's `Category:English idioms`**, vendored as
  `scripts/lib/word-frequency/idioms.txt` by the same hand-run export (CC BY-SA,
  attributed like the word list). It carries `draw a blank`, and not `at least`,
  so its idea of an idiom is the figurative one. Its noise is measured on the
  first sweep; a source that buries the useful idioms goes rather than being
  filtered.
- **`scripts/lib/word-frequency/phrases.txt`**, by hand, for what the dictionary
  lacks — `of the lot` is not an entry there. It grows from review: a phrase
  Vova marks as too idiomatic goes in, in the session that addresses the
  comment, which `.claude/rules/lsa-voice.md` says in one line, since that
  session reads the article and so loads the rule.

Matching folds regular inflections word by word and takes irregular verb forms
from a short table beside the matcher (`drew a blank` → `draw a blank`), across
line breaks and case. `pesky` needs no entry: frequency already shows it.

### 5. The repo's terminology

`scripts/lib/word-frequency/terms.txt`: the standard vocabulary of what these
sites are about — `repository`, `parameter`, `persona`, `musician`, `verse`.
Rare in English at large, the plain word here, with nothing simpler to say
instead, so the hook never shows them. It is not a list of words someone likes:
a term goes in when it is the subject's own name for a thing, and a word kept
for its colour (`copacetic`) is judged in its sentence like any other. Seeded
from the first sweep's output, each entry put to Vova on the PR before it lands.

### 6. The hook

`.claude/hooks/rare-words.sh`, PostToolUse on `Edit|Write|MultiEdit` beside
`format-md.sh`, calls `node scripts/rare-words.ts <file>` with the text the tool
wrote:

- **Write** — the whole file; **Edit/MultiEdit** — only each `new_string`, so a
  one-line fix shows the words of that line, not the article's whole list again.
- A file outside § 2 exits silently.
- Nothing found → silent. Found → `additionalContext` listing each word or
  phrase with its line, then the question, stated in the hook's output since
  that is the moment it matters:

  > Each of these is rare in English. Keep one where it does work the plain word
  > cannot — irony, colour, emphasis (`pesky humans`, of an AI's plans).
  > Otherwise replace it, with living language rather than the flattest synonym
  > (`blind spot`, not `doesn’t make sense to me`).

- **Never blocks**: exit 0 always, so the edit stands and the agent decides.

### 7. On demand

`pnpm words:sweep [--n 5000,10000,20000] [<file>…]` prints the same report for
whole files, defaulting to every file § 2 covers: for reviewing an article
written before the hook, and for choosing N. Nothing joins vet — there is no
verdict to gate on.

## Tests

`scripts/lib/word-frequency/rare-words.test.ts` (node:test): tokenising (curly
apostrophes, hyphens, sentence-initial capitals vs. proper nouns), inflection
folding, phrase matching across line breaks, file selection (a translation
qualifying by its original's `author`, a song or persona file never), and the
Edit case reading `new_string` only.

## DRY notes

- **Reused**: `proseSpans`, `lineAt` and `publicMarkdownFiles` from
  `scripts/lib/public-markdown.ts`, which `check-masked-words.ts` stands on; the
  hook's payload reading and project-root check from `.claude/hooks/lib.sh`, as
  `format-md.sh` does.
- **One library, two entries**: `scripts/lib/word-frequency/` holds the list,
  the idioms, the phrases, the terms and the matcher; the hook's script and
  `words:sweep` differ only in what text they hand it.
- **Not shared**: the frontmatter read of `author`. `documents.ts` owns the
  schema but is `server-only`; the script reads the one field with `gray-matter`
  and a one-key zod schema, as `check-masked-words.ts` does for `masked`.

## Settled

Vova's answers: wordfreq, inflection folding, articles only, a strict N to
start, the repo's terminology skipped (§ 5), idioms shown like rare words rather
than banned (§ 4). Ruled out since: an allow list and a stop list, and with them
any vet gate — a word is judged in its sentence, which a list cannot do;
SUBTLEX-US and Google's 10k list as sources; songs, for now.
