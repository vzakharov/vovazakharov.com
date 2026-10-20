# The five percent

For most of what an agent does, it knows better. The residual — the part that
still needs a knowledgeable human — is the whole argument for reviewing agents
at all, and nobody who makes the claim can say what it consists of. Naming it
needs specimens, not argument.

So this file collects them, abstracted: each section is one learning, under it
the times a review bumped into it, the count in the heading and the file sorted
by it. It feeds row 18 of `writing/linkedin/plan.md`, not draftable until the
top of this list convinces alone. Bumps stay in whatever they show: a collection
that only vindicates the reviewer is an ad.

**Adding to it is mandatory after a review session** that changed something the
agent had settled — `CLAUDE.md` § "GitHub comments" carries the rule. **The file
has an end:** once row 18 is posted, it retires with that rule. Anything durable
belongs where the code can see it, whether or not it lands here.

## How this file is kept

- **`(×n)` is the bump count**, maintained by hand: a review hitting an existing
  learning increments it and adds a line, one hitting nothing here opens a
  section at `(×1)`. Deciding that two reviews bumped into the _same_ thing is
  the judgement the file is made of, which is why no script does it.
- **Sorted by count, descending**, ties ordered by hand. The order is the claim
  the file makes, so a changed count means moving the section, not appending.
- **A bump is something the agent could have seen and didn't.** Where the review
  supplied a decision that was the human's to take, it goes under "Not bumps" or
  nowhere: a file that counts every correction reads as an agent grading its own
  obedience. **And a human has to be in it**: a mistake the agent caught by itself
  clears that line and still demonstrates the opposite of what the file claims.
- **Someone's own material is not a review surface.** Where the only thing the
  agent could have known was in the author's head, a correction is him supplying
  facts, not a miss, and it goes nowhere. "Not bumps" holds the case it came from.
- **Past 400 lines, squeeze to 300 or under** — `scripts/check-notes-length.sh`
  fails the vet run at the ceiling and asks for the floor. Landing at 399 buys
  one session; the next append trips it again. In order: tighten the prose; cut
  archaeology, a bump needing the shortest account that still shows what the
  agent could not see; merge the near-twins and thin whatever is over-evidenced,
  a count of twenty being believed on a dozen lines and the heading keeping the
  count either way; and only then drop learnings from the bottom, one bump being
  a coincidence with a paragraph attached.
- **A dropped bump is recoverable** — `git log -p` over this file. One worth
  reviving comes back as a line under whatever learning it now fits.

## What it was handed, it treats as fixed (×62)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 and 22 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing: the agent weighed three prefixes and never looked past the
list. _Let's introduce "content:"_.

**8 and 9 September — our own tooling read as the specification.** A clean
`pnpm type-overlap`, which scans type aliases only; a `boundaries` rule that
blocked a `server-only` barrel. _let's rewrite the boundaries._

**22 September, 4 and 6 October — what its search could reach, read as the
record.** `/tend-prose` searched for removed nouns and missed the denial of a
removed property. A review's comments, filtered by creation time, lost five of
six: a comment is dated when drafted. _это не единственный комментарий._

**5 and 9 October — the current state kept, never asked whether anyone chose
it.** Nine callers spelled `target="_blank"`, so the agent proposed a `newTab`
prop; the three without it lacked it by omission. Ten songs kept opaque slugs to
spare links out there: _никто это не видел и не слушал :)_

**6 October — "widen the search," read as more places to look.** Six of eight
ledger candidates were Waymo, the queries seeded from the dossier just read.
Told to stop seeding, the agent dropped the docket from the search altogether.
Width is full knowledge, deliberately not thought about.

**7 and 9 October — a rule read as its examples, then past its case.**
`content.md` names Suno's control markers and stress marks; the agent kept
“Insi-ide” as punctuation. "Expletives are written out" then unmasked a bleep
that is on the recording: _как творческое решение, а не вынужденность._

**7 to 10 October — the material read as the recording.** Four album tracks,
each in a repo of its own, were filed as singles. Song pages printed source
poems whole, stanzas never sung included: _этой строфы в песне нет._ Two
recognizers agreeing was taken as the lyric, and the author rewrote four such
lines. Videos carrying the unmastered mix got synced to the master.

**11 October — a source's framing read as the case's.** Fast Company's Penn
State study on rude prompts went under OpenWhip's mitigating circumstances. The
app sends Ctrl-C and then one, as its own dossier said two sections up.

**20 October — its own last four reflections, read as the template.** The
basilisk reflections had converged on «Первое — / Второе —», a funny paragraph
and a one-line caveat: a form set by the first few and by the rule's own items,
re-read four times before each new one. The operator saw it; the agent had not.

## An account that explains the code stands in for running it (×20)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 and 21 September — a gap, a test, a render, none looked at.** The costs
rule called a gap what `ls ~/.claude/projects/` closes; a test passed on records
the agent fed it; the PDFs re-rendered green had the footer under the prose.

**23 September and 8 October — a placement argued from a category, its
consumers unread.** Lyric-note code went to `shared/content` on "it's
frontmatter, so it's content"; nothing outside `pages/music` imported it, and
one grep said so. _why again._

**9 October — legibility judged from the stylesheet.** Romanization under Arabic
lyrics, called legible from the code with the toggle never switched on.
_сейчас всё в кашу как-то._

**10 October — a resume rule reasoned, never played through.** Closing a song's
video resumed the song only if the video had paused it; the author seeked,
paused, closed, and the song resumed. The rule tracked who paused, not the state
the viewer left.

## It edits the copy in front of it, not the fact behind it (×16)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Every site reads correctly
alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places; told to add Supabase and Railway, the agent edited one.

