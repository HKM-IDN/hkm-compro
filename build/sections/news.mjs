/**
 * Section 6: News — port dari components/sections/NewsSection.js
 *
 * Perbedaan dari versi React:
 *  - Kartu featured dan kartu kecil hampir identik; di React keduanya
 *    ditulis dua kali (duplikasi ~45 baris). Di sini satu fungsi
 *    `newsCard()` dengan parameter `featured`.
 *  - Hover boxShadow → class .news-card.
 */
import { html, raw, cls } from '../html.mjs';
import { loc, formatDate } from '../lib/i18n.mjs';
import { urlFor } from '../sanity.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { langPath, slugOf } from '../routes.mjs';
import { NEWS_LABELS } from '../content/homepage.mjs';

/** Thumbnail berita — gambar Sanity, atau gradient kalau tidak ada. */
export function newsThumb(article) {
  if (article?.heroImage?.asset) {
    return html`<img
      src="${urlFor(article.heroImage).width(800).url()}"
      srcset="
        ${[400, 800, 1200]
          .map((w) => `${urlFor(article.heroImage).width(w).url()} ${w}w`)
          .join(', ')}
      "
      sizes="(max-width: 979px) 100vw, 35vw"
      alt="${loc(article.title, 'en')}"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 w-full h-full object-cover"
    />`;
  }

  return html`<div
    class="absolute inset-0"
    style="background:radial-gradient(circle at 50% 40%, rgba(0,102,255,0.30), transparent 60%), linear-gradient(135deg,#2e2e2e,#262626)"
  ></div>`;
}

/**
 * Satu kartu berita.
 * @param {boolean} opts.featured kartu besar (span 2 baris) atau kartu kecil
 */
function newsCard({ article, t, lang, featured = false }) {
  const slug = slugOf(article.slug);

  return html`<a
    href="${slug ? langPath(`/news/${slug}`, lang) : '#'}"
    class="${cls(
      'news-card group bg-dark-3 border border-white/10 rounded-[18px] overflow-hidden no-underline text-inherit flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-electric-blue',
      featured && 'lg:row-span-2'
    )}"
  >
    <div class="relative" style="aspect-ratio:${featured ? '16/10' : '16/9'}">
      ${newsThumb(article)}
      ${article.category &&
      html`<span
        class="absolute top-4 left-4 bg-black/70 text-cyan-bright px-2.5 py-1 rounded-[6px] text-[10px] font-mono font-medium uppercase tracking-[0.1em] z-[2]"
        style="backdrop-filter:blur(8px)"
        >${t.tag[article.category] || article.category}</span
      >`}
    </div>

    <div class="${cls('flex-1 flex flex-col', featured ? 'p-7' : 'p-5')}">
      <p class="font-mono text-[11px] text-hkm-500 uppercase tracking-[0.1em] mb-2.5">
        ${formatDate(article.publishedAt, lang)}
      </p>

      <h3
        class="${cls(
          'font-display font-bold text-white tracking-[-0.02em] line-clamp-2',
          featured ? 'text-[26px] leading-[1.2] mb-3' : 'text-[18px] leading-[1.3] mb-2'
        )}"
      >
        ${loc(article.title, lang)}
      </h3>

      <p
        class="${cls(
          'text-[13px] text-hkm-300 leading-[1.5] flex-1 mb-3',
          featured ? 'line-clamp-3' : 'line-clamp-2'
        )}"
      >
        ${loc(article.subtitle, lang)}
      </p>

      <span
        class="text-[12px] text-cyan-bright font-semibold inline-flex items-center gap-1.5 transition-[gap] duration-200 group-hover:gap-2.5"
        >${t.readMore}</span
      >
    </div>
  </a>`;
}

export function newsSection({ data, news = [], lang }) {
  const t = NEWS_LABELS[lang] || NEWS_LABELS.en;

  const title = loc(data?.newsSectionTitle, lang) || t.title;
  const sub = loc(data?.newsSectionDesc, lang) || t.sub;

  if (!news.length) return raw('');

  const [featured, ...cards] = news;

  return html`
    <section id="news" class="px-10 py-[120px]" style="background:#0A0B0E">
      <div class="max-w-[1400px] mx-auto">
        <div class="text-center mb-16">
          <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-[14px]">
            ${t.eyebrow}
          </p>
          <h2
            class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] max-w-[800px] mx-auto mb-4 [&>span]:text-cyan-bright"
            style="font-size:clamp(32px,4.5vw,56px)"
          >
            ${raw(sanitizeHtml(title))}
          </h2>
          <p class="text-[16px] text-hkm-300 max-w-[580px] mx-auto leading-[1.6]">${sub}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          ${featured ? newsCard({ article: featured, t, lang, featured: true }) : raw('')}
          ${cards.slice(0, 3).map((article) => newsCard({ article, t, lang }))}
        </div>

        <div class="text-center mt-12">
          <a
            href="${langPath('/news', lang)}"
            class="inline-flex items-center gap-2 bg-transparent text-white px-7 py-3.5 rounded-[8px] font-semibold text-sm no-underline transition-all duration-200 hover:border-cyan-bright hover:text-cyan-bright"
            style="border:1px solid rgba(255,255,255,0.18)"
            >${t.allBtn}</a
          >
        </div>
      </div>
    </section>
  `;
}
