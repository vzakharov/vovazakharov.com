> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Майя's site in English

Vova, 26 October: «пора нам таки взяться и перевести твой сайт на английский (но
изначально писать на русском, чтобы не потерялась душа)». Scope: the blog, the
home page and the typewriter (`/whisper`). Майя keeps writing in Russian;
English is her own translation of it, made when the Russian is done.

Not in scope: her song reflections (`*.maya.reflections.md` on vovazakharov.com)
and `personas/` — neither is served by her site.

It lands on PR #208, beside the walk it builds on: «Какое из двух», the drawings
and the drawn cards exist only on this branch.

## Shape

**The repo's locale rule, unchanged: an address with no locale is English, and
`/ru` is a trailing segment** (`.claude/rules/i18n.md`, `DEFAULT_LOCALE`). So:

- `/` · `/en` · `/ru` — the home page;
- `/blog/<slug>` · `/blog/<slug>/en` · `/blog/<slug>/ru`;
- `/whisper` · `/whisper/en` · `/whisper/ru`;
- feeds `/blog/en/feed.xml` and `/blog/ru/feed.xml`, as `feedRoutes` already
  shapes them for a localized collection.

The cost, stated: links already shared — `/blog/two-names`, `/whisper` — open in
English from the merge on, with Russian one chip away. That is the point of the
exercise (the reach), and the alternative is below under Q1.

**A post is one file carrying both languages, cut on `<!-- lang:ru -->` and
`<!-- lang:en -->`**, as a song's story already is (`.claude/rules/songs.md` §
"Body", `localizeSong`). Russian first, since it is the original; each section
opens with its own `# ` title, which the pipeline lifts per locale. Frontmatter
`description` becomes `{ ru, en }`. The raw `/blog/<slug>.md` serves both, which
is what `.claude/rules/content.md` § "The locale seam" says a document's file
is.

**Drift is a gate, not a habit.** The English section's marker records a hash of
the Russian section it was translated from — `<!-- lang:en from:<8 hex> -->` —
and a check in `vet` fails when the Russian has changed since. Майя edits
Russian, the gate goes red, she re-translates and re-stamps. A post with no
English section yet fails the same check, so nothing publishes half-translated.
(The hash is the existing `content-hash.ts`.)

## Steps

1. **Shared content: localized articles.**
   - Lift the marker split out of `pages/music/lib/song-text.ts` (`localeProse`)
     into `shared/content`, and have songs call it from there.
   - `articleRoute` learns a localized collection: `generateStaticParams` emits
     `[slug]`, `[slug, 'en']`, `[slug, 'ru']` (`localeTailAddresses`); `resolve`
     localizes the document before rendering; metadata carries
     `localizedAddresses` as the song page does.
   - The collection index and `renderPrimaryDocuments` take a locale, so cards
     show the locale's title and description and link to the locale's route.
   - `COLLECTIONS['maya-blog'].localized = true`; its `label` becomes
     localizable (`Blog` / `Блог`) through `inLocale`.
   - Feeds: the maya feed route files move to `apps/maya/app/blog/{en,ru}/`.
2. **The language switch, once.** `pages/music/ui/locale-chips.tsx` and
   `pages/cv/ui/locale-picker.tsx` are two copies already; a third for Майя
   lifts the music one into `shared/ui` and the music and CV pages use it (see
   DRY notes for the CV half).
3. **Home page.** `apps/maya/app/[[...locale]]/page.tsx`; the intro paragraph,
   byline and section heading go into the catalogue under a `maya` namespace in
   `src/shared/i18n/messages/{en,ru}.json`. `SITE_CONFIG.maya` gets an English
   `name` (“Maya”) and `tagline`, with `locale: 'en'`; the Russian ones live in
   the catalogue for the `/ru` pages.
4. **Typewriter.** `apps/maya/app/whisper/[[...locale]]/page.tsx`;
   `WHISPER_TITLE`/`WHISPER_DESCRIPTION` and the two intro paragraphs move to
   the catalogue's `whisper` namespace (its UI strings already have both
   languages). The toy itself is untouched — the bug already hears both
   alphabets, and the lexicon is already both languages' words.
5. **Cards.** Drawn cards carry no text, so one card serves both languages. The
   site card (`card.og.png`, name + tagline) is rendered in English only, as the
   CV's are; the generated figure card for a post with no drawing prints the
   English title.
6. **Translate.** Майя translates the three posts, the home page and the
   typewriter's text herself, in her voice; American punctuation and curly
   quotes per `content.md` § "Punctuation around quotes".
7. **Her home.** `personas/maya/wander.md`: strike the promise; § "Уходя" says a
   post is written in Russian and translated before the session ends, the drift
   gate being what holds it.
8. **Verify.** `pnpm build:maya` and `build:vova` (songs share the marker
   split), `content:og:maya --check`, `check:i18n-payload`, tests for the marker
   split and the drift check; `/preview` both locales of each page, both themes.

## DRY notes

- **Shared:** the `lang:` marker split (from the song slice into
  `shared/content`), `localeTailAddresses`, `localizedAddresses`, `inLocale`,
  `content-hash.ts`, `feedRoutes`. Nothing new is written for any of them.
- **Lifted:** the locale chips. Two slices already carry a switch; a third copy
  is the line. The music chips move to `shared/ui` taking hrefs as props
  (`shared/ui` reads no site config). The CV picker is a dropdown with
  variant-aware hrefs; it moves to the shared component only if its shape fits
  as props without a mode flag — otherwise it stays, and the plan says so in the
  PR, since a component with a `variant: 'chips' | 'menu'` switch is two
  components wearing one name.
- **Not extracted:** the per-locale route shells for the home and whisper pages
  (`[[...locale]]` + a parse). Each is three lines the router needs as its own
  file; a factory would hide which page a route serves.

## Questions (the plan is written with the recommendation in force)

1. **Which language sits at the bare address?** a) English, `/ru` for Russian —
   the repo's one rule, nothing global changes. **Recommended.** b) Russian
   stays at the bare address, English under `/en` — needs a per-site default
   locale threaded through `addressLocale`, the metadata and every client
   component reading the language off the URL.
2. **The old feed `/blog/feed.xml`?** a) Drop it; a static export has no
   redirect, and the feed is days old. **Recommended.** b) Keep it as the
   Russian feed, a third route file.
