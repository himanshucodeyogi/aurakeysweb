// TypeAura Website — app.js

const BACKEND_URL = 'https://typeaurabackend.vercel.app';

async function loadStats() {
  if (!BACKEND_URL) return; // no backend yet — keep "—" placeholders

  try {
    const res = await fetch(`${BACKEND_URL}/api/public-stats`);
    if (!res.ok) return;
    const data = await res.json();

    // Expected response shape:
    // { total_installs: 124, active_users: 31, keyboard_sessions: 842, ai_actions: 219 }

    setStatValue('stat-installs', 'total_installs',    data, '+', 30);
    setStatValue('stat-active',   'active_users',      data, '+', 25);
    setStatValue('stat-sessions', 'keyboard_sessions', data);
    setStatValue('stat-ai',       'ai_actions',        data);
  } catch (e) {
    // silent fail — placeholders remain
  }
}

function setStatValue(cardId, key, data, suffix = '', minVal = 0) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const el = card.querySelector('.stat-value');
  if (!el) return;
  const val = data[key];
  if (val !== undefined && val !== null) {
    el.classList.remove('loading');
    animateCount(el, Math.max(val, minVal), suffix);
  }
}

function formatNumber(n, suffix = '') {
  const str = n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
  return str + suffix;
}

function animateCount(el, target, suffix = '') {
  let start = 0;
  const duration = 1200;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);
    el.textContent = formatNumber(current, suffix);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatNumber(target, suffix);
  };
  requestAnimationFrame(step);
}

// ── Hamburger menu ──────────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');

