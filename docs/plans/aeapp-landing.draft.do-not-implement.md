> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# A new repo for the АЭАПП free-consultations landing

Ship the page drafted at
`vzakharov/leisan-psy-work@local:work/ассоциация/Лендинг — бесплатные консультации.html`
as a static GitHub Pages site, in a **new repository** built on the
architectural decisions this repo (`vzakharov/vovazakharov.com`) already made —
while pointing its agent-infrastructure watermark at
`vzakharov/agent-project-boilerplate` rather than at this repo.

## What the source draft is

A single self-contained HTML fragment (no `<html>`/`<head>`/`<body>`): a
`<title>`, a Google-Fonts `<link>` (Prata + Golos Text), one `<style>` block of
~360 lines, and the markup. It is design-complete and copy-complete except for
three bracketed placeholders (see "Unresolved content" below). Its structure:

| Block                  | Content                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `.topbar`              | Inline АЭАПП SVG mark (gold gradient stroke over a grey triangle), short name, full name, "Онлайн · бесплатно" |
| `.hero`                | Eyebrow, `h1` "Бесплатные психологические консультации", lead paragraph, CTA to `#anketa`                      |
| `.facts`               | Four-cell rule-bounded grid: 3 / 60 / Онлайн / Бесплатно                                                       |
| `.section` ×4          | Label + prose: what three meetings give, who runs them, about existential analysis, what comes next            |
| `.questions`           | Accent-ruled pull-quote inside the third section                                                               |
| `.form-section#anketa` | Eyebrow, "Анкета клиента", lead, **dashed placeholder where the form goes**, CTA + "около [N] минут"           |
| `.foot`                | "Вопросы о проекте — [ПОЧТА ИЛИ ТЕЛЕГРАМ]", "Все консультации проводятся онлайн"                               |

Two properties of the draft decide most of what follows:

- **It is already token-driven and already theme-aware.** Eleven custom
  properties (`--ground`, `--surface`, `--ink`, `--muted`, `--faint`, `--line`,
  `--line-soft`, `--accent`, `--accent-hover`, `--accent-soft`, `--on-accent`)
  declared three times: `:root`, `@media (prefers-color-scheme: dark)` guarded
  by `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]`. That is
  exactly the shape `styles/_tokens.scss` generates here, and exactly the shape
  a `data-theme` toggle needs.
- **It uses no components.** Every element is bespoke CSS. Nothing in it asks
  for a component library.

## Target architecture

Same decisions as this repo wherever they still hold, with the ones that were
answers to _this_ site's problems dropped. Kept, dropped, and why:

