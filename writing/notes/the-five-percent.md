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
the entry is written before the session forgets what it worked from.

**This file has an end.** Once row 18 is drafted and posted, it retires with the
rule that feeds it. Everything durable belongs where the code can see it — a
rule under `.claude/rules/`, a line in `CLAUDE.md` — whether or not it lands here.

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
  correction reads as an agent grading its own obedience.
- **Someone's own material is not a review surface.** Where the only thing the
  agent could have known was in the author's head, a correction is him supplying
  facts, not a miss, and it goes nowhere. "Not bumps" holds the case it came from.
- **Past 400 lines, squeeze instead of growing**, which
  `scripts/check-notes-length.sh` fails the vet run over. In order: tighten the
  prose; then cut archaeology, a bump needing the shortest account that still
  shows what the agent could not see; then drop learnings from the bottom, since
  one bump is a coincidence with a paragraph attached.

## What it was handed, it treats as fixed (×17)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it takes a
given for an inevitability, aka the **inevitability fallacy**. The failure is
invisible because the reasoning inside the frame is sound — a second agent
checking it would pass. The human's move is to change the given.

**6 September — a word the vocabulary didn't have.** `docs:` for a change that
documents nothing: the agent weighed three candidates from the list and never
looked outside it. _Let's introduce "content:"_ — the list is ours.

**7 September — a word one day old, already treated as given.** Having added
`content:`, the agent framed whether it trips the deploy gate as a trade with no
clean answer. The reply dissolved it: `content:` is _specifically_ for what isn't
published yet, and a piece going live arrives as the page serving it.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files inlined their params inside a generic, `pnpm type-overlap` ran clean, and
the agent stopped. _type-overlap doesn't cover this, but consider it covered_: it
scans type aliases only, known from the README and read as the rule's boundary.

**8 September — the same hole, opened by the fix for it.** Applying that rule,
the agent found `caseStudyHref?` declared by cards in two sibling slices, put the
base in `shared/typings` and went green. _not domain-less; if it's a question of
import directionality, suggest introducing a case study entity_ — the gate has no
opinion on which layer a shared base belongs to, so green was the whole evidence.

**8 September — a cost measured against its own earlier choice.** Asked why the
two CV routes could not collapse into one catch-all, the agent priced `/en/cv`
inheriting `og:url: /en/cv/cto` — a cost only if `/en/cv` is the indexed address,
which the agent itself had decided hours earlier. _I'd likely prefer the latter._

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would better home a schema, the agent built it, hit
`boundaries/dependencies`, priced widening `PUBLIC_API` repo-wide and declined.
_if "boundaries don't allow" is the only argument, let's rewrite the boundaries._

