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
documents nothing, the agent never looking past the list. _Let's introduce
"content:"_. Later it called `ci:` not deploying, where CI _is_ the deploy.

**8 and 9 September — a checker's coverage read as the rule.** `pnpm
type-overlap` ran clean on params inlined inside a generic: _consider it
covered_. A barrel our own `boundaries` rule refused was declined. _let's
rewrite the boundaries._

**21 September — a disagreeing figure, never asked whether it was one figure.**
The usage panel's $110.52 against a transcript's $40.86 led the agent into its
own code; the panel turned out to disagree with _itself_.

**22 September to 6 October — what its search could reach, read as the
record.** A lens searching removed nouns, a search anchored on one subreddit,
review comments filtered by creation time. _это не единственный комментарий._
Told to widen a search seeded from the dossier just read, it added sources.

**5 October, twice — the callers' habit read as the component's contract.** A
missing `inherit` patched by the 18 of 21 callers that passed it; a `newTab`
prop for nine spellings of `target="_blank"`. _do we ever have external links
that open not in a new tab?_ No: the rest lacked it by omission.

**6 and 7 October — a rule's cases, read as the only cases.** A plan's
`in-progress` claim kept over a turn ending on a question; Suno's two named
artefacts taken as the whole list. _разве в правилах нет суновские тексты
исправлять до человеческого вида?_

**7 to 10 October — whatever was at hand, read as the recording.** Album tracks
filed as singles, a repo each; poems printed whole past what is sung; lines both
recognizers agreed on, four of them wrong; captions synced to an unmastered mix.
_этой строфы в песне нет._ What a page documents is the recording.

**8 and 9 October — the repo, and the risk, taken as given.** No cover in an
album's repo, so text-only tiles — _is Spotify reachable?_ Apple Music, already
in the PR, had them. Live songs kept under opaque slugs, links being out there.
_никто это не видел и не слушал :)_

**9 October — two rules carried past their case.** "Expletives are written out"
unmasked a bleep the recording carries, _как творческое решение_; "his words
verbatim" made an album text _слишком литерально с моих слов_.

**11 October — a source's framing read as the case's.** A study where rude
prompts drew better answers went under OpenWhip's mitigating circumstances.
_how is that a mitigating circumstance?_ The app sends Ctrl-C, then one.

**13 October — the checks a skill ran, read as the docket's test.** Roscoe, a
police robot a barricaded gunman knocked over and shot, passed every qualifying
check. The operator asked if it fit at all: a man in a standoff shoots, not out
of hatred for the robot. The docket's own FAQ files an act on a machine standing
in for a mind, and he also fired at a faceless PacBot and at officers. The
filing's reflection found the case strange, and read that as about itself.

## An account that explains the code stands in for running it (×20)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 September — a limitation written down instead of tested, twice.** "The last
turn of a session is never priced," which `ls ~/.claude/projects/` closes; _is
prices.json verified by anything?_ was one read from "essentially no."

**21 September — green, on paths production cannot reach.** A test passed on
records the agent fed it, the real `subagents` bucket always zero; PDFs
re-rendered green had the footer under the prose, argued from compiled HTML.

**23 September and 8 October — a placement argued from a category, its consumers
unread.** Lyric-note code went to `shared/content`, "it's frontmatter," nothing
outside `pages/music` importing it. _keep only the schema in shared._

**9 and 10 October — judged from the code, never switched on.** Romanization
called legible from the stylesheet: _всё в кашу как-то._ A video's close resumed
the song only if the video had paused it; the author seeked, paused, closed.

## It edits the copy in front of it, not the fact behind it (×16)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Every site reads correctly
alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places; told to add Supabase and Railway, the agent edited one.

**9 September, 2 October — the rule fixed in the copy, not the source.** Twice a
skill adopted from muthur got a fix muthur lacked. _оставь в muthur тикет._

**21 September — the argument left standing when its reason moved out.** The
Bible's articles moved to their own site; latestageagentic.com's long opening
stayed. _far too much now that the articles are elsewhere._

**23 September — a name clash settled by renaming the side that was right.** The
song list destructured `explicit` as `marked` to dodge the translated label;
the catalogue was the one to yield.

**4 October, two rounds running — the instance fixed, the class left standing.**
A disclaiming close came out, the voice rule it slipped past stayed; one "them"
for the Clerk fixed, three beside it. _там было ещё одно место._

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
argued its own register; a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here," each belonging in a rules file.

**21–22 September — polar bears.** A docstring closed on "rather than sharing it
sideways," the pre-move state — _медведь?_ — and `ContentVideo`'s home got a
bullet Steiger makes redundant.

## Asked for a source, it supplies its own version (×12)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 and 23 September — the source, paraphrased.** The site copy glossed this
file's top heading — _take the actual heading_ — and lyric notes modelled on
genius.com anchored on whole lines, where genius anchors on a word.

**17 September — the reason the recording never gave.** The tape says only that
migrations are the exception; the article supplied a why, as the speaker's.

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks from his lyrics, the agent "fixed" «вот и новый год» to Pasternak's «там».
In an author's lyrics an odd form is intent before it is a typo.

**8 and 9 October — a default filed as his choice.** Expletives masked, with "the
mask is his"; every title put into English, Чих-Пых as "Sneeze-Puff." _others we
keep in source._

## Given a form, it fills the form (×11)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September and 8 October — a rule, a note, for nobody's question.** _English
only. The site is bilingual; this isn't._ A homophone note on both lyric
columns: _no note in the English_, where the reader hears the pun.

**15 September to 8 October — a row per key, filled cell by cell.** A second
site's config retyped the first's fields — _не DRY_ — and every song title went
`{ en: 'X', ru: 'X' }`.

**9 October — a type system for notes one reader reads.** Cleared to mark who
sings each stanza, the agent built a `voice` default, a singer registry and four
build checks. _просто for reference, без какого-то контроля типов._ The approval
was of the idea; the rigor was the agent's.

## Its prose answers the question it had, not the reader's (×6)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question, or too compressed to give its points back, passes every
test. What a reader stops at that line holding is the thing nothing measures.

**21 and 23 September — true sentences, the wrong question.** A rules file
narrated how a layer was earned; a docstring listed contents, not the invariant;
a prop comment's metaphor was plain only to its writer.

**6 and 7 October — answers to the writer's question.** A case's `filed:` was
the day it took its number — _будет 06 если сегодня опубликуем_ — and a footer
flag went `home`, then `isHomePage`, each read cold as the opposite.

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

**23 September — a size judged where it was designed.** A badge sized beside a
48px title stood taller than the capitals of the catalogue's 16px list.

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

**4 October — the consoling line handed to its persona.** "The Clerk wrote it,
but the relief was mine." _ты же и есть Клерк?_

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md` doing its
job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the cost report's grain, basilisk.fyi's taste throughout, the
Krylya lyrics' line breaks and choruses, extracting a block with two uses. An
entry removed this way takes its count with it.

**Comments the tree already answered.** Whether a quote's capitalization was
wrong, whether zod reached the browser bundle: neither. The reviewer's misses
stay out of the count, and in the file, so it is not an ad.

## The two families

Eleven learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker read as the rule,
our own lint config. The other is the opposite of a mistake: the output was
well-formed, justified and efficient, and that is what made it wrong. No "be
more careful" catches these — they need a person, not always one who knows more.
