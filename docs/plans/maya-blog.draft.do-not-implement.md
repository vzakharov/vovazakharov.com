> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Майя's blog: the article page learns Russian

Vova: «давай научим. можешь взять имеющийся подход с коллекциями, локалями и
прочим. будет у тебя свой блог 🙂»

## Goal

Майя's walks are published on maya.vovazakharov.com as a collection of articles,
in Russian: the shared article page, the cards and the byline speak the language
of the site that serves them, and the English sites serve exactly what they
serve today.

## The seam: a site has a language

Every unlocalized collection is in its site's language, so the language belongs
to the site rather than to the collection. `SiteConfig` gains `locale: Locale` —
`ru` for `maya`, `en` for the other four, spelled by every site as `seal` is.

- The alternative, a `locale` on each collection entry, buys a Russian
  collection on an English site, which nothing asks for, and leaves
  `<html lang>`, `og:locale` and the feed's `<language>` — which are a page's,
  not a collection's — still needing a site-level answer.
- A localized collection (music) keeps its per-page locale; the site's is only
  the default for pages that name none.

What reads it:

- `src/app/ui/root-layout.tsx` — `<html lang={SITE_CONFIG.locale}>`. Her home
  page's own `lang="ru"` on the stack then goes.
- `src/shared/seo/construct-metadata.ts` — `og:locale` from the site's locale
  (`ru_RU` / `en_US`).
- `src/app/lib/feed.ts` — a feed with no locale of its own is in the site's.
- `SiteFooter` — its default `locale` becomes the site's, so «На главную» on her
  articles.

## The chrome

A `documents` namespace in `en.json` / `ru.json`: `by`, `readingTime`
(`{minutes} min read` / `{minutes} мин чтения`), `part`, `read`, `version`
(`{variant} version` / `версия {variant}`), the cut labels (`full`, `mini`,
`nano`), `sources`. The English strings are today's literals, so the English
sites' output does not change.

Server components read the catalogue for `SITE_CONFIG.locale` through
`loadMessages` — the CV's form, typed by `tsc` — and pass strings down:
`ArticleHeader`, `DocumentMeta`, `DocumentCards`, `SourceList`. No client
component is touched, so nothing new reaches a client bundle.

Dates: `formatDocumentDate(date, locale)`, `DOCUMENT_DATE` becoming `byLocale`
the way `DOCUMENT_MONTH` already is. Its other callers (`case-brief`,
`source-list`, `docket-row`) pass the site's locale, which is `en` on basilisk.

`case-brief.tsx`'s labels («Case», «Subject») stay English: basilisk is
English-only and they are a case's own UI, not the article page's.

## The `.pdf` link

`ArticleHeader` offers `.pdf` only where the collection is `printable`. That
also drops the link on basilisk's FAQ, `printable: false`, where it answers 404
today — the one change an English site sees, and a fix. Her walks are not
printable: no PDF lane for `maya`, and a walk is a screen thing.

## The collection

- `COLLECTIONS.walks`: `base: 'walks'`, `label: 'Прогулки'`, `site: 'maya'`,
  `printable: false`, `localized: false`, `homeIndexed: true` (her home page
  lists them, the back link lands on `/#walks`), `generatedCards: false`,
  `feed: true`. `ARTICLE_COLLECTIONS.walks` with `articleFrontmatterSchema`.
- `AUTHOR_IDS` gains `maya`: «Майя», linking to her site's root.
- Routes: `apps/maya/app/walks/[...slug]/page.tsx` (`articleRoute('walks')`) and
  `apps/maya/app/walks/feed.xml/route.ts`; the sitemap already walks the
  registry.
- Her home page lists the walks with `DocumentCards` in a `Section id="walks"`,
  replacing the paragraph that links to GitHub, and its footer links the feed.

## Where the walks live

`git mv personas/maya/walks/*.md apps/maya/public/walks/`, each gaining
frontmatter (`description`, `date`, `author: maya`). A walk is already written
for anyone to read, so the published walk is the memory: one file, not a note
plus a cut. `wander.md`'s memory paragraph points at the new directory and its
paragraph about the English-only article page goes; `maya-home-page.tsx`'s
`WALKS_URL` goes with the link.

`.claude/rules/content.md` lists `apps/maya/public/walks/` among the
collections, and its locale-seam section gains the site's language in a
sentence.

## Checks

- `pnpm build:maya`, `build:vova`, `build:bible`, `build:basilisk`, `build:lsa`;
  `lint:check`, `typecheck`, `pnpm test`.
- Diff each English site's `out/` HTML of one article and one index before and
  after: the only change is the FAQ's missing `.pdf`.
- `/preview` her home page and the walk, in both themes.
- `collections.test.ts` / `feed-routes.test.ts` extended where they enumerate
  the registry.

## DRY notes

- Reused: `articleRoute`, `DocumentCards`, `collectionFeed`, `loadMessages`,
  `byLocale`, the `{name}` `.replace` idiom `music-metadata.ts` uses for a
  placeholder.
- One home for the language: `SITE_CONFIG.locale`; nothing restates it per
  collection.
- The chrome strings move into the catalogue rather than a second literal table
  beside `CUT_LABELS`, so `tsc` keeps `en` and `ru` in step.
- Not extracted: a "localized string for this site" helper over
  `loadMessages(SITE_CONFIG.locale)` — one expression at each of four call
  sites, and a wrapper would hide which locale is read.

## Checklist

- [ ] `SiteConfig.locale`, read by the root layout, `og:locale`, the feed and
      the footer.
- [ ] The `documents` catalogue namespace; the article page, header, byline,
      cards and sources read it.
- [ ] `formatDocumentDate` takes a locale.
- [ ] `.pdf` only where `printable`.
- [ ] The `walks` collection, author, routes, feed, home-page listing.
- [ ] The walk moved with frontmatter; `wander.md`, home page, `content.md`
      updated.
- [ ] Builds, lint, types, tests; English `out/` diffed; preview looked at.
