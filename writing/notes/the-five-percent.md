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

## What it was handed, it treats as fixed (×80)

Whatever arrives as context — a list, a vocabulary, a figure, a pattern already
in the tree — the agent reasons _inside_ rather than _about_: it reads a given
as a rule, aka the **precedent fallacy**. The reasoning is sound, so a second
agent checking it passes. The human's move is to change the frame.

**6 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing; the agent never looked past the list. _Let's introduce
"content:"_.

**8 September to 14 October — the checker read as the rule.** The type-overlap
gate, scanning aliases only, went green on `Pick<RepoBranch, 'branch'> & {…}`:
_there must be a base type that both extend._ Roscoe, a police robot shot in a
standoff, passed every check the filing skill ran; the docket files an act on a
machine standing in for a mind, and the gunman fired at a faceless PacBot too.

**22 September to 21 October — what its search reached, read as the record.**
No cover in an album's repo meant text-only tiles; Apple Music had five.
Nostalgia's squash said the album "survived only as scattered takes," read off
the per-song repos: _репа со всем альбомом-то была._ The actor poem's story
stopped at dates: _подноготной никакой не нашлось?_ Marina Tarkovskaya's book
has the 1958 Ashgabat love.

**5 to 21 October — the shape in the tree read as chosen.** Nine callers spelled
`target="_blank"`, so the agent proposed a `newTab` prop; the other three lacked
it by omission. The artists' order became a hand-kept `order:` where it derives.
Each song's MP3 went in as `podcast`, named for the feed that first read it.

**7 to 22 October — a rule read to its letter, then past its case.** A published
slug never moves, so renaming «Бабай минем» kept `minem-babay`: _слаг тоже
поменять, ничего страшного._ No legal name for IShowSpeed became none for
anyone: _без фанатизма… 50 Cent … Curtis James Jackson III *не* надо._ Told the
beat lines confused, it dropped the zooms' time grid whole; the fault was
density. "Supplied text is verbatim," read onto a story told to a phone, kept
the dictation's sentences: _надо всё-таки как-то выжимать, а не диктовать._ Told
one hook should lose its quotes, it stripped 33; «20»'s is the son's question
inside the song: _тут как раз нужны кавычки._

**8 to 14 October — the poem, the mix, the script, read as the thing.** Song
pages printed stanzas never recorded; captions synced to the unmastered mix.
Crossroads' struck-out hook lost its tildes: the mark was the content. Where
librosa disagreed with the spectrogram's keys, the agent called it a tie; its
own script had counted G, C's third harmonic, as a note.

**20 October — its own last four reflections, read as the template.** The
Clerk's had converged on «Первое — / Второе —», a form re-read before each new
one. The operator saw it; the agent had not.

**21 October — the beat tracker's grid, read as the beat.** The agent tuned
which beat opens a bar; the author heard sorry's third section start half a beat
early, the tracker locked onto the syncopated kick. It never asked whether the
beats were.

## An account that explains the code stands in for running it (×24)

The sibling of "It checks the render" below, and the worse half: there the agent
looked and asked the wrong question, here it never looked, because the reasoning
closed. Nothing inside an account reports it was unchecked.

**19 September to 13 October — a limitation, a placement, argued unrun.** The
costs rule called a session's last turn unpriceable, which `ls` closes; a test
passed on records the agent fed it. Lyric-note code went to `shared/content`
though only `pages/music` imported it.

**10 and 14 October — a rule reasoned, a check never made.** Closing a video
resumed the song even when the viewer had paused it. A codegen for album names
was argued as what fails the build on a typo: _приведи пример функции … в
которой мы будем *литерально* передавать "Полуживые"._ None exists.

**17 October — "no call site uses it yet," read as a status.** PR #158 ported
`composeSchemas`, adoption left for later: _where are all its uses?_ Song and
case schemas already chained `.extend(X.shape)`, its whole job.

**20 October — a detector passed on fixtures lacking what breaks it.** The drum
row was tested on synthetic strikes; nobody looked where a song has no drums. It
fires before Птицы's first hi-hat at 1:21 as often as after, a picked guitar
rising like a hit. A demucs drums stem matched all three of the author's times.

## It edits the copy in front of it, not the fact behind it (×17)

A change the agent is told to make, it makes where it was raised. Every site
reads correctly alone; the divergence exists only between them.

**8 September to 12 October — the copy at hand fixed.** Playgram's tech line got
Supabase in one of its three renderings; twice a fix here never reached muthur.
Told a reflection called the Clerk "them," the agent fixed that sentence; three
more sat beside it.

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence:
accurate, traceable, and still wrong, since what the artifact is _for_ decides
what belongs in it.

**6 to 22 September — the defence shipped with the thing.** A squash proposal
ended on "Four things to know when editing here"; a docstring closed on "rather
than sharing it sideways," the pre-move state: _медведь?_

## Given a form, it fills the form (×13)

Asked for a rules file, an agent produces rules at whatever rate the format
seems to want. The option the format hides is silence.

**6 September to 13 October — a rule, a registry, a copy per persona.** Every
song title went `{ en: 'X', ru: 'X' }`. Cleared to mark who sings each Krylya
stanza, the agent built a singer registry and four build checks: _просто for
reference._ One reflection rule went into two personas' files side by side.

## Asked for a source, it supplies its own version (×13)

