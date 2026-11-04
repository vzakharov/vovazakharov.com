# Relay 3 — unsquatted variations on Qwen: the worker does not bundle

## Standing constraints

None stated by the operator.

## The conversation

0. **Launch** (relay 2's take): `/relay take claude/in-browser-llms-unsquatted-24jeaq — вариации работают в Chrome, лампочка готова, решено перейти на Qwen для всех браузеров`
   - **Agent**: attached; set the remainder estimate; benched Qwen3-0.6B and Qwen3.5-0.8B in Node on CPU (transformers.js 4.3.2); picked Qwen3.5-0.8B; wrote the worker engine, the page side, prompt, parser, hook, modal and copy (b100cf57); found that Next 16.0.3's Turbopack does not bundle the worker; hit the context-budget warning and paused the work and relayed it (8a91aaf8). No operator message came during this session. Because the whole session was that one turn, `scripts/relay-last-reply.py` found no earlier reply to append, and this file has no Last agent turn section.

## Intent

Unchanged from relay 2: after any search on unsquatted, three variations of the name under the field, behind a one-time plain-language opt-in, generated on the visitor's machine. It should work in **every desktop browser with WebGPU** through **one engine, Qwen**: «только qwen, чтобы не поддерживать два пути». The variations sit behind the lightbulb.

## Decisions

- **Qwen3.5-0.8B (`onnx-community/Qwen3.5-0.8B-ONNX`) over Qwen3-0.6B.** Loaded through `AutoModelForCausalLM`, it fetches only `embed_tokens` and `decoder_model_merged`, never the vision encoder. Its q4f16 download is about 600 MB against Qwen3-0.6B's 570 MB. It gave on-topic names where 0.6B echoed the prompt's examples.
- **`q4f16` where the adapter has `shader-f16`, `q4` elsewhere** (about 670 MB). The copy says "about 650 MB". No WebGPU adapter means no line at all.
- **The prompt has three worked examples (bookworm, sunrise, fastship) and asks for one name per line.** Generation runs at T 0.8, top_p 0.95, repetition penalty 1.1. Rules alone made both models repeat the name. The parser now reads lines rather than a JSON array, and drops what does not clean to a 3–15-letter name.
- **The stale opt-in** (five-percent review 5768094962) **is answered in code**: when the decoder's weights are not in Cache Storage, the opt-in is undone, so the offer and its consent come back before any re-download. The operator never answered the question. The agent chose this answer, and the successor should report it to the operator as a choice they can overrule.
- **The worker's file list problem**: `ModelRegistry.is_cached` lists the vision files too, so for this model it never returns true. `weightsCached` checks only `onnx/decoder_model_merged_<dtype>.onnx_data`.
- `enable_thinking: false` reaches the chat template through an options object held in a variable, because the TS type does not list it.

## Errors and dead ends

- The original prompt (rules only, JSON array) produced the name itself six times on both models.
- `ApplyChatTemplateOptions` has no `enable_thinking`. `Tensor.slice` does not accept `null` inside a range.
- **Turbopack (Next 16.0.3) emits the worker as a raw asset.** `new Worker(new URL('./model.worker.ts', import.meta.url), { type: 'module' })` produced `out/_next/static/media/model.worker.<hash>.ts`, unbundled, with or without the options and with or without `./`. ESLint's `unicorn/relative-url-style` rejects the `./`, and the committed code has it, so the lint now fails on `local-model.ts` until the gap is settled.

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, head `8a91aaf8` plus this relay commit, pushed; base `main`.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/247. Its title, body and squash proposal still describe Chrome's model.
- The plan is `docs/plans/qwen-everywhere-unsquatted.paused.md`, holding Done/Left/Decisions. The old plan `in-browser-llms-unsquatted.completed.md` is inert.
- The polish floor is still `7cd1ac34`.
- The preview at https://preview.vovazakharov.com still serves the Chrome build from after `683a6910`.
- Nothing is running: no CI, no subscription, no check-in.
- This session's estimate: 2.5 h senior developer, 1.5 h senior prompter and 0.5 h middle copywriter, with the reasons in the cost row.
- The remainder is handed on as:
  - 1.5 h senior developer: making the worker bundle (or moving the model to the main thread) takes judgement against Turbopack's real output.
  - 0.5 h senior prompter: retune after seeing WebGPU output in a real browser.
  - 1.5 h middle qa: each desktop browser, with and without WebGPU, walked by hand.

## Pointers

- `docs/plans/qwen-everywhere-unsquatted.paused.md` — what is left, in order.
- `src/unsquatted/pages/home/ideas/brainstorm/lib/` — `model.worker.ts`, `local-model.ts`, `protocol.ts`, `prompt.ts`, `parse-ideas.ts` (+ test).
- `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts` — the opt-in (`agreed`), the cache check (`present`) and `unsquattedForget`.
- `src/unsquatted/pages/home/checker/config/messages/en.json` — the `ideas` copy, with the new key `pace`.
- Bench recipe: `node tmp/qwen/try.mjs q4 <labels> onnx-community/Qwen3.5-0.8B-ONNX`, with `tmp/qwen/system.txt` and `shots.json`. They are gone with the container; rebuild them from `prompt.ts`. A CPU run takes about 5 s per name and needs about 670 MB of downloads.
- Check the build output with `ls sites/unsquatted/out/_next/static/media | grep worker`. A `.ts` file there means the worker went unbundled.
- Transcripts: this session https://claude.ai/code/session_01DaohkFAx7gUn3M9jjWqsY1; relay 2's https://claude.ai/code/session_01DaohkCsgymHrNjAGTnrXRx; relay 1's https://claude.ai/code/session_01DaohkEbjr7qEZ5daaRBm6A.

## Next step

Resume the paused plan `docs/plans/qwen-everywhere-unsquatted.paused.md` from its "Left" list, in line with the operator's «только qwen, чтобы не поддерживать два пути». Start with item 1: make the worker bundle, either by trying Next 16.4.5 or by moving the model to the main thread with a dynamic import. Then fix the lint, run `/preview live unsquatted`, `/polish`, and `/pr` refresh. Tell the operator how the stale opt-in was settled.
