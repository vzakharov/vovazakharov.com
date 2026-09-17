> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Mushroom game, from Syama's drawing

A game on vovazakharov.com that does what a child's ballpoint drawing and two
voice notes describe: fly agarics you add and take away, a mouse house in each
with windows and a door, and three buttons that send a butterfly, a fly or a bee
to land on them. There is no goal. In the author's words: _"смысл игры — смотреть
на бабочек, мух, пчёл"_.

**The bar is a real game, not a form.** Opened on a phone or a tablet it should
read the way a casual mobile game does — a full-screen painted scene, sprites
with shading and outlines, motion with weight (a mushroom that _pops_ up, an
insect that _flies_ in and settles), sound — rather than a row of labelled
buttons above a diagram. The operator's reference is Angry Birds; the operative
words are _rendering and animation_.

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

## Why a web page, and which kind

A browser is where this kind of game normally ships: Angry Birds itself had an
HTML5 build in 2011, and the casual-games portals run on canvas and WebGL. The
site is a static export, which is no constraint — a game is client code, and
nothing here needs a server. What the DOM-and-CSS approach (Mantine buttons,
inline SVG, CSS transitions) cannot give is the feel: dozens of sprites moving
every frame, tweens with easing curves, particles, sound and a stage that fits
the device — those are a game engine's job, and doing them by hand in React is
the slow way to a worse result.

**Engine: Phaser 4** (4.2.1 is current on npm), loaded only on this page. It
carries the whole stack in one dependency — a WebGL renderer with a canvas
fallback, a scene graph, tweens with easings, particle emitters, pointer and
touch input, a scale manager that fits the stage to the screen, and a sound
manager — and is the standard answer to "an HTML5 game". The alternative,
PixiJS + GSAP + Howler, is lighter and gives more control, at the cost of
assembling and scaling the stage ourselves; nothing here needs the control.
No physics engine is switched on: nothing collides, tweens carry every motion.
Bundle: ~1.2 MB minified, ~300 kB over the wire, in this route's chunk alone —
the rest of the site does not pay for it.

**React owns the page; Phaser owns the canvas.** The page component renders
the frame, the credit and the way home; a `'use client'` component mounts a
`<div>`, imports Phaser inside `useEffect` (Phaser reaches for `window` when
its module evaluates, so the import is dynamic and never runs on the server),
creates the game with that element as parent and destroys it on unmount.
Everything visible during play is drawn by Phaser.

## What gets built

**Route.** `/mushrooms`, `/mushrooms/en`, `/mushrooms/ru` — an optional
catch-all `apps/vova/app/mushrooms/[[...locale]]/page.tsx`, the CV's shape with
the variant segment dropped. The bare address serves the default locale in
place; the locale forms are canonical and carry `hreflang` alternates. The
in-game controls are pictograms — a child who cannot read yet has to be able
to play — so the locale reaches the metadata, the credit line, the HUD's
captions and the accessible names of the buttons, not much else. The CV has
already settled how a locale rides a URL here, and the cost of following it is
small.

**The page is the canvas.** No `PageShell`: the game fills the viewport
(`100dvh`, no scroll, `touch-action: none` on the canvas so a swipe does not
scroll the page and a pinch does not zoom it). The scale manager runs in
`RESIZE` mode and the scene lays itself out from the camera size on every
resize, so a phone held upright and a tablet held sideways both get a
full-screen meadow rather than a letterboxed 16:9 box — the ground line, the
row of mushrooms and the docked HUD move with the frame. The credit line and
the way home sit in a thin strip under the canvas, in ordinary page styles.

**Slice.** `src/pages/mushrooms/`, a page slice like `pages/cv`, with a
`model` segment for the state and the Phaser code under `ui/scene/`:

