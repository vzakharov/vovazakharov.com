> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Migrate styling from Tailwind 4 to Mantine

Replace Tailwind CSS with [Mantine](https://mantine.dev) as the styling and component
layer, and remove Tailwind from the toolchain entirely.

## Blocker: the reference repo is unreachable from this session

The brief names `playgramai/playgramapp` as the example to follow. **This session
cannot read it.** Both routes are closed:

- `add_repo` refuses it — _"cross-tier adds are not supported in v1: requested
  `playgramai/playgramapp` but session already has repos from owner(s) `[vzakharov]`"_.
- The GitHub MCP tools are scoped to `vzakharov/vovazakharov.com` and deny it outright.

So this plan is written against **stock Mantine v9 conventions**, verified directly
against the published `@mantine/core@9.6.0` package rather than from memory (every API
named below was confirmed present in its type declarations). Wherever `playgramapp`
has a house convention that differs — theme file location, a shared `theme.ts` shape,
an icon set, a `Container` sizing habit — this plan will diverge from it. See
**Question 1** for how to close that gap.

## Current state

Tailwind's footprint here is small and fully enumerable, which is what makes this
migration a contained job rather than a rewrite:

| Surface                 | Detail                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files using `className` | 6 — `app/HomePage.tsx`, `app/[locale]/cv/CVPage.tsx`, `app/RootLayout.tsx`, `components/Card.tsx`, `components/ThemeToggle.tsx`, `components/LocalePicker.tsx` |
| Toolchain touchpoints   | `package.json` (`tailwindcss`, `@tailwindcss/postcss`), `postcss.config.mjs`, `app/globals.css`                                                                |
| `print:` variant uses   | 84 across `CVPage.tsx`, `HomePage.tsx`, `Card.tsx`                                                                                                             |
| Dead classes            | `prose prose-invert` appears 3× in `HomePage.tsx` but `@tailwindcss/typography` is **not installed** — these are already no-ops and simply disappear           |

The visual identity is stark and easy to state: pure `#000`/`#fff` inverted by color
scheme, square borders (no radii except the round avatar), Merriweather serif body,
JetBrains Mono for tech-stack lines, and opacity-based dimming (`opacity-60/70/80/90`)
plus `foreground/20`–`foreground/40` hairline borders.

Colour scheme is currently owned by `next-themes` (`class="dark"` on `<html>`), with
`hooks/useMounted.ts` as the hydration guard for both `ThemeToggle` and `LocalePicker`.

## Decisions

### Mantine v9.6.0

Its peer range is `react ^19.2.0` / `react-dom ^19.2.0`, which this repo pins exactly.
No `transpilePackages` or other `next.config.ts` change is needed — Mantine ships ESM +
CJS with a `./styles.css` export and works under `output: 'export'` because it is
CSS-variable and CSS-module based with no runtime style injection required at request
time.

Packages: `@mantine/core@^9.6.0`, `@mantine/hooks@^9.6.0` (dependencies);
`postcss-preset-mantine@^1.18.0`, `postcss-simple-vars@^7.0.1` (devDependencies).
Removed: `tailwindcss`, `@tailwindcss/postcss`.

### Import the layered stylesheet, not the flat one

Mantine publishes both `@mantine/core/styles.css` and `@mantine/core/styles.layer.css`;
the latter wraps everything in `@layer mantine`. **Use the layered one.** Unlayered CSS
beats any layer regardless of specificity, so the print stylesheet and the token
overrides win over Mantine's component styles without a single `!important` and without
depending on Next's CSS import order. That fragility is worth designing out up front
rather than discovering it as a flaky print layout later.

### Mantine owns the colour scheme; `next-themes` goes

Running both would mean two sources of truth for the same `<html>` attribute and two
localStorage keys racing on first paint. Mantine's `ColorSchemeScript` +
`MantineProvider defaultColorScheme="auto"` + `useMantineColorScheme` cover the exact
three-state light/dark/system behaviour `ThemeToggle` implements today, and every
Mantine component reads `data-mantine-color-scheme` rather than `.dark`.

So: drop `next-themes`, delete `components/ThemeProvider.tsx`, and put
`ColorSchemeScript` in `<head>` with `mantineHtmlProps` spread onto `<html>` (it
carries `suppressHydrationWarning` and the default attribute, replacing the manual
`suppressHydrationWarning` already there).

### Tokens overridden in CSS, not via `cssVariablesResolver`

Mantine's stock body/text colours are `#fff`/`#242424` and `#000`/`#C9C9C9` — close to,
but not, the pure black-and-white this site uses. A `cssVariablesResolver` function
would express that as ~20 lines of TypeScript; four CSS rules in `globals.css` say the
same thing and stay legible next to the print block that also manipulates them:

```css
:root[data-mantine-color-scheme='light'] {
  --mantine-color-body: #fff;
  --mantine-color-text: #000;
}
:root[data-mantine-color-scheme='dark'] {
  --mantine-color-body: #000;
  --mantine-color-text: #fff;
}
```

Border hairlines (`foreground/20`, `foreground/40`) become
`--mantine-color-default-border` derived with `color-mix(in srgb, var(--mantine-color-text) 20%, transparent)`.

### Print styling moves from variants to one semantic stylesheet

There is no Mantine equivalent of Tailwind's `print:` variant, and reproducing 84 of
them as per-component CSS-module `@media print` blocks would scatter one concern across
six files. The existing `@media print` block in `globals.css` **already** sets `h1`–`h6`
sizes, list and paragraph margins, page-break rules and `@page`, so the large majority
of those 84 variants (52 of them are `print:mb-1`, `print:text-base`, `print:space-y-*`
— per-element restatements of what the global block does) are redundant and simply drop.

What survives becomes:

- `app/print.css`, imported from the root layout: the existing `@media print` body,
  re-keyed off semantic elements and Mantine's data attributes instead of Tailwind's
  escaped class names (`.sm\:p-20`, `.border-foreground\/20`, `.print\:hidden` and
  friends stop existing, so those selectors must be rewritten or they silently do
  nothing).
- Two utility classes, `.print-hidden` and `.print-only`, replacing the 2 `print:hidden`
  and 1 `hidden print:block` uses that carry real behaviour.

Being unlayered, this file wins over `@layer mantine` for free.

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

`hooks/useMounted.ts` is deleted — `@mantine/hooks` ships `useMounted`, so keeping our
own `useSyncExternalStore` version would be a hand-rolled duplicate of a dependency we
now have. `LocalePicker` still needs the guard (its render depends on `usePathname`);
`ThemeToggle` needs it to distinguish a stored `auto` from a resolved one.

### Icons stay on `lucide-react`

Mantine's docs use `@tabler/icons-react`, and `playgramapp` may well follow that — but
`lucide-react` works, is already installed, and Mantine has no coupling to any icon set.
CLAUDE.md's "Don't replace what already works" applies: swapping icon libraries is a
separate change with its own visual diff, not part of ditching Tailwind. See
**Question 3**.

### `CVPage.tsx` gets split

It is 373 lines today and the Mantine conversion will not shrink it. Rather than let it
drift past CLAUDE.md's ~450-line guideline, extract the two structures the CV repeats
verbatim: a titled section wrapper and an experience entry (title / period / prose /
bullets / tech-stack line). That is a natural seam the conversion exposes, not a
speculative refactor — see **DRY notes** for what is deliberately _not_ extracted.

## Steps

1. **Toolchain swap.** Add the four Mantine packages, remove `tailwindcss` and
   `@tailwindcss/postcss`, rewrite `postcss.config.mjs` for `postcss-preset-mantine` +
   `postcss-simple-vars` (with the standard `mantine-breakpoint-*` variables).
2. **Theme.** Add `app/theme.ts` exporting `createTheme({ … })`: `white: '#ffffff'`,
   `black: '#000000'`, `defaultRadius: 0`, `fontFamily` and `headings.fontFamily` bound
   to `var(--font-merriweather)`, `fontFamilyMonospace` to `var(--font-mono)`, a
   grayscale `primaryColor` tuple matching the site's monochrome palette.
3. **Root layout.** In `app/RootLayout.tsx`: import `@mantine/core/styles.layer.css`,
   `./globals.css` and `./print.css` in that order; spread `mantineHtmlProps` on
   `<html>`; add `<ColorSchemeScript defaultColorScheme="auto" />` to `<head>`; replace
   `ThemeProvider` with `<MantineProvider theme={theme} defaultColorScheme="auto">`
   inside `NextIntlClientProvider`. Delete `components/ThemeProvider.tsx` and drop
   `next-themes` from `package.json`.
4. **Stylesheets.** Rewrite `app/globals.css` down to the font wiring and the token
   overrides above (the `@import 'tailwindcss'` and `@theme inline` block go). Move the
   print rules to `app/print.css`, re-keyed off semantic selectors, and add
   `.print-hidden` / `.print-only`.
5. **Shared components.** Convert `components/Card.tsx` (to `Card`/`Paper`),
   `ThemeToggle.tsx` (to `ActionIcon` + `useMantineColorScheme`) and `LocalePicker.tsx`
   (to `ActionIcon` + `useMounted` from `@mantine/hooks`). Delete `hooks/useMounted.ts`.
6. **`HomePage.tsx`.** Convert per the mapping table. Drop the dead `prose prose-invert`
   classes. The avatar keeps its circular crop via `<Image>` + `radius="50%"`.
7. **`CVPage.tsx`.** Convert, extracting the section wrapper and experience-entry
   components into `app/[locale]/cv/` alongside it. Drop the redundant `print:*`
   variants now covered by `print.css`.
8. **Docs.** Update `CLAUDE.md` (the stack line and the `app/` row of the layout table,
   both of which name Tailwind) and `README.md`'s "Styling" bullet.
9. **Verify.** `./scripts/vet.sh`, then `/preview` in both colour schemes plus a print
   render of `/en/cv` — the print path is the one this migration most plausibly breaks
   and the one `pnpm build` says nothing about.

## DRY notes

- **Genuinely shared, so extracted:** the CV's section wrapper (heading + `Card` +
  `Stack`, repeated 6×) and its experience entry (title / period / paragraphs / bullet
  list / mono tech-stack line, repeated 5× with identical structure and differing only
  in message keys). These already exist as copy-paste in `CVPage.tsx`; the conversion
  makes the duplication cost worse, so extracting them now is net-positive.
