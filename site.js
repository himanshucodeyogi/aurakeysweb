/* ═══════════════════════════════════════════════════════════════
   site.js — shared chrome for every TypeAura page.

   Consolidates behaviour that used to be hand-copied per page:
     · scroll progress bar   (was in app.js, privacy.html, delete-data.html
                              — three copies, each an unthrottled listener
                              writing layout-triggering styles)
     · back-to-top button    (was a second unthrottled listener in app.js)
     · hamburger / mobile nav (was app.js only, so sub-pages had a navbar
                              that collapsed to just a logo below 900px)
     · smooth anchor scroll

   The two scroll listeners are now one rAF-batched frame.
   Every element lookup is optional — a page opts in by including the
   markup, and a page without it simply skips that feature.

   Loaded by: index, privacy, delete-data, update, demo.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Scroll progress + back to top (one rAF frame) ───────────── */
  var progress = document.getElementById('scrollProgress');
  var backTop  = document.getElementById('backToTop');

  if (progress || backTop) {
    var ticking = false;

    var update = function () {
      ticking = false;
      // One read pass, then one write pass — never interleaved.
      var scrolled = window.scrollY;
      var total    = document.documentElement.scrollHeight - window.innerHeight;

      if (progress) {
        progress.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
      }
      if (backTop) {
        backTop.classList.toggle('visible', scrolled > 400);
      }
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    // A full-page smooth scroll is the longest animation on the site and
    // exactly the kind of motion that triggers vestibular symptoms.
    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    }
  }

  /* ── Hamburger / mobile nav ──────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        var first = mobileNav.querySelector('a');
        if (first) first.focus();
      } else {
        hamburger.focus();
      }
    });

    mobileNav.querySelectorAll('.mobile-nav-link').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });

    // Close on tap outside the links
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) closeMobileNav();
    });

    // The overlay had no keyboard dismissal at all before this.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  /* ── Smooth anchor scroll ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  // Exposed so page scripts can dismiss the menu (e.g. before opening a modal).
  window.TypeAuraSite = { closeMobileNav: closeMobileNav };
})();
