# Drawn placeholder covers for the music without one

Every release with no cover gets one laid as a mosaic: a hand-drawn Suprematist composition built from what the release is about, set in Voronoi tiles with dark grout — one style across all of them, so a placeholder reads as one, and the "pieced together" metaphor rides along. Placeholders until the operator generates real artwork.

## The mosaic — the operator's pick

Of a Suprematist set and a procedural d3 alternative, the operator picked the procedural `old-shite`'s Voronoi mosaic as the style for every placeholder: "давай возьмём его (подход с мозаикой) за основу для всего, чтобы у всех заглушек был единый стиль, и было понятно что это, собственно, заглушки".

- **The composition stays the source.** Each `<slug>.svg` (bbf6389) is the motif; the render lays it as tiles — each tile takes the motif's colour under its centroid, with a small per-tile lightness jitter, grout between.
- **Tiles follow the motif.** Points are a relaxed uniform scatter plus extra points along the motif's colour edges, so a sun stays round and fourteen lines of verse stay lines while the tiles stay visibly tiles.
- **It all happens in the one Chromium screenshot.** The cover page draws the motif to a canvas, triangulates with `d3-delaunay` (a devDependency, its bundle staged beside the page), and paints the tiles; seeded by the slug, so a render is a function of its sources. The source hash covers the motif, the page and the staged bundle.
- **Tiles are few and large — about sixty, a relaxed scatter, no points along edges — and each takes the colour most of it sits on.** The operator, on a denser edge-following version: "давай больше ячейки мозаики. вот как было в прежнем shite — лучше всего. темы должны угадываться, а не прорисовываться буквально". A motif detail smaller than a tile vanishes, by design.

## Paused — what is left

- **Done:** the mosaic job in `scripts/render-covers.ts`, `generatedCard` moved to `og-render.ts`, `d3-delaunay` as a devDependency, all twenty JPEGs rendered at sixty tiles (the operator's last word on density). Several motifs were thickened for an earlier, denser pass; that is harmless at this density.
- **Two motifs read as nothing at this density:** `little-lights` (lights smaller than a tile — make a few of them large discs, or fewer, bigger lights on the strings) and `prototypes` (the outlined square is thinner than a tile — make it a solid tilted square, or a broad frame). Re-render with `pnpm music:covers`, look at a contact sheet of all twenty, and check the rest still guess right.
- **Then:** `pnpm music:covers --check`, typecheck, eslint over `scripts/`, knip (the `d3-delaunay` dependency is read by path, which knip may flag — answer it per `knip.ts`'s header, never with a suppression), `/polish`, the PR body and squash proposal refreshed for the mosaic (`/pr`).

The contour-and-glow alternative and the per-cover split were dropped with that pick.

## What gets a cover

At album level where the song is filed under an album, at song level where it is not (`album: null`).

**Albums without `cover: true` (6):** `father-sea`, `old-shite`, `nursery-rhymes`, `prototypes`, `for-none-and-for-all`, `stronger-than-love`.

**Singles not in `SONG_COVERS` (14):** `at-the-diner`, `cross-out`, `good-girl`, `in-the-shadow`, `inside`, `like-that`, `schadina`, `smoke`, `beyond-the-horizon`, `chinaberry`, `minem-babay`, `night-garden`, `little-lights`, `sonnet-74`.

## Pipeline

- Each SVG sits beside its render: `apps/vova/public/music/assets/covers/<slug>.svg` → `<slug>.jpg`, 600×600 — the size and path every existing cover has, so `albumCover`, `songPicture`, the tiles, the zoom and the social card all take it unchanged. A cover with an SVG of its stem is a drawn placeholder; a real one later replaces the JPEG and deletes the SVG.
- `scripts/render-covers.ts` (`pnpm music:covers`) lays every `covers/*.svg` as a mosaic in headless Chromium, which writes JPEG straight from the `--screenshot` extension (checked). Bookkept by `runRenderJob` with a `cover-renders.json` beside the covers, so an edited SVG cannot ship behind a stale JPEG.
- `pnpm music:covers --check` joins the `vet.sh` fan-out beside the OG checks — hashes only, no browser.
- Registry: `cover: true` on the six albums; the fourteen slugs into `SONG_COVERS`. Both docstrings learn the drawn source.

## Concepts

Shared vocabulary: an off-white or coloured ground, black, a Suprematist red, plus whatever the content asks for.

| Cover                  | Drawn as                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `father-sea`           | `father-river`'s sibling: a sea band, a sun half-sunk on the horizon, a white sail plane    |
| `old-shite`            | Faded, overlapping old planes on sepia, a red bolt through them — old stuff jolted alive   |
| `nursery-rhymes`       | Three white bags in a row and one black sheep off the grid, on nursery pink                 |
| `prototypes`           | Blueprint: construction lines and an unfilled square, one red power light                  |
| `for-none-and-for-all` | A night block of windows, a few lit, a white snowstorm diagonal across                     |
| `stronger-than-love`   | A red circle pressed under a heavy black wedge, a thin poison-green bar                    |
| `at-the-diner`         | A record on a neon-dark lounge ground, pixel squares glitching off its edge                |
| `cross-out`            | A dying orange sun crossed out by two black bars, on ash                                   |
| `good-girl`            | A red circle squeezed into a frame too small for it, stones stacked beside                 |
| `in-the-shadow`        | A great black shadow-circle with one pale eye, bare trunks behind                          |
| `inside`               | Squares receding into a stone corridor, a small red figure facing its dark double          |
| `like-that`            | A pink diamond tilted against a gold sun, a black stride line                              |
| `schadina`             | A red candy in its twisted wrapper held behind a block, two bike wheels left out           |
| `smoke`                | A dark tower floor, grey smoke rising, two embers of eyes in the dark                      |
| `beyond-the-horizon`   | A red sun going under, a far white sail, red shards on the shore                           |
| `chinaberry`           | Full moon, a boarded-up window, a branch hung with yellow berries                          |
| `minem-babay`          | Green hills, a sun rising over them, the road leading off                                  |
| `night-garden`         | Organ pipes as a forest of verticals, a silver plate of a moon                              |
| `little-lights`        | A garland of warm lights strung across the dark                                            |
| `sonnet-74`            | Lines of verse on paper, a black earth block below, a red square of soul above it          |

No lettering: the title sits beside every cover already, and text would tie the render to whatever fonts the machine has.

## DRY notes

- **Reused:** `runRenderJob` (`scripts/lib/render-manifest.ts`) for staleness, pruning and `--check`; `renderCard` and `Card` (`scripts/lib/og-render.ts`) for the Chromium screenshot; `contentHash` for the source hash; `findScreenshotChromium` for the browser.
- **Generalized:** `renderCard` hard-codes the OG canvas as the window size, so it takes the size as a parameter defaulting to `PIXELS` — the OG calls stay as they are.
- **Not extracted:** `render-og.ts`'s `svgPage` letterboxes an image on a white plate; a cover is a canvas laying tiles. They share nothing but `<!doctype html>`.
- **Hashing a staged page:** `render-og.ts`'s `generatedCard` hashes a page plus its files, which is what a cover needs; it moves to `og-render.ts` so both jobs take it.
- **Not folded into `render-og.ts`:** that script is the Open Graph job — its own manifest name, its own output suffix — and a cover is a music asset that merely also unfurls. A second job beside it is what `runRenderJob` was built to be shared by.
