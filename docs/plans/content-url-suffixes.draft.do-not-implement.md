> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Content URL suffixes — `.md` and `.pdf` beside every document page

## Goal

A document's alternate representations live at its own URL plus an extension:

| URL                               | What it serves         |
| --------------------------------- | ---------------------- |
| `/case-studies/playgram`          | the rendered page      |
| `/case-studies/playgram.md`       | the authored markdown  |
| `/case-studies/playgram.pdf`      | a prebuilt PDF         |
| `/case-studies/playgram.mini`     | the shorter cut's page |
| `/case-studies/playgram.mini.md`  | that cut's markdown    |
| `/case-studies/playgram.mini.pdf` | that cut's PDF         |

## The finding this plan rests on

A static export writes `out/case-studies/playgram.html` and copies `public/` into `out/` verbatim. Nothing in `out/` occupies `case-studies/playgram.md`. So a file at `public/case-studies/playgram.md` **is already served at `/case-studies/playgram.md`** — no route, no handler, no build step. Verified by spike on this tree, on both servers:

| URL                              | `next dev`            | `pnpm build`                          |
| -------------------------------- | --------------------- | ------------------------------------- |
| `/case-studies/playgram`         | 200 `text/html`       | `out/case-studies/playgram.html`      |
| `/case-studies/playgram.md`      | 200 `text/markdown`   | `out/case-studies/playgram.md`        |
| `/case-studies/playgram.pdf`     | 200 `application/pdf` | `out/case-studies/playgram.pdf`       |
| `/case-studies/playgram/mini`    | 200 `text/html`       | `out/case-studies/playgram/mini.html` |
| `/case-studies/playgram/mini.md` | 200 `text/markdown`   | `out/case-studies/playgram/mini.md`   |

Both servers return the right bytes with the right content type, and neither log carries a conflict or a warning. Next's static-file layer resolves ahead of the dynamic route, so `[...slug]` never sees these requests; on GitHub Pages there is no Next in the path at all. Every spike was removed and the tree left clean.

This matters because the alternative is impossible. `/case-studies/playgram` and `/case-studies/playgram.md` are the _same_ dynamic segment of `[...slug]`, and a segment resolves to exactly one handler — a `route.ts` cannot coexist with the `page.tsx` that renders the document. `output: 'export'` also has no rewrites. Serving the file from `public/` is not a workaround for that dead end; it is the only mechanism, and it happens to be the cheapest one available.

**A route reserves exactly two extensions, and takes them silently.** Probing the collision case — `public/case-studies/playgram.html`, against the page's own output — `next build` exits 0 with no warning and the route output overwrites the public file. So the reserved set at a document's route is `.html` (the page) and `.txt` (the RSC payload Next emits beside it); every other extension is free, which is what makes `.md` and `.pdf` safe and leaves room for a third later. Nothing in the build reports a file lost this way, so the rule has to be documented rather than discovered.

## The rule the change establishes

**A document's file sits at its route plus an extension.** One sentence covers the markdown, the PDF, the full document and every cut — and `documentRoute()` becomes the single place a content URL is shaped.

Two things stand in the way today, and removing them is most of this plan:

1. The markdown is under `public/content/case-studies/`, so its URL is `/content/case-studies/<slug>.md` while the page is `/case-studies/<slug>` — two path spellings for one document, held in two registry fields (`dir` and `routeBase`) that are two strings for one concept.
2. A cut is the file `<slug>.<variant>.md` but the route `/<slug>/<variant>` — a file name and a route that disagree on shape, so the rule cannot hold for cuts either way round.

**The cut's route flattens to `/<slug>.<variant>` rather than the file nesting to `<slug>/<variant>.md`.** Both make the rule hold; only this direction gets the filename right. A download's name can be overridden only by the `Content-Disposition` response header — unavailable to a static export on GitHub Pages, which serves fixed headers — or by an anchor's `download` attribute, which covers a click on our own link and nothing else. Under a nested file, anyone who pastes, shares or curls the URL saves `mini.md`, and `download` cannot help the PDF at all: it forces a save instead of the browser's inline viewer, and the viewer names the file from the URL regardless. Flattening the route makes `playgram.mini.md` the name on every path, with no attribute needed. It is also much the smaller change — the documents keep their paths and their cross-links, and the link plugin never has to resolve `../`.

