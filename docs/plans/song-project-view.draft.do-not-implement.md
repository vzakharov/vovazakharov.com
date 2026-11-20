> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# A song's REAPER project as a view-only DAW

The operator's ask: «давай научимся читать и представлять в виде "view-only DAW"
(пока что) RPP-шки из vovas-music; жить это всё должно на каком-то подпути
`songs/<name>/`».

## What is there to read

A survey of all 250 `vovas-music` repositories (2026-10-22):

- **311 `.RPP` files in ~200 repositories.** Of the catalogue's 157 song
  repositories, 139 hold at least one; the 18 without are mostly GarageBand-era
  songs (`birds`, `hello`, `after-us`, …).
- **63 of those 139 hold several**: versions (`актёр v0` … `v14`, `яша_v2` …
  `v5_1`), working copies (`crossout` … `crossout_3`), or a neighbour song's
  project (`bezm` also holds `za_gorizont.RPP`).
- **An RPP is mostly plugin state.** `crossout_3.RPP` is 820 KB for 8 tracks and
  46 items; with the base64 blobs inside `<VST …>`/`<JS …>` dropped, what a view
  needs is a few dozen KB at most. Median file 366 KB, largest 1.4 MB.
- **What the format carries that a view can show**: `TEMPO`, `TIMESIG` and the
  `<TEMPOENVEX>` changes; `MARKER` lines (markers and regions — `crossout` names
  its key in one); per `<TRACK>` its `NAME`, `PEAKCOL`, `VOLPAN`, `MUTESOLO`,
  `ISBUS` (folder depth) and FX chain; per `<ITEM>` its `POSITION`, `LENGTH`,
  `SOFFS`, fades, `PLAYRATE`, take name, and `<SOURCE>` — `WAVE`/`MP3`/`VIDEO`
  with a `FILE`, or `MIDI` with its events.
- **`RENDER_PATTERN` names what the project rendered** (`codep_1.RPP` →
  `codep_1_master`), which is how the project behind a song's master is told
  apart from its siblings.
- **Media is mostly in the repository** (`Media/…`, all present in 7 of 8
  sampled song repos), but some `FILE`s are absolute paths off the author's Mac
  (`/Users/vova/Music/REAPER/Лето прошло/…`). The catalogue repos' audio totals
  ~21 GB.

## The route

**`/music/songs/<slug>/project`, and `/music/songs/<slug>/project/ru`** — a
subpath of the song's own page, inside the catch-all the song page already lives
in. `parseMusicSegments` reads `[songs, <slug>, project]` (the locale still
last), `MusicAddress` gains a `project` page, and `musicSegmentParams` emits it
for every song that has a vendored project. A song without one has no such page.
No sitemap entry: the page is a curiosity off the song, not a destination.

The song page links to it from its facts line — «REAPER project» / «проект
REAPER» — only where the page exists.

## The data: a vendored, stripped RPP per song, parsed at build

`apps/vova/public/music/songs/<slug>/project.rpp` — the song's chosen RPP with
every plugin state blob elided, the route plus an extension per
`.claude/rules/content.md`, so the raw file is served beside the page and a
reader can save it. A header comment names the source: repository, path, blob
SHA.

- **`pnpm music:masters project [<slug> …]`** writes them, since every read of
  those repositories goes through that script (`scripts/song-intake/CLAUDE.md` §
  "A song's repository"). It reads the repository's tree, picks the RPP (below),
  fetches that one blob with `readBlob`, strips it and writes the file.
  `--check` re-reads the trees and reports a song whose chosen RPP's SHA moved —
  online, so it stays out of vet, like `tag`.
