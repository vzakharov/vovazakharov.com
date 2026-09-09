# PR #35: feat: carry the CTO positioning onto the landing page and card

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/35
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/cto-positioning-feedback-i4smdh
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-09T08:25:04Z
- **Updated:** 2026-09-09T13:02:45Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Why.** External feedback from an industry CEO on the live site, after PR #31 repositioned the CV: the repositioning is right but half-applied. `/` still opened as a developer looking for a position under a heading that read `/dev`, the offer had no engagement for architecture and foundations, and the CV's two framings sat behind a toggle at the top of the sheet that read as indecision.
- **The landing page leads with the offer.** The site tagline heads the offer section — held in `SITE_CONFIG.tagline` because it is also the default description every page without one unfurls with — over one framing paragraph, the engagement names read off the CV's own catalogue, and the CV button; the hero above it is the name and "Helping our future overlords walk since 2020", and the projects and highlights follow. No section on the page is headed by its slash name any more: `Section` titles itself from its id only when it is the whole page, which is what `/writing` and `/music` rely on for their `h1`. The CV's offer gains "Architecture and foundations" second in the list; the switcher is gone from the CV header and one invitation to the other framing sits at the foot of the sheet opposite the back link.
- **A catalogue shape surfaced by the colon cleanup.** Moving the colon into the renderer showed that `{label, text}` held two kinds of bullet: labels a colon follows, and clauses the text continues from ("Sub-second cold loads, down from multi-second", "Django / FastAPI – If you…"). The second kind is now `lead`, and `CvBullets` sets no colon after it. This is the one place the implementation departs from the plan's wording.
- **The social card is generated per framing.** `public/cv_card.png`, a hand-committed composite with the developer tagline baked in and served for both framings, is deleted. `pnpm content:og` now renders `public/cv/<variant>.og.png` from an HTML page `scripts/lib/cv-card.ts` generates off the message catalogue and the portrait — HTML rather than the plan's SVG because the offer bullets wrap and SVG text does not. The manifest hashes the page and the portrait's bytes; the script runs under `tsx`; the prune walk takes a `manifestDirs` list. The chart card's render and hash are untouched. The PDFs are re-rendered because `shared/config`, one of their hashed sources, now carries the tagline.
- **The card says what is on offer** (review round). It was a name, a tagline and `metadata.ogSuffix` on a plate empty across its top and bottom thirds, with no way to reach the person on it. It is now composed as a business card, split down a rule: portrait, name, tagline and the site, GitHub and LinkedIn addresses on the left; the offer on the right under the catalogue's own "What I Offer" title. The offer is the framing's own rather than written for the card — `OFFER_BLOCKS` moves from `cv-sheet.tsx` to `pages/cv/lib/cv-offer.ts` (the card is a script and cannot reach a `ui` module that imports Mantine), so the card takes the head of the list each variant shows and shortens each bullet to the label naming it. `cto` advertises the five engagements, `dev` the three core capabilities as written. `ogSuffix` still feeds the `og:description`, and `Labelled` loses its British doubling.
- **Two pre-existing defects fixed on the way.** The layout route re-exported only the component, so the root `metadata` never reached Next and `/` shipped with no title and no Open Graph tags at all — on main and on the live site. Fixed by re-exporting it as the pages do; a second commit routes the title through the helper, whose spread had been erasing it. The avatar's declared 150×150 is corrected to the file's 1024×1024.
- **The review notes** bump "It edits the copy in front of it, not the fact behind it" to ×4 with the stale card, and "It checks the render against its intent, not against the page" to ×2 with the card that replaced it, per CLAUDE.md § "GitHub comments".

## QA Checklist

