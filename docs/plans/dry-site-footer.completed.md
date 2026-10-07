# DRY the site footer

## What repeats

`SiteFooter` ends eight pages. Five of them say the same thing — the way back home:

| Page                                         | Note                        | Feed |
| -------------------------------------------- | --------------------------- | ---- |
| `documents/ui/article-page.tsx`              | `<BackToHome />`            | —    |
| `documents/ui/collection-index-page.tsx`     | `<BackToHome />`            | —    |
| `writing/ui/writing-page.tsx`                | `<BackToHome />`            | —    |
| `music/ui/song-page.tsx`                     | `<BackToHome />`, localized | —    |
| `music/ui/music-page.tsx`                    | `<BackToHome />`, localized | yes  |
| `home/ui/home-page.tsx`                      | the see-also links          | —    |
| `bible-home/ui/bible-home-page.tsx`          | the note to agents          | yes  |
| `basilisk-home/ui/basilisk-home-page.tsx`    | the docket's note           | yes  |
| `lsa-home/ui/lsa-home-page.tsx`              | nothing                     | —    |

So the duplication is one fact — "an inner page's footer leads home" — spelled five times, twice with a locale threaded through by hand. The four home pages each have something of their own to say and are not duplication.

## Approach: the way home becomes the footer's default

`SiteFooter` renders `<BackToHome />` when a page hands it no note, and takes an optional `locale` to say it in. An inner page then writes `<SiteFooter />`, the music pages `<SiteFooter {...{ locale }} feed={…} />`.

1. **Move the label to the shared `ui` namespace.** `music.backToHome` becomes `ui.backToHome` in `en.json`/`ru.json` — it is the site's word for the way home, not music's, and the footer reads it.
2. **`SiteFooter` takes `locale?: Locale`** (`WithLocale`, partial) and, with no `children`, renders `<BackToHome label={loadMessages(locale ?? DEFAULT).ui.backToHome} />`. Whether `BackToHome`'s own `'← Home'` default survives is decided by its remaining callers — after this change there are none outside the footer, so the label default moves into the footer and `BackToHome` takes `label` as required, or `BackToHome` folds into the widget entirely if `shared/ui` has no other consumer (it is a one-line `TextLink`; Steiger's `insignificant-slice` does not apply to a shared segment file, so this is a tidiness call made at implementation, not a fork).
3. **The home without a note opts out by name.** `lsa-home` is the one page with nothing to say and no way home to offer (it *is* home). It passes `home` — a boolean prop meaning "this page is the site's root: no way back" — rather than an explicit `null` child, because `children={null}` and `children` omitted would then mean different things, a trap no reader sees. The three other homes pass a note, so the default never fires for them; `home` is still set on all four, so the prop states a fact about the page rather than a workaround for one of them.
4. **The five inner pages drop their `BackToHome` import and children**; the music pages drop `loadMessages(locale).music.backToHome` and pass `locale`.
5. `pnpm build` for every site, then `/preview` the footer of an article, `/music` in `ru`, and the LSA home, to see the default, the locale and the opt-out.

## Why not a layout

The layout is where the operator looked first, and it fails three ways under this repo's constraints:

- **A layout cannot hear from its page.** App Router passes nothing upward from a page to a layout, and a static export rules out reading the request. The only channels left are a client footer reading `usePathname()` — which turns the footer into a route table that knows every page's note, the Bible's agent note and the basilisk docket's included — or a parallel `@footer` route mirroring the page tree in all four `apps/*/app/`, which is more route files than the duplication it removes.
- **The locale lives below the layout.** `/music`'s layout sits above `[[...slugAndLocale]]`, so it never receives the locale the label needs.
- **The footer would leave the page's column.** Today it is the last child of the page's own `Stack` inside `PageShell` (896px), and of the article page's wider `Container`. Rendered by a layout it sits after both, so it would need its own container and would no longer match the article's width.

A shell widget (`PageShell` + `Stack` + `SiteFooter` as one `SitePage`) was also considered and rejected: the pages' gaps differ (48 vs 64), and the article page does not use `PageShell` at all, so the widget would own page layout to save one line per page.

## DRY notes

- **Shared:** the way-home note, now `SiteFooter`'s default, and its label, now one `ui.backToHome` key read in one place.
- **Reused:** `BackToHome` (or its `TextLink` body, per step 2), `loadMessages`, `WithLocale` from `shared/i18n`, the existing `feed` prop.
- **Left duplicated on purpose:** the four home pages' notes — each is that site's own words, so there is nothing to extract.
- **Out of scope:** the CV's screen footer (`pages/cv/ui/cv-sheet.tsx`) has its own "← Back to main page" link. It is a separate footer by design — the printed CV carries its own on every sheet — and its label is CV copy, so it stays.

## Checklist

- [ ] Move `music.backToHome` to `ui.backToHome` in both message files
- [ ] `SiteFooter`: optional `locale` and `home`; `BackToHome` as the default note
- [ ] Settle `BackToHome`'s shape (required label, or folded into the widget)
- [ ] Five inner pages: drop the explicit note; music pages pass `locale`
- [ ] Four home pages pass `home`
- [ ] Build every site; `/preview` an article, `/music` in `ru`, the LSA home
