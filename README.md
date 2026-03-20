# adrianjiga.github.io

Personal portfolio and QA helpers site. Built with vanilla HTML, CSS, and JavaScript.

## Sections

- **Portfolio** (`/`) - Homepage with work, interests, about, and contact links
- **QA Helpers** (`/qa/helpers/`) - Self-contained Cypress automation target pages (buttons, webtables, forms)

## Development

```bash
npm install
npm run dev       # Vite dev server on port 3000
npm run lint      # ESLint + Stylelint
npm run lint:fix  # Auto-fix lint errors
```

## Deployment

Pushing to `main` triggers the Jekyll build workflow (`.github/workflows/jekyll-gh-pages.yml`), which lints, builds, and deploys to GitHub Pages. Vite is for local development only.

## Tech

- HTML, CSS (custom properties, split modules), JavaScript (ES modules)
- Fonts: Bebas Neue, IBM Plex Mono
- Linting: ESLint, Stylelint
- Local dev: Vite
- CI/CD: GitHub Actions, Jekyll, GitHub Pages
