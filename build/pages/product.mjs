/**
 * /products/[category]/[slug] — port dari
 * app/products/[category]/[slug]/page.js + components/products/ProductDetail.js
 *
 * 46 halaman × 2 bahasa = 92 file.
 *
 * Perbedaan terpenting dari versi React:
 *
 *   Tab Ikhtisar / Spesifikasi / Dukungan dulu memakai useState, dan hanya
 *   tab aktif yang di-render. Artinya tabel spesifikasi dan FAQ TIDAK PERNAH
 *   ada di HTML — Google tidak pernah melihatnya, padahal halaman ini
 *   memasang schema Product dan FAQPage yang menjanjikan data itu ada.
 *
 *   Di sini ketiga panel dirender penuh; src/js/product-tabs.js yang
 *   menyembunyikan dua di antaranya. Tanpa JavaScript, seluruh isi halaman
 *   tetap terbaca.
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import {
  buildMeta,
  jsonLd,
  sanityOgImage,
  schemaProduct,
  schemaFaqPage,
  schemaBreadcrumb,
} from '../lib/seo.mjs';
import { loc } from '../lib/i18n.mjs';
import { getT } from '../lib/translations.mjs';
import { langPath, slugOf } from '../routes.mjs';
import { fetchGroq, urlFor } from '../sanity.mjs';
import { PRODUCT_DETAIL_QUERY, SERVICE_POINT_SUMMARY_QUERY } from '../lib/queries.mjs';

import { productSubNav } from '../sections/product/subnav.mjs';
import { productHero } from '../sections/product/hero.mjs';
import { keyHighlights } from '../sections/product/highlights.mjs';
import { featureSections } from '../sections/product/features.mjs';
import { bundleValueSection } from '../sections/product/bundle.mjs';
import { connectivitySection } from '../sections/product/connectivity.mjs';
import { buySection } from '../sections/product/buy.mjs';
import { specsSection } from '../sections/product/specs.mjs';
import { supportSection } from '../sections/product/support.mjs';
import { productCard } from '../partials/product-card.mjs';

/** Produk terkait — memakai kartu produk bersama (visual setara). */
function relatedSection({ products, categoryName, categorySlug, t, lang, now }) {
  if (!products?.length) return raw('');

  return html`<section class="px-5 lg:px-10 py-[100px]" style="background:#0A0B0E">
    <div class="max-w-[1400px] mx-auto">
      <div class="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <h2 class="font-display text-[32px] font-extrabold text-white tracking-[-0.03em]">
          ${t.relatedProducts}
        </h2>
        ${categorySlug
          ? html`<a
              href="${langPath(`/products/${categorySlug}`, lang)}"
              class="text-[14px] font-semibold hover:underline no-underline"
              style="color:#00B8D9"
              >${t.viewAll} ${categoryName} →</a
            >`
          : raw('')}
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${products
          .slice(0, 4)
          .map((p) => productCard({ product: p, lang, viewDetailsLabel: t.viewDetails, now }))}
      </div>
    </div>
  </section>`;
}

