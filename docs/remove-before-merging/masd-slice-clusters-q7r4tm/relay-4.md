# Relay 4 — MARS: clusters nested as sub-slices instead of moved out

## Standing constraints

None stated.

The muthur sync offer was made; do not make it again.

## The conversation

1. **Session opened with** `/relay take claude/masd-slice-clusters-q7r4tm`
   (parked from relay-3).
   - Agent: attached (the auto-branch was never on origin, so nothing to
     delete), read relay-3.

2. **Operator** (sent mid-turn, before the agent's first reply): «так... а
   почему мы вообще хотим выносить за предел слайса, мы же можем делать что-то
   типа: / 1- находим кластер / 2- создаём для него папку внутри слайса
   (сегмент) / 3- даём сегменту бочку, всё внутреннее прячем внутри. / причём...
   check this out... внутри этого сегмента у нас свои api-model-lib-..., то есть
   такой у нас слас в слайсе-- MARS (multi-app recursive slices)»
   - Agent: agreed moving out was needed only because FSD has no levels inside a
     slice; every report cluster is a downward closure (imports nothing of the
     rest of the slice), so it is already a sub-slice. Gains: nearly every ❌ FSD
     conflict from relay-3 vanishes, so `@x`, waiting for #225 and the
     spores/perches lifts (variants а/б/в) are moot; outside consumers keep the
     slice's `index.ts`; recursion and significance (ΔQ on the parent's graph)
     carry over, so the report can check both ways. Raised five costs: Steiger
     `fsd/no-reserved-folder-names` on `<sub>/ui/` (options: flat sub-slice,
     segmented plus an exemption, Steiger per sub-root); telling a sub-slice from
     a segment; sibling sub-slices sharing a helper; "worm in mushroom" hiding a
     second noun; a new `boundaries` element. Suggested a trial on
     `blog/entities/document` → `prose/`, asked this-branch-or-separate, noted
     the ΔQ float bug should be fixed with integer edge counts, not an epsilon.

3. **Operator:** «> Только рекурсивные тут слайсы, а не приложения / так я и
   сказал, multi-app recursive slices (ну или multi-app recursive sliced design)
   / > Для Steiger папка entities/mushroom/drawing/ — это сегмент drawing. Тогда
   drawing/ui/ в нём ловит fsd/no-reserved-folder-names, / мне нравился вариант
   "подслайс" потому что его легко преобразовать в отдельный слайс если,
   например, мы выясним, что какой-то внешний потребитель пользуется
   "надслайсом" только ради этого "подслайса", и тогда последний, получается,
   заслуживает собственное место снаружи (и одним слоем ниже чтобы надслайс мог
   его импортировать). но тут много критериев и эдж-кейсов, поэтому пока туда не
   смотрел. посмотри по существующим кандидатам, какой вариант (слайсовый,
   плоский, или разбитый но как-то по-другому) больше подходит? / > Как отличить
   подслайс от сегмента / а зачем их отличать? api работы с ними же не
   изменяется? или изменяется? / > Соседние подслайсы. Если двум подслайсам
   нужен общий хелпер, а подслайсу запрещено брать что-либо у родителя, хелпер
   может жить только уровнем ниже. / #225 работает над этим, но если кратко:
   внутри слайса будет фиксированный, сугубо восходящий (или нисходящий, всё
   время путаю) порядок импортов. пока можно "на глаз" / > Червяк в грибе. … /
   а что плохого в червяке внутри гриба (прямо как в жизни)? / > Проводка. В
   boundaries нужен новый тип элемента: снаружи подслайса — только через его
   бочку / я бы вообще просто сделал: любое не из стандартного набора сегментов
   -- через бочку»
   - Agent's last reply. (verbatim in Last agent turn)

## Intent

The operator wants clusters the report finds to become **sub-slices inside
their slice** — a folder shaped like a slice, with its own segments and barrel —
rather than moves to other slices or layers. The name is **MARS**: "multi-app
recursive slices" / "multi-app recursive sliced design". A sub-slice is
**promoted** to a slice of its own (one layer lower, so the parent can import
it) when an outside consumer turns out to use the parent only for that
sub-slice; the operator has not worked out promotion's criteria and edge cases
yet. Ordering among siblings inside a slice is #225's business; "на глаз" until
then.

## Decisions

