# UI / UX Patterns — Read Aloud Akie

Purpose: show the visual and interaction patterns to follow so new UI matches the existing theme.

Design principles
- Friendly, warm, and readable — kid-focused but simple.
- Large, inviting typography for titles; clear readable body text.
- Strong, rounded buttons with playful but accessible colors.
- Mobile-first responsive layout — designs must work well on small screens.

Colors & tokens
- Use CSS custom properties in `assets/site.css` (e.g. `--wall`, `--carrot`, `--leaf`).
- Prefer existing palette; add new variables only if necessary and document them here.

Typography
- Display / headings: `--display` (Grandstander fallback). Heavy weight for headings.
- Body: `--body` (Andika + system UI) for readable long text.

Hero pattern
- Centered card with large friendly title (use `hero-card` style).
- Short lede under title (max 2 lines, 36em width).
- Primary CTA: `Read the newest story` (prominent `.btn`) and secondary restful links as text links.

Shelf / Cards
- Cover cards are tall (aspect 4:5) with strong color fills.
- Use `cover-link` and `cover` markup; include `cover-num` when a book has `book` number.

Series & Story pages
- Series are shown in rounded panels (`series-band`).
- Story pages are immersive: large cover to the left and content to the right on wide screens; stack on small screens.

Interactions & animation
- Minimal motion: subtle lifts on hover (`transform: translateY(-10px)`) and tactile button press.
- Respect `prefers-reduced-motion`.

Images & icons
- Inline SVG or small raster images (cover images) with `loading="lazy"`.
- Provide decorative SVGs where appropriate but always include meaningful `alt` on content images.

Microcopy
- Keep labels brief and friendly (e.g., "Start reading", "Coming soon").

When to create a new pattern
- If you need a component that recurs in 3+ places, add a documented pattern here and implement re-usable markup in `assets/site.js`.