function closeMobileNav() {
  hamburger?.classList.remove('open');
  mobileNav?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close when a mobile nav link is tapped
document.querySelectorAll('.mobile-nav-link').forEach(a => {
  a.addEventListener('click', closeMobileNav);
});

// Close on outside tap
mobileNav?.addEventListener('click', e => {
  if (e.target === mobileNav) closeMobileNav();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Intersection observer — fade-in cards on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Mark that JS is active so CSS can safely hide-then-reveal feature cards.
document.documentElement.classList.add('js');

document.querySelectorAll(
  '.stat-card, .step-card, .feedback-card, .what-is-card, .founder-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ── Feature cards: staggered rise-in (kept separate from the generic
// observer so its !important transform doesn't block the hover lift). ──
const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const card = entry.target;
    const col = [...card.parentElement.children].indexOf(card) % 5; // wave per row (5-col grid)
    card.style.animationDelay = `${col * 90}ms`;
    card.classList.add('in');
    // Once the entrance finishes, drop to a plain stable state so the
    // animation's held transform stops overriding :hover.
    card.addEventListener('animationend', () => {
      card.classList.remove('in');
      card.classList.add('done');
      card.style.animationDelay = '';
    }, { once: true });
    featureObserver.unobserve(card);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.features-grid .feature-card').forEach(c => featureObserver.observe(c));

document.addEventListener('DOMContentLoaded', () => {
  // Add loading state to stat values
  document.querySelectorAll('.stat-value').forEach(el => el.classList.add('loading'));
  loadStats();
});

// CSS class for intersection observer
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

// ── Lightbox ─────────────────────────────────────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxLabel = document.getElementById('lightboxLabel');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(img) {
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxLabel.textContent = img.closest('.screenshot-slot')
    ?.querySelector('.screenshot-label')?.textContent || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Delegated so cloned (carousel) slots open the lightbox too.
document.getElementById('screenshotsRow')?.addEventListener('click', e => {
  const img = e.target.closest('.screenshot-slot img');
  if (img) openLightbox(img);
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);

// Click outside image to close
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// ESC key to close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── Scroll progress bar ──────────────────────────────────────────
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = ((window.scrollY / total) * 100) + '%';
}, { passive: true });

// ── Back to top ──────────────────────────────────────────────────
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Active nav link (highlight current section) ──────────────────
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const navSections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      link?.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });

navSections.forEach(s => navObserver.observe(s));

// ── Screenshots: stepped "spotlight" carousel ───────────────────
// The centre frame stays fixed. One slot sits centred & enlarged, holds
// for DWELL ms, then the strip slides so the next slot lands in the frame.
(function initScreenshotCarousel() {
  const row = document.getElementById('screenshotsRow');
  if (!row) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const originals = [...row.children];
  const N = originals.length;
  if (!N) return;

  const DWELL = 2000;   // hold the centred image for 2s
  const SLIDE = 620;    // time to glide the next image into the frame

  // Flank the originals with a cloned set on each side so every original can
  // reach the dead-centre frame (it always has neighbours), and the forward
  // slide past the last one loops back seamlessly.
  const mkClone = (node) => {
    const clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    const v = clone.querySelector('video');
    if (v) { v.muted = true; v.play?.().catch(() => {}); }
    return clone;
  };
  if (!reduce) {
    const head = originals.map(mkClone);   // left flank
    const tail = originals.map(mkClone);   // right flank
    head.forEach(c => row.insertBefore(c, row.firstChild));
    tail.forEach(c => row.appendChild(c));
  }

  const all = [...row.children];
  // With flanks present the originals occupy [N .. 2N-1]; without (reduced
  // motion) they stay at [0 .. N-1].
  const FIRST = reduce ? 0 : N;
  const WRAP  = FIRST + N;   // first right-flank index — reset point

  let loopWidth = 0;
  const measure = () => {
    loopWidth = reduce ? 0 : (all[WRAP].offsetLeft - all[FIRST].offsetLeft);
  };

  // scrollLeft that puts element el dead-centre in the frame.
  const centerOffsetFor = (el) =>
    el.offsetLeft + el.offsetWidth / 2 - row.clientWidth / 2;

  // Tag whichever slot is nearest the frame centre as the spotlight.
  const updateCenter = () => {
    const rect = row.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    let best = null, bestDist = Infinity;
    for (const el of all) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - cx);
      if (d < bestDist) { bestDist = d; best = el; }
    }
    for (const el of all) el.classList.toggle('is-center', el === best);
  };

  const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

  let timer = null, animating = false, paused = false, pos = 0;

  function animateScrollTo(to, done) {
    const from = row.scrollLeft;
    const dist = to - from;
    if (reduce || Math.abs(dist) < 1) { row.scrollLeft = to; updateCenter(); done && done(); return; }
    const t0 = performance.now();
    animating = true;
    (function frame(now) {
      const p = Math.min((now - t0) / SLIDE, 1);
      row.scrollLeft = from + dist * easeInOut(p);
      updateCenter();
      if (p < 1) requestAnimationFrame(frame);
      else { animating = false; done && done(); }
    })(performance.now());
  }

  function scheduleAdvance() {
    clearTimeout(timer);
    timer = setTimeout(() => { runTo(pos + 1); }, DWELL);
  }

  function runTo(p) {
    animateScrollTo(centerOffsetFor(all[p]), () => {
      pos = p;
      // Slid onto the right flank → snap back to the identical original.
      if (pos >= WRAP) { pos -= N; row.scrollLeft -= loopWidth; updateCenter(); }
      if (!paused) scheduleAdvance();
    });
  }

  // Index (in `all`) of the slot currently nearest the frame centre.
  const nearestIndex = () => {
    const rect = row.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    let bi = pos, bd = Infinity;
    for (let i = 0; i < all.length; i++) {
      const r = all[i].getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - cx);
      if (d < bd) { bd = d; bi = i; }
    }
    return bi;
  };

  function pause()  { paused = true; clearTimeout(timer); }
  function resume() {
    if (!paused) return;
    paused = false;
    if (animating) return;
    // After a manual swipe, adopt whatever is now centred (normalised back
    // into the originals band) so the cycle continues from there — no jump.
    if (!reduce && loopWidth > 0) {
      const raw = nearestIndex();
      let banded = ((raw - FIRST) % N + N) % N + FIRST;
      row.scrollLeft -= ((raw - banded) / N) * loopWidth;
      pos = banded;
      updateCenter();
    }
    scheduleAdvance();
  }

  // Pause while the visitor hovers / touches / drags the strip.
  ['mouseenter', 'touchstart'].forEach(ev => row.addEventListener(ev, pause,  { passive: true }));
  ['mouseleave', 'touchend', 'touchcancel'].forEach(ev => row.addEventListener(ev, resume, { passive: true }));
  document.addEventListener('visibilitychange', () => { document.hidden ? pause() : resume(); });
  // Keep the spotlight tracking the finger during a manual swipe.
  row.addEventListener('scroll', () => { if (!animating) updateCenter(); }, { passive: true });
  window.addEventListener('resize', () => { measure(); row.scrollLeft = centerOffsetFor(all[pos]); });

  window.addEventListener('load', () => {
    measure();
    pos = FIRST;
    row.scrollLeft = centerOffsetFor(all[pos]);
    updateCenter();
    if (!reduce) scheduleAdvance();
  });
})();

// ── Download toast ───────────────────────────────────────────────
const downloadToast = document.getElementById('downloadToast');
let toastTimer;

function showDownloadToast() {
  clearTimeout(toastTimer);
  downloadToast.classList.add('visible');
  toastTimer = setTimeout(() => downloadToast.classList.remove('visible'), 4000);
}

document.querySelectorAll('a[href="typeaura.apk"]').forEach(a => {
  a.addEventListener('click', showDownloadToast);
});
