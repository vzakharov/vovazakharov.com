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
npm install

# Run development server
npm run dev

# Build for production
npm run build
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

```
├── app/
│   ├── layout.tsx          # Root layout with fonts and theme provider
│   ├── page.tsx            # Main homepage with all sections
│   └── globals.css         # Global styles and theme variables
├── components/
│   ├── card.tsx            # Reusable card components
│   ├── theme-provider.tsx  # Theme context provider
│   └── theme-toggle.tsx    # Light/Dark/Auto theme switcher
├── public/
│   ├── ava.png            # Avatar image
│   └── .nojekyll          # GitHub Pages configuration
└── .github/workflows/
    └── deploy.yml         # GitHub Actions deployment workflow
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
