> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Incorporate the external CTO-positioning feedback

## Context

PR #31 (`3cc95b1`) repositioned the **CV** around a fractional, hands-on CTO
offer: `/cv` defaults to the `cto` variant, `cv.variants.cto` overrides the
tagline, profile and metadata, and the CTO framing leads with `Engagements` and
`The Engineering System`.

External feedback from an industry CEO, given after reading the live site, says
the repositioning is right but half-applied:

1. **The landing page still sells a developer.** `/` opens with _"Developer, AI
   tinkerer, word shaker, generative metalhead"_, its professional section is
   headed **`/dev`** (`Section` renders its `id` as the visible title), and its
   lead line is _"These days I'm looking for a hands-on CTO position"_ —
   job-seeking voice, not an offer.
2. **Fractional CTO is the angle that carries the rate**, precisely because so
   many teams now vibecode and what they lack is guidance, audit and direction.
3. **Add architecture planning / setting up the framework and foundation** to
   the offer — not the same purchase as "idea → production" or "your team on
   agent rails".
4. **The CV's variant switcher reads as indecision.** Two buttons at the top of
   the sheet say the author has not settled who he is.
5. **The picture is wrong for the framing.** The operator's own reaction to a
   Slack unfurl of `/cv`: _"бли, картинку уже поменять надо 🙈"_.

