/**
 * main.js — JS global, dimuat di semua halaman.
 *
 * Menggantikan komponen React: Nav (drawer mobile) + ScrollToTop.
 * Vanilla murni, tanpa dependency. Dimuat dengan `defer`.
 *
 * Pola yang dipakai: elemen ditandai dengan data-attribute di HTML
 * (data-nav-open, data-nav-drawer, dst), JS cuma mencari dan memasang
 * listener. Kalau elemennya tidak ada, fungsinya diam saja — jadi satu
 * file ini aman dipakai di halaman mana pun.
 */
(function () {
  'use strict';

  // ── Drawer navigasi mobile ────────────────────────────────────────────────
  function initNavDrawer() {
    const drawer = document.querySelector('[data-nav-drawer]');
    const backdrop = document.querySelector('[data-nav-backdrop]');
    const openBtn = document.querySelector('[data-nav-open]');
    const closeBtn = document.querySelector('[data-nav-close]');

    if (!drawer || !openBtn) return;

    let isOpen = false;
    let lastFocused = null;

    function open() {
      if (isOpen) return;
      isOpen = true;
      lastFocused = document.activeElement;

      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
      drawer.removeAttribute('inert');
      if (backdrop) backdrop.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');

      // Cegah body scroll saat drawer terbuka
      document.body.style.overflow = 'hidden';

      // Pindahkan fokus ke tombol tutup (aksesibilitas)
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;

      drawer.classList.add('translate-x-full');
      drawer.classList.remove('translate-x-0');
      drawer.setAttribute('inert', '');
      if (backdrop) backdrop.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');

      document.body.style.overflow = '';

      // Kembalikan fokus ke tombol pembuka
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    // Esc menutup drawer (sama seperti useEffect di versi React)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });

    // Klik link di dalam drawer → tutup (navigasi tetap jalan)
    drawer.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', close);
    });

    // Kalau viewport membesar ke desktop, pastikan drawer tertutup
    const mq = window.matchMedia('(min-width: 980px)');
    mq.addEventListener('change', function (e) {
      if (e.matches) close();
    });
  }

  // ── Tombol kembali ke atas ────────────────────────────────────────────────
  function initScrollToTop() {
    const btn = document.querySelector('[data-scroll-top]');
    if (!btn) return;

    const THRESHOLD = 400;
    let ticking = false;

    function update() {
      btn.hidden = window.scrollY <= THRESHOLD;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );

    btn.addEventListener('click', function () {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });

    update();
  }

  // ── Video feature section: play saat masuk viewport ───────────────────────
  // Menggantikan IntersectionObserver di MediaSlot.js
  function initLazyVideo() {
    const videos = document.querySelectorAll('video[data-lazy-play]');
    if (!videos.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // hormati preferensi; poster tetap tampil

    if (!('IntersectionObserver' in window)) {
      videos.forEach(function (v) {
        v.play().catch(function () {});
      });
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const v = entry.target;
          if (entry.isIntersecting) {
            v.play().catch(function () {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    videos.forEach(function (v) {
      io.observe(v);

      // Cross-fade poster → video setelah frame pertama siap
      function reveal() {
        v.classList.add('is-loaded');
        const poster = v.parentElement && v.parentElement.querySelector('[data-video-poster]');
        if (poster) poster.classList.add('is-hidden');
      }
      if (v.readyState >= 2) reveal();
      else v.addEventListener('loadeddata', reveal, { once: true });
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  initNavDrawer();
  initScrollToTop();
  initLazyVideo();
})();
