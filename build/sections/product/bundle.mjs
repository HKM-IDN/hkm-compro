/**
 * Bundle value — port dari components/products/detail/BundleValueSection.js
 *
 * Perbedaan dari versi React:
 *  - 21 ikon lucide-react diganti partials/lucide.mjs (SVG statis hasil
 *    generate dari paket aslinya, jadi gambarnya identik tapi tanpa
 *    dependency React).
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';
import { langPath } from '../../routes.mjs';
import { icon } from '../../partials/lucide.mjs';

export function bundleValueSection({ bundleValue, lang }) {
  if (!bundleValue?.headline) return raw('');

  const eyebrow = loc(bundleValue.eyebrow, lang);
  const headline = loc(bundleValue.headline, lang);
  const desc = loc(bundleValue.description, lang);
  const ctaLabel = loc(bundleValue.ctaLabel, lang);
  const items = (bundleValue.items || []).slice(0, 4);

  return html`
    <section class="px-5 lg:px-10 py-[140px] relative overflow-hidden" style="background:#0A0B0E">
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 50% 50% at 80% 20%, rgba(0,255,255,0.14), transparent 60%)"
      ></div>

      <div
        class="max-w-[1400px] mx-auto relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[80px] items-center"
      >
        <!-- Kiri: teks -->
        <div>
          ${eyebrow &&
          html`<div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
            ${eyebrow}
          </div>`}

          <h2
            class="font-display font-extrabold leading-[0.95] tracking-[-0.04em] mb-6 page-gradient-title"
            style="font-size:clamp(40px,6vw,88px)"
          >
            <span>${headline}.</span>
          </h2>

          ${desc &&
          html`<p class="text-[18px] text-hkm-300 leading-relaxed mb-8" style="max-width:520px">
            ${desc}
          </p>`}
          ${ctaLabel && bundleValue.ctaUrl
            ? html`<a
                href="${langPath(bundleValue.ctaUrl, lang)}"
                class="inline-flex items-center gap-2 font-semibold text-[14px] px-7 py-[14px] rounded-[8px] text-white no-underline transition-all duration-200 hover:opacity-90"
                style="background:#0066ff"
                >${ctaLabel}</a
              >`
            : raw('')}
        </div>

        <!-- Kanan: grid kartu 2×2 -->
        ${items.length > 0
          ? html`<div class="grid grid-cols-2 gap-4">
              ${items.map(
                (item) =>
                  html`<div
                    class="rounded-[16px] p-5 flex flex-col gap-2 border"
                    style="background:#0D0E12;border-color:rgba(255,255,255,0.08)"
                  >
                    <div class="mb-1" style="color:#00B8D9">
                      ${icon(item.icon || 'Package', { size: 22, strokeWidth: 1.5 })}
                    </div>
                    <div class="font-mono text-[10px] text-hkm-500 uppercase tracking-[0.12em]">
                      ${loc(item.label, lang)}
                    </div>
                    <div
                      class="font-display font-extrabold text-white leading-none tracking-[-0.02em]"
                      style="font-size:clamp(22px,3vw,30px)"
                    >
                      ${item.value}
                    </div>
                    <div class="text-[12px] text-hkm-500 leading-[1.4]">
                      ${loc(item.caption, lang)}
                    </div>
                  </div>`
              )}
            </div>`
          : raw('')}
      </div>
    </section>
  `;
}