Verified by spike: with `generateArticleParams` emitting a single dotted segment, `pnpm build` exits 0 and lists `/case-studies/playgram.mini` and `/case-studies/playgram.nano`, emitting `playgram.mini.html` beside `playgram.html`. Reverted.

## Work

### 1. Move the content tree up one level

```
public/case-studies/
  playgram.md
  playgram.mini.md
  playgram.nano.md
  assets/…                   # unchanged, moved with the documents
public/generated/mermaid/…   # was public/content/generated/mermaid/
```

The collection directory ends up with no subdirectory but `assets/`. The mermaid renders leave the collection tree entirely rather than sitting inside one, so nothing has to walk past them: today `contentFiles()` carries an explicit `generated/` skip precisely because the pipeline's own output sits where its sources do. Move them out and the skip disappears.

`public/content/` goes away. The old `/content/case-studies/playgram.md` URL breaks — see "Accepted breakage".

### 2. Collapse `dir` and `routeBase` into one field

In `src/shared/content/collections.ts`, a collection is one path segment:

```ts
'case-studies': { base: 'case-studies', label: 'Case studies' }
```

`collectionDir()` is `public/<base>`, the route base is `/<base>`, and `collectionAssetUrl()` prefixes `/<base>/`. `documentRoute()` gains the dotted cut form:

```ts
`/${base}/${slug}${variant ? `.${variant}` : ''}`;
```

and becomes the only URL shaper. `ContentDocument.rawUrl` stops calling `collectionAssetUrl` and becomes `` `${route}.md` ``, with `pdfUrl` its sibling.

### 3. Drop `server-only` from `collections.ts`

`scripts/lib/content-tree.ts` has to know where the collections live, and it runs under bare Node — where `import 'server-only'` resolves to a module that throws. `collections.ts` is string constants and pure path functions, so it joins the two exceptions the content rule already documents (`content-hash.ts`, `mermaid-renders.ts`) for the same reason: a render script needs it. `documents.ts` keeps `server-only` — it is the module that pulls in `fs`, `gray-matter` and `zod`, and the invariant that matters ("the pipeline never reaches the client") is enforced there.

Relative imports inside `collections.ts` gain their `.ts` extensions so Node's resolver finds them, per the same convention.

### 4. Parse the flat cut segment in the route

`parseSegments` in `article-page.tsx` currently reads `[slug, variant]` as two segments. It becomes a single segment split on its last dot, with a suffix that is not a known variant staying part of the slug — the same rule `parseFileName` already applies to file names, which is what keeps the two in agreement. `generateArticleParams` emits one segment per document.

`documents.ts` needs no structural change: the collection is still a flat directory of `<slug>[.<variant>].md`, so `parseFileName`, `loadDocument` and `siblingVariants` stand as they are, reading from the new directory.

### 5. Simplify the link plugin

`rehype-content-links.ts` re-derives the variant naming convention (find a `.mini`/`.nano` suffix, split the stem) to turn a relative `.md` link into a route. Once a cut's route _is_ its file name minus `.md`, `markdownRoute()` collapses into the same prefix-with-the-collection-base that every other relative URL already gets, and the plugin stops knowing what a variant is.

The documents' own cross-links (`./playgram.mini.md`, `./assets/…`) are untouched, and go on resolving identically in the repo, on GitHub and in the served copy.

### 6. The PDF pipeline

A new `scripts/render-pdf.ts` behind `pnpm content:pdf`, built to the shape `content:og` already established — committed output, run by hand, a manifest that makes staleness detectable without a browser:

```
pnpm content:pdf            # render what changed, prune what is gone
pnpm content:pdf --check    # report staleness, write nothing
```

