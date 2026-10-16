> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Multi-App Sliced Design (MASD)

`src/` stops being one FSD tree and becomes a set of apps, each an FSD tree of
its own, composed along a declared tree. The design was settled in the session
that wrote this plan; this file is what it settled, the shape of the split, and
the first slice in full.

## The model

**Composition, not dependency: an app that extends `blog` _is_ `blog`.** Its FSD
tree is its ancestors' layers overlaid, plus its own. So:

- An import may target **the same app or an ancestor**, and only a **strictly
  lower layer** — or, inside the same app, its own slice. The same layer across
  apps is a sideways import, forbidden exactly as between two slices of one app.
- Entry across apps is through the **slice's public API**, as today. There is no
  app-level barrel: path-based checkers would lose the layer axis behind it, and
  one barrel per app cannot hold the `server-only` / `node-safe` split.
- An app with a single tree of layers and no ancestors is plain FSD, so every
  FSD project is a one-node MASD project.

**The tree is data**, `src/masd.json`, validated by a zod schema at load:

```json
{
  "apps": {
    "kernel": {
      "shell": {
        "blog": { "basilisk": null, "bible": null, "vova": null },
        "lsa": null,
        "music": null
      },
      "mushrooms": null
    }
  },
  "sites": {
    "vovazakharov.com": ["vova", "music", "mushrooms"],
    "latestageagentic.com": ["lsa"],
    "agentic.bible": ["bible"],
    "basilisk.fyi": ["basilisk"]
  }
}
```

`vova` sits under `blog` because the case studies are served by
`pages/documents`.

**A site is a composition node, the one place with several parents.** The tree
says who may import whom; a site mounts several apps that are siblings (vova,
music, mushrooms), and something has to put them together. Three things already
need that: the collection registry and the sitemap/feed built from it, vova's
home and 404 linking into `/music` (`MUSIC_ROUTE`, the moved-song lookup), and
later #82's site-wide player. So each site gets `src/sites/<domain>/`, an
app-layer-only unit (`ui`, `lib`) that may import any layer's public API of the
apps it mounts and their ancestors. The router under `apps/<site>/app/` stays
routing-only and re-exports from it.

**An abstract app is earned the way a slice is**: a non-leaf with one child is
insignificant. Today `kernel` (2), `shell` (3) and `blog` (3) pass; a `game`
between `kernel` and `mushrooms` waits for a second game.

## Slices

The work is carved into PR-sized children of one parent: the core lands on
`main` before the music and mushrooms restructuring starts, and the sites rename
is independent of everything else. No open issue covers any of it; #82 and #86
touch music routing and are left as they are.

- **Parent — Multi-App Sliced Design: `src/` as composed apps.**
- **1. MASD core** — the tree, the move, both checkers, the registry inversion,
  the shell split and the mushrooms layout. _This plan specs it, below._
- **2. Sites named by domain** — `apps/<id>/` → `sites/<domain>/`, with
  `scripts/in-site.sh`, `NEXT_PUBLIC_SITE`, `SITE_CONFIG`, `package.json` and
  `deploy.yml` following; `SITE_CONFIG`'s per-site data moves to the site nodes.
- **3. Inverted message catalogue** — `kernel/shared/i18n` stops holding every
  app's strings; each app owns its namespace, each site node merges what it
  mounts (`scripts/check-i18n-payload.ts` follows).
- **4. Music as an app** — `music-route.tsx` becomes music's app layer, and
  album, artist, song and radio become real pages; the entities they share are
  decided by ordinary FSD.
- **5. What is a page in a one-page app** — mushrooms, and a deterministic
  measure (boundary vs internal import edges, public-API width) to stand beside
  `insignificant-slice`. The issue body carries the problem statement written in
  this session, and is the file that PR starts from.

## Slice 1 — MASD core

### Spike findings this slice is built on

- **Steiger run per app root counts only that root's references**, so it is
  wrong in both directions: a `kernel` slice used once inside `kernel` and twice
  from `blog` is reported as having one reference; one used only from
  descendants as having none. Steiger run on the parent of several roots finds
  no FSD root at all. Reproduced in a scratch copy, Steiger 0.6.0.
- **Steiger skips gitignored paths**, so no spike under `tmp/` says anything.

### Steps

1. **The tree and its loader.** `src/masd.json`, and `eslint/masd-tree.ts`: the
   zod schema, `ancestors(app)`, `appsOf(site)`, and the check that every app in
   the tree has a directory under `src/` and every directory a node. It lives
   under `eslint/` because the config loads under jiti and imports relatively;
   the scripts import it from there.
