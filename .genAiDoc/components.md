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
- Links back to the site go through `StorySite.url(path)` / `StorySite.home` (`assets/story-kit.js`), the same rule as `url()` in `assets/site.js`: on `file://` folder links get `index.html` appended so they don't open a file listing. Never hard-code `href="../../"`.

6) Read aloud (voice picker)
- `assets/read-aloud.js`, loaded in the story page `<head>` after `story-kit.js`. Uses the browser's built-in Web Speech API — no download.
- Markup: a `.read-tools` wrapper holding an empty `.voice-pick` and the `#read` pill with `#read-label`. Hide `.read-tools` on pages without story text.
- API: `ReadAloud.attach({ button, label, picker, getText })` returns `{ stop }`; call `stop()` on every page turn.
- Voices: 👧 Girl (default) and 👦 Boy, native-English voices only (US, UK, AU, CA, IE, NZ). Pitch is lifted so both sound cute and child-like; Edge's Ana/Maisie child voices are preferred. The choice is saved in `localStorage` (`storyshelf:voice`) and a short "Hi!" plays when it changes.
- Text is spoken in short pieces so Chrome doesn't cut off long pages. Styles are injected by the script (like `story-kit.js`) and use the page's `--btn`, `--btn-ink` and `--display` tokens.

Extending components
- If you need new component variants, add a function in `assets/site.js` and document the API here.
