# Relay 2 — cube hub portals on a sine tempo: preview and diff explainer (parked)

## 1. Standing constraints

Operator preferences (from `operators/` via the hook): address as «Вова», «ты»,
reply in Russian; never hand off to a new session unasked («не передавай!
никаких релеев, есть автокомпакт») — parking is fine; archive sessions no longer
needed; don't block on questions that can run in parallel; avoid the words
"load-bearing", "quietly".

The muthur sync offer was made; do not make it again.

## 2. The conversation

The session opened as `/relay take claude/cube-portal-tempo-v3rct3 — PR открыт,
синусный темп хабов сделан, ждёт решения Вовы`, picking up relay-1.md (Next
step: wait).

1. **Вова:** «поставь на второй превью пжст»
   - **Agent:** dispatched `preview.yml` for site `vova`, slot 2, from the
     branch; the run succeeded and preview2.vovazakharov.com carries "Built vova
     from 5eb30f62 (claude/cube-portal-tempo-v3rct3)".
2. **Вова:** «и сделай /explain-diff из репы vzakharov/pl-hub пжст»
   - **Agent:** attached and cloned vzakharov/pl-hub, followed its
     `.claude/skills/explain-diff/SKILL.md`, wrote a Russian explainer of PR
     #292 with 11 hunks rendered by pl-hub's `scripts/explainer-diffs.py`,
     published it, and added its link to the PR body. Reported both, said the
     page was kept in `tmp/` rather than on the branch (prettier would break
     reruns), offered to add a `.prettierignore` line, and made the muthur sync
     offer.
   - (The keepalive's last wake then parked the session, writing this file.)
3. **Вова:** «короче поигрался я-поигрался и... не впечатлился. дело не в
   реализации, но само ощущение какое-то другое. стоишь у двери и пытаешься
   "поймать момент". но даже если поймаешь, нет ощущения какой-то что ли..
   редкости?»
   - **Agent:** traced it to the time-share windows: the cycle's last tick
     always draws from the law's bottom 4.7% and its first from the next 4.7%,
     so something rare comes every 5 s on a fixed beat — a drumroll, not a
     lottery; and a rare room is not recognisable once caught. Proposed 1) flicker
     ticks draw independently from the shared tail window [37%, 100%), the slow
     tick keeping the head, which keeps the law exactly; 2) show what was caught
     (floor number or a sign beyond the door); 3) put rarity on long clocks
     (daily appointments, like the spoke timetable). Recommended 1+2 now on
     preview2, 3 as the direction, and asked which (verbatim in Last agent
     turn).
   - (The keepalive's last wake parked the session again.)

## 3. Intent

PR #292 (hub portals change target on a sine-paced tempo) works, but Вова played
it on preview2 and the rare jumps do not feel rare. He is after the feeling of
rarity, not a different implementation of the same mechanic.

## 4. Decisions

- **Explainer not committed.** pl-hub's skill says the page lands with the
  branch, but `pnpm format:check` runs `prettier --check .` over `.html` here,
  and a prettier-formatted page breaks `explainer-diffs.py`'s rerun (the figure
  must follow its marker directly, or it is drawn twice). So the source stayed
  in gitignored `tmp/explainer/`, which does not survive this container. Adding
  a `.prettierignore` line was offered, unanswered.
- **Slot 2** was named by Вова, so no slot-selection check was run.

## 5. Errors and dead ends

- Deleting the old auto-branch `claude/cube-portal-tempo-v3-q6oqvp` failed with
  `stale info`: it was never on origin, so nothing to clean.

## 6. State

- **Branch:** `claude/cube-portal-tempo-v3rct3`, head 5eb30f62 before this
  summary's commit; clean.
- **PR:** https://github.com/vzakharov/vovazakharov.com/pull/292, open draft,
  mergeable. Body now carries the explainer link.
- **Plan:** `docs/plans/cube-portal-tempo.completed.md`.
- **Preview:** slot 2, https://preview2.vovazakharov.com, built from 5eb30f62.
- **Not done yet:** vet and `/finalize` (not asked for).
- **Estimate (this session):** 2 h senior analyst (the explainer) + 0.25 h
  middle developer (the preview publish); no remainder handed on.

### Watches

https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3
https://claude.ai/artifact/9VoRWk8UJGodSWK3bGqUHy

## 7. Pointers

- **relay-1.md** beside this file — the implementation session's summary (code
  pointers, decisions on tempo and windows).
- **Explainer artifact:** https://claude.ai/artifact/9VoRWk8UJGodSWK3bGqUHy;
  its source is lost with the container, so to republish, read it back with the
  Artifact tool's `read` action and rerun
  `python3 <pl-hub>/scripts/explainer-diffs.py <page> --rev origin/main...claude/cube-portal-tempo-v3rct3 --pr https://github.com/vzakharov/vovazakharov.com/pull/292/files`
  (pl-hub needs `add_repo` and a clone first).
- **Cube board:** https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3.
- **Transcript:** https://claude.ai/code/session_01DaohkEXX6HC7z3ucH2PGkp

## 8. Next step

