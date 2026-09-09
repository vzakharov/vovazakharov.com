# PR #36: feat(cv): refresh the CV and rebuild the theme picker as two-state

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/36
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/cv-refresh-rbfhk2
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-09T18:34:12Z
- **Updated:** 2026-09-09T23:30:21Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Retitles the CV's experience entries up to `randddb`** — Playgram → **Fractional CTO**, `englishForKids`/`orcool` → **Senior Fullstack Developer**, `randddb` → **Fullstack Developer** — and drops the `– Project Work` qualifiers, since most of the history the CV now shows _is_ project work. The Russian counterparts leave the seniority and stack terms untranslated.
- **Reworks the CV's header**: the theme toggle moves into its top-right corner, and an `[EN] [RU]` chip pair with a `.pdf` link sits _below_ the hero — the shape the article header already uses for a document's cuts and files, since that row acts on the document rather than introducing it. The flag picker and the `globalThis.print()` button both go, and the name heading links home.
- **Rebuilds the theme picker as a two-state control.** Light and dark are the only states a reader sees, over one rule: **a pick that agrees with the reader's system scheme is stored as no preference at all.** So the site follows the system until the reader picks the other scheme; that pick then stands — through the system's own changes included — until they pick their system's scheme back, which hands control to the system again. `preferredColorScheme` is the whole rule and has its own tests; the click reads the system scheme from the media query rather than `useComputedColorScheme`, whose first render reports `light` whatever the OS says. Both icons render and CSS picks one off `data-mantine-color-scheme`, so the right icon is painted on the first frame with no placeholder — and the toggle carries `print-hidden` itself, which four of `main`'s six call sites did not.
- **Parks the toggle in the header's corner, and takes its chrome off.** On home and the CV it cost a row of its own — a 38px control plus the page stack's gap — for something that needs no band; it now sits in the top-right of the header itself, out of the flow, through a `CornerHeader` in `shared/ui` that owns both halves of the positioning so a caller cannot pair an absolute corner with a header that forgot to be its context. Everywhere it renders it also drops `variant="default"`, the hairline box the site's real controls wear, for a bare grey glyph that comes up to full on hover.
- **Brings the CV into the committed-PDF pipeline** at `public/cv/<variant>/<locale>.pdf`, keyed off the canonical address so the short rungs offer the same file rather than duplicating it. `content:pdf` runs under `tsx` now and its source list is factored into `PRINT_SOURCES` / `DOCUMENT_SOURCES` / `CV_SOURCES`; a CV printable hashes only its own locale's catalogue. All seven PDFs are re-rendered and committed.
- **Two extractions the plan called for, and two it did not.** `ChipNav` and `FileLink` move down to `shared/ui` (`pages/cv` may not reach sideways into `pages/case-studies`), and `DocumentFile` moves to `shared/typings`. Beyond the plan: `.hover-dim` became a global utility beside the print ones, because the article's back-link claims it as well as `FileLink`; and `pageFile` factors the download-name shaping into `shared/config`, which is also where a client component can reach it.

## QA Checklist

- [ ] `titles` — open `/cv/cto/en` and `/cv/cto/ru`; each experience entry shows its new role title, and the company and dates still read off the line below it
- [ ] `lang-chips` — on the CV, `EN` and `RU` render as chips below the hero, the current one inverted and inert; clicking the other lands on the same framing in the other language
- [ ] `cut-chips` — open `/case-studies/playgram`; the Full / Mini / Nano switcher looks and behaves exactly as it did before the chip control moved to `shared/ui`
- [ ] `pdf-link` — the CV's `.pdf` link downloads (rather than opens) `vova.cv.cto.en.pdf`, and the file is the CV as the print stylesheet renders it, with no header controls on it
- [ ] `pdf-rungs` — `/cv` and `/cv/cto` offer the same PDF their canonical address does, not a 404
- [ ] `home-link` — clicking the "Vova Zakharov" heading on the CV goes to `/`, and the heading still reads as a heading (no underline, inherited colour)
- [ ] `two-state` — on a dark system with nothing stored: one click gives light and `mantine-color-scheme-value` holds `light`; a second click gives dark and **the key is gone**, not set to `dark`. Mirrored on a light system
- [ ] `override-sticks` — with `light` stored, flip the OS to light and back to dark: the page stays light throughout and the key is untouched
- [ ] `system-theme` — with nothing stored, flip the OS between light and dark with the site open: every page follows, live
- [ ] `icon-frame` — hard-load on a dark system: the sun is correct on the first frame, with no empty box and no moon-to-sun pop before it
- [ ] `toggle-everywhere` — home, writing, music, the case-studies index, an article and the CV each render the toggle, and none of them prints it
- [ ] `toggle-corner` — on `/` and `/cv/cto/en` the toggle sits in the top-right of the header — level with the avatar, level with the name — and no empty band is left above either hero
- [ ] `toggle-quiet` — in both schemes the toggle is a borderless grey glyph, and hovering it brings it to full strength rather than dimming it
- [ ] `print` — Ctrl+P on the CV still produces the same sheet the committed PDF holds

