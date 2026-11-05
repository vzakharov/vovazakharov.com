# Relay 8 — origami: land prep, the critical fold-order fix, three refactors left

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

1. **Operator:** `/merge claude/origami-pilot-mwxvll`
   - **Agent:** attached (the auto-branch was already absent from `origin`);
     the PR was a draft with no attestation, so the path was land prep,
     `/finalize and merge`. Swapped the staged `masd.md` (493a877f), ran
     `/polish` in a subagent, and flagged that the squash proposal still names
     `shared/designs`, so step 5 would rewrite it in substance and stand the
     merge down. Re-asked relay-7's two open /dry questions: (1) merge the two
     `onLine`s, (2) keep the hand-rolled vector maths in `basilisk.ts`?
2. **Operator:** «1-да / 2- а как можно по-другому?»
   - **Agent:** merged `onLine` (fa4a6932). Polish reported a **critical**
     /five-percent proposal (the fold-order tear), so the merge was held.
     Answered 2: `spineFold` hand-writes subtraction, normalization, a cross
     sign and a 2D rotation that `geometry.ts` mostly has (`sub`, `normalize`,
     `side`) but the slice's public API does not export; export them plus a
     `rotate` and `spineFold` shrinks to a few lines — no library needed. Asked
     four questions: 1) fix the fold-order bug now; 2) rewrite `spineFold` on
     exported helpers; 3) `carriesMarker` — do it, in a new file under
     `scripts/lib/` rather than `slice-graph.ts`; 4) open an issue for the step
     player and link it from the marker.
3. **Operator:** «да на всё»
   - **Agent:** fixed the fold-order bug (cbb34ea7), then relayed for the
     context budget before the remaining three. (verbatim in Last agent turn)

## 3. Intent

Land PR #251 (origami folding engine as a tool). Before landing, the operator
approved four changes, all from this session's polish run: the critical
fold-order fix (done), `spineFold` on exported vector helpers, one
`carriesMarker` helper for the `masd-disable` marker check, and an issue for the
site's step player linked from the `entities/design` exemption.

## 4. Decisions

- **Fold-order fix** (cbb34ea7): a shaping fold's rotation is conjugated by the
  shaping of the stationary paper at the crease, `turn = S·R·S⁻¹`, applied
  before each moved piece's own shaping (`multiply(turn, piece.shaping)`). Beat
  both one-sided orders, each right for only one listing direction. It throws
  when the stationary pieces along the crease disagree in shaping
  (`hingeShaping`, `SAME_SHAPING = 1e-6`) rather than picking one. `invertRigid`
  in `space.ts` (rigid motions only). `hinges(state, line, moved)` moved into
  `state.ts`, shared by the fold and the physics report (physics' local type
  renamed `Bend`, function `bends`).
- **Tear finding**: `physics.ts` measures after every step how far paper joined
  in the sheet lies apart in space, unlifted (`widestTear`, `unlifted`), in mm
  as `tear`, and reports an `error` past `TEAR_ERROR_MM = 0.01`. Applies to
  shaping folds too, so `findings` now wraps `paperFindings`, which keeps the
  flat-only early return.
- **`onLine`** (fa4a6932): one in `geometry.ts`, measured as a distance
  (divided by `|d|`), `onLine(pt, line)`; `fold.ts`'s local became `alongLine`.
- **`carriesMarker`'s home**: a new small file under `scripts/lib/` (operator's
  «да» to the agent's recommendation), not `scripts/lib/slice-graph.ts`.

## 5. Errors and dead ends

- `pnpm origami basilisk` failed until `pnpm install --frozen-lockfile` (no
  `three` in a fresh container).
- The auto-branch delete got `stale info`: the branch never existed on origin.
- Bash hooks block `cat`/`sed -n`/`tail` on files: use Read.

## 6. State