Wait for Вова's pick among the three proposals in the last reply (1: flicker
ticks draw independently from the tail window; 2: show the caught floor; 3:
rarity on long clocks); the agent recommended 1+2 on preview2. Whatever he picks
is a change to this branch, republished to preview2 per `/preview`. Also open:
whether the explainer should live on the branch (needs a `.prettierignore`
line). Still pending from relay-1: the two `/five-percent` proposals, the
`/dry` calls, and whether to update the older p-go-lock sticky. `/finalize` was
not asked for.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Before I answer, checking one thing in the code: which tick gets which slice of the law.

Вова, у меня есть объяснение, и дело действительно не в реализации. Редкость сломало моё же решение с долями времени: из-за него редкое приходит **по расписанию, в каждом цикле, в одну и ту же долю секунды**.

Вот что сейчас делает код. Этажи под хабом выстроены от популярного к редкому, и каждый тик берёт свой кусок этой очереди:

- долгий тик посреди цикла (1,85 с) берёт верхние 37% закона — семёрки;
- последний тик цикла (234 мс) берёт нижние 4,7% — весь хвост, самые редкие прыжки;
- первый тик следующего цикла берёт следующие 4,7% снизу.

Значит, раз в 5 секунд, на последнем мигании перед паузой, дверь показывает что-то из хвоста. Ровно там же, в каждом цикле. Это не лотерея, а барабанная дробь перед припевом. Через пару циклов ухо уже знает, где она. Поймать её — это попасть в ритм, а не повезло.

Отсюда и твоё ощущение. Редкость — это когда редкое **может долго не приходить**. А тут оно гарантировано каждые 5 секунд, просто в разном облике. Закон в среднем я сохранил точно, но это сохранение для того, кто шагает в случайный момент. Тот, кто стоит и смотрит, видит расписание.

Есть и вторая причина, поменьше. Даже если поймал — **не видно, что именно поймал**. Комната с прыжком на 1 этаж выглядит так же, как с прыжком на 7. Редкость, которую не опознаёшь, ощущается как обычная комната.

Варианты, от дешёвого к большому:

1. **Убрать расписание из мелькания.** Долгий тик по-прежнему держит свои верхние 37%. А каждый короткий тик тянет случайно из остальных 63%, независимо от других. Закон в среднем сохраняется так же точно. Но конкретный редкий этаж теперь может не появляться минуту, а потом выпасть дважды подряд. Это правка в одной функции, могу за полчаса выложить на preview2, чтобы ты пощупал.
2. **Показать, что поймал.** Номер этажа или какой-то знак по ту сторону двери, хотя бы на миг, пока комната видна. Без этого даже честная лотерея не ощущается.
3. **Вынести редкость на длинные часы.** Стоять у двери 5 секунд — это рулетка, которую видно насквозь: всё вращается перед глазами, остаётся выбрать момент. Настоящая редкость в детерминированном мире — это «хаб 12-го этажа раз в сутки, в 3:14, ведёт на один этаж вниз». Это знание, которое передают друг другу, как расписание спиц на доске. Тогда секундное мелькание — просто живая дверь, а редкость живёт в часах и сутках.

Я бы взял 1 и 2 сейчас: это быстро, и сразу будет понятно, в расписании было дело или в самой идее «ловить момент». А 3 держал бы как настоящее направление. Если после первых двух всё ещё не то, значит, «ловить момент» с редкостью не дружит в принципе.

Что делаем?

Now I'm bringing the parked summary up to date, since your message answered the question it left open.

Вова, редкость не ощущается из-за того, как я поделил закон прыжка между тиками. Последний тик каждого цикла всегда тянет из нижних 4,7% закона, то есть из самых редких прыжков, а первый тик следующего цикла — из следующих 4,7%. Поэтому что-то редкое приходит раз в 5 секунд, в одну и ту же долю цикла. Я проверил это на настоящей таблице тиков. Через пару циклов ухо знает, где эта барабанная дробь. Поймать её — значит попасть в ритм, а не повезло.

Вторая причина: пойманное не узнать. Комната после прыжка на 1 этаж выглядит так же, как после прыжка на 7.

Что можно сделать:
1. **Убрать расписание из мелькания.** Долгий тик и дальше берёт популярные 37%, а каждый короткий тик тянет случайно из остальных 63%, независимо от соседей. В среднем закон сохраняется так же точно, но конкретный редкий этаж может минуту не появляться, а потом выпасть дважды подряд.
2. **Показать, что поймал:** номер этажа или знак по ту сторону двери.
3. **Вынести редкость на длинные часы**, вроде «раз в сутки в 3:14 этот хаб ведёт на один этаж вниз», как расписание спиц на доске.

Я бы сделал 1 и 2 сейчас и выложил на preview2. Если и после этого «ловить момент» не даёт ощущения редкости, значит дело в самой механике, и тогда направление — третий вариант. Делаем 1 и 2?

Запаркованную сводку `relay-2.md` я обновил, коммит 94fe8151: в ней теперь эта находка и три варианта. Мой ответ дословно туда не попал. Скрипт, который его дописывает, нашёл у сессии два файла переписки и отказался работать: их стало два, когда к сессии подключили pl-hub. Поэтому в сводке этот ответ пересказан коротко.
```
