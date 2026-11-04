/**
 * service-points.js — filter + badge status buka di /service-points.
 *
 * Menggantikan useState/useMemo di ServicePointsContent.js.
 *
 * Semua kartu sudah ada di HTML (ditulis saat build). JS di sini hanya:
 *  1. Menyembunyikan kartu yang tidak cocok dengan search / chip wilayah.
 *  2. Mengisi badge "Buka Sekarang / Tutup / Buka jam X" — tergantung jam
 *     saat ini di Asia/Jakarta, jadi memang harus dihitung di browser.
 *
 * Pilihan wilayah ditulis ke URL (?region=jawa) supaya bisa di-share.
 */
(function () {
  'use strict';

  const root = document.querySelector('[data-sp-root]');
  if (!root) return;

  // ── Badge status buka ─────────────────────────────────────────────────────

  let labels = { openNow: 'Open Now', closedNow: 'Closed', opensAt: 'Opens {time}' };
  const labelsEl = root.querySelector('[data-sp-labels]');
  if (labelsEl) {
    try {
      labels = JSON.parse(labelsEl.textContent);
    } catch {
      /* pakai default */
    }
  }

  // Nama hari → nilai getDay() (0 = Minggu). Disalin dari versi React.
  const DAY_MAP = {
    sun: 0,
    minggu: 0,
    sunday: 0,
    mon: 1,
    senin: 1,
    monday: 1,
    tue: 2,
    selasa: 2,
    tuesday: 2,
    wed: 3,
    rabu: 3,
    wednesday: 3,
    thu: 4,
    kamis: 4,
    thursday: 4,
    fri: 5,
    jumat: 5,
    friday: 5,
    sat: 6,
    sabtu: 6,
    saturday: 6,
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Port langsung parseOpenStatus() — hasil: {status, opensAt} atau null. */
  function parseOpenStatus(raw, now) {
    if (!raw) return null;

    const timeMatch = raw.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;

    const openH = parseInt(timeMatch[1], 10);
    const openM = parseInt(timeMatch[2], 10);
    const closeH = parseInt(timeMatch[3], 10);
    const closeM = parseInt(timeMatch[4], 10);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const opensAtStr = pad(openH) + ':' + pad(openM);

    const todayDay = now.getDay();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Rentang hari opsional, mis. "Mon-Fri"
    const dayRangeMatch = raw.match(/([a-zA-Z]+)\s*[-–]\s*([a-zA-Z]+)/);
    if (dayRangeMatch) {
      const a = dayRangeMatch[1].toLowerCase();
      const b = dayRangeMatch[2].toLowerCase();
      const startDay = DAY_MAP[a.slice(0, 3)] ?? DAY_MAP[a];
      const endDay = DAY_MAP[b.slice(0, 3)] ?? DAY_MAP[b];

      if (startDay !== undefined && endDay !== undefined) {
        const inRange =
          startDay <= endDay
            ? todayDay >= startDay && todayDay <= endDay
            : todayDay >= startDay || todayDay <= endDay;
        if (!inRange) return { status: 'closed', opensAt: opensAtStr };
      }
    }

    if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) return { status: 'open' };
    if (nowMinutes < openMinutes) return { status: 'opens-at', opensAt: opensAtStr };
    return { status: 'closed', opensAt: opensAtStr };
  }

  // Waktu Jakarta saat ini — dihitung sekali untuk semua kartu
  const jakartaNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

  const STATUS_CFG = {
    open: { color: '#00FF7F', label: labels.openNow },
    closed: { color: '#FF4D4D', label: labels.closedNow },
    'opens-at': { color: '#FFB020', label: labels.opensAt },
  };

  root.querySelectorAll('[data-open-status]').forEach(function (el) {
    const result = parseOpenStatus(el.dataset.hours, jakartaNow);
    if (!result) return;

    const cfg = STATUS_CFG[result.status];
    const dot = el.querySelector('[data-open-dot]');
    const label = el.querySelector('[data-open-label]');

    if (dot) {
      dot.style.background = cfg.color;
      dot.style.boxShadow = '0 0 8px ' + cfg.color;
    }
    if (label) {
      label.textContent =
        result.status === 'opens-at' ? cfg.label.replace('{time}', result.opensAt) : cfg.label;
    }
    el.hidden = false;
  });

  // ── Filter search + wilayah ───────────────────────────────────────────────

  const bar = root.querySelector('[data-sp-filter]');
  const search = root.querySelector('[data-sp-search]');
  const grid = root.querySelector('[data-sp-grid]');
  const empty = root.querySelector('[data-sp-empty]');
  const countEl = root.querySelector('[data-sp-count]');
  if (!bar || !grid) return;

  const chips = Array.prototype.slice.call(bar.querySelectorAll('[data-sp-region]'));
  const cards = Array.prototype.slice.call(grid.querySelectorAll('[data-sp-card]'));
  const styleActive = bar.dataset.chipActive;
  const styleIdle = bar.dataset.chipIdle;

  let activeRegion = 'all';

  function apply() {
    const q = (search ? search.value : '').toLowerCase().trim();
    let visible = 0;

    cards.forEach(function (card) {
      const matchRegion = activeRegion === 'all' || card.dataset.region === activeRegion;
      const match = matchRegion && (!q || (card.dataset.search || '').indexOf(q) !== -1);
      card.hidden = !match;
      if (match) visible++;
    });

    chips.forEach(function (chip) {
      const on = chip.dataset.spRegion === activeRegion;
      chip.setAttribute('style', on ? styleActive : styleIdle);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    if (countEl) countEl.textContent = String(visible);
    // Sama seperti React: grid diganti empty state kalau tidak ada hasil
    grid.hidden = visible === 0;
    if (empty) empty.hidden = visible !== 0;
  }

  function setRegion(value, updateUrl) {
    activeRegion = value;
    apply();
    if (!updateUrl) return;
    const url = new URL(window.location.href);
    if (value === 'all') url.searchParams.delete('region');
    else url.searchParams.set('region', value);
    window.history.replaceState(null, '', url);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setRegion(chip.dataset.spRegion, true);
    });
  });

  if (search) search.addEventListener('input', apply);

  // Pulihkan wilayah dari URL
  const initial = new URL(window.location.href).searchParams.get('region');
  if (
    initial &&
    chips.some(function (c) {
      return c.dataset.spRegion === initial;
    })
  ) {
    setRegion(initial, false);
  } else if (search && search.value) {
    // Browser bisa memulihkan isi input saat tombol back ditekan
    apply();
  }
})();
