# Relay 5 — island an entity, the outdoor picture a widget; clusters to cut

Relayed for the context budget mid-work, after the move landed and before
`masd:clusters` was answered. `relay-4.md` and earlier hold everything before
this session.

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

Operator (this session): «можешь перестать предлагать двигать пока мы
выясняем» — while a question is being worked out, answer it; do not end
replies with "двигаю?".

## The conversation

1. **Operator:** `/relay take claude/cube-wesl-trial — все шейдеры куба в .wgsl, вет зелёный, ревью-борд обновлён, ждут ответа три MASD-предложения`
   - Agent: attached, re-watched the board, restated the three MASD proposals
     and waited.
2. **Operator:** (screenshot of the board showing `water-body.shader.ts` beside
   `water-body.wgsl`) «до этого дойдём. я пока не оч понимаю почему я
   по-прежнему вижу кучу wgsl-а в строках тайпскрипта?»
   - Agent: the `.shader.ts` files are `pnpm shaders:codegen`'s committed
     twins of each `.wgsl` (the bundler and `tsx` read TS only; vet holds
     them fresh), and neither `.gitattributes` nor the board knows they are
     generated. Offered: (1, recommended) `*.shader.ts linguist-generated=true`
     plus the board hiding what is so marked; (2) stop committing them — a
     toolchain change; (3) a `.wgsl` loader. **Unanswered.**
3. **Operator:** «> а пользуется всеми ими одна страница — тогда я не понимаю,
   почему всё это не живёт внутри этой самой страницы.»
   - Agent: agreed; only `pages/cube` imports sea/sand/sky; `shared/outside`
     mixes the world model (read by entities and features) with the drawing;
     proposed moving the drawing into the page.
4. **Operator:** «ок, беру последнийвопрос назад, страница у нас в принципе
   одна»
   - Agent: read it as "keep it in shared"; proposed dropping proposal 2.
5. **Operator:** «эт оне то что я сказал подожди.»
   - Agent: waited, asked where it misread.
6. **Operator:** «в pages/mushrooms у нас тоже одна страница, но это не мешает
   нам там иметь виджеты, фичи и сущности. insignificant slice штайгера у нас
   не действует, так как MASD вводит другие метрики, если мне не изменяет
   память (кластерность и прочее). мне кажется, что outside должен стать одним
   _чем-то_ (виджетом наверное, потому что ему нужны фичи voice итд), и внутри
   себя содержать (в подслайсах) всё что ему нужно. В тех же mushrooms у нас
   виджеты frame, ground, view например.»
   - Agent: agreed it can be a widget; noted the drawing reads no feature
     today, and that the world model must stay low because entities read it.
