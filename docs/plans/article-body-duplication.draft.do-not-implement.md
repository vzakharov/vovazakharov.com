> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Ship each article body once — #74

## What the spike established

The spike (a throwaway worktree under `tmp/`, since removed) built `vova` with `ArticleBody` rendering an empty opaque slot, then pasted the real body into the exported HTML:

| `case-studies/playgram.html` | raw      | gzip (-9) | inlined flight |
| ---------------------------- | -------- | --------- | -------------- |
| `main` today                 | 271.4 kB | 68.3 kB   | 160.2 kB       |
| slot in React + body spliced | 132.1 kB | 35.8 kB   | 20.9 kB        |

So the body is ~87% of the flight payload, and removing it **halves what the page transfers**. Checked in Chromium on the production build:

- **Hydration leaves the spliced body alone.** A `<div dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning />` is opaque to React: it compares the prop to the prop and never reconciles the DOM children, so the 57,359 characters of body text were still there after hydration and after a theme toggle re-rendered the tree. No hydration error logged.
- **Client-side navigation into the article renders an empty body** — the `.txt` flight the router fetches carries the empty slot, and there is no server HTML to adopt. So every link _into_ an article has to be an ordinary page load.
- **Brotli is out.** The live page, asked with `Accept-Encoding: br, gzip`, comes back `content-encoding: gzip`. GitHub Pages' CDN is not configurable from here.
- **Next 16.0.3 has no switch** for dropping or deferring the inlined flight under a static export (`config-schema` carries only `inlineCss`).

The issue's third direction, fetching the body behind a boundary, loses the body for no-JS readers, crawlers and the PDF pipeline, so it is not pursued.

## Approach

Three pieces, which only make sense landing together — without the links, a reader arriving from the collection index sees an empty article.

1. **The built page renders an empty slot where the body goes.** `ArticleBody` (`src/pages/documents/ui/article-body.tsx`) renders the slot when `process.env.NODE_ENV === 'production'`, and the full tree otherwise. The dev server keeps the body inline because `/preview` and `scripts/render-pdf.ts` both read pages from it, and neither has a build step behind it to splice from. The slot carries `data-article-body` naming the document route, so the splice can find the right one and refuse a page whose slot names another document.
2. **A post-build step splices each body into its page.** `scripts/splice-article-bodies.ts`, run under `tsx` like `render-og.ts`, walks `listDocuments` for every collection the site serves, renders the same `ArticleBody` tree to static markup with `react-dom/server`, and writes it into `out/<route>.html`. It **fails** on a page with no slot, a slot for another route, or a slot left empty once it has finished — a silent miss here is a blank article in production. It is wired into each `build:<site>` entry in `package.json` after `next build`, so `vet.sh`'s builds and `deploy.yml`'s both run it and neither needs editing.
3. **Links into articles are ordinary page loads.** `InternalLink` (`src/shared/ui/internal-link.tsx`) renders a plain `Anchor` instead of `next/link` when the href is a document route of the current site. That makes every caller correct at once — `document-cards`, the CV's `case-study-link`, the variant chips in `ArticleHeader` (through `ChipNav`) — and so does any caller added later. The predicate lives in `src/shared/content/collections.ts`, beside `collectionRoute`, which touches no `fs` and so is safe behind a client boundary. The Bible is rooted at `/`, so there every path except the home page is an article. Links written inside markdown are already plain `<a>`.

### Accepted costs

- **It depends on React not patching `dangerouslySetInnerHTML` during hydration.** That is stable, long-standing behaviour, not a documented guarantee, and a React upgrade that changed it would blank every article **at runtime** — no build, type or lint check sees it. The mitigation is one QA row per React bump, which goes into the PR's checklist and `.claude/rules/content.md`: open a built article in `/preview` and check the body survives hydration.
- **The two render paths drift apart.** Dev renders the body through Next, the export renders it through the splice script. Both call one `ArticleBody` tree builder, so they cannot drift in _what_ they render — only in the React context around it, which the body does not read. The `ContentVideo` component is the only non-intrinsic element, and it reads no context.
- **Article pages lose client-side navigation and prefetch**, both into them and between an article's variants. A full page load of a 36 kB document is what a reader gets anyway on arriving from a search engine or LinkedIn, which is most of them.

## Steps

- [ ] Add the document-route predicate to `src/shared/content/collections.ts`, with a `collections.test.ts` beside it covering a case-study route, a variant route, the collection index (not an article), and the Bible's rooted shape.
- [ ] Switch `InternalLink` to a plain anchor for document routes.
- [ ] Split `ArticleBody` into the tree builder and the component; render the slot under `production`.
- [ ] Write `scripts/splice-article-bodies.ts` and its test in the `type-overlap-check.test.ts` pattern — a throwaway `out/` with one slotted page, asserting the splice and each refusal.
- [ ] Wire it into `build:vova`, `build:lsa` and `build:bible`. `lsa` serves no collection today, so for it the step is a no-op.
- [ ] Re-measure `playgram.html`, and a Bible article, against the table above.
- [ ] `/preview` a built article and the collection index: the body is present after hydration, the theme toggle keeps it, and clicking through from the index loads the whole page.
- [ ] Document the slot, the splice and the React-upgrade QA row in `.claude/rules/content.md`, and add the step to CLAUDE.md § "Vetting"'s account of what `pnpm build` runs.

## DRY notes

- **Shared:** the hast → JSX conversion (`toJsxRuntime` with `CONTENT_COMPONENTS`) becomes one function both the dev render and the splice call; that single home is what keeps the two paths from drifting. The splice reuses `listDocuments`, `loadDocument` and `renderDocument` from `src/shared/content`, and the route shaper `collectionPath`, rather than rebuilding any of them.
- **The link predicate reuses `collectionRoute`** rather than re-spelling each collection's prefix, so a new collection is covered by adding it to `COLLECTIONS`.
- **Not extracted:** the HTML-slot search in the splice script is its own ~20 lines, not a general HTML post-processing helper. It has one caller and one element to find, and a helper built to generalise it would be designing for a second post-build step that does not exist.

## Open question

1. **Do the saving and the React-behaviour dependence justify the change at all?** Recommended: **yes**, as written above. It halves the transfer of every article page, the pages this site exists to serve, and the failure mode is loud to anyone who opens an article after a React bump. The alternative is to close #74 as "App Router does this, live with it" with the table above as the record. That is defensible too: the flight scripts sit _after_ the visible markup, so they cost bytes and parse time rather than time-to-first-paint of the body.