| Item                | Automatable | Covered? | Notes                                                                          |
| ------------------- | ----------- | -------- | ------------------------------------------------------------------------------ |
| `titles`            | unit        | ❌       | Catalogue assertion over `cv.experience.*.title` for both locales              |
| `lang-chips`        | e2e         | ❌       | Drive `/cv/cto/en`, click `RU`, assert the URL and the inverted chip           |
| `cut-chips`         | unit        | ❌       | Component test over `ChipNav`: current renders inert, others as links          |
| `pdf-link`          | integration | ❌       | Assert the anchor's `href`/`download` and that the file exists under `public/` |
| `pdf-rungs`         | integration | ❌       | Same assertion over the two short rungs, against the canonical path            |
| `home-link`         | e2e         | ❌       | Click the `h1` on `/cv`, assert navigation to `/`                              |
| `two-state`         | unit        | ✅       | `preferredColorScheme` — the rule as a table, both systems both directions      |
| `override-sticks`   | e2e         | ❌       | Emulate `prefers-color-scheme`, click, flip the emulation, assert storage       |
| `system-theme`      | e2e         | ❌       | Emulate `prefers-color-scheme` and assert `data-mantine-color-scheme`          |
| `icon-frame`        | integration | ❌       | Assert both icons and their scheme classes are in the prerendered HTML          |
| `toggle-everywhere` | e2e         | ❌       | Assert the control renders on each of the six routes and is hidden in print     |
| `toggle-corner`     | e2e         | ❌       | Assert the control's box sits inside the header's and no row precedes it       |
| `toggle-quiet`      | manual-only | —        | Resting opacity and the hover direction are a visual judgment                  |
| `print`             | manual-only | —        | Print fidelity is a visual judgment against the committed PDF                  |

`two-state` is the one row the suite covers: `preferredColorScheme` is a pure function of two arguments, which is what CLAUDE.md § "Testing" says belongs in the runner rather than a checklist row. The rest of the toggle's behaviour was driven for real in this session — clicks and `prefers-color-scheme` emulation over CDP, confirming every storage transition above — but that harness was scratch, not a committed test. For everything else `pnpm build` plus the two render `--check`s are what stand behind this branch.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01PXB3UF8SiKuA8hrogYoTn1



---

## Comments

### Comment by @vzakharov on 2026-09-09T18:35:03Z

