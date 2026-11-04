# Relay 2 — unsquatted name variations: Qwen everywhere next

## Standing constraints

None stated by the operator.

## The conversation

0. **Launch** (relay 1's take): `/relay take claude/in-browser-llms-unsquatted-24jeaq — фича реализована и запушена, впереди превью, полировка и обновление PR`
   - **Agent**: resumed the paused plan; published `/preview live unsquatted`;
     ran `/polish` in a subagent (7cd1ac34: schema bounds derived from the
     parser's constants; prompt now says "Suggest 6 alternatives"; five-percent
     posted one critical proposal, review 5768094962 on `use-ideas.ts:62`:
     the opt-in outlives Chrome deleting its model); flipped the plan to
     `completed`; refreshed PR body and squash proposal. Asked whether to fix
     the stale opt-in.
1. **Operator** (screenshot: modal stuck on "Chrome is downloading the model:
   0%", console full of RDAP 404s): «хм, минуту или больше висит вот так»
   - **Agent**: guessed coarse progress events; changed the modal copy so a
     0% wait says it may take minutes and can be closed (committed); pointed
     at `chrome://on-device-internals` / `chrome://components`.
2. **Operator** (mid-turn): «в Network ничего по этому поводу»
   - **Agent**: Network shows only the page's requests; the browser fetches
     the model itself.
3. **Operator** (screenshots: on-device-internals "Device performance class:
   GPU blocked"; chrome://components without the model component)
   - **Agent**: read "GPU blocked" as the cause; offered three fixes
     (graphics acceleration, Event Logs, the BypassPerfRequirement flag) and a
     30-second stall timeout; re-asked the stale opt-in question.
4. **Operator** (attached `chrome://gpu` dump, an empty Optimization Guide log,
   and graphics acceleration shown on): «1, 2 приложил / 3 зачем? юзер же
   этого включать не будет»
   - **Agent**: the dump's command line is `/Applications/Arc.app` — Arc, a
     Chromium that exposes `LanguageModel`, answers `downloadable`, and has no
     service to fetch Gemini Nano, so `create()` never settles; the GPU is
     fine. Added a stall watch: no progress event within 30 s → the modal
     says this browser won't download it and Google Chrome will (committed).
5. **Operator** (screenshot: real Chrome showing "or try codexbot · botcode ·
   codebotify" under `codebots`): «в хроме заработало, ура. но кто сейчас
   пользуется хромом? так что делаем с первоначальным запасным планом. / при
   этом как нам отличить "настоящий" хром от мимикрирующего? если никак, то
   нужно везде qwen / +or try не надо, нужно иконку лампочки, пока ищется --
   она типа мигает/гаснет, как найдётся -- зажигается (не очень аляписто)»
   - **Agent**: built the bulb (committed, below), referring to "a question
     below" it had not yet written.
6. **Operator** (mid-turn): «над каким вопросом ниже?»
   - **Agent**: apologised and asked it: brands tell only partly
     (`userAgentData.brands`; what Arc reports is unchecked), behaviour tells
     reliably (the stall watch); recommended a hybrid (Nano where present,
     Qwen elsewhere) over Qwen everywhere; then reported the bulb (shot in
     both themes with a stubbed model) and proposed relaying the engine work
     (verbatim in Last agent turn).
7. **Operator**: «только qwen, чтобы не поддерживать два пути / и конечно
   релей»
   - **Agent**: this relay.

## Intent

A playground for in-browser LLMs on unsquatted that answers Levon's ask: after
any search, three variations of the name under the field, behind a one-time
plain-language opt-in, the site staying serverless and the search staying on
the visitor's machine. Now **for every desktop browser that can run it**, not
only Chrome, through **one engine, Qwen**, so there is a single path to
maintain. The variations are shown behind a lightbulb, not words.

## Decisions

- **Qwen only, Chrome's Prompt API dropped** — over the hybrid the agent
  recommended: the operator's call, «чтобы не поддерживать два пути». So
  `built-in-model.ts`, the Prompt API's stall watch and `@types/dom-chromium-ai`
  all go; what replaces them is transformers.js.
- **The original fallback plan is the starting point**: the first plan commit
  b654ef16 (`git show b654ef16:docs/plans/in-browser-llms-unsquatted.draft.do-not-implement.md`,
  § "Engine") had transformers.js v4 (`@huggingface/transformers`, 4.3.x at
  the time; 4.3.2 now) on **WebGPU**, in a **Web Worker** so generation never
  freezes the field, the smallest `onnx-community` Qwen3.5 instruct that runs
  at `q4f16` (Qwen3-0.6B if none), ~400–500 MB cached by the browser after
  the first download, the module dynamically imported so a visitor who never
  opts in pays nothing; no WebGPU → no line at all (a 0.6B model on WASM is
  too slow). Re-check model availability and sizes now rather than trusting
  that text.
- **The modal's copy changes with it**: it names Chrome's model, "a few
  gigabytes", "Chrome's settings" to remove it, and "only in Chrome on a
  computer"; under Qwen the download is ~0.5 GB, made by the site, kept in
  the browser's cache for this site, and the progress comes from
  transformers.js's `progress_callback`. The `waiting`/`stalled` keys in
  `en.json` exist only for the Prompt API and go too.
- **`unsquattedForget()`** can now actually delete the model: the weights sit
  in the site's own Cache Storage (transformers.js uses the `transformers-cache`
  cache), so the console reset can drop them — the original ask «удалить уже
  загруженную модель (чтоб пробовать заново)» becomes possible.
- **The stale opt-in** (five-percent review 5768094962): under Qwen it maps to
  "opted in, but the cached weights were evicted" — the browser can clear
  Cache Storage. Never answered by the operator; it is still open.
- **The bulb**: `lucide-react`'s `Lightbulb` before the names; dim
  (`--unsquatted-muted`) and breathing (opacity 0.25↔0.8, 1.6 s) while the
  model thinks, lit in `--unsquatted-maybe` gold once names are in; no
  animation under `prefers-reduced-motion`. The words (`ideas.thinking`,
  `ideas.lead`) stay for screen readers in a `.unseen` span; jsx-a11y rejects
  `role="img"` on the svg, and Mantine's `VisuallyHidden` would need its sheet
  added to shell's provider, so the class is the slice's own.
- **Arc is a mimic**: it exposes `LanguageModel` and reports `downloadable`
  but has nothing to fetch Gemini Nano with — the reason Qwen everywhere won.

## Errors and dead ends

- "Coarse progress events" (turn 1) and "GPU blocked" (turn 3) were both wrong
  readings; the operator's `chrome://gpu` dump showed Arc. The operator
  rejected the Chrome-flag workaround because visitors won't flip flags.
- The agent wrote "a question below" before writing it (turn 5); the operator
  had to ask what it meant.
- `jsx-a11y/prefer-tag-over-role` rejected `role="img"` + `aria-label` on the
  bulb.

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, head `683a6910` plus this
  relay commit, pushed; base `main`.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/247, title
  `feat(unsquatted): name variations from Chrome's built-in model`. Body and
  squash proposal (comment, tracked in
  `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/squash-message.md`)
  describe the Chrome-only flow and must be rewritten for Qwen, title
  included.
- Plan `docs/plans/in-browser-llms-unsquatted.completed.md` describes the
  Chrome flow; the Qwen work enters `/go` as planless follow-up, not a plan
  cycle.
- Preview: https://preview.vovazakharov.com holds unsquatted from this branch
  (last publish after `683a6910`); the session republishes after each visible
  change it pushes.
- Polish floor: `7cd1ac34` (`polish:`); everything after it is unpolished.
- Nothing else running: no CI, no PR subscription, no scheduled check-in.
- Estimate: this session 2 h senior developer + 1 h middle designer + 1 h
  middle qa. Remainder handed on: 4 h senior developer ("the engine swap —
  transformers.js on WebGPU in a worker, dynamic import, cache-aware reset —
  takes judgement against real browsers"), 2 h senior prompter ("a 0.6B
  model needs the prompt and parser retuned to give three good variations"),
  0.5 h middle copywriter ("the modal's plain-language explainer rewritten
  for a site-downloaded model"), 1.5 h middle qa ("each desktop browser with
  and without WebGPU is walked by hand").

## Pointers

- `src/unsquatted/pages/home/ideas/brainstorm/` — engine sub-slice:
  `lib/built-in-model.ts` (the Prompt API, to be replaced), `lib/prompt.ts`
  (system prompt, `promptFor`, `RESPONSE_SCHEMA`, `IDEA_LENGTH`,
  `IDEAS_ASKED`/`IDEAS_SHOWN`), `lib/parse-ideas.ts` + test.
- `src/unsquatted/pages/home/ideas/offer/` — `lib/use-ideas.ts` (opt-in in
  localStorage `unsquatted.ideas`, availability, per-label cache, abort,
  `unsquattedForget`), `ui/ideas-line.tsx` (offer / bulb / names),
  `ui/ideas-modal.tsx` (explainer, progress, `FIRST_PROGRESS_MS` stall),
  `ui/ideas.module.scss`.
- `src/unsquatted/pages/home/checker/config/messages/en.json` — `ideas` copy.
- `tmp/preview/bulb.cjs` (dies with this container) stubbed `LanguageModel`
  via Playwright `addInitScript` to shoot the bulb; the same trick works for a
  stubbed worker.
- `package.json` — `@types/dom-chromium-ai` devDependency, to drop.
- Original hybrid plan: `git show b654ef16 -- docs/plans/`.
- Predecessor transcripts: this session
  https://claude.ai/code/session_01DaohkCsgymHrNjAGTnrXRx; relay 1's
  https://claude.ai/code/session_01DaohkEbjr7qEZ5daaRBm6A.

## Next step

Replace Chrome's Prompt API with Qwen through transformers.js for every
browser, as the operator decided: «только qwen, чтобы не поддерживать два
пути». Keep the offer, modal and bulb flow; rewrite the modal copy for a
~0.5 GB site-downloaded model; make `unsquattedForget()` drop the cached
weights; drop `built-in-model.ts`, the stall watch, its copy keys and
`@types/dom-chromium-ai`. Then `/polish`, republish `/preview live
unsquatted`, and `/pr` refresh (title, body and squash proposal). The stale
opt-in question (five-percent review 5768094962) is still unanswered — ask it
again, and keep working while it is open.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Пока ты думаешь над вопросом ниже, делаю лампочку: она нужна при любом ответе.

Извини, я сослался на вопрос, который ещё не задал. Вот он.

**Как отличить настоящий Chrome от мимикрирующего.** По названию только частично. Есть `navigator.userAgentData.brands`: Brave, Opera и Edge называют себя своими именами. Что отдаёт Arc, я не проверял: может, только «Chromium», а может, и «Google Chrome». Зато можно отличить по поведению, и это надёжно. Настоящий Chrome в начале скачки сразу присылает «0%», а Arc молчит. Сторож на 30 секунд уже это ловит. А если модель уже скачана (`available`), это настоящий Chrome без вариантов.

**Поэтому предлагаю не «Qwen везде», а гибрид:**
- модель уже скачана → Gemini Nano: ноль загрузки, и, судя по твоему скрину, варианты хорошие;
- бренд «Google Chrome» или «Microsoft Edge» и можно скачать → пробуем Nano. Если за 30 секунд нет прогресса, тихо переключаемся на Qwen. У Edge, кстати, своя встроенная модель (Phi) через тот же API;
- всё остальное с WebGPU (Arc, Brave, Safari 26, Firefox на Windows) → сразу Qwen через transformers.js, примерно 400–500 МБ один раз, в Web Worker;
- без WebGPU → строки нет, как сейчас.

«Qwen везде» проще в коде: один движок и одинаковое качество. Но тогда пользователь Chrome со скачанной Nano будет качать лишние полгигабайта. Как решаем — гибрид или Qwen везде? Движок Qwen нужен в обоих случаях, так что я начну с него, не дожидаясь ответа.

Лампочка в коде готова, прогоняю линтеры и делаю скриншоты с подставной моделью.

Лампочка готова и запушена, превью пересобирается.

![](tmp/preview/bulb-lit-light.png)

Вместо «or try» и «brainstorming variations…» теперь маленькая лампочка. Пока модель думает, она тусклая и медленно мерцает. Когда варианты пришли, она загорается золотым — тем же цветом, что «maybe» на сайте. Если у человека в системе включено «уменьшить движение», мерцания нет, лампочка просто тусклая. Для читалок экрана слова остались, только невидимые. Проверил с подставной моделью в обеих темах: смотрится тихо, не аляписто.

**Ответь, пожалуйста, на вопрос:** гибрид (Gemini Nano там, где она реально есть, Qwen у остальных) или Qwen у всех? Я за гибрид: человеку с Chrome не придётся качать лишние полгигабайта, а Nano, судя по твоему скрину, варианты даёт хорошие. Arc и других притворщиков отсеивает сторож из прошлого коммита: если за 30 секунд нет прогресса, переключаемся на Qwen.

Движок Qwen (transformers.js на WebGPU, в Web Worker) нужен в обоих случаях. Но это большой новый кусок, а контекст этой сессии уже порядком набит. Поэтому, если ты не против, после твоего ответа передам работу свежей сессии через `/relay`, вместе с твоим решением. Оценку задачи я поднял под второй движок.
```
