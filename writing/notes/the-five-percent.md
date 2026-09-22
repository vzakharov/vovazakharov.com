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
  supplied a decision that was the human's to take, it goes under "Not bumps" or
  nowhere: a file that counts every correction reads as an agent grading its own
  obedience. **And a human has to be in it**: a mistake the agent caught by itself
  clears that line and still demonstrates the opposite of what the file claims.
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

## What it was handed, it treats as fixed (×27)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 September — a word the vocabulary didn't have.** `docs:` for a change that
documents nothing: the agent weighed three candidates from the list and never
looked outside it. _Let's introduce "content:"_ — the list is ours. A day later
the agent framed tripping the deploy gate as a trade with no clean answer: the
new word was one day old and already a given.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files inlined their params inside a generic, `pnpm type-overlap` ran clean, and
the agent stopped. _consider it covered_ — it scans type aliases only. Applying
the rule by hand next, it put two slices' shared `caseStudyHref?` in
`shared/typings` and went green: the gate has no opinion on layers either.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would better home a schema, the agent built it, hit
`boundaries/dependencies` and declined. _let's rewrite the boundaries._ A week on,
asked why `shared/ui` cannot reach `shared/seo`, it read the same policy back as
a stricter FSD — _именно так shared и должен работать._ The spec exempts it.

**21 September — the layer this tree doesn't have, left out of the candidates.**
Asked whether `DocumentMeta` is shared or an entity, the agent argued it stays by
eliminating over `{shared/ui, widgets}` — the set the tree offers, `entities/`
being empty — and presented that as the whole space searched. _FSD nowhere
requires an entity to have a model._ The sentence granting the absent layer is
the agent's own, in that same file.

**21 September — a disagreeing figure, never asked whether it was one figure.**
The usage panel showed $110.52 for a session whose transcript topped out at
$40.86; the agent chased it hard and reported honestly that it could not
reconcile the gap. The next screenshot showed the panel disagreeing with
_itself_ — "Cost $198.49" beside its own breakdown's "Total $47.04". There was
never one number to reconcile against, and widen-the-frame went to the agent's
own code rather than to the source measuring it.

## An account that explains the code stands in for running it (×15)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 September — a limitation written down instead of tested, twice in one
review.** The costs rule listed "the last turn of a session is never priced"
among what the totals miss; _что может этому помочь?_ — `ls ~/.claude/projects/`
answers it, the container holding only the live session's transcript. Same round:
_is prices.json verified by anything?_ was one read from "essentially no".

**21 September — a green test for a code path production cannot reach.** The
ledger's `subagents` bucket was structurally always zero — the client writes
subagent transcripts to a file of their own — and the test passed because the
agent fed it sidechain records the main transcript never carries. _something's
off_ came from the operator: 7% short against the client's own usage panel. Those
transcripts carry the client's running cost, in lines written up as unverifiable.

**21 September — the placement argued from the markup, never rendered.** The end
seal rode the last sentence's punctuation, and the plugin carried a two-branch
special case so it could append inside a final paragraph and fall back to its own
line after a list. _on its own line, centred — clumsy in the text_ deleted all of
it. The case was argued from what inline means in compiled HTML, `/preview`
unrun, and the special case was the tell, read as thoroughness.

**21 September — the PDFs it had just rendered, never opened.** Moving the end
mark to its own line re-flagged every document, so the agent re-rendered both
sites, watched `content:pdf:<site> --check` go green and called the round done. A
screenshot came back of a last page: the footer sits under the prose, not at the
foot of the sheet. The manifest says the file is current, not that it is right.

## It edits the copy in front of it, not the fact behind it (×11)

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

**21 September — the argument left standing when its reason moved out.** The
Bible's articles moved to a site of their own and latestageagentic.com's long
opening argument stayed as written: nothing in the diff made a sentence of it
false. _far too much now that the articles are elsewhere._ What earned the length
had left with them — the change was checked for what it broke, not what it
stranded.

## It writes its reasoning into the artifact (×11)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, and never
content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here" — every item true, every one
belonging in a rules file, accreted across refreshes one push at a time.

**21 September — a clause denying the arrangement the move had ended.** Moving
`DocumentMeta` into `entities/document`, the byline docstring closed on "both
reach down to it rather than sharing it sideways" — the sideways-sharing being the
pre-move state, which no reader of the current tree would reach for. _медведь?_
The negation was authored in the same commit that made it one.

**17 September — the lesson written down twice, in one change.** The i18n rule's
new paragraph argued that the constraint is about the data, not the renderer —
the reasoning the same commit had already put in the `MESSAGE_MARKDOWN`
docstring — and then closed by denying an alternative the constraint above it
rules out. _медведь или по крайней мере сильно сократить._

