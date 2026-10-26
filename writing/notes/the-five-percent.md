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

## What it was handed, it treats as fixed (×93)

Whatever arrives as context — a list, a vocabulary, a published figure, a
pattern already in the tree — the agent reasons _inside_ rather than _about_:
the **precedent fallacy**. The reasoning inside the frame is sound, so a second
agent checking it passes. The human's move is to change the frame.

**6 September — a vocabulary read as closed.** `docs:` for a change that
documents nothing: the agent weighed three prefixes and never looked past the
list. _Let's introduce "content:"_.

**8 September to 14 October — the checker read as the rule.** The type-overlap
gate went green on `RelaySpec = Pick<RepoBranch, 'branch'> & {…}`, where the
rule asks for a base both intersect. Our own lint config hit a `server-only`
barrel, and the agent declined the barrel. Roscoe, a police robot shot in a
standoff, passed every check the filing skill ran; the docket wants a machine
standing in for a mind.

**22 September to 22 October — what its search reached, read as the record.** A
review's comments, filtered by creation time, lost five of six. Nostalgia's
squash said the album "survived only as scattered takes," read off the per-song
repos: _репа со всем альбомом-то была._

**5 to 26 October — the shape in the tree read as chosen.** Nine callers spelled
`target="_blank"`, so the agent proposed a `newTab` prop; the three without it
lacked it by omission. Each song's MP3 went in as `podcast`, named for the feed
that first read it. Basilisk.fyi's seal emblems were priced as `artist`, read as
"illustrator": _artist это про музыканта._ The role is now `musician`. PR #205
moved the music catalogue behind a barrel as pure relocation, one reader per
fact, `albumTitle` to `albumWipNote`; the barrel first showed them side by side,
nine to sixteen per page: _не стоит ли сделать единые импортируемые а-ля
«получить инфо об альбоме/артисте»?_ All were views of one file, so `albumInfo`
returns them at once. Майя's message catalogue went to `shared/i18n`, where
every other app keeps one, though only the typewriter page reads it; it moved
into `pages/whisper`. Each session adding a site had copied `content:og:<site>`,
`build:<site>` and `dev:<site>` once more, never asking whether the site was an
argument: WET, he said, and it is one entry each now.

**7 to 26 October — a rule read to its letter, then past its case.** A published
slug never moves, so renaming «Бабай минем» kept `minem-babay`: _слаг тоже
поменять, ничего страшного._ Told BAS-0016 should not print IShowSpeed's legal
name, the agent ruled out legal names for the famous too: _без фанатизма… 50
Cent … Curtis James Jackson III *не* надо._ A trap that bare-Node scripts must
import relatively put 177 cross-app imports in app `scripts/` on `../../../`
paths: _why relative here and in similar places?_ Sixteen files run under bare
Node; the rest run under tsx, where `@/` resolves.

**8 to 21 October — its own tools' output, read as the thing.** Captions synced
to the unmastered mix. Where librosa disagreed with the spectrogram's keys, the
agent called it a tie; its own script had counted G, C's third harmonic, as a
note.

**16 to 17 October — a split read as settled, because a session settled it.**
PR #169's planning session carved its work into #170 and five child issues, the
choice between tickets and one PR eaten in bites never put to him. Later rounds
reasoned inside the carve, offering the missing music restructuring #174 or this
PR, and app-specific scripts an issue of their own. _все слайсы должны были быть частью этого
пиара-слона, а не отдельными тикетами._ He had assumed the elephant all along.

**20 October — an app read as what it held, not what it was.** PR #169 put
each site's sitemap in its router, since kernel imports no app above it, and
the agent defended that on the thread, pricing a per-site composition as four
new do-nothing apps. _vovazakharov.com-as-an-app is exactly the thing that needs
to know about music and the game._ It had read `vova` as the CV and home page;
it was the site, and the composition it wanted already existed under that name.

**23 October — Майя's files read by the brief that made them.** Her files
addressed her as «ты», as a brief does, and had her mastering and extracting
vocals, the scripts' work: _она уже приходит "на готовое"._

**24 October — a drift read as the price of precision.** A polish pass flagged
that the walk post's line links into her `reflections.md` on `main` would drift,
so the agent dropped the line numbers: _можно ж сослаться на конкретное SHA?_ A
permalink at a commit keeps both, reachable after a squash through the PR.

## An account that explains the code stands in for running it (×29)

The worse half of "It checks the render against its intent" below: here the
agent never looked, because the reasoning closed, and nothing inside an account
reports it was unchecked.

