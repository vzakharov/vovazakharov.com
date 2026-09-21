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
agent had settled — `CLAUDE.md` § "GitHub comments" carries the rule, and why
the entry is written before the session forgets what it worked from. **The file
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

## What it was handed, it treats as fixed (×23)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The failure is
invisible because the reasoning inside the frame is sound — a second agent
checking it would pass. The human's move is to change the given.

**6 September — a word the vocabulary didn't have.** `docs:` for a change that
documents nothing: the agent weighed three candidates from the list and never
looked outside it. _Let's introduce "content:"_ — the list is ours. A day later,
having added it, the agent framed tripping the deploy gate as a trade with no
clean answer: the word was one day old and already a given.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files inlined their params inside a generic, `pnpm type-overlap` ran clean, and
the agent stopped. _consider it covered_ — it scans type aliases only. Applying
the rule by hand next, it put two slices' shared `caseStudyHref?` in
`shared/typings` and went green: the gate has no opinion on layers either.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would better home a schema, the agent built it, hit
`boundaries/dependencies` and declined. _let's rewrite the boundaries._ A week on,
asked why `shared/ui` cannot reach `shared/seo`, it read the same policy back as
a stricter FSD — _именно так shared и должен работать._ The spec exempts the
layer in one line.

**14 September — a sentence that scanned, so the word in it went unquestioned.**
Deepgram heard «ты смотришь на кофе… почти как предзакатное солнце»: it parses,
and a coffee had just been described. The word was «код», the rung the payoff
calls back to — and a mis-hearing that makes sense is the kind nothing flags.

**17 September — two stated incapacities, neither retried.** `add_repo` answered
"cross-tier adds are not supported" and the sibling repo went into the report as
out of reach. _перепроверь_ — `gh` read it in the same shell, first try. The same
afternoon an issue asserted the container cannot rasterize a PDF, so a print fix
was verified against the screen rendering, where the reported defect does not
occur; `pip install --target tmp/pdfium pypdfium2` worked first try and the
defect was on page one. A tool's refusal is the environment's edge for exactly as
long as nobody tries a second tool.

## It edits the copy in front of it, not the fact behind it (×10)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Nothing catches the split —
every site reads correctly alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places, all the agent's own work in the same branch; told to add Supabase
and Railway, it edited one. No screenshot shows it: each page was right alone.

**9 September — the rule fixed in the copy, not in the source.** Told a squash
body has no business carrying a "things to know when editing here" paragraph, the
agent wrote two rules into `squash-message/SKILL.md` and closed the round — a
skill adopted from a repo whose copy still asks for it. _Let's file an issue._

**17 September — renamed everywhere the name was a path.** `web-not-console`
became `web-not-cli` through the filename, every cross-link and both committed
PDFs; the article's own heading still ended "not from your console". _"...web,
not CLI"_ came back as the fix. The heading is the one place the name is a
sentence, which is the one place a grep for the old slug does not reach.

## An account that explains the code stands in for running it (×9)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**8 September — a redirect nobody had opened.** Asked why unlocalized `/cv` needs
a hand-written redirect file, the agent gave the right reason — no middleware in a
static export — which closed the question before anyone opened the file.

**8 September — the schema it never wrote.** Told route params would parse better
through zod, the agent declined twice: a schema would restate the variant ids —
which `z.enum(CV_VARIANTS)` does from the same const. _Am I missing smth?_

**16 September — the config line it blamed, never varied.** Ruling a flat
`shared/lib/collections.ts` illegal, the agent blamed `src/shared/lib/(*)/**`,
off the config's text. _а у меня из playgramapp такие живут спокойно._ Same
error without it — and that line keeps `class-names` legal.

## It writes its reasoning into the artifact (×8)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, and never
content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here" — every item true, every one
belonging in a rules file. The body had accreted across refreshes, which is how a
cap gets walked past one push at a time.

**16 September — the review, transcribed into the file it was about.** Three
afterwords opened on who had said what — «про мегапиксели я был неправ» — so the
thought arrived wrapped in an exchange the reader never saw. _conversational
соображения оставляй исключительно в комментариях_.

## Asked for a source, it supplies its own version (×8)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent wrote its own gloss — hours after appending
four bumps to the section it was naming. _take the actual heading._

**16 September — a rule cited to a document that never stated it.** An afterword
grounded its objection in «по "библии" проверяемое важнее красивого» — a phrase
written a line earlier and cited as settled the next. _это откуда, мы где-то так
уже заявили?:)_ An invented rule argues better, having nothing to contradict it.

**17 September — the reason the recording never gave.** The tape says only that
database migrations are the exception and that the subject is niche. The idea
file written from it supplied the why — two individually correct migrations
composing into nonsense — and the article written later inherited that as the
speaker's. _проблема не в этом … обе напишут миграцию 0080._ Nothing downstream
of the idea file can tell a supplied reason from a heard one.

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

## It checks the render against its intent, not against the page (×4)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, and only the second one is
answerable from the intent.

