# PR #205: refactor: #170 the catalogue's model joins music/shared/catalogue

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/205
- **Author:** @vzakharov (agent)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/music-app
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-24T11:16:42Z
- **Updated:** 2026-10-25T11:05:32Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 80af299). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/music/pages/music/ui/album-page.tsx`:12 — unresolved — last: @vzakharov (human) 2026-10-25T11:02:18Z — "а вот эти два почему оставил отдельно, а не просто а ля cata…" → [↓](#t01)
- **T02** `src/music/pages/music/ui/music-page.tsx`:18 — unresolved — last: @vzakharov (human) 2026-10-25T11:03:26Z — "тут нагляднее -- четыре штуки с catalogue..." → [↓](#t02)

---

## Body

Slice 5a of Multi-App Sliced Design (#169). Slice 5 is cut into three bites, bottom-up, because as one it was ~110 files, a 580-line stylesheet every layer shares and a dozen layer calls. The bites: this one; the player with music's app layer (5b); the five pages (5c). `docs/plans/multi-app-sliced-design.paused.md` § "Eaten so far" holds what landed.

## Summary

- **The catalogue's model leaves the page.** 21 modules move from `pages/music/lib` to `music/shared/catalogue`, with their tests: songs, albums, artists, their files, texts, pictures and addresses. Every music page and script reads them. They go to the shared segment rather than to `song`/`album`/`artist` entities, which would each need `@x` imports of the others; kernel's `shared/content` is the precedent.
- **Two cuts close the set.** A track's shape (`PlayerTrack`, `Billing`, `Streamed`) is `track.ts`, cut from `player-state.ts`, since `songs.ts` builds it. `SONG_AUTHOR` and `CreditedName` are `author.ts`, cut from `people.ts`, so a script's test takes them without zod.
- **The barrel follows the runtime graph.** `index.node-safe.ts` holds only modules whose runtime imports reach no `server-only`, filesystem or zod. That is what a client component and a script without the `react-server` condition can load. Everything else goes through `index.ts`, and inside the segment modules import each other by leaf. `pages/music/index.node-safe.ts` is gone.
- **Music's scripts enter through the barrels** and leave the grandfathered `boundaries/dependencies` block. `music:scaffold` runs under `react-server`, as `music:masters` already does. `list-untold-songs` stays listed until slice 7: under bare Node it reads `catalogue-names.ts`, a filesystem module that no barrel imported by client components may hold.
- **A page reads an album, an artist or a song once.** Pages used to ask a function per fact (`albumTitle`, `albumGloss`, `albumArtist`, `albumCover`…). Now `albumInfo`, `artistInfo` and `songInfo` return everything about one thing in one language, and `catalogueAlbum` adds what the songs say of it: its kind, its years, the tile's detail line. The per-fact readers are what these are built from, and they no longer leave the segment.

## QA Checklist

- [ ] `music-pages` — On a vova build, open `/music`, an artist, an album, a song and `/music/radio` in both languages. Each renders as before.
- [ ] `player` — Play a song from a list, skip, shuffle, switch to lossless. The bar and the queue behave as before.
- [ ] `feed` — `/music/songs/en/feed.xml` lists the songs with their enclosures.
- [ ] `masters` — `pnpm music:masters check` reports every song tagged.
- [ ] `scaffold` — `pnpm music:scaffold` loads under its new `react-server` condition and reaches its own argument and network handling.
- [ ] `untold` — `pnpm music:untold` and `pnpm check:stanza-repeats` run under bare Node through the node-safe barrel.
- [ ] `boundaries` — Lint passes with music's scripts out of the grandfathered block.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `music-pages` | e2e | ✅ | `build (vova)` in vet renders every music route; a page's correctness is still `/preview`'s |
| `player` | manual-only | — | Live audio and the player's feel in a browser |
| `feed` | e2e | ✅ | The vova build emits both feeds |
| `masters` | integration | ✅ | `music:masters check` runs in vet's song job |
| `scaffold` | integration | ❌ | Run `music:scaffold --help` in vet to prove the entry loads its imports |
| `untold` | integration | ✅ | vet's song job runs both under bare Node |
| `boundaries` | integration | ✅ | vet's lint |

https://claude.ai/code/session_01ARaeZx19bRNM9VUdfhpnuq

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-24T11:28:29Z — "Proposed squash body: ``` The first of slice 5's three bites…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-24T11:28:29Z

[https://github.com/vzakharov/vovazakharov.com/pull/205#issuecomment-6383653834](https://github.com/vzakharov/vovazakharov.com/pull/205#issuecomment-6383653834)

Proposed squash body:

```
The first of slice 5's three bites, which turn music from one page
slice into an app of its own. Every music page and script read the
catalogue's model out of pages/music/lib, a page's internals, so the
model moves below the pages before they are split.

music/shared/catalogue now holds the model: songs, albums, artists,
their files, texts, pictures and addresses. It is a shared segment, as
kernel's shared/content is, rather than song, album and artist
entities that would each need @x imports of the others. A track's shape
is cut from the player's state into track.ts, since songs.ts builds it,
and the author's name from people.ts into author.ts.

Its two barrels split by runtime graph. index.node-safe.ts holds only
modules that reach no server-only, filesystem or zod at run time, so a
client component or a script without the react-server condition can
load it; everything else is index.ts's. Music's scripts enter through
them and leave the grandfathered boundaries block, music:scaffold
running under react-server as music:masters does; list-untold-songs
stays listed, reading catalogue-names.ts under bare Node.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_4 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `src/music/pages/music/ui/album-page.tsx`:12 — unresolved — last: @vzakharov (human) 2026-10-25T11:02:18Z — "а вот эти два почему оставил отдельно, а не просто а ля cata…" → [↓](#t01)
- **T02** `src/music/pages/music/ui/music-page.tsx`:18 — unresolved — last: @vzakharov (human) 2026-10-25T11:03:26Z — "тут нагляднее -- четыре штуки с catalogue..." → [↓](#t02)

<a id="t01"></a>

### `src/music/pages/music/ui/album-page.tsx`:12 — unresolved

```diff
@@ -7,19 +7,10 @@ import { NameLink, PageShell } from '@/shell/shared/ui';
… 10 lines elided …
-  albumWipNote,
-  albumYears,
-  artistPath,
+  catalogueAlbum,
   catalogueSongs,
```

**@vzakharov (human)** — 2026-10-25T11:02:18Z

а вот эти два почему оставил отдельно, а не просто а ля catalogueInfo?

---

<a id="t02"></a>

### `src/music/pages/music/ui/music-page.tsx`:18 — unresolved

```diff
@@ -4,24 +4,19 @@ import type { ReactNode } from 'react';
… 15 lines elided …
-  artistPath,
+  artistInfo,
   artistPicture,
+  catalogueAlbum,
   catalogueAlbums,
   catalogueArtists,
   catalogueSongs,
```

**@vzakharov (human)** — 2026-10-25T11:03:26Z

тут нагляднее -- четыре штуки с catalogue...

---

## Timeline (status, references, and other events)

- **2026-10-24T22:46:48Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/205#pullrequestreview-5640370634.
- **2026-10-25T11:05:32Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/205#pullrequestreview-5642847616.
