# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

This is a **GitHub Pages** site. Pushing to `main` triggers the Jekyll build workflow (`.github/workflows/jekyllGhPages.yml`), which builds the site with Jekyll and deploys it. Jekyll is only used by the CI pipeline, not for local development.

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

The pages under `qa/helpers/` are **automation targets for all three suites** — `CypressAutomationExample`, `PlaywrightAutomationExample` and `SeleniumAutomationExample` — self-hosted replicas of common interaction patterns. They have no external API dependencies; state that needs to persist across interactions is managed with `localStorage`.

When adding a new helper page, follow the same pattern: a dedicated folder under `qa/helpers/<name>/` with its own `index.html`, `css/<name>.css`, and `js/<name>.js` (e.g. `webtables/css/webtables.css`).

**Every interactive element needs a `data-cy` hook.** That attribute is the contract the three
suites depend on; ids are an implementation detail and no suite may select by one. Changing or
removing a `data-cy` value is a breaking change for four repositories at once, and because the
suites run against the deployed site, a site change and a suite change cannot land atomically —
expect a window where CI is red and merge the site first.

## Styling conventions

- The root `index.html` (portfolio) uses a dark theme defined entirely with CSS custom properties in `:root` — the palette is `--acid*`, `--blue*`, `--red*`, plus `--bgPrimary`, `--textPrimary`, `--borderColor`.
- The `qa/` pages each carry their own stylesheet under `qa/helpers/<name>/css/`. None of them use an inline `<style>` block, and there is no stylesheet shared between them.
- Google Fonts (`Bebas Neue`, `IBM Plex Mono`) are loaded only by the portfolio homepage.

## Naming conventions

**camelCase everywhere, with no exceptions that aren't forced by a third party.** This covers DOM
ids, `data-cy` values, CSS class names, CSS custom properties, `@keyframes` names, JS identifiers,
and file names.

Stylelint enforces the CSS half rather than merely permitting it — `selector-id-pattern`,
`selector-class-pattern`, `custom-property-pattern` and `keyframes-name-pattern` are all set to
`^[a-z][a-zA-Z0-9]*$`. `stylelint-config-standard` ships these as kebab-only, so they are
deliberately overridden: **the convention dictates the lint config, not the other way round.**

Two things stay kebab-case, both because something external requires it:

- **URL path segments**, e.g. `qa/helpers/automation-practice-form/`. Hyphens are the web
  convention, and GitHub Pages paths are case-sensitive, so a camelCase directory becomes a
  transcription trap.
- **`package-lock.json`**, whose name npm mandates.

## Vite strategy

**Vite is for local development only** — it is not part of the CI/CD pipeline.

- `npm run dev` / `npm run build` / `npm run preview` work locally.
- GitHub Pages deployment is handled by Jekyll (`jekyllGhPages.yml`). Jekyll serves the raw source files; `dist/` is gitignored and never deployed.
- **Directory URLs work without a trailing slash**, matching GitHub Pages. Pages answers `/qa`
  with a 301 to `/qa/`; Vite does not, because only `index.html` is in the build input and the
  default `appType: "spa"` rewrites any extensionless miss to `/index.html` — so `/qa` used to
  serve the portfolio homepage with a 200, which is worse than a 404. The
  `pagesStyleDirectoryRedirects` plugin in `vite.config.js` issues the same 301 in dev. It only
  fires when the directory actually contains an `index.html`.
- The SPA fallback is otherwise untouched, so a genuine miss like `/doesNotExist` still returns
  the homepage with a 200 rather than a 404. Setting `appType: "mpa"` would make those 404
  properly, at the cost of changing behaviour for every unmatched path.
- Do **not** add a Vite build step to the CI workflow unless you intentionally migrate away from Jekyll.
- If you're unsure which output to look at: the deployed site is built by Jekyll from `/`, not from `dist/`.
