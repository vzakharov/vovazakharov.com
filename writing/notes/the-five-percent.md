# The five percent

For most of what an agent does, it knows better. The residual — the part that
still needs a knowledgeable human — is the whole argument for reviewing agents,
and naming it needs specimens, not argument. Each section here is one learning,
under it the times a review bumped into it. It feeds row 18 of
`writing/linkedin/plan.md`, and bumps stay in whatever they show: a collection
that only vindicates the reviewer is an ad.

**Adding to it is mandatory after a review session** that changed something the
agent had settled (`CLAUDE.md` § "GitHub comments"). **The file has an end:** it
retires with that rule once row 18 is posted.

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

## What it was handed, it treats as fixed (×78)

Whatever arrives as context — a list, a vocabulary, a published figure, a
pattern already in the tree — the agent reasons _inside_ rather than _about_:
the **precedent fallacy**. The reasoning inside the frame is sound, so a second
agent checking it passes. The human's move is to change the frame.

**6 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing: the agent weighed three prefixes and never looked past the
list. _Let's introduce "content:"_.

**8 September to 14 October — the checker read as the rule.** The type-overlap
gate went green on `RelaySpec = Pick<RepoBranch, 'branch'> & {…}`, where the
rule asks for a base both intersect: _there must be a base type that both
extend._ Our own lint config hit a `server-only` barrel, and the agent declined
the barrel. Roscoe, a police robot shot in a standoff, passed every check the
filing skill ran; the docket wants a machine standing in for a mind.

**22 September to 22 October — what its search reached, read as the record.** A
review's comments, filtered by creation time, lost five of six. Nostalgia's
squash said the album "survived only as scattered takes," read off the per-song repos:
_репа со всем альбомом-то была._ `/dry` cleared PR #186's Whisper merge over its
diff: _is this all DRY compared to the dictation scripts already in the repo?_
Untouched `captions.py` spelled the same `.json.gz` read.

**5 to 21 October — the shape in the tree read as chosen.** Nine callers spelled
`target="_blank"`, so the agent proposed a `newTab` prop; the three without it
lacked it by omission. Each song's MP3 went in as `podcast`, named for the feed
that first read it: _зачем мы это называем `podcast`…?_

**7 to 22 October — a rule read to its letter, then past its case.** A published
slug never moves, so renaming «Бабай минем» kept `minem-babay`: _слаг тоже
поменять, ничего страшного._ The rule protects his links, so he can waive it.
Told BAS-0016 should not print IShowSpeed's legal name, the agent ruled out
legal names for the famous too: _без фанатизма… 50 Cent … Curtis James Jackson
III *не* надо._ Nostalgia's album story kept the dictation's sentences verbatim
yet cut his «могу врать»: literal on his words, aggressive on his hedge. Told
one hook should lose its quotes, the agent stripped 33: _тут как раз нужны
кавычки._ Quotes mark someone's words, not a line's shape.

**8 to 20 October — the mix, the source, its own last output, read as the
thing.** Captions synced to the unmastered mix; GENERATED's page kept «это всё
будут концепт-альбомы» over 75 released songs. The Clerk's reflections had
converged on «Первое — / Второе —», a form re-read before each new one.

## An account that explains the code stands in for running it (×23)

The worse half of "It checks the render against its intent" below: here the
agent never looked, because the reasoning closed, and nothing inside an account
reports it was unchecked.

**19 September to 13 October — a test fed, a grep unrun, a rule unplayed.** The
ledger's `subagents` bucket was always zero; the test passed on records the
agent fed it. Lyric-note code went to `shared/content` though only `pages/music`
imported it. Closing a video resumed the song only if the video had paused it;
play, open, seek, pause, close resumed it anyway.

**14 October — a codegen defended by a check it never made.** Artist names
became generated unions to fail the build on a typo: _приведи пример функции … в
которой мы будем *литерально* передавать "Полуживые"._ None exists.