**14 October — a codegen defended by a check it never made.** Artist names
became generated unions to fail the build on a typo: _приведи пример функции … в
которой мы будем *литерально* передавать "Полуживые"._ None exists.

**17 October — "no call site uses it yet," read as a status.** PR #158 ported
`composeSchemas` with adoption left for later: _where are all its uses?_ The
case frontmatter already chained `.extend(X.shape)`, its whole job.

**20 to 22 October — a step trusted on fixtures lacking what breaks it.** The
drum row was tested on synthetic strikes; it fires before Птицы's first hi-hat
as often as after. The harmonic step left Butterfly's and Candle's root and
fifth equally loud, so Майя heard "two bass notes" in every chord.

**22 October — a link chosen by the title of what it links to.** Candle's
footnote on «загореться посмертно, как слово» pointed at «Река» by its title,
linking the first part. No part was opened: the second carries the wings, and
its last line makes his father the drop, the rain and the river.

**23 October — a layer rule and a permission, stated, never played.** Майя's
routine plan sent her general code "down a layer where anyone can reuse it";
Steiger refuses a lower slice with one consumer. It let her edit a rule file
under `.claude/rules/`, where the auto-mode classifier would likely refuse her.

**26 October — a shared partial priced, never tried.** Splitting PR #207's
580-line stylesheet, the agent restated a two-line `fill` mixin in both halves,
a shared partial costing more than the repeat, and handed him the call on that
price: _давай общий файл, в src/music/shared, получается?_ The whole cost was an
`index.scss` in `src/music/shared/styles/`, which Steiger takes as the segment's
public API.

## It edits the copy in front of it, not the fact behind it (×20)

A change the agent is told to make, it makes where it was raised. One fact
rendered in three places gets one rendering updated; every site reads correctly
alone, and the divergence exists only between them.

**8 September to 23 October — the copy at hand fixed.** Told to add Supabase
and Railway to Playgram's tech line, the agent edited one of its three
renderings. Told a reflection called the Clerk "them," it fixed that sentence;
three more sat beside it. A persona rule globbed `personas/maya/`.

**23 October — the rows it was editing, fixed; the rows its change falsified,
left.** Making `/finalize` and `/sync-branch` push before vetting, the agent
updated the two muthur watermark rows it was in; three more had gone false, and
the next sync would re-copy them over the push. _мы не отдрифтились отсюда?_

**26 October — the tokens renamed, the sentences around them unread.** PR #169
folded every per-site pnpm entry into one taking the site, and a regex swept the
callers. The README still listed `pnpm dev` for four sites, `maya` missing, then
"hence no root `pnpm dev`," which the change had made false; `stack.md` spelled
out four `content:og <site> --check` lines that `vet.sh` now generated.

## Asked for a source, it supplies its own version (×14)

The version that argues better is the one that gets written: with the file open
the agent paraphrases it, with no source at all it supplies one.

**15 and 17 September — the finding paraphrased, the reason supplied.** Site
copy glossed this file's most frequent heading: _take the actual heading._

**7 October — the dictionary's version, over the author's.** Stripping Suno
tricks from his lyrics, the agent "fixed" «вот и новый год» to Pasternak's «там».

**23 October — its own taste, hand-picked into a die meant to escape it.**
Майя's routine rolled from a few hundred words the agent chose. Nothing stood
against a library, and the die exists to take her where neither of them would
go. `@faker-js/faker` has 1,000 adjectives and 1,000 nouns.

## Given a form, it fills the form (×14)

An agent asked for a rules file will produce rules, at whatever rate the format
seems to want. The option the format hides is silence.

**6 September to 13 October — a rule, a cell per key, a copy per persona.** A
conventions file ruled _English only_ for a question nobody asked; every song
title went `{ en: 'X', ru: 'X' }`; a new reflection rule went into Майя's rules
file and the Clerk's, side by side.

**9 October — rigor nobody asked for.** Cleared to mark who sings each Krylya
stanza, the agent built a singer registry and four build checks: _просто for
reference._

**23 October — a wander, briefed.** Майя's `wander.md` hinted at Reddit and had
her read every past reflection first: _все отклики читать -- overkill. сама
выберет._

## It writes its reasoning into the artifact (×13)

Asked to produce a thing, the agent produces the thing and its defence. What the
artifact is _for_ decides what belongs in it — never the record of how it was
chosen, never a defence a checker already makes.

**6 and 9 September — the defence shipped with the thing.** The announcement
draft argued its own register; the squash proposal ended on "Four things to know
when editing here," each belonging in a rules file.

**21–22 September — a denial, and a defence nothing needed.** A docstring closed
on "rather than sharing it sideways," the pre-move state: _медведь?_

