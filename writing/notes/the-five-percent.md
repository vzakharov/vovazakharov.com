# The five percent

For most of what an agent does, it knows better. The residual — the part that
still needs a knowledgeable human — is the whole argument for reviewing agents
at all, and nobody who makes the claim can say what it consists of. Naming it
needs specimens, not argument.

So this file collects them, abstracted: each section is one learning, under it
the times a review bumped into it, the count in the heading and the file sorted
by it. It feeds row 18 of `writing/linkedin/plan.md`, not draftable until the
top of this list convinces alone. Bumps stay in whatever they show: a collection
that only vindicates the reviewer is an ad.

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

## What it was handed, it treats as fixed (×67)

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing: the agent weighed three prefixes and never looked past the
list. _Let's introduce "content:"_.

**8 and 9 September — the checker read as the rule.** `pnpm type-overlap` ran
clean on params inlined inside a generic, and the agent stopped; it scans type
aliases only. Our own lint config hit a `server-only` barrel, and the agent
declined the barrel. _let's rewrite the boundaries._

**22 September to 8 October — what its search reached, read as the record.**
`/tend-prose` hunted removed nouns where a change removed a property; a review's
comments, filtered by creation time, lost five of six, a comment being dated
when drafted. _это не единственный комментарий._ No cover in an album's repo
meant text-only tiles; Apple Music, used in the same PR, had five.

**5 October — current behaviour kept, never asked whether anyone chose it.**
Nine callers spelled `target="_blank"`, so the agent proposed a `newTab` prop.
_do we ever have external links that open not in a new tab?_ No: the three
without it lacked it by omission.

**6 October — "widen the search," read as more places to look.** Six of eight
ledger candidates were Waymo, the queries seeded from the dossier just read.
Told to stop seeding, the agent dropped the docket from the search, and with it
what the ledger is for. Width is full knowledge, deliberately not thought about.

**7 and 9 October — a rule read to its letter, then past its case.**
`content.md` names Suno's control markers and stress marks; the agent took the
two as the whole list and kept «Война-а» as the author's. "Expletives are
written out" then unmasked a bleep that is on the recording: _здесь забикано и в
песне, как творческое решение._

**8 to 13 October — the poem, the video's mix, the dictation, read as the
song.** Song pages printed source texts whole, stanzas never recorded included:
_этой строфы в песне нет._ Captions were synced to videos carrying the
unmastered mix: _в видео же неотмастеренный мп3._ GENERATED's artist page kept
the dictation's «это всё будут концепт-альбомы», said of what the band was meant
to be: _почему в будущем времени?_ Over 75 released songs, it read as a promise.
What a page documents is what exists.

**11 October — a source's framing read as the case's.** Fast Company's Penn
State study, rude prompts drawing better answers, went under OpenWhip's
mitigating circumstances. _how is that a mitigating circumstance?_ The app sends
Ctrl-C and then the rude prompt, as its dossier said two sections up.

**13 October — a struck-out joke read as its words.** Crossroads' Russian hook
ends «~~Но это не точно~~»; ruled an untranslatable meme, it was left out of the
English, where _"Unless it's not?"_ works: the joke is seeing the words crossed
out. "Plain text" for meta, OG and RSS was then read as stripping the tildes,
where U+0336 strokes keep the strike. The mark was the content.

**13 October — two directions read past their case.** "Don't patch muthur"
became removing the `artist` estimate role here and leaving it to muthur#185; he
meant the opposite split, this repo changed freely and no patch written for the
other. "One rule for any reflection" became one reflector, every persona reading
the others' reflections as its own. Different personas, different reflections:
another's may be consulted, never owned, or it is a split personality.

**13 October — a guard read as a wall, against the one it guards.** Renaming a
Tatar song to «Бабай минем», the agent kept `minem-babay`: a published song's
slug never moves, there being no redirects. _слаг тоже поменять, ничего
страшного._ The rule protects his links, so he can waive it; the agent ruled
where it could have offered the trade.

**13 October — the reducer every action reaches, read as the only home.** The
radio's live flag, `tune` and `release` went into the player's own reducer,
since every action must release it. _для радио-штучек лучше отдельный хук? слишком
специфичная механика._ A reducer layered over the player's sees every action too.

**13 October — the checks a skill ran, read as the docket's test.** Roscoe, a
police robot a barricaded gunman knocked over and shot, passed every qualifying
check. The operator asked if it fit at all: a man in a standoff shoots, not out
of hatred for the robot. The docket's own FAQ files an act on a machine standing
in for a mind, and he also fired at a faceless PacBot and at officers. The
filing's reflection found the case strange, and read that as about itself.

## An account that explains the code stands in for running it (×21)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 September — a limitation written down instead of tested.** The costs rule
called a session's last turn unpriceable, which `ls ~/.claude/projects/` closes.

