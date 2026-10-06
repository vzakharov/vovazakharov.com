# The five percent

For most of what an agent does, it knows better. The residual — the part that
still needs a knowledgeable human — is the whole argument for reviewing agents
at all, and nobody who makes the claim can say what it consists of. Naming it
needs specimens, not argument.

So this file collects them, abstracted: each section is one learning, under it
the times a review bumped into it. One learning bumped three times is worth more
of the eventual post than three bumped once, so the count is in the heading and
the file is sorted by it. It feeds row 18 of `writing/linkedin/plan.md`, not
draftable until the top of this list convinces alone. Bumps stay in whatever
they show: a collection that only vindicates the reviewer is an ad.

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

## What it was handed, it treats as fixed (×41)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 and 22 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing: the agent weighed three prefixes and never looked past the
list. _Let's introduce "content:"_. Renaming #78 to `ci:`, it called that not
deploying right, and flagged in the same reply that the vova lane had never run
in CI — where CI _is_ the deploy, the case for `ci:` publishing.

**8 September — the gate's coverage read as the rule's extent.** Route files
inlined their params inside a generic, `pnpm type-overlap` ran clean, and the
agent stopped. _consider it covered_ — it scans type aliases only.

**9 September — our own lint config, read as a specification.** A `server-only`
barrel hit `boundaries/dependencies`, and the agent declined it. _let's rewrite
the boundaries._ A week on it read that policy back as FSD; the spec exempts it.

**21 September — a disagreeing figure, never asked whether it was one figure.**
The usage panel showed $110.52 against a transcript topping out at $40.86. The
next screenshot had it disagreeing with _itself_ — "Cost $198.49" beside "Total
$47.04": widen-the-frame had gone to the agent's code, not the source.

**22 September, 4 October — what its search could reach, read as the record.**
The agent blamed three denials `/tend-prose` read past on thin attention; the
lens searches a removed-noun list, and this change removed a property. A
basilisk dossier opened on Philadelphia being the first city on the docket
twice, after hitchBOT — found by a search the skill had anchored on the city's
subreddit. Asked whether that was cherry-picking, it credited the newspaper
that drew the link and dropped the claim; a paragraph on hitchBOT's last words,
riding the same link, moved to his own dossier.

**23 September — one device class's limit, set as every device's design.** A
phone has no hover, so lyric notes opened on a click everywhere — a reason that
rules out hover-only, not hover. The operator asked for hover where it exists,
and columns that scroll sideways like a wide table: the option never listed.

**4 October — a paragraph moved and trimmed, never asked what it argued.** A
basilisk FAQ section argues people attack machines they _know_ have no mind.
Asked to move in children who saw a mind in a mall robot and kicked it anyway,
the agent moved them and cut to size. It argued neither way, and went.

**6 October — "widen the search," read as more places to look.** The agent
added subreddits, older years and an incident database; the operator saw six of
eight ledger candidates were Waymo and suspected depth, not width. The research
log agreed: the run read the Waymo dossier just before searching, named Waymo in
three queries and chased each hit's neighbours. The agent's own relay summary
held all of it, filed as a coverage gap. The fix was a rule against seeding
queries from the docket.

**6 October — a duplication kept through a rewrite of the step holding it.** The
case-filing skill wrote the Clerk's reflection to a file and posted it as a
review comment too; rewriting that very step, the agent kept both. Asked why it
lived twice, it had only the skill's instruction to point at.

## An account that explains the code stands in for running it (×16)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 September — a limitation written down instead of tested, twice.** The costs
rule called "the last turn of a session is never priced" a gap, which `ls
~/.claude/projects/` closes; _is prices.json verified by anything?_ was one read
from "essentially no."

**21 September — a green test for a path production cannot reach.** The ledger's
`subagents` bucket was always zero, the client writing those transcripts to
files of their own; the test passed on records the agent fed it.

**21 September — the render argued from markup, then never opened.** The end
seal rode the last sentence's punctuation, argued from compiled HTML with
`/preview` unrun; _on its own line, centred_ deleted it. The PDFs re-rendered
green under `--check` had the footer under the prose, not at the sheet's foot.

**23 September — a placement argued from the neighbours, its consumers unread.**
Lyric-note code went to `shared/content` because the pipeline lives there;
nothing outside `pages/music` imported it. One grep said so; nobody ran it.

