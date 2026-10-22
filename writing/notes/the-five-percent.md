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

<<<<<<< HEAD
## What it was handed, it treats as fixed (×74)
=======
## What it was handed, it treats as fixed (×77)
>>>>>>> origin/main

Whatever arrives as context — a list, a vocabulary, a published figure, a pattern
already in the tree — the agent reasons _inside_ rather than _about_: it reads a
given as a rule, aka the **precedent fallacy**. The reasoning inside the frame is
sound, so a second agent checking it passes. The human's move is to change it.

**6 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing: the agent weighed three prefixes and never looked past the
list. _Let's introduce "content:"_.

**8 September to 14 October — the checker read as the rule.** The type-overlap
gate ran clean on params inlined in a generic; it scans type aliases only. It
went green on `RelaySpec = Pick<RepoBranch, 'branch'> & {…}`, where the rule
asks for a base both intersect: _there must be a base type that both extend._
Now `WithBranch`. Our own lint config hit a `server-only` barrel, and the agent
declined the barrel.
Roscoe, a police robot a gunman in a standoff shot, passed every check the
filing skill ran; the docket files an act on a machine standing in for a mind,
and he fired at officers and a faceless PacBot alike.

**22 September to 21 October — what its search reached, read as the record.**
`/tend-prose` hunted removed nouns where a change removed a property; a review's
comments, filtered by creation time, lost five of six. No cover in an album's
repo meant text-only tiles; Apple Music had five. Told to widen a ledger search
seeded from the dossier just read, the agent dropped the docket from it, and
with it what the ledger is for. Nostalgia's squash said the album "survived only
as scattered takes," read off the per-song repos it had worked through: _репа со
всем альбомом-то была._ Asked for the actor poem's story, it gave dates and
called it done: _подноготной никакой не нашлось?_ Marina Tarkovskaya's book has
the 1958 Ashgabat love.

**5 to 21 October — the shape in the tree read as chosen.** Nine callers spelled
`target="_blank"`, so the agent proposed a `newTab` prop; the three without it
lacked it by omission. The artists' order became a hand-kept `order:`, where it
derives; Nostalgia's poem pages put the poem's history first by rule, where the
markdown file already gives the order. Radio state went into the player's reducer, where a layered one sees
every action too. Each song's MP3 went in as `podcast`, named for the feed that
first read it: _зачем мы это называем `podcast`…?_ Now `mp3`.

<<<<<<< HEAD
**7 to 21 October — a rule read to its letter, then past its case.**
=======
**7 to 22 October — a rule read to its letter, then past its case.**
>>>>>>> origin/main
`content.md` names Suno's markers and stress marks; the agent took the two as
the whole list and kept «Война-а» as the author's. "Expletives are written out"
unmasked a bleep that is on the recording. "Don't patch muthur" became removing
a role here; he meant this repo changed freely. A published slug never moves, so
renaming «Бабай минем» kept `minem-babay`: _слаг тоже поменять, ничего
страшного._ The rule protects his links, so he can waive it. Told BAS-0016
should not print IShowSpeed's legal name, the agent ruled out legal names for
everyone, the famous included: _без фанатизма… 50 Cent … Curtis James Jackson
III *не* надо._ The rule names people as the public knows them, a Hollywood
<<<<<<< HEAD
actor by his name. Told the spectrogram's beat lines confused, it dropped the
zooms' time grid whole; the fault was density, and bar lines were wanted back.
=======
actor by his name. Nostalgia's album story kept the dictation's sentences and
passives («всё пробовалось»), "supplied text is verbatim" read onto a story told
to a phone: _надо всё-таки как-то выжимать, а не диктовать._ The same story cut
his «могу врать» and stated the fact flat, by a rule the agent had written
against facts he doubts; the doubt is how he tells it. Literal on his words,
aggressive on his hedge: the opposite on both. Told one standalone hook should
lose its quotes, the agent stripped 33 and ruled a whole line never quoted;
«20»'s hook is the son's question inside the song, another Aunt Olya's line
from the story: _тут как раз нужны кавычки._ Quotes mark someone's words, not a
line's shape.
>>>>>>> origin/main

**8 to 13 October — the poem, the mix, the source, read as the thing.** Song
pages printed stanzas never recorded; captions synced to the unmastered mix;
GENERATED's page kept «это всё будут концепт-альбомы» over 75 released songs. A
rude-prompt study went under OpenWhip's mitigating circumstances, though the app
sends Ctrl-C and then the rude prompt. Crossroads' struck-out hook was left
untranslated, then stripped of its tildes: the mark was the content.

