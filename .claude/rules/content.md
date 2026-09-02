---
description: How long-form markdown under public/content/ becomes a page — the build-time pipeline, the frontmatter contract, and the traps that fail the build
paths:
  - public/content/**
  - src/shared/content/**
  - src/pages/case-studies/**
  - app/case-studies/**
  - scripts/render-mermaid.ts
---

# Content

Long-form writing lives as markdown under `public/content/`, and `next build` compiles it to HTML once per deploy.

```
public/content/
  case-studies/
    <slug>.md                 # the full document
    <slug>.mini.md            # optional shorter cuts
    <slug>.nano.md
    assets/                   # images, data, video
  generated/
    mermaid/<hash>.light.svg  # committed, produced by `pnpm content:mermaid`
    mermaid/<hash>.dark.svg
```

**The markdown is itself a published artifact**, which is why it sits in `public/` rather than beside it. One copy of every file, served raw at `/content/…`, no build step to forget and no generated tree to drift from the source. Relative links inside a document (`./assets/…`, `./<slug>.mini.md`) resolve the same way in the repo, on GitHub, and in the served copy.

**Everything in `shared/content/` is build-time-only, and must stay that way.** There is no server at runtime, so the whole pipeline — `unified`, `remark`, `rehype`, `shiki`, `gray-matter`, `zod` — resolves into the build graph and is thrown away with it. A content page therefore costs **zero bytes of client JavaScript** beyond the site's existing baseline, which is the property the whole design exists for. Every module starts with `import 'server-only'` so that is enforced rather than hoped for: importing one from a `'use client'` component fails the build. When a client component needs something the registry owns — a route, say — the **server page resolves it and passes it down**; that is what `app/[locale]/cv/page.tsx` does for the CV's case-study link.

The one exception is `shared/content/mermaid-hash.ts`, which `scripts/render-mermaid.ts` runs under bare Node, outside any bundler — hence no `server-only`, and an explicit `.ts` on the import so Node's resolver finds it. That script needs Node 22.18 or newer for type stripping.

## Adding a document

1. Write `public/content/<collection>/<slug>.md` with frontmatter:

   ```yaml
   ---
   description: ... # meta description and index-card blurb
   date: 2026-08-29 # published date, ISO
   part: I of II # optional free-text series marker
   ogImage: ... # optional, relative to the document
   ---
   ```

   **There is no `title` field** — the title is the document's leading `# ` heading, which the pipeline lifts out of the body and into the page header. Word count, reading time and the heading outline are derived the same way. Anything derivable is never restated in frontmatter.

2. That's it. `generateStaticParams` and the sitemap both read the collection registry, so the page, its variants and their sitemap entries follow with no route work. A new collection is one entry in `shared/content/collections.ts`.

## Traps worth knowing

- **A `mermaid` fence needs a committed render, and an `accDescr`.** `pnpm content:mermaid` renders each fence to a light and a dark SVG named by a hash of the fence text, and prunes renders nothing refers to any more; `--check` reports staleness without writing. Run it by hand when a diagram changes and commit the SVGs — `next build` never invokes it, so CI stays free of puppeteer, and instead **fails loudly** on a fence whose render is missing. The `accDescr` block becomes the diagram's `alt`, followed by the URL of the markdown it was drawn from: an `<img>` hides the SVG's own description, so `alt` is the only place a reader who cannot see the image — an agent reading the HTML included — learns what the diagram says and where its source is.
- **A video link needs an extension or a `video` title.** A paragraph holding nothing but a link to a video becomes a player. Detection is by file extension; for a URL that has none, mark it explicitly: `[label](url 'video')`.
- **A broken image reference fails the build.** Dimensions are read out of the file's own header, so a `src` that resolves to nothing throws rather than shipping.
- **Raw HTML in a document passes through unsanitized.** First-party content only — reviewed in the same PR as the code. Nothing on this site is user-submitted; if that ever changes, this is the line that has to change with it.

## The locale seam

Content pages are unlocalized, alongside `/` rather than under `[locale]`: the documents are English-only, and a `ru` route for a document that does not exist in Russian would only duplicate the English one. The seam for later is a `<slug>.<locale>.md` filename convention — noted here, deliberately not built.
