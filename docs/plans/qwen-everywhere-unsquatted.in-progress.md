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

## Left

1. **The worker does not run.** Next 16.0.3's Turbopack emits
   `new Worker(new URL('./model.worker.ts', import.meta.url), …)` as a static
   asset (`out/_next/static/media/model.worker.<hash>.ts`, unbundled), with or
   without `{ type: 'module' }`. Next 16.4.5 is the latest 16.x; check whether
   its Turbopack bundles workers before anything else. If not: run the model on
   the main thread through a dynamic `import('@huggingface/transformers')`
   (WebGPU does the heavy work; the worker's queue/stop logic moves to
   `local-model.ts`), and say so to the operator. ESLint's
   `unicorn/relative-url-style` rejects the `./` prefix that Turbopack's worker
   detection would need — a suppression needs the operator's approval.
2. Check the transformers.js chunk loads only on opt-in (dynamic), and that ORT
   fetches its wasm from the bundle, not jsdelivr.
3. A real-browser walk: preview with `/preview live unsquatted`; the operator
   tests on Chrome and Arc (Arc's WebGPU should now work).
4. `/polish`, then `/pr` refresh: title (still "from Chrome's built-in model"),
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
