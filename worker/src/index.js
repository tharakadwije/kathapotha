/* Letters to Akie — a tiny comments service for readaloudakie.com.
   Runs on Cloudflare Workers (free tier) and stores messages in a D1 database.
   The website stays static: assets/comments.js just talks to this address.

   Nothing a reader writes is shown to anyone until it is approved on the moderation page.

   Routes
     GET  /comments?story=<id>   approved letters for one story (oldest first)
     POST /comments              send a letter: { story, name, message }
     GET  /admin?token=<token>   moderation page (approve or delete)
     POST /admin?token=<token>   { id, action: "approve" | "delete" }
     GET  /health                "ok", to check the worker is alive

   Deploy steps: worker/README.md */

const LIMITS = { name: 24, message: 600, story: 60, perHour: 5, list: 200 };

/* ---------- small helpers ---------- */
const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Origins allowed to use this worker, so nobody else can post through it.
function corsHeaders(request, env) {
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin') || '';
  const ok = allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0] || '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// The reader's address is never stored. This one-way hash only spots the same sender flooding us.
async function hashOf(value, salt) {
  const bytes = new TextEncoder().encode(String(salt || '') + '|' + String(value || ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

const clean = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const isStoryId = (s) => /^[a-z0-9][a-z0-9-]{0,59}$/i.test(s);

/* ---------- reading and writing letters ---------- */
async function listApproved(env, story) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, message, created_at FROM comments WHERE story = ? AND status = ? ORDER BY created_at ASC LIMIT ?'
  ).bind(story, 'approved', LIMITS.list).all();
  return results || [];
}

async function addLetter(request, env, body) {
  const story = clean(body.story, LIMITS.story);
  const name = clean(body.name, LIMITS.name);
  const message = String(body.message ?? '').replace(/\r/g, '').trim().slice(0, LIMITS.message);

  // "website" is a honeypot: it is hidden from people, so only robots fill it in.
  if (body.website) return { ok: true, held: true };
  if (!isStoryId(story)) return { error: 'Which story is this letter about?' };
  if (name.length < 1) return { error: 'Please write your first name.' };
  if (message.length < 2) return { error: 'Please write a message for Akie.' };

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = await hashOf(ip, env.ADMIN_TOKEN || env.SITE_NAME || 'salt');
  const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const recent = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > ?'
  ).bind(ipHash, hourAgo).first();
  if (recent && recent.n >= LIMITS.perHour) return { error: 'Thank you! Please come back in a little while to send another letter.' };

  await env.DB.prepare(
    'INSERT INTO comments (story, name, message, status, created_at, ip_hash) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(story, name, message, 'pending', new Date().toISOString(), ipHash).run();

  await notify(env, story, name, message);
  return { ok: true, held: true };
}

// Optional ping to Discord or Slack, so you know a letter is waiting.
async function notify(env, story, name, message) {
  if (!env.NOTIFY_WEBHOOK) return;
  const text = `New letter for ${env.SITE_NAME || 'the site'} on "${story}" from ${name}: ${message.slice(0, 200)}`;
  try {
    await fetch(env.NOTIFY_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: text, text }),
    });
  } catch (e) { /* a failed ping must never lose the letter */ }
}