Point 5 has a bug behind it. `public/cv_card.png` is a hand-committed composite
(`5ba7236`, predating PR #31) with the **dev** framing baked into the pixels —
`DEVELOPER — AI, FULL-STACK, AND THE BITS IN-BETWEEN`, then the retired
`CORE CAPABILITIES` bullets. `src/pages/cv/lib/cv-metadata.ts:41` serves it as
`og:image` for **both** variants, so a shared `/cv` link unfurls the CTO
description beside a card that says DEVELOPER. Nothing detects it: the card sits
outside `scripts/render-og.ts`, which only rasterizes cards a content document's
frontmatter names.

The photograph itself stays as it is — `https://vovazakharov.com/ava.png` is
byte-identical to `public/ava.png`, and the operator named it as the one to use.

Intended outcome: the landing page makes the fractional-CTO offer in its first
screen, the offer names the engagement the feedback asked for, the CV stops
presenting its two framings as a coin flip, and the social card is generated
from the same catalogue the page reads, so it cannot contradict it again.

## Approach

Six pieces, in this order.

### 1 — The landing page leads with the offer

`src/pages/home/ui/home-page.tsx` — the hero becomes name, one tagline, one
supporting sentence. _"Developer, AI tinkerer, word shaker, generative
metalhead"_ and _"Helping our future overlords walk since 2020"_ are both cut.

**The tagline is the landing page's own, not the CV's** — the CV header's
_"Fractional, hands-on CTO for AI-native delivery"_ is the right register for a
CV and a flat one for a first screen. The operator's line, verbatim:

> **Fractional CTO for teams that don't want to YOLO into the agent era.**

It names what the buyer is afraid of rather than what the seller is, which is
what makes it the hook the alternatives weren't.

**"Hands-on" belongs in the supporting line, not the tagline** — asserted beside
"Fractional CTO" it is one more adjective, and the sentence underneath can show
it instead. Default, with the operator to pick:

> Hands-on means hands on the keyboard: the last team I did this for runs the
> platform today without me.

Alternative: _"I write the code, review what the agents write, and hand over a
machine your team runs without me."_ Neither restates `cv.metadata.ogSuffix`
verbatim, which makes the same point in the CV's register.

`src/pages/home/ui/dev-section.tsx` splits, so the page stops showing a heading
that reads `/dev`:

- **new `src/pages/home/ui/offer-section.tsx`** — `<Section id="offer">`: one
  framing paragraph in the site's voice, then the engagement names as a
  scannable list, then `ReadCvButton`. The _"looking for a hands-on CTO
  position"_ sentence is rewritten as an offer, not a search.
- **`dev-section.tsx` → `work-section.tsx`** — `<Section id="work">`: Featured
  Projects and Work Highlights unchanged, minus the two lead paragraphs that
  move to the offer section, plus the trailing `ReadCvButton`.
- **`ReadCvButton` moves to `src/pages/home/ui/read-cv-button.tsx`**, now that
  two files render it.
- `home-page.tsx` composes `OfferSection` → `WorkSection` → `ContactSection`.

Also update the site-wide default description at
`src/shared/seo/construct-metadata.ts:32`, still _"Developer, AI tinkerer, word
shaker, generative metalhead"_ — it is what `/` unfurls with.

### 2 — The offer gains architecture and foundations

`src/shared/i18n/messages/en.json` and `ru.json`, under
`cv.whatIOffer.blocks.engagements.items` — a fifth bullet: the architecture
drawn and the foundation stood up for a team that will write the features
itself. Place it second, after `Idea → production`.

`Standing technical judgment` already carries "framework and platform selection"
as advice; the new bullet is the same subject as _work done_, so trim that clause
from it rather than letting the two overlap.

No code change: `engagements` is already in `OFFER_BLOCKS.cto`
(`src/pages/cv/ui/cv-sheet.tsx:63`), and `CvBullets` renders `{label, text}`
items unchanged.

**One cleanup this forces:** the labels carry their own trailing colon in the
catalogue (`"label": "Idea → production:"`). The landing page renders the same
labels without one, so the colon moves out of the data and into
`src/pages/cv/ui/cv-bullets.tsx`, across all `{label, text}` items in both
catalogues.

### 3 — The CV's framings stop reading as a coin flip

- `src/pages/cv/ui/cv-sheet.tsx` — remove `<VariantSwitch>` from the header
  toolbar (line 97), leaving `LocalePicker` and `ThemeToggle`. The screen footer
  (lines 236–246) loses `ta="center"` and becomes a `Group` with
  `justify="space-between"`: the existing _← Back to main page_ link on the
  left, the other framing's invitation on the right. It is already inside a
  `print-hidden` box, so neither prints.
- `src/pages/cv/ui/variant-switch.tsx` → `other-variant-link.tsx`, rendering a
  single `InternalLink` to the variant that is _not_ current, instead of a
  button group over both.
- `src/shared/i18n/messages/{en,ru}.json` — `ui.cvVariants.{cto,dev}` become the
  invitations, keyed by the variant they lead to: `"Looking for a CTO?"` /
  `"Looking for a dev?"` (ru: `"Ищете CTO?"` / `"Ищете разработчика?"`).
  `ui.switchVariant` was the button group's `aria-label` and goes with the
  group — a single link needs none.

Nothing about routing, `CV_VARIANTS`, `cvPath`, `generateStaticParams`, the
canonical/`hreflang` map or the sitemap changes: both addresses keep working and
keep their own metadata.

### 4 — The social card is generated from the catalogue

Two cards, `public/cv/cto.og.png` and `public/cv/dev.og.png` — the content
tree's own rule (a file sits at its route plus an extension) applied to a card,
and safe because a route reserves only `.html` and `.txt`. Manifest beside them
at `public/cv/og-renders.json`. `src/pages/cv/lib/cv-metadata.ts` picks by
variant and publishes the real dimensions; `public/cv_card.png` is deleted, and
so is the now-dangling `"/cv_card.png"` example in the `ogImage` comment at
`src/shared/seo/construct-metadata.ts:27`.

**The card's text is read, never retyped** — name, tagline and the one proof
line already at `cv.metadata.ogSuffix`, taken through the same variant merge the
page uses (`cvMessages`). That is the whole point of generating it: the drift
that produced the current card cannot recur.

Four things the implementer will hit, named here so they are not discovered
cold:

- **The SVG is generated, not committed**, unlike the chart card whose SVG is
  the authored artifact. The manifest's `sourceHash` therefore covers the
  template, the catalogue slice **and** `ava.png`'s bytes, so editing any of the
  three re-flags the card. `.claude/rules/content.md` states "both are
  committed" and needs the exception written into it.
- **`runRenderJob`'s prune walk is hardcoded to the content tree.**
  `manifestFiles`/`orphans` in `scripts/lib/render-manifest.ts` go through
  `contentFiles`, which only walks `COLLECTION_IDS`, so a card under `public/cv/`
  is rendered but never pruned and its manifest never cleaned. The job needs to
  say which directories are its own — an added `manifestDirs` on
  `ManifestLayout`, defaulting to today's walk for the two existing callers.
- **`render-og.ts` runs under bare Node**, which cannot take
  `import en from './messages/en.json'` without an import attribute. Move
  `content:og` to `tsx`, as `pnpm type-overlap` already does, so the script
  imports the merge rather than reimplementing it. If the boundary checkers
  object to a script reaching `src/pages/cv/lib/cv-messages.ts` directly, move
  `cvMessages` and `CV_VARIANTS` down to `shared/i18n` — it is catalogue-shaping
  logic and that segment already owns the catalogue. Do **not** import
  `@/pages/cv`'s barrel: it pulls Mantine into a Node script. CLAUDE.md § "Repository
  layout" says type-overlap is "the one script run under `tsx`" and needs
  updating with this.
- **Rendering is a run-by-hand, committed step.** `pnpm content:og` produces the
  PNGs and they are committed; `next build` never invokes it. Budget ~180 kB per
  card, from the one that exists.

**English only, both variants.** A `ru` card would double the committed weight
for the site's secondary surface, and the localized `og:description` already
tells a crawler which language it got. This is the same locale seam
`.claude/rules/content.md` leaves open for documents; note it there, don't build
it.

### 5 — The avatar's published dimensions

`SITE_CONFIG.avatar` declares `width: 150, height: 150`
(`src/shared/config/site-config.ts:38-42`) and `constructMetadata` publishes
those as `og:image:width`/`height` (lines 47, 51, 76) — but `public/ava.png` is
1024×1024, so every page that falls back to it advertises the wrong size. The
150 is also the home hero's render size, so separate the two: the config carries
the file's real dimensions, and `home-page.tsx` keeps its own 150.

### 6 — The review note

`writing/notes/the-five-percent.md`, mandatory per `CLAUDE.md` § "GitHub
comments". The stale card is a bump on the existing learning **"It edits the copy
in front of it, not the fact behind it"** (×3, line 203): PR #31 rewrote the
tagline in the catalogue and left the PNG rendering the same sentence in pixels —
in a file (`cv-metadata.ts`) that same PR edited. Increment to ×4 and re-sort.

Everything else here is a positioning call the operator was right to make and the
agent would have been wrong to take unasked; the file's own rule puts those under
**"Not bumps"** (line 343) or nowhere.

## Resolved forks

Four options were put to the operator and settled; the rejected branches, for the
record only:

- **The switcher** — removing it outright was rejected as evasive, and leaving
  the header toggle was rejected as the thing the feedback objected to.
- **The hero's personal line** — moving it to the footer was rejected; it is cut,
  with the condition that the CTO tagline replacing it carry the voice it took
  away.
- **The social card** — deleting it and falling back to the portrait, with the
  generator filed as an issue, was rejected in favour of building the generator
  now.
- **The photograph** — no new photo; the existing `ava.png` is the one.

## DRY notes

- **The engagement names are one list.** The landing page renders the `label` of
  each item in `cv.whatIOffer.blocks.engagements.items`, read via
  `loadMessages('en')` — `HomePage` is a server component and the barrel is
  client-safe, so this costs no provider and no client bundle. **Rejected:**
  adding a `short` gloss per item, which buys a second phrasing per engagement
  that nothing checks against the first.
- **The card's copy is read from the catalogue, not authored twice.** This is the
  single largest reuse in the change and the reason piece 4 exists at all; the
  current card is what one hand-maintained copy of the tagline cost.
- **The hero tagline is deliberately _not_ shared with the CV header**, against
  the general rule, because the operator asked for two registers: the CV's line
  is the sober one, the hero's carries the site's voice. The shared thing is the
  positioning, not the string. Accepted cost: two sentences that must both be
  edited if the offer changes — bounded, because the card and the CV still share
  one of them.
- **The landing page's framing paragraph is its own** for the same reason: the CV
  profile argues at length to someone already reading a CV, the landing has one
  paragraph to earn a scroll. The facts underneath (158 days, 250,000 lines,
  handed over) are single-sourced in the case study it links to.
- **`ReadCvButton` gets its own file** rather than being copied into the second
  section — unchanged, only relocated.
- **The label colon moves to the renderer**, so the CV and the landing page read
  one catalogue field instead of one stripping a character the other needs.
- **`manifestDirs` is a parameter, not a second job.** The prune bookkeeping is
  identical for a chart card and a CV card; only the directory list differs.

## Verification

1. `./scripts/vet.sh` — the build is the only end-to-end check the app has, and
   `content:og --check` must go green **after** `pnpm content:og` has been run by
   hand and the PNGs committed. A red `--check` at this point means the hash
   inputs are wrong, not that a re-render was skipped.
2. **Look at the two cards.** Open the rendered PNGs. A generated card goes wrong
   by being ugly or by overflowing its box, neither of which any hash catches.
3. `/preview` — `/`, `/cv`, `/cv/dev` in both themes, mobile and desktop. The
   hero's first screen, the `/offer` and `/work` headings, and the footer row
   with the back link left and the invitation right.
4. **Print `/cv`.** The `@media print` path is not covered by the build: confirm
   the footer row and the toolbar are both hidden and pagination still holds.
5. **Grep the built `out/`** — each CV variant advertises its own card at its real
   dimensions, `cv_card.png` appears nowhere, and `/` advertises the portrait at
   1024×1024.
6. Confirm `ru` still type-checks against `en` (`Messages = typeof en` in
   `src/shared/i18n/load-messages.ts` is the enforcement).

## Out of scope

- `README.md:49`, which still describes the pre-PR-#31 route layout
  (`cv/, [locale]/cv/`). Real, unrelated, one line; mentioned rather than
  widening this branch.
