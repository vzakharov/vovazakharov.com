# A new repo for the АЭАПП free-consultations landing

Ship the page drafted at
`vzakharov/leisan-psy-work@local:work/ассоциация/Лендинг — бесплатные консультации.html`
as a static GitHub Pages site, in a **new private repository** built on the
architectural decisions this repo (`vzakharov/vovazakharov.com`) already made —
while pointing its agent-infrastructure watermark at
`vzakharov/agent-project-boilerplate` rather than at this repo.

The work runs in two phases, and this plan travels between them:

1. **Bootstrap**, in the planning session — create the repo, seed it with the
   agent infrastructure, and leave a paused copy of this plan on a branch there
   with its own draft PR.
2. **Build**, in a new session rooted in the new repo, opened with
   `/handle claude/aeapp-landing-l7d745` — everything below "Phase 2".

## What the source draft is

A single self-contained HTML fragment (no `<html>`/`<head>`/`<body>`): a
`<title>`, a Google-Fonts `<link>` (Prata + Golos Text), one `<style>` block of
~360 lines, and the markup. It is design-complete and copy-complete except for
three bracketed placeholders. Its structure:

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
  by `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]`. The
  first two carry over; the third goes with the theme toggle.
- **It uses no components.** Every element is bespoke CSS. Nothing in it asks
  for a component library.

Its `<title>` ("Три бесплатные встречи") deliberately differs from its `h1`
("Бесплатные психологические консультации"); both are kept as written.

## Target architecture

Same decisions as this repo wherever they still hold, with the ones that were
answers to _this_ site's problems dropped. Kept, dropped, and why:

