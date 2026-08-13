# adrianjiga.github.io

Personal portfolio and QA helpers site. Built with vanilla HTML, CSS, and JavaScript.

## Sections

- **Portfolio** (`/`) - Homepage with work, interests, about, and contact links
- **QA Helpers** (`/qa/helpers/`) - Self-contained automation target pages (buttons, webtables, forms), driven by the Cypress, Playwright and Selenium suites
- **Architecture** (`/qa/architecture/`) - How the six repositories fit together: the `data-cy` contract, the coordinated-deploy problem, and the known gaps

## The `data-cy` contract

Every element the suites touch carries a `data-cy` attribute, and that attribute is the **only**
thing they are permitted to select on — no ids, no `label[for=…]`, no CSS classes, no XPath.

Ids and class names serve the page and get renamed freely; `data-cy` hooks serve the tests and
cannot. Changing one is a breaking change for four repositories at once, and because the suites
run against the *deployed* site, a site change and a suite change cannot land atomically. Merge
the site first and expect a red window.

See the [architecture notes](https://adrianjiga.github.io/qa/architecture) for the full picture.

## Development

```bash
npm install
npm run dev       # Vite dev server on port 3000
npm run lint      # ESLint + Stylelint
npm run lint:fix  # Auto-fix lint errors
```

Only the portfolio (`index.html`) is in Vite's build graph; the `qa/` pages are plain static
files. Directory URLs work without a trailing slash in dev (`/qa` → `/qa/`), matching how
GitHub Pages behaves — see `pagesStyleDirectoryRedirects` in `vite.config.js`.

## Deployment

Pushing to `main` triggers the Jekyll build workflow (`.github/workflows/jekyllGhPages.yml`), which lints, builds, and deploys to GitHub Pages. Vite is for local development only — Jekyll serves the raw source files, and `dist/` is gitignored and never deployed.

## Naming

**camelCase everywhere** — DOM ids, `data-cy` values, CSS class names, custom properties,
`@keyframes`, and file names. Stylelint enforces the CSS half rather than merely permitting it:
`selector-id-pattern`, `selector-class-pattern`, `custom-property-pattern` and
`keyframes-name-pattern` are all set to `^[a-z][a-zA-Z0-9]*$`, overriding
`stylelint-config-standard`'s kebab-only defaults. The convention dictates the lint config, not
the other way round.

Two exceptions, both forced from outside: **URL path segments** stay kebab-case
(`qa/helpers/automation-practice-form/`) because Pages paths are case-sensitive and hyphens are
the web convention, and **`package-lock.json`** is named by npm.

## Tech

- HTML, CSS (custom properties, split modules), JavaScript (ES modules)
- Fonts: Bebas Neue, IBM Plex Mono
- Linting: ESLint, Stylelint
- Local dev: Vite
- CI/CD: GitHub Actions, Jekyll, GitHub Pages
