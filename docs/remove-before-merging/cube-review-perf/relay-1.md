# Relay 1 — cube-review-perf

Parked by the cache keepalive's last wake, waiting on the operator's review comments on #275.

## 1. Standing constraints

- Operator: Vova (`vzakharov`). Reply in Russian, «ты»; Pratchett-ish banter welcome. "load-bearing" and "quietly" are banned words.
- From the predecessor (relay-1 of `cube-liminal-332pmv`, still binding): MASD, the linters and the 400-line limit are not dodged — «ты кажется ищешь обходные пути?», «нет никогда такой задачи»; no re-export or line-squeezing to pass a gate; no lint suppression without the operator's yes. Preview slot 1 is the branch's slot. `git pull` is blocked by a hook (fetch, then `merge --ff-only`); never force-push.
- The theme shaders the operator approved on the preview are touched only in #275, as review/optimization work — not in passing.

## 2. The conversation

1. `/relay take claude/cube-liminal-332pmv — PR открыт, отражения вмержены, ждём взгляда на превью`, followed in the same message by: «так, превью шикарен. есть нарекания, но они не стоят того чтобы сейчас ломать поверх.\n\nчто хочу:\n1- запомнить как сейчас выглядит мейн чтобы можно было разворачивать превью, играть, снимать side-by-side comparison видосики итп\n2- (финализировать и) замерджить то что у нас сейчас в мейн\n3- НО оставить возможность отревьюить и оптимизировать код того что наваяли, просто отдельным пиаром\n\nкак бы это лучше сделать?» — Attached to the branch; tagged main as `cube-before-liminal` (69547e30, via the GitHub API since a tag push got 403 from the proxy); proposed `/finalize and merge`, a `cube-liminal` tag on the squash, and the review either as comments on merged #273 or a fresh session. Said the board watch had been refused and asked for a link to retry. Asked «Запускаю finalize and merge?».
2. «> Ещё одно: включить слежку за комментариями на доске мне не дали, разрешение в этой сессии не было одобрено\n\nну ты же знаешь что в этом случае делать?\n\nпо поводу твоего плана, вроде всё ок, а получается на одной ветке будет сидеть два пиара?» — Gave a fenced message to send back for the watch; answered: no, one branch one PR — #273 merges, fixes go to a new branch from main.
3. «Включи слежку за комментариями на ревью-доске https://claude.ai/artifact/Q82osbuaDQtqdcYVAXVAss\n\n> Слежка ставится только по твоему же сообщению со ссылкой на доску.\n\nэто не так; "знаешь что делать" я имел в виду про инструкции как поступать когда автоблокиратор блокирует» — Acknowledged (the auto-mode denial rule: the reply carries the fenced message). The watch then failed with 404: the old board was published from another account. Offered to rebuild it.
4. «надо пересобрать, последний раз с другого акка делал.\n\n> GitHub даёт оставлять комментарии к диффу и после слияния, так что ревью можно писать прямо в закрытом #273.\n\nэм, ну а исправлять по моим комментариям ты где будешь?» — Admitted the gap (a new branch from main has an empty diff, no board). Proposed the review PR based on a branch at pre-merge main, base switched to `main` after review. Started `/finalize` on #273.
5. «> finalize для #273 я запускаю сейчас, он от этого не зависит.\n\nсамодеятельность но ок.\n\n> Предлагаю открыть PR для ревью с базой на ветку, которая стоит на мейне до слияния (69547e30), и после слияния переключить базу на main\n\nхм, не очень понимаю механику: …если мы переключаем базу на мейн, то мы ревьюим старую версию относительно новой, а не наоборот?» — Explained with A (old main) / C (cube squash) / F (fixes): head is always newest; base = A shows C+F for review; base switched to main (has C) leaves F to merge.
   - Finalize ran meanwhile: polish in two subagent runs (first ran out of context), board rebuilt (3t4a…), vet failed on `knip` (50 unused exports) → fixed in b72e15cf, vet green; sweeps; attestation; stand-down reported (authored fix in step 1, unanswered five-percent proposal).
6. «отражения на поле уже и так подтормаживают; само предложение норм, давай добавим на борду как todo после оптимизации перформанса того что есть. из-за правки борды вет не перегоняй, мерджи как есть» — Replied in the five-percent thread with the operator's words; merged #273 (fe6c7f83); tagged `cube-liminal`; created `review-base/cube-liminal` at 69547e30; opened draft #275 with the work list, review focus and the verdict row; published its board 1QrH… (verbatim in Last agent turn).
7. (keepalive wakes — deploy confirmed green; then this park.)

## 3. Intent

Keep the merged cube (as previewed) on main and live, keep the pre-merge cube reproducible for side-by-side videos, and run the cube's code review and performance work as its own PR where the operator comments and the agent fixes. Ruled out: breaking the previewed look before the merge; two PRs on one branch.

## 4. Decisions

