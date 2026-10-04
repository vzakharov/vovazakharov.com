> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# The CV as pre-rendered markdown

Move the CV's copy out of the message catalogues and into markdown under `apps/vova/public/cv/`, compiled by `shared/content`'s build-time pipeline the way the case studies and the Bible are — so the CV is authored as prose, served raw at its own route plus `.md`, and still looks exactly like the CV it looks like today.

## Why

Three properties the content collections have and the CV does not:

- **Authored as prose.** The CV's copy is a 277-line slice of `src/shared/i18n/messages/{en,ru}.json`, where a paragraph is a JSON string and a bullet is `{"label": …, "text": …}`. Editing it means editing a data structure; the pipeline's documents are edited as writing.
- **Servable as itself.** Every document offers `.md` beside `.pdf`, and the reader who wants the plain text — a person, a recruiter's parser, an LLM reading the site — gets the authored file. The CV offers only the PDF.
- **One mechanism, not two.** The CV today is a second content system: its own copy store, its own renderer, its own OG-card extractor reading the catalogue. The pipeline already does all of that for documents.

What does **not** change: the page's look, its print rules, its addresses (`/cv`, `/cv/<variant>`, `/cv/<variant>/<locale>`), its variants, its locales, its PDFs and its social cards.

## Shape

### Files

Four documents, at the path the CV's PDFs already use:

```
apps/vova/public/cv/
  cto/en.md   cto/ru.md   cto/en.pdf   cto/ru.pdf   cto/pdf-renders.json
  dev/en.md   dev/ru.md   dev/en.pdf   dev/ru.pdf   dev/pdf-renders.json
  cto.og.png  dev.og.png  og-renders.json
```

The file is at its route plus an extension, exactly as `.claude/rules/content.md` states the rule — `/cv/cto/en` is `cv/cto/en.md` and `cv/cto/en.pdf`. The CV separates variant from locale by **directory**, not by the dotted suffix a document's cut uses, so it does not touch the `<slug>.<variant>` / `<slug>.<locale>` collision that rule parks as unsettled; the parked seam stays parked, and the CV is not a precedent for resolving it.

### What the markdown carries

The whole sheet below the header, as ordinary markdown:

```markdown
---
description: Fractional, hands-on CTO for AI-native delivery…
ogSuffix: The platform outlived my involvement…
tagline: Fractional, hands-on CTO for AI-native delivery
---

# Vova Zakharov

## Profile

Developer with a physics-and-math brain…

## What I Offer

### Engagements

- **Fractional CTO:** for teams that need…

## Experience

:::entries

### Fractional CTO

#### Playgram (March – August 2026)

[Read the case study](/case-studies/playgram)

Rebuilt a live, feature-rich AI chat product…

- **Led** the rebuild…

`Next.js 16, Railway + Supabase, feature-sliced design`

_Demo available on request._

:::
```

Every distinction the components draw today has a markdown spelling:

| Today                                              | In markdown                            |
| -------------------------------------------------- | -------------------------------------- |
| `CvSection` title                                  | `##`                                   |
| `CvSubsection` / experience entry title            | `###`                                  |
| experience `period`                                | `####`                                 |
| `{label, text}` bullet → `**label:** text`         | `- **Engagements:** for teams…`        |
| `{lead, text}` bullet → `**lead** text`            | `- **Led** the rebuild…`               |
| `TECH_STACKS[entry]`, monospace                    | an inline-code-only paragraph          |
| `demo` note, italic                                | an emphasis-only paragraph             |
| `caseStudies.<key>.link` + resolved route          | an ordinary link                       |
| `OFFER_BLOCKS[variant]` — which blocks, what order | the blocks each file actually contains |

One new directive, `:::entries`, marks the single section whose cards are per-`###` rather than one card for the whole section. Every other section is one card, which is the default; `remark-content-directives.ts` already throws on an unknown directive, so the name is registered there beside `pull-quote`.

### What stays React

