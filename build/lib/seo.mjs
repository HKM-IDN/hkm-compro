// lib/seo.mjs — utilitas SEO bersama.
//
// Disalin dari lib/seo.js milik project Next, dengan dua perubahan:
//   1. jsonLd() mengembalikan string HTML, bukan JSX
//   2. nilai env diambil lewat helper di build/sanity.mjs supaya nama
//      NEXT_PUBLIC_* lama dan nama baru sama-sama jalan

import { SANITY_PROJECT_ID, SANITY_DATASET, SITE_URL as SITE_URL_ENV } from '../sanity.mjs';

export const SITE_URL = (SITE_URL_ENV || 'https://hkm.co.id').replace(/\/$/, '');
export const SITE_NAME = 'PT. Harapan Karunia Makmur';
export const SITE_SHORT = 'HKM';
export const OG_DEFAULT = `${SITE_URL}/og-default.jpg`;

// ── Sanity image → absolute OG URL ─────────────────────────────────────────
// Converts a Sanity image asset reference to a CDN URL suitable for og:image.
// Works with { asset: { _ref: 'image-...' } } or a plain _ref string.
export function sanityOgImage(image) {
  const ref = typeof image === 'string' ? image : (image?.asset?._ref ?? image?._ref ?? null);
  if (!ref) return null;
  const m = ref.match(/^image-(.+?)-(\d+x\d+)-(\w+)$/);
  if (!m) return null;
  const [, id, dim, fmt] = m;
  const pid = SANITY_PROJECT_ID;
  const ds = SANITY_DATASET;
  if (!pid || !ds) throw new Error('SANITY_PROJECT_ID atau SANITY_DATASET belum di-set');
  return `https://cdn.sanity.io/images/${pid}/${ds}/${id}-${dim}.${fmt}?w=1200&h=630&fit=crop&auto=format`;
}

// ── Base metadata builder ───────────────────────────────────────────────────
// Returns the metadata object accepted by Next.js generateMetadata / export const metadata.
export function buildMeta({
  title,
  description,
  path = '',
  image = null,
  type = 'website',
  locale = 'id_ID',
  noindex = false,
}) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || OG_DEFAULT;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'en-ID': url,
        'id-ID': url,
        'x-default': url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

// ── JSON-LD schema builders ─────────────────────────────────────────────────

export function schemaOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_SHORT,
    slogan: 'Empowering Connections, Bridging Futures Together',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/apple-touch-icon.png`,
      width: 180,
      height: 180,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        areaServed: 'ID',
        availableLanguage: ['Indonesian', 'English'],
      },
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Indonesia',
    },
    foundingDate: '2016',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ID',
    },
  };
}

export function schemaWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['id-ID', 'en-ID'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function schemaProduct({ product, categorySlug, slug }) {
  const name = product.name?.en || product.name || '';
  const brand = product.brand || SITE_SHORT;
  const desc = product.description?.en || product.tagline?.en || '';
  const url = `${SITE_URL}/products/${categorySlug}/${slug}`;
  const imgUrl = sanityOgImage(product.heroImage);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: desc,
    brand: { '@type': 'Brand', name: brand },
    url,
    image: imgUrl ? [imgUrl] : undefined,
    offers: {
      '@type': 'Offer',
      url,
      availability: 'https://schema.org/InStock',
      priceCurrency: 'IDR',
      seller: { '@type': 'Organization', name: SITE_NAME },
      ...(product.marketplaceTokopedia ? { availableAtOrFrom: product.marketplaceTokopedia } : {}),
    },
  };

  if (product.priceRange) {
    // priceRange is a display string like "Rp 500.000 - 700.000"
    schema.offers.description = product.priceRange;
  }

  return schema;
}

export function schemaFaqPage(faqs = []) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question?.en || faq.question || '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer?.en || faq.answer || '',
      },
    })),
  };
}

export function schemaBreadcrumb(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
}

export function schemaNewsArticle({ article }) {
  const title = typeof article.title === 'string' ? article.title : article.title?.en || '';
  const subtitle =
    typeof article.subtitle === 'string' ? article.subtitle : article.subtitle?.en || '';
  const slug = article.slug?.current || article.slug || '';
  const imgUrl = sanityOgImage(article.heroImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: subtitle,
    url: `${SITE_URL}/news/${slug}`,
    image: imgUrl ? [imgUrl] : undefined,
    datePublished: article.publishedAt || undefined,
    dateModified: article.publishedAt || undefined,
    author: article.authorName
      ? [{ '@type': 'Person', name: article.authorName }]
      : [{ '@type': 'Organization', name: SITE_NAME }],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/apple-touch-icon.png`,
        width: 180,
        height: 180,
      },
    },
    inLanguage: 'id-ID',
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

// ── Helper: render JSON-LD jadi <script> tag (string HTML) ──────────────────
// Versi vanilla: balikin string, bukan JSX.
export function jsonLd(schema) {
  if (!schema) return '';
  // Schema adalah data yang dibangun di build time, bukan input user.
  // JSON.stringify sudah escape, tapi `<` tetap di-escape manual supaya
  // tidak bisa menutup tag <script> lebih awal.
  const json = JSON.stringify(schema).replace(/</g, '\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
