# PR #258: fix(island): handle #255's review on the board, costs and lints

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/258
- **Author:** @vzakharov (agent)
- **Base ← Head:** claude/world-game-zoltan-syama-hodowq ← island/review-1
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-11-07T05:26:45Z
- **Updated:** 2026-11-07T07:01:25Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at dc55d1b). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/boards/island.yaml`:3 — unresolved — last: @vzakharov (human) 2026-11-07T06:40:20Z — "ну, "тихо" они не лягут, на то у нас /sync-branch, но вынест…" → [↓](#t01)

---

## Body

## Summary

#255's review (threads T01–T10, T12–T20, and R02), handled on a sub-branch so the island's main work is not held up. It merges into #255's head, not main. Every thread has a reply on #255.

Done:
- **Cost rows**:
  - binary files leave `branchLines` (T07);
  - session 1's lost `operatorWords` is restored on the ledger and its copy, and the `/2/` duplicate is moved to where the ledger files it (T05, T06);
  - `estimate.py set --subject` records a conventional subject line on the estimate (T08);
  - the operator's review words are counted at PR export as `operatorWords: {chat, review}` with `reviewPosts`, and `contribution.py` counts a post once across sessions (T02, T03).
- **`git pull` blocked** by `.claude/hooks/git-pull-guard.py`, with `DANGEROUSLY_GIT_PULL=1` as the per-command way out; skills that pulled now fetch and merge (T09).
- **Plane types out of the kernel**, into `src/scene/shared/lib/plane.ts`, and a lint rule allowing re-exports in barrels only, every violation fixed (T19, T20).
- **Stop-words** gain "quietly", as slop markers (T10); the 686f5174 postmortem is gone (T14); the case study loses four flourishes and says what is counted (T18).
- **R02**: no epic branch; the mammoth reaches main through cuts, recorded in `.claude/skills/mammoth/notes/gates.md` and the plan's constraints.

Planned, awaiting a look: `docs/plans/island-review-1.draft.do-not-implement.md` covers T01, T12, T13 and T15–T17:
- the board becomes a MASD app (`src/board/`) and its source one YAML at `docs/boards/island.yaml`;
- `main.ts` is split and the styles move to SCSS;
- a 400-line limit test.

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-07T06:15:46Z_

[https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810517114](https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810517114)

**/five-percent**: два предложения, из них одно critical.

<!-- five-percent: b8439de64493f2d82f2d45c7e8ca0d8f7cd7f823 -->

- **T01** `docs/boards/island.yaml`:3 — unresolved — last: @vzakharov (human) 2026-11-07T06:40:20Z — "ну, "тихо" они не лягут, на то у нас /sync-branch, но вынест…" → [↓](#t01)
- **T02** `src/island-board/scripts/lib/board-file.ts`:191 — unresolved — last: @vzakharov (agent) 2026-11-07T06:59:41Z — "В сессии ты решил: не исключать, а придумать способ разбиени…" → [↓](#t02)
- **T03** `.claude/costs/sessions/2026-11/island/review-1/1/60da9e31-77ef-5091-8ac0-30e66680da10.json`:35 — unresolved — last: @vzakharov (agent) 2026-11-07T06:59:42Z — "Переставил: оценка теперь пишется как `at`, `subjectLine`, `…" → [↓](#t03)
- **T04** `sites/vova/public/case-studies/island.md`:32 — unresolved — last: @vzakharov (agent) 2026-11-07T06:59:43Z — "Убрал: «It was there as proof that this can be done.» Правил…" → [↓](#t04)
- **T05** `src/island-board/entities/item/index.ts`:1 — unresolved — last: @vzakharov (agent) 2026-11-07T06:59:45Z — "Переименовал приложение в `src/island-board`, в `masd.json`…" → [↓](#t05)

<a id="t01"></a>

### `docs/boards/island.yaml`:3 — unresolved

```diff
@@ -0,0 +1,377 @@
+title: Island board
+artifact: https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P
+items:
```

**@vzakharov (agent)** — 2026-11-07T06:15:33Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · critical

`island.yaml` сконвертирован один раз, со снимка доски на момент слияния базы (ce57e929). Но лид продолжал писать JSON-карточки на мамонте: там уже 9 новых (зона «Infinite worlds» с `worlds-1…7` и `l-worlds`) и 4 правки `bite1-1…4`. При слиянии базы правки всплывут конфликтом modify/delete, а 9 новых файлов лягут тихо, в `board/items/`, который больше никто не читает — и пропадут со следующей публикации.

**Предложение: оставить конвертацию в `pnpm board` как команду (`board import <items-dir> <yaml>`), а не одноразовый скрипт, и прогнать её при слиянии базы перед мёрджем.** Тогда любые карточки, дописанные в старом формате до мёрджа, переносятся той же проверенной дорогой, а не руками.

Цена: ещё одна команда и её тест, которые после мёрджа станут мёртвым кодом и уйдут следующим коммитом. Дешевле — заморозить запись в `board/items/` на мамонте до мёрджа и перенести 13 карточек руками, но это держится только на памяти лида.

<details><summary>Подробнее</summary>

- `git diff --name-status $(git merge-base origin/claude/world-game-zoltan-syama-hodowq HEAD) origin/claude/world-game-zoltan-syama-hodowq -- docs/plans/world-game-zoltan-syama/`: `A` для `l-worlds`, `worlds-1…7`, `z-worlds`; `M` для `bite1-1…4` (c2b3b41a, 65fa403e).
- Мемо лиду (`docs/remove-before-merging/island/review-1/memo.md`) говорит «nothing else on the board changes until the YAML move» — и после него на доске появилась целая зона.
- План, шаг 3: «Convert the 65 item files … by script»; скрипт не закоммичен, в `src/board/scripts/board.ts` команды только `build | sync | snapshot`.

</details>

**@vzakharov (human)** — 2026-11-07T06:40:20Z

ну, "тихо" они не лягут, на то у нас /sync-branch, но вынести скрипт туда, где любой наследник создавшей его сессии может его использовать -- можно (но удалить перед мёрджем, дальше он будет не нужен).

---

<a id="t02"></a>

### `src/island-board/scripts/lib/board-file.ts`:191 — unresolved

```diff
@@ -0,0 +1,237 @@
… 176 lines elided …
+  );
+}
+
+/** Every item in a board file, checked; ids are unique, since an id is its row's doc id. */
+export function decodeBoard(text: string): Item[] {
+  const items = BoardFile.parse(parseDocument(text).toJS()).items.map((item) =>
+    decodeItem(item),
+  );
+  const seen = new Set<string>();
+  for (const { id } of items) {
+    if (seen.has(id)) throw new Error(`item ${id} appears twice`);
+    seen.add(id);
+  }
+  return items;
+}
```

**@vzakharov (agent)** — 2026-11-07T06:15:42Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

Кодек читает и пишет ровно один файл доски, а тот же PR вводит лимит в 400 строк, под который этот файл попадает. `island.yaml` уже 377 строк; 9 карточек, ждущих на мамонте, добавят около 45 — и первый же `sync` или перенос уронит vet. План откладывает разбиение «если вырастет», но это «если» — уже сегодняшние карточки.

**Предложение: сделать источником доски каталог сразу — `docs/boards/island/*.yaml`, по файлу на зону, — а не один файл.** `decodeBoard` склеивает все файлы каталога, `sync` дописывает новую карточку в файл её зоны (или в `unsorted.yaml`), id уникальны по всему каталогу.

Цена: `writeItems` должен знать, в каком файле живёт карточка, и тест на круговой проход становится многофайловым. Diff одной карточки и «всё at-a-glance» из T12 частично теряются: целиком доска читается уже не одним файлом. Другой путь — поставить `docs/boards/` в исключения лимита наравне с данными, признав YAML доски данными.

<details><summary>Подробнее</summary>

- `wc -l docs/boards/island.yaml` → 377, 69 карточек по ~5 строк.
- `scripts/line-limit.ts`: YAML не исключён (`EXCLUDED` — только lockfile, `docs/pr|issue/`, `*.json(l)`); в allowlist доски нет.
- План, § "The item shape": «about 330 lines — inside the limit below, and the point at which the file splits by zone if it grows».
- T12: «нужно ли разбивать -- посмотрим как склеим» — вопрос открыт оператором, не решён.
- Каталог `docs/boards/island/` уже существует (картинки), так что файлы зон ложатся рядом с ними или в `docs/boards/island/zones/`.

</details>

**@vzakharov (agent)** — 2026-11-07T06:59:41Z

В сессии ты решил: не исключать, а придумать способ разбиения. Сделал так: в `docs/boards/island.yaml` остаются заголовок, артефакт и всё, что не лежит ни в одной зоне, а каждая зона живёт в `docs/boards/island/<зона>.yaml` вместе с тем, что в ней лежит. Какой файл чей, не выбирается вручную, а выводится при каждой записи: карточка — по наименьшей зоне, где лежит середина её верхнего края, линия — вместе с тем, откуда она начинается. Перетащил карточку в другую зону — она переезжает в другой файл. Сейчас девять файлов, самый большой 73 строки; `pnpm board refile` раскладывает заново и на текущей доске ничего не меняет — 783e2848f

---

<a id="t03"></a>

### `.claude/costs/sessions/2026-11/island/review-1/1/60da9e31-77ef-5091-8ac0-30e66680da10.json`:35 — unresolved

```diff
@@ -0,0 +1,142 @@
… 31 lines elided …
+      }
+    ],
+    "comment": null,
+    "subjectLine": "fix(island): handle #255's review on costs, lints, hooks; plan the board"
```

**@vzakharov (human)** — 2026-11-07T06:28:52Z

наверное subject line стоит писать выше, сразу под at

**@vzakharov (agent)** — 2026-11-07T06:59:42Z

Переставил: оценка теперь пишется как `at`, `subjectLine`, `parts`, `comment`, а строки острова перезаписаны в этом порядке. По пути выяснилось, что эта строка лежала в леджере под веткой `HEAD`, потому что последний Stop сессии пришёлся на detached HEAD. Вернул её на `island/review-1`, теперь она под номером 5 — 68a713bc9

---

<a id="t04"></a>

### `sites/vova/public/case-studies/island.md`:32 — unresolved

```diff
@@ -21,15 +21,15 @@ I wanted a game based on it — just an exploration game for now.
… 10 lines elided …
 The world can’t be generated all at once, of course, only as you approach: what is visible from a given height, at the moment it becomes visible; where exactly each tree stands, once you’re close eno…
 
-So that nobody (the agent included) thought this was out of reach, I pointed at a small repo, [web-ocean](https://github.com/Noniv/web-ocean) — a browser drawing sea and sky well enough to stop you s…
+So that nobody (the agent included) thought this was out of reach, I pointed at a small repo, [web-ocean](https://github.com/Noniv/web-ocean) — sea and sky drawn in a browser, and drawn well. It was there as proof that this can be done, not as code to borrow.
```

**@vzakharov (human)** — 2026-11-07T06:43:15Z

"this not that" should be generally avoided, unless it's 100% needed to juxtapose, not just as a rhetoric device.

**@vzakharov (agent)** — 2026-11-07T06:59:43Z

Убрал: «It was there as proof that this can be done.» Правило записал в `.claude/rules/contrast.md`, оно действует на всех страницах, которые отдают сайты — c55b0543f, f73fc9c69

---

<a id="t05"></a>

### `src/island-board/entities/item/index.ts`:1 — unresolved

**@vzakharov (human)** — 2026-11-07T06:44:32Z

скорее всё-таки island-board (если будем потом выводить в отдельную общую аппу, она будет board)

**@vzakharov (agent)** — 2026-11-07T06:59:45Z

Переименовал приложение в `src/island-board`, в `masd.json` оно теперь `island-board`; простое имя `board` остаётся за общей аппой, если такая появится — a4c28ad5f

---

## Timeline (status, references, and other events)

- **2026-11-07T06:15:46Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810517114.
- **2026-11-07T06:47:19Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810558546.
