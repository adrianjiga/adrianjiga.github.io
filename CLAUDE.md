# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

This is a **GitHub Pages** site. Pushing to `main` triggers the Jekyll build workflow (`.github/workflows/jekyll-gh-pages.yml`), which builds the site with Jekyll and deploys it. Jekyll is only used by the CI pipeline, not for local development.

## Local Development

Install dependencies first:

```bash
npm install
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port 3000 (portfolio only, with HMR) |
| `npm run build` | Bundle to `dist/` via Vite |
| `npm run preview` | Preview the `dist/` build on port 4173 |
| `npm run lint` | Run ESLint + Stylelint |
| `npm run lint:fix` | Auto-fix lint errors |
| `python3 -m http.server 8080` | Serve everything statically (good for QA helpers) |

**Vite scope**: Only the portfolio (`index.html`) is bundled by Vite. QA helper pages under `qa/` are plain static files not included in the Vite build graph.

## Architecture

```
/                        — Portfolio homepage (index.html)
  css/                   — Split CSS modules (base, layout, components, animations, etc.)
  js/                    — ES module scripts (cursorTrail, parallax, scrollEffects, themeToggle)
  dist/                  — Vite build output (not committed; used for preview/optimization)
/qa/                     — QA resources section
  index.html             — QA landing page
  helpers/
    index.html           — Directory of automation target pages
    buttons/             — Button interaction patterns (double-click, right-click, dynamic)
    automation-practice-form/  — Full registration form (radios, date picker, autocomplete, file upload, cascading dropdowns)
    webtables/           — CRUD table with search, pagination, rows-per-page
```

Each QA helper page carries its own `css/` and `js/` subdirectory — they are intentionally self-contained with no shared assets.

## QA Helpers

The pages under `qa/helpers/` are **Cypress automation targets** — self-hosted replicas of interaction patterns used in the `CypressAutomationExample` test suite. They have no external API dependencies; state that needs to persist across interactions is managed with `localStorage`.

When adding a new helper page, follow the same pattern: a dedicated folder under `qa/helpers/<name>/` with its own `index.html`, `css/style.css`, and `js/script.js`.

## Styling conventions

- The root `index.html` (portfolio) uses a dark theme defined entirely with CSS custom properties in `:root` (see the `--bg-*`, `--text-*`, `--accent` variables).
- The `qa/` pages use a minimal light theme inline in each file — no shared stylesheet.
- Google Fonts (`Bebas Neue`, `IBM Plex Mono`) are loaded only by the portfolio homepage.

## Vite strategy

**Vite is for local development only** — it is not part of the CI/CD pipeline.

- `npm run dev` / `npm run build` / `npm run preview` work locally.
- GitHub Pages deployment is handled by Jekyll (`jekyll-gh-pages.yml`). Jekyll serves the raw source files; `dist/` is gitignored and never deployed.
- Do **not** add a Vite build step to the CI workflow unless you intentionally migrate away from Jekyll.
- If you're unsure which output to look at: the deployed site is built by Jekyll from `/`, not from `dist/`.
