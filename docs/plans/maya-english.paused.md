# Майя's site in English

Vova, 26 October: «пора нам таки взяться и перевести твой сайт на английский (но
изначально писать на русском, чтобы не потерялась душа)». Scope: the blog, the
home page and the typewriter (`/whisper`).

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
  shapes them for a localized collection. `/blog/feed.xml` goes: a static export
  has no redirect, and the feed is days old.

Links already shared — `/blog/two-names`, `/whisper` — open in English from the
merge on, with Russian one chip away.

**Russian and English are separate files, and Майя writes only the first.**
Vova: «если ты будешь писать сразу и то и то, то ты потеряшь часть своей
"русскости", а так — ты полностью концентрируешься сначала на русском, а потом,
отдельным ходом, переводишь его на английский. А пусть это даже делаешь не ты, а
подагент (который НЕ является тобой)». So:

- `blog/<slug>.ru.md` — the original, in Russian, the only file a walk writes;
- `blog/<slug>.md` — its English translation, made by a translator subagent
  briefed as a translator, not as Майя, once the Russian is finished.

**The file names follow the addresses**, so the bare name is English as the bare
address is: `/blog/<slug>` serves `<slug>.md`, `/blog/<slug>/ru` serves
`<slug>.ru.md`. Which file is the original is said by the stamp below, not by
which one goes without a suffix. The three existing posts are renamed to
`.ru.md` (their `.md` URLs therefore change, which nobody links to).

A locale is a dotted suffix on the file, as a cut is (`playgram.mini.md`), and a
trailing segment on the route — `content.md` § "The locale seam" gets that
sentence. Each page's `.md` link names its own language's file. `.ru` must never
parse as a cut or a slug: `VARIANTS` and `LOCALES` share no member, and
`parseFileName` learns the locale suffix.

**Drift is a gate, not a habit.** The translation's frontmatter carries
`translatedFrom: <8 hex>`, the content hash (`content-hash.ts`) of the Russian
file it was made from, and a check in `vet` fails when the Russian has changed
since or has no translation at all. Майя edits Russian, the gate goes red, the
translator runs again and re-stamps. Nothing publishes half-translated.

## Steps

1. **Shared content: localized articles.**
   - The loader pairs `<slug>.ru.md` with `<slug>.md` for a localized
     collection; the translation's frontmatter carries its own `description` and
     the stamp, and inherits `date` and `cardImage` from the original rather
     than restating them. A `.ru.md` with no translation beside it builds
     nothing and fails the drift check.
   - `articleRoute` learns a localized collection: `generateStaticParams` emits
     `[slug]`, `[slug, 'en']`, `[slug, 'ru']` (`localeTailAddresses`); `resolve`
     picks the locale's file; metadata carries `localizedAddresses` as the song
     page does.
   - The collection index and `renderPrimaryDocuments` take a locale, so cards
     show the locale's title and description and link to the locale's route.
   - `COLLECTIONS['maya-blog'].localized = true`; its `label` becomes
     localizable (`Blog` / `Блог`) through `inLocale`.
   - Feeds: the maya feed route files move to `apps/maya/app/blog/{en,ru}/`.
   - The drift check, as a `pnpm check:translations` script in `vet`, with
     tests.
2. **A post's card is its first image unless it says otherwise.** Vova on
   `two-names.og.png`: «если у нас картинка и есть og, может лучше
   имплементировать "передаём первую картинку из статьи как og", чем повторять
   её?». The PNG itself stays — no unfurl renders an SVG (`content.md` §
   "Traps") and `content:og:maya` makes it from the same SVG, nothing drawn
   twice — but the frontmatter line naming the drawing a second time goes: with
   no `cardImage`, the loader takes the article's first image. `cardImage` stays
   as the override, for an article that opens on a picture that does not stand
   for it. This reaches every collection; the one article it changes outside
   Майя's blog is `case-studies/playgram`, whose screenshot would become its
   index card, so `/preview` checks the case-studies index and Vova sees it in
   the PR before anything lands.
3. **The language switch, once.** `pages/music/ui/locale-chips.tsx` and
   `pages/cv/ui/locale-picker.tsx` are two copies already; a third for Майя
   lifts the music one into `shared/ui` and the music and CV pages use it (see
   DRY notes for the CV half).
