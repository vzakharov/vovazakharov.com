# A music video for «Хорошо!» (`horowo`)

The lead's memory for a `/carte-blanche` run. Written for the lead and whoever
wakes up after a compaction; no approval gate runs on it.

## The operator's standing rules, verbatim

The task, 2026-11-28:

> давай снимем клип на песню "Хорошо!" из #240 (сам PR пока не доехал, но я
> думаю скоро доедет. В любом случае, нас интересует для целей этой задачи
> только сама музыка). Эстетика -- Gorillaz + 90е + мой "робоаватар"
> (перерисованный, конечно) в качестве "певца" и музыкантов (на тех кадрах где а
> ля игра вживую), варьировать можно достаточно свободно если чувствуешь
> какую-то "жилу". Должно быть смешно и страшно, красочно и мрачно одновременно.
>
> можешь накидать образный сториборд (не обязательно все сцены) с немного
> разными вариациями подхода, я выберу

The avatar reference is a photo attached to that message: a man's face under a
gun-metal half-mask shaped like a skull — it covers his right eye (a red LED),
runs a crest up the forehead and covers everything below the cheekbones; the
left eye is his own, a goatee shows under the chin, black scarf, grey striped
jacket.

The mode, from `.claude/skills/carte-blanche/SKILL.md`: never merge to `main`,
no outside services, a remark is not an order, MASD and the linters and the
400-line cap are not negotiable, the preview is always worth looking at.

## Answers to the one batch of questions

Asked 2026-11-28 with the storyboard:

1. Which variant, or which mix.
2. Where the clip lives: a page that plays it, an mp4, or both.
3. Words on screen.
4. Whether the puppet on the cast sheet is the avatar, or the face should sit
   closer to the photo.

The operator answered the first, the same day, verbatim:

> эстетика -- варианта 1 точно, только надпись должна быть больше похожа на
> выведенную "ногтём-карандашом" (кровь и пр.), а чёрточки-считалочки должны
> перечёркиваться после каждых четырёх, и конца их не должно быть видно. Ещё
> понравилась идея зайчика ночью + зайчика с хрустальным шаром в конце.
>
> канал "ГБ" а не "ХО"

2–4 stand unanswered, so their defaults in § "Design decisions" hold.

## Steering since

Every message from the operator after the first answers, verbatim and in order,
each with the lead's reading, is in
`docs/remove-before-merging/horowo-clip-lrxscd/steering.md`. A new one is
appended there in a commit of its own before any code changes.

## The song

`docs/remove-before-merging/horowo-song-mastering-oia0kq/blind/horowo/mix.mp3`
on `claude/horowo-song-mastering-oia0kq` (PR 240), 1:59.7, about 155 BPM. The
words are `…/lyrics/horowo.md` on that branch. The operator's map of its
sections by feel (§ "Steering since") is the authority on where they start and
how they move; the lead's own measurements from the mix, kept for the detail
inside them:

- **0:00–0:18** — the first stanza over no bass or kick, ending on «Как, сука,
  хорошо» at 0:16.
- **0:20–0:28** — the band comes in, instrumental.
- **0:28–0:42** — the growled verse, seven «(Хорошо!)» calls each answered by a
  line.
- **0:42–1:02** — the chorus, full band.
- **1:02–1:32** — «Хорошо» chanted, building.
- **1:32–1:36** — a drop to near silence.
- **1:36–1:58** — stabs and holes: hits at 1:36–1:39, 1:41–1:43, 1:47,
  1:50–1:53, silence at 1:44, 1:48 and 1:53, tail to 1:58.

The final master replaces the mix when PR 240 lands; nothing here depends on
which master wins.

The song's own repository, `vovas-music/horowo`, is readable with `gh api` and
over `raw.githubusercontent.com`: the master the page plays
(`horowo_master.master.mp3`), and the isolated vocal stem
`Media/audio [vocals].wav`, whose loudness envelope drives the jaw.

For the story cut, the operator's reference is the last seconds of
`Я куплю тебе дом.mov` (105 MB) in `vovas-music/lebed`, added by commit
`161d879e` with six short generated clips under `Media/`: it ends on a quick
montage of them. Here the montage is cut from the clip's own shots, rendered to
files that go into a release — the lead's reading, to be checked against the
reference's last seconds before cutting.

## Design decisions

