# Relay 10 — review of 2026-11-05 worked; "give me ai" asked, paused on the context budget

## Standing constraints

None stated by the operator.

## The conversation

0. **Launch**: `/relay take claude/in-browser-llms-unsquatted-24jeaq — на PR новое ревью от Вовы, стриминг откачен, превью из 63a52434`
   - **Agent**: attached (local branch ref was stale; reset to origin 94b640ad), read relay-9, ran `/handle`: export dba1877c, three threads. Fixed all three in a92fc396 — model held on `globalThis` so a hot reload finds it rather than leaking GPU memory (T01; the other module `let`s hold GC'd JS values), download line shortened (T02), "Let’s go!" on the done button (T03). Replied on each thread, republished preview. `/polish` (subagent): 8d6e29dc (one `%inline-bulb` placeholder, one status paragraph), 75d08dd0 (docstring), `/five-percent` review 5782780413 with two optional proposals; reported to the operator, recommending to keep `globalThis` over `module.hot.dispose`, and asking about guarding the tab only while downloading.
1. **Operator**: «1 - специально для локального ничего дополнительного делать не надо, достаточно чтобы память не утекала / 2 - да»
   - **Agent**: kept `globalThis`; moved the `beforeunload` guard from `startModel` to an effect in `useIdeas` keyed on `downloading` (7be78f31). Replied on both five-percent threads, plan's Left updated, preview republished.
2. **Operator**: «дополнительный запрос, давай всё-таки сделаем ИИ доступной _не_ всем и не сразу, кажется, что долгота её работы может детрактить и размывать "blazing fast". давай если в поле ввода появляется дословно "give me ai", "выскакивает" (с небольшой анимацией) кнопочка лампочки и на неё стрелочка с надписью there you go, "весёлым" шрифтом как на превьюхах ("okay maybe not this one")»
   - **Agent**: found the hand face — Caveat as `--font-hand`, from #248 (41a1673b) on main, absent on this branch. Context budget warning came; wrote `docs/plans/give-me-ai-unsquatted.paused.md` before any edit and relayed.
3. **Operator** (mid-turn): «шрифт Caveat из main — гы, подходящее название»
   - **Agent**: confirmed the face; this relay. (verbatim in Last agent turn)

## Intent

Variations on unsquatted from Qwen3.5-0.8B in the visitor's browser (WebGPU), desktop only. Now hidden behind an easter egg: the AI's slowness must not dilute the site's "blazing fast", so the bulb appears only to someone who types "give me ai".

## Decisions

- **Model on `globalThis`** (`engine.ts`, `held.unsquattedModel`), not `module.hot.dispose`: operator: nothing extra for local testing, only no leak. A changed `MODEL`/`dtype` needs a page reload; accepted.
- **Tab guard only while `downloading`** (effect in `useIdeas`), operator's «да».
- **Hand face is Caveat from main** (`--font-hand`), the share card's "okay, maybe not these ones" — operator confirmed.
- No streaming (relay 9): reverted.

## Errors and dead ends

- The cloned local branch ref was 50 commits stale against origin; `git reset --hard origin/<branch>` fixed it (no local work).
- `@eslint-react/web-api-no-leaked-event-listener` wants `globalThis.addEventListener`/`removeEventListener` spelled the same in effect and cleanup.
- Headless Chromium has no WebGPU; the operator walks the dialog on preview.

## State

- Branch `claude/in-browser-llms-unsquatted-24jeaq`, base `main`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/247, `mergeStateStatus` DIRTY (conflicts with main). Last pushed 2811ff37, then this summary.
- Preview: unsquatted from 7be78f31.
- Plans: `docs/plans/give-me-ai-unsquatted.paused.md` (the new ask, nothing built) and `docs/plans/qwen-everywhere-unsquatted.paused.md` (Left: 0 push protection, 2 real-browser walk, 2a five `type-overlap` groups, 3 prompt retune; 4 settled).
- Estimate: this session 1 h middle developer + 0.25 h senior copywriter. Remainder handed on: 2 h middle developer (the gate, pop-in, arrow, base merge), 0.5 h middle designer (the arrow and caption's placement and motion), 0.5 h senior prompter (retune after real output), 1.5 h middle qa (desktop walk), 0.5 h middle developer (type-overlap groups).
- No CI run or subscription pending.

## Pointers

- `src/unsquatted/pages/home/ideas/offer/ui/ideas-offer.tsx` — the bulb; returns nothing unless `available`.
- `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts` — state, tab guard.
- `src/unsquatted/pages/home/page/ui/name-checker.tsx` — field, `useIdeas(label)`, `IdeasOffer` in `fieldTools`.
- `src/unsquatted/pages/home/deck/ui/shuffle-motion.ts` — the reduced-motion check to reuse.
- On main: `src/unsquatted/app/ui/root-layout.tsx` (Caveat), `--font-hand` in the site stylesheet, `share-card.ts`'s hand draw.
- Transcripts: this session https://claude.ai/code/session_01DaohkBDY31QvN7Utbu6vf7; relay 9's https://claude.ai/code/session_01DaohkDnHaAN7NRxxranHWk.

## Next step

Build the operator's latest ask, «давай если в поле ввода появляется дословно "give me ai", "выскакивает" (с небольшой анимацией) кнопочка лампочки и на неё стрелочка с надписью there you go, "весёлым" шрифтом» — `docs/plans/give-me-ai-unsquatted.paused.md` through `/go`. The font needs main merged in (`/sync-branch`), which this ask now calls for: it is the operator's ask that requires main's Caveat. Ask the plan's open questions (persisting the unlock, what happens to the phrase in the field, when the arrow leaves) as numbered prose and build what they do not block. Republish the preview after.

Still pending, from earlier: the self-clearing cached promise helper question (recommended: keep); `/finalize` owns the type-overlap groups.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Lint is clean. Committing, replying in the `/five-percent` threads, and republishing.

Сделал оба пункта, и оба ответа есть в тредах на GitHub.

1. **Hot reload.** Модель остаётся на `globalThis`, утечки памяти видеокарты нет. Больше ничего ради локального тестирования не добавлял.
2. **«Leave site?»** Теперь браузер спрашивает только во время скачивания модели, при первом включении или когда браузер её выкинул. Если веса уже в кэше, вкладка закрывается без вопроса. Коммит 7be78f31: guard переехал из `startModel` в эффект в `useIdeas`, который зависит от `downloading`. Lint, tsc и prettier прошли.

Превью пересобирается из 7be78f31. Проверить стоит две вещи:
- Во время первой загрузки закрываешь вкладку, и браузер спрашивает.
- Модель уже скачана, перезагружаешь страницу, жмёшь лампочку и сразу закрываешь вкладку: вопроса быть не должно.

По-прежнему открыты:
- Вопрос про хелпер для промиса, который сам сбрасывается при ошибке. Я советую оставить как есть.
- Конфликт с main и пять групп `type-overlap`. До `/finalize` их не трогаю.
```
