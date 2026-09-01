> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Migrate styling from Tailwind 4 to Mantine

Replace Tailwind CSS with [Mantine](https://mantine.dev) as the styling and component
layer, remove Tailwind from the toolchain, and follow `Playgramai/playgramapp`'s
conventions where they transfer.

## What playgramapp actually does

Read directly from the repo (`gh` reaches it — it is private, and `add_repo` and the
GitHub MCP tools both refuse it, but the CLI is authorized). The conventions that bear
on this migration:

|                 | playgramapp                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mantine         | `^8.3.18` — the tip of v8; v9 is a major they have not taken                                                                                                                         |
| Stylesheet      | `@mantine/core/styles.layer.css` (the `@layer mantine` build), imported from a `'use client'` providers module                                                                       |
| Layout split    | `root-layout.tsx` (server) holds `<html {...mantineHtmlProps}>` + `<ColorSchemeScript defaultColorScheme="dark" />`; `root-providers.tsx` (`'use client'`) holds `<MantineProvider>` |
| Token overrides | a `cssVariablesResolver`, **not** `:root` CSS — see below                                                                                                                            |
| PostCSS         | `postcss.config.cjs` with `postcss-preset-mantine` + `postcss-simple-vars` carrying the five `mantine-breakpoint-*` values                                                           |
| Colours         | CSS custom properties in `app/globals.css`, reached from TSX through a typed `cssColor()` helper whose union type is the source of truth for which tokens exist                      |
| Component CSS   | co-located `.module.scss`, linted by stylelint; inline `style={}` is "a smell"                                                                                                       |
| Theme           | `createTheme` with per-component `classNames` bound to a `theme.module.scss`, plus `data-variant` skins for `Button`/`ActionIcon`                                                    |
| Icons           | **no React icon library at all** — SVGs live under `public/` and are referenced by URL                                                                                               |
| Print styles    | none, anywhere — zero `@media print` in the repo                                                                                                                                     |

Two of their documented traps are worth importing wholesale, because both are written up
as things that already bit them:

- **`:root` token overrides lose to Mantine's stylesheet.** `root-providers.tsx` carries
  the note verbatim: _"Must go through the resolver because Mantine's stylesheet ships
  after globals.css under Turbopack and wins a plain `:root` override."_ Next 16 builds
  with Turbopack here too, so this applies unchanged.
- **Theme `defaultProps` render as inline styles**, which no CSS-module class can beat.
  Their styling rule calls the resulting mess out explicitly and says the proper fix is
  to stop baking visual values into `defaultProps`. This migration starts clean, so it
  simply never puts `fz`/`lh`-style values in `defaultProps`.

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
`foreground/20`–`foreground/40` hairline borders.

Colour scheme is currently owned by `next-themes` (`class="dark"` on `<html>`), with
`hooks/useMounted.ts` as the hydration guard for `ThemeToggle` and `LocalePicker`.

## Decisions

### Mantine v8.3.18, matching the house pin

v9.6.0 exists, but playgramapp is the stated example and has not taken that major. On v8
their `theme.ts` shape, `cssVariablesResolver` pattern, and every line of
`.claude/rules/styling.md` transfer verbatim; on v9 each becomes a thing to re-verify
for no benefit this site can use. Peer range is `react ^18.x || ^19.x`, satisfied by the
`react@19.2.0` pinned here.

Packages: `@mantine/core@^8.3.18`, `@mantine/hooks@^8.3.18` (dependencies);
`postcss-preset-mantine@^1.18.0`, `postcss-simple-vars@^7.0.1` (devDependencies).
Removed: `tailwindcss`, `@tailwindcss/postcss`, `next-themes`.

No `next.config.ts` change is needed — Mantine is CSS-variable and CSS-module based, so
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
holds `<MantineProvider>`. `components/ThemeProvider.tsx` is deleted — `Providers.tsx`
is its replacement, one boundary instead of two.

(`defaultColorScheme` is `"auto"` here, not their `"dark"`: this site's toggle offers
system as a real third state, theirs does not.)

### Tokens go through `cssVariablesResolver`

Mantine's stock body/text colours are `#fff`/`#242424` and `#000`/`#C9C9C9` — close to,
but not, the pure black-and-white this site uses. The obvious fix is four `:root` rules
in `globals.css`; playgramapp's comment says that exact approach loses the cascade under
Turbopack, and they moved to a resolver because of it. So:

```ts
const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { '--mantine-color-body': cssColor('background'), '--mantine-color-text': cssColor('foreground'), … },
  dark:  { … },
});
```

with the literal hexes living as `--color-*` custom properties in `globals.css`, per
their "never hardcode a colour value in a component" rule.

### A `cssColor()` helper, scaled to two colours

`lib/css-color.ts` mirrors `src/shared/ui/css-color.ts`: a `CssColor` union naming every
token, and `cssColor(c)` returning `var(--color-${c})`. Theirs is ~80 lines because they
have ~90 tokens; this site has about six — `background`, `foreground`, and the
`border-hairline` / `border-hairline-strong` pair standing in for `foreground/20` and
`foreground/40`. The value is the same at either size: adding a token means extending
the union, so a typo is a type error rather than a silently dead `var()`.

### Import the layered stylesheet

`@mantine/core/styles.layer.css`, as playgramapp does. Wrapping Mantine in
`@layer mantine` means unlayered CSS — the print stylesheet, the hairline rules — wins on
cascade alone, with no `!important` (their styling rule bans new ones) and no dependence
on Next's CSS import order.

### Print styling: no house precedent, so this is the one invented piece

playgramapp has zero `@media print`. Meanwhile Mantine has no equivalent of Tailwind's
`print:` variant, and reproducing 84 of them as per-component `@media print` blocks would
scatter one concern across six files.

The existing `@media print` block in `globals.css` **already** sets `h1`–`h6` sizes, list
and paragraph margins, page-break rules and `@page`, so most of those 84 variants (52 are
`print:mb-1` / `print:text-base` / `print:space-y-*` — per-element restatements of what
the global block does) are redundant and simply drop. What survives becomes:

- `app/print.css`, imported from the root layout: the existing `@media print` body,
  re-keyed off semantic elements and Mantine data attributes instead of Tailwind's
  escaped class names. `.sm\:p-20`, `.border-foreground\/20`, `.print\:hidden` and
  friends stop existing, so those selectors must be rewritten or they silently do
  nothing — the single largest correctness risk in this change.
- Two utility classes, `.print-hidden` and `.print-only`, covering the 2 `print:hidden`
  and 1 `hidden print:block` uses that carry real behaviour.

Being unlayered, this file beats `@layer mantine` for free.

### Component CSS: plain `.module.css`, and no stylelint

playgramapp writes `.module.scss` and lints it with stylelint (plus a custom
`no-raw-media-query` rule pointing at their Sass breakpoint mixins). Both exist to manage
a large, many-authored stylesheet surface.

After this migration this site's non-Mantine CSS is `globals.css` (tokens and fonts) plus
`print.css`. There are no Sass variables to share, no breakpoint mixin vocabulary to
enforce — `postcss-preset-mantine` already supplies `@mixin smaller-than` — and nothing
for a linter to catch. Adding `sass`, `stylelint`, `stylelint-config-standard-scss` and a
bespoke plugin rule to guard two files is machinery outrunning the problem. So: plain CSS,
no stylelint, and `vet.sh` unchanged. Co-located `.module.css` if a component ever needs
rules a Mantine prop cannot express; none is expected to.

This is a deliberate divergence — see **Question 2** if you'd rather match house exactly.

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
values (`fz`, `c`, `w`) are set at the call site; the theme carries only structure
(fonts, radius, palette).

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
settles it — swapping icon systems is a separate change with its own diff. See
**Question 3**.

### `CVPage.tsx` gets split

373 lines today, and the Mantine conversion will not shrink it. Rather than let it drift
past CLAUDE.md's ~450-line guideline, extract the two structures the CV already repeats
verbatim: a titled section wrapper and an experience entry (title / period / prose /
bullets / mono tech-stack line). That is a seam the conversion exposes, not a speculative
refactor — see **DRY notes** for what is deliberately _not_ extracted.

## Steps

1. **Toolchain swap.** Add the four Mantine packages; remove `tailwindcss`,
   `@tailwindcss/postcss` and `next-themes`. Replace `postcss.config.mjs` with
   `postcss.config.cjs` in playgramapp's exact form.
2. **Tokens.** Rewrite `app/globals.css` down to the font wiring and a `--color-*` block
   (the `@import 'tailwindcss'` and `@theme inline` block go). Add `lib/css-color.ts`
   with the `CssColor` union and helper.
3. **Theme.** Add `app/theme.ts` exporting `createTheme({ … })`: `white`/`black` bound to
   the tokens, `defaultRadius: 0`, `fontFamily` and `headings.fontFamily` on
   `var(--font-merriweather)`, `fontFamilyMonospace` on `var(--font-mono)`, a monochrome
   `primaryColor` tuple built from `cssColor()`. No visual values in `defaultProps`.
4. **Providers.** Add `app/Providers.tsx` (`'use client'`) importing
   `@mantine/core/styles.layer.css` and holding `<MantineProvider theme cssVariablesResolver
defaultColorScheme="auto">`. In `app/RootLayout.tsx`: spread `mantineHtmlProps` on
   `<html>`, add `<ColorSchemeScript defaultColorScheme="auto" />` to `<head>`, swap
   `ThemeProvider` for `Providers`. Delete `components/ThemeProvider.tsx`.
5. **Print stylesheet.** Move the print rules to `app/print.css`, re-keyed off semantic
   selectors, and add `.print-hidden` / `.print-only`. Import from the root layout.
6. **Shared components.** Convert `components/Card.tsx` (to `Card`/`Paper`),
   `ThemeToggle.tsx` (to `ActionIcon` + `useMantineColorScheme`), `LocalePicker.tsx`
   (to `ActionIcon` + `useMounted` from `@mantine/hooks`). Delete `hooks/useMounted.ts`.
7. **`HomePage.tsx`.** Convert per the mapping table; drop the dead `prose prose-invert`
   classes. The avatar keeps its circular crop via `<Image>` + `radius="50%"`.
8. **`CVPage.tsx`.** Convert, extracting the section wrapper and experience entry into
   `app/[locale]/cv/`. Drop the `print:*` variants now covered by `print.css`.
9. **Docs.** Update `CLAUDE.md` (the stack line and the `app/` row of the layout table
   both name Tailwind) and `README.md`'s "Styling" bullet.
10. **Verify.** `./scripts/vet.sh`, then `/preview` in both schemes plus a print render of
    `/en/cv` — the print path is what this migration most plausibly breaks and the one
    thing `pnpm build` says nothing about.

## DRY notes

- **Genuinely shared, so extracted:** the CV's section wrapper (heading + `Card` +
  `Stack`, 6×) and its experience entry (title / period / paragraphs / bullets / mono
  tech-stack line, 5× with identical structure differing only in message keys). Both
  already exist as copy-paste in `CVPage.tsx`; the conversion makes the duplication cost
  worse, so extracting now is net-positive.
