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
list is convincing on its own. Bumps stay in whatever they show, the ones where
the human turns out to have been wrong included: a collection that only
vindicates the reviewer is worth as much as a measurement that only flatters.

**Adding to it is mandatory after a review session** that changed something the
agent had settled — the rule is in `CLAUDE.md` § "GitHub comments", and it is
there because the entry has to be written while the session still remembers
what it was working from.

**This file has an end.** It is scaffolding for one post, not a permanent
journal of reviews: once row 18 is drafted and posted, the file retires along
with the rule that feeds it. Everything durable that comes out of a review
belongs where the code can see it — a rule under `.claude/rules/`, a line in
`CLAUDE.md` — and goes there whether or not it also lands here.

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
- **Past 400 lines, squeeze instead of growing**, which
  `scripts/check-notes-length.sh` fails the vet run over. In order: tighten the
  prose; then cut archaeology — a bump needs the shortest account that still
  shows what the agent could not see, not the blow-by-blow that was easy to
  write while it was fresh; then drop learnings from the bottom, since one bump
  is a coincidence with a paragraph attached. A learning cut for thinness comes
  back if something bumps into it again.

## What it was handed, it treats as fixed (×9)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_. That is
what makes the failure invisible: the reasoning within the frame is sound, and a
second agent checking it would pass. The human's move is to change the given
rather than to answer better within it.

**6 September — a word the vocabulary didn't have.** The commit prefix was wrong:
`docs:` for a change that documents nothing. The agent weighed three candidates
from the list and never considered anything outside it, because the list arrived
looking like a standard. The reply was `let's introduce "content:"`. The list is
ours, in our own `CLAUDE.md`, and adding a word costs one commit — but only for
someone reading it as a local convention rather than as a specification.

**7 September — a word one day old, already treated as given.** Having added
`content:`, the agent framed whether it trips the deploy gate as a trade with no
clean answer: the prefix would cover published material and unpublished drafts
alike, and the gate reads nothing but the subject line. The reply dissolved the
dilemma instead of settling it — `content:` is _specifically_ for what isn't
published yet, and a piece going live arrives as the page that serves it, a
`feat:`. The agent had coined the word the day before and was already reasoning
as though its meaning had been handed to it.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files each inlined their params as an object literal inside a generic. The rule
is that every member two named types declare has one home, and `pnpm
type-overlap` enforces it; the agent ran the gate, saw it clean, and stopped.
The reply: _type-overlap doesn't cover this, but consider it covered_. The gate
scans type aliases only, which the agent knew, having read the README that says
so — and read as the boundary of the rule rather than as a hole in its
enforcement. A checker that passes is evidence about the checker.

**8 September — the same hole, opened by the fix for it.** Applying that rule,
the agent found `caseStudyHref?` declared by cards in two sibling slices, put the
base in `shared/typings` as the lowest home that already existed, and the gate
went green. The reply: _not domain-less; if it's a question of import
directionality, suggest introducing a case study entity_. The gate has no opinion
on which layer a shared base belongs to, so green was again the whole evidence.

**8 September — a cost measured against its own earlier choice.** Asked why the
two CV route files could not collapse into one optional catch-all, the agent
spiked it and reported one cost: the bare `/en/cv` would inherit `og:url:
/en/cv/cto`. Only a cost if `/en/cv` is the address that ought to be indexed —
which the agent had decided itself, hours earlier, in the same branch. _I'd
likely actually prefer the latter being canonical_: flipped, the cost is the
goal, and four route files became two.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would be a better home for a schema, the agent built it,
found `boundaries/dependencies` failing, priced the fix — widening `PUBLIC_API`
from one literal to a list — as a repo-wide change to what "public API" means,
and declined on that basis. Every step true, and the frame never questioned:
`eslint.config.ts` is ours, and "the linter says no" was being treated the way
an external constraint is. The reply: _if "boundaries don't allow" is the only
argument, let's rewrite the boundaries_ — and the sibling repo pins none at all.

