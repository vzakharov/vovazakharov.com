# Mushroom toy, from Syama's drawing

A page on vovazakharov.com that does what a child's ballpoint drawing and two
voice notes describe: fly agarics you add and take away, a mouse house in each
with windows and a door, and three buttons that send a butterfly, a fly or a bee
to land on them. There is no goal. In the author's words: _"смысл игры — смотреть
на бабочек, мух, пчёл"_.

## The spec, as given

The drawing is `docs/remove-before-merging/syama-drawing.webp` and the two
voice notes are transcribed beside it under
`docs/remove-before-merging/deepgram/syama-mushrooms-{1,2}.transcript.md`; all
three are swept before the merge with the rest of that directory. Read off the
drawing:

- **Two big fly agarics**, side by side, drawn in one blue pen: hatched caps
  with a row of small square **windows** along each cap, and a stem drawn as a
  tall panel with a **door** in it. A butterfly with four dotted wings sits on
  the left cap; a small dark fly sits at the right stem.
- **Left of them, three labelled buttons**: `БАБОЧКА`, `МУХА`, `ПЧЕЛА`, each
  with a tiny pictogram in a square. Transcript 1: pressing one makes that insect
  appear on the mushrooms.
- **Right of them, two mushroom buttons**, one with `+` and one with `−` —
  _"это плюс грибочек, это минус грибочек"_.
- **Under those, a row of window shapes**: a mushroom with a `⊕`, then `○`,
  `□`, and a tall `▯` — the round window, the square window and the door
  (_"тоже нужна моя дверь… эта тоже нужна"_).
- **Across the top, four cap shapes** in a row: spotted (spiky hatching plus a
  dot), plain (just a dot), fully dark, and dark on the lower half. Transcript
  2: when a mushroom is added _"она показывает такое, такое, такое или такое"_
  and you pick one — _"сверху чёрненькая или снизу"_.
- A small mushroom-shaped mark in the top-right corner, unexplained. Read as the
  page's own icon; nothing else is built from it.

## What gets built

**Route.** `/mushrooms`, `/mushrooms/en`, `/mushrooms/ru` — an optional
catch-all `apps/vova/app/mushrooms/[[...locale]]/page.tsx`, the CV's shape with
the variant segment dropped. The bare address serves the default locale in
place; the locale forms are canonical and carry `hreflang` alternates. The toy
is for a Russian-reading child, so `ru` is not optional, and the site's one
existing localized page already settles how a locale rides a URL here.

**Slice.** `src/pages/mushrooms/`, a page slice like `pages/cv`:

```
src/pages/mushrooms/
  index.ts
  lib/
    mushrooms-urls.ts          mushroomsPath(locale?) — the one place the URL shape is decided
    mushrooms-route-params.ts  server-only: the zod schema for the catch-all, generateStaticParams' list, defaults
    mushrooms-metadata.ts      generateMushroomsMetadata(locale, path) — title/description from the catalogue, canonical + hreflang
    toy.ts                     the state model: types, the reducer, the limits
    toy.test.ts                node:test over the reducer
  ui/
    mushrooms-page.tsx         server: NextIntlClientProvider(locale) → PageShell → title, toy, locale nav, BackToHome
    mushroom-toy.tsx           'use client': useReducer over `toy.ts`; the scene and the controls
    mushroom.tsx               one fly agaric as inline SVG: cap variant, windows on the cap, door on the stem
    insect.tsx                 the three sprites as inline SVG, one component keyed by kind
    cap-picker.tsx             the four caps shown when a mushroom is being added
    mushroom-toy.module.scss   scene layout, insect placement, the flutter/landing animation
```

**State model (`lib/toy.ts`)** — pure, so it is what the tests cover:

- `CAPS = ['spotted', 'plain', 'dark-top', 'dark-bottom']`, `INSECTS = ['butterfly', 'fly', 'bee']`, `OPENINGS = ['round-window', 'square-window', 'door']` as `const` arrays; every type and dispatch map derives from them.
- A `Mushroom` is `WithId & { cap, openings: Opening[] }`. An `Insect` is `WithId & { kind, mushroomId, perch: { x, y } }` — where on the cap it sits, in cap-local unit coordinates.
- `ToyState = { mushrooms, insects, selectedId, picking: boolean }`. `picking` is the "she shows you such, such, such or such" moment: `+` opens the picker, choosing a cap closes it and adds the mushroom, which becomes selected. Tapping a mushroom selects it; `−` removes the selected one and its insects, selection falling to its neighbour.
- Openings and the door are added to the **selected** mushroom, in the order pressed — the cap wears the windows, the stem wears the door. This is the reading of the drawing where the window buttons sit under one mushroom.
- Insect actions carry their target and perch **in the action** (`{ type: 'land', kind, mushroomId, perch }`); the component rolls the dice, the reducer stays deterministic.
- Limits: `MAX_MUSHROOMS = 8` (the `+` disables at the cap; the row wraps before then), `MAX_INSECTS = 24` (the oldest flies off when a new one lands — the scene never grows without bound, and a child who keeps pressing keeps seeing something happen). `MAX_OPENINGS = 6` per mushroom, so a cap keeps its shape.
- Initial state: two mushrooms, one `spotted` and one `plain`, as drawn — the page is never empty on arrival.

