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

**8 September — a cost measured against its own earlier choice.** Asked why the
two CV routes could not collapse, the agent priced `/en/cv` inheriting a sibling's
`og:url` — a cost only under an indexing choice it had itself made hours earlier.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would better home a schema, the agent built it, hit
`boundaries/dependencies` and declined. _let's rewrite the boundaries._ A week on,
asked why `shared/ui` cannot reach `shared/seo`, it read the same policy back as
a stricter FSD — _именно так shared и должен работать._ The spec exempts the
layer in one line.

**9 September — a global class read off the globals beside it.** A hover dim went
into `globals.scss` "as the print utilities are" — which are global only because
the pipeline emits them into HTML strings. _why are we bypassing modules?_

**14 September — a sentence that scanned, so the word in it went unquestioned.**
Deepgram heard «ты смотришь на кофе… почти как предзакатное солнце»: it parses,
and a coffee had just been described. The word was «код», the rung the payoff
calls back to — and a mis-hearing that makes sense is the kind nothing flags.

**14 September — the reading that fit the argument went unchecked, twice.**
«Ставить его нам, возможно, будет уже некому» was read as _we will not be here_,
a name recommendation resting on it; told the sense was the other, the agent filed
_the grammar allows only that one_ — also false. Each parse arrived first.

**16 September — the sibling's shape, copied and called consistency.** Told the
header's home link had regressed, the agent spelled the two-anchor fork out a
second time and cited the match with `case-study-link.tsx` as the fix. _может
стоит сделать единый компонент с вилкой._ Same round: `no-redundant-property-copy`
names a `pick` this repo never had — an option, not a missing half.

**16 September — the call sites it was handed, drawn round as the set.** Made to
build the component, the agent stood it _beside_ `InternalLink` as
`PrintableLink` — printability read as a property some links have. _бывают ли у
нас другие link вообще?_ Every internal link carries a relative href.

**17 September — this section, not applied to the file that holds it.** Having
settled that delegating edits here is about session cost and defended it twice,
the agent missed the reason the operator then supplied: an agent that reads the
taxonomy before naming its own failure names it in the headings it just read, so
the count that grows is the one easiest to file under.

**17 September — the criterion's wording, read as the file's purpose.** An error
the agent caught in its own report, nobody else having seen it, was handed over
as a bump on the strength of fitting "could have seen and didn't" exactly. The
operator struck it: the claim this file makes is that the human is necessary, and
the opening paragraph says so, two screens above the line being applied.

**17 September — two stated incapacities, neither retried.** `add_repo` answered
"cross-tier adds are not supported" and the sibling repo went into the report as
out of reach. _перепроверь_ — `gh` read it in the same shell, first try. The same
afternoon an issue asserted the container cannot rasterize a PDF, so a print fix
was verified against the screen rendering, where the reported defect does not
occur; `pip install --target tmp/pdfium pypdfium2` worked first try and the
defect was on page one. A tool's refusal is the environment's edge for exactly as
long as nobody tries a second tool.

**17 September — the drawing the article already used, read as the article's
drawing.** The collection's index wanted one illustration per entry and the
operator named them one by one, «терминатор для precedent» among them; that entry
got the robot preaching from a rock, which is what the article floats beside its
opening text and already carries as its `cardImage`. _для inevitability я просил
терминатора, он повеселее._ The Terminator sat further down the same file, "A
Terminator" opening its alt text — the arrangement in the article answered which
drawing before the instruction naming one was applied.

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

**9 September — the tagline in the catalogue, the tagline in the pixels.** Each
framing got a tagline in `cv-metadata.ts`, the developer one stayed baked into
`ogImage: '/cv_card.png'` below it: `/cv` unfurled CTO beside a DEVELOPER card 🙈.

**9 September — a rename that took its own inventory on trust.** Told the double
`l` in `Labelled` hurt, the agent renamed the type and called the two remaining
mentions "authored prose": there were four, in three files, one a shell variable
the vet run executes. It had searched its own diff.

**14 September — the instruction obeyed, the instruction left standing.** _не надо
ничего перепроверять_, posted on a line of the dictation skill: the agent stopped
re-verifying for that session and left the sentence standing in the skill, where
the next run reads it. A comment on a rule is about the rule.

**17 September — renamed everywhere the name was a path.** `web-not-console`
became `web-not-cli` through the filename, every cross-link and both committed
PDFs; the article's own heading still ended "not from your console". _"...web,
not CLI"_ came back as the fix. The heading is the one place the name is a
sentence, which is the one place a grep for the old slug does not reach.

## An account that explains the code stands in for running it (×10)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**8 September — a redirect nobody had opened.** Asked why unlocalized `/cv` needs
a hand-written redirect file, the agent gave the right reason — no middleware in a
static export — which closed the question before anyone opened the file.

**8 September — the schema it never wrote.** Told route params would parse better
through zod, the agent declined twice: a schema would restate the variant ids —
which `z.enum(CV_VARIANTS)` does from the same const. _Am I missing smth?_

**14 September — no middle option, in a repo holding twenty-eight of them.**
Asked where source recordings live, the agent argued a branch-only video is
collected with the branch. `git ls-remote`: twenty-eight. _я не удаляю ветки_.

**16 September — two objections in one afterword, neither tried.** The megapixel
analogy was faulted for a mechanism the recording states a paragraph above:
_внимание и есть та фиксированная площадь_. The polar-bear widening rested on a
commit that one `git log` shows is a different failure: _я не помню такого_.

