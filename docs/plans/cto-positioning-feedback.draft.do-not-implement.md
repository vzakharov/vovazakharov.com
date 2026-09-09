> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Incorporate the external CTO-positioning feedback

## Context

PR #31 (`3cc95b1`) repositioned the **CV** around a fractional, hands-on CTO
offer: `/cv` now defaults to the `cto` variant, `cv.variants.cto` overrides the
tagline, profile and metadata, and the CTO framing leads with `Engagements` and
`The Engineering System`.

External feedback from an industry CEO, given after reading the live site, says
the repositioning is right but half-applied. Distilled, with the operator's own
replies folded in:

1. **The landing page still sells a developer.** `/` opens with _"Developer, AI
   tinkerer, word shaker, generative metalhead"_, its professional section is
   headed **`/dev`**, and its lead line is _"These days I'm looking for a
   hands-on CTO position"_ — job-seeking voice, not an offer. The feedback:
   position as CTO, or Fractional CTO; say what you do and what you can help
   with; _then_ everything else. The operator agreed explicitly.
2. **Fractional CTO is the angle that carries the rate**, precisely because so
   many teams now vibecode and what they lack is guidance, audit and direction.
3. **Add architecture planning / setting up the framework and foundation** to
   the offer — it is not the same purchase as "idea → production" or "your team
   on agent rails".
4. **The CV's variant switcher reads as indecision.** Two buttons at the top of
   the sheet say the author has not settled who he is, and a reader who sees
   that stops treating him as a CTO. The operator's counter: the two framings
   are already separate, shareable pages, and hiding the link would be evasive.
5. **The picture is wrong for the framing** — fine for a dev, off for a CTO. The
   operator's own reaction, looking at a Slack unfurl of `/cv`: _"бли, картинку
   уже поменять надо 🙈"_.

