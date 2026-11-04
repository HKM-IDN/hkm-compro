/**
 * /products — port dari app/products/page.js + components/products/ProductsContent.js
 *
 * Perbedaan dari versi React:
 *  - Filter kategori dulu pakai useState: hanya kategori terpilih yang
 *    di-render. Artinya crawler cuma melihat kategori pertama.
 *    Di sini SEMUA kategori dirender ke HTML, lalu JS (src/js/filter.js)
 *    menyembunyikan yang tidak dipilih. Hasilnya: isi lengkap terbaca
 *    Google, filter tetap instan, dan tanpa JS pun semua produk tampil.
 *  - Filter bar `top: 64px` diperbaiki jadi 80px — tinggi nav sebenarnya.
 *  - EmptyState dirender di HTML dan disembunyikan; JS yang memunculkan
 *    kalau filter tidak menghasilkan apa-apa.
 */
import { page } from '../layout.mjs';
import { html, raw, cls } from '../html.mjs';
import { buildMeta, jsonLd, schemaBreadcrumb } from '../lib/seo.mjs';
import { loc } from '../lib/i18n.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { langPath } from '../routes.mjs';
import { CAT_ICONS } from '../partials/icons.mjs';
import { productCard } from '../partials/product-card.mjs';
import { LABELS } from '../content/products.mjs';

function categoryBlock({ cat, lang, t, now }) {
  if (!cat.products.length) return raw('');

  return html`<div
    class="category-block mb-[80px] last:mb-0"
    data-category="${cat.slug?.current || ''}"
  >
    <div
      class="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3 mb-8 pb-4"
      style="border-bottom:1px solid rgba(255,255,255,0.06)"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex-shrink-0 flex items-center justify-center rounded-[12px]"
          style="width:44px;height:44px;color:#00B8D9;background:linear-gradient(135deg,rgba(0,184,217,0.12),rgba(0,102,255,0.06));border:1px solid rgba(0,184,217,0.2)"
        >
          ${CAT_ICONS[cat.icon] || CAT_ICONS.router}
        </div>
        <h2 class="font-display text-[26px] font-bold text-white tracking-[-0.03em]">
          ${loc(cat.name, lang)}
        </h2>
        <span class="font-mono text-[12px] text-hkm-500 uppercase tracking-[0.1em]">
          ${t.productsLabel(cat.products.length)}
        </span>
      </div>
      <a
        href="${langPath(`/products/${cat.slug?.current}`, lang)}"
        class="text-[13px] font-semibold inline-flex items-center gap-1.5 no-underline transition-[gap] duration-200 hover:gap-3"
        style="color:#00B8D9"
        >${t.viewAll}</a
      >
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      ${cat.products.map((product) =>
        productCard({ product, lang, viewDetailsLabel: t.viewDetails, now })
      )}
    </div>
  </div>`;
}

function filterChip({ value, label, count, icon, active }) {
  return html`<button
    type="button"
    data-filter="${value}"
    aria-pressed="${active ? 'true' : 'false'}"
    class="${cls(
      'filter-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer',
      active ? 'is-active' : 'text-hkm-100'
    )}"
  >
    ${icon ? html`<span style="opacity:0.8">${icon}</span>` : raw('')} ${label}
    <span class="font-mono text-[11px] opacity-70">(${count})</span>
  </button>`;
}

