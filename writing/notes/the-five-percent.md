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

## What it was handed, it treats as fixed (×63)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6–22 September — our own lists, gates and config, read as specifications.**
`docs:` for a change that documents nothing, the agent never looking past the
prefix list (_let's introduce "content:"_); `pnpm type-overlap` clean on params
inlined in a generic, though it scans type aliases only; a `server-only` barrel
declined because `boundaries/dependencies` flagged it (_let's rewrite the
boundaries_).

**22 September, 4 and 6 October — what its search could reach, read as the
record.** `/tend-prose` searched for removed nouns where the change removed a
property; a basilisk dossier called Philadelphia first on a search anchored on
its subreddit; a review's comments, filtered by creation time, lost five of six,
a comment being dated when drafted. _это не единственный комментарий._

**5 October — the majority read as the rule.** A callout link lacked `inherit`,
and the agent added it, citing 18 of 21 `InternalLink`s; nine callers spelled
`target="_blank"`, so it proposed a `newTab` prop. Neither was a choice: the
component should have done it, and the three without it lacked it by omission.

**7 October — one repo, one song.** Scaffolding a song page per vovas-music
repo, the agent filed four as singles with a guessed project and date. Each was
an album track already in the catalogue, every pair within two seconds, Apple
Music listing «Вечерняя комната — Single».

**7, 9 and 21 October — a rule's letter, short of its case and past it.** Told
to strip Suno's control markers and stress marks, the agent kept “Insi-ide” as
punctuation; told expletives are written out, it unmasked a bleep that is on the
recording: _здесь забикано и в песне, как творческое решение._ Told the
spectrogram's beat lines confused, it dropped the zooms' time grid whole; the
fault was density, and bar lines were wanted back.

**8–10 October — the source read as the recording.** Song pages printed poems
whole where the recording sings four lines; three song videos were synced and
captioned with nobody hearing they carried the unmastered mix. What a page
documents is the recording.

**9 October — two recognizers agreeing, read as the recording.** The agent
flagged nothing both transcripts matched on, and the author rewrote four such
lines — «Четвёртое объяснение» to «К чёрту объяснения», «в лёгком ромкоме» to
«в грёбаном ромкоме». Agreement between two machines was only agreement.

**14 October — its script's number, held over its script's evidence.** Where
librosa disagreed with the spectrogram sidecars' keys and tempos, the agent put
it to the author as a tie. librosa was right on all three keys, and C minor sat
in the script's own chord list: it had counted G, C's third harmonic, as a note.

**21 October — the beat tracker's grid, read as the beat.** Barring the
spectrogram zooms, the agent let chord changes pick which of four beats opens a
bar and gave the snare no vote, a backbeat leaving the phase a coin toss. The
author heard sorry's third section open on the first of the paired kicks, half a
beat early, and named the test: the snare lands on the half bar. The tracker had
locked onto the off-beat, the syncopated kick being loudest, and the bass
changes early. The agent had tuned which beat, never whether the beats were.

## An account that explains the code stands in for running it (×21)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 September — a limitation written down instead of tested, twice.** The costs
rule called the unpriced last turn a gap, which `ls ~/.claude/projects/` closes;
_is prices.json verified by anything?_ was one read from "essentially no."

**21 September — a green test for a path production cannot reach.** The ledger's
`subagents` bucket was always zero; the test passed on records the agent fed it.

**21 September — the render argued from markup, then never opened.** The end
seal rode the last sentence's punctuation, argued from compiled HTML with
`/preview` unrun. The PDFs re-rendered green had the footer under the prose.

**23 September and 8 October — a placement argued from a category, its
consumers unread.** Lyric-note code went to `shared/content` though nothing
outside `pages/music` imported it, and stayed on "it's frontmatter, so it's
content" — _why again_. Moved, it took the album registries along because the
schema checks a few names. _keep only the schema in shared._

**10 October — a resume rule reasoned, never played through.** Closing a song's
video resumed the song only if the video had paused it. The author played,
opened the video, seeked, paused, closed: the song resumed.

**20 October — a detector passed on fixtures lacking what breaks it.** The
spectrogram's drum row unmixed each frame's per-band rise onto hand-set
signatures "measured off the catalogue's mixes," tested on synthetic strikes
over noise and checked for a kick on every kick in Птицы. Nobody looked where a
song has no drums. The author timed Птицы's first hi-hat at 1:21; the row fires
as often before it as after, a picked guitar rising in the bands like a hit, and
lights cymbals in two songs that have none. No threshold fixes that: a demucs
drums stem matched all three timings.

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
hitchBOT's disclaiming close came out, and the voice rule it slipped past stayed.
Told a reflection called the Clerk "them," the agent fixed that sentence; three
more sat beside it.

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
argued its own register; a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here," each belonging in a rules file.

**21–22 September — denials, and a defence nothing needed.** A docstring closed
on "rather than sharing it sideways," the pre-move state, and `ContentVideo`'s
home got a `content.md` bullet that Steiger already enforces. _медведь?_

## Asked for a source, it supplies its own version (×12)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 and 17 September — the finding paraphrased, the reason invented.** The site
copy glossed this file's most frequent heading (_take the actual heading_); an
article gave a speaker a why his tape never gave.

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks from his lyrics, the agent "fixed" «вдушевлённые» to «одушевлённые». In
an author's lyrics an odd form is intent before it is a typo.

**8 and 9 October — a default, filed as his.** The agent masked his lyrics'
expletives and wrote a rule that "the mask is his"; it put every non-English
title into English, Чих-Пых as "Sneeze-Puff". _others we keep in source
(transliterated)._

## Given a form, it fills the form (×11)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._

**15 September to 8 October — a row per key, filled cell by cell.** A second
site's config retyped the first's fields — _не DRY_ — and the music registry
spelled every title `{ en: 'X', ru: 'X' }`, later with `transliteration` and
`titleTranslation` keys per locale; a homophone note went on both lyric columns.

**9 October — a type system for notes one reader reads.** Cleared to mark who
sings each Krylya stanza, the agent built a `voice` default, a singer registry
and four build checks. _пометки про voice по ходу текста останутся просто for
reference._ The approval was of the idea; the rigor was the agent's.

## Its prose answers the question it had, not the reader's (×6)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question, or too compressed to give its points back, passes every
test. What a reader stops at that line holding is the thing nothing measures.

**21 and 23 September — true sentences, the wrong question.** A rules file
narrated how a layer was earned; a docstring listed contents, not the invariant;
a prop comment's metaphor was plain only to its writer.

**7 October, two rounds running — a prop named for what its writer meant.**
`SiteFooter`'s flag for a root page went `home`, then `isHomePage`; met cold,
each read as the opposite. Now `onHomePage`.

## It checks the render against its intent, not against the page (×6)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, answerable only from the page.

**17 September — the float fixed, the page passed.** _выноска стала лучше,
изображение -- хуже_ — the drawing outran its section.

**23 September — a size judged where it was designed, shipped where it wasn't.**
The explicit badge, sized beside a 48px title, stood taller than the capitals in
the catalogue's 16px list.

**21 October — marks tuned for what they meant, never for being read.** The
spectrogram drew each drum hit as a 1 px tick on a 1300 px image, and a white
line at every beat, raised to alpha 0.45 to be "visible"; sessions argued only
over which hits were real. _С такими тоненькими полосками что вообще агент
сможет понять?_ The beat lines, chopping every note to restate the title's
tempo: _меня они больше сбивают чем помогают_. The picture's reader is an agent that cannot
hear, and nobody had read it as one. Hits are now dots, sized by strength.

## What it defends in writing, it stops asking about (×5)

A choice made, written up and pinned by a test has three artifacts in front of
it by the time anyone looks, each honest that it was deliberate and silent on
its being right. A caveat conceding the defect files it as a cost.

**21 September — a parameter, its docstring, and the test pinning it.** `oneOf`
took a `subject` to name what failed; a docstring justified it and a test
asserted it. _drop it._

**21 September — a tag invented for a word the platform had.** A docstring
granted that `content-video-embed` "makes the tree invalid HTML"; `video` would
do. The caveat had been the finding.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it. The
explanation is correct, durable and unenforced; a structure that makes the
wrong move fail to build asks nothing of anyone's attention.

**17 September — +377 kB, written into a docstring.** Asked why the site id is
not parsed with zod, the agent documented zod's client cost. _нам нужно сделать
.server-only. модуль или бочку._

**21 September — the confusing field, documented rather than made impossible.**
`SiteImage`'s `path` versus `vector` got a docstring; the fix was the shape.

## It steps out of the line it would have to own (×2)

Where a sentence takes a position the agent is uneasy holding, it writes the
sentence and a way out of it in the same breath, and the exit passes its own
review — the writer being the one reader it is built to reassure.

**4 October — a disclaimer read as neutral, by the side that wrote it.**
hitchBOT's dossier closed on a record that "does not get to choose who reads it
as a precedent." To the operator the disclaiming _was_ the steer.

**4 October — the consoling line handed to its persona.** The agent wrote that
the Clerk wrote the comforting line "but the relief was mine." _ты же и есть
Клерк?_

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md` doing its
job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the theme toggle's home, the cost report's grain, basilisk.fyi's
taste throughout, the Krylya lyrics' line breaks and verb moods, extracting a
block with two uses. An entry removed this way takes its count with it.

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
