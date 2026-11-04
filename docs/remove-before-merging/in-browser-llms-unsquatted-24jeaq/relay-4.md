# Relay 4 — unsquatted variations on Qwen: main thread, download progress, push protection

## Standing constraints

None stated by the operator.

## The conversation

0. **Launch**: `/relay take claude/in-browser-llms-unsquatted-24jeaq — движок на Qwen3.5 написан, но Next не собирает воркер, план на паузе`
   - **Agent**: attached; resumed the paused plan. Next 16.4.5 also emits the worker unbundled, so the upgrade was reverted and the model moved to the page's thread behind a dynamic import (cd9cf44c); ONNX Runtime's wasm now comes from the bundle, not jsDelivr. Started a headless Chromium walk on SwiftShader's WebGPU and published the preview. Reported, and told the operator the stale-opt-in answer is theirs to overrule.
1. **Operator** (mid-turn): «ещё нужно чтобы когда качалось модалку можно было закрыть (и она об этом говорила), вместо неё на месте где будет брейнсторминг был прогресс-бар (замокапь 3 варианта)»
   - **Agent**: lifted the download out of the modal into the ideas hook (79f2361b); the modal says it can be closed and offers Close; three line mock-ups (`bar`, `bulb`, `underline`) shot in both themes and sent as images, `bar` recommended, `bulb` noted as near-invisible at 1em. Found that both preview publishes had failed: GitHub push protection reads `Mistral3ForConditionalGeneration` from transformers.js as a Mistral API key. Proposed: (1) allow the string per receiving repo via the unblock URL, or (2) turn push protection off on the receiving repos (recommended). Asked which variant to keep. Reported that SwiftShader never finished a generation in 17 minutes. (verbatim in Last agent turn)
2. **Operator**: «1 сделал для preview.vovazakharov.com, а где взять для unsquatted заранее?»
   - **Agent**: re-ran the preview (run 41849940086); answered that the unblock URL exists only after a blocked push, so for `vzakharov/unsquatted.com` it is either push protection off there in advance, or the URL from the failed merge deploy's log and a re-run of that job; paused the plan for the context budget and relayed.

## Intent

Unchanged: after any search on unsquatted, three name variations under the field, behind a one-time plain-language opt-in, generated in the visitor's browser by Qwen3.5-0.8B on WebGPU, in every desktop browser with WebGPU («только qwen, чтобы не поддерживать два пути»). New: the download runs on with the modal closed, the modal says so, and the line under the field shows its progress.

## Decisions

- **Main thread over a worker**: Turbopack (16.0.3 and 16.4.5) emits `new Worker(new URL(…))` as a raw `.ts` asset. `engine.ts` holds the model; `local-model.ts` imports it dynamically and keeps the queue and the stop. Unchecked on a real GPU whether the field stays responsive.
- **wasm from the bundle**: `engine.ts` deletes `env.backends.onnx.wasm.wasmPaths`, which transformers.js sets to jsDelivr; ORT then finds the copy Turbopack emits.
- **Download state** lives in `local-model.ts` (`loadProgress`/`watchLoad`), read by `use-ideas.ts` through `useSyncExternalStore`; `turnOn` starts it and opts in on success. The line shows progress only while not opted in, so a cached reload shows the thinking bulb instead.
- **Stale opt-in** answer (undone when the weights are evicted) was reported to the operator as overrulable; no reply yet.

## Errors and dead ends

