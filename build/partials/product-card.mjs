/**
 * product-card.mjs — port dari components/ui/ProductCard.js
 *                    + ProductImage.js + MarketplaceIcons.js
 *
 * Perbedaan penting dari versi React:
 *
 * 1. STRUKTUR LINK. Versi React membungkus seluruh kartu dengan <Link>,
 *    lalu menaruh <button> marketplace DI DALAMNYA. Itu HTML tidak valid
 *    (kontrol interaktif bersarang di dalam anchor), dan karena itu
 *    butuh JS `e.stopPropagation()` + `window.open()` supaya klik
 *    marketplace tidak ikut membuka halaman produk.
 *
 *    Di sini dipakai pola "stretched link": kartu adalah <article>, link
 *    produk adalah <a> absolut yang menutupi kartu (z-1), dan link
 *    marketplace adalah <a> biasa di atasnya (z-2). HTML valid, dan
 *    marketplace jalan tanpa JS sama sekali.
 *
 * 2. HOVER. boxShadow/border/transform yang dulu diatur lewat
 *    onMouseEnter/onMouseLeave → class CSS .product-card.
 *
 * 3. BADGE "new". getBadge() memanggil Date.now() saat render. Di sini
 *    waktu dilewatkan sebagai argumen `now` (build time) — sesuai aturan
 *    CLAUDE.md: jangan panggil Date.now() di dalam render.
 */
import { html, cls, attrs, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { urlFor } from '../sanity.mjs';
import { langPath } from '../routes.mjs';

const MARKETPLACES = [
  { field: 'marketplaceTokopedia', color: '#00AA5B', label: 'Tokopedia', text: 'T', extra: '' },
  { field: 'marketplaceShopee', color: '#EE4D2D', label: 'Shopee', text: 'S', extra: '' },
  {
    field: 'marketplaceTiktok',
    color: '#000',
    label: 'TikTok Shop',
    text: 'TT',
    extra: 'border border-white/10',
  },
];

/** Badge kartu: 'flagship' | 'new' | null. `now` = waktu build (ms). */
function getBadge(product, now) {
  if (product.isFeatured) return 'flagship';
  if (product.launchDate) {
    const ageDays = (now - new Date(product.launchDate).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays < 90) return 'new';
  }
  return null;
}

/** Gambar produk ala Razer: grid bg + underglow + hover scale. */
export function productImage({
  product,
  lang = 'en',
  sizes = '(max-width: 980px) 50vw, 25vw',
  width = 400,
  inset = '12%',
  glowColor = 'rgba(0,184,217,0.3)',
}) {
  const hasImage = Boolean(product.heroImage?.asset);

  return html`<div class="relative w-full h-full flex items-center justify-center">
    <div
      class="absolute inset-0 pointer-events-none"
      style="background:linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px),radial-gradient(ellipse at 50% 100%, rgba(0,102,255,0.15), transparent 60%);background-size:40px 40px, 40px 40px, 100% 100%"
    ></div>

    <div
      class="absolute pointer-events-none z-[1] opacity-60 group-hover:opacity-100 transition-opacity duration-[400ms]"
      style="width:60%;aspect-ratio:2/1;bottom:4%;left:50%;transform:translateX(-50%);background:${glowColor};filter:blur(28px)"
    ></div>

    ${hasImage
      ? html`<div
          class="absolute z-[2] transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03] group-hover:-translate-y-1"
          style="inset:${inset}"
        >
          <img
            src="${urlFor(product.heroImage).width(width).fit('max').url()}"
            srcset="
              ${[width, width * 2]
                .map((w) => `${urlFor(product.heroImage).width(w).fit('max').url()} ${w}w`)
                .join(', ')}
            "
            sizes="${sizes}"
            alt="${loc(product.name, lang) || ''}"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-contain"
            style="filter:drop-shadow(0 16px 32px rgba(0,184,217,0.25))"
          />
        </div>`
      : html`<div class="absolute inset-0 flex items-center justify-center z-[2]">
          <div
            class="rounded-[8px]"
            style="width:50%;aspect-ratio:1.3/1;background:linear-gradient(145deg,#1a1c24,#0A0B0E);box-shadow:0 16px 32px rgba(0,0,0,0.4)"
          ></div>
        </div>`}
  </div>`;
}

/** Ikon marketplace — <a> asli, bukan <button> + JS. */
export function marketplaceIcons({ product }) {
  const available = MARKETPLACES.filter((m) => product[m.field]);
  if (!available.length) return raw('');

  return html`<div class="relative z-[2] flex gap-1">
    ${available.map(
      (m) =>
        html`<a
          href="${product[m.field]}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${m.label}"
          class="${cls(
            'w-[22px] h-[22px] rounded flex items-center justify-center text-[9px] font-bold text-white no-underline',
            m.extra
          )}"
          style="background:${m.color}"
          >${m.text}</a
        >`
    )}
  </div>`;
}

