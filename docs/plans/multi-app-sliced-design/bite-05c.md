# Slice 5c — music's pages (#214)

Slice 5c, music's pages: typecheck, lint, Steiger, `check:masd`, knip and the
music tests clean, vova built, the index, an artist, an album, a song (desktop
and phone) and the radio screenshotted pixel-identical to the elephant's.

- **One slice per page**: `pages/music` keeps the index (the name stays, and
  with it `masd.md`'s `shared/catalogue` trap); `pages/artist`, `pages/album`,
  `pages/song` and `pages/radio` each hold their page, props type and metadata,
  the song page its lyrics, credits, facts and video, the radio its dial.
- **What pages share sits by what it is** (review on #214): `entities/cover`,
  `entities/hook` and `entities/song` (the explicit badge) show one noun each;
  `widgets/catalogue-header`, `catalogue-grid`, `music-nav`, `song-list` and
  `story` compose; `music/shared/ui` keeps only what knows no music — fact
  lines, the noted span, the WIP mark, the title gloss. `HookLine` reads
  `hookRuns` through the catalogue's node-safe barrel, the radio's client card
  entering its slice. `music/shared/seo` holds `catalogueMetadata` and
  `listenTitle`, `songDownloads` joined `shared/catalogue`, and `SONG_FEED`
  music's `app/lib`. `masd.md` states the noun test for `shared/ui` and the
  node-safe barrel as a client's entry.
- **`music.module.scss` is gone**, cut along its components; the square of art
  the covers and tiles both draw is the `art` mixin in `shared/styles`.