2. **Move the code** (`git mv`, one commit per app so the history follows):
   - `kernel` — `shared/{config,i18n,lib,seo,typings,ui,content}`, and an app
     layer with the base root layout (fonts, globals, Mantine provider and
     `ColorSchemeScript`), `feed` and `sitemap` as functions over a collection
     list.
   - `shell` — `features/switch-theme`, `widgets/site-footer`, and an app layer
     whose root layout is kernel's plus `ThemeCorner`.
   - `blog` — `entities/document`, `pages/documents`.
   - `basilisk` — `entities/case`, `pages/basilisk-home`, and
     `shared/content/basilisk-frontmatter.ts` as its own shared segment.
   - `bible` — `pages/bible-home`. `lsa` — `pages/lsa-home`.
   - `vova` — `pages/{home,cv,writing,not-found}`.
   - `music` — `pages/music` as it stands, and `shared/music-catalogue` as
     `shared/catalogue`: a separate root, so Steiger's `ambiguous-slice-names`
     no longer sees `pages/music` beside it.
   - `mushrooms` — `pages/mushrooms` as it stands.
   - `sites/<domain>` — the composition each router re-exports.
3. **Invert the collection registry.** `kernel/shared/content` keeps the
   pipeline, the base and article schemas and the `Collection` type, and stops
   importing the song schema and the case frontmatter. Each app exports the
   collections it serves; each site node assembles its list, which `feed`,
   `sitemap`, `generateStaticParams` and the render scripts read. The
   `CollectionId` keying that fails compilation on a missing schema is kept at
   the site node, where the full list now is.
4. **Cross-app links through the site node.** vova's home and 404 take the music
   route and the moved-song lookup as props from `src/sites/vovazakharov.com`,
   rather than importing music.
5. **Two root layouts on vovazakharov.com.** Route groups: `(shell)` for every
   page but the game, `(game)/mushrooms` on kernel's root layout, with no theme
   toggle. Verify before building on it: `not-found` and a static export under
   multiple root layouts (Next 16's `global-not-found`), and that the full
   reload between groups is the only cost.
6. **A fresh meadow always opens in full day.** Dusk is a game mechanic, not a
   preference: drop `schemeIsDark` / `darkScheme` and their test, and open a
   fresh meadow at `FULL_DAY`; a kept meadow reopens as it was left.
7. **`eslint-plugin-boundaries` from the tree.** Elements become
   `src/(app)/(layer)/(slice)/**`, plus the site nodes; policies are generated
   from `masd.json`: same app or ancestor, strictly lower layer, public API.
   `shared` stays one slice per app; `shared/lib`'s per-file entry is kept.
8. **Steiger per app root**, one run per app in `pnpm lint:fsd`, with
   `fsd/insignificant-slice` off — the spike shows it cannot be right per root.
9. **`scripts/masd-check.ts`** replaces it: slice references counted across the
   composition (the app itself, its descendants, the site nodes), Steiger's two
   messages reproduced, plus the tree's own checks — insignificant abstract app,
   tree and directories in agreement. Tests beside it, wired into
   `scripts/vet.sh`.
10. **Conventions.** `.claude/rules/fsd.md` becomes `.claude/rules/masd.md` with
    the model above, its tombstone scoped by `paths:` so it never loads on every
    turn, and every in-tree citation updated. CLAUDE.md § "Repository layout"
    changes through a staged copy.
11. **Vet**: all four builds, and a look at each site with `/preview`, the game
    on its own layout among them.

### DRY notes

- **One tree, three readers.** `eslint/masd-tree.ts` is the only loader of
  `masd.json`; the boundaries config, `lint:fsd`'s per-app runs and
  `masd-check.ts` all go through it, so no reader restates an ancestor list.
- **The policy generator extends the existing one.** `eslint.config.ts` already
  builds its policies from `FSD_LAYERS`; the tree adds a second `flatMap` over
  apps around it, and `PUBLIC_API` and `SHARED_LIB_ENTRY` are reused unchanged.
- **The significance check reimplements, not wraps, Steiger's rule**, because
  the rule's whole input is one root's reference map and the defect is that
  input. Its messages are kept word for word so a reader of either recognises
  the other.
- **Root layouts compose rather than copy.** shell's layout renders kernel's
  with `ThemeCorner` added; the mushrooms layout is kernel's as it stands. No
  layout restates the `<html>` shell.
- **Collection lists are assembled once per site**, in its node, and every
  consumer (`feed`, `sitemap`, the routes, the render scripts) takes the list;
  none rebuilds it from the apps.
- **Not extracted:** a `masd` package or a Steiger plugin. A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.
