# Relay 9 — preview walk of 2026-11-05: eviction notice confirmed, inline bulb, "All set", tab-close guard; parked

## Standing constraints

None stated by the operator.

## The conversation

0. **Launch**: `/relay take claude/in-browser-llms-unsquatted-24jeaq — ревью от 5 ноября отработано, ждут ответа два вопроса, PR конфликтует с main`
   - **Agent**: attached (auto-branch delete answered `stale info`: never pushed), read relay-8.
1. **Operator** (mid-turn, with a screenshot of the default opt-in dialog): «после удаления, перезагрузки страницы и нажатия лампочки вылезла ещё раз дефолтная модалка»
2. **Operator** (mid-turn): «заодно давай в копии "whenever you press [иконка]"»
3. **Operator** (mid-turn): «кстати а если gpu нет, она не покажется? в смысле вся иконка?»
   - **Agent**: the default dialog means the opt-in in localStorage was gone too ("Clear site data" wipes it; deleting only Cache Storage keeps it), and the preview was still f8d6bd76, before the eviction notice. Inline bulb icon in `ideas.what` via `{bulb}` (6fe1a858), republished to preview. No WebGPU adapter, or no fine pointer → `available` false → no button at all.
4. **Operator**: «на превью выложишь?»
   - **Agent**: already there, from 6fe1a858; hard-reload, delete only Cache Storage.
5. **Operator**: «пока что-то также. может optedIn сам протух. сейчас скачаю, удалю и попробую снова. кстати давай исправим "You can close this window" -- window звучит слишком обще»
   - **Agent**: "window" → "dialog" (19388433), republished.
