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
- Markup: `.tile` with cover and `.tile-meta` including status or series info, plus a `.tile-date` "Published …" line for ready books.

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
- Voices: 👧 Girl (default) and 👦 Boy, native-English voices only (US, UK, AU, CA, IE, NZ). Pitch is lifted so both sound cute and child-like; Edge's Ana/Maisie child voices are preferred. Chrome's online "Google …" voices are ranked last: they sound robotic with the pitch lifted, and Chrome only offers them on the website (not on `file://`), so the live site would sound different from local testing. The choice is saved in `localStorage` (`storyshelf:voice`) and a short "Hi!" plays when it changes.
- Edge tip: in any browser other than Edge, pressing "Read this page" shows a small `.edge-tip` speech bubble under the button suggesting Microsoft Edge. Only Edge has the natural voices; Chrome's Windows and Google voices sound robotic however they're tuned. On Windows the tip has an "Open in Edge" button (a `microsoft-edge:` link). "Got it" hides it for good in that browser (`localStorage` `storyshelf:edge-tip`). Edge is detected from the user agent (`Edg/`, `EdgA/`, `EdgiOS/`).
- Text is spoken in short pieces so Chrome doesn't cut off long pages. Styles are injected by the script (like `story-kit.js`) and use the page's `--btn`, `--btn-ink` and `--display` tokens.

7) Published date
- Every ready story has `published: "YYYY-MM-DD"` in `assets/library.js`. The newest published story is featured on the home page.
- Order: every list of books (home shelf, All stories, "Stories on their own") is in RELEASE ORDER, oldest first, with "coming soon" parcels last — `inOrder` in `assets/site.js`. Never show a newer book before an older one; only the "Newest story" feature uses the newest (`ready[0]`). Series bands stay in book-number order.
- Shown as "Published 11 September 2026" in a `<time datetime>` element: on tiles, in the home "Newest story" feature, on series page book rows (`published()` in `assets/site.js`), and on the book's title page (`StorySite.publishedLine()` in `assets/story-kit.js`).
- The date is formatted by hand (not `new Date()`), so it never shifts a day in other time zones. Keep the two copies of the format the same.

8) Kind note (copyright notice)
- `kindNote()` in `assets/site.js` adds "A little note from Akie" (`.kind-note`) at the bottom of the home page: stories and pictures belong to Akie; read and listen here as often as you like; please don't copy, print, share or use them anywhere else.
- It opens in Akie's own voice: "Hi! I’m Akie, and I’m 8 years old", so readers know the stories are written by a child. The age comes from `site.authorAge` in `assets/library.js` — change that one number on her birthday. Never put a birth date anywhere.
- Tone: written for children. Warm, cheerful and thankful, with a few emoji. No legal words, warnings or threats. The only formal part is the small `.fine` © line.
- The © years (`copyrightYears()`) run from the first to the latest `published` year and also appear in the footer on every site page.

Extending components
- If you need new component variants, add a function in `assets/site.js` and document the API here.
