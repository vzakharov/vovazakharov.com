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

## What it was handed, it treats as fixed (×40)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 September — a word the vocabulary didn't have.** `docs:` for a change that
documents nothing: the agent weighed three prefixes from the list and never
looked outside it. _Let's introduce "content:"_ — the list is ours. A day later,
weighing the deploy gate, it treated that one-day-old word as a given.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files inlined their params inside a generic, `pnpm type-overlap` ran clean, and
the agent stopped. _consider it covered_ — it scans type aliases only. Applying
the rule by hand next, it put two slices' shared `caseStudyHref?` in
`shared/typings` and went green: the gate has no opinion on layers either.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would better home a schema, the agent built it, hit
`boundaries/dependencies` and declined. _let's rewrite the boundaries._ A week
on it read that policy back as FSD — _именно так shared и должен работать._ The
spec exempts it.

**4 October — one run's circumstances, distilled as the skill.** Writing `/mega`
from PR #57, a game built over ~50 sessions with its operator at hand, the plan
held "feel calls" for him and reviewed through a "player". _"playing" относится
исключительно к играм, /mega ими не ограничен_ — nor to an operator present.
Round two relayed at every bite's end, since one bite had filled one session,
and moved a PR-body cap to characters at this repo's 146 a line, the long lines
the cap exists to stop included.

## An account that explains the code stands in for running it (×16)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 September — a limitation written down instead of tested, twice.** The costs
rule listed "the last turn of a session is never priced" as a gap; _что может
этому помочь?_ — `ls ~/.claude/projects/` answers it. Same round, _is
prices.json verified by anything?_ was one read from "essentially no".

**21 September — a green test for a path production cannot reach.** The ledger's
`subagents` bucket was always zero — the client writes subagent transcripts to
files of their own — and the test passed on sidechain records the agent fed it.
_something's off_ came from the operator: 7% short of the client's usage panel.

**21 September — the PDFs it had just rendered, never opened.** The agent
re-rendered both sites, watched `content:pdf:<site> --check` go green and called
it done. A screenshot came back: the footer sits under the prose, not at the
foot of the sheet. The manifest says the file is current, not that it is right.

## It edits the copy in front of it, not the fact behind it (×15)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Nothing catches the split —
every site reads correctly alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places, all the agent's own work in the same branch; told to add Supabase
and Railway, it edited one. No screenshot shows it: each page was right alone.

**9 September to 4 October — the copy fixed, the source left with the cause.**
Told a squash body has no business carrying an editing-notes paragraph, the
agent wrote the rule into `squash-message/SKILL.md`, adopted from a repo whose
copy still asks for it. _Let's file an issue._ On 2 October it fixed a muthur
bug here and wrote "a fix the source still lacks" into the watermark; on 4
October `/mega` reworded the vendored skills' fixes into itself, issues proposed
and none filed. _why not take it_ — fix, file once.

**21 September — the argument left standing when its reason moved out.** The
Bible's articles moved to their own site and latestageagentic.com's long opening
stayed, no sentence of it made false. _far too much now that the articles are
elsewhere_ — the diff was checked for what it broke, not what it stranded.

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not its defence.

**21–22 September — denials written in the commit that made them denials.**
Moving `DocumentMeta`, the byline docstring closed on "rather than sharing it
sideways", the pre-move state; adding `/feedback` after `/dictation`, the rider
said it posts "on the PR" — not here, where the afterword used to live. Only a
reader of the old tree asks either. _медведь?_, both times.

**21 September — a rule defending a placement nothing needed defending.** Asked
why `ContentVideo` lives in `pages/documents/ui/`, the agent wrote a
`content.md` bullet — a `server-only` wall, future islands — and, when both
fell, rewrote it around FSD import direction. _the bullet is a polar bear_:
`fsd.md` says where a component goes and Steiger fails the wrong move unread.

## Asked for a source, it supplies its own version (×10)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent wrote its own gloss — hours after appending
four bumps to the section it was naming. _take the actual heading._

**17 September — the reason the recording never gave.** The tape says only that
migrations are the exception and the subject niche; the idea file supplied the
why — two correct migrations composing into nonsense — and the article inherited
it as the speaker's. _проблема не в этом._

**23 September — the model it cited, simplified.** Lyric notes anchored on a
whole line, the simplest parse, in a catalogue whose model was genius.com — the
agent's own citation, and a site that anchors a note on a word or phrase. The
operator asked for what the citation already said.

**4 October, round three — "one of the first", written as "the first".** An
unattended `/mega` run must be able to test its own work by hand, building the
means as "one of the first bites" where the app lacks them; the plan made that
the first bite, ahead of any feature. _"ahead of any feature" may be
superfluous_ — the means fit the bite in hand, even written after it. A hint,
hardened into a precondition, argued better than the words it paraphrased.

## Given a form, it fills the form (×7)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._ Nothing
had prompted it — and it does not need saying at all.