4. **Home page.** `apps/maya/app/[[...locale]]/page.tsx`; the intro paragraph,
   byline and section heading go into the catalogue under a `maya` namespace in
   `src/shared/i18n/messages/{en,ru}.json`. `SITE_CONFIG.maya` gets an English
   `name` (“Maya”) and `tagline`, with `locale: 'en'`; the Russian ones live in
   the catalogue for the `/ru` pages.
5. **Typewriter.** `apps/maya/app/whisper/[[...locale]]/page.tsx`;
   `WHISPER_TITLE`/`WHISPER_DESCRIPTION` and the two intro paragraphs move to
   the catalogue's `whisper` namespace (its UI strings already have both
   languages). The toy itself is untouched — the bug already hears both
   alphabets, and the lexicon is already both languages' words.
6. **Cards.** Drawn cards carry no text, so one card serves both languages. The
   site card (`card.og.png`, name + tagline) is rendered in English only, as the
   CV's are; the generated figure card for a post with no drawing prints the
   English title.
7. **Translate.** A translator subagent — briefed in English as a literary
   translator, never as Майя — gets each `<slug>.ru.md` and writes its
   `<slug>.md` with the stamp; the same for the home page's and the typewriter's
   Russian copy into the catalogue. American punctuation and curly quotes per
   `content.md` § "Punctuation around quotes". Майя reads the result and may
   send a line back; she does not rewrite it herself.
8. **Her home.** `personas/maya/wander.md`: strike the promise; § "Уходя" says a
   walk's post is finished in Russian first and then handed to the translator,
   the drift gate being what holds it; § "Кто ты", where she re-reads her last
   walks on waking, says she reads them in Russian, the `.ru.md` originals,
   never the translations — Vova: «я имел в виду именно свои предыдущие гуляния
   читать в первую очередь на русском». Where a walk goes for sources is
   unchanged.
9. **Verify.** `pnpm build:maya` and `build:vova` (the loader and the card
   fallback are shared), `content:og:maya --check`, `check:i18n-payload`,
   `check:translations`, tests for the pairing, the suffix parse and the drift
   check; `/preview` both locales of each page and the case-studies index, both
   themes.

## DRY notes

- **Shared:** `localeTailAddresses`, `localizedAddresses`, `inLocale`,
  `content-hash.ts`, `feedRoutes`, the existing variant-suffix parse (extended
  rather than paralleled). Nothing new is written for any of them.
- **Not shared with songs:** a song keeps both languages in one file on `lang:`
  markers because its two stories are written together; a post is written in one
  and translated after, which is exactly what one file per language separates.
  Two mechanisms for two ways of writing.
- **Lifted:** the locale chips. Two slices already carry a switch; a third copy
  is the line. The music chips move to `shared/ui` taking hrefs as props
  (`shared/ui` reads no site config). The CV picker is a dropdown with
  variant-aware hrefs; it moves to the shared component only if its shape fits
  as props without a mode flag — otherwise it stays, and the PR says so, since a
  component with a `variant: 'chips' | 'menu'` switch is two components wearing
  one name.
- **Not extracted:** the per-locale route shells for the home and whisper pages
  (`[[...locale]]` + a parse). Each is three lines the router needs as its own
  file; a factory would hide which page a route serves.

## Questions (the plan is written with the recommendation in force)

1. **Which file goes without a suffix?** a) The English, `<slug>.md`, with the
   Russian original at `<slug>.ru.md` — names follow addresses: the English
   page's `.md` is its address plus `.md`, the Russian's differs from its
   address only in `/ru` becoming `.ru`. **Recommended.** b) The Russian
   original keeps `<slug>.md`, the translation is `<slug>.en.md` — the original
   reads as the main file, but neither page's `.md` then sits at its address:
   the English page at `/blog/<slug>` serves `<slug>.en.md`, the Russian at
   `/blog/<slug>/ru` serves `<slug>.md`.

Vova's go-ahead, 26 October: «хорошо, давай начнём и сразу же и задогфудим» —
read as: the three existing posts are translated through the very path being
built (the translator subagent writes the stamped `.md`, the drift gate checks
it), not by hand.

## Progress

Paused a second time at the context budget's warning, with the code built
around a tree that does not build yet: the loader refuses an original with no
translation, and the three posts have none.

