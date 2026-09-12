/* Letters to Akie — the little "write to Akie" panel at the bottom of a story page.
   Add this line to the <head> of a story page, after story-kit.js:
     <script src="../../assets/comments.js"></script>
   and put an empty <section id="letters"></section> after </main>.

   Messages are kept by the Cloudflare Worker in worker/ (see .genAiDoc/comments.md). Set its address in
   assets/library.js as site.comments. With no address set, the panel simply doesn't appear, so the site
   works exactly as before.

   Nothing a reader writes appears on the site until Akie approves it on the worker's /admin page. */
(function () {
  // Loaded in <head>, so wait until the body exists (assets/reader.js builds it on template pages).
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); } else { start(); }

  function start() {
  const L = window.LIBRARY || { site: {} };
  const api = String((L.site && L.site.comments) || '').replace(/\/+$/, '');
  const box = document.getElementById('letters');
  const story = document.documentElement.dataset.story || '';
  if (!api || !box || !story) return;

  const MAX = { name: 24, message: 600 };
  const el = (tag, props = {}, kids = []) => {
    const n = Object.assign(document.createElement(tag), props);
    kids.forEach((k) => n.append(k));
    return n;
  };
  // "2026-09-12T…" -> "12 September 2026", the same wording as the published date.
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const when = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? `${Number(m[3])} ${MONTHS[m[2] - 1]} ${m[1]}` : '';
  };

  const css = `
    .letters { width: min(760px, 92vw); margin: clamp(24px, 5vw, 56px) auto clamp(40px, 8vw, 90px); }
    .letters h2 { font-family: var(--display, "Grandstander", sans-serif); font-weight: 800; font-size: clamp(1.5rem, 3vw, 2.1rem); margin: 0 0 6px; }
    .letters .intro { margin: 0 0 18px; opacity: .85; }
    .letter-list { list-style: none; margin: 0 0 22px; padding: 0; display: grid; gap: 12px; }
    .letter {
      background: var(--paper, #fffaf0); color: var(--ink, #3e2e22); border-radius: 16px; padding: 14px 18px;
      box-shadow: 0 8px 16px -12px rgba(40, 22, 8, .6);
    }
    .letter-who { font-family: var(--display, "Grandstander", sans-serif); font-weight: 800; margin: 0; }
    .letter-when { font-size: .85rem; color: var(--ink-soft, #7a6552); margin: 0 0 6px; }
    .letter-msg { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    .letter-form { background: var(--paper, #fffaf0); color: var(--ink, #3e2e22); border-radius: 18px; padding: clamp(16px, 3vw, 26px); display: grid; gap: 12px; }
    .letter-form label { font-family: var(--display, "Grandstander", sans-serif); font-weight: 700; display: grid; gap: 6px; }
    .letter-form input, .letter-form textarea {
      font: inherit; padding: 10px 12px; border-radius: 12px; border: 2px solid rgba(62, 46, 34, .35);
      background: #fff; color: inherit; width: 100%;
    }
    .letter-form textarea { min-height: 110px; resize: vertical; }
    .letter-form .safe { font-size: .9rem; color: var(--ink-soft, #7a6552); margin: 0; }
    .letter-form .count { font-size: .85rem; color: var(--ink-soft, #7a6552); justify-self: end; margin: -6px 0 0; }
    .letter-send {
      justify-self: start; font-family: var(--display, "Grandstander", sans-serif); font-weight: 800; font-size: 1.05rem;
      border: 0; border-radius: 999px; padding: 11px 22px; cursor: pointer;
      background: var(--carrot, #d9691a); color: #fffaf0; box-shadow: 0 4px 0 var(--carrot-deep, #a94c0b);
    }
    .letter-send:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--carrot-deep, #a94c0b); }
    .letter-send[disabled] { opacity: .6; cursor: default; transform: none; }
    .letter-note { margin: 0; font-family: var(--display, "Grandstander", sans-serif); font-weight: 700; }
    .letter-note.bad { color: #a3312a; }
    .letter-pot { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  box.className = 'letters';
  const list = el('ul', { className: 'letter-list' });
  const note = el('p', { className: 'letter-note' });
  note.hidden = true;

  const nameInput = el('input', { type: 'text', maxLength: MAX.name, autocomplete: 'given-name', required: true, placeholder: 'Daisy' });
  const msgInput = el('textarea', { maxLength: MAX.message, required: true, placeholder: 'I liked the part where…' });
  const pot = el('input', { type: 'text', className: 'letter-pot', tabIndex: -1, autocomplete: 'off' });
  pot.setAttribute('aria-hidden', 'true');
  const count = el('p', { className: 'count', textContent: `0 / ${MAX.message}` });
  msgInput.addEventListener('input', () => { count.textContent = `${msgInput.value.length} / ${MAX.message}`; });
  const send = el('button', { type: 'submit', className: 'letter-send', textContent: 'Send to Akie' });

  const form = el('form', { className: 'letter-form' }, [
    el('label', {}, ['Your first name', nameInput]),
    el('label', {}, ['What did you think?', msgInput]),
    count,
    pot,
    el('p', { className: 'safe', textContent: 'Please don’t write your last name, address, school or phone number. Akie reads every letter before it appears here.' }),
    send,
    note,
  ]);

  box.append(
    el('h2', { textContent: 'Letters to Akie \u{1F48C}' }),
    el('p', { className: 'intro', textContent: 'Did you like this story? Write a letter and Akie will read it.' }),
    list,
    form,
  );

  function show(comments) {
    list.replaceChildren();
    if (!comments.length) {
      list.append(el('li', { className: 'letter' }, [
        el('p', { className: 'letter-msg', textContent: 'No letters yet — yours could be the first one!' }),
      ]));
      return;
    }
    comments.forEach((c) => {
      list.append(el('li', { className: 'letter' }, [
        el('p', { className: 'letter-who', textContent: c.name }),
        el('p', { className: 'letter-when', textContent: when(c.created_at) }),
        el('p', { className: 'letter-msg', textContent: c.message }),
      ]));
    });
  }

  function load() {
    fetch(`${api}/comments?story=${encodeURIComponent(story)}`)
      .then((r) => (r.ok ? r.json() : { comments: [] }))
      .then((d) => show(d.comments || []))
      .catch(() => show([]));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.hidden = true;
    send.disabled = true;
    send.textContent = 'Sending…';
    fetch(`${api}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ story, name: nameInput.value, message: msgInput.value, website: pot.value }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .catch(() => ({ ok: false, d: {} }))
      .then(({ ok, d }) => {
        send.disabled = false;
        send.textContent = 'Send to Akie';
        note.hidden = false;
        if (ok && !d.error) {
          note.className = 'letter-note';
          note.textContent = 'Thank you! \u{1F49B} Akie will read your letter, and it will appear here once she says yes.';
          form.reset();
          count.textContent = `0 / ${MAX.message}`;
        } else {
          note.className = 'letter-note bad';
          note.textContent = d.error || 'Sorry, that did not send. Please try again in a moment.';
        }
      });
  });

  load();
  }
})();
