> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# unsquatted: name variations from Chrome's built-in model

## Goal

A visitor searching a name is offered, once, to brainstorm variations; on
agreeing, every search from then on shows three variations of the name under the
field, each a click from its own check. The model is Chrome's built-in one, so
the site stays serverless and the search never leaves the visitor's machine —
the byline's "private" stays true.

Origin: Levon's ask in Slack, and the operator's wish to learn in-browser models
on it. **Desktop Chrome only for now** (Chrome 148+, where the Prompt API is
stable for web pages); other browsers see nothing new.

## The flow

1. **The offer.** Once a search has run (`label !== ''`) and
   `LanguageModel.availability()` is anything but `unavailable`, a grey line
   under the field reads "Want to brainstorm variations?". No `LanguageModel`
   global, or `unavailable` → no line, and the checker is exactly as today.
2. **The modal**, on clicking it — in plain words, no jargon:
   - a small AI model runs inside the visitor's own browser and makes up the
     variations; the search is never sent anywhere;
   - Chrome downloads that model once (several GB), keeps it for every site that
     uses it, and manages it itself — the visitor can remove it in Chrome's
     settings;
   - it works in desktop Chrome only, for now.

   Buttons: **Turn it on** / **Not now**. Turn it on creates the session — the
   click is the user activation `LanguageModel.create()` needs while the model
   is `downloadable` — and the modal shows Chrome's download progress
   (`monitor`'s `downloadprogress`) until the model is ready, then closes.

3. **The variations.** With the opt-in stored, the grey line's place shows three
   variations for every settled search, in place of the offer: a quiet
   placeholder while the model thinks, then three clickable names, each calling
   `checkHere`. A new search aborts the one in flight (`AbortSignal`); answers
   are kept per label for the page's life, so going back to a name costs no
   second prompt. A failed prompt is reported to `reportError` and the line
   stays empty for that search.

No availability lookups for the variations: a click checks one, like any other
name.

## The prompt

The label, plus the naming runbook's taste in a few lines
(`src/unsquatted/scripts/RUNBOOK.md` § "What a pick is" — respellings,
compounds, coinages, rare words; **not the first thing that comes to mind**,
since those are registered). `responseConstraint` holds a JSON schema of a
three-to-six-string array, so Chrome returns JSON. The answer is parsed at the
boundary — zod, then `cleanLabel` each, dedupe, drop the label itself and
anything outside 3–15 letters — and the first three kept. Prompt wording is
tuned on `/preview live unsquatted` in the operator's Chrome.

## The console reset, for testing

The page puts `unsquattedForget()` on `window`. It forgets the opt-in, destroys
the session and the cached variations, so the next search shows the offer again
— and logs how to remove Chrome's model itself, since **no web API can delete
it**: the model is Chrome's, shared across sites. The log names
`chrome://settings/system` (On-device AI toggle) and, as the fallback,
`chrome://flags/#optimization-guide-on-device-model` plus `chrome://components`
("Optimization Guide On Device Model", version `0.0.0.0` once gone). Re-enabling
brings the download back, which is what tests the modal's progress.

## Slice layout

A new sub-slice `src/unsquatted/pages/home/ideas/`:

- `lib/prompt.ts` — the system prompt, the per-label prompt, the JSON schema.
- `lib/parse-ideas.ts` (+ `.test.ts`) — the model's JSON → three clean labels.
- `lib/built-in-model.ts` — `availability()`, the once-per-page session (with
  `monitor`), `suggest(label, signal)`, `forget()`.
- `lib/use-ideas.ts` — the opt-in (Mantine's `useLocalStorage`, as `likes`
  stores its list), the per-label cache, the abort on a new label.
- `lib/console-reset.ts` — installs `unsquattedForget` once on mount.
- `ui/ideas-line.tsx` — the grey offer, then the three variations.
- `ui/ideas-modal.tsx` — the explanation, the opt-in, the download progress.
- Wired in `page/ui/name-checker.tsx`, between the form and the zone list.
- Copy in the checker's catalogue (`checker/config/messages/en.json`), where
  `dice` already lives.
- Prompt API types from `@types/dom-chromium-ai` (devDependency) rather than
  hand-declared.

## Verification

- Suite: `parse-ideas` — prose or fences around the JSON, duplicates, the label
  echoed back, junk labels, fewer than three survivors.
- `pnpm build unsquatted` — the page still exports with the new client code.
- The container's headless Chromium has no Gemini Nano, so the flow is checked
  on `/preview live unsquatted` in the operator's desktop Chrome: offer, modal,
  download, variations, `unsquattedForget()`, and Firefox showing nothing.

## DRY notes

- **Reused, not copied:** `cleanLabel` (`checker/index.node-safe`) for every
  variation; `checkHere` for a click; Mantine's `useLocalStorage` for the
  opt-in, as `likes-state.tsx` stores likes.
- **Not extracted:** the once-per-page `promise ??= load()` idiom now appears in
  `use-words.ts`, `check-domain.ts` and the session loader. `??=` already is the
  abstraction — a helper would add a name, not remove code.
- **Dice stays separate:** faker's random pair and the model's variations share
  only the field they write to, which `checkHere` already is.
