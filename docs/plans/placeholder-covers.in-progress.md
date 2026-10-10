# Drawn placeholder covers for the music without one

Every release with no cover gets one laid as a mosaic: a motif drawn for the mosaic — a mood gradient and one or two broad gestures from what the release is about — set in Voronoi tiles with dark grout — one style across all of them, so a placeholder reads as one, and the "pieced together" metaphor rides along. Placeholders until the operator generates real artwork.

## The mosaic — the operator's pick

Of a Suprematist set and a procedural d3 alternative, the operator picked the procedural `old-shite`'s Voronoi mosaic as the style for every placeholder: "давай возьмём его (подход с мозаикой) за основу для всего, чтобы у всех заглушек был единый стиль, и было понятно что это, собственно, заглушки".

- **Each `<slug>.svg` is the motif, drawn for the mosaic rather than ported into it.** The operator, on the Suprematist pictures squeezed into tiles: "как будто зациклилась на уже сгенерённых супрематических картинках и теперь стараешься засунуть их в новую форму. такой цели нет". So a motif is a gradient ground that sets the mood, which the tiles break into steps of tone, plus one or two gestures several tiles wide — a glow, a band, a few accent discs. The Suprematist set (bbf6389) is history only.
- **It all happens in the one Chromium screenshot.** The cover page draws the motif to a canvas, triangulates with `d3-delaunay` (a devDependency, its bundle staged beside the page), and paints the tiles; seeded by the slug, so a render is a function of its sources. The source hash covers the motif, the page and the staged bundle.
- **Tiles are few and large — about sixty, a relaxed scatter, no points along edges — and each takes the colour most of it sits on.** The operator, on a denser edge-following version: "давай больше ячейки мозаики. вот как было в прежнем shite — лучше всего. темы должны угадываться, а не прорисовываться буквально". A motif detail smaller than a tile vanishes, by design.

## Paused — what is left

- **Done:** the mosaic job in `scripts/render-covers.ts`, `generatedCard` moved to `og-render.ts`, `d3-delaunay` as a devDependency, all twenty motifs redrawn for the mosaic and rendered at sixty tiles.
- **Waiting on:** the operator's look at the redrawn set.
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

Each motif's own leading comment says what it is drawn as: a mood read off the release's words, as a gradient, and the one or two things in it worth a tile.

No lettering: the title sits beside every cover already, and text would tie the render to whatever fonts the machine has.

## DRY notes

- **Reused:** `runRenderJob` (`scripts/lib/render-manifest.ts`) for staleness, pruning and `--check`; `renderCard` and `Card` (`scripts/lib/og-render.ts`) for the Chromium screenshot; `contentHash` for the source hash; `findScreenshotChromium` for the browser.
- **Generalized:** `renderCard` hard-codes the OG canvas as the window size, so it takes the size as a parameter defaulting to `PIXELS` — the OG calls stay as they are.
- **Not extracted:** `render-og.ts`'s `svgPage` letterboxes an image on a white plate; a cover is a canvas laying tiles. They share nothing but `<!doctype html>`.
- **Hashing a staged page:** `render-og.ts`'s `generatedCard` hashes a page plus its files, which is what a cover needs; it moves to `og-render.ts` so both jobs take it.
- **Not folded into `render-og.ts`:** that script is the Open Graph job — its own manifest name, its own output suffix — and a cover is a music asset that merely also unfurls. A second job beside it is what `runRenderJob` was built to be shared by.
