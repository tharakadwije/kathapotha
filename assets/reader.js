/* Reusable picture-book reader.
   A story page defines window.STORY (see stories/_template/index.html) and loads this file.
   You normally don't need to edit this file. */
(function () {
  const S = window.STORY;
  if (!S) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const id = document.documentElement.dataset.story || 'story';
  const KEY = 'storyshelf:' + id + ':page';

  if (S.theme) {
    const r = document.documentElement.style;
    if (S.theme.accent) r.setProperty('--accent', S.theme.accent);
    if (S.theme.heading) r.setProperty('--heading', S.theme.heading);
  }

  const shelfIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg>';
  const speaker = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>';

  document.body.innerHTML = `
    <header class="bar">
      <div class="bar-left">
        <a class="pill" data-site-link="home" href="../../">${shelfIcon}<span>Story Shelf</span></a>
        <span class="bar-title">${esc(S.title)}</span>
      </div>
      <button class="pill" id="read" type="button" hidden>${speaker}<span id="read-label">Read this page</span></button>
    </header>
    <main>
      <div class="book" id="book" aria-live="polite"></div>
      <nav class="turns" aria-label="Turn pages">
        <button class="pill" id="prev" type="button"><span>Back</span></button>
        <span class="count" id="count"></span>
        <button class="pill" id="next" type="button"><span class="label-long">Next page</span><span class="label-short">Next</span></button>
      </nav>
    </main>`;

  const pages = [{ type: 'cover' }];
  let lastChapter = null;
  (S.pages || []).forEach((p) => {
    const opens = !!p.chapter && p.chapter !== lastChapter;
    if (p.chapter) lastChapter = p.chapter;
    pages.push(Object.assign({ type: 'story', opens, running: lastChapter }, p));
  });
  pages.push({ type: 'end' });
  const total = pages.length;

  const $ = (x) => document.getElementById(x);
  const book = $('book'), prev = $('prev'), next = $('next'), count = $('count'), readBtn = $('read'), readLabel = $('read-label');
  let current = 0;

  function picture(p, fallbackAlt) {
    const alt = p.alt || fallbackAlt || '';
    if (p.picture) return `<div class="picture"><img src="${esc(p.picture)}" alt="${esc(alt)}"></div>`;
    return `<div class="picture" role="img" aria-label="${esc(alt)}"><span class="emoji" aria-hidden="true">${esc(p.emoji || '📖')}</span></div>`;
  }

  function pageHTML(i) {
    const p = pages[i];
    if (p.type === 'cover') {
      return `<section class="page title-page">
          <h1><span class="t1">${esc(S.title)}</span>${S.subtitle ? `<span class="t2">${esc(S.subtitle)}</span>` : ''}</h1>
          ${S.by ? `<p class="by">By ${esc(S.by)}</p>` : ''}
          ${S.intro ? `<p class="hint">${esc(S.intro)}</p>` : ''}
          <button class="pill" type="button" data-go="1">Open the book</button>
        </section>
        <section class="page art">${picture({ picture: S.coverPicture, emoji: S.coverEmoji, alt: S.coverAlt }, S.title)}</section>`;
    }
    if (p.type === 'end') {
      return `<section class="page art">${picture({ picture: S.endPicture, emoji: S.endEmoji || '🌟', alt: S.endAlt }, 'The end')}</section>
        <section class="page end-page"><h2>The End</h2>${S.ending ? `<p>${esc(S.ending)}</p>` : ''}
        <button class="pill start" type="button" data-go="0">Read it again</button>
        ${window.StorySite ? StorySite.endButtons() : ''}</section>`;
    }
    return `<section class="page art">${picture(p)}</section>
      <section class="page words${p.opens ? ' opens' : ''}">
        ${p.opens ? `<h2 class="chapter">${esc(p.chapter)}</h2>` : p.running ? `<p class="running">${esc(p.running)}</p>` : ''}
        ${(p.text || []).map((t) => `<p class="text">${esc(t)}</p>`).join('')}
        <span class="folio">${i + 1}</span>
      </section>`;
  }

  function stopReading() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    readLabel.textContent = 'Read this page';
  }

  function go(i, fromLoad) {
    if (i < 0 || i >= total) return;
    const dir = i >= current ? 'turn-next' : 'turn-prev';
    stopReading();
    current = i;
    book.classList.remove('turn-next', 'turn-prev');
    book.innerHTML = pageHTML(i);
    if (!fromLoad) { void book.offsetWidth; book.classList.add(dir); }
    prev.disabled = i === 0;
    next.disabled = i === total - 1;
    count.textContent = `${i + 1} / ${total}`;
    readBtn.hidden = !window.speechSynthesis || pages[i].type !== 'story';
    try { localStorage.setItem(KEY, String(i)); } catch (e) {}
    if (!fromLoad && window.matchMedia('(max-width: 760px)').matches) window.scrollTo({ top: 0 });
  }

  book.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) go(Number(b.dataset.go)); });
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });
  let sx = null, sy = null;
  book.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  book.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
    sx = null;
  });
  readBtn.addEventListener('click', () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (synth.speaking) { stopReading(); return; }
    const p = pages[current];
    if (p.type !== 'story') return;
    const u = new SpeechSynthesisUtterance((p.opens ? p.chapter + '. ' : '') + (p.text || []).join(' '));
    u.rate = 0.9; u.pitch = 1.05;
    u.onend = () => { readLabel.textContent = 'Read this page'; };
    readLabel.textContent = 'Stop reading';
    try { synth.speak(u); } catch (e) { stopReading(); }
  });

  let start = 0;
  try { const v = Number(localStorage.getItem(KEY)); if (Number.isInteger(v) && v >= 0 && v < total) start = v; } catch (e) {}
  go(start, true);
})();
