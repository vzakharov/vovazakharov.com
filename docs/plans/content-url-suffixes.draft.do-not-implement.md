> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Content URL suffixes — `.md` and `.pdf` beside every document page

## Goal

A case study's alternate representations live at its own URL plus an extension:

| URL                             | What it serves         |
| ------------------------------- | ---------------------- |
| `/case-studies/playgram`        | the rendered page      |
| `/case-studies/playgram.md`     | the authored markdown  |
| `/case-studies/playgram.pdf`    | a prebuilt PDF         |
| `/case-studies/playgram/mini`   | the shorter cut's page |
| `/case-studies/playgram/mini.md`| that cut's markdown    |
| `/case-studies/playgram/mini.pdf`| that cut's PDF        |

## The finding this plan rests on

A static export writes `out/case-studies/playgram.html` and, beside it, the directory `out/case-studies/playgram/` holding the variants' HTML. Nothing in `out/` occupies `case-studies/playgram.md`. And `public/` is copied into `out/` verbatim.

So a file at `public/case-studies/playgram.md` **is already served at `/case-studies/playgram.md`** — no route, no handler, no build step. Verified by spike on this tree: with `public/case-studies/{playgram.md,playgram.pdf,playgram/mini.md}` present, `pnpm build` exits 0 with no conflict warning and emits all six files (`playgram.html`, `playgram.md`, `playgram.pdf`, `playgram/mini.html`, `playgram/mini.md`, `playgram/nano.html`) side by side. The spike was removed; the tree is clean.

This matters because the alternative is impossible. `/case-studies/playgram` and `/case-studies/playgram.md` are the *same* dynamic segment of `[...slug]`, and a segment resolves to exactly one handler — a `route.ts` cannot coexist with the `page.tsx` that renders the document. `output: 'export'` also has no rewrites. Serving the file from `public/` is not a workaround for that dead end; it is the only mechanism, and it happens to be the cheapest one available.

## The rule the change establishes

**A document's file sits at its route plus an extension.** One sentence covers the markdown, the PDF, the primary document and every cut — and `documentRoute()` becomes the single place a content URL is shaped.

Today two things stand in the way, and removing them is most of this plan:

1. The markdown is under `public/content/case-studies/`, so its URL is `/content/case-studies/<slug>.md` while the page is `/case-studies/<slug>` — two path spellings for one document, held in two registry fields (`dir` and `routeBase`) that are two strings for one concept.
2. A cut is `<slug>.<variant>.md` but its page is `/<slug>/<variant>` — the file name and the route disagree on shape, so the rule could not hold for cuts.

## Work

### 1. Move the content tree up one level

```
public/case-studies/
  playgram.md
  playgram/
    mini.md
    nano.md
  assets/…            # unchanged in shape, moved with the documents
public/generated/mermaid/…   # was public/content/generated/mermaid/
```

The mermaid renders leave the collection tree entirely rather than sitting inside one, so nothing has to walk past them: today `contentFiles()` carries an explicit `generated/` skip precisely because the pipeline's own output sits where its sources do. Move them out and the skip disappears.

`public/content/` goes away. The old `/content/case-studies/playgram.md` URL breaks — see "Accepted breakage".

### 2. Collapse `dir` and `routeBase` into one field

In `src/shared/content/collections.ts`, a collection is one path segment:

```ts
'case-studies': { base: 'case-studies', label: 'Case studies' }
```

`collectionDir()` is `public/<base>`, the route base is `/<base>`, and `collectionAssetUrl()` prefixes `/<base>/`. `documentRoute()` is unchanged in shape and becomes the only URL shaper; `ContentDocument.rawUrl` stops calling `collectionAssetUrl` and becomes `` `${route}.md` ``, with `pdfUrl` its sibling.

### 3. Drop `server-only` from `collections.ts`

`scripts/lib/content-tree.ts` has to know where the collections live, and it runs under bare Node — where `import 'server-only'` resolves to a module that throws. `collections.ts` is string constants and pure path functions, so it joins the two exceptions the content rule already documents (`content-hash.ts`, `mermaid-renders.ts`) for the same reason: a render script needs it. `documents.ts` keeps `server-only` — it is the module that pulls in `fs`, `gray-matter` and `zod`, and the invariant that matters ("the pipeline never reaches the client") is enforced there.

Relative imports inside `collections.ts` gain their `.ts` extensions so Node's resolver finds them, per the same convention.

### 4. Walk the collection instead of parsing a file name

`documents.ts` currently splits `<slug>[.<variant>].md` with `parseFileName`. Replace it with the directory shape:

- `<slug>.md` at the collection root is a primary document.
- `<slug>/<variant>.md` is that document's cut, accepted when `<variant>` is in `VARIANTS`.

`assets/` needs no exclusion: it holds no `.md`, so the walk finds nothing in it. A slug colliding with `assets` would, though — add a guard that rejects `assets` as a slug rather than leaving it to be discovered.

`loadDocument` and `siblingVariants` follow the same two paths. `parseFileName` is deleted.

### 5. Give the link plugin real relative resolution

`rehype-content-links.ts` today strips a leading `./` and prefixes the collection directory — it cannot resolve `../` at all, which is fine while every document is a sibling and breaks the moment cuts live in a subdirectory. Resolve each relative URL against the *document's own directory* with `path.posix` normalization, which the plugin can do once it is passed the document's path alongside its collection.

This is a simplification, not just a fix: `markdownRoute()` currently re-derives the variant naming convention (find a `.mini`/`.nano` suffix, split the stem) to turn a link into a route. Once file paths and routes have the same shape, a `.md` target's route is that resolved path minus `.md`, and the plugin stops knowing what a variant is.

