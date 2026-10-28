# PR #228: chore: acyclic src/ under a madge gate, and a slice cluster report

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/228
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/masd-slice-clusters-q7r4tm
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-28T08:41:34Z
- **Updated:** 2026-10-28T16:42:46Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T02** `scripts/lib/import-graph.ts`:13 — unresolved — last: @vzakharov (human) 2026-10-28T16:42:46Z — "merge-конфликты -- последнее от чего болит голова. нет." → [↓](#t02)

---

## Body

## Summary

- **`src/` has no import cycles, and vet keeps it so.** `pnpm check:cycles` runs madge over `src/`, type-only imports counted, beside `check:masd`. It is the first bite of the plan in `docs/plans/masd-slice-clusters.paused.md`: a search for a cluster inside a slice reads the slice's import graph as a DAG.
- **The 18 cycles madge found are broken by moving a declaration, never by copying it.** Each was a type or a hook declared in the wrong file: `Chip`, the flower stand, the insect's base types and the butterfly's genes, places and legs in the flight model, the flier's offer, `Alofted`, `ControlledScreen`, and the player's controls and context. Each moved to a file of its own or to its one reader. No behaviour changes.
- **`pnpm masd:clusters` reports clusters inside a slice** (bite 2): per slice, the downward closures rooted at no door, not just whole segments, kept when cutting them off raises the modularity of the slice's own graph. A report, exit 0; vet runs its tests. First output flags 27 of 46 slices, so the bar is still open (the plan's `## Rest of the elephant`).
- **`scripts/lib/import-graph.ts`** is PR #227's shared walk and import resolver, `masd-check.ts` moved onto it as #227 does; `docs/masd.md` names the cycle check as the fourth checker and the cluster report as a first cut at its open direction.

## QA Checklist

- [ ] `cycles-gate` — `pnpm check:cycles` prints "No circular dependency found!" and exits 0.
- [ ] `cycles-fail` — add `import type { Chip } from './chip-nav';` to `src/shell/shared/ui/chip.ts`; `pnpm check:cycles` exits non-zero naming the cycle. Revert.
- [ ] `meadow` — open `/mushrooms`: butterflies, flies and bees fly, perch on flowers and caps, shelter under caps in rain; the gait button sits where it did.
- [ ] `player` — on `/music`, play a song: the bar appears, play/pause, seek, volume, the radio toggle and the media keys work.
- [ ] `language-chips` — on an article with a language row, switch language, then Back: the page returns in the last-chosen language.
- [ ] `clusters` — `pnpm masd:clusters` exits 0 and ends `27 of 46 slices hold a cluster.`; `src/mushrooms/entities/mushroom` and `src/mushrooms/entities/landscape` each list a cluster (the painting, the backdrop).
- [ ] `clusters-sense` — pick three flagged clusters and judge whether each would read as a slice of its own.
- [ ] `masd-check` — `pnpm check:masd` exits 0 on the shared resolver, as before.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `cycles-gate` | yes | yes | vet runs it |
| `cycles-fail` | yes | no | madge's own behaviour |
| `meadow` | partly | partly | the game's tests (`VET_MEADOW=1`) cover the model; the look is manual |
| `player` | no | no | build type-checks the moved context |
| `language-chips` | no | no | type-only move |
| `clusters` | yes | partly | `masd-clusters.test.ts` pins the output shape on fixtures; the count tracks the tree |
| `clusters-sense` | no | no | judgement call, the open bar |
| `masd-check` | yes | yes | vet runs it and `masd-check.test.ts` |

https://claude.ai/code/session_01DaohkFjE5k2mZsypSbXfxP
https://claude.ai/code/session_01DaohkDptLrsH2R2jWY9JZJ

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-28T08:41:55Z — "Proposed squash body: ``` A cluster inside one slice that ea…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-28T08:41:55Z

