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
- In flight: preview slot 1, the PR and its review board. Left: `/five-percent`
  on the PR, the operator's look on a real GPU.

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