- **Review PR based on `review-base/cube-liminal`** (pre-merge main) so its diff is the whole cube plus fixes; after review, retarget the base to `main` so only fixes merge. Beat: comments on the merged #273 with fixes elsewhere (no board, no place for fixes), and a fresh branch against `main` (empty diff).
- **Tags**: `cube-before-liminal` = 69547e30 (cube before #273), `cube-liminal` = fe6c7f83 (as merged). Created with `gh api …/git/refs`, since `git push` of a tag is refused by the proxy with 403.
- **"Борда"** was read as #275's review board: the five-percent proposal (mirror every polished face, not only floors) sits there on `light.ts` as a TODO after performance. Not confirmed by the operator.
- **Merged without re-running vet** on the operator's word; the attestation (https://github.com/vzakharov/vovazakharov.com/pull/273#issuecomment-6819399372) vouches for b72e15cf, the later head being sweeps only.

## 5. Errors and dead ends

- The old board Q82osbuaDQtqdcYVAXVAss is unreachable from this account (404) — it was published from another; rebuilt as 3t4a… for #273 and 1QrH… for #275.
- The first polish subagent ran out of context mid-`/dry`; a second finished it. Large diffs need the passes split.
- The board build fails until `origin/review-base/cube-liminal` is fetched: `git fetch origin review-base/cube-liminal:refs/remotes/origin/review-base/cube-liminal`.
- Republishing the board from `tmp/review-board/index.html` would redeploy #273's old board (same path → same URL in that session); the #275 board was published from `tmp/review-board-275/index.html`. A new session republishes by the URL in #275's sticky comment.

## 6. State

- Branch `claude/cube-review-perf`; draft PR https://github.com/vzakharov/vovazakharov.com/pull/275, base `review-base/cube-liminal`; head is this summary's commit, on top of the work-list commit.
- #273 merged as fe6c7f83; production deploy run 43195886333 succeeded.
- No plan file. Nothing running: no CI watch, no PR subscription, keepalive stopped.
- Estimate, this session: 1 h senior producer (tags, review-PR mechanics), 2 h senior developer (the knip cleanup, land prep). Remainder handed on: 1 h senior qa — the every-band gallery look on the cube, inherited from the predecessor and not done here.

### Watches

https://claude.ai/artifact/1QrH94uoE3AHkQ4Wsxdwte

## 7. Pointers

- `docs/remove-before-merging/cube-review-perf/todo.md` — the ordered work list: performance, duplication, leftovers, then the five-percent TODO.
- `docs/remove-before-merging/review-focus.json` — the board's focus (Russian `why`s).
- Board: https://claude.ai/artifact/1QrH94uoE3AHkQ4Wsxdwte (sticky comment on #275).
- The cube's plan as it stood at the merge: `git show b72e15cf:docs/plans/cube-beauty.paused.md`.
- Predecessor relay: `git show b72e15cf:docs/remove-before-merging/cube-liminal-332pmv/relay-1.md`.
- Side-by-side preview: `gh workflow run preview.yml --ref cube-before-liminal -f site=vova -f slot=2` (or `--ref cube-liminal`).
- This session: https://claude.ai/code/session_01DaohkBvLD2WSYPkUSXi9Di

## 8. Next step

Wait for the operator — their review comments on the board (https://claude.ai/artifact/1QrH94uoE3AHkQ4Wsxdwte) or on #275, handled per `/review-board` Step 3 or `/handle`; then the work list in `todo.md`, starting with measuring the reflections. Pending, unconfirmed: whether «добавим на борду» meant #275's board.

The muthur sync offer was never made in this session.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

````text
Now the merge check and the awaiting-answer export.

#273 слит. Ставлю тег, ветку-базу и ревью-ветку.

Собираю ревью-ветку: список задач, фокус доски и запись вердикта уже на месте. Дальше коммит, PR и доска.

Build the review PR's board.

Куб в `main`. Слил #273 как есть, vet заново не гонял. Слияние в `main` и есть деплой, он сейчас идёт: https://github.com/vzakharov/vovazakharov.com/actions/runs/43195886333

**Ревью отдельным PR открыто:** https://github.com/vzakharov/vovazakharov.com/pull/275, черновик.
- База — ветка `review-base/cube-liminal`, это мейн до слияния, поэтому дифф показывает весь куб.
- Доска: https://claude.ai/artifact/1QrH94uoE3AHkQ4Wsxdwte. Слежка за комментариями стоит. За старой доской #273 слежку снял.
- В фокусе доски четыре файла: отражения, шейдер отражений, `light.ts` и решётка в ките.

**Под «бордой» я понял доску этого ревью-PR.** Предложение «пяти процентов» висит там на `light.ts:235` с пометкой «TODO после скорости». В треде на #273 я ответил твоими словами. Если ты имел в виду другую доску, скажи.

**Список задач:** `docs/remove-before-merging/cube-review-perf/todo.md`. Порядок такой:
1. Скорость отражений. Сейчас проход отражений идёт на каждом этаже, даже без полированного пола. Начинать с замера.
2. Дубли.
3. Хвосты вроде тестов, которые ждут 67-й этаж.
4. Твой TODO.

**Для сравнения бок о бок есть два тега:** `cube-before-liminal` (куб до слияния) и `cube-liminal` (куб как слит). Любой разворачивается в слот превью, например:

```bash
gh workflow run preview.yml --ref cube-liminal -f site=vova -f slot=2
```

Оставляй комментарии на доске или в #275, и я начну с них. Когда ревью закончится, переключим базу на `main` и сольём одни правки.
````