/* ---------- moderation page ---------- */
const page = (title, inner) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title><style>
  body { margin:0; padding:24px; background:#d6ebe2; color:#2c4439; font:16px/1.5 system-ui, sans-serif; }
  main { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 1.6rem; }
  .card { background:#fffaf0; color:#3e2e22; border-radius:14px; padding:16px 18px; margin:14px 0; box-shadow:0 6px 14px -10px rgba(0,0,0,.5); }
  .who { font-weight:700; } .when, .story { color:#6e5a48; font-size:.9rem; }
  .msg { white-space: pre-wrap; margin:10px 0 14px; }
  button { font:inherit; font-weight:700; border:0; border-radius:999px; padding:8px 18px; cursor:pointer; margin-right:8px; }
  .ok { background:#4f7f3f; color:#fff; } .no { background:#fffaf0; color:#3e2e22; border:2px solid #b9463f; }
  .empty { opacity:.75; } .tag { font-size:.8rem; background:#e9dcc2; border-radius:999px; padding:2px 10px; }
</style></head><body><main>${inner}</main>
<script>
  const token = new URLSearchParams(location.search).get('token');
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    b.disabled = true;
    const r = await fetch('/admin?token=' + encodeURIComponent(token), {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: Number(b.dataset.id), action: b.dataset.action }),
    });
    if (r.ok) b.closest('.card').remove(); else { b.disabled = false; alert('That did not work.'); }
  });
</script></body></html>`;

async function adminPage(env) {
  const { results } = await env.DB.prepare(
    'SELECT id, story, name, message, status, created_at FROM comments ORDER BY (status = ?) DESC, created_at DESC LIMIT 200'
  ).bind('pending').all();
  const rows = results || [];
  const waiting = rows.filter((r) => r.status === 'pending');
  const live = rows.filter((r) => r.status === 'approved');
  const card = (r) => `<div class="card">
    <p class="who">${esc(r.name)} <span class="tag">${esc(r.story)}</span></p>
    <p class="when">${esc(new Date(r.created_at).toLocaleString('en-NZ'))}</p>
    <p class="msg">${esc(r.message)}</p>
    ${r.status === 'pending' ? `<button class="ok" data-action="approve" data-id="${r.id}">Show on the site</button>` : ''}
    <button class="no" data-action="delete" data-id="${r.id}">Delete</button></div>`;
  return page('Letters waiting', `<h1>Letters waiting for you (${waiting.length})</h1>
    ${waiting.length ? waiting.map(card).join('') : '<p class="empty">Nothing waiting. 💛</p>'}
    <h1>Already on the site (${live.length})</h1>
    ${live.length ? live.map(card).join('') : '<p class="empty">None yet.</p>'}`);
}

/* ---------- routing ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (url.pathname === '/health') return new Response('ok', { headers: cors });

    if (!env.DB) return json({ error: 'No database is connected yet.' }, 500, cors);

    if (url.pathname === '/comments' && request.method === 'GET') {
      const story = clean(url.searchParams.get('story'), LIMITS.story);
      if (!isStoryId(story)) return json({ error: 'Unknown story.' }, 400, cors);
      return json({ comments: await listApproved(env, story) }, 200, { ...cors, 'cache-control': 'no-store' });
    }

    if (url.pathname === '/comments' && request.method === 'POST') {
      const origin = request.headers.get('Origin') || '';
      const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
      if (origin && !allowed.includes(origin)) return json({ error: 'Not allowed from here.' }, 403, cors);
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: 'Could not read that.' }, 400, cors); }
      const out = await addLetter(request, env, body);
      return json(out, out.error ? 400 : 200, cors);
    }

    if (url.pathname === '/admin') {
      const token = url.searchParams.get('token') || '';
      if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return new Response(page('Letters', '<h1>Letters</h1><p>Add your moderation password to the address, like <code>/admin?token=…</code></p>'), {
          status: 401, headers: { 'content-type': 'text/html; charset=utf-8' },
        });
      }
      if (request.method === 'GET') {
        return new Response(await adminPage(env), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
      }
      if (request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: 'Could not read that.' }, 400); }
        const id = Number(body.id);
        if (!Number.isInteger(id)) return json({ error: 'Which letter?' }, 400);
        if (body.action === 'approve') await env.DB.prepare('UPDATE comments SET status = ? WHERE id = ?').bind('approved', id).run();
        else if (body.action === 'delete') await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
        else return json({ error: 'Unknown action.' }, 400);
        return json({ ok: true });
      }
    }

    return json({ error: 'Nothing here.' }, 404, cors);
  },
};
