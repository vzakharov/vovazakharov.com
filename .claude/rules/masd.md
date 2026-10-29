---
description: Multi-App Sliced Design for src/ — apps composed along src/masd.json, each an FSD tree, the routers, public API and the Next.js traps around them
paths:
  - src/**
  - sites/*/app/**
  - eslint/masd-*.ts
  - scripts/lint-fsd.ts
  - scripts/masd-check.ts
  - steiger.config.mjs
---

# MASD (Multi-App Sliced Design)

`src/` is a set of apps, each a
[Feature-Sliced Design](https://feature-sliced.design/) tree of its own
(`src/<app>/<layer>/<slice>/`), composed along the graph in `src/masd.json`.
Each site's `sites/<site>/app/` is a Next.js App Router and nothing else. Four
checkers enforce what follows, all run by `./scripts/vet.sh`:

- **`eslint-plugin-boundaries`** (`eslint/masd-boundaries.ts`, generated from
  the graph) — every import, across apps included.
- **Steiger** (`pnpm lint:fsd`, `scripts/lint-fsd.ts`) — FSD's own rules, one
  run per app root.
- **`pnpm check:masd`** (`scripts/masd-check.ts`) — the graph's checks, and
  slice significance counted across the composition.
- **`pnpm check:poison`** (`scripts/poison-check.ts`) — across whole import
  chains, which `boundaries` judges one import at a time: no `'use client'` file
  reaches `server-only` or an `index.no-browser.ts`, and no script entry run
  without the `react-server` condition reaches `server-only`. Its header says
  which files are roots.

`eslint/masd-graph.ts` is the only loader of `masd.json`; the first three go
through it, and so does the import sort, which groups imports one app at a time
in graph order.

## The model

**Composition, not dependency: an app that extends `blog` _is_ `blog`.** Its FSD
tree is its ancestors' layers overlaid, plus its own. So:

- **An import targets the same app or an ancestor, a strictly lower layer** —
  or, inside its own slice, a sibling file. The same layer across apps is
  sideways, forbidden exactly as between two slices of one app; so is any import
  between apps neither of which is the other's ancestor.
- **Across slices and apps, entry is through the slice's public API.** There is
  no app-level barrel: a path-based checker would lose the layer axis behind it,
  and one barrel per app cannot hold the `server-only` / `node-safe` split.
- **An app may have several parents.** A diamond is harmless — inheriting is
  only the right to import, nothing overrides anything — and two ancestors may
  hold slices of the same name, the importer renaming each where it needs both.
- **An app with no ancestors is plain FSD**, so every FSD project is a one-app
  MASD project.

**`masd.json` maps each app to its parents, and a parent is declared above its
child.** That order is the acyclicity check — a cycle needs some app whose
parent comes after it — and the loader fails naming both apps when one does. It
guarantees acyclicity, not permission: `lsa` sits below `music` and still may
not import it.

**An abstract app is earned the way a slice is.** An app with exactly one child
and nothing of its own a router mounts is insignificant, and `check:masd` says
so: a `game` between `kernel` and `mushrooms` waits for a second game.

**Every app under `src/` has an entry and every entry a directory**, which
`check:masd` holds both ways.

## Layers

Lowest (most generic) first, each optional per app:

- **`shared/`** — segments carrying no page composition. `kernel` holds the
  repo-wide ones (`cache`, `config`, `feed`, `i18n`, `seo`, `typings`, `lib/*`);
  an app adds its own (`shell/shared/ui`, `blog/shared/content`,
  `music/shared/catalogue`, `basilisk/shared/content`,
  `blog/shared/article-slots`).
- **`entities/`** — business nouns: `blog/entities/document` (its byline, its
  cards, its body and its sources), `basilisk/entities/case` (its brief),
  music's `cover`, `hook` and `song`.
- **`features/`** — user-facing capabilities: `shell/features/switch-theme`.
- **`widgets/`** — composite blocks two page slices share:
  `shell/widgets/site-footer`, `music/widgets/catalogue-header`.
- **`pages/`** — page composition, one or more per app.
- **`app/`** — root layouts, Mantine provider, global stylesheets and theme,
  sitemap and feed: `ui`, `styles` and `lib` segments.

An entity is earned once a block is a business noun's own UI: `document` holds
the byline, the collection's cards and the rendered body, all about a document
and nothing else. A layer is still optional and **inventing one costs more than
leaving it out** (see "insignificant slices" below), so an entity waits for that
— a noun with UI worth naming, not the mere idea of one.

**A block two page slices share cannot sit in either of them** — slices may not
reach each other sideways — so it drops to a lower layer, in the lowest app both
consumers inherit, and which of the three below `pages/` takes it turns on what
the block _is_, not on the fact that it is shared:

- **`entities/`** — the block is one business noun's UI. `DocumentCards`
  (reaches `shared/content` for a route) and `DocumentMeta` are about a document
  and nothing else, so they are `entities/document/ui`; a list of one entity's
  cards is that entity's UI, not a widget. FSD asks no model of an entity, so a
  ui-only one is a legal form. Showing is the test, not stillness: music's
  `CoverZoom` opens a dialog, but changes nothing past it, so it is the cover's
  UI; a block changing state the rest of the site sees (the player) is a
  feature.
- **`widgets/`** — the block _combines_ rather than belonging to one noun.
  `SiteFooter` is the site's foot, not a document's; music's `CatalogueHeader`
  sets a cover, a title's gloss and facts together.
- **`shared/ui`** — the block knows no business noun: a primitive any page could
  set, whatever it shows. `SummaryCard` is a heading and a blurb, `NotedSpan` a
  popover on words; music's `FactLine` is a row of facts. It is the barrel
  client components import, so a component there takes what it needs as props.

**Blocks that import each other go in one slice or on different layers.** A
sliced layer forbids the sideways import, so components that call each other
group by the noun they share (`CoverHead` and the `CoverZoom` inside it are one
`cover`), and whatever composes them sits a layer up.

`entities/document` is born ui-only: its model stays in blog's `shared/content`,
which is build-time and `server-only`, so a content page costs zero client JS —
the model would move only if content ever stopped being build-time. Its barrel
pulls `server-only` today (`DocumentCards` needs `linkTo`), but no client chain
enters it, so a plain `index.ts` holds; a client component reaching for the
byline is what would split it into `index.ts` + `index.server-only.ts`, exactly
as `shared/config` is.

## Rules

- **`app` and `shared` are segmented rather than sliced, so a descendant's
  overlays its ancestors' as one unit**, which is FSD's own exception carried
  across apps: every file in them reaches every other directly, an ancestor's
  included. shell's root layout composes kernel's that way, and
  `music/shared/catalogue` builds on blog's `shared/content` by its leaf module.
  A segment's `index.ts` is what the layers _above_ enter by, not a wall between
  `shared/ui` and `shared/seo`.
- **Public API per slice and per shared segment.** A sliced layer reaching
  another slice — in its own app or an ancestor — goes through the target's
  `index.ts`; reaching into its internals is an error from both checkers. Within
  a slice, use relative imports.
- **Three suffixed barrels join `index.ts` as legal entry points**, and the list
  is closed at those four names (`PUBLIC_API` in `eslint/masd-graph.ts`).
  `index.ts` keeps the majority surface, so a consumer needing no suffix never
  learns they exist.
  - **`index.server-only.ts`** is the client-bundle axis: what a browser must
    not hold. Every module behind it opens with `import 'server-only'`, which is
    what enforces the split the barrel only names. Two segments are split this
    way, each on what a client bundle may hold rather than on what a module
    happens to do: `shared/seo` keeps `OG_CARD_SUFFIX` in the ordinary barrel
    and puts `constructMetadata` behind the other, because `vova/pages/cv`'s URL
    module reads the suffix and a client component reads that; `shared/config`
    puts `BUILD_YEAR` behind it, which is evaluated once per deploy and would
    otherwise re-evaluate at hydration. A fence wants a reason of that kind: a
    dependency's weight is not one, since removing the dependency removes the
    fence and whatever was built on it.
  - **`index.node-safe.ts`** is the bundler axis: what resolves under an app's
    `scripts/` and its tests, which run with none — so the graph behind it holds
    no CSS, JSX or asset import, and carries no `server-only`, which throws
    outside a React server bundle. `shared/config` has one, over
    `resolveSiteId`, blog's `shared/content` one over the collection registry
    and the mermaid paths, and `entities/case` one over the grade stamp's text,
    which the case's social card prints. A script reaching past a public API
    into a leaf is the smell that this barrel is missing. Carrying no
    `server-only`, it is also the client components' entry into a segment whose
    `index.ts` is server-only: `music/shared/catalogue`'s, where the player and
    the hook line take what they read.
  - **`index.no-browser.ts`** is where the two meet: what a script running with
    no bundler takes and a browser must not hold — `node:fs` reads. It cannot
    carry `server-only`, which would throw in the script, so its name is its
    guard, and `check:poison` reads the name. `music/shared/catalogue` puts
    `readCatalogueNames` behind it, since the ordinary barrel resolves the site
    on import and a script may run with none.
- **`index.test-only.ts` is test code's entry, and no one else's** (`TEST_API`
  in `eslint/masd-graph.ts`): what a test reads of a lower slice that nothing in
  production does — a constant it pins, a helper it calls on its own. A test
  checking a lower module on the screens a page lays out sits in that page, and
  enters the module's slice by this barrel beside its public API — the
  `index.node-safe.ts` one where the slice's `index.ts` loads a module that
  needs a browser, as the game's Phaser does. `boundaries` lets only test code
  (`TEST_CODE`: a `*.test.ts`, or a kit `@.claude/rules/testing.md` describes)
  take it, so the public API stays what production reads; Steiger reads any
  `index.*` as an entry.
- **`shared/lib` has no root barrel.** It is addressed one sub-library at a time
  (`@/kernel/shared/lib/class-names`), each **a single file** and its own public
  API — nothing sits beside it to hide, so `boundaries` lets the layers above
  enter segment `lib` at any top-level `*.ts`. That entry does not cross a
  slash: a sub-library that grows a directory is internals again, and moving it
  back out is the price of the address. It is the holding area, not the
  destination: a sub-library becomes a top-level segment (`shared/content`) once
  it has several consumers and a purpose identity of its own, and only a helper
  too small to name one — `class-names` is a single function — stays under
  `lib`.
- **Segments are named by purpose, not by essence** — `shared/seo` and
  `shared/content` name the concern they serve, not `shared/utils` or
  `shared/markdown`; `shared/lib/class-names`, not `shared/utils`. Steiger's
  `segments-by-purpose` rejects the second form. `shared/typings` is the one
  segment named for what it holds, because what it holds is the point: the
  repo-wide base types that give every member two named types share a single
  home, which `pnpm type-overlap` enforces. A base whose declarers sit in one
  module belongs in that module, so the segment only ever holds what genuinely
  crosses slices.
- **No insignificant slices.** A slice with a single upward consumer belongs
  _inside_ that consumer. `check:masd` says so, counting references across the
  composition — the slice's own app, every descendant and the routers, tests
  left out — with Steiger's `insignificant-slice` messages word for word;
  Steiger's own rule is off, because one root's reference map is exactly what it
  cannot see past. This is why the CV locale picker lives in `vova/pages/cv/ui/`
  and the home page's project and article cards in `vova/pages/home/ui/`, rather
  than each becoming a feature. **One consumer is enough for a slice that is a
  module** — more of its own app's file-import edges falling inside it than a
  rewiring keeping every file's degree would put there, its term of Newman's
  modularity being positive — since a module is one whoever uses it, and a count
  alone would keep a one-page app a single slice. The graph is the slice's own
  app alone: descendants are who uses an app, which says nothing of how it is
  cut, and their unrelated edges would lower the bar for everyone.
- **An app's tooling is its `scripts/`, beside its layers rather than one of
  them** — Steiger reads no layer there, and `check:masd` counts no script as a
  slice's reference. A script enters its own app's scripts and its ancestors'
  directly, since scripts have no public API, but every layer — its own app's
  included — only through one, its tests through `index.test-only.ts` as well;
  it never reaches root `scripts/`, which holds the repo's and the agent's
  tooling. A script several sites run splits like the sitemap: a core in the
  lowest app that owns the work, and an entry per site in its leaf app —
  `src/<site>/scripts/render-og.ts` over kernel's `og-job.ts`.
- **Files in `src/` are kebab-case**; page components are `*-page.tsx`. Exported
  identifiers keep their PascalCase (`card.tsx` exports `Card`).
- **The checkers run with the stock recommended ruleset and two overrides**,
  both in `steiger.config.mjs`: `insignificant-slice` off for the reason above,
  and the `no-ui-in-app` exemption below. A new rule violation is a signal that
  the code is in the wrong place — move the code rather than exempting the path.

## Routers and app layers

**A router only says what is shown at which URL.** `sites/<site>/app/` maps
addresses to apps — on vovazakharov.com, `/` and `/cv` to vova, `/music/...` to
music, `/mushrooms` to mushrooms — and decides nothing else. Its `layout.tsx`
and each `page.tsx` re-export what they render; it may enter any app's public
API, and is reached only by Next's own routing conventions, never by import.

**A site's sitemap belongs to its leaf app, which inherits every app the site
mounts** — vovazakharov.com _is_ blog, music and mushrooms — so its app layer
reaches each mounted app's routes and hands them to blog's `sitemap()`, which
adds every collection's own before kernel's adds `/` — or, on a site no
collection serves, straight to kernel's. Each site's `sitemap.ts` re-exports its
leaf app's behind the route-segment config Next reads off the route module
itself.

**A page the router has to parameterize costs three lines rather than one.** The
document pages serve a collection the router picks, so they are factories: the
file calls `articleRoute(articleCollection('bible'))`, destructures, and
re-exports. Next reads `default`, `generateMetadata` and `generateStaticParams`
as separate named exports off the module, so there is no single binding to
forward — which is the whole of what the extra two lines buy, and the router
still decides nothing but which slice with which argument.

**Every app layer lives under `src/`**, not beside the routers, which several
sites would have to share. kernel's holds the base root layout (`<html>`,
metadata, analytics) and the sitemap factory, which names no collection; blog's
the collection sitemap, the feed factory and a root metadata advertising the
site's feeds, which a blog site's router takes in kernel's place; shell's root
layout wraps kernel's with what every site but the game draws on (fonts, Mantine
provider and `ColorSchemeScript`, the stylesheets, `ThemeCorner`); each site's
leaf app holds its sitemap, and vova's the `global-not-found` page too. A site
with two root layouts splits its router into route groups — vovazakharov.com's
`(shell)` for every page but the game, `(game)/mushrooms` on kernel's layout,
with no theme toggle.

That costs one Steiger override — `fsd/no-ui-in-app`, scoped to
`./src/*/app/ui/**`. Next mandates a root layout, and a root layout is app-layer
UI wherever it is filed, so the rule has no answer here.

Segment naming keeps it to that one. `provider(s)`, `context` and `hook(s)` are
on the plugin's `segments-by-purpose` list, so the theme provider is a file in
`src/shell/app/ui/` rather than a `providers/` segment; `styles`, `config`,
`api` and `tests` pass as segment names if a layer ever needs them.

## Traps

- **`@/<app>/app` is an FSD app layer, not a site's `app/`.** The alias resolves
  into `src/`, so `@/kernel/app/ui` is `src/kernel/app/ui`.
- **Next looks for a Pages Router inside the project directory only**, which is
  `sites/<site>/` — out of reach of every `src/<app>/pages/`. Run a build from
  the repository root and it is not.
- **`@/` points at `src/`.** Anything outside it — a site's `public/` and the
  markdown it serves, root `styles/` and the Sass partial it holds — is reached
  by URL or relative path, not by alias. Inside `src/`, a relative import stays
  in its slice, its segmented layer or its app's `scripts/`, and anything past
  that is reached by alias — `vova/no-relative-escape` holds it. Every script
  runs outside any bundler, under `tsx`, which follows the alias.
- **`eslint/masd-graph.ts` imports relatively**, since ESLint loads it under
  jiti, which does not follow the alias.
- **next-intl's request config is found by path, not by import.** Each site's
  `next.config.ts` names `../../src/kernel/shared/i18n/request.ts` explicitly;
  moving that file means editing both. The path is relative to the site
  directory, which the plugin checks against the working directory and hands
  Turbopack to resolve against the project — the two agree only when a build is
  entered in its site directory, which is what `pnpm build <site>` does.
- **The content pipeline is blog's `shared/content`, not an entity.** It is
  build-time-only and every module opens with `import 'server-only'`;
  `@.claude/rules/content.md` owns its contract. It holds every collection's
  address and the base and article schemas; any other collection's schema is its
  owner's (the song schema in `music/shared/catalogue`, the case frontmatter in
  `basilisk/shared/content`). Its page composition is one `blog/pages/documents`
  slice serving every collection on every site: a slice per collection would
  make siblings of pages that share one composition, and sibling slices cannot
  reach each other.
- **`music/shared/catalogue` is not `music/shared/music`**: within one app root,
  Steiger's `ambiguous-slice-names` rejects a segment named like the
  `pages/music` slice.
