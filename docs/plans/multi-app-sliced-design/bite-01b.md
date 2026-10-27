# Collections into blog (review on #169)

Collections into blog (review on #169): typecheck, lint, Steiger, `check:masd`,
knip, the tests and every render's `--check` clean; bible, lsa and vova built.
kernel imports nothing of blog's.

- **`blog/shared/content`** is the old `kernel/shared/content`. What names no
  collection stayed kernel's: `PUBLIC_DIR` and `GENERATED_DIR`
  (`shared/config/public-dir.ts`, node-safe barrel only),
  `shared/lib/content-hash.ts`, `WithOptionalOgImageSize` in `shared/seo`'s
  `og-card.ts`, `Routed` in `shared/typings`.
- **kernel's factories take what names a collection from outside**: `sitemap` a
  thunk of pages beside `/`, `constructMetadata` the feeds to advertise, and
  `constructRootMetadata` the same for `/`. blog's app layer holds the
  collection `sitemap`, `collectionFeed` and a `rootMetadata` advertising the
  site's feeds, which every blog site's layouts and vova's `global-not-found`
  take; `blog/shared/seo` holds a `constructMetadata` supplying the feeds and
  `constructArticleMetadata`, which every page under blog calls. mushrooms calls
  kernel's, so `/mushrooms` advertises no feed; lsa, serving no collection,
  keeps kernel's sitemap and root metadata.
- **Scripts**: kernel's `site-tree.ts` (`REPO_ROOT`, `RENDERED_SITE`,
  `filesUnder`) and blog's `content-tree.ts` (the collection roots and
  `contentFiles`); `read-collection`, `heading-title`, `public-markdown`,
  `check-prose-quotes` and `render-mermaid` are blog's. kernel's `og-job` keeps
  the mechanism and the site card, exporting `svgCard`; blog's `og-job.ts` adds
  the chart cards and the content tree's manifest roots in
  `renderDocumentOgCards`, which every printing site calls, and `entryCards`
  makes maya's and basilisk's card per entry. `ManifestRoots.manifestDirs` is
  required. blog's scripts enter `shared/content` through its node-safe barrel,
  which holds the registry and the mermaid paths, so kernel's three entries in
  the grandfathered block went and none of blog's joined it.
