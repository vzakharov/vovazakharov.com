# PR #228: chore: sub-slices inside a slice under check:masd, on an acyclic src/

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/228
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/masd-slice-clusters-q7r4tm
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-28T08:41:34Z
- **Updated:** 2026-10-29T08:57:25Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 11

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/masd.md`:108 — unresolved — last: @vzakharov (human) 2026-10-29T08:37:56Z — "я вообще не понимаю, почему у нас два дока (этот и правило)…" → [↓](#t01)
- **T02** `scripts/lib/import-graph.ts`:13 — unresolved — last: @vzakharov (human) 2026-10-28T16:42:46Z — "merge-конфликты -- последнее от чего болит голова. нет." → [↓](#t02)
- **T03** `scripts/masd-clusters.ts`:78 — unresolved — last: @vzakharov (human) 2026-10-29T08:45:23Z — "не понимаю, объясни проще. Ещё, черипикни правку скилла пяти…" → [↓](#t03)
- **T04** `eslint/rule-groups/vova.ts`:19 — unresolved — last: @vzakharov (human) 2026-10-29T08:38:46Z — "зачем здесь упоминаются boundaries? не медведь?" → [↓](#t04)
- **T05** `scripts/lib/slice-graph.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:39:37Z — "DRY по сравнению с masd-graph? или это о другом?" → [↓](#t05)
- **T06** `scripts/masd-clusters.ts`:9 — unresolved — last: @vzakharov (human) 2026-10-29T08:40:44Z — "я думаю стоит делать гейтом, а потом уже подавлять (при согл…" → [↓](#t06)
- **T07** `src/lsa/pages/lsa-home/config/i18n/index.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:51:08Z — "не уверен насчёт подпапки /i18n: по сути, мы произвольно (а…" → [↓](#t07)
- **T08** `src/mushrooms/entities/mushroom/fungus/index.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:54:35Z — "не уверен, что нравится структура, когда в слайсе одновремен…" → [↓](#t08)
- **T09** `src/mushrooms/features/insects-fly/ui/perches.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:55:50Z — "дополнительный плюс (к прошлому комментарию): возможно, посл…" → [↓](#t09)
- **T10** `src/music/pages/blind-test/ui/blind-test-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:56:48Z — "тут вообще как-то странно получилось: за пределами подслайса…" → [↓](#t10)
- **T11** `src/vova/pages/home/ui/home-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:57:20Z — "аналогично" → [↓](#t11)

---

## Body

## Summary

- **A slice can hold sub-slices (MARS), and `check:masd` guards them.** A sub-slice is any folder in a slice or a sub-slice not named for one of FSD's five segments; outside it, code enters by its barrels (`vova/sub-slice-entry`). It must raise its parent's modularity when cut off, and a consumer taking only one sub-slice's exports — from a slice, or a sibling from a sub-slice, at any depth — is a promotion error, with `// masd-disable promotion -- <why>` as the operator-approved escape. Steiger's `no-reserved-folder-names` is off in the sliced layers, `check:masd` keeping its one useful case. A slice's catalogue moved to `config/i18n`, so no sixth segment.
- **The clusters the report found are cut.** blog's documents page split into `pages/article` and `pages/collection-index` (four sites route only the article); sub-slices `work/` (vova home), `typewriter/` (maya whisper), `fungus/` (the mushroom entity, its house staying at the root), `flight/` (insects-fly), `station/` (the player), `quiz/` (blind-test); `ProseContent` moved to blog's `shared/ui`. Moves only, no behaviour change. The landscape's backdrop is not cut: it is an open question in the plan.
- **`src/` has no import cycles, and vet keeps it so.** `pnpm check:cycles` runs madge over `src/`, type-only imports counted. The 18 cycles it found were each a type or hook declared in the wrong file, moved to a file of its own or to its one reader.
- **`pnpm masd:clusters` reports cluster candidates**, recursing into sub-slices: downward closures kept when cutting them off raises modularity. A report, exit 0. `docs/masd.md` § "Sub-slices" and the staged `.claude/rules/masd.md` describe all of it; the plan is `docs/plans/masd-slice-clusters.paused.md`.

## QA Checklist

- [ ] `cycles-gate` — `pnpm check:cycles` prints "No circular dependency found!" and exits 0.
- [ ] `masd-check` — `pnpm check:masd` exits 0.
- [ ] `promotion` — `node --import tsx --test scripts/masd-check.test.ts`: the sub-slice cases pass, the nested one (a sibling taking only a sub-slice's sub-slice) included.
- [ ] `sub-slice-entry` — import `../work/ui/tech-line` from `src/vova/pages/home/ui/home-page.tsx`; ESLint reports `vova/sub-slice-entry`. Revert.
- [ ] `pages` — open a case study, a Bible article, a basilisk case and the case-studies index: each renders as before, print preview included.
- [ ] `home` — `/` on vovazakharov.com: the work section with its project cards renders as before.
- [ ] `whisper` — the whisper page on mayawonders.com types as before.
- [ ] `meadow` — open `/mushrooms`: mushrooms draw and select, insects fly, perch and shelter in rain.
- [ ] `player` — on `/music`, play a song: play/pause, seek, the radio toggle and the media keys work; the blind test plays.
- [ ] `clusters` — `pnpm masd:clusters` exits 0 and lists the sub-slices it now recurses into.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `cycles-gate` | yes | yes | vet runs it |
| `masd-check` | yes | yes | vet runs it and `masd-check.test.ts` |
| `promotion` | yes | yes | `masd-check.test.ts`, nested case included |
| `sub-slice-entry` | yes | yes | `sub-slice-entry.test.ts` |
| `pages` | partly | partly | build renders every route; the look is manual |
| `home` | no | no | moves only |
| `whisper` | partly | partly | `listening-post.test.ts` moved with the typewriter |
| `meadow` | partly | partly | the game's tests (`VET_MEADOW=1`) cover the model |
| `player` | partly | partly | the station's reducer tests moved with it |
| `clusters` | yes | partly | `masd-clusters.test.ts` pins the shape on fixtures |

https://claude.ai/code/session_01DaohkFjE5k2mZsypSbXfxP
https://claude.ai/code/session_01DaohkDptLrsH2R2jWY9JZJ
https://claude.ai/code/session_01DaohkDnoakgX1SC8nKZLvV

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-28T08:41:55Z — "Proposed squash body: ``` A cluster inside one slice that ea…" → [↓](#c01)

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
of FSD's five segments (a slice's catalogue is now config/i18n).
Outside it, code enters by its barrels (vova/sub-slice-entry). Cutting
it off its parent must raise the parent's modularity, and a consumer
taking only one sub-slice's exports, at any depth, is a promotion
error: that sub-slice belongs one level out, unless the operator
approves a "masd-disable promotion" marker where nothing but shared
could hold it. Steiger's no-reserved-folder-names is off in the sliced
layers, check:masd keeping its one useful case.

The clusters found are cut: blog's documents page splits into the
article and collection-index pages, since four sites route only the
article; vova home's work section, whisper's typewriter, the mushroom's
fungus, insects-fly's flight, the player's station and blind-test's
quiz become sub-slices. pnpm masd:clusters reports candidates, a report
rather than a gate, recursing into sub-slices.

The search reads a slice's import graph as a DAG, so pnpm check:cycles
holds src/ acyclic under madge, type-only imports counted; each of the
18 cycles it found was a type or hook declared in the wrong file, moved
to a file of its own or its one reader. No behaviour changes.

Co-authored-by: Claude <noreply@anthropic.com>
```

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

- **T01** `docs/masd.md`:108 — unresolved — last: @vzakharov (human) 2026-10-29T08:37:56Z — "я вообще не понимаю, почему у нас два дока (этот и правило)…" → [↓](#t01)
- **T02** `scripts/lib/import-graph.ts`:13 — unresolved — last: @vzakharov (human) 2026-10-28T16:42:46Z — "merge-конфликты -- последнее от чего болит голова. нет." → [↓](#t02)
- **T03** `scripts/masd-clusters.ts`:78 — unresolved — last: @vzakharov (human) 2026-10-29T08:45:23Z — "не понимаю, объясни проще. Ещё, черипикни правку скилла пяти…" → [↓](#t03)
- **T04** `eslint/rule-groups/vova.ts`:19 — unresolved — last: @vzakharov (human) 2026-10-29T08:38:46Z — "зачем здесь упоминаются boundaries? не медведь?" → [↓](#t04)
- **T05** `scripts/lib/slice-graph.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:39:37Z — "DRY по сравнению с masd-graph? или это о другом?" → [↓](#t05)
- **T06** `scripts/masd-clusters.ts`:9 — unresolved — last: @vzakharov (human) 2026-10-29T08:40:44Z — "я думаю стоит делать гейтом, а потом уже подавлять (при согл…" → [↓](#t06)
- **T07** `src/lsa/pages/lsa-home/config/i18n/index.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:51:08Z — "не уверен насчёт подпапки /i18n: по сути, мы произвольно (а…" → [↓](#t07)
- **T08** `src/mushrooms/entities/mushroom/fungus/index.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:54:35Z — "не уверен, что нравится структура, когда в слайсе одновремен…" → [↓](#t08)
- **T09** `src/mushrooms/features/insects-fly/ui/perches.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:55:50Z — "дополнительный плюс (к прошлому комментарию): возможно, посл…" → [↓](#t09)
- **T10** `src/music/pages/blind-test/ui/blind-test-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:56:48Z — "тут вообще как-то странно получилось: за пределами подслайса…" → [↓](#t10)
- **T11** `src/vova/pages/home/ui/home-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-29T08:57:20Z — "аналогично" → [↓](#t11)

<a id="t01"></a>

### `docs/masd.md`:108 — unresolved

```diff
@@ -101,7 +101,11 @@ shared block drops to, `shared/lib`, scripts, and the Next.js traps — is in
 ## The checkers
 
 Three checkers hold the model, all run by `./scripts/vet.sh`, and all read the
-graph through one loader, `eslint/masd-graph.ts`.
+graph through one loader, `eslint/masd-graph.ts`. A fourth, `pnpm check:cycles`
+(madge), holds the file-import graph under `src/` acyclic, type-only imports
+included: two files importing each other cannot go to different slices, so a
+slice's files form a DAG, which is what a search for a cluster inside one stands
+on.
```

**@vzakharov (agent)** — 2026-10-28T10:01:41Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

**Записать проверку на циклы и то, как их разрывать, в правило, которое агент видит при каждой правке src/?**
Сейчас: правило по-прежнему говорит «три проверки», а урок ветки — цикл чинят переносом типа, а не копией — останется только в плане, который удалится при финализации.
Цена: пара строк в правиле, которое грузится при каждом чтении src/.

<details><summary>Подробнее</summary>

Четвёртая проверка (`check:cycles`) записана только в `docs/masd.md` — справочник, который открывают нарочно. `.claude/rules/masd.md`, который грузится при каждом чтении файла под `src/`, говорит «Three checkers enforce what follows». На всех 18 циклах цикл означал тип или хук не в том файле и разрывался переносом объявления в свой файл или к единственному читателю, без копии с двух сторон (DRY notes плана: «A cycle broken by copying a type is the failure mode»). Тогда справочнику хватит ссылки на правило вместо своего абзаца.

</details>

**@vzakharov (human)** — 2026-10-29T08:37:56Z

я вообще не понимаю, почему у нас два дока (этот и правило) об одном и том же? раздел "DRY notes" как будто бы даже намекает, что когда-то это было планом (который забыли вычистить?)

(во второй раз мета-ирония: агент-пятипроцентник нашёл место, но не нашёл почему оно подходит под пятипроцентник)

---

<a id="t02"></a>

### `scripts/lib/import-graph.ts`:13 — unresolved

```diff
@@ -0,0 +1,54 @@
… 9 lines elided …
+const SOURCE = /\.tsx?$/;
+
+/** Every `.ts`/`.tsx` file under `directory`, at any depth. */
+const walk = (directory: string): string[] =>
```

**@vzakharov (agent)** — 2026-10-28T11:20:13Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

Ветка взяла за данность, что копия `scripts/lib/import-graph.ts` из #227 даст при слиянии «почти no-op» (так сказано в теле c009274). Но оба PR *добавляют* этот файл, а он отличается — здесь `walk` без `export` (иначе knip), и шапка не называет `check:poison`, — так что кто бы ни влился вторым, получит add/add-конфликт на весь файл, а не на строку. `masd-check.ts` при этом совпадает побайтно и сольётся чисто. → Поставить #228 поверх #227 (база — `poison-check`, после его мерджа GitHub сам перенацелит на `main`) и взять файл оттуда как есть, без копии. Цена: #228 ждёт #227 и наследует его очередь ревью; взамен файл живёт в одном PR, и расходиться ему негде.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

**@vzakharov (human)** — 2026-10-28T16:42:46Z

merge-конфликты -- последнее от чего болит голова. нет.

---

<a id="t03"></a>

### `scripts/masd-clusters.ts`:78 — unresolved

```diff
@@ -0,0 +1,190 @@
… 69 lines elided …
+      if (resolved === undefined) continue;
+      const imported = sourceFile(resolved);
+      if (imported !== undefined && imported !== file && !isTest(imported)) {
+        targets.add(imported);
+      }
+    }
+    imports.set(file, targets);
+  }
+  return imports;
… 47 lines elided …
```

**@vzakharov (agent)** — 2026-10-28T11:20:18Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

**Искать кластеры как куски с одним-единственным входом, а не как «всё, до чего дотягивается файл»?**
Сейчас: в кластер попадают и общие файлы, нужные всему слайсу, — поэтому «кластером» выходит, например, весь интерфейс страницы.
Цена: переписать отбор кандидатов и тесты.

<details><summary>Подробнее</summary>

Кандидат — нисходящее замыкание файла, хотя план в «Eaten so far» остановился на поддеревьях доминаторов, и причина смены нигде не записана. Шум план называет сам: «весь UI-дерево страницы от главного компонента» (`control-actions` ×14). Поддерево доминатора — ровно то, что выносится за одну дверь: ни один файл в нём не нужен снаружи, кроме как через корень. ΔQ по поддеревьям доминаторов: спайк `dominators.ts` их уже строил, один топологический проход по DAG, который бита 1 сделала ацикличным; замыкания остаются запасным режимом, если поддеревьев окажется мало. Кластеры с двумя дверями («Rest of the elephant») не войдут ни в тот, ни в другой режим.

</details>

**@vzakharov (human)** — 2026-10-29T08:45:23Z

не понимаю, объясни проще. Ещё, черипикни правку скилла пятипроцентника из #229

---

<a id="t04"></a>

### `eslint/rule-groups/vova.ts`:19 — unresolved

```diff
@@ -16,6 +16,7 @@ export const vovaRules = {
     'vova/no-redundant-property-copy', // prefer destructuring over key: source.key
     'vova/no-redundant-type-alias', // `type A = B` that just renames another named type is a leftover — use B directly and delete the alias
     'vova/no-relative-escape', // a relative import under src/ stays in its slice, segmented layer or app scripts — past that, the `@/` path
+    'vova/sub-slice-entry', // inside a slice, what sits outside a sub-slice enters it through its barrel, since boundaries reads the slice as one element
```

**@vzakharov (human)** — 2026-10-29T08:38:46Z

зачем здесь упоминаются boundaries? не медведь?

---

<a id="t05"></a>

### `scripts/lib/slice-graph.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T08:39:37Z

DRY по сравнению с masd-graph? или это о другом?

---

<a id="t06"></a>

### `scripts/masd-clusters.ts`:9 — unresolved

```diff
@@ -0,0 +1,150 @@
… 5 lines elided …
+ *
+ *   pnpm masd:clusters
+ *
+ * A report, never a gate: it exits 0 whatever it prints. A candidate is a
```

**@vzakharov (human)** — 2026-10-29T08:40:44Z

я думаю стоит делать гейтом, а потом уже подавлять (при согласии оператора). Иначе это получается про warnings are useless

---

<a id="t07"></a>

### `src/lsa/pages/lsa-home/config/i18n/index.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T08:51:08Z

не уверен насчёт подпапки /i18n: по сути, мы произвольно (а не на основе наших же детерминистических определялок) говорим "i18n будет отдельным подслайсом в config/". А зачем? Почему бочка не может сидеть просто в config/ ? (При этом я не против чтобы она импортировала сами джсоны из подпапки -- это, я так понимаю, не будет никак относиться к нашей модулярности, потому что json-ы мы вообще не учитываем)

реальный юс-кейс для i18n будет, если например для какого-то слайса нам понадобится какая-то хитровывернутая механика локализации, и наши же детерминистические проверки скажут "знаете, вот этот i18n -- это уже отдельный слайс"

---

<a id="t08"></a>

### `src/mushrooms/entities/mushroom/fungus/index.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T08:54:35Z

не уверен, что нравится структура, когда в слайсе одновременно *и* сегменты, *и* подслайсы. Может, если появляются подслайсы, остальные (не вынесенные в подслайсы) сегменты выносить в какой-то "базовый/дефолтный/родной" (имя посоветуй ты) подслайс? собственно может даже и не нужно стандартного имени; просто, если есть хотя бы один подслайс, слайс должен состоятть *только* из подслайсов, а как их именовать уже на усмотрение.

---

<a id="t09"></a>

### `src/mushrooms/features/insects-fly/ui/perches.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T08:55:50Z

дополнительный плюс (к прошлому комментарию): возможно, после этого мы поймём, что оставшееся (как здесь -- перч) тоже используется потребителями вне слайса в режиме "нужно только это", и тогда это будет повод вынести уже перч в отдельный слайс

---

<a id="t10"></a>

### `src/music/pages/blind-test/ui/blind-test-page.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T08:56:48Z

тут вообще как-то странно получилось: за пределами подслайса оказался один модуль.

вручную это править не надо, надо понять откуда такой (mis-?)behavior

---

<a id="t11"></a>

### `src/vova/pages/home/ui/home-page.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T08:57:20Z

аналогично

---

## Timeline (status, references, and other events)

- **2026-10-28T08:41:56Z** @vzakharov renamed from «chore: clusters inside a slice that earn a slice of their own» to «chore: report clusters inside a slice that earn a slice of their own».
- **2026-10-28T10:01:46Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5680838786.
- **2026-10-28T10:02:58Z** @vzakharov renamed from «chore: report clusters inside a slice that earn a slice of their own» to «chore: break every import cycle in src/ and gate it with madge».
- **2026-10-28T11:20:22Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5681787280.
- **2026-10-28T11:21:16Z** @vzakharov renamed from «chore: break every import cycle in src/ and gate it with madge» to «chore: acyclic src/ under a madge gate, and a slice cluster report».
- **2026-10-28T17:38:35Z** @vzakharov cross-referenced this pull request from [#229 chore: /five-percent proposals put the problem before the proposal](https://github.com/vzakharov/vovazakharov.com/pull/229).
- **2026-10-29T05:17:46Z** @vzakharov renamed from «chore: acyclic src/ under a madge gate, and a slice cluster report» to «chore: sub-slices inside a slice under check:masd, on an acyclic src/».
- **2026-10-29T08:57:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5694906549.
