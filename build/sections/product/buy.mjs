/**
 * Bagian "Beli" — port dari components/products/detail/BuySection.js
 */
import { html, raw, cls } from '../../html.mjs';
import { langPath } from '../../routes.mjs';

const MARKETPLACES = [
  { field: 'marketplaceTokopedia', name: 'Tokopedia', bg: '#00AA5B', extra: '' },
  { field: 'marketplaceShopee', name: 'Shopee', bg: '#EE4D2D', extra: '' },
  {
    field: 'marketplaceTiktok',
    name: 'TikTok Shop',
    bg: '#000',
    extra: 'border border-white/[0.18]',
  },
];

const OUTLINE_BTN =
  'inline-flex items-center gap-2 font-semibold text-[14px] px-7 py-[14px] rounded-[8px] ' +
  'text-white no-underline transition-all duration-200 border ' +
  'hover:border-cyan-bright hover:text-cyan-bright';

export function buySection({ product, t, lang }) {
  const datasheet = product.supportDocs?.find((d) => d.type === 'Datasheet');
  const available = MARKETPLACES.filter((m) => product[m.field]);

  return html`
    <section
      id="buy"
      class="px-5 lg:px-10 py-[100px]"
      style="background:#0A0B0E;scroll-margin-top:80px"
    >
      <div
        class="max-w-[1100px] mx-auto rounded-[24px] border border-white/[0.18] relative overflow-hidden"
        style="padding:clamp(28px,5vw,60px);background:linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,255,255,0.03))"
      >
        <div
          class="absolute inset-0 pointer-events-none"
          style="background:radial-gradient(ellipse at top right, rgba(0,255,255,0.22), transparent 60%)"
        ></div>

        <div
          class="relative z-[2] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-[60px] items-center"
        >
          <!-- Kiri: teks -->
          <div>
            <div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
              ${t.getYoursToday}
            </div>
            <h2
              class="font-display font-extrabold leading-[1.05] mb-4 page-gradient-title"
              style="font-size:clamp(32px,4vw,48px)"
            >
              <span>${t.availableOn}</span>
            </h2>
            <p class="text-[16px] text-hkm-300 leading-relaxed mb-7">${t.marketplaceDesc}</p>

            <div class="flex gap-3 flex-wrap">
              <a
                href="${langPath('/contact', lang)}?type=reseller_dealer"
                class="${OUTLINE_BTN}"
                style="border-color:rgba(255,255,255,0.18);background:transparent"
                >${t.b2bInquiry}</a
              >
              ${datasheet?.fileUrl
                ? html`<a
                    href="${datasheet.fileUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="${OUTLINE_BTN}"
                    style="border-color:rgba(255,255,255,0.18);background:transparent"
                    >${t.downloadDoc}</a
                  >`
                : raw('')}
            </div>
          </div>

          <!-- Kanan: tombol marketplace -->
          <div class="grid gap-[10px]">
            ${available.map(
              (m) =>
                html`<a
                  href="${product[m.field]}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="${cls(
                    'flex items-center justify-between gap-3 px-[18px] py-[14px] rounded-[8px] font-semibold text-[14px] text-white no-underline transition-all duration-200 hover:-translate-y-[2px]',
                    m.extra
                  )}"
                  style="background:${m.bg}"
                >
                  <span>${m.name}</span>
                  <small class="font-mono text-[11px] opacity-80 tracking-[0.1em]"
                    >${t.buyOnLabel}</small
                  >
                </a>`
            )}
          </div>
        </div>
      </div>
    </section>
  `;
}
