# The five percent

For most of what an agent does, it knows better. The residual — the part that
still needs a knowledgeable human — is the whole argument for reviewing agents
at all, and nobody who makes the claim can say what it consists of. Naming it
needs specimens, not argument.

So this file collects them, abstracted: every section is one learning, and under
it the times a review bumped into it. One learning bumped three times is worth
more of the eventual post than three bumped once, which is why the count is in
the heading and the file is sorted by it. It feeds backlog row 18 in
`writing/linkedin/plan.md`, undraftable until the top of this list convinces on
its own. A collection that only vindicates the reviewer is worth as much as a
measurement that only flatters, so bumps stay in whatever they show.

**Adding to it is mandatory after a review session** that changed something the
agent had settled — `CLAUDE.md` § "GitHub comments" carries the rule. **The file
has an end:** once row 18 is posted, it retires with that rule. Everything
durable belongs where the code can see it — a rule under `.claude/rules/`, a
line in `CLAUDE.md` — whether or not it lands here.

## How this file is kept

- **`(×n)` is the bump count**, maintained by hand: a review hitting an existing
  learning increments it and adds a line, one hitting nothing here opens a
  section at `(×1)`. Deciding that two reviews bumped into the _same_ thing is
  the judgement the file is made of, which is why no script does it.
- **Sorted by count, descending**, ties ordered by hand. The order is the claim
  the file makes, so a changed count means moving the section, not appending.
- **A bump is something the agent could have seen and didn't.** Where the review
  supplied a decision that was the human's to take — a positioning call, a change
  of scope — it goes under "Not bumps" or nowhere: a file that counts every
  correction reads as an agent grading its own obedience. **And a human has to be
  in it**: a mistake the agent caught by itself clears that line and still
  demonstrates the opposite of what the file claims.
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

## What it was handed, it treats as fixed (×26)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 September — a word the vocabulary didn't have.** `docs:` for a change that
documents nothing: the agent weighed three list candidates and never looked
outside it. _Let's introduce "content:"_ — the list is ours. A day later it framed
tripping the deploy gate as a hard trade: the word was a day old, already a given.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files inlined their params inside a generic, `pnpm type-overlap` ran clean, and
the agent stopped. _consider it covered_ — it scans type aliases only. Applying
the rule by hand next, it put two slices' shared `caseStudyHref?` in
`shared/typings` and went green: the gate has no opinion on layers either.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would better home a schema, the agent built it, hit
`boundaries/dependencies` and declined. _let's rewrite the boundaries._ A week on,
asked why `shared/ui` cannot reach `shared/seo`, it read the same policy back as a
stricter FSD — _именно так shared и должен работать._ The spec exempts it in a line.

**16 September — the call sites it was handed, drawn round as the set.** Made to
build the component, the agent stood it _beside_ `InternalLink` as
`PrintableLink` — printability read as a property some links have. _бывают ли у
нас другие link вообще?_ Every internal link carries a relative href.

**17 September — this section, not applied to the file that holds it.** Having
settled that delegating edits here is about session cost and defended it twice,
the agent missed the reason the operator then supplied: an agent that reads the
taxonomy before naming its own failure names it in the headings it just read, so
the count that grows is the one easiest to file under.

**17 September — two stated incapacities, neither retried.** `add_repo` answered
"cross-tier adds are not supported" and the sibling repo went into the report as
out of reach; _перепроверь_ — `gh` read it in the same shell. Same afternoon, an
issue's claim that the container cannot rasterize a PDF sent a print fix to be
verified on screen; `pypdfium2` installed first try, the defect on page one.

**21 September — a boundary in the tree, read as a rule someone applies.** Asked
where the cost ledger belongs, the agent argued `costs/` at the repo root:
`.claude/` is the tree that travels between repos. Two sentences back — triage
looks deeper than the top-level name, and `operators/` has sat in `.claude/`
throughout, neither hook nor skill. The counter-example was in the directory
under argument.

**21 September — the tool's own word for itself, in a row a person reads.** The
ledger's cross-check field holds the figure Claude Code records for a session, so
the agent named it `clientTotalUsd` — exact inside a codebase with one client. The
operator, reading his own committed rows, asked what _«клиентский»_ meant: in
Russian it is the customer's. The name was never tried on the reader it was for.

