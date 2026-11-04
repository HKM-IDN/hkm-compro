/**
 * map.js — peta service point, Google Maps JS API langsung.
 *
 * Menggantikan @react-google-maps/api (paket React-only, ±80 KB).
 *
 * Alurnya:
 *  1. Baca konfigurasi + data marker dari <script type="application/json">
 *     yang ditulis saat build. Tidak ada fetch ke Sanity dari browser.
 *  2. Muat script Maps hanya SAAT peta mendekati layar (IntersectionObserver).
 *     Versi React memakai next/dynamic untuk ini; di sini jadi eksplisit —
 *     pengunjung yang tidak scroll sampai peta tidak mengunduh SDK sama sekali.
 *  3. Bikin peta, marker, dan InfoWindow secara imperatif.
 *
 * Kalau apa pun gagal (key ditolak, offline, SDK tidak termuat), fallback
 * bermerek HKM tetap tampil — bukan overlay error abu-abu milik Google.
 */
(function () {
  'use strict';

  const SCRIPT_ID = 'hkm-google-maps-sdk';
  let sdkPromise = null;

  // Semua peta di halaman ini, supaya gm_authFailure bisa menjangkau semuanya.
  const registry = [];

  /**
   * Google memanggil ini kalau API key ditolak (domain/billing/key salah).
   *
   * PENTING: handler dipasang SEKALI di sini, bukan di dalam promise loader.
   * Google memanggil callback sukses DULU, baru gm_authFailure. Kalau
   * penanganannya menumpang pada promise, promise sudah resolve duluan dan
   * reject-nya jadi no-op — hasilnya overlay "Oops! Something went wrong"
   * milik Google yang tampil, bukan fallback kita.
   */
  window.gm_authFailure = function () {
    registry.forEach(function (entry) {
      entry.fail('auth');
    });
  };

  /** Muat SDK Maps sekali saja, berapa pun jumlah peta di halaman. */
  function loadSdk(apiKey) {
    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise(function (resolve, reject) {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
        return;
      }

      const callbackName = '__hkmMapsReady';
      window[callbackName] = function () {
        delete window[callbackName];
        resolve(window.google.maps);
      };

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=' +
        encodeURIComponent(apiKey) +
        '&callback=' +
        callbackName;
      script.onerror = function () {
        reject(new Error('network'));
      };
      document.head.appendChild(script);
    });

    return sdkPromise;
  }

  function readJson(root, selector) {
    const el = root.querySelector(selector);
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch {
      return null;
    }
  }

  /** Isi InfoWindow — versi DOM dari renderHomepageInfoWindow() di React. */
  function infoWindowContent(point, config) {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'font-family:Inter,sans-serif;min-width:160px;max-width:220px;padding:4px 2px';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:flex-start;gap:6px;margin-bottom:8px';

    const name = document.createElement('p');
    name.style.cssText =
      'font-weight:700;font-size:13px;color:#0A0B0E;line-height:1.3;margin:0;flex:1';
    name.textContent = point.name; // textContent → aman dari HTML injection
    row.appendChild(name);

    if (point.hq) {
      const badge = document.createElement('span');
      badge.style.cssText =
        'background:#0066ff;color:#fff;font-size:9px;font-weight:600;padding:2px 5px;' +
        'border-radius:4px;white-space:nowrap;flex-shrink:0';
      badge.textContent = 'HQ';
      row.appendChild(badge);
    }

    const link = document.createElement('a');
    link.href = config.servicePointsUrl;
    link.style.cssText =
      'display:inline-flex;align-items:center;gap:4px;background:#0066ff;color:#fff;' +
      'font-size:11px;font-weight:600;padding:5px 10px;border-radius:5px;text-decoration:none';
    link.textContent = config.viewAllLabel;

    wrap.appendChild(row);
    wrap.appendChild(link);
    return wrap;
  }

  function initMap(root) {
    const config = readJson(root, '[data-map-config]');
    const points = readJson(root, '[data-map-points]') || [];
    const canvas = root.querySelector('[data-map-canvas]');
    const fallback = root.querySelector('[data-map-fallback]');

    if (!config || !canvas) return;

    let failed = false;

    /** Tampilkan fallback HKM, sembunyikan canvas (termasuk overlay Google). */
    function fail(kind) {
      if (failed) return;
      failed = true;

      const msg = fallback && fallback.querySelector('[data-map-fallback-msg]');
      if (msg) {
        msg.textContent = kind === 'auth' ? config.authErrorLabel : config.loadErrorLabel;
      }
      // canvas disembunyikan, bukan dikosongkan: Google menempelkan overlay
      // error-nya ke dalam canvas, jadi menyembunyikan canvas ikut menutupinya.
      canvas.hidden = true;
      if (fallback) fallback.hidden = false;
    }

    registry.push({ fail: fail });

    loadSdk(config.apiKey)
      .then(function (maps) {
        if (failed) return; // auth sudah gagal sebelum SDK selesai

        canvas.hidden = false;
        if (fallback) fallback.hidden = true;

        const map = new maps.Map(canvas, {
          center: config.center,
          zoom: config.zoom,
          styles: config.styles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'cooperative',
        });

        const anchor = new maps.Point(12, 22);
        const icons = {
          default: {
            path: config.pinPath,
            fillColor: '#00ffff',
            fillOpacity: 1,
            strokeColor: '#0066ff',
            strokeWeight: 1.5,
            scale: 1.4,
            anchor: anchor,
          },
          hq: {
            path: config.pinPath,
            fillColor: '#0066ff',
            fillOpacity: 1,
            strokeColor: '#00ffff',
            strokeWeight: 1.5,
            scale: 1.7,
            anchor: anchor,
          },
        };

        // Satu InfoWindow dipakai ulang — buka di marker mana pun yang diklik.
        const infoWindow = new maps.InfoWindow({
          pixelOffset: new maps.Size(0, -36),
        });

        points.forEach(function (point) {
          const marker = new maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: map,
            title: point.name,
            icon: icons[point.hq ? 'hq' : 'default'],
          });

          marker.addListener('click', function () {
            infoWindow.setContent(infoWindowContent(point, config));
            infoWindow.open({ anchor: marker, map: map });
          });
        });

        map.addListener('click', function () {
          infoWindow.close();
        });

        root.dispatchEvent(
          new CustomEvent('hkm:map-ready', { bubbles: true, detail: { map: map } })
        );
      })
      .catch(function () {
        fail('load');
      });
  }

  // ── Muat peta hanya saat mendekati layar ────────────────────────────────
  const maps = document.querySelectorAll('[data-map]');
  if (!maps.length) return;

  if (!('IntersectionObserver' in window)) {
    maps.forEach(initMap);
    return;
  }

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        initMap(entry.target);
      });
    },
    { rootMargin: '300px' } // mulai memuat sebelum benar-benar terlihat
  );

  maps.forEach(function (el) {
    io.observe(el);
  });
})();
