# Multi-App Sliced Design (MASD)

`src/` stops being one FSD tree and becomes a set of apps, each an FSD tree of
its own, composed along a declared graph. The design was settled in the session
that wrote this plan; this file is what it settled and how the work is carved.

**This file outlives the merge.** The operator asked for it to be kept under
`docs/` as the reference for taking MASD outside the repo (a site of its own,
say): «его давай сохраним после мерджа где-то в docs, будем к нему возвращаться
если вдруг захотим продвигать тему вовне». So `/finalize` moves it to
`docs/masd.md` rather than sweeping it, the elephant's own sections dropped.

## How this elephant is eaten

PR #169 is the whole of MASD: it closes #170 and #171, and lands every slice
below on `main` in one merge. The slices are bites of it, not tickets of their
own. This loop is being dogfooded here, and moves to muthur if it holds up.

- **Slice 1 is built on the elephant's branch,
  `claude/multi-app-sliced-design-7bn3oq`.** Every later bite is a PR of its own
  whose base is that branch, so its commits and review threads stay off #169.
- **A bite starts only once every review thread on the previous bite's PR is
  resolved** — slice 1's on #169 itself. `/handle` attaches to one branch, so a
  bite opened over unresolved threads leaves them with no session to answer
  them.
- **A bite's PR carries its own edits to this file**: it folds itself into
  `## Eaten so far` and takes itself out of `## Rest of the elephant`, so the
  elephant's branch holds the current contract once the bite is merged into it.
- **`compare/fsd-vs-masd` follows every change to `.claude/rules/masd.md`.** The
  branch is `main` plus commits that each replace `.claude/rules/fsd.md`'s text
  with `masd.md`'s as it then stood, so GitHub shows the change against the
  retired `fsd.md` as one file's diff and its history as `masd.md`'s. A commit
  that edits `masd.md` is followed by one there, never force-pushed over.

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

## Eaten so far

Slice 1, the MASD core, short of `## Rest of the bite` below.

- **The graph** — `src/masd.json`, loaded only by `eslint/masd-graph.ts` (the
  schema, the order check, ancestors and descendants, insignificant apps,
  directory mismatches), tested on invented graphs with several parents and a
  diamond.
- **The tree** — the code moved into the nine apps, one `git mv` commit per app.
  kernel holds `shared/{config,content,i18n,lib,seo,typings,ui}`, `MUSIC_ROUTE`
  among content's addresses, and the base root layout, stylesheets, sitemap and
  feed factories in its app layer. shell holds `features/switch-theme`,
  `widgets/site-footer` and a root layout that is kernel's plus `ThemeCorner`.
  blog holds `entities/document` and `pages/documents`, with `ArticleSlots` in
  `shared/article-slots`; basilisk holds `entities/case` (and `CASE_SLOTS`),
  `pages/basilisk-home` and `shared/content`; bible, lsa and vova hold their
  pages, vova an app layer with the `global-not-found` page; music holds
  `pages/music` as it stood and `shared/catalogue`; mushrooms `pages/mushrooms`
  as it stood.
- **The registries** — the schema registry inverted: `articleCollection(id)` in
  kernel, `SONGS` in music's catalogue, `CASES` behind basilisk's
  `shared/content`; addresses stay kernel's. kernel imports no app above it:
  each site's `sitemap.ts` calls `sitemap(mountedRoutes)`, and
  `collectionFeed(collection, locale, source?)` takes a `FeedSource` (music
  exports `SONG_FEED`).
- **Two root layouts on vovazakharov.com** — `(shell)` for every page but the
  game, `(game)/mushrooms` on kernel's; `experimental.globalNotFound` on every
  site. A fresh meadow opens in full day, whatever the colour scheme, and the
  `dark` play in `scripts/play-mushrooms.ts` asserts it.
- **The checkers** — `eslint/masd-boundaries.ts` generates the boundaries config
  from the graph (folder patterns with `partialMatch`; `app` and `shared`
  overlay their ancestors' as one unit, sliced layers go strictly down);
  `pnpm lint:fsd` runs Steiger once per app with `insignificant-slice` off;
  `pnpm check:masd` (`scripts/masd-check.ts`, in `vet.sh`) checks the graph and
  counts slice references across the composition. Imports sort one group per app
  in graph order, the layers in order within each.
- **The conventions** — `.claude/rules/masd.md`, `fsd.retired.md` as the
  tombstone, citations repointed, CLAUDE.md's layout in its staged copy (the
  live CLAUDE.md cites `fsd.md` until `/finalize` swaps it in, so
  `check-skill-catalog` fails until then).

**Spike findings the rest builds on**: Steiger run per app root counts only that
root's references, wrong in both directions, and run on the parent of several
roots it finds no FSD root at all (Steiger 0.6.0); it skips gitignored paths, so
a spike goes in the scratchpad, run from the repo root so its config resolves.

## Rest of the bite

- **`story.tsx`, the operator's call.** `music/pages/music/ui/story.tsx` imports
  `@/blog/entities/document`, and music's parent is shell, not blog: either
  music extends `blog` as well as `shell`, or what `story.tsx` uses moves down
  to kernel. It is the one lint error left.
- **Moving what the game does not use out of kernel, the operator's call.** The
  game takes Mantine, the `--color-*` tokens, `cssColor` and `prose` only
  through kernel's root layout. The proposal: kernel's `app/styles/*`,
  `theme-provider.tsx` and `shared/ui` move to shell; kernel's `RootLayout`
  shrinks to `<html>`, metadata and analytics, and shell's layout adds the
  fonts, `mantineHtmlProps`, `ColorSchemeScript`, the global styles, the
  `ThemeProvider` and the script picker. The game then loses Mantine's `body`
  reset, so it needs a look on `/preview`.