| Decision                                                                            | New repo                                    | Why                                                                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Next.js 16 App Router, `output: 'export'`, React 19, pnpm                           | keep                                        | The constraint is identical — HTML on a CDN, no server.                                                                        |
| GitHub Pages via `deploy.yml`, with the `feat:`/`fix:` subject gate                 | keep                                        | Merge _is_ deploy; the gate keeps a `docs:` merge from spending one.                                                           |
| Feature-Sliced Design under `src/`, root `app/` as routing only, shadow `pages/`    | keep                                        | Costs a directory layout and buys two enforced checkers. Cheap at any size.                                                    |
| Sass partials + `pnpm styles:codegen` generating `_tokens.scss`/`_breakpoints.scss` | keep                                        | The draft's eleven tokens become the `CSS_COLORS` array; the three palettes become three `@include tokens.colors(…)` calls.    |
| stylelint with `declaration-no-important`                                           | keep                                        | Holds without Mantine too — nothing is layered, so nothing needs to out-rank a layer.                                          |
| Custom `eslint/` ruleset, including `vova/no-hardcoded-strings`                     | keep                                        | The page _is_ copy; a rule that keeps copy out of components earns more on a landing page than it does here.                   |
| next-intl                                                                           | keep, single `ru` locale, no locale routing | Buys the message catalogue (one JSON file a non-developer can edit) and the lint rule above. Locale routing is not configured. |
| `pnpm type-overlap`, `pnpm test` (Node's runner), `vet.sh` + `run-parallel.sh`      | keep                                        | Straight ports.                                                                                                                |
| Committed OG render + manifest hash check                                           | keep                                        | The page will be shared in Telegram/WhatsApp/VK; the card is the first impression. See "Social card".                          |
| **Mantine 9**                                                                       | **drop**                                    | See below.                                                                                                                     |
| Markdown content pipeline (`shared/content`, Shiki, Mermaid, `content:pdf`)         | drop                                        | Nothing here is authored as markdown.                                                                                          |
| `.claude/rules/content.md`, `logos.md`, `writing.md`; `writing/`                    | drop                                        | They scope directories the new repo does not have.                                                                             |

### Dropping Mantine

Mantine earns its place here by rendering components. The draft renders none —
its entire surface is eleven tokens, two fonts and hand-written CSS. Bringing it
in would add a client bundle to a conversion-critical landing page, and would
import a whole rule file (`.claude/rules/styling.md`) whose subject matter is
_working around Mantine's layering and inline styles_: the `@layer mantine`
import, what a stylesheet cannot reach, `theme.white`/`theme.black` being bound
to tokens Mantine does not know about, `Typography` not being a substitute for
`prose.scss`. None of that has anything to teach a repo that isn't using it.

What Mantine provides that the new repo still needs is **colour-scheme
management** — a persisted user choice, applied before first paint. That is one
`features/switch-theme` slice: a client toggle writing `data-theme` to
`document.documentElement` and `localStorage`, plus a small blocking script in
`<head>` that reads the stored value so the page never flashes the wrong scheme.
The draft's CSS is already written against exactly that attribute.

The new repo therefore keeps a `.claude/rules/styling.md` of its own, carrying
the parts that survive: the Sass-partial layout, the codegen table, colour
literals banned from components in favour of `cssColor()`, and the
`:where()`-cannot-be-split trap.

### Repository layout

```
.claude/          hooks/, rules/{README,fsd,styling,eslint}.md, settings.json, skills/ (all 18)
.github/workflows/deploy.yml
app/              layout.tsx, page.tsx, sitemap.ts, robots.ts, og/page.tsx, icon.svg
pages/            README.md only — the shadow that keeps src/pages/ off the Pages Router
public/           .nojekyll, og.png, og-renders.json
eslint/           rule-groups/, rules/ (the vova/* set)
scripts/          vet.sh, run-parallel.sh, generate-styles.ts, render-og.ts,
                  lib/{chromium,og-render,render-manifest}.ts, check-*.sh,
                  export-github-item.py, gh_export/, lib/github.py, pr-body.py,
                  ci-watch-tick.sh, lib/watch-tick-common.sh,
                  type-overlap-check.ts + .README.md + .test.ts
styles/           _mixins.scss (breakpoint helpers), _breakpoints.scss*, _tokens.scss*   (* generated)
src/
  app/            lib/sitemap.ts · styles/{globals.scss,breakpoints.ts,fonts.ts} · ui/root-layout.tsx
  features/       switch-theme/
  pages/          consultations/
  shared/         config/site-config.ts · i18n/ · seo/ · typings/ · ui/
```

The landing is `src/pages/consultations`, composed of one slice's worth of UI:
`consultations-page.tsx` plus `top-bar`, `hero`, `facts`, `prose-section`,
`pull-quote`, `signup-section`, `site-footer`, each with its `.module.scss`.
They stay inside the slice rather than becoming shared or features, because
each has exactly one consumer — Steiger's `insignificant-slice` says so.

`src/shared/ui` holds only what genuinely crosses: `css-color.ts` (the token
array and `cssColor()`), `aeapp-mark.tsx` (the inline SVG), and `wrap.tsx` (the
`max-width: 1080px` container the draft applies as `.wrap`).

### Copy, and the data behind it

All Russian copy moves to `src/shared/i18n/messages/ru.json`, keyed by section.
The two repeating structures become data in the slice's `lib/`, keyed into the
catalogue rather than duplicated as markup:

- `facts.ts` — four `{ value, label }` keys rendered by one `<Facts>`.
- `sections.ts` — the four prose sections in order; the third names the
  pull-quote that interrupts it, so `<ProseSection>` stays one component.

`site-config.ts` holds what is not copy: the canonical URL, the contact handle,
and the signup-form URL.

### Fonts

Prata (display) and Golos Text 400/500/600 (body) load through
`next/font/google`, which self-hosts them into the export. That replaces the
draft's `<link>` to `fonts.googleapis.com`, removing a third-party request from
a page about psychological help — a privacy improvement that also matters under
152-ФЗ, and one fewer render-blocking round trip. Both faces are on Google
Fonts; if Golos Text turns out not to be fetchable at build, fall back to
self-hosting the woff2 under `public/` via `next/font/local`.

### Social card

`app/og/page.tsx` renders a 1200×630 card from the site's own tokens and fonts
(headline, АЭАПП mark, "3 бесплатные онлайн-встречи"). `scripts/render-og.ts`
screenshots it with headless Chromium into `public/og.png`, recording the source
hashes in `public/og-renders.json`; `pnpm content:og --check` compares hashes in
the vet fan-out and fails rather than renders. `scripts/lib/render-manifest.ts`
and `chromium.ts` port verbatim; `og-render.ts` ports with the authored-SVG card
kind removed, leaving only the staged-HTML path.

The `/og` route is excluded from `sitemap.ts` and `robots.ts`.

### SEO and metadata

`shared/seo/construct-metadata.ts` ports with the i18n-alternates branch
removed: `<html lang="ru">`, title, description, canonical, OpenGraph and
Twitter card pointing at `og.png`. Plus `Organization` JSON-LD naming the
association, and a `sitemap.ts`/`robots.ts` pair.

### Vetting

`scripts/vet.sh` keeps the shape and the reasons, with the roster trimmed to
what exists:

```
pnpm build                      # alone, first — it writes .next/types/, which tsconfig includes
pnpm styles:codegen             # alone, second — it writes the two .scss files the fan-out globs
  pnpm typecheck                ┐
  pnpm exec eslint .            │
  pnpm format:check             │
  pnpm lint:css                 │ concurrent, via scripts/run-parallel.sh
  pnpm lint:fsd                 │
  pnpm type-overlap             │
  pnpm content:og --check       │
  pnpm test                     │
  scripts/check-squash-message.sh ┘
```

`pnpm content:pdf --check` and `content:mermaid` are gone with the content
pipeline.

### Agent infrastructure and the boilerplate link

All eighteen skills, the four surviving rule files, `.claude/hooks/session-start.sh`,
`.claude/settings.json` and the `scripts/` agent tooling copy over from this
repo, which is where they are currently correct. `CLAUDE.md` is **rewritten**,
not copied — its "About this project", "Repository layout", "Vetting" and
"Working with skills" sections describe the new repo — while "Key principles",
"Writing things down", "Docstrings", "Derive types and schemas from the source
of truth", "Git conventions" and "Plan mode & questions in web sessions" carry
across unchanged.

`.claude/skills/sync-agent-boilerplate/source.json` points at
`vzakharov/agent-project-boilerplate` with this repo's current `lastSyncedSha`
(`4998149…`) as the watermark — the files are being copied from a tree that is
synced to exactly that point, so it is the honest mark. The `adopted` list
carries a note that the copy arrived via `vzakharov/vovazakharov.com`, and the
`declined` map is re-derived for the new stack (`/test-on-gh`, `/release`,
`/hotfix`, `/log-review`, `/readonly-probe`, `/renumber-migration`,
`/propose-issue`, `/audit-github-backlog`, `docs/catalog.md`, `ADOPTING.md` all
decline for the same reasons they decline here).

**The cost of pointing past this repo** is that the adaptations made _here_ —
notably the `vet.sh` rewrite for a Next/pnpm stack, which the new repo needs in
almost the same form — will not flow forward on a sync; only the boilerplate's
generic version will, and it will have to be re-adapted each time. Question 6
offers the alternative.

## Work plan

1. **Create `vzakharov/aeapp-consultations`**, public, empty. Try
   `mcp__github__create_repository`, then `gh repo create`; if both are refused
   by the session's repo scope, ask the operator to create the empty repo and
   push into it. Attach it with `add_repo`, clone it, and work there.
2. **Scaffold.** `pnpm create next-app` is not used — the tree is assembled by
   copying this repo's config files (`tsconfig.json`, `next.config.ts`,
   `eslint.config.ts`, `eslint/`, `steiger.config.mjs`, `stylelint.config.mjs`,
   `.prettierrc.json`, `.prettierignore`, `.gitattributes`, `.gitignore`,
   `.vscode/settings.json`, `css.d.ts`, `pages/README.md`, `public/.nojekyll`)
   and writing a `package.json` with the trimmed dependency set. Verify
   `pnpm install && pnpm build` on an empty page before anything else.
