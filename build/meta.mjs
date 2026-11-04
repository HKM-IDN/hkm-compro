/**
 * Pengganti metadata API Next.js.
 *
 * buildMeta() di lib/seo.mjs balikin objek bergaya Next. Fungsi di sini
 * menerjemahkan objek itu jadi tag <head> HTML biasa, supaya lib/seo.mjs
 * tidak perlu diubah dan tetap gampang disamakan dengan versi lama.
 */
import { html, raw, attrs } from './html.mjs';
import { SITE_NAME, SITE_URL, OG_DEFAULT } from './lib/seo.mjs';

const TITLE_TEMPLATE = (t) => `${t} | HKM Indonesia`;
const DEFAULT_TITLE = `${SITE_NAME} — HKM`;

const DEFAULT_DESCRIPTION =
  'Distributor resmi produk konektivitas Indonesia: router 4G/5G, Mobile WiFi, ' +
  'SIM khusus, IP kamera, dash cam, dan smart home. Garansi resmi, jaringan ' +
  'service point nasional.';

/** <link> favicon — sama persis dengan metadata.icons versi Next. */
function icons() {
  return html`
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
    <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  `;
}

/** Preconnect + stylesheet Google Fonts (pengganti next/font). */
function fonts() {
  const families = [
    'Space+Grotesk:wght@400;500;600;700;800',
    'Inter:wght@400;500;600;700',
    'JetBrains+Mono:wght@400;500;700',
    'Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400',
  ]
    .map((f) => `family=${f}`)
    .join('&');

  const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;

  return html`
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${url}" />
  `;
}

function robotsContent(robots) {
  if (!robots) return 'index, follow, max-image-preview:large';
  const parts = [robots.index === false ? 'noindex' : 'index'];
  parts.push(robots.follow === false ? 'nofollow' : 'follow');
  if (robots['max-image-preview']) {
    parts.push(`max-image-preview:${robots['max-image-preview']}`);
  }
  return parts.join(', ');
}

/**
 * Render seluruh isi <head> untuk satu halaman.
 *
 * @param {object} opts
 * @param {object} opts.meta       hasil buildMeta() — boleh null untuk default
 * @param {string} opts.lang       'en' | 'id'
 * @param {string} opts.path       path halaman, mis. '/products'
 * @param {string[]} opts.schemas  array string hasil jsonLd()
 * @param {boolean} opts.isRoot    true kalau halaman ini tidak punya buildMeta
 */
export function head({ meta = null, lang = 'en', path = '/', schemas = [] } = {}) {
  const rawTitle = meta?.title;
  const title = rawTitle ? TITLE_TEMPLATE(rawTitle) : DEFAULT_TITLE;
  const description = meta?.description || DEFAULT_DESCRIPTION;

  const og = meta?.openGraph || {};
  const tw = meta?.twitter || {};
  const ogImage = og.images?.[0]?.url || OG_DEFAULT;
  const canonical = meta?.alternates?.canonical || `${SITE_URL}${path}`;

  // Alternate hreflang — versi vanilla punya URL terpisah per bahasa,
  // jadi hreflang-nya benar-benar menunjuk ke halaman yang berbeda.
  const enPath = path.replace(/^\/id(\/|$)/, '/');
  const idPath = enPath === '/' ? '/id/' : `/id${enPath}`;

  return html`
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${robotsContent(meta?.robots)}" />
    <link rel="canonical" href="${canonical}" />

    <link rel="alternate" hreflang="en" href="${SITE_URL}${enPath}" />
    <link rel="alternate" hreflang="id" href="${SITE_URL}${idPath}" />
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}${enPath}" />

    <meta property="og:type" content="${og.type || 'website'}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="${lang === 'id' ? 'id_ID' : 'en_US'}" />
    <meta property="og:title" content="${og.title || title}" />
    <meta property="og:description" content="${og.description || description}" />
    <meta property="og:url" content="${og.url || canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="${tw.card || 'summary_large_image'}" />
    <meta name="twitter:site" content="@hkm_indonesia" />
    <meta name="twitter:title" content="${tw.title || title}" />
    <meta name="twitter:description" content="${tw.description || description}" />
    <meta name="twitter:image" content="${tw.images?.[0] || ogImage}" />

    <meta name="theme-color" content="#0a0b0e" />

    ${icons()} ${fonts()}

    <link rel="stylesheet" href="/assets/main.css" />

    ${schemas.map((s) => raw(s))}
  `;
}
