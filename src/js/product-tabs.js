/**
 * product-tabs.js — tab Ikhtisar / Spesifikasi / Dukungan di halaman produk.
 *
 * Menggantikan useState di components/products/ProductDetail.js.
 *
 * Bedanya mendasar dari versi React:
 *   React hanya me-render tab yang aktif, jadi isi Spesifikasi & Dukungan
 *   tidak pernah ada di HTML dan tidak pernah terbaca mesin pencari.
 *   Di sini ketiga panel ada di HTML; skrip ini yang menyembunyikan dua
 *   di antaranya. Kalau JS gagal dimuat, semua panel tetap tampil —
 *   halaman jadi panjang, tapi isinya utuh.
 *
 * Tab aktif juga ditulis ke URL (#tab-specs) supaya bisa di-share dan
 * tombol back berfungsi.
 */
(function () {
  'use strict';

  const nav = document.querySelector('[data-product-tabs]');
  const panels = [...document.querySelectorAll('[data-panel]')];
  if (!nav || !panels.length) return;

  const tabLinks = [...nav.querySelectorAll('[data-tab]')];
  const VALID = panels.map(function (p) {
    return p.dataset.panel;
  });

  function setTab(key, opts) {
    const options = opts || {};
    if (VALID.indexOf(key) === -1) key = VALID[0];

    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== key;
    });

    tabLinks.forEach(function (link) {
      const active = link.dataset.tab === key;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-current', active ? 'true' : 'false');
    });

    if (options.scrollTop) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }

    if (options.updateHash) {
      history.replaceState({ tab: key }, '', '#tab-' + key);
    }
  }

  tabLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      setTab(link.dataset.tab, { scrollTop: true, updateHash: true });
    });
  });

  // Link seperti "#buy" atau "#features" yang hanya ada di panel Ikhtisar:
  // pindah dulu ke panel itu, baru biarkan browser melompat ke anchor-nya.
  document.querySelectorAll('[data-tab-goto]').forEach(function (el) {
    el.addEventListener('click', function () {
      setTab(el.dataset.tabGoto);
    });
  });

  // Pulihkan tab dari URL saat halaman dibuka (#tab-specs)
  const fromHash = (window.location.hash.match(/^#tab-(\w+)/) || [])[1];
  setTab(fromHash || VALID[0]);
})();
