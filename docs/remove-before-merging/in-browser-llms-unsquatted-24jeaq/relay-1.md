# Relay 1 — unsquatted name variations from Chrome's built-in model

## Standing constraints

None stated by the operator.

## The conversation

1. **Operator** (with a Slack screenshot: Levon praised unsquatted and suggested
   "генератор который бы предлагал альтернативные идеи доменов когда вводишь
   какой-то ключевик"; Vova replied that LLMs break the no-server idea, BYOK is
   possible, "или на какой-нить in-browser модели кстати хмм", "заодно поучусь
   с ними что-то делать"): «давай попробуем поиграться с in-browser ллмками в
   unsquatted»
   - **Agent**: routed through `/task` → plan and hand off. Wrote a draft plan
     (ideas button beside the dice; Chrome Prompt API first, transformers.js v4
     on WebGPU elsewhere; show only names free in `.com`), opened draft PR #247,
     posted the squash proposal. Asked: 1 engine (a hybrid rec / b Prompt API
     only / c transformers.js only / d WebLLM), 2 what to show (only free rec),
     3 WebGPU model (spike rec).
2. **Operator**: «я не хочу наверное начинать с идей, скорее типа ищешь
   название, снизу под полем ввода появляется серенькая подсказка-надпись:
   "хочите побрейнстормить вариации?" при нажатии появляется модалка,
   поясняющаяя за браузерные ллм (доступным для обывателя языком), после этого
   при любом запросе вместо серой надписи уже 3 варианта для каждого поиска
   пользователя / для целей тестирования страница должна добавлять функцию,
   которой при запуске в консоли можно удалить уже загруженную модель (чтоб
   пробовать заново) / 1 пусть пока только десктопный хром, потестим, 2
   отпадает, 3 надо потестить на превью»
   - **Agent**: rewrote the plan to that flow, desktop Chrome Prompt API only.
     Reported that no web API can delete Chrome's model, so
     `unsquattedForget()` resets the page's side (opt-in, session, cache) and
     tells how to remove the model by hand (chrome://settings/system On-device
     AI, or the `optimization-guide-on-device-model` flag; chrome://components
     shows 0.0.0.0 once gone). Retitled the PR, refreshed body and squash
     proposal.
3. **Operator**: «поехали!»
   - **Agent**: `/go`: flipped the plan quoting the go-ahead, implemented the
     slice, all local checks green, pushed; then paused the plan for the
     context budget and relayed (verbatim in Last agent turn).

## Intent

A playground for in-browser LLMs on unsquatted that also answers Levon's ask:
after any search, three variations of the name, from Chrome's built-in model,
behind a one-time plain-language opt-in. Ruled out for now: transformers.js /
WebLLM / BYOK / server LLMs, non-Chrome and mobile browsers, availability
filtering of the variations ("2 отпадает").

## Decisions

- **Prompt API only** (operator's 1) over the hybrid: desktop Chrome first, "потестим".
- **No lookups for variations**: a click checks a variation like any name.
- **Console reset can't delete the model**: Gemini Nano is Chrome's, shared by
  sites; the function returns instructions instead. It _returns_ its text (the
  console prints it) because `no-console` forbids logging.
- **Sub-slices** `ideas/brainstorm/` (prompt, parser, session) and
  `ideas/offer/` (hook, line, modal): `masd:clusters` demanded the cut.
- Each prompt runs on a `clone()` of one system-prompted session, so answers
  don't colour each other; six names asked, three shown after parsing.
- A failed prompt answers `[]` (line empties) after `reportError`.
- "Question 3 (test on preview)" now means tuning the prompt's wording on
  `/preview live`, since the model is fixed.

## Errors and dead ends

- GitHub returned 500s on pushes for a few minutes (branch and `cost-ledger`);
  retries later succeeded. The ledger row for that turn may be missing — the
  next turn's row covers it.
- `pnpm check:mantine-styles` fails locally on `main` too after building only
  one site (it reads every site's built pages); not caused by this branch —
  vet will judge it.

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, head `391fb2b4` plus this
  relay commit, pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/247, title
  `feat(unsquatted): name variations from Chrome's built-in model`; body and
  squash proposal (comment, tracked in
  `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/squash-message.md`)
  describe the planned flow and match what was built. The PR body still reads
  "Plan only, no code yet" in its first bullet — `/pr` refresh fixes it.
- Plan `docs/plans/in-browser-llms-unsquatted.paused.md`, its `## Status`
  listing done and left.
- No CI, no PR subscription, no scheduled check-ins.
- Estimate: this session 5 h senior developer + 1 h middle designer + 1 h
  middle copywriter. Remainder handed on: 1 h senior developer ("polish and the
  preview publish on a slice already built"), 2 h senior prompter ("three good
  variations from Gemini Nano, steered from the obvious taken ones, takes
  iteration on real hardware"), 1 h middle designer ("the line and modal judged
  on the live preview in both themes"), 1 h middle qa ("Gemini Nano exists only
  on real desktop Chrome, so opt-in, download and reset are walked by hand").

## Pointers

- `docs/plans/in-browser-llms-unsquatted.paused.md` — the plan and its status.
- `src/unsquatted/pages/home/ideas/` — the slice;
  `brainstorm/lib/prompt.ts` is where prompt tuning happens.
- `src/unsquatted/pages/home/page/ui/name-checker.tsx` — `<IdeasLine>` wired
  between the form and the zone list.
- `src/unsquatted/pages/home/checker/config/messages/en.json` — `ideas` copy.
- `@types/dom-chromium-ai` (devDependency) types the Prompt API.
- Predecessor transcript: https://claude.ai/code/session_01DaohkEbjr7qEZ5daaRBm6A

## Next step

Resume the paused plan per `/go` Step 1: publish `/preview live unsquatted` so
the operator can try the flow in desktop Chrome (the operator said «3 надо
потестить на превью»), then `/go` Step 3 (`/polish`), flip the plan to
`*.completed.md`, and Step 4 (`/pr` refresh, which rewrites the stale "Plan
only" body).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

````text
Now the PR body and squash proposal must follow the plan.

План переписан под твою схему и запушен. Одну вещь сделать как ты просил нельзя: страница не может удалить модель Chrome. Gemini Nano принадлежит самому браузеру, общая для всех сайтов, и веб-API для её удаления нет.

Поэтому `unsquattedForget()` в консоли сделает всё, что можно на стороне страницы: забудет согласие, закроет сессию и очистит кэш вариантов. После этого при следующем поиске снова появится серая надпись. В консоль функция выведет, как снести саму модель: тумблер On-device AI в `chrome://settings/system` или флаг `#optimization-guide-on-device-model`. Удалилась ли модель, видно в `chrome://components`. Включишь обратно — Chrome скачает её заново, и так проверяется прогресс загрузки в модалке.

**Что теперь в плане:**
- **Подсказка.** После поиска под полем серая строка «Want to brainstorm variations?». Сайт англоязычный, поэтому копирайт тоже английский. Если `LanguageModel` нет или он `unavailable`, строки нет и всё как раньше.
- **Модалка.** Простыми словами: модель живёт в браузере, поиск никуда не уходит. Chrome один раз качает модель на несколько гигабайт, хранит её для всех сайтов, а удалить её можно в его настройках. Кнопки Turn it on / Not now. После Turn it on модалка показывает прогресс загрузки.
- **Варианты.** После согласия на месте строки при каждом поиске три варианта, кликабельные. Новый поиск обрывает генерацию, которая ещё идёт. Ответы кэшируются по имени.
- **Твои ответы:**
  - 1 — только десктопный Chrome, то есть только Prompt API; transformers.js из плана убран.
  - 2 — снят: три варианта без проверки занятости, клик проверяет вариант как любое другое имя.
  - 3 — выбирать модель больше не из чего, это всегда Gemini Nano. Тестировать на превью остаётся формулировку промпта, это записано в план.

Оценка уменьшилась с ~17 до ~10 senior-часов: движок теперь один.

https://github.com/vzakharov/vovazakharov.com/pull/247

Чтобы начать реализацию, открой новую сессию командой ниже или просто скажи здесь «поехали»:

```
/go claude/in-browser-llms-unsquatted-24jeaq
```

Источники:
- [How to delete Chrome AI data (nektony)](https://nektony.com/how-to/delete-chrome-ai-data-on-mac)
- [Chrome quietly installs a 4GB AI model (Analytics Insight)](https://www.analyticsinsight.net/google-chrome-quietly-installs-googles-4gb-ai-model-heres-how-to-get-rid-of-it)
- [Analytics Insight (AMP)](https://www.analyticsinsight.net/amp/story/artificial-intelligence/google-chrome-quietly-installs-googles-4gb-ai-model-heres-how-to-get-rid-of-it)
- [How to disable Gemini Nano (Android Authority)](https://androidauthority.com/how-to-disable-chrome-gemini-nano-delete-weights-bin-3665109)
- [Chrome downloaded a 4GB AI model (tabbit)](https://go.tabbit.ai/blog/chrome-downloaded-4gb-ai-model)
- [Remove Gemini Nano files (superchargebrowser)](https://www.superchargebrowser.com/library/remove-gemini-nano-files-chrome/)
- [Remove Gemini Nano files, .md (superchargebrowser)](https://www.superchargebrowser.com/library/remove-gemini-nano-files-chrome.md)
````