- **Slice-shaped sub-slices, not flat** (the agent's recommendation, not yet
  confirmed): of the 18 candidates at ≥ 3 files and ΔQ ≥ 0.1, 11 span two
  segments or more (mushroom drawing 5 model + 8 ui, `air-spots` 7 + 2, player 7
  model, blind-test 3 + 1, whisper typewriter i18n + model + ui), and the
  mushrooms slices' `index.node-safe.ts` / `index.test-only.ts` export files
  from inside those clusters, from both `model` and `ui`, so a sub-slice needs
  its own barrels anyway. The 7 single-segment ones could be a folder inside a
  segment (`ui/backdrop/`, legal today), rejected as a second kind of sub-slice
  that does not promote by a plain move.
- **No marker distinguishing sub-slice from segment** — the operator's rule:
  anything not in the standard segment set is entered through its barrel. On the
  current tree only four `i18n/` (already entered as `../i18n` everywhere) and
  `mushrooms/pages/mushrooms/reference/` (one `.webp`, no code) are
  non-standard. The one place the set matters besides `boundaries` is
  significance: a one-file `i18n` has ΔQ < 0, so the agent proposed adding
  `i18n` to the standard set.
- **"Worm in mushroom" is not a rule** — the agent withdrew it: the earlier cut
  was rejected because the worm was smeared across the mushroom entity and a
  page file, not for nesting. A nested noun is fine; promotion is the operator's
  consumer criterion.
- **Note for #225**: a report cluster imports nothing from the rest of its
  slice, so in the in-slice import order a sub-slice sits below everything,
  `lib` included.
- **Terms**: "sub-slice" / «подслайс», "parent" / «надслайс», "promotion" —
  sub-slice → own slice one layer lower; "standard segment set" — `ui`,
  `model`, `lib`, `api`, `config` (plus `i18n` if adopted).

## Errors and dead ends

- The agent first called MARS's recursion "slices, not apps" as if correcting
  the name; the operator pointed out the name already says recursive slices.
- **Trial (uncommitted, reverted)**: moved `prose-content`, `content-link`,
  `content-video` to `src/blog/entities/document/prose/ui/` with
  `prose/index.ts`. Steiger: exactly one error, `fsd/no-reserved-folder-names`
  on `prose/ui`. `check:masd`, `tsc`: clean. ESLint: only
  `simple-import-sort/exports`. A deliberate bypass import
  (`../prose/ui/content-link` from `ui/source-list.tsx`) passed ESLint —
  `boundaries` treats a slice as one element, so the barrel rule is new work.

## State

- Branch `claude/masd-slice-clusters-q7r4tm`, draft PR #228 "chore: acyclic
  src/ under a madge gate, and a slice cluster report", `CONFLICTING` with
  `main` (left for `/finalize`). Head before this summary: `e87a006`.
- Plan: `docs/plans/masd-slice-clusters.paused.md`, unchanged this session.
- Nothing running: no CI, subscription or check-in; keepalive stopped by the
  park.
- This session's estimate: 1.5 h senior architect (the MARS analysis and
  trial). Remainder handed on: MARS itself, unsized until the operator picks
  this-branch-or-separate.

## Pointers

- `scripts/masd-clusters.ts` — the report (`pnpm masd:clusters`); the ΔQ float
  bug (`mushrooms/entities/mouse` pair `5.6e-17`) is still there, filter at the
  `gain > 0` line.
- `steiger.config.mjs` — where a `no-reserved-folder-names` exemption would go.
- `eslint/masd-boundaries.ts`, `eslint/masd-graph.ts` (`PUBLIC_API`) — where the
  sub-slice barrel rule would go.
- `docs/masd.md`, `.claude/rules/masd.md` — both would change for MARS.
- `node_modules/@feature-sliced/steiger-plugin/dist/index.js` around
  `noReservedFolderNames` — the rule's code.
- `relay-3.md` and earlier beside this file; relay-3 holds the move analysis
  MARS supersedes.
- Predecessor's transcript: https://claude.ai/code/session_01DaohkDptLrsH2R2jWY9JZJ
- This session's transcript:
  https://claude.ai/code/session_01DaohkCcNFQKo8oG38wbeLV

## Next step

Wait for the operator's answers to the last reply's two questions: (1) turn off
`fsd/no-reserved-folder-names` — a suppression, needs their explicit yes; (2)
MARS as the next bite on this branch or a separate task after it (the agent
leaned separate, with a plan). Also open: whether `i18n` joins the standard
segment set.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, по существующим кандидатам лучше всего подходит **подслайс в форме слайса**: свои `ui/`, `model/`, `lib/` и свои бочки. Плоский вариант годится только для части кандидатов и ломается ровно на тех, ради которых всё затевалось. Его повышение до слайса, о котором ты говоришь, — это один `git mv` уровнем ниже, без перекройки.