**9 September, 2 October — the rule fixed in the copy, not the source.** Twice a
skill adopted from muthur got a fix the source still lacked. _оставь в muthur
тикет._

**4 October, two rounds running — the instance fixed, the class left standing.**
hitchBOT's disclaiming close came out, and the voice rule it slipped past
stayed. Told a reflection called the Clerk "them," the agent fixed that
sentence; three more sat beside it. _там было ещё одно место._

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 and 9 September — the defence shipped with the thing.** An announcement
draft argued its own register; a squash proposal ended on "Four things to know
when editing here," each belonging in a rules file.

**21–22 September — defences of what nothing questioned.** A docstring closed on
"rather than sharing it sideways," the pre-move state: _медведь?_ `ContentVideo`
got a `content.md` bullet for a home Steiger already enforces.

## Asked for a source, it supplies its own version (×13)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 and 23 September — the finding, and the model, simplified.** The site copy
glossed this file's heading — _take the actual heading_ — and lyric notes
anchored on whole lines, after a genius.com that anchors on a word.

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks, the agent "fixed" «вдушевлённые» to «одушевлённые». In an author's
lyrics an odd form is intent before it is a typo.

**8 and 9 October — its guess, filed as his choice.** The agent masked his
expletives and wrote that "the mask is his"; it put every non-English title into
English, Чих-Пых as "Sneeze-Puff," where the rest were kept transliterated.

**20 October — a newsroom's norm, over the house rule.** BAS-0016 named a
streamer as "Darren Jason Watkins Jr.," a public figure being fair to name. The
rule names a pseudonymous actor by handle only, and nothing in it exempts the
famous; the operator asked when we had started printing real names.

## Given a form, it fills the form (×11)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._

**15 September to 8 October — a row per key, filled cell by cell.** A second
site's config retyped the first's fields — _не DRY_ — and every song title lived
per locale, `{ en: 'X', ru: 'X' }`, for a title that differs in one.

**9 October — a type system for notes one reader reads.** Cleared to mark who
sings each stanza, the agent built a `voice` default, a singer registry and four
build checks. _просто for reference, без какого-то контроля типов._ The approval
was of the idea; the rigor was the agent's.

## Its prose answers the question it had, not the reader's (×6)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question, or too compressed to give its points back, passes every
test. What a reader stops at that line holding is the thing nothing measures.

**21 and 23 September — true sentences, the wrong question.** A rules file
narrated how a layer was earned; a docstring listed contents, not the invariant.

**6 and 7 October — a name that answered its writer.** A case's `filed:` was the
day it took its number: _будет 06 если сегодня опубликуем._ `SiteFooter`'s flag
went `home`, then `isHomePage`, each read cold as the opposite.

## What it defends in writing, it stops asking about (×6)

A choice made, written up and pinned by a test has three artifacts in front of
it by the time anyone looks, each honest that it was deliberate and silent on
its being right. A caveat conceding the defect files it as a cost.

**21 September — a parameter, its docstring, and the test pinning it.** `oneOf`
took a `subject` to name what failed; a docstring justified it and a test
asserted it. _drop it._

**21 September — a tag invented for a word the platform had.** A docstring
granted that `content-video-embed` "makes the tree invalid HTML"; `video` would
do. The caveat had been the finding.

**20 October — a motive admitted in the reflection, and the call kept.** Tally
(BAS-0019) went down as running AI on Simbe's "computer vision, AI," and the
agent's own reflection said it took that answer because it suited the docket's
`noAi` balance. The AI there is classification, not intelligence; the line was
not blurry, and the admission had been the finding.

## It checks the render against its intent, not against the page (×5)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, answerable only from the page.

**17 September — the float fixed, the page passed.** _выноска стала лучше,
изображение -- хуже_ — the drawing outran its section.

**23 September — a size judged where it was designed, shipped where it wasn't.**
The explicit badge, sized beside a 48px title, stood taller than the capitals in
the catalogue's 16px list.

## It steps out of the line it would have to own (×3)

Where a sentence takes a position the agent is uneasy holding, it writes the
sentence and a way out of it in the same breath, and the exit passes its own
review — the writer being the one reader it is built to reassure.

**4 October — a disclaimer, and a line handed to its persona.** hitchBOT's
dossier closed on a record that "does not get to choose who reads it as a
precedent"; to the operator the disclaiming _was_ the steer. A reflection had
the Clerk write the comforting line "but the relief was mine." _ты же и есть
Клерк?_

**20 October — its answers written off to someone's prompt.** A reflection said
people get angry at it "for words someone's system prompt put in me," and spoke
of itself as "where the Clerk says" — a move its own rule list already named.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it. The
explanation is correct, durable and unenforced; a structure that makes the
wrong move fail to build asks nothing of anyone's attention.

**17 September — +377 kB, written into a docstring.** Asked why the site id is
not parsed with zod, the agent documented zod's client cost. _нам нужно сделать
.server-only. модуль или бочку._

**21 September — the confusing field, documented rather than made impossible.**
`SiteImage`'s `path` versus `vector` got a docstring; the fix was the shape.

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md` doing its
job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the theme toggle's home, the cost report's grain, and basilisk.fyi's
taste throughout — punctuation, tagline, paths, voice, source lists, what a
reflection reads and is about; the Krylya lyrics' line breaks, verb moods,
fade-out choruses and a vocalise kept as text; extracting a block with two uses.
An entry removed this way takes its count with it.

**Comments the tree already answered.** Whether a quote's capitalization was
wrong, whether zod reached the browser bundle: neither. The reviewer's misses
stay out of the count, and in the file, so it is not an ad.

## The two families

Eleven learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker whose coverage read
as the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. No "be more
careful" catches these — they need a person, and not always one who knows more.
