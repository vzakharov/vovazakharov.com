# Slice 5b — the player and music's app layer

Slice 5b, the player and music's app layer: vet clean, vova built, the bar
looked at playing.

- **`music/features/player`** holds the provider, the bar and the controls pages
  place (`TrackButton`, `SongPlayButton`, `AlbumPlayButton`, `LaunchButtons`),
  the state and its hooks under `model/`; its rules are `player.module.scss`,
  cut from `music.module.scss` on the seam, the `fill` mixin both use in
  `shared/styles`, whose `index.scss` is the segment's public API, as Steiger
  asks; a sheet `@use`s it by that name, since knip follows no directory.
- **What the bar and the pages both draw is music's `shared/`**: `Spelling` and
  `BillingLinks` in `shared/ui`, `duration.ts` in `shared/lib`.
- **music's app layer** mounts the player (`MusicLayout`), maps an address to a
  page (`MusicRoute`) and parses the route (`music-route-params.ts`); the page
  prop types stay the pages', whose barrel exports the five pages and their
  metadata. vova's router and sitemap enter it.