[https://github.com/vzakharov/vovazakharov.com/pull/36#issuecomment-5606860641](https://github.com/vzakharov/vovazakharov.com/pull/36#issuecomment-5606860641)

Proposed squash title/body:

```
feat: refresh the CV's roles and controls, rework the theme picker (pr #36)
```

```
The CV filed five years of work under one word, "Developer", including
the engagement it now leads with. Its header carried three controls,
each behaving unlike anything else on the site: a flag showing the
language you were already reading, a button that opened the browser's
print dialog, and a theme toggle cycling three states.

The titles say what the work was — Fractional CTO at Playgram, Senior
Fullstack Developer for the two project engagements above it, Fullstack
Developer for randddb — in both catalogues, with the seniority and
stack terms left untranslated in the Russian one, as they are in the
market it reads to.

The language switch becomes the chip pair the article header already
offers for a document's cuts: both languages shown, the current one
inverted and inert. The print button becomes the `.pdf` link every
other document offers. Both controls move down to `shared/ui`, the CV
having no sideways reach into `pages/case-studies` for either, and they
sit below the hero as the article's row does, since they act on the
document rather than introduce it. The CV joins the committed-render
pipeline — one PDF per canonical `/cv/<variant>/<locale>`, the short
rungs linking to theirs, and `content:pdf` moving to `tsx` to reach the
CV's own addresses. Its source list splits into the print surface both
kinds share and a per-kind remainder, so an English reword leaves the
Russian sheet alone. The name heading links home.

The theme toggle keeps two visible states over one rule: a pick that
agrees with the reader's system scheme is stored as no preference at
all. So the system leads until the reader picks the other scheme; that
pick then stands, through the system's own changes included, until they
pick the system's scheme back, which hands control to it again. The
click reads the media query rather than a hook whose first render says
`light` whatever the OS says, and both icons render for CSS to choose
between, so the right one is painted on the first frame rather than
after hydration.

It also stops presenting as a control. Where the site's buttons and
chips wear a hairline box, the toggle is a bare grey glyph that comes up
to full on hover; and on home and the CV it sits in the top-right corner
of the header rather than on a row of its own, out of the flow, so a
page that spent a band on it now starts at its heading. `CornerHeader`
owns both halves of that positioning, so no caller can pair an absolute
corner with a header that forgot to be its context.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PXB3UF8SiKuA8hrogYoTn1
```

---

_Generated by [Claude Code](https://claude.ai/code)_


---

## Review threads

### `src/pages/case-studies/ui/article-page.tsx`:96 — unresolved

```diff
@@ -93,7 +93,7 @@ export async function ArticlePage({ params }: Props) {
             <InternalLink
               href={collectionRoute(COLLECTION)}
               size="sm"
-              className={classes['hoverDim']}
+              className="hover-dim"
```

**@vzakharov** — 2026-09-09T23:24:24Z

hmmm, why are we bypassing modules here? not a fan (in other such places too)

---

### `src/shared/ui/chip-nav.tsx`:34 — unresolved

```diff
@@ -0,0 +1,52 @@
+'use client';
+
+import { Box, Group } from '@mantine/core';
+
+import { cx } from '@/shared/lib/class-names';
+import type { Labeled, Linked } from '@/shared/typings';
+
+import classes from './chip-nav.module.scss';
+import { InternalLink } from './internal-link';
+
+/** One destination in the row; the current one renders inert rather than linked. */
+export type Chip = Labeled &
+  Linked & {
+    current: boolean;
+    /** The language the chip's destination is in, where the row switches one. */
+    hrefLang?: string;
+  };
+
+export type ChipNavProps = { chips: Chip[] };
+
+/**
+ * Every alternative shown at once, the current one inverted and inert. A row of
+ * links rather than a control, so the switch works before hydration.
+ */
+export function ChipNav({ chips }: ChipNavProps) {
+  return (
+    <Group component="nav" gap={8} wrap="wrap" fz="sm" className="print-hidden">
+      {chips.map(({ label, href, current, hrefLang }) =>
+        current ? (
+          <Box
+            key={label}
+            component="span"
+            aria-current="page"
+            className={cx(classes['chip'], classes['chipCurrent'])}
```

**@vzakharov** — 2026-09-09T23:27:04Z

let's file an issue to re-api cx to a la `cx(classes, 'chip', 'chipCurrent')` & sweep

---

### `writing/notes/the-five-percent.md`:1 — unresolved

**@vzakharov** — 2026-09-09T23:28:57Z

isn't 400 lines the agreed ceiling? let's put a vet.sh-controlled check

---

### `src/shared/ui/corner-header.tsx`:1 — unresolved

**@vzakharov** — 2026-09-09T23:30:16Z

frankly, not a fan of idea of putting this in every consumer that needs a theme switcher -- because all of them do. I'd rather prefer a layout (if that's the right term)-based approach where the theme always comes. but not here, so let's file an issue

---

## Timeline (status, references, and other events)

- **2026-09-09T20:16:49Z** @vzakharov renamed from «docs: plan the CV refresh and the theme picker's removal» to «feat(cv): refresh the CV and retire the theme picker».
- **2026-09-09T22:47:12Z** @vzakharov renamed from «feat(cv): refresh the CV and retire the theme picker» to «feat(cv): refresh the CV and rebuild the theme picker as two-state».
- **2026-09-09T23:29:11Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/36#pullrequestreview-5160891067.
- **2026-09-09T23:30:21Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/36#pullrequestreview-5160932227.
