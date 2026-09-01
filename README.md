# vovazakharov.com

Personal showcase website for Vova Zakharov - Developer, AI tinkerer, word shaker, generative metalhead.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Theme:** Dark/Light/Auto switching via next-themes
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
under `src/`; `src/README.md` is the tour.

```
├── app/                        # App Router, and the FSD app layer
│   ├── layout.tsx              # Root layout — fonts, providers, base metadata
│   ├── theme-provider.tsx      # Theme context provider
│   ├── page.tsx                # Homepage route → src/pages/home
│   ├── cv/, [locale]/cv/       # CV routes → src/pages/cv
│   └── globals.css             # Global styles and theme variables
├── pages/                      # Empty Pages-Router shadow — see pages/README.md
├── src/
│   ├── shared/                 # config, i18n, seo, ui, lib/*
│   ├── features/switch-theme/  # Light/Dark/Auto theme switcher
│   └── pages/{home,cv}/        # Page composition
├── content/                    # Long-form prose and its assets
├── public/
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
