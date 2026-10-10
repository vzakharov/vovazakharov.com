# Music pages: collage cards and a "Listen to … by Vova" title

## Goal

How the music pages unfurl today:

- the index and its tabs → the site avatar (`ava.og.png`), saying nothing about music;
- an artist → the cover of its newest release;
- a song or album → its cover, as a raw 600px square;
- a page with no cover → the site avatar.

What changes, in the operator's words:

- **(a) the index** gets "a cut-up of the latest covers, scattered in different positions and sizes across the picture (some may stick out)";
- **(b) an artist** gets the same, cut from its own releases' covers;
- **(c) a page with no picture** gets one shared placeholder; drawing it is a separate task;
- songs and albums with a cover keep it as it is;
- the pictures carry **no text**, and the unfurl's title reads **"Listen to … by Vova"**.

## Approach

### The collage

One template serves both cards (`scripts/lib/music-collage.ts`, beside `cv-card.ts`), taking a list of cover paths and returning a `StagedPage`:

- a fixed slot table — each slot a position, a size and a rotation, hand-tuned once so the composition holds rather than being re-judged every time a release reshuffles a random one. The first cover takes the largest slot, and the edge slots overhang the card's border;
- the covers staged beside the page under their own names, so their bytes are hashed and a new or changed cover re-flags the card;
- no text on it.

A list shorter than the table fills the leading slots; the table is ordered so any prefix of two or more still composes.

**Which covers:**

- **Index:** the public catalogue's releases that have a cover, newest first, distinct, the first 10 — albums by `newestAlbums`, singles by date, pictured through `releasePicture`.
- **Artist:** the same, over that artist's releases (`artistReleases`) in either locale's credit (`vagabond` is GENERATED's in English, Полуживые's in Russian, so it belongs in both collages), so an artist has one card rather than one per language.
- **An artist with fewer than two covers gets no collage.** One cover is the artist's picture as it is today; none is the placeholder.

### Rendering and format

The collages join `render-og.ts`'s committed lane: about 13 cards (the index and up to 12 artists), rendered by `pnpm content:og:vova` and held to their sources by the `--check` `vet.sh` already runs. Adding a release with a cover therefore re-flags the index card and its artist's, and the vet run fails until they are re-rendered, as filing a basilisk case re-flags the basilisk card.

They are **JPEG**: a spike rendered a three-cover collage at the canvas's 2400×1260 as 1.49 MB of PNG and 0.20 MB of JPEG. Chromium's `--screenshot` picks the format off the extension, so `renderCard` is unchanged; `shared/seo/og-card.ts` gains `.og.jpg` beside `OG_CARD_SUFFIX`, `routeCardPath` takes the suffix, and the manifest's `isOutput` accepts both.

The index card lives at `routeCardPath(musicPath())` — `apps/vova/public/music.og.jpg` — and an artist's at its locale-less route's: `apps/vova/public/music/artists/<slug>.og.jpg`.

### The placeholder

`pages/music/lib/pictures.ts` gains one `MUSIC_PLACEHOLDER` path, and every picker that today returns `undefined` — a song with no cover and no album cover, an album without `cover`, an artist with no cover — returns it instead, so no music page unfurls as the site avatar any more.

**Until the placeholder is drawn, the constant points at the index collage**, the one music picture that stands for the whole catalogue. The follow-up task draws the real one and changes the constant; nothing else moves. `/go` files that task as an issue.

### The title

`constructMetadata` gains `ogTitle`, mirroring its `ogDescription`: it sets `og:title` and `twitter:title`, leaving the page's `<title>` — the browser tab and the search result — as it is.

The music pages pass it from a new message, `music.listenOn`, so it is translated with the rest:

- en: `Listen to {name} by Vova`
- ru: `Слушать {name} у Вовы`

`{name}` is the song's, album's or artist's name in the page's locale. The index has no name to put there and takes `music.listenOnIndex`: `Listen to Vova's music` / `Слушать музыку Вовы`.

The Russian infinitive addresses nobody, so it sidesteps «ты»/«вы». A placeholder that is the site avatar until drawn was ruled out: the avatar says nothing about music, which is the defect this change fixes.

## Steps

1. Spike: confirm `@/pages/music/lib/{songs,catalogue,pictures,albums}` import under `tsx --conditions=react-server` from `scripts/`, as `@/pages/cv/lib` does for the CV card. If they refuse, read the covers' order through a `scripts/lib/` reader instead, as `read-docket.ts` does for cases.
2. `og-card.ts`'s suffix; `music-collage.ts` and its slot table; the two card kinds in `render-og.ts`. Render, look at the index and at an artist with two, five and ten covers.
3. `MUSIC_PLACEHOLDER` and the pickers; the artist metadata choosing collage, cover or placeholder.
4. `ogTitle` and the two messages; the four metadata builders passing it.
5. `pnpm build:vova` and check `og:image` and `og:title` on each page kind; `./scripts/vet.sh`.
6. File the placeholder task as an issue.

## DRY notes

- **Reused:** `render-og.ts`'s `generatedCard` and the committed lane whole (manifest, `--check`, pruning); `og-render.ts`'s `renderCard` and `StagedPage`; `routeCardPath` for both cards' addresses; the music slice's own pickers — `newestAlbums`, `artistReleases`, `releasePicture`, `albumCover` — so a collage cannot disagree with the pages about which covers exist or how new they are.
- **Shared:** one collage template for the index and every artist, differing only in the list it is handed; one `MUSIC_PLACEHOLDER` for every picker's empty case, so the follow-up swaps one constant.
- **`ogTitle` beside `ogDescription`**, rather than the music pages building their own `openGraph` block: the shared builder already owns the og/twitter pairing, and a second copy of it would drift.
- **Not extracted:** the slot table stays inside `music-collage.ts`. It has one consumer and is the design itself; a "layout" abstraction would be a name for a constant.

## Progress

- **Done:** the plan, approved with the operator's answers folded in above. No source edited.
- **Left:** every step, from step 1. The session that approved it paused at its context budget before starting.
