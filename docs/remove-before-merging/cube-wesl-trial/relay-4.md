# Relay 4 — every cube shader in .wgsl, MASD proposals waiting

Parked on the keepalive's last wake, with the operator's answer to three MASD
proposals pending. `relay-3.md` and earlier hold everything before this
session.

## Standing constraints

From the parent session's brief (verbatim, still binding, carried from
relay-2):

- "MASD, the linters and the 400-line limit are not dodged: no re-export or line-squeezing to pass a gate, no lint suppression without the operator's yes."
- "`git pull` is blocked by a hook: fetch, then `merge --ff-only`. Never force-push."
- "A new dependency or build step is a toolchain change: CLAUDE.md § "Vetting" names its four sites. Report what the operator must add to the environment setup script."
- "`./scripts/vet.sh` green before the report."
- Branch `claude/cube-wesl-trial`: "Commit and push only there, under that name, do not rename it."

Operator (relay-3): «вет гоняй фоном» — run `./scripts/vet.sh` in the
background; its exit code is masked, so read the log for `vet OK` /
`vet FAILED`.

## The conversation

1. **Operator:** `/relay take claude/cube-wesl-trial — база догнана, пины этажей и улицы зелёные, уличные шейдеры ещё в TS`
   - Agent: worked relay-3's Next step through. Pinned the pipeline WGSL
     (`pipeline-pin`, BEFORE at 1ad37e1f), then moved all outdoor WGSL (sand,
     sky, sea incl. the wave field, outside, shell) and the pipeline (vertex,
     floor stage, floor and daylight lenses) into `.wgsl`, partly through
     worktree agents with narrow briefs (`tmp/wgsl-move-brief.md`). Vet green
     on ad7d6762 and dbc9cb5f. Republished the review board with four new
     focus items (6bd79c42). Put three MASD proposals to the operator and
     archived the predecessor session (verbatim in Last agent turn).

## Intent