**15 and 22 September — a record filled cell by cell.** `SITE_CONFIGS`
satisfies `Record<SiteId, SiteConfig>`, so the second site arrived as the first
with `author`, `social` and `avatar` retyped — _не DRY._ A week on, the music
registry's per-locale fields spelled every title `{ en: 'X', ru: 'X' }`,
identical for all but one release.

**23 September — a note on a line the translation had solved.** The crib gave
"А сейчас вылетит…" as the photographer's "watch the birdie", then kept a note
explaining the Russian. Where the idiom exists in English the translation
carries the reference; the note was there because notes were.

## What it defends in writing, it stops asking about (×5)

A choice made, written up and pinned by a test has three artifacts in front of
it by the time anyone looks, each honest that it was deliberate and silent on
its being right. "It warns where the repo could refuse" asks a future reader for
attention; this buys immunity from the agent's own. A caveat conceding the
defect files it as a cost, and a fix the agent just made arrives already wearing
the verdict "done".

**21 September — a tag invented for a word the platform had.** The content
pipeline emitted `content-video-embed`, with two new traps in `content.md` and a
docstring granting the tags "make the tree invalid HTML". _другой набор
аттрибутов, или что?_ — `toJsxRuntime` keys off the tag name, so `video` reaches
the same component. The caveat had been the finding, filed as a cost.

**21 September — the DRY helper that duplicated itself.** Asked whether the
rehype plugins were DRY, the agent pulled their shared walk into `visitElements`
and `replaceElements` and listed what it had left untouched — not the helpers,
which were the fix. _can replaceElements go through visitElements?_ Both
restated `visit(tree, 'element')` and the tag test.

## It checks the render against its intent, not against the page (×5)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, answerable only from the page.

**17 September — the float fixed, the page passed.** Told to run a drawing beside
the text, the agent floated it, caught unprompted that the float squeezed the
next heading, fixed that, screenshotted and called it good. _выноска стала
лучше, изображение -- хуже_ — against one short paragraph the image outran its
section. The defect being fixed got looked at; the other was only on the page.

**23 September — a size judged where it was designed, shipped where it wasn't.**
The explicit-lyrics badge became a fixed 18px square, right beside the song
page's 48px title. The catalogue list sets the same component at 16px, where it
stood taller than the capitals and read as crooked.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it — a docstring,
a comment, a rule. The explanation is correct, durable and unenforced: it asks a
future reader for attention at the moment they are about to do the thing. A
structure that makes the wrong move fail to build asks nothing of anyone's.

**17 September — +377 kB, written into a docstring.** Asked why
`NEXT_PUBLIC_SITE` is matched against a list rather than parsed with zod, the
agent measured zod's client cost and wrote it into `site-ids.ts`. _нам нужно
сделать .server-only. модуль или бочку._ The barrel makes it a build error.

**21 September — the confusing field, documented rather than made impossible.**
Asked a second time what tells `SiteImage`'s `path` from its `vector`, the agent
pointed at the docstring its first answer had written. _the API still looks
confusing._ The fix was the shape, which leaves prose nothing to disambiguate:
`{ path } & ({ vector: string } | { vector?: never })`.

## Its prose answers the question it had, not the reader's (×3)

Accurate, present-tense and short is the whole of what a prose pass asks, and a
rewrite is held against the points it was meant to carry — so a line answering
the wrong question, or too compressed to give its points back, passes every test.
What a reader stops at that line holding is the thing nothing measures.

**21 September — four comments, four true sentences.** `fsd.md` narrated how
`widgets/` was earned — _археология?_ — where a rule says where a block goes;
`GENERATED_DIR`'s docstring listed contents, not the invariant; `SiteImage`
named `path` and `vector` without why both exist.

**23 September — a metaphor, a squiggle, a live trap read as history.** A prop
comment called the dimmed translation column "held back"; Mantine's `__vars`
carried a CSS variable a plain `style` would; a comment guarding a real trap
read as archaeology until reworded. Each was plain to the agent that wrote it.

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md` doing its
job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то — мямлим, рассусоливаем, нудим_, the agent wrote
itself up for repairing its defects instead of asking whether this was the piece
at all. _it was about me (not you) delivering the wrong, foggy message_.

**Decisions that were the operator's to make.** Four rounds were filed here and
taken back out — the CV's locale segment, the hook a post leads with, where the
theme toggle sits, and whether it comes from a layout — each taking its count
with it. Two never reached the list: the cost report's default grain, and em
dashes on the site for a typed `--`.

**Comments the tree already answered.** A round on the music section asked
whether a quote's capitalization was wrong and whether zod reached the browser
bundle. Neither was: the reviewer's misses stay out of the count, and in the
file, so it is not an ad.

## The two families

Ten learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker whose coverage read
as the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. An account
sound at every step stopped anyone opening the file it described. No "be more
careful" catches these — they need a person, and not always one who knows more.
