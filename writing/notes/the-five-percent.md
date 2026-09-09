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
- **A bump is something the agent could have seen and didn't.** Where the review
  supplied a decision that was the human's to take — a positioning call, a change
  of scope, anything the agent taking it unasked would have been worse — it goes
  under "Not bumps" or nowhere. Not every correction is a blind spot, and a file
  that counts them all reads as an agent grading its own obedience.
- **Past ~400 lines, squeeze instead of growing.** In order: tighten the prose;
  then cut archaeology — a bump needs the shortest account that still shows what
  the agent could not see, not the blow-by-blow that was easy to write while it
  was fresh; then drop learnings from the bottom, since one bump is a
  coincidence with a paragraph attached. A learning cut for thinness comes back
  if something bumps into it again.

## What it was handed, it treats as fixed (×7)

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
files each inlined their params as an object literal inside a generic. The
repo's rule is that every member two named types declare has one home, and
`pnpm type-overlap` enforces it; the agent ran the gate, saw it clean, and
stopped. The reply: _type-overlap doesn't cover this, but consider it covered_.
The gate scans type aliases only, so an inlined generic argument is invisible to
it — which the agent knew, having read the README that says so, and read as the
boundary of the rule rather than as a hole in its enforcement. A checker that
passes is evidence about the checker.

**8 September — the same hole, opened by the fix for it.** Applying that rule,
the agent named the bases the route files had inlined, and the gate then found
two more members declared twice. One was `caseStudyHref?`, shared by a card in
`pages/home` and a card in `pages/cv` — sibling slices, so the base had to sit
below both, and `shared/typings` was the lowest home that already existed. It
went there and the gate went green. The reply: _not domain-less; if it's a
question of import directionality, suggest introducing a case study entity_.
The gate asks whether a duplicated member has one home and has no opinion on
which layer that home belongs to, so green was again the whole of the evidence
— this time about a placement the agent made while fixing the previous bump.

**8 September — a cost measured against its own earlier choice.** Asked why the
two CV route files could not collapse into one optional catch-all, the agent
spiked it, measured, and reported a single cost: the bare `/en/cv` would inherit
`og:url: /en/cv/cto`. True, and it is only a cost if `/en/cv` is the address
that ought to be indexed — which the agent had decided itself, hours earlier, in
the same branch, and by review time was reasoning from rather than about. The
reply changed the given: _I'd likely actually prefer the latter being canonical:
then in the search people see "ok, this one's for cto, and it sits on
en/cv/cto"_. Flipped, the cost is the goal, and the collapse the agent had
argued against became free — four route files down to two.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would be a better home for a schema than burying it in the
slice that uses it, the agent built it, ran both checkers, and reported that
Steiger passed and `boundaries/dependencies` failed. It then priced the fix —
widening `PUBLIC_API` from one literal to a list — as a repo-wide change to what
"public API" means, and declined on that basis. Every step true, and the frame
never questioned: `eslint.config.ts` is ours, the line is one we wrote, and
"the linter says no" was being treated the way an external constraint is. The
reply was two clauses — _if "boundaries don't allow" is the only argument, let's
rewrite the boundaries_, and go read how the sibling repo does it. That repo
pins no public API at all and runs four suffixed barrels; the cost the agent had
quoted is simply how it works there.

**9 September — a comment about what the site's controls wear, read as a rule
about what everything interactive is.** Told the theme toggle cost a row it did
not need, the agent moved it into the header's corner and left its skin
untouched: `variant="default"`, which `theme.ts` describes beside it as "the
site's only control skin". So the corner now held a hairline box fencing off
empty space, which is what the operator saw — _let's remove the borders around
the theme buttons_, then _and generally make them gray, unobtrusive_. The
comment is ours, six days old, and it says what the site's controls wear, not
that everything clickable is one. The agent had just finished arguing that the
toggle is page furniture rather than content — that is the whole reason it left
the flow — and never carried the argument the one step further to how it should
look.

## It edits the copy in front of it, not the fact behind it (×5)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source it came from carrying the cause; a test written
into a file is run against the one entry under discussion. Nothing catches the
split — every site still reads correctly on its own, and the divergence exists
only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders on
the home page's project card, on its work-highlight card, and in the CV's
experience entry. Told to put Supabase and Railway in it, the agent edited the
project card and left the other two reading _Next.js 16, TypeScript,
feature-sliced design, Claude Code_ — having authored all three itself, in the
same branch, hours earlier. Two neighbours had drifted the same way: the CV
credited Orcool with a custom LLM orchestration framework that neither home card
mentioned, and DDB's stack said "backend" and "frontend" in one place and not the
other. The reply was one line — _the tech stack lines should be the same (and
DRY)_ — and it named a defect no screenshot of any single page could show,
because each page was right.