The page's furniture, unchanged: the header (name, tagline, email, site link), the print-hidden toolbar (locale chips, `.pdf` link), the screen footer with the other-variant link, and the print footer. These are chrome, not copy — the same split the documents pages make between `ArticleHeader`/`PrintSheet` and the injected body. `tagline` is frontmatter because the header renders it; `description` and `ogSuffix` are frontmatter because `generateCvMetadata` needs them before any body is rendered.

### What renders it

The body is compiled by `shared/content`'s pipeline and injected exactly as `ArticleBody` injects a document's, under a `cv-content` class. `cv.module.scss` therefore stops being reachable — injected HTML carries no CSS-module hashes — and becomes `src/app/styles/cv-prose.scss`, keyed on structural selectors (`.cv-content h2`, `.cv-content section`, `.cv-content p:has(> code:only-child)`), `@use`d from `globals.scss` beside `prose.scss`. That is the repo's own existing answer to styling injected markup, and its print half is the part to move carefully: today's `@media print` rules key off `.tight`, `.period`, `.dim70` and friends, which a slot-free renderer has to re-derive from position.

A CV-specific rehype pass does the structural work the article pipeline has no reason to do: group the flat tree into a `<section>` per `##`, wrap each section's body in the card element, and split an `:::entries` section into one card per `###`.

### The social cards and the PDFs

`scripts/lib/cv-card.ts` reads the catalogue through `cvMessages` today for the name, tagline, contact addresses and the first offer block's heading and bullets. It reads the markdown instead — frontmatter for the tagline, and the parsed mdast for the offer block's heading and its bullet labels. The rule that made the card trustworthy holds unchanged: every string on it is read, never retyped.

`CV_SOURCES` in `scripts/render-pdf.ts` currently hashes `src/pages/cv` plus the printable's own catalogue. It hashes `src/pages/cv`, the new stylesheet, and the printable's own `.md` — so rewording the English leaves the Russian print alone, as it does now. All four PDFs and both cards are re-rendered and committed in this change, because the markup under them moves.

## Steps

1. **Write the four markdown files** from the current catalogue, by hand, preserving wording exactly. Diff the rendered text against the live page to prove nothing was dropped.
2. **Add the CV frontmatter schema** (`description`, `ogSuffix`, `tagline`) and a CV document loader beside `shared/content/documents.ts` — see DRY notes.
3. **Register `:::entries`** in `remark-content-directives.ts`; write the CV rehype pass (sectionize, card-wrap, entries-split).
4. **Move `cv.module.scss` to `src/app/styles/cv-prose.scss`**, re-keyed on structural selectors, print rules included.
5. **Rewrite `CvSheet`** to render the chrome plus the injected body; delete `cv-section.tsx`, `cv-bullets.tsx`, `cv-offer-block.tsx`, `experience-card.tsx`, `case-study-link.tsx`, `cv-offer.ts`, `cv-messages.ts`.
6. **Point `generateCvMetadata`** at the frontmatter.
7. **Update `cv-card.ts`** to read the markdown; update `CV_SOURCES`.
8. **Delete the `cv` slice** from `en.json` and `ru.json`, keeping `ui.cvVariants` and any other chrome strings the sheet still uses.
9. **Re-render and commit** both OG cards and all four PDFs.
10. **Update `.claude/rules/content.md`** — the CV's directory-per-variant layout, the `:::entries` directive, the CV's frontmatter fields, and the card's new source.
11. **`/preview` both variants in both locales, both themes**, and read all four PDFs, against screenshots taken before step 5.

## DRY notes

