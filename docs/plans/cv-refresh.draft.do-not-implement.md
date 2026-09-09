> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# CV refresh: role titles, header controls, and a system-only theme

Six changes to the CV plus one site-wide change: the theme picker goes, and every page follows the reader's system scheme.

## 1 — Role titles

`cv.experience.<key>.title` in both catalogues. `period` already carries the company and dates, so only `title` moves.

| Key              | Now (en)                          | After (en)                                 |
| ---------------- | --------------------------------- | ------------------------------------------ |
| `playgram`       | Developer                         | **Fractional CTO**                         |
| `englishForKids` | Developer – Project Work          | **Senior Fullstack Developer – Project Work** |
| `orcool`         | Developer – Project Work          | **Senior Fullstack Developer – Project Work** |
| `randddb`        | Developer                         | **Fullstack Developer**                    |
| `independent`    | Developer – Independent Projects  | unchanged                                  |
| `voicemod`       | Prototyper – Experience & Innovation | unchanged                                |

Russian counterparts: `Fractional CTO` (kept in English — there is no idiomatic Russian for it and the term is used untranslated in the market), `Senior Fullstack-разработчик – Проектная работа`, `Fullstack-разработчик`.

`independent` and `voicemod` sit below `randddb` in `EXPERIENCE_KEYS`, which is the "up to randddb" boundary, so they keep their titles. Q1 and Q2 below can move both of these calls.

Nothing else reads `cv.experience`: the CV's Open Graph cards are generated off `cv.header`, `cv.contact` and the offer-block headings only, so the cards do not go stale on this. The **CV PDFs do** — see §3.

## 2 — `[EN] [RU]` in place of the flag picker

`LocalePicker` today is one `ActionIcon` showing the flag of the language you are already reading, linking to the other. Replace it with the chip pair the article header already uses for document cuts: both languages shown, the current one inverted and inert, the other a link to `cvPath(variant, other)`.

That markup and its three classes (`.cut`, `.cutCurrent`, `.cutLink`) live in `pages/case-studies`, and `pages/cv` may not reach sideways into another slice — so the pattern moves down to `shared/ui` as a small `ChipNav`, and both call sites consume it. See DRY notes.

- `shared/ui/chip-nav.tsx` + `chip-nav.module.scss` — a `<nav>` of chips, each `{ label, href?, current }`; a chip with `current` renders as a `<span aria-current="page">`, otherwise as an `InternalLink`.
- `pages/case-studies/ui/article-header.tsx`'s `CutSwitcher` becomes a thin mapper onto it; the three classes leave `case-studies.module.scss`.
- `pages/cv/ui/locale-picker.tsx` becomes the same mapper over `routing.locales`, labels upper-cased (`EN`, `RU`), each link carrying `hrefLang`.
- `ui.switchToOther` drops out of both catalogues: the visible label now says which language each link goes to, so the `aria-label` it fed has nothing left to add.

## 3 — `[.pdf]` in place of the print button

The button calls `globalThis.print()`. It becomes the same `.pdf` link the article header offers — an anchor with a `download`, pointing at a committed file — and the CV joins the committed-render pipeline.

**Where the files sit.** A document's file is its route plus an extension, and the CV's cards already follow that rule (`/cv/cto` → `public/cv/cto.og.png`). So the canonical address `/cv/<variant>/<locale>` gets `public/cv/<variant>/<locale>.pdf` — four files. The short rungs (`/cv`, `/cv/<variant>`) serve the same page as their defaults and already declare a canonical URL in their metadata; their `.pdf` link points at that canonical PDF rather than duplicating it. Saved name follows `documents.ts`'s rule — the route dot-joined under the download prefix: `vova.cv.cto.en.pdf`.

**Rendering them.** `scripts/render-pdf.ts` grows a second source of printables beside the documents:

- `content:pdf` switches from bare `node` to `tsx`, as `content:og` already did, so the script can reach `CV_VARIANTS`, `routing.locales` and `cvPath` through the `@/` alias. The file's header comment moves with it.
- `manifestDirs` gains the CV's directories, the way `render-og.ts` passes `CV_CARD_DIR` — otherwise a pruned render's manifest is never walked. Manifests land as `public/cv/<variant>/pdf-renders.json`.
- Source sets: the shared print surface (`print.scss`, `theme.ts`, `theme.module.scss`, `shared/config`, `shared/ui`) is factored out of today's `SHARED_SOURCES` and shared by both kinds; documents keep `prose.scss`, `pages/case-studies/ui` and `shared/content` on top; a CV PDF adds `src/pages/cv` and **only its own locale's catalogue**, so an `en` reword does not re-flag the `ru` PDF.
- `.claude/rules/content.md`'s PDF section gains the CV as a second printable kind.

**Cost, stated up front:** removing the theme toggle from `pages/case-studies/ui` (§5) and widening the shared source list both re-flag every existing case-study PDF, so all three documents plus the new four CV PDFs are re-rendered and committed in this branch. `pnpm content:pdf --check` in `vet.sh` is what makes that non-optional.

**Layout of the row.** The header row mirrors the article header: chips left, file link right.

```
[EN] [RU]                                          .pdf
```

## 4 — The name links home

`<Title order={1}>{t('header.name')}</Title>` wraps its text in an `InternalLink` to `/`, colour inherited and underline off, so the heading reads as a heading. The screen footer's existing back-link stays — it is the one a reader who has scrolled to the bottom reaches.