| Decision                                                                            | New repo                                    | Why                                                                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Next.js 16 App Router, `output: 'export'`, React 19, pnpm                           | keep                                        | The constraint is identical — HTML on a CDN, no server.                                                                        |
| GitHub Pages via `deploy.yml`, with the `feat:`/`fix:` subject gate                 | keep                                        | Merge _is_ deploy; the gate keeps a `docs:` merge from spending one.                                                           |
| Feature-Sliced Design under `src/`, root `app/` as routing only, shadow `pages/`    | keep                                        | Costs a directory layout and buys two enforced checkers. Cheap at any size.                                                    |
| Sass partials + `pnpm styles:codegen` generating `_tokens.scss`/`_breakpoints.scss` | keep                                        | The draft's eleven tokens become the `CSS_COLORS` array; its two palettes become two `@include tokens.colors(…)` calls.        |
| stylelint with `declaration-no-important`                                           | keep                                        | Holds without Mantine too — nothing is layered, so nothing needs to out-rank a layer.                                          |
| Custom `eslint/` ruleset, including `vova/no-hardcoded-strings`                     | keep                                        | The page _is_ copy, and the copy will keep changing; a rule keeping it out of components earns more there than it does here.   |
| next-intl                                                                           | keep, single `ru` locale, no locale routing | Buys the message catalogue (one JSON file a non-developer can edit) and the lint rule above. Locale routing is not configured. |
| `pnpm type-overlap`, `pnpm test` (Node's runner), `vet.sh` + `run-parallel.sh`      | keep                                        | Straight ports.                                                                                                                |
| Committed OG render + manifest hash check                                           | keep                                        | The page will be shared in Telegram/WhatsApp/VK; the card is the first impression. See "Social card".                          |
| **Mantine 9**                                                                       | **drop**                                    | See "Styling" below.                                                                                                           |
| **Colour-scheme toggle** (`features/switch-theme`)                                  | **drop**                                    | Not wanted. Dark mode stays as `prefers-color-scheme` alone, which is a media query and no JavaScript.                         |
| Markdown content pipeline (`shared/content`, Shiki, Mermaid, `content:pdf`)         | drop                                        | Nothing here is authored as markdown.                                                                                          |
| `.claude/rules/content.md`, `logos.md`, `writing.md`; `writing/`                    | drop                                        | They scope directories the new repo does not have.                                                                             |

### Styling

Mantine earns its place here by rendering components and by managing the colour
scheme. The draft renders no components, and the colour scheme is now a media
query — so nothing is left for it to do, and the rule file that travels with it
(`.claude/rules/styling.md`) is almost entirely about working around its
layering and its inline styles. It is not the styling mechanism in either
version of this plan; **Sass CSS Modules are**, and they carry over intact:

- **One `.module.scss` per component**, co-located, scoped by Next and typed by
  `css.d.ts`. Plain `.scss` for the two global sheets.
- **`styles/_tokens.scss` is generated** from `CSS_COLORS` in
  `src/shared/ui/css-color.ts` by `pnpm styles:codegen`. It emits
  `@mixin colors($ground, $surface, $ink, …)`, and `globals.scss` calls it
  twice: on `:root`, and inside `@media (prefers-color-scheme: dark)`. Adding a
  token is one edit in TypeScript, and a palette that then fails to pass it
  fails the Sass build rather than defaulting.
- **`styles/_breakpoints.scss` is generated** from
  `src/app/styles/breakpoints.ts` — a media-query condition cannot read a custom
  property, so Sass needs the numbers as literals. `styles/_mixins.scss` carries
  `smaller-than()` / `larger-than()` over that scale: this repo's
  `_mantine.scss` with the Mantine half removed.
- **No colour literal in a component.** `cssColor('accent')` returns
  `var(--color-accent)` and is the only way TSX names a colour; stylesheets
  write the `var()` directly. `globals.scss` also carries the reset and the
  element defaults the draft sets on `body` and `a`.
- **stylelint** (`stylelint-config-standard-scss`) over `.css`/`.scss`, with
  `declaration-no-important`: nothing is layered, so nothing needs `!important`,
  and reaching for one means a value belongs in a module rather than a call
  site.
- **Fonts through `next/font/google`**, exposed as `--font-display` (Prata) and
  `--font-body` (Golos Text 400/500/600) on `<html>`.

No CSS-in-JS, no utility framework, no runtime theming. **The page ships zero
client JavaScript** — a property worth stating as a target, since it is what
makes the whole `features/` layer unnecessary.

The new repo keeps a `.claude/rules/styling.md` of its own carrying exactly the
above, plus the `:where()`-cannot-be-split-across-a-Sass-nesting-level trap.

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
styles/           _mixins.scss, _breakpoints.scss*, _tokens.scss*        (* generated)
src/
  app/            lib/sitemap.ts · styles/{globals.scss,breakpoints.ts} · ui/root-layout.tsx
  pages/          consultations/
  shared/         config/site-config.ts · i18n/ · seo/ · typings/ · ui/
```

`features/`, `entities/` and `widgets/` are absent because nothing earns them —
the same reason `entities/` and `widgets/` are absent here.

The landing is `src/pages/consultations`, composed of one slice's worth of UI:
`consultations-page.tsx` plus `top-bar`, `hero`, `facts`, `prose-section`,
`pull-quote`, `signup-section`, `site-footer`, each with its `.module.scss`.
They stay inside the slice rather than becoming shared, because each has exactly
one consumer — Steiger's `insignificant-slice` says so.

`src/shared/ui` holds only what genuinely crosses: `css-color.ts` (the token
array and `cssColor()`), `aeapp-mark.tsx` (the inline SVG), and `wrap.tsx` (the
`max-width: 1080px` container the draft applies as `.wrap`).

### Copy, and the data behind it

All Russian copy moves to `src/shared/i18n/messages/ru.json`, keyed by section —
which is what keeps the copy edits that are still coming out of the components
entirely. The two repeating structures become data in the slice's `lib/`, keyed
into the catalogue rather than duplicated as markup:

- `facts.ts` — four `{ value, label }` keys rendered by one `<Facts>`.
- `sections.ts` — the four prose sections in order; the third names the
  pull-quote that interrupts it, so `<ProseSection>` stays one component.

`site-config.ts` holds what is not copy — canonical URL, contact, the signup
form URL and the "около N минут" figure — and is where the placeholders below
carry their `// TODO`s, since JSON cannot hold a comment.

### The three placeholders

The draft's bracketed placeholders resolve as follows, each with a `// TODO` in
`site-config.ts` naming what it is waiting for:

| Draft                                      | Ships as                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `[ЗДЕСЬ БУДЕТ АНКЕТА КЛИЕНТА]`             | The draft's own dashed `.placeholder` block, kept verbatim, until `signupFormUrl` is set |
| `Занимает около [N] минут`                 | `signupFormMinutes: 5` in config, interpolated through the catalogue's ICU message       |
| `Вопросы о проекте — [ПОЧТА ИЛИ ТЕЛЕГРАМ]` | `contact: 'info@example.org'` — visibly not real, so it cannot be mistaken for launched  |

`signupFormUrl` is `null` for now. While it is, the signup section renders the
dashed placeholder and no CTA; once set, the placeholder is replaced by a CTA
linking out to the externally hosted form in a new tab. The form stays external:
static export has no backend, an embedded third-party form breaks the page's
scheme and typography, and the host carries the 152-ФЗ consent burden that an
in-page form would put on this site.

_Rejected for the signup section:_ an `<iframe>` embed (visual seam, third-party
cookies) and an in-page form POSTing to Formspree or similar (needs a consent
checkbox, a privacy notice and a paid dependency, for a form the association
already has elsewhere).

### The mark

The draft's inline SVG is an approximation of the real one, which belongs to
GLE-International: a grey triangle under a yellow spiral with a grey shadow
spiral offset behind it. АЭАПП is GLE-International's official representative in
Russia and Russian-speaking countries (`aeapp.ru` states this), so the mark is
theirs to use.

Every raster the search turns up is a JPEG or a small PNG on a white background
— including `aeapp.ru`'s own 70×66 favicon-grade PNG — and a raster is the wrong
asset regardless of resolution: it cannot sit on the dark palette without a
matte. The only true vector found is the German society's lockup at
`https://www.gle-d.de/wp-content/themes/gle-d/img/logo.svg`, whose
`<g id="Group-10">` (with `path-1` and `mask-2` from its `<defs>`) is the mark
alone, wordmark excluded: ~4.8 kB of paths, transparent, legible at 18 px.

That group ships inlined as `src/shared/ui/aeapp-mark.tsx`. Its greys are
token-driven rather than literal — the German lockup uses a dark triangle
(`#6F6F6E`) where `aeapp.ru` uses a light one, and neither reads well in both
colour schemes — while the brand yellow `#FAB900` stays a literal, being the one
colour the mark is recognised by. Which grey АЭАПП wants is theirs to say, and
answering it after the fact costs one token change.

### Serving it

The repo is **private**, and Pages is not enabled until the association is ready
to serve. Two things follow:

- **The deploy workflow ships with the build and deploy jobs gated on a repo
  variable** — `if: vars.PAGES_ENABLED == 'true'`, alongside the existing
  `feat:`/`fix:` subject gate. Without it every merge to `main` fails on a
  Pages-not-enabled error; with it, CI stays green and launch is a variable
  flip rather than a code change.
- **`basePath` is empty and a custom domain is assumed**, per the decision to
  serve from one. `public/CNAME` is written when the domain is known — see the
  launch checklist.

**Pages on a private repository requires GitHub Pro or above**, and even there
the _published site_ is public; only Enterprise can restrict who reads it. So
"private" protects the source before launch, not the site after it. If the
account is on Free, the repo has to flip public at launch — which is fine, but
it is a decision to make knowingly rather than discover.

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
association, an `app/icon.svg` derived from the mark, and a
`sitemap.ts`/`robots.ts` pair.

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
pipeline. `pnpm test` carries the ported `type-overlap-check.test.ts` plus one
new test: **the catalogue holds no bracketed placeholder**, which is the cheapest
possible guard against shipping `[ПОЧТА ИЛИ ТЕЛЕГРАМ]` to a live page.

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

The accepted cost: the adaptations made _here_ — notably the `vet.sh` rewrite
for a Next/pnpm stack, which the new repo needs in almost the same form — will
not flow forward on a sync; only the boilerplate's generic version will, and it
has to be re-adapted each time. _Rejected:_ pointing `source.json` at this repo
instead, which would carry those adaptations forward but make the new repo a
grandchild of the boilerplate rather than a sibling.

## Phase 1 — Bootstrap

The deliverable is a new repository the operator can immediately `/handle` into.
That requires the branch there to carry the agent infrastructure — a `/handle`
session cannot load `.claude/skills/handle/SKILL.md` if it is not on the branch.

**Phase 1 runs in the planning session itself**, on the go-ahead, rather than in
a fresh `/go` one. It is repository plumbing, not implementation: it writes no
application code, and every file it commits lands in the new repo. The planning
session already holds the draft, the survey of this repo and the extracted mark,
all of which a fresh session would re-read to do fifteen minutes of `git`. A
`/go` on this branch runs the same steps correctly — it is just the more
expensive way in.

Nothing here touches this site. The only marks Phase 1 leaves on
`vovazakharov.com` are the plan file's lifecycle flips and closing PR #38.

1. **Create `vzakharov/aeapp-consultations`, private, with no auto-init.** Try
   `mcp__github__create_repository`, then `gh repo create`; if both are refused
   by the session's repo scope, ask the operator to create the empty repo. Then
   `add_repo` with `access: "push"` + clone it — a read-scoped attach cannot push
   the branch this phase exists to produce.
2. **`main` gets one empty commit** — `git commit --allow-empty -m "chore: initial commit"`.
3. **Branch `claude/aeapp-landing-l7d745`** — the same slug and suffix as this
   branch, so the lineage is readable from the name.
4. **Commit the agent infrastructure onto it**: `.claude/` (all eighteen skills,
   the four rule files, hook, settings), `scripts/`, the rewritten `CLAUDE.md`,
   `README.md`, `src/README.md`, `.gitignore`, `.gitattributes`,
   `.prettierrc.json`, `.prettierignore`, `.vscode/settings.json`. Run
   `bash scripts/check-skill-catalog.sh` — a skill cross-reference pointing at a
   file that did not come along fails **silently**.
5. **Commit this plan as `docs/plans/aeapp-landing.paused.md`**, banner removed,
   with a "what is done / what is left" note naming Phase 2 as the remainder.
   `/handle`'s plan lane fires on `*.paused.md`, and `/go` Step 1 resumes from
   it.
6. **Open the draft PR there and post the squash proposal** (`/pr`, which
   delegates to `/squash-message`), so the new repo's PR carries the same
   furniture this one does. The proposal is for the whole landing — a `feat:`,
   since that is what will eventually publish.
7. **Close PR #38 here unmerged**, with a comment linking the new repo's PR, and
   leave this branch for the record.

Phase 1 deliberately stops before `package.json`. The scaffolding is the first
thing Phase 2 does, and it is better done in a session where the new repo's
`CLAUDE.md` and `.claude/rules/` are actually loaded.

## Phase 2 — Build (`/handle claude/aeapp-landing-l7d745` in the new repo)

1. **Scaffold.** `pnpm create next-app` is not used — the tree is assembled by
   copying this repo's config files (`tsconfig.json`, `next.config.ts`,
   `eslint.config.ts`, `eslint/`, `steiger.config.mjs`, `stylelint.config.mjs`,
   `css.d.ts`, `pages/README.md`, `public/.nojekyll`) and writing a
   `package.json` with the trimmed dependency set. Verify
   `pnpm install && pnpm build` on an empty page before anything else.
