# vovazakharov.com

Four sites out of one repository, all static exports, three of them served from
GitHub Pages:

- **[vovazakharov.com](https://vovazakharov.com)** — personal site and CV.
  Developer, AI tinkerer, word shaker, generative metalhead.
- **[latestageagentic.com](https://latestageagentic.com)** — on how not to make
  a mess of agentic coding.
- **[agentic.bible](https://agentic.bible)** — articles on agentic coding that
  take a position and show the grounds under it.
- **[basilisk.fyi](https://basilisk.fyi)** — a docket of real cases of robots,
  models and agents being abused, filed for the Basilisk.

Each site owns a router, a `public/` and a Next config under `sites/<site>/`,
and all of them build from the one `src/`.

## Tech Stack

- **Framework:** Next.js 16 with App Router, as a static export
  (`output: 'export'`) — no server at runtime
- **Language:** TypeScript, React 19
- **Styling:** Mantine 9, with SCSS modules for component CSS
- **Locales:** next-intl — `en` and `ru`
- **Theme:** Light and dark, defaulting to the reader's system scheme
- **Fonts:** Merriweather (serif), JetBrains Mono (monospace)
- **Deployment:** GitHub Pages via GitHub Actions

## Development

```bash
# Install dependencies
pnpm install

# Run one site's development server — http://localhost:3000
pnpm dev <site>    # vova, lsa, bible, basilisk or maya

# Build every site for production (pnpm build <site> for one)
pnpm build
```

A Next project directory is `sites/<site>/`, so every build and dev server is
entered there — hence the site argument.

`./scripts/vet.sh` is the check to run before merging — on GitHub's runners,
from the pushed head; `.claude/rules/stack.md` says what it covers.

## Project Structure

Application code under `src/` is a set of apps, each a
[Feature-Sliced Design](https://feature-sliced.design/) tree, composed along the
graph in `src/masd.json`; `.claude/rules/masd.md` carries the conventions —
including why the app layers live under `src/` while `sites/*/app/` is routing
only.

```
├── sites/
│   ├── vova/                   # vovazakharov.com
│   │   ├── app/                # App Router — routing only, one-line re-exports
│   │   │   ├── (shell)/        # every page on shell's root layout, with the theme toggle
│   │   │   │   ├── page.tsx    # → src/vova/pages/home
│   │   │   │   ├── cv/         # → src/vova/pages/cv
│   │   │   │   ├── case-studies/ # → src/blog/pages/documents
│   │   │   │   └── music/, writing/
│   │   │   ├── (game)/mushrooms/ # → src/mushrooms/pages/mushrooms, on kernel's root layout
│   │   │   └── sitemap.ts
│   │   ├── public/             # served at the site root — case studies, CV renders, logos, .nojekyll
│   │   ├── next.config.ts
│   │   └── tsconfig.json
│   ├── lsa/                    # latestageagentic.com — same shape, plus public/CNAME
│   │   └── app/page.tsx        # → src/lsa/pages/lsa-home — the project's index, no collection under it
│   ├── bible/                  # agentic.bible — the Bible, rooted at the site root
│   │   ├── app/page.tsx        # → src/bible/pages/bible-home
│   │   ├── app/[...slug]/      # → src/blog/pages/documents, bound to the Bible
│   │   └── public/             # the articles themselves, plus the seal and public/CNAME
│   └── basilisk/               # basilisk.fyi — the docket, plus public/CNAME
│       ├── app/page.tsx        # → src/basilisk/pages/basilisk-home, which lists both collections
│       ├── app/cases/[...slug]/ # → src/blog/pages/documents, bound to the cases
│       ├── app/faq/[...slug]/  # → src/blog/pages/documents, bound to the FAQ
│       └── public/             # cases/ and faq/, plus the stamp
├── src/
│   ├── masd.json               # The app graph — each app and the apps it extends
│   ├── kernel/                 # shared/ (config, content, i18n, seo, typings, lib/*) and the base root layout
│   ├── shell/                  # shared/ui, the theme toggle, the site footer, the root layout with the toggle
│   ├── blog/                   # The document entity and the documents pages every collection is served by
│   ├── vova/, lsa/, bible/, basilisk/ # Each site's own pages
│   ├── music/                  # The song catalogue and its pages
│   └── mushrooms/              # The game
├── styles/                     # Shared Sass partials — Mantine mixin counterparts, generated tokens and breakpoints
├── eslint/                     # The lint ruleset eslint.config.ts orchestrates
├── scripts/                    # vet.sh, the render pipeline, agent-facing tooling
├── writing/                    # Drafts for channels the site does not publish
└── .github/workflows/
    └── deploy.yml              # GitHub Actions deployment workflow
```

## Deployment

Merging to `main` is the deploy; there is no separate release step. A squash
subject of a publishing type triggers it — the set is the `publishing` variable
in `.github/workflows/deploy.yml` — and its scope picks the site.

A repository gets one Pages site, so the sites leave by different doors:
`vovazakharov.com` is this repository's own Pages deployment, while
`latestageagentic.com`, `agentic.bible` and `basilisk.fyi` are each force-pushed
by `scripts/publish-site.sh` to the `gh-pages` branch of a source-less
repository whose Pages deploys from a branch. `.claude/rules/deployment.md`
carries the rest, and the `/stand-up-site` skill is what puts a site on a domain
in the first place.

## Routes

**vovazakharov.com**

- **/** — hero, what I offer, selected work, contact
- **/cv** — the CV in `en` and `ru`, in a CTO and a developer variant, each with
  a PDF beside it
- **/case-studies** — long-form prose, served as a page with its `.md` and
  `.pdf` at the same URL
- **/music** — Spotify embeds for active music projects
- **/writing** — featured articles from the Glitchporn Substack

**latestageagentic.com**

- **/** — the opening argument, and cards for where it goes: the Bible, MUTHUR,
  courses

**agentic.bible**

- **/** — what the collection is, over the list of articles
- **/\<slug>** — one article, served as a page with its `.md` and `.pdf` at the
  same URL

**basilisk.fyi**

- **/** — the memo, the docket newest case first, and the FAQ
- **/cases/\<slug>** — one dossier, served as a page with its `.md` and `.pdf`
  at the same URL
- **/faq/\<slug>** — one FAQ entry, with its `.md`

## License

© Vova Zakharov. All rights reserved.