- **Rendering.** Boot `next dev` on a free port and poll for it (the `/preview` procedure), then for each document print its route with `chromium --headless --no-pdf-header-footer --print-to-pdf=public/<base>/<slug>[.<variant>].pdf`. The browser comes from `scripts/lib/chromium.ts`; as with the other two scripts there is no puppeteer dependency, just Chrome's own CLI. The site already ships a full print stylesheet, so the PDF is the page's existing print rendering rather than a new layout.
- **Provenance is rendered by the page, not by the browser.** `--no-pdf-header-footer` is deliberate: Chrome's default footer prints the URL it fetched, which is the dev server's `localhost`, and the CLI cannot override it — `footerTemplate` belongs to the DevTools protocol, not the flag surface. Measured on a real render, that footer's text also carries no `ToUnicode` map, so it is neither selectable nor searchable in the output. A `print-only` line in the article footer carrying `getAbsoluteUrl(route)` is correct whatever host printed it, stays selectable, and survives the re-sharing and re-saving that strips a file of its name.
- **Staleness.** A PDF's inputs are not just its markdown — the print sheet and the article components shape it too, so a markdown-only hash would let a style change ship behind a stale PDF. The manifest hashes a **source set**: the document, the assets it references, `src/app/styles/{print,prose}.scss`, and `src/pages/case-studies/ui/`. The trade is explicit — a component tweak re-flags every PDF, and the cost of that false positive is one `pnpm content:pdf` run. `--check` hashes files only, so it joins `vet.sh`'s concurrent fan-out beside `content:og --check`.
- **Coverage.** Every document, cuts included, so the header's PDF link works from whichever cut the reader is on.

### 7. A PDF link in the article header

Beside the existing **Markdown** link, both `print-hidden` and both derived from `route`.

The markdown link carries `download` with the document's **dot-joined path under a site prefix** — `vova.case-studies.playgram.mini.md` — so a saved copy says what it is and whose it is, instead of landing in a downloads folder as an anonymous `playgram.mini.md`. The attribute's filename is an arbitrary string independent of the URL, which is what lets the name be self-describing without the URL, the repo path, or the single-copy property paying for it.

The prefix is one field on `SITE_CONFIG` (`downloadPrefix: 'vova'`) beside the `url` it stands in for, and `ContentDocument` carries the assembled name next to `rawUrl` and `pdfUrl` — all three derived from `route`, so a document's name is built in one place and every generated link is fed from it.

