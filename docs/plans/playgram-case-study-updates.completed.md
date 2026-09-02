# Playgram case study: chart plumbing, richer cuts, `micro` → `nano`

Five asks, in the operator's numbering:

1. The units-of-work chart gets a non-transparent background — copying it and pasting into a dark surface currently produces near-invisible text.
2. The chart appears in the mini and nano cuts too, not just the full document.
3. The chart becomes the Open Graph image for all three cuts.
4. The mini and nano cuts get non-prose assets so they stop reading as a wall of text.
5. The `micro` variant is renamed `nano`, so the two cuts' leading letters differ.

Items 1–3 all bear on the same asset (`assets/playgram-commit-cumsum.svg`), item 4 is authoring, and item 5 is a rename that reaches the variant registry, the routes and every cross-link.

---

## 1 — An opaque background on the chart

**Today.** The SVG paints no background. Its text and rules are `#0b0b0b`, swapped to `#ffffff` inside a `@media (prefers-color-scheme: dark)` block. Two failures follow from the transparency:

- **Copy-paste.** Lifted into a dark document, the image resolves the light palette (most paste targets are not `prefers-color-scheme`-aware) and paints `#0b0b0b` text onto the host's dark surface.
- **On the site, already.** The chart is an `<img>`, and an SVG inside `<img>` cannot see the page's `.dark` class — it only sees the OS setting. A reader on OS-light with the site in dark mode gets `#0b0b0b` text on `#000000` today. That is a live bug, not a hypothetical.

**The change.** Add a full-bleed `<rect>` as the SVG's first painted element, filled from the same `prefers-color-scheme` switch the palette already uses:

- light: `#ffffff`
- dark: `#000000`

Those are `globals.css`'s actual `--background` values, so the plate is invisible when the OS and the site agree and reads as a deliberate figure when they disagree — legible either way, which is the whole point.

While in the file, correct the two halo strokes that stand in for the surface and currently miss it: `.dot { stroke: #fcfcfb }` → `#ffffff`, and its dark override `#1a1a19` → `#000000`.

One SVG stays one SVG. A committed light/dark pair — the shape `rehype-mermaid` uses — was considered and rejected: the mermaid pair is _generated_ from one fence, whereas a hand-authored pair would be two 15 KB files free to drift, which is exactly what CLAUDE.md's "derive from the source of truth" forbids. One file with a media query keeps a single source of truth and is self-consistent wherever it lands.

## 2 — The chart in the mini and nano cuts

Add the same `![…](./assets/playgram-commit-cumsum.svg)` reference to both cuts, with the **same alt text** the full document carries, so the asset has one canonical description:

- **mini** — inside `## The timeline, honestly`, above the "single day: 25 April" paragraph the chart is the evidence for.
- **nano** — at **The number I'd put on a slide**, which is that paragraph's nano equivalent.

`rehypeContentLinks` rewrites `./assets/…` per document, and `rehypeImageDimensions` reads the `viewBox`, so both need no code.

## 3 — The chart as the Open Graph image

**Why this is not a one-line frontmatter edit.** `ogImage` already exists in the frontmatter schema and resolves through `documents.ts`, so pointing it at a file is trivial — but **no major Open Graph consumer renders SVG.** X, Facebook, LinkedIn, Slack and iMessage all drop an SVG `og:image` and fall back to nothing. The chart has to be rasterized and the PNG committed, because a static export has no request-time renderer.

**Framing.** Render into a **1200×630** canvas at 2× (a 2400×1260 PNG), the chart fitted to the height and centred with equal side padding in the same surface colour as the plate from item 1. The 1200×630 aspect matters: X's `summary_large_image` crops a taller image to 1.91:1, which on the chart's native 980×640 would cut the title row and the x-axis away. Padding costs ~117 px a side and loses nothing.

**How.** A new hand-run script, `scripts/render-og.ts` (`pnpm content:og`), mirroring `render-mermaid.ts`'s posture — never invoked by `next build`, so CI installs no browser:

