# Relay 6 — unsquatted variations: on-demand generation done; the ring stutters while thinking

## Standing constraints

None stated by the operator.

## The conversation

0. **Launch**: `/relay take claude/in-browser-llms-unsquatted-24jeaq — лампочка-кнопка с кольцом загрузки и остановкой готова, генерация по кнопке с замером времени ещё не начата`
   - **Agent**: attached, set the estimate, and started relay 5's Next step (operator message 4 there: generation on the button only, ring timed from a measured first run, Don't show again dropped).
1. **Operator** (mid-turn, with an iPhone screenshot of the bulb's ring hugging the button's left edge): «кривовато отцентрирована иконка с лампочкой внутри кнопки», then «точнее нет, это кружок», then «кривовато отцентрирован»
   - **Agent**: the ring's SVG was absolutely placed with `inset: 2px`, and an SVG keeps its own size between opposite offsets; given explicit `top/left/width/height`. Measured centred (3 px each side) in headless Chromium.
2. **Operator** (mid-turn, screenshot of iOS Safari's «A problem repeatedly occurred on "https://preview.vovazakharov.com/#talltray"»): «после загрузки модели на айфоне сразу вылезает вот такое»
   - **Agent**: read as iOS killing the tab for memory once the model loaded (inferred, no device logs); `modelDtype()` now returns `undefined` unless `(hover: hover) and (pointer: fine)`, so phones and tablets get no offer. Committed 31011f1b with the on-demand generation; preview published; reported, flagging that the timed generation leg is checkable only on a real GPU, and the still-open voice-rule offer from relay 5.
3. **Operator** (screenshot, ~540 px wide window, variations line under the buttons): «на узком экране идеи должны идти между инпутом и кнопками»
   - **Agent**: df735c24 — `IdeasLine` moved into the field's flex row with a `className`; `.ideas` in `unsquatted-home.module.scss` is `order: 3` (last) wide and `order: 0` (right after the field) below `$field-own-row`.
   - mid-turn: «оставь немного воздуха» → 2e38dee2, `padding-block: 4px` on `.ideas`. Reported the context-budget warning (~206k) and why the small edit went ahead.
4. **Operator** (screenshot, five controls squeezing the field): «кажется у нас на один брейкпоинт раньше (выше) надо начинать кнопки переносить, многовато их уже»
   - **Agent**: ebdd1f91 — `$field-own-row` from `30em` to `mantine.$breakpoint-sm`, which on this repo is **40em** (its `xs` is 30em, `styles/_breakpoints.scss`). Noted the field is still tight just above 640 px and offered md (48em) if so.
5. **Operator**: «как-то кружочек загрузки рывками двигается, это так задумано?»
   - **Agent**: not intended; asked which leg stutters, with two hypotheses — the download leg's `progress_total` growing as files start, or the thinking leg's SVG transition starved by generation on the main thread — and proposed fixes for each.
6. **Operator** (two screenshots: a variations line, then the line gone after picking one): «при выборе идеи не нужно убирать предыдущие (пока юзер снова не нажмёт лампочку), чтоб человек мог выбирать между ними» and «на твой вопрос: модель уже скачана, я говорю про кружочек при последующем нажатии лампочки. или она каждый раз скачивает?»
   - **Agent**: 4179640e — `useIdeas` keeps the last press's variations (`names` state) whatever the label, replaced only by the next press. Answered that the model downloads once, but each page load's first press lifts it from storage into the GPU, which is the ring's first part; relayed for the context budget before the ring fix. (verbatim in Last agent turn)

## Intent

Variations on unsquatted from Qwen3.5-0.8B in the visitor's browser (WebGPU), desktop only. The lightbulb among the field's buttons is the only trigger; its ring shows the load, then the generation paced from the first run's measured time. Now: the ring must move smoothly on later presses.

## Decisions

- **Ring pacing** (`offer/lib/ring.ts`, `ringOf`, tested): load fills to `LOAD_SHARE` 0.75; the generation closes it over `FIRST_GUESS_SECONDS` 8 before any run is timed, then over the timed first run + `MARGIN_SECONDS` 2. Only the first generation is timed (operator's «замерить первый раз»), kept in local storage `unsquatted.ideasSeconds`; `unsquattedForget()` clears it.
- **`modelReady()`** in `brainstorm/lib/local-model.ts`, watched through `watchLoad`, tells the ring a press will generate at once rather than load first.
- **The Ring component** (`ideas-offer.tsx`) mounts empty and sends each `RingTarget` a frame later, so a CSS `stroke-dashoffset` transition with `transitionDuration = seconds` runs from where it stands.
- **A label change resets `asked`** with the render-time adjust pattern (`seenLabel`), abandoning a generation in flight; it does not clear the shown variations.
- **Phones gated off** by pointer media query, answering relay 5's open phone question via the iPhone crash.
- **`$field-own-row` = `mantine.$breakpoint-sm`** (40em).

## Errors and dead ends

- A stale `next dev` from an earlier start kept serving old CSS after an edit; `lsof -ti:3000` missed it. Kill with `pkill`-free `kill $(pgrep -f "next dev")` and restart before trusting a capture.
- Playwright locators by the bulb's accessible name time out while the label changes with the percentage; locate by `[class*=ringFill]` instead.
- Headless Chromium reports no fine pointer, so the bulb does not render there at all now; to walk the button, launch with a fine pointer (the preview skill's `--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4`, or Playwright's equivalent emulation).

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, base `main`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/247 (title/body still describe Chrome's model). Head: this relay's commit over 4179640e.
- Plan `docs/plans/qwen-everywhere-unsquatted.paused.md`; its Left list predates relays 5–6.
- Preview run https://github.com/vzakharov/vovazakharov.com/actions/runs/41868041025 dispatched for 4179640e; earlier ones published through ebdd1f91. Preview runs queued unusually long today.
- Estimate: this session 1.5 h senior developer + 0.5 h middle designer. Remainder handed on: 1 h senior developer (a stutter-free ring while the model thinks), 0.5 h senior prompter (retune after real WebGPU output), 1.5 h middle qa (each desktop browser by hand on a real GPU).

## Pointers

- `src/unsquatted/pages/home/ideas/offer/ui/ideas-offer.tsx` — button, `Ring`, label.
- `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts`, `ring.ts`, `ring.test.ts`.
- `src/unsquatted/pages/home/ideas/brainstorm/lib/local-model.ts` (`modelReady`, the gate), `engine.ts` (`progress_total`, generation).
- `src/unsquatted/pages/home/ideas/offer/ui/ideas.module.scss` (`.ring`, `.ringFill`), `page/ui/unsquatted-home.module.scss` (`$field-own-row`, `.ideas`), `page/ui/name-checker.tsx`.
- Transcripts: this session https://claude.ai/code/session_01DaohkEhtwFB9LfJhip55ja; relay 5's https://claude.ai/code/session_01DaohkBufmMJ1jQSArEG9tb.

## Next step

Make the ring move smoothly on a later press, per operator message 6: «модель уже скачана, я говорю про кружочек при последующем нажатии лампочки». The stutter is in the thinking leg. Leading hypothesis: the ring is an SVG `stroke-dashoffset` transition, which the main thread paints, and the engine generates on the main thread (`local-model.ts` says why), so token steps starve it. Candidate fix: draw the ring from two half-circles rotated with `transform`, which the compositor animates off the main thread. Check first whether a saturated GPU also delays compositor frames, in which case a transform alone will not do; verify on the operator's desktop through the preview. Then still open: the voice-rule offer (relay 5: an operator unresolved from GitHub defaults to vzakharov — asked, unanswered), the real-GPU walk, `/polish`, `/pr` refresh.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Нет, рывков быть не должно. Только я не знаю, на каком этапе они у тебя: при скачивании или когда модель уже думает. От этого зависит причина, а значит и правка.

- **Если рывками идёт скачивание** (первые три четверти кольца), скорее всего, виноваты сами данные о прогрессе. Библиотека считает долю от тех файлов модели, о которых уже узнала. Когда начинается следующий файл, общий объём растёт, и процент может скакнуть или даже откатиться. Кольцо честно рисует эти скачки. Лечится так: считать долю от заранее известного полного размера модели и не давать кольцу ехать назад.
- **Если рывками идёт последняя четверть, пока модель думает**, причина, скорее всего, в другом. Модель работает в основном потоке страницы, а анимация кольца в SVG рисуется тем же потоком. Пока модель выдаёт слова, потоку некогда двигать кольцо. Лечится так: собрать кольцо из двух вращающихся половинок. Вращение браузер анимирует отдельно от основного потока, и тогда кольцо идёт плавно, как бы ни была занята страница.

Так на каком этапе дёргается? Если на обоих, сделаю обе правки.

Контекст сессии уже около 215k токенов. Обе правки, скорее всего, не влезут, так что после твоего ответа я, вероятно, сам передам работу в новую сессию: она сделает правку уже с этим ответом.
```