2. **Tokens and styling.** `src/shared/ui/css-color.ts` gains the eleven tokens;
   `src/app/styles/breakpoints.ts` gets the draft's two breakpoints (620px,
   900px) on the em scale; `pnpm styles:codegen` writes the partials;
   `globals.scss` declares the two palettes through the generated mixin.
3. **Shell.** `root-layout.tsx` with the fonts and `lang="ru"`; `app/layout.tsx`
   and `app/page.tsx` as one-line re-exports.
4. **The page.** Port the markup section by section into the slice's components,
   each `.module.scss` carrying the draft's rules for that block verbatim except
   for colour literals, which become token `var()`s. Copy into `ru.json`; facts
   and sections into `lib/`; the three placeholders per the table above.
5. **SEO, sitemap, robots, icon, OG card**, then `pnpm content:og` to produce the
   committed render.
6. **`deploy.yml`** with both gates.
7. **`/preview`** at both schemes and at 375 / 768 / 1440 px against the draft
   rendered in the same browser — the page is a visual port, so a green vet
   proves nothing about it.
8. **`/dry`, `/tighten-docs`, `/qa-checklist`**, then `/pr` and `/finalize`.

## Launch checklist (after Phase 2, when the association is ready)

Not part of either phase — the items that need a human decision or an external
value:

