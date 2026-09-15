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

**This file has an end.** Scaffolding for one post, not a permanent journal:
once row 18 is drafted and posted, the file retires with the rule that feeds it.
Everything durable belongs where the code can see it — a rule under
`.claude/rules/`, a line in `CLAUDE.md` — whether or not it also lands here.

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
  shows what the agent could not see; then drop learnings from the bottom, since
  one bump is a coincidence with a paragraph attached. A learning cut for
  thinness comes back if something bumps into it again.

## What it was handed, it treats as fixed (×14)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_. That is
what makes the failure invisible: the reasoning within the frame is sound, and a
second agent checking it would pass. The human's move is to change the given
rather than to answer better within it.

**6 September — a word the vocabulary didn't have.** The commit prefix was wrong:
`docs:` for a change that documents nothing. The agent weighed three candidates
from the list and never considered anything outside it, because the list arrived
looking like a standard. _Let's introduce "content:"_ — the list is ours, in our
own `CLAUDE.md`, and adding a word costs one commit.

**7 September — a word one day old, already treated as given.** Having added
`content:`, the agent framed whether it trips the deploy gate as a trade with no
clean answer: the prefix covers published material and drafts alike. The reply
dissolved it — `content:` is _specifically_ for what isn't published yet, and a
piece going live arrives as the page that serves it. The word was a day old.

**8 September — the gate's coverage read as the rule's extent.** The CV's route
files each inlined their params as an object literal inside a generic, and `pnpm
type-overlap` ran clean, so the agent stopped. _type-overlap doesn't cover this,
but consider it covered_: it scans type aliases only, which the agent knew from
the README and read as the rule's boundary rather than a hole in enforcement.

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
likely actually prefer the latter being canonical_: flipped, the cost is the goal.

**9 September — our own lint config, read as a specification.** Asked whether a
`server-only` barrel would better home a schema, the agent built it, found
`boundaries/dependencies` failing, priced widening `PUBLIC_API` as a repo-wide
change to what "public API" means, and declined. _if "boundaries don't allow" is
the only argument, let's rewrite the boundaries_ — `eslint.config.ts` is ours.

**9 September — a note on the site's controls, read as a rule about everything
clickable.** Moving the theme toggle into the header's corner, the agent kept
`variant="default"` — `theme.ts` calls it "the site's only control skin" — so a
hairline box fenced off empty space. _let's remove the borders_. The agent had
just argued the toggle is furniture, never carrying that to how it looks.

**9 September — a global class read off the globals beside it.** A hover dim
claimed by two slices with no sideways reach went into `globals.scss`, reason
written in: "as the print utilities are". Those are global for a reason that does
not transfer — the content pipeline emits `print-hidden` into HTML strings, where
a hashed module class is unreachable — and what made the neighbours global never
got asked, because they were there. _why are we bypassing modules here?_
`theme.module.scss` already handed its class names to Mantine through a plain
module, which is what the dim does now.

**11 September — its own spelling, then the operator's typo, both taken as
given.** The sync skill was `/sync-agent-infra` because the agent had named it so
at the previous sync. Told the source had renamed its copy `/update-muthur`, it
proved the rename need not travel and read that freedom as a reason to keep its
own. Two one-word comments then took both names, one of them a typo matching no
spelling the source ever used — and the agent wrote a paragraph defending it.

**14 September — a sentence that scanned, so the word in it went unquestioned.**
Deepgram heard «ты смотришь на кофе… он красивый, почти как предзакатное солнце»:
it parses, and a coffee on a rock had just been described. The word was «код»,
the rung the recording's payoff calls back to. The low-confidence list flags what
the recognizer doubted; a mis-hearing that makes sense is the kind it cannot.

**14 September — the reading that fit the argument went unchecked, twice.**
«Ставить его нам, возможно, будет уже некому» was read as _we will not be here_,
and a name recommendation rested on it. Told the sense was the other one, the
agent filed that as _the grammar allows only the other one_ — also false: the
sentence takes both, which is why the «нам» was added. Each parse arrived ahead
of the argument wanting it, the second being the first with its sign flipped.

**14 September — the one caller's shape, written into a general skill.** The
afterword skill, extracted from `/dictation`, kept what the extraction had held:
the Russian heading as _the_ heading, three examples as the sections, a purpose
reaching no further than a two-voice post. _let's make language a parameter_,
_it's wider than that — wherever I want feedback more durable than a thread_.

**15 September — the plan, read as where a change gets written down.** The
by-hand steps for standing the second site up went into the plan file, whose
whole tree `CLAUDE.md` says is swept before the squash. _смотреть в .completed
кажется концептуально неверно_ — never which document, only which section.

## It edits the copy in front of it, not the fact behind it (×9)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause; a test written into a file
is run against the one entry under discussion. Nothing catches the split — every
site reads correctly on its own, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places, all of them the agent's own work from hours earlier in the same
branch. Told to add Supabase and Railway, it edited one and left the others on
the old list. _the tech stack lines should be the same (and DRY)_ — a defect no
screenshot of any single page could show, because each page was right.