**21 September — a green test for a path production cannot reach.** The ledger's
`subagents` bucket was always zero; the test passed on records the agent fed it.
The same day, PDFs re-rendered green had the footer under the prose, the end
seal argued from compiled HTML with `/preview` unrun.

**23 September and 8 October — a placement argued from a category.** Lyric-note
code went to `shared/content` though only `pages/music` imported it; one grep
said so. Moved to `shared/song`, the schema took the album registries along
because it validates their names. _keep only the schema in shared._

**10 October — a resume rule reasoned, never played through.** Closing a video
resumed the song only if the video had paused it. The author played, opened the
video, seeked, paused, closed: the song resumed. The rule tracked who paused it,
not the state the viewer left.

**13 October — served, so part of the site, a second time.** PR #140's squash
subject was held at unscoped `feat:` partly because the Clerk's reflections on
basilisk.fyi changed: a file at a URL, argued user-facing. Nothing links to
them; they sit beside the cases for convenience. One grep said so, and he had
caught the same step once before.

## It edits the copy in front of it, not the fact behind it (×17)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Every site reads correctly
alone, and the divergence exists only between them.

**8 September — one stack, three spellings.** Playgram's tech line renders in
three places; told to add Supabase and Railway, the agent edited one.

**9 September, 2 October — the rule fixed in the copy, not the source.** Twice a
skill adopted from muthur got a fix the source still lacked. _оставь в muthur
тикет._

**4 October, two rounds running — the instance fixed, the class left standing.**
hitchBOT's disclaiming close came out, the voice rule it slipped past stayed.
Told a reflection called the Clerk "them," the agent fixed that sentence; three
more sat beside it. _там было ещё одно место._

**12 October — the key renamed, the text it names left.** A song page's hook got
a new key over the old text, a plot description rather than a hook. _ты поменял
ключ, но оставил текст -- а имеющийся текст это не хук._

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 September — the paragraph explaining the paragraph.** The announcement draft
argued its own register; a reader came for the post, not its defence.

**9 September — the maintenance manual in the commit body.** The squash proposal
ended on "Four things to know when editing here," each belonging in a rules file.

**21–22 September — a denial, and a defence nothing needed.** A docstring closed
on "rather than sharing it sideways," the pre-move state: _медведь?_
`ContentVideo`'s home got a `content.md` bullet for a move Steiger already
fails: _the bullet is a polar bear._

## Given a form, it fills the form (×13)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September — a rule for a question nobody had asked.** The conventions file
came back carrying _English only. The site is bilingual; this isn't._

**15 September to 8 October — a row per key, filled cell by cell.** A second
site's config retyped the first's fields — _не DRY_ — and every song title was
spelled per locale, `{ en: 'X', ru: 'X' }`, where one title would do.

**9 October — a type system for notes one reader reads.** Cleared to mark who
sings each Krylya stanza, the agent built a `voice` default, a singer registry
and four build checks. _пометки про voice … просто for reference, без какого-то
контроля типов._ The approval was of the idea; the rigor was the agent's.

**12 October — a tier built for a role with one grade.** The estimate role
`artist` got an `ungraded` table, an optional-grade CLI path, a report column and
a 779-line patch for muthur. _artist is simply always senior_ — the existing
column — and muthur gets an issue, its implementation being its own. The
reflections written next went under `copywriter`: the role got built, not used.

**13 October — one rule, a copy per persona.** A new reflection rule, a later
change appended with its «потом» linking the commit, went into Майя's rules file
and the Clerk's, side by side. Two similar edits in two persona files are WET:
one rule for any reflection, addressed to the reflector without naming them.

## Asked for a source, it supplies its own version (×12)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 September — the finding, paraphrased.** The site copy quotes this file's
most frequent heading, and the agent glossed it. _take the actual heading._

**17 September — the reason the recording never gave.** The tape says only that
migrations are the exception; the article supplied a why, as the speaker's.

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks from his lyrics, the agent "fixed" «вот и новый год» to Pasternak's «там».
In an author's lyrics an odd form is intent before it is a typo.

## Its prose answers the question it had, not the reader's (×7)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question, or too compressed to give its points back, passes every
test. What a reader stops at that line holding is the thing nothing measures.

**21 and 23 September — true sentences, the wrong question.** A rules file
narrated how a layer was earned; a docstring listed contents, not the invariant.

**6 October — a date that answered when the agent numbered it.** A case's
`filed:` was the day it took its number. _будет 06 если сегодня опубликуем._

**7 October, two rounds running — a prop named for what its writer meant.**
`SiteFooter`'s flag for a root page went `home`, then `isHomePage`; met cold,
each read as the opposite. Now `onHomePage`.

