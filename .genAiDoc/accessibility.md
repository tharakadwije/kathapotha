# Accessibility Checklist

Use this checklist before merging UI changes.

- Semantic HTML: use `header`, `main`, `nav`, `article`, `section`, `footer`.
- Images: provide `alt` text for content images; use empty `alt=""` for decorative images.
- Color contrast: ensure text has sufficient contrast (WCAG AA minimum) — check headings and small text.
- Keyboard: all interactive elements must be reachable and operable via keyboard (Tab, Enter/Space).
- Focus: visible focus state for interactive elements (`:focus-visible`).
- ARIA: only use ARIA when semantic HTML is not enough; keep roles simple.
- Motion: respect `prefers-reduced-motion` and avoid distracting animations.
- Form labels: associate inputs with `<label>` and provide helper text where needed.
- Live regions: use `aria-live` for dynamic content when appropriate (e.g., `#book` uses `aria-live`).

Quick tools: use aXe, Lighthouse, or WAVE to get fast feedback.
