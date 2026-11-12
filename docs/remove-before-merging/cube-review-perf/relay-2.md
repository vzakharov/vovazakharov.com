# Relay 2 — cube-review-perf

Paused for its context budget once the GPU stage timing was pushed and on
preview; the next step waits on the operator's numbers.

## 1. Standing constraints

- Operator: Vova (`vzakharov`). Russian, «ты»; Pratchett-ish banter welcome;
  "load-bearing" and "quietly" banned.
- From relay-1 (still binding): MASD, the linters and the 400-line limit are not
  dodged — «ты кажется ищешь обходные пути?», «нет никогда такой задачи»; no
  re-export or line-squeezing to pass a gate; no lint suppression without the
  operator's yes. `git pull` is blocked by a hook (fetch, then
  `merge --ff-only`); never force-push.
- The approved theme shaders are touched only in #275, as review/optimization
  work.
- New, in the operator's entry (`.claude/voice/operators/vzakharov.md`): «здесь
  и дальше архивируй сессии которые больше не нужны» — archive finished sessions
  unasked, naming each in the report.
- Shader code follows MASD too: «я хочу чтобы наша MASD-философия применялась
  плюс-минус и здесь … например чтобы базовые функции потребляемые двумя
  слайсами не уходили в ход слайсов итп».

## 2. The conversation

1. `/relay take claude/cube-review-perf — #273 слит и задеплоен, ревью-PR #275 с
доской ждёт комментариев` — Attached, watched the board, reported waiting for
   comments; asked whether «добавим на борду» meant #275's board.
2. Board comment on `dwelling/lib/home.ts:8`: «какие есть способы это
   элегантизировать, чтобы не писать целые программы в строках? ну и наверное
   WET across all files там тоже хватает мягко говоря» — Counted ~10.5k lines /
   511 fns of WGSL in strings, almost no verbatim duplicates (WET is in idioms);
   offered `.wgsl` files, WESL, TypeGPU (against).
3. «typegpu звучит вкусно, почему против?» — No byte-comparable proof of an
   unchanged picture, operator-less JS vector maths, a build plugin, 0.x;
   offered a one-floor trial.
4. «а какой у нас с самой сложной шейдернятиной, но при этом не эзотерический
   (типа не 60)? подтвердим на нём, считай подтвердим на всех» — Named
   15-nursery, proposed nursery + `kit/light.ts`.
5. «а 28? там прямо очень вкусные лужи» — Floor 28's puddles are the shared
   reflection pass (`reflection-shader.ts`), a better TypeGPU test; asked the
   order against perf.
6. «давай 28, в подсессии. не знаю нужен ли собственный ПР (в прошлом заходе все
   подсессии делались без пиаров)» — Started a child session on
   `claude/cube-typegpu-trial`, no PR (kept → merged into #275, dropped →
   deleted); todo § 0 added.
7. «26-й этаж меня очень впечатлил … сколько нам нужно стен (=какой нам нужен
   этаж), чтобы сделать уровень-библиотеку, у которой на полках есть все
   возможные книги из 400 страниц (или как там было у автора)?» — Borges'
   Library of Babel: floor 3 046 366 (25^1 312 000 books, 640 per room, floor n
   has 4^(n−1) rooms); the cube's 66 floors hold all books of 30 characters; a
   room's address is as long as its book. The "atlas" for island is not in the
   repo; asked what it was.
8. (Child reported: TypeGPU NO — pixel-identical, but +82 KB gz, `.mul()`
   chains, `item_N` names, babel-loader under Turbopack.) — Relayed it,
   cherry-picked the child's verdicts.json formatting fix, recommended
   `.wgsl` + WESL.