**9 September — a note on the site's controls, read as a rule about everything
clickable.** The theme toggle kept `variant="default"` (`theme.ts`: "the site's
only control skin"), so a hairline box fenced off empty space — around a thing
the agent had just called furniture. _let's remove the borders_.

**9 September — a global class read off the globals beside it.** A hover dim went
into `globals.scss` "as the print utilities are" — which are global only because
the pipeline emits them into HTML strings. _why are we bypassing modules?_

**11 September — its own spelling, then the operator's typo, both taken as
given.** The agent had named the sync skill `/sync-agent-infra`. Told the source
renamed its copy `/update-muthur`, it proved the rename need not travel and read
that as licence to keep its own; then it defended the operator's typo too.

**14 September — a sentence that scanned, so the word in it went unquestioned.**
Deepgram heard «ты смотришь на кофе… он красивый, почти как предзакатное солнце»:
it parses, and a coffee on a rock had just been described. The word was «код»,
the rung the payoff calls back to. The low-confidence list flags what the
recognizer doubted; a mis-hearing that makes sense is the kind it cannot.

**14 September — the reading that fit the argument went unchecked, twice.**
«Ставить его нам, возможно, будет уже некому» was read as _we will not be here_,
a name recommendation resting on it; told the sense was the other, the agent
filed _the grammar allows only that one_ — also false. Each parse arrived first.

**14 September — the one caller's shape, written into a general skill.** The
afterword skill kept what its extraction from `/dictation` had held: the Russian
heading as _the_ heading, a purpose no wider than a two-voice post.

**15 September — the plan, read as where a change gets written down.** The
by-hand steps for standing the second site up went into the plan file, whose
whole tree `CLAUDE.md` says is swept before the squash. _смотреть в .completed
кажется концептуально неверно_ — never which document, only which section.

**15 September — findings filed where the path says they get deleted.** The
runbook for the second site carried GitHub's Pages addresses, the 409 a
self-enabling `gh-pages` answers and the form reading its inputs off the default
branch — all under `docs/remove-before-merging/`. _давай экстрагируем._

**15 September — a vet line inherited, and its bucket never questioned.** The
sync added `test_export_split.py` beside the `test_authorship.py` already in the
fan-out, so the question was how to name two lines, never whether either belonged.
The catalog answers in a column — both are `never`. muthur#82 has why.

**16 September — the example's unit, held fixed across two rewrites.** Told the
rule's specimen didn't demonstrate it, the agent replaced it twice, both times
putting X and Y in one sentence. _изначальная дихотомия была на уровень выше_ —
the repeat was between two sentences, which no swap inside one could show.

## It edits the copy in front of it, not the fact behind it (×9)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Nothing catches the split —
every site reads correctly alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places, all the agent's own work in the same branch; told to add Supabase
and Railway, it edited one. No screenshot shows it: each page was right alone.

**9 September — the rule fixed in the copy, not in the source.** Told a squash
body has no business carrying a "things to know when editing here" paragraph, the
agent wrote two rules into `squash-message/SKILL.md` and closed the round — that
skill is adopted from a repo whose copy still asks for it. _Let's file an issue._

**9 September — a test written and not run over the file it was for.** The same
round added the test above (a bump is what the agent could have seen and didn't)
and ran it against the entry at hand alone. _Do the others de-qualify?_ One did.

**9 September — the tagline in the catalogue, the tagline in the pixels.** Each
framing got a tagline in `cv-metadata.ts`, the developer one stayed baked into
`ogImage: '/cv_card.png'` below it: `/cv` unfurled CTO beside a DEVELOPER card 🙈.

**9 September — a rename that took its own inventory on trust.** Told the double
`l` in `Labelled` hurt, the agent renamed the type and called the two remaining
mentions "authored prose" — wrong on both counts: four occurrences in three
files, one a shell variable the vet run executes. It had searched its own diff.

**14 September — the instruction obeyed, the instruction left standing.** _не надо
ничего перепроверять_, posted on a line of the dictation skill: the agent stopped
re-verifying for that session and left the sentence ordering it standing in the
skill, where the next run reads it. A comment on a rule is about the rule.

**14 September — the correction landed on the line it was raised on.** _читатель
получит понимание как не надо делать агентский кодинг_, raised on the first
dictation and written into that file alone: the project plan, written the same
hour, went on opening "the subject is … what the human is still for".

**15 September — the description widened, the globs left behind.** Moving the
router under `apps/`, the agent rewrote the content rule's description to
`apps/<site>/public/` and left its `paths:` matching `apps/vova/` only — the
claim four lines above the mechanism contradicting it. _нужно сделать sweep._

**15 September — em dashes, a day after being told.** _нет, все равно --_ was
settled against a Russian draft, so the English copy next day came out in them.

## An account that explains the code stands in for running it (×7)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**8 September — a redirect nobody had opened.** Asked why unlocalized `/cv` needs
a hand-written redirect file, the agent gave the right reason — no middleware in a
static export — which closed the question before anyone opened the file.

**8 September — the schema it never wrote.** Told route params would parse better
through zod, the agent declined twice: a schema would restate the variant ids —
which `z.enum(CV_VARIANTS)` does from the same const. _Am I missing smth?_ Nobody
had the measurement it displaced: zod costs the CV 89 kB gzipped.

**9 September — four homes, three of them checked.** Cutting a maintenance
paragraph from a commit body, the agent argued each item already sits where it
would be looked for. The right test, unrun: the fourth sat nowhere else.

**14 September — no middle option, in a repo holding twenty-eight of them.**
Asked where source recordings live, the agent argued a branch-only video is
collected with the branch. `git ls-remote`: twenty-eight. _я не удаляю ветки_.

**14 September — a test whose counterexample sat in the diff proposing it.** The
dictation skill got a rule against drifting into prose: every sentence should be
findable in the recognizer's output. Never run against the transcripts beside
it, where «научный не обязательностью» had become «наученный необязательностью».

**15 September — an objection never tried against `import type`.** The site id
stayed a bare string in `siteNextConfig`, its docstring giving the reason:
importing it runs `shared/config`'s check before anything sets the variable.
True of a value import. _разве оно относится к `import type`?_ One build away.

**16 September — two objections in one afterword, neither tried.** The megapixel
analogy was faulted for a mechanism the recording states a paragraph above:
_внимание и есть та фиксированная площадь_. The polar-bear widening rested on a
commit that one `git log` shows is a different failure: _я не помню такого_.

## It writes its reasoning into the artifact (×7)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it, and that is never the record of how it was chosen.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not its defence.

**7 September — the commit body that documented the deploy gate.** The squash
message explained the new prefix and its place in the gate, plus two notes
recording the call and offering the veto — all true, all cut. A ride-along given
a paragraph in a body read by someone scanning the log reads as the point of it.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here" — every item true, every one
belonging in a rules file or a docstring. The body had accreted across refreshes,
which is how a cap gets walked past one push at a time.

**14 September — two denials of what the file used to be part of.** The new
afterword skill carried "it applies to anything the operator wrote" and "it is
not the lede", both answering a question only someone who had watched it leave
`/dictation` would ask — with `CLAUDE.md` naming the defect and
`/tend-prose negation` having run over the file. _polar bear_, twice, then a third
next day: the voice rule ruling `--` out of site copy nobody had asked about.

**16 September — the review, transcribed into the file it was about.** Three
afterwords opened on who had said what — «про мегапиксели я был неправ» — so the
thought arrived wrapped in an exchange the reader never saw. _давай
conversational соображения оставляй исключительно в комментариях_. The thought
is durable; the conversation belongs in the thread that held it.

**16 September — the footnotes that outlived the pass that needed them.** Every
edit to the three scripts carried a note on what the recording had instead, kept
through three review rounds: a diff against the tape, inside the thing to be read
aloud from. _держать постоянный журнал разницы vs запись запроса нет._ A note
earns its place on the first pass and expires with the round that settles it.

## Asked to quote a source, it writes its own version (×6)

Holding the file open, the agent still writes its own version. The paraphrase
improves something, so nothing stops it; what goes is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent wrote its own gloss — hours after appending
four bumps to the section it was naming. _take the actual heading._

**16 September — a rule cited to a document that never stated it.** An afterword
grounded its objection in «по "библии" проверяемое важнее красивого» — a phrase
written a line earlier and cited as settled the next. _это откуда, мы где-то так
уже заявили?:)_ An invented rule argues better, having nothing to contradict it.

**16 September — a scene credited to a show that has no such scene, then one
that proves the opposite.** Handed House for the recording's close, the agent
wrote a tray of instruments rather than look one up: _погугли, чтобы не
хендвейвить поднос_. The replacement was searched for and real — a blind pigeon,
a rooftop cistern — and still wrong: the pigeon was blind like the patient, so
it is deduction, not epiphany. That an example exists is not that it fits.

**16 September — four idea files, each holding the agent's idea.** Every «об
этом позже» in the recordings got a paragraph under `ideas/`, and three of four
came back corrected: one argued from a reason he does not hold, one made an
article of an aside meant as a proto-idea, one hung its piece on the argument it
sat next to. A destination written off one remark fills with its author.

**16 September — a specimen of agent prose no agent would write.** Told the
rule's example needed no context, the agent supplied «Лифт не просто сломан — на
нём ещё и не подняться», which demonstrates the tautology by being one: _так
всё-таки и агент не напишет :)_. A defect staged past where it occurs stops
being evidence that it occurs.