**8 September — the logos it had already looked at.** The agent screenshotted
three new organisation marks in both schemes and reported them legible and
aligned. _the logos are slightly mis-aligned_: one filled its canvas
edge-to-edge, another was inset a fifth.

**17 September — the float fixed, the page passed.** Told to run a drawing beside
the text, the agent floated it, caught unprompted that the float squeezed the
following heading into the margin, fixed that generally, screenshotted and called
the change good. _выноска стала лучше, изображение -- хуже_ — against one short
paragraph the image outran its own section. The catch and the miss were the same
act of looking: one defect was the thing being fixed, the other only on the page.

## It warns where the repo could refuse (×1)

A decision the agent wants to survive, it secures by explaining it — a docstring,
a comment, a rule — carrying the evidence that justifies it. The explanation is
correct, durable and unenforced: it asks a future reader to read it at the moment
they are about to do the thing. A structure that makes the wrong move fail to
build asks nothing of anyone's attention, and the agent reaches for it when told.

**17 September — +377 kB, written into a docstring.** Asked why
`NEXT_PUBLIC_SITE` is matched against a list of ids rather than parsed with a
schema, the agent measured zod through the client chain and put the number in
`src/shared/config/site-ids.ts`, so nobody would revisit the decision on
intuition. _нам нужно сделать .server-only. модуль или бочку._ The barrel makes
the same mistake a build error.

## A caveat it writes for its own design is the verdict on it (×1)

The discomfort and the justification for it arrive together, and the agent
writes the second: a docstring conceding the defect, a rules file documenting
the hazards of its own invention. The concession is accurate, which is what lets
it be filed as an accepted cost — and it is the sentence a reviewer reads as the
case for deleting the thing.

**21 September — a tag invented for a word the platform had.** The content
pipeline emitted `content-video-embed`, exported as one constant so the plugin
and the component map agreed by import: the design's centrepiece, carrying two
new traps in `.claude/rules/content.md` and a docstring granting that the
invented tags "make the tree invalid HTML, which is safe only because nothing
stringifies it". _другой набор аттрибутов, или что?_ — `toJsxRuntime` keys off
the tag name, so `video` reaches the same component, and now a `<video>` typed
as raw HTML is covered too. The caveat had been the finding, filed as a cost.

## The fix it just made is exempt from the check that made it (×1)

The agent runs a lens over the code, produces the fix that lens demanded, and
then holds the fix above the lens. The output of a check is the one place the
check does not reach: the newest code is the least suspected, because it arrived
already wearing the verdict "done."

**21 September — the DRY helper that duplicated itself.** Asked on PR #72 whether
the rehype plugins were DRY against each other, the agent pulled their shared
element-walk into `src/shared/content/hast-elements.ts` — `visitElements` for
edits in place, `replaceElements` for swaps — and wrote out an explicit list of
what it had deliberately left untouched, the two new helpers not on it: they were
the fix, so they were clean. _can replaceElements go through visitElements,
handing it index and parent?_ Both had restated `visit(tree, 'element')` and the
tag-name test — the exact repetition just hunted out of the plugins, standing
twice inside the module built to end it. `replaceElements` now rides on
`visitElements`.

## A constraint a checker enforces earns no prose (×1)

Asked why a thing sits where it does, the agent writes to defend the placement —
a rules bullet, a docstring — when where it may sit is both obvious from
conventions already written down and enforced by a checker in plain view. No
prose is owed: the checker fails the wrong move unread, and the convention
decides the case unrestated. The trap has two floors. The first is reaching for
a dramatic justification — a wall, needs that don't exist yet — over the plain
one. The second, under it, is that the plain reason was not owed either:
supplying a better sentence is not the repair. Deletion is, because the sentence
should not have been written.

**21 September — a rule written to defend a placement nothing needed defending.**
On PR #72, asked why `ContentVideo` (a mapped content component) lives in
`pages/documents/ui/` rather than beside the plugin emitting its `<video>` in
`shared/content`, the bullet on `content.md` gave two reasons: `shared/content`
is `server-only`, so a client island "could never" be imported from it, and
future islands — a copy button, a lightbox — justified the home. Both fell — the
server-only split is bridgeable by a client-safe barrel, and `ContentVideo` has
no `use client` today — so the agent rewrote the bullet around the plain reason,
FSD import direction. _the bullet is a polar bear_: where a component may live
follows from ordinary FSD reasoning in `fsd.md`, and Steiger flags any real
violation, so spelling it out duplicates the checker and documents the obvious.
The fix was to delete the bullet (3ccbff8), not to reword it. The plain reason
had not even held cleanly — Steiger does not forbid the component from
`shared` — which is what inventing a justification for a rule that shouldn't
exist gets you.

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
stayed a bump; an entry removed this way takes its count with it.

## The two families

Ten learnings is not a pattern, but they fall in two groups. One is failures to
notice the frame was ours — the prefix list, the checker whose coverage read as
the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. An edit
minimal where it was made left one fact spelled three ways; an account sound at
every step stopped anyone opening the file it described. No "be more careful"
catches these — they need a person, and not always one who knows more.
