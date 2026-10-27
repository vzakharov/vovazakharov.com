# Slice 1 — the MASD core (#169)

Slice 1, the MASD core: vet clean with `VET_MEADOW=1` but for the staged
CLAUDE.md's `fsd.md` citation, and every site looked at under the split layouts.

- **The graph** — `src/masd.json`, loaded only by `eslint/masd-graph.ts` (the
  schema, the order check, ancestors and descendants, insignificant apps,
  directory mismatches), tested on invented graphs with several parents and a
  diamond.
- **The tree** — the code moved into the nine apps, one `git mv` commit per app.
  kernel holds `shared/{config,content,i18n,lib,seo,typings}`, `MUSIC_ROUTE`
  among content's addresses, and in its app layer the bare document every site
  renders (`<html>`, metadata, analytics) and the sitemap and feed factories.
  shell holds what every site but the game draws on: `shared/ui`, the
  stylesheets and theme provider, a root layout adding the fonts, Mantine,
  `ColorSchemeScript`, the script picker and `ThemeCorner` to kernel's,
  `features/switch-theme` and `widgets/site-footer`. blog holds
  `entities/document` and `pages/documents`, with `ArticleSlots` in
  `shared/article-slots`; basilisk holds `entities/case` (and `CASE_SLOTS`),
  `pages/basilisk-home` and `shared/content`; bible, lsa and vova hold their
  pages, vova an app layer with the `global-not-found` page; music holds
  `pages/music` as it stood and `shared/catalogue`; mushrooms `pages/mushrooms`
  as it stood.
- **The registries** — the schema registry inverted: `articleCollection(id)` in
  kernel, `SONGS` in music's catalogue, `CASES` behind basilisk's
  `shared/content`; addresses stay kernel's. kernel imports no app above it:
  each site's leaf app calls `sitemap(mountedRoutes)` — vova with the CV's and
  music catalogue's routes, the rest with none — and the router re-exports it;
  `collectionFeed(collection, locale, source?)` takes a `FeedSource` (music
  exports `SONG_FEED`).
- **Two root layouts on vovazakharov.com** — `(shell)` for every page but the
  game, `(game)/mushrooms` on kernel's; `experimental.globalNotFound` on every
  site. A fresh meadow opens in full day, whatever the colour scheme, and the
  `dark` play in `scripts/play-mushrooms.ts` asserts it.
- **The checkers** — `eslint/masd-boundaries.ts` generates the boundaries config
  from the graph (folder patterns with `partialMatch`; `app` and `shared`
  overlay their ancestors' as one unit, sliced layers go strictly down);
  `pnpm lint:fsd` runs Steiger once per app with `insignificant-slice` off;
  `pnpm check:masd` (`scripts/masd-check.ts`, in `vet.sh`) checks the graph and
  counts slice references across the composition. Imports sort one group per app
  in graph order, the layers in order within each.
- **The conventions** — `.claude/rules/masd.md`, `fsd.retired.md` as the
  tombstone, citations repointed, CLAUDE.md's layout in its staged copy (the
  live CLAUDE.md cites `fsd.md` until `/finalize` swaps it in, so
  `check-skill-catalog` fails until then).