/**
 * Kartu produk.
 *
 * @param {object} opts
 * @param {object} opts.product
 * @param {string} opts.lang
 * @param {string} opts.categorySlug  override slug kategori
 * @param {string} opts.viewDetailsLabel
 * @param {string} opts.variant  'default' | 'category'
 * @param {number} opts.now      waktu build (ms) untuk hitung badge "new"
 */
export function productCard({
  product,
  lang = 'en',
  categorySlug,
  viewDetailsLabel,
  flagshipLabel = 'Flagship',
  newLabel = 'New',
  variant = 'default',
  now = 0,
}) {
  const badge = getBadge(product, now);
  const slug = product.slug?.current || '';
  const catSlug = categorySlug || product.categorySlug || '';
  const name = loc(product.name, lang);
  const highlights = product.keyHighlights || [];
  const isCategory = variant === 'category';
  const href = langPath(`/products/${catSlug}/${slug}`, lang);

  const badgeMarkup =
    badge === 'flagship'
      ? html`<span
          class="absolute top-3 left-3 z-[3] font-mono text-[10px] font-medium uppercase tracking-[0.1em] px-[10px] py-1 rounded-[6px]"
          style="background:linear-gradient(135deg,#0066ff,#00B8D9);color:#0A0B0E"
          >${flagshipLabel}</span
        >`
      : badge === 'new'
        ? html`<span
            class="absolute top-3 left-3 z-[3] font-mono text-[10px] font-medium uppercase tracking-[0.1em] px-[10px] py-1 rounded-[6px]"
            style="background:rgba(0,102,255,0.9);color:white"
            >${newLabel}</span
          >`
        : raw('');

  return html`<article
    class="product-card group relative flex flex-col rounded-[20px] overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
    style="background:#131419;border:1px solid rgba(255,255,255,0.06)"
  >
    <!-- Thumbnail -->
    <div class="relative overflow-hidden flex-shrink-0" style="aspect-ratio:4/3">
      ${productImage({ product, lang })} ${badgeMarkup}
    </div>

    <!-- Info -->
    <div class="${cls('flex flex-col flex-1', isCategory ? 'p-5' : 'p-[18px]')}">
      ${product.brand &&
      html`<p
        class="font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5 opacity-60"
        style="color:#00B8D9"
      >
        ${product.brand}
      </p>`}

      <h3
        class="${cls(
          'font-semibold text-white leading-[1.3] mb-2 flex-1',
          isCategory ? 'font-display text-[17px] mb-[10px]' : 'text-[15px]'
        )}"
      >
        <!-- Stretched link: menutupi seluruh kartu, tapi tetap satu <a> di DOM -->
        <a href="${href}" class="product-card-link no-underline text-inherit">${name}</a>
      </h3>

      ${isCategory && highlights.length > 0
        ? html`<div class="flex flex-wrap gap-[6px] mb-4 flex-1">
            ${highlights
              .slice(0, 4)
              .map(
                (kh) =>
                  html`<span
                    class="text-[11px] px-2 py-1 rounded font-mono text-hkm-300"
                    style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)"
                    >${kh.value}</span
                  >`
              )}
          </div>`
        : raw('')}

      <div
        class="${cls(
          'flex justify-between items-center mt-auto',
          isCategory && 'pt-3 border-t border-white/[0.06]'
        )}"
      >
        <span
          class="text-[12px] font-semibold inline-flex items-center gap-1 transition-[gap] duration-300 group-hover:gap-2"
          style="color:#00B8D9"
          >${viewDetailsLabel}</span
        >
        ${isCategory ? marketplaceIcons({ product }) : raw('')}
      </div>
    </div>
  </article>`;
}
