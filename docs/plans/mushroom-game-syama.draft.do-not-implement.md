> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Syama's mushroom game, stage one: the static meadow

A full-screen meadow at `/mushrooms` with two motionless fly agarics on it,
each drawn by code from a random seed so that no two are alike, filling
whatever screen opens it. Nothing moves and nothing can be pressed yet. What it
proves is the two things that could change every later decision — Phaser 4
inside this static export, and a procedural mushroom that looks like a
cartoon rather than a diagram — and what it leaves behind is the route, the
page, the slice and the drawing conventions every later stage builds on.

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
- **No sprites — everything is drawn by code, from parameters.** The
  operator's brief: press, another mushroom; press again, another; then a
  whole forest, and every one different — and the same for the insects. So a
  mushroom is not an image but a **generator**: a pure function from a seed
  to a shape (cap width and dome height, stem height and lean, how many spots
  and where, a hue nudge inside its cap type), and a drawing routine that
  paints that shape with vector primitives. Variety is the product, and it
  costs nothing per instance. Nothing is loaded, so there is no boot scene and
  no asset step; the one file in `assets/` is the reference drawing.
- **Phaser 4** (4.2.1 is current on npm), loaded on this route alone: a WebGL
  renderer with a canvas fallback, scene graph, a `Graphics` object for vector
  drawing (paths, arcs, curves, fills, strokes), tweens, input, scale manager
  and sound in one dependency. ~1.2 MB minified, ~300 kB over the wire, in this
  route's chunk; the rest of the site does not pay for it. No physics engine.
  Cartoon shading — outline, flat fill, a highlight, a shade — is layered
  shapes, since `Graphics` gradients are rectangles-only in WebGL; that is
  also how the idiom is usually drawn.
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
- **`palette.ts` is the one file on the site holding colour literals.** The
  site's rule that no component writes one exists so both colour schemes hold
  together through the `--color-*` tokens; a canvas is out of a stylesheet's
  reach, and a meadow is red and green in either scheme. It holds the base
  hues; the generator nudges them per instance. `.claude/rules/styling.md`
  § Colours gains one sentence saying so, scoped to that path — the rule's
  own home rather than a suppression elsewhere.

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
    game.ts                    CAPS as const, Cap, Mushroom = WithId & { cap, seed }, GameState, initialState(random)
    random.ts                  a seeded generator (mulberry32) and the helpers the generators draw from: between, pick, chance
    mushroom-genes.ts          growMushroom(seed, cap): MushroomGenes — every proportion, spot and hue nudge, pure
    mushroom-genes.test.ts     node:test: deterministic per seed, every gene inside its range, spots never overlap the rim
  assets/
    reference/
      syama-drawing.webp       the drawing the generators are read from — moved here from docs/remove-before-merging/
  ui/
    mushrooms-page.tsx         server: the full-bleed frame → MushroomGame
    mushroom-game.tsx          'use client': mounts Phaser into a div, destroys it on unmount
    mushroom-game.module.scss  the full-bleed frame
    scene/
      meadow-scene.ts          sky, ground, the mushrooms from the state; re-lays out on resize
      draw-mushroom.ts         paints MushroomGenes into a Graphics: stem, then cap dome, rim, spots, highlight, outline
      layout.ts                every position and size as a function of the camera size
      palette.ts               the base hues
