# Relay 2 — the whole move (parked)

This session parked once before as `relay-1.md` (the trial on floors 12 and 46,
the board, PR #276, the formatter); the operator came back and asked for the
running notes in `relay-2.md` («можно в relay-X.md даже»), so this file is the
current summary and `relay-1.md` holds everything up to that return.

## Standing constraints

From the parent session's brief (verbatim, still binding):

- "MASD, the linters and the 400-line limit are not dodged: no re-export or line-squeezing to pass a gate, no lint suppression without the operator's yes."
- "`git pull` is blocked by a hook: fetch, then `merge --ff-only`. Never force-push."
- "A new dependency or build step is a toolchain change: CLAUDE.md § "Vetting" names its four sites. Report what the operator must add to the environment setup script."
- "`./scripts/vet.sh` green before the report."
- Branch `claude/cube-wesl-trial`: "Commit and push only there, under that name, do not rename it."

Operator's: reports in Russian, «ты», Pratchett-ish irony, no
"load-bearing"/"quietly"; everything the operator needs goes in the final
message (interim text is cut); after a board reply the chat line is one short
line; on an auto-mode denial give a fenced authorization line.

## The conversation (since relay-1)

1. **Operator:** «ну так включи, зачем отключил» (the board watch)
   - Agent: re-registered the artifact watch.
2. **Operator:** «ну что, норм -- берёмся за все остальные?»
   - Agent: started moving every remaining floor and band piece to `.wgsl`.
3. **Operator:** «тут стоит автокомпакт, так что игнорируй указания релея, считай их просто напоминаниями самому себе что "скоро меня сожмут"»
   - Agent: acknowledged; keeps notes instead of relaying.
4. **Operator:** «можно в relay-X.md даже / 1 - поясни ещё раз, попроще»
   - Agent: started `relay-2.md`; re-explained point 1 (why a floor plus a private module trips `masd:clusters`) more simply.
5. **Operator:** «где получится круг? нарисуй аскишкой»
   - Agent: drew the ASCII import graph showing where a cycle would form.
6. **Operator:** «> такую пару гейт принимает за отдельное понятие и требует вынести в папку. ну так и пусть выносит, в чём проблема? они ж и правда 3 файла которые нужны только в основном друг другу?»
   - Agent: agreed; proposed a folder per floor.
7. **Operator:** «замечательно, для того мы MASD и придумывали, чтобы не было граббагов. я тебе больше скажу, мне не нравится как сейчас разделены этажи на "вот это лаборатория а вот это -- dwelling". а что если у нас будет dwelling лаборатория? смотреть как раз нужно по общим используемым фичам/подходам -- где нам MASD в помощь -- а не заранее определять. Но это работа для следующего насеста, сейчас -- make wsgl great again»
   - Agent: carried on with the move; regroup by features deferred.
8. **Operator (mid-turn):** «Мой совет теперь / попробуй так и сяк и сделай как считаешь более элегантным и менее энтропийным в свете всего что я сказал»
   - Agent: tried AIR-contract-without-folders and folders; the home floor's 400-line split forced a sub-slice, so every floor got a folder (bacdeb70); vet green; board republished; reported 66/66 in Russian (verbatim in Last agent turn).
9. **Operator (mid-turn, during vet):** «можешь после каждого перенесённого уровня писать сколько из скольких сделано, просто чтоб я мог визуально мониторить когда прихожу»
   - Agent: answered in the final report — the move is already complete, 66 of 66.
10. **Operator:** `/relay park` — this file.

## Intent

Every cube shader in `.wgsl` linked by our own WESL linker with MASD enforced,
pinned token-for-token to f763b784. Done. Next perch, **not started and not
asked yet**: regroup floors by shared features (MASD-driven) instead of the
fixed bands workplace/dwelling/leisure/laboratory/edge.

## Decisions

- **`AIR` contract** (5d633a0f): `floorSource` declares `const AIR` from
  `theme.air` in every floor's shader; `.wgsl` names it unimported like
  `lamps()`. Beat a codegen'd TS piece per floor (`micrograph-air.ts`), which
  made a cluster per floor.
- **Folder per floor** (bacdeb70): `theme/<band>/<floor>/{index.ts,
config/<floor>.{ts,wgsl,shader.ts}}`, no numbers in names; band pieces are
  sub-slices (`edge/{pattern,screen,lit}`, `leisure/shape`, `workplace/stencil`,
  `laboratory/small-world`, `dwelling/household`). Beat a sub-slice for the home
  floor alone. Numbers live only in `catalogue/config/floors.ts` (`BANDS`,
  `TRADED`), so a regroup moves folders without renumbering.
- **Singular names** forced by Steiger `fsd/inconsistent-naming` (`pluralize`
  counts `specimen` plural): grandmother, cut-paper, normal-map, sixteen-colour,
  shape, stencil, small-world. `household` because `FITTINGS` collided with
  `features/decor` (`vova/no-export-namesake`). The `lit('sixteen-colours', …)`
  id was left as is, since it feeds shader text the pin hashes.
- **Dead pieces dropped** on floors 29, 40 (FINISH), 50 (SMALL_WORLD), 65
  (GRADE): listed, never called; the pin's `UNCALLED` puts them back.
- **Home's carpets** split to `edge/home/lib/carpet.wgsl` to stay under 400
  lines; the pin's `home()` undoes it.
- **`Aired` folded into `FloorTheme.air`** (knip flagged the export).
- **Stays TS on purpose**: `kit/lib/core.ts` (TS-derived constants),
  `ordinary.ts`, `edge/lit/lib/lit.ts` (parametric), `kit/model/theme.ts`.
  Splitting core is an open offer.
- The pin test is scaffolding, to be deleted once the move is confirmed on
  preview.

## Errors and dead ends

- Converter `super::` depth off by one; imports used only as locals — fixed via
  `unused.mjs` reading the linker's report.
- `folders.mjs` crashed half-way on a `git rm` of a modified file; reset and
  redone with `rm -qf`.
- `rename.mjs`'s `'./shapes'` rewrite also hit `src/cube/entities/poster/`;
  reverted with `git checkout HEAD -- src/cube/entities/poster`.
- First vet on 13b9554e failed: home at 481 lines, knip on `Aired`. Both fixed
  in bacdeb70; vet green there.

## State

- Branch `claude/cube-wesl-trial`, head bacdeb70 (pushed, in sync with origin),
  draft PR #276 into `claude/cube-review-perf`.
- `./scripts/vet.sh` green on bacdeb70.
- Review board republished (version 4) from bacdeb70;
  `docs/remove-before-merging/review-focus.json` updated for the new paths plus
  a catalogue item.
- No plan file (planless entry). Nothing running; keepalive stopped.
- Estimate left as it stands (37.3 senior-hours): the move is done in this
  session, nothing handed on.

### Watches

https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU

## Pointers

- `docs/remove-before-merging/cube-wesl-trial/relay-1.md` — the trial up to
  the first park.
- `src/cube/entities/theme/shaders-pin.test.ts` — the pin and every allowed
  difference by name.
- `src/cube/entities/theme/catalogue/config/floors.ts` — numbering.
- `src/cube/entities/theme/kit/model/theme.ts` — `floorSource`, `AIR`.
- `scripts/lib/wesl/` — the linker; `.claude/rules/wgsl.md` — the numbers rule.
- `docs/remove-before-merging/cube-review-perf/todo.md` — still names old floor
  paths (`14-laundry.ts`, …) in its core-split note; refresh when touched.
- One-off tools under `tmp/wesl-move/` are not on the branch (container-local).
- Transcript: https://claude.ai/code/session_01DaohkFq25hfQsRjURtiG1H

## Next step

Wait for the operator. The regroup by shared features is the announced next
perch («это работа для следующего насеста»), not yet asked for.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Начинаю переносить группу `laboratory` в `.wgsl`. Потом на ней же попробую оба варианта папок и оставлю тот, что чище.

Пин-тест теперь подставляет цвет воздуха обратно сам, по теме этажа. Прогоняю кодоген и пин.

Сначала общие куски групп: `pattern`, `screen`, `shapes`, `marks`.

Now the headers: each lib's docstring becomes its `.wgsl` file's header comment.

Общие куски групп переехали (2614e9ec). Теперь этажи, начинаю с `laboratory`.

Конвертер ошибся на один уровень `super::` в импортах внутри группы, а линкер это поймал. Исправляю.

Пин проходит на всех этажах `laboratory`. Прогоняю компиляцию и линтеры.

Остальные группы — `workplace`, `dwelling`, `leisure` и `edge` — прогоняю одним заходом.

Этажи 1–28 совпали с пином. На 29 и 65 тоже выпал неиспользуемый кусок, добавляю их в исключения.

All 66 floors match the pin. Now: compile, linters, MASD.

Vet нашёл две проблемы: `66-home` после prettier вырос за 400 строк, и ещё что-то нашёл knip. Смотрю, что именно.

`66-home` после prettier вырос с 350 до 481 строки. По шву выношу из него ковры (`dye`, `woven` и их константы) в `edge/lib/carpet.wgsl`.

Now import `woven` into the floor, regenerate, and check `masd:clusters`.

Посмотрю правило `no-export-namesake`, прежде чем раскладывать этажи по папкам: от него зависит, как называть файлы.

Скрипт упал на середине из-за незакоммиченного `66-home`. Откатываю частичный прогон и запускаю заново.

Линкер требует, чтобы в чужой подслайс входили через `package::`, а не `super::`. Переписываю эти импорты.

Имя `fittings` уже занято в `features/decor`. Переименовываю общий кусок `dwelling` в `household`.

Этаж 9 — это `home` после обмена с 66. Добавляю в пин откат выноса ковра.

Пин зелёный. Теперь все гейты MASD и полный набор проверок.

Checks are green (typecheck, eslint, Steiger, knip, pin, 66/66 floors). Sweeping stale path mentions, then commit, vet.

Now the focus file: bathroom's new path, theme.ts span, and one item for the catalogue's numbering.

Now relay-2.md.

Vet passed. Rebuilding the board.

Вова, счётчик тебе уже не понадобится: переехали все этажи, 66 из 66. Плюс общие куски всех пяти полос.

**Что получилось:**
- **Все 66 этажей в `.wgsl`.** Пин подтверждает это потокенно против f763b784. Отличаются только те места, которые тест называет поимённо и откатывает. `pnpm shaders:cube` собирает 66 из 66, `./scripts/vet.sh` зелёный на bacdeb70.
- **Папка на этаж.** Я попробовал и так и сяк, как ты советовал. Решил дом: после prettier он раздулся до 481 строки, ковры пришлось вынести в отдельный файл. Гейт тут же потребовал для пары «дом + ковры» подслайс. Делать подслайс одному странному этажу — энтропия, поэтому папку получил каждый: `<полоса>/<этаж>/config/<этаж>.{ts,wgsl}`. Номеров в именах больше нет.
- **Номер этажу даёт только каталог** (`catalogue/config/floors.ts`). Поэтому на следующем насесте, когда будем перегруппировывать этажи по общим фичам, переедут папки, а нумерация останется на месте.
- **Цвет воздуха задаётся в теме один раз.** Сборка сама объявляет `AIR` в каждом шейдере, и `.wgsl` пользуется им без импорта, как `lamps()`. Отдельный файл с воздухом микрографа исчез вместе со своим кластером, а тип `Aired` влился в `FloorTheme`.
- **Мёртвые куски выкинуты.** Этажи 29, 40, 50 и 65 тащили за собой код, который ни разу не вызывали, и импорт его просто не назвал. Пин возвращает их обратно, чтобы сверить остальное.

**Чем пришлось заплатить:**
- **Имена теперь в единственном числе.** Этого требует правило Steiger о единообразии имён, а его словарь считает `specimen` множественным числом. Отсюда `grandmother`, `cut-paper`, `normal-map`, `sixteen-colour`, `shape`, `stencil`, `small-world`.
- **`fittings` стал `household`.** Иначе имя столкнулось бы с `features/decor`, а правило о тёзках такого не пускает.

**Осталось на TS нарочно.** Это `kit/lib/core.ts`, `ordinary()`, `lit()` и `theme.ts`: они либо выводятся из TS, либо параметрические. Разрезать `core.ts` могу, предложение в силе.

Новых зависимостей нет, в setup-скрипт окружения добавлять ничего не нужно.

Доска обновлена: туда добавлен пункт про нумерацию в каталоге, а пути поправлены под новые папки.
https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU
```
