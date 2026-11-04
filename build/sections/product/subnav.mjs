/**
 * Sub-nav produk — port dari components/products/detail/ProductSubNav.js
 *
 * Perbedaan penting dari versi React:
 *
 *   Versi React menyimpan tab aktif di useState, dan HANYA me-render tab
 *   yang sedang aktif. Artinya isi "Spesifikasi" dan "Dukungan" TIDAK PERNAH
 *   ada di HTML — Google tidak pernah melihat tabel spesifikasi produk.
 *
 *   Di sini ketiga tab dirender penuh ke HTML; src/js/product-tabs.js yang
 *   menyembunyikan dua di antaranya. Jadi spesifikasi ikut terindeks, dan
 *   tanpa JavaScript pun seluruh isi halaman tetap terbaca.
 *
 *   Tombol tab juga punya href="#specs" dsb, jadi tetap berfungsi sebagai
 *   anchor biasa kalau JS gagal dimuat.
 */
import { html, cls } from '../../html.mjs';

export function productSubNav({ product, name, t }) {
  const TABS = [
    { key: 'overview', label: t.overview },
    { key: 'specs', label: t.specifications },
    { key: 'support', label: t.support },
  ];

  return html`
    <nav
      class="product-subnav sticky z-[90] border-b border-white/10"
      style="background:rgba(20,20,20,0.95);backdrop-filter:blur(24px)"
      data-product-tabs
    >
      <!-- Desktop -->
      <div class="hidden lg:flex items-center max-w-[1400px] mx-auto px-10">
        <div class="flex items-center gap-3 py-0 mr-8 flex-shrink-0">
          <div class="w-px h-5 bg-white/20"></div>
          <div class="font-display font-bold text-[15px] text-white leading-tight">
            ${product.brand &&
            html`<small
              class="font-mono text-[10px] text-hkm-500 uppercase tracking-[0.1em] mr-2 font-normal block"
              >${product.brand}</small
            >`}
            ${name}
          </div>
        </div>

        <ul class="flex gap-7 flex-1 justify-center list-none m-0 p-0">
          ${TABS.map(
            (tab) =>
              html`<li>
                <a
                  href="#tab-${tab.key}"
                  data-tab="${tab.key}"
                  class="${cls(
                    'product-tab block text-[13px] py-[18px] border-b-2 border-transparent transition-colors cursor-pointer no-underline text-hkm-300',
                    '[@media(hover:hover)]:hover:text-cyan-bright'
                  )}"
                  >${tab.label}</a
                >
              </li>`
          )}
        </ul>

        <a
          href="#buy"
          data-tab-goto="overview"
          class="flex-shrink-0 font-semibold text-[13px] px-4 py-[9px] rounded-[6px] text-white no-underline transition-all duration-200 hover:bg-cyan-bright hover:text-dark-2"
          style="background:#0066ff"
          >${t.buyNow}</a
        >
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <div class="flex overflow-x-auto" style="scrollbar-width:none">
          ${TABS.map(
            (tab) =>
              html`<a
                href="#tab-${tab.key}"
                data-tab="${tab.key}"
                class="product-tab product-tab-mobile flex-1 text-[13px] text-center py-3 relative transition-colors whitespace-nowrap min-w-[80px] no-underline text-hkm-300"
                >${tab.label}</a
              >`
          )}
        </div>
      </div>
    </nav>
  `;
}