**Почему не плоский, по цифрам.** Кандидатов, у которых ≥ 3 файла и ΔQ ≥ 0.1, восемнадцать:
- **11 из 18 захватывают два сегмента или больше.** Самые крупные: рисование гриба (5 файлов `model` + 8 `ui`), `air-spots` (7 + 2), плеер (7 `model`), `blind-test` (3 + 1), машинка шёпота (`i18n` + `model` + `ui`). Если их сделать плоскими, потеряется граница `ui`/`model`, а она в этих слайсах значима.
- **Бочки там тоже на двух осях.** У гриба, насекомого, `insects-fly` и `grow-mushroom` кроме `index.ts` есть `index.node-safe.ts` и `index.test-only.ts`. Они экспортируют файлы прямо из этих кластеров, и из `model`, и из `ui` (`mushroom-genes`, `mushroom-pose`, `mushroom-light`…). Значит, подслайсу всё равно нужен свой набор бочек, то есть по форме он уже слайс.
- **Остальные 7 лежат в одном сегменте** (`prose`, `article-page`, `paint-backdrop`, `instrument`, `work-section`, `mushroom-room`; станция плеера целиком в `model`). Им подошла бы и папка внутри сегмента (`ui/backdrop/`), FSD это разрешает уже сейчас. Но тогда видов подслайса станет два, а повышение до слайса уже не будет просто переездом. Я бы делал одну форму на всех, даже если внутри один сегмент.

**Пробный прогон** (без коммита, уже откатил): `prose-content`, `content-link`, `content-video` перенёс в `entities/document/prose/ui/` и добавил `prose/index.ts`.
- **Steiger** выдал ровно одну ошибку, ту самую `no-reserved-folder-names` на `prose/ui`. Больше ничего. Его можно выключить, потому что правило запрещает в точности то, что делает MARS. Но это отключение правила, поэтому нужно твоё явное «да». В конфиге будет комментарий: «папка внутри слайса, в которой лежат сегменты, — это подслайс».
- **`check:masd`, `tsc`** — чисто. ESLint попросил только пересортировать экспорты.
- **`boundaries` бочку не охраняет.** Я подложил импорт `../prose/ui/content-link` в обход бочки, и он прошёл без ошибок: внутри слайса сейчас разрешено всё. Значит, твоё правило нужно писать с нуля.

**Как отличить подслайс от сегмента: для импортов незачем, твоё правило «всё нестандартное — через бочку» эту задачу снимает.** На нынешнем дереве оно ничего не ломает. Нестандартных сегментов в слайсах всего пять:
- четыре `i18n/`, и их уже везде импортируют через `../i18n`. Фактически это первые подслайсы MARS;
- `pages/mushrooms/reference/`, в котором одна картинка и нет кода.

Различать придётся только в одном месте: в проверке значимости. Однофайловый `i18n` внутренних рёбер не имеет, его ΔQ будет отрицательной, и проверка объявит его лишним. Проще всего записать `i18n` в стандартный набор, тогда тот же список будет нужен и `boundaries`, и проверке значимости.

**Червяк в грибе. Я был неправ, правилом это не нужно.** Прошлый разрез отвергли не за то, что червяк лежал внутри гриба. Половина червяка лежала в сущности гриба, а `house-worm.ts` — на странице: разрез повторял, как был сшит код, и одно существительное оказалось размазано по двум местам. В MARS червяк целиком внутри гриба — это нормально, прямо как в жизни. Выносить его стоит тогда, когда кому-то снаружи понадобится червяк без гриба. Это и есть твой критерий повышения: внешний потребитель берёт у надслайса только подслайс. Так что пункт 4 я снимаю.

**Соседи — на глаз, понял.** Одна заметка для #225: кластер из отчёта по построению ничего не импортирует из остального слайса. Значит, в порядке импортов внутри слайса подслайс стоит ниже всего, даже ниже `lib`.

**Нужно от тебя:**
1. Выключаем `fsd/no-reserved-folder-names`?
2. Делаем MARS следующим куском этой ветки или отдельной задачей после неё? Задача заметная: правило в `boundaries`, значимость подслайсов в `check:masd`, отчёт с вердиктом «подслайс / вынос / шум», правки обоих `masd.md`, переименование в MARS. Ветка и так несёт две части. Я бы делал отдельно, с планом, но решать тебе.
```
