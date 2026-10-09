# A document's links point at the site serving it

## The problem

`rehypeContentLinks` writes every in-document `<a href>` as `https://vovazakharov.com/…` (`getAbsoluteUrl`), because a printed PDF carries its links out of the browser and a site-root path there would mean `localhost`. The page and the paper share one anchor, so the page pays: on `pnpm dev`, `/preview` and any local export, every in-document link leaves for production. On a song page it is pure cost — `music` is `printable: false`, so those links are absolute for a PDF that does not exist.

The cost compounds downstream. `rehypeMediaEmbeds` turns a video link into the player's `src`, so on `main` today a video embedded from a link plays from production — nowhere, before the deploy that publishes it. Branch `claude/krylya-album-2z13o2` patches that symptom (ca8663b) with `siteRootPath`, which strips back off the prefix `getAbsoluteUrl` added two plugins earlier. That is the hack the operator is objecting to: every future consumer of a document link would need the same undo.

## The fix: one anchor per medium, as every other page already does

The site already solved this once. `TextLink` (`src/shared/ui/text-link.tsx`) links another page of the site **once per medium**: a site-root `next/link` anchor for the screen, marked `print-hidden`, and beside it a print-only anchor whose href comes from `printedUrl` — absolute, because that is paper's address. The lyrics' notes already render their markdown `<a>` through it (`src/pages/music/ui/lyrics.tsx:36`).

Documents are the one place that skipped this and made the screen pay for the paper instead. So:

1. **`rehypeContentLinks` resolves a relative link to its site-root path** and stops calling `getAbsoluteUrl`. Links and sources resolve the same way; the `tagName === 'a'` branch and the comment justifying it go. Whether it keeps setting `target`/`rel` on off-site links depends on step 2 — `TextLink` already applies `NEW_TAB` from `isOffSite`, so the plugin's marking becomes a second copy of the same rule and is dropped (the hast has no other renderer — `ProseContent` is its one consumer).
2. **`ProseContent` maps `a` to a `ContentLink`** in `CONTENT_COMPONENTS`, beside `video: ContentVideo` — a thin adapter from hast props to `TextLink` (`href`, children, and the attributes an author may write on a raw `<a>`: `id`, `className`, `title`, `download`). Paper gets the absolute href from `printedUrl`, exactly as on every other page.
3. **`rehypeMediaEmbeds` needs no change**: the href it reads is site-root now, so the player's `src` is too. `siteRootPath` never lands on `main`.
4. **Print-only notes stay as they are.** `printedUrl` remains the one place a site-root path becomes an absolute one, and it is only ever reached from paper: `TextLink`'s printed half, `ContentVideo`'s "See video at …" note, `PrintedFrom`, the CV sheet's footer. Each sits in a `print-only`/`.printed` container, so on screen none of them is visible, and in a PDF printed from any origin — dev, `--origin`, `--from-out` — each carries the production address. No step of `scripts/render-pdf.ts` changes.
5. **`.claude/rules/content.md`** — the rule "A document's own links are absolute; its media sources are not" becomes one stating the current contract: a document's links and sources are site-root; paper gets the absolute form from `printedUrl`, through `TextLink`. Shorter than today's, since the link/source asymmetry it argued for is gone.

Out of scope, and correct as they are: `getAbsoluteUrl` in metadata, sitemap and feeds (those leave the site by definition), and the mermaid `alt`'s source URL (text, not a link).

### Things to verify while building

- **Links to files rather than pages.** A document may link a `.pdf`, `.md` or an image. `TextLink`'s screen half is `next/link`, which in a production export prefetches a route payload and attempts a client-side navigation. Check what a `next/link` to `/case-studies/x.pdf` does in the export (`pnpm build` + the export server); if it misbehaves, `TextLink` takes a plain `<a>` for a target with a file extension — a fix that belongs in `TextLink`, since any page can link a file.
- **Heading anchors.** `rehypeAutolinkHeadings` wraps each heading in `<a href="#slug">`. `printedUrl('#slug')` returns the href unchanged, so `TextLink` renders one `Anchor` — but it is a Mantine `Anchor`, so `prose.scss`'s `h* > a` rules must still win. `/preview` an article with headings in both themes, and print one.
- **A link with several text nodes** (`[**bold** rest](x)`): `TextLink` notes a PDF gets one link annotation per node. Today's absolute anchors have the same property, so this is not a regression; confirm with one printed PDF that the annotations land.
- **Vet**: `./scripts/vet.sh` — the PDF render's `PRINT_SOURCES` already cover `src/shared/ui` and `src/shared/content`, so every PDF re-renders in CI on merge, as intended.

### Reconciling with `claude/krylya-album-2z13o2`

That branch adds `siteRootPath` to `resolved-site.ts` and calls it in `rehype-media-embeds.ts` (ca8663b). Whichever branch lands second reverts ca8663b: with site-root links the call is the identity on every input, and `siteRootPath` has no other caller. If this lands first, the album branch's `/sync-branch` drops it in the merge; if the album lands first, this branch removes both in its own diff.

## DRY notes

- **Reused:** `TextLink` for the per-medium split, `printedUrl` for paper's address, `isOffSite` (through `TextLink`) for the new-tab rule. The `ContentVideo` precedent for mapping a hast tag to a component in `CONTENT_COMPONENTS`.
- **Removed duplication:** the off-site `target`/`rel` marking in `rehypeContentLinks` duplicates `TextLink`'s `NEW_TAB`; one copy remains.
- **Not extracted:** `ContentLink` is a few lines of prop adaptation, local to `entities/document/ui`. The lyrics' `a:` mapping does the same for a different, narrower prop set (react-markdown's, not hast-util-to-jsx-runtime's); sharing it would mean an adapter generic over two markdown renderers' prop shapes for two lines saved.

### Rejected alternatives

- **Rewriting links at print time** (the export server or a CDP pass swaps `localhost:<port>` for the production origin): only the `--from-out` shape would get it, so a PDF printed from a dev server would still link to `localhost`; it rewrites HTML with a pattern; and `printedUrl` would still be needed for the visible text, leaving two mechanisms for one fact.
- **Emitting both anchors in the hast** (`rehypeContentLinks` writes a `print-hidden` and a `.printed` anchor itself): a second implementation of what `TextLink` already does, in a different dialect, free to drift from it.
