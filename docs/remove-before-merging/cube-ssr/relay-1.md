# Relay 1 — Cube: screen-space reflections (`claude/cube-ssr`)

## 1. Standing constraints

From the stream brief, which the lead session (`session_016Z4TKqBdiPUwyUDMrs26WP`) delivered as this session's opening prompt:

- "No plan, no PR. You are a stream of the cube-beauty work on `claude/cube-liminal-332pmv` (read `docs/plans/cube-beauty.in-progress.md` for the architecture; that plan belongs to the lead session, do not edit or rename it)."
- Work and push on `claude/cube-ssr` only. The lead merges this branch into its own, so never merge into or push to `claude/cube-liminal-332pmv` or `main`, and never open a PR.
- Do not run `/polish`, `/pr` or `/finalize`.
- A live preview goes to slot 2 only (`/preview live vova 2`), never slot 1.
- `pnpm gallery:cube`: absolute `--out`, at most four floors per call.
- Do not ask the operator questions: decide and report.

## 2. The conversation

1. **Lead session's brief** (the only inbound message). Build screen-space reflections over the frame's own colour. Keep the analytic lamp mirror (`roomLight`, 3×3 rooms) only as a fallback for rays that leave the screen or miss, blended without a seam. Fade by gloss, distance and screen edge. Stay within a laptop GPU budget, and keep `pnpm shaders:cube` at 67/67. Polished floors are 3, 9, 11, 17 and 66. Run the listed gates. Commit two or three before/after `.webp` pairs under `docs/plans/cube-ssr/`. Report to the lead with `send_message`: the head SHA, the design, the cost and the frames.
   — Agent: built and debugged the SSR, ran the gates, committed and pushed, and sent the report to the lead. (verbatim in Last agent turn)
2. A keepalive wake ran `/relay park`, which wrote this file.

## 3. Intent

The goal is reflections on polished floors "wherever visible", with no hard seam at the 3×3-room edge and no sparkle.

## 4. Decisions

- **Mirror data goes out through `var<private> mirroring`** (`kit/lib/core.ts`), not through new theme signatures. All 67 themes stay untouched. The scene pass writes three targets: light, mirror and plane.
- **The thickness test runs after binary refinement** (`SLANT` × the final interval + `THICK`), not on the raw step. On ceilings seen at a slant, the raw-step test threw away real hits.
- **Blur is measured at the hit, in the metres of the hit face.** `stride()` gives the metres per pixel there. One mip level covers the short side, and 5 taps run along the long side. An isotropic mip blur at the hit killed thin lamps.
- **`lampBlur` conserves energy, and `BLUR` went from 0.3 to 0.15.** The old fallback was brighter than its own lamp, so SSR and fallback disagreed and left a seam. The cost: floors 9, 11, 17 and 66 lose the fake square blobs. They were mirrors of PANEL lamps that those themes don't draw (they have domes, rings and tubes).

## 5. Errors and dead ends

- WGSL reserved words (`from`, `smooth`) and a binding clash were fixed by splitting the shaders into separate modules.
- The first before-frames were rendered while the dev server hot-reloaded edits, so they were invalid. A git worktree's dev server would not start. What worked: commit, `git checkout 117db116 -- src`, render, then `git checkout HEAD -- src`.

## 6. State

- Branch `claude/cube-ssr`, pushed, head `0e8ce0282bac3f419fa8b6202c7d50b184073837`. Three commits on top of `117db116`. No PR, by design.
- The plan `docs/plans/cube-beauty.in-progress.md` is the lead's, not this session's.
- The report has been delivered to the lead session. Nothing is running or waiting.
- Gates are green: tsc; eslint and prettier on the touched files; check:masd; masd:clusters; check:cycles; type-overlap; lint:fsd; shaders:cube 67/67; cube lib tests 42/0. `vet.sh` was not run.
- The estimate is unchanged: the whole job was done here.

## 7. Pointers

- `src/cube/pages/cube/ui/reflection-shader.ts` holds the SSR, halving and blur shaders. `ui/reflection.ts` holds the passes and targets. `ui/renderer.ts` wires them in.
- `src/cube/entities/theme/kit/lib/light.ts` holds `roomLight` (the fallback) and `lampBlur`. `core.ts` holds `Mirror`. `grade.ts` holds `haze`.
- `src/cube/pages/cube/lib/matrix.ts` and its test hold the matrix inverse.
- Before/after frames: `docs/plans/cube-ssr/floor-{03,17,66}-{before,after}.webp`.
- Transcript: https://claude.ai/code/session_016Z4TKpEWpjBRDrVBTHSavi