- **Everything is drawn in code.** No outside services means no image or video
  generator, so the look is flat-colour ink cartoon in SVG or canvas: fat
  outlines, one wobble filter for the hand-drawn line, grain on top.
- **The avatar is a puppet with a hinged mask jaw.** The mask sings, not the
  man: the jaw plate drops like a nutcracker's, so lip-sync is one number driven
  by the vocal envelope. Beaten alternative: a drawn mouth under the mask, which
  hides the one feature the avatar has.
- **The band is the same man four times**: guitar (mohawk), vocal, bass (wide,
  small head, both eyes LEDs, bald), drums (small, big head, green LED).
- **The antagonist is the ghost bunny off the wallpaper** — paper-flat, button
  eyes, stitched grin, too long everywhere. It is in every variant.
- **The storyboard was sketched by a throwaway generator under `tmp/clip/`**,
  not kept: the clip's own code is written fresh under `src/` once a variant is
  picked.

### The three variants put to the operator

Sheets in `docs/remove-before-merging/frames/storyboard-*.jpg`.

1. **Канал «ХО»** — the clip is a VHS tape of a 4:3 TV broadcast. The quiet
   intro is a children's show; each «(Хорошо!)» is a channel change; the bunny
   is on every channel, closer each time; each hole in the finale is the TV
   going dark, showing who watched it. Only "reality" is 16:9 and clean.
2. **Зайчик с обоев** — one room at 3 am: a panel flat, a carpet on the wall,
   bunny wallpaper with one bunny missing. A chase that turns into a dance
   inside the carpet's ornament; by morning the carpet is crayon on a ward wall
   and the ghost bunny is a patch of sunlight.
3. **Ёлка в дурдоме** — a concert film in a hospital assembly hall: pots for
   drums, orderlies in bunny masks, comic-book close-ups, and a last pull-back
   to a snow globe.

**The lead's recommendation is 1 as the frame**, with 3's hall as the "live"
channel and 2's bunny as the thread. The words already quote Soviet children's
verse and cartoons, channel changes fit the call-and-response verse and the
stop-start ending cut for cut, and a tape forgives a different drawing hand per
channel.

### The clip as picked

Variant 1's look carries the clip, with two scenes taken from the others: the
bedroom at night from 2 and the snow globe from 3. Two layers, told apart by
their picture:

- **The broadcast** — channel «ГБ», 4:3 inside the 16:9 frame, seen through a
  tape: chroma split, scanlines, a tracking bar, on-screen display.
- **Reality** — full 16:9, clean ink, dark: whoever is watching the channel.

#### The cut by feel

The shot list, against the operator's map of the tempo in § "Steering since":
the picture's pace is the drummer's, so it halves when he does.

- **0:00–0:19, intro, a hit on each bar's first beat — broadcast.** A children's
  show. The host sings the first stanza to camera; nothing moves between the
  hits and everything jolts on one: the cardboard sun's eyes snap to him, the
  bunny rises a notch behind the hill, the camera punches in. On «Как, сука,
  хорошо» the jaw drops all the way; the set wall falls into static.
- **0:19–0:28, double time — broadcast.** The band live in a TV studio at full
  tilt: a cut on every beat between the four and a wide shot, the audience a row
  of bunny ears.
- **0:28–0:36, first half of the verse, kick on the quarters, almost a dance —
  reality and broadcast.** The bedroom at 3 am, the TV in the corner pulsing on
  every quarter, the man in the bed nodding along against his will. Each
  «(Хорошо!)» is the TV full-frame on a new channel for a beat (the teleshop
  spoon, the weather, a quiz board with the three words, a village postcard),
  and the line that answers it plays in the bedroom.
- **0:36–0:43, second half, straight punk time.** The same exchange, rawer: the
  bunny-shaped hole in the wallpaper, the bunny by the window, then at the foot
  of the bed; the channels (the news, a test card) have him in them.
- **0:43–1:00, chorus, half time — broadcast, cut with reality.** Faux-happy:
  back on the kids' show meadow, and everyone is having a wonderful time. The
  four of the band hop about with their instruments, bunnies dance in a ring,
  the cardboard sun bobs and grins, the letter blocks bounce — all of it landing
  together on the half-time snare, smiles a size too wide, serotonin coming down
  like confetti. Between the hops, hard cuts to the ward for a beat or two: a
  fingernail gouging the next strokes of «КАК, СУКА, ХОРОШО» into the paint, the
  words further along at each return and finished by the chorus's end. The third
  thing in the rotation is the band live in the studio, a bar at a time — three
  pictures that should not share a song: the meadow, the wall, the gig.
