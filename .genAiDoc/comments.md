# Letters to Akie (comments)

Readers can write a letter at the bottom of a story page. Every letter is held until Akie approves it,
so nothing a stranger types ever appears beside a story on its own.

In this repository (the public part)
- `assets/comments.js` — the panel on story pages. Loaded in the `<head>` after `story-kit.js`; it waits
  for the body, then fills `<section id="letters">` (static in a custom story page, added by
  `assets/reader.js` for template pages).
- `assets/library.js` → `site.comments` — the web address of the service. It is visible to anyone, because
  the reader's browser has to call it; that is normal and safe. Left empty, the panel does not appear at all.

Not in this repository
- The service that stores and moderates letters lives in a **separate private repository**
  (`read-aloud-comments`): a Cloudflare Worker with a D1 database. Its setup steps, config and moderation
  page are documented there. Never copy that code, its database id, or anything about it into this repo.
- Passwords are never in any repository. They are stored in Cloudflare as secrets.

Rules for the panel
- Tone matches the rest of the site: "Letters to Akie", "Send to Akie", a thank-you that explains the
  letter appears once Akie says yes.
- Ask for a first name only. The form repeats the safety line: no last name, address, school or phone number.
- Letters are rendered with `textContent`, never `innerHTML`, so anything typed shows as plain text.
- Styles are injected by the script (like `read-aloud.js`) and use the page's own tokens
  (`--paper`, `--ink`, `--carrot`, `--display`), so a story page with its own colours still matches.

For a new book
- Nothing to do. The panel uses the page's `data-story` id, so a new story page gets its own letters as
  soon as it has the usual `<script src="…/comments.js">` line and a `<section id="letters">`.
