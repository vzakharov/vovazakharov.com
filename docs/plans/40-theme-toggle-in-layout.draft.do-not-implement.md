> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# #40 — the theme toggle comes from the layout

Closes [#40](https://github.com/vzakharov/vovazakharov.com/issues/40). Export: `docs/issue/40/issue.md`.

Six pages render `<ThemeToggle />` themselves — every page on the site, which is
the objection: an opt-in every consumer takes is not an opt-in. The toggle moves
into the app layer so it lands once, `CornerHeader` retires with it, and a page
renders nothing for it. Riding along, from the issue's comment: the CV's
locale/`.pdf` row moves above the header separator.

## Where it lands

A new `src/app/ui/theme-corner.tsx` (+ `theme-corner.module.scss`) renders the
toggle in an absolutely-positioned box, and `RootLayout` renders it once inside
`<ThemeProvider>`, as a sibling of `{children}`. `NextIntlClientProvider` is
already above that point, so the toggle's `useTranslations('ui')` still
resolves; `ThemeProvider` is what its `useMantineColorScheme` needs.

The app layer may import `@/features/switch-theme` through its public API —
`eslint.config.ts`'s boundaries policy allows app → any layer, and
`steiger.config.mjs` already exempts `src/app/ui/**` from `fsd/no-ui-in-app`.
The file is reached relatively from `root-layout.tsx` (app segments reach each
other directly), so `src/app/ui/index.ts` gains no export.

**The anchor is the page, not the viewport.** `position: absolute` against the
document, so the toggle scrolls away exactly as today's does — the issue's
comment settles the horizontal anchor ("regardless of the current page's
header/max width") and says nothing about scroll, and a fixed toggle would
overlap running prose at phone width, where the site's column has no gutter to
spare. (`position: fixed` was the alternative — always reachable on a long case
study, but it needs a scrim to be safe on a phone, which is more than this issue
asks for.)

The inset is the toggle's own, since the three page shells disagree —
`PageShell` and the CV pad 32px → 80px at `sm`, the article page 32px → 48px at
`sm` → 64px at `lg`. Start at **32px, 48px above `sm`**, and settle it with
`/preview`: it has to clear the first line of content on all six pages at phone
width, and read as a corner rather than as a stray icon on a wide desktop.

`print-hidden` already sits on the control itself (#36), so nothing new is
needed for paper.

## The call sites

| File                                              | Change                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/app/ui/root-layout.tsx`                      | render `<ThemeCorner />` inside `<ThemeProvider>`                                                            |
| `src/app/ui/theme-corner.tsx`, `.module.scss`     | new — the positioned box                                                                                     |
| `src/shared/ui/corner-header.tsx`, `.module.scss` | delete                                                                                                       |
| `src/shared/ui/index.ts`                          | drop the `CornerHeader` export                                                                               |
| `src/pages/home/ui/home-page.tsx`                 | `CornerHeader` → `<Stack component="header" gap={24} ta="center">`                                           |
| `src/pages/cv/ui/cv-sheet.tsx`                    | `CornerHeader` → a `header` element keeping `classes['header']`; the locale/`.pdf` row gains a class (below) |
| `src/pages/writing/ui/writing-page.tsx`           | drop the `<Group justify="flex-end">` row                                                                    |
| `src/pages/music/ui/music-page.tsx`               | same                                                                                                         |
| `src/pages/case-studies/ui/case-studies-page.tsx` | same                                                                                                         |
| `src/pages/case-studies/ui/article-page.tsx`      | the nav keeps the back-link and loses `justify="space-between"`                                              |

`CornerHeader` goes rather than losing its `corner` prop: with the corner gone
it is a one-prop wrapper around a `<header>`, and both call sites read better
spelling that element themselves.

On the three `<Group justify="flex-end">` pages the row was a child of a
`Stack gap={48}`, so removing it lifts the page's first content by ~86px — a
real visual change to look at, not just a deletion.

## The CV separator

**The separator moves down past the locale/`.pdf` row; nothing else moves.**
`classes['header']` carries `padding-bottom: 32px` and the hairline
`border-bottom`, and the `<Group>` is the header's next sibling in
`.pageSections` — so today the line falls between them. The border alone
relocates: `.header` keeps its padding and loses its `border-bottom`, and the
`<Group>` gains a class carrying that border plus the matching
`padding-bottom`. The DOM is untouched apart from the added `className`, and the
name, tagline, contacts and both controls stay exactly where they are.

Two consequences to hold:

- **The new class is `print-hidden`'s neighbour, so print never sees the line.**
  Today the separator prints, as the header's own border. The row it moves onto
  is `print-hidden`, so on paper the CV header would lose its rule entirely —
  which is a change to the printed page, not just the screen. Keep it by giving
  `.header` its `border-bottom` back inside `@media print`, where the row is
  gone and the header is once again the last thing before the sections.
- **`padding-bottom` on the row is screen-only**, for the same reason.

Nesting the `<Group>` inside the `<header>` was the alternative: same pixels,
but it restructures the DOM and re-homes the row's print handling for a border
that could just move.

## Rendered artifacts

`PRINT_SOURCES` in `scripts/render-pdf.ts` hashes `src/shared/ui` wholesale, and
`DOCUMENT_SOURCES`/`CV_SOURCES` hash `src/pages/case-studies/ui` and
`src/pages/cv` — so deleting `corner-header.*` alone re-flags **every** PDF.
Run `pnpm content:pdf` and commit the re-rendered PDFs; `pnpm content:pdf
--check` in the vet run is what catches the omission. The printed pages should
be byte-identical in content — the only screen-only elements moved are already
`print-hidden` — so a diff that changes visible print output is a bug, not an
expected re-render.

Social cards are unaffected: the CV's are rendered from `scripts/lib/cv-card.ts`
and the catalogue, neither of which this touches.

`src/app/ui` is **not** added to `PRINT_SOURCES`. The rule is that anything
shaping the printed page belongs in one of those lists, and nothing this change
puts there does — `ThemeCorner` is print-hidden. (`root-layout.tsx` declaring
the print fonts is a pre-existing gap in those lists, out of scope here.)

## The squash prefix is `feat:`

The change is visible on every page — the toggle's corner moves, three pages
lose a row, the CV's controls cross the separator — so the merge has to deploy,
and only a `feat:` or `fix:` subject clears the workflow's gate. `refactor:`
would read as the honest description of the hoist and would strand the visible
half on `main` until someone dispatched the workflow by hand. Nothing here is
repairing a defect, so `feat:` it is.

## `features/switch-theme` stays a feature

After the hoist the slice has exactly one consumer, which normally trips
Steiger's `fsd/no-insignificant-slice`. It does not here: the rule skips a slice
whose single reference is on the **app** layer (`insignificantSlice` in
`@feature-sliced/steiger-plugin` guards `referenceLocationKey !== "app"`). So
the slice keeps its shape, `pnpm lint:fsd` stays green, and no suppression is
needed. If that ever changes, dissolving the feature into `src/app/ui` +
`src/app/lib` is the FSD-correct move — never a suppression.

## Verification

- `/preview` at desktop and phone width, light and dark, on `/`, `/cv`,
  `/writing`, `/music`, `/case-studies`, `/case-studies/<slug>` — looking for
  the toggle's inset, collision with the first line of content, and the lift on
  the three pages that lost a row. This is the step the issue's "worth looking
  at with `/preview` rather than deciding from source" names, and it is what
  settles the inset numbers above.
- On screen the CV separator sits below the locale/`.pdf` row, with nothing else
  on the page having moved. On paper the header still carries its rule, in the
  same place as on `main`.
- `./scripts/vet.sh` — `pnpm build` covers the six pages' compile and render,
  `lint:fsd` and eslint the layering, `content:pdf --check` the re-render.

## Steps

1. `git mv` the plan to `.in-progress.md`, quoting the go-ahead.
2. Add `theme-corner.tsx` + its module; render it from `RootLayout`.
3. Strip the toggle from the six pages; delete `CornerHeader` and its export.
4. Move the CV separator's border down onto the locale/`.pdf` row, keeping the
   header's rule in print.
5. `/preview` all six pages in both themes at both widths; settle the inset.
6. `pnpm content:pdf`; commit the re-rendered PDFs.
7. `/dry`, `/tighten-docs`, `./scripts/vet.sh`, hand the PR to `/pr`.

## DRY notes

- **The genuinely shared thing is the toggle's placement**, and this change is
  what gives it one home: six call sites collapse into `ThemeCorner`. That is
  the issue, not a side effect of it.
- **`CornerHeader` is deleted, not reused.** Its whole content is
  `position: relative` plus an absolutely-positioned corner; with the corner
  hoisted it wraps a `<header>` and nothing else, and an abstraction over one
  HTML element is worse than the element.
- **Home's and the CV's headers are not factored into a shared `PageHeader`.**
  They share only the element: home's is a centered avatar-and-title stack, the
  CV's a name/tagline/contact stack carrying padding and print rules of its own.
  A shared wrapper would take one prop per difference — which is
  `CornerHeader`'s failure mode repeated with a bigger surface.
- **The toggle's inset does not reuse `PageShell`'s padding.** Binding them
  would read as one decision and silently mis-place the toggle on the article
  page, which has a padding scale of its own. Three sheets already spell their
  own paddings; extracting that scale is a separate change with its own reasons.
- **No new named type.** Both new components are props-free, and deleting
  `CornerHeaderProps` removes one — `pnpm type-overlap` has nothing to say
  either way.
- **The separator's border is not extracted.** It is one declaration living on
  one element; moving it between two elements is an edit, not a case for a
  shared rule.
