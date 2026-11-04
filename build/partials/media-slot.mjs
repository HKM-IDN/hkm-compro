/**
 * media-slot.mjs — port dari components/products/detail/MediaSlot.js
 *
 * Satu slot yang bisa berisi gambar Sanity ATAU video produk yang berulang.
 *
 * Perbedaan dari versi React:
 *  - Empat useEffect (deteksi reduced-motion, race readyState, play/pause
 *    lewat IntersectionObserver, cross-fade poster) semuanya pindah ke
 *    src/js/main.js → initLazyVideo(). Markup di sini hanya menandai
 *    elemennya dengan data-attribute.
 *  - `prefers-reduced-motion` dulu dicek di browser lalu komponen berganti
 *    render. Di sini video dan poster SAMA-SAMA ada di HTML; CSS yang
 *    menyembunyikan video saat pengguna minta kurangi animasi. Hasilnya
 *    sama, tanpa pergantian render.
 */
import { html, raw, attrs } from '../html.mjs';
import { urlFor } from '../sanity.mjs';

const DROP_SHADOW = 'drop-shadow(0 16px 40px rgba(0,184,217,0.25))';

/** URL poster: pakai poster eksplisit, jatuh ke field image lama. */
function posterUrlOf(media) {
  if (media?.poster?.asset) return urlFor(media.poster).width(800).fit('max').url();
  if (media?.image?.asset) return urlFor(media.image).width(800).fit('max').url();
  return null;
}

function srcSetOf(source, widths = [400, 800, 1200]) {
  return widths.map((w) => `${urlFor(source).width(w).fit('max').url()} ${w}w`).join(', ');
}

/**
 * @param {object}  opts
 * @param {object}  opts.media    { type:'image'|'video', image?, mp4Url?, webmUrl?, poster? }
 * @param {string}  opts.alt      wajib untuk aksesibilitas
 * @param {string}  opts.sizes
 * @param {boolean} opts.priority true untuk hero (eager + autoplay)
 * @param {string}  opts.wrapStyle gaya tambahan untuk pembungkus inset
 */
export function mediaSlot({
  media,
  alt = '',
  sizes = '(max-width: 980px) 100vw, 50vw',
  priority = false,
  wrapStyle = '',
  imageStyle = '',
  videoStyle = '',
}) {
  const isVideo = media?.type === 'video' && Boolean(media?.mp4Url);
  const posterUrl = posterUrlOf(media);
  const insetStyle = `inset:10%;${wrapStyle}`;

  // ── Video ────────────────────────────────────────────────────────────────
  if (isVideo) {
    return html`<div class="relative w-full h-full" data-media-root>
      <div class="absolute z-[2]" style="${insetStyle}">
        <div class="relative w-full h-full">
          <video
            data-lazy-play
            class="media-video absolute inset-0 w-full h-full object-contain"
            loop
            muted
            playsinline
            width="800"
            height="600"
            ${attrs({
              autoplay: priority ? true : null,
              preload: priority ? 'auto' : 'metadata',
              poster: posterUrl || null,
            })}
            style="filter:${DROP_SHADOW};${videoStyle}"
          >
            ${media.webmUrl ? html`<source src="${media.webmUrl}" type="video/webm" />` : raw('')}
            <source src="${media.mp4Url}" type="video/mp4" />
          </video>

          <!-- Poster tetap di DOM dan memudar saat video siap, supaya tidak berkedip.
               Juga yang tampil kalau pengguna minta kurangi animasi. -->
          ${posterUrl
            ? html`<img
                data-video-poster
                src="${posterUrl}"
                alt="${alt}"
                class="media-poster absolute inset-0 w-full h-full object-contain"
                ${attrs({
                  loading: priority ? 'eager' : 'lazy',
                  fetchpriority: priority ? 'high' : null,
                  decoding: priority ? 'sync' : 'async',
                })}
                style="filter:${DROP_SHADOW};pointer-events:none;${imageStyle}"
              />`
            : raw('')}
        </div>
      </div>
    </div>`;
  }

  // ── Gambar ───────────────────────────────────────────────────────────────
  const imgSource = media?.image?.asset ? media.image : media?.poster?.asset ? media.poster : null;
  if (!imgSource) return raw(''); // tidak ada yang bisa dirender — pemanggil yang urus

  return html`<div class="relative w-full h-full">
    <div
      class="absolute z-[2] transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03] group-hover:-translate-y-1"
      style="${insetStyle}"
    >
      <img
        src="${urlFor(imgSource).width(800).fit('max').url()}"
        srcset="${srcSetOf(imgSource)}"
        sizes="${sizes}"
        alt="${alt}"
        ${attrs({
          loading: priority ? 'eager' : 'lazy',
          fetchpriority: priority ? 'high' : null,
          decoding: priority ? 'sync' : 'async',
        })}
        class="w-full h-full object-contain"
        style="filter:${DROP_SHADOW};${imageStyle}"
      />
    </div>
  </div>`;
}

/** Apakah media ini bisa dirender sama sekali? Dipakai pemanggil untuk fallback. */
export function hasMedia(media) {
  if (!media) return false;
  if (media.type === 'video' && media.mp4Url) return true;
  return Boolean(media.image?.asset || media.poster?.asset);
}