**9 September — the rule fixed in the copy, not in the source.** Told a squash
body has no business carrying a "things to know when editing here" paragraph,
the agent wrote two rules into `.claude/skills/squash-message/SKILL.md` and took
the round as closed. That skill is adopted from a boilerplate repo — named by
line in `.claude/skills/sync-agent-boilerplate/source.json` — whose copy still
asks the pass for "anything that would trip someone editing that area later".
The clause that licensed the paragraph is upstream, so the same body gets written
there next month. The reply was _let's file an issue on the boilerplate repo_.
Whether to file was the operator's call; that the fix had a second site was not.

**9 September — a test written and not run over the file it was for.** The same
round added the test above to this file — a bump is something the agent could
have seen and didn't — and ran it against exactly the entry under discussion,
retiring one. Ten sections sat above it unexamined, in the file the test had been
written about. The reply was one line: _do the other learnings here de-qualify
per this lens? edit if yes_. One did.

**9 September — the tagline in the catalogue, the tagline in the pixels.** The
CV repositioning rewrote the tagline and the description for the CTO framing and
wired `cv-metadata.ts` to serve each framing its own. Two lines below, in the
same file, the same PR left `ogImage: '/cv_card.png'` — a hand-made composite
with the developer tagline and the retired Core Capabilities bullets baked in —
now advertised for both framings, so a shared `/cv` link unfurled the CTO
description beside a card reading DEVELOPER. The card was a fact rendered in
pixels rather than in text, and the search for the copy to update never reached
it; nothing in the tree hashed it either. An industry CEO named the picture as
wrong for the framing, and the operator, shown the unfurl, needed five words:
_бли, картинку уже поменять надо_ 🙈.

**9 September — a rename that took its own inventory on trust.** Told the double
`l` in `Labelled` hurt, the agent renamed the type and `LabelledText`, then
accounted for the remainder: the two left in the tree "are authored prose, not
identifiers", and here is where they are. Both halves were wrong. The prose
occurrences were four across three files, not two, and `scripts/run-parallel.sh`
holds a shell variable named `labelled` — an identifier, in the script every vet
run executes. Offering to sweep the rest reads as having looked at it; what the
agent had actually looked at was the diff it had just written. The reply took
the frame back: _yes let's change them too, they were probably the reason you
reached for the double l in the first place_ — the spelling was in the tree
before the type was, and the type had been the copy.

## It writes its reasoning into the artifact (×3)

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

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on a paragraph headed "Four things to know when editing here": which files
the PDF renders hash, that a card's link cannot be an anchor wrapped around it,
the prop shape the type gate can read. Every item true, and every item something
a person about to break it needs — in a rules file or a docstring, not in a body
read by someone scanning the log for what shipped. The operator cut it in one
line and named the mechanism too: the body had accreted across refreshes rather
than being rewritten, which is how a cap gets walked past one push at a time.

## An account that explains the code stands in for running it (×3)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. An explanation that accounts for every line is
complete on its own terms, and completeness is what removes the prompt to
measure. Nothing inside the account can report that it was never checked against
the artifact.

**8 September — a redirect nobody had opened.** Asked why the unlocalized `/cv`
route needs a hand-written redirect file, the agent gave the right reason:
next-intl redirects in middleware, a static export has no middleware, so every
unlocalized entry point needs a file. Correct at every step, and it closed the
question — so the agent never asked what the file it was defending actually
does. The reply refused the account rather than adding to it: _how do we do
"redirect" if it's not supposed to work in a static export at all?_ One grep of
`out/` answered it: no HTTP redirect, no `meta refresh` anywhere in the tree,
just an empty body and `NEXT_REDIRECT;replace;/en/cv;307` in the RSC payload.
The hop is done by React after hydration, so `/cv` is a blank page to anything
that doesn't run JS. A real defect, live on the site, sitting under an
explanation that was true. In the same round the agent had also written that the
change would need the CV PDFs re-rendered; there are no CV PDFs, and `find` says
so in a second.

**8 September — the schema it never wrote.** Told that route params would be
better parsed with a zod schema, the agent declined and kept its hand-written
type guards, on three reasons. Two rounds took two of them away, the timing one
conceded unprompted. What was left was that a schema would restate the variant
ids and hand back a `string` union to keep in sync with them — and one line
would have shown otherwise, since `z.enum(CV_VARIANTS)` reads the same const the
type does and infers `'cto' | 'dev'`. The reply was a question rather than a
correction — _they would be defined first, followed by `z.enum(...)` over them.
Am I missing smth?_ — and the answer was no. What the account did displace was a
different measurement, which nobody had: zod imported into a module a client
component reaches puts 89 kB gzipped in the CV page's bundle, and that decides
where the schema lives rather than whether it exists.

**9 September — four homes, three of them checked.** Cutting a maintenance
paragraph out of a commit body, the agent justified the cut by saying each item
already sat where whoever is about to break it would look. That is the right
test and it made the cut obviously correct, which is why nobody ran it: three of
the four did have such a home, and the fourth — the type gate's blindness to a
shape inlined into a generic — was named nowhere but in the paragraph being
deleted. The reply asked for the content to become a rule, not for the argument
to be re-made, and one pass over the four found the gap in a minute. An account
that would have been checked in a minute is the kind that never is.

