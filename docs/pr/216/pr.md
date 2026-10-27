# PR #216: refactor: #170 significance by modularity, the mushroom game in slices

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/216
- **Author:** @vzakharov (agent)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/one-page-measure
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T14:11:19Z
- **Updated:** 2026-10-27T08:38:05Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 1d4626a). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/mushrooms/entities/landscape/ui/lawn.ts`:38 — unresolved — last: @vzakharov (human) 2026-10-27T08:34:36Z — "чтобы ошибка с перепутыванием CELL-а не повторилась, может,…" → [↓](#t01)
- **T02** `src/mushrooms/entities/mushroom/ui/door-sight.ts`:136 — unresolved — last: @vzakharov (human) 2026-10-27T08:35:23Z — "у нас кстати во всеми этими кешами мемори ликов никаких не с…" → [↓](#t02)
- **T03** `src/mushrooms/pages/mushrooms/ui/tufts.test.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-27T08:37:22Z — "раздуло, надо разделять (посмотри и другие если я упустил).…" → [↓](#t03)

---

## Body

## Summary

- **A one-reference slice is significant when it is a module (bite 6a).** A reference count alone cannot tell a slice used once because it is a detail of its consumer from one used once because its app has one consumer at all, so a one-page app such as the mushroom game could only ever be one grab-bag slice. `check:masd` now spares a slice with a single consumer when its term of Newman's modularity, `e − a²`, is positive: more of its own app's file-import edges fall inside it than a degree-preserving rewiring would put there. Nothing is tuned — the null model is the bar, which is why it replaced the earlier "barrels hand on at most a third" API-width rule. The graph is the slice's own app alone, tests and scripts out, since who uses an app says nothing of how it is cut; the with-descendants alternative was measured and rejected (`docs/remove-before-merging/masd/one-page-measure/modularity-two-graphs.md`). Unreferenced slices are flagged as before, in Steiger's words.
- **The mushroom game is cut into FSD slices by its nouns (bite 6b)**, which is what tests whether 6a's measure holds: `shared/world` (camera, ground, clock, depth order, the occupant), the entities (`mushroom`, `flower`, `insect`, `landscape`, `mouse`, `worm`), features named for what happens (`grow-mushroom`, `plant-flower`, `insects-fly`, …), `widgets/map`, and `pages/mushrooms` holding the scene, state, sound and keeping. Each reader declares the layout and the `Action` variants it uses rather than importing the page's whole; the flower and the mushroom meet only as occupants of the ground, so neither imports the other. The page's tests reach lower slices through `index.node-safe.ts` (Phaser crashes bare Node) and a new `index.test-only.ts` entry that boundaries lets only a `*.test.ts` take (`TEST_API`), so the public API stays what production reads. One regression the cut introduced — the lawn reading the occupant grid's `CELL` (0.02) instead of its own (4) — is fixed as `LAWN_CELL`; a comparison of every import against the base found no other rebinding.
- **The game's tests are sharded across vet's runners on `VET_MEADOW=1`**, passed on as `vet.yml`'s `meadow` input: six test shards, with `vet-test.sh meadow` the one home of the game's layer list. The plays are commented out of `vet.yml` for now: 22 of 30 groups were red, the same 22 with the same messages on 6b's base, and the game checks out by hand — the operator expects to cut them down heavily.
- **`keptIn`**, one get-or-make for a `Map` or `WeakMap` cache, replaces nine hand-spelled caches across the game, blog's render and music's catalogue files, as kernel's new `shared/cache` segment. The page's latest-N cache, which evicts, stays separate as `keptLatest`.
- The plan (`docs/plans/multi-app-sliced-design.paused.md`) folds in `bite-06a.md` and `bite-06b.md`; the plays' cut-down, sub-entities and the converse of 6a are left in "Rest of the elephant".

## QA Checklist

- [ ] `module` — a one-consumer slice holding more of its app's import edges than chance passes `pnpm check:masd`.
- [ ] `not-module` — a one-consumer slice whose files mostly import outside it, or a one-file slice, is flagged with Steiger's "only one reference" message.
- [ ] `own-app` — edges from descendant apps do not lift a slice's score; a test or a script importing a slice is no reference.
- [ ] `tree` — `pnpm check:masd`, `pnpm lint` and Steiger pass on the real tree.
- [ ] `test-only` — a production file importing a slice's `index.test-only.ts` fails eslint `boundaries`; a `*.test.ts` doing the same passes.
- [ ] `play` — on vovazakharov.com's `/mushrooms` (`pnpm dev` or `/preview`): plant flowers, grow mushrooms and furnish a house, watch insects perch and shelter, mice run and the worm peek, walk the meadow, let dusk and rain come — all behave as on the base.
- [ ] `lawn` — tufts grow along the lawn's seam and the map's ground shows its mottles at the lawn's scale.
- [ ] `map` — the map button opens the map, which shows the patch and the door seating.
- [ ] `shards` — `VET_MEADOW=1 ./scripts/vet.sh` adds the six `meadow` test shards to the run, all green, and no play jobs.
- [ ] `kept` — `keptIn` makes a value once, keeps a `false` or `0`, and keys a `WeakMap` by object.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `module` | unit | ✅ | `scripts/masd-check.test.ts` — "passes a slice holding more of its edges than chance" |
| `not-module` | unit | ✅ | same file — "flags one whose files mostly import outside it", "flags a one-file slice" |
| `own-app` | unit | ✅ | same file — "counts no descendant edge", "does not count a test / an app script as a reference" |
| `tree` | integration | ✅ | `scripts/vet.sh` runs `check:masd`, lint and Steiger |
| `test-only` | integration | ❌ | Lint two fixture files against the `TEST_API` boundary rule and assert one error, one pass |
| `play` | manual-only | — | Feel and look of the whole game; the plays that would drive it are off pending their cut-down |
| `lawn` | unit | ✅ | tufts' and the map ground's tests read `LAWN_CELL` (meadow shards) |
| `map` | e2e | ❌ | A play opening the map from the page, once the plays are cut down and back on |
| `shards` | integration | ✅ | `vet.yml`'s `meadow` job is the check itself |
| `kept` | unit | ✅ | `src/kernel/shared/cache/kept.test.ts` |

https://claude.ai/code/session_01DaohkDiMgQutcFrsFSSB9a

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T14:11:33Z — "Proposed squash body: ``` Bites 6a and 6b of the multi-app s…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T14:11:33Z

[https://github.com/vzakharov/vovazakharov.com/pull/216#issuecomment-6418140145](https://github.com/vzakharov/vovazakharov.com/pull/216#issuecomment-6418140145)

Proposed squash body:

```
Bites 6a and 6b of the multi-app split. A reference count cannot tell
a slice used once because it is a detail of its consumer from one used
once because its app has one consumer at all, so a one-page app such
as the mushroom game could only ever be one grab-bag slice.

check:masd now spares a one-consumer slice when its term of Newman's
modularity is positive: more of its own app's file-import edges fall
inside it than a degree-preserving rewiring would put there. The null
model is the bar, so nothing is tuned; the graph is the slice's own
app, tests and scripts out, since who uses an app says nothing of how
it is cut.

The game is cut by its nouns to prove the measure: shared/world, six
entities, features named for what happens, widgets/map, and the page
holding scene, state, sound and keeping. Each reader declares the
layout and actions it uses; the flower and the mushroom meet only as
occupants of the ground. The page's tests enter lower slices through
index.node-safe.ts, or index.test-only.ts, an entry boundaries grants
to tests alone.

VET_MEADOW=1 shards the game's tests across vet's runners; its plays
are off in vet.yml, red the same way on the base, pending a cut-down.
keptIn, in kernel's new shared/cache, is the one get-or-make for a Map
or WeakMap cache across the apps.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_4 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `src/mushrooms/entities/landscape/ui/lawn.ts`:38 — unresolved — last: @vzakharov (human) 2026-10-27T08:34:36Z — "чтобы ошибка с перепутыванием CELL-а не повторилась, может,…" → [↓](#t01)
- **T02** `src/mushrooms/entities/mushroom/ui/door-sight.ts`:136 — unresolved — last: @vzakharov (human) 2026-10-27T08:35:23Z — "у нас кстати во всеми этими кешами мемори ликов никаких не с…" → [↓](#t02)
- **T03** `src/mushrooms/pages/mushrooms/ui/tufts.test.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-27T08:37:22Z — "раздуло, надо разделять (посмотри и другие если я упустил).…" → [↓](#t03)

<a id="t01"></a>

### `src/mushrooms/entities/landscape/ui/lawn.ts`:38 — unresolved

```diff
@@ -29,42 +29,41 @@ import {
… 8 lines elided …
 
 /** How wide a cell of the lawn stands, in the clump's size, either way. */
-const CELL = 4;
+export const LAWN_CELL = 4;
```

**@vzakharov (human)** — 2026-10-27T08:34:36Z

чтобы ошибка с перепутыванием CELL-а не повторилась, может, забрендить их? или это о другом было?

---

<a id="t02"></a>

### `src/mushrooms/entities/mushroom/ui/door-sight.ts`:136 — unresolved

```diff
@@ -134,11 +132,8 @@ export function sightOf(
… 5 lines elided …
-  const known = byTurn.get(turn) ?? doorStations(genes, turn);
-  byTurn.set(turn, known);
-  return known;
+  const byTurn = keptIn(stations, genes, () => new Map<number, DoorPlace[]>());
+  return keptIn(byTurn, turn, () => doorStations(genes, turn));
```

**@vzakharov (human)** — 2026-10-27T08:35:23Z

у нас кстати во всеми этими кешами мемори ликов никаких не светит? викмэпы-шмикмэпы не подойдут (понятно что не для чисел-ключей, но если сделать шаг назад)?

---

<a id="t03"></a>

### `src/mushrooms/pages/mushrooms/ui/tufts.test.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-27T08:37:22Z

раздуло, надо разделять (посмотри и другие если я упустил). если нужен общий харнес и если мы ещё здесь этого не придумали, придумать конвенцию для него, которая также сможет когда надо грузить .test-only.

---

## Timeline (status, references, and other events)

- **2026-10-27T02:01:47Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/216#pullrequestreview-5661354989.
- **2026-10-27T06:06:53Z** @vzakharov renamed from «feat: #170 a one-reference slice with a narrow public API is significant» to «refactor: #170 significance by modularity, the mushroom game in slices».
- **2026-10-27T08:38:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/216#pullrequestreview-5664144885.
