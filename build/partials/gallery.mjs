/**
 * gallery.mjs — port dari components/ui/ImageZoom.js
 *
 * Grid thumbnail + lightbox layar penuh (Esc / ← / →).
 *
 * Perbedaan dari versi React:
 *  - useState open/index + useEffect keyboard → src/js/lightbox.js.
 *  - Overlay lightbox dirender SEKALI di HTML (tersembunyi), bukan dibuat
 *    ulang tiap kali dibuka. JS hanya mengganti src gambar di dalamnya.
 *  - Thumbnail dimuat pada ukuran kecil (300px), gambar besar (900px)
 *    baru diunduh saat lightbox dibuka — versi React memuat ukuran penuh
 *    untuk thumbnail juga.
 *  - Ikon lucide-react diganti inline SVG.
 */
import { html, raw, jsonScript } from '../html.mjs';

const ICON_ZOOM = html`<svg
  width="22"
  height="22"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  class="text-white"
  aria-hidden="true"
>
  <circle cx="11" cy="11" r="8" />
  <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
</svg>`;

const ICON_X = html`<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  aria-hidden="true"
>
  <path d="M18 6 6 18M6 6l12 12" />
</svg>`;

const ICON_PREV = html`<svg
  width="28"
  height="28"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  aria-hidden="true"
>
  <path d="m15 18-6-6 6-6" />
</svg>`;

const ICON_NEXT = html`<svg
  width="28"
  height="28"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  aria-hidden="true"
>
  <path d="m9 18 6-6-6-6" />
</svg>`;

const CTRL_CLASS =
  'absolute flex items-center justify-center w-11 h-11 rounded-full text-white ' +
  'bg-white/10 hover:bg-white/20 border border-white/20 transition-colors cursor-pointer';

/**
 * @param {object} opts
 * @param {Array}  opts.images  [{ src, thumb, alt }]
 * @param {string} opts.lang
 */
export function gallery({ images = [], lang = 'en' }) {
  if (!images.length) return raw('');

  const L =
    lang === 'id'
      ? { view: 'Lihat gambar', close: 'Tutup', prev: 'Sebelumnya', next: 'Berikutnya' }
      : { view: 'View image', close: 'Close', prev: 'Previous', next: 'Next' };

  const multiple = images.length > 1;

  return html`
    <div data-gallery>
      <!-- Grid thumbnail -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        ${images.map(
          (img, i) =>
            html`<button
              type="button"
              data-gallery-item="${i}"
              class="group relative overflow-hidden rounded-[10px] cursor-zoom-in"
              style="aspect-ratio:4/3;background:#131419;border:1px solid rgba(255,255,255,0.06)"
              aria-label="${L.view} ${i + 1}"
            >
              <img
                src="${img.thumb || img.src}"
                alt="${img.alt || ''}"
                loading="lazy"
                decoding="async"
                class="absolute inset-0 w-full h-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
              />
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style="background:rgba(0,0,0,0.4)"
              >
                ${ICON_ZOOM}
              </div>
            </button>`
        )}
      </div>

      <!-- Lightbox: satu overlay dipakai ulang, tidak dibuat ulang tiap buka -->
      <div
        data-gallery-lightbox
        hidden
        role="dialog"
        aria-modal="true"
        aria-label="${L.view}"
        class="fixed inset-0 z-[300] flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.92);backdrop-filter:blur(8px)"
      >
        <button
          type="button"
          data-gallery-close
          aria-label="${L.close}"
          class="${CTRL_CLASS}"
          style="top:16px;right:16px"
        >
          ${ICON_X}
        </button>

        ${multiple
          ? html`<button
                type="button"
                data-gallery-prev
                aria-label="${L.prev}"
                class="${CTRL_CLASS}"
                style="left:16px;top:50%;transform:translateY(-50%)"
              >
                ${ICON_PREV}
              </button>
              <button
                type="button"
                data-gallery-next
                aria-label="${L.next}"
                class="${CTRL_CLASS}"
                style="right:16px;top:50%;transform:translateY(-50%)"
              >
                ${ICON_NEXT}
              </button>`
          : raw('')}

        <img
          data-gallery-image
          src=""
          alt=""
          class="max-w-full max-h-full object-contain"
          decoding="async"
        />

        ${multiple
          ? html`<p
              data-gallery-counter
              class="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[12px] text-hkm-300"
            ></p>`
          : raw('')}
      </div>

      <script type="application/json" data-gallery-data>
        ${jsonScript(images.map((i) => ({ src: i.src, alt: i.alt || '' })))}
      </script>
    </div>
  `;
}
