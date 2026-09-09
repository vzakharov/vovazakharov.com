# PR #35: feat: carry the CTO positioning onto the landing page and card

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/35
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/cto-positioning-feedback-i4smdh
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-09T08:25:04Z
- **Updated:** 2026-09-09T12:09:54Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Why.** External feedback from an industry CEO on the live site, after PR #31 repositioned the CV: the repositioning is right but half-applied. `/` still opened as a developer looking for a position under a heading that read `/dev`, the offer had no engagement for architecture and foundations, and the CV's two framings sat behind a toggle at the top of the sheet that read as indecision.
- **The landing page leads with the offer.** The site tagline heads the offer section — held in `SITE_CONFIG.tagline` because it is also the default description every page without one unfurls with — over one framing paragraph, the engagement names read off the CV's own catalogue, and the CV button; the hero above it is the name and "Helping our future overlords walk since 2020", and the projects and highlights follow. No section on the page is headed by its slash name any more: `Section` titles itself from its id only when it is the whole page, which is what `/writing` and `/music` rely on for their `h1`. The CV's offer gains "Architecture and foundations" second in the list; the switcher is gone from the CV header and one invitation to the other framing sits at the foot of the sheet opposite the back link.
- **A catalogue shape surfaced by the colon cleanup.** Moving the colon into the renderer showed that `{label, text}` held two kinds of bullet: labels a colon follows, and clauses the text continues from ("Sub-second cold loads, down from multi-second", "Django / FastAPI – If you…"). The second kind is now `lead`, and `CvBullets` sets no colon after it. This is the one place the implementation departs from the plan's wording.
- **The social card is generated per framing.** `public/cv_card.png`, a hand-committed composite with the developer tagline baked in and served for both framings, is deleted. `pnpm content:og` now renders `public/cv/<variant>.og.png` from an HTML page `scripts/lib/cv-card.ts` generates off the message catalogue and the portrait — HTML rather than the plan's SVG because the proof line is a sentence and SVG text does not wrap. The manifest hashes the page and the portrait's bytes; the script runs under `tsx`; the prune walk takes a `manifestDirs` list. The chart card's render and hash are untouched. The PDFs are re-rendered because `shared/config`, one of their hashed sources, now carries the tagline.
- **Two pre-existing defects fixed on the way.** The layout route re-exported only the component, so the root `metadata` never reached Next and `/` shipped with no title and no Open Graph tags at all — on main and on the live site. Fixed by re-exporting it as the pages do; a second commit routes the title through the helper, whose spread had been erasing it. The avatar's declared 150×150 is corrected to the file's 1024×1024.
- **The review note** bumps "It edits the copy in front of it, not the fact behind it" to ×4 with the stale card, per CLAUDE.md § "GitHub comments".

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
- [ ] `card-look` — open `public/cv/cto.og.png` and `public/cv/dev.og.png`: portrait left, name / tagline / proof line / site right, nothing clipped, legible at thumbnail size
- [ ] `card-drift` — edit the CTO tagline in `en.json`, run `pnpm content:og --check`, confirm it flags `public/cv/cto.og.png` and not the dev card; revert
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
| `card-drift` | unit | ❌ | The point of the generator: assert the source hash moves when the catalogue does |
| `og-cv` | integration | ❌ | Grep the static export for the `og:image` triple — cheap, and exactly the check that was missing |
| `og-home` | integration | ❌ | Same grep, other page; it would have caught the layout route dropping `metadata` |
| `pdf` | unit | ❌ | `content:pdf --check` covers staleness; nothing asserts the PDF's content |
| `themes` | manual-only | — | Visual, via `/preview` |

https://claude.ai/code/session_0128iwLMndKDGtqFBhWz8RxL
https://claude.ai/code/session_01HPvRSAK6f5Dga6Gev8y46E

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
left behind the surfaces that carry it to strangers. Feedback from an
industry CEO on the live site named them: the landing page still opened
as a developer looking for a position under a heading that read `/dev`,
the offer had no engagement for architecture and foundations, the CV's
two framings sat behind a toggle that read as indecision, and the
picture suited a developer. Behind that last point was a stale card: a
hand-committed PNG with the dev tagline in its pixels, served as
`og:image` for both framings, that nothing checked.

The landing page makes the offer in its first screen. The site tagline
heads the offer section — held in `SITE_CONFIG` because it is also
what every page without a description of its own unfurls with — over
the engagement and each kind of it read off the CV's own catalogue; the
hero above it keeps the name and the overlords line, and the projects
and highlights follow. No section there is headed by its slash name:
`Section` titles only a page that is a single section, as `/writing`
and `/music` are. The offer gains
"Architecture and foundations", and standing technical judgment gives
up the clause that bullet now covers as work. Bullet labels stop
carrying their own colon — the renderer sets it — which surfaced two
shapes under one key: labels a colon follows, and clauses the text
continues from, now `lead`. The CV's header toggle becomes one
invitation to the other framing at the foot of the sheet, opposite the
back link.

The card is generated per framing from that same catalogue, as an HTML
page `render-og.ts` screenshots beside the chart cards, so it cannot
contradict the page; the manifest hashes the page and the portrait, and
the script moves to `tsx` to import the catalogue. The prune walk takes
a directory list, since these renders live outside the content tree.
The portrait publishes its real 1024 square instead of 150.

Two defects turned up alongside: the layout route never re-exported the
root `metadata`, so `/` shipped with no title and no Open Graph tags at
all; and its title was erased by a spread. Both fixed, so the home page
now unfurls with the tagline and the portrait.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
```

---

_Generated by [Claude Code](https://claude.ai/code)_


---

## Review threads

### `public/cv/cto.og.png`:1 — unresolved

**@vzakharov** — 2026-09-09T12:05:52Z

the layout, heading & tagline are fine -- but the prose itself says nothing. Suggest either taking from or adopting a shorter version of "what I offer". Same for the dev one.

Let's also put github & linkedin links. In general, a physical business card-like view is welcome.

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

---

### `package.json`:19 — unresolved

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

---

## Timeline (status, references, and other events)

- **2026-09-09T12:09:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/35#pullrequestreview-5153980886.
- **2026-09-09T12:09:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/35#pullrequestreview-5154017496.
