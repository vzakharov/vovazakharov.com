# Relay 1 — cube hub portals on a sine tempo (parked)

## 1. Standing constraints

Operator preferences (from `operators/` via the hook): address as «Вова», «ты», reply in Russian; never hand off to a new session unasked («не передавай! никаких релеев, есть автокомпакт») — parking is fine; archive sessions no longer needed; don't block on questions that can run in parallel; avoid the words "load-bearing", "quietly".

## 2. The conversation

1. **Вова:** «а давай у нас комнаты в портале будут тасоваться по синусоиде: наиболее часто -- на её "медленной" части, необычные/редкие -- на быстрой. Весь период -- буквально несколько секунд (необязательно за один период повторять _все_), то есть механика примерно такая: ты можешь относительно просто (скажем на "медленной" части комната зависает на пару секунд) войти в популярную комнату, или наудачу (несколько герц) в редкую. и ещё думаю, стоит ли делать, что на обратном пути ты тоже не в "хаб" возвращаешься, а куда повезёт, по той же механике (но при этом спица по определению будет "популярной") -- тут пока не решил»
   - **Agent:** routed through `/task` and wrote a draft plan (`docs/plans/cube-portal-tempo.draft.do-not-implement.md`, PR #292). Questions put to him: 1) what "popular" means (a: the jump law's floor weight); 2) tempo (a: 5 s cycle, 11 ticks); 3) the way back via spokes — recommended keeping it to the spoke's hub.
2. **Вова:** «1a, 2a, про обратный путь ок, согласен. тогда может внести какой-то мехаизм, что после прыжка какое-то время не работает обратный путь? (ну то есть "после" мы не сможем -- у нас в конце концов детерминированная рандомность, не зависящая от действий игрока -- но может типа открывается на X секунд в Y минут, возможно завися ещё от чего-то)»
   - **Agent:** proposed a spoke timetable (a deterministic open window per spoke), with its forks, and asked whether to put it into this PR or onto the board.
3. **Вова:** «давай про спицы пока только на доску подумать, а про синусы -- уже начинать»
   - **Agent:** put the spoke timetable on the Cube board (stickies p-lock-timetable, p-lock-forks, plus p-go-tempo replacing the minute period), implemented the sine tempo, ran `/polish`, fixed a bug it found, refreshed PR #292 and the squash proposal, and reported (verbatim in Last agent turn).

## 3. Intent

Hub portals change their target on a sine-paced tempo, so a popular room is easy to aim for and a rare one takes luck. Spokes still lead back to their own hub. Locking the way back on a timetable is for the board only, not for code yet.

## 4. Decisions

- **Popular = the jump law's weight** (`jumpWeight`, peaks at multiples of 7), not visit counts. Vova picked 1a.
- **Tempo:** `PORTALS.tempo = { cycleMs: 5000, ticks: 11, swing: 10.5 }`. Holds go 234…1848…234 ms, and every hub turns on the same ticks. Vova picked 2a.
- **Time-share windows:** ticks are ranked by hold and laid over [0, cycleMs). Each tick draws a quantile inside its window of the weight-ranked floors. This keeps the law's long-run share exactly. The slow tick lands on a drop of 7 (≈76%) or 8. Earlier text said 6; 8 wins because 14 is near.
- **Tick boundaries:** solved by bisection and rounded to whole ms. A test keeps each boundary away from a rounding edge, so engines agree.
- **Door view:** builds the coming cycle's rooms ahead of time, slowest tick first. It shows the current tick's rooms or nothing, never a stale room.
- **Spokes unchanged.** The "way back locked" idea went to the board only.

## 5. Errors and dead ends

- `pnpm portal:cube` fails with "Instance dropped error in getCompilationInfo". It fails the same way on `main`: the container's WebGPU, not the branch. No frames were shot, so per-room build time is unmeasured.
- `/polish` found that evicted rooms were never rebuilt. Fixed in 38f81755.

## 6. State

- **Branch:** `claude/cube-portal-tempo-v3rct3`, head 46b51f61, pushed and clean.
- **PR:** https://github.com/vzakharov/vovazakharov.com/pull/292, an open draft that is mergeable. Title: "feat(vova): cube hub portals shuffle targets on a sine tempo".
- **Plan:** `docs/plans/cube-portal-tempo.completed.md`.
- **Squash proposal:** `docs/remove-before-merging/cube-portal-tempo-v3rct3/squash-message.md`, posted on the PR.
- **Not done yet:** vet and `/finalize`.
- **Estimate (unchanged, the work is done here):**
  - 1.5 h senior game-designer
  - 5 h senior gameplay-programmer
  - 1 h middle qa

### Watches

https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3

## 7. Pointers

- **Code:**
  - `src/cube/entities/world/model/portal-tempo.ts` and its test
  - `src/cube/entities/world/model/portals.ts` (`floorBelow`, `hubTarget`) and its test
  - `src/cube/pages/cube/ui/portal-view.ts` (look-ahead queue)
  - `src/cube/scripts/portal-cube.ts`
- **Board YAML:** `src/cube-board/app/config/cube/portals.yaml`
- **Transcript:** https://claude.ai/code/session_01DaohkBibWsoJqWYCfQgn1p

## 8. Next step

Wait for the operator. The last reply offered:

- `/preview live` («на превью»);
- the two `/five-percent` proposals (build per tick instead of caching; the tick table as constants);
- the `/dry` calls (repeated `.take(n)`, the shared comparator with portal-counts);
- whether to update the older p-go-lock sticky ("within the minute").

`/finalize` was not asked for.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
The checks finished. One proposal points at a real defect: a room dropped from the door's cache is never built again, so if it comes back the door shows nothing on that tick. I'm fixing that, and doing the rest of the plan's order (slow tick first, ticks already past skipped).

The context-budget warning came, but you asked never to hand off on your own and to let autocompact fold the session instead, so I'm carrying on.

Now the view's queue.

Clean. Fixing the plan's 7/6 sentence, committing, and marking the plan done.

Now the PR: body, title and squash proposal, with the spoke timetable out of them.

Вова, хабы теперь работают по синусу. PR: https://github.com/vzakharov/vovazakharov.com/pull/292

**Что получилось.** Хаб меняет цель на каждом тике, цикл длится 5 секунд. В середине цикла одна комната висит 1,85 с, по краям цели мелькают примерно 4 раза в секунду. На долгом тике всегда выпадает прыжок на 7 этажей, реже на 8. Не на 6, как я писал в плане: следующий пик закона, 14, ближе к восьми, поэтому восьмёрка чуть тяжелее шестёрки. Прыжки с шансом меньше 1% по закону выпадают только в мелькании. Если шагнуть в случайный момент, этажи по-прежнему выпадают в пропорциях закона прыжка, только переставлены по циклу. Тесты на всё это проходят.

Дверь заранее строит комнаты следующего цикла, начиная с долгого тика. Пока нужная комната не построена, дверь показывает пустоту, но никогда не старую комнату.

**Посмотреть глазами здесь не получилось.** Скрипт, который снимает дверь, падает на первом же кадре, ещё при закрытой двери. Так же он падает и на `main`: это программный WebGPU контейнера, а не ветка. Поэтому не знаю, сколько строится одна комната. Если сборка дольше четверти секунды, комнаты из мелькания на глубоких этажах будут показываться пустыми, а долгий тик останется. Могу выложить ветку на preview.vovazakharov.com, и ты посмотришь с телефона: скажи «на превью».

**Проверки качества** нашли одну настоящую ошибку в моём коде, я её исправил. Комната, которую дверь выкинула из своего кэша, больше никогда не строилась заново, и если хаб снова туда вёл, дверь на этом тике была пустой. В PR остались два необязательных предложения:
- строить комнату под каждый тик, а не держать кэш: одна и та же комната почти никогда не повторяется;
- записать таблицу тиков константами вместо того, чтобы считать её через синус при каждой загрузке.

**Доска.** Расписание спиц лежит на Cube board рядом с твоей карточкой про блокировку обратного пути, со своими развилками и тем, к чему я склоняюсь: https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3. Решение про синус тоже записал туда, на место минутного периода.

Предупреждение о размере контекста приходило. Я не останавливался и не передавал работу в новую сессию, как ты и просил: дальше её сожмёт автокомпакт.
```