```
src/pages/mushrooms/
  index.ts
  lib/
    mushrooms-urls.ts          mushroomsPath(locale?) — the one place the URL shape is decided
    mushrooms-route-params.ts  server-only: the zod schema for the catch-all, generateStaticParams' list, defaults
    mushrooms-metadata.ts      generateMushroomsMetadata(locale, path) — title/description from the catalogue, canonical + hreflang
  model/
    game.ts                    the state model: types, the reducer, the limits — pure
    game.test.ts               node:test over the reducer
  assets/
    *.svg                      sprite sources: caps ×4, stem, door, windows ×2, insect bodies and wings, HUD icons, clouds
  ui/
    mushrooms-page.tsx         server: NextIntlClientProvider(locale) → the full-bleed frame → MushroomGame, credit, LocaleNav, BackToHome
    mushroom-game.tsx          'use client': mounts Phaser into a div, hands it the strings and the reduced-motion flag, destroys it on unmount
    mushroom-game.module.scss  the full-bleed frame and the strip under it
    scene/
      boot-scene.ts            loads the SVG textures at device resolution, builds the synthesized sounds, starts the meadow
      meadow-scene.ts          the world: sky, clouds, ground, the mushrooms and insects, the HUD; owns the model instance
      mushroom.ts              a Container: cap + stem + windows + door; pop-in, shrink-out, select highlight
      insect.ts                a Container: body + two wings; the fly-in path, the flap, the idle
      hud.ts                   the docked controls: insect buttons, + / −, the cap picker, the window/door row, mute
      layout.ts                every position as a function of the camera size — the one place the numbers live
      palette.ts               the game's colours — the one file on the site holding colour literals (see DRY notes)
      sfx.ts                   Web Audio synthesis of the five sounds; no audio files
```

**State model (`model/game.ts`)** — pure, so it is what the tests cover, and
unchanged in shape by the engine choice:

- `CAPS = ['spotted', 'plain', 'dark-top', 'dark-bottom']`, `INSECTS = ['butterfly', 'fly', 'bee']`, `OPENINGS = ['round-window', 'square-window', 'door']` as `const` arrays; every type and dispatch map derives from them.
- A `Mushroom` is `WithId & { cap, openings: Opening[] }`. An `Insect` is `WithId & { kind, mushroomId, perch: { x, y } }` — where on the cap it sits, in cap-local unit coordinates.
- `GameState = { mushrooms, insects, selectedId, picking: boolean }`. `picking` is the "she shows you such, such, such or such" moment: `+` opens the picker, choosing a cap closes it and adds the mushroom, which becomes selected. Tapping a mushroom selects it; `−` removes the selected one and its insects, selection falling to its neighbour.
- Openings and the door are added to the **selected** mushroom, in the order pressed — the cap wears the windows, the stem wears the door. Five window slots on a cap and one door slot on a stem, so a cap keeps its shape.
- Insect actions carry their target and perch **in the action** (`{ type: 'land', kind, mushroomId, perch }`); the scene rolls the dice, the reducer stays deterministic.
- Limits: `MAX_MUSHROOMS = 8` (the `+` greys out at the cap), `MAX_INSECTS = 24` (the oldest flies away when a new one lands — the scene never grows without bound, and a child who keeps pressing keeps seeing something happen).
- Initial state: two mushrooms, one `spotted` and one `plain`, as drawn — the meadow is never empty on arrival.

**The scene reconciles, the model decides.** The meadow scene holds the
current `GameState`; a HUD press dispatches, and the scene diffs the new state
against the old by id: a mushroom id that appeared is spawned with its pop-in,
one that vanished shrinks out with a puff, an insect that appeared flies in to
its perch, one that vanished flies off. Nothing in the scene mutates state
directly, so the reducer's tests describe what the player sees.

**Art direction.** A colour cartoon in the flat-outlined idiom of casual games:
thick dark outlines, flat fills with one highlight and one shade, a sky
gradient with two slow clouds, a grass line with a few tufts. The four caps
become red-with-white-spots, plain red, brown-topped and brown-bottomed — the
drawing's "чёрненькая сверху / снизу" read as a two-tone cap. Stems are cream,
the door is wood with a round handle, windows are warm yellow. The three
insects are built from parts — a body sprite and two wing sprites — so the
wings can move without frame-by-frame art. Sprites are authored as SVG in the
slice and rasterised by Phaser at load time at the device's pixel ratio, so
they stay crisp on a retina tablet with no atlas step.

_What this session can honestly draw:_ vector art at the level of a good
asset pack — clean, consistent, readable at a glance — not a studio's painted
sprites. Open question 1 is about that ceiling. Whatever the answer, the
asset layer is keyed by name and size so any single sprite can be replaced by
a hand-made PNG later without touching code.

**Animation.** Every motion is a tween with an easing curve, every state change
has one, and nothing snaps:

- A mushroom grows from the ground on add — scale from 0 with a `Back.Out`
  overshoot and a puff of spore particles at the base; on remove it shrinks
  into the ground with a second puff. The selected mushroom breathes very
  slightly (a two-second scale loop of a few percent) and wears a soft outline.
