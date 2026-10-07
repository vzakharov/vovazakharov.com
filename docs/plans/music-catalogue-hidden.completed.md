# Music catalogue: every master, and a `hidden` flag

## Goal

Bring every master in `vovas-music` onto the site. Two pieces:

1. **The catalogue checklist** — `docs/remove-before-merging/music-catalogue.md`, already on the branch: the root FLAC of each of the 143 repositories that have one, with a guessed master, title and language, for Vova to fill in the project and title (and fix the guesses). Only root FLACs count; `Media/` holds takes, not masters. A plain list, not a table — a list is easier to type into.
2. **`hidden: true`** in a document's frontmatter: the page is built and reachable at its URL, but it appears in no listing — not the index, not the player's queue, not the sitemap — and search engines are told not to index it. It is for a recording that is not finished yet.

The songs themselves get scaffolded once the checklist comes back filled in (§ "Later"), with `description: TBD` in both languages and `hidden` as marked.

## Approach

### `hidden` in frontmatter

- `baseFrontmatterSchema` gains `hidden: z.boolean().default(false)` — on the base rather than on songs, because the sitemap walks every collection at the base shape (`listAllDocuments`), and a field only songs carry would need a song-specific branch there. Every collection then honours it the same way.
- One predicate in `shared/content`, `isListed(document)`, applied wherever documents are **listed**:
  - `renderPrimaryDocuments` — the article and case-study indexes, the Bible and basilisk homes;
  - `sitemap()` in `src/app/lib/sitemap.ts`;
  - `listSongs()` — the music index and the player's queue.
- Where documents are **routed** (`generateStaticParams`: `musicSegmentParams`, the article page's `listDocuments`) nothing changes, so a hidden page is still built.
- Implementation greps for every other consumer of `listDocuments` / `listPrimaryDocuments` / `listAllDocuments` and sorts it into one of the two kinds.

### Not indexed

`constructMetadata` gains `noIndex?: boolean` → `robots: { index: false }`. A hidden song's and a hidden article's metadata pass it. A link shared in a chat still unfurls, since Open Graph tags stay.

### Playing a hidden song

The queue lives in the music layout and is built once from `listSongs()`, so a hidden song is not in it, and `TrackButton` addresses the queue by index (`songQueueIndex`).

- The player's tracks become provider state seeded from the layout's list. `play` takes a `PlayerTrack` instead of an index: a track already in the queue is selected as now; one that is not is appended to the end of the queue and selected (a new reducer action that grows `order` by one position, shuffled or not).
- `TrackButton` takes the track instead of its index; the song page builds the `PlayerTrack` for its own song with the same function `listSongs()` maps with (extracted as `songTrack(document)`).
- So a hidden song plays from its own page, shows in the bar while it plays, and stays in the queue for the rest of the visit — only for someone who opened its link.

### Tests

`player-state.test.ts` covers the append action: the queue grows by one, the appended track becomes current, `next` from it wraps to the start, and shuffle keeps it.

## Later — after the checklist is filled in

- Read the filled checklist and scaffold each song it keeps: master file, project, title, language and `hidden` as marked, `description: TBD` in both languages. `pnpm music:scaffold` today refuses a repository with several root FLACs and reads the title off the file name; it gains a way to be told the master and the authored fields, rather than a second scaffolder.
- New project names go into `MUSIC_PROJECT_NAMES`.
- Album tracks with no repository of their own take the album's repository as `repo`.

## Questions

1. **Where `hidden` lives.** (a, recommended) on every document, as above; (b) songs only — the sitemap then special-cases the music collection.
2. **A hidden song in the player.** (a, recommended) joins the queue when played from its page; (b) its page plays it outside the queue, with a plain `<audio>` — simpler, but then two things can play at once and the bar does not know about it.
3. **Search engines.** (a, recommended) `noindex` on hidden pages; (b) leave them indexable — only off the lists.

## DRY notes

- **One listing predicate** (`isListed`) for every collection and the sitemap, rather than a `filter(!hidden)` at each call site: what "listed" means is decided once.
- **`songTrack(document)`** is extracted from the body of `listSongs()`'s map so the song page and the queue build a `PlayerTrack` the same way; no second construction of the shape.
- **The scaffolder is extended, not duplicated**, for the later step — the FLAC header reading, the first-commit date and the YAML quoting stay in `scripts/scaffold-song.ts`.
- **The checklist generator is not committed**: it ran once to write a working document that never lands (`docs/remove-before-merging/`); keeping a script for it would be code with no second caller.
