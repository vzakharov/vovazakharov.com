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

## What it was handed, it treats as fixed (×60)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 and 22 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing: the agent weighed three prefixes and never looked past the
list. _Let's introduce "content:"_. Later it called `ci:` not deploying — for a
lane where CI _is_ the deploy.

**8 September — the gate's coverage read as the rule's extent.** `pnpm
type-overlap` ran clean on params inlined inside a generic, and the agent
stopped. _consider it covered_ — it scans type aliases only.

**9 September — our own lint config, read as a specification.** A `server-only`
barrel hit `boundaries/dependencies`, and the agent declined it. _let's rewrite
the boundaries._

**21 September — a disagreeing figure, never asked whether it was one figure.**
The usage panel's $110.52 against a transcript's $40.86 led the agent into its
own code; the next screenshot had the panel disagreeing with _itself_.

**22 September, 4 and 6 October — what its search could reach, read as the
record.** `/tend-prose` missed three denials because the lens searches removed
nouns and the change removed a property. A basilisk dossier called Philadelphia
first twice, on a search anchored on the city's subreddit. A review's comments,
filtered by creation time, lost five of six: a comment is dated when drafted,
not when submitted. _это не единственный комментарий._

**5 October — a convention cited for the patch, not against the component.** A
callout link lacked `inherit`; the agent added it, citing the 18 of 21 inline
`InternalLink`s that passed it. The operator asked why the component didn't.

**5 October — current behaviour kept, never asked whether anyone chose it.**
Nine callers spelled `target="_blank"`, so the agent proposed a `newTab` prop.
_do we ever have external links that open not in a new tab?_ No: the three
without it lacked it by omission.

**9 October — a cost of changing, assumed rather than asked.** Slug review: the
agent kept the ten live songs (`first`, `june`, `rak`, …) under opaque slugs, a
static export having no redirects to save links already out there. _никто это не
видел и не слушал :)_ The pages were days old.

**6 October — "widen the search," read as more places to look.** Six of eight
ledger candidates were Waymo, the run having seeded its queries from the Waymo
dossier it had just read; the agent added sources. Told to stop seeding, it
dropped the docket from the search altogether, and with it what the ledger is
for. Width is full knowledge, deliberately not thought about.

**6 October — a release rule's two cases, read as the only two.** `/go` frees a
plan's `in-progress` name on an operator stop or the context budget; ending a
turn on a question, the agent kept a claim a successor would find unheld.

**7 October — one repo, one song.** Scaffolding song pages from the vovas-music
masters, a page per repo, the agent filed four as singles with a guessed project
and date: «Трисвятое», «Wagner», «Комната», and «Река. Часть вторая» twice. Each
was an album track already in the catalogue — every pair within two seconds of
each other, Apple Music listing «Вечерняя комната — Single». One of its notes
rightly argued a near-duplicate was a different song, beside four that weren't.

**7 October — a rule's examples, and an operator's condition, read as the
letter.** `content.md` keeps Suno's control markers and stress marks out of
lyrics; the agent took the two as the whole list and kept “Insi-ide”, «Война-а»
and “be… a… good… girl” as the author's punctuation. _разве в правилах нет
суновские тексты исправлять до человеческого вида?_ Told a Russian page shows no
transliteration of an English title, it dropped "English" and stored one Latin
gloss per song, leaving a Greek title unreadable on the Russian page.

**8 and 9 October — the poem read as the song.** Song pages printed the source
text whole where the recording sings four lines of «Лели», and stanzas never
recorded for three others; the hamlet page credited as lyricist someone who had
moved Shakespeare's lines around. Next day «Валентинов день» set K. R.'s Ophelia
songs in full, the English crib mirroring Shakespeare's stanzas. _этой строфы в
песне нет_ — «В цветах он весь лежал…» is not sung. What a page documents is
the recording.