1. Read the source SVG, inline it into a throwaway HTML page sized to the canvas, and screenshot it with headless Chromium (`--headless --screenshot --window-size=…`). Chromium's default colour scheme is light, which is the scheme wanted for a social card.
2. Write `public/content/case-studies/assets/playgram-commit-cumsum.og.png`.
3. Record the source SVG's content hash in `public/content/case-studies/assets/og-renders.json`, keyed by output filename.

`findChromium()` already exists in `render-mermaid.ts` and moves to `scripts/lib/chromium.ts` so both scripts share it (see DRY notes).

**Staleness gate.** `pnpm content:og --check` recomputes the source hash and compares it with the manifest, writing nothing and needing no browser — pure file hashing, so it joins `run-parallel.sh`'s concurrent group in `vet.sh` safely. Without it, editing the chart leaves a stale social card that nothing notices. (Byte-comparing a re-render was rejected: PNG encoding is not stable across Chromium versions.)

**Frontmatter.** Set `ogImage: ./assets/playgram-commit-cumsum.og.png` on the full, mini and nano documents.

**Card dimensions.** `constructMetadata` publishes `width`/`height` only for the default avatar, on the reasoning that a custom image's dimensions are unknown. They are knowable: `documents.ts` can read the PNG's IHDR header the way `rehypeImageDimensions` already does. Extract that reader (DRY notes) and have `ogImageUrl` resolution return dimensions alongside the URL, so `constructArticleMetadata` passes them through.

## 4 — Non-prose assets in the mini and nano cuts

Everything below already exists in the full document or in the assets directory; nothing new is authored or captured.

**mini** (2,275 words → roughly one asset per 450 words):

