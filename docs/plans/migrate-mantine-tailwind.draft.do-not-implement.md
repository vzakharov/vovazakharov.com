> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Migrate styling from Tailwind 4 to Mantine

Replace Tailwind CSS with [Mantine](https://mantine.dev) as the styling and component
layer, remove Tailwind from the toolchain, and follow `Playgramai/playgramapp`'s
conventions where they transfer.

## What playgramapp actually does

Read directly from the repo (`gh` reaches it — it is private, and `add_repo` and the
GitHub MCP tools both refuse it, but the CLI is authorized). The conventions that bear
on this migration:

|                 | playgramapp                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mantine         | `^8.3.18` — the tip of v8                                                                                                                                       |
| Stylesheet      | `@mantine/core/styles.layer.css` (the `@layer mantine` build), imported from a `'use client'` providers module                                                  |
| Layout split    | `root-layout.tsx` (server) holds `<html {...mantineHtmlProps}>` + `<ColorSchemeScript />`; `root-providers.tsx` (`'use client'`) holds `<MantineProvider>`      |
| Token overrides | a `cssVariablesResolver`, **not** `:root` CSS — see below                                                                                                       |
| PostCSS         | `postcss.config.cjs` with `postcss-preset-mantine` + `postcss-simple-vars` carrying the five `mantine-breakpoint-*` values                                      |
| Colours         | CSS custom properties in `app/globals.css`, reached from TSX through a typed `cssColor()` helper whose union type is the source of truth for which tokens exist |
| Component CSS   | co-located `.module.scss` (`sass`, not `sass-embedded`), linted by stylelint; inline `style={}` is "a smell"                                                    |
| Sass helpers    | own mixins in `_breakpoints.scss`, pulled in per-file with an explicit `@use … as bp` — no `sassOptions.additionalData`                                         |
| Theme           | `createTheme` with per-component `classNames` bound to a `theme.module.scss`                                                                                    |
| Icons           | **no React icon library at all** — SVGs live under `public/` and are referenced by URL                                                                          |
| Print styles    | none, anywhere — zero `@media print` in the repo                                                                                                                |

Two of their documented traps are worth importing wholesale, because both are written up
as things that already bit them:

- **`:root` token overrides lose to Mantine's stylesheet.** `root-providers.tsx` carries
  the note verbatim: _"Must go through the resolver because Mantine's stylesheet ships
  after globals.css under Turbopack and wins a plain `:root` override."_ Next 16 builds
  with Turbopack here too, so this applies unchanged.
- **Theme `defaultProps` render as inline styles**, which no CSS-module class can beat.
  Their styling rule calls the resulting mess out explicitly and says the proper fix is to
  stop baking visual values into `defaultProps`. This migration starts clean, so it simply
  never puts `fz`/`lh`-style values there.

## Current state

Tailwind's footprint here is small and fully enumerable, which is what makes this a
contained job rather than a rewrite:

| Surface                 | Detail                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files using `className` | 6 — `app/HomePage.tsx`, `app/[locale]/cv/CVPage.tsx`, `app/RootLayout.tsx`, `components/Card.tsx`, `components/ThemeToggle.tsx`, `components/LocalePicker.tsx` |
| Toolchain touchpoints   | `package.json` (`tailwindcss`, `@tailwindcss/postcss`), `postcss.config.mjs`, `app/globals.css`                                                                |
| `print:` variant uses   | 84 across `CVPage.tsx`, `HomePage.tsx`, `Card.tsx`                                                                                                             |
| Dead classes            | `prose prose-invert` appears 3× in `HomePage.tsx` but `@tailwindcss/typography` is **not installed** — already no-ops, they simply disappear                   |

The visual identity is stark and easy to state: pure `#000`/`#fff` inverted by colour
scheme, square borders (no radii except the round avatar), Merriweather serif body,
JetBrains Mono for tech-stack lines, opacity-based dimming (`opacity-60/70/80/90`) and
`foreground/20`–`foreground/40` hairline borders. **This look is preserved exactly** —
Mantine is the mechanism, not a restyle, so any visible difference in the `/preview`
comparison is a bug in this change.

Colour scheme is currently owned by `next-themes` (`class="dark"` on `<html>`), with
`hooks/useMounted.ts` as the hydration guard for `ThemeToggle` and `LocalePicker`.

## Decisions

### Mantine v9.6.0

playgramapp is pinned to v8.3.18, so this repo goes one major ahead. That is safe here,
and the reasoning is worth recording rather than re-deriving later:

- **The React floor is met exactly.** v9 requires React 19.2+; this repo pins `19.2.0`.
- **The 8→9 guide lists 18 breaking changes; this site's surface touches two**, and both
  are things a fresh conversion writes the v9 way regardless: `Text`/`Anchor` dropped the
  `color` prop in favour of the `c` style prop, and `theme.defaultRadius` defaults changed
  `sm` → `md` (irrelevant — this theme sets `0` explicitly). Everything else is
  `@mantine/form`, `Grid` (`gutter`→`gap`; this site uses `SimpleGrid`), `Collapse`,
  `Spoiler`, `Popover`/`Tooltip`, `Notifications`, and a batch of hooks — none of which
  this site uses. The `light`-variant colour change does not reach it either: the buttons
  here are `variant="default"`.
- **The toolchain decision is version-independent.** Mantine's own repo at 9.6.0 uses
  `postcss-preset-mantine@1.18.0`, `postcss-simple-vars@^7.0.1`, `stylelint@^17.14.1` and
  `stylelint-config-standard-scss@^17.0.0` — byte-identical to what playgramapp runs on
  v8. So nothing below changes with the version.

What is genuinely given up: playgramapp's `theme.ts` and `.claude/rules/styling.md` were
written against v8, so they transfer as patterns rather than as copy-paste, and this repo
becomes the first of the two to carry v9 (a help, not a cost, when they migrate).

Packages: `@mantine/core@^9.6.0`, `@mantine/hooks@^9.6.0` (dependencies);
`postcss-preset-mantine@^1.18.0`, `postcss-simple-vars@^7.0.1`, `sass@^1.98.0`,
`stylelint@^17.14.1`, `stylelint-config-standard-scss@^17.0.0` (devDependencies).
Removed: `tailwindcss`, `@tailwindcss/postcss`, `next-themes`.

`next.config.ts` is otherwise untouched — Mantine is CSS-variable and CSS-module based, so
it survives `output: 'export'` with no runtime style injection.

### Mantine owns the colour scheme; `next-themes` goes

Running both means two sources of truth for one `<html>` attribute and two localStorage
keys racing on first paint. `ColorSchemeScript` + `MantineProvider` +
`useMantineColorScheme` cover exactly the three-state light/dark/system behaviour
`ThemeToggle` implements today, and every Mantine component reads
`data-mantine-color-scheme` rather than `.dark`.

Mirroring playgramapp's split: `app/RootLayout.tsx` stays a server component holding
`<html {...mantineHtmlProps}>` and `<ColorSchemeScript defaultColorScheme="auto" />` in
`<head>`; a new `app/Providers.tsx` (`'use client'`) imports the Mantine stylesheet and
holds `<MantineProvider>`. `components/ThemeProvider.tsx` is deleted — `Providers.tsx` is
its replacement, one boundary instead of two.

(`defaultColorScheme` is `"auto"` here, not their `"dark"`: this site's toggle offers
system as a real third state, theirs does not.)

### Tokens go through `cssVariablesResolver`

Mantine's stock body/text colours are `#fff`/`#242424` and `#000`/`#C9C9C9` — close to,
but not, the pure black-and-white this site uses. The obvious fix is four `:root` rules in
`globals.css`; playgramapp's comment says that exact approach loses the cascade under
Turbopack, and they moved to a resolver because of it. So:

```ts
const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { '--mantine-color-body': cssColor('background'), '--mantine-color-text': cssColor('foreground'), … },
  dark:  { … },
});
```

with the literal hexes living as `--color-*` custom properties in `globals.css`, per their
"never hardcode a colour value in a component" rule.

### A `cssColor()` helper, scaled to two colours

`lib/css-color.ts` mirrors `src/shared/ui/css-color.ts`: a `CssColor` union naming every
token, and `cssColor(c)` returning `var(--color-${c})`. Theirs runs ~80 lines because they
have ~90 tokens; this site has about six — `background`, `foreground`, and the
`border-hairline` / `border-hairline-strong` pair standing in for `foreground/20` and
`foreground/40`. The value is the same at either size: adding a token means extending the
union, so a typo is a type error rather than a silently dead `var()`.

### Import the layered stylesheet

`@mantine/core/styles.layer.css`, as playgramapp does. Wrapping Mantine in `@layer mantine`
means unlayered CSS — the print stylesheet, the hairline rules — wins on cascade alone,
with no `!important` (their styling rule bans new ones) and no dependence on Next's CSS
import order.

### SCSS modules and stylelint, house-style

Component CSS is co-located `.module.scss`, as playgramapp writes it, with `sass` (their
choice; upstream's guide suggests `sass-embedded`, but matching house costs nothing here).
Global sheets are plain `.scss`.

**The trap: `postcss-preset-mantine`'s mixins are unavailable in SCSS.** Next runs Sass
first and PostCSS second, so `@include light-dark(…)` or `@include smaller-than(…)` is
read by Sass as an undefined Sass mixin and fails the build before PostCSS ever sees it.
Upstream's Sass guide answers this with a `_mantine.scss` that re-implements the preset's
affordances as real Sass — breakpoint variables, `rem()`, and `light` / `dark` / `hover` /
`smaller-than` / `larger-than` mixins — and playgramapp does the same thing under its own
names in `_breakpoints.scss`. So: `styles/_mantine.scss`, pulled in per-file with an
explicit `@use '…/_mantine' as mantine`, following playgramapp rather than upstream's
`sassOptions.additionalData` auto-injection — the explicit form keeps a module's
dependencies visible in the module. (`light-dark()` is a plain CSS function, so it passes
through Sass untouched and is handled downstream as normal.)

In practice this site needs very little of it: `sm:p-20` and `md:grid-cols-2` become
Mantine responsive props (`p={{ base: 'xl', sm: 80 }}`, `cols={{ base: 1, md: 2 }}`), so no
`.module.scss` is expected to carry a media query at all. `_mantine.scss` exists so that
the first one that needs a mixin finds it, rather than silently reaching for a PostCSS
mixin that cannot work.

stylelint extends `stylelint-config-standard-scss` plus the four carve-outs any
CSS-modules codebase needs — `selector-class-pattern` and `keyframes-name-pattern` off
(module class names are camelCase by convention), `:global`/`:local` allowed as pseudo-
classes, `composes` allowed as a property. playgramapp's other entries are deliberately
**not** copied: their custom `playgram/no-raw-media-query` plugin (no shared breakpoint
vocabulary here to protect) and their `declaration-property-value-keyword-no-deprecated` /
`scss/comment-no-empty` disables (carve-outs for their own legacy). Nothing stylistic is
at stake against Prettier — stylelint dropped its stylistic rules in v16.

A `lint:css` script runs it check-only, and `vet.sh` gains it as a fourth concurrent check
alongside typecheck/eslint/format. It satisfies that file's stated contract: it reads only
`.css`/`.scss` and writes nothing, so it is independent of everything it runs beside.

### Print styling: no house precedent, so this is the one invented piece

playgramapp has zero `@media print`. Meanwhile Mantine has no equivalent of Tailwind's
`print:` variant, and reproducing 84 of them as per-component `@media print` blocks would
scatter one concern across six files.

The existing `@media print` block in `globals.css` **already** sets `h1`–`h6` sizes, list
and paragraph margins, page-break rules and `@page`, so most of those 84 variants (52 are
`print:mb-1` / `print:text-base` / `print:space-y-*` — per-element restatements of what the
global block does) are redundant and simply drop. What survives becomes:

- `styles/print.scss`, imported from the root layout: the existing `@media print` body,
  re-keyed off semantic elements and Mantine data attributes instead of Tailwind's escaped
  class names. `.sm\:p-20`, `.border-foreground\/20`, `.print\:hidden` and friends stop
  existing, so those selectors must be rewritten or they silently do nothing — the single
  largest correctness risk in this change.
- Two utility classes, `.print-hidden` and `.print-only`, covering the 2 `print:hidden` and
  1 `hidden print:block` uses that carry real behaviour.

Being unlayered, this file beats `@layer mantine` for free.

### Component mapping

| Tailwind today                       | Mantine                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `max-w-4xl mx-auto`                  | `<Container size="md">`                                |
| `space-y-N`                          | `<Stack gap>`                                          |
| `flex justify-* gap-N`               | `<Group justify gap>`                                  |
| `grid gap-4 md:grid-cols-2`          | `<SimpleGrid cols={{ base: 1, md: 2 }}>`               |
| `text-Nxl font-bold` headings        | `<Title order={N}>`                                    |
| body copy, `leading-relaxed`         | `<Text>`                                               |
| `opacity-60/70/80`                   | `<Text c="dimmed">` or the `opacity` style prop        |
| `underline` anchors                  | `<Anchor>`                                             |
| `font-mono`                          | `<Text ff="monospace">`                                |
| `list-disc list-inside`              | `<List>` / `<List.Item>`                               |
| bordered box (`components/Card.tsx`) | `<Card withBorder radius={0}>`                         |
| icon buttons (theme, locale)         | `<ActionIcon variant="default">`                       |
| print button                         | `<Button variant="default" leftSection={<Printer />}>` |
| `border-t` footer rule               | `<Divider>`                                            |

Per their rule that theme `defaultProps` become unbeatable inline styles, per-instance
values (`fz`, `c`, `w`) are set at the call site; the theme carries only structure (fonts,
radius, palette).

`hooks/useMounted.ts` is deleted — `@mantine/hooks` ships `useMounted`, so keeping our own
`useSyncExternalStore` version duplicates a dependency we now have. `LocalePicker` still
needs the guard (its render depends on `usePathname`); `ThemeToggle` needs it to tell a
stored `auto` from a resolved one.

### Icons stay on `lucide-react` — a knowing divergence

playgramapp has no React icon library: SVGs live under `public/` and their styling rule
bans inline SVG in TSX. Faithfully adopting that here means building an `Icon` component
and a slug registry for four glyphs (Sun, Moon, Monitor, Printer). Their pattern earns
itself across a large icon set; at four it is pure overhead, and `lucide-react` already
works and has no coupling to Mantine. CLAUDE.md's "Don't replace what already works"
settles it — swapping icon systems is a separate change with its own diff. See the open
question below.

### `CVPage.tsx` gets split

373 lines today, and the Mantine conversion will not shrink it. Rather than let it drift
past CLAUDE.md's ~450-line guideline, extract the two structures the CV already repeats
verbatim: a titled section wrapper and an experience entry (title / period / prose /
bullets / mono tech-stack line). That is a seam the conversion exposes, not a speculative
refactor — see **DRY notes** for what is deliberately _not_ extracted.

## Steps

1. **Toolchain swap.** Add the Mantine, Sass and stylelint packages; remove `tailwindcss`,
   `@tailwindcss/postcss` and `next-themes`. Replace `postcss.config.mjs` with
   `postcss.config.cjs` in playgramapp's exact form. Add `stylelint.config.mjs`, a
   `lint:css` script, and the fourth concurrent check in `scripts/vet.sh`.
2. **Tokens.** Rewrite `app/globals.css` down to the font wiring and a `--color-*` block
   (the `@import 'tailwindcss'` and `@theme inline` block go). Add `lib/css-color.ts` with
   the `CssColor` union and helper.
3. **Sass helpers.** Add `styles/_mantine.scss` — breakpoint variables, `rem()`, and the
   `light` / `dark` / `hover` / `smaller-than` / `larger-than` mixins, per upstream's Sass
   guide.
4. **Theme.** Add `app/theme.ts` exporting `createTheme({ … })`: `white`/`black` bound to
   the tokens, `defaultRadius: 0`, `fontFamily` and `headings.fontFamily` on
   `var(--font-merriweather)`, `fontFamilyMonospace` on `var(--font-mono)`, a monochrome
   `primaryColor` tuple built from `cssColor()`. No visual values in `defaultProps`.
5. **Providers.** Add `app/Providers.tsx` (`'use client'`) importing
   `@mantine/core/styles.layer.css` and holding `<MantineProvider theme cssVariablesResolver
defaultColorScheme="auto">`. In `app/RootLayout.tsx`: spread `mantineHtmlProps` on
   `<html>`, add `<ColorSchemeScript defaultColorScheme="auto" />` to `<head>`, swap
   `ThemeProvider` for `Providers`. Delete `components/ThemeProvider.tsx`.
6. **Print stylesheet.** Move the print rules to `styles/print.scss`, re-keyed off semantic
   selectors, and add `.print-hidden` / `.print-only`. Import from the root layout.
7. **Shared components.** Convert `components/Card.tsx` (to `Card`/`Paper`),
   `ThemeToggle.tsx` (to `ActionIcon` + `useMantineColorScheme`), `LocalePicker.tsx` (to
   `ActionIcon` + `useMounted` from `@mantine/hooks`). Delete `hooks/useMounted.ts`.
8. **`HomePage.tsx`.** Convert per the mapping table; drop the dead `prose prose-invert`
   classes. The avatar keeps its circular crop via `<Image>` + `radius="50%"`.
9. **`CVPage.tsx`.** Convert, extracting the section wrapper and experience entry into
   `app/[locale]/cv/`. Drop the `print:*` variants now covered by `print.scss`.
10. **Docs.** Update `CLAUDE.md` (the stack line and the `app/` row of the layout table
    both name Tailwind; add a `styles/` row and note the new vet check) and `README.md`'s
    "Styling" bullet.
11. **Verify.** `./scripts/vet.sh`, then `/preview` in both schemes plus a print render of
    `/en/cv` — the print path is what this migration most plausibly breaks and the one
    thing `pnpm build` says nothing about.

## DRY notes

- **Genuinely shared, so extracted:** the CV's section wrapper (heading + `Card` + `Stack`,
  6×) and its experience entry (title / period / paragraphs / bullets / mono tech-stack
  line, 5× with identical structure differing only in message keys). Both already exist as
  copy-paste in `CVPage.tsx`; the conversion makes the duplication cost worse, so
  extracting now is net-positive.
- **Reused rather than re-created:** `useMounted` from `@mantine/hooks` instead of
  `hooks/useMounted.ts`; the print rules are the existing `globals.css` block moved and
  re-keyed, not rewritten; `lib/metadata.ts`, `lib/site-config.ts`, `i18n/` and `messages/`
  are untouched.
- **Ported from playgramapp rather than reinvented:** the `cssColor()` helper shape, the
  `cssVariablesResolver` approach, the layered-stylesheet import, the server-layout /
  client-providers split, the SCSS-module + stylelint setup, and the explicit-`@use` habit
  for Sass helpers. Ported _shrunk to fit_ — this site's token union is six entries, not
  ninety, and its stylelint config carries four carve-outs rather than eight — because the
  pattern is what transfers, not the size.
- **Deliberately not extracted — data-driving the CV.** Its content is flat
  `experience.projectN.*` keys in `messages/*.json`, and collapsing the page into a loop
  over a typed array is tempting. That is a real improvement and a genuinely separate
  change: it rewrites both translation catalogues and the next-intl key shape, and would
  tangle a content-model diff into a styling diff, making both unreviewable.
- **Deliberately not extracted — a `<Section>` shared across HomePage and CVPage.** They
  look alike but differ in content (HomePage: card grids and embeds; CVPage: prose in a
  bordered card) and in print behaviour (CVPage sections carry page-break rules;
  HomePage's are effectively `print-hidden`). A shared component would need enough props to
  express both that it would be worse than two small local ones.
- **`ProjectCard` / `ArticleCard` stay separate.** They already share `Card`; the remaining
  difference (stars + tech stack vs. neither) is small but real, and merging behind
  optional props only moves the branching inside.
- **Not adopted from playgramapp:** the `public/` SVG icon system, `Button`/`ActionIcon`
  `data-variant` skins, and their custom `no-raw-media-query` stylelint plugin. Each solves
  a scale problem this site does not have; the rationale is recorded per-decision above
  rather than as a blanket "too small".

## Verification

`pnpm build` is the only automated signal this repo has (CLAUDE.md → Testing) and it proves
nothing about appearance — which is the entire surface this change touches. So the checks
that matter are visual:

- `./scripts/vet.sh` green (build, typecheck, eslint, prettier, stylelint).
- `/preview` of `/` and `/en/cv` in light **and** dark against the pre-change renders. The
  look is preserved exactly, so any visible difference is a bug: pure black/white grounds,
  square borders, serif body, mono tech-stack lines, hairline borders at the same weights.
- A print render of `/en/cv` (print button and browser dialog): A4 fit, page breaks not
  splitting a card mid-entry, header/locale/theme controls hidden.
- `/ru/cv` renders and the locale toggle round-trips.
- Theme toggle cycles light → dark → system with no flash of the wrong scheme on reload.
- `grep -ri tailwind` over the tree returns nothing outside `pnpm-lock.yaml`.

## Open question

Written with its recommendation already in force above, so the plan is implementable
as-is; an answer that differs revises it.

1. **Keep `lucide-react` (recommended), or adopt playgramapp's `public/` SVG icon
   convention?** House bans inline SVG in TSX, but the site has four icons.

### Resolved

- **Mantine v9.6.0**, not the house v8.3.18 — safe here for the reasons recorded under
  "Decisions"; the operator does not mind being a major ahead.
- **SCSS modules + stylelint**, matching house, minus playgramapp's own custom lint rules.
- **The current look is preserved exactly**; Mantine is the mechanism, not a restyle.
