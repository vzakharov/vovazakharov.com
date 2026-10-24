# PR #205: refactor: #170 the catalogue's model joins music/shared/catalogue

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/205
- **Author:** @vzakharov (agent)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/music-app
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-24T11:16:42Z
- **Updated:** 2026-10-24T22:46:48Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/music/pages/music/lib/music-metadata.ts`:18 — unresolved — last: @vzakharov (human) 2026-10-24T22:43:14Z — "not insisting если текущая структура сильно этому противится…" → [↓](#t01)
- **T02** `src/music/pages/music/ui/album-page.tsx`:18 — unresolved — last: @vzakharov (human) 2026-10-24T22:45:21Z — "вот тут вообще, конечно" → [↓](#t02)
- **T03** `src/music/pages/music/ui/music-page.tsx`:22 — unresolved — last: @vzakharov (human) 2026-10-24T22:45:49Z — "с каталогом что-то похожее" → [↓](#t03)
- **T04** `src/music/pages/music/ui/song-page.tsx`:28 — unresolved — last: @vzakharov (human) 2026-10-24T22:46:01Z — "с песнями" → [↓](#t04)

---

## Body

Slice 5a of Multi-App Sliced Design (#169). Slice 5 is cut into three bites, bottom-up, because as one it was ~110 files, a 580-line stylesheet every layer shares and a dozen layer calls. The bites: this one; the player with music's app layer (5b); the five pages (5c). `docs/plans/multi-app-sliced-design.paused.md` § "Eaten so far" holds what landed.

## Summary

- **The catalogue's model leaves the page.** 21 modules move from `pages/music/lib` to `music/shared/catalogue`, with their tests: songs, albums, artists, their files, texts, pictures and addresses. Every music page and script reads them. They go to the shared segment rather than to `song`/`album`/`artist` entities, which would each need `@x` imports of the others; kernel's `shared/content` is the precedent.
- **Two cuts close the set.** A track's shape (`PlayerTrack`, `Billing`, `Streamed`) is `track.ts`, cut from `player-state.ts`, since `songs.ts` builds it. `SONG_AUTHOR` and `CreditedName` are `author.ts`, cut from `people.ts`, so a script's test takes them without zod.
- **The barrel follows the runtime graph.** `index.node-safe.ts` holds only modules whose runtime imports reach no `server-only`, filesystem or zod. That is what a client component and a script without the `react-server` condition can load. Everything else goes through `index.ts`, and inside the segment modules import each other by leaf. `pages/music/index.node-safe.ts` is gone.
- **Music's scripts enter through the barrels** and leave the grandfathered `boundaries/dependencies` block. `music:scaffold` runs under `react-server`, as `music:masters` already does. `list-untold-songs` stays listed until slice 7: under bare Node it reads `catalogue-names.ts`, a filesystem module that no barrel imported by client components may hold.

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

- **T01** `src/music/pages/music/lib/music-metadata.ts`:18 — unresolved — last: @vzakharov (human) 2026-10-24T22:43:14Z — "not insisting если текущая структура сильно этому противится…" → [↓](#t01)
- **T02** `src/music/pages/music/ui/album-page.tsx`:18 — unresolved — last: @vzakharov (human) 2026-10-24T22:45:21Z — "вот тут вообще, конечно" → [↓](#t02)
- **T03** `src/music/pages/music/ui/music-page.tsx`:22 — unresolved — last: @vzakharov (human) 2026-10-24T22:45:49Z — "с каталогом что-то похожее" → [↓](#t03)
- **T04** `src/music/pages/music/ui/song-page.tsx`:28 — unresolved — last: @vzakharov (human) 2026-10-24T22:46:01Z — "с песнями" → [↓](#t04)

<a id="t01"></a>

### `src/music/pages/music/lib/music-metadata.ts`:18 — unresolved

```diff
@@ -7,20 +7,31 @@ import {
… 2 lines elided …
 
-import { spelledText, textHook } from '@/music/shared/catalogue';
+import {
+  albumArtist,
+  albumCover,
+  albumPath,
+  albumText,
+  albumTitle,
+  artistCard,
+  artistPath,
+  artistText,
```

**@vzakharov (human)** — 2026-10-24T22:43:14Z

not insisting если текущая структура сильно этому противится -- но как-то много album/artistВсяких -- не стоит ли сделать единые импортимруемые а-ля "получить инфо об альбоме/артисте", и оттуда уже вынимать?

---

<a id="t02"></a>

### `src/music/pages/music/ui/album-page.tsx`:18 — unresolved

```diff
@@ -6,18 +6,29 @@ import { pick } from '@/kernel/shared/lib/collections';
… 2 lines elided …
 
-import { scriptSample } from '@/music/shared/catalogue';
+import {
+  albumArtist,
+  albumCover,
+  albumGloss,
+  albumKind,
+  albumPath,
+  albumText,
+  albumTitle,
+  albumWipNote,
+  albumYears,
```

**@vzakharov (human)** — 2026-10-24T22:45:21Z

вот тут вообще, конечно

---

<a id="t03"></a>

### `src/music/pages/music/ui/music-page.tsx`:22 — unresolved

```diff
@@ -8,23 +8,29 @@ import { byLocale } from '@/kernel/shared/i18n';
… 14 lines elided …
   albumWipNote,
+  artistPath,
+  artistPicture,
   catalogueAlbums,
   catalogueArtists,
+  catalogueSongs,
```

**@vzakharov (human)** — 2026-10-24T22:45:49Z

с каталогом что-то похожее

---

<a id="t04"></a>

### `src/music/pages/music/ui/song-page.tsx`:28 — unresolved

```diff
@@ -14,29 +14,33 @@ import { FileLink, hoverDim, PageShell, TextLink } from '@/shell/shared/ui';
… 8 lines elided …
   scriptSample,
+  songLyrics,
+  type SongPageEntry,
+  songPath,
+  songPicture,
   songTitle,
+  songTrack,
```

**@vzakharov (human)** — 2026-10-24T22:46:01Z

с песнями

---

## Timeline (status, references, and other events)

- **2026-10-24T22:46:48Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/205#pullrequestreview-5640370634.