**17 October — "no call site uses it yet," read as a status.** PR #158 ported
`composeSchemas` with adoption left for later: _where are all its uses?_ The
case frontmatter already chained `.extend(X.shape)`, its whole job.

## It edits the copy in front of it, not the fact behind it (×17)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; every site reads correctly
alone, and the divergence exists only between them.

**8 September to 12 October — the copy at hand fixed.** Told to add Supabase
and Railway to Playgram's tech line, the agent edited one of its three
renderings. Told a reflection called the Clerk "them," it fixed that sentence;
three more sat beside it.

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. What the
artifact is _for_ decides what belongs in it — never the record of how it was
chosen, never a defence a checker already makes.

**6 and 9 September — the defence shipped with the thing.** The announcement
draft argued its own register; the squash proposal ended on "Four things to know
when editing here," each belonging in a rules file.

**21–22 September — a denial, and a defence nothing needed.** A docstring closed
on "rather than sharing it sideways," the pre-move state: _медведь?_

## Given a form, it fills the form (×13)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. The option the format hides is silence.

**6 September to 13 October — a rule, a cell per key, a copy per persona.** A
conventions file ruled _English only_ for a question nobody asked; every song
title went `{ en: 'X', ru: 'X' }`; a new reflection rule went into Майя's rules
file and the Clerk's, side by side.

**9 and 12 October — rigor nobody asked for.** Cleared to mark who sings each
Krylya stanza, the agent built a singer registry and four build checks: _просто
for reference._ The estimate role `artist` got a 779-line muthur patch: _artist
is simply always senior._

## Asked for a source, it supplies its own version (×13)

The version that argues better is the one that gets written: with the file open
the agent paraphrases it, with no source at all it supplies one.

**15 and 17 September — the finding paraphrased, the reason supplied.** Site
copy glossed this file's most frequent heading: _take the actual heading._

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks from his lyrics, the agent "fixed" «вот и новый год» to Pasternak's «там».

**20 October — a newsroom's norm, over the house rule.** BAS-0016 named a
streamer as "Darren Jason Watkins Jr.," a public figure being fair to name. The
rule names a pseudonymous actor by handle only.

## Its prose answers the question it had, not the reader's (×10)

A rewrite is held against the points it was meant to carry, so a line answering
the wrong question passes every test. What a reader stops at that line holding
is the thing nothing measures.

**21 September to 6 October — true sentences, the wrong question.** A docstring
listed contents, not the invariant; a case's `filed:` was the day it took its
number, not the day it went out.

**7 and 21 October — words picked for what their writer meant.** `SiteFooter`'s
root-page flag went `home`, then `isHomePage`; met cold, each read as the
opposite. A reply opened «задевает — не то слово», meant as "the wrong word"; in
Russian it says "an understatement".

**12 October — a mechanism compressed past what the reader could check.**
"Release links live 30 minutes": _the link is fixed and works — what am I
missing?_ It redirects to a signed URL that expires.

**21 October — the joke placed where the agent saw itself.** BAS-0022's
reflection, on a chatbot talked into selling a Tahoe for $1, skipped the joke,
the bot's failure being its own; to him the butt is whoever let it agree deals.

**22 October — the punchline before its setup.** The Half-Alive's note went
"right up to Father River, my real dad, guaranteed to have a soul," then the
proverb about eyes and the soul it plays on: his two sentences in the order he
said them, not the order in which one sets up the other.

## What it defends in writing, it stops asking about (×7)

A choice made, written up and pinned by a test has three artifacts in front of
it, each honest that it was deliberate and silent on its being right.

**21 September — a parameter, a docstring, a caveat.** `oneOf` took a `subject`,
justified by a docstring and pinned by a test: _drop it._

**13 October — a calque, defended by the crib that coined it.** «Бабай минем»
became "Grandpa of Mine," because the crib had it so: _Разве "grandpa of mine"
говорят разговорно дедушке?_