## 5 — The theme picker goes; the system scheme rules

- Delete `src/features/switch-theme/` outright and drop `<ThemeToggle />` from its six call sites: `home-page`, `writing-page`, `music-page`, `case-studies-page`, `article-page`, `cv-sheet`. On five of them the toggle was the only occupant of a `<Group justify="flex-end">`, so the group goes with it; on the CV the row stays and holds the two controls above.
- `ui.toggleTheme` leaves both catalogues.
- `features/` is left with no slices, so the layer directory goes too. `.claude/rules/fsd.md`'s layer table and `src/README.md` both name `switch-theme` and are repointed; `eslint.config.ts`'s `FSD_LAYERS` list is a layer ordering, not an inventory, and stays as it is.
- `ThemeProvider` keeps `defaultColorScheme="auto"` and gains a `colorSchemeManager` that reports `'auto'`, ignores writes, and clears the legacy key on subscribe. Without it a reader who used the toggle before it was removed keeps their stored choice forever, because `ColorSchemeScript` reads `localStorage` before hydration and Mantine's `forceColorScheme` accepts only `light`/`dark`, never `auto`. `<ColorSchemeScript defaultColorScheme="auto" />` stays in the root layout: it is what paints the right scheme before first paint, and with nothing writing storage its read resolves to the media query.

## Order of work

1. Catalogue titles (§1) — self-contained, both locales.
2. `ChipNav` down into `shared/ui`; `CutSwitcher` and `LocalePicker` onto it (§2).
3. Theme removal (§5), including the fsd/README repointing.
4. The heading link (§4).
5. `render-pdf.ts` and the CV `.pdf` link (§3), then `pnpm content:pdf` and commit the seven PDFs.
6. `pnpm styles:codegen`, then the full `./scripts/vet.sh` — `content:og --check` and `content:pdf --check` are the two that will speak up if anything above was missed.

## DRY notes

- **`ChipNav` is a genuine extraction, not a speculative one.** Two call sites want the identical control — a row of bordered chips, one of them the current page — and FSD forbids the CV reaching into `pages/case-studies` for it, so the choice is one shared component or two copies of the same twenty lines and three classes. The component owns markup and styling; each call site keeps its own labels and URL shaping, which is the part that genuinely differs (`CUT_LABELS` and `documentRoute` on one side, locale codes and `cvPath` on the other).
- **`FileLink` is not extracted.** The article header's version and the CV's `.pdf` link are four lines of `Anchor` each, and the CV's differs where it matters: it is not `print-hidden` inside a printed document, it sits in a different row, and it points at a canonical address rather than its own. Sharing them would mean a component whose whole body is prop plumbing. The `.hoverDim` class stays in `case-studies.module.scss`; the CV's link uses the `%aside`/opacity vocabulary already in `cv.module.scss`.
- **`DocumentFile` (`Linked & { download: string }`) moves to `shared/typings`.** The CV needs the same pair and `shared/content` is `server-only`, so the type cannot be imported from there into a client component. Two named types spelling `download` is exactly what `pnpm type-overlap` floor 1 rejects, so the base gets its one home; `shared/content/documents.ts` re-exports nothing and imports it instead.
- **The PDF source list is factored, not duplicated.** Documents and the CV share most of what shapes a printed page. One shared array plus a per-kind extra is the shape; two hand-maintained lists would drift, and a source missing from one of them ships a stale PDF that `--check` calls fresh.
- **Locale codes are not a new constant.** `routing.locales` already is the list; the chips upper-case it for display.

## Questions

Each is answered in the plan above by its recommended option, so silence resolves them.

**1. What happens to the engagement suffixes on the retitled roles?**
 a. _(recommended, and what the plan does)_ Keep them: `Senior Fullstack Developer – Project Work` for `englishForKids` and `orcool`. The suffix says the engagement was project work, which a bare seniority title would quietly overwrite on two two-month engagements.
 b. Replace the whole title: exactly `Senior Fullstack Developer`, suffix dropped.
 c. As (a), and normalize `independent` too → `Senior Fullstack Developer – Independent Projects`, so the ladder reads consistently.

**2. Russian wording for the three new titles?**
 a. _(recommended)_ `Fractional CTO` / `Senior Fullstack-разработчик` / `Fullstack-разработчик` — the seniority and stack terms are the ones used untranslated in Russian job listings.
 b. Translate throughout: `Фракционный CTO` / `Старший fullstack-разработчик` / `Fullstack-разработчик`.
 c. Leave all three in English in the `ru` catalogue.

**3. Which addresses get a committed PDF?**
 a. _(recommended)_ Four — one per canonical `/cv/<variant>/<locale>`; the short rungs link to their canonical file.
 b. Two — English only, and the `ru` pages link to the English PDF. Halves the committed weight and the render time, at the cost of a Russian reader downloading an English CV.

**4. Where do the two controls sit in the CV's header row?**
 a. _(recommended)_ Mirror the article header: `[EN] [RU]` left, `.pdf` right.
 b. Keep today's sides: `.pdf` left where the print button was, `[EN] [RU]` right where the pickers were.

**5. A reader who used the theme toggle before it was removed — what do they see?**
 a. _(recommended)_ The system scheme. Costs the ~15-line no-storage colour-scheme manager in §5.
 b. Their stored choice, indefinitely. Nothing to build, but "always the system theme" would not be true for them.
