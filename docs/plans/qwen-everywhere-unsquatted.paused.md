# unsquatted: Qwen in every browser instead of Chrome's model

Planless follow-up to `in-browser-llms-unsquatted.completed.md`, on the
operator's call «только qwen, чтобы не поддерживать два пути».

## Done

- b100cf57 — the engine swap: `brainstorm/lib/model.worker.ts` (transformers.js
  4.3.2, `onnx-community/Qwen3.5-0.8B-ONNX` via `AutoModelForCausalLM`, which
  loads only `embed_tokens` + `decoder_model_merged`, no vision encoder; `q4f16`
  ≈ 600 MB where the adapter has `shader-f16`, `q4` ≈ 670 MB elsewhere),
  `local-model.ts` (page side, typed `protocol.ts`), few-shot prompt and
  line-per-name parser (tests green), stale opt-in undone when the decoder
  weights are not cached, `unsquattedForget()` deletes the weights, modal copy
  rewritten, stall watch and `@types/dom-chromium-ai` removed, `@webgpu/types`
  added. `tsc` and ESLint clean, `pnpm build unsquatted` green.

- cd9cf44c — the model on the page's thread: Turbopack emits the worker file
  unbundled on 16.4.5 too, so `model.worker.ts` became `engine.ts`, which
  `local-model.ts` imports dynamically (a lazy 532 KB chunk), with the queue and
  the stop beside it; `protocol.ts` is gone. ONNX Runtime loads the wasm the
  bundler emits instead of jsDelivr's. In headless Chromium on SwiftShader's
  WebGPU the opt-in downloads ≈ 670 MB (decoder 485 MB, embeddings 163 MB; the
  vision encoder only redirects, never downloads) and loads in under a minute.

- 79f2361b — on the operator's «когда качалось модалку можно было закрыть (и она
  об этом говорила), вместо неё на месте где будет брейнсторминг был
  прогресс-бар (замокапь 3 варианта)»: the download lives in the hook, the modal
  says it can be closed and offers Close, and the line under the field shows
  progress in one of three mock-ups (`bar`, `bulb`, `underline`, behind
  `LOADING_VARIANT` in `ideas-line.tsx`), shot in
  `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/loading-*.png`.
  SwiftShader's WebGPU loads the model but had not finished one generation in 17
  minutes, so generation is checked on a real GPU only.

## Left

0. **Push protection blocks the build.** GitHub reads transformers.js's class
   name `Mistral3ForConditionalGeneration` (32 characters beside "mistral") as a
   Mistral API key. The operator allowed it on `preview.vovazakharov.com`;
   preview run 41849940086 re-publishes after that. `vzakharov/unsquatted.com`
   (push protection enabled) will block the merge deploy the same way: its
   unblock URL exists only after a blocked push, so either push protection goes
   off there or the operator opens the URL from the failed deploy's log and
   re-runs the job.
1. Settled by relays 5–7: the lightbulb's ring is the progress (no
   `LoadingVariant` left to pick); it turns on the compositor (7844da54); a
   generation outlives a label change and a press for another label replaces it
   (f8d6bd76); an empty answer shows the shrug line (66355fa6). Review of
   2026-11-05: three variations asked as well as shown (e286ce7a); evicted
   weights download again on the press, with a notice (0165f637).
2. A real-browser walk on preview: the operator tests on Chrome and Arc. The
   ring is confirmed smooth there; f8d6bd76's behaviour is published, unchecked.
   2a. `pnpm type-overlap` fails on five groups the branch introduced (two props
   types in `ideas-line.tsx`/`ideas-offer.tsx`, and `RingTarget`/`RingMove`/
   `Ideas` members against `Timed`, `Hushing`, `Ramped`, `HaloLayer`); vet will
   stop on them.
3. Retune the prompt if real WebGPU output calls for it.
4. `/pr` refresh of the body, which still describes the Chrome flow; the title
   and squash proposal are refreshed (a98c18ed).

## Decisions

- **Qwen3.5-0.8B over Qwen3-0.6B**: about the same download (q4f16 decoder +
  embeddings ≈ 600 MB vs 570 MB), and in a Node bench (`tmp/qwen/try.mjs`, gone
  with the container) it gave on-topic names (lamplight → candlelit, shimmerlit,
  luminous) where 0.6B copied the prompt's examples.
- **Few-shot, one name per line, T 0.8, top_p 0.95, repetition penalty 1.1**:
  rules alone made both models repeat the name six times.
- **Stale opt-in** (five-percent review 5768094962): the opt-in stands when the
  weights are evicted; the next press downloads them at once and a dialog says
  so, with a single OK (operator, 2026-11-05).