- **A clean vet**, `VET_MEADOW=1`, and a look at each site.

## Rest of the elephant

In this order: the scripts move before music and the game are restructured, so
those slices carry their own tools along; the sites rename is independent of
every other slice.

- **2. Sites named by domain.** `apps/<id>/` → `sites/<domain>/`
  (`sites/vovazakharov.com/`, `sites/latestageagentic.com/`,
  `sites/agentic.bible/`, `sites/basilisk.fyi/`), so a router is named by what
  it serves and `src/` apps and site routers stop sharing the word "app".
  `scripts/in-site.sh`, `NEXT_PUBLIC_SITE`, `SITE_CONFIG`, `package.json`'s
  per-site entries and `.github/workflows/deploy.yml` follow. Weigh here whether
  each site also gets a composition app in `src/` — one whose parents are the
  apps the site mounts — so the sitemap's composition leaves the router.
- **3. App scripts live in their apps.** `src/<app>/scripts/`, beside the app's
  layers: an unknown folder at an app root is no layer to Steiger (checked on
  `src/basilisk`). A script is one more boundaries element, `script`, under the
  same inheritance: its own app and its ancestors through their public APIs,
  `index.node-safe.ts` included. Of `scripts/lib/`'s 84 files about 35 are the
  game's (`play-*`, `mushroom-probe-*`, `veer-*`, `flier-watch`…), about ten
  music's (`song-*`, `music-*`, `stanza-repeats`…), a few basilisk's
  (`basilisk-card`, `docket`) and vova's (`cv-card`), with the top-level scripts
  that use them (`play-mushrooms.ts`, `sweep-mushrooms.ts`, `veer-away.ts`,
  `scaffold-song.ts`, `check-song-titles.ts`…). The helpers several apps'
  scripts share (`cdp.ts`, `chromium.ts`, `argv.ts`) go to
  `src/kernel/scripts/`; root `scripts/` keeps the repo's and the agent's
  tooling (`vet.sh`, `staged.sh`, `export-github-item.py`, `masd-check.ts`…).
  `package.json` and every skill naming a moved script follow; Python scripts
  such as `letter-basilisk-seal.py` land under `src/` too.
- **4. Inverted message catalogue.** `kernel/shared/i18n` still holds every
  app's strings, so a kernel module knows all of its consumers — the inversion
  slice 1 did for schemas, left undone for messages. Each app owns its namespace
  of the catalogue, a site loads those of the apps it mounts, and
  `scripts/check-i18n-payload.ts` follows.
- **5. Music as an app.** `music-route.tsx`, which decides whether a URL shows
  an album, an artist, a song or the radio, becomes music's app layer, and those
  four become real pages under `music/pages/`. Which entities they share is
  decided by ordinary FSD once the pages exist. #82 and #86 touch music routing
  and are left as they are.
- **6. What is a page in a one-page app** — a deterministic measure beside
  `insignificant-slice`, then mushrooms restructured under it. The problem:
  mushrooms is a whole game on one URL, some 240 files — scene, creatures, day
  cycle, saves, the UI over the canvas — and FSD names a page by its URL, so it
  is all one `pages/mushrooms` slice. Splitting it the FSD way fails too:
  `entities/creature` or `widgets/meadow` each has exactly one consumer, which
  is what `insignificant-slice` flags, so the rule pushes everything back into a
  grab bag with its own unenforced structure. Any one-page app hits it — Claude
  Code on the web is one page, and nobody would put it in one slice — because a
  reference count cannot tell "used once because it is a detail of its consumer"
  from "used once because the app has one consumer at all". MASD sharpens it: as
  its own app, every slice mushrooms could have is insignificant by
  construction. Candidates to weigh: **boundary vs internal import edges** (a
  slice whose files mostly import each other, reached through a narrow surface,
  is a real module whoever its one consumer is) and **public-API width** (how
  much of a slice its consumers touch, against how much it holds). The
  deliverable is the measure, its threshold argued from this repo's real slices,
  its wiring into `scripts/masd-check.ts`, and then the game restructured.

## DRY notes

- **One graph, four readers.** `eslint/masd-graph.ts` is the only loader of
  `masd.json`; the boundaries config, the import sort, `lint:fsd`'s per-app runs
  and `masd-check.ts` all go through it, so no reader restates an ancestor list
  or an app name.
- **The layer order is restated, not shared**, in `masd-boundaries.ts` (the
  sliced four, highest first) and the import sort (all six, lowest first). It is
  FSD's fixed order, not something either file decides, and a shared constant
  would make each reader reshape it.
- **The significance check reimplements, not wraps, Steiger's rule**, because
  the rule's whole input is one root's reference map and the defect is that
  input. Its messages are kept word for word so a reader of either recognises
  the other.
- **Root layouts compose rather than copy.** shell's layout renders kernel's
  with `ThemeCorner` added; the mushrooms layout is kernel's as it stands. No
  layout restates the `<html>` shell.
- **One address registry.** `MUSIC_ROUTE` sits with `COLLECTIONS` and
  `collectionRoute` in kernel instead of a second map of mount points; the
  router's folders and these constants still agree by hand, which #86 is about.
- **Not extracted:** a `masd` package or a Steiger plugin. A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.