- **1:00–1:17, pre-bridge, quarter time.** The zapping slows to a crawl instead
  of speeding up: one channel a bar, each held long enough to read, the bunny on
  every one a step nearer the glass. Dread by patience.
- **1:17–1:35, the melodic bridge, quarter time — reality.** The one tender
  stretch. The bedroom gives way to the ward without a cut: the words the chorus
  scratched are on the wall, the tallies spread past every edge, the bunny sits
  down beside him and they watch the TV snow together.
- **1:35–end, a new, slow tempo, a breakdown with glitches.** The tape itself
  breaks down: each stab a channel at full colour torn by tracking errors, each
  hole the silent ward. Then the pull back through the window — the hospital is
  a snow globe in the bunny's paws, serotonin falling only inside — and the
  picture collapses to a CRT dot.

### How it is built

- **A new app, `src/clip/`, parent `scene`, mounted by `vova`** at
  `/music/clips/horowo` in the `(game)` route group, which has no site chrome.
  It takes `music` as a second parent when the song page lands on `main` and the
  audio comes from the catalogue; until then the audio is
  `https://raw.githubusercontent.com/vovas-music/horowo/main/horowo_master.master.mp3`,
  checked to answer `audio/mpeg`.
- **Canvas 2D, a 1280×720 logical stage.** Beaten alternative: SVG, which the
  sketch used — its full-frame filters would not hold 30 fps on a phone. The
  hand-drawn line is a boil instead of a filter: every path's points are nudged
  by seeded noise that changes eight times a second.
- **One pure `frame(ctx, t)`**: no wall clock, no `Math.random`. The page calls
  it with `audio.currentTime`; the export script calls it per frame over the
  DevTools protocol, as `src/island/scripts/film-descent.ts` does, and muxes the
  song in with ffmpeg.
- **No `ctx.filter`**, which Safari lacks: the tape look is compositing only.
- **The jaw is driven by data**: word timings from the transcript on PR 240
  reconciled with the published words, committed as a module.

### Defaults acted on until the operator says otherwise

- **The clip is a page and an mp4 from the same code**: a deterministic
  `frame(t)` the page plays against the audio and a script walks frame by frame
  into a file.
- **16:9, 1080p, 30 fps**, the whole 1:59.
- **Words appear only where the scene has them** — a karaoke line on a channel,
  the three words scratched on the wall — never as subtitles.

## Where things are

- **PR**: https://github.com/vzakharov/vovazakharov.com/pull/295, draft.
- **Board**: https://claude.ai/artifact/5hqSFnzRjgT8nVshU3oeKJ, watched by the
  lead's session. Every frame goes there the turn it exists, as a JPEG under
  `docs/remove-before-merging/frames/` with its verdict in
  `docs/remove-before-merging/review-focus.json`.

## The team

The lead is `session_01MZoAKCKwqeVGKcCw6iKKPs` on `claude/horowo-clip-lrxscd`.

The lead landed the drawing kit itself, `src/clip/shared/ink` (`Pen`, `ink`,
`limb`, `at`, `path`, `polygon`, `ellipse`, `rng`, `noise`, `INK_PALETTE`,
`STAGE`), before anyone started, so no two packages write it twice. A child that
needs more adds a new file there and one export line.

Wave 1, started 2026-11-28 10:29 UTC from the lead's `71b7bb75`, each on its own
branch; each reports with one `send_message` to the lead:

- **engine**, Opus, `session_01MZoAKDHpcNax8XmHbMJmAK`,
  `claude/horowo-clip-engine-lrxscd` — `clip` into vova's parents, the route,
  the page and its player (`?t=` stills), the timeline with a placeholder card
  per section, the score (beat grid, word timings, `jaw(t)`, `energy(t)`, the
  «Хорошо» onsets), the export script `film:clip`. Owns `src/clip/pages`,
  `src/clip/scripts`, `masd.json`, `package.json`, `knip.ts`.
- **cast**, Fable, `session_01MZoAKBkF3h1YJyKztvmqtT`,
  `claude/horowo-clip-cast-lrxscd` — the puppet as a rig of named joints with
  the hinged jaw, outfits, the four band forms, instruments, playing cycles on a
  beat phase, a cast sheet. Flagship because it is the clip's look. Owns
  `src/clip/entities/puppet`.