```

**The model.** `Mushroom` carries its `cap` (one of Syama's four — `spotted`
and `plain` are drawn this stage, the two dark ones are stage two) and a
`seed`, which is its whole genotype: the same seed always grows the same
mushroom, so state stays small and the view stays a pure function of it.
`initialState(random)` seeds two mushrooms, spotted and plain as drawn, from
the visit's own randomness — every visit's pair looks a little different,
which is the generator showing itself before there is a button to press.
There is no reducer yet; it arrives with the first action, in the PR that
adds `+`, and reads the same seeded `random` for the mushrooms it grows.

**The generator (`mushroom-genes.ts`).** Pure, seeded, and the one thing
under test this stage: a cap width in a band around the layout's unit size, a
dome height as a ratio of it, a rim droop, a stem height and a lean of a few
degrees either way, a stem taper, a spot count and for each spot a position on
the dome, a radius and a squash, all kept off the rim; a hue nudge, a
lightness nudge. Tests pin determinism (same seed, same genes), every gene's
range, and the spot placement invariant. What "looks like a mushroom" is judged
in `/preview`, but what can be asserted, is.

**The drawing (`draw-mushroom.ts`).** One `Graphics` per mushroom, drawn once
from its genes at the size the layout gives it: stem as a tapered rounded
shape with a shade on one side; cap as a dome path with a dropping rim, filled
in the cap's base hue nudged by the genes, a darker band under the rim, white
spots as squashed ellipses, a soft highlight ellipse near the top, and a
thick dark outline over everything. Redrawn only on resize. If a forest of
dozens ever costs frames, `generateTexture` turns a drawn mushroom into a
texture in one call — a lever, not a step.

**The scene.** A vertical sky gradient (a `Graphics` rectangle with a
four-corner fill), a ground band with a few grass tufts, and the two
mushrooms standing on the ground line at positions the layout computes from
the width — side by side on a tablet, still side by side but smaller on a
phone. On `resize`, the layout is recomputed and everything is redrawn in
place; nothing is regrown, so the mushrooms keep their look.

**Page metadata.** Title "Mushrooms", description "A meadow of fly agarics,
from a drawing by Syama." — the one place the author is named in this stage;
whether the page itself credits Syama is issue #65's item 9.

**Not in this stage** — everything in issue #65 "What remains": the other two
caps, the controls, insects, the mouse house, sound, day and night, reduced
motion, the hidden button row, a way home, a home-page link.

No open questions: the art direction is settled by the brief above, and the
rest is issue #65's to raise stage by stage.

## Steps

1. `pnpm add phaser`; `ui/mushroom-game.tsx` mounting an empty Phaser game
   into a div; the route file and `index.ts`; `pnpm build:vova` green and the
   page opened in `/preview`'s headless Chromium with a canvas in it. This is
   the spike, done in place — the skeleton _is_ the spike, and there is
   nothing to throw away if it works. If Turbopack and Phaser 4 disagree, stop
   here and report before anything else is written.
2. `model/random.ts`, `model/mushroom-genes.ts` and its test, red-green;
   `model/game.ts`.
3. `scene/palette.ts`, `scene/layout.ts`, `scene/draw-mushroom.ts`: a row of
   eight seeds against a flat background, judged in `/preview` at tablet
   resolution — the cheapest place to tune the genes' ranges until the row
   reads as eight different mushrooms of one family rather than eight noisy
   copies of one. Iterate here.
4. `scene/meadow-scene.ts`: the sky, the ground, the two mushrooms from the
   state, the resize handling.
5. `ui/mushrooms-page.tsx` + module, `lib/mushrooms-metadata.ts`, the
   `PAGE_ROUTES` entry, the drawing moved into `assets/reference/`, the
   sentence in `styling.md`.
6. `/preview` of `/mushrooms` as a phone upright, a tablet sideways and a
   desktop, both themes (the theme corner has to stay legible over the sky),
   and three reloads to see three different pairs; fix what the screenshots
   show.
7. `/polish`, then hand the PR to `/pr`; on landing, tick stage one in #65
   and write down anything found still open.

## DRY notes

- **Metadata reuses `constructMetadata` wholesale**, as the music page does —
  `title`, `description` and `path` are already its parameters, and with no
  locale there is no `hreflang` map to build. Nothing new in `shared/seo`.
- **The route is one line and the sitemap entry is one key** because
  `PAGE_ROUTES` already feeds `sitemap()`; no new listing anywhere.
- **The game shares nothing with the rest of the site below the page, on
  purpose.** No other page has a canvas, an engine or a generator, so a
  `shared/game` segment or a `features/` slice would have one consumer and
  fail Steiger's `insignificant-slice`. Everything Phaser stays under
  `pages/mushrooms/ui/scene/`; `Mushroom` is not an `entities/` slice for the
  same reason.
- **Genes and drawing are two modules, not one, because one is testable and
  the other is looked at.** `mushroom-genes.ts` knows nothing of Phaser and
  runs under `node:test`; `draw-mushroom.ts` knows nothing of randomness and
  paints whatever genes it is given. The insects of stage four get the same
  split (`insect-genes.ts` / `draw-insect.ts`) and share `random.ts`, which
  is why the seeded generator is its own module now rather than a private
  helper of the mushroom's.
- **The seed is the state, the genes are derived.** Storing genes in the model
  would put a dozen numbers per mushroom where one suffices and let the two
  drift; the generator is pure, so deriving is free and always agrees.
- **Numbers and colours have one home each.** `layout.ts` is the only file
  that positions or sizes anything; `palette.ts` the only file with a colour
  literal — the base hues; a per-instance nudge is a gene, not a second
  colour.
- **`WithId` from `shared/typings` is the base for `Mushroom`**, so `id` has
  its one home now and the `Insect` of a later stage intersects the same base
  rather than redeclaring it — which `pnpm type-overlap` would fail. The same
  goes for `seed`: a `Seeded = { seed: number }` base in `model/game.ts` from
  the start, since `Insect` will carry one too.
