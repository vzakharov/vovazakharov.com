> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Adopt Feature-Sliced Design

Restructure all application code into `src/` under [Feature-Sliced Design](https://feature-sliced.design/), and make that structure machine-enforced by Steiger (`@feature-sliced/steiger-plugin`) and `eslint-plugin-boundaries`, both taken from `Playgramai/playgramapp`. The end state is a tree that passes `pnpm lint:fsd` with the **stock recommended ruleset and zero rule overrides** — no per-path disables, no grandfathering, no ratchet file.

## Target tree

```
app/                              # Next App Router — thin routing + the FSD app layer
  layout.tsx                      # re-export of root-layout
  root-layout.tsx                 # app shell: fonts, providers, base metadata
  theme-provider.tsx              # 'use client' next-themes wrapper
  globals.css                     # Tailwind entry + theme tokens
  icon.png
  page.tsx                        # export { HomePage as default } from '@/pages/home'
  cv/page.tsx                     # unlocalized redirect into /en/cv
  [locale]/cv/page.tsx            # localized CV route
pages/README.md                   # empty Pages-Router shadow (see "The pages trap")
src/
  shared/
    config/{index.ts,site-config.ts}
    i18n/{index.ts,routing.ts,request.ts,load-messages.ts,messages/{en,ru}.json}
    seo/{index.ts,construct-metadata.ts}
    ui/{index.ts,card.tsx}
    lib/hydration/{index.ts,use-mounted.ts}
  features/
    switch-theme/{index.ts,ui/theme-toggle.tsx}
  pages/
    home/{index.ts,ui/{home-page.tsx,project-card.tsx,article-card.tsx}}
    cv/{index.ts,ui/{cv-page.tsx,locale-picker.tsx},lib/cv-metadata.ts}
content/                          # unchanged — prose, not code
```

`entities/` and `widgets/` are deliberately absent: there is no business noun with two consumers and no composite block shared across both pages. FSD layers are optional, and Steiger's `insignificant-slice` actively punishes inventing them.

### Why the app layer is root `app/`, not `src/app`

Steiger's stock ruleset flags `src/app/ui/**` (`fsd/no-ui-in-app`) and `src/app/providers` (`fsd/segments-by-purpose` — "providers" names what the contents *are*, not their purpose). `playgramapp` buys `src/app` back by disabling `fsd/no-ui-in-app` for that path; under "no workarounds" that override is not available here. Root `app/` already *is* the app-wide setup — the root layout, providers and global stylesheet — and it sits outside the Steiger scan root, so putting the app layer there is the honest reading rather than a dodge. This is the one deliberate divergence from the boilerplate.

### The `pages` trap

`next/dist/lib/find-pages-dir.js` resolves `pages` as root-`pages/` **or** `src/pages/`, and then throws `E801 — "pages and app directories should be under the same folder"` when the two resolved parents differ. With the router at root `app/` and an FSD `src/pages/`, that throw is unconditional. A root `pages/` directory wins the lookup, registers no routes because it holds no page files, and leaves `src/pages/` alone. It is committed with a `README.md` that says why and says not to add routes.

### Slice-by-slice placement

| Current                      | Goes to                                | Why                                                              |
| ---------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `components/Card.tsx` → `Card` | `shared/ui/card.tsx`                   | Generic primitive, used by both pages                            |
| `components/Card.tsx` → `ProjectCard`, `ArticleCard` | `pages/home/ui/`     | Home-only content cards; a slice for them would be insignificant |
| `components/ThemeToggle.tsx` | `features/switch-theme/ui/theme-toggle.tsx` | User-facing capability with two consumers                   |
| `components/LocalePicker.tsx`| `pages/cv/ui/locale-picker.tsx`        | Single consumer — merged into it, per `insignificant-slice`      |
| `components/ThemeProvider.tsx` | `app/theme-provider.tsx`             | App-wide provider                                                |
| `hooks/useMounted.ts`        | `shared/lib/hydration/use-mounted.ts`  | Two consumers; sub-library import, no `shared/lib` root barrel   |
| `i18n/{routing,request}.ts`  | `shared/i18n/`                         | Infrastructure                                                   |
| `messages/{en,ru}.json`      | `shared/i18n/messages/`                | Owned by the segment that loads them                             |
| `lib/site-config.ts`         | `shared/config/`                       | Infrastructure                                                   |
| `lib/metadata.ts`            | `shared/seo/construct-metadata.ts`     | Purpose-named segment                                            |
| `app/HomePage.tsx`           | `pages/home/ui/home-page.tsx`          | Page composition                                                 |
| `app/[locale]/cv/CVPage.tsx` | `pages/cv/ui/cv-page.tsx`              | Page composition                                                 |
| `app/cv/cv-utils.ts`         | `pages/cv/lib/cv-metadata.ts`          | Belongs to the slice both CV routes consume                      |

Files in `src/` are kebab-case (`card.tsx` exporting `Card`), page components are `*-page.tsx` — the boilerplate's convention.

## Steps

1. **Deps and config.** Add `steiger`, `@feature-sliced/steiger-plugin`, `eslint-plugin-boundaries` as devDependencies. Add `steiger.config.mjs` (`.mjs`, not `.ts` — a `.ts` config makes cosmiconfig write a transient sidecar into the repo root that the parallel vet scanners race against) carrying nothing but `...fsd.configs.recommended`.
2. **Point the aliases at `src/`.** `tsconfig.json` `paths` becomes `"@/*": ["./src/*"]`; `next.config.ts` passes `createNextIntlPlugin('./src/shared/i18n/request.ts')` since the plugin's default lookup no longer finds the file.
3. **Move the code.** `git mv` every file per the table above so renames stay visible in the diff, rename to kebab-case, add an `index.ts` public API to each slice and shared segment, and rewrite imports to go through those barrels. Cross-slice imports use `@/…`; within a slice, relative.
4. **Thin out the route files.** `app/page.tsx` and `app/[locale]/cv/page.tsx` re-export from `@/pages/*`; `app/cv/page.tsx` keeps the redirect and takes its metadata from `@/pages/cv`. `app/root-layout.tsx` keeps fonts, providers and base metadata.
5. **Shadow the Pages Router.** Add `pages/README.md`.
6. **Wire the checkers.** `boundaries` config in `eslint.config.mjs`, scoped to `src/**`: layers ordered `pages → widgets → features → entities → shared`, each allowed to import strictly downward plus its own slice; `entry-point`, `external`, `no-ignored`, `no-unknown`, `no-unknown-files` all on. Add `"lint:fsd": "steiger src"` to `package.json` and a concurrent `fsd` check to `scripts/vet.sh` (Steiger only reads, so it overlaps the other three safely).
7. **Document it.** New `.claude/rules/fsd.md` (`paths: src/**`) as the authoritative, enforced convention set — layer order, public API, insignificant slices, kebab-case, the `pages` shadow, and why the app layer is root `app/`. New `src/README.md` as the human orientation page pointing at it. Update `CLAUDE.md`'s repository-layout table and its Vetting list to include `pnpm lint:fsd`.
8. **Vet.** `./scripts/vet.sh` green — build, typecheck, eslint (now including `boundaries`), prettier, and Steiger. Then `/preview` both pages in both themes to confirm the restructure is behaviour-neutral, since the build only proves the pages render, not that they render the same.

## Verification that this passes clean

The target tree was scaffolded as a stub project and run through `steiger src` with the stock recommended config before this plan was written: **no problems found**. The same probe confirmed the three rules that shape the design above actually fire — `insignificant-slice` on a single-consumer feature, `no-public-api-sidestep` on a deep import, and `segments-by-purpose` on `app/providers` — so the layout is chosen against observed behaviour, not against the docs.

## DRY notes

- **Genuinely shared, extracted once:** `Card` (both pages), `ThemeToggle` (both pages), `useMounted` (theme toggle + locale picker), `constructMetadata` (root layout + CV metadata), `SITE_CONFIG` (metadata builder + CV metadata), the i18n routing object (locale picker + both CV routes). Each becomes exactly one barrel-exported module; nothing is copied.
- **Reused rather than rebuilt:** `constructMetadata` and `generateCvMetadata` keep their current bodies — they already are the shared abstraction, they only change address. `steiger.config.mjs` and the `boundaries` block are ported from `playgramapp` rather than written fresh, including the `.mjs`-not-`.ts` reason.
- **Deliberately not extracted:** `ProjectCard`/`ArticleCard` stay inside `pages/home` even though they look like reusable card variants — they have one consumer each, and lifting them to `shared/ui` or an `entities/project` slice would create the exact insignificance Steiger flags. The CV print button and locale picker likewise stay inside `pages/cv`. The `boundaries` config is inlined into `eslint.config.mjs` rather than split into an `eslint/` directory the way the boilerplate does: at ~60 lines against a 36-line config it is still one readable file, and a directory holding a single module is structure without payoff.
- **Not shared because it must not be:** `pages/home` and `pages/cv` are siblings on the same layer and never import each other; anything they both need moves down a layer instead.