7. **Operator:** «> и ни voice, ни sound там нет — подожди, а как мы там
   произносим мычания и издаём звуки?»
   - Agent: all sound goes through the page's ear,
     `pages/cube/ui/hearing.ts`: one soundscape, three inputs (`body` with the
     voice, `outside` with the island's sound, `rooms`).
8. **Operator:** «можешь перестать предлагать двигать пока мы выясняем. Голос
   у нас издаётся нашей самописной технологией с формантами и всеми делами. где
   она живёт?»
   - Agent: `features/voice`, flat in `model/`: the synth (phone, source,
     filter, track, utter, vocal, voice, speaker, wav) and what to say
     (lexicon, letters, pieces, script, line, line-for, tongue, chance).
9. **Operator:** «как ты говоришь, что outside/outdoors его не берёт, если
   первое что герой делает, просыпаясь, это мычит?»
   - Agent: the mumble is the body's: `features/player/model/scenes.ts:156`
     emits `say/waking`, `abroad.ts:190` `wonder`; the ear turns any `say`
     into the voice; the place only sets the acoustics.
10. **Operator:** «пытаюсь понять баг это или фича,архитектурно выражаясь. Мы
    просыпаемся и wonder только на улице, при этом улица про это ничего не
    знает, а знает page, который эту улицу импортирует. катавасия какая-то»
    - Agent: a feature — the player decides waking and wonder, reading the
      place; real smells: `hearing.ts:118–122` holds a script decision with
      `afterFirst` memory; the ear is widget-shaped but in the page; the word
      "outside" names four things.
11. **Operator:** «> Чтобы знать, где он, игрок читает модель места из
    shared/outside — может здесь и проблема, почему у нас что-то про outside
    вообще в shared» (verbatim in Last agent turn)
12. **Operator:** «ну давай попробуем»
    - Agent (the relay's own turn): split `frame.ts` (bd3e1e16), moved the
      island to `entities/island` and the picture to `widgets/outdoors`
      (ad0cc2fd), then relayed for the context budget.

## Intent

The cube app laid out by MASD's own logic rather than by where code happened
to land: the island a business noun in entities, the picture of the outside a
widget over it, shared holding only what entities need. The operator thinks
in terms of mushrooms' `widgets/map/{frame,ground,view}`. Not yet asked: the
three smells of item 10, and the generated-twin question of item 2.

## Decisions

- **`shared/outside` keeps only what entities read**: `frame.ts` (cube side,
  `Box`, `DOORWAY`, `WallSide`, `ROOM_DOORWAY`), `turn.ts` + `shell-turn.wgsl`,
  `beam.ts`, `sun.ts`, and `sky-light.ts` + `atmosphere.ts` from the sky
  (the sun's light needs `lightUnder`).
- **`entities/island/model/`**: island height and ease, swell (+course,
  numbers, train), water level, shore cusps, shore wetness, ladder (now also
  `Laddered`), and `place.ts` — the cube's position on the island (`CUBE_AT`,
  `toWorld`, `toCube`, `CUBE_BOX`, `DOORWAY_BOX`, `WAKE_AT`, `WORLD`), cut out
  of `frame.ts` because `CUBE_AT` stands on `islandHeight`.
- **`widgets/outdoors/{lib,ui}`, flat**: sea, sand, sky, shell, the stage
  (outdoor frame and stage, cube shadow, daylight, aerial, `sky.wgsl`), the
  page's outdoor layers, `OUTDOOR_SHADERS`/`outdoorSource` and the outdoor
  pin. A first cut into sub-slices (seam/water/sky/sand/sea/shell/scene) hit
  the WGSL linker's **band rule** (`scripts/lib/wesl/checks.ts`
  `bandsEntered`: a sub-slice reaching a sibling is a band, and no sibling may
  import a band — two tiers only), so it was flattened for `masd:clusters` to
  cut by dominator subtree instead.
- **The widget does not reach the page**: `compiled()` moved to
  `shared/shader/compiled.ts`; `createOutdoors(device, { targets, depthFormat })`
  takes the page's scene pass; `outdoorSources()` (adds the lens) stays in the
  page's `lib/outside-lens.ts`.
- **`pinHash`** moved from a page test-kit to `shared/shader/pin-hash.ts`
  behind `shared/shader/index.test-only.ts` (a test-kit cannot be re-exported).
- **Pins hash WGSL declarations, not module paths**, so moving files leaves
  them untouched.

## Errors and dead ends

- `node_modules` lacked `prettier-plugin-wgsl` (installed on the auto-branch):
  `pnpm install --frozen-lockfile` fixed it.
- Codegen trap from relay-4 again: a stale generated import (`WORLD` from
  `./frame`) crashes codegen before it can regenerate; fix the `.shader.ts` by
  hand, then rerun.
- The page-into-widget split hit two upward imports (`programs.ts`'
  `compiled`/formats, the lens) — resolved as above.

## State

- Branch `claude/cube-wesl-trial`, head ad0cc2fd pushed; draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/276 into
  `claude/cube-review-perf`.
- Green at ad0cc2fd: codegen, `pnpm typecheck`, eslint on `src/cube`,
  `lint:fsd`, `check:masd`, `check:poison`, `check:cycles`, prettier, the 80
  tests of the moved code and all three pins. **Red: `masd:clusters`** (below).
  Vet not run since the move.
- No plan file (planless). No toolchain change. Keepalive stopped.
- Estimate: this session 4 h senior architect (finding what held the island in
  shared, cutting frame/sun/island) + 2 h senior graphics-programmer (~140
  WGSL modules moved under three pins). Remainder handed on: ~3 h senior
  architect (the cluster cuts and their barrels) + ~1 h senior
  graphics-programmer (WGSL imports across the new sub-slices, pins green).

### Watches

https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU

## Pointers

- `pnpm masd:clusters` — the report to answer: `entities/island` (clusters at
  `shore-cusps.ts` taking swell below it, and `shore-wetness.ts`) and
  `widgets/outdoors` (`ui/outdoors.ts` 14 files: the scene and wave-field
  passes; `lib/sea.shader.ts` 8; `shell-shader` 4; `sand-shader` 4;
  `clear-sky-fit` 3; `sky.shader` 3; `sun-glow`, `cube-shadow`,
  `sky-shader` 2 each). Its footer says how to cut, or to ask for a
  `// masd-disable cluster -- <why>` on the operator's yes.
- `scripts/lib/wesl/checks.ts` `bandsEntered` and `placement.ts` — the WGSL
  side of sub-slice entry (same unit → `super::`, else `package::` to a leaf).
- `tmp/move/{move.py,split.py,merge.py}` — container-local and gone in a new
  container: a mover that `git mv`s by a TSV map and rewrites TS and WGSL
  imports, a barrel writer that re-points named imports to the unit now
  holding each name, and a duplicate-import merger.
- `src/cube/pages/cube/ui/hearing.ts:99–122` — the `afterFirst` smell.
- Review board: https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU; focus in
  `docs/remove-before-merging/review-focus.json`.
- Transcript: https://claude.ai/code/session_01DaohkBtCTt6tgWMeqbp5dW

## Next step

Finish what the operator approved with «ну давай попробуем»: answer
`pnpm masd:clusters` for `entities/island` and `widgets/outdoors` by cutting
sub-slices — keeping the WGSL band rule's two tiers in mind (shared pieces
below, the per-layer shaders as bands) — with codegen, typecheck, eslint,
`check:masd`, `check:cycles` and the three pins green; then vet in the
background and republish the board with `/review-board`. Where a cluster
would rather stay, ask the operator for the `masd-disable` marker instead of
cutting. Still open, to ask when reporting: the generated-twin question
(item 2) and the three smells (item 10).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Отчасти да, проблема тут. В правилах записано: «shared не несёт бизнес-логики, код об одном существительном живёт в его entity, если ничто не держит его ниже». Я проверил, что именно держит `outside` внизу, и держат его две entity, `world` и `theme`. При этом берут они не остров, а совсем немного:

