# `src/` — Feature-Sliced Design

Every application module lives here, organized by
[Feature-Sliced Design](https://feature-sliced.design/). The Next.js App Router
at root `app/` is a thin routing layer that delegates into these slices, and is
itself the FSD app layer.

> This is a human orientation page. The **authoritative, enforced conventions**
> live in [`.claude/rules/fsd.md`](../.claude/rules/fsd.md) and are checked by
> Steiger (`pnpm lint:fsd`) and `eslint-plugin-boundaries` in vet. When the two
> disagree, the rules file wins.

## The tree

```
shared/
  config/     SITE_CONFIG and absolute-URL helper
  i18n/       next-intl routing, the Locale type, the message catalogues
  seo/        constructMetadata — shared Open Graph / metadata construction
  ui/         Card, the one primitive both pages share
  lib/
    hydration/  useMounted, the guard theme-dependent UI needs
features/
  switch-theme/  the light/dark/system toggle
pages/
  home/       the landing page and the cards only it renders
  cv/         the localized CV, its locale picker, and its metadata builder
```

`entities/` and `widgets/` do not exist yet. Nothing on this site is a business
noun with two consumers, and no composite block is shared across both pages —
so adding either layer would create slices Steiger flags as insignificant.

## What decides where something goes

- **Two or more consumers, no knowledge of the site's content** → a `shared/` segment.
- **Two or more consumers, a capability the visitor acts on** → a `features/` slice.
- **One consumer** → inside that consumer. This is the rule that keeps the CV's locale picker and the home page's cards out of `features/` and `shared/`.

Imports point downward only, and always land on a slice's or segment's
`index.ts`. Both are machine-checked, so a misplacement fails vet rather than
review.
