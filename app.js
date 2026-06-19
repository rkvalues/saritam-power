/* ===================================================================
   AUREON — interaction layer
   - hash routing across the 8 pages
   - mouse-tracked "torch" spotlight (fixed bg, hero, and cards)
   - scroll-reveal on enter
   - header scroll state, mobile nav, contact form
   =================================================================== */
(function () {
  'use strict';

  var PAGES = ['home', 'about', 'services', 'projects', 'capabilities', 'sectors', 'careers', 'contact'];

  var header   = document.getElementById('site-header');
  var torchBg  = document.getElementById('torch-bg');
  var navToggle = document.getElementById('nav-toggle');
  var siteNav  = document.getElementById('site-nav');
  var pages    = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  document.body.classList.add('reveal-ready');

  /* ---------- Routing ---------- */
  function pageFromHash() {
    var raw = (location.hash || '').replace(/^#\/?/, '').trim().toLowerCase();
    return PAGES.indexOf(raw) !== -1 ? raw : 'home';
  }

  var current = null;
  var revealObserver = null;

  function showPage(name) {
    if (name === current) return;
    current = name;

    pages.forEach(function (p) {
      var match = p.getAttribute('data-page') === name;
      p.hidden = !match;
    });

    navLinks.forEach(function (link) {
      var active = link.getAttribute('data-page') === name;
      link.classList.toggle('active', active);
      if (active) { link.setAttribute('aria-current', 'page'); }
      else { link.removeAttribute('aria-current'); }
    });

    closeNav();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setupReveal();
    refreshTorchCards();
    // header state recomputed for the fresh scroll position
    onScroll();
  }

  function route() { showPage(pageFromHash()); }

  /* ---------- Scroll reveal ---------- */
  function setupReveal() {
    if (revealObserver) { revealObserver.disconnect(); }
    var active = pages.filter(function (p) { return !p.hidden; })[0];
    if (!active) return;

    var items = Array.prototype.slice.call(active.querySelectorAll('[data-reveal]'));
    items.forEach(function (el) { el.classList.remove('revealed'); });

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseFloat(el.getAttribute('data-reveal')) || 0;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('revealed');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Torch spotlight ---------- */
  var torchCards = [];
  var mx = 0, my = 0, raf = null;

  function refreshTorchCards() {
    // only collect cards on the visible page (+ persistent ones), so the
    // rAF loop isn't walking hidden DOM every frame
    torchCards = Array.prototype.slice.call(document.querySelectorAll('.torch'))
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function onMove(e) {
    mx = e.clientX; my = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(applyTorch);
  }

  function applyTorch() {
    raf = null;
    var vw = window.innerWidth, vh = window.innerHeight;

    if (torchBg) {
      torchBg.style.setProperty('--mx', mx + 'px');
      torchBg.style.setProperty('--my', my + 'px');
    }

    var hero = document.getElementById('home-hero');
    if (hero && hero.offsetParent !== null) {
      var hr = hero.getBoundingClientRect();
      var hx = mx - hr.left, hy = my - hr.top;
      if (hx >= 0 && hy >= 0 && hx <= hr.width && hy <= hr.height) {
        hero.style.setProperty('--mx', hx + 'px');
        hero.style.setProperty('--my', hy + 'px');
      }
    }

    for (var i = 0; i < torchCards.length; i++) {
      var c = torchCards[i];
      var r = c.getBoundingClientRect();
      if (r.bottom < -60 || r.top > vh + 60 || r.right < -60 || r.left > vw + 60) continue;
      c.style.setProperty('--mx', (mx - r.left) + 'px');
      c.style.setProperty('--my', (my - r.top) + 'px');
    }
  }

  /* ---------- Header scroll state ---------- */
  function onScroll() {
    if (!header) return;
    var scrolled = (window.scrollY || window.pageYOffset || 0) > 24;
    header.classList.toggle('scrolled', scrolled);
  }

  /* ---------- Mobile nav ---------- */
  function openNav() {
    siteNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    if (!siteNav) return;
    siteNav.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (siteNav.classList.contains('open')) closeNav(); else openNav();
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('form-note');
      if (note) note.hidden = false;
      form.reset();
    });
  }

  /* ---------- Wire up ---------- */
  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('resize', refreshTorchCards, { passive: true });

  // Canonicalise a bare URL to #/home so the first nav state is shareable
  if (!location.hash) { location.replace('#/home'); }

  route();
  // Note: no initial applyTorch() — the CSS defaults (centered 50%/42%) hold
  // until the first real mouse move, so the spotlight starts centred.
})();