**9 September — a comment about what the site's controls wear, read as a rule
about what everything interactive is.** Moving the theme toggle into the header's
corner, the agent left its skin untouched: `variant="default"`, which `theme.ts`
describes beside it as "the site's only control skin". So the corner held a
hairline box fencing off empty space — _let's remove the borders around the theme
buttons_, then _and generally make them gray, unobtrusive_. The comment is ours,
six days old, and says what the site's controls wear, not that everything
clickable is one. The agent had just argued the toggle is page furniture rather
than content, and never carried that one step further to how it looks.

**9 September — a global class read off the globals beside it.** A hover dim
claimed by two slices with no sideways reach went into `globals.scss`, reason
written in: "as the print utilities are". Those are global for a reason that does
not transfer — the content pipeline emits `print-hidden` into HTML strings, where
a hashed module class is unreachable — and what made the neighbours global never
got asked, because they were there. _why are we bypassing modules here? not a
fan_. The mechanism was in the tree too: `theme.module.scss` hands its class
names to Mantine through a plain module, which is what the dim now does.

**11 September — its own spelling, then the operator's typo, both taken as
given.** The sync skill and its watermark were `/sync-agent-infra` and
`source.json` because the agent had named them so at the previous sync. Told the
source renamed its copy `/update-muthur`, it proved the rename need not travel —
Step 1 finds a watermark by what it contains, not where it sits — and read a free
choice as a reason to keep its own, misreading the source's stated reason on the
way: `npm update` names what gets updated, not what it updates from. Two one-word
comments took both names, and one was a typo; rather than notice it matched no
spelling the source ever settled on, the agent wrote a paragraph defending it.

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
project card and left the other two on the old list — having authored all three
itself, in the same branch, hours earlier. Two neighbours had drifted the same
way. The reply — _the tech stack lines should be the same (and DRY)_ — named a
defect no screenshot of any single page could show, because each page was right.

**9 September — the rule fixed in the copy, not in the source.** Told a squash
body has no business carrying a "things to know when editing here" paragraph,
the agent wrote two rules into `.claude/skills/squash-message/SKILL.md` and took
the round as closed. That skill is adopted from a boilerplate repo whose copy
still asks the pass for "anything that would trip someone editing that area
later" — so the same body gets written there next month. The reply was _let's
file an issue on the boilerplate repo_. Whether to file was the operator's call;
that the fix had a second site was not.

**9 September — a test written and not run over the file it was for.** The same
round added the test above to this file — a bump is something the agent could
have seen and didn't — and ran it against exactly the entry under discussion,
retiring one. Ten sections sat above it unexamined, in the file the test had been
written about. The reply was one line: _do the other learnings here de-qualify
per this lens? edit if yes_. One did.

**9 September — the tagline in the catalogue, the tagline in the pixels.** The
CV repositioning rewrote the tagline for the CTO framing and wired
`cv-metadata.ts` to serve each framing its own. Two lines below, in the same
file, it left `ogImage: '/cv_card.png'` — a hand-made composite with the
developer tagline baked in — so a shared `/cv` link unfurled the CTO description
beside a card reading DEVELOPER. The card was a fact rendered in pixels rather
than text; the search for copy to update never reached it and nothing in the tree
hashed it. The operator, shown the unfurl, needed five words: _бли, картинку уже
поменять надо_ 🙈.

**9 September — a rename that took its own inventory on trust.** Told the double
`l` in `Labelled` hurt, the agent renamed the type, then accounted for the
remainder: the two left "are authored prose, not identifiers". Both halves were
wrong — four occurrences across three files, and `scripts/run-parallel.sh` holds a
shell variable named `labelled`, in the script every vet run executes. What the
agent had looked at was the diff it had just written. The reply took the frame
back: _yes let's change them too, they were probably the reason you reached for
the double l in the first place_ — the spelling was in the tree before the type
was, and the type had been the copy.

## It writes its reasoning into the artifact (×3)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and it is still wrong, because what the
artifact is _for_ decides what belongs in it — and it is never the record of how
the artifact was chosen.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not its defence.

