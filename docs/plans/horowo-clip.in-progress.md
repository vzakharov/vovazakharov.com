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

Asked 2026-11-28 with the storyboard; none answered yet. The defaults the lead
acts on are in § "Design decisions".

1. Which variant, or which mix.
2. Where the clip lives: a page that plays it, an mp4, or both.
3. Words on screen.

## The song

`docs/remove-before-merging/horowo-song-mastering-oia0kq/blind/horowo/mix.mp3`
on `claude/horowo-song-mastering-oia0kq` (PR 240), 1:59.7, about 155 BPM. The
words are `…/lyrics/horowo.md` on that branch. Measured from the mix:

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

Nobody yet. Children start once a variant is picked: the pick decides the
packages.

## Built, in flight, left

- **Built**: the song map above; the cast sheet and three storyboard sheets.
- **In flight**: the operator's pick.
- **Left**: the renderer seam (`frame(t)`, the beat grid as data, the puppet),
  then scenes as parallel packages, the page, the export, the preview.