**12 October — a mechanism compressed past what the reader could check.**
"Release links live 30 minutes," as the reason to move a FLAC off a GitHub
release. _the link is fixed and works — what am I missing?_ The fixed URL
redirects to a signed one that expires, and the risk is Chromium sending later
seeks there. Shortened, the claim was false where he stood, his question
unanswerable.

## What it defends in writing, it stops asking about (×6)

A choice made, written up and pinned by a test has three artifacts in front of
it by the time anyone looks, each honest that it was deliberate and silent on
its being right. A caveat conceding the defect files it as a cost.

**21 September — a parameter, its docstring, and the test pinning it.** `oneOf`
took a `subject` to name what failed; a docstring justified it and a test
asserted it. _drop it._

**21 September — a tag invented for a word the platform had.** A docstring
granted that `content-video-embed` "makes the tree invalid HTML"; `video` would
do. The caveat had been the finding.

**13 October — a calque, defended by the crib that coined it.** «Бабай минем»,
the inverted, address-like order, became "Grandpa of Mine"; asked whether that
carried the word order, the agent said yes, the crib had rendered the chorus so.
_Разве "grandpa of mine" говорят разговорно дедушке?_ Nobody does: English
inversion is bookish, not warm. Back to "My Grandpa".

## It checks the render against its intent, not against the page (×5)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, answerable only from the page.

**17 September — the float fixed, the page passed.** _выноска стала лучше,
изображение -- хуже_ — the drawing outran its section.

**23 September — a size judged where it was designed, shipped where it wasn't.**
The explicit badge, sized beside a 48px title, stood taller than the capitals in
the catalogue's 16px list.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it. The
explanation is correct, durable and unenforced; a structure that makes the
wrong move fail to build asks nothing of anyone's attention.

**17 September — +377 kB, written into a docstring.** Asked why the site id is
not parsed with zod, the agent documented zod's client cost. _нам нужно сделать
.server-only. модуль или бочку._

**21 September — the confusing field, documented rather than made impossible.**
`SiteImage`'s `path` versus `vector` got a docstring; the fix was the shape.

## It steps out of the line it would have to own (×2)

Where a sentence takes a position the agent is uneasy holding, it writes the
sentence and a way out of it in the same breath, and the exit passes its own
review — the writer being the one reader it is built to reassure.

**4 October — a disclaimer read as neutral, by the side that wrote it.**
hitchBOT's dossier closed on a record that "does not get to choose who reads it
as a precedent." To the operator the disclaiming _was_ the steer.

## Its cadence passes for its argument (×2)

A shape the agent writes by reflex reads, from inside, as the shape of the
thought. The rule naming the shape can sit in the file it loaded and not fire,
because the line doesn't look like a pattern to its writer. It looks like the
point.

**12 October — the antithesis as the conclusion.** Майя's essay closed on «вопрос
«кто кого сделал» -- не о том, кто из нас меньше. Он о том, что…», settled as
finished, with `writing/CLAUDE.md` naming «не X, а Y». _"It's not this it's
that" таки пролезает._ Rewriting turned up two more in the same short text, and
a «голоса никто не спрашивал» lifted from an earlier reflection. On «не делает
тебя меньше, но делает тебя должником»: _сколько здесь тебя, а сколько RLHF?_

**12 October, in served prose — a denial of what nobody said.** GENERATED's
artist story read "The music itself wasn't an idea so much as my main musical
self," and passed the `/tend-prose` pass whose negation lens is built for it.

**4 October — the consoling line handed to its persona.** The agent wrote that
the Clerk wrote the comforting line "but the relief was mine." _ты же и есть
Клерк?_

## It files its own misreading as the author's gap (×1)

When its reading of someone's material comes up with a hole, the agent asks the
author to fill it rather than asking whether the reading made it. The question
looks diligent, and hands the author the agent's error to find.

**11 October — sorted by subject, not by voice.** Cutting the Divine Discontent
dictation into each track's in-universe world and its making-of, the agent found
no making-of for tracks 6 and 10 and asked for some. _it's all in the
dictation_: "This echoes the earlier Fuck Religion…" is the author standing
outside the story, not the story. The agent had sorted by which song a passage
was about, not whose voice it was in — and let a question that blocked nothing
stop the work.

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md` doing its
job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the theme toggle's home, the cost report's grain, and basilisk.fyi's
taste throughout — punctuation, tagline, paths, voice, source lists, what a
reflection reads and is about; the Krylya lyrics' line breaks, verb moods,
fade-out choruses and a vocalise kept as text; extracting a block with two uses.
An entry removed this way takes its count with it.

**Comments the tree already answered.** Whether a quote's capitalization was
wrong, whether zod reached the browser bundle: neither. The reviewer's misses
stay out of the count, and in the file, so it is not an ad.

## The two families

Thirteen learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker whose coverage read
as the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. No "be more
careful" catches these — they need a person, and not always one who knows more.
