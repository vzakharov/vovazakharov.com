> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Bring the theme picker back as a two-state toggle

## What this changes

`38225ef` on this branch dropped the Light/Dark/Auto toggle and pinned the site
to `prefers-color-scheme`. The reader-facing verdict is that having no control
is worse than having a confusing one, so the control comes back — as **two
visible states, light and dark**, with one rule underneath:

> **A scheme the reader picks that agrees with their system scheme is stored as
> no preference at all.** Only a pick that disagrees is a preference.

So `localStorage` holds exactly one of two things: a scheme _opposite_ to the
reader's system setting at the moment they picked it, or nothing. In one
sentence, for anyone who has to explain the behaviour later: **the site follows
your system until you pick the other scheme; that pick then stands — through
your system's own changes included — until you pick your system's scheme back,
which hands control to the system again.**

The reader sees a plain two-state switch. The machine sees `auto` or one
explicit value, and never records an explicit value that duplicated the
system's at the time it was chosen.

## Why this works out to a small diff

The picker's removal is unmerged: it is `38225ef` on this branch, behind draft
PR [#36](https://github.com/vzakharov/vovazakharov.com/pull/36). So most of this
work is **un-writing that commit** rather than writing new code — the five
`<Group justify="flex-end">` deletions, the article page's nav collapse, the
`ui.toggleTheme` catalogue removal, and the `.claude/rules/fsd.md` /
`README.md` / `src/README.md` repointing all come back to what `main` says, and
the pair cancels out in the squash. What is genuinely new is one pure function,
the click that reads it, and the provider's manager going back to Mantine's
default.

Two loose ends the removal left get closed by the same move: `theme.ts` still
carries an `ActionIcon: { classNames: … }` entry that nothing renders, and
`theme.module.scss`'s `.control` class is styling nothing on that component.

## Mechanics, and the footguns in them

### The rule, as one function

`src/features/switch-theme/lib/color-scheme.ts`:

```ts
/**
 * A pick equal to the reader's system setting is not a preference — `auto` is
 * the same paint with none of the stickiness. Fires only on a click: a stored
 * preference is never revisited, so an override outlives a system change.
 */
export function preferredColorScheme(
  picked: 'light' | 'dark',
  system: 'light' | 'dark',
): MantineColorScheme {
  return picked === system ? 'auto' : picked;
}
```

The click passes the scheme the reader is asking for — the opposite of the one
on screen — and applies the result: `auto` → `clearColorScheme()`, anything else
→ `setColorScheme(value)`. Mantine's `clearColorScheme` sets the provider's
value to `defaultColorScheme` (`'auto'` here) _and_ removes the storage key,
which is exactly "hand control back to the system".

Nothing reads the rule outside that handler. Storage is written and cleared by
clicks and by nothing else, so there is no effect, no media-query listener of
our own, and no state that changes while the reader is not touching the button.

### Footgun 1 — read the system scheme in the handler, not through the hook

The reflex is `useComputedColorScheme()`, and it defaults to
`{ getInitialValueInEffect: true }` — so its **first render returns `'light'`
whatever the reader's OS says**, correcting only in an effect. Nothing here
needs a hook at all: the handler has both halves it wants, the stored value from
`useMantineColorScheme()` and the system value from
`globalThis.matchMedia('(prefers-color-scheme: dark)')`, and it resolves the
scheme on screen from the pair (`colorScheme === 'auto' ? system : colorScheme`).
Reading the media query at click time sidesteps the deferred-value trap rather
than working around it.

### Footgun 2 — the icon cannot be chosen in JavaScript

The site is a static export: the prerendered HTML is built with no knowledge of
the reader's scheme, so an icon picked from React state is the light-scheme icon
for everyone until hydration. The removed toggle answered this by rendering an
empty `38×38` box until `useMounted()` — a placeholder the reader watched pop.

**Both icons render, and CSS picks one.** `ColorSchemeScript` sets
`data-mantine-color-scheme` on `<html>` from inside `<head>`, before first
paint, and `styles/_mantine.scss`'s `light` / `dark` mixins key off exactly that
attribute — so the correct icon is painted on the first frame, with no
placeholder and no pop. This is why the `useMounted` hack does not come back.

The icons are `aria-hidden`; the button's name is a single static
`aria-label` from `ui.toggleTheme`, as on `main`.

### Footgun 3 — no storage migration is needed, and it is worth knowing why

`theme-provider.tsx`'s current `colorSchemeManager` exists to _erase_ Mantine's
storage key, so that readers who used the three-state toggle stop overriding the
system scheme. It goes, along with `LEGACY_SCHEME_KEY` and
`forgetStoredScheme`, and Mantine's default `localStorageColorSchemeManager`
takes over.

No migration rides with it. The erasing manager has never deployed — nothing
runs on pull requests and this branch is a draft — so the only stored values in
the wild are what `main`'s three-state toggle wrote: `light`, `dark` or `auto`,
all three of which the default manager reads back correctly, and all three of
which this design can also produce.

### Footgun 4 — every PDF is re-flagged, and re-rendering is in scope

`PRINT_SOURCES` in `scripts/render-pdf.ts` names `src/shared/ui`,
`DOCUMENT_SOURCES` names `src/pages/case-studies/ui`, and `CV_SOURCES` names
`src/pages/cv` — and the toggle's call sites include `article-page.tsx` and
`cv-sheet.tsx`. So **`pnpm content:pdf --check` will fail** until the CV's four
PDFs and every case-study PDF are re-rendered and committed, whatever layer the
toggle itself lands in. `pnpm content:pdf` needs the pre-installed Chromium;
the run is part of implementation, not a follow-up.

The Open Graph cards are **not** affected: `cvCards()` hashes the generated card
page plus the `cv.header` / `cv.contact` / offer-heading slices and the
portrait, and `ui.toggleTheme` is none of them.

The toggle itself carries `print-hidden` — baked into the component the way
`ChipNav` bakes it in, rather than left to each call site. On `main` four of the
six call sites printed the control.

## The accepted cost

The rule cannot distinguish "light, because it is night and my OS has not caught
up" from "light, always" — that is the collapse that buys the two-state control,
not a bug in it. It has one consequence worth stating rather than discovering:

**A reader on a scheduled-switching OS who tries the other scheme and changes
their mind is put back on `auto`, and so gets switched at nightfall.** Daytime,
OS light, nothing stored: click → `dark` is stored; click again → light agrees
with the system, so it is _cleared_ rather than pinned. At 21:00 the OS flips
and the page goes dark, and from where the reader sits they chose light and were
overruled. This is the documented failure mode of exactly this design — see the
tri-state argument in "Sources" below.

Two things bound it. It reaches only readers whose OS switches on a schedule at
all: where the system scheme is fixed, agreement never arises after the fact and
the toggle behaves as an ordinary sticky two-state switch. And the escape is the
toggle itself — one click at nightfall stores `light` against a dark system,
which is a preference the rule keeps for good.

**What stays unavailable to a scheduled-switching reader is saying "always
light" in daylight**: at that moment the pick duplicates the system and is read
as no preference. Saying it after dark works and sticks. Accepting that is
accepting the premise — if it turns out to matter, the fix is a third state,
which is the thing this design exists to avoid.

## Steps

1. **Restore `src/features/switch-theme/`** with the layer directory:
   - `lib/color-scheme.ts` — `preferredColorScheme` above.
   - `lib/color-scheme.test.ts` — the rule as a table: a pick equal to the
     system gives `auto`, a pick against it gives the pick back.
   - `ui/theme-toggle.tsx` — an `ActionIcon` at `size={38} radius={4}` with
     `variant="default"`, holding an `aria-hidden` `Sun` and `Moon`, labelled
     `ui.toggleTheme`, classed `print-hidden`. The click resolves the scheme on
     screen from `useMantineColorScheme()` plus the media query, asks for its
     opposite, and applies `preferredColorScheme`.
   - `ui/theme-toggle.module.scss` — `.whenLight` / `.whenDark`, each
     `display: none` under the opposite scheme through `styles/_mantine.scss`'s
     `light` / `dark` mixins.
   - `index.ts` — `export { ThemeToggle } from './ui/theme-toggle';`
2. **Revert `theme-provider.tsx`** to `main`'s shape: drop `colorSchemeManager`,
   `LEGACY_SCHEME_KEY` and `forgetStoredScheme`; keep
   `defaultColorScheme="auto"` on the provider and on `ColorSchemeScript`.
3. **Restore the six call sites** as `main` has them — `<Group justify="flex-end">`
   on home, writing, music and the case-studies index; the article page's nav
   back to a `space-between` `Group` with the back-link; the CV header's
   `<Group gap={8}>` around `LocalePicker` and the toggle. `.hover-dim` stays a
   global utility (the article back-link and `FileLink` both claim it), so that
   part of `38225ef` is _not_ reverted.
4. **Restore `ui.toggleTheme`** in `en.json` and `ru.json` — the
   `vova/no-hardcoded-strings` rule is what requires it.
5. **Repoint the docs** back: `.claude/rules/fsd.md`'s layer table and its
   "absent because nothing earns them" paragraph, `src/README.md`'s layer list,
   `README.md`'s theme line, tree entry and feature bullet. Each states the
   two-state rule where it used to state the three — `README.md`'s theme line
   becomes something like "Light and dark, defaulting to the reader's system
   scheme".
6. **Re-render the PDFs** — `pnpm content:pdf`, commit the output.
7. **Look at it** — `/preview` in both schemes, on the CV and on one shell page,
   plus the pre-hydration frame (a throttled load) to confirm no icon pop.
8. **Vet** — `./scripts/vet.sh`.
9. **Reconcile PR #36** — its body and the `Proposed squash title/body:` comment
   both currently say the picker is removed. `/finalize` owns the reconciliation;
   the QA checklist's `no-toggle` and `stale-theme` rows are replaced by rows for
   the two-state rule and for an override outliving a system change.

## Verification the checklist should carry

- Toggling on a dark system: click → light and the storage key holds `light`;
  click → dark and **the key is gone**, not set to `dark`.
- Same on a light system, mirrored.
- With `light` stored, flip the OS to light and then back to dark: the page
  stays light throughout and the key is untouched — an override is not revisited.
- With nothing stored, flip the OS with the page open: the page follows, live.
- Hard-load a dark-system browser: the moon/sun shown is correct on the first
  frame, and no empty box precedes it.
- Ctrl+P on the CV and on an article: no toggle on the sheet.

## DRY notes

- **`preferredColorScheme` is extracted for testability, not for sharing** — it
  has one caller. It is its own module because the rule is the part of this
  change that can be wrong in a way `pnpm build` cannot see, and a pure function
  of two arguments is exactly what CLAUDE.md § "Testing" says belongs in the
  runner rather than in a QA row. Keeping it inline would leave the only
  statement of the rule inside a click handler, reachable solely through a
  browser.
- **Nothing is extracted to `shared/`.** The toggle's only consumers are page
  slices, and its logic has no consumer outside the slice — so `features/` holds
  both the component and its `lib`, and no `shared/` segment gains a member.
  Putting the rule in `shared/` would be the move only if the provider needed it
  too, and it does not: `clearColorScheme`/`setColorScheme` are the whole of the
  provider's involvement, and both are Mantine's.
- **The repeated `<Group justify="flex-end"><ThemeToggle /></Group>` on four
  shell pages is left duplicated on purpose.** Hosting it inside `PageShell`
  would cut those four to zero, but `PageShell` is `shared/ui` and may not
  import upward from `features/` — so that refactor forces the toggle down into
  `shared/ui`, which is where a primitive lives, not a capability. Four
  three-line wrappers is the cheaper side of that trade, and it is the shape
  `main` already has. `/dry` gets a second look at it against the real diff.
- **`.hover-dim` stays global**, as `38225ef` made it — the article back-link and
  `FileLink` sit in slices that cannot reach each other sideways, and that is
  unrelated to the toggle. Not reverted.
- **The `useMounted` placeholder is not reused.** It was the removed toggle's
  answer to footgun 2; the CSS-keyed icons answer it without reserving space, so
  copying the old component wholesale would carry a hack whose reason is gone.

## Decisions

**A stored preference is never revisited.** The rule fires on a click and
nowhere else, so an override survives the reader's own system changing under it
— the reasoning being that someone who picked against their system is attached
to that scheme, and a click is the only thing that should be able to undo it.
Handing control back is the same gesture in reverse: picking the scheme the
system currently has clears the key. Rejected: also applying the rule on mount
and when the OS flips, so that agreement decays to `auto`. It would keep the
storage invariant true at all times rather than only at write time, but it also
means no preference can outlive one day/night cycle — which is the opposite of
what an override is for.

**The icon shows the scheme you'll get** — a moon while light, a sun while dark.
That is the majority convention in the write-ups below. Rejected: showing the
scheme you are in, which is what the removed three-state toggle did and what
Docusaurus settled on when it closed the same reversal request as `wontfix` —
a real split in practice, and defensible, but it reads as status rather than as
a control. The sources pair the target icon with a label naming the action
("Switch to dark mode"), and that half is dropped: a scheme-dependent accessible
name would have to be switched in CSS here, and the readers it would inform are
largely not the readers a light/dark control is for. One static `ui.toggleTheme`
carries the name, as on `main`. A hover tooltip was considered and dropped too —
the site has no tooltips anywhere.

**`features/switch-theme`, the layer directory restored** — it is what
`.claude/rules/fsd.md` names the layer for, the slice has five upward consumers
so Steiger's `insignificant-slice` is satisfied, and it keeps this branch's diff
against `main` largely cancelling. Rejected: `shared/ui/theme-toggle.tsx`, which
would let `PageShell` host it and cut four call sites — see the DRY notes.

**All six surfaces, as `main` had them** — a control present on some pages and
not others is worse than either extreme, and the CV is where a reader is most
likely to be reading at length. Rejected: skipping the CV, whose header already
carries the language chips and the `.pdf` link.

## Sources

- [The Case for Tri-State Dark Mode Toggles — Bram.us](https://www.bram.us/2026/08/18/the-case-for-tri-state-dark-mode-toggles/) — names the nightfall case above as the specific failure mode of a two-state toggle that maps one option back to "system".
- [The UX of dark mode toggles — Dylan Smith](https://dylanatsmith.com/writing/the-ux-of-dark-mode-toggles) — the persistence question this design answers, and its six options; "reversible preference" is the family this one belongs to.
- [Dark/Light Mode Toggle: a Usability Issue — DEV](https://dev.to/zetareticoli/dark-light-mode-toggle-a-usability-issue-1gg2) — the argument that a target-state icon needs a label naming the action to carry current state.
- [Light/dark mode toggle icon is reversed — facebook/docusaurus#11370](https://github.com/facebook/docusaurus/issues/11370) — the minority side of the icon convention, closed `wontfix`.