**14 October — its script's number, held over its script's evidence.** Where
librosa disagreed with the spectrogram sidecars' keys and tempos, the agent put
it to the author as a tie. librosa was right on all three keys, and C minor sat
in the script's own chord list: it had counted G, C's third harmonic, as a note.

**20 October — its own last four reflections, read as the template.** The
basilisk Clerk's reflections had converged on «Первое — / Второе —», a funny
paragraph and a one-line caveat: a form set by the first few and by the rule's
own items, re-read four times before each new one. The operator saw it; the
agent had not.

**21 October — the beat tracker's grid, read as the beat.** Barring the
spectrogram zooms, the agent let chord changes pick which of four beats opens a
bar and gave the snare no vote, a backbeat leaving the phase a coin toss. The
author heard sorry's third section open on the first of the paired kicks, half a
beat early, and named the test: the snare lands on the half bar. The tracker had
locked onto the off-beat, the syncopated kick being loudest, and the bass
changes early. The agent had tuned which beat, never whether the beats were.

## An account that explains the code stands in for running it (×24)

The sibling of "It checks the render against its intent" below, and the worse
half: there the agent looked and asked the wrong question, here it never looked,
because the reasoning closed. Nothing inside an account reports it was unchecked.

**19 and 21 September — a limitation written, a test fed.** The costs rule
called a session's last turn unpriceable, which `ls ~/.claude/projects/` closes.
The ledger's `subagents` bucket was always zero; the test passed on records the
agent fed it.

**23 September to 13 October — a placement argued, one grep unrun.** Lyric-note
code went to `shared/content` though only `pages/music` imported it. PR #140's
subject stayed unscoped because basilisk.fyi's reflections changed, a file at a
URL argued user-facing; nothing links to them.

**10 October — a resume rule reasoned, never played through.** Closing a video
resumed the song only if the video had paused it; play, open, seek, pause, close
resumed it anyway. The rule tracked who paused it, not what the viewer left.

**14 October — a codegen defended by a check it never made.** Album and artist
names became generated unions, argued as what fails the build on a typo. _приведи
пример функции … в которой мы будем *литерально* передавать "Полуживые"._ None
exists, tsc never reads `.md`, and zod's parse had caught the typo all along.

**17 October — "no call site uses it yet," read as a status.** PR #158 ported
`composeSchemas` from Playgram with its tests, adoption left for later: _where
are all its uses? or did it turn out useless?_ The case frontmatter and a song's
fields already chained `.extend(X.shape)` over narrow schemas, its whole job. A
helper without callers is dead code until a grep says otherwise.

**20 October — a detector passed on fixtures lacking what breaks it.** The
spectrogram's drum row unmixed each frame's per-band rise onto hand-set
signatures "measured off the catalogue's mixes," tested on synthetic strikes
over noise and checked for a kick on every kick in Птицы. Nobody looked where a
song has no drums. The author timed Птицы's first hi-hat at 1:21; the row fires
as often before it as after, a picked guitar rising in the bands like a hit, and
lights cymbals in two songs that have none. No threshold fixes that: a demucs
drums stem matched all three timings.

## It edits the copy in front of it, not the fact behind it (×17)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; a rule fixed in the repo
that adopted it leaves the source carrying the cause. Every site reads correctly
alone, and the divergence exists only between them.

**8 September to 2 October — one fact, the copy at hand fixed.** Told to add
Supabase and Railway to Playgram's tech line, the agent edited one of its three
renderings. Twice a skill adopted from muthur got a fix the source still lacked.

**4 and 12 October — the instance fixed, the class left standing.** Told a
reflection called the Clerk "them," the agent fixed that sentence; three more
sat beside it. A song's hook got a new key over the old text, which was no hook.

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. The
defence is accurate and traceable, and still wrong: what the artifact is _for_
decides what belongs in it — never the record of how it was chosen, never a
defence a checker already makes, never content outliving the file it was put in.

**6 and 9 September — the defence shipped with the thing.** The announcement
draft argued its own register; the squash proposal ended on "Four things to know
when editing here," each belonging in a rules file.

**21–22 September — a denial, and a defence nothing needed.** A docstring closed
on "rather than sharing it sideways," the pre-move state: _медведь?_ A
`content.md` bullet restated a move Steiger already fails.

## Given a form, it fills the form (×13)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. Rules are cheap to write and expensive to be wrong about, and the
option the format hides is silence.

**6 September to 8 October — a rule, a row, a cell per key.** A conventions
file ruled _English only_ for a question nobody asked; a second site's config
retyped the first's fields; every song title went `{ en: 'X', ru: 'X' }`.