3. **Agent infrastructure.** `.claude/`, `scripts/`, `CLAUDE.md`, `README.md`,
   `src/README.md`. Run `bash scripts/check-skill-catalog.sh` — a skill
   cross-reference pointing at a file that did not come along fails silently.
4. **Tokens and styling.** `src/shared/ui/css-color.ts` gains the eleven tokens;
   `src/app/styles/breakpoints.ts` gets the draft's two breakpoints (620px,
   900px) expressed on the em scale; `pnpm styles:codegen` writes the partials;
   `globals.scss` declares the three palettes through the generated mixin.
5. **Shell.** `root-layout.tsx` with the fonts, the no-flash theme script and
   `lang="ru"`; `app/layout.tsx` and `app/page.tsx` as one-line re-exports;
   `features/switch-theme`.
6. **The page.** Port the markup section by section into the slice's components,
   each `.module.scss` carrying the draft's rules for that block verbatim except
   for colour literals, which become `cssColor()`/token `var()`s. Copy into
   `ru.json`; facts and sections into `lib/`.
7. **Signup section.** Whatever question 3 resolves to.
8. **SEO, sitemap, robots, OG card**, then `pnpm content:og` to produce the
   committed render.
9. **`deploy.yml`**, plus `basePath` (or `public/CNAME`) per question 2.
10. **`/preview`** at both schemes and at 375 / 768 / 1440 px against the draft
    rendered in the same browser — the page is a visual port, so a green vet
    proves nothing about it.
