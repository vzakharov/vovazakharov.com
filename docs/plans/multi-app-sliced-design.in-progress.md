# Multi-App Sliced Design (MASD)

`src/` stops being one FSD tree and becomes a set of apps, each an FSD tree of
its own, composed along a declared graph. The design was settled in the session
that wrote this plan; this file is what it settled, the shape of the split, and
the first slice in full.

**This file outlives the merge.** The operator asked for it to be kept under
`docs/` as the reference for taking MASD outside the repo (a site of its own,
say): «его давай сохраним после мерджа где-то в docs, будем к нему возвращаться
если вдруг захотим продвигать тему вовне». So `/finalize` moves it to
`docs/masd.md` rather than sweeping it, the progress section below dropped.

## Progress

Issues filed: parent #170, children #171–#175, linked as sub-issues; PR #169
closes #171.

- **Done** — step 1: `src/masd.json`, `eslint/masd-graph.ts` and its tests
  (0a27055).
- **Done** — step 2: one `git mv` commit per app, then 6543211 rewrote every
  reference (tsc clean). `MUSIC_ROUTE` is `kernel/shared/content/music-route.ts`
  in kernel's content barrel; `basilisk-frontmatter.ts` sits in
  `src/basilisk/shared/content/`; shell's root layout is kernel's plus
  `ThemeCorner`, mounted by all four routers (the game's own layout is step 5).
  The rewrite only re-pointed `eslint.config.ts`'s element patterns at
  `src/kernel/...` — step 7 replaces them — and left prose naming bare layer
  paths (`src/pages/`, `shared/content`) for step 10.
- **Done** — step 3 (3092734): `collection-schemas.ts` gone;
  `articleCollection(id)` in kernel's `frontmatter.ts`, `SONGS` in music's
  catalogue (its frontmatter now enters kernel's content barrel, the cycle being
  gone), `CASES` behind a new `basilisk/shared/content` barrel (its leaf import
  of kernel's frontmatter kept, `read-docket.ts` parsing with it).
  `articleRoute(handle, slots = {})`; `ArticleSlots` in
  `blog/shared/article-slots`; `CASE_SLOTS` in `basilisk/entities/case`, which
  no longer exports `CaseBrief`/`NoAiNote`. Also: `simple-import-sort` groups by
  layer across apps (`^@/[^/]+/<layer>/`), the tree re-sorted. tsc clean on all
  four sites.
- **Done** — step 4: kernel imports no child app. `sitemap(mountedRoutes)` is a
  factory each site's `sitemap.ts` calls (Next calls the default export with
  arguments of its own); vova's passes `PAGE_ROUTES`, `cvRoutes()` and
  `musicCatalogueRoutes()`. `collectionFeed(collection, locale, source?)` takes
  a `FeedSource` (kernel's `shared/content`), and music exports `SONG_FEED`. The
  routers sort `@/kernel/app` last — the layer sort reads it as the top layer.
- **Done** — step 5: `apps/vova/app/(shell)/` holds every route but the game, on
  shell's root layout; `(game)/` holds `mushrooms` on kernel's.
  `global-not-found.tsx` re-exports vova's new app layer
  (`src/vova/app/ui/global-not-found.tsx`: shell's layout around
  `NotFoundPage`), and `siteNextConfig` sets `experimental.globalNotFound` for
  every site. Verified on a `build:vova` export: `404.html` renders the page
  with the theme toggle, `mushrooms.html` has none, both carry the icon, the
  sitemap and both songs feeds come out whole.
- **Done** — step 6: `darkScheme`, `schemeIsDark` and their test gone;
  `meadowOpening(opening)` takes no dusk, a fresh meadow being `firstMeadow`'s
  `FULL_DAY`. The `dark` play in `scripts/play-mushrooms.ts` is kept, inverted:
  a dark page must open in full day. Not yet run — it needs a build and the
  meadow's play run, which `VET_MEADOW=1` at step 11 covers.
- **Done** — step 7 (43df71b): `eslint/masd-boundaries.ts` generates the
  boundaries config from the graph; `eslint.config.ts` imports it. Elements are
  folder patterns (`src/*/<layer>/*`, `apps/*/app`) with `partialMatch: true`: a
  `(*)` group captures twice, and a trailing `/**` makes the whole file the
  element root, which breaks `fileInternalPath`. The segmented layers, `app` and
  `shared`, overlay their ancestors' as one unit — a root layout composes the
  one it extends, a shared segment builds on its ancestor's directly; sliced
  layers go strictly down, same layer across apps refused. Probed: a
  non-ancestor's shared, an ancestor's pages and an ancestor's shared internals
  are each refused. The `no-hardcoded-strings` exemption names the moved slices.
  Full eslint is clean but for `story.tsx` (the open question below).
- **Done** — step 8 (62241f0): `pnpm lint:fsd` is `scripts/lint-fsd.ts`, Steiger
  once per app from the graph; `insignificant-slice` off, the `no-ui-in-app`
  exemption widened to `./src/*/app/ui/**`. All nine roots clean. Also dropped
  three file-local exports knip flagged.
- **Done** — step 9 (aca91f5): `scripts/masd-check.ts` (`pnpm check:masd`, in
  `vet.sh` and `.claude/rules/stack.md`), with CLI tests in
  `scripts/masd-check.test.ts`. Clean on the real tree.
- **Left** — steps 10–11. Step 10's prose: `.claude/rules/fsd.md` still
  describes the one-tree layout (and `eslint/masd-graph.ts`,
  `eslint/masd-boundaries.ts`, `scripts/lint-fsd.ts`, `scripts/masd-check.ts`
  already cite `.claude/rules/masd.md`, which step 10 creates).
- **Open, the operator's call** — `music/pages/music/ui/story.tsx` imports
  `@/blog/entities/document` (music's parent is shell, not blog): music
  extending `blog` as well as `shell`, or what `story.tsx` uses moving down to
  kernel.

## The model

**Composition, not dependency: an app that extends `blog` _is_ `blog`.** Its FSD
tree is its ancestors' layers overlaid, plus its own. So:

- An import may target **the same app or an ancestor**, and only a **strictly
  lower layer** — or, inside the same app, its own slice. The same layer across
  apps is a sideways import, forbidden exactly as between two slices of one app;
  so is any import between apps neither of which is the other's ancestor.
- Entry across apps is through the **slice's public API**, as today. There is no
  app-level barrel: path-based checkers would lose the layer axis behind it, and
  one barrel per app cannot hold the `server-only` / `node-safe` split.
- **An app may have several parents.** Nothing uses that today, and it is
  allowed because "this one is both a blog and a game" is a plausible next app.
  A diamond is harmless — inheriting is only the right to import, nothing
  overrides anything — and two ancestors may hold slices of the same name, the
  importer renaming one where its context needs it.
- An app with no ancestors is plain FSD, so every FSD project is a one-app MASD
  project.

**The graph is data**, `src/masd.json`, each app listing its parents:

```json
{
  "kernel": [],
  "shell": ["kernel"],
  "blog": ["shell"],
  "music": ["shell"],
  "lsa": ["shell"],
  "vova": ["blog"],
  "bible": ["blog"],
  "basilisk": ["blog"],
  "mushrooms": ["kernel"]
}
```

**A parent is declared above its child, and that is the acyclicity check**: a
cycle needs some app whose parent comes after it, which the order forbids, so
one pass from the top settles it. The order guarantees acyclicity, not
permission — `lsa` sits below `music` and still may not import it. JS keeps the
insertion order of non-numeric string keys, so the loader reads the order off
the parsed object, and fails naming both apps when a parent comes late.

**An abstract app is earned the way a slice is**: an app with exactly one child
and nothing of its own mounted by a router is insignificant. Today `kernel` (2
children), `shell` (3) and `blog` (3) pass; a `game` between `kernel` and
`mushrooms` waits for a second game.

**A router only says what is shown at which URL.** `apps/<site>/app/` maps
addresses to apps — on vovazakharov.com, `/` and `/cv` to vova, `/music/...` to
music, `/mushrooms` to mushrooms — and nothing else composes them, because
nothing else needs to: what vova takes from music is two addresses, and
addresses are kernel's. The sitemap is that same mapping written out, so it is
the router's: `sitemap.ts` concatenates the routes each app it mounts exports.

## Slices

The work is carved into PR-sized children of one parent: the core lands on
`main` before the music and mushrooms restructuring starts, and the sites rename
is independent of everything else. No open issue covers any of it; #82 and #86
touch music routing and are left as they are.

- **Parent — Multi-App Sliced Design: `src/` as composed apps.**
- **1. MASD core** — the graph, the move, both checkers, the schema registry
  inverted, the shell split and the mushrooms layout. _This plan specs it,
  below._
- **2. Sites named by domain** — `apps/<id>/` → `sites/<domain>/`, with
  `scripts/in-site.sh`, `NEXT_PUBLIC_SITE`, `SITE_CONFIG`, `package.json` and
  `deploy.yml` following.
- **3. Inverted message catalogue** — `kernel/shared/i18n` stops holding every
  app's strings; each app owns its namespace, and a site loads those of the apps
  it mounts (`scripts/check-i18n-payload.ts` follows).
- **4. Music as an app** — `music-route.tsx` becomes music's app layer, and
  album, artist, song and radio become real pages; the entities they share are
  decided by ordinary FSD.
- **5. What is a page in a one-page app** — mushrooms, and a deterministic
  measure (boundary vs internal import edges, public-API width) to stand beside
  `insignificant-slice`. The issue body carries the problem statement — a whole
  game on one page, the Claude Code Web analogy, why `insignificant-slice` then
  forces a grab bag — and is the file that PR starts from.

## Slice 1 — MASD core

### Spike findings this slice is built on

- **Steiger run per app root counts only that root's references**, so it is
  wrong in both directions: a `kernel` slice used once inside `kernel` and twice
  from `blog` is reported as having one reference; one used only from
  descendants as having none. Steiger run on the parent of several roots finds
  no FSD root at all. Reproduced in a scratch copy, Steiger 0.6.0.
- **Steiger skips gitignored paths**, so a spike under `tmp/` reports nothing;
  spike in the scratchpad, running Steiger from the repo root so its config
  resolves.

### Steps

1. **The graph and its loader.** `src/masd.json`, and `eslint/masd-graph.ts`:
   the zod schema, the order check, `ancestors(app)`, the insignificant-app
   check, and the check that every app in the graph has a directory under `src/`
   and every directory an entry. It lives under `eslint/` because the config
   loads under jiti and imports relatively; the scripts import it from there.
   Tests beside it on invented graphs, several parents and a diamond among them,
   since the real graph exercises neither.
2. **Move the code** (`git mv`, one commit per app so the history follows):
   - `kernel` — `shared/{config,i18n,lib,seo,typings,ui,content}`, `MUSIC_ROUTE`
     joining the addresses `shared/content` already owns, and an app layer with
     the base root layout (fonts, globals, Mantine provider and
     `ColorSchemeScript`), and `feed` and the sitemap's per-collection half as
     functions.
   - `shell` — `features/switch-theme`, `widgets/site-footer`, and an app layer
     whose root layout is kernel's plus `ThemeCorner`.
   - `blog` — `entities/document`, `pages/documents`.
   - `basilisk` — `entities/case`, `pages/basilisk-home`, and
     `shared/content/basilisk-frontmatter.ts` as its own shared segment.
   - `bible` — `pages/bible-home`. `lsa` — `pages/lsa-home`.
   - `vova` — `pages/{home,cv,writing,not-found}`.
   - `music` — `pages/music` as it stands, and the rest of
     `shared/music-catalogue` as `shared/catalogue`: a separate root, so
     Steiger's `ambiguous-slice-names` no longer sees `pages/music` beside it.
   - `mushrooms` — `pages/mushrooms` as it stands.
3. **Invert the schema registry, keep the address registry.** Where a collection
   lives — its id, base, site, `localized` — stays in kernel's `COLLECTIONS`,
   since addresses are kernel's. What a collection holds moves to its owner: the
   song schema to music, the case frontmatter to basilisk, the article schema
   staying in kernel beside the base one. `COLLECTION_SCHEMAS` goes:
   `listAllDocuments` reads every collection through the base schema, which is
   all a caller across collections wants, and each app's routes read their own
   collection through their own schema.
4. **The router composes the sitemap.** `sitemap.ts` on each site concatenates
   kernel's per-collection routes and the routes each mounted app exports
   (vova's CV addresses, music's catalogue routes); kernel's sitemap stops
   importing `pages/cv` and `pages/music`.
5. **Two root layouts on vovazakharov.com.** Route groups: `(shell)` for every
   page but the game, `(game)/mushrooms` on kernel's root layout, with no theme
   toggle. Verify before building on it: `not-found` and a static export under
   multiple root layouts (Next 16's `global-not-found`), and that the full
   reload between groups is the only cost.
6. **A fresh meadow always opens in full day.** Dusk is a game mechanic, not a
   preference: drop `schemeIsDark` / `darkScheme` and their test, and open a
   fresh meadow at `FULL_DAY`; a kept meadow reopens as it was left.
7. **`eslint-plugin-boundaries` from the graph.** Elements become
   `src/(app)/(layer)/(slice)/**`, plus `apps/(site)/app/**` as a `router`
   element that may enter any app's public API; policies are generated from
   `masd.json`: same app or ancestor, strictly lower layer, public API. `shared`
   stays one slice per app; `shared/lib`'s per-file entry is kept.
8. **Steiger per app root**, one run per app in `pnpm lint:fsd`, with
   `fsd/insignificant-slice` off — the spike shows it cannot be right per root.
9. **`scripts/masd-check.ts`** replaces it: slice references counted across the
   composition (the app itself, its descendants, the routers), Steiger's two
   messages reproduced, plus the graph's own checks from step 1. Tests beside
   it, wired into `scripts/vet.sh`.
10. **Conventions.** `.claude/rules/fsd.md` becomes `.claude/rules/masd.md` with
    the model above, its tombstone scoped by `paths:` so it never loads on every
    turn, and every in-tree citation updated. CLAUDE.md § "Repository layout"
    changes through a staged copy.
11. **Vet**: all four builds, and a look at each site with `/preview`, the game
    on its own layout among them.

### DRY notes

- **One graph, three readers.** `eslint/masd-graph.ts` is the only loader of
  `masd.json`; the boundaries config, `lint:fsd`'s per-app runs and
  `masd-check.ts` all go through it, so no reader restates an ancestor list.
- **The policy generator extends the existing one.** `eslint.config.ts` already
  builds its policies from `FSD_LAYERS`; the graph adds a second `flatMap` over
  apps around it, and `PUBLIC_API` and `SHARED_LIB_ENTRY` are reused unchanged.
- **The significance check reimplements, not wraps, Steiger's rule**, because
  the rule's whole input is one root's reference map and the defect is that
  input. Its messages are kept word for word so a reader of either recognises
  the other.
- **Root layouts compose rather than copy.** shell's layout renders kernel's
  with `ThemeCorner` added; the mushrooms layout is kernel's as it stands. No
  layout restates the `<html>` shell.
- **One address registry.** `MUSIC_ROUTE` joins `COLLECTIONS` and
  `collectionRoute` in kernel instead of a second map of mount points; the
  router's folders and these constants still agree by hand, which #86 is about.
- **Not extracted:** a `masd` package or a Steiger plugin. A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.