| Where                                                | Asset                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| After the two opening paragraphs                     | the product screen recording (the full doc's `'video'`-titled link)   |
| `## Setting the table`, at "zero upward or sideways" | the FSD import-graph `mermaid` fence                                  |
| `## Learning to run twenty agents`                   | the pinned-sessions screenshot (`<img>` from GitHub user-attachments) |
| `## The timeline, honestly`                          | the chart (item 2) plus a six-row milestone table                     |

The mermaid fence is copied **byte-identically** from the full document, so `mermaidHash` matches and the committed renders under `content/generated/mermaid/` serve it with no re-render.

**nano** (637 words):

| Where                                 | Asset                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------- |
| After the availability line           | the product screen recording                                                |
| At **The job.** / **The result.**     | a five-row stat table condensed from the full document's opening stat block |
| At **The number I'd put on a slide.** | the chart (item 2)                                                          |

Three assets keep nano scannable rather than turning the shortest cut into a gallery.

## 5 — `micro` → `nano`

- `src/shared/content/collections.ts` — `VARIANTS = ['mini', 'nano']`. Reading order still holds (nano is the shorter cut), and `Variant`, the routes, `generateStaticParams`, `siblingVariants` and the sitemap all derive from it.
- `src/pages/case-studies/ui/article-header.tsx` — `CUT_LABELS`: `micro: 'Micro'` → `nano: 'Nano'`.
- `git mv public/content/case-studies/playgram-bubble-to-nextjs-part-1.micro.md …nano.md`.
- The nano document's own `# ` heading: `(micro)` → `(nano)`.
- Cross-links and prose in the full and mini documents: "micro version" → "nano version", `.micro.md` → `.nano.md`. The four incidental `micro`s — "micromanaging", "micropatches" — stay.
- `src/shared/content/plugins/rehype-content-links.ts` — the docstring naming "the full, mini and micro cuts".
- `.claude/rules/content.md` — the `<slug>.micro.md` line in the directory sketch.

**Link rot.** `/case-studies/playgram-bubble-to-nextjs-part-1/micro` is live and will 404. The study published days ago and a static export on GitHub Pages cannot redirect, so the plan **accepts the 404** rather than building a redirect mechanism for one rename. Question 2 offers a stub page instead.

## DRY notes

**Extracted, because a second caller now exists:**

- **`intrinsicDimensions` and its two header readers** move from `src/shared/content/plugins/rehype-image-dimensions.ts` to `src/shared/content/image-dimensions.ts`. The rehype plugin keeps using it; `documents.ts` gains it as the second caller, for the OG card's `width`/`height`. Hand-writing a second PNG header reader is exactly the drift CLAUDE.md's derivation rule is about.
- **`findChromium()`** moves from `scripts/render-mermaid.ts` to `scripts/lib/chromium.ts`, imported by both it and `render-og.ts`. The candidate list (Playwright's managed builds, then the usual system paths) is environment knowledge, and two copies of it would rot separately.
- **The short-sha256 helper** — `mermaidHash` in `src/shared/content/mermaid-hash.ts` — is not mermaid-specific; the OG manifest needs the same digest. It becomes `contentHash` in `src/shared/content/content-hash.ts` (no `server-only`, same as today, because bare Node imports it), and `mermaid-hash.ts` keeps only the mermaid-specific `MERMAID_DIR`, `COLOR_SCHEMES` and `mermaidFileName`. The algorithm is untouched, so no committed render is invalidated.

**Duplicated on purpose:**

- **The chart's alt text**, verbatim in three documents. Markdown has no include mechanism, and each cut is a standalone published artifact that has to read correctly on GitHub. Keeping the wording identical rather than paraphrasing is what makes it one description in three places instead of three descriptions.
- **The FSD mermaid fence**, verbatim in the full and mini documents. Byte-identical is not incidental here but load-bearing: it is what makes the two documents share one committed render pair.
- **The milestone and stat tables**, condensed rather than copied. Every cut is an abridgement of the same material — that overlap is the collection's design, not a DRY defect.

**Not extracted:**

- **A theme-paired-image affordance for authored SVGs.** Item 1's rejected alternative would need one, and it would exist for a single asset while making that asset's source of truth two files instead of one. The media query inside one SVG is both cheaper and more correct.
- **A general SVG→PNG content pipeline.** `render-og.ts` rasterizes the one asset the frontmatter names. Generalizing over a set of one invents requirements; the seam, if a second card ever appears, is the manifest already being keyed by output filename.

## Verification

- `pnpm content:og` then `pnpm content:og --check` — clean, and dirty after touching the SVG.
- `./scripts/vet.sh` — `pnpm build` renders all three cuts and fails on a broken image reference or an unrendered mermaid fence, which covers items 2 and 4 mechanically.
- `/preview` on `/case-studies/playgram-bubble-to-nextjs-part-1` and both cuts, in **both themes and both OS colour schemes** — the OS/site mismatch is the case item 1 exists for and the one a same-scheme screenshot will not show.
- Open the OG PNG directly and confirm nothing is clipped at 1200×630.
- Confirm `/case-studies/playgram-bubble-to-nextjs-part-1/nano` builds and `…/micro` is gone from `out/` and the sitemap.

## Open questions

Each question's recommended option is already in force above, so the plan is implementable as written if none is answered.

1. **The chart's background (item 1).**
   **(a) — recommended.** One SVG, opaque `<rect>` switching on `prefers-color-scheme`. One source of truth; fixes copy-paste and the live on-site mismatch.
   (b) A committed light/dark pair plus a theme-paired-image affordance in the pipeline, mirroring mermaid. More faithful to the site's theme, at the cost of two hand-authored copies of a 15 KB file and a pipeline feature serving one asset.

2. **The dead `/micro` route (item 5).**
   **(a) — recommended.** Accept the 404. Days-old study, no known external links.
   (b) Leave a `micro.md` stub whose rendered page carries a `<meta http-equiv="refresh">` to `/nano`. Preserves the link at the cost of a permanent decoy document in the collection, which would also show up as a cut in the switcher unless special-cased.

3. **The OG staleness gate (item 3).**
   **(a) — recommended.** Ship the hash manifest and wire `content:og --check` into `vet.sh`. Hashing only, so it is free and safe in the concurrent group.
   (b) Hand-run only, with the re-render obligation documented as a trap in `.claude/rules/content.md`. One less file and one less check, and a stale social card that nothing catches.

4. **The OG canvas (item 3).**
   **(a) — recommended.** 1200×630 at 2×, chart fitted to height, side-padded. Nothing is cropped anywhere.
   (b) Native 1200×784. Larger chart, but X crops it to 1.91:1 and takes the title and x-axis with it.
