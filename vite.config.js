import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

/**
 * Makes the dev server resolve directory URLs the way GitHub Pages does.
 *
 * Pages answers `/qa` with a 301 to `/qa/`. Vite does not: only `index.html` is in the build
 * input, and Vite's default `appType: "spa"` rewrites any extensionless request that misses a
 * file to `/index.html`. So `/qa` quietly served the portfolio homepage instead of the QA
 * section — the wrong page, with a 200, which is worse than a 404.
 *
 * This middleware is registered inside `configureServer`, which Vite runs *before* its own
 * middlewares, so the redirect happens ahead of the SPA fallback. It only redirects when the
 * directory actually holds an `index.html`, leaving genuine misses to fall through unchanged.
 */
function pagesStyleDirectoryRedirects() {
  return {
    name: "pagesStyleDirectoryRedirects",
    configureServer(server) {
      const root = server.config.root;
      server.middlewares.use((req, res, next) => {
        const [pathname, query = ""] = (req.url ?? "/").split("?");

        const isDirectoryStyle =
          pathname !== "/" &&
          !pathname.endsWith("/") &&
          path.extname(pathname) === "";

        if (isDirectoryStyle) {
          const candidate = path.join(root, pathname, "index.html");
          // Guard against `..` escaping the project root before touching the filesystem.
          if (candidate.startsWith(root) && fs.existsSync(candidate)) {
            res.statusCode = 301;
            res.setHeader("Location", `${pathname}/${query ? `?${query}` : ""}`);
            res.end();
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  root: ".",
  plugins: [pagesStyleDirectoryRedirects()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
