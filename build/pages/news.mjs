/**
 * /news — port dari app/news/page.js + components/news/NewsContent.js
 *
 * Perbedaan dari versi React:
 *  - Filter kategori & urutan (useState/useMemo) → SEMUA artikel dirender
 *    di HTML; src/js/news-filter.js hanya menyembunyikan (element.hidden)
 *    dan membalik urutan lewat CSS `order`. Tanpa JS, semua artikel tetap
 *    tampil dan terindeks.
 *  - Jumlah per kategori dihitung saat build.
 *  - EmptyState dirender tersembunyi; JS yang memunculkannya.
 *  - <main paddingTop:64> bersarang di dalam <main pt-64> layout React
 *    → total 128px dari atas. Layout vanilla sudah pt-80, jadi wrapper di
 *    sini cukup padding-top 48px supaya posisi konten identik.
 *  - Filter bar sticky top 80px (nav vanilla 80px; React 64px = tertutup
 *    16px oleh nav — sama dengan perbaikan di /products).
 *  - Link artikel memakai prefix bahasa (/id/news/...).
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import { buildMeta } from '../lib/seo.mjs';
import { loc, formatDate } from '../lib/i18n.mjs';
import { langPath } from '../routes.mjs';
import { icon } from '../partials/lucide.mjs';
import {
  newsCard,
  sanityFillImg,
  articleHref,
  css,
  MONO,
  DISPLAY,
} from '../partials/news-card.mjs';
import { NEWS_CATEGORY_KEYS, categoryLabel, newsLabels } from '../content/news.mjs';

const GRADIENT_TEXT =
  '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text';

// ── Sub-komponen ────────────────────────────────────────────────────────────

function pageHeader({ t, lang }) {
  return html`<section
    style="padding:80px 40px 60px;background:#0A0B0E;position:relative;overflow:hidden"
  >
    <div
      style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 20% 50%, rgba(0,102,255,0.30), transparent 60%);pointer-events:none"
    ></div>
    <div style="max-width:1400px;margin:0 auto;position:relative;z-index:2">
      <div
        style="font-family:${MONO};font-size:12px;color:#7C8694;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.1em"
      >
        <a href="${langPath('/', lang)}" style="color:#B8C5D9;text-decoration:none">${t.home}</a>
        <span style="margin:0 8px">/</span>
        <span>${t.crumb}</span>
      </div>
      <h1
        class="page-gradient-title"
        style="font-family:${DISPLAY};font-size:clamp(40px, 6vw, 72px);font-weight:800;line-height:1.05;margin-bottom:16px;background:linear-gradient(180deg, #FFFFFF, #B8C5D9);${GRADIENT_TEXT}"
      >
        ${t.titleA}<span>${t.titleB}</span>
      </h1>
      <p style="font-size:18px;color:#B8C5D9;max-width:680px;line-height:1.6">${t.intro}</p>
    </div>
  </section>`;
}

function featuredCard({ article, t, lang }) {
  if (!article) return raw('');
  const title = loc(article.title, lang);
  const excerpt = loc(article.subtitle, lang);

  return html`<section style="padding:60px 40px;background:#0A0B0E">
    <a
      href="${articleHref(article, lang)}"
      class="featured-card-link group"
      style="${css({
        'max-width': '1400px',
        margin: '0 auto',
        display: 'grid',
        'grid-template-columns': '1.3fr 1fr',
        background: '#262626',
        border: '1px solid rgba(255,255,255,0.10)',
        'border-radius': '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        'text-decoration': 'none',
        color: 'inherit',
        transition: 'all 0.3s',
      })}"
    >
      <div style="position:relative;aspect-ratio:4/3;overflow:hidden">
        ${article.heroImage?.asset
          ? sanityFillImg({
              source: article.heroImage,
              width: 900,
              height: 675,
              alt: article.heroImage.alt || title,
              sizes: '(max-width: 979px) 100vw, 55vw',
              className:
                'object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105',
            })
          : html`<div
              style="position:absolute;inset:0;background:radial-gradient(circle at 60% 40%, rgba(0,102,255,0.30), transparent 60%), linear-gradient(135deg, #2e2e2e, #262626)"
            ></div>`}
        <div
          style="position:absolute;inset:20%;background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2));border:1px solid rgba(255,255,255,0.18);border-radius:12px"
        ></div>
        <span
          style="${css({
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'rgba(0,0,0,0.7)',
            'backdrop-filter': 'blur(8px)',
            color: '#00ffff',
            padding: '6px 12px',
            'border-radius': '6px',
            'font-size': '11px',
            'font-family': MONO,
            'font-weight': 500,
            'text-transform': 'uppercase',
            'letter-spacing': '0.15em',
            'z-index': 2,
          })}"
          >${t.featured} · ${categoryLabel(article.category, lang)}</span
        >
      </div>

      <div style="padding:48px;display:flex;flex-direction:column;justify-content:center">
        <div
          style="font-family:${MONO};font-size:11px;color:#00ffff;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:12px"
        >
          ${t.latestStory}
        </div>
        <div
          style="font-family:${MONO};font-size:12px;color:#7C8694;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px"
        >
          ${formatDate(article.publishedAt, lang)}
        </div>
        <h2
          style="font-family:${DISPLAY};font-size:clamp(28px, 3.5vw, 44px);font-weight:800;line-height:1.15;margin-bottom:16px;letter-spacing:-0.03em"
        >
          ${title}
        </h2>
        ${excerpt
          ? html`<p style="font-size:16px;color:#B8C5D9;line-height:1.6;margin-bottom:28px">
              ${excerpt}
            </p>`
          : raw('')}
        <span
          style="color:#00ffff;font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:8px"
          >${t.readFull}</span
        >
      </div>
    </a>
  </section>`;
}

/** Style chip — sama dengan React. news-filter.js memakai nilai yang sama. */
const CHIP_ACTIVE = { bg: '#0066ff', border: '#0066ff', color: '#fff' };
const CHIP_IDLE = { bg: '#262626', border: 'rgba(255,255,255,0.10)', color: '#E2E7EF' };

