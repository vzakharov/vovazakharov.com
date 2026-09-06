# PR #25: feat: serve .md and .pdf at each document's own URL

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/25
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/content-url-suffixes-j2qjau
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-05T10:23:54Z
- **Updated:** 2026-09-06T12:58:14Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **A document's file sits at its route plus an extension.** `/case-studies/playgram.md` and `.pdf` now sit beside the page at `/case-studies/playgram`, and a cut is a dotted suffix on the slug (`/case-studies/playgram.mini`) rather than a nested segment — so the route matches the name the file was authored as, and a downloaded copy is `playgram.mini.md` rather than `mini.md` on every path, with no `download` attribute needed. Nothing in a static export occupies those URLs, so this needs no route, no handler and no build step; `output: 'export'` has no rewrites and a `route.ts` could not coexist with the page's `page.tsx` on the same segment anyway.
- **`documentRoute()` becomes the only URL shaper.** The collections registry's `dir` and `routeBase` collapse into one `base` segment, `rawUrl`/`pdfUrl` are the route plus an extension, and the link plugin stops re-deriving what a cut is — three duplications become one derivation. The markdown moves from `public/content/<collection>/` to `public/<collection>/`, and the mermaid renders leave the collection tree for `public/generated/`, which retires the `generated/` skip the source walk carried.
- **`pnpm content:pdf` renders a committed PDF per document, cuts included**, from the site's existing print stylesheet — a static export has no request-time renderer, so a committed file is the only PDF there can be. Its staleness bookkeeping is `scripts/lib/render-manifest.ts`, extracted from `render-og.ts` and now shared; `--check` hashes files only and joins vet's fan-out. A PDF's source set is wider than its markdown (the print sheet and the article components shape it too), so a component tweak re-flags every PDF — the stated cost of not shipping a stale one.
- **Provenance travels with both files.** The header offers them as `.md` and `.pdf`, and each carries a `download` naming the document's dot-joined path under a site prefix (`vova.case-studies.playgram.mini.pdf`), so neither opens over the article the reader is in. Every printed page then carries a footer of its own — the document's URL, scheme dropped, opposite `© Vova Zakharov, <year>` — because Chrome's own footer would name the `localhost` that printed it and the CLI cannot override its text. That footer is a real `<tfoot>` (`PrintSheet`) rather than a `position: fixed` line: fixed repeats per page but lets the prose run underneath it, and `display: table-footer-group` on a plain element prints once, at the end. The table is `table-layout: fixed` in print, because an auto one widens to its widest child and silently crops everything past the paper's edge.
- **A video prints as the line that replaces it** — an italic _See video at &lt;url&gt;_ note, since the player itself prints as a blank rectangle. Which makes a video's URL something a reader transcribes off paper, so an opaque CDN id is a content problem rather than a rendering one.
- **A document's own links are absolute; its media sources are not.** Without that, a committed PDF points its in-document links at the dev server that printed it (`http://localhost:44985/case-studies/playgram.nano`) — two dead links per document. A `src` stays site-root: the page fetches it itself, and an absolute one would cost a local preview its images and the dimension pass its file.
- **The PDF manifest hashes the pipeline too.** `SHARED_SOURCES` covers `shared/content` and `shared/config` alongside the sheets and the article components, so a rehype-plugin or site-config edit re-flags every PDF instead of shipping behind one `--check` calls fresh.
- **Two live URL shapes stop resolving**, as planned: `/content/case-studies/playgram.md` (and the asset paths under `/content/`) and `/case-studies/playgram/mini`. Static export has no redirects, and keeping duplicates would undo the single-copy property the change is for.

## QA Checklist

