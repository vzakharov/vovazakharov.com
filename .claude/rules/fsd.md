---
description: Feature-Sliced Design conventions for src/ — layer structure, public API, where the app layer lives, and the Next.js traps around it
paths:
  - src/**
  - app/**
---

# FSD (Feature-Sliced Design)

`src/` holds every application module, organized by [Feature-Sliced
Design](https://feature-sliced.design/) — every layer, the app layer included.
Root `app/` is the Next.js App Router and nothing else. Steiger
(`pnpm lint:fsd`) and `eslint-plugin-boundaries` enforce what follows;
`./scripts/vet.sh` runs both.

## Layers

Lowest (most generic) first — an import may only point downward:

| Layer       | Holds                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------- |
| `shared/`   | Segments carrying no page composition: `config`, `i18n`, `seo`, `typings`, `ui`, `lib/*`    |
| `entities/` | _(none yet)_ business nouns                                                                 |
| `features/` | User-facing capabilities — currently `switch-theme`                                         |
| `widgets/`  | _(none yet)_ composite blocks assembled from features and entities                          |
| `pages/`    | Page composition — `home`, `cv`, `case-studies`                                             |
| `app/`      | Root layout, theme provider, global stylesheet, sitemap — `ui`, `styles` and `lib` segments |

`entities/` and `widgets/` are absent because nothing earns them yet, not as an
oversight. Layers are optional; **inventing one costs more than leaving it out**
(see "insignificant slices" below).

## Rules

- **Import direction is one-way**: `app → pages → widgets → features → entities → shared`. Never upward, never sideways between slices on the same layer.
- **Public API per slice and per shared segment.** Cross-slice imports go through the target's `index.ts`; reaching into its internals is an error from both checkers. Within a slice, use relative imports.
- **`shared/lib` has no root barrel.** It is addressed one sub-library at a time (`@/shared/lib/hydration`), each with its own `index.ts`. Promote a sub-library to a top-level segment once it has several consumers and a purpose identity of its own.
- **Segments are named by purpose, not by essence** — `shared/seo`, not `shared/utils`; `shared/lib/hydration`, not `shared/hooks`. Steiger's `segments-by-purpose` rejects the second form. `shared/typings` is the one segment named for what it holds, because what it holds is the point: the repo-wide base types that give every member two named types share a single home, which `pnpm type-overlap` enforces. A base whose declarers sit in one module belongs in that module, so the segment only ever holds what genuinely crosses slices.
- **No insignificant slices.** A slice with a single upward consumer belongs _inside_ that consumer, and Steiger says so (`insignificant-slice`). This is why the CV locale picker lives in `pages/cv/ui/` and the home page's project and article cards live in `pages/home/ui/`, rather than each becoming a feature.
- **Files in `src/` are kebab-case**; page components are `*-page.tsx`. Exported identifiers keep their PascalCase (`card.tsx` exports `Card`).
- **The checkers run with the stock recommended ruleset and one override**, the `no-ui-in-app` exemption below. A new rule violation is a signal that the code is in the wrong place — move the code rather than exempting the path.

## The app layer is `src/app`; root `app/` is the router

Every layer lives under `src/`, the app layer with them. A layer parked at the
repo root would be the single exception to that, and the consistency is worth
more than what the exception saves. Root `app/` holds routing and nothing else:
`layout.tsx` and each `page.tsx` are one-line re-exports of what they render,
and `sitemap.ts` re-exports `@/app/lib` behind the route-segment config Next
reads off the route module itself.

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

- **Root `pages/` must keep existing**, empty of routes — it is what keeps the FSD pages layer invisible to the router. `pages/README.md` has the mechanism.
- **`@/app` is the FSD app layer, not root `app/`.** The alias resolves into `src/`, so `@/app/ui` is `src/app/ui`. Root `app/` is reached only by Next's own routing conventions, never by import.
- **`@/` points at `src/`.** Anything outside it — `public/` and the markdown it serves — is reached by URL or relative path, not by alias. `scripts/` is the exception that proves it: a script importing a type from the tree spells the alias out (`@/shared/typings`) under `tsx`, or a relative path when it runs under bare Node.
- **next-intl's request config is found by path, not by import.** `next.config.ts` names `./src/shared/i18n/request.ts` explicitly; moving that file means editing the config.
- **The content pipeline is `shared/lib/content`, not an entity.** It is build-time-only and every module opens with `import 'server-only'`; `@.claude/rules/content.md` owns its contract. Its page composition — the index, the article and the pieces they share — is one `pages/case-studies` slice, because two slices could not share `back-to-home` or `document-meta` sideways.
