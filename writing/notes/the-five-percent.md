# The five percent

For most of what an agent does, it knows better. The residual — the part that
still needs a knowledgeable human — is the whole argument for reviewing agents
at all, and the honest problem is that nobody who makes the claim can say what
it consists of. Naming it needs specimens, not argument.

So this file collects them: cases where a human review changed something an
agent had settled, recorded close enough to the event to still be accurate.
Each entry says what the agent produced, what the human did, and — the part
that matters — what the agent could not have seen from where it stood. It feeds
backlog row 18 in `writing/linkedin/plan.md`, which stays undraftable until
there are enough entries here to generalise from.

**Adding to it is mandatory after a review session** that changed something the
agent had settled — the rule is in `CLAUDE.md` § "GitHub comments", and it is
there because the entry has to be written while the session still remembers what
it was working from.

**This file has an end.** It is scaffolding for one post, not a permanent
journal of reviews: once row 18 is drafted and posted, the file retires along
with the rule that feeds it. Everything durable that comes out of a review
belongs where the code can see it — a rule under `.claude/rules/`, a line in
`CLAUDE.md` — and goes there whether or not it also lands here.

Entries stay in whatever they show, including the ones where the human turns
out to have been wrong. A collection that only vindicates the reviewer is worth
as much as a measurement that only flatters.

## 6 September 2026 — the review of the LinkedIn backlog

The first pass over `writing/linkedin/`: a plan file, a rules file and one
draft post, reviewed across twenty-one comments in two sittings.

### The frame was negotiable

**A word the vocabulary didn't have.** The commit prefix was wrong — `docs:`
for a change that documents nothing. The agent worked the problem properly and
came back with a choice of three: `feat:`, closest by substance but it trips the
deploy gate; `chore:`, deploy-free but it undersells; `docs:`, rejected. All
three are conventional-commit prefixes, and the agent never considered anything
else, because the list arrived looking like a standard. The reply was `let's
introduce "content:"`. The list is ours. It lives in our own `CLAUDE.md`, we
wrote every line of it, and adding a word to it costs one commit — but only for
someone who reads it as a local convention rather than as a specification.

**A rule for a question nobody had asked.** Asked to write a conventions file,
the agent wrote conventions — including _English only. The site is bilingual;
this isn't._ Nothing had prompted it. The reply: sometimes I want to write in
Russian, and this doesn't need saying at all — we'll see case by case. Rules are
cheap to write and expensive to be wrong about, and an agent asked for a rules
file will produce rules to fill it, at whatever rate the format seems to want.
Silence was available and the agent didn't see it.

**A published number is not a verified number.** Twice, and the second time
unprompted. The agent built a backlog row on _6.2 → 8.2 units of work per day_
and another on _`src/` went from 98,000 to 223,000 lines_ — both lifted from the
case study, both treated as settled because they were already published. The
reviewer drew the chart and wrote the sentence, so he remembers what went into
each: one window starts inside a stretch of docs-only work and the other runs
past the point where the job changed from shipping the app to fixing it, with
days off left in the denominator. The second flag came with no question
attached — _they look a bit too much to me_ — which makes it the stronger of the
two specimens. It is the difference between reading a number and remembering
making one.

### The tell is the polish

**The paragraph explaining the paragraph.** The announcement draft carried a
passage on its own calibration — why its register was pitched where it was. The
agent wrote it because an agent defends its choices; the human deleted it,
because a reader came for the post and not for its defence.

**The loose sentence is the voice.** _Once done, I thought, why not write a case
study about it_ survived an edit that would have compressed it. Removing slack
is what editing is, which is exactly why an agent does it by default, and
exactly why the result reads as edited by a machine. The instinct is correct in
general and wrong here, and knowing which of those applies is not available from
the text.

**The hook.** Given three things to lead the post with, the agent reached for
the technically hardest and the human took the ones a stranger can react to: a
round number to be surprised by, a change in how the work felt, an admission of
error. The agent optimised for what was impressive to have done; the human knows
who is scrolling past.

### What this one doesn't show

The agent flagged rather than silently fixed two words missing from text the
operator had supplied verbatim. That is a rule in `.claude/rules/writing.md`
doing its job — worth noting so it isn't later miscounted as judgement, since
the specimens above are the ones no rule anticipated.

## 7 September 2026 — the second pass over the same branch

Five comments, on the prefix the first pass introduced and on the commit message
carrying it.

### The frame was negotiable

**A word one day old, already treated as given.** Having added `content:`, the
agent had to decide whether it trips the deploy gate, and framed that as a
trade with no clean answer: the prefix would cover both material under `public/`
(which a visitor sees) and drafts under `writing/` (never built), the gate reads
nothing but the subject line, so one of the two had to be wrong. It picked
publishing as the cheaper error — a redundant republish nobody notices against a
live site quietly stale — flagged the call, and offered the veto. The reply
dissolved the dilemma instead of settling it: `content:` is _specifically_ for
what isn't published yet, and the moment a piece goes live it arrives as the page
that serves it, `.md` and `.pdf` variants included, which is a `feat:`. The
agent had invented the word the day before and was already reasoning as though
its meaning were handed to it.

### The tell is the polish

**The commit body that documented the deploy gate.** The squash message
explained the new prefix and its place in the gate, and two notes beside it
recorded the call and offered the veto. All of it true, and traceable to the
threads it came from. The operator cut all three: not the place for
implementation detail, and the prefix was a minor ride-along on a branch about a
content plan. The agent was completing the record; a squash body is read by
someone scanning the log for what shipped, and a ride-along given a paragraph in
it reads as what the commit was for.

## What they have in common so far

Two reviews is not a pattern either, but the split survived the second one, and
each specimen landed in a family that already existed rather than opening a
third.

Four of the eight are not mistakes _inside_ the problem — the reasoning within
each frame was sound, and a second agent checking the work would have passed it.
They are failures to notice that the frame was ours: the prefix list, the
published chart, the brief to write rules, the meaning of a word the agent had
itself coined the day before. Whatever an agent is handed as context, it treats
as the given, and the human's move each time was to change the given rather than
to answer better within it.

The other four are the opposite of a mistake: the output was well-formed,
justified and efficient, and every one of those properties is what made it wrong
here. There is no version of "be more careful" that catches them, which is
probably why they need a person and not a better prompt.