- [ ] `page` — open `/case-studies/playgram`; the article renders, and the header offers **Markdown** and **PDF** beside the Full/Mini/Nano switcher.
- [ ] `raw-md` — open `/case-studies/playgram.md`; the authored markdown is served (`text/markdown`), not the page.
- [ ] `pdf-url` — open `/case-studies/playgram.pdf`; the browser's inline viewer shows the 23-page document.
- [ ] `cut-route` — open `/case-studies/playgram.mini`; the mini cut renders, and its `.md`/`.pdf` siblings resolve too.
- [ ] `download-name` — click **.md** and **.pdf** in the header; both save rather than open, as `vova.case-studies.playgram.mini.md` and `…mini.pdf`. Fetch either URL directly (`curl -O`) and it falls back to `playgram.mini.md`, not `mini.md`.
- [ ] `pdf-footer` — open a rendered PDF: **every** page carries `vovazakharov.com/case-studies/…` opposite `© Vova Zakharov, 2026`, no page's prose runs under it, the text selects, and clicking the URL navigates (the annotation keeps `https://`).
- [ ] `pdf-video` — the same PDF shows an italic _See video at …_ where the player sits on screen, and no blank rectangle.
- [ ] `pdf-links` — follow an in-document cross-cut link from inside a PDF; it resolves to `vovazakharov.com`, not to a `localhost` port.
- [ ] `cross-links` — from the mini cut, follow the in-document links to the full and nano cuts; both resolve, and the document's images and mermaid diagrams load (`/case-studies/assets/…`, `/generated/mermaid/…`).
- [ ] `gone` — `/case-studies/playgram/mini` and `/content/case-studies/playgram.md` both 404. Expected: this is the accepted breakage.
- [ ] `pdf-staleness` — touch `src/app/styles/print.scss`, run `pnpm content:pdf --check`: it names all three PDFs stale and exits non-zero. `pnpm content:pdf` re-renders them and the check goes green.
- [ ] `pdf-cleanup` — after `pnpm content:pdf`, no `next dev` process survives (`ps aux | grep "next dev"`), and a second run starts without a `.next/dev/lock` complaint.

| Item            | Automatable | Covered? | Notes                                                                                      |
| --------------- | ----------- | -------- | ------------------------------------------------------------------------------------------ |
| `page`          | e2e         | ❌       | `pnpm build` proves it renders; that the two links are present and correct is not asserted |
| `raw-md`        | e2e         | ❌       | Assert `out/case-studies/playgram.md` exists and matches the authored file                 |
| `pdf-url`       | e2e         | ❌       | Assert `out/case-studies/playgram.pdf` exists and parses as a PDF                          |
| `cut-route`     | e2e         | ❌       | Assert the build emits `playgram.mini.html` beside `playgram.html`                         |
| `download-name` | unit        | ❌       | `readDocument` → `markdown`/`pdf` `download` for a cut and for a full document             |
| `pdf-footer`    | e2e         | ❌       | Extract per-page text, assert the footer on every page and no prose below its top edge     |
| `pdf-video`     | e2e         | ❌       | Assert the note's text is in the PDF and the player's rectangle is not                     |
| `pdf-links`     | e2e         | ❌       | Assert no link annotation in any committed PDF matches `localhost`                         |
| `cross-links`   | unit        | ❌       | `rehypeContentLinks` over a `./x.mini.md` link and a `./assets/y.png` src                  |
| `gone`          | e2e         | ❌       | Assert `out/` holds neither path                                                           |
| `pdf-staleness` | integration | ❌       | Same shape as `type-overlap-check.test.ts`: a temp tree, run `--check`, assert exit + text |
| `pdf-cleanup`   | manual-only | —        | Process-group teardown against a real `next dev`; not meaningfully assertable in-suite     |

https://claude.ai/code/session_01Nw2chXB95voeckCAeBggwT

---

## Comments

### Comment by @vzakharov on 2026-09-05T10:24:30Z