### 6. Rewrite the documents' cross-links

Six links across the three markdown files:

- `playgram.md` → `./playgram/mini.md`, `./playgram/nano.md`
- `playgram/mini.md` → `../playgram.md`, `./nano.md`, `../assets/…`
- `playgram/nano.md` → `../playgram.md`, `./mini.md`, `../assets/…`

These resolve identically in the repo, on GitHub and in the served copy — the property that put the markdown in `public/` in the first place.

### 7. The PDF pipeline

A new `scripts/render-pdf.ts` behind `pnpm content:pdf`, built to the shape `content:og` already established — committed output, run by hand, a manifest that makes staleness detectable without a browser:

```
pnpm content:pdf            # render what changed, prune what is gone
pnpm content:pdf --check    # report staleness, write nothing
```

- **Rendering.** Boot `next dev` on a free port and poll for it (the `/preview` procedure), then for each document print its route with `chromium --headless --no-pdf-header-footer --print-to-pdf=public/<base>/<route>.pdf`. The browser comes from `scripts/lib/chromium.ts`; as with the other two scripts there is no puppeteer dependency, just Chrome's own CLI. The site already ships a full print stylesheet, so the PDF is the page's existing print rendering rather than a new layout.
- **Staleness.** A PDF's inputs are not just its markdown — the print sheet and the article components shape it too, so a markdown-only hash would let a style change ship behind a stale PDF. The manifest hashes a **source set**: the document, the assets it references, `src/app/styles/{print,prose}.scss`, and `src/pages/case-studies/ui/`. The trade is explicit — a component tweak re-flags every PDF, and the cost of that false positive is one `pnpm content:pdf` run. `--check` hashes files only, so it joins `vet.sh`'s concurrent fan-out beside `content:og --check`.
- **Coverage.** Every document, cuts included, so the header's PDF link works from whichever cut the reader is on.

### 8. A PDF link in the article header

Beside the existing **Markdown** link, both `print-hidden` and both derived from `route`.

### 9. Docs

- `.claude/rules/content.md` — the tree, the `file = route + ext` rule, `collections.ts` joining the bare-Node exceptions, and the PDF trap (a print-affecting style change needs `pnpm content:pdf` re-run and the PDFs committed).
- `CLAUDE.md` — the `public/` row names `content/`; it becomes the collection directories.
- `.claude/rules/content.md` frontmatter `paths:` — `public/content/**` no longer matches anything.

## Decisions taken

- **The sitemap stays page-only.** `.md` and `.pdf` are alternate representations of a listed page, not additional pages.
- **PDFs are committed, not built in CI.** It matches the mermaid renders and the OG cards, keeps the deploy free of a browser render on its critical path, and is what the request assumed. The cost is binary churn in git history whenever a print-affecting style changes; the source-set hash is what keeps that churn honest rather than optional.
- **The CV PDF is out of scope.** `/cv.pdf`, `/en/cv.pdf`, `/ru/cv.pdf` all follow naturally once this mechanism exists, and the CV already has a print button. A separate change, once the pipeline has proven itself on the case study.

## Accepted breakage

`/content/case-studies/playgram.md` and the `og-renders.json`/mermaid paths under `/content/` stop resolving. Static export has no redirects, and an HTML stub cannot stand in for a `.md` URL a browser downloads. The URL has been live for days and was never advertised as stable; leaving a duplicate copy behind to preserve it would undo the single-source property this whole change is for.

## DRY notes

**Genuinely shared, and the point of the change.** URL shaping. Today `dir` and `routeBase` are two spellings of one path, `rawUrl` is built by a second function (`collectionAssetUrl`) that re-states the collection prefix, and `rehype-content-links.ts` re-derives the variant naming convention a third time to map a link to a route. After this change `documentRoute()` shapes every content URL and every file path is that route plus an extension — three duplications collapse into one derivation, which is why the move earns its churn rather than just relocating files.

**Reused, not re-created.** `findChromium()` from `scripts/lib/chromium.ts`; `contentHash()` from `shared/content/content-hash.ts`; the dev-server boot-and-poll from `/preview`; the existing print stylesheet, which is why the PDF needs no layout of its own.

**Extracted.** `render-og.ts` and `render-pdf.ts` share a real skeleton — read manifest, hash sources, render what drifted, prune what no longer has a source, and a `--check` that reports instead of writing. Pull that into `scripts/lib/render-manifest.ts`, parameterized by how an entry hashes and how it renders, and move `render-og.ts` onto it. The extraction stops at the seam: each script keeps its own Chromium invocation, since one prints a `file://` SVG at a fixed canvas and the other prints a served route. This widens the diff into a working script, so it is worth naming as a deliberate call — writing the second manifest by hand would leave two copies of the staleness-and-prune logic, which is exactly the drift the repo's type-overlap gate exists to prevent one level down.

**Deliberately not extracted.** `render-mermaid.ts` also keeps a manifest, but its unit is a fence inside a document rather than a file on disk, and its hash is of extracted text, not of a source set. Forcing it onto the shared skeleton would mean a helper whose "source" is sometimes a path and sometimes a string — a config object per caller, which is the point at which an abstraction costs more than the duplication. Leave it.

## Verification

- `./scripts/vet.sh` — `pnpm build` is the end-to-end check that every route, import and image reference still resolves after the move.
- `pnpm content:mermaid --check` and `pnpm content:og --check` must stay green through the path changes.
- Confirm `next dev` serves `/case-studies/playgram.md` and not a 404 — the static export is verified, but dev resolves public files and dynamic routes through a different path. Production correctness does not depend on this; the developer experience does.
- `/preview` the article header to see the two links side by side, and open a rendered PDF.