- [ ] The custom domain — `public/CNAME` plus the DNS records. A subdomain of
      the association's existing `aeapp.ru` is the obvious candidate.
- [ ] `signupFormUrl` — the hosted client questionnaire.
- [ ] `contact` — the real address or Telegram handle.
- [ ] `signupFormMinutes` — confirm 5 is honest for the real form.
- [ ] Which grey the mark's triangle takes — see "The mark".
- [ ] GitHub Pro (or flip the repo public), then Pages enabled and
      `PAGES_ENABLED=true` set.
- [ ] A `feat:` merge to `main` to publish.

## DRY notes

- **Agent infrastructure is duplicated by copy, deliberately.** `.claude/` and
  `scripts/` cannot be a package — they are files an agent reads by path, and
  every consumer edits them. `sync-agent-boilerplate` _is_ the reconciliation
  mechanism for exactly this duplication; that is what the watermark is for.
- **No shared design-system package between the two sites.** They share the
  _method_ (tokens generated from a TypeScript array, no colour literals in
  components) and nothing of the substance: different palettes, different fonts,
  different type scale, one on Mantine and one not. A package holding the method
  alone would be `generate-styles.ts`, ~100 lines that will diverge the moment
  either token list grows a shape the other does not have.
- **`generate-styles.ts`, `render-manifest.ts`, `chromium.ts`, `run-parallel.sh`,
  `type-overlap-check.ts` copy verbatim** — they are generic over what they
  operate on, so the copies are identical files, not parallel implementations.
  Divergence risk is real and is the sync skill's job, not a refactor's.