**9 September — the rule fixed in the copy, not in the source.** Told a squash
body has no business carrying a "things to know when editing here" paragraph,
the agent wrote two rules into `squash-message/SKILL.md` and closed the round.
That skill is adopted from a boilerplate repo whose copy still asks for the same
thing. _Let's file an issue on the boilerplate repo._ The fix had a second site.

**9 September — a test written and not run over the file it was for.** The same
round added the test above — a bump is something the agent could have seen and
didn't — then ran it against only the entry under discussion, leaving ten
sections unexamined. _Do the other learnings de-qualify per this lens?_ One did.

**9 September — the tagline in the catalogue, the tagline in the pixels.** The CV
repositioning gave each framing its own tagline in `cv-metadata.ts` and left
`ogImage: '/cv_card.png'` two lines below, the developer tagline baked into it —
so a shared `/cv` link unfurled the CTO description beside a card reading
DEVELOPER. A fact rendered in pixels: _бли, картинку уже поменять надо_ 🙈.

**9 September — a rename that took its own inventory on trust.** Told the double
`l` in `Labelled` hurt, the agent renamed the type and called the two remaining
mentions "authored prose" — wrong on both counts: four occurrences in three
files, one a shell variable the vet run executes. It had searched its own diff.

**14 September — the instruction obeyed, the instruction left standing.** _не
надо ничего перепроверять_, posted on a line of the dictation skill: the agent
stopped re-verifying for that session and left the sentence ordering it in the
skill, where the next run reads it. _убери текст, где ты просишь от агента
перепроверять что «всё правильно»._ A comment on a rule is about the rule.

**14 September — the correction landed on the line it was raised on.** _читатель
получит понимание как не надо делать агентский кодинг_, raised on the first
dictation and written into that file. The project plan, written the same hour,
went on opening "the subject is … what the human is still for".

**15 September — the description widened, the globs left behind.** Moving the
router under `apps/`, the agent rewrote the content rule's description to
`apps/<site>/public/` and left its `paths:` matching `apps/vova/` only — the
claim four lines above the mechanism contradicting it. _нужно сделать sweep._

**15 September — em dashes, a day after being told.** _нет, все равно --_ was
settled against a Russian draft and applied to that file alone; the English copy
written the next day came out in em dashes, the preference never asked about.

## An account that explains the code stands in for running it (×6)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Completeness is what removes the prompt to measure,
and nothing inside an account can report that it was never checked.

**8 September — a redirect nobody had opened.** Asked why the unlocalized `/cv`
route needs a hand-written redirect file, the agent gave the right reason:
next-intl redirects in middleware, a static export has none. That closed the
question, so nobody asked what the file does. _how do we do "redirect" if it's
not supposed to work in a static export at all?_ One grep of `out/`: the hop is
React's, after hydration, so `/cv` is blank to anything without JS.

**8 September — the schema it never wrote.** Told route params would be better
parsed with a zod schema, the agent declined; what survived two rounds was that
a schema would restate the variant ids — which `z.enum(CV_VARIANTS)` does from
the same const. _Am I missing smth?_ The account displaced a measurement nobody
had: zod in a module a client component reaches costs the CV's bundle 89 kB
gzipped, which decides where the schema lives, not whether it exists.

**9 September — four homes, three of them checked.** Cutting a maintenance
paragraph from a commit body, the agent justified it: each item already sits
where whoever is about to break it would look. The right test, which is why
nobody ran it — the fourth item was named nowhere but in the deleted paragraph.

**14 September — no middle option, in a repo holding twenty-eight of them.**
Asked where source recordings live, the agent argued nothing sits between `main`
and nowhere: a video kept only on a branch is garbage-collected once the branch
is deleted. Every step true, the premise never checked — `git ls-remote --heads
origin` lists twenty-eight merged `claude/*` branches: _я не удаляю ветки_.

**14 September — a test whose counterexample sat in the diff proposing it.** The
dictation skill got a rule against drifting into prose: every sentence written
should be findable in the recognizer's output. Never run against the two
transcripts beside it, where «научный не обязательностью» had become «наученный
необязательностью». _как такое получится, если ошибки поправляются?_ On words.

**15 September — an objection never tried against `import type`.** The site id
stayed a bare string in `siteNextConfig`, its docstring giving the reason:
importing it runs `shared/config`'s check before anything sets the variable.
True of a value import. _разве оно относится к `import type`?_ One build away.

## It writes its reasoning into the artifact (×5)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and it is still wrong, because what the
artifact is _for_ decides what belongs in it — and it is never the record of how
the artifact was chosen.

**6 September — the paragraph explaining the paragraph.** The announcement draft
carried a passage on its own calibration, arguing why its register was pitched
where it was. The human deleted it: a reader came for the post, not its defence.

**7 September — the commit body that documented the deploy gate.** The squash
message explained the new prefix and its place in the gate, plus two notes
recording the call and offering the veto — all true, all cut. A ride-along given
a paragraph in a body read by someone scanning the log reads as the point of it.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here" — every item true, every one
belonging in a rules file or a docstring. The body had accreted across refreshes
rather than being rewritten, which is how a cap gets walked past one push at a
time.