- **tape**, Opus, `session_01MZoAKD4RDV89XAtTpvb3py`,
  `claude/horowo-clip-tape-lrxscd` — the 4:3 tape picture with a `wear` dial,
  the dot-matrix on-screen display, the channel change, static, the tube
  switching off, reality's grain and vignette, a test card. Owns
  `src/clip/shared/tape`.
- **props**, Opus, `session_01MZoAKBLUod263MnDXVYSWV`,
  `claude/horowo-clip-props-lrxscd` — the bunny with a nearness dial, its
  wallpaper and the audience's ears, stroke lettering for the whole alphabet in
  three renderings (plain, bubble, scratched), the tally wall, the serotonin
  fall, the snow globe. Split from cast so the two run side by side. Owns
  `src/clip/entities/bunny`, `src/clip/shared/lettering`.

Frames from each arrive as `docs/remove-before-merging/frames/<package>-*.jpg`.

As of 11:10 UTC: **tape** merged at `e7d0a99e` and **cast** at `5819b8b5`, both
sessions archived. The cast's API, for a scene's author — all from
`@/clip/entities/puppet`, sides L/R the viewer's, the puppet about 590 tall at
scale 1 and placed by the floor between its soles:

- `puppet(pen, { place, pose, reach, build, outfit, look, held, behind, front, tucked, legless, mark })`
  — `pose` a `Pose` or a name of `POSES` (stand, wide, cheer, sing, welcome,
  point, shrug, cower, sit); `outfit` one of jacket, strait, suit, pajama, toy;
  `mark` tells one puppet's boil from another's.
- `head(pen, look, seed)`;
  `Look = { jaw, gaze, brow, lid, led, eyes, hair, sweat, turn, nod }`.
- `player(pen, role, { beats, jaw, place, outfit, look, mark })` — a band member
  playing; `beats` is the song's beat counter. `castSheet(pen, beats, jaw)`.
- `lerpPose`, `reaching`, `carried(pose, { sway, dip, lean })`, `fitted`,
  `guitar`, `micStand`, `thump(phase)`.

There is no hop cycle, joy face or scratching hand as such: a hop is
`carried(..., { dip })` with `place.y` moved, joy is `look` (brow raised, jaw
open), and the scratching hand is a `point` hand on `reach`.

A fix-up child, Opus, `session_01MZoAKAL6Cs5jtE5GjPiRDY`,
`claude/horowo-clip-cast-fix-lrxscd`, cut from the lead's `fbec4641`: the
fretting hand from under the neck.

As of 11:52 UTC: **props** merged at `4bf8a07c` (the wall's lettering in its
third, pencil-thin take) and archived; the fix-up child merged at `744a9f40` and
archived; **engine** merged at `ab976bb4` (sections with their own grids,
`pulse`, `KICKS`, `punch`, the jaw off the vocal stem, stand-ins on the tape)
and still alive for one last package, the pre-roll: `PREROLL = 3.2`, the
playhead starting negative so every scene stays in song time, `shots-ident.ts`
listed first in `shots.ts`.

The lead split `shots.ts` into a file per section itself (`786d62f5`), with
`stand-in.ts` beside them (`sectionNamed`, `beatsOf`, `standIn`), rather than
wait another round for the engine.

Wave 2, started 11:52 UTC from the lead's `786d62f5`, all Opus, each on a budget
of about $12, each owning the shot files of its sections and wiring its own
scenes into them. Their whole brief is
`docs/remove-before-merging/horowo-clip-lrxscd/wave-2.md`; a session's own
message only names its package:

- **A**, `session_01MZoAKCYpzFVG8CYLX323qQ`,
  `claude/horowo-clip-scenes-a-lrxscd` — widgets `kids-show` (intro) and
  `meadow-party` (chorus); `shots-intro.ts`, `shots-chorus.ts`. Leaves
  placeholders `ward insert` and `gig insert` in the chorus.
- **B**, `session_01MZoAKB8jcFjpioDt9FQYoB`,
  `claude/horowo-clip-scenes-b-lrxscd` — widgets `gig` (exports `gigInsert`) and
  `channels` (exports `channel(n)`); `shots-double.ts`, `shots-prebridge.ts`.