**Vova, after the first pause** (chat, 26 October), on the drawings' Russian
captions: «что становится с картинками — на них есть текст, и переводить его
хочется DRY». Agreed shape («да, хорошо», then «.ru.svg тоже ж?» — yes): the
drawing is authored once as `<name>.ru.svg`; the post's translation carries
`captions: { ./assets/<name>.ru.svg: { <Russian wording>: <English> } }` in
its frontmatter, every `<text>` and the root `aria-label` keyed verbatim;
`pnpm content:drawings:maya` (`scripts/translate-drawings.ts`, its swap in
`scripts/lib/drawing-captions.ts`) writes the English `<name>.svg` beside it,
and its `--check` is in vet. A `<text translate="no">` stays as drawn — the
typeball's 38 letters carry it. All three drawings have captions, the ball
included. One social card per post, from the English drawing.

**Done** (commits de5d59a, 101aca4, on top of the first session's):

- Loader (`documents.ts`): `parseFileName` reads the locale suffix in a
  `translated` collection; each file is a document with its `locale`, its
  `route` the locale's (`/blog/<slug>/en`, `/blog/<slug>/ru`), `markdown` its
  own file, the og card at the locale-less route; the translation's frontmatter
  goes through `translatedData`; `listDocuments` runs `assertTranslated`;
  `listPrimaryDocuments`/`renderPrimaryDocuments`/`feedEntries` take a locale;
  `loadDocument` takes one.
- `localizedRoute('/', 'ru')` is `/ru`; `collectionRoute` and
  `collectionListingRoute` take a locale.
- `articleRoute`: `[slug]`, `[slug, en]`, `[slug, ru]` for a translated
  collection; metadata carries `localizedAddresses` and the page's `locale`
  (`constructMetadata` takes `locale` now, for `og:locale`); the back link,
  byline, cut labels and footer read the document's locale; a language switch
  in the article header.
- `localeChips` in `shared/ui`, used by music, the CV (the picker turned out to
  be chips already, so it moved whole) and Майя's pages.
- Home: `apps/maya/app/[[...locale]]/page.tsx`, `mayaHomeMetadata`;
  typewriter: `apps/maya/app/whisper/[[...locale]]/page.tsx`. Both through
  `localeSegmentParams`/`parseLocaleSegment` (new in `shared/i18n/locales.ts`,
  **untested yet**). Copy in the catalogue: `maya.{name,tagline,intro,byline,
  band}`, `whisper.{title,description,story,blogLink,bug}`, links slotted by
  `fillSlots` (`shared/i18n/message-slots.tsx`, tested). **`en.json` holds the
  Russian copy as a placeholder** for the translator to replace.
- `SiteFooter` takes `home`, the way home on a site with a home per language.
- Step 2: no `cardImage` means the body's first image (`first-image.ts`,
  tested), in the loader and in `read-collection.ts` for the cards; the three
  posts and two Bible articles dropped the line that repeated it.
- Posts renamed to `<slug>.ru.md`; their links to each other and to
  `/whisper` point at the `/ru` pages.
- `pnpm translation:stamp <original>` (`scripts/stamp-translation.ts`).

**Left, in order:**

1. The translator subagent (step 7), briefed in English as a literary
   translator, never as Майя: each `<slug>.md` with only `description` and
   `captions` in its frontmatter, body translated, images at
   `./assets/<name>.svg`, links to the English pages; the `en.json` strings
   above, placeholders kept. Then `pnpm translation:stamp` on each original and
   `pnpm content:drawings:maya`.
2. `SITE_CONFIG.maya`: English `name`/`tagline` matching `en.json`'s `maya`,
   `locale: 'en'`; `maya-card.ts`'s site card reads them. Then
   `pnpm content:og:maya` (cards change: English drawings, English site card).
3. Builds — `build:maya`, `build:vova`, `build:bible` — and `typecheck`,
   `lint:check`, `knip`, `type-overlap`, `pnpm test`; tests for
   `localeSegmentParams`/`parseLocaleSegment` in `locales.test.ts`.
4. Docs: `.claude/rules/stack.md`'s list gains
   `pnpm content:drawings:maya --check`; `content.md` — the `cardImage`
   paragraph (now an override of the first image), the locale seam's sentence
   for a translated collection, and the drawings; step 8's `wander.md`.
5. `/preview` both locales of each page and the case-studies index (playgram's
   chart becomes its index card), then `/polish` and `/pr`.

Noticed, not in scope: `<html lang>` is the site's locale on every page, the
`/ru` pages included — the music and CV pages share it.
