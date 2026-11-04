/**
 * /news/[slug] — port dari app/news/[slug]/page.js + layout.js +
 * components/news/ArticleContent.js
 *
 * Perbedaan dari versi React:
 *  - Body Portable Text dirender saat build oleh partials/portable-text.mjs
 *    (port 1:1 dari lib/portableText.js) — markup & class sama.
 *  - Font Source Serif 4 sudah dimuat global di meta.mjs, jadi layout.js
 *    (yang hanya memuat font itu) tidak perlu padanan.
 *  - Link share Twitter/LinkedIn: React membaca window.location.href saat
 *    render (kosong di SSR). Di sini URL kanonik halaman ditulis saat build,
 *    jadi tombol share langsung benar tanpa JS. Tombol "copy link" →
 *    src/js/article.js.
 *  - Kartu "Related Articles" di React selalu memakai judul & tanggal EN;
 *    di sini mengikuti bahasa halaman.
 *  - JSON-LD NewsArticle: headline/description/url/inLanguage mengikuti
 *    bahasa halaman (React selalu EN + id-ID).
 *  - Wrapper padding-top 48px: lihat catatan di pages/news.mjs.
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import {
  buildMeta,
  jsonLd,
  sanityOgImage,
  schemaNewsArticle,
  schemaBreadcrumb,
  SITE_URL,
} from '../lib/seo.mjs';
import { loc, formatDate } from '../lib/i18n.mjs';
import { langPath, newsUrl, slugOf } from '../routes.mjs';
import { fetchGroq, urlFor } from '../sanity.mjs';
import { NEWS_ARTICLE_QUERY } from '../lib/queries.mjs';
import { renderPortableText } from '../partials/portable-text.mjs';
import { relatedCard, sanityFillImg, css, MONO, DISPLAY } from '../partials/news-card.mjs';
import { categoryLabel, newsLabels } from '../content/news.mjs';

// ── Helper ──────────────────────────────────────────────────────────────────

function initials(name) {
  if (!name) return 'HK';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const META_LABEL = css({
  'font-size': '11px',
  color: '#7C8694',
  'font-family': MONO,
  'text-transform': 'uppercase',
  'letter-spacing': '0.1em',
});

const SHARE_BTN = css({
  width: '36px',
  height: '36px',
  'border-radius': '8px',
  background: '#262626',
  border: '1px solid rgba(255,255,255,0.10)',
  display: 'inline-flex',
  'align-items': 'center',
  'justify-content': 'center',
  color: '#B8C5D9',
  transition: 'all 0.2s',
});

const DIVIDER = html`<div
  class="meta-divider-line"
  style="width:1px;height:32px;background:rgba(255,255,255,0.10)"
></div>`;

function avatar(text, size, fontSize) {
  return html`<div
    style="${css({
      width: `${size}px`,
      height: `${size}px`,
      'border-radius': '50%',
      background: 'linear-gradient(135deg, #0066ff, #00ffff)',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'font-family': DISPLAY,
      'font-weight': 700,
      'font-size': `${fontSize}px`,
      color: '#fff',
      'flex-shrink': 0,
    })}"
  >
    ${text}
  </div>`;
}

// ── Sub-komponen ────────────────────────────────────────────────────────────

function shareButtons({ title, pageUrl, t }) {
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

  return html`<div style="margin-left:auto;display:flex;gap:8px" class="article-share-btns">
    <a
      href="${tweet}"
      target="_blank"
      rel="noopener noreferrer"
      title="${t.shareTwitter}"
      aria-label="${t.shareTwitter}"
      style="${SHARE_BTN}"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
        />
      </svg>
    </a>
    <a
      href="${linkedin}"
      target="_blank"
      rel="noopener noreferrer"
      title="${t.shareLinkedIn}"
      aria-label="${t.shareLinkedIn}"
      style="${SHARE_BTN}"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
        />
      </svg>
    </a>
    <button
      type="button"
      data-copy-link
      data-copied-label="${t.copied}"
      title="${t.copyLink}"
      aria-label="${t.copyLink}"
      style="${SHARE_BTN};cursor:pointer"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </button>
  </div>`;
}

function articleHeader({ article, title, subtitle, authorName, authorRole, catLabel, pageUrl, t, lang }) {
  return html`<section
    style="padding:80px 40px 60px;background:#0A0B0E;position:relative;overflow:hidden"
  >
    <div
      style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 40% at 30% 50%, rgba(0,102,255,0.30), transparent 60%);pointer-events:none"
    ></div>
    <div style="max-width:820px;margin:0 auto;position:relative;z-index:2">
      <div
        style="font-family:${MONO};font-size:12px;color:#7C8694;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.1em"
      >
        <a href="${langPath('/', lang)}" style="color:#B8C5D9;text-decoration:none">${t.home}</a>
        <span style="margin:0 8px">/</span>
        <a href="${langPath('/news', lang)}" style="color:#B8C5D9;text-decoration:none"
          >${t.news}</a
        >
        <span style="margin:0 8px">/</span>
        <span>${catLabel}</span>
      </div>

      <span
        style="${css({
          display: 'inline-block',
          padding: '6px 14px',
          background: 'rgba(0,255,255,0.08)',
          border: '1px solid rgba(0,255,255,0.2)',
          'border-radius': '100px',
          color: '#00ffff',
          'font-size': '11px',
          'font-family': MONO,
          'text-transform': 'uppercase',
          'letter-spacing': '0.15em',
          'font-weight': 500,
          'margin-bottom': '24px',
        })}"
        >${catLabel}</span
      >

      <h1
        style="font-family:${DISPLAY};font-size:clamp(36px, 5vw, 60px);font-weight:800;line-height:1.1;margin-bottom:24px;letter-spacing:-0.03em"
      >
        ${title}
      </h1>

      ${subtitle
        ? html`<p style="font-size:20px;color:#B8C5D9;line-height:1.5;margin-bottom:32px">
            ${subtitle}
          </p>`
        : raw('')}

      <div
        style="display:flex;align-items:center;gap:20px;padding:24px 0;border-top:1px solid rgba(255,255,255,0.10);border-bottom:1px solid rgba(255,255,255,0.10);flex-wrap:wrap"
      >
        ${authorName
          ? html`<div style="display:flex;align-items:center;gap:12px">
              ${avatar(initials(authorName), 44, 16)}
              <div style="display:flex;flex-direction:column;gap:2px">
                <span style="font-size:14px;font-weight:600">${authorName}</span>
                ${authorRole
                  ? html`<span
                      style="font-size:12px;color:#7C8694;font-family:${MONO};text-transform:uppercase;letter-spacing:0.1em"
                      >${authorRole}</span
                    >`
                  : raw('')}
              </div>
            </div>`
          : raw('')}
        ${DIVIDER}

        <div style="display:flex;flex-direction:column;gap:2px">
          <span style="${META_LABEL}">${t.published}</span>
          <span style="font-size:14px;font-weight:500"
            >${formatDate(article.publishedAt, lang)}</span
          >
        </div>

        ${article.readTime
          ? html`${DIVIDER}
              <div style="display:flex;flex-direction:column;gap:2px">
                <span style="${META_LABEL}">${t.readTime}</span>
                <span style="font-size:14px;font-weight:500"
                  >${article.readTime} ${t.minRead}</span
                >
              </div>`
          : raw('')}
        ${shareButtons({ title, pageUrl, t })}
      </div>
    </div>
  </section>`;
}

function heroImage({ article, title }) {
  const caption = article.heroImage?.caption || '';
  return html`<section style="padding:0 40px;background:#0A0B0E">
    <div
      style="max-width:1100px;margin:0 auto;position:relative;aspect-ratio:16/9;border-radius:24px;border:1px solid rgba(255,255,255,0.10);overflow:hidden;margin-top:40px"
    >
      ${article.heroImage?.asset
        ? sanityFillImg({
            source: article.heroImage,
            width: 1100,
            height: 619,
            alt: article.heroImage.alt || title,
            sizes: '(max-width: 979px) 100vw, 1100px',
            priority: true,
          })
        : html`<div
              style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%, rgba(0,102,255,0.30), transparent 60%), linear-gradient(135deg, #2e2e2e, #262626)"
            ></div>
            <div
              style="position:absolute;inset:25%;background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2));border:1px solid rgba(255,255,255,0.18);border-radius:16px"
            ></div>`}
    </div>
    ${caption
      ? html`<p
          style="max-width:1100px;margin:16px auto 0;font-size:13px;color:#7C8694;font-style:italic;padding-left:8px"
        >
          ${caption}
        </p>`
      : raw('')}
  </section>`;
}

function articleBody({ bodyBlocks, tags, authorName, authorRole, authorBio, t, lang }) {
  return html`<section style="padding:60px 40px 80px;background:#0A0B0E">
    <article class="article-prose" style="max-width:720px;margin:0 auto">
      ${renderPortableText(bodyBlocks)}
    </article>

    <div
      style="max-width:720px;margin:48px auto 0;padding-top:32px;border-top:1px solid rgba(255,255,255,0.10);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px"
    >
      ${tags.length
        ? html`<div style="display:flex;gap:8px;flex-wrap:wrap">
            ${tags.map(
              (tag) => html`<span
                style="padding:6px 12px;background:#262626;border:1px solid rgba(255,255,255,0.10);border-radius:6px;font-size:12px;color:#B8C5D9;font-family:${MONO};text-transform:uppercase;letter-spacing:0.08em"
                >#${tag}</span
              >`
            )}
          </div>`
        : raw('')}
      <a
        href="${langPath('/news', lang)}"
        style="color:#00ffff;font-size:14px;font-weight:600;text-decoration:none"
        >${t.backToNews}</a
      >
    </div>

    ${authorName
      ? html`<div
          style="max-width:720px;margin:48px auto 0;padding:32px;background:#262626;border:1px solid rgba(255,255,255,0.10);border-radius:18px;display:flex;gap:20px;align-items:flex-start"
        >
          ${avatar(initials(authorName), 64, 24)}
          <div>
            <h4 style="font-size:17px;font-weight:700;margin-bottom:4px;font-family:${DISPLAY}">
              ${authorName}
            </h4>
            ${authorRole
              ? html`<div
                  style="font-size:12px;color:#00ffff;font-family:${MONO};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px"
                >
                  ${authorRole}
                </div>`
              : raw('')}
            ${authorBio
              ? html`<p style="font-size:14px;color:#B8C5D9;line-height:1.6">${authorBio}</p>`
              : raw('')}
          </div>
        </div>`
      : raw('')}
  </section>`;
}

function relatedSection({ related, t, lang }) {
  if (!related.length) return raw('');
  return html`<section style="padding:80px 40px 100px;background:#0A0B0E">
    <div
      style="max-width:1400px;margin:0 auto 32px;display:flex;justify-content:space-between;align-items:flex-end"
    >
      <h2
        style="font-family:${DISPLAY};font-size:clamp(28px, 3vw, 40px);font-weight:800;letter-spacing:-0.03em"
      >
        ${t.related}
      </h2>
      <a
        href="${langPath('/news', lang)}"
        style="color:#00ffff;font-size:14px;font-weight:600;text-decoration:none"
        >${t.allNews}</a
      >
    </div>
    <div
      class="related-grid-responsive"
      style="max-width:1400px;margin:0 auto;display:grid;grid-template-columns:repeat(3, 1fr);gap:24px"
    >
      ${related.map((article, i) => relatedCard({ article, index: i, lang }))}
    </div>
  </section>`;
}

// ── Route ───────────────────────────────────────────────────────────────────

export const route = {
  name: 'news/[slug]',

  /** Pengganti generateStaticParams() — satu halaman per artikel terbit. */
  paths({ news }) {
    return (news || [])
      .map((a) => slugOf(a.slug))
      .filter(Boolean)
      .map((slug) => ({ path: newsUrl(slug), newsSlug: slug }));
  },

  async render({ newsSlug, settings, lang, buildYear, gaId }) {
    const article = await fetchGroq(NEWS_ARTICLE_QUERY, { slug: newsSlug }, `berita ${newsSlug}`);
    if (!article) throw new Error(`artikel "${newsSlug}" tidak ditemukan di Sanity`);

    const t = newsLabels(lang);
    const path = newsUrl(newsSlug);
    const pageUrl = SITE_URL + langPath(path, lang);

    const title = loc(article.title, lang);
    const subtitle = loc(article.subtitle, lang);
    const authorName = loc(article.authorName, lang);
    const authorRole = loc(article.authorRole, lang);
    const authorBio = loc(article.authorBio, lang);
    const catLabel = categoryLabel(article.category, lang);

    const bodyBlocks =
      lang === 'id' && article.bodyIndonesian?.length > 0 ? article.bodyIndonesian : article.body;

    // Metadata — sumber utama bahasa Indonesia, sama seperti Next
    const metaTitle = loc(article.title, 'id') || loc(article.title, 'en');
    const metaDesc = loc(article.subtitle, 'id') || loc(article.subtitle, 'en');

    // Preload LCP — URL sama persis dengan src <img> hero (sanityFillImg)
    const lcpImageUrl = article.heroImage?.asset
      ? urlFor(article.heroImage).width(1100).height(619).fit('crop').auto('format').url()
      : null;

    const articleSchema = {
      ...schemaNewsArticle({ article }),
      headline: title,
      description: subtitle,
      url: pageUrl,
      inLanguage: lang === 'id' ? 'id-ID' : 'en',
    };
    const schemas = [
      jsonLd(articleSchema),
      jsonLd(
        schemaBreadcrumb([
          { name: t.crumbHome, url: langPath('/', lang) },
          { name: t.crumbNews, url: langPath('/news', lang) },
          { name: title },
        ])
      ),
    ];

    return page({
      meta: buildMeta({
        title: `${metaTitle} — ${t.metaSuffix}`,
        description: metaDesc,
        path,
        image: sanityOgImage(article.heroImage),
        type: 'article',
      }),
      lang,
      path,
      settings,
      buildYear,
      gaId,
      schemas,
      preload: lcpImageUrl,
      scripts: ['/assets/js/article.js'],
      body: html`
        <div style="padding-top:48px;background:#0A0B0E;min-height:100vh">
          ${articleHeader({
            article,
            title,
            subtitle,
            authorName,
            authorRole,
            catLabel,
            pageUrl,
            t,
            lang,
          })}
          ${heroImage({ article, title })}
          ${articleBody({
            bodyBlocks,
            tags: article.tags || [],
            authorName,
            authorRole,
            authorBio,
            t,
            lang,
          })}
          ${relatedSection({ related: article.related || [], t, lang })}
        </div>
      `,
    });
  },
};