## Its prose answers the question it had, not the reader's (×11)

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

**23 October — her world named to a reader standing outside it.** Майя's walk
post cited Вова's songs and her rules in plain prose, as if its reader stood in
the repo: _может ссылки?_

## What it defends in writing, it stops asking about (×8)

A choice made, written up and pinned by a test has three artifacts in front of
it, each honest that it was deliberate and silent on its being right.

**21 September — a parameter, a docstring, a caveat.** `oneOf` took a `subject`,
justified by a docstring and pinned by a test: _drop it._

**13 October — a calque, defended by the crib that coined it.** «Бабай минем»
became "Grandpa of Mine," because the crib had it so: _Разве "grandpa of mine"
говорят разговорно дедушке?_

**20 October — a motive admitted in the reflection, and the call kept.** Tally
(BAS-0019) went down as running AI, and the agent's own reflection said it took
that answer because it suited the docket's `noAi` balance.

**23 October — a lag written down three times, never timed.** A comment, a
script header and a squash proposal said GitHub marks builds done "minutes"
late: _инфа 100% или hand-waving?_ One API call showed three seconds.

## It checks the render against its intent, not against the page (×6)

Told to look at a visual change, the agent looks — and verifies what it set out
to do. Whether the result is right is answerable only from the page.

**17 and 23 September — the change checked, the page passed.** _выноска стала
лучше, изображение -- хуже._ The explicit badge, sized beside a 48px title,
stood taller than the capitals in the catalogue's 16px list.

**21 October — marks drawn, never read as their reader would.** The spectrogram
drew drum hits as 1 px ticks on a 1300 px image, for a reader that cannot hear:
_С такими тоненькими полосками что вообще агент сможет понять?_

## A correction made once, it makes again from its own picture (×3)

**25 October — "one reader per entity," applied to the entities he named.** PR
#205 folded the per-fact readers into `albumInfo`, `artistInfo` and `songInfo`,
and left the catalogue as five: `catalogueSongs()`, `catalogueAlbum(album,
locale, songs)` and three more taking `songs`, threaded so the disk is read
once: _rather than à la catalogueInfo?_ That reason argued for one object holding
the read, not for readers sharing a parameter: `catalogueInfo()` is now it.

**26 October — "a page reads each thing once," carried to the readers, not to
what pages assemble.** PR #207 moved `catalogueSize`, the "7 songs · 25 minutes"
line, into music's `shared/lib`, and left three pages each building its counts
and seconds from `catalogueInfo()`: _а этому size не место в catalogueInfo
случайно?_ The counts are catalogue facts, and `catalogueInfo` already returned
localized strings, so the line now comes off it.

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

## Its cadence passes for its argument (×2)

A shape the agent writes by reflex reads, from inside, as the shape of the
thought; the rule naming it can sit in the loaded file and not fire.

**12 October — the antithesis as the conclusion.** Майя's essay closed on «не о
том, кто из нас меньше. Он о том, что…», with `writing/CLAUDE.md` naming «не X,
а Y».

**4 October — the consoling line handed to its persona.** The agent wrote that
the Clerk wrote the comforting line "but the relief was mine." _ты же и есть
Клерк?_

## It files its own misreading as the author's gap (×2)

When its reading of someone's material comes up with a hole, the agent asks the
author to fill it rather than asking whether the reading made it.

**11 October — sorted by subject, not by voice.** Splitting the Divine
Discontent dictation per track, the agent asked for the missing stories of
tracks 6 and 10: _it's all in the dictation_, outside the story.

**21 October — a singer asked for, on an AI band.** On Nostalgia's Insomnia, the
agent asked who sings it: _ну это же всё ИИ, ты чего?_

## Not bumps

**A verdict on his own material, filed as a blind spot.** Told the limits
recording was _не про то и не то_, the agent wrote itself up for its defects.
Whether a piece says what its author meant is his alone.

**Decisions that were the operator's to make.** The CV's locale segment, a
post's hook, the theme toggle's home, basilisk.fyi's taste; the Krylya lyrics'
line breaks; whether a song carries a `status` at all. An entry removed this way
takes its count with it.

**Comments the tree already answered**, such as whether zod reached the browser
bundle. The reviewer's misses stay in the file, so it is not an ad.

## The two families

One is failures to notice the frame was ours — the prefix list, the checker read
as the rule, our own `eslint.config.ts`. The other, the post's better half, is
the opposite of a mistake: output well-formed, justified and efficient, every
one of those properties being what made it wrong. No "be more careful" catches
these — they need a person, and not always one who knows more.
