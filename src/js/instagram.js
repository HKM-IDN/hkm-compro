/**
 * instagram.js — skeleton + pelacakan tampilan feed Lightwidget.
 *
 * Menggantikan useState/useEffect/useRef di components/social/InstagramFeed.js.
 * Hanya dimuat kalau mode Sanity = lightwidget.
 */
(function () {
  'use strict';

  const feed = document.querySelector('[data-ig-feed]');
  if (!feed) return;

  const iframe = feed.querySelector('[data-ig-iframe]');
  const skeleton = feed.querySelector('[data-ig-skeleton]');

  // ── Tampilkan iframe setelah termuat ──────────────────────────────────────
  if (iframe) {
    let done = false;

    function reveal() {
      if (done) return;
      done = true;
      iframe.style.opacity = '1';
      if (skeleton) skeleton.remove();
    }

    iframe.addEventListener('load', reveal, { once: true });

    // Jaring pengaman: Lightwidget kadang tidak memicu onload sama sekali.
    // Sama seperti versi React — buka paksa setelah 3 detik.
    setTimeout(reveal, 3000);
  }

  // ── Event GA saat feed pertama kali masuk layar ───────────────────────────
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'instagram_feed_view', { event_category: 'social' });
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(feed);
})();