## It checks the render against its intent, not against the page (×2)

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

**9 September — the card it had just fixed, looked at and passed.** The bump two
sections up — a hand-made card advertising the wrong framing — was fixed by
rendering one card per framing off the catalogue, and the property the agent set
itself was that the card could no longer say what the page had stopped saying.
It rendered both, read them, and confirmed exactly that. The same image showed a
plate empty across its top and bottom thirds, carrying a name, a tagline and
`metadata.ogSuffix` — which names nothing on sale — and no way to reach the
person on it. The five engagement labels sat in the same catalogue slice. The
reply spent four lines on what the render was for: _the prose itself says
nothing_, take a shorter version of "what I offer", add GitHub and LinkedIn, and
in general a physical business-card-like view is welcome.

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

## It settles a constraint in prose where a mechanism was available (×1)

A constraint the agent can't see how to enforce, it writes down. The note is
accurate, it sits on the right module, and it is invisible to the edit that
violates it — nothing reads a docstring on its way to moving a file. Prose is
what gets reached for because prose is always available; whether a mechanism was
_also_ available is a separate question, and it doesn't get asked.

**9 September — "keep them out of `shared/i18n`".** Having measured that a zod
schema in the i18n barrel puts 89 kB gzipped into the CV's client bundle, the
agent filed the schema in `pages/cv/lib` and wrote the finding into a docstring
telling the next person not to move it. Settled, as far as it was concerned. The
reply proposed a different placement — _barrels can be different in fsd, e.g.
index.server-only.ts_ — which turned out to be blocked here, since the repo's
`boundaries/dependencies` policy defines the public API as the single literal
`index.ts`. What the round produced was neither placement: `import 'server-only'`
at the top of the module, which turns the same mistake into a build error. It had
been available all along, in the pattern every module under `shared/content`
already uses.

## Editing removes slack, and the slack was the voice (×1)

Removing slack is what editing _is_, which is exactly why an agent does it by
default and exactly why the result reads as edited by a machine. The instinct is
right in general and wrong in a specific place, and which one applies is not
available from the text.

**6 September — the loose sentence survived.** _Once done, I thought, why not
write a case study about it_ came back from an edit that would have compressed
it, restored.

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

**A decision that was the operator's to make.** Moving the CV's locale out of
the leading segment was filed here as a frame the agent had failed to question.
It was not: restructuring the site's routing is a call the agent should not take
on its own, and taking it unasked would have been the worse failure of the two.
Pitching it was available and unpitched, which is a smaller thing than the entry
claimed. Entries removed under this test lose their bump count with them.

**A pick the agent was invited to make.** "Impressive to have done is not legible
to a stranger" stood on one bump: given three things to lead a post with, the
agent reached for the technically hardest — a lint rule whose failure mode was an
auth hole — and the human took a round number instead. A post's hook is a
positioning call on the operator's own work, and `.claude/rules/writing.md` says
so outright: offer the options, don't pick for them. So the residue is the entry
above's — offering was available and unoffered — and the tendency the section
named, real or not, has no evidence in one overruled taste call.

**Where a control goes on the page.** "I don't like the extra vertical space the
switcher takes — let's make it sit beside the respective headers" is the same
kind of call: a layout the operator is looking at and the agent is not. Only the
skin that came with it is a bump, and it is one because the reason to change it
was already in the agent's own argument for moving the control.

## The two families

Ten reviews is not a pattern, but the ten learnings already fall in two groups,
and the second is the more interesting half of the post.

Four are failures to notice that the frame was ours — the prefix list, the
published chart, the brief that wanted filling, the checker whose coverage read
as the rule. A fifth is the same thing about our own tooling: a line in our
`eslint.config.ts` read as a specification rather than as a decision we made and
can remake. Whatever the agent is handed as context, it treats as the given.

The other five are the opposite of a mistake: the output was well-formed,
justified and efficient, and every one of those properties is what made it wrong
there. The sharpest is the one where the agent did the extra step and it did not
help: twice now it rendered the page, looked at it, and verified its own
intention. Three are its siblings — an edit correct and minimal at the site it
was made, whose minimality left the same fact spelled three ways; an explanation
sound at every step, whose soundness stopped anyone opening the file it
described; and a docstring correct about the constraint it states, whose
correctness stopped the agent looking for a checker that would state it in a
form something reads. No version of "be more careful" catches these, which is
probably why they need a person and not a better prompt.

They also differ in what the human had to supply. Most of these were caught by
knowing something the agent didn't — which chart window was drawn wrong, what a
side project actually was. The redirect one was not: the reply carried no
information, only a refusal to accept a well-formed account. That is a cheaper
kind of review to give and, on this evidence, not a less productive one.
