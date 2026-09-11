/* Story page helper.
   Add these two lines to the <head> of ANY story page (including one Claude makes for you):
     <script src="../../assets/library.js"></script>
     <script src="../../assets/story-kit.js"></script>
   and put data-root="../../" data-story="your-story-id" on the <html> tag.

   What it does:
   - Adds a "Story Shelf" button in the top corner, unless the page already has
     an element with data-site-link="home" (it will point that element home instead).
   - StorySite.endButtons() returns buttons for "The End": next book in the series + back to the shelf.
*/
(function () {
  const L = window.LIBRARY || { site: {}, series: [], stories: [] };
  const html = document.documentElement;
  const root = html.dataset.root || '../../';
  const id = html.dataset.story;
  const story = L.stories.find((s) => s.id === id);
  const series = story && L.series.find((s) => s.id === story.series);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function nextBook() {
    if (!story || !series || !story.book) return null;
    return L.stories
      .filter((s) => s.series === series.id && (s.book || 0) > story.book && s.status !== 'hidden')
      .sort((a, b) => a.book - b.book)[0] || null;
  }

  const shelfIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg>';

  const StorySite = {
    home: root,
    story, series,
    next: nextBook,
    endButtons() {
      const n = nextBook();
      let out = '';
      if (n && n.status === 'ready') {
        out += `<a class="pill site-pill site-next" href="${esc(root + n.path)}">Read book ${n.book}</a>`;
      } else if (n) {
        out += `<p class="site-soon">Book ${n.book} of ${esc(series.title)} is coming soon.</p>`;
      }
      out += `<a class="pill site-pill" href="${esc(root)}">${shelfIcon}<span>Back to the shelf</span></a>`;
      return `<div class="site-end">${out}</div>`;
    },
  };
  window.StorySite = StorySite;

  const css = `
    .site-pill { text-decoration: none; }
    .site-end { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .site-soon { margin: 0; font-family: "Grandstander", "Comic Sans MS", sans-serif; font-weight: 600; opacity: .8; }
    .site-home-float {
      position: fixed; top: 12px; left: 12px; z-index: 50; display: inline-flex; align-items: center; gap: 8px;
      background: #fffaf0; color: #3e2e22; border: 2px solid currentColor; border-radius: 999px; padding: 6px 14px;
      font: 600 1rem "Grandstander", "Comic Sans MS", system-ui, sans-serif; text-decoration: none; box-shadow: 0 3px 0 rgba(0,0,0,.2);
    }
    .site-home-float svg, .site-pill svg { width: 20px; height: 20px; flex: none; }`;

  function mount() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const links = document.querySelectorAll('[data-site-link="home"]');
    if (links.length) {
      links.forEach((a) => a.setAttribute('href', root));
    } else {
      const a = document.createElement('a');
      a.className = 'site-home-float';
      a.href = root;
      a.innerHTML = `${shelfIcon}<span>${esc(L.site.name || 'Home')}</span>`;
      document.body.appendChild(a);
    }
    if (story) document.title = `${story.subtitle ? story.title + ' ' + story.subtitle : story.title} | ${L.site.name}`;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
