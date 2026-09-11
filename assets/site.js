/* Builds the header, footer and page content from assets/library.js.
   You normally don't need to edit this file. */
(function () {
  const L = window.LIBRARY || { site: {}, series: [], stories: [] };
  const root = document.documentElement.dataset.root || './';
  const page = document.body.dataset.page;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
  const url = (p) => {
    const path = p || '';
    let out = root + path;
    if (isFileProtocol) {
      if (out.endsWith('index.html')) return out;
      if (out.endsWith('/')) return out + 'index.html';
      if (path === '') return out + 'index.html';
    }
    return out;
  };
  const visible = L.stories.filter((s) => s.status === 'ready' || s.status === 'soon');
  const seriesById = (id) => L.series.find((s) => s.id === id);
  const inSeries = (id) => visible.filter((s) => s.series === id).sort((a, b) => (a.book || 0) - (b.book || 0));
  const newestFirst = (list) => list.slice().sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')));
  const ready = newestFirst(visible.filter((s) => s.status === 'ready'));
  const fullTitle = (s) => s.subtitle ? `${s.title} ${s.subtitle}` : s.title;

  function where(s) {
    const se = seriesById(s.series);
    if (se && s.book) return `Book ${s.book} of ${se.title}`;
    if (se) return `Part of ${se.title}`;
    return 'A story on its own';
  }

  /* ---------- pieces ---------- */
  const bookIcon = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="9" width="9" height="26" rx="2" fill="#d9691a" stroke="currentColor" stroke-width="2.4"/><rect x="14" y="5" width="9" height="30" rx="2" fill="#4f7f3f" stroke="currentColor" stroke-width="2.4"/><rect x="24.5" y="10" width="9" height="25" rx="2" fill="#3f6fa0" stroke="currentColor" stroke-width="2.4" transform="rotate(12 29 22)"/><path d="M2 36.5h36" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>`;
  const openIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5.5c3-1.3 6.5-1.3 10 1 3.5-2.3 7-2.3 10-1V19c-3-1.3-6.5-1.3-10 1-3.5-2.3-7-2.3-10-1z"/><path d="M12 6.5V20"/></svg>`;

  function coverArt(s) {
    if (s.cover) return `<div class="cover-art"><img src="${esc(url(s.cover))}" alt="" loading="lazy"></div>`;
    return `<div class="cover-art"><span class="cover-emoji" aria-hidden="true">${esc(s.emoji || '📖')}</span></div>`;
  }

  function cover(s, opts = {}) {
    if (s.status === 'soon') {
      return `<div class="parcel" role="img" aria-label="${esc(fullTitle(s))}, coming soon">
        <span class="parcel-tag">Coming soon<small>${esc(s.book ? 'Book ' + s.book : s.emoji || '')}</small></span></div>`;
    }
    const num = s.book && !opts.noNumber ? `<span class="cover-num" aria-hidden="true">${s.book}</span>` : '';
    const inner = `<div class="cover" style="--c:${esc(s.color || '#4f7f3f')}">
        <div class="cover-title">${esc(s.title)}${s.subtitle ? `<span class="cover-sub">${esc(s.subtitle)}</span>` : ''}</div>
        ${coverArt(s)}${num}</div>`;
    return `<a class="cover-link" href="${esc(url(s.path))}" aria-label="Read ${esc(fullTitle(s))}">${inner}</a>`;
  }

  function tile(s, opts) {
    const status = s.status === 'soon' ? 'Coming soon' : where(s);
    return `<li class="tile">${cover(s, opts)}<div class="tile-meta"><strong>${esc(s.status === 'soon' && !s.book ? s.title : fullTitle(s))}</strong><span>${esc(status)}</span></div></li>`;
  }

  function header() {
    const el = document.querySelector('[data-site-header]');
    if (!el) return;
    const links = [['home', '', 'Home'], ['stories', 'stories/', 'All stories'], ['series', 'series/', 'Series']];
    el.className = 'site-head';
    el.innerHTML = `<a class="brand" href="${url('')}">${bookIcon}<span>${esc(L.site.name)}</span></a>
      <nav class="site-nav" aria-label="Main"><ul>${links.map(([k, p, t]) =>
        `<li><a href="${url(p)}"${k === page || (k === 'series' && page === 'series-one') ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></nav>`;
  }

  function footer() {
    const el = document.querySelector('[data-site-footer]');
    if (!el) return;
    el.className = 'site-foot';
    el.innerHTML = `<div class="shelf-plank" aria-hidden="true"></div><p>${esc(L.site.name)}. Every story here was written by ${esc(L.site.author)}.</p>`;
  }

  function seriesBand(se) {
    const books = inSeries(se.id);
    const badge = se.badge ? `<img src="${esc(url(se.badge))}" alt="">` : `<span class="cover-emoji" aria-hidden="true">${esc(se.emoji || '📚')}</span>`;
    return `<article class="series-band">
      <div class="series-top"><div class="badge">${badge}</div>
        <div><h3><a href="${url('series/')}?id=${encodeURIComponent(se.id)}">${esc(se.title)}</a></h3><p>${esc(se.blurb)}</p></div></div>
      <ol class="series-books">${books.map((b) => tile(b)).join('')}</ol>
    </article>`;
  }

  /* ---------- pages ---------- */
  function home() {
    const main = document.getElementById('main');
    const newest = ready[0];
    const standalone = newestFirst(visible.filter((s) => !s.series));
    const shelfBooks = [...ready, ...visible.filter((s) => s.status === 'soon')];

    main.innerHTML = `
      <section class="hero">
        <div class="hero-card wrap">
          <h1>${esc(L.site.name)}</h1>
          <p class="lede">${esc(L.site.tagline)}</p>
          ${newest ? `<div class="actions"><a class="btn" href="${esc(url(newest.path))}">${openIcon}Read the newest story</a></div>` : ''}
        </div>
      </section>

      <section class="shelf" aria-label="Books on the shelf">
        <div class="shelf-row">${shelfBooks.map((s) => cover(s)).join('')}</div>
        <div class="shelf-plank" aria-hidden="true"></div>
      </section>

      ${newest ? `<section class="section wrap" aria-labelledby="newest-h">
        <div class="section-head"><h2 id="newest-h">Newest story</h2></div>
        <article class="feature">${cover(newest, { noNumber: false })}
          <div><h2>${esc(newest.title)}${newest.subtitle ? `<span>${esc(newest.subtitle)}</span>` : ''}</h2>
          <p class="from">${esc(where(newest))}${newest.chapters ? `, in ${newest.chapters} chapters` : ''}</p>
          <p>${esc(newest.blurb)}</p>
          <a class="btn" href="${esc(url(newest.path))}">${openIcon}Start reading</a></div>
        </article></section>` : ''}

      ${L.series.length ? `<section class="section wrap" aria-labelledby="series-h">
        <div class="section-head"><h2 id="series-h">Series</h2><a class="text-link" href="${url('series/')}">See every series</a></div>
        <div class="series-list">${L.series.map(seriesBand).join('')}</div></section>` : ''}

      ${standalone.length ? `<section class="section wrap" aria-labelledby="solo-h">
        <div class="section-head"><h2 id="solo-h">Stories on their own</h2><a class="text-link" href="${url('stories/')}">See all stories</a></div>
        <ul class="tiles">${standalone.map((s) => tile(s)).join('')}</ul></section>` : ''}`;
  }

  function stories() {
    const main = document.getElementById('main');
    const filters = [['all', 'All'], ['ready', 'Ready to read'], ['soon', 'Coming soon'],
      ...L.series.map((s) => ['series:' + s.id, s.title]), ['solo', 'On their own']];
    const params = new URLSearchParams(location.search);
    let current = params.get('show') || 'all';
    if (!filters.some(([k]) => k === current)) current = 'all';
    const sorted = [...ready, ...visible.filter((s) => s.status === 'soon')];

    main.innerHTML = `<div class="wrap section" style="padding-top:clamp(18px,4vw,40px)">
      <h1 style="font-size:clamp(2.6rem,7vw,5rem)">All stories</h1>
      <ul class="chips" aria-label="Show">${filters.map(([k, t]) => `<li><button class="chip" type="button" data-f="${esc(k)}" aria-pressed="${k === current}">${esc(t)}</button></li>`).join('')}</ul>
      <ul class="tiles" id="tiles"></ul><p class="empty" id="empty" hidden>No books here yet. Try "All" to see every story.</p></div>`;

    const tiles = document.getElementById('tiles');
    const empty = document.getElementById('empty');
    function draw() {
      const list = sorted.filter((s) => current === 'all' || s.status === current ||
        (current === 'solo' && !s.series) || current === 'series:' + s.series);
      tiles.innerHTML = list.map((s) => tile(s)).join('');
      empty.hidden = list.length > 0;
      main.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.f === current)));
    }
    main.querySelector('.chips').addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      current = b.dataset.f;
      const u = new URL(location.href);
      if (current === 'all') u.searchParams.delete('show'); else u.searchParams.set('show', current);
      history.replaceState(null, '', u);
      draw();
    });
    draw();
  }

  function seriesPage() {
    const main = document.getElementById('main');
    const id = new URLSearchParams(location.search).get('id');
    const se = id && seriesById(id);

    if (!se) {
      document.body.dataset.page = 'series';
      main.innerHTML = `<div class="wrap series-index"><h1>Series</h1>
        <p class="lede" style="margin:12px 0 30px">Stories that carry on from one book to the next. Start with book 1.</p>
        <div class="series-list">${L.series.map(seriesBand).join('')}</div></div>`;
      return;
    }

    document.title = `${se.title} | ${L.site.name}`;
    const books = inSeries(se.id);
    const first = books.find((b) => b.status === 'ready');
    const badge = se.badge ? `<img src="${esc(url(se.badge))}" alt="">` : `<span class="cover-emoji" aria-hidden="true">${esc(se.emoji || '📚')}</span>`;
    main.innerHTML = `<div class="wrap">
      <section class="series-hero"><div class="badge">${badge}</div>
        <div><h1>${esc(se.title)}</h1><p class="lede">${esc(se.blurb)}</p>
        ${first ? `<a class="btn" href="${esc(url(first.path))}">${openIcon}Start with book ${first.book || 1}</a>` : ''}</div></section>
      <section class="section" aria-label="Books in this series"><ol class="book-list">${books.map((b) => `
        <li class="book-row">${cover(b)}
          <div><p class="num">${b.book ? 'Book ' + b.book : 'Extra story'}</p>
          <h2>${esc(b.title)}${b.subtitle && b.subtitle !== 'Book ' + b.book ? `<span>${esc(b.subtitle)}</span>` : ''}</h2>
          <p>${esc(b.blurb)}</p>
          ${b.status === 'ready' ? `<a class="btn" href="${esc(url(b.path))}">${openIcon}Read book ${b.book || ''}</a>` : `<span class="soon-note">Coming soon</span>`}</div></li>`).join('')}
      </ol></section>
      <p style="margin-top:36px"><a class="text-link" href="${url('series/')}">See every series</a></p></div>`;
  }

  header();
  footer();
  if (page === 'home') home();
  if (page === 'stories') stories();
  if (page === 'series') seriesPage();
})();
