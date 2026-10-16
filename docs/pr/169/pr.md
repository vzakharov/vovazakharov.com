# PR #169: feat: Multi-App Sliced Design — src/ as apps composed along a graph

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/169
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/multi-app-sliced-design-7bn3oq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-16T11:59:18Z
- **Updated:** 2026-10-16T21:46:33Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 9

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/rules/masd.md`:1 — unresolved — last: @vzakharov (human) 2026-10-16T17:08:24Z — "я хотел бы где-то, может на временной ветке или ещё как, сра…" → [↓](#t01)
- **T02** `.claude/rules/styling.md`:7 — unresolved — last: @vzakharov (human) 2026-10-16T17:14:22Z — "что-то из этого (/kernel) используется в mushrooms? если нет…" → [↓](#t02)
- **T03** `apps/basilisk/app/sitemap.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-16T17:19:17Z — "почему раньше (ре)экспортили просто функцию, а теперь вызыва…" → [↓](#t03)
- **T04** `eslint/rule-groups/import-sort.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-16T17:22:52Z — "так... давай подумаем стоит ли группировать таки по аппам, н…" → [↓](#t04)
- **T05** `docs/remove-before-merging/squash-message.md`:6 — unresolved — last: @vzakharov (human) 2026-10-16T17:23:55Z — "ирония в том что по состоянию на сейчас ничего не изменилось…" → [↓](#t05)
- **T06** `eslint/masd-boundaries.ts`:17 — unresolved — last: @vzakharov (human) 2026-10-16T17:25:37Z — "зачем нам ограничивать список возможных баррелей?" → [↓](#t06)
- **T07** `eslint/masd-boundaries.ts`:33 — unresolved — last: @vzakharov (human) 2026-10-16T21:43:31Z — "не очень понимаю, чем так особенен shared/lib по сравнению с…" → [↓](#t07)
- **T08** `eslint/masd-boundaries.ts`:96 — unresolved — last: @vzakharov (human) 2026-10-16T21:44:18Z — "а это о чём?" → [↓](#t08)
- **T09** `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-16T21:45:31Z — "вот есть смутное ощущение, что аппо-специфичные скрипты тоже…" → [↓](#t09)

---

## Body

## Summary

- **What:** `src/` stops being one Feature-Sliced Design tree and becomes a set of apps — `kernel`, `shell`, `blog`, `vova`, `lsa`, `bible`, `basilisk`, `music`, `mushrooms` — each an FSD tree of its own, composed along a graph in `src/masd.json` where each app lists its parents, declared above it.
- **Why:** FSD's rules are computed over the whole repo, so a self-contained app (music, the mushrooms game) collapses into one `pages/` slice holding everything, and the shared kernel ends up knowing leaf apps (`shared/content` imports the song schema and the basilisk case frontmatter).
- **The rule:** an app that extends `blog` *is* `blog` — an import may target the same app or an ancestor, only a strictly lower layer, through the slice's public API. A site's router only maps URLs to apps, its sitemap included; addresses stay kernel's.
- **This PR is slice 1 of 5** (see the plan): the move, both checkers driven by the tree, a cross-app significance check replacing Steiger's `insignificant-slice` (which a spike showed is wrong per app root), the collection registry inverted, and the game on a root layout of its own with a dusk that no longer reads the colour scheme.

The plan: `docs/plans/multi-app-sliced-design.draft.do-not-implement.md`.

## QA Checklist

- [ ] `builds` — `./scripts/vet.sh` passes: all four sites build, lint, Steiger per app root, `masd-check`, tests.
- [ ] `lattice` — an upward import (`basilisk/entities` → `kernel/features`) and a same-layer cross-app import (`basilisk/entities` → `blog/entities`) each fail `pnpm lint`.
- [ ] `significance` — a `kernel` slice used once inside `kernel` and twice from `blog` passes `masd-check`; one used by a single slice anywhere fails it.
- [ ] `sites` — each of the four sites renders its home, an article, the sitemap and the feed unchanged (`/preview`).
- [ ] `game` — `/mushrooms` renders without the theme toggle, and a fresh meadow opens in full day in a light and a dark system theme alike.
- [ ] `music-links` — vovazakharov.com's home links to `/music`, and a moved song's old URL still lands on the 404's moved-song notice.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `builds` | yes | vet | |
| `lattice` | yes | partly | a fixture test for the generated policies would cover it |
| `significance` | yes | planned | `masd-check.test.ts` |
| `sites` | partly | build only | rendering correctness needs `/preview` |
| `game` | partly | no | `meadowOpening` is pure, so a test can pin a fresh meadow to `FULL_DAY` |
| `music-links` | partly | build only | |

Closes #171

https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-16T11:59:40Z — "Proposed squash body: ``` Feature-Sliced Design's rules are…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-16T11:59:40Z

[https://github.com/vzakharov/vovazakharov.com/pull/169#issuecomment-6215014885](https://github.com/vzakharov/vovazakharov.com/pull/169#issuecomment-6215014885)

Proposed squash body:

```
Feature-Sliced Design's rules are computed over the whole repository,
so a self-contained app collapsed into a single pages/ slice holding
everything (music, the mushrooms game), and the shared kernel knew the
leaf apps it served: shared/content imported the song schema and the
basilisk case frontmatter.

src/ is now a set of apps, each an FSD tree of its own, composed along
a graph in src/masd.json where each app lists its parents above it,
which is what keeps the graph acyclic. An app that extends blog is
blog: an import may target the same app or an ancestor, only a
strictly lower layer, through the slice's public API. Where a
collection lives stays kernel's; what it holds moved to the app that
owns it. A site's router only maps URLs to apps, its sitemap included.

Both checkers read the graph. eslint-plugin-boundaries generates its
policies from it; Steiger runs once per app root, with
insignificant-slice replaced by scripts/masd-check.ts, which counts a
slice's references across the composition and flags an abstract app
with a single child, because Steiger sees one root's references only.

The game renders on a root layout of its own, without the theme
toggle, and a fresh meadow always opens in full day: dusk is a game
mechanic, not a reading of the colour scheme.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/rules/masd.md`:1 — unresolved — last: @vzakharov (human) 2026-10-16T17:08:24Z — "я хотел бы где-то, может на временной ветке или ещё как, сра…" → [↓](#t01)
- **T02** `.claude/rules/styling.md`:7 — unresolved — last: @vzakharov (human) 2026-10-16T17:14:22Z — "что-то из этого (/kernel) используется в mushrooms? если нет…" → [↓](#t02)
- **T03** `apps/basilisk/app/sitemap.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-16T17:19:17Z — "почему раньше (ре)экспортили просто функцию, а теперь вызыва…" → [↓](#t03)
- **T04** `eslint/rule-groups/import-sort.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-16T17:22:52Z — "так... давай подумаем стоит ли группировать таки по аппам, н…" → [↓](#t04)
- **T05** `docs/remove-before-merging/squash-message.md`:6 — unresolved — last: @vzakharov (human) 2026-10-16T17:23:55Z — "ирония в том что по состоянию на сейчас ничего не изменилось…" → [↓](#t05)
- **T06** `eslint/masd-boundaries.ts`:17 — unresolved — last: @vzakharov (human) 2026-10-16T17:25:37Z — "зачем нам ограничивать список возможных баррелей?" → [↓](#t06)
- **T07** `eslint/masd-boundaries.ts`:33 — unresolved — last: @vzakharov (human) 2026-10-16T21:43:31Z — "не очень понимаю, чем так особенен shared/lib по сравнению с…" → [↓](#t07)
- **T08** `eslint/masd-boundaries.ts`:96 — unresolved — last: @vzakharov (human) 2026-10-16T21:44:18Z — "а это о чём?" → [↓](#t08)
- **T09** `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-16T21:45:31Z — "вот есть смутное ощущение, что аппо-специфичные скрипты тоже…" → [↓](#t09)

<a id="t01"></a>

### `.claude/rules/masd.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T17:08:24Z

я хотел бы где-то, может на временной ветке или ещё как, сравнить бывший fsd.md против нынешнего masd.md; хочу понять что мы взяли, что удалили, что добавили

---

<a id="t02"></a>

### `.claude/rules/styling.md`:7 — unresolved

```diff
@@ -1,10 +1,10 @@
… 2 lines elided …
 paths:
-  - src/app/styles/**
-  - src/app/ui/theme-provider.tsx
+  - src/kernel/app/styles/**
+  - src/kernel/app/ui/theme-provider.tsx
   - styles/**
-  - src/shared/ui/css-color.ts
+  - src/kernel/shared/ui/css-color.ts
```

**@vzakharov (human)** — 2026-10-16T17:14:22Z

что-то из этого (/kernel) используется в mushrooms? если нет, это в shell

---

<a id="t03"></a>

### `apps/basilisk/app/sitemap.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T17:19:17Z

почему раньше (ре)экспортили просто функцию, а теперь вызываем?

---

<a id="t04"></a>

### `eslint/rule-groups/import-sort.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T17:22:52Z

так... давай подумаем стоит ли группировать таки по аппам, начиная от базовых, типа сначала все импорты из kernel, потом из shell (там где применимо), и только в конце из себя; в каждой группе сортируя как сейчас.

за и против?

нарисуй пока без правок на каком-то показательном примере, как будет

---

<a id="t05"></a>

### `docs/remove-before-merging/squash-message.md`:6 — unresolved

```diff
@@ -0,0 +1,33 @@
… 1 line elided …
+
+```
+Feature-Sliced Design's rules are computed over the whole repository,
+so a self-contained app collapsed into a single pages/ slice holding
+everything (music, the mushrooms game), and the shared kernel knew the
```

**@vzakharov (human)** — 2026-10-16T17:23:55Z

ирония в том что по состоянию на сейчас ничего не изменилось, хотя обсуждали, например, что у музыки будут отдельная pages/... на каждую, а роутиться они будут внутри /music/app (см. транскрипт самой первой сессии, если из relay-1.md это не видно: https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe)

с грибами отдельная история, пока пропускаем

---

<a id="t06"></a>

### `eslint/masd-boundaries.ts`:17 — unresolved

```diff
@@ -0,0 +1,156 @@
… 12 lines elided …
+// The sliced FSD layers, highest first.
+const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];
+
+// A closed list, so any other `index.*.ts` is still reaching into internals.
+const PUBLIC_API = ['index.ts', 'index.server-only.ts', 'index.node-safe.ts'];
```

**@vzakharov (human)** — 2026-10-16T17:25:37Z

зачем нам ограничивать список возможных баррелей?

---

<a id="t07"></a>

### `eslint/masd-boundaries.ts`:33 — unresolved

```diff
@@ -0,0 +1,156 @@
… 21 lines elided …
+// An app and everything it inherits: the apps its files may import from.
+const reach = (app: string): string[] => [app, ...ancestors(graph, app)];
+
+// `shared/lib` holds one sub-library per file instead of a segment-wide barrel,
+// so a file there is its own public API — there is nothing beside it to hide.
+// Entry stays at the top level: `*.ts` does not cross a slash, so anything a
+// sub-library grows a directory for is internals again.
+const sharedLibEntry = (apps: string[]) => ({
+  type: 'shared',
+  captured: { appName: apps, segmentName: 'lib' },
+  fileInternalPath: '*.ts',
+});
```

**@vzakharov (human)** — 2026-10-16T21:43:31Z

не очень понимаю, чем так особенен shared/lib по сравнению со всеми остальными shared/...?

---

<a id="t08"></a>

### `eslint/masd-boundaries.ts`:96 — unresolved

```diff
@@ -0,0 +1,156 @@
… 86 lines elided …
+  files: ['src/**/*.{ts,tsx}', 'apps/*/app/**/*.{ts,tsx}'],
+  settings: {
+    'boundaries/elements': [
+      // A router maps addresses to apps and nothing else, so it is no app's.
+      {
+        type: 'router',
+        pattern: ['apps/*/app'],
+        capture: ['siteName'],
+        partialMatch: true,
+      },
```

**@vzakharov (human)** — 2026-10-16T21:44:18Z

а это о чём?

---

<a id="t09"></a>

### `scripts/lib/mushroom-probe-answers.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-16T21:45:31Z

вот есть смутное ощущение, что аппо-специфичные скрипты тоже должны жить где-то в своих аппах, как считаешь? а то мы рисовали-рисовали красоты, а в scripts/lib как был граббаг так и остался

---

## Timeline (status, references, and other events)

- **2026-10-16T12:28:50Z** @vzakharov renamed from «feat: Multi-App Sliced Design — src/ as apps composed along a tree» to «feat: Multi-App Sliced Design — src/ as apps composed along a graph».
- **2026-10-16T12:31:05Z** @vzakharov cross-referenced this pull request from [#170 Multi-App Sliced Design: src/ as composed apps](https://github.com/vzakharov/vovazakharov.com/issues/170).
- **2026-10-16T12:31:06Z** @vzakharov cross-referenced this pull request from [#171 MASD core: the app graph, the move, both checkers and the inverted schema registry](https://github.com/vzakharov/vovazakharov.com/issues/171).
- **2026-10-16T21:46:33Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5551116833.
