/**
 * filter.js — filter kategori di /products.
 *
 * Menggantikan useState di ProductsContent.js.
 *
 * Prinsipnya beda dari versi React: SEMUA kategori sudah ada di HTML.
 * JS di sini cuma menyembunyikan/menampilkan. Konsekuensinya:
 *  - Google membaca seluruh katalog (dulu cuma kategori aktif).
 *  - Kalau JS gagal dimuat, semua produk tetap tampil.
 *  - Filter instan, tidak ada re-render.
 *
 * Pilihan filter juga ditulis ke URL (?cat=ip-camera) supaya bisa
 * di-share dan tetap utuh saat tombol back ditekan.
 */
(function () {
  'use strict';

  const bar = document.querySelector('[data-filter-bar]');
  const list = document.querySelector('[data-category-list]');
  if (!bar || !list) return;

  const chips = [...bar.querySelectorAll('[data-filter]')];
  const blocks = [...list.querySelectorAll('[data-category]')];
  const emptyState = list.querySelector('[data-empty-state]');

  function apply(value, { updateUrl = true } = {}) {
    let visible = 0;

    blocks.forEach(function (block) {
      const match = value === 'all' || block.dataset.category === value;
      block.hidden = !match;
      if (match) visible++;
    });

    chips.forEach(function (chip) {
      const active = chip.dataset.filter === value;
      chip.classList.toggle('is-active', active);
      chip.classList.toggle('text-hkm-100', !active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (emptyState) emptyState.hidden = visible !== 0;

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (value === 'all') url.searchParams.delete('cat');
      else url.searchParams.set('cat', value);
      window.history.replaceState({ filter: value }, '', url);
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      apply(chip.dataset.filter);
    });
  });

  // Pulihkan filter dari URL saat halaman dibuka
  const initial = new URL(window.location.href).searchParams.get('cat');
  if (
    initial &&
    chips.some(function (c) {
      return c.dataset.filter === initial;
    })
  ) {
    apply(initial, { updateUrl: false });
  }
})();