## 8. Next step

Wait for the operator or the lead session. The stream's work is delivered.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Now the stage that wraps the theme (fragmentMain, lens).

Вова, я разбираю конвейер кадра (scene → bloom → lens) и проектирую SSR-проход между scene и bloom; дальше пишу код.

Let me take "before" frames first, in the background.

Now `roomLight`: hand the mirror on instead of adding the analytic panels to the colour.

Now a 4×4 inverse for reconstructing rays from pixels.

Now the reflection pass itself.

WGSL reserves `from` and `smooth`, and two resource bindings at the same slot in one module is risky — splitting the halving shader out and renaming.

The dev server hot-reloads, so those "before" frames may have caught my edits mid-way; I'll re-shoot them from a clean worktree of the start head.

Meanwhile, the shader file rewritten with legal names and split modules.

Now the GPU side, `reflection.ts`.

Now wire it into the renderer and programs.

Вова, шейдеры всех 67 этажей компилируются; дочищаю линт и снимаю кадры «до/после».

The worktree's dev server won't start nested inside the repo; I'll drop it and shoot "before" by checking the old `src/` out in place once my work is committed.

Rendered without errors. Let me look.

Lamps now mirror in the floor. To compare, I'll commit, then shoot "before" from the old `src/`.

Unchanged — so I need to see what the walk is doing rather than guess. Temporarily painting trust (red) and mirror strength (green) as the frame:

Units check out (one unit = one room = 5 m). Next suspect: what the walk samples. Painting the sampled reflection itself:

Подкручиваю размытие отражений: сейчас пол отражает лампы слишком мутно по сравнению с прежним вариантом.

Commit the working state first, then render floor 66 from the old source for the "before".

Now the gates.

Гейты зелёные; коммичу кадры «до/после» и пушу.

Вова, экранные отражения на полу готовы и отправлены ведущей сессии; ветка `claude/cube-ssr` запушена (head `0e8ce028`). Шов на краю зоны в 3×3 комнаты пропал на этажах 3, 11, 17 и 66, и блеска-«искр» нет.

**Что получилось:**
- Пол теперь отражает то, что есть на экране: стены, двери, мебель и настоящие лампы, на любом расстоянии.
- Старое расчётное отражение ламп осталось только запасным вариантом. Оно включается, когда отражённый луч уходит за край экрана или ни во что не попадает, и плавно смешивается с экранным.

**Две ошибки, из-за которых сначала не работало:**
- Луч, проходивший через потолок под острым углом, отбрасывался как «прошёл за предметом». Теперь он сначала уточняет точку попадания и только потом проверяется.
- Размытие было одинаковым во все стороны и гасило тонкие лампы. Теперь оно идёт по поверхности, в которую попал луч: по наклонной стороне сильнее, поперёк слабее.

**Заметная потеря:** на этажах 9, 11, 17 и 66 пропали яркие квадратные блики. Это были отражения квадратных панелей, которых в этих темах нет: там купола, кольца и трубки. Теперь видны настоящие лампы, а они меньше и тусклее, поэтому эти полы стали заметно менее блестящими. Чтобы запасной вариант совпадал с экранным по яркости и не давал ступеньки на стыке, я сделал его размытие честным по энергии и вдвое уменьшил силу размытия (`BLUR` 0.3 → 0.15). Если блеск нужен обратно, правильнее сделать ярче сами лампы или поднять глянец пола. Возвращать старые панели нельзя: шов давали именно они.

**Цена по времени кадра:** не измерял, здесь только программный GPU. По оценке это 1–2 мс на обычном встроенном GPU в 1080p, и ноль на пикселях без зеркала.

**Проверки:**
- Чистые: tsc, eslint, prettier, `check:masd`, `masd:clusters`, `check:cycles`, `type-overlap`, `lint:fsd`.
- `pnpm shaders:cube`: 67 из 67.
- Тесты cube: 42 прошли, 0 упали.
- `vet.sh` не запускал.

Кадры «до/после» лежат в `docs/plans/cube-ssr/` для этажей 3, 17 и 66.
```
