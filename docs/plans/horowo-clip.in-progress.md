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

2026-11-28, with a screenshot of the usage limits (5-hour 28%, weekly all models
78%, weekly Fable 4%, the weekly ones resetting Monday 23:00), verbatim:

> 1- нужно поглядывать за лимитом и вовремя фиксировать прогресс (в идеале ещё
> разворачивать его -- либо артефактом, либо на превью. в принципе артефакта
> должно хватить)
>
> 2- #240 скоро смерджится, надо будет его вмерджить
>
> 3- как всё закончим, и если лимит ещё не кончится, нужно сделать вертикальную
> версию 30 секунд для сториса в телеграмме, и заканчиваться он должен короткой
> нарезкой из видюшек, как в конце
> https://github.com/vovas-music/lebed/commit/161d879e7e1e9dd0e1c7299ddf4bc5b8fc92fe6d#diff-99cc97a52a50eeba0c2eb0eb798aeafc2ecf7d006de07acb4c6324b82ef8acb1
> (только используемые видюшки надо выложить в релиз, а не в репу)
>
> 4- а, ну и то что здесь делаем, тоже лучше делать через релизы, чтобы не
> забить всю историю

And a question a few minutes later, verbatim:

> а, собственно, видео же никто генерить и не будет пока мы не завершим, это
> будет обычный хтмл? у тебя чуть ли не тула для таких видео-артефактов
> ("эксплейнеров") есть, но не знаю, насколько она подходит для концертов в
> дурдоме гг

Answered: yes, plain HTML until the end, the mp4 walked out of the same code
last. The tool is the "Motion" artifact type, and it was weighed and left: it
allows no scene under a second and no more than three cuts a second, which is
the zapping; its looks must suit a room of coworkers; and a film lives in the
artifact's own store, so the site's page would no longer be the clip's code. One
thing is taken from it as the clip's own rule: **no full-frame flash faster than
three a second** — cuts ride the beat (about 2.6 a second), never a strobe.

Then the song's structure by feel, verbatim:

> обращай внимание ещё на изменения темпа, там примерно такая структура:
>
> до 0:19 -- вступление (дискретные удары в начале такта), до 0:28 --
> double-time мясо до 0:36 -- первые полкуплета, бочка на четвертях, почти
> танцевальная до 0:43 -- вторая половина, типичный панковский standard time до
> 1:00 -- припев, халфтайм до 1:17 -- предбридж, четверть тайм (т.е. в 2 раза
> медленнее халфатайма) до 1:35 -- мелодичный бридж, четверть тайм потом до
> конца -- полностью меняется темп, медленный брейдаун с глитчами

It replaces the lead's own section map wherever they differ; § "The cut by feel"
below is the shot list redone against it.

And on how the rhythm shows, verbatim:

> ритм должен чувствоваться в видеоряде -- не перебарщивая, конечно, но нет-нет
> да бочка/ведущий должны совпадать со сменами кадра или ещё какими-то ощутимыми
> движениями

Then, on the lead's "measure the ending's tempo separately", verbatim:

> я не уверен что это только к концовке относится, интро возможно тоже другого
> темпа. пусть по каждой секции замерит
>
> #240 тем временем смерждился

So every section's tempo and downbeat is measured on its own, none assumed.

On the rhythm note: the kick and the snare are onset lists in the score, and
every scene has at least one thing that lands on them — a cut, a camera punch, a
head coming down, the TV's glow — while most of the frame stays off the grid, so
it reads as feel and not as a metronome.

The lead's reading of the four notes, each its own and open to correction:

1. Every milestone ends committed, pushed and playable from a link: the clip as
   it stands is published as an artifact (the page's code bundled into one HTML
   file, the song beside it). A preview slot is the fallback. The weekly limit
   across all models is the tight one, so wave 2 is sized to what is left rather
   than to what would be fastest.
2. When PR 240 lands on `main`, `main` is merged into this branch, `clip` takes
   `music` as a parent and the audio comes from the catalogue.
3. Last, if the limit allows: a vertical 30-second cut for a Telegram story,
   ending on a quick montage of video clips as that commit's does. The clips it
   uses go into a GitHub release, never the repository.
4. Nothing binary and heavy that this work produces is committed: every mp4 is a
   release asset. Board frames stay committed, small and few, under
   `docs/remove-before-merging/`, which a squash never carries to `main`.

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
- **0:43–1:00, chorus, half time — broadcast.** The band again, but heavy and
  slow: long held shots, a cut every two bars, heads coming down on the snare,
  serotonin falling thick and slow.
- **1:00–1:17, pre-bridge, quarter time.** The zapping slows to a crawl instead
  of speeding up: one channel a bar, each held long enough to read, the bunny on
  every one a step nearer the glass. Dread by patience.
- **1:17–1:35, the melodic bridge, quarter time — reality.** The one tender
  stretch. The bedroom gives way to the ward without a cut: the words written
  with a fingernail in blood appear stroke by stroke, the tallies spread past
  every edge, the bunny sits down beside him and they watch the TV snow
  together.
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
The sketch the storyboard was drawn with is committed for the children to port
from, under `docs/remove-before-merging/horowo-clip-lrxscd/sketch/`.

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

Wave 2, once wave 1 is merged and wired: the broadcast scenes, the reality
scenes, the pack of zapped channels — sized to the limit left. The lead
assembles the timeline and cuts it to the beat.

## Built, in flight, left

- **Built**: the song map; the cast sheet, three storyboard sheets and the
  second take of the wall; the drawing kit.
- **In flight**: wave 1, four children.
- **Left**: merging and wiring wave 1; the clip as an artifact; wave 2; the
  assembly; the mp4 as a release asset; merging `main` once PR 240 lands; the
  30-second vertical story cut, last.