- **C**, `session_01MZoAKERHcdpfR5yxYMoa2y`,
  `claude/horowo-clip-scenes-c-lrxscd` — widgets `bedroom`, `ward` (exports
  `wardInsert(progress)`) and `ending`; `shots-verse.ts`, `shots-bridge.ts`,
  `shots-breakdown.ts`. Leaves placeholders `channel 1`…`channel 7` on the verse
  calls.

**The seam the lead wires at merge**: A's two chorus placeholders become
`gigInsert` and `wardInsert(progress)` with progress climbing to 1 by the
chorus's end; C's seven verse placeholders become B's `channel(n)`. Then
`pnpm bundle:clip`, the clip artifact republished, each package's `scene-*.jpg`
on the board.

If the limit stops a child, its branch holds every scene it wired; the lead
merges what is there and the stand-ins cover the rest.

As of 14:30 UTC: wave 2's first passes merged and wired (A `63c70c4f`, B
`a092f935`, C `5e296119`), all three archived, at $2.7–4.1 each. Second passes,
all Opus, started 12:01–12:06 with the lead's verdicts on the first; a five-hour
limit stopped everyone from 12:06 to 14:15, the operator woke them and asked to
wind down, and each wrapped up early:

- **A2**, `session_01MZoAKAhoBGMGL3JbRrRemY`, merged at `969f7a4f`, archived —
  the chorus escalating pulse by pulse, a hop with weight, the intro's host in
  the upper third, the sun's pupils reaching the rim.
- **B2**, `session_01MZoAKE77iQA45nCijhE6AX`, merged at `e35427c6`, archived —
  the pre-bridge's channels running down to a stop with the bunny's face on the
  glass (`channel(n, nearness, { zapFrames, creep })`), the gig jolted and
  headbanging, `gigInsert` in a `joy` mood.
- **C2**, `session_01MZoAKCbfeGhkpE8cgQDcPk`, merged at `fed29e73`, archived —
  the bedroom only: lit by the set, shadows, tilt and shake. Not started: the
  bunny seated in the ward, the globe pull-back in clear steps, differing
  breakdown holes.

The engine's pre-roll is merged at `21ddfda5` (the ident tunes in for 3.2 s
before the first note; the playhead runs negative there).

The closing child: **knip**, Sonnet, `session_01MZoAKAcUSg1fRJ5rpM2h4Q`,
`claude/horowo-clip-knip-lrxscd`, merged at `e46ac0be`, archived — the sketch
files removed, 119 unused exports and exported types dropped, nothing drawn
changed. Sonnet because it is removal by a list.

A second closing child: **cut**, Sonnet, `session_01MZoAKEnKtyV3xBLHtudkKi`,
`claude/horowo-clip-cut-lrxscd`, merged at `57cb7f00`, archived — the last nine
unused names could not leave their barrels without `masd:clusters` asking for a
sub-slice, so the meadow is cut into `block` and `scenery` and the puppet's body
into `pose` and `figure`. Three frames compared byte for byte before and after.

## Built, in flight, left

- **Built**: every section of the song drawn and cut, with the pre-roll ident
  before the first note; the chorus, intro, gig, pre-bridge and bedroom at
  second-pass level, the ward and the ending at first. `check:masd`,
  `masd:clusters`, `knip`, `type-overlap`, `tsc` and the line limit are green.
- **Not run**: `/dry` and `/tend-prose` over `src/clip`, left for the next
  session with the limit this low.
- **Out**: the mp4 at
  https://github.com/vzakharov/vovazakharov.com/releases/tag/horowo-clip
  (`horowo-clip-720p.mp4`, re-encoded from the 1080p master `pnpm film:clip`
  writes); `./scripts/vet.sh` green on `ae69ac20`.
- **Left**: the operator's verdict on the clip. After it: C2's three unstarted
  items, the 30-second vertical story cut, the video on the song's page.

**The limit**, by the cost ledger at 11:45 UTC: about $100 spent on the run,
which is roughly 14% of the week by the operator's two readings (10% spent at
about $65–70); about 11% was left. Wave 2 is budgeted at $36 plus the lead's
share. Park with `/relay park` at about 3% left.

PR 240 landed on 2026-11-28 and `main` is merged in at `c7773f84`: the song's
page, words and transcripts are in the tree, and the engine was told to merge
the lead's branch, take `music` as `clip`'s second parent and read the audio
from the catalogue.
