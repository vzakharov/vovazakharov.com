> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Print domains LinkedIn rejects as images

## Why

LinkedIn's document upload answers "0 pages" for a PDF whose text or link
annotations name `paindirection.pages.dev`. BAS-0006 cites that page, so its PDF
cannot be posted. Bisecting the PDF showed it:

- a page holding only the source list's links fails, and so does one holding only its text;
- the same links minus the two naming the domain pass;
- a bare page with the domain in Helvetica fails;
- a rasterized copy passes.

The PDF itself is valid.

A spike printed through the same Chromium `render-pdf.ts` uses. **Any CSS `filter`
on an element makes Skia paint it into the PDF as a 300 dpi image with a
transparent background.** The text leaves the text layer, and the link
annotations inside it leave the file. On screen, and on paper, it looks the same.

## What gets built

1. **`src/shared/lib/print-raster.ts`** — `PRINT_RASTER_DOMAINS` (today
   `paindirection.pages.dev`), with a docstring saying why a domain is listed. It
   also holds the matcher both consumers use, and the attribute name they set. No
   `server-only`: pure constants and string functions, so the test runs under bare
   `node --test`. `shared/lib` is already in `PRINT_SOURCES`, so a change to the
   list reprints every PDF.
2. **`print-raster.test.ts`** beside it covers:
   - a match in a bare domain, in a URL, and in an archive URL wrapping it;
   - case-insensitivity;
   - no match on a lookalike;
   - the splitter's segments.
3. **`SourceList`** marks a whole source entry when its `url`, `archive` or
   `outlet` mentions a listed domain. One entry is one citation, so it rasterizes
   whole: title, archive link and outlet.
4. **`rehypePrintRaster`** in `shared/content/plugins/` covers the prose, so a
   listed domain cited in a body does not reopen the bug. It marks an `<a>` whose
   `href` or text mentions one. It also wraps a bare mention in running text in a
   marked `<span>`. It is registered after `rehypeContentLinks`.
5. **`print.scss`** gets one rule under `@media print`:
   `[data-print-raster] { filter: drop-shadow(0 0 0 transparent); }`. It carries
   a comment on what the filter does in Skia's PDF backend and why it exists.
6. **`.claude/rules/content.md` § "Traps"** gets one bullet. A PDF LinkedIn
   uploads as "0 pages" names a domain it blocks, and that domain joins
   `PRINT_RASTER_DOMAINS`. That bullet is the path from the symptom to the list.

## Verify

- Render `the-pain-direction` with `pnpm content:pdf:basilisk`.
- `pdftotext` shows no listed domain, and no link annotation carries one.
- The page looks unchanged at print resolution.
- Hand the PDF to the operator for the LinkedIn upload.
- `./scripts/vet.sh` passes.

## DRY notes

- **One matcher, two consumers.** `SourceList` (entities) and the rehype plugin
  (shared/content) both call `mentionsPrintRasterDomain` from `shared/lib`.
  Neither restates the list.
- **The attribute name is a TS constant**, used by the component and the plugin.
  `print.scss` spells the same string, because Sass cannot import a TS
  constant. The comment on the rule names the constant, so a rename finds both.
- No existing helper splits hast text on a pattern. `hastText` reads text and
  `replaceElements` swaps elements, so the splitter is new, small and local to
  the plugin.
