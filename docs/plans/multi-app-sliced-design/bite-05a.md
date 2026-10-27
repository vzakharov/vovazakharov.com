# Slice 5a — the catalogue's model out of the page

Slice 5a, the catalogue's model out of the page: vet clean, every site built.
Slice 5 is eaten bottom-up in three bites — this one, the player with music's
app layer, then the pages — since as one it was some 110 files, a 580-line
stylesheet every layer shares, and a dozen layer calls.

- **`music/shared/catalogue` holds the model** every music page and script reads
  — songs, albums, artists, their files, texts, pictures and addresses, their
  tests beside them — the precedent being kernel's `shared/content`: it is
  build-time data access, and as `song`, `album` and `artist` entities each
  would need `@x` imports of the others. `pages/music/lib` keeps the player's
  state and hooks, the page metadata, the feed and the route's parse.
- **Two cuts made the set close**: a track's shape (`PlayerTrack`, `Billing`,
  `Streamed`) is `track.ts`, since `songs.ts` builds it, leaving the reducer in
  `player-state.ts`; `SONG_AUTHOR` and `CreditedName` are `author.ts`, so a test
  takes them without zod.
- **The barrel follows the runtime graph**, not the `server-only` marker alone:
  `index.node-safe.ts` holds only modules whose runtime imports reach no
  `server-only`, filesystem or zod, each spelling `.ts`; everything else is
  `index.ts`'s. Inside the segment modules import each other by leaf.
- **Music's scripts enter through the barrels**, `music:scaffold` now running
  under `react-server` as `music:masters` does, and leave the grandfathered
  block — all but `list-untold-songs`, which reads `catalogue-names.ts` under
  bare Node, a module no barrel a client component imports may hold.
- **A page reads each thing once** (review on #205): `catalogue-entries.ts`'s
  `artistInfo`, `albumInfo`, `catalogueAlbum` and `songInfo` give everything a
  page shows of one in a language, and the per-fact readers they are built from
  left the barrel.