- **Which RPP**: the one whose `RENDER_PATTERN` is the stem of the song's master
  or `<slug>_mix`; else the only one there is. Anything else — none matching,
  several matching — is named by a new frontmatter field, `rpp: <path>`, and the
  run fails listing the candidates until one is. (`project` is taken: it is the
  song's billing.)
- **The build parses it.** `next build` reads `project.rpp` and parses it with a
  pure `parseRpp` (below) into a typed `SongProject`, so the page is
  server-rendered HTML and SVG — no client parse, no network at build or at
  view.

## The parser

`src/shared/music-catalogue/rpp.ts`, exported through `index.node-safe.ts` so
the script's strip-and-pick and the build read the file one way.

- **Two layers.** A tokenizer turns the text into a tree of
  `{ tag, params, lines, children }` chunks — RPP's whole grammar is
  `<TAG params` … `>` blocks of space-separated, optionally quoted, lines — and
  a reader maps the tree onto a zod schema per element (`project`, `track`,
  `item`, `marker`, `tempo change`, `midi note`), so an unexpected shape fails
  the build naming the file and line rather than drawing garbage.
- **Unknown tags are kept in the tree and ignored by the reader**, so a project
  using a feature the view does not draw still renders.
- **Derived, not stored**: track depth from the running `ISBUS` deltas, item
  colour falling back to its track's, dB from `VOLPAN`'s linear gain, MIDI notes
  from the `E`/`e` events paired note-on to note-off at the item's ticks per
  quarter, the project length as the last item's end.
- **A `FILE` is shown by its base name only**: an absolute path is the author's
  disk layout, not something the page publishes. The vendored file keeps the
  path; only the rendering drops it.
- `rpp.test.ts` beside it covers the tokenizer (quotes, nested blocks, base64
  runs), the ISBUS depth walk, MIDI pairing, tempo/time-signature changes and
  the strip, on fixtures cut from `crossout_3`, `machines_1` and `stories`.

## The view

`src/pages/music/ui/project-page.tsx` and its pieces, inside the music layout,
so the player bar stays where it is:

- **Header**: the song's title (linking back to its page), tempo, time
  signature, sample rate, length, and the source file's name.
- **Ruler**: bars and beats off the tempo map, markers as flags, regions as
  bands above the lanes.
- **Track list beside the lanes**: name, colour swatch, folder indentation, M/S
  state, volume in dB and pan, the FX chain's plugin names under it.
- **Lanes**: each item a block at its position and length, in its colour, named
  by its take, fades drawn as ramps, muted items hatched, a MIDI item showing
  its notes as a miniature piano roll.
- **Zoom**: one small client island that sets a pixels-per-second CSS variable
  (fit to width by default, + / −); everything else is server-rendered, so the
  page costs that island's JS and no more.
- Horizontal scroll inside the arrangement on a phone; the track list stays
  pinned on the left. Both themes, through the existing tokens.

## Not in this PR

- **Waveforms.** They need peaks computed off ~21 GB of media, a pass of its
  own; the view is built so a lane can take a peaks image later.
- **Playback and a playhead.** "View-only" for now, as asked.
- **Projects of repositories outside the catalogue** (album sessions, songs not
  on the site): a route keyed by song slug has nowhere to put them.
- **Every version of a song's project.** One per song, the one behind its
  master.

## Steps

1. `parseRpp`, the strip, and their tests.
2. `pnpm music:masters project`: pick, strip, write; the `rpp:` field in the
   song schema; a run over all 139 songs, settling the ambiguous ones with the
   operator in one numbered list.
3. The route: `MusicAddress`'s `project` page, the params, metadata, the link on
   the song page.
4. The view, checked with `/preview` on `crossout`, `stories`, `machines` and
   the biggest project, in both themes and at phone width.
5. `songs.md` gains a paragraph on `rpp:` and the vendored file;
   `scripts/song-intake/CLAUDE.md` § "A song's repository" a line on the run
   that refreshes it.

## DRY notes

- **Reused**: `readBlob`/`cloneRepo` and the tree listing from
  `scripts/lib/music-repo.ts` for the fetch; `songPath`/`music-urls.ts` for the
  address, `parseMusicSegments` and `musicSegmentParams` for the route (a fourth
  segment kind, not a new router); the music layout and `MusicRoute` dispatch;
  the song catalogue for which songs exist and their titles; the theme tokens
  for colour.
- **One parser for both sides**: the script needs `RENDER_PATTERN` to pick and
  the block structure to strip, the build needs the rest; both import `rpp.ts`
  through the node-safe barrel rather than each reading the format.
- **`SongProject` is inferred from the zod schemas**, never hand-written beside
  them.
- **Not extracted**: the timeline geometry (seconds ↔ pixels, beats ↔ seconds)
  stays in the project page's `lib/` — the spectrogram is a PNG drawn in Python,
  so there is no second timeline in `src/` to share it with.
