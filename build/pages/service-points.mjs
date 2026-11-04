/**
 * /service-points — port dari app/service-points/page.js
 *                   + components/service-points/ServicePointsContent.js
 *                   + components/service-points/ServiceMap.js
 *
 * Perbedaan dari versi React:
 *  - Filter (search + chip wilayah) dulu useState yang me-render ulang list.
 *    Di sini SEMUA kartu ada di HTML (terbaca mesin pencari), lalu
 *    src/js/service-points.js hanya menyembunyikan yang tidak cocok.
 *  - Badge "Buka Sekarang / Tutup" bergantung jam saat ini (WIB), jadi tidak
 *    bisa dihitung saat build. Kartu membawa jam mentah di data-hours dan
 *    JS mengisi badge-nya di browser — sama seperti React yang menghitungnya
 *    di client.
 *  - Search: onFocus/onBlur yang mengganti borderColor → class focus:.
 *  - Filter bar sticky di top:80px (nav vanilla 80px, bukan 64px) — sama
 *    dengan filter bar /products.
 *  - Peta memakai partials/map.mjs + src/js/map.js (dipakai juga homepage).
 */
import { page } from '../layout.mjs';
import { html, raw, jsonScript } from '../html.mjs';
import { buildMeta, jsonLd, schemaBreadcrumb, SITE_URL, SITE_NAME } from '../lib/seo.mjs';
import { loc } from '../lib/i18n.mjs';
import { getT } from '../lib/translations.mjs';
import { REGIONS } from '../lib/regions.mjs';
import { langPath } from '../routes.mjs';
import { fetchGroq } from '../sanity.mjs';
import { serviceMap } from '../partials/map.mjs';
import { icon } from '../partials/lucide.mjs';
import { SP_EXTRA } from '../content/service-points.mjs';

// Query lokal — sama persis dengan SERVICE_PARTNER_RECRUITMENT_QUERY di lib/queries
const RECRUITMENT_QUERY = `*[_type == "siteSettings"][0]{
  "servicePartnerRecruitment": servicePartnerRecruitment
}`;

// Gaya chip wilayah — sama dengan inline style React (aktif vs tidak).
// Dikirim ke service-points.js lewat data-attribute di filter bar.
const CHIP_ACTIVE = 'background:#0066ff;border-color:#0066ff;color:#fff';
const CHIP_IDLE = 'background:#262626;border-color:rgba(255,255,255,0.10);color:#E2E7EF';

function waLink(number) {
  if (!number) return null;
  return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
}

function regionLabel(value, lang) {
  const r = REGIONS.find((x) => x.value === value);
  return r ? r[lang] || r.en : value || '';
}

// ── Ikon kecil (inline SVG, sama dengan versi React) ────────────────────────

const PIN_ICON = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  class="w-[14px] h-[14px]"
  aria-hidden="true"
>
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
  <circle cx="12" cy="10" r="3" />
</svg>`;

const CLOCK_ICON = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  class="w-[14px] h-[14px]"
  aria-hidden="true"
>
  <circle cx="12" cy="12" r="10" />
  <polyline points="12 6 12 12 16 14" />
</svg>`;

const PHONE_ICON = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  class="w-[14px] h-[14px]"
  aria-hidden="true"
>
  <path
    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
  />
</svg>`;

const CHECK_ICON = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  class="w-3 h-3"
  aria-hidden="true"
>
  <path d="M9 11l3 3L22 4" />
</svg>`;

const WA_ICON = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  class="w-3 h-3"
  aria-hidden="true"
>
  <path
    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
  />