**The prefix is a legibility-for-resolvability trade, and reversible.** The full host would make the name something a reader can type back into a browser; `vova` makes it something they can read at a glance. Resolvability was never mechanical anyway — a dot already means three other things in these names (the host's own, the cut suffix, the extension), so decoding one back to a URL was always a human recognising it rather than a parser reading it. The PDF gives up nothing either way, since it carries its canonical URL in the footer; the markdown has no second carrier, because the content rule forbids restating a derivable path in frontmatter and the file is served raw, so nothing can inject one. That makes the short prefix a small real loss, taken deliberately — and taken cheaply, since one `SITE_CONFIG` field is the whole of it.

The PDF link carries no `download`: it would replace the browser's inline viewer with a forced save, and the PDF states its own origin in the footer anyway.

### 8. Docs

- `.claude/rules/content.md` — the tree, the `file = route + ext` rule, `collections.ts` joining the bare-Node exceptions, and two traps: a print-affecting style change needs `pnpm content:pdf` re-run and the PDFs committed, and a document's route reserves `.html` and `.txt`, which a colliding file in `public/` loses to without a word.
- `CLAUDE.md` — the `public/` row names `content/`; it becomes the collection directories.
- `.claude/rules/content.md` frontmatter `paths:` — `public/content/**` no longer matches anything.
- The locale seam at the foot of the content rule proposes `<slug>.<locale>.md`, which now collides with the cut's `<slug>.<variant>` route form. Note the collision where the seam is described rather than resolving it here.

## Decisions taken

- **The sitemap stays page-only.** `.md` and `.pdf` are alternate representations of a listed page, not additional pages.
- **PDFs are committed, not built in CI.** It matches the mermaid renders and the OG cards, keeps the deploy free of a browser render on its critical path, and is what the request assumed. The cost is binary churn in git history whenever a print-affecting style changes; the source-set hash is what keeps that churn honest rather than optional.
- **The dot-joined path names the download, not the URL.** Serving the markdown at `/vova.case-studies.playgram.mini.md` would cost the affordance this whole change is for — appending `.md` to a page URL would no longer find it — and keeping both paths means two copies of every document, which is exactly the single-copy property `public/` was chosen for. Applied to the `download` attribute instead, the same name costs nothing at all.
- **The CV PDF is out of scope.** `/cv.pdf`, `/en/cv.pdf`, `/ru/cv.pdf` all follow naturally once this mechanism exists, and the CV already has a print button. A separate change, once the pipeline has proven itself on the case study.

## Accepted breakage

Two live URL shapes stop resolving: `/content/case-studies/playgram.md` (and the mermaid and OG asset paths under `/content/`), and `/case-studies/playgram/mini`, which becomes `/case-studies/playgram.mini`. Static export has no redirects, and an HTML stub cannot stand in for a `.md` a browser downloads. Both have been live for days and neither was advertised as stable; leaving duplicate copies behind to preserve them would undo the single-source property this whole change is for.

## DRY notes

**Genuinely shared, and the point of the change.** URL shaping. Today `dir` and `routeBase` are two spellings of one path, `rawUrl` is built by a second function (`collectionAssetUrl`) that re-states the collection prefix, and `rehype-content-links.ts` re-derives the variant naming convention a third time to map a link to a route. After this change `documentRoute()` shapes every content URL and every file path is that route plus an extension — three duplications collapse into one derivation, which is why the move earns its churn rather than just relocating files.

**One duplication survives on purpose.** `parseFileName` (in `documents.ts`) and `parseSegments` (in `article-page.tsx`) both split `<slug>[.<variant>]` on its last dot. They are not extractable into one call without the route layer importing the document layer's file-name parser or vice versa, and the shapes they return differ. What keeps them honest is that both consult `VARIANTS`, so the set they agree on has one home even though the split is written twice.

**Reused, not re-created.** `findChromium()` from `scripts/lib/chromium.ts`; `contentHash()` from `shared/content/content-hash.ts`; the dev-server boot-and-poll from `/preview`; the existing print stylesheet, which is why the PDF needs no layout of its own.

**Extracted.** `render-og.ts` and `render-pdf.ts` share a real skeleton — read manifest, hash sources, render what drifted, prune what no longer has a source, and a `--check` that reports instead of writing. Pull that into `scripts/lib/render-manifest.ts`, parameterized by how an entry hashes and how it renders, and move `render-og.ts` onto it. The extraction stops at the seam: each script keeps its own Chromium invocation, since one prints a `file://` SVG at a fixed canvas and the other prints a served route. This widens the diff into a working script, so it is worth naming as a deliberate call — writing the second manifest by hand would leave two copies of the staleness-and-prune logic, which is exactly the drift the repo's type-overlap gate exists to prevent one level down.

**Deliberately not extracted.** `render-mermaid.ts` also keeps a manifest, but its unit is a fence inside a document rather than a file on disk, and its hash is of extracted text, not of a source set. Forcing it onto the shared skeleton would mean a helper whose "source" is sometimes a path and sometimes a string — a config object per caller, which is the point at which an abstraction costs more than the duplication. Leave it.

## Verification

- `./scripts/vet.sh` — `pnpm build` is the end-to-end check that every route, import and image reference still resolves after the move.
- `pnpm content:mermaid --check` and `pnpm content:og --check` must stay green through the path changes.
- Re-run the URL table above against the real tree, on both servers — the spike proved the mechanism, not this implementation of it.
- Save the markdown link from a browser and confirm it lands as `vova.case-studies.playgram.mini.md`; fetch the same URL directly and confirm the fallback name is `playgram.mini.md`, not `mini.md` — the second is why the route flattened, so it is worth checking rather than assuming.
- Open a rendered PDF and confirm the footer names the public URL, not `localhost`, and that the text selects.
- `/preview` the article header to see the two links side by side, and open a rendered PDF.
