> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Drawn placeholder covers for the music without one

Every release with no cover gets one drawn by hand as an SVG, in a loose Suprematist idiom — flat planes, circles, bars, a few tilts, no text — each built from what that release is about. Placeholders until the operator generates real artwork, or for good if they stick.

## What gets a cover

At album level where the song is filed under an album, at song level where it is not (`album: null`).

**Albums without `cover: true` (6):** `father-sea`, `old-shite`, `nursery-rhymes`, `prototypes`, `for-none-and-for-all`, `stronger-than-love`.

**Singles not in `SONG_COVERS` (14):** `at-the-diner`, `cross-out`, `good-girl`, `in-the-shadow`, `inside`, `like-that`, `schadina`, `smoke`, `beyond-the-horizon`, `chinaberry`, `minem-babay`, `night-garden`, `little-lights`, `sonnet-74`.

## Pipeline

- Each SVG sits beside its render: `apps/vova/public/music/assets/covers/<slug>.svg` → `<slug>.jpg`, 600×600 — the size and path every existing cover has, so `albumCover`, `songPicture`, the tiles, the zoom and the social card all take it unchanged. A cover with an SVG of its stem is a drawn placeholder; a real one later replaces the JPEG and deletes the SVG.
- `scripts/render-covers.ts` (`pnpm music:covers`) rasterizes every `covers/*.svg` through headless Chromium, which writes JPEG straight from the `--screenshot` extension (checked). Bookkept by `runRenderJob` with a `cover-renders.json` beside the covers, so an edited SVG cannot ship behind a stale JPEG.
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
- **Not extracted:** `render-og.ts`'s `svgPage` letterboxes inside a padding on a white plate; a cover is full-bleed on its own ground. Sharing it would mean parameterizing away both of the things that make it the OG page, so the cover page is its own ten lines.
- **Not folded into `render-og.ts`:** that script is the Open Graph job — its own manifest name, its own output suffix — and a cover is a music asset that merely also unfurls. A second job beside it is what `runRenderJob` was built to be shared by.