- Next 16.4.5: worker still unbundled; reverted.
- SwiftShader WebGPU in headless Chromium loads the model in under a minute but did not finish one generation in 17 min; generation is checkable only on a real GPU. Cache API `put` fails in that headless profile (warning only).
- Preview runs 41846257612 and 41849003635 failed at the push to `vzakharov/preview.vovazakharov.com` with GH013 (Mistral API key false positive in a transformers.js chunk).

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, base `main`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/247 (title/body/squash proposal still describe Chrome's model). Head is this relay's commit on top of a171d2a2.
- Plan `docs/plans/qwen-everywhere-unsquatted.paused.md`, its Left list current (item 0 is push protection).
- Preview run 41849940086 in flight, after the operator allowed the string on the preview repo; not yet checked.
- `vzakharov/unsquatted.com` has push protection enabled and will block the merge deploy.
- Polish floor still `7cd1ac34`.
- Estimate: this session 1.5 h senior developer (worker → main thread, download lifted out of the dialog) + 0.5 h middle designer (three mock-ups). Remainder handed on: 0.5 h senior developer (drop the unpicked variants, polish, PR refresh), 0.5 h senior prompter (retune after real WebGPU output), 1.5 h middle qa (each desktop browser walked by hand).

## Pointers

- `src/unsquatted/pages/home/ideas/brainstorm/lib/engine.ts`, `local-model.ts` — the engine and its page-side API.
- `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts` — opt-in, download state, `unsquattedForget()`.
- `src/unsquatted/pages/home/ideas/offer/ui/ideas-line.tsx` (`LOADING_VARIANT`), `loading-line.tsx`, `ideas-modal.tsx`, `ideas.module.scss`.
- `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/loading-*.png` — the mock-ups and the modal.
- Capture recipe (rebuild from the description): Playwright with `--enable-unsafe-webgpu --enable-features=Vulkan --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader`, on `http://localhost` (not `about:blank`, which has no `navigator.gpu`), CDP `Network.emulateNetworkConditions` at 4 MB/s to catch the download mid-way.
- `gh run view <id> --log-failed | grep -A12 GH013` names the flagged file and the unblock URL.
- Transcripts: this session https://claude.ai/code/session_01DaohkCU6ANBX3V1rGK8sxP; relay 3's https://claude.ai/code/session_01DaohkFAx7gUn3M9jjWqsY1.

## Next step

Resume the paused plan. First check preview run 41849940086 and give the operator the link if it published. Then wait on the operator for two answers: which progress variant to keep (`bar` recommended), and what to do about push protection on `vzakharov/unsquatted.com` before merge. Then the rest of Left: the real-GPU walk on preview (Chrome, Arc), prompt retune if needed, `/polish`, `/pr` refresh.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Модель загрузилась меньше чем за минуту и думает на эмулированном GPU. Пока она думает, выкладываю превью, чтобы ты проверил на настоящей видеокарте.

The preview is building. I'll update the plan file with what's done in the meantime.

Now the shared download state in `local-model.ts`:

Copy: the modal says it can be closed, and the line has its own progress text.

Now the line itself:

Now the native `<progress>` styling for the hairline, plus the server snapshot:

Lint and types pass. Next, screenshots of the three variants: a dev server, Chromium on SwiftShader, and the network throttled so the download runs long enough to catch it mid-way.

The bar variant and the modal look right. Switching to the bulb variant.

Updating the plan with the pending choice.

Вова, превью не выложилось, и при мерже прод упрётся в то же самое. Push protection на GitHub принимает имя класса `Mistral3ForConditionalGeneration` из transformers.js за API-ключ Mistral: это ровно 32 символа рядом со словом «mistral». В нашем коде этого нет, оно приезжает строкой из таблицы моделей библиотеки, и бандлер его не выкидывает. Обе публикации в репозиторий превью упали с `GH013`.

Если нужно моё решение: я бы выбрал вариант 2. Ложное срабатывание на собранной сборке будет повторяться с каждым обновлением библиотеки.

1. **Разрешить эту строку**, один раз на каждый принимающий репозиторий, по ссылке из лога: https://github.com/vzakharov/preview.vovazakharov.com/security/secret-scanning/unblock-secret/3Le65bwhwcfjsr0SuEna5kIoR64. Для прода такая же ссылка появится при первом деплое unsquatted.
2. **Отключить push protection в принимающих репозиториях** (превью и unsquatted). Там лежит только собранная сборка, ключей там нет, а в основном репозитории проверка остаётся.

Это настройки безопасности GitHub, так что решать тебе. Когда сделаешь, напиши «перезапусти превью», и я перезапущу.

**Что сделано за это время:**
- **Модалка** (79f2361b, запушено). Загрузка больше не привязана к окну: его можно закрыть, кнопка «Not now» во время загрузки становится «Close», а текст говорит, что загрузка продолжится и её прогресс будет под полем поиска.
- **Три мокапа прогресса** на месте будущих вариаций, скриншоты выше:
  1. `bar`: тонкая золотая полоска под текстом. Её я и рекомендую.
  2. `bulb`: лампочка наполняется золотом снизу вверх. В размере 1em это почти незаметно, лучше на скриншоте не видно.
  3. `underline`: сам текст подчёркивается на ту долю, что уже скачана.

  Сейчас стоит `bar`. Скажи, какой оставить, и я уберу два других вместе с переключателем.
- **Проверка в headless Chromium на программном WebGPU.** wasm рантайма грузится с нашего сайта, а не с jsDelivr. Энкодер зрения не скачивается. Загрузка весит около 670 МБ, как и обещано в тексте, и модель поднимается меньше чем за минуту.
- **Генерацию вариаций я не проверил.** Программный WebGPU не выдал ни одного ответа за 17 минут, и я остановил прогон. Проверить вариации получится только на настоящей видеокарте, то есть у тебя на превью, когда оно заработает.
```
