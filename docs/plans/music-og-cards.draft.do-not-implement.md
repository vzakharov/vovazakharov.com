> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Music pages: proper social cards

## Goal

Every page under `/music` unfurls as a 1200×630 card of its own, carrying the picture **and the page's main metadata**, instead of today's:

- the index and its tabs → the site avatar (`ava.og.png`), saying nothing about music;
- a song, an album, an artist → the raw 600px square cover, which X, Facebook and LinkedIn crop to 1.91:1, cutting off the cover's top and bottom and with them whatever lettering it carries.

The asks, in the operator's words: the index is "a cut-up of the latest covers, scattered in different positions and sizes across the picture (some may stick out), captioned _Vova's music_"; every other card has "not just the picture but the main metadata".

## Approach

### Cards are deploy-time artifacts, like the PDFs

A card per page per locale is about **420 images** — 170 songs (147 of them hidden, but a hidden song is precisely the one shared by link), the albums, the artists and the index tabs, times two locales. Committed as the existing `.og.png` cards are, that is tens of megabytes in the tree and as much again in history every time the template changes.

So the music cards follow the PDFs' lane instead of the committed cards': rendered by the deploy after `next build`, copied into `out/`, gitignored, and cached between runs by source hash (`.github/actions/render-pdfs` is the model). Nothing is committed but the generator.

What that costs, stated so it is a choice: `vet.sh` cannot see the cards (as it cannot see a PDF), and a PR shows no card unless someone renders locally — `pnpm content:og:music` (below) does that in one command.

### JPEG, not PNG

A spike rendered a three-cover collage at the canvas's 2400×1260: **1.49 MB as PNG, 0.20 MB as JPEG**. A full collage of photographs is several times that as PNG, past what some consumers fetch. Chromium's `--screenshot` picks the format off the extension, so `renderCard` needs no change: the music cards are `<route>.og.jpg`.

### What each card shows

All cards share one frame: the picture on the left at full card height, the metadata on the right on the site's light plate (`CANVAS_BACKGROUND`, `INK`, `INK_DIM` from `og-render.ts`), and a small `Vova's music` mark in a corner so a card read out of context still says whose it is. Copy is read from the catalogue the page reads, never retyped (the `cv-card.ts` rule), in the page's locale.

| Page   | Picture                                    | Metadata                                                                                                            |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Song   | `songPicture` (own cover, else its album's) | title, its gloss line where the page shows one; artist (with features); album and year; duration; an explicit mark |
| Album  | `albumCover`                               | title and gloss; artist; years (`albumYears`); track count                                                          |
| Artist | `artistPicture`                            | name; counts of albums and songs in that catalogue; years active                                                    |
| Index  | the collage (below)                        | `Vova's music`, large, over the collage                                                                             |

A page whose picture is `undefined` — a song with no cover and no album cover, an artist with neither — takes the **artist's** picture where it has one, else a typographic card: the same frame with the title set large where the picture would be.

### The index collage

- **Which covers:** the public catalogue's newest releases that have a cover — `artistReleases`'s ordering across all artists, albums and singles together, distinct cover paths — the first 10.
- **Where they go:** a fixed slot table in the generator, each slot a position, a size and a rotation, hand-tuned once so the composition is good rather than random; the newest cover takes the largest slot, and the edge slots overhang the card's border, which is what "some may stick out" asks. A fixed table rather than a seeded random layout, because a random one has to be re-judged by eye every time a release reshuffles it.
- **Caption:** `Vova's music` on a plate over the collage, in both locales — it is a name, given verbatim.
- Every index tab and both catalogues (`everything` or not) share the one card per locale: they are one page as far as an unfurl is concerned.

### Wiring the pages

- `shared/seo/og-card.ts` gains the `.og.jpg` suffix beside `OG_CARD_SUFFIX`, and `routeCardPath` takes the suffix, so the address of a card is still derived in one place.
- `pages/music/lib/music-metadata.ts` and `song-page.tsx`'s `generateSongMetadata` stop passing the cover through `pictureCard`: each passes its own route's card, with `ogImageSize: CANVAS` — the size is the canvas's by construction, so nothing reads a file the build has not got yet. `pictureCard` goes, `pictures.ts` keeping what picks the picture.