11. **`/dry`, `/tighten-docs`, `/qa-checklist`**, then `/pr` and `/finalize` in
    the new repo.

## DRY notes

- **Agent infrastructure is duplicated by copy, deliberately.** `.claude/` and
  `scripts/` cannot be a package — they are files an agent reads by path, and
  every consumer edits them. `sync-agent-boilerplate` _is_ the reconciliation
  mechanism for exactly this duplication; that is what the watermark is for.
- **No shared design-system package between the two sites.** They share the
  _method_ (tokens generated from a TypeScript array, no colour literals in
  components) and nothing of the substance: different palettes, different
  fonts, different type scale, one on Mantine and one not. A package holding
  the method alone would be `generate-styles.ts`, ~100 lines that will diverge
  the moment either token list grows a shape the other does not have.
- **`generate-styles.ts`, `render-manifest.ts`, `chromium.ts`, `run-parallel.sh`,
  `type-overlap-check.ts` copy verbatim** — they are generic over what they
  operate on, so the copies are identical files, not parallel implementations.
  Divergence risk is real and is the sync skill's job, not a refactor's.
- **`og-render.ts` copies with a branch removed**, not rewritten: the
  authored-SVG card kind has no source here. `construct-metadata.ts` likewise
  loses the alternates branch.
- **Within the new repo**: the four prose sections are one `<ProseSection>` over
  a data array, not four components; the four facts are one `<Facts>` over a
  data array; the two CTAs are one `<Cta>`; the eleven colours have exactly one
  home (`CSS_COLORS`) from which both the Sass mixin and the TypeScript union
  derive. The draft repeats its dark palette twice (media query and
  `[data-theme]`) — the generated mixin collapses that to one `@include` per
  palette.
- **Not extracted:** `<TopBar>` and `<SiteFooter>` stay inside the
  `consultations` slice rather than moving to `shared/ui` or a `widgets/` layer.
  One page consumes them; promoting them now would invent a layer to hold a
  single consumer, which `.claude/rules/fsd.md` explicitly rejects.

## Unresolved content