- **Shared with the documents pipeline, reused rather than copied:** `remarkParse`/`remarkGfm`/`remarkDirective`/`remarkRehype`/`rehypeRaw`/`rehypeSlug`/`rehypeContentLinks`/`rehypeStringify` — the whole of `render.ts`'s spine, whose absolutizing of internal links the printed CV needs exactly as a printed case study does. The CV's pass is an addition to that pipeline, not a second one.
- **Not shared: the collection registry.** The CV is one document in four renditions, not a collection of documents, so it is **not** an entry in `COLLECTIONS`. Registering it would give it an index page, index cards, `listAllDocuments` walks and a `Variant` (`mini`/`nano`) vocabulary that means nothing here — four consumers made wrong to spare one loader. `documents.ts` is collection-keyed throughout (`collectionDir`, `documentRoute`, `parseFileName`), so the CV gets a small sibling loader that reads a known path and parses its own frontmatter, sharing `frontmatter.ts`'s zod idiom but not its schema. The seam being copied is ~20 lines of `readDocument`; forcing a shared abstraction over it would mean parameterizing every collection-keyed function on a collection that does not exist.
- **Genuinely duplicated, and accepted:** the ~85% of the CV that `cto` and `dev` share — experience, tech stack, education, contact. Today `cvMessages` merges a `cto` override subtree over the `dev` base, so each of those sentences has one home per language; in four flat files each has two. The multiplier goes 2 (languages) to 4. This is the price of the property the change exists for — **the served `.md` is the authored file, with no generation step** — and a base-plus-overlay layout would have to generate the per-variant `.md` to serve one, which is the generated tree `.claude/rules/content.md` says the design exists to avoid. No drift check is added: the variants diverging is what variants are for, so a check that failed on divergence would forbid the feature.
- **`TECH_STACKS`** (`src/shared/config/tech-stacks.ts`) stays where it is — the home page's work section uses it too — and the CV's copy of those four strings moves inline into the markdown. The alternative is a placeholder directive resolving a config key, which buys one home for four language-neutral strings at the cost of a `.md` file that no longer reads as itself.
- **`OFFER_BLOCKS`, `EXPERIENCE_KEYS`, `OTHER_VARIANT`:** the first two go — their whole job is ordering content the markdown now orders by being written in order. `OTHER_VARIANT` stays: it is chrome, not copy.

## Known fidelity risks

Named because "сохранив форматирование" is the constraint the change is judged on:

- **The print rules are the hard part.** 266 lines of `cv.module.scss`, roughly half under `@media print`, key off per-slot classes the JSX applied. Re-deriving `.tight` / `.tightHeading` / `.period` / `.dim*` from tree position is where spacing will drift, and the four committed PDFs are where it shows.
- **Two typographic distinctions have no markdown spelling.** The label bullet (`<strong>label:</strong>`, colon set by the renderer) and the lead bullet (`<strong>lead</strong>`) collapse into one authored-bold form, and the colon becomes the author's. `subheadingLarge` (Education's school, 20px) versus `subheading` (18px) are both `###`; the plan sets both to `subheading` unless question 3 says otherwise.
- **`cvMessages`' merge is also a guarantee**: a key `cto` does not restate cannot drift from `dev`. That guarantee ends with this change, by construction.

## Open questions

Each recommendation is already in force above — an unanswered question means the recommendation stands.

**1. File layout.**
 **(a) — recommended, and written into the plan.** Four standalone files, duplication accepted, as argued in DRY notes.
 **(b)** Two per-locale files with variant-conditional directives, and a generated per-variant `.md` for the served artifact. Keeps one home per sentence; costs the "no generation step" property and adds a directive whose body a raw-`.md` reader sees.

**2. Renderer.**
 **(a) — recommended, and written into the plan.** Compile to HTML and inject it, styling with a structural stylesheet, as the documents pages do.
 **(b)** Parse the markdown into a typed CV model and keep every existing component. Preserves the print formatting by construction rather than by re-derivation, at the cost of a bespoke parser — and it makes the markdown a serialization of the JSON structure this change is trying to leave, which is why it is not recommended despite being the safer route on fidelity alone.

**3. Fidelity latitude.** May the two distinctions under "Known fidelity risks" collapse — the label/lead bullet forms into one authored bold, and Education's larger subheading into the standard one?
 **(a) — recommended, and written into the plan.** Yes; both are invisible to a reader who is not diffing.
 **(b)** No; carry each with its own markup (an `:::entries`-style marker, or a class-adding rehype rule keyed on section).
