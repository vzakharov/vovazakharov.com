---
description: Feature-Sliced Design conventions for src/ — layer structure, public API, where the app layer lives, and the Next.js traps around it
paths:
  - src/**
  - app/**
---

# FSD (Feature-Sliced Design)

`src/` holds every application module, organized by [Feature-Sliced
Design](https://feature-sliced.design/). Root `app/` is the Next.js App Router
and, at the same time, the FSD **app layer**. Steiger (`pnpm lint:fsd`) and
`eslint-plugin-boundaries` enforce what follows; `./scripts/vet.sh` runs both.

## Layers

Lowest (most generic) first — an import may only point downward:

| Layer       | Holds                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| `shared/`   | Segments with no knowledge of the site's content: `config`, `i18n`, `seo`, `ui`, `lib/*` |
| `entities/` | _(none yet)_ business nouns                                                              |
| `features/` | User-facing capabilities — currently `switch-theme`                                      |
| `widgets/`  | _(none yet)_ composite blocks assembled from features and entities                       |
| `pages/`    | Page composition — `home`, `cv`                                                          |
| root `app/` | Root layout, providers, global stylesheet, and the route tree                            |

`entities/` and `widgets/` are absent because nothing earns them yet, not as an
oversight. Layers are optional; **inventing one costs more than leaving it out**
(see "insignificant slices" below).

## Rules

- **Import direction is one-way**: `app → pages → widgets → features → entities → shared`. Never upward, never sideways between slices on the same layer.
- **Public API per slice and per shared segment.** Cross-slice imports go through the target's `index.ts`; reaching into its internals is an error from both checkers. Within a slice, use relative imports.
- **`shared/lib` has no root barrel.** It is addressed one sub-library at a time (`@/shared/lib/hydration`), each with its own `index.ts`. Promote a sub-library to a top-level segment once it has several consumers and a purpose identity of its own.
- **Segments are named by purpose, not by essence** — `shared/seo`, not `shared/utils`; `shared/lib/hydration`, not `shared/hooks`. Steiger's `segments-by-purpose` rejects the second form.
- **No insignificant slices.** A slice with a single upward consumer belongs _inside_ that consumer, and Steiger says so (`insignificant-slice`). This is why the CV locale picker lives in `pages/cv/ui/` and the home page's project and article cards live in `pages/home/ui/`, rather than each becoming a feature.
- **Files in `src/` are kebab-case**; page components are `*-page.tsx`. Exported identifiers keep their PascalCase (`card.tsx` exports `Card`).
- **The checkers run with the stock recommended ruleset and no overrides.** A new rule violation is a signal that the code is in the wrong place — move the code rather than exempting the path.

## The app layer is root `app/`, not `src/app`

The app layer here is three files — the root layout, the theme provider, the
global stylesheet — so there is nothing to segment. Root `app/` already holds
them and sits outside the `steiger src` scan root, so the stock ruleset passes
untouched. Route files there stay thin: a `page.tsx` re-exports its slice
(`export { HomePage as default } from '@/pages/home'`) and adds only the
route-level metadata Next needs.

Moving the layer to `src/app` puts it under the scanner, at a cost of up to two
overrides: `no-ui-in-app` on `src/app/ui/**`, unavoidable once the layer has UI,
and `segments-by-purpose` on a segment named for what it holds — `provider(s)`,
`context`, `hook(s)` are on the plugin's list, while `config`, `styles`, `api`
and `tests` pass. That is the right trade for an app layer big enough to
segment; `Playgramai/playgramapp`, which this structure is modelled on, does
exactly that and carries one override for it. Revisit this the day an app shell
here would earn the same.

Because root `app/` is above every layer, it may import from any of them —
through their public APIs.

## Traps

- **Root `pages/` must keep existing**, empty of routes — it is what keeps the FSD pages layer invisible to the router. `pages/README.md` has the mechanism.
- **`@/` points at `src/`.** Anything outside it — `public/`, `content/` — is reached by URL or relative path, not by alias.
- **next-intl's request config is found by path, not by import.** `next.config.ts` names `./src/shared/i18n/request.ts` explicitly; moving that file means editing the config.