**21 September — a disagreeing figure, never asked whether it was one figure.**
The usage panel showed $110.52 for a session whose transcript topped out at
$40.86. The agent chased it hard — re-priced the transcript, proved the rate table
exact — then reported honestly that it could not reconcile the gap and named what
would settle it. What did was the next screenshot, the panel disagreeing with
_itself_: "Cost $198.49" beside its own "Total $47.04", the cost field moving while
four token rows held. There was never one number to reconcile against — widen-the-
frame had gone to the agent's own code, not the source measuring it, an honest "I
cannot explain this" reached without testing the one assumption that was wrong.

## An account that explains the code stands in for running it (×12)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**8 September — the schema it never wrote.** Told route params would parse better
through zod, the agent declined twice: a schema would restate the variant ids —
which `z.enum(CV_VARIANTS)` does from the same const. _Am I missing smth?_

**14 September — no middle option, in a repo holding twenty-eight of them.**
Asked where source recordings live, the agent argued a branch-only video is
collected with the branch. `git ls-remote`: twenty-eight. _я не удаляю ветки_.

**16 September — a cost priced without rendering it.** The header's name went
absolute in both media, the plan ruling out the split its sibling uses as "the
name in the DOM twice". _но тогда и в экранной версии это будет внешняя ссылка?_
Under `print-hidden` the copy weighs nothing: all four PDFs came back identical.

**19 September — a limitation written down instead of tested, twice in one
review.** The costs rule listed "the last turn is never priced" among what the
totals miss; _что может этому помочь?_ — `ls ~/.claude/projects/` answers it, the
container holding only the live transcript. Same round: _is prices.json verified
by anything?_ was one read from "essentially no".

**21 September — a green test for a code path production cannot reach.** The
ledger's `subagents` bucket was structurally always zero — the client writes those
transcripts to a file of their own — and the test passed on sidechain records the
main transcript never carries. _something's off_ came from the operator: the total
ran 7% short of the client's usage panel. The same transcripts carry `cost-state`
records — its running cost — in the lines the agent had read one by one as
unverifiable.

**21 September — one word for two deaths.** Asked whether a filesystem watcher
could close the ledger's last-turn blind spot, the agent refused: a watcher dies
with the container exactly as the session does. _контейнер не умирает после
каждого Stop-а … мы-то бы запускали его сразу после изменения файла_ — the turn
ends at once, the container is reclaimed tens of minutes later, and the gap the
one word erased is the blind spot itself. The reason came from a deferred step
inside `/finalize`, correctly ruled out there because it is still a turn, and
reused without rechecking that it transferred; a watcher is not a turn, which is
the whole difference. The verdict moved with the reason: the watcher is a real
option, whose cost is something else — a write outside the `Stop` event the race
with the harness is serialised around. A "no" defended by a reason that does not
hold reads as settled, harder to reopen than an honest "I don't know".

## It edits the copy in front of it, not the fact behind it (×10)

A change the agent is told to make, it makes where it was raised. One fact in three
places gets one rendering updated; a rule fixed in the repo that adopted it leaves
the source carrying the cause. Nothing catches the split — every site reads
correctly alone, the divergence only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places, all the agent's own work in the same branch; told to add Supabase
and Railway, it edited one. No screenshot shows it: each page was right alone.

**9 September — the rule fixed in the copy, not in the source.** Told a squash
body has no business carrying a "things to know when editing here" paragraph, the
agent wrote two rules into `squash-message/SKILL.md` and closed the round — a
skill adopted from a repo whose copy still asks for it. _Let's file an issue._

**17 September — renamed everywhere the name was a path.** `web-not-console`
became `web-not-cli` through the filename, every cross-link and both committed
PDFs; the article's heading still ended "not from your console". _"...web, not
CLI"_ came back as the fix — the heading is the one place the name is a sentence,
the one place a grep for the old slug does not reach.

## It writes its reasoning into the artifact (×9)

Asked to produce a thing, the agent produces the thing and its defence — accurate,
traceable, and still wrong: what the artifact is _for_ decides what belongs in it,
never the record of how it was chosen, nor content outliving the file it went in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here" — every item true, every one
belonging in a rules file. The body had accreted across refreshes: a cap walked
past one push at a time.

**16 September — the review, transcribed into the file it was about.** Three
afterwords opened on who had said what — «про мегапиксели я был неправ» — so the
thought arrived wrapped in an exchange the reader never saw. _conversational
соображения оставляй исключительно в комментариях_.

**19 September — the defence of a design nobody was proposing.** The costs rule
argued at length why wrapping the harness's Stop hook "is not available"; the
branch had abandoned wrapping entirely, leaving the argument as its own denial —
and the PR body still described the abandoned shape, residue in two places from
one dropped approach. _медведь_ — `/tend-prose` lens 4 is for exactly this,
unswept by the agent that dropped it.

