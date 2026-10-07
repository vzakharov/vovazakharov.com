# RSS feeds for the content collections

Every collection that grows as a stream gets an RSS 2.0 feed, written at build
time like the sitemap, announced in every page's `<head>` and linked visibly
where its listing is.

## Which collections

| Collection       | Site     | Feed | Address                                    | Why                                                   |
| ---------------- | -------- | ---- | ------------------------------------------ | ----------------------------------------------------- |
| `bible`          | bible    | yes  | `/feed.xml`                                | articles, added over time                             |
| `basilisk-cases` | basilisk | yes  | `/cases/feed.xml`                          | a docket, filed case by case                          |
| `music`          | vova     | yes  | `/music/en/feed.xml`, `/music/ru/feed.xml` | songs land one at a time; one feed per language       |
| `case-studies`   | vova     | no   | —                                          | a portfolio of one document, not a stream             |
| `basilisk-faq`   | basilisk | no   | —                                          | reference pages, edited in place rather than appended |

A localized collection gets a feed per locale, at its localized listing route
plus `/feed.xml` — an RSS channel has one `<language>`, and a song's title and
blurb exist per language. A non-localized one sits at `collectionPath(id,
'feed.xml')`: the base, not the listing route, because a home-indexed
collection's listing is `/`, which `basilisk-cases` and `basilisk-faq` share.

## What a feed carries

- **Channel**: title (`SITE_CONFIG.name`, plus the collection label where the
  site serves more than the one collection — `basilisk.fyi — Cases`,
  `Vova Zakharov — Songs`), the listing's absolute URL, the site tagline as
  description (a song feed's in its own language where one exists — otherwise
  the tagline), `<language>`, an `atom:link rel="self"`, and `lastBuildDate`
  as the newest item's date rather than the clock, so a rebuild with no new
  content writes the same bytes.
- **Item**, one per primary document (cuts left out), newest first by
  `filed ?? date` — the same date the sitemap reports as `lastModified`:
  title (an article's rendered leading heading; a song's localized title),
  absolute link, `guid isPermaLink="true"` = the link, `pubDate` in RFC 822,
  and the frontmatter description (localized for a song).
- **Summaries, not full text.** The body is rendered for the page — Mantine
  classes, Shiki's CSS-variable colours, Mermaid images, directives that repeat
  a pull quote — and none of it reads right in a feed reader without a second,
  feed-specific render. The blurb plus a link is what every collection already
  states in frontmatter.

## Steps

1. **Registry** — `src/shared/content/collections.ts`: add `feed: boolean` to
   every entry (spelled per collection, as `printable` is), and a pure
   `feedRoutes(id)` returning the site-root path of each of its feeds (one, or
   one per locale), plus `feedsForSite(site)`.
2. **Builder** — `src/shared/lib/rss.ts` (or a `shared/seo` sibling): a pure
   `renderRss(channel, items)` serializer with XML escaping, unit-tested.
3. **Route glue** — `src/app/lib/feed.ts`: `collectionFeed(id, locale?)`
   returns a `GET` that lists the collection, resolves titles (rendered for
   articles, `localizeSong` for songs), and responds `application/rss+xml`.
   Each feed's route file is two lines, as `sitemap.ts` is:
   `apps/bible/app/feed.xml/route.ts`, `apps/basilisk/app/cases/feed.xml/route.ts`,
   `apps/vova/app/music/{en,ru}/feed.xml/route.ts`, each with
   `export const dynamic = 'force-static'`.
4. **Drift guard** — a test that every `feedRoutes` path of every site has its
   `apps/<site>/app/<path>/route.ts`, and every `feed.xml/route.ts` under
   `apps/` is one `feedRoutes` names. The registry flag and the route files
   cannot disagree silently.
5. **Autodiscovery** — `constructMetadata` adds
   `alternates.types['application/rss+xml']` listing the site's feeds with
   titles. It goes there rather than in `rootMetadata` because a page's own
   `alternates` replaces the layout's wholesale.
6. **Visible link** — a small "RSS" link beside each feed's listing: the Bible
   and basilisk home footers, and the music index in its own language. `/preview`
   to look.
7. **Check the build output**: `out/feed.xml` etc. exist, validate as RSS 2.0
   (well-formed XML, required elements), and `/music/en`, `/music/ru` still
   render through the catch-all beside the new static `en/`, `ru/` directories.

## Risks

- `apps/vova/app/music/en/feed.xml/` beside `music/[[...slugAndLocale]]`: Next
  should prefer the static route for `/music/en/feed.xml` and still send
  `/music/en` to the catch-all. If it refuses, the fallback is
  `/music/feed.en.xml` / `/music/feed.ru.xml` — same builder, different path
  shape in `feedRoutes`.

## DRY notes

- **Reused**: `listPrimaryDocuments` and `COLLECTION_SCHEMAS` for the items,
  `renderDocument` (memoized) for article titles, `localizeSong` and `songPath`
  from `pages/music` for songs, `getAbsoluteUrl`, `localizedRoute` and the
  collection path helpers for every URL, `filed ?? date` as the sitemap already
  reads it.
- **Shared**: `feedRoutes` is the one place a feed's address is decided — the
  route-file test, the `<head>` links and the visible links all read it.
- **Not extracted**: a song's localization stays in `pages/music`; the feed glue
  lives in `app/lib` (above `pages/`), which may import it, so nothing moves down
  a layer just for the feed.
- **No dependency** for the serializer: RSS 2.0 at this scope is a channel, a
  list of items and an escape function — under a hundred lines with tests, against
  a package and its update churn.
