/**
 * 404 — port dari app/not-found.js + components/ui/NotFoundContent.js
 *
 * Bukan route biasa: tidak didaftarkan di pages/index.mjs (kalau didaftar,
 * hasilnya jadi /not-found/index.html). build.mjs memanggil render() ini
 * langsung dan menulis hasilnya ke:
 *   dist/404.html     (EN — dipakai Nginx & scripts/serve.mjs sebagai fallback)
 *   dist/id/404.html  (ID — bisa dipakai Nginx untuk URL /id/... yang tidak ada)
 *
 * Perbedaan dari versi React:
 *  - Bahasa ditentukan saat build (dua file), bukan dari localStorage.
 *  - Halaman diberi noindex (versi Next mengandalkan status 404 saja).
 *  - Semua link & aset memakai path absolut, karena file ini disajikan
 *    untuk URL apa pun (mis. /products/xyz/abc), bukan dari lokasinya sendiri.
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import { buildMeta } from '../lib/seo.mjs';
import { getT } from '../lib/translations.mjs';
import { FEATURED_PRODUCTS_QUERY } from '../lib/queries.mjs';
import { langPath } from '../routes.mjs';
import { fetchGroq } from '../sanity.mjs';
import { productCard } from '../partials/product-card.mjs';

const GRADIENT_DIGIT =
  'background:linear-gradient(135deg, #0066ff 30%, #00ffff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent';

function gridClass(count) {
  if (count === 1) return 'grid gap-4 max-w-[320px] mx-auto';
  if (count === 2) return 'grid gap-4 grid-cols-2 max-w-[680px] mx-auto';
  return 'grid gap-4 grid-cols-1 sm:grid-cols-3 max-w-[1000px] mx-auto';
}

function notFoundBody({ products, lang, now }) {
  const t = getT('notFound', lang);
  const productT = getT('product', lang);

  return html`<div class="relative overflow-hidden" style="background:#0A0B0E;min-height:100vh">
    <!-- Latar -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background:radial-gradient(ellipse 60% 40% at 30% 30%, rgba(0,102,255,0.18), transparent 60%), radial-gradient(ellipse 40% 30% at 80% 70%, rgba(0,184,217,0.08), transparent 60%)"
    ></div>
    <div
      class="absolute inset-0 pointer-events-none"
      style="background-image:linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse 70% 50% at 30% 30%, black 20%, transparent 70%);mask-image:radial-gradient(ellipse 70% 50% at 30% 30%, black 20%, transparent 70%)"
    ></div>

    <div class="relative z-[2] max-w-[1400px] mx-auto px-5 lg:px-10 py-[120px]">
      <!-- Hero 404 -->
      <div class="text-center mb-20">
        <div class="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-bright mb-6">
          ${t.eyebrow}
        </div>

        <!-- Angka 404 raksasa -->
        <div
          class="font-display font-extrabold leading-none tracking-[-0.06em] select-none mb-6"
          style="font-size:clamp(120px, 20vw, 280px);background:linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent"
          aria-hidden="true"
        >
          <span style="${GRADIENT_DIGIT}">4</span>0<span style="${GRADIENT_DIGIT}">4</span>
        </div>

        <h1
          class="font-display font-extrabold text-white leading-[1] tracking-[-0.04em] mb-5"
          style="font-size:clamp(28px, 4vw, 52px)"
        >
          ${t.heading}
        </h1>
        <p class="text-[16px] text-hkm-300 leading-relaxed max-w-[560px] mx-auto mb-10">
          ${t.description}
        </p>

        <!-- Link cepat -->
        <div class="flex flex-wrap gap-3 justify-center">
          <a
            href="${langPath('/products', lang)}"
            class="inline-flex items-center gap-2 font-semibold text-[14px] px-6 py-3 rounded-[8px] text-white no-underline transition-all duration-200 hover:opacity-90"
            style="background:#0066ff"
            >${t.browseProducts}</a
          >
          <a
            href="${langPath('/service-points', lang)}"
            class="inline-flex items-center gap-2 font-semibold text-[14px] px-6 py-3 rounded-[8px] no-underline transition-all duration-200"
            style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#E2E7EF"
            >${t.findServicePoint}</a
          >
          <a
            href="${langPath('/', lang)}"
            class="inline-flex items-center gap-2 font-semibold text-[14px] px-6 py-3 rounded-[8px] no-underline transition-all duration-200"
            style="background:transparent;border:1px solid rgba(255,255,255,0.10);color:#B8C5D9"
            >${t.backHome}</a
          >
        </div>
      </div>

      <!-- Produk unggulan -->
      ${products.length > 0
        ? html`<div>
            <div class="text-center mb-8">
              <p class="font-mono text-[12px] uppercase tracking-[0.15em] text-hkm-500">
                ${t.featuredTitle}
              </p>
            </div>
            <div class="${gridClass(products.length)}">
              ${products.map((product) =>
                productCard({
                  product,
                  lang,
                  categorySlug: product.categorySlug,
                  viewDetailsLabel: productT.viewDetails,
                  flagshipLabel: productT.flagship,
                  newLabel: productT.newBadge,
                  now,
                })
              )}
            </div>
          </div>`
        : raw('')}
    </div>
  </div>`;
}

/**
 * Render halaman 404 untuk satu bahasa.
 * Dipanggil dari build.mjs (bukan lewat ROUTES).
 */
export async function render({ settings, lang, buildYear, buildTime, gaId }) {
  let products = [];
  try {
    products = (await fetchGroq(FEATURED_PRODUCTS_QUERY, {}, 'featuredProducts')) ?? [];
  } catch {
    // Tidak kritis — 404 tetap tampil tanpa produk kalau Sanity tidak bisa dijangkau
  }

  const meta = {
    ...buildMeta({
      title: '404 — Page Not Found',
      description:
        lang === 'id'
          ? 'Halaman yang Anda cari tidak ada atau telah dipindahkan.'
          : "The page you're looking for doesn't exist or has been moved.",
      path: '/404',
    }),
    // Jangan diindeks, tapi link di dalamnya boleh diikuti
    robots: { index: false, follow: true },
  };

  return page({
    meta,
    lang,
    path: '/404',
    settings,
    buildYear,
    gaId,
    body: notFoundBody({ products, lang, now: buildTime || 0 }),
  });
}

/** Tujuan file per bahasa (relatif ke dist/). */
export const OUTPUT = { en: '404.html', id: 'id/404.html' };