- `entities/world` берёт `ROOM_DOORWAY` и `WallSide`, то есть проём в стене куба.
- `entities/theme` берёт тип `Box`, а для света через окна ещё `SUN_DIR`, `SUN_LIGHT` и `toShell`.

Получается, что `shared/outside` — это три разные вещи под одной крышей:

1. **Куб в мире: система координат.** `CUBE_METRES`, `CUBE_AT`, проём, лестница на внешней стене, `toCube`/`toWorld`/`toShell`/`toRoom`, повороты, `Box`, луч через проём. Это сетка, в которой меряется всё, и её читают обе entity. Ниже entities ей и место.
2. **Солнце.** Направление и свет, а свет считается через `lightUnder` неба. Его читает `theme`, значит, тоже внизу, рядом с физикой неба.
3. **Остров.** Волнение (`crestOf`, `turnsAt`), уровень воды и `shoreClock`, высота острова, береговые выступы, точка пробуждения `WAKE_AT`. Ни одна entity этого не читает. Читают только фичи (`player`, `sound/outdoors`) и рисующая часть. По нашему же правилу это существительное, которое застряло в shared без причины. Его законное место — `entities/island`.

Отсюда видно, откуда взялась катавасия. Остров лежит в shared, поэтому и всё, что его рисует (море, песок, небо), тоже вынуждено лежать в shared: рисовать остров можно только с того же этажа или выше. А как только остров стал бы entity, рисующая часть сама поднялась бы над ним. Это ровно твой виджет, только уже не по вкусу, а по необходимости.

`WAKE_AT` стоит отдельно. Сейчас он записан в `frame.ts` рядом с координатами куба, а по смыслу это точка на острове, где просыпается тело.
```