- Branch `claude/origami-pilot-mwxvll`, draft PR #251
  (https://github.com/vzakharov/vovazakharov.com/pull/251), base `main`,
  `mergeStateStatus` CLEAN. Last pushed before this file: cbb34ea7.
- Plan: `docs/plans/origami-infrastructure.completed.md`; this work planless.
- `/finalize` progress: staged swap done (493a877f); `/polish` done (2233faae,
  06e7dec4, review
  https://github.com/vzakharov/vovazakharov.com/pull/251#pullrequestreview-5785675641
  with the critical proposal, now fixed by cbb34ea7 — reply on that thread with
  the SHA). Vet, base merge, cleanup, ready, squash reconcile, check-merge,
  sweep and attestation not run. The commits after the polish floor (fa4a6932,
  cbb34ea7 and what comes next) are unpolished: a fresh `/finalize` runs
  `/polish` over them.
- Checks run on cbb34ea7: origami tests 12/12, eslint on `src/origami/shared/fold/`,
  `tsc --noEmit`, prettier; basilisk physics and geometry equal to before
  within 2e-16; `tmp/polish/tear.ts` shows 0.0129 (the layer-lift baseline)
  for every tail order. The new test in `physics.test.ts` fails with a 12 mm
  tear under the old order.
- No PR subscription, no scheduled check-in; this session's keepalive is
  stopped at the relay.
- Estimate: this session 3 h senior developer ("a composition-order bug in a 3D
  fold engine needs someone who can reason about S·R·S⁻¹ and prove the fix
  numerically, plus a helper fold whose tolerances differed and land prep's
  first half through the repo's gates"). Remainder: 1 h senior developer ("two
  refactors whose behaviour must hold byte for byte, one across three checker
  scripts"), 1 h senior developer ("land prep through vet, the base merge and a
  squash record that names a slice since moved").

## 7. Pointers

- `src/origami/shared/fold/{fold,physics,state,space,geometry}.ts`,
  `physics.test.ts`.
- `src/origami/entities/design/model/basilisk.ts` § `spineFold`;
  `src/origami/shared/fold/index.ts` (the public API to extend).
- Marker regex: `scripts/masd-check.ts:46`, `scripts/masd-clusters.ts:46`,
  `scripts/lib/sub-slices/promotion.ts:21`; the repeated "read `index.ts` if it
  exists" lines at `masd-check.ts:48-51`, `promotion.ts:230-231`.
- Exemption: `src/origami/entities/design/index.ts` (`masd-disable
insignificant`).
- Byte-compare harness: `tmp/onl/snap.ts` (gitignored, lost with the container;
  it prints `JSON.stringify` of `physics(steps, kami)` and
  `snapshot(run(steps), kami)` for `basilisk({ third })`, `third` false and
  true).
- PR body and squash comment: `gh pr view 251 --json body -q .body`,
  `gh api repos/vzakharov/vovazakharov.com/issues/comments/6654420777 --jq .body`
  — both still say `shared/designs`; relay-7 § 6 lists what they gain.
- This session: https://claude.ai/code/session_01DaohkB7ryC5hJJpNqBsds5
  (predecessors in relay-7.md).

## 8. Next step

The operator's «да на всё», for what remains of it:

1. Rewrite `spineFold` in `basilisk.ts` on vector helpers exported from
   `@/origami/shared/fold` (`sub`, `normalize`, `side`, plus a new `rotate`),
   the basilisk folding byte-identical.
2. `carriesMarker(file, kind: 'insignificant' | 'cluster' | 'promotion')` in a
   new file under `scripts/lib/`, used by the three checkers, their tests
   green.
3. Open an issue for the site's step-by-step player and name it in the
   `masd-disable insignificant` reason in `entities/design/index.ts`.

Then `/finalize` **without** `and merge` (the operator's original ask was
`/merge`, but the diff has grown since): the report says the merge was held and
that `/merge` lands it once the operator has read the new squash body.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Before touching the callers, I'll capture the basilisk's current output as a baseline.

Записал, что сейчас выдаёт василиск, чтобы после слияния `onLine` сравнить вывод побайтно. Теперь правлю вызовы.

Now the edits in both callers.

`onLine` теперь один, и василиск складывается побайтно так же, как до правки. Тесты зелёные. Коммичу.

Подготовка к мерджу остановлена до мерджа. Шлифовка нашла **критичную** ошибку в движке складывания, а с ней мердж по правилам держится, пока ты не решишь. Твой пункт 1 сделан: `onLine` теперь один, коммит fa4a6932. Василиск после правки складывается побайтно так же, тесты зелёные.

**В чём ошибка.** Хвост сгибается правильно, только если сгибы в `tail` перечислены от головы к кончику. Так у василиска и записано, поэтому сам он складывается верно. Если перечислить их от кончика (`[0.25, 0.42, 0.6]`), бумага молча рвётся на сгибе. При этом физический отчёт ничего не замечает. Обычный зазор между слоями около 0,013 листа, а здесь куски расходятся на 0,050–0,094. Сломал это коммит 93f59f1b: он перевернул порядок, в котором новый сгиб складывается с уже накопленными. Субагент предлагает два исправления: поворачивать сгиб вокруг складки там, где её оставила неподвижная сторона (`S·R·S⁻¹`), тогда подходит любой порядок; и добавить в отчёт ошибку, когда куски на общей точке расходятся. Подробности в [ревью](https://github.com/vzakharov/vovazakharov.com/pull/251#pullrequestreview-5785675641).

**Твой вопрос 2: как можно по-другому?** В `spineFold` вручную написаны вычитание векторов, нормализация, знак векторного произведения и поворот. Почти всё это уже есть в `geometry.ts` движка (`sub`, `normalize`, `side`), просто наружу из `@/origami/shared/fold` не экспортируется. Вариант: экспортировать эти функции и добавить к ним `rotate`. Тогда `spineFold` сократится до пары строк, которые читаются как геометрия, а не как арифметика. Библиотека вроде gl-matrix не нужна: у движка всё своё уже есть.

**Что ещё нашла шлифовка** (её правки уже закоммичены, 2233faae и 06e7dec4):
- **Пометку `masd-disable` проверяют в трёх местах**, каждое со своим регулярным выражением. Можно собрать в один хелпер `carriesMarker`. Но неясно, где ему жить: в `scripts/lib/slice-graph.ts` или в отдельном маленьком файле.
- **У исключения для `entities/design` нет issue.** Пометка называет, что её снимет (плеер шагов на сайте), но CLAUDE.md просит у временного исключения ссылку на issue.

**Что нужно от тебя:**
1. Чинить ошибку с порядком сгибов сейчас, в этой ветке? Я бы починил: это общий движок, и без проверки в отчёте следующая модель порвётся так же незаметно.
2. Переписать `spineFold` на экспортированных хелперах?
3. `carriesMarker` — делать, и куда положить? Я бы положил в отдельный файл `scripts/lib/`: у `slice-graph.ts` другая работа, он строит граф импортов.
4. Заводить issue на плеер и ставить ссылку в пометку?

Когда ответишь, сделаю, а потом прогоню `/finalize`: vet, мердж `main`, исправленное предложение squash (там до сих пор `shared/designs`) и аттестацию. Финальный мердж останется за тобой, словом `/merge`.

Пустую авто-ветку `claude/stoic-dijkstra-3bn6vb` удалять не пришлось: на `origin` её не было.
```