6. **Operator** (mid-turn): «и ещё обнаружил небольшой баг, если модалку не закрыть, то когда модель дозагрузиться надпись на кнопке по-прежнему "Turn it on", должно быть что-то типа всё готово»
7. **Operator** (mid-turn, with a screenshot of the evicted notice at 2%): «да, после скчаивания, удаления и повторного нажатия всё ок»
8. **Operator** (mid-turn): «кстати а что будет если закрыть прямо window/вкладку пока качается? всё ж прервётся? наверное нужно или сказать не закрывай, и/или повесить ванильное "changes not saved" на попытку закрыть»
9. **Operator** (mid-turn): «> Pick<Stage, 'optedIn'> низя :)»
   - **Agent**: be87a5e1 — the dialog left open shows «All set: the model is ready.» with OK once the download finishes; `optedIn` folded into `Loading` (lint had already refused the `Pick`); `beforeunload` guard while a load runs (in `startModel`); copy «You can close this dialog, though not the tab». Republished; still pending the self-clearing-promise question and the DIRTY merge. (verbatim in Last agent turn)
   - (Keepalive's last wake parked the session: this file, first version.)
10. **Operator** (back on the parked session): «а давай сделаем чтобы буквы писались (там же где будет финальный результат) пока модель стримит, чтобы не было ощущения такого долгого ожидания (кружок оставить)»
    - **Agent**: 3cd77325 — `TextStreamer` in `engine.generate` feeds `typedIdeas` (finished lines judged as `parseIdeas` does, the line being written cleaned but not judged); `suggest` passes it on until aborted; `useIdeas` exposes `typing`; `IdeasLine` shows `typing ?? names`, plain text while typing, links once in, `aria-busy` while typing. Ring unchanged. Republished to preview; summary rewritten.
11. **Operator**: «оказывается она начинает печатать буквально в последние доли секунды, до этого просто думает, так что откатываем 🙈»
    - **Agent**: reverted (63a52434; `src/` identical to before 3cd77325), republished. The wait is before the first token (most likely the prompt's prefill), so a shorter prompt is what would shorten it.
12. **Operator**: «я оставил там ревью, давай его обработаем»
    - **Agent**: relayed with `handle` as the successor's first message, the context being past its budget line for a full review pass.

## Intent

Variations on unsquatted from Qwen3.5-0.8B in the visitor's browser (WebGPU), desktop only, behind the lightbulb among the field's buttons. The operator walks it on the preview with a real GPU and reports what reads wrong; copy and small UX fixes land on the branch as they come. Framed as a new feature, never as a fix (relay 8, T02).

## Decisions

- **The eviction notice works as built** — operator confirmed after download → delete Cache Storage → reload → press. The earlier default dialog came from a cleared opt-in, not a bug.
- **`{bulb}` token** in `ideas.what`, split in `ideas-modal.tsx` like the home page's byline; the icon is `aria-hidden` with `ideas.bulb` ("the lightbulb") in an `.unseen` span; class `.pressed` sizes it, colour inherited.
- **"dialog"**, not "window" or "pop-up", for the opt-in dialog in copy.
- **`done` in `IdeasModal`** = `!busy && !failed && (evicted || optedIn)`: shows `ideas.ready` and an OK button. `optedIn` lives in `Loading` (now "where the opt-in and its download stand"), beating a separate `OptedIn` type, which tripped `type-overlap`'s combination floor, and `Pick`, which `vova/no-pick-omit` refuses.
- **No streaming**: tried (3cd77325) and reverted (63a52434) — the model emits its tokens in the last fraction of a second, so the letters shortened no visible wait.
- **Tab-close guard in `startModel`** (`holdPage` added at start, removed in `finally`), not in the hook: tied to the load's own lifecycle; the browser's own wording, since custom text is not allowed.

## Errors and dead ends

- This branch needs `pnpm install --frozen-lockfile` after the session-start hook (installs `main`'s deps).
- Headless Chromium has no WebGPU, so the dialog cannot be screenshotted locally; the operator walks it on preview.

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, base `main`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/247, `mergeStateStatus` **DIRTY** (not merged in, per the loop). Last pushed commit 63a52434, then this summary's rewrite.
- Preview: unsquatted from 63a52434, published by this session.
- Plan `docs/plans/qwen-everywhere-unsquatted.paused.md` (Left list not updated this session: 0 push protection, 2 real-browser walk — now partly done by the operator, 2a five pre-existing `type-overlap` groups, 3 prompt retune, 4 `/five-percent` over relay 8's and this session's changes).
- Estimate: this session 3 h middle developer (inline icon, done-state, tab guard, streaming) + 0.5 h middle qa (stale preview vs cleared site data). Remainder handed on, as relay 8 left it: 0.5 h senior prompter (retune after real output), 1.5 h middle qa (the rest of the desktop walk), 0.5 h middle developer (type-overlap groups and base merge).

## Pointers

- `src/unsquatted/pages/home/ideas/offer/ui/ideas-modal.tsx` — `{bulb}` split, `done`.
- `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts` — `Loading` with `optedIn`.
- `src/unsquatted/pages/home/ideas/brainstorm/lib/local-model.ts` — `startModel`, `holdPage`.
- `src/unsquatted/pages/home/checker/config/messages/en.json` — `ideas.bulb`, `ideas.ready`, `ideas.downloading`.
- Transcripts: this session https://claude.ai/code/session_01DaohkDnHaAN7NRxxranHWk; relay 8's https://claude.ai/code/session_01DaohkC7xCgLHrKbBUPMB5E.

## Next step

`handle`

That is: the operator left a new review on PR #247 («я оставил там ревью, давай его обработаем») — export it and work it. Also pending: their walk on preview of «All set» and the tab-close prompt; the question whether to extract the self-clearing cached promise in `local-model.ts`/`engine.ts` (recommended: keep). Still open after that: `/five-percent` over the review changes, the DIRTY merge and the type-overlap groups (both `/finalize`'s).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Превью обновлено (19388433). Теперь чиню кнопку, которая после окончания загрузки так и показывает «Turn it on».

Отлично, окно «ой, куда-то подевалось» живое. Остальные три правки тоже уже на превью, сборка из be87a5e1:

- **Кнопка после загрузки.** Если окно не закрывать, то по окончании загрузки там появляется «All set: the model is ready.» и одна кнопка OK. Раньше было «Turn it on», потому что окно, как только загрузка кончалась, просто возвращалось в начальное состояние. В окне «ой, куда-то подевалось» после докачки тоже появится эта строка.
- **Закрытие вкладки во время загрузки.** Да, загрузка прерывается, и пропадает почти всё. Браузер сохраняет только файлы, скачанные целиком, а почти весь вес модели лежит в одном файле на ~600 МБ. Сделал оба твоих варианта:
  - пока модель грузится, при закрытии вкладки браузер спрашивает своё стандартное «Leave site?». Свой текст туда браузеры вставить не дают;
  - в тексте теперь «You can close this dialog, though not the tab».
- **«window» → «dialog»**. Это поправка из того же текста.

`Pick` в итоговый код не попал: lint завернул его раньше тебя 🙂. Флаг согласия я положил к остальному состоянию загрузки в `Loading`. Lint, tsc и prettier прошли, новых групп `type-overlap` не появилось.

Глазами я окно опять не видел, потому что в headless Chromium нет WebGPU. Что стоит потыкать на превью:
1. Включи модель и дождись конца загрузки, не закрывая окно: должно появиться «All set».
2. Во время загрузки попробуй закрыть вкладку: браузер должен спросить.

Всё ещё ждёт твоего ответа: выносить ли в общий хелпер обещание, которое сбрасывает само себя при ошибке (советую оставить). И PR по-прежнему конфликтует с main, до `/finalize` я его не трогаю.
```
