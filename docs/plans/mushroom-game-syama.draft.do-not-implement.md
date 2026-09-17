> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Syama's mushroom game, stage one: the static meadow

A full-screen meadow at `/mushrooms` with two motionless fly agarics on it,
drawn by a game engine and filling whatever screen opens it. Nothing moves and
nothing can be pressed yet. What it proves is the one thing that could change
every later decision — Phaser 4 inside this static export — and what it leaves
behind is the route, the page, the slice and the drawing conventions every
later stage builds on.

The game as a whole, its spec and the list of what follows this stage live in
issue #65. The working scheme is one PR at a time: this PR takes the first item
and, on landing, edits the issue with what it found still open. The drawing
and the transcripts ride this branch under `docs/remove-before-merging/` and
are swept before the merge; the drawing moves into the slice as a reference
(below), the transcripts are quoted in the issue.

## Decisions this stage carries

- **No text anywhere in the game**, so a child of any age can play — the
  operator's rule, in issue #65. Follows from that: **no locales.** One route,
  `/mushrooms`, metadata in English like the rest of the site's pages, no
  catalogue block, nothing from `shared/i18n`.
- **Phaser 4** (4.2.1 is current on npm), loaded on this route alone: a WebGL
  renderer with a canvas fallback, scene graph, tweens, input, scale manager and
  sound in one dependency — the standard answer to "an HTML5 game". ~1.2 MB
  minified, ~300 kB over the wire, in this route's chunk; the rest of the site
  does not pay for it. No physics engine.
- **React owns the page, Phaser owns the canvas.** A `'use client'` component
  renders a `<div>`, imports Phaser inside `useEffect` — Phaser reaches for
  `window` when its module evaluates, so the import is dynamic and never runs
  on the server — creates the game with that element as parent and destroys
  it on unmount.
- **The page is the canvas.** No `PageShell`: `100dvh`, no scroll,
  `touch-action: none` so a swipe does not scroll and a pinch does not zoom.
  The scale manager runs in `RESIZE` mode and the scene lays itself out from
  the camera size on every resize — a phone held upright and a tablet held
  sideways both get a full meadow, no letterbox. The site's theme corner stays
  where the root layout puts it; the meadow does not follow the scheme yet.
- **Sprites are SVG in the slice**, rasterised by Phaser at the device's pixel
  ratio at load, so they are crisp on a retina tablet with no atlas step. Flat
  cartoon idiom: thick dark outline, flat fill, one highlight, one shade. The
  asset layer is keyed by name and size so any sprite can be replaced by a PNG
  later without touching code.
- **`palette.ts` is the one file on the site holding colour literals.** The
  site's rule that no component writes one exists so both colour schemes hold
  together through the `--color-*` tokens; a canvas is out of a stylesheet's
  reach, and a meadow is red and green in either scheme. `.claude/rules/styling.md`
  § Colours gains one sentence saying so, scoped to that path — the rule's own
  home rather than a suppression elsewhere.

## What gets built

**Route.** `apps/vova/app/mushrooms/page.tsx`, a one-line re-export like the
music page's. `PAGE_ROUTES` gains `mushrooms: '/mushrooms'`, which is what puts
it in the sitemap.

**Slice.** `src/pages/mushrooms/`:

```
src/pages/mushrooms/
  index.ts                     MushroomsPage, mushroomsMetadata
  lib/
    mushrooms-metadata.ts      constructMetadata({ title, description, path }) — English, like the music page's
  model/
    game.ts                    CAPS as const, Cap, Mushroom = WithId & { cap }, GameState, INITIAL_STATE — two mushrooms
  assets/
    reference/
      syama-drawing.webp       the drawing the sprites are read from — moved here from docs/remove-before-merging/
    cap-spotted.svg            red, white spots
    cap-plain.svg              red
    stem.svg                   cream
  ui/
    mushrooms-page.tsx         server: the full-bleed frame → MushroomGame
    mushroom-game.tsx          'use client': mounts Phaser into a div, destroys it on unmount
    mushroom-game.module.scss  the full-bleed frame
    scene/
      boot-scene.ts            loads the SVG textures at device resolution, starts the meadow
      meadow-scene.ts          sky gradient, ground, the mushrooms from INITIAL_STATE; re-lays out on resize
      mushroom.ts              a Container: cap over stem, sized by layout
      layout.ts                every position and size as a function of the camera size
      palette.ts               the game's colours
```

