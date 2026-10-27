# PR #216: feat: #170 a one-reference slice with a narrow public API is significant

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/216
- **Author:** @vzakharov (human)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/one-page-measure
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T14:11:19Z
- **Updated:** 2026-10-27T02:01:47Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/plans/multi-app-sliced-design.paused.md`:1 — unresolved — last: @vzakharov (human) 2026-10-27T01:54:01Z — "что-то безбожно выглядит файл, давай причешем, вынесем в сос…" → [↓](#t01)
- **T02** `src/mushrooms/widgets/meadow/index.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-27T01:56:22Z — "чё-т я теперь не понял, зачем мы всю эту кухню перенесли в w…" → [↓](#t02)
- **T03** `docs/plans/multi-app-sliced-design.paused.md`:533 — unresolved — last: @vzakharov (human) 2026-10-27T02:00:24Z — "ну да; только с учётом коммента выше, не в виджет, а в стран…" → [↓](#t03)
- **T04** `docs/plans/multi-app-sliced-design.paused.md`:542 — unresolved — last: @vzakharov (human) 2026-10-27T02:01:09Z — "вот карту как раз сделать виджетом или, если она не грузит ф…" → [↓](#t04)

---

## Body

## Summary

- **A one-reference slice is significant when its public API is narrow.** `check:masd` spares a slice with a single consumer when its barrels (`index.ts` and the two suffixed ones) hand on at most a third of the names its files export: a slice hiding the rest is a module whoever uses it. A reference count alone cannot tell "used once because it is a detail of its consumer" from "used once because the app has one consumer at all", so without this a one-page app — the mushroom game — stays one grab-bag slice. An unreferenced slice is flagged as before, and the messages stay Steiger's word for word.
- **Why API width and not boundary-vs-internal edges**, measured by a spike over every slice in the repo and over the noun groups the game's file names suggest: a well-layered slice imports downward, so edge cohesion scores the game's noun groups 20–48% and the repo's shared slices 10–64% — it punishes the layering MASD asks for. API width separates: the slices built as modules sit low (the player 11%, the CV page 20%, Майя's whisper 19%), while noun groups cut by file-name prefix land 29–60%, so the bar asks bite 6b to draw boundaries better than a prefix does. `knip` keeps the numerator honest, since a barrel export nothing reads fails it.
- **`PUBLIC_API` moves to `eslint/masd-graph.ts`**, which both the boundaries config and the check read — the check runs under bare Node and cannot load the config. `masd.md` states the reprieve under "No insignificant slices", and `compare/fsd-vs-masd` follows.
- The plan folds bite 6a in; 6b — mushrooms restructured under the measure — is next.

## QA Checklist

- [ ] `narrow` — a slice used by one other slice whose `index.ts` re-exports a third or less of what its files export passes `pnpm check:masd`.
- [ ] `wide` — the same slice re-exporting more than a third is flagged with Steiger's "only one reference" message.
- [ ] `star` — `export * from './x'` in a barrel counts every name `x` exports.
- [ ] `unreferenced` — a narrow slice nothing imports is still flagged "no references".
- [ ] `tree` — `pnpm check:masd` passes on the real tree unchanged.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `narrow` | unit | ✅ | `scripts/masd-check.test.ts` — "passes when the barrel hands on a third" |
| `wide` | unit | ✅ | same file — "is flagged when it hands on more" |
| `star` | unit | ✅ | same file — "counts every name of a file a barrel re-exports whole" |
| `unreferenced` | unit | ✅ | same file — "is still flagged with no references" |
| `tree` | integration | ✅ | `scripts/vet.sh` runs `check:masd` |

https://claude.ai/code/session_01HbwDMNsRgD8RbxTKqsBhnm

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T14:11:33Z — "Proposed squash body: ``` Bite 6a of the multi-app split. A…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T14:11:33Z

[https://github.com/vzakharov/vovazakharov.com/pull/216#issuecomment-6418140145](https://github.com/vzakharov/vovazakharov.com/pull/216#issuecomment-6418140145)

Proposed squash body:

```
Bite 6a of the multi-app split. A reference count cannot tell a slice
used once because it is a detail of its consumer from one used once
because its app has one consumer at all, so a one-page app such as the
mushroom game could only ever be one grab-bag slice.

check:masd now holds a slice with one reference significant when its
public API is narrow: its barrels hand on at most a third of the names
its files export, so it hides the rest from its consumer, which makes
it a module whoever uses it. An unreferenced slice is flagged as
before, and the messages stay Steiger's.

The measure was chosen over boundary-versus-internal import edges by
measuring both across the repo: a well-layered slice imports downward,
so edge cohesion punishes the layering MASD asks for, while API width
puts the slices built as modules (the player, the CV page) at a fifth
or under. PUBLIC_API moves to masd-graph.ts, which both the boundaries
config and the bare-Node check read, and masd.md states the rule.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/plans/multi-app-sliced-design.paused.md`:1 — unresolved — last: @vzakharov (human) 2026-10-27T01:54:01Z — "что-то безбожно выглядит файл, давай причешем, вынесем в сос…" → [↓](#t01)
- **T02** `src/mushrooms/widgets/meadow/index.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-27T01:56:22Z — "чё-т я теперь не понял, зачем мы всю эту кухню перенесли в w…" → [↓](#t02)
- **T03** `docs/plans/multi-app-sliced-design.paused.md`:533 — unresolved — last: @vzakharov (human) 2026-10-27T02:00:24Z — "ну да; только с учётом коммента выше, не в виджет, а в стран…" → [↓](#t03)
- **T04** `docs/plans/multi-app-sliced-design.paused.md`:542 — unresolved — last: @vzakharov (human) 2026-10-27T02:01:09Z — "вот карту как раз сделать виджетом или, если она не грузит ф…" → [↓](#t04)

<a id="t01"></a>

### `docs/plans/multi-app-sliced-design.paused.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-27T01:54:01Z

что-то безбожно выглядит файл, давай причешем, вынесем в соседние файлы что-то, что можно вынести, и т.п. Сейчас я (как человек по крайней мере), читая его, вообще не понимаю, где мы находимся и что дальше делать.

---

<a id="t02"></a>

### `src/mushrooms/widgets/meadow/index.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-27T01:56:22Z

чё-т я теперь не понял, зачем мы всю эту кухню перенесли в widgets; мотивация была не делать греббег из pages/mushrooms -- но теперь у нас просто всё здесь, а в pages/mushrooms осталось четыре файла. При этом, бесспорно, количество уменьшилось, и это хорошо -- но оно должно "вернуться" в страницу, т.к. какой смысл ему быть в widget-е, который используется только в одном месте, и ничто кроме которого в этом единственном месте, где он используется, не используется.

---

<a id="t03"></a>

### `docs/plans/multi-app-sliced-design.paused.md`:533 — unresolved

```diff
@@ -283,36 +283,278 @@ and phone) and the radio screenshotted pixel-identical to the elephant's.
… 238 lines elided …
+  widget's `startGame` through `widgets/meadow`'s barrel; `vet-test.sh`,
+  `test:meadow`, the artifact build, `styling.md` and the game's `CLAUDE.md`
+  (now `src/mushrooms/CLAUDE.md`) follow.
+- **Checks after the move**: typecheck green; `check:masd` passes; knip clean;
+  eslint and Steiger clean on every production file. Both fail only on tests:
+  **63 test files (177 imports) reach above their own slice** — 46 build the
+  widget's `meadowLayout`/`opened`/`Meadow` to test a lower module on real
+  screens, 17 reach a sibling (mostly the mushroom's `VIEWPORTS` and
+  `meadowCamera`). Open, put to the operator: move each such test up beside the
+  widget, named for what it checks (recommended — it tests the composition), or
+  fixtures down. `type-overlap`'s repeated layout combinations, left by the
+  `MeadowLayout` flip (46 findings at this session's start), are named
+  (`SunlitSky` and its bases in `sun-layout`, `BeddedInsectView`).
```

**@vzakharov (human)** — 2026-10-27T02:00:24Z

ну да; только с учётом коммента выше, не в виджет, а в страницу

---

<a id="t04"></a>

### `docs/plans/multi-app-sliced-design.paused.md`:542 — unresolved

```diff
@@ -283,36 +283,278 @@ and phone) and the radio screenshotted pixel-identical to the elephant's.
… 251 lines elided …
+- **Left**: the tests' answer and its move; `pnpm test:meadow` and
+  `pnpm play:mushrooms` at `/finalize`, which also confirm the dropped
+  `STAND_REACH` filter judged nothing differently; vova built and the game
+  looked at. **The map can leave the widget now**: `map-view` reads only two of
+  the meadow's types, `MeadowLayout` and `DoorSeating`; narrowed the way every
+  other part's were, `map-*`, `draw-map-ground` and `model/map-frame` make a
+  slice of their own — call 3, re-asked. The tools in `layout-tools.md` read the
+  pre-move tree; after the move, eslint's `boundaries` and Steiger are the
+  layout's check.
```

**@vzakharov (human)** — 2026-10-27T02:01:09Z

вот карту как раз сделать виджетом или, если она не грузит фич, собственно фичей.

---

## Timeline (status, references, and other events)

- **2026-10-27T02:01:47Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/216#pullrequestreview-5661354989.