- **Reused rather than re-created:** `useMounted` from `@mantine/hooks` instead of
  `hooks/useMounted.ts`; the print rules are the existing `globals.css` block moved and
  re-keyed, not rewritten; `lib/metadata.ts`, `lib/site-config.ts`, `i18n/` and
  `messages/` are untouched.
- **Ported from playgramapp rather than reinvented:** the `cssColor()` helper shape, the
  `cssVariablesResolver` approach, the layered-stylesheet import, and the
  server-layout / client-providers split. Ported _shrunk to fit_ — this site's token
  union is six entries, not ninety — because the pattern is what transfers, not the size.
- **Deliberately not extracted — data-driving the CV.** Its content is flat
  `experience.projectN.*` keys in `messages/*.json`, and collapsing the page into a loop
  over a typed array is tempting. That is a real improvement and a genuinely separate
  change: it rewrites both translation catalogues and the next-intl key shape, and would
  tangle a content-model diff into a styling diff, making both unreviewable.
- **Deliberately not extracted — a `<Section>` shared across HomePage and CVPage.** They
  look alike but differ in content (HomePage: card grids and embeds; CVPage: prose in a
  bordered card) and in print behaviour (CVPage sections carry page-break rules;
  HomePage's are effectively `print-hidden`). A shared component would need enough props
  to express both that it would be worse than two small local ones.
- **`ProjectCard` / `ArticleCard` stay separate.** They already share `Card`; the
  remaining difference (stars + tech stack vs. neither) is small but real, and merging
  behind optional props only moves the branching inside.
- **Not adopted from playgramapp:** SCSS + stylelint, the `public/` SVG icon system, and
  `Button`/`ActionIcon` `data-variant` skins. Each solves a scale problem this site does
  not have; the rationale is recorded per-decision above rather than as a blanket
  "too small".

## Verification

`pnpm build` is the only automated signal this repo has (CLAUDE.md → Testing) and it
proves nothing about appearance — which is the entire surface this change touches. So the
checks that matter are visual:

- `./scripts/vet.sh` green (build, typecheck, eslint, prettier).
- `/preview` of `/` and `/en/cv` in light **and** dark against the pre-change renders —
  pure black/white grounds, square borders, serif body, mono tech-stack lines.
- A print render of `/en/cv` (print button and browser dialog): A4 fit, page breaks not
  splitting a card mid-entry, header/locale/theme controls hidden.
- `/ru/cv` renders and the locale toggle round-trips.
- Theme toggle cycles light → dark → system with no flash of the wrong scheme on reload.
- `grep -ri tailwind` over the tree returns nothing outside `pnpm-lock.yaml`.

## Open questions

Each is written with its recommendation already in force above, so the plan is
implementable as-is; an answer that differs revises it.

1. **Mantine v8.3.18 (recommended) or v9.6.0?** v8 matches the house pin and makes every
   playgramapp pattern transfer verbatim. v9 is the current major but nothing in this
   site needs it, and it would put this repo ahead of the example it is copying.
2. **Plain CSS with no stylelint (recommended), or adopt house SCSS + stylelint?** After
   the migration there are two hand-written CSS files; the house toolchain exists for a
   surface orders of magnitude larger.
3. **Keep `lucide-react` (recommended), or adopt the `public/` SVG icon convention?**
   House bans inline SVG in TSX, but the site has four icons.
4. **Visual fidelity:** preserve the current look exactly (recommended), or let Mantine's
   defaults show through where they are close?
