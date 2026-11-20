# Relay 1 — cut the game's plays down (parked)

## Standing constraints

None stated.

## The conversation

1. **Operator** (via `/task`): "The plays cut down — the first item of
   docs/masd.md § "Open directions" (the game's scripted plays, sharded under
   VET_MEADOW=1 and commented out in vet.yml; the operator: «я думаю мы все
   равно сильно-сильно все эти прогоны резать будем, кажется, необходимость в
   них отпала после того как игру уже написали»). Read that section first; it
   carries the run ids and the context. The MASD work landed in #169."
   - **Agent**: routed to plan-and-hand-off (scope is the question). Wrote the
     draft plan, opened draft PR #226, posted the squash proposal. Put one
     question: 1a remove plays + probe whole (recommended, in force in the
     plan), 1b keep one smoke play (open `/mushrooms` on five screens from the
     ordinary export, fail on page error), 1c keep only the green plays. Offered
     the muthur sync (#243) once. (verbatim in Last agent turn)

No operator reply since; the keepalive's last wake parked the session.

## Intent

Remove the mushroom game's scripted plays (`pnpm play:mushrooms`, 18 plays × 5
screens, ~10k lines under `src/mushrooms/scripts/`), which the operator judges
no longer needed now the game is written. The game's own meadow tests stay.

## Decisions

- **Plan with handoff rather than go**: how far to cut is the operator's call
  (`/task` Step 3, "scope is itself the question").
- **Recommendation 1a** over 1b/1c: 22 of 30 groups red on outgrown checks; git
  history keeps the harness should anyone want it back.
- **Squash type `test:`**: removes test tooling; the probe branch in
  `start-game.ts` is compiled out of normal builds, so no site output changes
  and nothing needs publishing.
- **Kept under 1a**: `sweep-mushrooms.ts` + `lib/frame-budget.ts`,
  `veer-away.ts` + `lib/veer-dash.ts`, `build-mushroom-artifact.ts`.

## Errors and dead ends

None.

## State

- Branch `claude/cut-meadow-plays`, PR #226 (draft), head `e42574c` plus this
  relay commit.
- Plan: `docs/plans/cut-meadow-plays.draft.do-not-implement.md` — not approved.
- Squash proposal: `docs/remove-before-merging/cut-meadow-plays/squash-message.md`,
  posted on #226; PR title `test: remove the game's scripted plays and probe`.
- Estimate: this session 0.75 h senior developer (planning). Remainder handed
  on: ~2.5 h senior developer (the removal, verifying with knip and
  `VET_MEADOW=1 ./scripts/vet.sh`, since game files change) and ~0.5 h middle
  editor (pruning stack.md, masd.md, megabeast notes and other mentions).
- Nothing running; no PR subscription. The muthur sync offer was made; do not
  make it again.

## Pointers

- `docs/plans/cut-meadow-plays.draft.do-not-implement.md` — the plan.
- `docs/masd.md` § "Open directions" — the item being closed (first of four).
- Failing run: `gh run view 40453462582 --json jobs`; baseline 40454592494.
- Transcript: https://claude.ai/code/session_01DaohkChcWnWYmTX338DBtj

## Next step

Wait for the operator's answer to question 1 (1a/1b/1c) or a go-ahead; a
go-ahead with no answer implements 1a via `/go`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

````text
Now publishing it through `/pr`.

Now Step 6, the squash proposal.

Привет, Вова! Я написал план и остановился на нём, а не стал резать сразу: главный вопрос тут в том, сколько резать, а это решаешь ты. Скажи «поехали», если рекомендация устраивает.

Что выяснилось. Сценарии — это около 10 тыс. строк в `src/mushrooms/scripts/`: 18 сценариев на пяти экранах, плюс зонд, то есть отдельная сборка, в которой игра отдаёт себя скрипту, чтобы тот шагал её кадр за кадром. В прогоне 40453462582 зелёными остались 8 групп из 30. Это `hold,keys,veer,rain` почти везде и пара групп `night-run`/`sprouts` на отдельных экранах. Остальные падают на проверках того, из чего игра давно выросла. Игра пережила свои строительные леса, и леса теперь в основном спорят с ней.

**1. Сколько резать?**
- **(a) Всё целиком (рекомендую, план написан под этот вариант).** Убираются сценарии, зонд, его крючок в `start-game.ts` и поля игры, которые читал только зонд. Ещё уходят фазы `probe`/`play` из `vet.sh`, закомментированные задания в `vet.yml`, команда `play:mushrooms` и упоминания в правилах и заметках. Остаются тесты игры (`VET_MEADOW=1`) и измерительные скрипты `sweep-mushrooms.ts` и `veer-away.ts`, в которых нет браузера.
- **(b) Оставить одну дымовую проверку.** Она открывает `/mushrooms` на пяти экранах из обычной сборки и падает на ошибке страницы. Это примерно 200 строк без зонда. Сборка не ловит ошибку, которая вылетает уже при запуске в браузере, а эта проверка ловит.
- **(c) Оставить только зелёные сценарии.** Зонд и бо́льшая часть обвязки остаются ради малой доли покрытия. Не рекомендую.

Ответить можно коротко: «1a», «1b» или «1c».

Заголовок PR: `test: remove the game's scripted plays and probe`. Тип `test:` ничего не публикует, и это правильно: выключенная ветка зонда в обычную сборку не попадает. Предложение для сквоша висит комментарием в PR.

https://github.com/vzakharov/vovazakharov.com/pull/226

Чтобы делать в новой сессии, начни её командой ниже. Или просто скажи «поехали» здесь.

```
/go claude/cut-meadow-plays
```

Кстати, в muthur есть один новый коммит (#243) про то, как `pr-comment.sh` получает одобрение в авто-режиме. Если хочешь, заберу его в отдельной сессии.
````
