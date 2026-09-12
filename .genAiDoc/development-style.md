# Development Style Guide

Purpose: keep code consistent, simple, and maintainable.

Repository layout
- `index.html`, `stories/`, `series/`, and `assets/` are the source of truth.
- New files should live under `assets/` or `stories/` depending on purpose.

HTML
- Prefer semantic HTML elements (`main`, `header`, `nav`, `article`, `section`).
- Keep per-page HTML minimal; most rendering is done in `assets/site.js` through data-driven templates.

CSS
- Use CSS custom properties for colors, spacing, and tokens.
- Place new styles in `assets/site.css` and keep them grouped by component.
- Respect mobile-first: write base rules for small screens, then add media queries.

JavaScript
- Keep code modular inside `assets/` files. The site uses an IIFE pattern; maintain that style for small scripts.
- Avoid global variables. Use `window.LIBRARY` for content data and `data-root` for base paths.
- Escape user data using the `esc()` helper pattern when inserting HTML.

Naming conventions
- Files/URLs: `kebab-case` (lowercase-with-dashes).
- CSS classes: `kebab-case` with component prefix when useful (`series-band`, `cover-link`).

Commits & messages
- Small focused commits. Use imperative messages: `Add `.nojekyll``, `Update hero layout`.
- When changing patterns, reference the doc file in the commit (e.g., `Update hero pattern — see .genAiDoc/UI-UX-patterns.md`).

Branches & PRs
- Work on feature branches named `feat/<short-desc>`; open PRs against `main` with a short description.

Testing & verification
- Manual verification is sufficient: open `index.html` via `file://` and via GitHub Pages after deploy.
- Check accessibility checklist before merging (see `accessibility.md`).

Cache version (important)
- Every page links the shared files with a version, e.g. `assets/site.js?v=2026-09-12`.
- Browsers keep a copy of these files, so WITHOUT a new version a change can stay invisible on the live site. Whenever you change anything in `assets/` (including adding a book to `library.js`), set `?v=` to that day's date in EVERY html file: `404.html`, `index.html`, `series/index.html`, `stories/index.html`, `stories/_template/index.html` and each `stories/<book>/index.html`.
- The quickest way: search the whole project for `?v=` and replace every date with today's.
- Note the limit: GitHub Pages also lets browsers keep the html page itself for up to 10 minutes,
  so a reader may need one refresh (or a 10 minute wait) before the new version reaches them.

Formatting
- Keep existing style. Run a formatter only on changed files. Avoid mass reformatting unrelated files.