### The generator

- `scripts/lib/music-card.ts` — the templates, as `cv-card.ts` is for the CV: `songCard`, `albumCard`, `artistCard`, `indexCard`, each returning a `StagedPage` with the pictures staged beside it.
- `scripts/render-music-og.ts` — enumerates every music page per locale off the catalogue (`listSongPages`, `catalogueAlbums`, `catalogueArtists`), builds each card, and renders what drifted through `runRenderJob` with its own manifest (`music-og-renders.json`), plus a `--from-out` mode that copies the renders into `apps/vova/out/` as the PDF lane does.
- `package.json`: `content:og:music`, entered through `in-site.sh vova` with `tsx --conditions=react-server`, as `content:og:vova` is.
- `.github/actions/render-music-cards/action.yml` — restore cache, render what drifted, copy into `out/`, save cache — called from the `vova` publishing lane beside `render-pdfs`.
- `.gitignore`: `apps/vova/public/music/**/*.og.jpg` and the manifest, in the PDFs' block and with its rationale.
- `.claude/rules/content.md`: the trap about OG cards gains the music lane — deploy-time, JPEG, and why — as one bullet under the existing one.

## Steps

1. Spike: confirm `@/pages/music/lib/{songs,catalogue,pictures,albums,projects}` import under `tsx --conditions=react-server` from `scripts/`, as `@/pages/cv/lib` does for the CV card. If the i18n or Next imports refuse, read what the cards need through a `scripts/lib/` reader instead, as `read-docket.ts` does for cases.
2. `og-card.ts` suffix and `routeCardPath`; the generator and its templates; render locally and look at a song with a cover, one without, a long Russian title, an album, an artist, and the index in both locales.
3. Metadata wiring; `pnpm build:vova` and check the `og:image` tags on each page kind.
4. The deploy action, the `.gitignore` block, the `content.md` bullet.
5. `./scripts/vet.sh`.

## DRY notes

- **Reused:** `og-render.ts` whole (`renderCard`, `StagedPage`, `escapeHtml`, the palette), `render-manifest.ts`'s `runRenderJob` for the drift cache, `generatedCard`'s hashing (moved from `render-og.ts` into `og-render.ts`, since two scripts now need it), `routeCardPath` for every address, `CANVAS`/`SCALE` for the frame, and the music slice's own pickers — `songPicture`, `albumCover`, `artistPicture`, `artistReleases`, `albumYears`, `bill`/`projectName` — so a card cannot disagree with its page about a picture or a name.
- **Shared within the new code:** the four templates share one frame function (plate, picture column, corner mark) and differ only in the metadata block they pass it; the collage is the one card that does not use the frame.
- **Not extracted:** the deploy action is a second composite action rather than a generalized `render-pdfs`. The two share a shape (restore, render, copy, save) but not a single input — different script, globs, cache key — and a parameterized action would be the two of them spelled as `if`s.
- **Not unified with `render-og.ts`:** that script's contract is committed renders that `vet.sh --check`s; these are build artifacts. One script with two lanes would make every reader of it learn both.

## Open questions

1. **Where the cards live.**
   a. _(recommended, in force)_ Rendered at deploy, gitignored, cached — the PDFs' lane.
   b. Committed like the other `.og.png` cards and checked by `vet.sh`; costs ~420 files and their weight in history on every template change.
   c. Committed, but English only and only for listed pages, hidden songs falling back to the index collage — small, but a hidden song shared by link unfurls as a generic card.
2. **The caption on the Russian index card.**
   a. _(recommended, in force)_ `Vova's music` in both locales.
   b. «Музыка Вовы» on the Russian card.
3. **A page with no picture.**
   a. _(recommended, in force)_ The artist's picture, else the typographic card.
   b. Always the typographic card when the page's own picker returns nothing.
