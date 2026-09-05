---
description: How long-form markdown under public/<collection>/ becomes a page — the build-time pipeline, the file-is-route-plus-extension rule, the frontmatter contract, and the traps that fail the build
paths:
  - public/case-studies/**
  - public/generated/**
  - src/shared/content/**
  - src/pages/case-studies/**
  - app/case-studies/**
  - scripts/render-mermaid.ts
  - scripts/render-og.ts
  - scripts/render-pdf.ts
  - scripts/lib/render-manifest.ts
---

# Content

Long-form writing lives as markdown under `public/<collection>/`, and `next build` compiles it to HTML once per deploy.

```
public/case-studies/          # one directory per collection, named by its route
  <slug>.md                   # the full document
  <slug>.mini.md              # optional shorter cuts
  <slug>.nano.md
  <slug>[.<variant>].pdf      # committed, produced by `pnpm content:pdf`
  pdf-renders.json            # each PDF's source-set hash
  assets/                     # images, data, video
    <name>.og.png             # committed, produced by `pnpm content:og`
    og-renders.json           # each card's source hash
public/generated/
  mermaid/<hash>.light.svg    # committed, produced by `pnpm content:mermaid`
  mermaid/<hash>.dark.svg
```

**A document's file sits at its route plus an extension.** The page at `/case-studies/playgram` is `public/case-studies/playgram.md` served raw, and `.pdf` beside it; a cut is a dotted suffix on the slug — `/case-studies/playgram.mini`, `playgram.mini.md`, `playgram.mini.pdf` — rather than a nested segment, so the route matches the name the file was authored as. One sentence covers the markdown, the PDF, the full document and every cut, and `documentRoute()` in `collections.ts` is the single place that shapes any of it.

The rule works because nothing in a static export occupies those URLs: `out/case-studies/playgram.html` is what the route emits, and `public/` is copied into `out/` verbatim. There is no route to write and no rewrite to configure — `output: 'export'` has neither, and a `route.ts` could not coexist with the `page.tsx` on the same dynamic segment anyway. A file in `public/` is not a workaround for that dead end; it is the whole mechanism.

**The markdown is itself a published artifact**, which is why it sits in `public/` rather than beside it. One copy of every file, no build step to forget and no generated tree to drift from the source. Relative links inside a document (`./assets/…`, `./<slug>.mini.md`) resolve the same way in the repo, on GitHub, and in the served copy — a sibling `.md` link becomes that document's route by dropping the extension, which is the rule again.

The header offers both files. The markdown link carries a `download` naming the document's dot-joined path under `SITE_CONFIG.downloadPrefix` — `vova.case-studies.playgram.mini.md` — so a saved copy says what it is and whose it is; the attribute's name is an arbitrary string, which is what lets it be self-describing without the URL paying for it. The PDF link carries none: `download` would replace the browser's inline viewer with a forced save, and the PDF states its origin in its own footer.

**Everything in `shared/content/` is build-time-only, and must stay that way.** There is no server at runtime, so the whole pipeline — `unified`, `remark`, `rehype`, `shiki`, `gray-matter`, `zod` — resolves into the build graph and is thrown away with it. A content page therefore costs **zero bytes of client JavaScript** beyond the site's existing baseline, which is the property the whole design exists for. Every module starts with `import 'server-only'` so that is enforced rather than hoped for: importing one from a `'use client'` component fails the build. When a client component needs something the registry owns — a route, say — the **server page resolves it and passes it down**; that is what `app/[locale]/cv/page.tsx` does for the CV's case-study link.

The exceptions are `shared/content/content-hash.ts`, `mermaid-renders.ts` and `collections.ts`, which the render scripts run under bare Node, outside any bundler — hence no `server-only`, and an explicit `.ts` on the import so Node's resolver finds it. Those scripts need Node 22.18 or newer for type stripping. `collections.ts` qualifies because it is string constants and pure path functions; `documents.ts` keeps `server-only`, and with it the invariant that matters — it is the module that pulls in `fs`, `gray-matter` and `zod`.

## Adding a document

1. Write `public/<collection>/<slug>.md` with frontmatter:

   ```yaml
   ---
   description: ... # meta description and index-card blurb
   date: 2026-08-29 # published date, ISO
   part: I of II # optional free-text series marker
   ogImage: ... # optional, relative to the document
   ---
   ```

   **`ogImage` names a PNG, never the SVG it came from** — see the traps below.

   **There is no `title` field** — the title is the document's leading `# ` heading, which the pipeline lifts out of the body and into the page header. Word count, reading time and the heading outline are derived the same way. Anything derivable is never restated in frontmatter.

2. That's it. `generateStaticParams` and the sitemap both read the collection registry, so the page, its variants and their sitemap entries follow with no route work. A new collection is one entry in `shared/content/collections.ts`.

## Traps worth knowing

- **A document's route reserves `.html` and `.txt`, and takes them without a word.** Those are the page and the RSC payload Next emits beside it, and a file in `public/` that collides with either is silently overwritten by the route's output — `next build` exits 0 and reports nothing. Every other extension is free, which is what makes `.md` and `.pdf` safe and leaves room for a third.
- **A print-affecting change needs `pnpm content:pdf` re-run and the PDFs committed.** A PDF's sources are more than its markdown: the print stylesheet and the article components shape it too, so the manifest hashes all of them as one source set and a tweak to any of it re-flags every PDF. `--check` — wired into `vet.sh` — is what catches the omission; the cost of the false positives is one run.
- **A `mermaid` fence needs a committed render, and an `accDescr`.** `pnpm content:mermaid` renders each fence to a light and a dark SVG named by a hash of the fence text, and prunes renders nothing refers to any more; `--check` reports staleness without writing. Run it by hand when a diagram changes and commit the SVGs — `next build` never invokes it, so CI stays free of puppeteer, and instead **fails loudly** on a fence whose render is missing. The `accDescr` block becomes the diagram's `alt`, followed by the URL of the markdown it was drawn from: an `<img>` hides the SVG's own description, so `alt` is the only place a reader who cannot see the image — an agent reading the HTML included — learns what the diagram says and where its source is.
- **An Open Graph card is a PNG rendered from an SVG, and both are committed.** No major consumer renders an SVG `og:image` — X, Facebook, LinkedIn, Slack and iMessage all drop it and fall back to nothing. So `ogImage` names `./assets/<name>.og.png`, `pnpm content:og` rasterizes it from `./assets/<name>.svg`, and `--check` — wired into `vet.sh` — fails when a source's hash no longer matches `og-renders.json`. Run it by hand after editing a card's SVG and commit the PNG with it. The card's dimensions are read from the PNG and published alongside the URL, which several consumers need to render it at all.
- **Angle brackets are markup inside an SVG's `<style>`.** An SVG document is parsed as XML, where a CSS comment mentioning a tag name makes the file not well-formed — and a malformed SVG behind an `<img>` fails silently, showing nothing. Nothing in the build catches it.
- **A video link needs an extension or a `video` title.** A paragraph holding nothing but a link to a video becomes a player. Detection is by file extension; for a URL that has none, mark it explicitly: `[label](url 'video')`.
- **A broken image reference fails the build.** Dimensions are read out of the file's own header, so a `src` that resolves to nothing throws rather than shipping.
- **Raw HTML in a document passes through unsanitized.** First-party content only — reviewed in the same PR as the code. Nothing on this site is user-submitted; if that ever changes, this is the line that has to change with it.

## The locale seam

Content pages are unlocalized, alongside `/` rather than under `[locale]`: the documents are English-only, and a `ru` route for a document that does not exist in Russian would only duplicate the English one. The seam for later is a `<slug>.<locale>.md` filename convention — noted here, deliberately not built.

**That seam collides with the cut's route form.** A cut is `<slug>.<variant>` in both the file name and the route, so `<slug>.<locale>` is a second meaning for the same dotted suffix, and a locale sharing a name with a variant is unresolvable. Whoever builds the localized route decides how the two coexist — an order (`<slug>.<variant>.<locale>`), a separate namespace, or a locale segment after all. Only the collision is settled here.
