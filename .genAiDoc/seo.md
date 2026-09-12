# SEO — being found in search

Goal: someone searching for "read aloud akie" (or a book's title) finds readaloudakie.com.

What is set up
- `robots.txt` welcomes search engines and points at `sitemap.xml`. The story template stays disallowed.
- `sitemap.xml` lists the home page, All stories, Series and every ready book, with `lastmod` = its `published` date.
- Every public page has: a descriptive `<title>` ending in "| Read Aloud Akie" (the home page leads with the brand), a `<meta name="description">` of roughly 150 characters, a `<link rel="canonical">`, Open Graph + Twitter tags, and `theme-color`.
- Shared link preview: `assets/social-card.png` (1200x630).
- Structured data (JSON-LD): `WebSite` on the home page, `Book` on each story page (author Akie, `datePublished`, cover image, series, `isAccessibleForFree`).
- Because pages are built by `assets/site.js`, each one also carries plain static content inside `#main` (a heading, a lede and links). Scripts replace it the moment they run; it exists for crawlers that don't run JavaScript. Story pages carry a `<noscript>` summary.
- `404.html` and `stories/_template/index.html` keep `noindex` on purpose.

For every new book
- Give the story page a `<title>` of "<Book title> | Read Aloud Akie", a description, a canonical URL, Open Graph tags and a `Book` JSON-LD block (copy `stories/detective-daisy-2/index.html`, change the text, `datePublished`, `position` and cover).
- Add a `<url>` entry to `sitemap.xml`, and update `lastmod` for the home page and All stories.
- Add the book to the static fallback lists in `index.html` and `stories/index.html`, and give the page a `<noscript>` summary.

Names and privacy
- Use the first name "Akie" only, never a surname: these pages are public and written by a child. The same rule as `assets/library.js`.

After a deploy (the owner does this once)
1. Go to search.google.com/search-console, add the property `readaloudakie.com`, verify it with the DNS TXT record GoDaddy asks for.
2. Submit `https://readaloudakie.com/sitemap.xml`, then use "URL Inspection" → "Request indexing" for the home page.
3. Do the same at bing.com/webmasters if you want Bing.
4. Indexing takes days to a few weeks. Searching `site:readaloudakie.com` shows what Google has so far.
