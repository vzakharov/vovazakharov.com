# vovazakharov.com

Personal showcase website for Vova Zakharov - Developer, AI tinkerer, word shaker, generative metalhead.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Mantine 9, with SCSS modules for component CSS
- **Theme:** Dark/Light/Auto switching via Mantine's colour scheme
- **Fonts:** Merriweather (serif), JetBrains Mono (monospace)
- **Deployment:** GitHub Pages via GitHub Actions

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

The dev server runs at [http://localhost:3000](http://localhost:3000)

## Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Setup GitHub Pages (one-time)

1. Go to repository Settings → Pages
2. Under "Build and deployment":
   - Source: GitHub Actions
3. Push to main branch to trigger deployment

## Project Structure

Application code follows [Feature-Sliced Design](https://feature-sliced.design/)
under `src/`; `.claude/rules/fsd.md` carries the conventions.

```
├── app/                        # App Router — routing only, one-line re-exports
│   ├── layout.tsx              # → src/app/ui
│   ├── page.tsx                # → src/pages/home
│   ├── cv/, [locale]/cv/       # → src/pages/cv
│   └── case-studies/           # → src/pages/case-studies
├── pages/                      # Empty Pages-Router shadow — see pages/README.md
├── src/
│   ├── shared/                 # config, content, i18n, seo, typings, ui, lib/*
│   ├── features/switch-theme/  # Light/Dark/Auto theme switcher
│   ├── pages/                  # Page composition — home, cv, case-studies
│   └── app/                    # FSD app layer — root layout, Mantine provider, stylesheets
├── styles/                     # _mantine.scss — Sass counterparts to the PostCSS preset's mixins
├── public/
│   ├── content/                # Long-form prose and its assets, served raw
│   ├── ava.png                 # Avatar image
│   └── .nojekyll               # GitHub Pages configuration
└── .github/workflows/
    └── deploy.yml              # GitHub Actions deployment workflow
```

## Features

- Responsive design (mobile-first)
- Card-based layout throughout
- Spotify embeds for music projects
- Theme switching (Light/Dark/Auto)
- Static export for fast loading
- SEO-friendly metadata

## Sections

- **Hero:** Avatar, taglines, navigation
- **/dev:** Development projects and professional work
- **/music:** Spotify embeds for active music projects
- **/writing:** Featured articles from Glitchporn Substack
- **/contact:** Social links and email

## License

© Vova Zakharov. All rights reserved.
