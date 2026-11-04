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

## Left

1. A real-browser walk on preview: the operator tests on Chrome and Arc.
2. Retune the prompt if real WebGPU output calls for it.
3. `/polish`, then `/pr` refresh: title (still "from Chrome's built-in model"),
   body and squash proposal describe the Chrome flow.

## Decisions

- **Qwen3.5-0.8B over Qwen3-0.6B**: about the same download (q4f16 decoder +
  embeddings ≈ 600 MB vs 570 MB), and in a Node bench (`tmp/qwen/try.mjs`, gone
  with the container) it gave on-topic names (lamplight → candlelit, shimmerlit,
  luminous) where 0.6B copied the prompt's examples.
- **Few-shot, one name per line, T 0.8, top_p 0.95, repetition penalty 1.1**:
  rules alone made both models repeat the name six times.
- **Stale opt-in** (five-percent review 5768094962) answered by undoing the
  opt-in when the weights are evicted, so the offer and its consent come back
  before a re-download.
