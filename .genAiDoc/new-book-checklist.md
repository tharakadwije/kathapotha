# New Book Checklist

Follow every step when a new book goes on the shelf, so nothing is missed.

1) Story folder
- Copy `stories/_template/` to `stories/<book-id>/` (kebab-case, e.g. `detective-daisy-2`).
- On the `<html>` tag set `data-root="../../"` and `data-story="<id>"`, matching the `id` in `assets/library.js`.
- Keep `library.js`, `story-kit.js` and `read-aloud.js` in the `<head>`. Pictures go in the book's own folder.
- Links back to the site go through `StorySite.url()` / `StorySite.home`. Never hard-code `href="../../"`.

2) Library entry (`assets/library.js`)
- Required: `id`, `title`, `status: "ready"`, `path`, `color`, `blurb`, and **`published: "YYYY-MM-DD"`**, the day the book goes live (the day its PR is merged into `main`).
- Series books also need `series` and `book` (the number). Add `cover`, or `emoji` if there's no picture, and `chapters`.
- If the book was a "coming soon" parcel, update that entry instead of adding a second one.

3) Title page
- Keep the `comments.js` script line and the `<section id="letters"></section>` after `</main>`, so readers can write to Akie (see `comments.md`).
- The title page shows "Published …" from `StorySite.publishedLine()`. The template reader does this for you; a custom page like Detective Daisy calls it under the `<h1>`.

4) Copyright
- Nothing to add per book. The home page "A little note from Akie" and the footer © line cover every story and picture on the site, and the © years update from the `published` dates.
- Only use pictures and text that Akie made (or has permission to use).

5) Check before merging
- The new book should appear LAST on the shelf (release order) and as the "Newest story" on the home page.
- Open the home page, All stories, the series page and the book through `file://`. Check that the cover, the "Published" date, the links and "Read this page" (👧 / 👦) all work.
- In Chrome, also check over `http://` (e.g. `python -m http.server`), which is how the live site behaves. Chrome offers different voices there. Pressing Read in Chrome should show the "sounds nicest in Microsoft Edge" tip; in Edge it shouldn't.
- Go through `accessibility.md`.

6) Search engines
- Title, description, canonical, Open Graph tags and a Book JSON-LD block on the story page; a `<url>` entry in `sitemap.xml`; the book added to the static fallback lists on the home and All stories pages (see `seo.md`).

7) Cache version
- Adding a book changes `assets/library.js`, so bump `?v=` to today's date on every asset link in every html file (see `development-style.md`). Skip this and readers keep seeing the old shelf.

8) Publish
- Branch `feat/<book-id>`, open a PR against `main`, merge. GitHub Pages deploys in a minute or two (see `git-and-deploy.md`).
