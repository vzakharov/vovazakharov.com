# Relay 1 — poison check (parked)

## Standing constraints

None stated by the operator.

## The conversation

1. **Operator** (as `/task`): "A poison check — the fourth item of docs/masd.md
   § "Open directions": hold the barrels' runtime axes transitively (a 'use
   client' file reaching index.no-browser.ts or server-only, a script without
   the react-server condition reaching server-only), porting
   playgramai/playgramapp's scripts/poison-check.ts, its roots this repo's
   src/\*/scripts/ and root scripts/, wired into vet. Read that section and
   .claude/rules/masd.md first. The MASD work landed in #169."

   **Agent**: routed as plan-then-go (Step 1 yes: a live reuse call, madge vs.
   masd-check's own resolver; Step 3 no: the alternatives land close). Wrote the
   plan, opened draft PR #227, flipped the plan, implemented, ran `/polish`, and
   finished `/go`. The final report put one optional `/five-percent` proposal to
   the operator (drop the client half, since `pnpm build` already catches it).
   The agent recommended keeping it. The report also offered the muthur sync
   (one commit, 03451362) as a new session. (verbatim in Last agent turn)

No operator message since.

## Intent

A transitive runtime-axis check for the MASD barrels, in vet, rooted at
`'use client'` files and script entries.

## Decisions

- **The graph comes from `scripts/lib/import-graph.ts`** (masd-check's resolver,
  lifted out), not from madge. That means no new dependency, and the two checks
  cannot disagree on where an import lands. Madge would differ only in the edge
  source, so swapping it in is an amendment.
- **Script roots are entries**: script files no other script imports, plus every
  test. Entries that `package.json` runs under `--conditions=react-server` are
  exempt (`{site}` is expanded over `src/*`). Tests of an exempt entry are still
  roots.
- **Client poison** is `server-only` or any `index.no-browser.ts`. Script
  poison is `server-only` only.
- No `'use server'` boundary (static export). The check is one file, not a
  library beside a CLI, which the plan records.
- **Out of scope**: the node-safe axis's CSS/JSX/asset half, and tests outside
  `scripts/`.

## Errors and dead ends

`fs.globSync` is untyped under `@types/node` 20, so `{site}` is expanded
manually instead.

## State

- **Branch** `poison-check`, head b7d0a6adb (pushed).
- **PR** #227, open, draft.
- **Plan** `docs/plans/poison-check.completed.md`.
- **Squash proposal** posted, tracked at
  `docs/remove-before-merging/poison-check/squash-message.md`.
- `./scripts/vet.sh` not run. That is `/finalize`'s job.
- **Estimate**: 5 h senior developer + 1 h senior architect, whole task done
  here, nothing handed on.
- Nothing running.

## Pointers

- `scripts/poison-check.ts`, `scripts/poison-check.test.ts`,
  `scripts/lib/import-graph.ts`
- `/five-percent` review:
  https://github.com/vzakharov/vovazakharov.com/pull/227#pullrequestreview-5679974370
- Transcript: https://claude.ai/code/session_01DaohkBdtkS2FCg9TJAopr7

## Next step

Wait for the operator. Two things are pending their answer:

- whether to take the optional `/five-percent` proposal;
- whether to start the muthur sync. It was offered once; do not offer it again.

`/finalize` comes when they ask.

The muthur sync offer was made; do not make it again.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, `/go` пройден до конца: `/polish` отработал, план переименован в `completed`, PR #227 остаётся черновиком. Описание PR и предложенный текст squash я пересмотрел, обновлять их не понадобилось: правки polish ничего в них не опровергают.

**Что изменил `/polish`:**
- **447b617.** Одинаковый список файлов («всё в `src/` плюс роутеры сайтов») собирался и в `masd-check`, и в `poison-check`. Теперь это одна функция `appFiles()` в `scripts/lib/import-graph.ts`, и обе проверки её вызывают. Тесты и обе проверки на реальном дереве проходят (27/27).
- **559ed79.** В `.claude/rules/masd.md` фраза «все три читают граф» теперь говорит «первые три»: четвёртая, проверка на яд, графа не читает. Из шапки `poison-check.ts` убрана строка «портировано из playgramapp»: откуда пришёл код, записано в плане и PR, а в шапке это ничего не говорит о самом коде.

**Один вопрос твой, и он необязательный** ([ревью](https://github.com/vzakharov/vovazakharov.com/pull/227#pullrequestreview-5679974370)). Предлагают оставить только половину проверки, про скрипты без `react-server`. Обоснование такое: два других случая vet уже ловит. Клиентский файл, дошедший до `server-only`, роняет `pnpm build`, а тест роняет `pnpm test:all`. Я бы оставил всё как есть. Сборка падает поздно и с сообщением Next, а проверка сразу даёт одну строку с импортом, который надо чинить. Клиентская половина стоит около тридцати строк. Но если тебе важнее не дублировать build, её можно вырезать одной правкой.

Полный `./scripts/vet.sh` ещё не запускался, он идёт в `/finalize`.

https://github.com/vzakharov/vovazakharov.com/pull/227

Кстати, в vzakharov/muthur появился один новый коммит после нашей последней синхронизации: про то, как auto-mode одобряет `pr-comment.sh`. Он трогает `squash-message`, `update-muthur` и `scripts/pr-comment.sh`. Перенести его сюда в отдельной сессии?
```
