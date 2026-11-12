# Cube archive: in-browser LLM trial

Can a tiny in-browser LLM fill the cube's binders with generated bureaucratic
documents that read the same for every visitor? The samples, rendered as typed
sheets, and the full tables are on the trial page:
https://claude.ai/artifact/W4BHbhTuKsaTWBuVnbMseB (private to the operator).

## Setup

- **Address → header** in integer code (`scripts/header.mjs`): floor/room/shelf/
  folder/page hashes to one of 16 document types, a number and a date from
  3000 BC to AD 2400. The model only continues the body.
- **Token i** is drawn with `fmix(hash(address) ^ (i+1)·φ)` against a float64
  softmax over the top-40 logits, CDF walked in token-id order
  (`scripts/core.mjs`); temperature 0.8, repetition penalty 1.1.
- Runtime: onnxruntime-web 1.31 WASM (SIMD, no relaxed SIMD in the shipped
  build), KV cache, Node 24 and headless Chromium 153; onnxruntime-node 1.30 CPU
  as the "different machine" stand-in. CPU: 4-core Xeon @ 2.1 GHz.

## Candidates

| Model           | Variant | Download | tok/s (WASM, 1 thread) | Phone est. | Text                                             |
| --------------- | ------- | -------: | ---------------------: | ---------: | ------------------------------------------------ |
| SmolLM2-135M    | int8    |   131 MB |                     15 |       7–15 | Coherent, keeps the genre, invents fields. Best. |
| SmolLM2-135M    | q4      |   174 MB |                    3.2 |      1.5–3 | Good, but MatMulNBits on WASM is 5× slower.      |
| Pythia-70M      | int8    |    69 MB |                     57 |      30–55 | Pseudo-legal boilerplate, often stops early.     |
| TinyStories-33M | int8    |   111 MB |                     30 |      15–30 | Children's stories; no bureaucracy.              |
| TinyStories-3M  | int8    |    17 MB |                    147 |     70–140 | Incoherent; useful only as a size reference.     |
| Pythia-14M      | int8    |    14 MB |                    205 |    100–200 | Word salad.                                      |

Four threads in Chromium lift SmolLM2 int8 from 13.9 to 18.5 tok/s only.

## Determinism

Logits compared bit for bit per step; native runs also teacher-forced on the
WASM reference's tokens, so flips are counted on a shared context.

| Reference: WASM/Node, 1 thread vs | Pythia-14M fp32                   | Pythia-14M int8       | SmolLM2 int8          |
| --------------------------------- | --------------------------------- | --------------------- | --------------------- |
| same WASM, second run             | 478/478 equal                     | 573/573               | 550/550               |
| WASM in Chromium, 1 thread        | 478/478 equal                     | 573/573               | 550/550               |
| WASM in Chromium, 4 threads       | 478/478 equal                     | 573/573               | 550/550               |
| native ORT, shared context        | 4 flips (0.8%), max Δlogit 0.0085 | 134 (23%), Δ 14       | 141 (26%), Δ 2.5      |
| native ORT, free run              | 4/6 addresses survive 100 tokens  | all fork at token 0–6 | all fork at token 0–2 |

- **Holds:** one pinned WASM binary. WASM SIMD128 is IEEE without FMA
  contraction, and ORT splits work over outputs, not reductions, so thread count
  did not matter either. Model file and ORT version become part of the address.
- **Fails:** any other kernel set (native, and by the same mechanism WebGPU
  across vendors and drivers).
- **Coarse logits do not help:** grid 1/8 with an integer CDF flipped 5 of 361
  steps against 4 of 478 without it; the boundary moves from the CDF edge to
  the rounding edge.
- **Residual risk:** `Math.exp` in the sampler is not specified bit-exact across
  JS engines (Safari, Firefox); a shipped sampler uses its own table or
  polynomial.

## Fine-tuning

A CPU-only proof of the path, not of the quality: TinyStories-8M (19.7M
parameters, 12.9M of them the 50k-token embedding) fine-tuned on 2.7M tokens
of grammar-made documents (`scripts/corpus_gen.py`, a stand-in for an
LLM-written corpus), 300 steps × 2048 tokens, AdamW 5e-4, 4 threads.

- **Throughput:** ~1,240 training tokens/s on this CPU; the run took ~9 minutes
  and saw 0.23 of an epoch. Loss 9.6 → 0.75 (the grammar corpus is
  low-entropy, so the figure flatters it).
- **Result:** the format is learned — fields, names, numbered
  HEARD/RESOLVED items, the end-of-document token. The document type in the
  header is not yet honoured (a land survey turns into a copyright claim), and
  the text replays the grammar's phrase banks: the corpus, not the model, is
  the ceiling.
- **A real run:** 20–50M tokens written by a large LLM across ~50 document
  types and the full date range, 3 epochs. ~60–150M training tokens: 14–35 h
  on this CPU, well under an hour on one consumer GPU.
- **Expected result:** ~20 MB int8 as is (the embedding dominates);
  ~8–10 MB with a 4–8k-token tokenizer trained on the corpus. Speed between
  TinyStories-3M (147 tok/s) and -33M (30 tok/s), so roughly 80–100 tok/s per
  core here (an estimate, not measured: the fine-tuned model was not exported
  to ONNX).

## Scripts

`scripts/` holds the throwaway harness, run from a copy under `tmp/llm/` (its
paths point at `../../node_modules`): `prep.mjs` tokenizes, `run-node.mjs` /
`run-browser.mjs` generate, `compare.mjs` diffs two runs, `det.sh` is the
matrix, `corpus_gen.py` + `ft_bench.py` the CPU fine-tune. Weights live in
`tmp/llm/models/`, never committed.
