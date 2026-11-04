/**
 * careers.js — interaksi halaman /careers dan /careers/[slug].
 *
 * Menggantikan useState di CareersContent.js + JobDetailContent.js:
 *  1. "Posted X ago" dihitung ulang saat halaman dibuka (HTML berisi nilai
 *     saat build sebagai fallback).
 *  2. Filter departemen di /careers — semua kartu sudah ada di HTML,
 *     di sini hanya disembunyikan/ditampilkan.
 *  3. Form lamaran di /careers/[slug] — validasi, lalu buka mailto: ke
 *     email HR (perilaku asli versi React), tampilkan kartu sukses.
 *  4. Tombol salin link.
 */
(function () {
  'use strict';

  // ── 1. Posted X ago ─────────────────────────────────────────────────────
  // Logika sama dengan postedAgo() di build/content/careers.mjs — ubah keduanya.
  function postedAgo(dateStr, lang) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    const weeks = Math.floor(days / 7);
    const fmt = function (locale) {
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    };
    if (lang === 'id') {
      if (days <= 0) return 'Hari ini';
      if (days < 7) return days + ' hari lalu';
      if (weeks < 5) return weeks + ' minggu lalu';
      return fmt('id-ID');
    }
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return days + ' days ago';
    if (weeks === 1) return '1 week ago';
    if (weeks < 5) return weeks + ' weeks ago';
    return fmt('en-US');
  }

  document.querySelectorAll('[data-posted]').forEach(function (el) {
    const text = postedAgo(el.dataset.posted, el.dataset.lang);
    if (text) el.textContent = text;
  });

  // ── 2. Filter departemen ────────────────────────────────────────────────
  const bar = document.querySelector('[data-careers-filter]');
  const list = document.querySelector('[data-careers-list]');
  if (bar && list) {
    const chips = Array.prototype.slice.call(bar.querySelectorAll('[data-dept-filter]'));
    const cards = Array.prototype.slice.call(list.querySelectorAll('[data-dept]'));
    const empty = list.querySelector('[data-careers-empty]');
    // Simpan style dasar tiap chip (tanpa bagian state) sekali di awal
    const activeCss = bar.dataset.chipActive;
    const idleCss = bar.dataset.chipIdle;
    chips.forEach(function (chip) {
      const css = chip.getAttribute('style') || '';
      chip.dataset.baseCss = css.replace(activeCss, '').replace(idleCss, '');
    });

    const apply = function (value) {
      let visible = 0;
      cards.forEach(function (card) {
        const match = value === 'all' || card.dataset.dept === value;
        card.hidden = !match;
        // hidden kalah oleh display:grid inline → set display juga
        card.style.display = match ? 'grid' : 'none';
        if (match) visible++;
      });
      chips.forEach(function (chip) {
        const active = chip.dataset.deptFilter === value;
        chip.setAttribute('style', chip.dataset.baseCss + (active ? activeCss : idleCss));
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (empty) empty.hidden = visible !== 0;
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        apply(chip.dataset.deptFilter);
      });
    });
  }

  // ── 3. Form lamaran (mailto) ────────────────────────────────────────────
  const form = document.querySelector('[data-apply-form]');
  if (form) {
    const card = document.querySelector('[data-apply-card]');
    const success = document.querySelector('[data-apply-success]');

    const setError = function (name, message) {
      const input = form.elements[name];
      const box = form.querySelector('[data-error-for="' + name + '"]');
      if (!input) return;
      input.classList.toggle('border-red-400', !!message);
      input.classList.toggle('border-white/10', !message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message) input.setAttribute('aria-describedby', input.id + '-error');
      else input.removeAttribute('aria-describedby');
      if (box) {
        box.textContent = message || '';
        box.hidden = !message;
      }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(form);
      const val = function (k) {
        return String(fd.get(k) || '').trim();
      };
      const d = form.dataset;

      const errs = {};
      if (!val('name')) errs.name = d.errName;
      const emailVal = val('email');
      if (!emailVal) errs.email = d.errEmail;
      else if (!/\S+@\S+\.\S+/.test(emailVal)) errs.email = d.errEmailFormat;
      if (!val('phone')) errs.phone = d.errPhone;

      ['name', 'email', 'phone'].forEach(function (k) {
        setError(k, errs[k]);
      });
      if (Object.keys(errs).length) return;

      const body = [
        'Position: ' + d.title,
        'Name: ' + (fd.get('name') || ''),
        'Email: ' + (fd.get('email') || ''),
        'Phone/WhatsApp: ' + (fd.get('phone') || ''),
        fd.get('location') && 'Current Location: ' + fd.get('location'),
        fd.get('why') && 'Why HKM: ' + fd.get('why'),
      ]
        .filter(Boolean)
        .join('\n');

      window.location.href =
        'mailto:' +
        d.email +
        '?subject=Application: ' +
        encodeURIComponent(d.title) +
        '&body=' +
        encodeURIComponent(body);

      if (card) card.hidden = true;
      if (success) success.hidden = false;
    });
  }

  // ── 4. Salin link ───────────────────────────────────────────────────────
  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
    });
  });
})();