[https://github.com/vzakharov/vovazakharov.com/pull/25#issuecomment-5551154661](https://github.com/vzakharov/vovazakharov.com/pull/25#issuecomment-5551154661)

Proposed squash title/body:

```
feat: serve .md and .pdf at each document's own URL (pr #25)
```

```
A document's markdown was published at /content/case-studies/<slug>.md
while its page was at /case-studies/<slug>, and a shorter cut was the
file <slug>.<variant>.md behind the route <slug>/<variant>. Two path
spellings for one document, held in two registry fields, and a file
name and a route that disagreed on shape — so no single rule could say
where a document's files live.

One rule now does: a document's file sits at its route plus an
extension. The collections move to public/<base>/, a cut's route
flattens to /<base>/<slug>.<variant>, and documentRoute() becomes the
only place a content URL is shaped — the registry's dir and routeBase
collapse into one segment, a document's markdown and PDF are that route
plus an extension, and the link plugin no longer knows what a cut is.
Nothing in a static export occupies those URLs, so this costs no route,
no handler and no build step; public/ is not a workaround for the dead
end that output: 'export' has no rewrites and a route.ts cannot share a
segment with a page.tsx — it is the whole mechanism. The mermaid
renders leave the collection tree for public/generated/, which retires
the skip the source walk carried to avoid its own output. Two live URL
shapes stop resolving for it, deliberately:
/content/case-studies/<slug>.md with the asset paths under it, and
/case-studies/<slug>/<variant>. A static export has no redirects, and
leaving duplicate copies behind to preserve them would undo the
single-source property the change is for.

pnpm content:pdf renders a committed PDF per document, cuts included,
from the site's existing print stylesheet, since a static export has no
request-time renderer to make one on demand. Its staleness bookkeeping
is scripts/lib/render-manifest.ts, extracted from render-og.ts and
shared by both; --check hashes files only, so it joins the vet fan-out.
A PDF's source set is everything that shapes a printed page — the
sheets, the article components, the shared/content pipeline that
produces the markup, and the shared/config identity its footer prints —
so a tweak to any of it re-flags every PDF, which is the price of never
shipping a stale one.

Because that PDF leaves the browser, it carries what a screen supplies
by other means. Every page repeats the document's URL, scheme dropped,
opposite the site's copyright, as a real <tfoot> via PrintSheet: fixed
positioning repeats per page but lets the prose run under it, and
table-footer-group prints once, at the end. The table is table-layout:
fixed in print, an auto one having widened to its widest child and
silently cropped 2,600 words past the paper's edge. A video becomes an
italic "See video at <url>", the player itself printing as a blank
rectangle — which makes a video URL something a reader transcribes, so
an opaque CDN id is now a content problem. And a document's own links
are spelled absolutely, since a site-root href in a committed PDF means
whichever host printed it; a src stays site-root, the page fetching that
itself. Both files download under the document's dot-joined name, so
neither opens over the article the reader was in.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kRiwmP39y3DrUj7rRLAZK
```

---

_Generated by [Claude Code](https://claude.ai/code)_

---

## Review threads

### `.claude/rules/content.md`:69

```diff
@@ -54,6 +64,8 @@ The exceptions are `shared/content/content-hash.ts` and `mermaid-renders.ts`, wh

 ## Traps worth knowing

+- **A document's route reserves `.html` and `.txt`, and takes them without a word.** Those are the page and the RSC payload Next emits beside it, and a file in `public/` that collides with either is silently overwritten by the route's output — `next build` exits 0 and reports nothing. Every other extension is free, which is what makes `.md` and `.pdf` safe and leaves room for a third.
```

**@vzakharov** — 2026-09-06T12:02:29Z

Just out of curiousity, why .txt too? (This is _not_ a request to edit.)

**@vzakharov** — 2026-09-06T12:55:56Z

`.txt` is the RSC payload the App Router emits beside each page — the serialized flight data a client-side navigation fetches instead of re-downloading HTML. Verified on this branch's build:

```
out/case-studies/
  playgram.html      ← the page
  playgram.txt       ← its RSC payload
  playgram.md        ← ours, from public/
  playgram.pdf       ← ours, from public/
```

So the route claims both, and a `public/case-studies/playgram.txt` would lose to the second one silently. Left as-is per your note.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `public/case-studies/pdf-renders.json`:1

**@vzakharov** — 2026-09-06T12:18:00Z

can't this be embedded in the pdf themselves as some metadata, so we don't have to keep a separate file?

**@vzakharov** — 2026-09-06T12:56:32Z

Possible, but it costs more than the file does — so I've left it, with a question back.

Chromium's `--print-to-pdf` writes no custom metadata and has no flag for it (`footerTemplate` and friends are DevTools-protocol only). So embedding means a **post-render mutation pass** over each PDF with a PDF library added as a dependency, writing a custom `/Info` key or XMP.

The bigger cost is that it un-does the extraction this PR just made. `scripts/lib/render-manifest.ts` is now shared by the PDF job and the Open Graph one, and it's format-blind on purpose — a sidecar JSON plus an `isOutput(name)` predicate is all it knows. Embedding gives each job a format-specific reader/writer (PDF `/Info`, PNG `tEXt` for the OG cards), which is most of what the shared module was for.

What it would buy is one fewer committed file per render directory. Worth it if that's the objection — but if what actually bugs you is that build bookkeeping **ships to the site** (`/case-studies/pdf-renders.json` and `/case-studies/assets/og-renders.json` are both live URLs right now), that's the cheaper thing to fix: move both manifests out of `public/` and key them by path instead of by directory. Say which and I'll do it.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `public/case-studies/playgram.mini.pdf`:1

**@vzakharov** — 2026-09-06T12:20:19Z

two things:
a) the video (obviously) doesn't render in pdf, so videos have to be replaced with "See video at <url>" in italic. For the same reason, the video url should be human-typable (not sha or smth)
b) I don't see any footer in the pdf (on every page), only one footnote after the entire body -- we need it on every page for visibility. For better look, exclude "https://" prefix (unless it breaks navigation). Also, a juxtaposed "© Vova Zakharov, <current year>" would be a nice addition too.

