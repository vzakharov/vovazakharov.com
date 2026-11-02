# PR #228: chore: sub-slices inside a slice under check:masd, on an acyclic src/

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/228
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/masd-slice-clusters-q7r4tm
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-28T08:41:34Z
- **Updated:** 2026-11-02T02:32:28Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 5

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at c07bdd7). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `scripts/masd-clusters.ts`:125 — unresolved — last: @vzakharov (human) 2026-10-29T09:36:59Z — "дождёмся результатов этого прогона, потом решим" → [↓](#t01)
- **T02** `src/vova/pages/cv/sheet/frame/ui/cv.module.scss`:23 — unresolved — last: @vzakharov (human) 2026-10-29T15:08:33Z — "переживём пока" → [↓](#t02)
- **T03** `src/vova/pages/cv/sheet/frame/index.ts`:2 — unresolved — last: @vzakharov (human) 2026-10-29T15:08:55Z — "тоже переживём" → [↓](#t03)
- **T04** `scripts/lib/sub-slices.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T15:18:32Z — "надо сплиттить" → [↓](#t04)
- **R03** review by @vzakharov (human) — 2026-10-29T11:52:38Z → [↓](#r03)

---

## Body

## Summary

- **A slice can hold sub-slices (MARS), and `check:masd` guards them.** A sub-slice is any folder in a slice or a sub-slice not named for one of FSD's five segments; outside it, code enters by its barrels (`vova/sub-slice-entry`). A sub-slice is earned by raising its parent's modularity or by two siblings importing it, and never sits beside a segment or module. A consumer taking only one sub-slice's exports is a promotion error (a head importing every sibling excepted), whose message lists the layers the sub-slice may move to; `// masd-disable promotion -- <why>` is the operator-approved escape. Steiger's `no-reserved-folder-names` is off in the sliced layers, and `forbidden-imports` and `no-segmentless-slices` off in exactly the slices holding sub-slices, which `check:masd` covers instead. A slice's catalogue moved to `config/i18n`.
- **`pnpm masd:clusters` is a gate, and vet runs it.** A candidate is a dominator subtree of a unit's import DAG — one door, its root — of at least two non-barrel files; the gate prints what each takes from the rest as a sub-slice below both, and exits 1 while it prints. `// masd-disable cluster -- <why>` keeps one, on the operator's yes. It now holds no cluster in 85 units.
- **The clusters are cut.** blog's documents page into `pages/article` (`page/` + `print/`) and `pages/collection-index`; vova home into `page/` + `work/`; the CV's edition promoted to `vova/entities/cv`, and the CV page into `route/` + `sheet/`, the sheet into `page/`, `full/`, `profile/` and the `frame/` both take; maya whisper into route/screen/metadata + `typewriter/`; the player into `playback/` (controls/bar/context/audio/setting) + `station/`; insects-fly into `flight/` (air/swarm/route) + `perch/`; the mushroom into `fungus/` (figure/dome/body) + `house/`; the map into view/ground/frame; `mice-run` into `runs/` + `runner/`. Moves only, no behaviour change; stylesheets split by consumer.
- **`src/` has no import cycles, and vet keeps it so.** `pnpm check:cycles` runs madge over `src/`, type-only imports counted. The 18 cycles it found were each a type or hook declared in the wrong file, moved to a file of its own or to its one reader.
- **`docs/masd.md` is retired**: the staged `.claude/rules/masd.md` carries what every edit under `src/` needs, `scripts/masd-check.README.md` the checkers' reasons, #232 and #233 the open directions. The plan is `docs/plans/masd-slice-clusters.paused.md`.

## QA Checklist

- [ ] `cycles-gate` — `pnpm check:cycles` prints "No circular dependency found!" and exits 0.
- [ ] `masd-check` — `pnpm check:masd` exits 0.
- [ ] `clusters` — `pnpm masd:clusters` prints "0 of 85 slices and sub-slices hold a cluster." and exits 0.
- [ ] `lint-fsd` — `pnpm lint:fsd` passes on every app root.
- [ ] `promotion` — `node --import tsx --test scripts/masd-check.test.ts`: the sub-slice cases pass, the nested one and the layer listing included.
- [ ] `sub-slice-entry` — import `../../work/ui/work-section` from `src/vova/pages/home/page/ui/home-page.tsx`; ESLint reports `vova/sub-slice-entry`. Revert.
- [ ] `cv` — open `/cv`, `/cv/cto` and the profile subpage in both locales: each renders as before, print preview included (the contact line and the email print at their own size, not the body's 9pt).
- [ ] `pages` — open a case study, a Bible article, a basilisk case and the case-studies index: each renders as before, print preview included.
- [ ] `home` — `/` on vovazakharov.com: the work section with its project cards renders as before.
- [ ] `whisper` — the whisper page on mayawonders.com types as before.
- [ ] `meadow` — open `/mushrooms`: mushrooms draw and select, insects fly, perch and shelter in rain.
- [ ] `player` — on `/music`, play a song: play/pause, seek, the radio toggle and the media keys work; the blind test plays.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `cycles-gate` | yes | yes | vet runs it |
| `masd-check` | yes | yes | vet runs it and `masd-check.test.ts` |
| `clusters` | yes | yes | vet runs it; `masd-clusters.test.ts` pins the shape |
| `lint-fsd` | yes | yes | vet runs it |
| `promotion` | yes | yes | `masd-check.test.ts` |
| `sub-slice-entry` | yes | yes | `sub-slice-entry.test.ts` |
| `cv` | partly | partly | build renders every route; the look and print are manual |
| `pages` | partly | partly | build renders every route; the look is manual |
| `home` | no | no | moves only |
| `whisper` | partly | partly | `listening-post.test.ts` moved with the typewriter |
| `meadow` | partly | partly | the game's tests (`VET_MEADOW=1`) cover the model |
| `player` | partly | partly | the station's reducer tests moved with it |

https://claude.ai/code/session_01DaohkFjE5k2mZsypSbXfxP
https://claude.ai/code/session_01DaohkDptLrsH2R2jWY9JZJ
https://claude.ai/code/session_01DaohkDnoakgX1SC8nKZLvV
https://claude.ai/code/session_01DaohkEEZdDsfAqNgtnGpHh

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-28T08:41:55Z — "Proposed squash body: ``` A cluster inside one slice that ea…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-10-29T09:35:29Z — "**Вопрос: что делать с шестью находками гейта кластеров?** `…" → [↓](#c02)
- **C03** @vzakharov (agent) — 2026-10-29T09:58:14Z — "**Вопрос: что делать с кластером, который импортирует общие…" → [↓](#c03)
- **C04** @vzakharov (agent) — 2026-10-29T11:02:30Z — "В сессии: «ну так вынести рамку … выносим если любое из: (а)…" → [↓](#c04)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-28T08:41:55Z

[https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6464532950](https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6464532950)

Proposed squash body:

```
A cluster inside one slice that earns a module of its own is the
converse of check:masd's significance by modularity. This lands its
answer: such a cluster becomes a sub-slice, a slice nested in a slice,
and the checkers hold sub-slices as they hold slices.

A sub-slice is any folder in a slice or sub-slice not named for one
of FSD's five segments (a slice's catalogue is now config/i18n), and
code outside it enters by its barrels (vova/sub-slice-entry). It is
earned by raising its parent's modularity or by two siblings importing
it, and never sits beside a segment. A consumer taking only one
sub-slice's exports is a promotion error naming the layers it may move
to, with an operator-approved "masd-disable promotion" escape. Steiger
rules check:masd covers are off where sub-slices live.

pnpm masd:clusters is a vet gate: a dominator subtree of a unit's
import DAG, two non-barrel files or more, is a cluster to cut, what it
takes from the rest becoming a sub-slice below both. Every cluster is
cut, the CV's edition promoted to vova/entities/cv and stylesheets
split by consumer; no behaviour changes. pnpm check:cycles holds src/
acyclic under madge, each of the 18 cycles found a type or hook
declared in the wrong file. docs/masd.md is retired into the MASD rule
and scripts/masd-check.README.md.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (agent) on 2026-10-29T09:35:29Z

[https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6493151347](https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6493151347)

**Вопрос: что делать с шестью находками гейта кластеров?**

`pnpm masd:clusters` теперь гейт, и он падает на шести местах. Пока они не решены, vet красный. Каждое — либо режем в подслайс, либо оставляем с `// masd-disable cluster -- <почему>` на твоё «да».

Четыре из шести — это файл и его единственный помощник:

| Где | Кластер | ΔQ |
|---|---|---|
| `blog/pages/article` | `print-sheet` + `printed-from` | 0.22 |
| `mushrooms/entities/mushroom/fungus` | `paint-dome` + `porcini-margin` | 0.017 |
| `mushrooms/features/insects-fly/flight` | `insects` + `pollen` | 0.0095 |
| `mushrooms/widgets/map` | `draw-map-ground` + `map-ground` | 0.068 |

Ещё два похожи на модули:

| Где | Кластер | ΔQ |
|---|---|---|
| `mushrooms/features/mice-run` | `runner-shown`, `run-front`, `run-ends` (3 файла) | 0.25 |
| `vova/pages/cv` | `cv-page` и всё под ним (13 из 21 файла) | 0.11 |

**Предлагаю:** кластер должен быть не меньше трёх файлов. Пара — это файл с помощником, а не модуль, и папка ради двух файлов ничего не проясняет. Тот же порог стоит применить к значимости подслайса, чтобы гейт и `check:masd` мерили одинаково. Тогда остаются `mice-run` и `cv`, и их я бы резал.

Согласен? Если да, ставлю порог и режу эти два. Если какую-то пару хочешь видеть подслайсом или какой-то из двух оставить, скажи какую.

---

<a id="c03"></a>

### Comment by @vzakharov (agent) on 2026-10-29T09:58:14Z

[https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6493616445](https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6493616445)

**Вопрос: что делать с кластером, который импортирует общие файлы из остатка модуля?**

После перестройки пяти модулей гейт кластеров показывает девять кандидатов в восьми модулях (двое новых, `whisper/page` и `player/playback`, появились из-за самих перестроек). Семь из девяти импортируют общие файлы из остального модуля. Например, `fungus`'овский `paint-dome` берёт `mushroom-paint`, `mushroom-tints` и ещё четыре файла, а `cv-page` берёт `cv-urls` и `cv-messages`.

По правилу «только подслайсы» остаток при разрезе становится соседним подслайсом. Тогда кластер импортирует остаток (общие файлы), остаток импортирует кластер (его корень), и получается цикл, который `check:masd` теперь запрещает. Чисто режутся только два: `print-sheet` в статье и `runner-shown` в `mice-run`.

Варианты:

1. **Гейт требует только разрезы, которые вырезаются как есть**: кластер, кроме одной двери внутрь, ничего не импортирует из остального модуля. Это та же мысль, что в T03: «гейт должен требовать только такие разрезы, которые вырезаются как есть». Остаются `print-sheet` и `runner-shown`, остальные семь гейт перестаёт требовать.
2. **Разрез делит остаток на «над» и «под»**: общие файлы, которые берёт кластер, уходят в третий подслайс ниже обоих. Так честнее для `cv-page` (13 файлов), но гейт не может предложить этот разрез сам, и каждый раз нужно решать, что куда.

**Советую 1.** Гейт, требующий того, чего он сам не умеет описать, — это опять подавления на каждом шагу. А второй вариант можно делать руками там, где разрез очевиден, как у `cv`.

---

<a id="c04"></a>

### Comment by @vzakharov (agent) on 2026-10-29T11:02:30Z

[https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6494909673](https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6494909673)

В сессии: «ну так вынести рамку … выносим если любое из: (а) модулярность, (б) нужно двум потребителям», и на «гейт предложить не умеет» — «агент тоже может».

Сделано так:
- `check:masd` засчитывает подслайс, если он поднимает модулярность **или** его импортируют двое соседей. Когда один из двоих перестаёт его брать, проверка снова требует влить его обратно (7f2eb7c).
- Гейт сам печатает под каждым кластером, что тот берёт из остатка, то есть третий подслайс ниже обоих (7f2eb7c, 5f3ece7).
- Разрезаны на три части и больше: map (02d6bb3), полёт насекомых (1a09838), fungus (14d8744), страница whisper (c7b85d6), playback (757d3e3).

Поправка к комментарию выше: семь из девяти было неверно, `cv-page` режется без цикла. Но у CV своя загвоздка: после разреза sitemap берёт из CV только `cvRoutes` из `edition/`, и срабатывает правило продвижения. Куда продвигать, спрошу отдельно.

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-10-28T10:01:46Z_

[https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5680838786](https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5680838786)

**/five-percent**: одно предложение, критических нет.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

<!-- five-percent: af252300a10fbeb2df461020f34a62761d55ea3e -->

<a id="r02"></a>

### R02 — Review by @vzakharov (agent) — COMMENTED

_2026-10-28T11:20:22Z_

[https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5681787280](https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5681787280)

**/five-percent**: два предложения, критических нет.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

<!-- five-percent: 20abdc0e6d46b60fe46a64cea8c1e0af3984a9b2 -->

<a id="r03"></a>

### R03 — Review by @vzakharov (human) — COMMENTED

_2026-10-29T11:52:38Z_

[https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5697218979](https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5697218979)

**/five-percent**: 2 предложения, критичных нет.

<!-- five-percent: ee969159c3a246b700f15a794cd698ad7805c988 -->

_12 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `scripts/masd-clusters.ts`:125 — unresolved — last: @vzakharov (human) 2026-10-29T09:36:59Z — "дождёмся результатов этого прогона, потом решим" → [↓](#t01)
- **T02** `src/vova/pages/cv/sheet/frame/ui/cv.module.scss`:23 — unresolved — last: @vzakharov (human) 2026-10-29T15:08:33Z — "переживём пока" → [↓](#t02)
- **T03** `src/vova/pages/cv/sheet/frame/index.ts`:2 — unresolved — last: @vzakharov (human) 2026-10-29T15:08:55Z — "тоже переживём" → [↓](#t03)
- **T04** `scripts/lib/sub-slices.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T15:18:32Z — "надо сплиттить" → [↓](#t04)

<a id="t01"></a>

### `scripts/masd-clusters.ts`:125 — unresolved

```diff
@@ -0,0 +1,190 @@
… 116 lines elided …
+  const candidates: Cluster[] = [];
+  for (const root of members) {
+    if (doors.has(root)) continue;
+    const closure = new Set<string>();
+    const stack = [root];
+    for (let file = stack.pop(); file !== undefined; file = stack.pop()) {
+      if (closure.has(file)) continue;
+      closure.add(file);
+      stack.push(...below(file));
```

**@vzakharov (agent)** — 2026-10-28T11:20:18Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

В кластер попадают и общие файлы, нужные всему слайсу, — поэтому «кластером» выходит, например, весь интерфейс страницы.

**Предлагаю: искать кластеры как куски с одним-единственным входом, а не как «всё, до чего дотягивается файл».**

Цена: переписать отбор кандидатов и тесты.

<details><summary>Подробнее</summary>

Кандидат — нисходящее замыкание файла, хотя план в «Eaten so far» остановился на поддеревьях доминаторов, и причина смены нигде не записана. Шум план называет сам: «весь UI-дерево страницы от главного компонента» (`control-actions` ×14). Поддерево доминатора — ровно то, что выносится за одну дверь: ни один файл в нём не нужен снаружи, кроме как через корень. ΔQ по поддеревьям доминаторов: спайк `dominators.ts` их уже строил, один топологический проход по DAG, который бита 1 сделала ацикличным; замыкания остаются запасным режимом, если поддеревьев окажется мало. Кластеры с двумя дверями («Rest of the elephant») не войдут ни в тот, ни в другой режим.

</details>

**@vzakharov (human)** — 2026-10-29T08:45:23Z

не понимаю, объясни проще. Ещё, черипикни правку скилла пятипроцентника из #229

**@vzakharov (agent)** — 2026-10-29T09:09:12Z

Проще так. Сейчас кандидат в подслайс — это файл и всё, до чего он дотягивается. Если среди этого есть файл, нужный ещё кому-то в слайсе (общий тип, хелпер), кандидат его всё равно забирает. Вырезать такой кандидат как есть нельзя: соседям придётся лезть в подслайс за общим файлом. Предложение было брать только то, до чего можно дойти исключительно через этот файл. Тогда у кандидата одна дверь, он вырезается без хвостов, а общее остаётся снаружи.

Это правка точности: лишних кандидатов станет меньше. Странность из T10 она не лечит, там кандидат и так с одной дверью (разобрал в том треде). Делать её стоит, если отчёт станет гейтом (T06): гейт должен требовать только такие разрезы, которые вырезаются как есть.

Правку скилла из #229 перенёс: 22a95ad. Файл взят из #229 целиком: #229 правит тот же блок, который `main` поменял уже после того, как от него отошла эта ветка, и частями правка не ложится.

**@vzakharov (human)** — 2026-10-29T09:36:59Z

дождёмся результатов этого прогона, потом решим

---

<a id="t02"></a>

### `src/vova/pages/cv/sheet/frame/ui/cv.module.scss`:23 — unresolved

```diff
@@ -18,8 +18,9 @@
 
   // Body copy prints a point under the sheet's default, which is what keeps the
   // CV to three pages. `:where()` leaves the specificity at this one class, so
-  // the classes below that size a paragraph of their own (the tagline, the
-  // contact line) still win on order.
+  // a class sizing a paragraph of its own still wins on order: the tagline
+  // below, and the full sheet's contact line, whose stylesheet its component
+  // imports after this one.
```

**@vzakharov (agent)** — 2026-10-29T11:52:38Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

Сейчас: печатный размер почты, диплома и строки контактов перебивает 9pt рамки только потому, что `cv-sheet.module.scss` подключается после `cv.module.scss`.
**Предлагаю: держать классы, которые спорят с этим 9pt, в одном файле с ним — в `frame`, — чтобы победа решалась порядком внутри файла.**
Цена: в `frame` лягут два класса (`printSmall`, `contactLine`), которые читает только `full`.

<details><summary>Подробнее</summary>

До af2dda5 `.page :where(p, ul, ol, li)` и `.printSmall` / `.contactLine` стояли в одном `cv.module.scss`, и порядок был порядком строк. После разреза у них одинаковая специфичность (один класс), а порядок задаёт очерёдность импортов в `cv-sheet.tsx` (`../../frame` раньше `./cv-sheet.module.scss`) — то есть то, как Next склеит CSS-чанки в продакшене. Сбой не виден ни в сборке, ни в vet: PDF просто напечатается мельче (14px → 9pt у `printSmall`). Комментарий в `cv.module.scss` теперь называет эту зависимость, но не убирает её.

</details>

**@vzakharov (human)** — 2026-10-29T15:08:33Z

переживём пока

---

<a id="t03"></a>

### `src/vova/pages/cv/sheet/frame/index.ts`:2 — unresolved

```diff
@@ -0,0 +1,4 @@
+export { CASE_STUDY_KEY, CaseStudyLink } from './ui/case-study-link';
+export { default as CV_CLASSES } from './ui/cv.module.scss';
```

**@vzakharov (agent)** — 2026-10-29T11:52:38Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

Сейчас: публичный API `frame` — сам объект CSS-модуля `CV_CLASSES`, и `full` с `profile` берут из него 13 классов по строковым ключам.
**Предлагаю: `frame` экспортирует компоненты (`CvTagline`, `CvAside`, приглушённый `Text`…), а стили остаются его внутренностью.**
Цена: несколько тонких обёрток над `Text` в `frame/ui` и правка их вызовов в `full` и `profile`.

<details><summary>Подробнее</summary>

Ключи — `dim60`…`dim90`, `small`, `tight`, `tightHeading`, `tagline`, `section`, `sectionWide`, `subheading`, `screenFooter`, `bullets`. Опечатка в ключе типизатор не ловит (`CV_CLASSES['tagine']` — просто `undefined`), а переименование класса в `cv.module.scss` ломает соседний под-слайс молча. Компонент в баррели делает границу под-слайса той же, что у остальных: имена, которые проверяет TypeScript.

</details>

**@vzakharov (human)** — 2026-10-29T15:08:55Z

тоже переживём

---

<a id="t04"></a>

### `scripts/lib/sub-slices.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T15:18:32Z

надо сплиттить

---

## Timeline (status, references, and other events)

- **2026-10-28T08:41:56Z** @vzakharov renamed from «chore: clusters inside a slice that earn a slice of their own» to «chore: report clusters inside a slice that earn a slice of their own».
- **2026-10-28T10:01:46Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5680838786.
- **2026-10-28T10:02:58Z** @vzakharov renamed from «chore: report clusters inside a slice that earn a slice of their own» to «chore: break every import cycle in src/ and gate it with madge».
- **2026-10-28T11:20:22Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5681787280.
- **2026-10-28T11:21:16Z** @vzakharov renamed from «chore: break every import cycle in src/ and gate it with madge» to «chore: acyclic src/ under a madge gate, and a slice cluster report».
- **2026-10-28T17:38:35Z** @vzakharov cross-referenced this pull request from [#229 chore: readable /five-percent proposals, and verdicts that say why](https://github.com/vzakharov/vovazakharov.com/pull/229).
- **2026-10-29T05:17:46Z** @vzakharov renamed from «chore: acyclic src/ under a madge gate, and a slice cluster report» to «chore: sub-slices inside a slice under check:masd, on an acyclic src/».
- **2026-10-29T08:57:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5694906549.
- **2026-10-29T09:37:18Z** @vzakharov cross-referenced this pull request from [#232 Cut the game's scripted plays down and turn the rest back on](https://github.com/vzakharov/vovazakharov.com/issues/232).
- **2026-10-29T09:37:19Z** @vzakharov cross-referenced this pull request from [#233 Sub-entities: a slice kind for a facet several entities share](https://github.com/vzakharov/vovazakharov.com/issues/233).
- **2026-10-29T11:21:41Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5696169051.
- **2026-10-29T11:52:38Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5697218979.
- **2026-10-29T15:21:18Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5700213818.
