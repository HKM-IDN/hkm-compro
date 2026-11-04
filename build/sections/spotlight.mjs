/**
 * Section 3: Spotlight — port dari components/sections/SpotlightSection.js
 *
 * Layout "bento": 1 kartu besar di kolom kiri (span 1–2 baris) + sampai
 * 4 kartu kecil mengalir ke kolom 2 & 3.
 *
 * Perbedaan dari versi React:
 *  - Hover kartu (border/boxShadow/transform lewat onMouseEnter) → class
 *    .spot-card-lg dan .spot-card-sm.
 *  - Versi React me-render FeaturedCard + SmallCard DUA KALI (sekali untuk
 *    desktop, sekali untuk mobile) — artinya produk yang sama muncul dua
 *    kali di DOM dan gambarnya berpotensi diunduh dua kali. Di sini cukup
 *    satu grid; susunan desktop vs mobile diatur CSS (.spot-grid).
 */
import { html, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { urlFor } from '../sanity.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { langPath, slugOf } from '../routes.mjs';
import { SPOTLIGHT_LABELS } from '../content/homepage.mjs';

/** Perangkat placeholder saat produk belum punya heroImage. */
function placeholderDevice(name) {
  return html`<div class="absolute inset-0 flex items-center justify-center z-[2]">
    <div
      class="relative rounded-[20px] border flex flex-col items-center justify-center"
      style="width:60%;aspect-ratio:1/1;background:linear-gradient(145deg,#1a1c24,#0A0B0E);border:1px solid rgba(0,184,217,0.2);box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(0,102,255,0.15)"
    >
      <div
        class="absolute top-[12%] left-[25%] right-[25%] h-[3px] rounded-full"
        style="background:linear-gradient(90deg, transparent, #00B8D9, transparent);box-shadow:0 0 12px #00B8D9"
      ></div>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00B8D9"
        stroke-width="1.5"
        class="w-10 h-10 opacity-50"
        aria-hidden="true"
      >
        <rect x="3" y="9" width="18" height="9" rx="2" />
        <path d="M7 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      </svg>
      ${name &&
      html`<p
        class="font-display text-[14px] font-bold text-white text-center px-4 mt-3 opacity-60"
      >
        ${name}
      </p>`}
    </div>
  </div>`;
}

/** Visual gambar produk ala Razer (grid bg + underglow). */
function razerImage({ product, sizes = '50vw', priority = false }) {
  const name = loc(product.name, 'en');

  return html`<div class="relative w-full h-full">
    <div
      class="absolute inset-0 pointer-events-none"
      style="background:linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px),radial-gradient(ellipse at 50% 100%, rgba(0,102,255,0.18), transparent 60%);background-size:40px 40px, 40px 40px, 100% 100%"
    ></div>

    <div
      class="absolute pointer-events-none z-[1] transition-opacity duration-[400ms] opacity-70 group-hover:opacity-100"
      style="width:65%;aspect-ratio:2/1;bottom:4%;left:50%;transform:translateX(-50%);background:rgba(0,184,217,0.35);filter:blur(32px)"
    ></div>

    ${product.heroImage?.asset
      ? html`<div
          class="absolute z-[2] transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03] group-hover:-translate-y-1"
          style="inset:14%"
        >
          <img
            src="${urlFor(product.heroImage).width(600).fit('max').url()}"
            srcset="
              ${[600, 1200]
                .map((w) => `${urlFor(product.heroImage).width(w).fit('max').url()} ${w}w`)
                .join(', ')}
            "
            sizes="${sizes}"
            alt="${name}"
            loading="${priority ? 'eager' : 'lazy'}"
            decoding="${priority ? 'sync' : 'async'}"
            ${priority ? raw('fetchpriority="high"') : raw('')}
            class="w-full h-full object-contain"
            style="filter:drop-shadow(0 20px 40px rgba(0,184,217,0.30))"
          />
        </div>`
      : placeholderDevice(name)}
  </div>`;
}

function productHref(product, lang) {
  const slug = slugOf(product.slug) || '';
  const catSlug = product.categorySlug || 'products';
  return slug ? langPath(`/products/${catSlug}/${slug}`, lang) : '#';
}

/** Kartu besar — gambar kiri, teks kanan. */
function featuredCard({ product, t, lang }) {
  const name = loc(product.name, lang);
  const tagline = loc(product.tagline, lang);
  const desc = loc(product.description, lang);
  const highlights = product.keyHighlights || [];

  return html`<a
    href="${productHref(product, lang)}"
    class="spot-card-lg group relative flex flex-col lg:flex-row rounded-[20px] overflow-hidden no-underline h-full transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
    style="background:#131419;border:1px solid rgba(255,255,255,0.06)"
  >
    <div
      class="relative lg:w-[48%] flex-shrink-0 overflow-hidden"
      style="aspect-ratio:4/3;max-height:420px"
    >
      ${razerImage({ product, sizes: '(max-width: 980px) 100vw, 30vw', priority: true })}
    </div>

    <div class="flex flex-col justify-center p-7 lg:p-9 flex-1 relative">
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 80% 60% at 80% 40%, rgba(0,102,255,0.08), transparent 70%)"
      ></div>

      <div class="relative z-[2]">
        ${product.brand &&
        html`<p class="font-mono text-[11px] uppercase tracking-[0.2em] mb-2" style="color:#00B8D9">
          ${product.brand}
        </p>`}
        ${tagline &&
        html`<p class="font-mono text-[11px] text-hkm-500 uppercase tracking-[0.15em] mb-3">
          ${tagline}
        </p>`}

        <h3
          class="font-display font-extrabold leading-[1.0] tracking-[-0.03em] mb-4 product-gradient-title"
          style="font-size:clamp(28px,3.5vw,48px)"
        >
          <span>${name}</span>
        </h3>

        ${desc &&
        html`<p class="text-[14px] text-hkm-300 leading-[1.65] mb-5 line-clamp-3">${desc}</p>`}
        ${highlights.length > 0
          ? html`<ul class="list-none p-0 m-0 mb-5">
              ${highlights.slice(0, 3).map(
                (h) =>
                  html`<li
                    class="py-2 border-t border-white/[0.06] flex items-center gap-2.5 text-[13px] text-hkm-100 last:border-b"
                  >
                    <span class="font-bold text-[15px] flex-shrink-0" style="color:#00B8D9">+</span>
                    <span>
                      ${loc(h.label, lang)}${h.value ? ': ' : ''}
                      ${h.value && html`<strong class="text-white">${h.value}</strong>`}
                    </span>
                  </li>`
              )}
            </ul>`
          : raw('')}

        <span
          class="inline-flex items-center gap-2 font-semibold text-[13px] transition-all duration-300"
          style="color:#00B8D9"
          >${t.viewDetail}</span
        >
      </div>
    </div>
  </a>`;
}

/** Kartu kecil — gambar atas, teks bawah. */
function smallCard({ product, t, lang }) {
  const name = loc(product.name, lang);
  const tagline = loc(product.tagline, lang);

  return html`<a
    href="${productHref(product, lang)}"
    class="spot-card-sm group relative flex flex-col rounded-[20px] overflow-hidden no-underline transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
    style="background:#131419;border:1px solid rgba(255,255,255,0.06)"
  >
    <div class="relative overflow-hidden flex-shrink-0" style="aspect-ratio:4/3;max-height:220px">
      ${razerImage({ product, sizes: '(max-width: 980px) 50vw, 20vw' })}
    </div>

    <div class="p-5 flex flex-col flex-1">
      ${product.brand &&
      html`<p
        class="font-mono text-[10px] uppercase tracking-[0.15em] mb-1"
        style="color:#00B8D9;opacity:0.7"
      >
        ${product.brand}
      </p>`}

      <h3 class="font-display text-[16px] font-semibold text-white leading-[1.3] mb-1 flex-1">
        ${name}
      </h3>

      ${tagline && html`<p class="text-[12px] text-hkm-500 mb-3 line-clamp-1">${tagline}</p>`}

      <span
        class="text-[12px] font-semibold inline-flex items-center gap-1 mt-auto transition-[gap] duration-300 group-hover:gap-2"
        style="color:#00B8D9"
        >${t.viewDetail}</span
      >
    </div>
  </a>`;
}

export function spotlightSection({ data, lang }) {
  const t = SPOTLIGHT_LABELS[lang] || SPOTLIGHT_LABELS.en;

  const products = data?.spotlightProducts || [];
  const title = loc(data?.spotlightSectionTitle, lang) || t.title;

  if (!products.length) return raw('');

  const featured = products[0];
  const smallCards = products.slice(1, 5); // maksimal 4 kartu kecil
  const rowSpan = smallCards.length <= 2 ? 1 : 2;

  return html`
    <section id="spotlight" class="relative px-5 lg:px-10 py-[120px]" style="background:#0A0B0E">
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 60% 40% at 15% 22%, rgba(0,102,255,0.15), transparent 55%),radial-gradient(ellipse 50% 35% at 78% 68%, rgba(0,184,217,0.09), transparent 55%)"
      ></div>

      <div class="max-w-[1400px] mx-auto relative z-[2]">
        <div class="text-center mb-14">
          <p
            class="font-mono text-[12px] uppercase tracking-[0.2em] mb-[14px]"
            style="color:#00B8D9"
          >
            ${t.eyebrow}
          </p>
          <h2
            class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] max-w-[800px] mx-auto mb-4 product-gradient-title"
            style="font-size:clamp(32px,4.5vw,56px)"
          >
            ${raw(sanitizeHtml(title))}
          </h2>
          <p class="text-[16px] text-hkm-300 max-w-[580px] mx-auto leading-[1.6]">${t.sub}</p>
        </div>

        ${products.length === 1
          ? featuredCard({ product: featured, t, lang })
          : html`<div class="spot-grid gap-4" data-row-span="${rowSpan}">
              <div class="spot-featured" style="--row-span:${rowSpan}">
                ${featuredCard({ product: featured, t, lang })}
              </div>
              ${smallCards.map((p) => smallCard({ product: p, t, lang }))}
              ${rowSpan === 2 && smallCards.length === 3
                ? html`<div
                    class="rounded-[20px] hidden lg:block"
                    style="background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.04)"
                  ></div>`
                : raw('')}
            </div>`}
      </div>
    </section>
  `;
}