export const route = {
  name: 'products/[category]/[slug]',

  /** Pengganti generateStaticParams(). */
  paths({ productSlugs }) {
    return (productSlugs || [])
      .filter((p) => p.slug && p.category)
      .map((p) => ({
        path: `/products/${p.category}/${p.slug}`,
        productSlug: p.slug,
        categorySlug: p.category,
      }));
  },

  async render({ productSlug, categorySlug, settings, lang, buildYear, gaId, buildTime }) {
    const [product, spSummary] = await Promise.all([
      fetchGroq(
        PRODUCT_DETAIL_QUERY,
        { slug: productSlug, category: categorySlug },
        `produk ${categorySlug}/${productSlug}`
      ),
      fetchGroq(SERVICE_POINT_SUMMARY_QUERY, {}, 'ringkasan service point'),
    ]);

    if (!product) {
      throw new Error(`produk "${categorySlug}/${productSlug}" tidak ditemukan di Sanity`);
    }

    const t = getT('product', lang);
    const path = `/products/${categorySlug}/${productSlug}`;

    const name = loc(product.name, lang);
    const tagline = loc(product.tagline, lang);
    const description = loc(product.description, lang);
    const categoryName = loc(product.category?.name, lang);
    const catSlug = slugOf(product.category?.slug) || categorySlug;

    const hasMarketplace =
      product.marketplaceTokopedia || product.marketplaceShopee || product.marketplaceTiktok;

    // Metadata — pakai bahasa Indonesia sebagai sumber utama, sama seperti
    // versi Next (metadata situs ini memang berbahasa Indonesia).
    const metaName = loc(product.name, 'id') || loc(product.name, 'en') || productSlug;
    const metaTagline = loc(product.tagline, 'id') || loc(product.tagline, 'en');
    const metaDesc = loc(product.description, 'id') || loc(product.description, 'en');
    const brand = product.brand || 'HKM';
    const spCount = spSummary?.count || 0;

    const metaDescription =
      metaTagline ||
      (metaDesc ? metaDesc.slice(0, 160) : null) ||
      `${metaName} dari ${brand} — distributor resmi di Indonesia. ` +
        `Garansi resmi dan ${spCount}+ service point nasional.`;

    // Preload gambar hero (LCP) — di Next ini <link rel=preload> manual;
    // di sini hero <img> sudah fetchpriority=high, jadi preload-nya cukup
    // untuk kasus video (poster diunduh belakangan).
    const lcpImageUrl = product.heroImage?.asset
      ? urlFor(product.heroImage).width(800).fit('max').url()
      : null;

    const schemas = [
      jsonLd(schemaProduct({ product, categorySlug: catSlug, slug: productSlug })),
      jsonLd(
        schemaBreadcrumb([
          { name: lang === 'id' ? 'Beranda' : 'Home', url: langPath('/', lang) },
          {
            name: lang === 'id' ? 'Produk' : 'Products',
            url: langPath('/products', lang),
          },
          { name: categoryName, url: langPath(`/products/${catSlug}`, lang) },
          { name, url: langPath(path, lang) },
        ])
      ),
    ];

    const faqSchema = schemaFaqPage(product.faqs || []);
    if (faqSchema) schemas.push(jsonLd(faqSchema));

    // Lightbox hanya dimuat kalau produk punya galeri
    const scripts = ['/assets/js/product-tabs.js'];
    if (product.gallery?.length) scripts.push('/assets/js/lightbox.js');

    return page({
      meta: buildMeta({
        title: `${metaName} — ${brand} | HKM Indonesia`,
        description: metaDescription,
        path,
        image: sanityOgImage(product.heroImage),
        type: 'website',
      }),
      lang,
      path,
      settings,
      buildYear,
      gaId,
      scripts,
      schemas,
      preload: lcpImageUrl,
      body: html`
        <div style="background:#0A0B0E">
          ${productSubNav({ product, name, t })}

          <!-- Panel 1: Ikhtisar -->
          <div data-panel="overview" id="tab-overview" class="product-panel">
            ${productHero({ product, name, tagline, description, t, lang, now: buildTime })}

            <div id="features" style="scroll-margin-top:80px">
              ${keyHighlights({ highlights: product.keyHighlights, lang })}
              ${featureSections({ sections: product.featureSections || [], lang })}
              ${bundleValueSection({ bundleValue: product.bundleValue, lang })}
              ${connectivitySection({
                connectivity: product.connectivity,
                categorySlug: catSlug,
                visualStyle: product.connectivityVisualStyle,
                highlights: product.keyHighlights,
                lang,
              })}
            </div>

            ${hasMarketplace ? buySection({ product, t, lang }) : raw('')}
          </div>

          <!-- Panel 2: Spesifikasi -->
          <div data-panel="specs" id="tab-specs" class="product-panel">
            ${specsSection({ groups: product.specGroups || [], t, lang })}
          </div>

          <!-- Panel 3: Dukungan -->
          <div data-panel="support" id="tab-support" class="product-panel">
            ${supportSection({
              product,
              docs: product.supportDocs || [],
              documentation: product.documentation,
              summary: spSummary,
              t,
              lang,
            })}
          </div>

          ${relatedSection({
            products: product.relatedProducts,
            categoryName,
            categorySlug: catSlug,
            t,
            lang,
            now: buildTime,
          })}
        </div>
      `,
    });
  },
};
