// AuraKeys Website — app.js

const BACKEND_URL = 'https://aurakeysbackend.vercel.app'; // trailing slash nahi — fetch me already /api/... hai

async function loadStats() {
  if (!BACKEND_URL) return; // no backend yet — keep "—" placeholders

  try {
    const res = await fetch(`${BACKEND_URL}/api/public-stats`);
    if (!res.ok) return;
    const data = await res.json();

    // Expected response shape:
    // { total_installs: 124, active_users: 31, keyboard_sessions: 842, ai_actions: 219 }

    setStatValue('stat-installs', 'total_installs', data);
    setStatValue('stat-active',   'active_users',   data);
    setStatValue('stat-sessions', 'keyboard_sessions', data);
    setStatValue('stat-ai',       'ai_actions',     data);
  } catch (e) {
    // silent fail — placeholders remain
  }
}

function setStatValue(cardId, key, data) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const el = card.querySelector('.stat-value');
  if (!el) return;
  const val = data[key];
  if (val !== undefined && val !== null) {
    el.classList.remove('loading');
    animateCount(el, val);
  }
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function animateCount(el, target) {
  let start = 0;
  const duration = 1200;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);
    el.textContent = formatNumber(current);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatNumber(target);
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

document.querySelectorAll(
  '.feature-card, .stat-card, .step-card, .feedback-card, .what-is-card, .founder-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

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

document.querySelectorAll('.screenshot-slot img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxLabel.textContent = img.closest('.screenshot-slot')
      ?.querySelector('.screenshot-label')?.textContent || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
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

// ── Screenshot dots ──────────────────────────────────────────────
const screenshotsRow = document.getElementById('screenshotsRow');
const dots = document.querySelectorAll('#screenshotDots .dot');

screenshotsRow?.addEventListener('scroll', () => {
  const slots = screenshotsRow.querySelectorAll('.screenshot-slot');
  if (!slots.length) return;
  const slotWidth = slots[0].offsetWidth + 12; // 12 = gap
  const activeIndex = Math.min(Math.round(screenshotsRow.scrollLeft / slotWidth), dots.length - 1);
  dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
}, { passive: true });

// ── Download toast ───────────────────────────────────────────────
const downloadToast = document.getElementById('downloadToast');
let toastTimer;

function showDownloadToast() {
  clearTimeout(toastTimer);
  downloadToast.classList.add('visible');
  toastTimer = setTimeout(() => downloadToast.classList.remove('visible'), 4000);
}

document.querySelectorAll('a[href="aurakeys.apk"]').forEach(a => {
  a.addEventListener('click', showDownloadToast);
});