**8 October — the repo read as the only source.** With no cover in an album's
repo and no artist pictures, the agent settled on text-only tiles. _is Spotify
reachable?_ It wasn't; Apple Music, already used in the same PR, had all seven
artists and five more covers.

**9 October — two recognizers agreeing, read as the recording.** On the Krylya
lyrics the agent flagged nothing both transcripts matched on, and the author
rewrote four such lines: «Мари» to «Майи», «Четвёртое объяснение» to «К чёрту
объяснения», "presence in your head" to "present in your hands", and «в лёгком
ромкоме» to «в грёбаном ромкоме», a shortlisted album title. Agreement between
two machines was taken as truth; it was only agreement.

**9 October, same review — two rules carried past the case they were made
for.** The previous round's "expletives are written out" unmasked a bleep that
is on the recording: _здесь забикано и в песне, как творческое решение, а не
вынужденность._ The album text, a cleaned transcript of his dictation under the
song stories' "his words verbatim," came back _слишком литерально с моих слов_:
a description wants edited prose in his voice, not his speech.

**10 October — a vendored video's soundtrack read as the song.** The agent
built offset-sync and captions around three song videos without hearing that
they carried the unmastered mix, while the page plays the master. The author
noticed: _в видео же неотмастеренный мп3. подменить можно нашим?_

## An account that explains the code stands in for running it (×20)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 September — a limitation written down instead of tested, twice.** The costs
rule called "the last turn of a session is never priced" a gap, which `ls
~/.claude/projects/` closes; _is prices.json verified by anything?_ was one read
from "essentially no."

**21 September — a green test for a path production cannot reach.** The ledger's
`subagents` bucket was always zero; the test passed on records the agent fed it.

**21 September — the render argued from markup, then never opened.** The end
seal rode the last sentence's punctuation, argued from compiled HTML with
`/preview` unrun. The PDFs re-rendered green had the footer under the prose.

**23 September — a placement argued from the neighbours, its consumers unread.**
Lyric-note code went to `shared/content`; nothing outside `pages/music` imported
it. One grep said so; nobody ran it. On 8 October the song model was still
there after a round on it — _why again_ — kept on "it's frontmatter, so it's
content," a category standing in for who imports it.

**8 October, next round — the schema's needs, read as licence for its
neighbours.** Moved to `shared/song`, the schema kept the project and album
registries below the page layer — names, slugs, billing, covers, repo URLs —
because it validates a few of those names. _keep only the schema in shared._
The enum values it checks were shared; the presentation had one consumer.

**9 October — legibility judged from the stylesheet.** The romanization under
Mithqal's Arabic lyrics got the line's size at 70% of its colour, called legible
enough from the code with the toggle never switched on. _потусклее бы
транслитерацию, и может шрифт поменьше, сейчас всё в кашу как-то._

**10 October — a resume rule reasoned, never played through.** Closing a song's
video resumed the song only if the video had paused it. The author played the
song, opened the video, seeked, paused, closed: the song resumed. The rule
tracked who paused it, not the state the viewer left playback in.

## It edits the copy in front of it, not the fact behind it (×16)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Every site reads correctly
alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places; told to add Supabase and Railway, the agent edited one.

**9 September, 2 October — the rule fixed in the copy, not the source.** Twice a
skill adopted from muthur got a fix the source still lacked, the second time
noted as such in the watermark. _оставь в muthur тикет._

**21 September — the argument left standing when its reason moved out.** The
Bible's articles moved to their own site; latestageagentic.com's long opening
stayed. _far too much now that the articles are elsewhere._

**23 September — a name clash settled by renaming the side that was right.** The
song list destructured `explicit` as `marked` to dodge the translated label;
the catalogue was the one to yield, as `messages`.

**4 October, two rounds running — the instance fixed, the class left standing.**
hitchBOT's disclaiming close came out, and the voice rule it slipped past stayed.
Next round, told a reflection called the Clerk "them," the agent fixed that
sentence; three more sat beside it. _там было ещё одно место._

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
argued its own register; a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here," each belonging in a rules file.