9. (Child added an FPS meter on the operator's ask.) — Reported it.
10. «забери счётчик, а остальное отбрасывай» — Cherry-picked the FPS meter
    (1d667830, dropping the child's cost-row copy, which the ledger holds);
    deleting `claude/cube-typegpu-trial` failed (proxy hung up twice), left for
    the operator; todo § 0 records the verdict.
11. «здесь и дальше архивируй сессии которые больше не нужны» — Archived the
    TypeGPU child and the relay-1 predecessor (it was pinned); wrote the
    preference into the operator's entry.
12. «так что ты по wsgl рекомендуешь» — `.wgsl` per piece with WESL `import`s,
    linked by a pre-build codegen script (like `styles:codegen`), byte-pinned to
    today's `assemble()`; `ordinary()` stays a TS generator; withdrew the
    switch-as-data idea; unknowns: editor support, WESL linker renaming.
13. «давай. но ещё что хочу сказать, я хочу чтобы наша MASD-философия
    применялась плюс-минус и здесь …» then «можно взять два этажа, в которых
    есть что-то похожее, и смоделировать таким образом» — Started a second child
    on `claude/cube-wesl-trial`: 12-bathroom + 46-micrograph (same hex lattice
    written twice, `luma` twice), shared shapes into the kit, linker to try
    enforcing MASD via `eslint/masd-graph.ts`. Said MASD may be checkable since
    imports become explicit. Admitted reflections cannot be measured here (no
    GPU).
14. «в cube-liminal только нет fps» — Deployed the review branch's head
    f763b784 (cube-liminal + FPS, no perf change) to preview slot 2 as the
    baseline; then built GPU stage timing (verbatim in Last agent turn).

## 3. Intent

Make the cube's reflections (and frames generally) fast without changing the
approved look, and get the shaders out of TS strings into files whose imports
obey MASD, with the look provably unchanged. Ruled out: TypeGPU.

## 4. Decisions

- **TypeGPU rejected** (operator: «ну ок, ладно, убедил»); only the FPS meter
  kept.
- **Shaders out of strings**: `.wgsl` + WESL imports, linked by a codegen script
  rather than a bundler plugin (Turbopack takes no unplugin), byte-pinned.
  Switch-as-data dropped (it would generate WGSL from TS again).
- **Trials run in child sessions on branches off this one, no PR**: kept → merge
  into `claude/cube-review-perf`, so #275's board shows them.
- **Baseline for perf** is f763b784 on preview slot 2, not `cube-liminal` (which
  has no FPS meter).
- **GPU timing** (e926132f): timestamp queries where the adapter offers
  `timestamp-query`; stages scene / mirrors (mip chain + reflection walk) /
  glow (bloom) / lens; shown under F as a second line. `cover()` in `bloom.ts`
  takes `{ keeps, stamp }`.

## 5. Errors and dead ends

- Deleting a remote branch through the proxy fails ("remote end hung up").
- `git cherry-pick` of a child's commit conflicts on its cost-row copy under
  `.claude/costs/sessions/…/<child-branch>/`; drop it (`git rm`), the
  `cost-ledger` branch holds the row.
- `list_events` on a child session overflows; page it in a subagent.

## 6. State

- Branch `claude/cube-review-perf`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/275 (base
  `review-base/cube-liminal`, CLEAN), head e926132f before this summary's
  commit. No plan file. Vet not run since the GPU timing commit (tsc, eslint,
  prettier, knip, type-overlap and its test pass locally).
- Preview slot 1: e926132f (GPU timing), run
  https://github.com/vzakharov/vovazakharov.com/actions/runs/43286104290. Slot
  2: f763b784 baseline, run
  https://github.com/vzakharov/vovazakharov.com/actions/runs/43285156201.
- Child session WESL trial: https://claude.ai/code/session_01DaohkFq25hfQsRjURtiG1H
  on `claude/cube-wesl-trial` (off f763b784); told to report to this session,
  redirected to the successor by message.
- Leftover branch `claude/cube-typegpu-trial` (3cdb5134), not to merge; the
  operator was asked to delete it.
- Estimate, this session: 3.5 h senior graphics-programmer, 1.5 h senior
  producer. Remainder handed on: 1 h senior qa — the every-band gallery look on
  the cube, inherited from relay-1.

### Watches

https://claude.ai/artifact/1QrH94uoE3AHkQ4Wsxdwte

## 7. Pointers

- `docs/remove-before-merging/cube-review-perf/todo.md` — § 0 shaders out of
  strings (TypeGPU verdict, WESL route), § 1 performance, § 2 duplication.
- `src/cube/pages/cube/ui/pass-timer.ts` — the GPU timer; `renderer.ts` wires
  it; `frame-rate.tsx` shows it.
- `src/cube/pages/cube/ui/reflection-shader.ts` / `reflection.ts` — the mirror
  walk (24 steps + 6 halvings + 5-tap blur per mirror pixel) and its passes.
- Board: https://claude.ai/artifact/1QrH94uoE3AHkQ4Wsxdwte (rebuild:
  `git fetch origin review-base/cube-liminal:refs/remotes/origin/review-base/cube-liminal`
  then `node .claude/artifacts/src/review-board/scripts/build.ts`).
- Predecessor relay: `docs/remove-before-merging/cube-review-perf/relay-1.md`.
- This session: https://claude.ai/code/session_01DaohkCiN9dqvTbQitKLW6y

## 8. Next step

Wait for the operator's GPU numbers from preview slot 1 (F, on a floor with
mirrors such as 28 and one without) against slot 2's fps, then optimize the
stage that dominates, starting from todo § 1 (skip the mirror passes where no
pixel mirrors; the walk's cost per mirror pixel). Meanwhile, when the WESL
child reports, relay its verdict and archive it once its branch is merged or
dropped (operator's standing ask). Still open from the operator: what the
island "atlas" was.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Запустил подсессию с пробой WESL на двух этажах: https://claude.ai/code/session_01DaohkFq25hfQsRjURtiG1H

**Этажи — 12 «Ванная» и 46 «Микроснимок».** В них одна и та же шестиугольная решётка написана дважды, и они из разных диапазонов: dwelling и laboratory. По твоему правилу решётка уходит вниз, в общий кит, а не остаётся в одном из диапазонов. Туда же уходит `luma` из `small-world.ts`. Её копия есть ещё в `edge/lib/pattern.ts`, но этот файл в пробу не входит и будет перенесён при полном переезде. Пара удачная ещё и потому, что покрывает обе формы кода: «Ванная» собрана генератором `ordinary()`, у «Микроснимка» свои функции света и линзы и подстановка из TS.

**Про MASD.** Похоже, проверять её механически всё-таки получится. Сейчас этаж вызывает `fbm` или `worley` неявно: функция приезжает с чужими зависимостями, и такую связь никто не видит. Когда каждый `.wgsl`-файл сам пишет `import`, у склеивающего скрипта на руках все рёбра графа. Значит, он может применить к ним те же правила, что и для TS: два диапазона не импортируют друг друга, вниз идут только через публичный вход. Подсессия попробует переиспользовать для этого классификацию из `eslint/masd-graph.ts` и отчитается, что ловится, а что нет. Твои слова я передал ей дословно.

**Картинка не поменяется, и это проверяется.** Тест сравнивает собранный исходник обоих этажей с нынешним побайтно. Разница допускается только от переноса решётки и `luma` в кит, и каждое расхождение будет показано в отчёте. После этого `shaders:cube` прогоняется по всем этажам.

**Поправка к прошлому сообщению.** Отражения я тут замерить не могу: в контейнере нет видеокарты, а программный рендер показывает времена, которые ничего не значат. Поэтому сделаю так: отключу проход отражений на этажах, где нет ни одной блестящей поверхности, выложу ветку на превью 1, а cube-liminal на превью 2. Ты сравнишь FPS по клавише F. Пробу WESL это не задевает: она меняет файлы тем, а отражения живут в `pages/cube/ui`. Начинаю.
```
