# PR #169: feat: #170 Multi-App Sliced Design — src/ as a graph of apps

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/169
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/multi-app-sliced-design-7bn3oq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-16T11:59:18Z
- **Updated:** 2026-10-26T02:29:31Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 6

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 9dff486). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-26T02:15:17Z — "/plainly поясни как будет выглядеть в результате структура п…" → [↓](#t01)
- **T02** `.claude/rules/stack.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T02:22:41Z — "так, исправление begs the question, а нам здесь нужно всё эт…" → [↓](#t02)
- **T03** `eslint/rules/no-relative-escape.test.ts`:21 — unresolved — last: @vzakharov (human) 2026-10-26T02:24:15Z — "мы тут реальные файлы прямо правим?" → [↓](#t03)
- **T04** `src/basilisk/scripts/lib/basilisk-card.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-26T02:26:07Z — "а к слову вопрос, что за скрипты такие, которые мы запускаем…" → [↓](#t04)
- **T05** `src/mushrooms/scripts/lib/flier-watch.ts`:18 — unresolved — last: @vzakharov (human) 2026-10-26T02:27:26Z — "хмм, но тут как раз наверное скорее правилен относительный и…" → [↓](#t05)
- **T06** `README.md`:39 — unresolved — last: @vzakharov (human) 2026-10-26T02:28:48Z — "кажется можно совместить в одну строку? или специально так д…" → [↓](#t06)

---

## Body

## Summary

- **What:** `src/` stops being one Feature-Sliced Design tree and becomes a set of apps — `kernel`, `shell`, `blog`, `music`, `mushrooms`, `vova`, `lsa`, `bible`, `basilisk` — each an FSD tree of its own, composed along a graph in `src/masd.json` where each app lists its parents, declared above it. `vova` is a composition of `blog`, `music` and `mushrooms`, which is what vovazakharov.com is.
- **Why:** FSD's rules are computed over the whole repo, so a self-contained app (music, the mushrooms game) collapses into one `pages/` slice holding everything, and the shared kernel ends up knowing leaf apps (`shared/content` imports the song schema and the basilisk case frontmatter).
- **The rule:** an app that extends `blog` *is* `blog` — an import may target the same app or an ancestor, only a strictly lower layer, through the slice's public API. A site's router only maps URLs to apps: each site's sitemap belongs to its leaf app, which hands its routes to kernel's sitemap factory, and the router's `sitemap.ts` only re-exports it. A relative import stays inside its slice, segmented layer or app `scripts/`, everything past that goes by `@/` — `vova/no-relative-escape`, whose one exemption, the files bare Node runs, is derived from `package.json`.
- **Per-site pnpm entries take the site as an argument** — `pnpm content:og vova --check`, `pnpm build maya`, a bare `pnpm build` still every site — through `scripts/site-task.sh`, instead of one entry per site.
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
- [ ] `relative-escape` — a relative import from `src/basilisk/shared/` into `src/kernel/` fails `pnpm lint:check`; `src/kernel/scripts/render-mermaid.ts`, which bare Node runs, keeps its relative imports and passes.
- [ ] `site-task` — `pnpm content:og maya --check` and `pnpm dev bible` run for the named site; a bare `pnpm build` builds every site; `pnpm dev` with no site fails naming the usage.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `builds` | integration | ✅ | `scripts/vet.sh` itself |
| `lattice` | integration | ❌ | Fixture files with an upward and a same-layer cross-app import, asserted to fail the generated boundaries policies; `eslint/masd-graph.test.ts` covers the graph they come from, not the policies |
| `significance` | unit | ✅ | `scripts/masd-check.test.ts` — slice used by two descendants vs. by one slice |
| `sites` | manual-only | — | Rendering correctness needs `/preview`; the build only proves each route renders |
| `sitemap` | e2e | ❌ | Build each site on `main` and the branch, diff the URL sets in `out/sitemap.xml` |
| `game` | unit | ✅ | `meadow-opening.test.ts` pins a fresh meadow to full day; the missing toggle is a `/preview` look |
| `music-links` | e2e | ❌ | Assert the built home links `/music` and the 404 carries the moved-song notice for an old song path |
| `relative-escape` | unit | ✅ | `eslint/rules/no-relative-escape.test.ts` — slice, layer and scripts homes, a bare-Node library, four escapes |
| `site-task` | integration | ❌ | Run `scripts/site-task.sh` with an echo template for one site, `--every`, and no site |

Closes #170
Closes #171

https://claude.ai/code/session_01PsxS6oCuC2yVr6e8eSZAZe
https://claude.ai/code/session_01S2jJtYpfBsib4tLTc8eM2u
https://claude.ai/code/session_01Vjv6g7vLNAMP6Z39YupG1q

https://claude.ai/code/session_012TzSzF1UMvkGzxb9jonqD3
https://claude.ai/code/session_01G8kJJMVk41ha3KrSd2pEby

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
read as its composition, its own app last, and a relative import stays
inside its slice, segmented layer or app scripts/, the rest going by
@/ (vova/no-relative-escape) bar the files bare Node runs. Per-site
pnpm entries take the site as an argument: pnpm build vova.

The game renders on a root layout of its own, without the theme
toggle, and a fresh meadow always opens in full day: dusk is a game
mechanic, not a reading of the colour scheme.

Closes #170
Closes #171

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_15 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-26T02:15:17Z — "/plainly поясни как будет выглядеть в результате структура п…" → [↓](#t01)
- **T02** `.claude/rules/stack.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T02:22:41Z — "так, исправление begs the question, а нам здесь нужно всё эт…" → [↓](#t02)
- **T03** `eslint/rules/no-relative-escape.test.ts`:21 — unresolved — last: @vzakharov (human) 2026-10-26T02:24:15Z — "мы тут реальные файлы прямо правим?" → [↓](#t03)
- **T04** `src/basilisk/scripts/lib/basilisk-card.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-26T02:26:07Z — "а к слову вопрос, что за скрипты такие, которые мы запускаем…" → [↓](#t04)
- **T05** `src/mushrooms/scripts/lib/flier-watch.ts`:18 — unresolved — last: @vzakharov (human) 2026-10-26T02:27:26Z — "хмм, но тут как раз наверное скорее правилен относительный и…" → [↓](#t05)
- **T06** `README.md`:39 — unresolved — last: @vzakharov (human) 2026-10-26T02:28:48Z — "кажется можно совместить в одну строку? или специально так д…" → [↓](#t06)

<a id="t01"></a>

### `sites/maya/app/blog/[...slug]/page.tsx`:1 — unresolved

```diff
@@ -0,0 +1,10 @@
+import { articleCollection } from '@/kernel/shared/content';
```

**@vzakharov (human)** — 2026-10-26T01:38:34Z

не оч понятно почему это находится в kernel если collection -- блоговая штука?

**@vzakharov (agent)** — 2026-10-26T02:06:06Z

Потому что там его держат kernel'овские же фабрики, а не потому что коллекции — kernel'овская штука. Из kernel за `shared/content` держатся: фабрика сайтмапа (добавляет маршруты коллекций), фабрика фидов, `constructMetadata` (ссылки на фиды в `<head>`) и скрипты kernel'а (`content-tree`, `read-collection`, `public-markdown`, плюс `PUBLIC_DIR` и `contentHash` в `og-job` и `render-mermaid`). Снаружи kernel его импортируют только blog и его потомки — basilisk, bible, music, maya, vova; ни shell, ни lsa, ни mushrooms. То есть это блоговая штука.

Предлагаю переезд в `blog/shared/content` отдельным укусом слона:
- в kernel остаются общие `PUBLIC_DIR` и `contentHash`, которым коллекции не нужны;
- сайтмап kernel'а берёт только маршруты, а маршруты коллекций к ним добавляет app-слой blog'а — так же, как сейчас vova добавляет маршруты CV и музыки;
- фабрика фидов и скрипты, читающие коллекции, переезжают в blog;
- `constructMetadata` получает ссылки на фиды аргументом.

Объём — около 80 файлов с импортами плюс эти четыре развязки. Беру следующим укусом, перед 5b (рекомендую), или пока оставить?

**@vzakharov (human)** — 2026-10-26T02:15:17Z

/plainly поясни как будет выглядеть в результате структура пжст

---

<a id="t02"></a>

### `.claude/rules/stack.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T02:22:41Z

так, исправление begs the question, а нам здесь нужно всё это перечисление вообще? (спросил != не нужно)

---

<a id="t03"></a>

### `eslint/rules/no-relative-escape.test.ts`:21 — unresolved

```diff
@@ -0,0 +1,129 @@
… 14 lines elided …
+  rmSync(root, { recursive: true, force: true });
+});
+
+function put(file: string, text: string): void {
+  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
+  writeFileSync(path.join(root, file), text);
+}
```

**@vzakharov (human)** — 2026-10-26T02:24:15Z

мы тут реальные файлы прямо правим?

---

<a id="t04"></a>

### `src/basilisk/scripts/lib/basilisk-card.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T02:26:07Z

а к слову вопрос, что за скрипты такие, которые мы запускаем не на "bare node"? кто их вообще и где запускает, и являются ли они технически скриптами?

---

<a id="t05"></a>

### `src/mushrooms/scripts/lib/flier-watch.ts`:18 — unresolved

```diff
@@ -8,14 +8,14 @@
… 11 lines elided …
-import { PATH_SHAPES } from '../../pages/mushrooms/model/insect-paths.ts';
-import { TURN_RATE } from '../../pages/mushrooms/model/insect-steering.ts';
+} from '@/mushrooms/pages/mushrooms/model/insect-motion';
+import { PATH_SHAPES } from '@/mushrooms/pages/mushrooms/model/insect-paths';
+import { TURN_RATE } from '@/mushrooms/pages/mushrooms/model/insect-steering';
```

**@vzakharov (human)** — 2026-10-26T02:27:26Z

хмм, но тут как раз наверное скорее правилен относительный  импорт, мы же не "покидаем" mushrooms? и это наверное не только к скриптам вопрос. (не уверен, пока просто спрашиваю)

---

<a id="t06"></a>

### `README.md`:39 — unresolved

```diff
@@ -33,12 +33,12 @@ and all of them build from the one `src/`.
… 4 lines elided …
-pnpm dev:lsa
-pnpm dev:bible
-pnpm dev:basilisk
+pnpm dev vova
+pnpm dev lsa
+pnpm dev bible
+pnpm dev basilisk
```

**@vzakharov (human)** — 2026-10-26T02:28:48Z

кажется можно совместить в одну строку? или специально так для удобства копирования?

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
- **2026-10-26T02:28:55Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/169#pullrequestreview-5646726048.