**16 September — a cost priced without rendering it.** The header's name went
absolute in both media, the plan ruling out the split its sibling uses as "the
name in the DOM twice". _но тогда и в экранной версии это будет внешняя ссылка?_
Under `print-hidden` the copy weighs nothing: all four PDFs came back identical.

**16 September — the config line it blamed, never varied.** Ruling a flat
`shared/lib/collections.ts` illegal, the agent blamed `src/shared/lib/(*)/**`,
off the config's text. _а у меня из playgramapp такие живут спокойно._ Same
error without it — and that line keeps `class-names` legal.

**19 September — a limitation written down instead of tested, twice in one
review.** The costs rule listed "the last turn of a session is never priced"
among what the totals miss. _что может этому помочь? или это мюнхгаузен?_ —
`ls ~/.claude/projects/` answers it, the container holding only the live
session's transcript. Same round, same shape: _is prices.json verified by
anything?_ was one read from "essentially no", which nothing in the file said.
Naming a gap had stood in for finding out whether it was one.

## It writes its reasoning into the artifact (×9)

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

**14 September — two denials of what the file used to be part of.** The new
afterword skill carried "it applies to anything the operator wrote" and "it is
not the lede", both answering a question only someone who had watched it leave
`/dictation` would ask — with `CLAUDE.md` naming the defect and
`/tend-prose negation` having run over the file. _polar bear_, twice.

**15 September — filed twice where the path says it gets deleted.** The by-hand
steps for standing the second site up went into the plan file, whose whole tree is
swept before the squash — _смотреть в .completed кажется неверно_ — and the
runbook that survived it went under `docs/remove-before-merging/`.

**16 September — the review, transcribed into the file it was about.** Three
afterwords opened on who had said what — «про мегапиксели я был неправ» — so the
thought arrived wrapped in an exchange the reader never saw. _conversational
соображения оставляй исключительно в комментариях_.

**16 September — the footnotes that outlived the pass that needed them.** Every
edit to the three scripts carried a note on what the recording had instead, kept
through three review rounds — a diff against the tape, inside the thing to be
read aloud from. _держать постоянный журнал разницы нет._

**19 September — the defence of a design nobody was proposing.** The costs rule
argued at length why wrapping the harness's Stop hook "is not available"; the
branch had abandoned wrapping for something else entirely, leaving the argument
as its own denial — and the PR body still described the abandoned shape, so one
dropped approach left residue in two places. _медведь_. `/tend-prose` lens 4 is
for exactly this, and the agent that dropped the approach did not sweep.

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

**16 September — a scene credited to a show that has no such scene, then one
that proves the opposite.** Handed House for the close, the agent wrote a tray
of instruments rather than look one up: _погугли, чтобы не хендвейвить поднос_.
The replacement was real — a blind pigeon, a rooftop cistern — and still wrong:
the pigeon was blind like the patient, so it is deduction, not epiphany.

**16 September — a specimen of agent prose no agent would write.** Told the
rule's example needed no context, the agent supplied «Лифт не просто сломан — на
нём ещё и не подняться», which demonstrates the tautology by being one: _так
всё-таки и агент не напишет :)_

**17 September — the cause given, replaced by the cause visible.** The request
for the rule delegating edits here named its cost — «бесконечные раунд-трипы с
вырезанием по крошке» — and the committed rule gave the cost as the 296-line
read. _ну вообще нет, большая часть -- это бесконечные раунд-трипы._ A cause the
agent can point at outranks the one it was handed, and the prompt was still open.

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

**8 September — three glosses invented to fill three slots.** Two of the home
page's glosses on old side projects came back corrected to things no reading of
the repos would produce — _chatgpt before chatgpt_ — and a fourth card listed
TypeScript and FSD for a boilerplate with neither.

**15 September — a record with a row per site, filled cell by cell.**
`SITE_CONFIGS` satisfies `Record<SiteId, SiteConfig>`, so the second site
arrived as the first with four fields changed and `author`, `social` and
`avatar` retyped. The type went green: every cell had a value. _не DRY._

**15 September — the definition inside the rule against defining it.** The brief
was one paragraph on the voice, explicitly left to be found in review. It came
back defining the irony in three clauses. _and here you are, explaining it :)_

## It checks the render against its intent, not against the page (×4)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, and only the second one is
answerable from the intent.

**8 September — the logos it had already looked at.** The agent screenshotted
three new organisation marks in both schemes and reported them legible and
aligned. _the logos are slightly mis-aligned_: one filled its canvas
edge-to-edge, another was inset a fifth.

**9 September — the card it had just fixed, looked at and passed.** Rendering
one card per framing off the catalogue, the agent checked the property it had
set itself and confirmed it held. The same image showed a plate two thirds empty
with no way to reach the person on it: _the prose itself says nothing_.

**16 September — nine link targets dumped, one question asked of them.** Read for
what the issue named — `localhost`, twice — the dump also said which seven were
fine. _все линки открываются норм_ got two rounds of theory it had already answered.

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

Eight learnings is not a pattern, but they fall in two groups. One is failures to
notice the frame was ours — the prefix list, the checker whose coverage read as
the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. An edit
minimal where it was made left one fact spelled three ways; an account sound at
every step stopped anyone opening the file it described. No "be more careful"
catches these — they need a person, and not always one who knows more.