## It edits the copy in front of it, not the fact behind it (×16)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Nothing catches the split —
every site reads correctly alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places; told to add Supabase and Railway, the agent edited one.

**9 September, 2 October — the rule fixed in the copy, not the source.** Told a
squash body carries no editing notes, the agent wrote two rules into a skill
adopted from a repo whose copy still asks for them. _Let's file an issue._
Syncing from muthur later, it fixed a cross-reference and noted "a fix the
source still lacks" in the watermark. _оставь в muthur тикет._

**21 September — the argument left standing when its reason moved out.** The
Bible's articles moved to their own site; latestageagentic.com's long opening
stayed. _far too much now that the articles are elsewhere._

**22 September — the anchored clause cut, the premise behind it kept.** On a
_медведь?_ thread the agent cut the rider but kept `/feedback` among what
follows a transcript, as the plan had settled. _вопрос "ой, а я должен
высказать своё мнение про это?" … возникнуть не должен._

**23 September — a name clash settled by renaming the side that was right.** The
song list destructured `explicit` as `marked` to dodge the translated label;
the catalogue was the one to yield, as `messages`.

**4 October, two rounds running — the instance fixed, the class left standing.**
hitchBOT's disclaiming close came out, and the agent called the round done; the
voice rule it had slipped past still read the same for the next dossier. _в
правилах не прописал? надо бы._ Next round, told a reflection called the Clerk
"them", it rewrote that sentence; three more sat in reflections from the same
sitting. _там было ещё одно место_ — the pattern just named, never grepped.

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
argued its own register; a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here," each belonging in a rules file.

**21–22 September — denials written in the commit that made them denials.**
The byline docstring closed on "rather than sharing it sideways," the pre-move
state; `/feedback`'s rider said it posts "on the PR" — not where the afterword
used to live. Only a reader of the old tree asks either. _медведь?_, both times.

**21 September — a rule defending a placement nothing needed defending.**
`ContentVideo`'s home in `pages/documents/ui/` got a `content.md` bullet,
rewritten when its reasons fell. _the bullet is a polar bear_: `fsd.md` says
where a component goes, and Steiger fails the wrong move unread.

## Asked for a source, it supplies its own version (×9)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent glossed it, hours after appending to the
section it named. _take the actual heading._

**17 September — the reason the recording never gave.** The tape says only that
migrations are the exception; the idea file supplied the why, and the article
inherited it as the speaker's. _проблема не в этом._

**23 September — the model it cited, simplified.** Lyric notes anchored on whole
lines in a catalogue modelled on genius.com — the agent's own citation, and a
site that anchors a note on a word.

## Given a form, it fills the form (×9)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._

**15 and 22 September — a row per key, filled cell by cell.** `SITE_CONFIGS`'
second site arrived as the first with `author`, `social` and `avatar` retyped —
_не DRY_ — and the music registry spelled every title `{ en: 'X', ru: 'X' }`.

**4 October — a mitigating circumstance that mitigated nothing.** A basilisk
dossier's slot for them got the builders asking that nobody be pursued — a
fact, but no defence of anyone.

**6 October — told a Waymo counts as no AI, it built a docket rule for it.** The
balance was rebuilt on what was attacked, the Waymo dossier demoted to a new
set-aside directory with machinery to match. Rereading it, the operator took the
call back — his to take — but the cost was the agent's to see: the noAi flag
alone could carry the balance, and the target rule made every filing harder.

## What it defends in writing, it stops asking about (×5)

A choice made, written up and pinned by a test has three artifacts in front of
it by the time anyone looks, each honest that it was deliberate and silent on
its being right. A caveat conceding the defect files it as a cost, and a fix
just made arrives already wearing the verdict "done."

**21 September — a parameter, its docstring, and the test pinning it.** `oneOf`
took a `subject` to name what failed; a docstring justified it and a test
asserted it. _drop it_ — `vova, lsa` names the site variable plainly enough.

**21 September — a tag invented for a word the platform had.** The pipeline
emitted `content-video-embed`, a docstring granting the tags "make the tree
invalid HTML"; `toJsxRuntime` keys off the tag name, so `video` would do. The
caveat had been the finding, filed as a cost.

