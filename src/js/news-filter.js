/**
 * news-filter.js — filter kategori + urutan di /news.
 *
 * Menggantikan useState/useMemo di NewsContent.js.
 *
 * Semua artikel sudah ada di HTML (urutan terbaru dulu). Skrip ini hanya:
 *  - menyembunyikan kartu yang kategorinya tidak cocok (element.hidden)
 *  - membalik urutan lewat CSS `order` saat "Oldest First" (node DOM tidak dipindah)
 *  - menyusun ulang varian gradient thumbnail sesuai posisi tampil,
 *    seperti React yang menghitungnya dari indeks daftar terfilter
 *
 * Pilihan kategori ditulis ke URL (?cat=product) seperti filter.js.
 */
(function () {
  'use strict';

  const bar = document.querySelector('[data-news-filter-bar]');
  const grid = document.querySelector('[data-news-grid]');
  if (!bar) return;

  const chips = [...bar.querySelectorAll('[data-news-filter]')];
  const sortSelect = bar.querySelector('[data-news-sort]');
  const cards = grid ? [...grid.querySelectorAll('[data-news-card]')] : [];
  const emptyState = document.querySelector('[data-news-empty]');

  // Harus sama dengan THUMB_VARIANTS di build/content/news.mjs
  const THUMB_VARIANTS = [
    'radial-gradient(circle at 30% 40%, rgba(0,255,255,0.25), transparent 60%), linear-gradient(135deg, #2e2e2e, #141414)',
    'radial-gradient(circle at 70% 30%, rgba(0,102,255,0.3), transparent 60%), linear-gradient(135deg, #262626, #2e2e2e)',
    'radial-gradient(circle at 50% 60%, rgba(45,212,255,0.25), transparent 60%), linear-gradient(135deg, #2e2e2e, #262626)',
    'radial-gradient(circle at 40% 50%, rgba(0,200,255,0.28), transparent 60%), linear-gradient(135deg, #262626, #141414)',
    'radial-gradient(circle at 60% 40%, rgba(0,150,255,0.3), transparent 60%), linear-gradient(135deg, #2e2e2e, #262626)',
    'radial-gradient(circle at 50% 30%, rgba(0,255,255,0.2), transparent 60%), linear-gradient(135deg, #141414, #2e2e2e)',
  ];

  // Style chip — sama dengan build/pages/news.mjs
  const ACTIVE = { bg: '#0066ff', border: '#0066ff', color: '#fff' };
  const IDLE = { bg: '#262626', border: 'rgba(255,255,255,0.10)', color: '#E2E7EF' };

  let category = 'all';
  let sort = 'newest';

  function apply(updateUrl) {
    const total = cards.length;

    // Kartu yang lolos filter, dalam urutan tampil
    const visible = cards.filter(function (card) {
      const match = category === 'all' || card.dataset.category === category;
      card.hidden = !match;
      return match;
    });
    if (sort === 'oldest') visible.reverse();

    visible.forEach(function (card, i) {
      const idx = Number(card.dataset.index) || 0;
      card.style.order = sort === 'oldest' ? String(total - idx) : '';
      const thumb = card.querySelector('[data-thumb]');
      if (thumb) thumb.style.background = THUMB_VARIANTS[i % THUMB_VARIANTS.length];
    });

    chips.forEach(function (chip) {
      const active = chip.dataset.newsFilter === category;
      const s = active ? ACTIVE : IDLE;
      chip.style.background = s.bg;
      chip.style.borderColor = s.border;
      chip.style.color = s.color;
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const empty = visible.length === 0;
    if (emptyState) emptyState.hidden = !empty;
    if (grid) grid.hidden = empty;

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (category === 'all') url.searchParams.delete('cat');
      else url.searchParams.set('cat', category);
      window.history.replaceState(null, '', url);
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      category = chip.dataset.newsFilter;
      apply(true);
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sort = sortSelect.value === 'oldest' ? 'oldest' : 'newest';
      apply(false);
    });
    // Browser bisa memulihkan pilihan <select> saat back/forward
    if (sortSelect.value === 'oldest') sort = 'oldest';
  }

  // Pulihkan filter dari URL saat halaman dibuka
  const initial = new URL(window.location.href).searchParams.get('cat');
  if (
    initial &&
    chips.some(function (c) {
      return c.dataset.newsFilter === initial;
    })
  ) {
    category = initial;
  }
  if (category !== 'all' || sort !== 'newest') apply(false);
})();