Every cube shader in `.wgsl`, linked by the repo's WESL linker under MASD —
now done — then a MASD pass over the cube app, moves only on the operator's
yes, and the review board. Still not asked: regrouping floors by shared
features (relay-2's "next perch").

## Decisions

- **Kit `scene.wgsl`** (`entities/theme/kit/lib/`): themes in entities called
  `sceneAt`/`glowAt` declared in pages — an upward dependency. The scene
  bindings (@group(1) 2–4) moved to the kit; all 15 themes import them. Done
  without asking, as a bug fix.
- **`floorSource(theme, ...stage)`**: the stage calls the theme's three
  functions without importing them, and imports every kit name it uses
  (`CORE`, `GRADE`, `STUFF` on the theme barrel). The daylight lens replaces
  the floor lens through the same call (`firstFloorThrough`).
- **Barrel chain** (`scripts/lib/wesl/checks.ts` `exportedAs`): a slice's
  barrel may carry a name on from a sub-slice's barrel.
- **Generated import order** (`render.ts` `layerRank`): layer rank first, to
  match simple-import-sort.
- **Numbers**: values TS also holds go in `<stem>-numbers.ts` pieces; shader-only
  numbers are module consts in the `.wgsl`.
- **Kept TS by design**: `frame.ts` (the outdoor pin forbids splitting WORLD),
  `outdoor-frame.ts` (generated from FIELDS), `ladder.ts`, `sun.ts`,
  `shared/lib/sun-disc.ts`, and the numbers/salt/tables pieces.
- **Pins**: outdoor and pipeline pins share `pinHash` from
  `pages/cube/lib/shader-pin.test-kit.ts` (canonical form); the theme pin is
  token-exact with allowed differences undone by name in its `NAMED` list.

## Errors and dead ends

- Codegen trap: codegen imports the TS graph first, so deleting `<stem>.ts`
  needs a stub `<stem>.shader.ts`, repointed importers, codegen until clean,
  and codegen again after Prettier.
- The shell agent exhausted its context; its WIP was finished by a second one.
- The board build needs the PR base locally:
  `git fetch origin claude/cube-review-perf:claude/cube-review-perf`.

## State

- Branch `claude/cube-wesl-trial`, head 6bd79c42 pushed; draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/276 into
  `claude/cube-review-perf`.
- Vet: `vet OK` on dbc9cb5f (last code commit); 6bd79c42 adds only the focus
  file and one docstring line.
- No plan file (planless). Keepalive stopped. No toolchain change.
- Estimate: this session 18 h senior graphics-programmer (outdoor and pipeline
  WGSL into linked modules under three pins) + 1 h senior architect (MASD
  weighing, the upward dependency fix). Remainder handed on: ~2 h senior
  architect — the MASD moves the operator approves.

### Watches

https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU

## Pointers

- Review board: https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU; focus in
  `docs/remove-before-merging/review-focus.json`.
- Pins: `src/cube/pages/cube/lib/{outdoor,pipeline}-pin.test.ts`,
  `src/cube/entities/theme/shaders-pin.test.ts`.
- `src/cube/shared/outside/`, `src/cube/shared/lib/sun-disc.ts`,
  `src/cube/shared/sky/` — what proposals 1–2 would move.
- `tmp/wgsl-move-brief.md` is container-local and gone in a new container.
- Transcript: https://claude.ai/code/session_01DaohkCaoV7hfxzNmeuHhLY

## Next step

Wait for the operator's answer to the three MASD proposals in the Last agent
turn (from «вообще на предмет MASD проверить, не заслуживает ли что-то
"понижения" или "повышения"»):

1. Fold `shared/lib/sun-disc` into `shared/outside/sun` — ready on a yes.
2. Split `shared/outside`: world model stays, the rendering half (aerial,
   `sky.wgsl`, cube shadow, daylight, shore wetness) moves to `shared/sky` or a
   new segment.
3. Keep sea/sand/sky in shared rather than promoting them to entities.

Implement what is approved, holding the three pins green, vet in the
background, then republish the board with `/review-board`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Vet is green; now the board.

Доска опубликована. Перед отчётом проверю, не висят ли лишние сессии.

Archiving the predecessor (relay done, completed).

Вова, всё, что лежало снаружи, переехало в `.wgsl`. Это шейдеры улицы (песок, небо, море с волновым полем, ракушка) и конвейер этажа (вершины, стадия этажа, линзы этажа и улицы). Все три пина (этажи, улица, конвейер) на месте и зелёные. `./scripts/vet.sh` прошёл и на ad7d6762, и на dbc9cb5f, последнем коммите с кодом. После него я запушил только правку фокуса доски и одну строку докстринга.

Ревью-борд: https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU

В фокусе доски четыре новых пункта по этой сессии:
- **`kit/lib/scene.wgsl`**. Темы из entities вызывали `sceneAt`/`glowAt`, объявленные в pages, то есть зависимость шла вверх. Привязки сцены переехали в кит, и все 15 тем импортируют их явно. Это исправление бага, поэтому я сделал его без вопроса.
- **`floor-stage.wgsl`**. Конвейер этажа теперь тоже `.wgsl`. Три функции темы он вызывает без импорта: это контракт `floorSource(theme, ...stage)`. Линза улицы встаёт через тот же контракт вместо линзы этажа.
- **`checks.ts`**. Правило размещения теперь разрешает слайсу отдавать имя из подслайса через свой barrel. Иначе ядро кита пришлось бы импортировать мимо публичного API `theme`.
- **`wave-field-numbers.ts`**. На нём видно, как разложены числа на всей улице: то, что держит и TS, лежит в TS-куске, а то, что нужно только шейдеру, стало константой модуля.

Намеренно оставил в TS два файла. `frame.ts`: пин улицы не даёт его делить. `outdoor-frame.ts`: он генерируется из `FIELDS`.

По MASD я пока ничего не двигал, ответь по трём пунктам:
1. Влить `shared/lib/sun-disc` в `shared/outside/sun`? На «да» сделаю сразу.
2. Разделить `shared/outside` надвое? Модель мира (остров, волнение, солнце, кадр, повороты) остаётся там, а то, что рисует (aerial, `sky.wgsl`, тень куба, дневной свет, мокрый берег), уезжает в `shared/sky` или в новый сегмент.
3. Предлагаю пока не повышать море, песок и небо до entities. Море и песок ссылаются друг на друга, солнцу из `outside` нужен `lightUnder` из неба, а пользуется ими всеми одна страница.

Зависимости и тулчейн не трогал, так что в setup-скрипт окружения добавлять нечего. Заархивировал предыдущую сессию эстафеты, «Cube WESL trial: 66 этажей»: она передала ветку и больше не нужна.
```