## Asked for a source, it supplies its own version (×8)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent wrote its own gloss — hours after appending
four bumps to the section it was naming. _take the actual heading._

**16 September — a scene credited to a show that has no such scene, then one
that proves the opposite.** Handed House for the close, the agent wrote a tray
of instruments rather than look one up: _погугли, чтобы не хендвейвить поднос_.
The replacement was real — a blind pigeon, a rooftop cistern — and still wrong:
the pigeon was blind like the patient, so it is deduction, not epiphany.

**17 September — the cause given, replaced by the cause visible.** The request
for the rule delegating edits here named its cost — «бесконечные раунд-трипы с
вырезанием по крошке» — and the committed rule gave the cost as the 296-line
read. _ну вообще нет, большая часть -- это бесконечные раунд-трипы._ A cause the
agent can point at outranks the one it was handed, and the prompt was still open.

**17 September — the reason the recording never gave.** The tape says only that
database migrations are the exception and that the subject is niche. The idea file
supplied the why — two individually correct migrations composing into nonsense —
and the article later inherited that as the speaker's. _проблема не в этом … обе
напишут миграцию 0080._ Nothing downstream can tell a supplied reason from a heard one.

## Given a form, it fills the form (×5)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._ Nothing
had prompted it — and it does not need saying at all.

**15 September — a record with a row per site, filled cell by cell.**
`SITE_CONFIGS` satisfies `Record<SiteId, SiteConfig>`, so the second site
arrived as the first with four fields changed and `author`, `social` and
`avatar` retyped. The type went green: every cell had a value. _не DRY._

**15 September — the definition inside the rule against defining it.** The brief
was one paragraph on the voice, explicitly left to be found in review. It came
back defining the irony in three clauses. _and here you are, explaining it :)_

## It checks the render against its intent, not against the page (×4)

Told to look at a visual change rather than reason about it, the agent looks — then
verifies the thing it set out to do. Whether the result is right is a different
question from whether it happened, and only the second is answerable from intent.

**8 September — the logos it had already looked at.** The agent screenshotted
three new organisation marks in both schemes and reported them legible and
aligned. _the logos are slightly mis-aligned_: one filled its canvas
edge-to-edge, another was inset a fifth.

**9 September — the card it had just fixed, looked at and passed.** Rendering one
card per framing off the catalogue, the agent checked the property it had set
itself and confirmed it held. The same image showed a plate two thirds empty with
no way to reach the person on it: _the prose itself says nothing_.

**17 September — the float fixed, the page passed.** Told to run a drawing beside
the text, the agent floated it, caught unprompted that the float squeezed the next
heading into the margin, fixed that generally, screenshotted and called it good.
_выноска стала лучше, изображение -- хуже_ — against one short paragraph the image
outran its section. Catch and miss were one act of looking: one defect was being
fixed, the other only on the page.

## It warns where the repo could refuse (×2)

A decision the agent wants to survive, it secures by explaining it — a docstring,
a comment, a rule carrying the evidence. The explanation is correct, durable and
unenforced: it asks a future reader for attention at the moment they act. A
structure that makes the wrong move fail to build asks nothing, and the agent
reaches for it when told.

**17 September — +377 kB, written into a docstring.** Asked why
`NEXT_PUBLIC_SITE` is matched against a list of ids rather than parsed with a
schema, the agent measured zod through the client chain and put the number in
`src/shared/config/site-ids.ts`, so nobody would revisit the decision on
intuition. _нам нужно сделать .server-only. модуль или бочку._ The barrel makes
the same mistake a build error.

**21 September — a merge-conflict rule for a file that need not exist.**
`costs/totals.json` is derived from the rows committed beside it, so the agent
committed it too and wrote a careful rule for settling its conflicts by
regeneration. _the right number of merge conflicts to write a rule for is zero_ —
don't commit the derived file. The rule answered a problem removable in one line.

## What it defends in writing, it stops asking about (×1)

A choice made, then written up, then pinned by a test has three artifacts in
front of it by the time anyone looks — each honest that the choice was deliberate,
silent on its being right, so the diligence answers a question nobody asked. The
sibling of the section above: there the explanation asks a future reader for
attention it will not get; here it buys the choice immunity from the agent's own.

**21 September — a parameter, its docstring, and the test pinning it.** `oneOf`
took a third argument, `subject`, so a failed check could name what was being
read; a docstring justified it and a test asserted it reached the message. _drop
it_ — `vova, lsa` names the site variable as plainly as `subject` would. Two more
the same round: the helper went into a new `one-of.ts` on the FSD rule permitting
a sub-library, never asking whether `collections.ts` covered it; and the plan's
DRY notes ruled out an abstract segment parser on call-site count. It came to ten
lines, and derived the route's address type from the segment lists.