The draft ships three bracketed placeholders that cannot go live as written:

- `[ЗДЕСЬ БУДЕТ АНКЕТА КЛИЕНТА — БЕЗ ИЗМЕНЕНИЙ]` — question 3.
- `Занимает около [N] минут` — question 4.
- `Вопросы о проекте — [ПОЧТА ИЛИ ТЕЛЕГРАМ]` — question 4.

A fourth is not in the draft at all: **consent to personal-data processing.**
If the signup form is hosted elsewhere (the recommendation), the consent notice
is that host's responsibility and the landing needs nothing. If a form is ever
built into the page, it needs an explicit 152-ФЗ consent checkbox and a privacy
notice — which is a second reason to prefer the link-out.

## Explicitly out of scope

The other АЭАПП material in `leisan-psy-work` (Лекторий, Интенсив, Студенческий
фестиваль, Супервизия, …) is not part of this. If the association later wants a
full site, `/consultations` is already a stable path to keep.

## Open questions

Every question below carries a recommendation, and **the plan above is written
with each recommendation already in force** — so silence resolves them and the
plan is implementable as it stands. Answer tersely (`1a, 2b, …`) if you want
something else.

**1. Repository name and owner.**

- **a. `vzakharov/aeapp-consultations`, public — recommended.** Single-purpose, named after what it ships. Public is required for Pages without a paid plan.
- b. A different name (say which) — e.g. `aeapp-site` if you expect the rest of the association's material to follow.
- c. Under an organization account rather than `vzakharov` (say which org).

**2. Where it is served.**

- **a. Project Pages at `vzakharov.github.io/aeapp-consultations`, with `basePath` set accordingly — recommended as the default**, because it needs nothing from anyone. Moving to a custom domain later is a two-line change (`basePath: ''` plus `public/CNAME`) but breaks every already-shared link.
- b. A custom domain or subdomain from day one — say which, and I will set `CNAME` and leave `basePath` empty.

**3. The signup form.**

- **a. The CTA links out to an externally hosted form (Google Forms / Yandex Forms / Tally), opening in a new tab — recommended.** Static export has no backend, an embedded third-party form breaks the page's dark scheme and typography, and the host carries the 152-ФЗ consent burden. Needs the form URL.
- b. Embed the external form in an `<iframe>` where the placeholder is, so the visitor never leaves. Needs the form URL, and accepts a visual seam.
- c. Build the form in-page and POST to a third-party endpoint (Formspree or similar). Most work, and it adds a consent checkbox, a privacy notice and a paid dependency.

If you do not have the URL yet, I will build (a) with the URL read from
`site-config.ts` and the section rendering a "скоро" state until it is filled —
but that state must not reach production.

**4. The two remaining placeholders.** What goes in `Занимает около [N] минут`,
and what is the footer contact (email or Telegram handle)? If unanswered:
**drop the "около N минут" line entirely** rather than guess, and hold the
launch on the contact — a footer that ships a placeholder is the one thing here
I would not do.

**5. Is the draft's copy final?** I plan to port it **verbatim**, changing
nothing but the placeholders. Say so if any of it is still being edited, or if
the association has a review step the text has not been through.

**6. The boilerplate link.**

- **a. `source.json` → `vzakharov/agent-project-boilerplate` — recommended, and what you asked for.** The new repo is a sibling of this one rather than a child.
- b. `source.json` → `vzakharov/vovazakharov.com` (skill renamed `sync-vovazakharov`), which is what the sync skill's own doctrine prescribes for a repo adopting from here: the stack-specific adaptations (`vet.sh` above all) then flow forward, and the boilerplate reaches the new repo one hop later, through this one.

**7. Where this plan lands.** This plan file sits on
`claude/aeapp-landing-l7d745` **in this repo**, because a planning session has
no other reviewable surface — but its deliverable is a different repository, so
nothing here should merge into `main`. Recommendation: **review the plan on this
PR, then close it unmerged** once the new repo exists; the `/go` session copies
the plan into the new repo's `docs/plans/` as its own `*.in-progress.md` and
finalizes it there. Say if you would rather it land here as a `docs:` commit for
the record.