- An insect enters from off-screen along a quadratic curve to its perch, wings
  flapping (a fast `scaleX` loop on the wing sprites — butterflies slow and
  wide, flies and bees fast and small), and settles with a short bob. At rest a
  butterfly opens and closes its wings every few seconds; a fly or bee jitters
  in place now and then and occasionally hops to another spot on the same cap.
- Clouds drift; windows glow when the sky is dark (open question 2).
- HUD buttons squash on press and spring back.
- Under `prefers-reduced-motion`, the idle loops are off and the enter/exit
  tweens run short and without overshoot; nothing is instantaneous, nothing
  flutters.

**Sound.** Five effects synthesized with Web Audio in `sfx.ts` — a bee's buzz
(a low sawtooth with vibrato), a fly's thinner buzz, a butterfly's soft
flutter (filtered noise pulses), a pop for a mushroom growing and a poof for
one leaving, a click for a button. No audio files, so no licences to track and
nothing to download. Browsers refuse to play sound before a gesture, so the
context is created on the first tap; a mute button in the HUD remembers its
state in `localStorage`, which is a per-device preference and hydrates nothing.

**Controls.** All in-canvas, all pictograms, all at least 64 px on the shortest
side: the three insect buttons on one side of the HUD, `+` and `−` on the
other, the window/door row below them, mute in a corner. Captions come from
the catalogue via the props React hands the scene, so they follow the locale;
a canvas is invisible to a screen reader, so a row of visually hidden HTML
buttons beside it carries the same names and dispatches the same actions —
the one piece of the game assistive technology can reach.

