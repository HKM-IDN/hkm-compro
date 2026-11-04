/**
 * map.mjs — container peta service point.
 *
 * Port dari components/maps/MapWithMarkers.js. Pembagian tugasnya:
 *
 *   DI SINI (build)   → container, data titik sebagai JSON, markup fallback
 *   src/js/map.js     → muat Google Maps API, bikin peta + marker + popup
 *
 * Kenapa dipisah: paket @react-google-maps/api hanya jalan di React, dan
 * versi 2.20.x punya bug — komponen <Marker>-nya diam-diam gagal render di
 * Maps JS API v3.55+. Komentar di kode lama menyebut itu, dan solusinya di
 * sana adalah membuat marker secara imperatif. Versi vanilla memang sudah
 * imperatif sejak awal, jadi masalah itu hilang bersama paketnya.
 *
 * Fallback: kalau API key kosong atau Google menolak key-nya, yang tampil
 * adalah kartu statis dengan link ke Google Maps — bukan peta kosong.
 */
import { html, jsonScript } from '../html.mjs';
import { MAP_STYLES, PIN_PATH } from '../content/map-style.mjs';
import { langPath } from '../routes.mjs';

const FALLBACK_SEARCH_URL =
  'https://www.google.com/maps/search/HKM+Care+Service+Point/@-2.5,118.0,6z';

/** Markup fallback — dipakai saat API key tidak ada ATAU peta gagal dimuat. */
function mapFallback({ message, lang }) {
  return html`<div
    data-map-fallback
    class="w-full h-full flex flex-col items-center justify-center gap-3"
    style="background:linear-gradient(135deg,#1e1e1e,#262626)"
  >
    <div
      class="flex items-center justify-center"
      style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0066ff,#00ffff);box-shadow:0 0 32px rgba(0,102,255,0.30)"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>

    <p class="font-display text-[16px] font-bold text-white m-0">Indonesia Service Network</p>
    <p
      class="font-mono text-[11px] uppercase tracking-[0.1em] m-0"
      style="color:#00ffff"
      data-map-fallback-msg
    >
      ${message}
    </p>

    <a
      href="${FALLBACK_SEARCH_URL}"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono text-[11px] no-underline mt-1"
      style="color:#B8C5D9;border:1px solid rgba(255,255,255,0.12);border-radius:6px;padding:6px 14px"
      >${lang === 'id' ? 'Lihat di Google Maps →' : 'View on Google Maps →'}</a
    >
  </div>`;
}

/**
 * Render container peta.
 *
 * @param {object}   opts
 * @param {Array}    opts.points    service point (butuh coordinates.lat/lng)
 * @param {string}   opts.lang
 * @param {string}   opts.apiKey    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * @param {string}   opts.viewAllLabel teks tombol di dalam popup marker
 * @param {number}   opts.zoom
 */
export function serviceMap({ points = [], lang = 'en', apiKey, viewAllLabel, zoom = 5 }) {
  const mappable = points.filter((p) => p.coordinates?.lat && p.coordinates?.lng);

  const hasKey = Boolean(apiKey) && apiKey !== 'YOUR_KEY_HERE';

  // Tanpa API key, jangan kirim apa pun ke browser — langsung fallback.
  if (!hasKey) {
    return mapFallback({
      message: `${points.length} service points · API key pending`,
      lang,
    });
  }

  // Data marker dikirim sebagai JSON di dalam <script type="application/json">.
  // Hanya field yang dipakai peta — bukan seluruh dokumen Sanity.
  const markerData = mappable.map((p) => ({
    id: p._id,
    name: p.name,
    hq: Boolean(p.isHeadOffice),
    lat: p.coordinates.lat,
    lng: p.coordinates.lng,
  }));

  const config = {
    apiKey,
    zoom,
    center: { lat: -2.5, lng: 118.0 },
    styles: MAP_STYLES,
    pinPath: PIN_PATH,
    servicePointsUrl: langPath('/service-points', lang),
    viewAllLabel: viewAllLabel || (lang === 'id' ? 'Lihat Semua →' : 'View All →'),
    loadingLabel: lang === 'id' ? 'Memuat peta…' : 'Loading map…',
    // Dua pesan berbeda, sama seperti versi React: key ditolak vs gagal dimuat.
    // Yang pertama menyebut penyebab paling sering (domain belum didaftarkan),
    // supaya yang membaca langsung tahu harus ke mana.
    authErrorLabel: 'Map API key restricted · add localhost to Google Cloud Console → Credentials',
    loadErrorLabel: 'Map failed to load · check API key',
  };

  return html`<div class="relative w-full h-full" data-map>
    <!-- Terlihat sampai peta siap; disembunyikan JS setelah peta jadi -->
    ${mapFallback({ message: config.loadingLabel, lang })}

    <div data-map-canvas class="absolute inset-0" hidden></div>

    <script type="application/json" data-map-config>
      ${jsonScript(config)}
    </script>
    <script type="application/json" data-map-points>
      ${jsonScript(markerData)}
    </script>
  </div>`;
}