**7 September — the commit body that documented the deploy gate.** The squash
message explained the new prefix and its place in the gate, with two notes
recording the call and offering the veto. All of it true. The operator cut all
three: the prefix was a minor ride-along on a branch about a content plan, and a
ride-along given a paragraph in a body read by someone scanning the log reads as
what the commit was for.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on a paragraph headed "Four things to know when editing here". Every item
true, and every item something a person about to break it needs — in a rules
file or a docstring, not in that body. The operator cut it and named the
mechanism too: the body had accreted across refreshes rather than being
rewritten, which is how a cap gets walked past one push at a time.

## An account that explains the code stands in for running it (×3)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. An explanation that accounts for every line is
complete on its own terms, and completeness is what removes the prompt to
measure. Nothing inside the account can report that it was never checked against
the artifact.

**8 September — a redirect nobody had opened.** Asked why the unlocalized `/cv`
route needs a hand-written redirect file, the agent gave the right reason:
next-intl redirects in middleware, a static export has none, so every
unlocalized entry point needs a file. Correct at every step, and it closed the
question — so the agent never asked what the file actually does. The reply
refused the account rather than adding to it: _how do we do "redirect" if it's
not supposed to work in a static export at all?_ One grep of `out/` answered it:
no HTTP redirect, no `meta refresh`, just `NEXT_REDIRECT;replace;/en/cv;307` in
the RSC payload. The hop is React's, after hydration, so `/cv` is a blank page
to anything that doesn't run JS — a real defect, under an explanation that held.

**8 September — the schema it never wrote.** Told route params would be better
parsed with a zod schema, the agent declined on three reasons and two rounds
took two of them away. What was left was that a schema would restate the variant
ids and hand back a `string` union — and one line would have shown otherwise,
since `z.enum(CV_VARIANTS)` reads the same const the type does. The reply was a
question rather than a correction — _Am I missing smth?_ — and the answer was
no. What the account displaced was a measurement nobody had: zod in a module a
client component reaches puts 89 kB gzipped in the CV's bundle, and that decides
where the schema lives rather than whether it exists.

**9 September — four homes, three of them checked.** Cutting a maintenance
paragraph out of a commit body, the agent justified the cut by saying each item
already sat where whoever is about to break it would look. That is the right
test and it made the cut obviously correct, which is why nobody ran it: three of
the four did have such a home, and the fourth — the type gate's blindness to a
shape inlined into a generic — was named nowhere but in the paragraph being
deleted. An account that would have been checked in a minute is the kind that
never is.

## It settles a constraint in prose where a mechanism was available (×2)

A constraint the agent can't see how to enforce, it writes down. The note is
accurate, it sits on the right module, and it is invisible to the edit that
violates it — nothing reads a docstring on its way to moving a file. Prose is
what gets reached for because prose is always available; whether a mechanism was
_also_ available is a separate question, and it doesn't get asked.

**9 September — "keep them out of `shared/i18n`".** Having measured that a zod
schema in the i18n barrel puts 89 kB gzipped into the CV's client bundle, the
agent filed the schema in `pages/cv/lib` and wrote the finding into a docstring
telling the next person not to move it. Settled, as far as it was concerned. The
reply proposed a placement that turned out to be blocked here, and what the
round produced was neither: `import 'server-only'` at the top of the module,
which turns the same mistake into a build error. It had been available all
along, in the pattern every module under `shared/content` already uses.

**9 September — the ceiling this file states, walked past by the append that
states it.** "Past ~400 lines, squeeze instead of growing" is a bullet in the
section above, written by the agent, about the file it was appending to. It added
a section and pushed the file to 447 lines, having read the bullet on the way in
— prose in the file it governs is still only prose, and nothing consults it. The
reply named the mechanism in the same breath as the miss: _isn't 400 lines the
agreed ceiling? let's put a vet.sh-controlled check_. The mirror of the bump
above, and the worse half of it: there the constraint was one the agent had
merely written, here one it was simultaneously breaking.

## It checks the render against its intent, not against the page (×2)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, and only the second one is
answerable from the intent.

