# PR #56: perf: trim the client payload by 41 kB gzipped per page

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/56
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/trim-client-js-npdqn6
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-17T01:44:43Z
- **Updated:** 2026-09-17T09:48:15Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Mantine's stylesheets are named one at a time instead of the aggregate.** `@mantine/core/styles.layer.css` concatenates ~200 component stylesheets; this site renders 14 of them. `theme-provider.tsx` now imports those plus Mantine's three core files, taking each site's CSS from 250 kB to 67 kB raw and **37.4 kB to 12.0 kB gzipped**, with all 353 `--mantine-*` variables still declared.
- **The theme toggle's label is translated on the server.** The shell wrapped every page in `NextIntlClientProvider` so that `ThemeToggle` — the only client component outside the CV — could read one aria-label with `useTranslations`. `ThemeCorner` translates it with `getTranslations` and passes it down, so next-intl's client runtime (48 kB raw, **14 kB gzipped**) leaves every page but the CV. The CV keeps its own provider and messages.
- **A new vet check holds the stylesheet list.** Omitting a sheet is silent — the component compiles, type-checks, builds and renders unstyled — so `scripts/check-mantine-styles.ts` compares the `m_*` classes in each site's built HTML against the rules in that site's built CSS. Reading the build output rather than the import list is what makes it cover sheets Mantine composes in internally (`Button` renders `UnstyledButton`'s class, which no import names). It reports the unused direction too, and prints the exact import line to add or drop.
- **Net, per page, gzipped: 210.9 kB → 169.8 kB** on the homepage (−19.5%); the CV goes 221.5 kB → 195.2 kB, keeping next-intl. Behaviour is unchanged throughout: the shell's provider carried no locale of its own, so the toggle's label resolved through the request config's default locale then and does now.

**Deploy note:** these are `perf:` commits, which `deploy.yml`'s gate does not publish — but they do change the built site. The squash needs either a `feat:`/`fix:` subject or a manual `workflow_dispatch` run after merge.

## QA Checklist

- [ ] `render-light` — open `/`, `/cv`, `/writing` and a case study in the light theme; every card border, chip, heading, list and code span is styled as before.
- [ ] `render-dark` — the same four pages with the OS set to dark; nothing is invisible against its surface.
- [ ] `toggle-label` — inspect the top-right theme control; its `aria-label` reads "Toggle theme", and clicking it still cycles light → dark → system.
- [ ] `cv-locales` — open `/cv/cto/ru` and `/cv/cto/en`; the Russian CV is in Russian, the English one has no Cyrillic, and the language chips still switch between them.
- [ ] `print` — print-preview `/cv` and a case study; the printed-only link addresses appear and the screen-only chrome does not.
- [ ] `sheet-guard` — delete one `@mantine/core/styles/*.layer.css` import from `theme-provider.tsx`, run `pnpm build && pnpm check:mantine-styles`, and confirm it fails naming that import; restore it.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `render-light` | manual-only | — | Whether a page *looks* right against its design is human judgment; the guard proves every rendered class has rules, not that the result is handsome. |
| `render-dark` | manual-only | — | Same, plus contrast, which is exactly what an assertion cannot settle. |
| `toggle-label` | e2e | ❌ | Drive a built page, assert the control's `aria-label` and that clicking it advances `data-mantine-color-scheme`. |
| `cv-locales` | integration | ❌ | Render both CV routes from the export and assert the expected script in each — the cheap version of the check run by hand here. |
| `print` | manual-only | — | Print rendering has no headless assertion short of diffing a generated PDF, which `content:pdf` already hashes for drift rather than correctness. |
| `sheet-guard` | unit | ❌ | The pattern is `scripts/type-overlap-check.test.ts`: write a throwaway HTML/CSS pair to a temp dir, run the script against it, assert exit code and report text. |

https://claude.ai/code/session_01KPvLWh7spBMbSvLnCV7hgG

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-17T01:45:12Z — "Proposed squash title/body: ``` perf: ship only the CSS and…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-17T01:45:12Z

[https://github.com/vzakharov/vovazakharov.com/pull/56#issuecomment-5707162574](https://github.com/vzakharov/vovazakharov.com/pull/56#issuecomment-5707162574)

Proposed squash title/body:

```
perf: ship only the CSS and i18n runtime each page uses (pr #56)
```

```
Every page carried Mantine's entire stylesheet and next-intl's client
runtime for a fraction of either: 14 of ~200 component stylesheets are
rendered anywhere on the site, and the only client component outside the
CV read a single aria-label.

`theme-provider.tsx` now names Mantine's three core stylesheets and one
per component in use, rather than the aggregate `styles.layer.css`. That
list can go wrong silently — a component whose sheet is missing
compiles, type-checks, builds and renders unstyled — so
`pnpm check:mantine-styles` joins the vet fan-out, comparing the classes
in each site's built HTML against the rules in that site's built CSS.
Reading the build output rather than the import list is what lets it
cover a sheet Mantine composes in internally, and each site is answered
by its own CSS so that a stale export cannot pass on its neighbour's.

The label the site shell translated is now translated by `ThemeCorner`
with `getTranslations` and passed to `ThemeToggle` as a prop, which
takes `NextIntlClientProvider` out of the root layout. The CV keeps its
own provider and its own messages, that subtree being where translation
at runtime is earned. The shell's provider carried no locale of its own,
so the label resolves exactly as before.

Per page, gzipped: 210.9 kB to 169.8 kB on the homepage, and 221.5 kB to
195.2 kB on the CV. `deploy.yml` publishes on `feat:` and `fix:` alone,
so this one needs a `workflow_dispatch` run after merge.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/squash-message.md`:32 — unresolved — last: @vzakharov (human) 2026-09-17T09:44:09Z — "разумеется, измени правило чтобы на perf: тоже шипилось" → [↓](#t01)
- **T02** `src/app/ui/root-layout.tsx`:59 — unresolved — last: @vzakharov (human) 2026-09-17T09:44:31Z — "медведь. если ты про то чтобы это сюда обратно не вернулось,…" → [↓](#t02)
- **T03** `src/app/ui/theme-corner.tsx`:16 — unresolved — last: @vzakharov (human) 2026-09-17T09:47:31Z — "вместо докстринга (этого и других где это подойдёт) давай сд…" → [↓](#t03)
- **T04** `src/app/ui/theme-provider.tsx`:22 — unresolved — last: @vzakharov (human) 2026-09-17T09:47:56Z — "у нас чем-то проверяется и необходимость, и достаточность эт…" → [↓](#t04)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:32 — unresolved

```diff
@@ -0,0 +1,39 @@
… 26 lines elided …
+at runtime is earned. The shell's provider carried no locale of its own,
+so the label resolves exactly as before.
+
+Per page, gzipped: 210.9 kB to 169.8 kB on the homepage, and 221.5 kB to
+195.2 kB on the CV. `deploy.yml` publishes on `feat:` and `fix:` alone,
+so this one needs a `workflow_dispatch` run after merge.
```

**@vzakharov (human)** — 2026-09-17T09:44:09Z

разумеется, измени правило чтобы на perf: тоже шипилось

---

<a id="t02"></a>

### `src/app/ui/root-layout.tsx`:59 — unresolved

```diff
@@ -53,13 +52,16 @@ export function RootLayout({
       <head>
         <ColorSchemeScript defaultColorScheme="auto" />
       </head>
+      {/*
+        A subtree that translates at runtime provides for itself — `CvPage` does,
+        with the messages it needs. A provider here would instead put next-intl's
+        client runtime in every page's bundle, to serve the CV alone.
+      */}
```

**@vzakharov (human)** — 2026-09-17T09:44:31Z

медведь. если ты про то чтобы это сюда обратно не вернулось, засунь лучше в правило привязанное к i18n-шным джсонам: если кто-то захочет когда-то это сюда вставить, он будет править и их, и правило всплывёт

---

<a id="t03"></a>

### `src/app/ui/theme-corner.tsx`:16 — unresolved

```diff
@@ -6,11 +8,16 @@ import classes from './theme-corner.module.scss';
… 6 lines elided …
  */
-export function ThemeCorner() {
+export async function ThemeCorner() {
+  const t = await getTranslations('ui');
```

**@vzakharov (human)** — 2026-09-17T09:47:31Z

вместо докстринга (этого и других где это подойдёт) давай сделаем линтерное правило чтобы в клиентских компонентах нельзя было делать getTranslations. Я ведь правильно понимаю проблему?

---

<a id="t04"></a>

### `src/app/ui/theme-provider.tsx`:22 — unresolved

```diff
@@ -1,6 +1,25 @@
 'use client';
 
-import '@mantine/core/styles.layer.css';
+// Core sheets first, then one per component in use — a component rendered
+// without its sheet is invisible breakage, and `pnpm check:mantine-styles` is
+// what catches it. `.claude/rules/styling.md` § Styling carries the rest.
+import '@mantine/core/styles/baseline.layer.css';
+import '@mantine/core/styles/default-css-variables.layer.css';
+import '@mantine/core/styles/global.layer.css';
+import '@mantine/core/styles/ActionIcon.layer.css';
+import '@mantine/core/styles/Anchor.layer.css';
+import '@mantine/core/styles/Button.layer.css';
+import '@mantine/core/styles/Center.layer.css';
+import '@mantine/core/styles/Container.layer.css';
+import '@mantine/core/styles/Divider.layer.css';
+import '@mantine/core/styles/Group.layer.css';
+import '@mantine/core/styles/List.layer.css';
+import '@mantine/core/styles/Paper.layer.css';
+import '@mantine/core/styles/SimpleGrid.layer.css';
+import '@mantine/core/styles/Stack.layer.css';
+import '@mantine/core/styles/Text.layer.css';
+import '@mantine/core/styles/Title.layer.css';
+import '@mantine/core/styles/UnstyledButton.layer.css';
```

**@vzakharov (human)** — 2026-09-17T09:47:56Z

у нас чем-то проверяется и необходимость, и достаточность этого списка?

---

## Timeline (status, references, and other events)

- **2026-09-17T09:48:14Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/56#pullrequestreview-5233831799.
