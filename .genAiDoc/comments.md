# Letters to Akie (comments)

Readers can write a letter at the bottom of a story page. Every letter is held until Akie approves it,
so nothing a stranger types ever appears beside a story on its own.

How the pieces fit
- `assets/comments.js` — the panel on story pages. Loaded in the `<head>` after `story-kit.js`; it waits
  for the body, then fills `<section id="letters">` (static in a custom story page, added by
  `assets/reader.js` for template pages).
- `assets/library.js` → `site.comments` — the address of the service. **Empty means the panel does not
  appear at all**, so the site still works with nothing deployed.
- `worker/` — a Cloudflare Worker with a D1 database, on Cloudflare's free plan. Setup steps are in
  `worker/README.md`; the moderation page is `/admin?token=…`.

Rules for the panel
- Tone matches the rest of the site: "Letters to Akie", "Send to Akie", a thank-you that explains the
  letter appears once Akie says yes.
- Ask for a first name only. The form repeats the safety line: no last name, address, school or phone number.
- Letters are rendered with `textContent`, never `innerHTML`, so anything typed shows as plain text.
- Styles are injected by the script (like `read-aloud.js`) and use the page's own tokens
  (`--paper`, `--ink`, `--carrot`, `--display`), so a story page with its own colours still matches.

Protections (all in `worker/src/index.js`)
- Nothing is public until approved; the public list only ever returns approved letters.
- A hidden "website" field catches robots; those submissions are dropped silently.
- Five letters per hour per sender, using a hashed IP (never the address itself).
- Only the site's own addresses may post (`ALLOWED_ORIGINS`); the moderation page needs `ADMIN_TOKEN`.
- Lengths are capped: name 24, message 600 characters.

For a new book
- Nothing to do. The panel uses the page's `data-story` id, so a new story page gets its own letters
  as soon as it has the usual `<script src="…/comments.js">` line and a `<section id="letters">`.
