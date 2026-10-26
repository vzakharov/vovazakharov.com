# PR #169: feat: #170 Multi-App Sliced Design — src/ as a graph of apps

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/169
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/multi-app-sliced-design-7bn3oq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-16T11:59:18Z
- **Updated:** 2026-10-26T01:45:04Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 6

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 5d014e6). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/costs/sessions/2026-10/22354653-bee5-5919-af04-df2b0f1285f7.json`:25 — unresolved — last: @vzakharov (human) 2026-10-26T01:36:38Z — "кажется здесь должно было добавиться а не замениться" → [↓](#t01)
- **T02** `.claude/costs/sessions/2026-10/22354653-bee5-5919-af04-df2b0f1285f7.json`:31 — unresolved — last: @vzakharov (human) 2026-10-26T01:37:10Z — "возможно глюкануло потому что сессия сразу делала две ветки" → [↓](#t02)
- **T03** `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-26T01:38:34Z — "не оч понятно почему это находится в kernel если collection…" → [↓](#t03)
- **T04** `src/basilisk/scripts/lib/docket.ts`:9 — unresolved — last: @vzakharov (human) 2026-10-26T01:39:18Z — "почему (здесь и в аналогичных местах) относительный импорт?" → [↓](#t04)
- **T05** `src/maya/shared/i18n/messages/en.json`:1 — unresolved — last: @vzakharov (human) 2026-10-26T01:43:28Z — "почему это в shared, разве это не только машинкины штуки?" → [↓](#t05)
- **T06** `package.json`:45 — unresolved — last: @vzakharov (human) 2026-10-26T01:45:00Z — "что-то у нас здесь WET? почему не передавать название аппа п…" → [↓](#t06)

---

## Body

## Summary

- **What:** `src/` stops being one Feature-Sliced Design tree and becomes a set of apps — `kernel`, `shell`, `blog`, `music`, `mushrooms`, `vova`, `lsa`, `bible`, `basilisk` — each an FSD tree of its own, composed along a graph in `src/masd.json` where each app lists its parents, declared above it. `vova` is a composition of `blog`, `music` and `mushrooms`, which is what vovazakharov.com is.
- **Why:** FSD's rules are computed over the whole repo, so a self-contained app (music, the mushrooms game) collapses into one `pages/` slice holding everything, and the shared kernel ends up knowing leaf apps (`shared/content` imports the song schema and the basilisk case frontmatter).
- **The rule:** an app that extends `blog` *is* `blog` — an import may target the same app or an ancestor, only a strictly lower layer, through the slice's public API. A site's router only maps URLs to apps: each site's sitemap belongs to its leaf app, which hands its routes to kernel's sitemap factory, and the router's `sitemap.ts` only re-exports it.
- **This PR is the whole of MASD, eaten in bites** (see the plan). Slice 1, on this branch: the move, both checkers driven by the graph, a cross-app significance check replacing Steiger's `insignificant-slice` (which a spike showed is wrong per app root), the collection registry inverted, imports grouped one app at a time in graph order, each sitemap on its leaf app, and the game on a root layout of its own with a dusk that no longer reads the colour scheme.
- **The rest lands here too**, each slice as a PR based on this branch, opened once the previous one's threads are resolved: sites named by domain, app scripts inside their apps, the message catalogue inverted, music as an app with real pages, and a measure for a one-page app with mushrooms restructured under it.

The plan: `docs/plans/multi-app-sliced-design.paused.md`.

## QA Checklist

- [ ] `builds` — `./scripts/vet.sh` passes: all four sites build, lint, Steiger per app root, `masd-check`, tests.
- [ ] `lattice` — an upward import (`basilisk/entities` → `kernel/features`) and a same-layer cross-app import (`basilisk/entities` → `blog/entities`) each fail `pnpm lint`.
- [ ] `significance` — a `kernel` slice used once inside `kernel` and twice from `blog` passes `masd-check`; one used by a single slice anywhere fails it.
- [ ] `sites` — each of the four sites renders its home, an article and the feed unchanged (`/preview`).
- [ ] `sitemap` — each site's `/sitemap.xml` lists the same URLs as on `main`: vovazakharov.com's carries the CV, case studies, blog and music catalogue; basilisk, bible and lsa carry their collections alone.
- [ ] `game` — `/mushrooms` renders without the theme toggle, and a fresh meadow opens in full day in a light and a dark system theme alike.
- [ ] `music-links` — vovazakharov.com's home links to `/music`, and a moved song's old URL still lands on the 404's moved-song notice.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `builds` | integration | ✅ | `scripts/vet.sh` itself |
| `lattice` | integration | ❌ | Fixture files with an upward and a same-layer cross-app import, asserted to fail the generated boundaries policies; `eslint/masd-graph.test.ts` covers the graph they come from, not the policies |
| `significance` | unit | ✅ | `scripts/masd-check.test.ts` — slice used by two descendants vs. by one slice |
| `sites` | manual-only | — | Rendering correctness needs `/preview`; the build only proves each route renders |
| `sitemap` | e2e | ❌ | Build each site on `main` and the branch, diff the URL sets in `out/sitemap.xml` |
| `game` | unit | ✅ | `meadow-opening.test.ts` pins a fresh meadow to full day; the missing toggle is a `/preview` look |
| `music-links` | e2e | ❌ | Assert the built home links `/music` and the 404 carries the moved-song notice for an old song path |

Closes #170
Closes #171

https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe
https://claude.ai/code/session_01S2jJtYpfBsib4tLTc8eM2u
https://claude.ai/code/session_01Vjv6g7vLNAMP6Z39YupG1q

https://claude.ai/code/session_012TzSzF1UMvkGzxb9jonqD3

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
owns it. A site's router only maps URLs to apps; each site's sitemap
belongs to its leaf app, so vova, a composition of blog, music and
mushrooms, gathers the CV and music routes, and the others list their
collections alone.

Both checkers read the graph. eslint-plugin-boundaries generates its
policies from it; Steiger runs once per app root, with
insignificant-slice replaced by scripts/masd-check.ts, which counts a
slice's references across the composition and flags an abstract app
with a single child, because Steiger sees one root's references only.
Imports sort one group per app in graph order, so a file's imports
read as its composition, its own app last.

The game renders on a root layout of its own, without the theme
toggle, and a fresh meadow always opens in full day: dusk is a game
mechanic, not a reading of the colour scheme.

Closes #170
Closes #171

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_10 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `.claude/costs/sessions/2026-10/22354653-bee5-5919-af04-df2b0f1285f7.json`:25 — unresolved — last: @vzakharov (human) 2026-10-26T01:36:38Z — "кажется здесь должно было добавиться а не замениться" → [↓](#t01)
- **T02** `.claude/costs/sessions/2026-10/22354653-bee5-5919-af04-df2b0f1285f7.json`:31 — unresolved — last: @vzakharov (human) 2026-10-26T01:37:10Z — "возможно глюкануло потому что сессия сразу делала две ветки" → [↓](#t02)
- **T03** `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-26T01:38:34Z — "не оч понятно почему это находится в kernel если collection…" → [↓](#t03)
- **T04** `src/basilisk/scripts/lib/docket.ts`:9 — unresolved — last: @vzakharov (human) 2026-10-26T01:39:18Z — "почему (здесь и в аналогичных местах) относительный импорт?" → [↓](#t04)
- **T05** `src/maya/shared/i18n/messages/en.json`:1 — unresolved — last: @vzakharov (human) 2026-10-26T01:43:28Z — "почему это в shared, разве это не только машинкины штуки?" → [↓](#t05)
- **T06** `package.json`:45 — unresolved — last: @vzakharov (human) 2026-10-26T01:45:00Z — "что-то у нас здесь WET? почему не передавать название аппа п…" → [↓](#t06)

<a id="t01"></a>

### `.claude/costs/sessions/2026-10/22354653-bee5-5919-af04-df2b0f1285f7.json`:25 — unresolved

```diff
@@ -19,36 +19,37 @@
… 1 line elided …
       },
       {
-        "hours": 6.0,
+        "hours": 1.5,
         "grade": "senior",
         "role": "developer",
-        "comment": "carving the player into a feature and music's app layer is a shape call over ~40 files and a shared stylesheet, judged against masd.md's rules"
+        "comment": "resolving a merge of a whole new site's changes onto moved files takes judging, per file, which app each of main's changes belongs to"
```

**@vzakharov (human)** — 2026-10-26T01:36:38Z

кажется здесь должно было добавиться а не замениться

---

<a id="t02"></a>

### `.claude/costs/sessions/2026-10/22354653-bee5-5919-af04-df2b0f1285f7.json`:31 — unresolved

```diff
@@ -19,36 +19,37 @@
… 12 lines elided …
   },
   "sessionId": "22354653-bee5-5919-af04-df2b0f1285f7",
-  "branch": "masd/music-app",
+  "branch": "claude/multi-app-sliced-design-7bn3oq",
```

**@vzakharov (human)** — 2026-10-26T01:37:10Z

возможно глюкануло потому что сессия сразу делала две ветки

---

<a id="t03"></a>

### `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved

```diff
@@ -0,0 +1,10 @@
+import { articleCollection } from '@/kernel/shared/content';
```

**@vzakharov (human)** — 2026-10-26T01:38:34Z

не оч понятно почему это находится в kernel если collection -- блоговая штука?

---

<a id="t04"></a>

### `src/basilisk/scripts/lib/docket.ts`:9 — unresolved

```diff
@@ -4,33 +4,12 @@
… 11 lines elided …
->>>>>>> origin/main:scripts/lib/docket.ts
 
-import type { CollectionEntry } from './read-collection.ts';
+import type { CollectionEntry } from '../../../kernel/scripts/lib/read-collection.ts';
```

**@vzakharov (human)** — 2026-10-26T01:39:18Z

почему (здесь и в аналогичных местах) относительный импорт?

---

<a id="t05"></a>

### `src/maya/shared/i18n/messages/en.json`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T01:43:28Z

почему это в shared, разве это не только машинкины штуки?

---

<a id="t06"></a>

### `package.json`:45 — unresolved

```diff
@@ -38,36 +38,21 @@
… 1 line elided …
     "format": "prettier --write .",
     "format:check": "prettier --check .",
-<<<<<<< HEAD
     "content:mermaid": "scripts/in-site.sh vova node src/kernel/scripts/render-mermaid.ts",
     "content:og:vova": "scripts/in-site.sh vova tsx --conditions=react-server src/vova/scripts/render-og.ts",
     "content:og:bible": "scripts/in-site.sh bible tsx --conditions=react-server src/bible/scripts/render-og.ts",
     "content:og:basilisk": "scripts/in-site.sh basilisk tsx --conditions=react-server src/basilisk/scripts/render-og.ts",
+    "content:og:maya": "scripts/in-site.sh maya tsx --conditions=react-server src/maya/scripts/render-og.ts",
```

**@vzakharov (human)** — 2026-10-26T01:45:00Z

что-то у нас здесь WET? почему не передавать название аппа параметром вместо того чтобы прописывать каждую команду? если да, поменяй, плюс просвипь где аналогичная ситуация.

---

## Timeline (status, references, and other events)

- **2026-10-16T12:28:50Z** @vzakharov renamed from «feat: Multi-App Sliced Design — src/ as apps composed along a tree» to «feat: Multi-App Sliced Design — src/ as apps composed along a graph».
- **2026-10-16T12:31:05Z** @vzakharov cross-referenced this pull request from [#170 Multi-App Sliced Design: src/ as composed apps](https://github.com/vzakharov/vovazakharov.com/issues/170).
- **2026-10-16T12:31:06Z** @vzakharov cross-referenced this pull request from [#171 MASD core: the app graph, the move, both checkers and the inverted schema registry](https://github.com/vzakharov/vovazakharov.com/issues/171).
- **2026-10-16T21:46:33Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5551116833.
- **2026-10-17T08:15:49Z** @vzakharov cross-referenced this pull request from [#172 Name the site routers by domain: apps/<id>/ → sites/<domain>/](https://github.com/vzakharov/vovazakharov.com/issues/172).
- **2026-10-17T08:15:51Z** @vzakharov cross-referenced this pull request from [#173 Each app owns its namespace of the message catalogue](https://github.com/vzakharov/vovazakharov.com/issues/173).
- **2026-10-17T08:15:52Z** @vzakharov cross-referenced this pull request from [#174 Music as an app: album, artist, song and radio as real pages](https://github.com/vzakharov/vovazakharov.com/issues/174).
- **2026-10-17T08:15:54Z** @vzakharov cross-referenced this pull request from [#175 What is a page in a one-page app: a measure beside insignificant-slice](https://github.com/vzakharov/vovazakharov.com/issues/175).
- **2026-10-17T08:18:14Z** @vzakharov renamed from «feat: Multi-App Sliced Design — src/ as apps composed along a graph» to «feat: #170 Multi-App Sliced Design — src/ as apps composed along a graph».
- **2026-10-20T17:02:43Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5588667192.
- **2026-10-20T17:46:46Z** @vzakharov renamed from «feat: #170 Multi-App Sliced Design — src/ as apps composed along a graph» to «feat: #170 Multi-App Sliced Design — src/ as a graph of apps».
- **2026-10-20T18:17:42Z** @vzakharov cross-referenced this pull request from [#178 refactor: move each site's router from apps/ to sites/<id>/](https://github.com/vzakharov/vovazakharov.com/pull/178).
- **2026-10-24T11:16:43Z** @vzakharov cross-referenced this pull request from [#205 refactor: #170 the catalogue's model joins music/shared/catalogue](https://github.com/vzakharov/vovazakharov.com/pull/205).
- **2026-10-25T19:21:58Z** @vzakharov cross-referenced this pull request from [#207 refactor: #170 the player as music's feature, music's app layer](https://github.com/vzakharov/vovazakharov.com/pull/207).
- **2026-10-26T01:45:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5646475712.