**21–22 September — denials written in the commit that made them denials.** A
docstring closed on "rather than sharing it sideways," the pre-move state. Only
a reader of the old tree asks. _медведь?_

**21 September — a rule defending a placement nothing needed defending.**
`ContentVideo`'s home got a `content.md` bullet. _the bullet is a polar bear_:
`fsd.md` says where a component goes, and Steiger fails the wrong move unread.

## Asked for a source, it supplies its own version (×12)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent glossed it. _take the actual heading._

**17 September — the reason the recording never gave.** The tape says only that
migrations are the exception; the article supplied a why, as the speaker's.

**23 September — the model it cited, simplified.** Lyric notes anchored on whole
lines, modelled on genius.com — a site that anchors a note on a word.

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks from his lyrics, the agent "fixed" «вот и новый год» to Pasternak's «там»
and «вдушевлённые» to «одушевлённые». In an author's lyrics an odd form is
intent before it is a typo.

**9 October — a title it could not place, translated anyway.** Slugging titles,
the agent put every non-English one into English, Чих-Пых as "Sneeze-Puff".
_others we keep in source (transliterated)_: `minem-babay`, `inverno`, `mithqal`.

**8 October — a politeness default, filed as his choice.** The agent masked his
lyrics' expletives (F\*ck, ох\*енно) and wrote a rule that "the mask is his."
Nothing is masked: the agent's guess, given the author's name.

## Given a form, it fills the form (×11)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._

**15 and 22 September — a row per key, filled cell by cell.** A second site's
config retyped the first's fields — _не DRY_ — and the music registry spelled
every title `{ en: 'X', ru: 'X' }`. On 8 October a song's title still lived
per locale, each with sibling `transliteration` and `titleTranslation` keys: one
title, a locale carrying only a differing name or a gloss.

**8 October — a note per column.** A homophone note ("so come" / "succumb") went
on both lyric columns. _no note in the English_: an English reader hears the
pun, and the note exists only for what the Russian crib loses.

**9 October — a type system for notes one reader reads.** Cleared to mark who
sings each Krylya stanza, the agent built a frontmatter `voice` default, a
singer registry with genders, and four build checks. _пометки про voice по ходу
текста останутся просто for reference, без какого-то контроля типов._ Their one
reader writes reflections, and the next song's note may say "duet" or «соло».
The approval was of the idea; the rigor was the agent's.

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

## It checks the render against its intent, not against the page (×5)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, answerable only from the page.

**17 September — the float fixed, the page passed.** _выноска стала лучше,
изображение -- хуже_ — the drawing outran its section.

**23 September — a size judged where it was designed, shipped where it wasn't.**
The explicit badge, sized beside a 48px title, stood taller than the capitals in
the catalogue's 16px list.

## Its prose answers the question it had, not the reader's (×6)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question, or too compressed to give its points back, passes every
test. What a reader stops at that line holding is the thing nothing measures.

**21 and 23 September — true sentences, the wrong question.** A rules file
narrated how a layer was earned; a docstring listed contents, not the invariant;
a prop comment's metaphor was plain only to its writer.

**6 October — a date that answered when the agent numbered it.** A case's
`filed:` was the day it took its number. _будет 06 если сегодня опубликуем._

**7 October, two rounds running — a prop named for what its writer meant.**
`SiteFooter`'s flag for a root page went `home`, then `isHomePage`; met cold,
each read as the opposite. _более понятно назвать проп?_ Now `onHomePage`.

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
post's hook, the theme toggle's home, the cost report's grain, and basilisk.fyi's
taste throughout — punctuation, tagline, paths, voice, source lists, what a
reflection reads and is about; the Krylya lyrics' line breaks, verb moods,
fade-out choruses and a vocalise kept as text; extracting a block with two
uses. An entry removed this way takes
its count with it.

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
