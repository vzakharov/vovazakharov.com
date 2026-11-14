# The drowsy eye in the cube

A `/carte-blanche` run, lead on Opus. This file is the lead's memory.

## Standing rules (operator, verbatim)

- «делай в режиме /carte-blanche (но на Опусе)»
- «меня не спрашивай, кажется, обсудили достаточно»
- «не забудь доску обновить» — the review board, after the build.

## Answers

No batch of questions was asked (operator: no questions). Both questions below
take their recommended answers: **1a** (off by default) and **2a** (vignette its
own knob).

## Team

- **Builder** — child session `session_01DaohkDmAN4kMsfC88FQYVE` on Opus, branch
  `claude/drowsy-eye-build-ha4w78`, owning every file under "Files"; reads
  `docs/plans/drowsy-eye-prototype.md` for the shaders to port. One builder, not
  several: every piece goes through `renderer.ts`'s `draw`, so parallel children
  would collide in one function.

## Status

- Built: everything under "Files", by the builder (head 15d1ad6c, vet green on
  run 43608036038), merged into this branch as 75e9e9c0. Seen rendering only in
  SwiftShader WebGPU; no GPU timestamps there, so the slowdown's GPU ms is
  unverified on real hardware.
- Published: preview slot 1 (https://preview.vovazakharov.com, built from
  75e9e9c0), PR https://github.com/vzakharov/vovazakharov.com/pull/281 with its
  squash proposal, review board
  https://claude.ai/artifact/BxBFPz3uShGcazjTpLQpP3 (watched).
- In flight: a diagnosis agent on the operator's «посмотри управление с
  телефона, почему-то кажется что оно не работает» — touch controls in the cube,
  this branch vs main; diagnosis only, no edits.
- Defaults changed on the operator's word (ab09a59c, on preview slot 1):
  «Умолчание: сонный глаз 100%, 1/9, без slowdown. А то с телефона я консоль не
  достану».
- Operator's verdict on the phone, verbatim: «Просыпание классно, но телефон
  управление не работает. А ещё облака почему-то все ещё пиксельные».
- Operator, verbatim: «А по коду там непонятно что ли? Может там просто не
  прописано и всё, прежде чем тестировать?» — both causes were in the code:
  - **Clouds** (02b29739): the low pass handed the layers its own size but the
    canvas's `detail`, and the sky sizes its march target from both, so at share
    3 the clouds were marched 3× coarser each way. Fixed by passing
    `detail / share`.
  - **Touch**: never written — `features/player/ui/input.ts` took keys and a
    pointer-lock mouse only, on main too, and a tap asked for a lock a phone
    refuses. Built `features/player/ui/touch.ts`: left half a floating stick
    (walk/strafe), right half drag-to-look, a short still tap uses. Decided
    without asking: a floating stick over a fixed one, since nothing on screen
    has to be drawn for it.
- Operator, verbatim, on whether the eye wakes indoors: «Да но если её просто
  отключить, то все равно будет тормозить. Нужно оставить для той части что
  снаружи, но отключить для внтурненостец куба — так можно?» Interim (this
  commit): the eye is drowsy only in frames that show the outside, so floors
  below 1 draw whole.