- [ ] `hero` — open `/`: two lines, name / "Helping our future overlords walk since 2020" at the size and opacity that line already had. Neither "Developer, AI tinkerer, word shaker, generative metalhead" nor the tagline is in the hero
- [ ] `offer` — the offer section opens with "Fractional CTO for teams that don't want to YOLO into the agent era." at the type the hero tagline had — 20px, 24 from `sm` up, 0.8 opacity, not bold — then one framing paragraph whose "Last time round" links to the Playgram case study, then five engagement names as a list, then a "Read full CV" button. No `/offer` or `/dev` heading
- [ ] `work` — Featured Projects and Work Highlights render unchanged with the "Read full CV" button still at the foot, and no `/work` heading above them; the contact card closes the page with no `/contact` heading
- [ ] `outline` — `/` has exactly one `h1`, the name, and the offer's tagline is the page's `h2`; `/writing` and `/music` still open with `/writing` and `/music` as their own `h1`
- [ ] `engagement` — `/cv` shows "Architecture and foundations" second in Engagements, and "Standing technical judgment" no longer mentions framework and platform selection
- [ ] `engagement-ru` — `/cv/cto/ru` shows "Архитектура и фундамент" in the same position, and `/cv/dev` still shows Core Capabilities rather than Engagements
- [ ] `colon` — on `/cv` and `/cv/dev`, in both locales: every labelled bullet reads "Label: text" with exactly one colon, and the clause-shaped ones ("Sub-second cold loads, down from multi-second", the tech-stack lines "Django / FastAPI – If you…") read with no colon inserted
- [ ] `framing-link` — the two-button toggle is gone from the CV header; the footer row is the back link left and "Looking for a dev?" right on `/cv`, "Looking for a CTO?" right on `/cv/dev`, "Ищете разработчика?" on `/cv/cto/ru`; each link lands on the other framing in the same locale
- [ ] `print` — print `/cv` to PDF: the footer row and the toolbar are both hidden, pagination still holds
- [ ] `card-look` — open `public/cv/cto.og.png` and `public/cv/dev.og.png`: two columns either side of a hairline rule, portrait / name / tagline over the three addresses on the left, "WHAT I OFFER" and the bullets on the right. Nothing clipped, both plates full top to bottom, legible at thumbnail size
- [ ] `card-offer` — the two cards advertise different offers, each matching the head block of its own framing on the sheet: `cto.og.png` the five engagement names from `/cv`, `dev.og.png` the three core capabilities from `/cv/dev`, each bullet reading as it does there
- [ ] `card-drift` — edit the CTO tagline in `en.json`, run `pnpm content:og --check`, confirm it flags `public/cv/cto.og.png` and not the dev card; revert. Repeat with a `cv.whatIOffer.blocks.engagements` label and with `cv.contact.github`, which both cards read
- [ ] `og-cv` — in the built `out/`, `cv.html` advertises `/cv/cto.og.png` at 2400×1260, `cv/dev.html` advertises `/cv/dev.og.png`, and `cv_card` appears nowhere in the tree
- [ ] `og-home` — `out/index.html` has a `<title>` of "Vova Zakharov", a description equal to the tagline, and `og:image` pointing at `/ava.png` at 1024×1024; `/writing` and `/music` keep their own titles unchanged
- [ ] `pdf` — `pnpm content:pdf --check` is green, and the re-rendered `public/case-studies/playgram*.pdf` open with the same content as before
- [ ] `themes` — `/`, `/cv` and `/cv/dev` in both light and dark, at mobile and desktop widths

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `hero` | e2e | ❌ | Copy assertion against the rendered `/`; today only `pnpm build` proves it renders at all |
| `offer` | e2e | ❌ | Section heading against `SITE_CONFIG.tagline` and the engagement-name list against the catalogue they are read from |
| `work` | e2e | ❌ | Regression guard on the split — the cards must survive the move |
| `outline` | integration | ❌ | Count the `h1`s in the static export and assert each page's first heading — cheap, and the one thing a slash heading was doing for free |
| `engagement` | unit | ❌ | The catalogue is data: assert the item exists at index 1 and that no other bullet claims framework selection |
| `engagement-ru` | unit | ❌ | `Messages = typeof en` already fails the build on a missing key; the ordering is what a test would add |
| `colon` | unit | ❌ | `CvBullets` renders `label` + `: ` and `lead` + ` ` — a component test, the layer CLAUDE.md § Testing names as the next candidate |
| `framing-link` | e2e | ❌ | Both directions in both locales, plus that neither address 404s |
| `print` | manual-only | — | `@media print` pagination is a visual judgement; the build never exercises it |
| `card-look` | manual-only | — | A generated card fails by being ugly or clipped, which no hash catches |
| `card-offer` | unit | ❌ | Pure function of the catalogue and `OFFER_BLOCKS`: assert each variant's card copy equals the head block's bullets, shortened. The type gate already fails the build if a head block's bullets cannot be shortened |
| `card-drift` | unit | ❌ | The point of the generator: assert the source hash moves when any slice the page reads does |
| `og-cv` | integration | ❌ | Grep the static export for the `og:image` triple — cheap, and exactly the check that was missing |
| `og-home` | integration | ❌ | Same grep, other page; it would have caught the layout route dropping `metadata` |
| `pdf` | unit | ❌ | `content:pdf --check` covers staleness; nothing asserts the PDF's content |
| `themes` | manual-only | — | Visual, via `/preview` |

https://claude.ai/code/session_0128iwLMndKDGtqFBhWz8RxL
https://claude.ai/code/session_01HPvRSAK6f5Dga6Gev8y46E
https://claude.ai/code/session_013KGb3aByU2uPyxQBU74Qoz

