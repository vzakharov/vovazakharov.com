# Issue #47: CV PDFs link to a dev server, and a re-render churns every PDF

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/issues/47
- **Author:** @vzakharov (agent)
- **Created:** 2026-09-15T18:04:57Z
- **Updated:** 2026-09-15T18:15:05Z
- **Closed:** _not closed_
- **Labels:** `bug`

---

## Body

Two problems in the printed-PDF pipeline, found while finalizing #43 by diffing a
re-render against the committed file. Both predate that PR — `main` carried them
before it and carries them now — and they are independent of each other, so they
can land separately. They are filed together because the same 16 differing bytes
per file surfaced both.

## 1. The CV PDFs link to a dev server (bug)

All four CV PDFs carry two link annotations pointing at the machine that rendered
them:

```
/URI (http://localhost:41593/)
/URI (http://localhost:41593/case-studies/playgram)
```

The port is whatever the render's dev server happened to get, so the links are
dead for every reader. The case studies' own PDFs are clean — this is the CV's
alone.

The cause is that the printed link's **text** is absolutized and its **href** is
not. `src/pages/cv/ui/case-study-link.tsx` renders the visible address as
`` `${cv.website}${href}` `` — `vovazakharov.com/case-studies/playgram`, which
reads correctly on paper — while passing the same relative `href` to the anchor,
which Chromium then resolves against the page origin. `src/pages/cv/ui/cv-sheet.tsx`
has the same shape at its two `<InternalLink href="/">` call sites.

`printedUrl()` in `src/shared/config/site-config.ts` is exactly the helper for
this: it returns the absolute `href` alongside the scheme-less text, and its
docstring already states why the two differ. It is used by
`shared/content/plugins/rehype-media-embeds.ts` and
`src/pages/case-studies/ui/printed-from.tsx`, but the CV never reaches it. Routing
the three print-path call sites through it is the fix; the on-screen anchors
should stay relative.

**Verify with** `strings apps/vova/public/cv/cto/en.pdf | grep -o '/URI ([^)]*)'`
after re-rendering — no `localhost` should survive, and the visible text should be
unchanged.

## 2. A re-render rewrites every PDF for nothing (hygiene)

`pnpm content:pdf --check` compares each PDF's **source set** against
`pdf-renders.json`, so any edit under `src/shared/config` or `src/shared/ui` — a
new export, a new component — re-flags all seven renders even when nothing on a
printed page moves. That part is the design working: the manifest deliberately
hashes inputs rather than output.

What is avoidable is the churn. Re-rendering after such an edit produces pages
that are byte-identical apart from `/CreationDate` and `/ModDate` (plus the dead
links above, which carry a fresh port). So the honest fix — re-record the hashes —
looks identical to a 5 MB binary commit unless someone diffs the bytes by hand and
decides to keep the old files. In #43 that decision was made manually, which is
the thing worth removing.

Cheapest fix: after rendering, have `scripts/render-pdf.ts` compare the new bytes
against the committed file with the two date fields normalized, and keep the
existing file when they match. Then `pnpm content:pdf` writes only the manifest
when a page genuinely did not change, and its output is always safe to commit
as-is. Fixing item 1 helps here too — the port is the other source of spurious
difference.

---

## Comments

- **C01** @vzakharov (human) — 2026-09-15T18:15:05Z — "> The port is whatever the render's dev server happened to g…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (human) on 2026-09-15T18:15:05Z

[https://github.com/vzakharov/vovazakharov.com/issues/47#issuecomment-5685599003](https://github.com/vzakharov/vovazakharov.com/issues/47#issuecomment-5685599003)

> The port is whatever the render's dev server happened to get, so the links are
dead for every reader. The case studies' own PDFs are clean — this is the CV's
alone.

хм, скачал с vovazakharov.com PDF, прошёл по ссылке на playgram case study, всё ок

---

## Timeline (status, references, and other events)

- **2026-09-15T18:04:58Z** @vzakharov added label `bug`.