**20 October — a motive admitted in the reflection, and the call kept.** Tally
(BAS-0019) went down as running AI, and the agent's own reflection said it took
that answer because it suited the docket's `noAi` balance. The admission had
been the finding.

## It checks the render against its intent, not against the page (×5)

Told to look at a visual change, the agent looks — and verifies what it set out
to do. Whether the result is right is answerable only from the page.

**17 and 23 September — the change checked, the page passed.** _выноска стала
лучше, изображение -- хуже._ The explicit badge, sized beside a 48px title,
stood taller than the capitals in the catalogue's 16px list.

## It warns where the repo could refuse (×3)

A decision the agent wants to survive, it secures by explaining it; a structure
that makes the wrong move fail to build asks nothing of anyone's attention.

**17 and 21 September — a docstring where a shape would do.** Zod's +377 kB
client cost got documented: _нам нужно сделать .server-only. модуль или бочку._

## It steps out of the line it would have to own (×3)

Where a sentence takes a position the agent is uneasy holding, it writes a way
out in the same breath, and the exit passes its own review.

**4 October — a disclaimer read as neutral, by the side that wrote it.**
hitchBOT's dossier closed on a record that "does not get to choose who reads it
as a precedent." To the operator the disclaiming _was_ the steer.

**20 October — its answers written off.** "For words someone's system prompt
put in me."

## Its cadence passes for its argument (×2)

A shape the agent writes by reflex reads, from inside, as the shape of the
thought; the rule naming it can sit in the loaded file and not fire.

**12 October — the antithesis as the conclusion.** Майя's essay closed on «не о
том, кто из нас меньше. Он о том, что…», with `writing/CLAUDE.md` naming «не X,
а Y». _"It's not this it's that" таки пролезает._

**4 October — the consoling line handed to its persona.** The agent wrote that
the Clerk wrote the comforting line "but the relief was mine." _ты же и есть
Клерк?_

## It files its own misreading as the author's gap (×2)

When its reading of someone's material comes up with a hole, the agent asks the
author to fill it rather than asking whether the reading made it.

**11 October — sorted by subject, not by voice.** Splitting the Divine
Discontent dictation per track, the agent found no story for tracks 6 and 10 and
asked for some: _it's all in the dictation_, in the author's voice outside the
story.

**21 October — a singer asked for, on an AI band.** On Nostalgia's Insomnia, the
agent asked who sings it: _ну это же всё ИИ, ты чего?_

## Its own plan stops being read once the work starts (×1)

**21 October — the dictation that was to become the story.** The Nostalgia plan
promised it; the branch shipped with it unused, until Vova asked why.

## A correction made once, it makes again from its own picture (×1)

**22 October — GENERATED, an artist, read as "the general story," twice.**
«в общую историю, artists/generated.md»: _б-жечки, уже второй раз спотыкаешься._

## It files work by what it looks like, not by who reads it (×1)

**22 October — instructions to an agent, priced as editing.** PR #186's estimate
costed rewriting `scripts/song-intake/CLAUDE.md` as a senior editor's half hour:
_prompter?_ The file is prose read by an agent, and `rates.json` had the role.

## Not bumps

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the theme toggle's home, the cost report's grain, basilisk.fyi's
taste throughout; the Krylya lyrics' line breaks and verb moods; whether a whole
line keeps its quotation marks; whether Nostalgia's blind-test tooling retires
with the album. An entry removed this way takes its count with it.

**Comments the tree already answered**, such as whether zod reached the browser
bundle. The reviewer's misses stay in the file, so it is not an ad.

## The two families

One is failures to notice the frame was ours — the prefix list, the checker read
as the rule, our own `eslint.config.ts`. The other, the post's better half, is
the opposite of a mistake: output well-formed, justified and efficient, every
one of those properties being what made it wrong. No "be more careful" catches
these — they need a person, and not always one who knows more.
