# Render an article as a hast tree, not an HTML string

## Why

`ArticleBody` injects the pipeline's output with `dangerouslySetInnerHTML`, so
every customization the content pipeline can express is "emit this markup". A
string cannot hold a React element, which puts a hard ceiling on the content
pipeline: **no part of an article can ever be a client island.** A copy button
on a code fence, a lightbox on an image, a video player with its own poster
logic, a zoomable diagram — each needs a component in the tree, and no amount of
rehype gets one there.

The pipeline already produces a hast tree and then throws it away by
stringifying it. Handing that tree to React instead removes the ceiling, and it
is the same final step `react-markdown` performs internally
(`hast-util-to-jsx-runtime`), minus the second parse `react-markdown` would need
because it takes a markdown string rather than a tree.

## What was measured before writing this

Numbers from the current `main` build, so the trade is argued from the artifact
rather than from intuition:

| | raw | gzip |
| --- | --- | --- |
| `out/case-studies/playgram.html` | 251.9 kB | 69.7 kB |
| …of which inlined RSC flight | 142.8 kB (57%) | — |
| article body as an HTML string | 87.2 kB | 27.5 kB |
| the same body as a flight element tree | 115.7 kB (+33%) | 28.7 kB (+4.5%) |

**GitHub Pages serves gzip and not brotli** — `curl -H 'Accept-Encoding: br'`
against the live page returns the file uncompressed, with no `content-encoding`.
That matters because gzip's 32 kB window cannot reach back to the first copy of
the body, so it compresses the flight duplicate from scratch; brotli would have
deduplicated it.

Two conclusions the plan rests on:

