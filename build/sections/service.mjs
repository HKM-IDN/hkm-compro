/**
 * Section 5: Service Points — port dari components/sections/ServiceSection.js
 *
 * Perbedaan dari versi React:
 *  - `next/dynamic` + `ssr:false` untuk lazy-load peta diganti
 *    IntersectionObserver di src/js/map.js. Efeknya sama (SDK Maps hanya
 *    diunduh kalau pengunjung scroll sampai peta), tapi tanpa framework.
 *  - renderInfoWindow yang dulu React node sekarang dibangun lewat DOM API
 *    di map.js, pakai textContent — jadi nama service point tidak mungkin
 *    jadi celah HTML injection.
 */
import { html, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { langPath } from '../routes.mjs';
import { serviceMap } from '../partials/map.mjs';
import { SERVICE_LABELS } from '../content/homepage.mjs';

const PIN_SVG = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  class="w-3 h-3"
  aria-hidden="true"
>
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
  <circle cx="12" cy="10" r="3" />
</svg>`;

export function serviceSection({ data, servicePoints = [], lang, mapsApiKey }) {
  const t = SERVICE_LABELS[lang] || SERVICE_LABELS.en;

  const stats = data?.serviceStats ?? {};
  const count = stats.pointCount ?? 0;
  const provCnt = stats.provinceCount ?? 0;
  const cityCnt = stats.cityCount ?? 0;
  const islCnt = stats.regionCount ?? 0;

  const rawTitle = loc(data?.serviceSectionTitle, lang) || t.title;
  const title = rawTitle.replace('{count}', `${count}+`);
  const desc = loc(data?.serviceSectionDesc, lang) || t.desc;
  const mapSub = t.mapSub.replace('{count}', `${count}+`);

  // Versi React mengambil titik peta dari HOMEPAGE_QUERY (data.servicePoints).
  // Di sini dipakai daftar service point yang sudah di-fetch sekali di build.
  const mapPoints = data?.servicePoints?.length ? data.servicePoints : servicePoints;

  const statCards = [
    { key: 'points', num: `${count}+`, label: t.stat1 },
    { key: 'provinces', num: provCnt, label: t.stat2 },
    { key: 'cities', num: cityCnt, label: t.stat3 },
    { key: 'islands', num: islCnt, label: t.stat4 },
  ];

  return html`
    <section id="service-points" class="px-10 py-[120px]" style="background:#0A0B0E">
      <div class="max-w-[1400px] mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-[60px] items-center">
          <!-- Kiri: teks + statistik -->
          <div>
            <p
              class="font-mono text-[12px] uppercase tracking-[0.2em] mb-4 text-left"
              style="color:#00B8D9"
            >
              ${t.eyebrow}
            </p>
            <h2
              class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] mb-[18px] [&>span]:text-cyan-bright"
              style="font-size:clamp(32px,4.5vw,52px)"
            >
              ${raw(sanitizeHtml(title))}
            </h2>
            <p class="text-[16px] text-hkm-300 leading-[1.6] mb-8">${desc}</p>

            <div class="grid grid-cols-4 gap-3 mb-9">
              ${statCards.map(
                (s) =>
                  html`<div
                    class="p-[18px] rounded-[12px]"
                    style="background:#131419;border:1px solid rgba(255,255,255,0.06)"
                  >
                    <div
                      class="font-display text-[32px] font-extrabold text-white tracking-[-0.03em] leading-none mb-1.5"
                    >
                      ${s.num}
                    </div>
                    <div class="text-[11px] text-hkm-300 uppercase tracking-[0.1em] font-medium">
                      ${s.label}
                    </div>
                  </div>`
              )}
            </div>

            <a
              href="${langPath('/service-points', lang)}"
              class="inline-flex items-center gap-2 bg-electric-blue text-white px-7 py-3.5 rounded-[8px] font-semibold text-sm no-underline border border-electric-blue transition-all duration-200 hover:bg-cyan-bright hover:border-cyan-bright hover:text-dark-2"
              >${t.findBtn}</a
            >
          </div>

          <!-- Kanan: peta -->
          <div
            class="relative rounded-[20px] overflow-hidden border border-white/10"
            style="aspect-ratio:1000/420;background:#1a1a1a"
          >
            ${serviceMap({
              points: mapPoints,
              lang,
              apiKey: mapsApiKey,
              viewAllLabel: t.viewAll,
            })}

            <div
              class="absolute inset-0 pointer-events-none"
              style="background:linear-gradient(to top, rgba(10,11,14,0.7) 0%, transparent 40%),linear-gradient(to right, rgba(10,11,14,0.3) 0%, transparent 30%),radial-gradient(ellipse at center, rgba(0,102,255,0.06), transparent 70%)"
            ></div>

            <div class="absolute bottom-4 right-4 z-[3]">
              <a
                href="${langPath('/service-points', lang)}"
                class="inline-flex items-center gap-2 font-semibold text-[12px] text-white px-4 py-2.5 rounded-[8px] no-underline transition-all duration-200 hover:bg-cyan-bright hover:text-dark-2"
                style="background:rgba(0,102,255,0.9);backdrop-filter:blur(12px);border:1px solid rgba(0,102,255,0.5)"
              >
                ${PIN_SVG} ${t.findBtn}
              </a>
            </div>

            <div
              class="absolute top-4 left-4 z-[3] px-3 py-1.5 rounded-[8px]"
              style="background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.12)"
            >
              <p class="font-mono text-[10px] text-cyan-bright uppercase tracking-[0.15em]">
                ${mapSub}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
