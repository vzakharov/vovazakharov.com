# PR #214: refactor: #170 music's pages, each a slice of its own

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/214
- **Author:** @vzakharov (agent)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/music-pages
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T08:44:45Z
- **Updated:** 2026-10-26T11:23:24Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/rules/songs.md`:8 — unresolved — last: @vzakharov (human) 2026-10-26T09:44:31Z — "тут glob всё ещё holds -- и в контексте добавок и вообще?" → [↓](#t01)

---

## Body

## Summary

- **Each music URL kind is a page slice of its own.** `pages/music` keeps the index; `pages/artist`, `pages/album`, `pages/song` and `pages/radio` take their page, props type and metadata — the song page its lyrics, credits, facts and video button, the radio its dial. Music's app layer (`MusicRoute`, the route parse) enters each through its own barrel.
- **What two pages or more share drops below `pages/` by what it is**: `entities/cover` (`CoverHead` with the `CoverZoom` inside it), `entities/hook` and `entities/song` (the explicit badge) each show one noun; `widgets/catalogue-header`, `catalogue-grid`, `music-nav`, `song-list` and `story` compose; `music/shared/ui` keeps only what knows no music — fact lines, the noted span, the WIP mark, the title gloss. Grouping by noun is also what leaves no sideways import between slices.
- **Below the pages**: `music/shared/seo` holds `catalogueMetadata` and `listenTitle`, `songDownloads` joins `shared/catalogue`, and `SONG_FEED` moves to music's `app/lib`, where a feed belongs. `HookLine` takes `hookRuns` from the catalogue's node-safe barrel, since the radio's client card enters `entities/hook` and the plain barrel is server-only (build fails otherwise).
- **`music.module.scss` is cut along its components**, each rule in exactly one sheet; the square of art covers and tiles both draw is an `art` mixin in `music/shared/styles`. Seven screenshots — the index, an artist, an album and a song on desktop and phone, the radio — are byte-identical to the elephant branch's build.
- **`masd.md`** now states what this settled: `shared/ui` is what knows no business noun, an entity is a noun's UI even with a dialog of its own, blocks that import each other share a slice or a layer boundary, and the node-safe barrel is a client's entry into a server-only segment. `compare/fsd-vs-masd` follows.
- The plan folds the bite into `## Eaten so far` and records slice 7's move of every script to `tsx` (the «давай» on #169).

## QA Checklist

- [ ] `index` — open `/music` and each tab (`/music/albums`, `/music/songs`): tiles, placeholders and the launch buttons look as before.
- [ ] `artist` — open an artist page (`/music/artists/downtemple`): header, hook, grid, song list and story render; hovering a tile dims its art.
- [ ] `album` — open an album (`/music/albums/ctfu`): the cover zoom opens and closes, the play button queues the album.
- [ ] `song` — open a song with a video (`/music/songs/after-us`): lyrics in two columns, a noted phrase opens its popover, the video dialog opens and pauses the player, the downloads list.
- [ ] `radio` — open `/music/radio`: the dial, the on-air card and its cover zoom work while playing.
- [ ] `nav` — on any music page switch language and script with the chips; on a phone the nav row clears the theme toggle.
- [ ] `feed` — `/music/songs/en/feed.xml` and `/music/songs/ru/feed.xml` list the songs with their enclosures.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `index` | e2e | ⚠️ | Screenshot of `/music` identical to base; the other tabs not shot |
| `artist` | e2e | ⚠️ | Screenshot identical to base; hover not exercised |
| `album` | e2e | ⚠️ | Desktop and phone screenshots identical; zoom not exercised |
| `song` | e2e | ⚠️ | Desktop and phone screenshots identical; popover and dialog not exercised |
| `radio` | e2e | ⚠️ | Screenshot identical to base; playback not exercised |
| `nav` | e2e | ❌ | Chip switching by eye |
| `feed` | integration | ⚠️ | `pnpm build vova` emits both feeds; contents not diffed |

https://claude.ai/code/session_016EBDzMcfr9dx3VM9HNSgKg

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T08:45:12Z — "Proposed squash body: ``` Bite 5c of the multi-app split: mu…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T08:45:12Z

[https://github.com/vzakharov/vovazakharov.com/pull/214#issuecomment-6411875455](https://github.com/vzakharov/vovazakharov.com/pull/214#issuecomment-6411875455)

Proposed squash body:

```
Bite 5c of the multi-app split: music's five pages lived in one
pages/music slice, so its layout said neither which page owned a part
nor which parts the pages shared.

pages/music keeps the index; artist, album, song and radio are slices
of their own, each holding its page, props and metadata, and music's
app layer routes to each through its own barrel.

What pages share drops below them by what it is. Covers, hooks and the
explicit badge are entities, each one noun's UI; the catalogue header
and grid, the nav, the song list and the story are widgets composing
them; music/shared/ui keeps only primitives that know no music.
catalogueMetadata and listenTitle are music/shared/seo, songDownloads
joins the catalogue and SONG_FEED music's app layer.
music.module.scss is cut along those components, the square of art
they share an art mixin; the pages render pixel-identical.

masd.md gains the rules this settled: shared/ui is what knows no
business noun, blocks that import each other share a slice or sit on
different layers, and a segment whose index.ts is server-only lets
client components in through its node-safe barrel.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/rules/songs.md`:8 — unresolved — last: @vzakharov (human) 2026-10-26T09:44:31Z — "тут glob всё ещё holds -- и в контексте добавок и вообще?" → [↓](#t01)

<a id="t01"></a>

### `.claude/rules/songs.md`:8 — unresolved

```diff
@@ -3,8 +3,9 @@ description: What a song is beyond any other document — its title, frontmatter
… 2 lines elided …
   - sites/*/app/**/music/**
-  - src/music/pages/music/**
-  - src/music/shared/catalogue/**
+  - src/music/pages/**
+  - src/music/widgets/**
+  - src/music/shared/**
```

**@vzakharov (human)** — 2026-10-26T09:44:31Z

тут glob всё ещё holds -- и в контексте добавок и вообще?

---

## Timeline (status, references, and other events)

- **2026-10-26T11:23:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/214#pullrequestreview-5650034013.