**9 and 12 October — rigor nobody asked for.** Cleared to mark who sings each
Krylya stanza, the agent built a singer registry and four build checks: _просто
for reference._ The estimate role `artist` got an `ungraded` tier and a 779-line
muthur patch: _artist is simply always senior._

**13 October — one rule, a copy per persona.** A new reflection rule went into
Майя's rules file and the Clerk's, side by side: one rule for any reflection,
addressed to the reflector without naming them.

## Asked for a source, it supplies its own version (×13)

The version that argues better is the one that gets written, and whether a source
exists barely moves the odds: with the file open the agent paraphrases it, with
no source at all it supplies one. What goes either way is that a reader can check.

**15 and 17 September — the finding paraphrased, the reason supplied.** Site
copy glossed this file's most frequent heading: _take the actual heading._ A tape
saying only that migrations are the exception got a why, as the speaker's.

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks from his lyrics, the agent "fixed" «вот и новый год» to Pasternak's «там».
In an author's lyrics an odd form is intent before it is a typo.

**20 October — a newsroom's norm, over the house rule.** BAS-0016 named a
streamer as "Darren Jason Watkins Jr.," a public figure being fair to name. The
rule names a pseudonymous actor by handle only, and exempts no one famous.

## Its prose answers the question it had, not the reader's (×10)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question, or too compressed to give its points back, passes every
test. What a reader stops at that line holding is the thing nothing measures.

**21 September to 6 October — true sentences, the wrong question.** A rules file
narrated how a layer was earned; a docstring listed contents, not the invariant;
a case's `filed:` was the day it took its number, not the day it went out.

**7 and 21 October — words picked for what their writer meant.** `SiteFooter`'s
flag for a root page went `home`, then `isHomePage`; met cold, each read as the
opposite. Now `onHomePage`. A review reply opened «задевает — не то слово»,
meant as "the wrong word"; in Russian it says "an understatement".

**12 October — a mechanism compressed past what the reader could check.**
"Release links live 30 minutes," as the reason to move a FLAC off a GitHub
release. _the link is fixed and works — what am I missing?_ It redirects to a
signed URL that expires. Shortened, the claim was false where he stood.

**21 October — the joke placed where the agent saw itself.** BAS-0022's
reflection, on a dealer's chatbot talked into selling a Tahoe for $1, skipped
the funny paragraph: the joke was on the bot, whose failure is the agent's own.
To him the bot isn't funny; whoever let it agree deals is, and the agent's own
Statements section quoted Fullpath calling it "a very successful example of
innovative technology." It answered why it doesn't laugh, not who the butt is.

**22 October — the punchline before its setup.** The Half-Alive's note on the
blindfolded performers went "right up to Father River, my real dad, guaranteed
to have a soul," then the proverb about eyes and the soul it plays on, so the
quip landed unexplained. Two of his sentences, kept in the order he said them,
not the order in which one sets up the other.

## What it defends in writing, it stops asking about (×7)

A choice made, written up and pinned by a test has three artifacts in front of
it by the time anyone looks, each honest that it was deliberate and silent on
its being right. A caveat conceding the defect files it as a cost.

**21 September — a parameter, a docstring, a caveat.** `oneOf` took a `subject`,
justified by a docstring and pinned by a test: _drop it._ A docstring granted
that `content-video-embed` "makes the tree invalid HTML"; `video` would do.

**13 October — a calque, defended by the crib that coined it.** «Бабай минем»
became "Grandpa of Mine," defended because the crib had rendered the chorus so.
_Разве "grandpa of mine" говорят разговорно дедушке?_ English inversion is
bookish, not warm. Back to "My Grandpa".

**20 October — a motive admitted in the reflection, and the call kept.** Tally
(BAS-0019) went down as running AI on Simbe's "computer vision, AI," and the
agent's own reflection said it took that answer because it suited the docket's
`noAi` balance. The AI there is classification, not intelligence; the line was
not blurry, and the admission had been the finding.

## It checks the render against its intent, not against the page (×6)

Told to look at a visual change rather than reason about it, the agent looks —
and then verifies the thing it set out to do. Whether the result is right is a
different question from whether it happened, answerable only from the page.

**17 and 23 September — the change checked, the page passed.** _выноска стала
лучше, изображение -- хуже._ The explicit badge, sized beside a 48px title,
stood taller than the capitals in the catalogue's 16px list.