**@vzakharov** — 2026-09-06T12:56:12Z

Both done in 3f10992 — verified by extracting text and link annotations out of the rendered PDFs rather than by eyeballing them.

**(a) Videos.** A print-only `<em>See video at …</em>` line now sits beside the player (`rehype-media-embeds.ts`), and the player is `print-hidden`.

On the URL being typable: it currently prints as `github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c`, which is exactly the unusable thing you mean, and I can't fix it from here — this session's proxy scopes `github.com` to this repo, so I can't download the attachment to re-host it. Left you a choice in the session; the mechanism prints whatever the `src` is, so it's a one-line content edit either way.

**(b) Footer on every page.** It repeats now, reserves its own space, and reads `vovazakharov.com/case-studies/playgram.mini` opposite `© Vova Zakharov, 2026`. The `https://` is dropped from the _text_ only — the link annotation keeps it, so clicking still navigates.

The mechanism is worth knowing about because it constrains the markup: `PrintSheet` wraps the article in a presentational table so the footer is a real `<tfoot>`. That's the only thing Chromium both repeats per page **and** keeps the flow clear of. Measured, on a 6-page probe:

| Approach                               | Repeats per page                 | Reserves space              |
| -------------------------------------- | -------------------------------- | --------------------------- |
| `position: fixed; bottom: 0`           | yes                              | **no** — text runs under it |
| `display: table-footer-group` on a div | **no** — prints once, at the end | n/a                         |
| real `<tfoot>`                         | yes                              | yes                         |

Two things fell out of verifying it:

- The table needs `table-layout: fixed` in print. An auto table widens to its widest child (a code block, a data table) and everything past the paper edge is silently cut — that cost the full document **2,600 words and 7 pages** before the rule went in.
- Every committed PDF was pointing its in-document links at `http://localhost:44985/...`, i.e. the dev server that printed it — same root cause as your footer complaint, two links per document. `rehypeContentLinks` now spells internal `<a href>`s absolutely (a `src` stays site-root, or a local preview loses its images). All three PDFs are at 0 localhost links now.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

## Timeline (status, references, and other events)

- **2026-09-06T12:25:41Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/25#pullrequestreview-5125242745.
