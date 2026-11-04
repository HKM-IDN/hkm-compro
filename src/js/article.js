/**
 * article.js — tombol "copy link" di /news/[slug].
 *
 * Menggantikan onClick di ArticleContent.js. Link share Twitter/LinkedIn
 * sudah berisi URL kanonik sejak build, jadi tidak perlu JS.
 */
(function () {
  'use strict';

  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    const original = btn.getAttribute('title') || '';
    const originalColor = btn.style.color;

    btn.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(window.location.href).then(function () {
        // Umpan balik kecil: ikon jadi cyan + title berubah selama 1,5 detik
        const done = btn.dataset.copiedLabel || original;
        btn.style.color = '#00ffff';
        btn.setAttribute('title', done);
        btn.setAttribute('aria-label', done);
        setTimeout(function () {
          btn.style.color = originalColor;
          btn.setAttribute('title', original);
          btn.setAttribute('aria-label', original);
        }, 1500);
      });
    });
  });
})();