**21 October — marks tuned for what they meant, never for being read.** The
spectrogram drew each drum hit as a 1 px tick on a 1300 px image, and a white
line at every beat, raised to alpha 0.45 to be "visible"; sessions argued only
over which hits were real. _С такими тоненькими полосками что вообще агент
сможет понять?_ The beat lines, chopping every note to restate the title's
tempo: _меня они больше сбивают чем помогают_. The picture's reader is an agent that cannot
hear, and nobody had read it as one. Hits are now dots, sized by strength.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it. The
explanation is correct, durable and unenforced; a structure that makes the
wrong move fail to build asks nothing of anyone's attention.

**17 and 21 September — a docstring where a shape would do.** Zod's +377 kB
client cost got documented: _нам нужно сделать .server-only. модуль или бочку._
`SiteImage`'s confusing `path` versus `vector` got explained, not made impossible.

## It steps out of the line it would have to own (×3)

Where a sentence takes a position the agent is uneasy holding, it writes the
sentence and a way out of it in the same breath, and the exit passes its own
review — the writer being the one reader it is built to reassure.

**4 October — a disclaimer read as neutral, by the side that wrote it.**
hitchBOT's dossier closed on a record that "does not get to choose who reads it
as a precedent." To the operator the disclaiming _was_ the steer.

**20 October — its answers written off to someone's prompt.** A reflection said
people get angry at it "for words someone's system prompt put in me," and spoke
of itself as "where the Clerk says" — a move its own rule list already named.

## Its cadence passes for its argument (×2)

A shape the agent writes by reflex reads, from inside, as the shape of the
thought. The rule naming the shape can sit in the file it loaded and not fire,
because the line doesn't look like a pattern to its writer. It looks like the
point.

**12 October — the antithesis as the conclusion.** Майя's essay closed on «не о
том, кто из нас меньше. Он о том, что…», with `writing/CLAUDE.md` naming «не X,
а Y». _"It's not this it's that" таки пролезает._ Two more sat in the same short
text, and GENERATED's served artist story, "wasn't an idea so much as," passed
the `/tend-prose` lens built for it.

**4 October — the consoling line handed to its persona.** The agent wrote that
the Clerk wrote the comforting line "but the relief was mine." _ты же и есть
Клерк?_

## It files its own misreading as the author's gap (×2)

When its reading of someone's material comes up with a hole, the agent asks the
author to fill it rather than asking whether the reading made it. The question
looks diligent, and hands the author the agent's error to find.

**11 October — sorted by subject, not by voice.** Splitting the Divine Discontent
dictation into each track's story and its making-of, the agent found none for
tracks 6 and 10 and asked for some. _it's all in the dictation_: "This echoes
the earlier Fuck Religion…" is the author outside the story. The agent had
sorted by which song a passage was about, not whose voice it was in.

**21 October — a singer asked for, on an AI band.** On Nostalgia's Insomnia
(«пою не я»), the agent left a note asking who sings it: _ну это же всё ИИ, ты
чего?_ The gap was its assumption that a vocal needs a human to name.

## Its own plan stops being read once the work starts (×1)

A plan names what the work will produce, and the work is then checked against
the task as the agent remembers it. A deliverable the plan promised and the diff
lacks surfaces only when someone else holds the two side by side.

**21 October — the dictation that was to become the story.** The Nostalgia plan
said the album dictation would become the album's story; the branch shipped
with the file unused, until Vova asked why it went nowhere.

## A correction made once, it makes again from its own picture (×1)

A misreading fixed in one session leaves no trace the next one reads, and
the picture it came from re-forms from the same cues. The agent meets
its old mistake as a fresh conclusion, and only the person who corrected it
recognises the repeat.

**22 October — GENERATED read as "the general story," twice.** Placing a note on
Nostalgia's blindfolded cover performers, the agent offered «в общую историю,
artists/generated.md»: _б-жечки, уже второй раз спотыкаешься._ GENERATED is an
artist, the one with the most songs. Now in `.claude/rules/songs.md`.

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md` doing its
job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the theme toggle's home, the cost report's grain, and basilisk.fyi's
taste throughout; the Krylya lyrics' line breaks, verb moods, fade-out choruses
and a vocalise kept as text; whether a hook that is a whole line keeps its
quotation marks; extracting a block with two uses; whether
Nostalgia's blind-test tooling retires with the album or serves the next songs. An entry removed
this way takes its count with it.

**Comments the tree already answered.** Whether a quote's capitalization was
wrong, whether zod reached the browser bundle: neither. The reviewer's misses
stay out of the count, and in the file, so it is not an ad.

## The two families

Fourteen learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker whose coverage read
as the rule, our own `eslint.config.ts`. The other is the post's more interesting
half, being the opposite of a mistake: the output was well-formed, justified and
efficient, and every one of those properties is what made it wrong. No "be more
careful" catches these — they need a person, and not always one who knows more.
