/**
 * Kartu berita untuk /news (NewsCard) dan /news/[slug] (RelatedCard).
 *
 * Port dari components/news/NewsContent.js + ArticleContent.js. Inline
 * style dipertahankan apa adanya supaya visual identik dengan versi React.
 * Hover (dulu <style> di dalam komponen) dipindah ke src/css/pages/news.css.
 */
import { html, raw, attrs } from '../html.mjs';
import { loc, formatDate } from '../lib/i18n.mjs';
import { urlFor } from '../sanity.mjs';
import { langPath, newsUrl, slugOf } from '../routes.mjs';
import { THUMB_VARIANTS, categoryLabel, newsLabels } from '../content/news.mjs';

export const MONO = 'var(--font-jetbrains-mono), monospace';
export const DISPLAY = 'var(--font-space-grotesk), sans-serif';

/** Gabung objek style jadi string CSS inline. Key sudah dalam bentuk kebab-case. */
export function css(map) {
  return Object.entries(map)
    .filter(([, v]) => v != null && v !== false && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

/**
 * <img> pengganti next/image `fill` dengan sumber Sanity yang di-crop.
 * src = ukuran yang sama dengan versi React (width × height, fit crop);
 * srcset menambah versi 2× untuk layar retina.
 */
export function sanityFillImg({
  source,
  width,
  height,
  alt,
  sizes,
  className = '',
  priority = false,
}) {
  const url = (w) =>
    urlFor(source)
      .width(w)
      .height(Math.round((w * height) / width))
      .fit('crop')
      .auto('format')
      .url();

  return html`<img${attrs({
    src: url(width),
    srcset: `${url(width)} ${width}w, ${url(width * 2)} ${width * 2}w`,
    sizes,
    alt: alt || '',
    class: className || null,
    style: 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;color:transparent',
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    fetchpriority: priority ? 'high' : null,
  })} />`;
}

/** URL artikel sesuai bahasa. */
export function articleHref(article, lang) {
  const slug = slugOf(article.slug);
  return slug ? langPath(newsUrl(slug), lang) : '#';
}

/** Badge kategori di pojok thumbnail kartu kecil. */
function thumbBadge(text) {
  return html`<span
    style="${css({
      position: 'absolute',
      top: '16px',
      left: '16px',
      background: 'rgba(0,0,0,0.7)',
      'backdrop-filter': 'blur(8px)',
      color: '#00ffff',
      padding: '5px 10px',
      'border-radius': '6px',
      'font-size': '10px',
      'font-family': MONO,
      'font-weight': 500,
      'text-transform': 'uppercase',
      'letter-spacing': '0.1em',
      'z-index': 2,
    })}"
    >${text}</span
  >`;
}

/** Thumbnail 16:9 — gambar Sanity, atau gradient varian kalau tidak ada. */
function cardThumb({ article, title, index, hoverZoom }) {
  const img = article.heroImage?.asset
    ? sanityFillImg({
        source: article.heroImage,
        width: 600,
        height: 338,
        alt: article.heroImage.alt || title,
        sizes: '(max-width: 979px) 100vw, 33vw',
        className: hoverZoom
          ? 'object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105'
          : '',
      })
    : // data-thumb dipakai news-filter.js untuk menyusun ulang varian gradient
      // setelah filter/sort (React menghitung varian dari indeks daftar terfilter).
      html`<div
        data-thumb
        style="position:absolute;inset:0;background:${THUMB_VARIANTS[
          index % THUMB_VARIANTS.length
        ]}"
      ></div>`;

  return html`${img}
    <div
      style="position:absolute;inset:25%;background:linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2));border:1px solid rgba(255,255,255,0.10);border-radius:8px"
    ></div>`;
}

const DATE_STYLE = css({
  'font-family': MONO,
  'font-size': '11px',
  color: '#7C8694',
  'text-transform': 'uppercase',
  'letter-spacing': '0.1em',
  'margin-bottom': '12px',
});

const CARD_STYLE = css({
  background: '#262626',
  border: '1px solid rgba(255,255,255,0.10)',
  'border-radius': '18px',
  overflow: 'hidden',
  display: 'flex',
  'flex-direction': 'column',
  'text-decoration': 'none',
  color: 'inherit',
  transition: 'all 0.3s',
});

/**
 * Kartu grid di /news (NewsCard).
 * `index` = posisi awal di daftar (untuk varian gradient & urutan sort).
 */
export function newsCard({ article, index, lang }) {
  const t = newsLabels(lang);
  const title = loc(article.title, lang);
  const excerpt = loc(article.subtitle, lang);

  return html`<a
    href="${articleHref(article, lang)}"
    class="news-card-link group"
    data-news-card
    data-category="${article.category || ''}"
    data-index="${index}"
    style="${CARD_STYLE};cursor:pointer"
  >
    <div style="position:relative;aspect-ratio:16/9;overflow:hidden;flex-shrink:0">
      ${cardThumb({ article, title, index, hoverZoom: true })}
      ${thumbBadge(categoryLabel(article.category, lang))}
    </div>

    <div style="padding:24px;flex:1;display:flex;flex-direction:column">
      <div style="${DATE_STYLE}">${formatDate(article.publishedAt, lang)}</div>
      <h3
        style="${css({
          'font-family': DISPLAY,
          'font-size': '19px',
          'font-weight': 700,
          'line-height': 1.3,
          'margin-bottom': '10px',
          'letter-spacing': '-0.02em',
          display: '-webkit-box',
          '-webkit-line-clamp': 2,
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        })}"
      >
        ${title}
      </h3>
      ${excerpt
        ? html`<p
            style="${css({
              'font-size': '13px',
              color: '#B8C5D9',
              'line-height': 1.5,
              'margin-bottom': '16px',
              display: '-webkit-box',
              '-webkit-line-clamp': 3,
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              flex: 1,
            })}"
          >
            ${excerpt}
          </p>`
        : raw('')}
      <span
        style="font-size:12px;color:#00ffff;font-weight:600;display:inline-flex;align-items:center;gap:6px"
        >${t.readMore}</span
      >
    </div>
  </a>`;
}

/** Kartu "Related Articles" di bawah artikel (RelatedCard). */
export function relatedCard({ article, index, lang }) {
  const t = newsLabels(lang);
  const title = loc(article.title, lang);

  return html`<a href="${articleHref(article, lang)}" class="related-card-link" style="${CARD_STYLE}">
    <div style="position:relative;aspect-ratio:16/9;overflow:hidden">
      ${cardThumb({ article, title, index, hoverZoom: false })}
      ${thumbBadge(categoryLabel(article.category, lang))}
    </div>
    <div style="padding:24px">
      <div style="${DATE_STYLE}">${formatDate(article.publishedAt, lang)}</div>
      <h3
        style="${css({
          'font-family': DISPLAY,
          'font-size': '18px',
          'font-weight': 700,
          'line-height': 1.3,
          'letter-spacing': '-0.02em',
          display: '-webkit-box',
          '-webkit-line-clamp': 2,
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
          'margin-bottom': '12px',
        })}"
      >
        ${title}
      </h3>
      <span style="font-size:12px;color:#00ffff;font-weight:600">${t.readMore}</span>
    </div>
  </a>`;
}