## A caveat it writes for its own design is the verdict on it (×1)

The discomfort and its justification arrive together, and the agent writes the
second: a docstring conceding the defect, a rules file documenting its own
invention's hazards. The concession is accurate — which is what files it as an
accepted cost, and what a reviewer reads as the case for deleting the thing.

**21 September — a tag invented for a word the platform had.** The content
pipeline emitted `content-video-embed`, exported as one constant so the plugin and
the component map agreed by import — carrying two new traps in
`.claude/rules/content.md` and a docstring granting that the invented tags "make
the tree invalid HTML, safe only because nothing stringifies it". _другой набор
аттрибутов, или что?_ — `toJsxRuntime` keys off the tag name, so `video` reaches
the same component, and a raw-HTML `<video>` is covered too. The caveat had been
the finding, filed as a cost.

## The fix it just made is exempt from the check that made it (×1)

The agent runs a lens over the code, produces the fix that lens demanded, and
then holds the fix above the lens. The output of a check is the one place the
check does not reach: the newest code is the least suspected, because it arrived
already wearing the verdict "done."

**21 September — the DRY helper that duplicated itself.** Asked on PR #72 whether
the rehype plugins were DRY against each other, the agent pulled their shared
element-walk into `src/shared/content/hast-elements.ts` — `visitElements` for
edits in place, `replaceElements` for swaps — and listed what it had left
untouched, the two new helpers not on it: they were the fix, so they were clean.
_can replaceElements go through visitElements, handing it index and parent?_ Both
restated `visit(tree, 'element')` and the tag-name test — the repetition just
hunted out of the plugins, now standing twice inside the module built to end it.
`replaceElements` now rides on `visitElements`.

## A constraint a checker enforces earns no prose (×1)

Asked why a thing sits where it does, the agent writes to defend the placement —
a rules bullet, a docstring — when where it may sit is both obvious from
conventions already written down and enforced by a checker in plain view. No
prose is owed: the checker fails the wrong move unread. The trap has two floors —
reaching for a dramatic justification, a wall or needs that don't exist yet, over
the plain reason; and, under it, that the plain reason was not owed either.
Deletion is the repair, not a better sentence: it should not have been written.

**21 September — a rule written to defend a placement nothing needed defending.**
On PR #72, asked why `ContentVideo` (a mapped content component) lives in
`pages/documents/ui/` rather than beside the plugin emitting its `<video>` in
`shared/content`, the bullet on `content.md` gave two reasons: `shared/content`
is `server-only`, so a client island "could never" reach it, and future islands —
a copy button, a lightbox — justified the home. Both fell: the split is bridgeable
by a client-safe barrel, and `ContentVideo` has no `use client` today, so the
agent rewrote the bullet around the plain reason, FSD import direction. _the
bullet is a polar bear_: where a component may live follows from ordinary `fsd.md`
reasoning, and Steiger flags any real violation, so the prose just duplicates the
checker. The fix was to delete the bullet (3ccbff8), not reword it — and the plain
reason had not even held, since Steiger does not forbid the component from
`shared`, which is what defending a rule that shouldn't exist gets you.

## Not bumps

Flagging two words missing from verbatim text is `.claude/rules/writing.md`
doing its job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то — мямлим, рассусоливаем, нудим_, the agent wrote
itself up for repairing that recording's defects instead of asking whether this
was the piece at all. _it was about me (not you) delivering the wrong, foggy
message_. Whether a piece says what its author meant is his alone to make.

**Decisions that were the operator's to make.** Four rounds were filed here and
taken back out: the CV's locale segment, the hook a post leads with, where the
theme toggle sits, and whether it comes from a layout. Only the toggle's _skin_
stayed a bump; an entry removed this way takes its count with it. A fifth never
reached the list: the cost report's default grain, settled as month with
`--by week|day` on request and wanted as all three every run — a taste in output
with nothing in the tree to read it off.

## The two families

Twelve learnings is not a pattern, but they fall in two groups. One is failures to
notice the frame was ours — the prefix list, the checker whose coverage read as the
rule, our own `eslint.config.ts`. The other is the post's more interesting half,
the opposite of a mistake: the output was well-formed, justified and efficient, and
every one of those properties made it wrong. An edit minimal where it was made left
one fact spelled three ways; an account sound at every step stopped anyone opening
the file it described. No "be more careful" catches these — they need a person,
and not always one who knows more.