function chip({ value, label, count, active }) {
  const s = active ? CHIP_ACTIVE : CHIP_IDLE;
  return html`<button
    type="button"
    data-news-filter="${value}"
    aria-pressed="${active ? 'true' : 'false'}"
    style="${css({
      padding: '8px 14px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      'border-radius': '100px',
      'font-size': '12px',
      'font-weight': 500,
      color: s.color,
      cursor: 'pointer',
      transition: 'all 0.2s',
      'font-family': MONO,
      'text-transform': 'uppercase',
      'letter-spacing': '0.08em',
    })}"
  >
    ${label} <span style="opacity:0.7;margin-left:4px">(${count})</span>
  </button>`;
}

function filterBar({ articles, t }) {
  const counts = { all: articles.length };
  for (const a of articles) {
    if (a.category) counts[a.category] = (counts[a.category] || 0) + 1;
  }

  return html`<div
    data-news-filter-bar
    style="${css({
      padding: '0 40px',
      background: 'rgba(20,20,20,0.92)',
      'border-top': '1px solid rgba(255,255,255,0.10)',
      'border-bottom': '1px solid rgba(255,255,255,0.10)',
      position: 'sticky',
      top: '80px',
      'z-index': 50,
      'backdrop-filter': 'blur(20px)',
    })}"
  >
    <div
      style="display:flex;gap:12px;max-width:1400px;margin:0 auto;align-items:center;flex-wrap:wrap;justify-content:space-between;padding:20px 0"
    >
      <div role="group" aria-label="${t.filterLabel}" style="display:flex;gap:8px;flex-wrap:wrap">
        ${NEWS_CATEGORY_KEYS.map((value) =>
          chip({ value, label: t.cat[value], count: counts[value] || 0, active: value === 'all' })
        )}
      </div>

      <select
        data-news-sort
        aria-label="${t.sortLabel}"
        style="background:#262626;border:1px solid rgba(255,255,255,0.10);color:#fff;padding:8px 14px;border-radius:100px;font-size:12px;font-family:${MONO};cursor:pointer;outline:none;text-transform:uppercase;letter-spacing:0.08em"
      >
        <option value="newest" selected>${t.newest}</option>
        <option value="oldest">${t.oldest}</option>
      </select>
    </div>
  </div>`;
}

