/* ════════════════════════════════════════════════════════════════════
   TypeAura — Live Demo (/demo)
   A real, working web replica of the TypeAura keyboard inside a sample
   WhatsApp-style chat, with a guided 4-step tour. Every AI result is
   fetched live from the backend /api/demo-ai endpoint.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const DEMO_API = 'https://typeaurabackend.vercel.app/api/demo-ai';

  /* ───────────────────────── API client ───────────────────────── */
  class RateLimitError extends Error {}

  async function callDemo(mode, text, params = {}) {
    spinner(true);
    try {
      const res = await fetch(DEMO_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, text, params }),
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (res.status === 429) throw new RateLimitError(data.error || 'Demo limit reached. Try again in a few minutes.');
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
      return data;
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      if (err instanceof TypeError) throw new Error('Network error — check your connection.');
      throw err;
    } finally {
      spinner(false);
    }
  }

  const spinnerEl = document.getElementById('kbSpinner');
  function spinner(on) { if (spinnerEl) spinnerEl.hidden = !on; }

  /* ─── Material-style icons (match the real keyboard's Icon set) ─── */
  const ICONS = {
    grid:      'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z',
    translate: 'M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z',
    text:      'M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z',
    settings:  'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    clipboard: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
    mic:       'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2s-1.2-.54-1.2-1.2V4.9zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z',
    shift:     'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
    backspace: 'M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z',
    emoji:     'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
    return:    'M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z',
  };
  // lens_blur is drawn from dots rather than a single path
  const LENS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/><circle cx="7.4" cy="7.4" r="1.1"/><circle cx="16.6" cy="7.4" r="1.1"/><circle cx="7.4" cy="16.6" r="1.1"/><circle cx="16.6" cy="16.6" r="1.1"/></svg>';

  function svg(name) {
    if (name === 'lens') return LENS_SVG;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
  }

  function fillIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = svg(el.dataset.icon); });
  }

  /* ───────────────────────── tiny helpers ───────────────────────── */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const overlay = document.getElementById('phoneOverlay');
  const toastEl = document.getElementById('phoneToast');

  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3200);
  }

  /* Scripted demo data — used DURING the auto-playing tour so the animation is
     instant, reliable and free of API cost. Real AI runs only when the user
     drives the keyboard themselves (i.e. the tour is not active). */
  const SCRIPT = {
    lensHindi:   'अरे! कल कॉफ़ी के लिए फ्री हो? ☕',
    lensReplies: ["Yes, I'm totally free! ☕", 'Sure — what time works?', "Aw, I'm a bit busy tomorrow 😅"],
    translateEn: "Let's meet tomorrow morning.",
    quickFormal: 'Is our plan for tomorrow confirmed?',
  };

  // Returns the scripted result while the tour is playing; otherwise hits the
  // real backend. `scripted` must match the shape callDemo returns for that mode.
  async function callDemoOrScript(mode, text, params, scripted) {
    if (tour && tour.active && scripted !== undefined) {
      spinner(true);
      await wait(750);          // brief pause so the spinner reads as "thinking"
      spinner(false);
      return scripted;
    }
    return callDemo(mode, text, params);
  }

  /* ───────────────────────── chat engine ───────────────────────── */
  const chatBody = document.getElementById('chatBody');
  const chat = {
    addBubble({ side = 'incoming', text, lensTarget = false }) {
      const b = document.createElement('div');
      b.className = `bubble ${side}` + (lensTarget ? ' lens-target' : '');
      b.innerHTML = `${escapeHtml(text)}<span class="b-time">${now()}${side === 'outgoing' ? ' ✓✓' : ''}</span>`;
      chatBody.appendChild(b);
      chatBody.scrollTop = chatBody.scrollHeight;
      return b;
    },
    sendOutgoing(text) { const b = this.addBubble({ side: 'outgoing', text }); scheduleRiyaReply(); return b; },
    addTyping() {
      const b = document.createElement('div');
      b.className = 'bubble incoming typing';
      b.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
      chatBody.appendChild(b);
      chatBody.scrollTop = chatBody.scrollHeight;
      return b;
    },
    reset() { clearTimeout(riyaTimer); chatBody.innerHTML = ''; },
  };

  // Riya replies back so the chat feels two-way: a typing indicator, then a line.
  const RIYA_REPLIES = [
    'Perfect, see you then! 😊',
    'Sounds good 👍',
    "Yay, can't wait ☕",
    'Haha okay 😄',
    'Cool, let me know 🙌',
    'Great! 🎉',
  ];
  let riyaIdx = 0, riyaTimer = null;
  function scheduleRiyaReply() {
    clearTimeout(riyaTimer);
    riyaTimer = setTimeout(() => {
      const typing = chat.addTyping();
      riyaTimer = setTimeout(() => {
        typing.remove();
        chat.addBubble({ side: 'incoming', text: RIYA_REPLIES[riyaIdx++ % RIYA_REPLIES.length] });
      }, 1300);
    }, 650);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ───────────────────────── keyboard engine ───────────────────────── */
  const ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const inputText = document.getElementById('chatInputText');
  const suggestStrip = document.getElementById('suggestStrip');

  const keyboard = {
    buffer: '',
    shift: true,           // start capitalised like a fresh sentence
    onEnter: null,         // overridable hook

    render() {
      const NUMS = { q: '1', w: '2', e: '3', r: '4', t: '5', y: '6', u: '7', i: '8', o: '9', p: '0' };
      ROWS.forEach((row, i) => {
        const el = $(`.kb-row[data-row="${i}"]`);
        el.innerHTML = '';
        if (i === 2) el.appendChild(this._key({ key: 'shift', icon: 'shift', cls: 'key--special key--shift' }));
        row.forEach(ch => el.appendChild(this._key({ key: ch, label: ch, num: i === 0 ? NUMS[ch] : null })));
        if (i === 2) el.appendChild(this._key({ key: 'backspace', icon: 'backspace', cls: 'key--special key--backspace' }));
      });
      this._refreshLetters();
    },

    _key({ key, label, icon, num, cls = '' }) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'key ' + cls;
      b.dataset.key = key;
      if (icon) {
        b.innerHTML = svg(icon);
      } else {
        if (num) { const s = document.createElement('span'); s.className = 'key-num'; s.textContent = num; b.appendChild(s); }
        const t = document.createElement('span'); t.className = 'key-label'; t.textContent = label; b.appendChild(t);
      }
      return b;
    },

    _refreshLetters() {
      $$('.kb-row .key').forEach(k => {
        const key = k.dataset.key;
        if (key && key.length === 1 && /[a-z]/.test(key)) {
          const lbl = k.querySelector('.key-label');
          if (lbl) lbl.textContent = this.shift ? key.toUpperCase() : key;
        }
      });
      const shiftKey = $('.key--shift');
      if (shiftKey) shiftKey.classList.toggle('active', this.shift);
    },

    setBuffer(v) { this.buffer = v; this._paint(); },
    _paint() { inputText.textContent = this.buffer; },

    type(ch) {
      this.buffer += this.shift ? ch.toUpperCase() : ch;
      if (this.shift) { this.shift = false; this._refreshLetters(); }
      this._paint();
    },

    handle(key) {
      switch (key) {
        case 'shift': this.shift = !this.shift; this._refreshLetters(); return;
        case 'backspace': this.setBuffer(this.buffer.slice(0, -1)); return;
        case 'enter':
          if (!this.buffer.trim()) return;
          if (this.onEnter) this.onEnter(this.buffer.trim());
          else chat.sendOutgoing(this.buffer.trim());
          this.setBuffer('');
          this.shift = true; this._refreshLetters();
          return;
        case ' ': this.buffer += ' '; this._paint(); return;
        case 'emoji': toast('Emoji panel is available in the installed app 🙂'); return;
        case '?123': toast('Symbols & numbers are available in the installed app.'); return;
        default:
          if (key && key.length === 1) this.type(key);
      }
    },
  };

  // single delegated click handler for the whole keyboard
  document.getElementById('keyboard').addEventListener('click', (e) => {
    const keyEl = e.target.closest('[data-key]');
    if (keyEl) { e.preventDefault(); keyboard.handle(keyEl.dataset.key); return; }
    const actEl = e.target.closest('[data-action]');
    if (actEl) { e.preventDefault(); handleToolbar(actEl.dataset.action); }
  });
  // stop the page from scrolling / native keyboard popping on touch
  document.getElementById('keyboard').addEventListener('mousedown', e => e.preventDefault());

  /* suggestions strip */
  function setSuggestions(chips) {
    suggestStrip.innerHTML = '';
    if (!chips || !chips.length) {
      suggestStrip.innerHTML = '<span class="kb-brand">TypeAura · By Himanshu Kashyap</span>';
      return;
    }
    chips.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kb-chip';
      btn.innerHTML = (c.label ? `<span class="kb-chip-label">${escapeHtml(c.label)}</span>` : '') + escapeHtml(c.text);
      btn.addEventListener('click', () => c.onClick(c));
      suggestStrip.appendChild(btn);
    });
  }
  function clearSuggestions() { setSuggestions(null); }

  /* ───────────────────────── toolbar actions ───────────────────────── */
  function setActiveTool(action) {
    $$('.icon-btn').forEach(b => b.classList.toggle('active', b.dataset.action === action));
  }

  async function handleToolbar(action) {
    switch (action) {
      case 'translate': return runTranslate();
      case 'lens':      return toggleLensBall();
      case 'quick':     return toggleQuickActions();
      case 'mic':       return toggleVoiceInput();
      case 'fonts':     return toast('Fancy fonts are available in the installed app — Aᴀ 𝓪𝓫𝓬 𝕒𝕓𝕔');
      case 'clipboard': return toast('Clipboard history is available in the installed app 📋');
      case 'settings':  return toast('Opens the full TypeAura app on your phone ⚙');
    }
  }

  /* ── AI Quick Actions panel (in-keyboard, mirrors lib/main.dart) ── */
  const QUICK_TOOLS = [
    ['✍️', 'Fix Grammar'], ['💬', 'Make Casual'], ['👔', 'Make Formal'],
    ['🔄', 'Hinglish→EN'], ['🇮🇳', 'EN→Hinglish'], ['✂️', 'Shorten'],
  ];
  const CONVERTERS = [
    ['❤️', 'Loving'], ['🙏', 'Polite'], ['😊', 'Friendly'], ['😠', 'Assertive'],
    ['😅', 'Apologetic'], ['😄', 'Funny'], ['🎉', 'Celebratory'], ['💼', 'Professional'],
  ];

  const kbKeys  = document.getElementById('kbKeys');
  const kbPanel = document.getElementById('kbPanel');

  function qaTile([emoji, label]) {
    return `<button type="button" class="qa-tile" data-qa="${escapeHtml(label)}"><span class="qa-emoji">${emoji}</span><span class="qa-label">${escapeHtml(label)}</span></button>`;
  }

  function toggleQuickActions() {
    if (!kbPanel.hidden) { closeQuickActions(); return; }
    setActiveTool('quick');
    kbPanel.innerHTML = `
      <div class="qa-scroll">
        <div class="qa-header">⚡ QUICK TOOLS</div>
        <div class="qa-grid">${QUICK_TOOLS.map(qaTile).join('')}</div>
        <div class="qa-header">💬 MESSAGE CONVERTERS</div>
        <div class="qa-grid">${CONVERTERS.map(qaTile).join('')}</div>
      </div>
      <div class="qa-bottom">
        <button type="button" class="key key--special qa-abc" data-qa-abc>ABC</button>
        <button type="button" class="key key--special qa-back" data-key="backspace" data-icon="backspace"></button>
      </div>`;
    fillIcons(kbPanel);
    kbKeys.hidden = true;
    kbPanel.hidden = false;
    kbPanel.querySelector('[data-qa-abc]').addEventListener('click', closeQuickActions);
    kbPanel.querySelector('[data-key="backspace"]').addEventListener('click', () => keyboard.handle('backspace'));
    kbPanel.querySelectorAll('[data-qa]').forEach(t => t.addEventListener('click', () => runQuickAction(t.dataset.qa)));
  }

  function closeQuickActions() {
    kbPanel.hidden = true;
    kbPanel.innerHTML = '';
    kbKeys.hidden = false;
    setActiveTool(null);
  }

  async function runQuickAction(label) {
    const text = keyboard.buffer.trim();
    if (!text) { toast('Type a message first, then pick a Quick Tool ⚡'); return; }
    try {
      const { result } = await callDemoOrScript('quick_action', text, { action: label }, { result: SCRIPT.quickFormal });
      closeQuickActions();
      setSuggestions([{
        label: '✨', text: result,
        onClick: (c) => { keyboard.setBuffer(c.text); clearSuggestions(); keyboard.shift = false; keyboard._refreshLetters(); },
      }]);
      tour.notify('quick-done');
    } catch (err) {
      toast(err.message);
    }
  }

  /* ── feature 1: Floating Lens ── */
  function showLensPopup(anchorEl) {
    overlay.innerHTML = '';
    const orig = anchorEl.firstChild ? anchorEl.firstChild.textContent : anchorEl.textContent;
    const pop = document.createElement('div');
    pop.className = 'lens-popup';
    pop.innerHTML = `
      <button class="lens-popup-close" aria-label="Close">×</button>
      <div class="lens-popup-head">🌐 Floating Lens · → Hindi</div>
      <div class="lens-popup-orig">${escapeHtml(orig)}</div>
      <div class="lens-popup-result"><span class="lens-popup-loading"><span class="kb-spinner" style="margin:0"></span> Translating…</span></div>
    `;
    overlay.appendChild(pop);
    positionNear(pop, anchorEl);
    pop.querySelector('.lens-popup-close').addEventListener('click', () => { overlay.innerHTML = ''; });

    callDemoOrScript('lens_translate', orig, { targetLang: 'Hindi' }, { result: SCRIPT.lensHindi })
      .then(({ result }) => {
        pop.querySelector('.lens-popup-result').textContent = result || '(no translation)';
        const actions = document.createElement('div');
        actions.className = 'lens-popup-actions';
        actions.innerHTML = '<button class="lens-btn" data-reply>💬 Suggest replies (English)</button>';
        pop.appendChild(actions);
        actions.querySelector('[data-reply]').addEventListener('click', () => loadLensReplies(pop, orig, actions));
        tour.notify('lens-done');
      })
      .catch(err => { pop.querySelector('.lens-popup-result').textContent = err.message; });
  }

  function loadLensReplies(pop, orig, actions) {
    actions.innerHTML = '<span class="lens-popup-loading"><span class="kb-spinner" style="margin:0"></span> Generating replies…</span>';
    callDemoOrScript('lens_reply', orig, { replyLang: 'English' }, { replies: SCRIPT.lensReplies })
      .then(({ replies }) => {
        actions.innerHTML = '';
        (replies || []).forEach(r => {
          const chip = document.createElement('button');
          chip.className = 'lens-reply-chip';
          chip.textContent = r;
          chip.addEventListener('click', () => { overlay.innerHTML = ''; chat.sendOutgoing(r); });
          actions.appendChild(chip);
        });
      })
      .catch(err => { actions.innerHTML = `<div class="lens-popup-orig">${escapeHtml(err.message)}</div>`; });
  }

  function positionNear(pop, anchorEl) {
    const screen = $('.phone-screen').getBoundingClientRect();
    const a = anchorEl.getBoundingClientRect();
    let top = a.bottom - screen.top + 8;
    // keep within the phone
    if (top + 180 > screen.height) top = Math.max(50, a.top - screen.top - 180);
    pop.style.top = top + 'px';
  }

  /* draggable Floating Lens ball — mirrors the real keyboard:
     tap toolbar lens → a ball appears → drag it onto a message → translate. */
  let lensBall = null;

  function toggleLensBall() {
    // a previous overlay clear may have detached the ball without nulling the ref
    if (lensBall && lensBall.isConnected) { removeLensBall(); setActiveTool(null); return; }
    lensBall = null;
    setActiveTool('lens');
    spawnLensBall();
  }

  function removeLensBall() {
    clearBubbleHighlight();
    if (lensBall) { lensBall.remove(); lensBall = null; }
  }

  function clearBubbleHighlight() { $$('.bubble.lens-hover').forEach(b => b.classList.remove('lens-hover')); }

  function bubbleUnderBall() {
    if (!lensBall) return null;
    const r = lensBall.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    lensBall.style.pointerEvents = 'none';            // see through the ball
    const el = document.elementFromPoint(cx, cy);
    lensBall.style.pointerEvents = '';
    return el ? el.closest('.bubble') : null;
  }

  function spawnLensBall() {
    const screen = $('.phone-screen');
    lensBall = document.createElement('div');
    lensBall.className = 'lens-ball';
    lensBall.textContent = '◎';
    lensBall.title = 'Drag me onto a message';
    overlay.appendChild(lensBall);

    const sr = screen.getBoundingClientRect();
    let x = sr.width - 64, y = sr.height * 0.42;
    const place = () => { lensBall.style.left = x + 'px'; lensBall.style.top = y + 'px'; };
    place();

    let dragging = false, ox = 0, oy = 0, moved = false;

    lensBall.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false;
      lensBall.setPointerCapture(e.pointerId);
      const r = lensBall.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      lensBall.classList.add('dragging');
      e.preventDefault();
    });

    lensBall.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      moved = true;
      const s = screen.getBoundingClientRect();
      x = Math.max(0, Math.min(e.clientX - s.left - ox, s.width - lensBall.offsetWidth));
      y = Math.max(0, Math.min(e.clientY - s.top - oy, s.height - lensBall.offsetHeight));
      place();
      const b = bubbleUnderBall();
      clearBubbleHighlight();
      if (b) b.classList.add('lens-hover');
    });

    lensBall.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      lensBall.classList.remove('dragging');
      const bubble = bubbleUnderBall();
      clearBubbleHighlight();
      if (bubble) {
        removeLensBall();
        setActiveTool(null);
        showLensPopup(bubble);
      } else if (!moved) {
        toast('Drag the lens onto a message to translate it.');
      }
    });

  }

  /* ── feature 2: Hinglish ↔ English translate (single variant) ── */
  async function runTranslate() {
    if (!keyboard.buffer.trim()) { toast('Type something first, then tap Translate ⇄'); return; }
    setActiveTool('translate');
    try {
      const { result } = await callDemoOrScript('translate', keyboard.buffer.trim(), { targetLang: 'English' }, { result: SCRIPT.translateEn });
      setSuggestions([{
        label: '⇄', text: result,
        onClick: (c) => { keyboard.setBuffer(c.text); clearSuggestions(); keyboard.shift = false; keyboard._refreshLetters(); },
      }]);
      tour.notify('translate-done');
    } catch (err) {
      toast(err.message);
    } finally {
      setActiveTool(null);
    }
  }

  /* ── feature 4: Voice typing (mic → speech-to-text, like the app) ──
     Browser STT stops on every short silence; we keep listening by
     auto-restarting until the user taps the mic again (manualStop). */
  let recognition = null, listening = false, manualStop = false;
  let voiceBase = '', voiceCommitted = '', sessionText = '';
  let silenceTimer = null, gotAnyResult = false;
  const SILENCE_MS = 3000;   // auto-off after 3s of no speech

  // (Re)start the 3-second silence countdown. Reset on every speech result;
  // when it fires, the mic auto-stops (and translates whatever was said).
  function armSilence() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      if (!listening) return;
      manualStop = true;
      listening = false;
      if (!gotAnyResult) toast('3 sec tak kuch suna nahi — mic band. Dobara tap karke boliye 🎙');
      if (recognition) { try { recognition.stop(); } catch (_) { finishVoice(); } }
      else finishVoice();
    }, SILENCE_MS);
  }

  function showListening(partial) {
    suggestStrip.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'kb-listening';
    if (partial) {
      wrap.innerHTML = `<span class="kb-listening-text">${escapeHtml(partial)}</span>`;
    } else {
      wrap.innerHTML = '<span class="kb-listening-text">Listening…</span><span class="kb-bars">' +
        Array.from({ length: 5 }).map((_, i) => `<span class="kb-bar" style="animation-delay:${i * 0.12}s"></span>`).join('') +
        '</span>';
    }
    suggestStrip.appendChild(wrap);
  }

  function startRecog() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    // Rebuild the whole transcript of THIS recognition session every event
    // (don't rely on resultIndex — it's flaky across browsers).
    recognition.onresult = (e) => {
      gotAnyResult = true;
      armSilence();              // speech heard → reset the 3s countdown
      let txt = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i] && e.results[i][0]) txt += e.results[i][0].transcript;
      }
      sessionText = txt;
      keyboard.setBuffer(voiceBase + voiceCommitted + sessionText);
      showListening((voiceCommitted + sessionText).trim());
    };
    recognition.onerror = (e) => {
      // 'no-speech' / 'aborted' are transient — let onend auto-restart.
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        manualStop = true;
        toast('Mic blocked. Tap the 🔒 lock icon in the address bar → allow Microphone, then retry.');
      } else if (e.error === 'audio-capture') {
        manualStop = true;
        toast('No microphone found on this device.');
      } else if (e.error === 'network') {
        manualStop = true;
        toast('Voice service isn\'t available in this browser. Open the demo in Google Chrome 🎙');
      }
    };
    recognition.onend = () => {
      // keep whatever was recognised this session, then keep listening
      voiceCommitted += sessionText;
      sessionText = '';
      if (!manualStop && listening) {
        setTimeout(() => { if (listening && !manualStop) { try { recognition.start(); } catch (_) { finishVoice(); } } }, 150);
        return;
      }
      finishVoice();
    };

    try { recognition.start(); }
    catch (_) { finishVoice(); }
  }

  function showConverting() {
    suggestStrip.innerHTML = '<span class="kb-listening"><span class="kb-listening-text">Converting to English…</span></span>';
  }

  // Clean + translate the spoken text to English. Prefer the app-faithful
  // `voice_filter` mode; if the backend doesn't have it yet, fall back to the
  // always-available `translate` mode; if both fail, keep the raw transcript.
  async function translateVoice(raw) {
    try {
      const { result } = await callDemo('voice_filter', raw, { targetLang: 'English' });
      if (result && result.trim()) return result.trim();
    } catch (_) { /* try the fallback below */ }
    try {
      const { result } = await callDemo('translate', raw, { targetLang: 'English' });
      if (result && result.trim()) return result.trim();
    } catch (_) { /* keep raw */ }
    return raw;
  }

  // On stop: clean + translate the spoken text to English (like the keyboard's
  // _filterVoiceText), then drop the result into the message box.
  async function finishVoice() {
    listening = false;
    recognition = null;
    clearTimeout(silenceTimer);
    setActiveTool(null);
    keyboard.shift = false; keyboard._refreshLetters();
    const raw = (voiceCommitted + sessionText).trim();
    if (!raw) { clearSuggestions(); return; }
    showConverting();
    const out = await translateVoice(raw);
    keyboard.setBuffer(out);                  // clear input → show only the translated text
    clearSuggestions();
    tour.notify('voice-done');
  }

  /* Fallback for browsers without the Web Speech API (Firefox, some mobile/
     in-app browsers): show a believable "voice typing" demo so the feature
     is still visible. Types a sample line character-by-character. */
  function simulateVoice(quiet) {
    const heard = 'kal subah das baje milte hain';        // what the user "says"
    const english = "Let's meet at 10 tomorrow morning.";  // cleaned + translated
    listening = true;
    manualStop = false;
    setActiveTool('mic');
    showListening('');
    voiceBase = keyboard.buffer && !keyboard.buffer.endsWith(' ') ? keyboard.buffer + ' ' : keyboard.buffer;
    let i = 0;
    if (!quiet) toast('Voice typing needs Chrome/Edge — showing a quick sample. In the app it works on any Android phone 🎙');
    const tick = () => {
      if (!listening) return;                 // user tapped to cancel
      i++;
      const partial = heard.slice(0, i);
      keyboard.setBuffer(voiceBase + partial);
      showListening(partial);
      if (i < heard.length) {
        setTimeout(tick, 90 + Math.random() * 60);
      } else {
        showConverting();
        setTimeout(() => {
          listening = false; setActiveTool(null);
          keyboard.setBuffer(english);          // clear input → show only the translated text
          clearSuggestions();
          keyboard.shift = false; keyboard._refreshLetters();
          tour.notify('voice-done');
        }, 900);
      }
    };
    setTimeout(tick, 700);
  }

  function toggleVoiceInput() {
    if (listening) {                       // user taps to stop
      manualStop = true;
      listening = false;
      if (recognition) { try { recognition.stop(); } catch (_) {} }
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { simulateVoice(); return; }
    manualStop = false;
    listening = true;
    gotAnyResult = false;
    voiceBase = keyboard.buffer && !keyboard.buffer.endsWith(' ') ? keyboard.buffer + ' ' : keyboard.buffer;
    voiceCommitted = '';
    sessionText = '';
    setActiveTool('mic');
    showListening('');
    startRecog();
    armSilence();                // start the 3s no-speech countdown
  }

  /* ───────────────────────── tutorial engine ───────────────────────── */
  const coachLayer  = document.getElementById('coachLayer');
  const coachTooltip = document.getElementById('coachTooltip');
  const coachTitle  = document.getElementById('coachTitle');
  const coachBody   = document.getElementById('coachBody');
  const coachNextBtn = document.getElementById('coachNext');
  const coachSkipBtn = document.getElementById('coachSkip');
  const steps       = $$('.demo-step-chip');

  // Tour language (chosen at start). All coachmark text is localized below.
  let lang = 'en';
  const UI_TEXT = {
    en: {
      next: 'Next →', start: 'Start ▶', finishBtn: 'Finish ✓', skip: 'Skip tour',
      finish: '🎉 That\'s TypeAura! Loved it? Download the app free 👇',
    },
    hi: {
      next: 'आगे →', start: 'शुरू करें ▶', finishBtn: 'पूरा करें ✓', skip: 'टूर छोड़ें',
      finish: '🎉 यही है TypeAura! पसंद आया? ऐप फ्री डाउनलोड करें 👇',
    },
  };

  /* ── auto-demo helpers (the tour plays the feature for the user) ── */
  function autoType(text) {
    keyboard.setBuffer('');
    keyboard.shift = false; keyboard._refreshLetters();
    let i = 0;
    const tick = () => {
      if (!tour.active) return;
      i++;
      keyboard.setBuffer(text.slice(0, i));
      if (i < text.length) setTimeout(tick, 55 + Math.random() * 45);
    };
    setTimeout(tick, 250);
  }

  function autoLensAppear() {
    if (!(lensBall && lensBall.isConnected)) { lensBall = null; setActiveTool('lens'); spawnLensBall(); }
    else setActiveTool('lens');
  }

  function autoLensTranslate() {
    const screen = $('.phone-screen');
    const bubble = $('.bubble.incoming');
    if (!(lensBall && lensBall.isConnected)) { setActiveTool('lens'); spawnLensBall(); }
    if (!bubble || !lensBall) return;
    lensBall.style.transition = 'left .85s ease, top .85s ease';
    const sr = screen.getBoundingClientRect();
    const br = bubble.getBoundingClientRect();
    requestAnimationFrame(() => {
      lensBall.style.left = (br.left - sr.left + br.width / 2 - 24) + 'px';
      lensBall.style.top  = (br.top  - sr.top  + br.height / 2 - 24) + 'px';
      bubble.classList.add('lens-hover');
    });
    setTimeout(() => {
      if (!tour.active) return;
      bubble.classList.remove('lens-hover');
      removeLensBall();
      setActiveTool(null);
      showLensPopup(bubble);          // translates to Hindi
    }, 1050);
  }

  function autoLensReplies() {
    pollClick(() => overlay.querySelector('[data-reply]'), 3000);
  }
  function autoLensPickReply() {
    pollClick(() => overlay.querySelector('.lens-reply-chip'), 5000);
  }
  function autoApplySuggestion() {
    pollClick(() => suggestStrip.querySelector('.kb-chip'), 5000);
  }
  function autoQuickAction() {
    pollClick(() => (kbPanel && !kbPanel.hidden ? kbPanel.querySelector('[data-qa="Make Formal"]') : null), 4000);
  }

  // Poll for an element to appear, then click it (used to drive async UI).
  function pollClick(getter, timeoutMs) {
    const start = Date.now();
    const iv = setInterval(() => {
      if (!tour.active || Date.now() - start > timeoutMs) { clearInterval(iv); return; }
      const el = getter();
      if (el) { clearInterval(iv); el.click(); }
    }, 140);
  }

  /* ── chapters: each feature is a guided, auto-playing mini-walkthrough ── */
  const CHAPTERS = [
    {
      chip: 0,
      title: { en: 'Chapter 1 · Floating Lens', hi: 'अध्याय 1 · फ़्लोटिंग लेंस' },
      intro: {
        en: "The Floating Lens reads & translates text in ANY app — and even writes replies for you. Watch it on Riya's message 👇",
        hi: 'फ़्लोटिंग लेंस किसी भी ऐप में टेक्स्ट पढ़कर अनुवाद करता है — और आपके लिए रिप्लाई भी लिखता है। रिया के मैसेज पर देखिए 👇',
      },
      steps: [
        { target: () => $('.icon-btn[data-action="lens"]'), run: autoLensAppear,
          tip: { en: 'Tap the ◎ Lens — a floating orb pops out and stays on top of any app.', hi: '◎ लेंस दबाएँ — एक फ़्लोटिंग ऑर्ब निकलता है जो किसी भी ऐप के ऊपर रहता है।' } },
        { target: null, run: autoLensTranslate,
          tip: { en: 'Drag it onto the message — it instantly translates to Hindi. 🌐', hi: 'इसे मैसेज पर खींचें — यह तुरंत हिंदी में अनुवाद कर देता है। 🌐' } },
        { target: null, run: autoLensReplies,
          tip: { en: 'No typing needed — tap “Suggest replies” for 3 instant AI replies.', hi: 'टाइप करने की ज़रूरत नहीं — “Suggest replies” दबाएँ, 3 इंस्टैंट AI रिप्लाई मिलेंगे।' } },
        { target: null, run: autoLensPickReply,
          tip: { en: 'Pick one — sent! 🎉 The Lens works in WhatsApp, Instagram, games… everywhere.', hi: 'कोई एक चुनें — भेज दिया! 🎉 लेंस WhatsApp, Instagram, गेम्स… हर जगह काम करता है।' } },
      ],
    },
    {
      chip: 1,
      title: { en: 'Chapter 2 · Hinglish ↔ English', hi: 'अध्याय 2 · हिंग्लिश ↔ इंग्लिश' },
      intro: {
        en: 'Type the way you talk — in Hinglish — and turn it into clean English in one tap.',
        hi: 'जैसे आप बोलते हैं वैसे टाइप करें — हिंग्लिश में — और एक टैप में साफ़ अंग्रेज़ी बनाएँ।',
      },
      steps: [
        { target: null, run: () => autoType('kal subah milte hain'),
          tip: { en: 'Watch — we type a Hinglish line for you…', hi: 'देखिए — हम आपके लिए एक हिंग्लिश लाइन टाइप कर रहे हैं…' } },
        { target: () => $('.icon-btn[data-action="translate"]'), run: () => runTranslate(),
          tip: { en: 'Tap ⇄ Translate — AI rewrites it in natural English.', hi: '⇄ ट्रांसलेट दबाएँ — AI इसे नैचुरल अंग्रेज़ी में बदल देता है।' } },
        { target: null, run: autoApplySuggestion,
          tip: { en: 'Tap the suggestion and it drops straight into your message. Done!', hi: 'सुझाव पर टैप करें और वह सीधे आपके मैसेज में आ जाता है। हो गया!' } },
      ],
    },
    {
      chip: 2,
      title: { en: 'Chapter 3 · AI Quick Tools', hi: 'अध्याय 3 · एआई क्विक टूल्स' },
      intro: {
        en: '14 one-tap AI tools — Fix Grammar, Make Formal, Funny, Polite & more — right on the keyboard.',
        hi: '14 वन-टैप AI टूल्स — Fix Grammar, Make Formal, Funny, Polite और भी — सीधे कीबोर्ड पर।',
      },
      steps: [
        { target: null, run: () => autoType('bro kal ka plan pakka hai na'),
          tip: { en: 'Say you typed a rough message…', hi: 'मान लीजिए आपने एक रफ़ मैसेज टाइप किया…' } },
        { target: () => $('.icon-btn[data-action="quick"]'), run: () => { if (kbPanel.hidden) toggleQuickActions(); },
          tip: { en: 'Open ▦ Quick Tools to see all 14 one-tap actions.', hi: 'सभी 14 वन-टैप एक्शन देखने के लिए ▦ क्विक टूल्स खोलें।' } },
        { target: null, run: autoQuickAction,
          tip: { en: 'Tap one — like “Make Formal” — and AI rewrites it instantly.', hi: 'कोई एक दबाएँ — जैसे “Make Formal” — और AI तुरंत उसे फिर से लिख देता है।' } },
      ],
    },
    {
      chip: 3,
      title: { en: 'Chapter 4 · Voice Typing', hi: 'अध्याय 4 · वॉइस टाइपिंग' },
      intro: {
        en: 'Just speak — even in Hindi or Hinglish — and TypeAura types it out in clean English.',
        hi: 'बस बोलिए — हिंदी या हिंग्लिश में भी — और TypeAura उसे साफ़ अंग्रेज़ी में टाइप कर देता है।',
      },
      steps: [
        { target: () => $('.icon-btn[data-action="mic"]'), run: () => simulateVoice(true),
          tip: { en: 'Tap 🎙 and speak naturally. (Here we play a sample.)', hi: '🎙 दबाएँ और सहज होकर बोलें। (यहाँ हम एक सैंपल दिखा रहे हैं।)' } },
        { target: null, run: null,
          tip: { en: 'See? Your speech becomes clean English automatically. That’s the full TypeAura! 🎉', hi: 'देखा? आपकी आवाज़ अपने-आप साफ़ अंग्रेज़ी बन जाती है। यही है पूरा TypeAura! 🎉' } },
      ],
    },
  ];

  const tour = {
    ci: 0, si: 0, active: false, phase: 'intro', _curTarget: null,

    notify() {},   // no-op (kept so feature fns can call it harmlessly)

    start() {
      this.active = true;
      coachSkipBtn.textContent = UI_TEXT[lang].skip;
      this.ci = 0;
      this._enterChapter();
    },

    _markChips() {
      const ch = CHAPTERS[this.ci];
      steps.forEach((c, idx) => {
        c.classList.toggle('active', idx === ch.chip);
        c.classList.toggle('done', idx < ch.chip);
      });
    },

    _resetStage() {
      overlay.innerHTML = '';
      lensBall = null;
      setActiveTool(null);
      keyboard.setBuffer('');
      clearSuggestions();
      clearTimeout(riyaTimer);
      const t = chatBody.querySelector('.bubble.typing'); if (t) t.remove();
      if (kbPanel && !kbPanel.hidden) { kbPanel.hidden = true; kbPanel.innerHTML = ''; kbKeys.hidden = false; }
    },

    _enterChapter() {
      this._resetStage();
      this.phase = 'intro';
      this.si = 0;
      this._curTarget = null;
      this._markChips();
      const ch = CHAPTERS[this.ci];
      coachNextBtn.textContent = UI_TEXT[lang].start;
      this._show(ch.title[lang], ch.intro[lang], null);
    },

    _runStep() {
      const ch = CHAPTERS[this.ci];
      const step = ch.steps[this.si];
      const lastOfTour = (this.ci === CHAPTERS.length - 1) && (this.si === ch.steps.length - 1);
      coachNextBtn.textContent = lastOfTour ? UI_TEXT[lang].finishBtn : UI_TEXT[lang].next;
      this._curTarget = step.target || null;
      this._show(ch.title[lang], step.tip[lang], this._curTarget ? this._curTarget() : null);
      if (step.run) { try { step.run(); } catch (_) {} }
    },

    advance() {
      if (!this.active) return;
      if (this.phase === 'intro') {
        this.phase = 'step';
        this.si = 0;
        this._runStep();
        return;
      }
      const ch = CHAPTERS[this.ci];
      this.si++;
      if (this.si >= ch.steps.length) {
        steps[ch.chip].classList.remove('active');
        steps[ch.chip].classList.add('done');
        this.ci++;
        if (this.ci >= CHAPTERS.length) return this.finish();
        this._enterChapter();
        return;
      }
      this._runStep();
    },

    _show(title, body, target) {
      coachTitle.textContent = title;
      coachBody.textContent = body;
      this._place(target);
    },

    _place(targetEl) {
      coachLayer.hidden = false;
      const old = coachLayer.querySelector('.coach-spotlight');
      if (old) old.remove();
      const stageEl = document.getElementById('demoStage');
      const stage = stageEl.getBoundingClientRect();

      // spotlight ring on the target (inside the phone), if any
      if (targetEl) {
        const r = targetEl.getBoundingClientRect();
        const spot = document.createElement('div');
        spot.className = 'coach-spotlight';
        const pad = 6;
        spot.style.left   = (r.left - stage.left - pad) + 'px';
        spot.style.top    = (r.top - stage.top - pad) + 'px';
        spot.style.width  = (r.width + pad * 2) + 'px';
        spot.style.height = (r.height + pad * 2) + 'px';
        coachLayer.insertBefore(spot, coachTooltip);
      }

      // tooltip: beside the phone on desktop (fills the empty space), pinned to
      // the bottom on narrow screens — always visually tied to the phone.
      const phone = stageEl.querySelector('.phone-mockup');
      const pr = phone.getBoundingClientRect();
      const ttW = coachTooltip.offsetWidth || 300;
      const ttH = coachTooltip.offsetHeight || 180;
      coachTooltip.style.bottom = 'auto';

      if (stage.width > 760) {
        // to the right of the phone, else to the left if no room
        let left = (pr.right - stage.left) + 28;
        if (left + ttW > stage.width - 8) left = (pr.left - stage.left) - ttW - 28;
        left = Math.max(8, left);
        const top = Math.min(Math.max(8, (pr.top - stage.top) + 40), stage.height - ttH - 8);
        coachTooltip.style.left = left + 'px';
        coachTooltip.style.top = top + 'px';
      } else {
        const w = Math.min(ttW, stage.width - 16);
        coachTooltip.style.left = Math.max(8, (stage.width - w) / 2) + 'px';
        coachTooltip.style.top = 'auto';
        coachTooltip.style.bottom = '12px';
      }
    },

    finish() {
      this.active = false;
      coachLayer.hidden = true;
      const old = coachLayer.querySelector('.coach-spotlight');
      if (old) old.remove();
      steps.forEach(c => { c.classList.remove('active'); c.classList.add('done'); });
      this._resetStage();
      toast(UI_TEXT[lang].finish);
    },

    skip() { this.finish(); },
  };

  coachNextBtn.addEventListener('click', () => tour.advance());
  coachSkipBtn.addEventListener('click', () => tour.skip());

  // keep the spotlight aligned with its target on resize
  let reflow;
  window.addEventListener('resize', () => {
    clearTimeout(reflow);
    reflow = setTimeout(() => {
      if (tour.active && tour.phase === 'step') tour._place(tour._curTarget ? tour._curTarget() : null);
    }, 120);
  });

  /* ───────────────────────── boot ───────────────────────── */
  function seedChat() {
    chat.reset();
    overlay.innerHTML = '';
    chat.addBubble({ side: 'incoming', text: 'Hey! Free tomorrow for coffee? ☕' });
    keyboard.setBuffer('');
  }

  // Language picker — shown when the demo starts (and on restart).
  const langModal = document.getElementById('langModal');
  function askLanguage() {
    coachLayer.hidden = true;
    langModal.hidden = false;
  }
  langModal.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    lang = b.dataset.lang === 'hi' ? 'hi' : 'en';
    langModal.hidden = true;
    tour.start();
  });

  function restart() {
    steps.forEach(s => s.classList.remove('active', 'done'));
    tour.active = false;
    overlay.innerHTML = '';
    setActiveTool(null);
    seedChat();
    keyboard.render();
    askLanguage();        // re-ask language on restart
  }

  document.getElementById('restartBtn').addEventListener('click', restart);

  // init
  fillIcons();           // toolbar + bottom-row (emoji, enter) icons
  keyboard.render();
  seedChat();
  clearSuggestions();
  setTimeout(askLanguage, 400);   // ask language, then start the tour
})();