- **The split**, built (d5737274): indoors with the outside in view, the low
  pass draws the outside's layers alone, the resolve rebuilds it, and a
  full-size pass lays it under the rooms (`underlay.wgsl`, depth from the
  history's metres) and draws rooms, boards and mirrors whole over it. Out of
  doors (`waking`) the whole frame still drowses, because the sea's reflection
  is screen-space and would lose the cube if the cube left the low pass.
  Rendered in SwiftShader on floor 1 and the shore with no validation error; the
  doorway seam itself not yet seen (headless pointer lock gives one jump). The
  `F` meter stamps the low passes only, so the sharp pass's cost is not in its
  GPU ms yet.
- Operator on the phone, verbatim: «Я попробовал на телефоне, хорошо. Внутри
  первой комнаты по-прежнему подтормаживает, но терпимо, лучше пусть будет четко
  тут. Проблема, на телефоне никак не нажать Y или N, так что нужно выводить
  какие-то нажимали. Можно в той же надписи которая выводится делать [Y] и [N]
  нажимабельными. Ещё раздражает что сообщения типа нажми Q висят вечно пока не
  нажмешь. Но собственно надпись о качестве уже нужно убирать. Ещё нужно
  локально запоминать бежит ли или ходит игрок по дефолту. По управлению тачем
  как-то стремно, перечисли ещё раз какие там контролы.» And: «А на борду ты
  добавлял что мы сделали?» (yes: board v3 has everything to d5737274; a
  screenshot from them is coming.) Their screenshot (phone, landscape): the
  shore, head rolled, clouds doubled along the turn by the smear, and «Press Q
  to change the quality» hanging. The board holds the diff only, no frames,
  though carte-blanche asks milestone frames on it — none are there yet. All
  four built in 56687a8f: `pill.ask` fills `{yes}`/`{no}` with `.key` buttons
  calling `Walk.answer` → `InputBinding.say`; the `quality` hint and its
  frame-rate watch are deleted (the echo after Q stays); the `run` hint shows
  `RUN_TOLD_FOR` = 6 s a visit; `features/player/ui/stored-pace.ts` keeps
  `runsUnheld` in localStorage, a stored pace counting as Shift learnt. Its two
  `catch` blocks are silent fallbacks, approved by the operator: «ой да
  переживут».
- Operator, on the frames page and the board (18:00 UTC), verbatim: on the Y/N
  frame «можно на тапальных менять "Press" на "Tap"?»; on the frames page «а
  зачем это здесь, почему не на основной борде?»; on `touch.ts` «ах, вот оно
  что. ну давай хотя бы на время покажем наложение типа-клавиш-управления на
  экран, а то как люди догадаются, где что делать»; on `underlay.wgsl` «почему
  roomS? оно же никак с другими комнатами кроме первой вообще не
  взаимодействует?»; in chat «так, это баг, глюк или что: облака (причём только
  они) на medium смотрятся лучше чем на High. Тело не шевелю» with two crops:
  high shredded at the cloud's edges and banded, medium clean. Cause: the
  resolve reprojects history by the eye alone and the clouds drift on the wind,
  so a still eye keeps stale cloud for up to 9 frames; high has more pixels per
  degree and fewer frames a second, so the drift crosses more pixels per
  refresh. Fix: the sky trusts its history only while the eye turns.
- Built: the still sky drawn fresh, Tap wording and the controls overlay
  (da8454bc, on preview slot 1); the board shows images (a Sonnet subagent's
  `claude/board-frames-ha4w78`, dda339e1, merged), and the frames sit in
  `docs/remove-before-merging/frames/` as focus items; `rooms` answered
  (7ae53255). The separate frames artifact XmWzbERkyr3dwYoJdgFC4m is superseded
  by the board.
- Operator, verbatim: «так, ну вроде ок, только оверлея с контролами я не
  увидел. Ещё: 1- "Press E to ..." -- "Tap to ..." 2- подумал, что [Y] и [N]
  таки не имеют значения когда клавы нет, лучше бы просто [Swallow] [Put down]
  (или как там было) 3- как бежать на телефоне непонятно, предлагаю просто типа
  если палец далеко продвинул, то это бег, близко -- шаг», then «у меня айфон
  если что». Both misses read as the touch screen going undetected or the
  overlay's 8 s spent on the waking's dark: a touch is now told by the last
  input (a finger yes, a mouse or a key no, a coarse pointer before any), the
  overlay holds until the first drag, the answers are `Swallow` / `Put down`
  buttons on touch, and the stick runs past 100 CSS px.
- Left, in this order:
  1. The operator's look, on the iPhone, at the clouds on high, the overlay and
     the stick's run.
  2. Touch, once the operator says what feels off: a visible stick ring, a run
     when the stick is pushed to its rim (a phone has no Shift).
  3. `/five-percent` on the PR; refresh the board after each pushed fix.

## Goal

Bring the drowsy eye, prototyped in the artifact
https://claude.ai/artifact/9x6LAXhRYwo9c5yRFzxCXW, into the cube's renderer, so
that the intro's frame costs about a 1/N² share of today's scene and mirrors
plus a fixed resolve, instead of the whole of them. Every knob is set from the
browser console (`cube.set…`), so the operator can compare settings on real
machines, and the console can slow the GPU down by a factor to stand in for a
weaker machine.

The operator's words: «так, давай в общем делать. параметры должны быть доступны
через консоль (`cube.setBlablabla`), буду сравнивать. Если легко, "эмуляцию fps"
тоже добавить (в виде замедления а не абсолютного значения)». Their earlier
verdicts from the artifact: drowsiness 100 reads much better than 0; smear is a
feature, not a defect ("embrace the glitch"), so convergence when standing still
matters less than the look in motion; the vignette's purpose is still open
(question 2).

## What the frame becomes

Today (`src/cube/pages/cube/ui/renderer.ts` `draw`): outdoors `prepare` → scene
pass (light + mirror targets, distance in the light's alpha) → `reflection.run`
→ `bloom.run` → lens pass to the canvas.

With the drowsy eye on, at share N (2, 3 or 4):

1. **Low pass.** Outdoors `prepare`, the scene pass and `reflection.run` all run
   on targets of `ceil(W/N) × ceil(H/N)`, with the view-projection shifted by a
   sub-pixel offset so the low pixel `(i, j)` samples the full-resolution pixel
   `(N·i + dx, N·j + dy)`. The offset `(dx, dy)` steps through the N×N block in
   the spread order the artifact uses (`PHASES`: diagonals for 2, the spread
   list for 3, Bayer for 4), one step per frame. Mirrors are in the low pass
   because `reflection.run` reads the scene's mirror targets at their own size
   and hands back the lit view with the distance alpha intact
   (`reflection-pass.wgsl` returns `lit.a`).
2. **Resolve pass** (new, `drowsy-resolve.wgsl`). Full-size, writing one of two
   ping-ponged history textures: the fresh pixel takes the low sample; every
   other pixel is reprojected from the previous history by the distance in
   alpha, the previous frame's eye and view-projection, with the artifact's
   drowsiness terms — lag, smear along motion, clamp-to-neighbourhood fading out
   as drowsiness rises, disowned history melting into the smeared fresh view,
   fresh-pixel inertia — and the per-pixel trust carried in alpha alongside the
   distance (two channels: the history is `rgba16float` light + a second
   `rg16float` for distance and trust).
3. **Bloom and lens** run on the resolved texture, unchanged.

**No scatter.** The prototype's per-block random entry into the order cannot be
ported: it ray-marched, so each low pixel chose its own sub-pixel offset, while
the cube rasterizes with one view-projection per pass (the outdoors' prepare
passes too), so every low pixel shares the frame's offset. Per-tile passes would
multiply vertex work and the outdoors' buffers; a full-res masked pass saves
nothing at share 2, GPUs shading 2×2 quads. The builder found this; the lead
dropped the knob rather than ship a setter that only throws. The lattice it was
for is the accepted cost ("embrace the glitch"); a resolve-side dither that
breaks it without moving samples is the follow-up if the operator dislikes it.

**Vignette** is applied in the lens pass from a uniform, so it costs nothing
when zero (question 2 decides its default).

With the drowsy eye off, the frame is exactly today's: no extra pass, no history
held.

## Console

A `cube` object on `globalThis`, installed while the cube page is mounted and
removed on its disposal:

- `cube.setDrowsy(on: boolean)` — the drowsy eye on or off.
- `cube.setShare(n: 2 | 3 | 4)` — one pixel in n×n per frame.
- `cube.setDrowsiness(x: number)` — 0…1, the artifact's slider.
- `cube.setVignette(x: number)` — 0…1, independent of drowsiness.
- `cube.setSlowdown(k: number)` — ≥ 1; every pass of the frame is encoded
  `floor(k)` times over and once more under a scissor covering the fraction, so
  the GPU spends k times today's work on the same picture. Repeats are separate
  render passes with `loadOp: 'clear'`, which a tiled GPU cannot skip the way it
  skips overdraw inside one pass (the artifact's lesson on the operator's Mac).
- `cube.settings()` — the current values, so a comparison can be written down.

Each setter validates its argument with a zod schema derived from one settings
schema, throws on a bad value with the schema's message, and logs the new
settings. Settings live for the page's life, not in storage.

The `F` meter gains a `resolve` stage in `pass-timer.ts`'s `STAGES`, stamped
like the others, so `GPU ms: scene · mirrors · resolve · glow · lens` shows what
the share buys.

## Defaults

Recommended: **off by default** (question 1), so the merged site draws exactly
as today until the operator picks settings from the console comparison; the
defaults it starts from when switched on are share 4, drowsiness 1, vignette
0.35.

## The world rule

`src/cube/CLAUDE.md`'s second rule says "nothing remembers earlier frames",
which the history breaks in letter. The operator clarified that the rule is
about the world's state (a wave arriving for everyone at once, the cat running
the maze), not what one player's eye perceives. Reword it in this change to say
so, keeping its point: the world's state is a pure function of place and shared
clock; how a player's eye presents it may carry their own earlier frames.

## Files

- `src/cube/pages/cube/ui/renderer.ts` — the low pass, the resolve, history
  targets, slowdown repeats. It is at 399 lines, the repo's limit, so the drowsy
  eye's targets, phases and resolve encoding go to a new `drowsy-eye.ts` beside
  it, the way `reflection.ts` and `bloom.ts` sit, and `draw` calls it.
- `src/cube/pages/cube/ui/drowsy-resolve.wgsl` (+ its `.shader.generated.ts`, by
  the existing codegen).
- `src/cube/pages/cube/ui/drowsy-settings.ts` — the schema, defaults, the
  console object; `drowsy-settings.test.ts`.
- `src/cube/pages/cube/ui/drowsy-phases.ts` — the spread orders, the sub-pixel
  offset → view-projection shift, the low target size; `drowsy-phases.test.ts`
  (each pixel of a block exactly once per N² frames; the shift lands low pixel
  centres on the intended full pixels).
- `src/cube/pages/cube/ui/pass-timer.ts` (+ test) — the `resolve` stage.
- The lens WGSL that reads `uniforms` — the vignette term.
- `src/cube/pages/cube/ui/cube-canvas.tsx` or wherever the renderer is created —
  installing and removing the console object.
- `src/cube/CLAUDE.md` — the reworded rule.

## DRY notes

- **Reused**: `reflection.attachments(width, height, clear)` makes the low
  pass's targets at the low size — no second target factory. `bloom.run` and the
  lens consume the resolved view through the same `GPUTextureView` they take
  today. The pass timer's stamping is extended, not copied.
- **Shared**: the spread orders and the per-block step are one function in
  `drowsy-phases.ts` on the CPU side; the WGSL resolve needs the same order for
  its "fresh" test, so the orders are emitted into the shader as a generated
  constant from that one TS source, rather than typed twice.
- **Not extracted**: the slowdown repeat is a loop around each pass in `draw`; a
  "repeated pass" helper would wrap four differently shaped encodings for one
  debug feature, and would outlive its use badly.

## Testing

`pnpm test` covers the pure parts (phases, offsets, sizes, settings schema). The
look is checked with `/preview` on the intro at shares 2 and 4, drowsiness 0 and
1, and in motion (the intro's turn), plus `cube.setSlowdown(4)` with the `F`
meter to see the GPU time scale.

## Questions

1. **Default state.** a. Off until the operator picks settings from the console
   (recommended: merging changes nothing anyone sees). b. On in the intro only,
   at the defaults above. c. On everywhere the outside is drawn.
2. **Vignette.** Its two jobs were hiding the blurry strip a turn brings in at
   the frame's edge, and suggesting half-closed eyelids. a. Its own console
   knob, default 0.35 when the drowsy eye is on (recommended: it can then be
   compared, and zeroed, without touching the smear). b. Drop it.