- **`og-render.ts` copies with a branch removed**, not rewritten: the
  authored-SVG card kind has no source here. `construct-metadata.ts` likewise
  loses the alternates branch, and `_mixins.scss` is `_mantine.scss` minus the
  Mantine half.
- **Within the new repo**: the four prose sections are one `<ProseSection>` over
  a data array, not four components; the four facts are one `<Facts>` over a
  data array; the two CTAs are one `<Cta>`; the eleven colours have exactly one
  home (`CSS_COLORS`) from which both the Sass mixin and the TypeScript union
  derive. The draft declares its dark palette twice (media query and
  `[data-theme]`) — dropping the toggle collapses that to one.
- **Not extracted:** `<TopBar>` and `<SiteFooter>` stay inside the
  `consultations` slice rather than moving to `shared/ui` or a `widgets/` layer.
  One page consumes them; promoting them now would invent a layer to hold a
  single consumer, which `.claude/rules/fsd.md` explicitly rejects.

## Explicitly out of scope

The other АЭАПП material in `leisan-psy-work` (Лекторий, Интенсив, Студенческий
фестиваль, Супервизия, …) is not part of this. If the association later wants a
full site, `/consultations` is already a stable path to keep.

## Ownership and analytics

The repository stays under `vzakharov` with Leisan added as a collaborator, and
transfers to the association only when there is a reason to. Nothing in the
build depends on which account holds it; a transfer after launch changes the
Pages URL, which the custom domain already insulates the shared links from.

**No analytics, deliberately.** Nothing to consent to, no banner, and no
third-party script on a page about psychological help. Adding one later is a
decision with a consent notice attached, not a config line.