- **Reused rather than re-created:** `useMounted` comes from `@mantine/hooks` instead of
  `hooks/useMounted.ts`; the print rules are the existing `globals.css` block moved and
  re-keyed, not rewritten from scratch; `lib/metadata.ts`, `lib/site-config.ts`, `i18n/`
  and `messages/` are untouched.
- **Deliberately not extracted — data-driving the CV.** The CV's content lives as flat
  `experience.projectN.*` keys in `messages/*.json`, and it is tempting to collapse the
  whole page into a loop over a typed array. That is a genuine improvement and a
  genuinely separate change: it rewrites both translation catalogues, changes the
  next-intl key shape, and would make the styling diff unreviewable by tangling it with
  a content-model diff. Forcing it in here trades one reviewable migration for two
  unreviewable ones.
- **Deliberately not extracted — a shared `<Section>` across HomePage and CVPage.** The
  two pages' sections look superficially alike but differ in what they contain
  (HomePage: grids of cards and embeds; CVPage: prose in a bordered card) and in their
  print behaviour (CVPage sections carry page-break rules; HomePage's are `print-hidden`
  in effect). A shared component would need enough props to express both that it would
  be a worse abstraction than two small local ones.
- **`ProjectCard` / `ArticleCard` stay separate.** They already share `Card`; their
  remaining difference (stars + tech stack vs. neither) is small but real, and merging
  them behind optional props would only move the branching inside.

## Verification

`pnpm build` is the only automated signal this repo has (see CLAUDE.md → Testing), and
it proves nothing about appearance — which is the entire surface this change touches.
So the checks that matter are visual:

- `./scripts/vet.sh` green (build, typecheck, eslint, prettier).
- `/preview` of `/` and `/en/cv` in light **and** dark, compared against the pre-change
  renders — pure black/white grounds, square borders, serif body, mono tech-stack lines.
- A print render of `/en/cv` (the print button and the browser print dialog), checked for
  A4 fit, page breaks not splitting cards mid-entry, and the header/locale/theme controls
  hidden.
- `/ru/cv` renders and the locale toggle round-trips.
- Theme toggle cycles light → dark → system with no flash of the wrong scheme on reload,
  and `grep -r tailwind` over the tree returns nothing outside `pnpm-lock.yaml`.
