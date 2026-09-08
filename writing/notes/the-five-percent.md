# The five percent

For most of what an agent does, it knows better. The residual — the part that
still needs a knowledgeable human — is the whole argument for reviewing agents
at all, and the honest problem is that nobody who makes the claim can say what
it consists of. Naming it needs specimens, not argument.

So this file collects them, abstracted: every section below is one learning, and
under it the times a review bumped into it. One learning bumped three times is
worth more of the eventual post than three learnings bumped once, which is why
the count is in the heading and the file is sorted by it. It feeds backlog row
18 in `writing/linkedin/plan.md`, which stays undraftable until the top of this
list is convincing on its own.

**Adding to it is mandatory after a review session** that changed something the
agent had settled — the rule is in `CLAUDE.md` § "GitHub comments", and it is
there because the entry has to be written while the session still remembers what
it was working from.

**This file has an end.** It is scaffolding for one post, not a permanent
journal of reviews: once row 18 is drafted and posted, the file retires along
with the rule that feeds it. Everything durable that comes out of a review
belongs where the code can see it — a rule under `.claude/rules/`, a line in
`CLAUDE.md` — and goes there whether or not it also lands here.

Bumps stay in whatever they show, including the ones where the human turns out
to have been wrong. A collection that only vindicates the reviewer is worth as
much as a measurement that only flatters.

## How this file is kept

- **`(×n)` is the bump count**, maintained by hand. A review that hits an
  existing learning increments it and adds a line under it; one that hits nothing
  here opens a section at `(×1)`. Nothing counts this automatically — deciding
  that two reviews bumped into the _same_ thing is the judgement the file is
  made of, and a script would have to have it already.
- **Sorted by count, descending**, ties ordered by hand. The order is the claim
  the file makes, so a changed count means re-reading the list and moving the
  section, not appending to the end.
- **Past ~400 lines, squeeze instead of growing.** In order: tighten the prose;
  then cut archaeology — a bump needs the shortest account that still shows what
  the agent could not see, not the blow-by-blow that was easy to write while it
  was fresh; then drop learnings from the bottom, since one bump is a
  coincidence with a paragraph attached. A learning cut for thinness comes back
  if something bumps into it again.

## What it was handed, it treats as fixed (×3)

Whatever arrives as context — a list, a vocabulary, a published figure — the
agent reasons _inside_ rather than _about_. That is what makes the failure
invisible: the reasoning within the frame is sound, and a second agent checking
the work would pass it. The human's move each time is to change the given rather
than to answer better within it.

**6 September — a word the vocabulary didn't have.** The commit prefix was wrong:
`docs:` for a change that documents nothing. The agent worked the problem
properly and came back with three candidates — `feat:`, closest by substance but
it trips the deploy gate; `chore:`, deploy-free but it undersells; `docs:`,
rejected — and never considered anything outside that set, because the list
arrived looking like a standard. The reply was `let's introduce "content:"`. The
list is ours, in our own `CLAUDE.md`, and adding a word to it costs one commit —
but only for someone who reads it as a local convention rather than as a
specification.

**7 September — a word one day old, already treated as given.** Having added
`content:`, the agent had to decide whether it trips the deploy gate, and framed
that as a trade with no clean answer: the prefix would cover material under
`public/` and drafts under `writing/` alike, the gate reads nothing but the
subject line, so one of the two had to be wrong. It picked publishing as the
cheaper error and offered the veto. The reply dissolved the dilemma instead of
settling it — `content:` is _specifically_ for what isn't published yet, and a
piece going live arrives as the page that serves it, which is a `feat:`. The
agent had coined the word the day before and was already reasoning as though its
meaning had been handed to it.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files each spelled their params as an object literal inside a generic —
`Promise<{ locale: string; variant: string }>`. The repo's own rule is that
every member two named types declare has one home, and `pnpm type-overlap`
enforces it; the agent had run the gate, seen it clean, and stopped. The reply:
_type-overlap doesn't cover this, but consider it covered_. The gate scans type
aliases only, so an inlined generic argument is invisible to it — which the
agent knew, having read the README that says so, and read as the boundary of the
rule rather than as a hole in its enforcement. A checker that passes is
evidence about the checker.

## It writes its reasoning into the artifact (×2)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and it is still wrong, because what the
artifact is _for_ decides what belongs in it — and it is never the record of how
the artifact was chosen.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not for its
defence.

**7 September — the commit body that documented the deploy gate.** The squash
message explained the new prefix and its place in the gate, with two notes beside
it recording the call and offering the veto. All of it true. The operator cut all
three: not the place for implementation detail, and the prefix was a minor
ride-along on a branch about a content plan. A squash body is read by someone
scanning the log for what shipped, and a ride-along given a paragraph in it reads
as what the commit was for.

