---
description: How styling is layered here — where a rule has to live to win, and which Mantine props are unreachable from a stylesheet
paths:
  - src/app/styles/**
  - src/app/ui/theme-provider.tsx
  - styles/**
  - src/shared/ui/css-color.ts
  - '**/*.module.scss'
---

# Styling

Mantine is imported as `@mantine/core/styles.layer.css`, so everything it ships
lives in `@layer mantine`. **Any unlayered rule beats it, whatever the
specificity** — `globals.scss`, `print.scss` and every `.module.scss` are
unlayered, so none of them needs `!important` — stylelint's
`declaration-no-important` holds that line.

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

Never write a colour literal in a component. The tokens are declared in
`src/app/styles/globals.scss` as `--color-*` and reached from TSX through
`cssColor()`. Which tokens exist is settled by the `CSS_COLORS` array in
`src/shared/ui/css-color.ts` — it types `cssColor()` and generates the mixin
that declares them, so adding one is a single edit there. They are
colour-scheme aware, so nothing branches on the scheme itself.

Mantine's own variables are bound to those tokens by the `cssVariablesResolver`
in `src/app/ui/theme-provider.tsx`, not by a `:root` block. Mantine renders its
variable block as a `<style data-mantine-styles>` at the top of `<body>` — after
every stylesheet in `<head>`, on the same `:root` selector — so a `--mantine-*`
override written in a stylesheet loses on document order at equal specificity.
The `--color-*` tokens are safe there because Mantine never declares those
names.

## Print

`src/app/styles/print.scss` carries page-level rules: `@page`, the forced light
scheme, and the element defaults (`h1`–`h4`, `p`, `ul`, `li`). Everything a
single component owns goes in that component's `.module.scss`, in an
`@media print` block beside the screen rule it overrides — a class outranks the
sheet's element rules, so splitting the two apart silently breaks one of them.

Sizes have to be **stated** in the print rules rather than inherited: Mantine's
`Text` and `Title` always set an explicit `font-size`, so a print `body` size
alone reaches nothing.

## `white` and `black` are bound to the tokens, and Mantine does not know it

`theme.white` is the **background** token and `theme.black` the **foreground**
one, so a filled control paints background-coloured text on a foreground-coloured
fill in either scheme. Mantine's own stylesheet was written against a literal
palette, though, and a handful of its rules reach for `--mantine-color-white` as
"the readable colour in the dark scheme" — which here is the colour of the
surface behind the text. Its inline-`code` rule is one, which is why
`prose.scss` states that colour itself. Suspect this first when something is
invisible in exactly one scheme.

## Rendered markdown

`src/app/styles/prose.scss` owns the whole rhythm of the content pipeline's
HTML — sizes, leading, vertical spacing, rules and the pipeline's own emissions
(Shiki token colours, the Mermaid light/dark pair, scrollable tables, heading
anchors) — scoped under `.prose-content`, which sits on the element holding the
markup so that `> h1` still keys the part dividers. The markup is wrapped in
nothing.

**Long-form copy is not on the site's UI scale, and Mantine's `Typography` is
not a substitute for this sheet.** `--mantine-line-height` and
`--mantine-font-size-*` are sized for controls: 1.55 is right on a button label
and cramped on a paragraph of an essay, and `Typography`'s own element rules
reach for `--mantine-color-gray-0` behind `code`, `pre` and `blockquote` — a
literal light grey that survives into the dark scheme. Every base rule here is
`:where()`, so its specificity is the class alone and `print.scss`, a component
sheet or an element-specific rule below overrides it without out-specifying it.

## SCSS

Every stylesheet here is Sass — a co-located `.module.scss` per component, plain
`.scss` for the global sheets. Two root partials carry what they share:
`styles/_mantine.scss` for the `light` / `dark` / `hover` / `smaller-than` /
`larger-than` mixins and the forwarded breakpoint scale, `styles/_tokens.scss`
for the colour-token mixin each palette calls. Pull either in per file with a relative
`@use '…/_mantine' as mantine`, which keeps a module's dependencies visible in
the module; relative because Sass resolves its own imports and knows nothing
about the `@/` alias.

**Mantine documents those mixins as a PostCSS preset, and that route cannot
work here.** Next runs Sass before PostCSS, so `@include smaller-than(…)` reads
as an undefined _Sass_ mixin and fails the build before PostCSS sees the file.
Reach for `_mantine.scss`, not the preset.

Both of the shared scales are written once in TypeScript, and their Sass halves
are **generated** by `pnpm styles:codegen` — TypeScript is the source because it
is the side a type can constrain, and Sass cannot import it:

| Written in                      | Generates                  | Why Sass needs its own copy                                                                           |
| ------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/app/styles/breakpoints.ts` | `styles/_breakpoints.scss` | A media-query condition cannot read a custom property, so the numbers have to be literals.            |
| `src/shared/ui/css-color.ts`    | `styles/_tokens.scss`      | Sass is what declares the `--color-*` properties; TypeScript only types the names `cssColor()` reads. |

`_mantine.scss` forwards the breakpoint partial, so a call site still reaches
`mantine.$breakpoint-sm`; the token mixin is `@use`d directly by the sheets that
declare a palette. Change either scale in its TypeScript and re-run the
generator — and forgetting to is caught either way, since the vet run runs the
generator itself and fails when it had to rewrite something, hand-edits of the
partial included.

Adding a colour token therefore cannot half-land: the generated mixin gains a
required parameter, and every `@include tokens.colors(…)` that does not pass it
fails the Sass build outright rather than defaulting.