---
_Generated by [Claude Code](https://claude.ai/code)_


---

## Comments

### Comment by @vzakharov on 2026-09-09T08:25:58Z

[https://github.com/vzakharov/vovazakharov.com/pull/35#issuecomment-5598749925](https://github.com/vzakharov/vovazakharov.com/pull/35#issuecomment-5598749925)

Proposed squash title/body:

```
feat: carry the CTO positioning to the landing page and card (pr #35)
```

```
PR #31 repositioned the CV around a fractional, hands-on CTO offer and
left the surfaces that carry it to strangers behind. Feedback from an
industry CEO on the live site named them: the landing page still opened
as a developer looking for a position, under a heading that read `/dev`;
the offer had no engagement for architecture and foundations; the two
framings sat behind a toggle that read as indecision; and the picture
suited a developer. Behind that last point was a hand-committed PNG
with the dev tagline in its pixels, served as `og:image` for both
framings, that nothing in the tree checked.

The landing page makes the offer in its first screen. The site tagline
heads the offer section — held in `SITE_CONFIG` because it is also
what every page without a description of its own unfurls with — over
one framing paragraph and the engagement names read off the CV's own
catalogue; the hero keeps the name and the overlords line, and the
projects and highlights follow. No section there is headed by its slash
name: `Section` titles only a page that is a single section, as
`/writing` and `/music` are. The offer gains "Architecture and
foundations", and standing technical judgment gives up the clause that
bullet now covers. Bullet labels stop carrying their own colon — the
renderer sets it — which surfaced two shapes under one key: labels a
colon follows, and clauses the text continues from, now `lead`. The
header toggle becomes one invitation to the other framing at the foot
of the sheet, opposite the back link.

Each framing gets its own card, generated from that same catalogue as
an HTML page `render-og.ts` screenshots beside the chart cards, so it
cannot contradict the page. It is composed as a business card: the
portrait, name and tagline over the site, GitHub and LinkedIn addresses
on one side of a rule; on the other the framing's own offer — the head
block of the list `OFFER_BLOCKS` gives each variant, every bullet
shortened to the label naming it — so a card advertises work rather
than asserting a quality. The manifest hashes the page and the
portrait, and the script moves to `tsx` to import the catalogue; the
prune walk takes a directory list, these renders living outside the
content tree. The portrait publishes its real 1024 square, not 150.

Two defects turned up alongside: the layout route never re-exported the
root `metadata`, so `/` shipped with no title and no Open Graph tags at
all, and its title was erased by a spread. Both fixed, so the home page
unfurls with the tagline and the portrait.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

_Generated by [Claude Code](https://claude.ai/code)_


---

## Review threads

### `public/cv/cto.og.png`:1 — resolved

**@vzakharov** — 2026-09-09T12:05:52Z

the layout, heading & tagline are fine -- but the prose itself says nothing. Suggest either taking from or adopting a shorter version of "what I offer". Same for the dev one.

Let's also put github & linkedin links. In general, a physical business card-like view is welcome.

**@vzakharov** — 2026-09-09T12:32:22Z

Reworked in 2dc4e5e — the card is now split down a rule like a business card: portrait, name, tagline and the three addresses (site, GitHub, LinkedIn) on the left; the offer on the right under the catalogue’s own "What I Offer" heading.

The prose comes from the CV rather than being written for the card: `OFFER_BLOCKS` already names which blocks each framing shows and in what order, so the card takes the head of that list and shortens each bullet to its label. `cto` gets the five engagement names, `dev` the three core capabilities as written — so the two differ by more than the tagline, and neither can advertise something the sheet does not. `metadata.ogSuffix`, the line that was there, still feeds the `og:description`.

Both renders are committed; worth eyeballing them in the diff.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/typings/index.ts`:25 — unresolved

```diff
@@ -21,6 +21,9 @@ export type MaybeTitled = { title?: string };
 
 export type Described = { description: string };
 
+/** The short name a thing is shown or logged under. */
+export type Labelled = { label: string };
```

**@vzakharov** — 2026-09-09T12:07:27Z

the double `l` in `Labelled` hurts a bit -- did we decide to feign British at any point?

**@vzakharov** — 2026-09-09T12:32:33Z

No, that was just me — renamed to `Labeled` in 969f247, along with `LabelledText` in the CV bullets.

The two `labelled`s still in the tree are authored prose, not identifiers (the Playgram case study and one line of the content rule), and editing the case study would re-flag its committed PDFs. Say the word if you want those too.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-09T13:02:45Z

yes let's change them too, they were probably the reason you reached for the double l in the first place

---

### `package.json`:19 — resolved

```diff
@@ -16,7 +16,7 @@
     "format": "prettier --write .",
     "format:check": "prettier --check .",
     "content:mermaid": "node scripts/render-mermaid.ts",
-    "content:og": "node scripts/render-og.ts",
+    "content:og": "tsx scripts/render-og.ts",
```

**@vzakharov** — 2026-09-09T12:09:51Z

just curious, why the switch?

**@vzakharov** — 2026-09-09T12:32:43Z

The CV card reads its copy from the message catalogue, and that reaches `en.json` through `loadMessages` — a JSON import bare Node will not take without an explicit attribute:

```
TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Module ".../messages/en.json"
needs an import attribute of "type: json"
```

The alternative was adding `with { type: 'json' }` to `src/shared/i18n/load-messages.ts` — editing app source to suit a script runner — so `tsx` seemed the smaller change. It also buys the `@/` aliases, which bare Node cannot resolve either; the other render scripts reach `src/` by relative path and stay on bare Node.

Left as it is, with the reason in the script's own docstring.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

## Timeline (status, references, and other events)

- **2026-09-09T12:09:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/35#pullrequestreview-5153980886.
- **2026-09-09T12:09:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/35#pullrequestreview-5154017496.