## A published number is not a verified number (×2)

A figure already in print reads as settled, so the agent stops at it. The person
who made the figure remembers what went into it — which window, which
denominator, what was excluded — and none of that is recoverable from the number
itself.

**6 September — 6.2 → 8.2 units of work per day.** Lifted from the case study
into a backlog row as the headline of a post about parallelism. Both windows are
drawn wrong: the before-window starts inside a stretch of docs-only work, the
after-window runs past the point where the job changed from shipping the app to
fixing it, and days off are left in the denominator.

**6 September — `src/` went from 98,000 to 223,000 lines.** Same move, and the
flag came unprompted, with no question attached: _they look a bit too much to
me_. That makes it the stronger of the two — it is the difference between reading
a number and remembering making one.

## Given a form, it fills the form (×2)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._ Nothing had
prompted it. The reply: sometimes I want to write in Russian, and this doesn't
need saying at all — we'll see case by case.

**8 September — three glosses invented to fill three slots.** The home page got
a one-line gloss beside each of three old side projects: _an LLM-agnostic text
processor_, _group AI chat_, _no-code AI widgets_. Two came back corrected to
things no reading of the repos would have produced — _a BYOK AI-first text
processor_, _chatgpt before chatgpt_ — and a fourth card's stack was wrong in
kind, listing TypeScript and feature-sliced design for a boilerplate that has
neither. Every gloss was a confident sentence about the operator's own work,
and the slot never suggested that leaving one blank was available. Not knowing
is not the finding; writing rather than asking is.

## Editing removes slack, and the slack was the voice (×1)

Removing slack is what editing _is_, which is exactly why an agent does it by
default and exactly why the result reads as edited by a machine. The instinct is
right in general and wrong in a specific place, and which one applies is not
available from the text.

**6 September — the loose sentence survived.** _Once done, I thought, why not
write a case study about it_ came back from an edit that would have compressed
it, restored.

## Impressive to have done is not legible to a stranger (×1)

The agent optimises for the hardest thing it did. The reader is scrolling, knows
none of it, and reacts to what needs no context.

**6 September — the hook.** Given three things to lead the post with, the agent
reached for the technically hardest — a lint rule whose failure mode was an auth
hole. The human took a round number to be surprised by, a change in how the work
felt, and an admission of error.

## It checks the render against its intent, not against the page (×1)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, and only the second one is
answerable from the intent.

**8 September — the logos it had already looked at.** Three organisation marks
were added beside the work-highlight titles, and the agent screenshotted the
page in both schemes, read the images and reported that they were legible and
aligned. They were legible. The reply was _the logos are slightly mis-aligned_,
and measuring the source files bore it out: one mark filled its canvas
edge-to-edge, another was inset a fifth of its own and off-centre besides, so
rendered at one size they read as different sizes on a wobbling axis. The
screenshot had shown that. What the agent had asked it was "are the logos
there", and it answered yes.

## A fact restated into a pitch stops being a measurement (×1)

Numbers from the case study are the site's evidence, and moving one into an
offer changes what the sentence claims without changing whether it is true. The
agent carries it across on the truth.

**8 September — nine checks and an audit trail, sold as capabilities.** The
CV's engineering-system block offered _one gate before every push: nine
concurrent checks_ and _an audit trail by construction: 1,395 commits, 48
releases and 18 hotfixes_. Both are exact facts about this repo. As offers they
promise a stranger a specific check count on their codebase, and a commit
tally that is a description of work already done rather than anything on sale —
_it's not always nine_, and _no need, it's not an "offer"_. The case study
states them as measurements, which is the genre they are true in.

## Not bumps

The agent flagged rather than silently fixed two words missing from text the
operator had supplied verbatim. That is a rule in `.claude/rules/writing.md`
doing its job, and it is recorded here so it isn't later miscounted as judgement:
every learning above is one no rule anticipated.

## The two families

Three reviews is not a pattern, but the eight learnings already fall in two
groups, and the second is the more interesting half of the post.

Four are failures to notice that the frame was ours — the prefix list, the
published chart, the brief that wanted filling, the checker whose coverage read
as the rule. Whatever the agent is handed as context, it treats as the given.

The other four are the opposite of a mistake: the output was well-formed,
justified and efficient, and every one of those properties is what made it wrong
there. The newest of them is the sharpest, because the agent did the extra step
and it did not help: it rendered the page, looked at it, and verified its own
intention. No version of "be more careful" catches these, which is probably why
they need a person and not a better prompt.