- **The switch costs about 1.2 kB gzip on the largest article** (+4.5% on the
  body's share). An earlier worry that the element tree would inflate the payload
  is real only in raw bytes and close to noise on the wire.
- **The 57% duplication is not this change's doing and this change does not fix
  it** — see "Deliberately out of scope".

## Approach

Keep the pipeline exactly as it is up to its last step. Replace
`rehypeStringify` with returning the tree, and render that tree with
`hast-util-to-jsx-runtime` under a component map.

### 1. `src/shared/content/render.ts`

- Drop `rehypeStringify` and the `allowDangerousHtml` option that goes with it.
  Everything before it — `remarkRehype`, `rehypeRaw`, the six project plugins,
  `rehypeShiki` — is unchanged, in the same order, for the same reasons.
- Replace `WithHtml` with `WithContentTree = { tree: HastRoot }` and its
  docstring: the contract stops being "safe to inject raw" and becomes "already
  through `rehype-raw`, so it holds no `raw` nodes".
- `renderDocument`'s memoization is unchanged; the cache now holds trees.

### 2. `src/pages/documents/ui/article-body.tsx`

```tsx
toJsxRuntime(tree, { Fragment, jsx, jsxs, components: CONTENT_COMPONENTS });
```

The `eslint-disable` for `dom-no-dangerously-set-innerhtml` and the paragraph
justifying it both go away — a suppression removed rather than relocated.

### 3. One plugin converted, to prove the door is open

`rehype-media-embeds.ts` builds a `<video>`, its `<source>`, and the print-only
"see video at …" note by hand, in 139 lines. It becomes: emit a marker element
carrying the URL and label as properties; a `ContentVideo` component in
`src/pages/documents/ui/` renders it.

One conversion, not all six. It is what turns "we could now put components in
the content" from a claim into a tested path, and it is the plugin with the most
hand-built markup. `rehype-mermaid`, `rehype-image-layout`,
`rehype-table-scroll` and `rehype-content-links` keep emitting plain elements —
converting them buys nothing today and each one is a separate small change
whenever it does.

The marker tag name is a constant exported from `shared/content`, so the plugin
and the component map agree by import rather than by matching strings. It also
means the tree is no longer valid HTML on its own, which is safe precisely
because nothing stringifies it any more.

### 4. Styling stays where it is

`prose.scss` keys off `.content-video`, `.content-mermaid`,
`.content-image-aside` and `.content-table-scroll`, and half those rules are
`@media print`. `ContentVideo` emits the same class names, so the stylesheet is
untouched and screen and print keep one home. Moving content styles into CSS
modules is a separate question, and not one this change has to answer.

### 5. Re-render the PDFs

`DOCUMENT_SOURCES` in `scripts/render-pdf.ts` names `src/pages/documents/ui`,
`src/shared/content` and `prose.scss` — this change touches the first two, so
**every document PDF on both sites is re-flagged**. Run `pnpm content:pdf:vova`
and `pnpm content:pdf:lsa`, commit the PDFs, and confirm the video note still
prints (it is the one piece of print markup moving into a component).

### 6. Prose that has to move with the change

- `.claude/rules/content.md` — the "Raw HTML in a document passes through
  unsanitized" trap stays true and stays where it is; the sentence about the
  pipeline's output being injected raw is what changes.
- `CLAUDE.md` needs nothing.

### 7. The merge needs a hand-run deploy

Nothing a reader sees changes, so the squash subject is `refactor:` — and the
workflow's `gate` job only builds on `feat:`/`fix:`. The built output does move
(the flight payload, and every document PDF), so this is CLAUDE.md § "Deployment"'s
named case: run the workflow from the Actions tab after the merge, with the site
picker left on both.

## Risks

- **Shiki's `style` attribute.** `rehypeShiki` emits `--shiki-light`/`--shiki-dark`
  custom properties in a `style` string; `hast-util-to-jsx-runtime` parses that
  string into React's style object. Custom properties survive that in
  `react-markdown`'s own use of the same util, so the risk is low — and the first
  `pnpm build` settles it either way.
- **Leftover `raw` nodes.** `toJsxRuntime` throws on a `raw` node. `rehypeRaw`
  already converts them, so this is an assertion to confirm on a document that
  authors HTML, not an expected failure.
- **Payload.** Budgeted above at ~1.2 kB gzip on the largest article. Verify
  against the real build rather than the estimate: compare `out/**/*.html` and
  `out/**/*.txt` totals before and after.

## Deliberately out of scope

**The 57% flight duplication.** Every article page ships its body twice inside
one file — once as markup, once as the inlined RSC payload — and with gzip only,
that second copy costs **+36 kB of the 69.7 kB** `playgram.html` transfers. It is
App Router's doing, not `dangerouslySetInnerHTML`'s: the duplicate exists so
client navigation and hydration work, and it survives this change with a tree in
it instead of a string. Worth its own issue; not worth widening this PR.

## DRY notes

- **Reused, not rebuilt:** the whole unified pipeline, its plugin order, the
  heading/word-count collectors, and `renderDocument`'s memoization are untouched.
  This change edits the last step and one consumer.
- **`hast-util-to-jsx-runtime` rather than `react-markdown`:** the former is
  exactly what the latter calls on the tree. Taking the wrapper would mean
  re-parsing the document a second time and maintaining a second plugin chain
  whose `rehype-slug` output must match the first's, or the table of contents
  links at ids the body does not have — a break with no failing check behind it.
- **The marker tag name is one exported constant,** not a string spelled in the
  plugin and again in the component map.
- **No shared abstraction over the six plugins.** Only `rehype-media-embeds`
  converts here; a "plugin emits a marker, map renders a component" helper over
  one call site would be an abstraction with a single implementation, and the
  right time to extract it is the second conversion.
- **`ContentVideo` lives in `pages/documents/ui/`, not `shared/content`,** because
  `shared/content` is `server-only` by construction and a client island could
  never live there. The component map is page composition; the marker names are
  the pipeline's.

## Open questions

Each is written with its recommendation already in force above, so the plan is
implementable as written if none is answered.

1. **How far in one PR?**
   a. Swap only — tree instead of string, component map present but empty.
   b. **(recommended)** Swap plus the `rehype-media-embeds` conversion, as
   written above.
   c. Swap plus a real client island (copy button on code fences) to exercise the
   whole path.

   (b) proves the mechanism without inventing a feature nobody asked for; (c) is
   a feature, and belongs in its own PR once the door is open.

2. **Should the PDFs be re-rendered in this PR or in a follow-up?**
   a. **(recommended)** In this PR — the vet run's `--check` fails otherwise, and
   a branch that cannot pass vet is not reviewable.
   b. Follow-up, accepting a red vet in between.

3. **File an issue for the flight duplication?**
   a. **(recommended)** Yes — 36 kB gzip per article page is worth a number in the
   tracker even if the answer turns out to be "App Router does this, live with it".
   b. No; leave it in this plan's history.
