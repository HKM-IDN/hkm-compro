/**
 * /products/[category] — port dari app/products/[category]/page.js
 *                        + components/products/CategoryContent.js
 *
 * Route dinamis: `paths()` menggantikan generateStaticParams().
 *
 * Perbedaan dari versi React:
 *  - Filter merek / flagship / urutan dulu pakai useState + useMemo, dan
 *    hanya produk hasil filter yang di-render. Di sini SEMUA produk
 *    dirender ke HTML; JS (src/js/category-filter.js) menyembunyikan dan
 *    mengurutkan ulang lewat CSS `order`. Crawler melihat katalog penuh.
 *  - Sidebar sticky `top-[100px]` disesuaikan jadi 100px tetap (nav 80px
 *    + 20px jarak) — sama seperti sebelumnya, hanya kini konsisten.
 *  - Produk yang kategorinya tidak ketemu tidak memanggil notFound();
 *    route-nya memang tidak dibuat sejak awal, jadi tidak mungkin 404
 *    karena salah referensi (bug lama di Audit Protocol CLAUDE.md).
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import { buildMeta, jsonLd, schemaBreadcrumb } from '../lib/seo.mjs';
import { loc } from '../lib/i18n.mjs';
import { langPath, slugOf } from '../routes.mjs';
import { productCard } from '../partials/product-card.mjs';
import { CATEGORY_PAGE_QUERY } from '../lib/queries.mjs';
import { fetchGroq } from '../sanity.mjs';
import { LABELS } from '../content/category.mjs';

function categoryBody({ category, products, lang, now }) {
  const t = LABELS[lang] || LABELS.en;

  const categoryName = loc(category?.name, lang) || '';
  const categoryDesc = loc(category?.description, lang) || '';
  const categorySlug = slugOf(category?.slug) || '';

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
  const brandCount = (brand) => products.filter((p) => p.brand === brand).length;

  // Urutan "featured" = urutan dari GROQ. Dua urutan lain dihitung di sini
  // supaya JS tinggal memakai angka, tidak perlu membandingkan tanggal/teks.
  const byNewest = [...products].sort((a, b) => {
    const da = a.launchDate ? new Date(a.launchDate).getTime() : 0;
    const db = b.launchDate ? new Date(b.launchDate).getTime() : 0;
    return db - da;
  });
  const byName = [...products].sort((a, b) => loc(a.name, lang).localeCompare(loc(b.name, lang)));
  const rank = (list, p) => list.findIndex((x) => x._id === p._id);

  return html`
    <div style="background:#0A0B0E">
      <!-- ── Page Header ──────────────────────────────────────── -->
      <section
        class="px-5 lg:px-10 relative overflow-hidden"
        style="padding-top:140px;padding-bottom:60px;border-bottom:1px solid rgba(255,255,255,0.06)"
      >
        <div
          class="absolute inset-0 pointer-events-none"
          style="background:radial-gradient(ellipse 55% 65% at 70% 50%, rgba(0,102,255,0.18), transparent 60%)"
        ></div>

        <div class="max-w-[1400px] mx-auto relative z-[2]">
          <nav
            class="font-mono text-[12px] text-hkm-500 uppercase tracking-[0.1em] mb-4"
            aria-label="Breadcrumb"
          >
            <a
              href="${langPath('/', lang)}"
              class="text-hkm-300 hover:text-white transition-colors no-underline"
              >${t.home}</a
            >
            <span class="mx-2">/</span>
            <a
              href="${langPath('/products', lang)}"
              class="text-hkm-300 hover:text-white transition-colors no-underline"
              >${t.products}</a
            >
            <span class="mx-2">/</span>
            <span>${categoryName}</span>
          </nav>

          <h1
            class="font-display font-extrabold leading-[1.0] mb-4 product-gradient-title"
            style="font-size:clamp(36px,5vw,64px)"
          >
            <span>${categoryName}.</span>
          </h1>

          ${categoryDesc &&
          html`<p class="text-[17px] text-hkm-300 max-w-[680px] leading-relaxed">
            ${categoryDesc}
          </p>`}

          <div
            class="flex flex-wrap gap-8 mt-8 pt-8"
            style="border-top:1px solid rgba(255,255,255,0.06)"
          >
            <div>
              <div
                class="text-[32px] font-display font-extrabold leading-none"
                style="color:#00B8D9"
              >
                ${products.length}
              </div>
              <div class="text-[12px] text-hkm-300 uppercase tracking-[0.1em] font-mono mt-1">
                ${t.modelsAvailable}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Sidebar + grid ───────────────────────────────────── -->
      <section class="px-5 lg:px-10 py-[60px] pb-[120px]">
        <div class="max-w-[1400px] mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-10" data-cat-filter>
            <!-- Sidebar -->
            <aside
              class="lg:sticky lg:top-[100px] self-start rounded-[16px] p-6"
              style="background:#131419;border:1px solid rgba(255,255,255,0.06)"
            >
              ${brands.length > 0
                ? html`<div
                    class="mb-7 pb-6"
                    style="border-bottom:1px solid rgba(255,255,255,0.06)"
                  >
                    <div
                      class="font-mono text-[11px] uppercase tracking-[0.15em] mb-[14px]"
                      style="color:#00B8D9"
                    >
                      ${t.brandFilter}
                    </div>
                    ${brands.map(
                      (brand) =>
                        html`<label
                          class="flex items-center gap-[10px] py-2 cursor-pointer text-[13px] text-hkm-100 hover:text-white transition-colors"
                        >
                          <input
                            type="checkbox"
                            data-brand="${brand}"
                            class="w-4 h-4 rounded cursor-pointer accent-electric-blue flex-shrink-0"
                          />
                          <span>${brand}</span>
                          <span class="ml-auto font-mono text-[11px] text-hkm-500"
                            >${brandCount(brand)}</span
                          >
                        </label>`
                    )}
                  </div>`
                : raw('')}

              <div data-featured-wrap>
                <div
                  class="font-mono text-[11px] uppercase tracking-[0.15em] mb-[14px]"
                  style="color:#00B8D9"
                >
                  ${t.featuredFilter}
                </div>
                <label
                  class="flex items-center gap-[10px] py-2 cursor-pointer text-[13px] text-hkm-100 hover:text-white transition-colors"
                >
                  <input
                    type="checkbox"
                    data-featured-only
                    class="w-4 h-4 rounded cursor-pointer accent-electric-blue flex-shrink-0"
                  />
                  <span>${t.featuredOnly}</span>
                </label>
              </div>

              <button
                type="button"
                data-clear-filters
                hidden
                class="text-[12px] font-mono text-hkm-500 hover:text-white transition-colors uppercase tracking-[0.1em] cursor-pointer bg-transparent border-none mt-4"
              >
                ${t.clearFilters}
              </button>
            </aside>

            <!-- Main -->
            <div>
              <div
                class="flex flex-wrap justify-between items-center gap-3 mb-6 pb-4"
                style="border-bottom:1px solid rgba(255,255,255,0.06)"
              >
                <div class="text-[14px] text-hkm-300">
                  ${t.showing}
                  <strong class="text-white font-bold">
                    <span data-shown-count>${products.length}</span> ${t.of} ${products.length}
                  </strong>
                  ${categoryName}
                </div>
                <div class="flex items-center gap-[10px]">
                  <label
                    for="sort-order"
                    class="font-mono text-[11px] text-hkm-500 uppercase tracking-[0.1em]"
                    >${t.sortLabel}</label
                  >
                  <select
                    id="sort-order"
                    data-sort
                    class="text-[13px] px-3 py-2 rounded-[6px] text-white cursor-pointer outline-none"
                    style="background:#131419;border:1px solid rgba(255,255,255,0.08)"
                  >
                    <option value="featured">${t.sortFeatured}</option>
                    <option value="newest">${t.sortNewest}</option>
                    <option value="name">${t.sortName}</option>
                  </select>
                </div>
              </div>

              <p data-no-results hidden class="text-hkm-500 py-16 text-center text-[15px]">
                ${t.noResults}
              </p>

              <div class="grid grid-cols-2 lg:grid-cols-3 gap-4" data-product-grid>
                ${products.map(
                  (product) =>
                    html`<div
                      class="contents-wrapper flex"
                      data-product
                      data-brand="${product.brand || ''}"
                      data-featured="${product.isFeatured ? '1' : '0'}"
                      data-rank-featured="${products.indexOf(product)}"
                      data-rank-newest="${rank(byNewest, product)}"
                      data-rank-name="${rank(byName, product)}"
                    >
                      ${productCard({
                        product,
                        lang,
                        categorySlug,
                        viewDetailsLabel: t.viewDetails,
                        flagshipLabel: t.flagship || 'Flagship',
                        newLabel: t.newLabel || 'New',
                        variant: 'category',
                        now,
                      })}
                    </div>`
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export const route = {
  name: 'products/[category]',

  /** Pengganti generateStaticParams() — satu entry per kategori aktif. */
  paths({ categories }) {
    return categories
      .map((cat) => slugOf(cat.slug))
      .filter(Boolean)
      .map((slug) => ({ path: `/products/${slug}`, categorySlug: slug }));
  },

  async render({ categorySlug, servicePoints, settings, lang, buildYear, gaId, buildTime }) {
    const data = await fetchGroq(
      CATEGORY_PAGE_QUERY,
      { slug: categorySlug },
      `kategori ${categorySlug}`
    );

    if (!data?.category) {
      throw new Error(`kategori "${categorySlug}" tidak ditemukan di Sanity`);
    }

    const products = data.products || [];
    const name = loc(data.category.name, 'id') || loc(data.category.name, 'en') || categorySlug;
    const desc = loc(data.category.description, 'id') || loc(data.category.description, 'en');
    const spCount = servicePoints?.length || 0;

    return page({
      meta: buildMeta({
        title: `${name} — Produk HKM Indonesia`,
        description:
          desc ||
          `Temukan ${products.length > 0 ? products.length + ' ' : ''}produk ${name} dari HKM. ` +
            `Distributor resmi dengan garansi resmi dan ${spCount}+ service point di seluruh Indonesia.`,
        path: `/products/${categorySlug}`,
      }),
      lang,
      path: `/products/${categorySlug}`,
      settings,
      buildYear,
      gaId,
      scripts: ['/assets/js/category-filter.js'],
      schemas: [
        jsonLd(
          schemaBreadcrumb([
            { name: lang === 'id' ? 'Beranda' : 'Home', url: langPath('/', lang) },
            {
              name: lang === 'id' ? 'Produk' : 'Products',
              url: langPath('/products', lang),
            },
            { name, url: langPath(`/products/${categorySlug}`, lang) },
          ])
        ),
      ],
      body: categoryBody({ category: data.category, products, lang, now: buildTime }),
    });
  },
};