Point 5 has a bug hiding inside it. `public/cv_card.png` is a hand-committed
composite (`5ba7236`, predating PR #31) with the **dev** framing baked into the
pixels — `DEVELOPER — AI, FULL-STACK, AND THE BITS IN-BETWEEN`, then the retired
`CORE CAPABILITIES` bullets. `src/pages/cv/lib/cv-metadata.ts:41` serves it as
`og:image` for **both** variants, so a shared `/cv` link unfurls the CTO
description beside a card that says DEVELOPER. Nothing detects this: the card
sits outside `scripts/render-og.ts`, which only rasterizes cards a content
document's frontmatter names.

Intended outcome: the landing page makes the fractional-CTO offer in the first
screen, the offer names the engagement the feedback asked for, the CV stops
presenting its two framings as a coin flip, and the social card stops
contradicting the page it advertises.

## Open questions

Each carries a recommendation, and everything below is written **with the
recommendation already in force** — so silence is a valid answer.

**1. The variant switcher.**

- **(a) Demote it to a footer line (recommended).** Drop the two-button group
  from the header toolbar; add one quiet line at the foot of the sheet — on
  `/cv`: _"Hiring a hands-on developer instead? → /cv/dev"_; on `/cv/dev`:
  _"Looking for a fractional CTO? → /cv"_. This answers the actual objection (a
  toggle at the top is a coin flip) while keeping what the operator wanted:
  discoverable, separately shareable, not evasive.
- (b) Remove it entirely — `/cv/dev` reachable only by a link pasted by hand.
- (c) Leave it as it is.

**2. The home hero's personal line.** _"Developer, AI tinkerer, word shaker,
generative metalhead"_ is voice worth keeping, but not in the first line.
Recommended: the hero leads with the CTO tagline, and the personal line moves
down to the footer beside the existing _See also_ links. Alternative: cut it.

**3. The social card.**

- **(a) Stop serving the wrong card now; build the right one later
  (recommended).** Drop `ogImage: '/cv_card.png'` so the CV falls back to the
  portrait, fix the wrong published dimensions (below), delete the stale PNG,
  and open an issue for per-variant generated cards. Rationale: the card's main
  input — a photograph that suits the framing — is the operator's to supply and
  does not exist yet, and a plain correct card beats a rich wrong one.
- (b) Build per-variant cards in this branch: SVG sources templated from the
  message catalogue, rasterized through an extended `render-og.ts`, hashed into
  a manifest so the text cannot drift from the catalogue again. Correct, but it
  is its own piece of work, and it would be authored around a photo that is
  about to be replaced.

**4. The photograph itself.** `public/ava.png` is the operator's to replace — the
agent cannot produce one. Once a file exists, wiring it in is two edits
(`SITE_CONFIG.avatar` and the home hero) and is not planned here.

## Approach

Five independent pieces, in this order.

### 1 — The landing page leads with the offer

`src/pages/home/ui/home-page.tsx`:

- Hero tagline becomes the CTO line. The string already exists once, at
  `cv.variants.cto.header.tagline` in `src/shared/i18n/messages/en.json` — read
  it via `loadMessages('en')` rather than retyping it (see DRY notes).
- Second line replaces _"Helping our future overlords walk since 2020"_ with one
  sentence naming the shape of the engagement (fractional, hands-on,
  founder-and-small-team scale).
- The personal line moves into the footer row alongside `SEE_ALSO`.

`src/pages/home/ui/dev-section.tsx` splits, because `Section` renders its `id`
as the visible heading (`src/shared/ui/section.tsx:16` — `<Title>/{id}</Title>`),
so today the landing page literally shows a heading reading **`/dev`**:

- **new `src/pages/home/ui/offer-section.tsx`** — `<Section id="offer">`: one
  framing paragraph in the site's own voice, then the engagement names as a
  scannable list, then `ReadCvButton`. The _"looking for a hands-on CTO
  position"_ sentence is rewritten as an offer, not a search.
- **`dev-section.tsx` → `work-section.tsx`** — `<Section id="work">`: Featured
  Projects and Work Highlights unchanged, minus the two lead paragraphs that
  move to the offer section, plus the trailing `ReadCvButton`.
- **`ReadCvButton` moves to its own `src/pages/home/ui/read-cv-button.tsx`**, now
  that two files render it.
- `home-page.tsx` composes `OfferSection` → `WorkSection` → `ContactSection`.

Also update the site-wide default description at
`src/shared/seo/construct-metadata.ts:32` — it is still _"Developer, AI tinkerer,
word shaker, generative metalhead"_, and it is what `/` unfurls with.

### 2 — The offer gains architecture and foundations

`src/shared/i18n/messages/en.json` and `ru.json`, under
`cv.whatIOffer.blocks.engagements.items` — a fifth bullet covering what the
feedback named: framework and platform selection made concrete, the architecture
drawn, the foundation stood up and the conventions checked in, then handed to
whoever writes the features. Distinct from `Idea → production` (delivery) and
`Your team on agent rails` (the agent pipeline); place it second, after
`Idea → production`.

`Standing technical judgment` already carries "framework and platform selection"
as advice; the new bullet is the same subject as _work done_, so trim that clause
from it rather than letting the two overlap.

No code change: `engagements` is already in `OFFER_BLOCKS.cto`
(`src/pages/cv/ui/cv-sheet.tsx:63`), and `CvBullets` renders `{label, text}`
items unchanged.

**One small cleanup this forces:** the labels carry their own trailing colon in
the catalogue (`"label": "Idea → production:"`). The home page renders the same
labels without one, so the colon moves out of the data and into
`src/pages/cv/ui/cv-bullets.tsx`, where presentation belongs — across all
`{label, text}` items in both catalogues.

### 3 — The CV stops presenting its framings as a coin flip

Per question 1(a):

- `src/pages/cv/ui/cv-sheet.tsx` — remove `<VariantSwitch>` from the header
  toolbar (line 97), leaving `LocalePicker` and `ThemeToggle`.
- `src/pages/cv/ui/variant-switch.tsx` — rewrite as a single footer line rendered
  next to the existing back-link footer (lines 236–246), `print-hidden` as the
  toolbar was. Its docstring's claim ("Deliberately visible…") stays true and
  gets restated for the new position; rename the file if the component name
  changes.
- `src/shared/i18n/messages/{en,ru}.json` — `ui.switchVariant` and
  `ui.cvVariants.{cto,dev}` become the two directional invitations instead of two
  one-word button labels.

Nothing about routing, `CV_VARIANTS`, `cvPath`, `generateStaticParams`, the
canonical/`hreflang` map or the sitemap changes — both addresses keep working and
keep their own metadata.

### 4 — The social card stops saying DEVELOPER

Per question 3(a):

- `src/pages/cv/lib/cv-metadata.ts:41` — drop the `ogImage` line so the CV falls
  back to `SITE_CONFIG.avatar.path`, as every other page does.
- `git rm public/cv_card.png`, and drop the now-dangling `"/cv_card.png"` example
  from the `ogImage` comment at `src/shared/seo/construct-metadata.ts:27`.
- **Fix the wrong published dimensions.** `SITE_CONFIG.avatar` declares
  `width: 150, height: 150` (`src/shared/config/site-config.ts:38-42`) and
  `constructMetadata` publishes those as `og:image:width`/`height` (lines 47, 51,
  76) — but `public/ava.png` is 1024×1024. Every page on the site currently
  advertises the wrong size. The 150 is also the home hero's render size, so
  separate the two: the config carries the file's real dimensions, and
  `home-page.tsx` keeps its own 150.
- Open a GitHub issue for per-variant generated cards (question 3(b)), naming
  what it has to do: SVG templated from the catalogue so the card's text cannot
  drift from the page's, rasterized through `render-og.ts`, hashed into a
  manifest that `vet.sh --check` reads.

### 5 — The review note

`writing/notes/the-five-percent.md`, mandatory per `CLAUDE.md` § "GitHub
comments". The stale card is a clean bump on the existing learning **"It edits
the copy in front of it, not the fact behind it"** (currently ×3, line 203): PR
#31 rewrote the tagline in the catalogue and left the PNG that renders the same
sentence in pixels — in a file (`cv-metadata.ts`) the same PR edited. Increment
to ×4 and re-sort.

Everything else here is a positioning call the operator was right to make and the
agent would have been wrong to take unasked — the file's own rule puts those
under **"Not bumps"** (line 343) or nowhere. Add at most one line there for the
switcher, and no entry at all for the landing-page framing.

## DRY notes

- **The CTO tagline is one string, and stays one.** `/cv`'s header and the home
  hero both need _"Fractional, hands-on CTO for AI-native delivery"_. It already
  lives at `cv.variants.cto.header.tagline`; `HomePage` is a server component and
  `loadMessages` is exported from the client-safe `@/shared/i18n` barrel, so the
  home page reads it at build time and passes a plain string down. No provider,
  no client-bundle cost, no second spelling. (The tagline is already spelled two
  ways in the wild — `–` in the catalogue, `—` in the PNG — which is what the
  duplicate cost last time.)
- **The engagement names are one list.** The landing page renders the `label` of
  each item in `cv.whatIOffer.blocks.engagements.items`, read the same way, so
  the set cannot drift from the CV's. Deliberately labels only: their `text` is
  written for a reader already inside a CV, and a landing page wants the names.
  **Rejected:** adding a `short` gloss per item to the catalogue — it buys a
  second phrasing per engagement that nothing checks against the first, which is
  the drift this reuse exists to prevent.
- **The framing paragraph on the landing page is deliberately not shared.** The
  CV profile makes its case at length to someone who chose to read a CV; the
  landing has one paragraph to make someone keep scrolling. Forcing one string
  would either bloat the landing or thin the CV, and the fact underneath (158
  days, 250,000 lines, handed over) is already single-sourced in the case study
  the landing links to.
- **`ReadCvButton` gets its own file** rather than being copied into the second
  section — the existing component is unchanged, only relocated.
- **The label colon moves to the renderer**, so the CV and the landing page read
  one catalogue field instead of one stripping a character the other needs.
- **Nothing new is extracted for the OG card**, because 4(a) removes a hand-made
  artifact rather than adding one.

## Verification

1. `./scripts/vet.sh` — the build is the only end-to-end check the app has, and
   `content:og --check` / `content:pdf --check` must stay green after
   `cv_card.png` is deleted (it is outside both manifests, so they should be
   untouched — if either flags, the assumption was wrong).
2. `/preview` — boot the dev server and actually look at `/`, `/cv`, `/cv/dev` in
   both themes. Specifically: the hero's first screen, the `/offer` and `/work`
   headings, and the demoted framing link at the foot of the sheet.
3. **Print check.** The CV's `@media print` path is not covered by the build.
   Print `/cv` to PDF and confirm the demoted framing line is hidden
   (`print-hidden`) and the footer still lays out.
4. **Card check.** Grep the built `out/cv/index.html` for `og:image` — confirm the
   CV advertises the portrait at 1024×1024 and no longer references
   `cv_card.png`. Re-check the same for `/`, which shares the fallback.
5. Confirm `ru` still type-checks against `en` (`Messages = typeof en` in
   `src/shared/i18n/load-messages.ts` is the enforcement) — every key added to one
   catalogue exists in the other.

## Out of scope

- The photograph (question 4) — operator-supplied.
- Per-variant generated OG cards — filed as an issue by step 4.
- `README.md:49`, which still describes the pre-PR-#31 route layout
  (`cv/, [locale]/cv/`). Real, unrelated, one line; mentioned rather than
  widening this branch.
