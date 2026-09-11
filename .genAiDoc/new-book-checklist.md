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
- The title page shows "Published …" from `StorySite.publishedLine()`. The template reader does this for you; a custom page like Detective Daisy calls it under the `<h1>`.

4) Copyright
- Nothing to add per book. The home page "A little note from Akie" and the footer © line cover every story and picture on the site, and the © years update from the `published` dates.
- Only use pictures and text that Akie made (or has permission to use).

5) Check before merging
- Open the home page, All stories, the series page and the book through `file://`. Check that the cover, the "Published" date, the links and "Read this page" (👧 / 👦) all work.
- In Chrome, also check over `http://` (e.g. `python -m http.server`), which is how the live site behaves. Chrome offers different voices there.
- Go through `accessibility.md`.

6) Publish
- Branch `feat/<book-id>`, open a PR against `main`, merge. GitHub Pages deploys in a minute or two (see `git-and-deploy.md`).