</svg>`;

const SEARCH_ICON = html`<svg
  class="absolute left-[14px] top-1/2 -translate-y-1/2 w-4 h-4 text-hkm-500 pointer-events-none"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <circle cx="11" cy="11" r="7" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>`;

// ── Kartu service point ─────────────────────────────────────────────────────

function infoRow(iconMarkup, content) {
  return html`<div class="flex gap-[10px] items-start">
    <span class="text-cyan-bright flex-shrink-0 mt-[2px]">${iconMarkup}</span>
    <span>${content}</span>
  </div>`;
}

function pointCard({ point, t, lang }) {
  const hours = loc(point.hours, lang);
  // parseOpenStatus() versi React selalu membaca jam versi EN
  const hoursEn = (typeof point.hours === 'object' ? point.hours?.en : point.hours) || '';
  const hq = point.isHeadOffice ? ' · HQ' : '';
  const badge = point.province
    ? point.province.toUpperCase() + hq
    : regionLabel(point.region, lang).toUpperCase() + hq;
  const wa = waLink(point.whatsapp);

  // Teks yang dicari — sama dengan field yang dicek filter React
  const haystack = [point.name, point.city, point.province, point.address]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const directionsInner = html`${CHECK_ICON} ${t.directions}`;

  return html`<div
    data-sp-card
    data-region="${point.region || ''}"
    data-search="${haystack}"
    class="rounded-[16px] border border-white/10 p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-[2px] hover:border-electric-blue hover:shadow-[0_12px_30px_rgba(0,102,255,0.12)] cursor-default"
    style="background:#262626"
  >
    <!-- Head: badge wilayah + status buka (diisi JS) -->
    <div class="flex justify-between items-start gap-3">
      <span
        class="font-mono text-[10px] font-medium uppercase tracking-[0.15em] px-[10px] py-1 rounded-full border flex-shrink-0"
        style="color:#00ffff;border-color:rgba(0,255,255,0.2);background:rgba(0,255,255,0.08)"
        >${badge}</span
      >
      ${hoursEn
        ? html`<span
            data-open-status
            data-hours="${hoursEn}"
            hidden
            class="flex items-center gap-[6px] font-mono text-[11px] text-hkm-300 flex-shrink-0"
            ><span data-open-dot class="w-[6px] h-[6px] rounded-full flex-shrink-0"></span
            ><span data-open-label></span
          ></span>`
        : raw('')}
    </div>

    <div class="font-display text-[18px] font-bold leading-[1.25] text-white">${point.name}</div>

    <div class="flex flex-col gap-[10px] text-[13px] text-hkm-300 leading-relaxed">
      ${point.address &&
      infoRow(
        PIN_ICON,
        html`${point.city &&
          html`<strong class="block text-white font-semibold">${point.city}</strong>`}${point.address}`
      )}
      ${hours && infoRow(CLOCK_ICON, hours)} ${point.phone && infoRow(PHONE_ICON, point.phone)}
    </div>

    <div class="flex gap-2 mt-auto pt-4 border-t border-white/10">
      ${point.googleMapsUrl
        ? html`<a
            href="${point.googleMapsUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 flex items-center justify-center gap-[6px] text-[12px] font-semibold text-white py-[10px] px-3 rounded-[8px] transition-all duration-200 hover:bg-cyan-bright hover:text-dark-2 hover:border-cyan-bright"
            style="background:#0066ff;border:1px solid #0066ff"
            >${directionsInner}</a
          >`
        : html`<div
            class="flex-1 flex items-center justify-center gap-[6px] text-[12px] font-semibold text-white py-[10px] px-3 rounded-[8px]"
            style="background:#0066ff;border:1px solid #0066ff"
          >
            ${directionsInner}
          </div>`}
      ${wa &&
      html`<a
        href="${wa}"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 flex items-center justify-center gap-[6px] text-[12px] font-semibold text-hkm-100 py-[10px] px-3 rounded-[8px] border transition-all duration-200 hover:border-cyan-bright hover:text-cyan-bright"
        style="border-color:rgba(255,255,255,0.18);background:transparent"
        >${WA_ICON} ${t.whatsapp}</a
      >`}
    </div>
  </div>`;
}

// ── Empty state (port components/ui/EmptyState.js, tanpa CTA) ───────────────

function emptyState({ title, description, hidden }) {
  return html`<div
    data-sp-empty
    ${hidden ? raw('hidden') : raw('')}
    class="flex flex-col items-center justify-center text-center py-16 px-6"
  >
    <div
      class="flex items-center justify-center rounded-[20px] mb-6"
      style="width:72px;height:72px;background:linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,255,255,0.04));border:1px solid rgba(255,255,255,0.10);color:#00B8D9"
    >
      ${icon('MapPinOff', { size: 32 })}
    </div>
    <h3 class="font-display font-bold text-white mb-3" style="font-size:clamp(18px, 2vw, 22px)">
      ${title}
    </h3>
    <p class="text-[15px] text-hkm-300 leading-relaxed max-w-[420px] mb-6">${description}</p>
  </div>`;
}

// ── CTA mitra layanan (hanya kalau diaktifkan di Sanity) ────────────────────

function partnerCta({ partnerRecruitment, t }) {
  if (!partnerRecruitment?.enabled) return raw('');
  const email = partnerRecruitment.contactEmail || 'partner@hkm.co.id';

  return html`<section class="px-5 lg:px-10 py-[100px]" style="background:#0A0B0E">
    <div
      class="max-w-[1100px] mx-auto text-center rounded-[24px] border border-white/[0.18] relative overflow-hidden"
      style="padding:60px;background:linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,255,255,0.03))"
    >
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse at top right, rgba(0,255,255,0.22), transparent 60%)"
      ></div>
      <div class="relative z-[2]">
        <div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
          ${t.ctaEyebrow}
        </div>
        <h2
          class="font-display font-extrabold leading-[1.1] mb-4 page-gradient-title"
          style="font-size:clamp(28px, 4vw, 44px)"
        >
          ${t.ctaTitle1} <span>${t.ctaTitleSpan}</span>
        </h2>
        <p class="text-[16px] text-hkm-300 max-w-[580px] mx-auto mb-7 leading-relaxed">
          ${t.ctaDesc}
        </p>
        <div class="flex gap-3 justify-center flex-wrap">
          <a
            href="mailto:${email}"
            class="inline-flex items-center gap-2 font-semibold text-[14px] px-7 py-[14px] rounded-[8px] text-white transition-all duration-200 hover:bg-cyan-bright hover:text-dark-2"
            style="background:#0066ff"
            >${t.ctaBtn1}</a
          >
          <!-- Sama seperti versi React: tombol ini belum punya aksi -->
          <button
            type="button"
            class="inline-flex items-center gap-2 font-semibold text-[14px] px-7 py-[14px] rounded-[8px] text-white transition-all duration-200 border hover:border-cyan-bright hover:text-cyan-bright"
            style="border-color:rgba(255,255,255,0.18);background:transparent"
          >
            ${t.ctaBtn2}
          </button>
        </div>
      </div>
    </div>
  </section>`;
}

// ── Body halaman ────────────────────────────────────────────────────────────

function servicePointsBody({ points, partnerRecruitment, lang, mapsApiKey }) {
  const t = getT('servicePoints', lang);
  const x = SP_EXTRA[lang] || SP_EXTRA.en;

  // Statistik — semua diturunkan dari data service point
  const stats = [
    { key: 'points', num: `${points.length}+`, label: t.statPoints },
    {
      key: 'provinces',
      num: new Set(points.map((p) => p.province).filter(Boolean)).size,
      label: t.statProvinces,
    },
    {
      key: 'cities',
      num: new Set(points.map((p) => p.city).filter(Boolean)).size,
      label: t.statCities,
    },
    {
      key: 'islands',
      num: new Set(points.map((p) => p.region).filter(Boolean)).size,
      label: t.statIslands,
    },
  ];

  const regionCounts = points.reduce(
    (acc, p) => ({ ...acc, [p.region]: (acc[p.region] || 0) + 1 }),
    {}
  );

  // Label untuk JS (badge status buka)
  const jsLabels = { openNow: t.openNow, closedNow: t.closedNow, opensAt: t.opensAt };

  return html`<div style="background:#0A0B0E" data-sp-root>
    <!-- ── Page Header ─────────────────────────────── -->
    <section class="px-5 lg:px-10 relative" style="padding-top:140px;padding-bottom:60px">
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,102,255,0.30), transparent 60%)"
      ></div>
      <div class="max-w-[1400px] mx-auto relative z-[2]">
        <nav
          class="font-mono text-[12px] text-hkm-500 uppercase tracking-[0.1em] mb-4"
          aria-label="Breadcrumb"
        >
          <a
            href="${langPath('/', lang)}"
            class="text-hkm-300 hover:text-cyan-bright transition-colors"
            >${t.home}</a
          >
          <span class="mx-2">/</span>
          <span>${x.breadcrumb}</span>
        </nav>

        <h1
          class="font-display font-extrabold leading-[1.1] mb-4 pb-1 page-gradient-title break-words"
          style="font-size:clamp(36px, 6vw, 72px)"
        >
          ${t.title1} <span>${t.titleSpan}</span>
        </h1>
        <p class="text-[18px] text-hkm-300 max-w-[720px] leading-relaxed">${t.subtitle}</p>

        <div class="flex flex-wrap gap-12 mt-8 pt-8 border-t border-white/10">
          ${stats.map(
            (s) =>
              html`<div>
                <div
                  class="text-[36px] font-display font-extrabold leading-none text-cyan-bright"
                >
                  ${s.num}
                </div>
                <div
                  class="font-mono text-[12px] text-hkm-300 uppercase tracking-[0.1em] mt-[6px]"
                >
                  ${s.label}
                </div>
              </div>`
          )}
        </div>
      </div>
    </section>

    <!-- ── Google Maps ──────────────────────────────── -->
    <section class="px-5 lg:px-10 py-[80px]" style="background:#0A0B0E">
      <div
        class="max-w-[1400px] mx-auto rounded-[20px] overflow-hidden border border-white/10"
        style="height:480px"
      >
        ${serviceMap({ points, lang, apiKey: mapsApiKey })}
      </div>
    </section>

    <!-- ── Filter Bar ───────────────────────────────── -->
    <div
      class="sticky z-50 border-b border-white/10 px-5 lg:px-10 py-5"
      style="top:80px;background:rgba(30,30,30,0.92);backdrop-filter:blur(20px)"
      data-sp-filter
      data-chip-active="${CHIP_ACTIVE}"
      data-chip-idle="${CHIP_IDLE}"
    >
      <div class="max-w-[1400px] mx-auto flex flex-wrap gap-4 items-center">
        <!-- Search -->
        <div class="relative flex-1 min-w-[240px]">
          ${SEARCH_ICON}
          <input
            type="text"
            data-sp-search
            aria-label="${x.searchLabel}"
            placeholder="${t.searchPlaceholder}"
            class="w-full pl-10 pr-4 py-3 rounded-full text-[14px] text-white outline-none transition-all duration-200 placeholder:text-hkm-500 border border-white/10 focus:border-[#0066ff]"
            style="background:#262626"
          />
        </div>

        <!-- Chip wilayah -->
        <div class="flex flex-wrap gap-2">
          ${REGIONS.map((r) => {
            const count = r.value === 'all' ? points.length : regionCounts[r.value] || 0;
            const isActive = r.value === 'all';
            return html`<button
              type="button"
              data-sp-region="${r.value}"
              aria-pressed="${isActive ? 'true' : 'false'}"
              class="font-mono text-[12px] font-medium uppercase tracking-[0.08em] px-[14px] py-2 rounded-full border transition-all duration-200 cursor-pointer"
              style="${isActive ? CHIP_ACTIVE : CHIP_IDLE}"
            >
              ${r[lang] || r.en}<span style="opacity:0.7;margin-left:4px">(${count})</span>
            </button>`;
          })}
        </div>
      </div>
    </div>

    <!-- ── Grid ─────────────────────────────────────── -->
    <section class="px-5 lg:px-10 py-[60px] pb-[120px]">
      <div class="max-w-[1400px] mx-auto">
        <p class="font-mono text-[12px] text-hkm-500 uppercase tracking-[0.1em] mb-8">
          ${t.showing}
          <strong class="text-white"
            ><span data-sp-count>${points.length}</span> ${t.of} ${points.length}</strong
          >
          ${t.servicePoints}
        </p>

        ${points.length
          ? html`<div data-sp-grid class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              ${points.map((point) => pointCard({ point, t, lang }))}
            </div>`
          : raw('')}
        ${emptyState({ title: t.noResults, description: x.emptyDesc, hidden: points.length > 0 })}
      </div>
    </section>

    ${partnerCta({ partnerRecruitment, t })}

    <script type="application/json" data-sp-labels>
      ${jsonScript(jsLabels)}
    </script>
  </div>`;
}

// ── Route ───────────────────────────────────────────────────────────────────

export const route = {
  name: 'service-points',
  path: '/service-points',
  async render({ servicePoints, settings, lang, buildYear, gaId, mapsApiKey }) {
    const points = servicePoints || [];
    const recruitment = await fetchGroq(RECRUITMENT_QUERY, {}, 'servicePartnerRecruitment').catch(
      () => null
    );
    const partnerRecruitment = recruitment?.servicePartnerRecruitment ?? null;
    const count = points.length;

    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/service-points#localbusiness`,
      name: SITE_NAME,
      url: `${SITE_URL}/service-points`,
      description: 'Jaringan service point resmi HKM di seluruh Indonesia',
      areaServed: { '@type': 'Country', name: 'Indonesia' },
      numberOfLocations: count,
      hasMap: 'https://maps.google.com',
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
    };

    const hasMapKey = Boolean(mapsApiKey) && mapsApiKey !== 'YOUR_KEY_HERE';

    return page({
      meta: buildMeta({
        title: `Service Point HKM — ${count}+ Lokasi Layanan Resmi di Seluruh Indonesia`,
        description: `Temukan ${count}+ service point resmi HKM di seluruh Indonesia: Sumatera, Jawa, Kalimantan, Sulawesi, Bali, dan NTB/NTT. Garansi, perbaikan, dan konsultasi produk konektivitas.`,
        path: '/service-points',
      }),
      lang,
      path: '/service-points',
      settings,
      buildYear,
      gaId,
      scripts: [...(hasMapKey ? ['/assets/js/map.js'] : []), '/assets/js/service-points.js'],
      schemas: [
        jsonLd(localBusinessSchema),
        jsonLd(
          schemaBreadcrumb([
            { name: lang === 'id' ? 'Beranda' : 'Home', url: langPath('/', lang) },
            { name: 'Service Points', url: langPath('/service-points', lang) },
          ])
        ),
      ],
      body: servicePointsBody({ points, partnerRecruitment, lang, mapsApiKey }),
    });
  },
};