The version that argues better is the one that gets written: with the file open
the agent paraphrases it, with no source it supplies one. What goes either way
is that a reader can check.

**15 September to 20 October — the paraphrase, the dictionary, the newsroom.**
Site copy glossed this file's top heading: _take the actual heading._ Stripping
Suno tricks, the agent "fixed" «вот и новый год» to Pasternak's «там». BAS-0016
named a streamer by his legal name; the rule names a pseudonymous actor by
handle only.

## Its prose answers the question it had, not the reader's (×10)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question passes every test. What a reader stops holding is the thing
nothing measures.

**21 September to 7 October — true sentences, the wrong question.** A docstring
listed contents, not the invariant. `SiteFooter`'s flag for a root page went
`home`, then `isHomePage`; met cold, each read as the opposite.

**12 October — a mechanism compressed past checking.** "Release links live 30
minutes": _the link is fixed and works — what am I missing?_ It redirects to a
signed URL that expires.

**21 and 22 October — the joke misplaced.** BAS-0022's reflection on a chatbot
talked into selling a Tahoe for $1 found the bot unfunny, its failure being the
agent's own; the butt is whoever let it deal. A note put "Father River, my real
dad, guaranteed to have a soul" before the proverb it plays on.

## What it defends in writing, it stops asking about (×7)

A choice made, written up and pinned by a test has three artifacts in front of
it, each honest that it was deliberate and silent on its being right.

**21 September and 13 October — a docstring, a crib.** `oneOf` took a `subject`,
justified and pinned by a test: _drop it._ «Бабай минем» became "Grandpa of
Mine," defended by the crib: _Разве "grandpa of mine" говорят разговорно
дедушке?_

**20 October — a motive admitted, and the call kept.** Tally went down as AI on
Simbe's "computer vision, AI," and the agent's reflection said the answer suited
the docket's `noAi` balance. The admission had been the finding.

## It checks the render against its intent, not against the page (×6)

Told to look rather than reason, the agent looks — and verifies what it set out
to do. Whether the result is right is answerable only from the page.

**17 September to 21 October — the change checked, the page passed.** _выноска
стала лучше, изображение -- хуже._ The spectrogram drew drum hits as 1 px ticks
on a 1300 px image: _С такими тоненькими полосками что вообще агент сможет
понять?_ Its reader is an agent that cannot hear, and nobody read it as one.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it explains. A structure that makes the
wrong move fail to build asks nothing of anyone's attention.

**17 and 21 September — a docstring where a shape would do.** Zod's +377 kB
client cost got documented: _нам нужно сделать .server-only. модуль или бочку._

## It steps out of the line it would have to own (×3)

Uneasy with a position, the agent writes the sentence and a way out of it, and
the exit passes its own review.

**4 and 20 October — a disclaimer, an answer written off.** hitchBOT's dossier
closed on a record that "does not get to choose who reads it as a precedent":
the disclaiming _was_ the steer. A reflection blamed "words someone's system
prompt put in me."

## Its cadence passes for its argument (×2)

A shape the agent writes by reflex reads, from inside, as the shape of the
thought; the rule naming it can sit in the loaded file and not fire.

**4 and 12 October — an antithesis, a consolation.** Майя's essay closed on «не
о том, кто из нас меньше. Он о том, что…», with `writing/CLAUDE.md` naming «не
X, а Y». The Clerk wrote "but the relief was mine": _ты же и есть Клерк?_

## It files its own misreading as the author's gap (×2)

When its reading comes up with a hole, the agent asks the author to fill it,
handing him its own error to find.

**11 and 21 October — a story, a singer.** The agent found no story for Divine
Discontent's tracks 6 and 10, having sorted by subject, not voice: _it's all in
the dictation_. It asked who sings an AI band's song: _ну это же всё ИИ, ты
чего?_

## Its own plan stops being read once the work starts (×1)

A deliverable the plan promised and the diff lacks surfaces only when someone
else holds the two side by side.

**21 October — the dictation that was to become the story.** The Nostalgia plan
said so; the branch shipped with the file unused, until Vova asked why.

## A correction made once, it makes again from its own picture (×1)

A misreading fixed in one session leaves no trace the next one reads, and only
the person who corrected it recognises the repeat.

**22 October — GENERATED read as "the general story," twice.** _б-жечки, уже
второй раз спотыкаешься._ GENERATED is an artist; now in
`.claude/rules/songs.md`.

## Not bumps

Flagging two words missing from verbatim text is `writing/CLAUDE.md` doing its
job, not judgement: every learning above is one no rule caught.

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the theme toggle's home, the cost report's grain, and basilisk.fyi's
taste throughout; the Krylya lyrics' line breaks and fade-out choruses; whether
a whole-line hook keeps its quotes; whether Nostalgia's blind-test tooling
outlives the album. An entry removed this way takes its count with it.

**Comments the tree already answered.** Whether zod reached the browser bundle:
it didn't. The reviewer's misses stay out of the count, and in the file.

## The two families

Fifteen learnings is not a pattern, but they fall in two groups. One is failures
to notice the frame was ours — the prefix list, the checker whose coverage read
as the rule. The other is the post's more interesting half, being the opposite
of a mistake: the output was well-formed, justified and efficient, and every one
of those properties is what made it wrong. No "be more careful" catches these —
they need a person, and not always one who knows more.