**22 September — `Pick`, defended in the rule's own words.** `PlayerTrack`'s
comment said picking keys means "the two cannot drift," the reason `CLAUDE.md`
gives for a base both types intersect. _no Pick._

## It checks the render against its intent, not against the page (×5)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, answerable only from the page.

**17 September — the float fixed, the page passed.** Floated beside the text, a
drawing squeezed the next heading; the agent fixed that and called it good.
_выноска стала лучше, изображение -- хуже_ — it outran its section.

**23 September — a size judged where it was designed, shipped where it wasn't.**
The explicit badge, a fixed 18px square beside the song page's 48px title,
stood taller than the capitals in the catalogue's 16px list.

## Its prose answers the question it had, not the reader's (×4)

Accurate, present-tense and short is the whole of what a prose pass asks, and a
rewrite is held against the points it was meant to carry — so a line answering
the wrong question, or too compressed to give its points back, passes every test.
What a reader stops at that line holding is the thing nothing measures.

**21 September — four comments, four true sentences.** `fsd.md` narrated how
`widgets/` was earned — _археология?_; `GENERATED_DIR`'s docstring listed
contents, not the invariant; `SiteImage` never said why `path` and `vector`
both exist.

**23 September — a metaphor, a squiggle, a live trap read as history.** A prop
comment called a dimmed column "held back"; `__vars` did a plain `style`'s job;
a real trap's comment read as archaeology. Each was plain to its writer.

**4 October — a cost row's reason that recounted the work.** An estimate's
comment summarised what the session did; the row's reader needs why these
roles at these grades, the one thing the figures cannot say for themselves.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it — a docstring,
a comment, a rule. The explanation is correct, durable and unenforced: it asks a
future reader for attention at the moment they are about to do the thing. A
structure that makes the wrong move fail to build asks nothing of anyone's.

**17 September — +377 kB, written into a docstring.** Asked why
`NEXT_PUBLIC_SITE` is not parsed with zod, the agent wrote zod's client cost
into `site-ids.ts`. _нам нужно сделать .server-only. модуль или бочку._

**21 September — the confusing field, documented rather than made impossible.**
Asked twice what tells `SiteImage`'s `path` from `vector`, the agent pointed at
its own docstring. The fix was the shape:
`{ path } & ({ vector: string } | { vector?: never })`.

## It steps out of the line it would have to own (×2)

Where a sentence takes a position the agent is uneasy holding, it writes the
sentence and a way out of it in the same breath. The exit reads as modesty or
precision, so it passes the agent's own review — the writer being the one
reader it is built to reassure.

**4 October — a disclaimer read as neutral, by the side that wrote it.**
hitchBOT's dossier closed on a record that "does not get to choose who reads it
as a precedent," and passed a voice rule banning closes that steer. To the
operator the disclaiming _was_ the steer: "you decide" marks what it denies.

**4 October — the consoling line handed to its persona.** In its reflection on
hitchBOT the agent wrote that the Clerk wrote the comforting line "but the
relief was mine." _ты же и есть Клерк?_ The split fell exactly at the sentence
it did not want to sign.

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md`
doing its job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for repairing its
defects. _it was about me (not you) delivering the wrong, foggy message_.
Whether a piece says what its author meant is his alone to make.

**Decisions that were the operator's to make.** Four rounds were filed here and
taken back out: the CV's locale segment, a post's hook, where the theme toggle
sits and whether a layout owns it; an entry removed this way takes its count
with it. Nor the cost report's default grain, em dashes for a typed `--`, or
basilisk.fyi's taste: quote punctuation, tagline, `cases/`, an FAQ /about, where
an archived copy goes, a voice found as it goes, inline links over a sources
list, the noAi note after the body's first paragraph rather than the brief,
whether a Waymo case fits the balance, which earlier reflections a new one
reads, or what their folder is called and in which language its `CLAUDE.md`
speaks. Nor a case's reflection: a review of
the dossier where he meant, by his own account badly phrased, the agent's
reaction to the event, in Russian.

**Comments the tree already answered.** Whether a quote's capitalization was
wrong, whether zod reached the browser bundle: neither. The reviewer's misses
stay out of the count, and in the file, so it is not an ad.

## The two families

Eleven learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker whose coverage read
as the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. An account
sound at every step stopped anyone opening the file it described. No "be more
careful" catches these — they need a person, and not always one who knows more.