The model is types and an initial state, no reducer: there is no action yet
for one to answer. `Cap` and every dispatch map derive from `CAPS`, so the
two dark caps of stage two are added in one place. The reducer and its
`node:test` arrive with the first action, in the PR that adds `+`.

**The scene.** A vertical sky gradient (a `Graphics` rectangle with a
four-corner fill), a ground band with a few grass tufts drawn as `Graphics`,
and the two mushrooms standing on the ground line at positions the layout
computes from the width — side by side on a tablet, still side by side but
smaller on a phone. On `resize`, the layout is recomputed and everything is
repositioned; nothing is recreated.

**Page metadata.** Title "Mushrooms", description "A meadow of fly agarics,
from a drawing by Syama." — the one place the author is named in this stage;
whether the page itself credits Syama is issue #65's item 9.

**Not in this stage** — everything in issue #65 "What remains": the other caps,
the controls, insects, the mouse house, sound, day and night, reduced motion,
the hidden button row, a way home, a home-page link.

**Open question** — with the option the plan is written to, so silence means
the recommendation stands:

1. **Who draws the three sprites.** (a, recommended) this session, as SVG in
   the idiom above, judged in `/preview` at tablet resolution and iterated
   there — three sprites are cheap to replace, and the question for the whole
   sprite sheet is issue #65's item 1; (b) the operator supplies them and the
   stage is built against grey placeholders until they land.

## Steps

1. `pnpm add phaser`; `ui/mushroom-game.tsx` mounting an empty Phaser game
   into a div; the route file and `index.ts`; `pnpm build:vova` green and the
   page opened in `/preview`'s headless Chromium with a canvas in it. This is
   the spike, done in place — the skeleton _is_ the spike, and there is
   nothing to throw away if it works. If Turbopack and Phaser 4 disagree, stop
   here and report before anything else is written.
2. `model/game.ts`; `scene/palette.ts`; `scene/layout.ts`.
3. The three SVGs, shown together in the meadow scene against a flat
   background and judged in `/preview` before the sky and ground are drawn.
4. `scene/boot-scene.ts`, `scene/meadow-scene.ts`, `scene/mushroom.ts`; the
   sky, the ground, the resize handling.
5. `ui/mushrooms-page.tsx` + module, `lib/mushrooms-metadata.ts`, the
   `PAGE_ROUTES` entry, the drawing moved into `assets/reference/`, the
   sentence in `styling.md`.
6. `/preview` of `/mushrooms` as a phone upright, a tablet sideways and a
   desktop, both themes (the theme corner has to stay legible over the sky);
   fix what the screenshots show.
7. `/polish`, then hand the PR to `/pr`; on landing, tick stage one in #65
   and write down anything found still open.

## DRY notes

- **Metadata reuses `constructMetadata` wholesale**, as the music page does —
  `title`, `description` and `path` are already its parameters, and with no
  locale there is no `hreflang` map to build. Nothing new in `shared/seo`.
- **The route is one line and the sitemap entry is one key** because
  `PAGE_ROUTES` already feeds `sitemap()`; no new listing anywhere.
- **The game shares nothing with the rest of the site below the page, on
  purpose.** No other page has a canvas, an engine or sprites, so a
  `shared/game` segment or a `features/` slice would have one consumer and
  fail Steiger's `insignificant-slice`. Everything Phaser stays under
  `pages/mushrooms/ui/scene/`; `Mushroom` is not an `entities/` slice for the
  same reason.
- **Numbers and colours have one home each.** `layout.ts` is the only file
  that positions or sizes anything; `palette.ts` the only file with a colour
  literal. A sprite that needs a colour reads the palette; a scene that needs
  a position asks the layout.
- **Textures are loaded once and stamped per mushroom** — one stem texture
  under two caps, not two stems.
- **No test in this stage**, and that is stated rather than papered over: the
  model is a constant and the scene is looked at, not asserted. A test that
  drove Phaser would test Phaser. The reducer that arrives with `+` brings the
  first `game.test.ts` with it.
- **`WithId` from `shared/typings` is the base for `Mushroom`**, so `id` has
  its one home now and the `Insect` of a later stage intersects the same base
  rather than redeclaring it — which `pnpm type-overlap` would fail.
