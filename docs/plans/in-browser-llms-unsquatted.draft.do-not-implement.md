> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# unsquatted: name ideas from an in-browser LLM

## Goal

A visitor types a keyword (`datatrend`), presses an **ideas** button beside the
dice, and gets a row of alternative names that are **free in `.com`**, each one
click away from the full check. The model runs on the visitor's device, so the
site stays serverless and the keyword never leaves the browser — the byline's
"private" stays true.

Origin: Levon's ask in Slack (a generator of alternatives for a keyword), and
the operator's wish to learn in-browser models on it rather than break the
no-server idea with an API or ask visitors for a key.

## Engine — Chrome's built-in model first, a downloaded one elsewhere

One interface, two engines, chosen at runtime:

1. **Chrome's Prompt API** (`LanguageModel`, Gemini Nano; stable for web pages
   since Chrome 148, desktop). Costs the page nothing to ship. Its
   `responseConstraint` takes a JSON schema, so the answer arrives as JSON.
   `availability()` decides: `available` runs at once; `downloadable` /
   `downloading` shows Chrome's own download progress (`monitor`) on the first
   press.
2. **transformers.js v4** (`@huggingface/transformers`, 4.3.x) on **WebGPU**, in
   a Web Worker so generation never freezes the field. Model: the smallest
   `onnx-community` Qwen3.5 instruct that runs at `q4f16`, Qwen3-0.6B if none
   does — settled by a spike in `tmp/` at implementation, the criterion being
   the most free `.com` names per press out of the same keywords. The first
   press says the size (~400–500 MB, cached by the browser after) and asks
   before downloading.
3. **Neither** (no Prompt API, no WebGPU — Firefox off Windows, older Safari):
   the button is not shown. Single-threaded WASM is the only fallback left, and
   GitHub Pages cannot send the COOP/COEP headers multithreaded WASM needs, so a
   0.6B model there would take a minute a press.

## What a press does

1. Prompt: the keyword, plus the runbook's taste in a few lines
   (`src/unsquatted/scripts/RUNBOOK.md` § "What a pick is" — compounds,
   respellings, coinages, rare words; **not the first thing that comes to
   mind**, since those are registered). Ask for ~24 labels as a JSON array.
2. Parse at the boundary: the engine's text → zod (`string[]`) → `cleanLabel`
   each, dedupe, drop the keyword itself and anything outside 3–15 letters.
3. Check each survivor's `.com` through the existing `useVerdicts` /
   `checkDomain`, in batches as they arrive.
4. Show the **free** ones as chips under the field as their verdicts land (taken
   ones never appear); a chip calls `checkHere`, so the full zone grid takes
   over from there. A press that yields fewer than ~5 free ones says so and
   offers another press, which asks the model again with the already-seen names
   excluded.

Lookups stay on the registries' terms: only a press costs any, never typing, and
at most ~24 per press.

## Slice layout

A new sub-slice `src/unsquatted/pages/home/ideas/`, next to `dice`'s home
(`page/lib/dice.ts`) and the other sub-slices:

- `lib/prompt.ts` — the prompt and the JSON schema, one module both engines
  read.
- `lib/parse-ideas.ts` (+ `.test.ts`) — raw model text → clean unique labels.
- `lib/engine.ts` — the `IdeaEngine` type (`availability`,
  `generate(keyword, exclude, signal, onProgress)`) and `pickEngine()`.
- `lib/chrome-engine.ts`, `lib/transformers-engine.ts`, `lib/ideas.worker.ts` —
  the transformers module is dynamically imported, so a visitor who never
  presses loads none of it.
- `ui/ideas-button.tsx`, `ui/idea-chips.tsx` — wired in
  `page/ui/name-checker.tsx` beside the dice.
- Copy in the checker's catalogue (`checker/config/messages/en.json`), where
  `dice` already lives; a line under the "private" note saying the ideas are
  made on the device too.
- Prompt API types from `@types/dom-chromium-ai` (devDependency) rather than
  hand-declared.

## Verification

- Suite: `parse-ideas` (fenced JSON, prose around it, duplicates, the keyword
  echoed back, junk labels) and the prompt's exclude list.
- `pnpm build unsquatted` proves the worker and the dynamic import survive the
  static export.
- The engines need real hardware: the container's headless Chromium has neither
  Gemini Nano nor a GPU. So `/preview live unsquatted` and a QA checklist the
  operator runs in Chrome (built-in model), Chrome with the API off (WebGPU
  path) and Firefox (button hidden).

## Splitting

Taken whole: the two engines share everything but one file each, and neither is
a useful ship without the chips.

## DRY notes

- **Reused, not copied:** `cleanLabel` (`checker/index.node-safe`) for every
  label; `useVerdicts` / `checkDomain` for availability; `checkHere` for a
  chip's click; `TOOL_BUTTON` for the button's look.
- **One prompt, two engines:** `lib/prompt.ts` is the single home of the prompt
  and schema; each engine only adapts transport.
- **Not extracted:** the once-per-page `promise ??= load()` idiom now appears in
  `use-words.ts`, `check-domain.ts` and the engine loader. `??=` already is the
  abstraction — a helper would add a name, not remove code.
- **Dice stays separate:** faker's random pair and the model's ideas share only
  the field they write to, which `checkHere` already is.
