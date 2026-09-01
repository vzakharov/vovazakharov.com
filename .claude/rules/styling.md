---
description: How styling is layered here — where a rule has to live to win, and which Mantine props are unreachable from a stylesheet
paths:
  - src/app/styles/**
  - src/app/ui/providers.tsx
  - styles/**
  - src/shared/ui/css-color.ts
  - '**/*.module.scss'
---

# Styling

Mantine is imported as `@mantine/core/styles.layer.css`, so everything it ships
lives in `@layer mantine`. **Any unlayered rule beats it, whatever the
specificity** — `globals.css`, `print.scss` and every `.module.scss` are
unlayered, so none of them needs `!important`. Don't add one.

## What a stylesheet cannot reach

Mantine renders three things as **inline `style`**, which no class can override:

- **Style props** — `p`, `fz`, `lh`, `ml`, `opacity`, and friends.
- **`vars` from a component's varsResolver** — `--button-bg`, `--ai-size`,
  `--stack-gap`, `--list-spacing`, …
- **Anything a visual value in `theme.components[…].defaultProps` produces.**

So a value that a stylesheet has to override later — anything print re-keys —
belongs in a CSS module, not on the call site. Variant colours belong in
`theme.variantColorResolver`; `defaultProps` is for props that render as data
attributes (`underline`), never for sizes or colours.

## Colours

Never write a colour literal in a component. The tokens live in
`src/app/styles/globals.css` as `--color-*` and are reached from TSX through
`cssColor()` in `src/shared/ui/css-color.ts`, whose union is the source of truth
for which tokens exist. They are colour-scheme aware, so nothing branches on the
scheme itself.

Mantine's own variables are bound to those tokens by the `cssVariablesResolver`
in `src/app/ui/providers.tsx`, not by a `:root` block — the provider injects its
stylesheet at runtime and a second `:root` rule cannot reliably outrank it.

## Print

`src/app/styles/print.scss` carries page-level rules: `@page`, the forced light
scheme, and the element defaults (`h1`–`h4`, `p`, `ul`, `li`). Everything a
single component owns goes in that component's `.module.scss`, in an
`@media print` block beside the screen rule it overrides — a class outranks the
sheet's element rules, so splitting the two apart silently breaks one of them.

Sizes have to be **stated** in the print rules rather than inherited: Mantine's
`Text` and `Title` always set an explicit `font-size`, so a print `body` size
alone reaches nothing.

## Rendered markdown

The content pipeline's HTML is wrapped in Mantine's `Typography`, which supplies
the base rhythm. `src/app/styles/prose.css` adds only what the pipeline itself
emits — Shiki token colours, the Mermaid light/dark pair, scrollable tables and
the heading anchors — and is scoped under `.prose-content`, which sits on the
element holding the markup so that `> h1` still keys the part dividers.

## SCSS

Component CSS is a co-located `.module.scss`; global sheets are plain `.scss`.
`postcss-preset-mantine`'s mixins cannot be used from either — Next runs Sass
first, so they read as undefined _Sass_ mixins. Root `styles/_mantine.scss`
carries Sass equivalents; pull them in per file with a relative
`@use '…/_mantine' as mantine`, which keeps a module's dependencies visible in
the module. The path is relative because Sass resolves its own imports and knows
nothing about the `@/` alias.

The breakpoint scale is declared three times — `theme.breakpoints`,
`postcss.config.cjs`, `styles/_mantine.scss` — because the three
languages cannot share a declaration. Change them together.