## Given a form, it fills the form (×5)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._ Nothing had
prompted it. The reply: sometimes I want to write in Russian, and this doesn't
need saying at all — we'll see case by case.

**8 September — three glosses invented to fill three slots.** Two of the home
page's one-line glosses on old side projects came back corrected to things no
reading of the repos would produce — _a BYOK AI-first text processor_, _chatgpt
before chatgpt_ — and a fourth card listed TypeScript and FSD for a boilerplate
with neither. Confident sentences about his own work, in slots offering no blank.

**14 September — a default under a rule that says to ask.** Asked for a flag
choosing whether a dictation is transcribed verbatim or rendered as prose, the
agent wrote "ask which one when the invocation doesn't say" and marked one mode
`(default)` two lines above it, because a table of modes has a default column.
The default is what makes the question skippable: _не должно быть дефолта_.

**15 September — a record with a row per site, filled cell by cell.**
`SITE_CONFIGS` satisfies `Record<SiteId, SiteConfig>`, so the second site
arrived as the first with four fields changed and `author`, `social` and
`avatar` retyped. The type went green: every cell had a value. _не DRY._

**15 September — the definition inside the rule against defining it.** The brief
was one paragraph on the voice, explicitly left to be found in review rather
than handed over complete. The paragraph came back defining the irony in three
clauses. _and here you are, explaining what "Terry Pratchett-ish irony" means :)_