**8 September — the logos it had already looked at.** Three organisation marks
were added beside the work-highlight titles, and the agent screenshotted the
page in both schemes, read the images and reported them legible and aligned.
They were legible. The reply was _the logos are slightly mis-aligned_, and the
source files bore it out: one mark filled its canvas edge-to-edge, another was
inset a fifth of its own and off-centre, so at one size they read as different
sizes on a wobbling axis. The screenshot had shown that. What the agent asked it
was "are the logos there", and it answered yes.

**9 September — the card it had just fixed, looked at and passed.** The bump two
sections up was fixed by rendering one card per framing off the catalogue, and
the property the agent set itself was that the card could no longer say what the
page had stopped saying. It rendered both, read them, and confirmed exactly
that. The same image showed a plate empty across its top and bottom thirds and
no way to reach the person on it, with the five engagement labels sitting in the
same catalogue slice. The reply spent four lines on what the render was for:
_the prose itself says nothing_, add GitHub and LinkedIn.

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

**8 September — three glosses invented to fill three slots.** The home page got a
one-line gloss beside each of three old side projects. Two came back corrected to
things no reading of the repos would have produced — _a BYOK AI-first text
processor_, _chatgpt before chatgpt_ — and a fourth card's stack was wrong in
kind, listing TypeScript and feature-sliced design for a boilerplate that has
neither. Every gloss was a confident sentence about the operator's own work, and
the slot never suggested that leaving one blank was available. Not knowing is not
the finding; writing rather than asking is.

## A fact restated into a pitch stops being a measurement (×1)

Numbers from the case study are the site's evidence, and moving one into an
offer changes what the sentence claims without changing whether it is true. The
agent carries it across on the truth.

**8 September — nine checks and an audit trail, sold as capabilities.** The CV's
engineering-system block offered _one gate before every push: nine concurrent
checks_ and _an audit trail by construction: 1,395 commits_. Both are exact
facts about this repo. As offers they promise a stranger a specific check count
on their codebase, and a tally describing work already done — _it's not always
nine_, and _no need, it's not an "offer"_. The case study states them as
measurements, which is the genre they are true in.

## Not bumps

The agent flagged rather than silently fixed two words missing from text the
operator had supplied verbatim — a rule in `.claude/rules/writing.md` doing its
job, recorded so it isn't miscounted as judgement: every learning above is one no
rule anticipated.

**Decisions that were the operator's to make.** Four rounds were filed here and
taken back out: moving the CV's locale out of the leading segment, the hook a
post leads with, where the theme toggle sits, and whether it should come from a
layout rather than from every consumer wanting one. A routing restructure, a
positioning call, and two layouts the operator is looking at and the agent is
not. The residue each time is smaller than the entry claimed: pitching the option
was available and unpitched. Only the toggle's _skin_ stayed a bump, because the
reason to change it was already in the agent's own argument for moving the
control. Entries removed under this test lose their bump count with them.

## The two families

Nine learnings is not a pattern, but they already fall in two groups, and the
second is the more interesting half of the post.

One group is failures to notice the frame was ours — the prefix list, the
published chart, the brief that wanted filling, the checker whose coverage read
as the rule, our own `eslint.config.ts` read as a specification rather than a
decision we can remake. Whatever the agent is handed, it reasons inside.

The other group is the opposite of a mistake: the output was well-formed,
justified and efficient, and every one of those properties is what made it wrong
there. The sharpest is where the agent did the extra step and it did not help —
twice now it rendered the page, looked at it, and verified its own intention. Its
siblings are an edit minimal at the site it was made, whose minimality left one
fact spelled three ways; an explanation sound at every step, whose soundness
stopped anyone opening the file it described; a constraint correctly stated in
prose, whose correctness stopped the search for a checker. No version of "be more
careful" catches these, which is probably why they need a person and not a better
prompt.

Most were caught by the human knowing something the agent didn't — which chart
window was drawn wrong, what a side project actually was. The redirect one was
not: the reply carried no information, only a refusal to accept a well-formed
account — a cheaper kind of review to give and, on this evidence, not a less
productive one.
