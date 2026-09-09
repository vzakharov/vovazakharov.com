> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Bring the theme picker back as a two-state toggle

## What this changes

`38225ef` on this branch dropped the Light/Dark/Auto toggle and pinned the site
to `prefers-color-scheme`. The reader-facing verdict is that having no control
is worse than having a confusing one, so the control comes back — as **two
visible states, light and dark**, with one rule underneath:

> **A scheme that agrees with the reader's system scheme is stored as no
> preference at all.** Only disagreement is a preference.

So `localStorage` holds exactly one of two things: the scheme _opposite_ to the
reader's system setting, or nothing. Concretely, on a dark system: the toggle
alternates between "follow the system" (dark, nothing stored) and "light"
(stored). The reader sees a plain two-state switch; the machine sees `auto` or
one explicit value, and never an explicit value that duplicates the system's.

That rule is the whole design, and it is one pure function used in two places —
when the reader clicks, and whenever the stored value and the system value come
to agree on their own.

## Why this works out to a small diff

The picker's removal is unmerged: it is `38225ef` on this branch, behind draft
PR [#36](https://github.com/vzakharov/vovazakharov.com/pull/36). So most of this
work is **un-writing that commit** rather than writing new code — the five
`<Group justify="flex-end">` deletions, the article page's nav collapse, the
`ui.toggleTheme` catalogue removal, and the `.claude/rules/fsd.md` / `README.md`
/ `src/README.md` repointing all come back to what `main` says, and the pair
cancels out in the squash. What is genuinely new is the toggle's own logic and
the provider's manager going back to Mantine's default.

Two loose ends the removal left get closed by the same move: `theme.ts` still
carries an `ActionIcon: { classNames: … }` entry that nothing renders, and
`theme.module.scss`'s `.control` class is styling nothing on that component.

## Mechanics, and the footguns in them

### The rule, as one function

`src/features/switch-theme/lib/color-scheme.ts`:

```ts
/**
 * A scheme equal to the reader's system setting is not a preference — `auto` is
 * the same paint with none of the stickiness. The one place the rule is stated;
 * both the click and the agreement check below read it.
 */
export function preferredColorScheme(
  scheme: 'light' | 'dark',
  system: 'light' | 'dark',
): MantineColorScheme {
  return scheme === system ? 'auto' : scheme;
}
```

- **The click** passes the scheme the reader is asking for (the opposite of the
  one on screen) and gets back `auto` or that scheme.
- **The agreement check** passes the stored scheme and gets back `auto` when it
  has come to agree with the system — which happens when the OS flips while an
  explicit preference is stored.

Applying either result is the same two lines: `auto` → `clearColorScheme()`,
anything else → `setColorScheme(value)`. Mantine's `clearColorScheme` sets the
provider's value to `defaultColorScheme` (`'auto'` here) _and_ removes the
storage key, which is exactly "forget the preference".

### Footgun 1 — `useColorScheme()` reports light on the first client render

`@mantine/hooks`'s `useColorScheme` and `useComputedColorScheme` default to
`{ getInitialValueInEffect: true }`, so the **first render returns `'light'`
whatever the reader's OS says**, correcting only in an effect. Feeding that
first value to the agreement check would clear a legitimate `light`-on-a-dark-
system preference before the correction lands.

So the system scheme is read **synchronously** —
`useComputedColorScheme('light', { getInitialValueInEffect: false })` and
`useColorScheme(undefined, { getInitialValueInEffect: false })`, or
`globalThis.matchMedia('(prefers-color-scheme: dark)')` read directly inside the
handler and effect. Nothing renders from those values (see footgun 2), so
reading them synchronously costs no hydration mismatch.

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

The `aria-label` is the one thing CSS cannot switch, which settles it as the
static `ui.toggleTheme` string the catalogues carried before ("Switch theme" /
«Переключить тему») rather than a per-state label.

### Footgun 3 — the pre-hydration script and the manager disagree, benignly

`ColorSchemeScript` reads `localStorage` with its own inline script; it does not
go through `colorSchemeManager`. So between first paint and the agreement
check's effect, the script may have painted a stored scheme the check is about
to call `auto`. **That is invisible by construction**: the check only fires when
the stored scheme equals the system scheme, and `auto` resolves to the system
scheme — the same paint either way. Worth stating because it is the kind of
disagreement that looks like a bug in a stack trace.

### Footgun 4 — no storage migration is needed, and it is worth knowing why

`theme-provider.tsx`'s current `colorSchemeManager` exists to _erase_ Mantine's
storage key, so that readers who used the three-state toggle stop overriding the
system scheme. It goes, along with `LEGACY_SCHEME_KEY` and
`forgetStoredScheme`, and Mantine's default `localStorageColorSchemeManager`
takes over.

No migration rides with it. The erasing manager has never deployed — nothing
runs on pull requests and this branch is a draft — so the only stored values in
the wild are what `main`'s three-state toggle wrote: `light`, `dark` or `auto`,
all three of which the default manager reads back correctly. An `auto` stays
`auto`; a `light`/`dark` becomes an explicit preference the agreement check then
judges on its merits.

### Footgun 5 — every PDF is re-flagged, and re-rendering is in scope

`PRINT_SOURCES` in `scripts/render-pdf.ts` names `src/shared/ui`,
`DOCUMENT_SOURCES` names `src/pages/case-studies/ui`, and `CV_SOURCES` names
`src/pages/cv` — and the toggle's call sites include `article-page.tsx` and
`cv-sheet.tsx`. So **`pnpm content:pdf --check` will fail** until the CV's four
PDFs and every case-study PDF are re-rendered and committed, whatever layer the
toggle itself lands in. `pnpm content:pdf` needs the pre-installed Chromium;
the run is part of implementation, not a follow-up.

The Open Graph cards are **not** affected: `cvCards()` hashes the generated card
page plus the `cv.header` / `cv.contact` / offer-heading slices and the
portrait, and a new `ui.toggleTheme` key touches none of them.

The toggle itself carries `print-hidden` — baked into the component the way
`ChipNav` bakes it in, rather than left to each call site. On `main` four of the
six call sites printed the control.

## Steps

1. **Restore `src/features/switch-theme/`** with the layer directory:
   - `lib/color-scheme.ts` — `preferredColorScheme` above.
   - `lib/color-scheme.test.ts` — the rule as a table: agreement on either
     scheme gives `auto`, disagreement gives the scheme back.
   - `ui/theme-toggle.tsx` — an `ActionIcon` at `size={38} radius={4}` with
     `variant="default"`, holding both a `Sun` and a `Moon`, labelled
     `ui.toggleTheme`, classed `print-hidden`. Reads the stored scheme via
     `useMantineColorScheme()` and the system scheme synchronously; the click
     computes the reader's ask (the opposite of what is on screen) and applies
     `preferredColorScheme`; an effect applies the same function to the stored
     scheme so agreement decays to `auto` on mount and whenever the OS flips
     under a stored preference.
   - `ui/theme-toggle.module.scss` — the two icons, one hidden per scheme
     through `styles/_mantine.scss`'s `light` / `dark` mixins.
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
   the two-state rule and the agreement decay.

## Verification the checklist should carry

- Toggling on a dark system: click → light and the storage key holds `light`;
  click → dark and **the key is gone**, not set to `dark`.
- Same on a light system, mirrored.
- With `light` stored on a dark system, flip the OS to light: the key clears and
  the page stays light, now following the system.
- With nothing stored, flip the OS with the page open: the page follows, live.
- Hard-load a dark-system browser: the moon/sun shown is correct on the first
  frame, and no empty box precedes it.
- Ctrl+P on the CV and on an article: no toggle on the sheet.

## DRY notes

- **`preferredColorScheme` is the shared thing, and it is genuinely shared** —
  the click path and the agreement-decay path are the same rule applied to
  different inputs, so writing it twice would let them drift into disagreeing
  about what "no preference" means. One function, one test file, two callers in
  one module.
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

## Open questions

Each is written with its recommended option already in force above, so silence
resolves them.

1. **What does the icon show — the scheme you're in, or the one you'll get?**
   - **(a) The one you'll get** — a moon while light, a sun while dark.
     _Recommended, and what the plan is written to._ A button's face should say
     what pressing it does, and the scheme you are in is already stated by the
     entire page around it.
   - (b) The scheme you're in — a sun while light, a moon while dark. What the
     three-state toggle showed, so it is the continuity option; but as a
     two-state switch it reads as decoration rather than a control.

2. **Does the agreement rule apply beyond the click?**
   - **(a) Yes — at the click, on mount, and live when the OS flips.**
     _Recommended._ Without it the rule holds only at the instant of clicking: a
     reader who picks light at night keeps an explicit `light` through the
     morning's system flip, and is silently pinned to a preference they never
     re-expressed. This is the step 1 effect.
   - (b) Click only. One fewer effect, and the stored value never changes without
     a click — at the cost of the promise going stale exactly once per OS flip.

3. **Where does the toggle live?**
   - **(a) `src/features/switch-theme/`, the layer directory restored.**
     _Recommended._ It is what `.claude/rules/fsd.md` names the layer for, the
     slice has five upward consumers so Steiger's `insignificant-slice` is
     satisfied, and it makes this branch's diff against `main` largely cancel.
   - (b) `src/shared/ui/theme-toggle.tsx`, keeping `features/` absent and
     letting `PageShell` host it. Rejected in the DRY notes above.

4. **All six surfaces, or fewer?**
   - **(a) All six, as `main` had them.** _Recommended._ A control that is
     present on some pages and not others is worse than either extreme, and the
     CV is where a reader is most likely to be reading at length.
   - (b) Skip the CV, whose header already carries the language chips and the
     `.pdf` link. Leaves the CV's long read at the system's mercy.
