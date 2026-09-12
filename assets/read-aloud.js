/* Read-aloud voices for story pages.
   Add this line to the <head> of a story page, next to story-kit.js:
     <script src="../../assets/read-aloud.js"></script>
   then wire the "Read this page" button with ReadAloud.attach() (see assets/reader.js).

   It uses the speech voices already built into the browser (Web Speech API), so nothing is downloaded.
   Both choices only use native-English voices (US, UK, Australia, Canada, Ireland, New Zealand):
   - "Girl" (the default) picks the best girl or woman voice on the device and lifts the pitch so it sounds cute.
     Microsoft Edge has real child voices (Ana, Maisie) and sounds best.
   - "Boy" picks a young-sounding man's voice and lifts the pitch further so it sounds like a little boy.
   Both read a little slower than normal speech so young listeners can follow along.
   The choice is remembered in this browser.

   In any browser other than Edge, pressing "Read this page" also shows a small tip suggesting Edge,
   because only Edge has the clear, natural-sounding voices (Chrome's sound robotic). On Windows the tip
   has an "Open in Edge" button. "Got it" hides the tip for good in that browser. */
(function () {
  const synth = window.speechSynthesis;
  const KEY = 'storyshelf:voice';
  const TIP_KEY = 'storyshelf:edge-tip';
  const HELLO = 'Hi! I can read the story to you.';
  const UA = navigator.userAgent || '';
  const IS_EDGE = /\bEdg(e|A|iOS)?\//.test(UA);
  const ON_WINDOWS = /Windows/.test(UA);

  // Voice names for each choice, best first: Edge's natural voices, then the usual Safari, Windows and
  // Android ones (Android's "sfg", "iol"... are parts of its voice ids).
  // Chrome's online "Google ..." voices come last: they sound robotic with the pitch lifted, and Chrome only
  // offers them on the website (not on file://), so ranking them higher made the live site sound different.
  // pitch: kid = a real child voice, natural = a natural/neural voice, other = any other match, none = nothing matched.
  const CHOICES = {
    girl: {
      emoji: '👧', name: 'Girl', kid: /\b(Ana|Maisie)\b/i, pitch: { kid: 1.15, natural: 1.35, other: 1.5, none: 1.6 },
      names: ['Ana', 'Maisie', 'Jenny', 'Aria', 'Ava', 'Emma', 'Michelle', 'Sonia', 'Libby', 'Natasha', 'Clara', 'Heather', 'Hayley',
        'Samantha', 'Zoe', 'Karen', 'Moira', 'Fiona', 'Victoria',
        'Allison', 'Susan', 'Kate', 'Serena', 'Catherine', 'Hazel', 'Zira', 'Female', 'sfg', 'tpf', 'tpc',
        'Google US English', 'Google UK English Female'],
    },
    boy: {
      emoji: '👦', name: 'Boy', pitch: { natural: 1.5, other: 1.65, none: 1.2 },
      names: ['Brian', 'Andrew', 'Ryan', 'Guy', 'Eric', 'Roger', 'Steffan', 'Christopher', 'Thomas', 'William', 'Liam', 'Connor', 'Mitchell',
        'Aaron', 'Nathan', 'Evan', 'Tom', 'Oliver', 'Arthur', 'Daniel', 'Alex',
        'Mark', 'David', 'George', 'James', 'Richard', 'Sean', 'Male', 'iol', 'iom', 'tpd', 'rjs',
        'Google UK English Male'],
    },
  };
  Object.values(CHOICES).forEach((c) => { c.match = c.names.map((n) => new RegExp('\\b' + n, 'i')); });
  const NATIVE = ['us', 'gb', 'au', 'ca', 'ie', 'nz'];
  const NATURAL = /natural|neural|premium|enhanced/i;

  let voices = [];
  const loadVoices = () => { try { voices = synth.getVoices() || []; } catch (e) { voices = []; } };

  function bestVoice(c) {
    if (!voices.length) loadVoices();
    let best = null, bestScore = -1;
    voices.forEach((v) => {
      const [lang, region] = String(v.lang || '').replace('_', '-').toLowerCase().split('-');
      if (lang !== 'en' || (region && !NATIVE.includes(region))) return;
      const rank = c.match.findIndex((re) => re.test(v.name));
      if (rank < 0) return;
      const score = (NATURAL.test(v.name) ? 1000 : 0) + (c.names.length - rank) * 4 + (region === 'us' ? 2 : region === 'gb' ? 1 : 0);
      if (score > bestScore) { best = v; bestScore = score; }
    });
    return best;
  }

  function profile(choice) {
    const c = CHOICES[choice];
    const v = bestVoice(c);
    if (!v) return { voice: null, pitch: c.pitch.none, rate: 0.95 };
    const pitch = c.kid && c.kid.test(v.name) ? c.pitch.kid : NATURAL.test(v.name) ? c.pitch.natural : c.pitch.other;
    return { voice: v, pitch, rate: 0.95 };
  }

  // Short pieces, because Chrome cuts off utterances that run longer than about 15 seconds.
  function pieces(text) {
    const parts = [];
    (String(text).match(/[^.!?…]+(?:[.!?…]+["'”’)]*|$)\s*/g) || []).forEach((s) => {
      if (s.length <= 180) parts.push(s);
      else parts.push(...(s.match(/[^,;:]+(?:[,;:]+\s*|$)/g) || [s]));
    });
    const out = [];
    parts.forEach((p) => {
      if (out.length && out[out.length - 1].length + p.length <= 180) out[out.length - 1] += p;
      else out.push(p);
    });
    return out.map((s) => s.trim()).filter(Boolean);
  }

  let session = 0, live = null;
  function hush() {
    session++;
    live = null;
    try { synth.cancel(); } catch (e) {}
  }

  function say(text, choice, done) {
    const busy = synth.speaking || synth.pending;
    hush();
    const mine = session;
    const p = profile(choice);
    const queue = pieces(text);
    const finish = () => { if (mine !== session) return; session++; live = null; if (done) done(); };
    const step = () => {
      if (mine !== session) return;
      const t = queue.shift();
      if (!t) { finish(); return; }
      const u = new SpeechSynthesisUtterance(t);
      if (p.voice) { u.voice = p.voice; u.lang = p.voice.lang; }
      u.pitch = p.pitch; u.rate = p.rate;
      u.onend = step;
      u.onerror = finish;
      live = u; // holding a reference stops Chrome from dropping the utterance before it ends
      try { synth.speak(u); } catch (e) { finish(); }
    };
    // Some browsers drop a new utterance spoken in the same moment as cancel().
    if (busy) setTimeout(step, 80); else step();
  }

  const css = `
    .read-tools { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .voice-pick {
      display: inline-flex; gap: 2px; padding: 3px; border: 2px solid currentColor; border-radius: 999px;
      background: var(--btn, #fffaf0); color: var(--btn-ink, #2e4a3e); box-shadow: 0 3px 0 rgba(0,0,0,.18);
    }
    .voice-opt {
      display: inline-flex; align-items: center; gap: 5px; border: 0; border-radius: 999px; padding: 4px 11px;
      background: transparent; color: inherit; cursor: pointer; line-height: 1.2;
      font: 600 .95rem var(--display, "Grandstander", "Comic Sans MS", system-ui, sans-serif);
    }
    .voice-opt[aria-pressed="true"] { background: var(--btn-ink, #2e4a3e); color: var(--btn, #fffaf0); }
    .voice-emoji { font-size: 1.1rem; line-height: 1; }
    .read-tools { position: relative; }
    .edge-tip {
      position: absolute; top: calc(100% + 12px); right: 0; z-index: 40; width: min(320px, 88vw);
      padding: 12px 14px; border: 2px solid currentColor; border-radius: 16px;
      background: var(--btn, #fffaf0); color: var(--btn-ink, #2e4a3e); box-shadow: 0 6px 16px rgba(0,0,0,.2);
      font: 400 1rem/1.4 var(--body, "Andika", "Trebuchet MS", system-ui, sans-serif); text-align: left;
    }
    .edge-tip::before {
      content: ""; position: absolute; top: -9px; right: 36px; width: 14px; height: 14px; background: inherit;
      border-top: 2px solid currentColor; border-left: 2px solid currentColor; transform: rotate(45deg);
    }
    .edge-tip p { margin: 0; }
    .edge-tip-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; margin-top: 10px; }
    .edge-tip-actions a, .edge-tip-actions button {
      border: 2px solid currentColor; border-radius: 999px; padding: 5px 14px; cursor: pointer; text-decoration: none; line-height: 1.2;
      font: 600 .95rem var(--display, "Grandstander", "Comic Sans MS", system-ui, sans-serif);
    }
    .edge-tip-open { background: var(--btn-ink, #2e4a3e); color: var(--btn, #fffaf0); border-color: var(--btn-ink, #2e4a3e) !important; }
    .edge-tip-close { background: transparent; color: inherit; }`;

  function attach(o) {
    if (!synth) return { stop() {} };
    let choice = 'girl';
    try { const v = localStorage.getItem(KEY); if (CHOICES[v]) choice = v; } catch (e) {}
    let reading = false;

    const setLabel = () => {
      o.label.innerHTML = reading
        ? '<span class="label-long">Stop reading</span><span class="label-short">Stop</span>'
        : '<span class="label-long">Read this page</span><span class="label-short">Read</span>';
    };
    // Not in Edge: suggest it, because Edge's natural voices sound much nicer than this browser's.
    let tip = null;
    const showTip = () => {
      const tools = o.button.closest('.read-tools') || o.button.parentElement;
      if (IS_EDGE || tip || !tools) return;
      try { if (localStorage.getItem(TIP_KEY)) return; } catch (e) {}
      tip = document.createElement('div');
      tip.className = 'edge-tip';
      tip.setAttribute('role', 'status');
      tip.innerHTML = '<p><span aria-hidden="true">🎧</span> Psst! Stories sound nicest in <strong>Microsoft Edge</strong>. ' +
        'Its reading voices are extra clear and friendly.</p><div class="edge-tip-actions">' +
        (ON_WINDOWS ? '<a class="edge-tip-open">Open in Edge</a>' : '') + '<button type="button" class="edge-tip-close">Got it</button></div>';
      // Windows opens microsoft-edge: links in Edge.
      if (ON_WINDOWS) tip.querySelector('.edge-tip-open').href = 'microsoft-edge:' + location.href;
      tip.querySelector('.edge-tip-close').addEventListener('click', () => {
        try { localStorage.setItem(TIP_KEY, 'seen'); } catch (e) {}
        tip.remove();
        o.button.focus();
      });
      tools.appendChild(tip);
    };

    const stop = () => { reading = false; hush(); setLabel(); };
    const read = () => {
      const text = o.getText();
      if (!text) return;
      showTip();
      reading = true;
      setLabel();
      say(text, choice, () => { reading = false; setLabel(); });
    };

    o.button.addEventListener('click', () => { if (reading) stop(); else read(); });

    if (o.picker) {
      o.picker.setAttribute('role', 'group');
      o.picker.setAttribute('aria-label', 'Reading voice');
      o.picker.innerHTML = Object.keys(CHOICES).map((k) =>
        `<button type="button" class="voice-opt" data-voice="${k}" aria-pressed="${k === choice}" title="${CHOICES[k].name} voice">` +
        `<span class="voice-emoji" aria-hidden="true">${CHOICES[k].emoji}</span><span class="voice-name">${CHOICES[k].name}</span></button>`).join('');
      o.picker.addEventListener('click', (e) => {
        const b = e.target.closest('[data-voice]');
        if (!b) return;
        choice = b.dataset.voice;
        try { localStorage.setItem(KEY, choice); } catch (e2) {}
        o.picker.querySelectorAll('[data-voice]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        // Let the child hear the new voice straight away.
        if (reading) read(); else say(HELLO, choice);
      });
    }

    setLabel();
    return { stop };
  }

  if (synth) {
    loadVoices();
    try { synth.addEventListener('voiceschanged', loadVoices); } catch (e) {}
    window.addEventListener('pagehide', hush);
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  window.ReadAloud = { supported: !!synth, attach };
})();
