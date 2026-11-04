/**
 * lightbox.js — galeri produk layar penuh.
 *
 * Menggantikan useState/useEffect di components/ui/ImageZoom.js.
 *
 * Overlay sudah ada di HTML (tersembunyi). Skrip ini hanya:
 *  - membuka/menutup
 *  - mengganti src gambar + penghitung
 *  - menangani Esc / ← / →
 *  - mengunci scroll body selama terbuka
 *  - mengembalikan fokus ke thumbnail yang diklik saat ditutup
 */
(function () {
  'use strict';

  const root = document.querySelector('[data-gallery]');
  if (!root) return;

  const overlay = root.querySelector('[data-gallery-lightbox]');
  const imageEl = root.querySelector('[data-gallery-image]');
  const counter = root.querySelector('[data-gallery-counter]');
  const closeBtn = root.querySelector('[data-gallery-close]');
  const prevBtn = root.querySelector('[data-gallery-prev]');
  const nextBtn = root.querySelector('[data-gallery-next]');
  const thumbs = [...root.querySelectorAll('[data-gallery-item]')];

  let images = [];
  try {
    const dataEl = root.querySelector('[data-gallery-data]');
    images = dataEl ? JSON.parse(dataEl.textContent) : [];
  } catch {
    return;
  }

  if (!overlay || !imageEl || !images.length) return;

  let index = 0;
  let lastFocused = null;

  function show(i) {
    index = (i + images.length) % images.length;
    const img = images[index];
    imageEl.src = img.src;
    imageEl.alt = img.alt || '';
    if (counter) counter.textContent = index + 1 + ' / ' + images.length;
  }

  function open(i) {
    lastFocused = document.activeElement;
    show(i);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    // Kosongkan src supaya gambar besar tidak menahan memori
    imageEl.src = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  thumbs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      open(Number(btn.dataset.galleryItem) || 0);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      show(index - 1);
    });
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      show(index + 1);
    });

  // Klik latar (bukan gambar / tombol) menutup
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
})();
