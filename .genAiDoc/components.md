# Component Guide

This file documents the main UI components and their expected markup/behaviour.

1) Hero (home)
- Markup: a centered `.hero-card` containing `<h1>` and `.lede` and a `.btn`.
- Data: `L.site.name`, `L.site.tagline`.
- Behaviour: primary CTA links to newest story; keep content concise.

2) Cover (book card)
- Markup produced by `cover()` in `assets/site.js`.
- Inputs: `title`, `subtitle`, `path`, `cover`, `emoji`, `color`, `book`.
- Interaction: link to `path`, show `cover-num` when `book` exists.

3) Tile (list item)
- Markup: `.tile` with cover and `.tile-meta` including status or series info.

4) Series band
- Uses `seriesBand()` in `assets/site.js` — badge on the left, title, blurb and horizontal list of books.

5) Story page
- Data-root for relative assets must be correct (`data-root="../../"` in nested story pages).
- Keep story content in the story folder `stories/<id>/index.html` and assets next to it.

Extending components
- If you need new component variants, add a function in `assets/site.js` and document the API here.