**Drawing.** Everything is inline SVG in `currentColor`, hatched fills and no
colour literals: the site's tokens are black and white, the source is one blue
pen, and an ink-drawing toy in the site's foreground colour is both faithful
and free — no new token, both themes for nothing. The four caps differ in fill
pattern (hatch + dots / dots / solid / solid lower half), which is exactly how
the drawing distinguishes them. Insects land with a short CSS transition from
above the cap and idle with a slow flutter; both are off under
`prefers-reduced-motion`.

**Controls.** Mantine `Button`s in a `Group`, each carrying its pictogram and
its label, the label from the catalogue — matching the drawing's
word-plus-square. `+` / `−` with the cap picker rendered inline under them
while `picking`. The window/door row. Every label is a message key.

**Messages.** A `mushrooms` block in both `en.json` and `ru.json`: `metadata`
(`title`, `description`), `title`, the three insects, `addMushroom`,
`removeMushroom`, `pickCap`, the four caps, the three openings, `selectHint`
("tap a mushroom to choose it"), and `credit` ("Drawn and designed by Syama" /
"Придумал и нарисовал Сяма"). `Messages` is typed off `en`, so a key missing
from `ru` fails the type check.

**Sitemap.** `src/app/lib/sitemap.ts` lists the two locale forms, next to the
CV's — the bare `/mushrooms` is an alias and stays out, for the reason the CV's
short rungs do.

**Open questions** — each with the option the plan is written to, so silence
means the recommendation stands:

1. **Colour.** (a, recommended) one-colour ink drawing in the foreground token,
   as drawn; (b) colour — red caps, white spots, a yellow bee — which means new
   colour tokens for both schemes and a second design pass.
2. **Credit line.** (a, recommended) "Придумал и нарисовал Сяма" under the toy;
   (b) no name on the page.
3. **The original drawing on the page.** (a, recommended) not shown — it is a
   phone photo of a notebook, and the toy is its rendering; (b) shown under the
   toy as "the original", which moves the file into `apps/vova/public/` for
   good.
4. **Home-page link.** (a, recommended) none, per "Not built"; (b) add
   `/mushrooms` to the footer's `SEE_ALSO`.

**Not built.** No home-page link (the page is reachable by address, and the
footer's `SEE_ALSO` is a deliberate list). No persistence across visits — a
static export hydrates from a fixed initial state, and reading `localStorage`
into the first render is a hydration mismatch for a feature nobody asked for.
No sound, no score.

## Steps

1. `WithLocale` base type in `shared/i18n` (see DRY notes), `CvPageProps` rewritten onto it.
2. `LocaleNav` in `shared/ui` taking `hrefFor(locale)`; the CV's `LocalePicker` becomes a call to it.
3. `lib/toy.ts` and `lib/toy.test.ts` — the reducer first, red-green, before any pixel.
4. `lib/mushrooms-urls.ts`, `lib/mushrooms-route-params.ts`, `lib/mushrooms-metadata.ts`, the catalogue block in both languages.
5. `ui/mushroom.tsx`, `ui/insect.tsx`, `ui/cap-picker.tsx` — the SVGs, checked in `/preview` in both themes before wiring.
6. `ui/mushroom-toy.tsx` + module, `ui/mushrooms-page.tsx`, `index.ts`, the route file, the sitemap entries.
7. `/preview` of `/mushrooms/ru` at phone and desktop widths, both themes; fix what the screenshots show.
8. `/polish`, then hand the PR to `/pr`.

## DRY notes

- **`WithLocale = { locale: Locale }` is shared, not duplicated.** `CvPageProps` already declares `locale`, and the new page's props would declare it again — which `pnpm type-overlap` fails at floor 1. Its home is `shared/i18n` beside `Locale` (exported from the ordinary barrel; it is a type, so it costs the client bundle nothing), and both pages intersect it.
- **`LocaleNav` is lifted to `shared/ui`; the CV's `LocalePicker` is its first caller rewritten.** Today that component maps `routing.locales` to `Chip`s with `cvPath` baked in. The new page needs the identical row with `mushroomsPath` baked in — the second consumer that makes the abstraction real. The lifted component takes `hrefFor: (locale: Locale) => string`; `pages/cv` keeps a one-line `LocalePicker` only if the variant binding reads better there, else calls `LocaleNav` directly.
- **The route-params schema is written again, not extracted.** The CV's is `[] | [variant] | [variant, locale]`, the toy's `[] | [locale]`. A generic "optional trailing locale" builder would have to take the CV's variant tuple as a parameter, and the two schemas together are under twenty lines; forcing one abstraction over two shapes hides which segments each route actually answers. `localeSchema` and `routing` are the shared parts, and both are reused.
- **`mushroomsPath` mirrors `cvPath` in shape and stays separate.** Both are `[BASE, ...address].join('/')`. A shared `joinAddress(base)` would save one line per file and cost each URL module its one-glance readability; not worth it at two.
- **`generateMushroomsMetadata` reuses `constructMetadata` wholesale**, as the CV's does — `canonical`, `languages` and `path` are already its parameters. What is not reused is the CV's `hreflang` map construction (six lines); a helper `localeAlternates(pathFor)` in `shared/seo` would serve both, and is taken **if** the two come out byte-identical at implementation time, else left.
- **SVG primitives are not shared with anything** — nothing else on the site draws. The hatch pattern is one `<pattern>` defined once in `mushroom.tsx` and referenced by id by the caps that use it; the insects carry their own paths.
- **`useReducer` over a pure module is the one pattern**, no state library, and the reducer's tests are the only tests: the components render what state says and nothing more, so a rendering test would test React.
