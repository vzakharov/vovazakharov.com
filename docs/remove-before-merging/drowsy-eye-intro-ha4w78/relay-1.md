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

   **Agent (one reply covering 2–5):** Republished the artifact (version 2): the heaviness slider became "Машина: полный кадр ≈ N fps" (5–45, default 20), calibrated by fencing a full frame with 1-pixel `readPixels` and drawing every pass N times over; a Пауза button (and Space on the focused stage) holds the wake-up script while the world clock runs; "Попроще" lost its toon banding and is now plain lower detail; trap 1 and the option-2 section rewritten per comments 3 and 5. Replied in all three threads (left them open). Proposed rewording the line in `src/cube/CLAUDE.md` to something like "the world's state remembers no earlier frame" and asked for a yes before touching the repo. (verbatim in Last agent turn)

## Intent

The operator wants the cube intro to stop stuttering without the current answer
of dropping pixel density, ideally by turning the cost into a diegetic "waking
up, drowsy" look that converges to full quality when the player stands still.
They are weighing that against a simpler rendering style. Nothing in the repo
was asked for yet: this was exploration plus a demo artifact.

## Decisions

- **Drowsy eye = amortized rendering + reprojection**, not "warp the old frame
  while the full one renders" — the latter buys no GPU time (one queue).
- **Option 2 (simpler shading)** is viable as a single art direction (the demo's
  own "full frame" shows a cheap renderer can look fine — operator's point);
  as a quality level it breaks the cube's rule that a thing looks the same on
  any machine. LOD cuts the eye barely sees stack with the drowsy eye.
- **The "nothing remembers earlier frames" rule** is about world state, not the
  player's perception (operator, message 5) — so it does not forbid the drowsy
  eye; its wording in `src/cube/CLAUDE.md` is broader than meant.
- **Slow-machine emulation** repeats every pass `slow` times (fraction via
  scissor) rather than adding a per-pixel burn loop, so the scene, the
  reprojection and the blit all slow down together, as on real weak hardware.
- **Calibration timing** uses `readPixels` fences, because rAF intervals do not
  reflect GPU cost (vsync quantization; headless rAF stayed at 60 fps while the
  GPU took 95 ms).
- Terms: **сонный глаз / drowsy eye** — the amortized-reprojection mode;
  **сонливость** — the slider blending from plain TAAU (0, history clamped) to
  free smear with lag, motion blur and vignette (100).

## Errors and dead ends

- First calibration used rAF frame time with doubling under 22 ms; in headless
  SwiftShader rAF stayed at 16.7 ms, so it ran to the 400× cap. Replaced with
  `readPixels` fences.
- A headless test stalled because the stage was below the fold and the demo
  pauses off-screen (IntersectionObserver) — the test, not the page, was wrong.
- v1's "Попроще" (toon banding, flat foam) looked awful to the operator.

## State

- Branch `claude/drowsy-eye-intro-ha4w78` (renamed from the opaque
  `claude/wonderful-tesla-ha4w78`, which never reached the remote), based on
  `main` at cb562791. No code changes; this summary is the only commit. No PR.
- Artifact "Сонный глаз", version 2:
  https://claude.ai/artifact/9x6LAXhRYwo9c5yRFzxCXW (also addressed as
  https://claude.ai/code/artifact/487a4d36-ca4d-4370-93ea-1a929b2bf15d). Its
  source file lived in this session's scratchpad, which the successor does not
  have; `Artifact` `read` on the URL returns the raw HTML to republish from.
- Three comment threads (e4be9b57, 4bd31ac9, 3db22eb6) answered, left open for
  the operator to resolve.
- Pending questions to the operator: the `F`-meter numbers from the intro; a
  yes/no on rewording the rule in `src/cube/CLAUDE.md`; the muthur sync offer.
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

Wait for the operator. Open with them: the `F`-meter line from the intro, and
whether to reword the world-state rule in `src/cube/CLAUDE.md` (a repo change —
route through `/task` on a yes).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Во всех трёх тредах ответил. В демо теперь есть ползунок «Машина: полный кадр ≈ N fps» (по умолчанию 20), пауза, а «Попроще» больше не выглядит жутко.

Про правило ты прав: оно о состоянии мира, а не о том, что видит игрок, так что сонный глаз его не нарушает. В артефакте я это исправил. Осталась одна мелочь: в `src/cube/CLAUDE.md` строка звучит шире, чем задумана («a frame is a pure function… nothing remembers earlier frames»). Агент, который возьмётся внедрять сонный глаз, прочтёт её буквально и остановится. Поправить её на что-то вроде «the world's state remembers no earlier frame»? Это уже правка в репозитории, без твоего «да» не трогаю.
```
