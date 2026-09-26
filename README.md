# vovazakharov.com

Two sites out of one repository, both static exports served from GitHub Pages:

- **[vovazakharov.com](https://vovazakharov.com)** — personal site and CV. Developer, AI tinkerer, word shaker, generative metalhead.
- **[latestageagentic.com](https://latestageagentic.com)** — on how not to make a mess of agentic coding.

Each site owns a router, a `public/` and a Next config under `apps/<site>/`, and
both build from the one `src/`.

## Tech Stack

- **Framework:** Next.js 16 with App Router, as a static export (`output: 'export'`) — no server at runtime
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
pnpm dev:vova
pnpm dev:lsa
pnpm dev:bible

# Build every site for production (pnpm build:<site> for one)
pnpm build
```

A Next project directory is `apps/<site>/`, so every build and dev server is
entered there — hence no root `pnpm dev`.

`./scripts/vet.sh` is the check to run before pushing; `.claude/rules/stack.md`
says what it covers.

## Project Structure

Application code follows [Feature-Sliced Design](https://feature-sliced.design/)
under `src/`; `.claude/rules/fsd.md` carries the conventions — including why the
FSD app layer is `src/app` while `apps/*/app/` is routing only.

```
├── apps/
│   ├── vova/                   # vovazakharov.com
│   │   ├── app/                # App Router — routing only, one-line re-exports
│   │   │   ├── page.tsx        # → src/pages/home
│   │   │   ├── cv/             # → src/pages/cv
│   │   │   ├── case-studies/   # → src/pages/documents
│   │   │   ├── music/, writing/
│   │   │   └── sitemap.ts
│   │   ├── public/             # served at the site root — case studies, CV renders, logos, .nojekyll
│   │   ├── next.config.ts
│   │   └── tsconfig.json
│   ├── lsa/                    # latestageagentic.com — same shape, plus public/CNAME
│   │   └── app/page.tsx        # → src/pages/lsa-home — the project's index, no collection under it
│   └── bible/                  # agentic.bible — the Bible, rooted at the site root
│       ├── app/page.tsx        # → src/pages/bible-home
│       ├── app/[...slug]/      # → src/pages/documents, bound to the Bible
│       └── public/             # the articles themselves, plus the seal and public/CNAME
├── src/
│   ├── shared/                 # config, content, i18n, seo, typings, ui, lib/*
│   ├── features/switch-theme/  # Light/dark toggle over a stored system default
│   ├── widgets/                # Blocks two page slices share — the article cards, the site footer
│   ├── pages/                  # Page composition — home, lsa-home, bible-home, cv, documents, music, writing
│   └── app/                    # FSD app layer — root layout, Mantine provider, stylesheets
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
`latestageagentic.com` and `agentic.bible` are each force-pushed by
`scripts/publish-site.sh` to the `gh-pages` branch of a source-less repository
whose Pages deploys from a branch.
`.claude/rules/deployment.md` carries the rest, and the `/stand-up-site` skill is what
puts a site on a domain in the first place.

## Routes

**vovazakharov.com**

- **/** — hero, what I offer, selected work, contact
- **/cv** — the CV in `en` and `ru`, in a CTO and a developer variant, each with a PDF beside it
- **/case-studies** — long-form prose, served as a page with its `.md` and `.pdf` at the same URL
- **/music** — Spotify embeds for active music projects
- **/writing** — featured articles from the Glitchporn Substack

**latestageagentic.com**

- **/** — the opening argument, and cards for where it goes: the Bible, MUTHUR, courses

**agentic.bible**

- **/** — what the collection is, over the list of articles
- **/\<slug>** — one article, served as a page with its `.md` and `.pdf` at the same URL

## License

© Vova Zakharov. All rights reserved.