[https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6464532950](https://github.com/vzakharov/vovazakharov.com/pull/228#issuecomment-6464532950)

Proposed squash body:

```
A cluster inside one slice that earns a slice of its own is the
converse of check:masd's significance by modularity. Finding one reads
the slice's import graph as a DAG, and madge found 18 cycles in src/,
so the graph is made acyclic first and held so.

pnpm check:cycles runs madge over src/, type-only imports counted,
since two files importing each other through types still cannot go to
different slices; vet runs it beside check:masd. Every cycle was a
type or a hook declared in the wrong file, and each moved to a file of
its own or to its one reader rather than being copied to both sides:
the chip row's Chip, the flower stand, the insect's base types and the
butterfly's genes, the flight model's places and legs, the flier's
offer, the player's controls and context. No behaviour changes.

pnpm masd:clusters is a first cut at the search, a report that never
fails: per slice, the downward closures inside it, rooted at no door,
not just whole segments, scored by the modularity gain of cutting them
off on the slice's own graph. At a gain above zero it flags 27 of 46
slices, so the bar is still open. It resolves imports through
scripts/lib/import-graph.ts, which check:masd now shares.

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

- **T01** `docs/masd.md`:108 — unresolved — last: @vzakharov (agent) 2026-10-28T10:01:41Z — "<!-- five-percent proposal · an answer here is scored by .cl…" → [↓](#t01)
- **T02** `scripts/lib/import-graph.ts`:13 — unresolved — last: @vzakharov (human) 2026-10-28T16:42:46Z — "merge-конфликты -- последнее от чего болит голова. нет." → [↓](#t02)
- **T03** `scripts/masd-clusters.ts`:125 — unresolved — last: @vzakharov (agent) 2026-10-28T11:20:18Z — "<!-- five-percent proposal · an answer here is scored by .cl…" → [↓](#t03)

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

Ветка записала четвёртую проверку только в `docs/masd.md` — справочник, который открывают нарочно, — взяв за данность, что агенту, правящему `src/`, хватит ошибки madge из vet. Но `.claude/rules/masd.md`, который грузится при каждом чтении файла под `src/`, по-прежнему говорит «Three checkers enforce what follows», а то, что эта ветка выяснила на всех 18 циклах, — цикл всегда означал тип или хук не в том файле, и разрывается переносом объявления в свой файл или к единственному читателю, без копии с двух сторон, — живёт только в плане, который уйдёт при финализации. → Добавить `check:cycles` в список правила и одну строку с этим способом разрыва (из DRY notes плана: «A cycle broken by copying a type is the failure mode»). Цена: пара строк в правиле, которое грузится на каждое чтение `src/`; и тогда справочнику достаточно ссылки на правило вместо своего абзаца.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

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

Кандидат здесь — нисходящее замыкание файла, хотя план в «Eaten so far» остановился на поддеревьях доминаторов, и причина смены нигде не записана. Замыкание тянет в кандидата всё, до чего корень дотягивается, включая файлы, которые импортирует и остальной слайс, — отсюда шум, который план сам называет: «весь UI-дерево страницы от главного компонента» (`control-actions` ×14). Поддерево доминатора — ровно то, что выносится за одну дверь: ни один файл в нём не нужен никому снаружи, кроме как через корень. → Считать ΔQ по поддеревьям доминаторов (спайк `dominators.ts` их уже строил, один топологический проход по DAG, который бита 1 сделала ацикличным) и оставить замыкания запасным режимом, если поддеревьев окажется мало. Цена: переписать отбор кандидатов и тесты; кластеры с двумя дверями, которые план и так держит в «Rest of the elephant», не войдут ни в тот, ни в другой режим.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

## Timeline (status, references, and other events)

- **2026-10-28T08:41:56Z** @vzakharov renamed from «chore: clusters inside a slice that earn a slice of their own» to «chore: report clusters inside a slice that earn a slice of their own».
- **2026-10-28T10:01:46Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5680838786.
- **2026-10-28T10:02:58Z** @vzakharov renamed from «chore: report clusters inside a slice that earn a slice of their own» to «chore: break every import cycle in src/ and gate it with madge».
- **2026-10-28T11:20:22Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/228#pullrequestreview-5681787280.
- **2026-10-28T11:21:16Z** @vzakharov renamed from «chore: break every import cycle in src/ and gate it with madge» to «chore: acyclic src/ under a madge gate, and a slice cluster report».
