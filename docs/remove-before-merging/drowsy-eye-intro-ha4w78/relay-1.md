# Relay 1 — drowsy eye for the cube intro (parked)

## Standing constraints

None stated by the operator.

## The conversation

1. **Operator:**

   > проблема: интро куба жутко тормозит
   > сейчас решение: понижать пиксельность
   > рассматриваю следующее креативное решение: не менять пиксельность, но при любом движении, до того как отрисуется "настоящий" адр, двигать (зумить-панить-поворачивать -- когда просыпаешься например), с небольшим блюром, прежнюю картинку в направлении противоположном движению. Создатся такой эффект "немного drowsy человека", но когда стоишь прямо у тебя будет сходиться к высококачественной картинке. То есть попытка решить техническую проблему креативно. Не знаю только, можно ли всё это сделать так чтобы это на самом деле работало (т.е. не будет ли для видеокарты так же тяжело всё это панить-зумить, как перерисовывать новый кадр в полном качестве).
   >
   > второй вариант, если первый нежинеспособен: уменьшаеть качество, но не пикселями, а вообще методикой отрисовки -- грубо говоря, жертвовать "фотореалистичностью" (half-life 2 вместо crysis), но так чтобы это все равно выглядело уместно в игре
   >
   > что думаешь?
   >
   > пожешь сразу что-то посчитать-порисовать и выложить в артефакт

   **Agent:** Routed as rung 2 (no repo change). Published the artifact "Сонный глаз" with a WebGL demo, the GPU arithmetic and the traps. Verdict: the idea works only as amortized rendering (each frame draws ¼ of the pixels on a 2×2 jitter, the rest reprojected from the previous frame with depth); warping the old frame while a full one renders gains nothing, since the GPU has one queue. Costs ≈ `low` + 1–2 ms, converges to `high` in 4 frames when still. Industry name: TAAU / checkerboard (Killzone SF MP precedent). Option 2 hits the cube's rule "looks identical on any machine" if made a quality level. Asked the operator to press `F` in the intro on a slow machine and send the `GPU ms: scene · mirrors · glow · lens` line. Offered the muthur sync (one commit, 34a7f99e).

2. **Operator (artifact comment, thread e4be9b57, on "Полный кадр"):**

   > полный кадр недостаточно тормозит, нужно 20 фпс, а лучше настраиваемый параметр, чтобы на разных "машинах" проверить.

3. **Operator (artifact comment, thread 4bd31ac9, on "Попроще, без пикселей"):**

   > "попроще без пикселей" выглядит вообще жесть, но ирония в том что нынешний "полный кадр" выглядит как раз похоже на то упрощение которое могло бы make sense в самой игре (сейчас там разумеется всё намного сложнее)

4. **Operator (artifact comment, thread 3db22eb6, on the canvas):**

   > добавь паузу, чтобы я мог остановиться и оглядеться сам

5. **Operator (chat):**

   > > записано «nothing remembers earlier frames»
   >
   > это было про другое, чтобы, например, у нас волна приходила у всех в один и тот же момент, или кошка по лабиринту бежала. То есть это про состояние мира, а не про восприятие мира игроком

   **Agent (one reply covering 2–5):** Republished the artifact (version 2): the heaviness slider became "Машина: полный кадр ≈ N fps" (5–45, default 20), calibrated by fencing a full frame with 1-pixel `readPixels` and drawing every pass N times over; a Пауза button held the wake-up script; "Попроще" lost its toon banding; trap 1 and the option-2 section rewritten per comments 3 and 5. Replied in the three threads. Proposed rewording the line in `src/cube/CLAUDE.md` to something like "the world's state remembers no earlier frame" and asked for a yes before touching the repo. (The session was then parked once by the keepalive and woken by the comments below.)

6. **Operator (artifact comment, thread e4be9b57):**

   > не вижу чтобы это как-то влияло. оно вроде на секунду приостанавливается, а потом опять рисует быстро

7. **Operator (artifact comment, thread 4bd31ac9):**

   > убери этот вариант, его надо креативно по полной прорабатывать. пока сонный глаз выглядит очень многообещающе