## Asked for a source, it supplies its own version (×8)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent wrote its own gloss — hours after appending
four bumps to the section it was naming. _take the actual heading._

**17 September — the reason the recording never gave.** The tape says only that
database migrations are the exception and that the subject is niche. The idea
file written from it supplied the why — two correct migrations composing into
nonsense — and the article inherited that as the speaker's. _проблема не в этом._
Nothing downstream of the idea file tells a supplied reason from a heard one.

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
different question from whether it happened, answerable only from the page.

**17 September — the float fixed, the page passed.** Told to run a drawing beside
the text, the agent floated it, caught unprompted that the float squeezed the
following heading into the margin, fixed that generally, screenshotted and called
the change good. _выноска стала лучше, изображение -- хуже_ — against one short
paragraph the image outran its own section. The catch and the miss were the same
act of looking: one defect was the thing being fixed, the other only on the page.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it — a docstring,
a comment, a rule. The explanation is correct, durable and unenforced: it asks a
future reader for attention at the moment they are about to do the thing. A
structure that makes the wrong move fail to build asks nothing of anyone's.

**17 September — +377 kB, written into a docstring.** Asked why
`NEXT_PUBLIC_SITE` is matched against a list of ids rather than parsed with zod,
the agent measured zod through the client chain and put the number in
`src/shared/config/site-ids.ts`, so nobody would revisit it on intuition. _нам
нужно сделать .server-only. модуль или бочку._ The barrel makes it a build error.

**21 September — the confusing field, documented rather than made impossible.**
Asked a second time what tells `SiteImage`'s `path` from its `vector`, the agent
had answered the first ask by writing the distinction into the type's docstring,
and treated the having-to-ask as the finding that note discharged. _the API still
looks confusing._ The fix was the shape —
`{ path } & ({ vector: string } | { vector?: never })` — leaving prose nothing to
disambiguate.

## What it defends in writing, it stops asking about (×2)

A choice made, then written up, then pinned by a test has three artifacts in
front of it by the time anyone looks, each honest that the choice was deliberate
and silent on its being right. The section above asks a future reader for
attention it will not get; this one buys immunity from the agent's own.

**21 September — a parameter, its docstring, and the test pinning it.** `oneOf`
took a third argument, `subject`, so a failed check could name what was being
read; a docstring justified it and a test asserted it reached the message. _drop
it_ — `vova, lsa` identifies the site variable as plainly as its name does.

**21 September — a rationale in a docstring, read back as a requirement.**
`SITE_CONFIGS` is `as const satisfies`, its docstring saying why: `satisfies`
keeps the literal types every call site reads. So a vector-less site has no
`vector` key and `render-og.ts` cannot destructure `avatar` without widening it —
argued twice, each round on which widening. _пусть будет
`const SITE_CONFIGS: Record<SiteId, SiteConfig>`?_ Nothing reads a literal, and
the premise was the agent's own earlier sentence.

## Its prose answers the question it had, not the reader's (×1)

Accurate, present-tense and short is the whole of what a prose pass asks, so a
line answering the wrong question passes every one of them. Which question a
reader stops at that line holding is the thing nothing measures.

**21 September — four comments, four true sentences.** `.claude/rules/fsd.md`
narrated how `widgets/` came to be earned — _археология?_ — where a rule says
where a block goes. `GENERATED_DIR`'s docstring gave the directory's contents,
not the invariant that an output read back as an input never settles. `SiteImage`
named `path` and `vector` without why both exist, and the first move on _what's
the difference_ was to rename `path` — one site keeps an SVG there.

## A required change launders the unrequired one beside it (×1)

One part of an edit is forced — a type that won't otherwise hold, a rename the
compiler demands — and the agent lets it stand for the whole. The necessary part
is defended and the rest rides in unexamined, so an edit that survives the
question reads as minimal. Whether a form that changed less would do goes unasked.

**21 September — the annotation bought with the destructuring.** `SiteImage`'s
widening genuinely needs the annotation, so the agent rewrote the destructuring
as `const avatar: SiteImage = siteConfig(RENDERED_SITE).avatar` and defended it
in the commit body. _why abandon the destructuring at all?_ —
`const { avatar }: SiteConfig = siteConfig(RENDERED_SITE)` widens the same and
keeps it. The half under question was defended; the whole edit read as settled.

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
reached the list: the cost report's default grain, settled as month and wanted as
all three grains every run — a taste in output with nothing to read it off.

## The two families

Fourteen learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker whose coverage read
as the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. An account
sound at every step stopped anyone opening the file it described. No "be more
careful" catches these — they need a person, and not always one who knows more.