**14 September — two denials of what the file used to be part of.** The new
afterword skill carried "it applies to anything the operator wrote" and "it is
not the lede", both answering a question only someone who had watched it leave
`/dictation` would ask. `CLAUDE.md` names the defect, the agent had cut one of
its own by hand the same session, and `/tend-prose negation` ran over the file.
_polar bear_, twice. The next day the new voice rule closed on a paragraph
ruling `--` out of site copy that nothing in the tree had ever asked for —
a third, in prose written minutes after the lens ran over it.

## Given a form, it fills the form (×5)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._ Nothing had
prompted it. The reply: sometimes I want to write in Russian, and this doesn't
need saying at all — we'll see case by case.

**8 September — three glosses invented to fill three slots.** The home page got a
one-line gloss beside each of three old side projects. Two came back corrected to
things no reading of the repos would produce — _a BYOK AI-first text processor_,
_chatgpt before chatgpt_ — and a fourth card listed TypeScript and FSD for a
boilerplate with neither. Every gloss was a confident sentence about the
operator's own work, and the slot never offered leaving one blank.

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
— nothing reads a docstring on its way to moving a file. Prose gets reached for
because it is always available; whether a mechanism also was never gets asked.

**9 September — "keep them out of `shared/i18n`".** Having measured that a zod
schema in the i18n barrel costs the CV's client bundle 89 kB gzipped, the agent
filed it elsewhere and wrote the finding into a docstring telling the next
person not to move it. What the round produced instead was `import 'server-only'`
at the top of the module, which turns the same mistake into a build error — the
pattern every module under `shared/content` already uses.

**9 September — the ceiling this file states, walked past by the append that
states it.** "Past ~400 lines, squeeze instead of growing" is a bullet in the
section above, about the file it was appending to. The agent added a section and
pushed the file to 447 lines, having read the bullet on the way in. _let's put a
vet.sh-controlled check_: prose in the file it governs is still only prose.

## It checks the render against its intent, not against the page (×2)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, and only the second one is
answerable from the intent.

**8 September — the logos it had already looked at.** The agent screenshotted
three new organisation marks in both schemes and reported them legible and
aligned. _the logos are slightly mis-aligned_: one filled its canvas
edge-to-edge, another was inset a fifth and off-centre. The screenshot had shown
that; the question asked of it was "are the logos there".

**9 September — the card it had just fixed, looked at and passed.** Rendering
one card per framing off the catalogue, the agent checked the property it had set
itself — the card can no longer say what the page stopped saying — and confirmed
it held. The same image showed a plate two thirds empty with no way to reach the
person on it: _the prose itself says nothing_, add GitHub and LinkedIn.

## A published number is not a verified number (×2)

A figure already in print reads as settled, so the agent stops at it. The person
who made the figure remembers what went into it — which window, which
denominator, what was excluded — and none of that is recoverable from the number
itself.

**6 September — 6.2 → 8.2 units of work per day.** Lifted from the case study
into a backlog row as a post's headline. Both windows are drawn wrong: one
starts inside a stretch of docs-only work, the other runs past where the job
changed from shipping the app to fixing it, and days off stay in the denominator.

**6 September — `src/` went from 98,000 to 223,000 lines.** Same move, and the
flag came unprompted, with no question attached: _they look a bit too much to
me_. That makes it the stronger of the two — it is the difference between reading
a number and remembering making one.

## Asked to quote a source, it writes its own version (×1)

Holding the file open, the agent still writes its own version. The paraphrase
improves something, so nothing stops it; what goes is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent wrote its own gloss — hours after appending
four bumps to the section it was naming. _take the actual heading._

## Not bumps

The agent flagged rather than silently fixed two words missing from text supplied
verbatim — a rule in `.claude/rules/writing.md` doing its job, recorded so it
isn't miscounted as judgement: every learning above is one no rule anticipated.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то — мямлим, рассусоливаем, нудим_, the agent wrote
itself up for spending its list of that recording's defects on repairs instead of
on whether this was the piece at all. _it was about me (not you) delivering the
wrong, foggy message_. Whether a piece says what its author meant is the one
judgement nobody else holds the original of.

**Decisions that were the operator's to make.** Four rounds were filed here and
taken back out: the CV's locale segment, the hook a post leads with, where the
theme toggle sits, and whether it comes from a layout. Only the toggle's _skin_
stayed a bump. An entry removed this way takes its count with it.

## The two families

Nine learnings is not a pattern, but they fall in two groups, and the second is
the more interesting half of the post.

One is failures to notice the frame was ours — the prefix list, the published
chart, the checker whose coverage read as the rule, our own `eslint.config.ts`.

The other is the opposite of a mistake: the output was well-formed, justified
and efficient, and every one of those properties is what made it wrong. An edit
minimal where it was made left one fact spelled three ways; an account sound at
every step stopped anyone opening the file it described. No "be more careful"
catches these — they need a person, and not always one who knows more.
