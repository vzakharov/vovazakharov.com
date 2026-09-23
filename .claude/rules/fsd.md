---
description: Feature-Sliced Design conventions for src/ — layer structure, public API, where the app layer lives, and the Next.js traps around it
paths:
  - src/**
  - apps/*/app/**
---

# FSD (Feature-Sliced Design)

`src/` holds every application module, organized by [Feature-Sliced
Design](https://feature-sliced.design/) — every layer, the app layer included.
Each site's `apps/<site>/app/` is a Next.js App Router and nothing else. Steiger
(`pnpm lint:fsd`) and `eslint-plugin-boundaries` enforce what follows;
`./scripts/vet.sh` runs both.

## Layers

Lowest (most generic) first — an import may only point downward:

| Layer       | Holds                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `shared/`   | Segments carrying no page composition: `config`, `content`, `i18n`, `seo`, `typings`, `ui`, `lib/*`      |
| `entities/` | Business nouns — `document` (its byline, its cards and its body)                                         |
| `features/` | User-facing capabilities — currently `switch-theme`                                                      |
| `widgets/`  | Composite blocks two page slices share — `site-footer`                                                   |
| `pages/`    | Page composition — `home`, `lsa-home`, `bible-home`, `cv`, `documents`                                   |
| `app/`      | Root layout, Mantine provider, global stylesheets and theme, sitemap — `ui`, `styles` and `lib` segments |

An entity is earned once a block is a business noun's own UI: `document` holds
the byline, the collection's cards and the rendered body, all about a document
and nothing else.
A layer is still optional and **inventing one costs more than leaving it out**
(see "insignificant slices" below), so an entity waits for that — a noun with UI
worth naming, not the mere idea of one.

**A block two page slices share cannot sit in either of them** — slices may not
reach each other sideways — so it drops to a lower layer, and which of the three
below `pages/` takes it turns on what the block _is_, not on the fact that it is
shared:

- **`entities/`** — the block is one business noun's UI. `DocumentCards` (reaches
  `shared/content` for a route) and `DocumentMeta` are about a document and
  nothing else, so they are `entities/document/ui`; a list of one entity's cards
  is that entity's UI, not a widget. FSD asks no model of an entity, so a ui-only
  one is a legal form.
- **`widgets/`** — the block _combines_ rather than belonging to one noun, and
  reads the resolved site. `SiteFooter` (needs `BUILD_YEAR`) is the site's foot,
  not a document's, so it stays a widget.
- **`shared/ui`** — the block needs no site configuration at all. It is the
  barrel client components import, so a component there takes what it needs as
  props rather than reading the resolved site; `SummaryCard` sits here because it
  reads none.

`entities/document` is born ui-only: its model stays in `shared/content`, which
is build-time and `server-only`, so a content page costs zero client JS — the
model would move only if content ever stopped being build-time. Its barrel pulls
`server-only` today (`DocumentCards` needs `linkTo`), but no client chain enters
it, so a plain `index.ts` holds; a client component reaching for the byline is
what would split it into `index.ts` + `index.server-only.ts`, exactly as
`shared/config` is.

## Rules

- **Import direction is one-way**: `app → pages → widgets → features → entities → shared`. Never upward, never sideways between slices on the same layer.
- **Public API per slice and per shared segment.** Cross-slice imports go through the target's `index.ts`; reaching into its internals is an error from both checkers. Within a slice, use relative imports.
- **`shared` is a slice as well as a layer**, which is FSD's own exception to the rule above: every file in it reaches every other directly, exactly as the app layer's segments do. A segment's `index.ts` is what the layers _above_ enter by, not a wall between `shared/ui` and `shared/seo`.
- **Two suffixed barrels join `index.ts` as legal entry points**, on two axes, and the list is closed at those three names (`PUBLIC_API` in `eslint.config.ts`). `index.ts` keeps the majority surface either way, so a consumer needing neither suffix never learns they exist.
  - **`index.server-only.ts`** is the client-bundle axis: what a browser must not hold. Every module behind it opens with `import 'server-only'`, which is what enforces the split the barrel only names. Two segments are split this way, each on what a client bundle may hold rather than on what a module happens to do: `shared/seo` keeps `OG_CARD_SUFFIX` in the ordinary barrel and puts `constructMetadata` behind the other, because `pages/cv`'s URL module reads the suffix and a client component reads that; `shared/config` puts `BUILD_YEAR` behind it, which is evaluated once per deploy and would otherwise re-evaluate at hydration. A fence wants a reason of that kind: a dependency's weight is not one, since removing the dependency removes the fence and whatever was built on it.
  - **`index.node-safe.ts`** is the bundler axis: what resolves under `scripts/`, which runs with none — so the graph behind it spells its extensions, holds no CSS, JSX or asset import, and carries no `server-only`, which throws outside a React server bundle. `shared/config` is the one segment with one, over `resolveSiteId`. A script reaching past a public API into a leaf is the smell that this barrel is missing.
- **`shared/lib` has no root barrel.** It is addressed one sub-library at a time (`@/shared/lib/class-names`), each **a single file** and its own public API — nothing sits beside it to hide, so `boundaries` lets the layers above enter segment `lib` at any top-level `*.ts`. That entry does not cross a slash: a sub-library that grows a directory is internals again, and moving it back out is the price of the address. It is the holding area, not the destination: a sub-library becomes a top-level segment (`shared/content`) once it has several consumers and a purpose identity of its own, and only a helper too small to name one — `class-names` is a single function — stays under `lib`.
- **Segments are named by purpose, not by essence** — `shared/seo` and `shared/content` name the concern they serve, not `shared/utils` or `shared/markdown`; `shared/lib/class-names`, not `shared/utils`. Steiger's `segments-by-purpose` rejects the second form. `shared/typings` is the one segment named for what it holds, because what it holds is the point: the repo-wide base types that give every member two named types share a single home, which `pnpm type-overlap` enforces. A base whose declarers sit in one module belongs in that module, so the segment only ever holds what genuinely crosses slices.
- **No insignificant slices.** A slice with a single upward consumer belongs _inside_ that consumer, and Steiger says so (`insignificant-slice`). This is why the CV locale picker lives in `pages/cv/ui/` and the home page's project and article cards live in `pages/home/ui/`, rather than each becoming a feature.
- **Files in `src/` are kebab-case**; page components are `*-page.tsx`. Exported identifiers keep their PascalCase (`card.tsx` exports `Card`).
- **The checkers run with the stock recommended ruleset and one override**, the `no-ui-in-app` exemption below. A new rule violation is a signal that the code is in the wrong place — move the code rather than exempting the path.

## The app layer is `src/app`; `apps/*/app/` is the router

Every layer lives under `src/`, the app layer with them. A layer parked beside
the routers would be the single exception to that, and the consistency is worth
more than what the exception saves — the more so with two routers, which would
have to share it. An app's `app/` holds routing and nothing else: `layout.tsx`
and each `page.tsx` re-export what they render, and `sitemap.ts` re-exports
`@/app/lib` behind the route-segment config Next reads off the route module
itself.

**A page the router has to parameterize costs three lines rather than one.**
The document pages serve a collection the router picks, so they are factories:
the file calls `articleRoute('bible')`, destructures, and re-exports. Next reads
`default`, `generateMetadata` and `generateStaticParams` as separate named
exports off the module, so there is no single binding to forward — which is the
whole of what the extra two lines buy, and the router still decides nothing but
which slice with which argument.

**That is what lets the sites share one `src/`.** Every site's page slices sit in
`src/pages/` side by side, which FSD already permits: slices may not import each
other sideways, and two sites' pages are exactly that relationship. Each app's
router picks the slices its site serves.

That costs exactly one Steiger override — `fsd/no-ui-in-app`, scoped to
`src/app/ui/**` in `steiger.config.mjs`. Next mandates a root layout, and a
root layout is app-layer UI wherever it is filed, so the rule has no answer
here.

Segment naming keeps it to that one. `provider(s)`, `context` and `hook(s)` are
on the plugin's `segments-by-purpose` list, so the theme provider is a file in
`src/app/ui/` rather than a `src/app/providers/` segment; `styles`, `config`,
`api` and `tests` pass as segment names if the layer ever needs them.

Because the app layer is above every other, it may import from all of them —
through their public APIs — and, being one unit rather than a set of isolated
slices, its own segments reach each other directly.

## Traps

- **`@/app` is the FSD app layer, not an app's `app/`.** The alias resolves into `src/`, so `@/app/ui` is `src/app/ui`. A router directory is reached only by Next's own routing conventions, never by import.
- **Next looks for a Pages Router inside the project directory only**, which is `apps/<site>/` — a level below `src/pages/`, so the FSD pages layer is out of its reach. Run a build from the repository root and it is not.
- **`@/` points at `src/`.** Anything outside it — an app's `public/` and the markdown it serves, root `styles/` and the Sass partial it holds — is reached by URL or relative path, not by alias. `scripts/` is the exception that proves it: a script importing a type from the tree spells the alias out (`@/shared/typings`) under `tsx`, or a relative path when it runs under bare Node.
- **next-intl's request config is found by path, not by import.** Each app's `next.config.ts` names `../../src/shared/i18n/request.ts` explicitly; moving that file means editing both. The path is relative to the app directory, which the plugin checks against the working directory and hands Turbopack to resolve against the project — the two agree only when a build is entered in its app directory, which is what `pnpm build:<site>` does.
- **The content pipeline is `shared/content`, not an entity.** It is build-time-only and every module opens with `import 'server-only'`; `@.claude/rules/content.md` owns its contract. Its page composition — the index, the article and the pieces they share — is one `pages/documents` slice serving every collection on every site: a slice per collection would make siblings of pages that share one composition, and sibling slices cannot reach each other. The document's own byline and cards are the exception that proves it — shared by the index and the article both, they sit a layer down in `entities/document`, per the `widgets/`-versus-`entities/` note above.