**Messages.** A `mushrooms` block in both `en.json` and `ru.json`: `metadata`
(`title`, `description`), `title`, the three insects, `addMushroom`,
`removeMushroom`, `pickCap`, the four caps, the three openings, `mute`,
`unmute`, and `credit` ("Drawn and designed by Syama" / "Придумал и нарисовал
Сяма"). `Messages` is typed off `en`, so a key missing from `ru` fails the type
check.

**Colour literals.** The site's rule is that no component writes a colour
literal — the `--color-*` tokens are what make both schemes hold together.
The game's world is not a component the tokens reach: it is painted onto a
canvas, where a stylesheet has no say, and a meadow is red, green and blue
whichever scheme the site is in. `scene/palette.ts` is therefore the one file
that holds literals, and `.claude/rules/styling.md` § Colours gains one
sentence saying so, scoped to that path — the rule's own home, not a
suppression somewhere else.

**Sitemap.** `src/app/lib/sitemap.ts` lists the two locale forms, next to the
CV's — the bare `/mushrooms` is an alias and stays out, for the reason the CV's
short rungs do.

**Open questions** — each with the option the plan is written to, so silence
means the recommendation stands:

1. **Where the art comes from.** (a, recommended) this session authors the
   sprites as SVG in the flat-cartoon idiom above and iterates on them through
   `/preview` screenshots; the honest ceiling is "good asset pack", and the
   asset layer is built so any sprite can be swapped for a PNG later.
   (b) the operator supplies the sprites — from an image model or an artist —
   against a sprite sheet the first implementation step produces (a list of
   names, sizes and anchor points); the code is built against placeholders
   until they land. (c) Syama's own drawing _is_ the art: the mushrooms and
   insects cut out of the photo and animated as paper — a hand-drawn game in
   the "Draw a Stickman" line rather than a painted one. A different game,
   named so it is chosen against rather than missed.
2. **Day and night with the theme.** (a, recommended) the sky follows the
   site's colour scheme — a day meadow in light, a dusk one in dark, with the
   mouse-house windows glowing — so the one control the site already has does
   something in the game and the windows have a reason to exist; costs a
   second sky gradient and a glow tween. (b) one daytime palette, the theme
   toggle changes only the strip under the canvas.
3. **Sound.** (a, recommended) the synthesized effects above, muted until the
   first tap, with a mute button. (b) none.
4. **Credit line.** (a, recommended) "Придумал и нарисовал Сяма" under the
   canvas; (b) no name on the page.
5. **Home-page link.** (a, recommended) none, per "Not built"; (b) add
   `/mushrooms` to the footer's `SEE_ALSO`.

**Not built.** No home-page link (the page is reachable by address, and the
footer's `SEE_ALSO` is a deliberate list). No persistence of the meadow across
visits — the mute flag is the one thing remembered, and only because it is a
device preference. No score, no levels, no physics engine, no original photo
on the page.

## Steps

1. **Spike in `tmp/`**: Phaser 4 mounted from a `'use client'` component inside this repo's static export, built with `pnpm build:vova` and opened in `/preview`'s headless Chromium. This is the one unknown with the power to change the plan (Turbopack + Phaser 4 + `output: 'export'`), so it goes first and takes an hour, not a day.
2. `WithLocale` base type in `shared/i18n` (see DRY notes), `CvPageProps` rewritten onto it.
3. `LocaleNav` in `shared/ui` taking `hrefFor(locale)`; the CV's `LocalePicker` becomes a call to it.
4. `model/game.ts` and `model/game.test.ts` — the reducer first, red-green, before any pixel.
5. `lib/mushrooms-urls.ts`, `lib/mushrooms-route-params.ts`, `lib/mushrooms-metadata.ts`, the catalogue block in both languages.
6. The sprite sheet: every SVG in `assets/`, shown together in a throwaway gallery scene and judged in `/preview` at tablet resolution before anything moves. Iterate here until the art is right — it is the cheapest place to change it.
7. `scene/layout.ts`, `scene/palette.ts`, `scene/mushroom.ts`, `scene/insect.ts`, `scene/hud.ts`, `scene/meadow-scene.ts`, `scene/boot-scene.ts`: the static meadow first, then the reconciliation from the model, then the tweens, then `sfx.ts`.
8. `ui/mushroom-game.tsx` + module, `ui/mushrooms-page.tsx`, `index.ts`, the route file, the sitemap entries, the sentence in `styling.md`.
9. `/preview` of `/mushrooms/ru` as a phone upright, a tablet sideways and a desktop, both themes, reduced motion on and off; fix what the screenshots show.
10. `/polish`, then hand the PR to `/pr`.

## DRY notes

- **`WithLocale = { locale: Locale }` is shared, not duplicated.** `CvPageProps` already declares `locale`, and the new page's props would declare it again — which `pnpm type-overlap` fails at floor 1. Its home is `shared/i18n` beside `Locale` (exported from the ordinary barrel; it is a type, so it costs the client bundle nothing), and both pages intersect it.
- **`LocaleNav` is lifted to `shared/ui`; the CV's `LocalePicker` is its first caller rewritten.** Today that component maps `routing.locales` to `Chip`s with `cvPath` baked in. The new page needs the identical row with `mushroomsPath` baked in — the second consumer that makes the abstraction real. The lifted component takes `hrefFor: (locale: Locale) => string`; `pages/cv` keeps a one-line `LocalePicker` only if the variant binding reads better there, else calls `LocaleNav` directly.
- **The route-params schema is written again, not extracted.** The CV's is `[] | [variant] | [variant, locale]`, the game's `[] | [locale]`. A generic "optional trailing locale" builder would have to take the CV's variant tuple as a parameter, and the two schemas together are under twenty lines; forcing one abstraction over two shapes hides which segments each route actually answers. `localeSchema` and `routing` are the shared parts, and both are reused.
- **`mushroomsPath` mirrors `cvPath` in shape and stays separate.** Both are `[BASE, ...address].join('/')`. A shared `joinAddress(base)` would save one line per file and cost each URL module its one-glance readability; not worth it at two.
- **`generateMushroomsMetadata` reuses `constructMetadata` wholesale**, as the CV's does — `canonical`, `languages` and `path` are already its parameters. What is not reused is the CV's `hreflang` map construction (six lines); a helper `localeAlternates(pathFor)` in `shared/seo` would serve both, and is taken **if** the two come out byte-identical at implementation time, else left.
- **The game shares nothing with the rest of the site below the page, on purpose.** No other page has a canvas, an engine or sprites, so a `shared/game` segment or a `features/` slice would have one consumer and fail Steiger's `insignificant-slice`. Everything Phaser stays under `pages/mushrooms/ui/scene/`; `Mushroom` and `Insect` are not `entities/` for the same reason.
- **Numbers and colours have one home each.** `layout.ts` is the only file that positions anything; `palette.ts` is the only file with a colour literal on the whole site, and the styling rule names it. A sprite that needs a colour reads the palette; a scene that needs a position asks the layout for it.
- **Textures are built once, instantiated many times.** One stem, one door, two window shapes, three bodies, three wing shapes — each an SVG loaded once and stamped as many times as the state says. Nothing is drawn twice because two mushrooms wear it.
- **The pure model is the only thing under test**, and the scene is the only thing looked at. A test that drove Phaser would test Phaser; `/preview` screenshots judge the scene, the reducer's tests judge what it renders.