## It settles a constraint in prose where a mechanism was available (×2)

A constraint the agent can't see how to enforce, it writes down. The note is
accurate, sits on the right module, and is invisible to the edit that violates it
— nothing reads a docstring on its way to moving a file. Prose is always
available; whether a mechanism also was never gets asked.

**9 September — "keep them out of `shared/i18n`".** Having measured that a zod
schema in the i18n barrel costs the CV's client bundle 89 kB gzipped, the agent
filed it elsewhere and wrote the finding into a docstring telling the next person
not to move it. The round produced `import 'server-only'` instead, which turns the
same mistake into a build error — as every module under `shared/content` does.

**9 September — the ceiling this file states, walked past by the append that
states it.** "Past ~400 lines, squeeze instead of growing" is a bullet in the
section above; the agent added a section and pushed the file to 447 lines, having
read the bullet on the way in. _let's put a vet.sh-controlled check_.

## It checks the render against its intent, not against the page (×2)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, and only the second one is
answerable from the intent.

**8 September — the logos it had already looked at.** The agent screenshotted
three new organisation marks in both schemes and reported them legible and
aligned. _the logos are slightly mis-aligned_: one filled its canvas edge-to-edge,
another was inset a fifth. The question asked of the screenshot was "are they
there".

**9 September — the card it had just fixed, looked at and passed.** Rendering
one card per framing off the catalogue, the agent checked the property it had set
itself — the card can no longer say what the page stopped saying — and confirmed
it held. The same image showed a plate two thirds empty with no way to reach the
person on it: _the prose itself says nothing_, add GitHub and LinkedIn.

## A published number is not a verified number (×2)

A figure already in print reads as settled, so the agent stops at it. Whoever
made it remembers what went in — which window, which denominator, what was
excluded — and none of that is recoverable from the number itself.

**6 September — 6.2 → 8.2 units of work per day.** Lifted from the case study
into a backlog row as a post's headline. Both windows are drawn wrong: one
starts inside a stretch of docs-only work, the other runs past where the job
changed from shipping the app to fixing it, and days off stay in the denominator.

**6 September — `src/` went from 98,000 to 223,000 lines.** Same move, and the
flag came unprompted, with no question attached: _they look a bit too much to
me_. That makes it the stronger of the two — it is the difference between reading
a number and remembering making one.

## Not bumps

Flagging two words missing from verbatim text is `.claude/rules/writing.md`
doing its job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for repairing its
defects rather than asking whether this was the piece — _it was about me (not
you) delivering the wrong, foggy message_. Nobody else holds that original.

**Decisions that were the operator's to make.** Four rounds were filed here and
taken back out: the CV's locale segment, the hook a post leads with, where the
theme toggle sits, and whether it comes from a layout. Only the toggle's _skin_
stayed a bump; an entry removed this way takes its count with it.

## The two families

Nine learnings is not a pattern, but they fall in two groups. One is failures to
notice the frame was ours — the prefix list, the published chart, the checker
whose coverage read as the rule, our own `eslint.config.ts`. The other is the
post's more interesting half, being the opposite of a mistake: the output was
well-formed, justified and efficient, and every one of those properties is what
made it wrong. An edit minimal where it was made left one fact spelled three
ways; an account sound at every step stopped anyone opening the file it
described. No "be more careful" catches these — they need a person, and not
always one who knows more.
