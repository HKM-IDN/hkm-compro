/**
 * Pengganti next/image.
 *
 * next/image memberi 4 hal: resize otomatis, srcset responsif, lazy load,
 * dan blur placeholder. Semuanya kita bikin manual di sini — Sanity CDN
 * sudah bisa resize via URL, jadi kerjanya cuma menyusun srcset.
 */
import { urlFor } from './sanity.mjs';
import { html, raw, attrs } from './html.mjs';

/** Lebar-lebar yang di-generate untuk srcset. */
const WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600, 1920];

/** Blur placeholder 16:9 — LQIP inline, tidak perlu request tambahan. */
export const BLUR_16_9 =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><rect width="16" height="9" fill="#131419"/></svg>'
  ).toString('base64');

export const BLUR_SQUARE =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#131419"/></svg>'
  ).toString('base64');

/** URL satu ukuran. */
export function imgUrl(source, width, { quality = 80, format = 'webp' } = {}) {
  if (!source) return null;
  return urlFor(source).width(width).quality(quality).format(format).auto('format').url();
}

/** Bangun srcset dari daftar lebar. */
export function srcSet(source, { maxWidth = 1920, quality = 80 } = {}) {
  if (!source) return null;
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${imgUrl(source, w, { quality })} ${w}w`)
    .join(', ');
}

/**
 * Render <img> responsif.
 *
 * @param {object}  opts
 * @param {object}  opts.source   Sanity image ref
 * @param {string}  opts.alt      wajib — teks alternatif
 * @param {string}  opts.sizes    atribut sizes, mis. "(max-width: 980px) 100vw, 50vw"
 * @param {boolean} opts.priority true = eager + fetchpriority high (untuk hero)
 * @param {string}  opts.className
 * @param {number}  opts.maxWidth batas lebar terbesar di srcset
 */
export function image({
  source,
  alt,
  sizes = '100vw',
  priority = false,
  className = '',
  maxWidth = 1920,
  style = '',
  width,
  height,
}) {
  if (!source) return raw('');

  const set = srcSet(source, { maxWidth });
  const fallback = imgUrl(source, Math.min(1024, maxWidth));

  return html`<img${attrs({
    src: fallback,
    srcset: set,
    sizes,
    alt: alt || '',
    class: className || null,
    style: style || null,
    width: width || null,
    height: height || null,
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    fetchpriority: priority ? 'high' : null,
  })} />`;
}

/** Ambil dimensi asli dari _ref Sanity (format: image-<hash>-<w>x<h>-<ext>). */
export function dimensions(source) {
  const ref = source?.asset?._ref || source?._ref;
  if (!ref) return null;
  const match = /-(\d+)x(\d+)-/.exec(ref);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}