8. **Operator (artifact comment, thread c99cb667, on the Пауза button):**

   > а, пауза это то же самоее что "Камера сама просыпается"? тогда убери

   **Agent (one reply covering 6–8):** Republished the artifact (version 3): repeated passes now draw with blending at constant alpha 1, because a tiled GPU (Apple, likely the operator's Mac) shades only the last opaque fragment per pixel and made the repeats free; the machine note now says outright when calibration could not slow the frame down. Removed the "Попроще" mode and the option-2 section, and the pause (the "Камера сама просыпается" checkbox covers stopping to look around). Replied in all three threads; the fix is untested on a tiled GPU, and the reply asks for the note's text if it is still fast. (verbatim in Last agent turn)

## Intent

The operator wants the cube intro to stop stuttering without the current answer
of dropping pixel density, by turning the cost into a diegetic "waking up,
drowsy" look that converges to full quality when the player stands still. They
call the drowsy eye "очень многообещающе". Simpler shading (option 2) is shelved
as something to be worked out creatively on its own, not in this demo. Nothing
in the repo was asked for yet.

## Decisions

- **Drowsy eye = amortized rendering + reprojection**, not "warp the old frame
  while the full one renders" — the latter buys no GPU time (one queue).
- **Option 2 (simpler shading)** is out of scope for now, by the operator
  (message 7).
- **The "nothing remembers earlier frames" rule** is about world state, not the
  player's perception (operator, message 5) — so it does not forbid the drowsy
  eye; its wording in `src/cube/CLAUDE.md` is broader than meant.
- **Slow-machine emulation** repeats every pass `slow` times (fraction via
  scissor), blended at constant alpha 1 so tiled GPUs cannot skip the repeats;
  the scene, the reprojection and the blit all slow down together.
- **Calibration timing** uses `readPixels` fences, because rAF intervals do not
  reflect GPU cost (vsync quantization; headless rAF stayed at 60 fps while the
  GPU took 95 ms).
- Terms: **сонный глаз / drowsy eye** — the amortized-reprojection mode;
  **сонливость** — the slider blending from plain TAAU (0, history clamped) to
  free smear with lag, motion blur and vignette (100); **машина** — the
  emulated slow GPU, set as the full frame's target fps.

## Errors and dead ends

- First calibration used rAF frame time; in headless SwiftShader rAF stayed at
  16.7 ms, so it ran to the 400× cap. Replaced with `readPixels` fences.
- Version 2's unblended repeats did nothing on the operator's machine (message 6) — most likely tiled-GPU hidden-surface removal. Version 3 blends; not yet
  confirmed by the operator.
- v1's "Попроще" (toon banding, flat foam) looked awful to the operator; the
  mode is now gone.

## State

- Branch `claude/drowsy-eye-intro-ha4w78` (renamed from the opaque
  `claude/wonderful-tesla-ha4w78`, which never reached the remote), based on
  `main` at cb562791. No code changes; this summary is the only file. No PR.
- Artifact "Сонный глаз", version 3:
  https://claude.ai/artifact/9x6LAXhRYwo9c5yRFzxCXW (also addressed as
  https://claude.ai/code/artifact/487a4d36-ca4d-4370-93ea-1a929b2bf15d). Its
  source lived in this session's scratchpad; `Artifact` `read` on the URL
  returns the raw HTML to republish from.
- Comment threads e4be9b57, 4bd31ac9, c99cb667 answered and open, for the
  operator to resolve; 3db22eb6 resolved by them.
- Pending with the operator: whether version 3's machine slider now slows the
  full frame on their Mac (and the note's text if not); the `F`-meter line from
  the intro; a yes/no on rewording the rule in `src/cube/CLAUDE.md`.
- The muthur sync offer was made; do not make it again.
- Estimate (this session, whole task): 5 h senior graphics-programmer —
  "judging whether temporal reprojection beats a full frame on the GPU, and
  prototyping it with a calibrated slow-machine emulation, is rendering
  expertise"; 1 h senior game-designer — "whether a drowsy smear reads as
  waking up rather than as lag is a call about feel". No remainder handed on.

### Watches

https://claude.ai/artifact/9x6LAXhRYwo9c5yRFzxCXW

## Pointers

- `src/cube/CLAUDE.md` — the cube's four world rules; the line to reword.
- `src/cube/pages/cube/ui/quality.ts` — today's pixel-ratio quality levels
  (`high`/`medium`/`low`, key `Q`).
- `src/cube/pages/cube/ui/renderer.ts` — the frame: scene pass (depth
  attachment at line 329), mirrors, glow, lens; where a resolve pass would go
  (after scene).
- `src/cube/pages/cube/ui/pass-timer.ts`, `frame-rate.tsx` — the `F` meter and
  its `GPU ms` line.
- `src/cube/features/player/model/intro-stage.ts` — the intro stage (wake
  position, ladder, arrival).
- Predecessor transcript: https://claude.ai/code/session_01DaohkEDLi4h9PRuRHgXuPy

## Next step

Wait for the operator. Open with them: whether the machine slider now works on
their Mac, the `F`-meter line from the intro, and whether to reword the
world-state rule in `src/cube/CLAUDE.md` (a repo change — route through `/task`
on a yes). If the drowsy eye goes into the game, that too is `/task`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Опубликовал третью версию демо: эмуляция «машины» теперь должна замедлять и тайловые видеокарты, «Попроще» и пауза убраны. Ответы в тредах.
```
