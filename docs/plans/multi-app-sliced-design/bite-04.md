# Slice 4 — the message catalogue inverted

Slice 4, the message catalogue inverted: vet clean, every site built.

- **Each app owns its catalogue** —
  `src/<app>/shared/i18n/messages/{en,ru}.json` behind a loader built with
  kernel's `catalogue()`, whose typing against `en` keeps the two files in sync,
  exported in every app as `messages` (typed `Messages`), an importer needing
  two renaming one: shell's (`toggleTheme`, `backToHome`), music's (what was the
  `music` namespace), vova's (`notFound`, `cv`, `cvVariants`). kernel keeps
  locales, routing, the request config and `MESSAGE_MARKDOWN`.
- **A page loads only the catalogues of the apps it renders**, by import.
  `getTranslations` is gone: the request config carries no messages and
  `next-intl.d.ts` registers the locale alone, next-intl's `Messages` being one
  global type that could check a single site's catalogue at most.
- **A feed's description is its source's** — `FeedSource.description`, which
  `SONG_FEED` supplies, else the site's tagline — so `Feed` carries none and
  kernel names no app's strings.