function productsBody({ categories, lang, now }) {
  const t = LABELS[lang] || LABELS.en;

  const totalProducts = categories.reduce(
    (sum, c) => sum + (c.productCount ?? c.products?.length ?? 0),
    0
  );

  return html`
    <!-- ── PAGE HEADER ─────────────────────────────────────────── -->
    <section
      class="relative overflow-hidden border-b"
      style="background:#0A0B0E;border-color:rgba(255,255,255,0.06);padding:clamp(100px,10vw,140px) clamp(20px,3vw,40px) clamp(40px,5vw,60px)"
    >
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 55% 65% at 25% 50%, rgba(0,102,255,0.18), transparent 60%)"
      ></div>

      <div class="relative z-[2] max-w-[1400px] mx-auto">
        <nav
          class="font-mono text-[12px] text-hkm-500 uppercase tracking-[0.1em] mb-4"
          aria-label="Breadcrumb"
        >
          <a
            href="${langPath('/', lang)}"
            class="text-hkm-300 hover:text-white transition-colors duration-200 no-underline"
            >${t.breadcrumbHome}</a
          >
          <span class="mx-2">/</span>
          <span>${t.breadcrumbPage}</span>
        </nav>

        <h1
          class="product-gradient-title font-display font-extrabold leading-[1.0] tracking-[-0.04em] mb-4"
          style="font-size:clamp(40px,6vw,72px)"
        >
          ${raw(sanitizeHtml(t.pageTitle))}
        </h1>
        <p class="text-[17px] text-hkm-300 max-w-[680px] leading-[1.6]">${t.pageSub}</p>
      </div>
    </section>

    <!-- ── FILTER BAR ──────────────────────────────────────────── -->
    <div
      class="z-50 sticky"
      data-filter-bar
      style="top:80px;background:rgba(10,11,14,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);padding:clamp(14px,2vw,28px) clamp(20px,3vw,40px)"
    >
      <div class="flex gap-2.5 flex-wrap max-w-[1400px] mx-auto items-center">
        <span class="font-mono text-[11px] text-hkm-500 uppercase tracking-[0.15em] mr-3">
          ${t.filterLabel}
        </span>

        ${filterChip({
          value: 'all',
          label: t.filterAll,
          count: totalProducts,
          icon: null,
          active: true,
        })}
        ${categories.map((cat) =>
          filterChip({
            value: cat.slug?.current || '',
            label: loc(cat.name, lang),
            count: cat.productCount ?? cat.products?.length ?? 0,
            icon: CAT_ICONS[cat.icon],
            active: false,
          })
        )}
      </div>
    </div>

    <!-- ── PRODUK PER KATEGORI ─────────────────────────────────── -->
    <section
      style="background:#0A0B0E;padding:clamp(40px,5vw,60px) clamp(20px,3vw,40px) clamp(80px,8vw,120px)"
    >
      <div class="max-w-[1400px] mx-auto" data-category-list>
        <!-- Empty state: tersembunyi, dimunculkan JS kalau filter kosong -->
        <div data-empty-state hidden class="text-center py-20">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-[16px] mb-5 text-hkm-500"
            style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              />
              <path d="m7.5 4.27 9 5.15M3.3 7 12 12l8.7-5M12 22V12" />
            </svg>
          </div>
          <p class="font-display text-[20px] font-bold text-white mb-2">${t.emptyState}</p>
          <p class="text-[14px] text-hkm-300">
            ${lang === 'id'
              ? 'Coba pilih kategori lain atau lihat semua produk.'
              : 'Try selecting a different category or browse all products.'}
          </p>
        </div>

        ${categories.map((cat) => categoryBlock({ cat, lang, t, now }))}
      </div>
    </section>
  `;
}

export const route = {
  name: 'products',
  path: '/products',
  render({ categories, products, settings, lang, buildYear, gaId, buildTime }) {
    // Kelompokkan produk per kategori (dulu dilakukan di Server Component)
    const productMap = {};
    for (const p of products) {
      if (!productMap[p.categoryId]) productMap[p.categoryId] = [];
      productMap[p.categoryId].push(p);
    }
    const categoriesWithProducts = categories.map((cat) => ({
      ...cat,
      products: productMap[cat._id] || [],
    }));

    return page({
      meta: buildMeta({
        title: 'Produk HKM — Router 4G, Mobile WiFi, IP Kamera & Smart Home',
        description:
          'Jelajahi 6 kategori produk konektivitas HKM: CPE router 4G/5G, Mobile WiFi portabel, ' +
          'SIM data khusus, IP kamera, dash cam, dan smart home. Distributor resmi Indonesia dengan garansi resmi.',
        path: '/products',
      }),
      lang,
      path: '/products',
      settings,
      buildYear,
      gaId,
      scripts: ['/assets/js/filter.js'],
      schemas: [
        jsonLd(
          schemaBreadcrumb([
            { name: lang === 'id' ? 'Beranda' : 'Home', url: langPath('/', lang) },
            {
              name: lang === 'id' ? 'Produk' : 'Products',
              url: langPath('/products', lang),
            },
          ])
        ),
      ],
      body: productsBody({ categories: categoriesWithProducts, lang, now: buildTime }),
    });
  },
};