/** Pengganti components/ui/EmptyState.js (tanpa CTA). */
function emptyState({ t, hidden }) {
  return html`<div
    data-news-empty
    style="max-width:1400px;margin:0 auto"
    ${raw(hidden ? 'hidden' : '')}
  >
    <div class="flex flex-col items-center justify-center text-center py-16 px-6">
      <div
        class="flex items-center justify-center rounded-[20px] mb-6"
        style="width:72px;height:72px;background:linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,255,255,0.04));border:1px solid rgba(255,255,255,0.10);color:#00B8D9"
      >
        ${icon('FileQuestion', { size: 32 })}
      </div>
      <h3 class="font-display font-bold text-white mb-3" style="font-size:clamp(18px, 2vw, 22px)">
        ${t.emptyTitle}
      </h3>
      <p class="text-[15px] text-hkm-300 leading-relaxed max-w-[420px] mb-6">${t.emptyDesc}</p>
    </div>
  </div>`;
}

function newsGrid({ articles, t, lang }) {
  return html`<section style="padding:60px 40px 80px;background:#0A0B0E">
    ${emptyState({ t, hidden: articles.length > 0 })}
    ${articles.length
      ? html`<div
          data-news-grid
          class="news-grid-responsive"
          style="max-width:1400px;margin:0 auto;display:grid;grid-template-columns:repeat(3, 1fr);gap:24px"
        >
          ${articles.map((article, i) => newsCard({ article, index: i, lang }))}
        </div>`
      : raw('')}
  </section>`;
}

function newsletter({ t }) {
  return html`<section style="padding:100px 40px;background:#0A0B0E">
    <div
      style="max-width:1100px;margin:0 auto;padding:60px;background:linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,255,255,0.03));border:1px solid rgba(255,255,255,0.18);border-radius:24px;text-align:center;position:relative;overflow:hidden"
    >
      <div
        style="position:absolute;inset:0;background:radial-gradient(ellipse at top left, rgba(0,255,255,0.22), transparent 60%);pointer-events:none"
      ></div>
      <div style="position:relative;z-index:2">
        <div
          style="font-family:${MONO};font-size:11px;color:#00ffff;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:16px"
        >
          ${t.nlEyebrow}
        </div>
        <h2
          style="font-family:${DISPLAY};font-size:clamp(28px, 4vw, 44px);font-weight:800;line-height:1.1;margin-bottom:16px"
        >
          ${t.nlTitleA}<span
            style="background:linear-gradient(135deg, #0066ff, #00ffff);${GRADIENT_TEXT}"
            >${t.nlTitleB}</span
          >
        </h2>
        <p
          style="font-size:16px;color:#B8C5D9;max-width:580px;margin:0 auto 28px;line-height:1.6"
        >
          ${t.nlDesc}
        </p>
        <!-- Sama seperti React: belum tersambung ke layanan newsletter mana pun -->
        <div style="display:flex;gap:10px;max-width:480px;margin:0 auto">
          <input
            type="email"
            placeholder="${t.nlPlaceholder}"
            aria-label="${t.nlPlaceholder}"
            style="flex:1;padding:14px 18px;background:#262626;border:1px solid rgba(255,255,255,0.10);border-radius:8px;color:#fff;font-size:14px;font-family:var(--font-inter), sans-serif;outline:none"
          />
          <button
            type="button"
            style="background:#0066ff;color:#fff;padding:14px 24px;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;white-space:nowrap"
          >
            ${t.nlButton}
          </button>
        </div>
      </div>
    </div>
  </section>`;
}

// ── Route ───────────────────────────────────────────────────────────────────

export const route = {
  name: 'news',
  path: '/news',

  render({ news = [], newsFeatured = null, settings, lang, buildYear, gaId }) {
    const t = newsLabels(lang);
    const path = '/news';

    return page({
      // Metadata berbahasa Indonesia untuk kedua versi — sama seperti Next.
      meta: buildMeta({ title: t.metaTitle, description: t.metaDesc, path, type: 'website' }),
      lang,
      path,
      settings,
      buildYear,
      gaId,
      scripts: ['/assets/js/news-filter.js'],
      body: html`
        <div style="padding-top:48px;background:#0A0B0E;min-height:100vh">
          ${pageHeader({ t, lang })} ${featuredCard({ article: newsFeatured, t, lang })}
          ${filterBar({ articles: news, t })} ${newsGrid({ articles: news, t, lang })}
          ${newsletter({ t })}
        </div>
      `,
    });
  },
};
