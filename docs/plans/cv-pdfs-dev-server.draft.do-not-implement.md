> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# #47 — the CV PDFs' dead links, and the churn a re-render leaves

Two independent fixes in the printed-PDF pipeline, landing together because the
second is what makes the first's re-render safe to commit.

## What is actually on the wire

Verified against the live files, not just the tree — `curl https://vovazakharov.com/cv/{cto,dev}/en.pdf`
returns bytes identical to the committed ones, and both carry:

```
/Rect [225 760.9 371.25 785.7]      -> http://localhost:41077/
/Rect [157.5 373.2 339 384.4]       -> http://localhost:41077/case-studies/playgram
```

Two annotations, not three. The issue names `cv-sheet.tsx`'s "two
`<InternalLink href="/">` call sites"; only the first prints. Line 223 sits
inside a `print-hidden` footer, so it emits no annotation and needs no change —
which is what keeps a real client-side "back to home" on screen after the fix
below.

**On the operator's comment (C01).** The link does work when clicked in most
viewers, and the annotation is still wrong. Chrome's PDF viewer — and Preview,
and Acrobat with URL auto-detection on — synthesizes a link from text that
*looks* like a URL, and the visible text here reads `vovazakharov.com/case-studies/playgram`.
That synthesized link is what a reader lands on; the embedded annotation
underneath it points at a port on a machine that no longer exists. A viewer
without auto-detection, or one that prefers the real annotation, gets the dead
one. The header's name link has no URL-shaped text to rescue it at all.

## 1. Route the printing anchors through `printedUrl()`

`printedUrl()` in `src/shared/config/site-config.ts` already returns the absolute
`href` alongside the scheme-less display text, and already serves
`rehype-media-embeds.ts` and `printed-from.tsx`. The CV never reaches it.

- **`src/pages/cv/ui/case-study-link.tsx`** — the `printLink` anchor takes
  `printedUrl(href)` for both halves. Its text is currently
  `` `${cv.website}${href}` ``, which resolves to the same string the helper
  produces, so the visible line is unchanged. The `print-hidden` anchor above it
  stays relative.
- **`src/pages/cv/ui/cv-sheet.tsx:72`** — the name in the header, which prints
  and is also on screen. Take `printedUrl('/').href` and keep the name as the
  link text.

  The screen cost is that clicking one's own name is a full navigation rather
  than a client-side transition. Accept it: the sheet already does exactly this
  one line below (`WebsiteLink` has been absolute on screen all along), and the
  footer's relative `backLink` is the client-side route home.

  The alternative — splitting into a `print-hidden` relative anchor plus a
  `print-only` absolute one, the shape `case-study-link.tsx` uses — puts the name
  in the DOM twice to buy back one soft navigation on a leaf page. Not worth it.

**Verify:** after re-rendering, `strings apps/vova/public/cv/cto/en.pdf | grep -o '/URI ([^)]*)'`
shows no `localhost`, and the rendered line still reads
`vovazakharov.com/case-studies/playgram`.

## 2. Keep the committed bytes when only the clock moved

`scripts/render-pdf.ts`'s `printRoute` hands Chromium the output path directly,
so every render overwrites the committed file whether or not the page changed.
Two fields differ on an unchanged page:

```
/CreationDate (D:20260915122939+00'00')
/ModDate (D:20260915122939+00'00')
```

Both are uncompressed, fixed-width, and appear once each; there is no `/ID`
trailer. Fixed width is what makes this safe — a date change shifts no byte
offset, so the xref table is untouched and the rest of the file is genuinely
identical.

So: in `printRoute`, read the existing file's bytes before printing, and after
Chromium writes, compare the two with both date values stripped. On a match,
write the old bytes back. `pnpm content:pdf` then writes only the manifest for a
page that did not move, and its output is always safe to commit as-is.

This is deliberately narrower than it could be. It does **not** make the render
reproducible across machines — Chromium versions still differ, which is why
`render-manifest.ts` hashes sources rather than output, and that stays as it is.
It only removes the case where the same browser re-renders the same page.

**Verify:** run `pnpm content:pdf` twice. The second run reports the renders,
leaves `git status` clean, and the second run's own log is the only difference.

## Ordering

Fix 1, then fix 2, then one `pnpm content:pdf` — fix 1 changes the pages, so that
render genuinely rewrites all four CV PDFs and the guard has nothing to keep. A
second, immediately following run is what exercises the guard, and is the test
above.

## DRY notes

- **`printedUrl()` is reuse, not extraction.** The helper exists, its docstring
  already states why href and text differ, and two other call sites use it. Fix 1
  is three lines of reaching for it.
- **No shared "printed link" component.** The two call sites want different
  things from the helper: `case-study-link` wants both `href` and `text`,
  `cv-sheet`'s header wants the `href` under a name that is not a URL. A wrapper
  covering both takes a "use my text or the helper's" flag, which is the two call
  sites spelled out again with a boolean between them.
- **`cv.website` duplicates `SITE_CONFIG.url` and stays.** The catalogue's
  `cv.website` is `vovazakharov.com` in both locales — the same string
  `printedUrl` derives by stripping the scheme. Fix 1 removes the copy at the one
  print call site that concatenates it. It does **not** touch `WebsiteLink`
  (`cv-sheet.tsx:40`): `printedUrl('/')` renders `vovazakharov.com/` with a
  trailing slash the header line does not want, so folding it in would change
  visible copy for a duplication that is one catalogue string. Flagged, not fixed.
- **The byte guard lives in `render-pdf.ts`, not `render-manifest.ts`.** Its
  normalization knows the PDF's Info dictionary, which the shared module is
  deliberately blind to — that module's own docstring argues for hashing sources
  instead of comparing output, and fix 2 does not contradict it. The Open Graph
  script has no counterpart to share: a PNG carries no timestamp, so there is no
  churn there to remove.

## What this does not do

`PRINT_SOURCES` still spans `src/shared/config` and `src/shared/ui` wholesale, so
an unrelated export in either re-flags all seven PDFs. That is the manifest
working as designed — it hashes inputs, and casting the net wide is what keeps a
print-affecting change from shipping behind a stale file. Fix 2 removes the
*cost* of those false positives rather than the positives themselves, which is
the cheaper half and the one that does not risk a missed render.
