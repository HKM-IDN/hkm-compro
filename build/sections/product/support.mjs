/**
 * Dukungan — port dari components/products/detail/SupportSection.js
 * beserta 4 blok di components/products/support/ dan ServicePointSummary.
 *
 * Perbedaan dari versi React:
 *  - FAQ dulu accordion berbasis useState. Di sini dipakai <details>/<summary>
 *    bawaan HTML: jalan tanpa JavaScript, bisa dibuka lewat keyboard, dan
 *    jawabannya selalu ada di HTML sehingga terbaca mesin pencari —
 *    penting karena halaman ini juga memasang schema FAQPage.
 *  - Ikon lucide-react (Mail/MessageCircle/Phone/ChevronDown) → inline SVG.
 *  - Row memakai grid `minmax(0,280px) 1fr` tanpa breakpoint; di sini
 *    ikut class .spec-row supaya di mobile jadi satu kolom.
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';
import { langPath } from '../../routes.mjs';

// ── Ikon ────────────────────────────────────────────────────────────────────

const ICONS = {
  email: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    style="flex-shrink:0"
    aria-hidden="true"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>`,
  whatsapp: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    style="flex-shrink:0"
    aria-hidden="true"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
  </svg>`,
  phone: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    style="flex-shrink:0"
    aria-hidden="true"
  >
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
    />
  </svg>`,
  chevron: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    class="faq-chevron shrink-0 text-hkm-500 transition-transform duration-300"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>`,
};

const CHANNEL_COLOR = { email: '#00B8D9', whatsapp: '#25D366', phone: '#00B8D9' };

// ── Primitif tata letak (dari support/shared.js) ────────────────────────────

function groupHeader(text) {
  return html`<div
    class="font-display font-bold text-white uppercase tracking-[0.02em] pb-5 border-b-2 border-white/[0.18]"
    style="font-size:clamp(28px,3vw,40px)"
  >
    ${text}
  </div>`;
}

function row({ label, isLast, children }) {
  return html`<div
    class="spec-row items-start py-7"
    style="border-bottom:${isLast ? 'none' : '1px solid rgba(255,255,255,0.10)'}"
  >
    <div class="font-display text-[17px] font-semibold text-white leading-[1.4]">${label}</div>
    <div>${children}</div>
  </div>`;
}

// ── Ringkasan service point ─────────────────────────────────────────────────

const REGION_LABEL = {
  sumatera: 'Sumatera',
  jawa: 'Jawa',
  kalimantan: 'Kalimantan',
  sulawesi: 'Sulawesi',
  bali: 'Bali',
  ntb: 'NTB',
  ntt: 'NTT',
  maluku: 'Maluku',
  papua: 'Papua',
  'bali-ntt': 'Bali / NTB / NTT',
  'maluku-papua': 'Maluku / Papua',
};

// Urutan tampil barat → timur
const REGION_ORDER = [
  'sumatera',
  'jawa',
  'bali',
  'bali-ntt',
  'ntb',
  'ntt',
  'kalimantan',
  'sulawesi',
  'maluku',
  'maluku-papua',
  'papua',
];

const SP_COPY = {
  en: {
    countLabel: (n) => `${n} location${n === 1 ? '' : 's'} nationwide`,
    cta: 'View All Locations →',
  },
  id: {
    countLabel: (n) => `${n} lokasi di seluruh Indonesia`,
    cta: 'Lihat Semua Lokasi →',
  },
};

function regionLineOf(regions = []) {
  const sorted = [...regions].sort((a, b) => {
    const ai = REGION_ORDER.indexOf(a);
    const bi = REGION_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return sorted.map((r) => REGION_LABEL[r] || r).join(' · ');
}

export function servicePointSummary({ summary, lang = 'en', ctaUrl, ctaLabel }) {
  const count = summary?.count ?? 0;
  const copy = SP_COPY[lang] || SP_COPY.en;
  const regionLine = regionLineOf(summary?.regions ?? []);

  return html`<div class="text-[15px] text-white font-semibold mb-1">${copy.countLabel(count)}</div>
    ${regionLine && html`<div class="text-[13px] text-hkm-500 font-mono mb-3">${regionLine}</div>`}
    <a
      href="${langPath(ctaUrl || '/service-points', lang)}"
      class="inline-block text-[14px] font-semibold text-cyan-bright hover:underline"
      >${ctaLabel || copy.cta}</a
    >`;
}

// ── Blok 1: Dokumentasi ─────────────────────────────────────────────────────

function documentationBlock({ documentation, docs, t, lang }) {
  const structuredDocs = [];

  if (documentation) {
    [
      { key: 'quickStart', typeLabel: t.quickStartGuide },
      { key: 'fullManual', typeLabel: t.fullUserManual },
      { key: 'specSheet', typeLabel: t.specSheet },
    ].forEach(({ key, typeLabel }) => {
      const entry = documentation[key];
      if (entry?.pdfUrl) {
        structuredDocs.push({
          typeLabel,
          title: loc(entry.title, lang) || typeLabel,
          description: loc(entry.description, lang),
          pdfUrl: entry.pdfUrl,
        });
      }
    });
  }

  const hasStructured = structuredDocs.length > 0;
  const hasLegacy = !hasStructured && docs?.length > 0;

  if (!hasStructured && !hasLegacy) {
    return html`<div class="text-center py-12 mb-12">
      <p class="text-hkm-500 text-[16px] mb-6">${t.noSupportDocs}</p>
      <a
        href="${langPath('/service-points', lang)}"
        class="inline-flex items-center gap-2 font-semibold text-[14px] px-7 py-[14px] rounded-[8px] text-white no-underline border border-white/[0.18] hover:border-cyan-bright hover:text-cyan-bright transition-all duration-200"
        >${t.viewServicePoints}</a
      >
    </div>`;
  }

  const rows = hasStructured
    ? structuredDocs
    : docs.map((d) => ({
        typeLabel: loc(d.title, lang),
        title: d.type,
        description: null,
        pdfUrl: d.fileUrl,
      }));

  return html`<div class="mb-12">
    ${groupHeader(t.documentation)}
    ${rows.map((doc, i) =>
      row({
        label: doc.typeLabel,
        isLast: i === rows.length - 1,
        children: html`<div class="text-[15px] text-white font-semibold mb-1">${doc.title}</div>
          ${doc.description &&
          html`<div class="text-[13px] text-hkm-500 leading-[1.5] mb-3">${doc.description}</div>`}
          ${doc.pdfUrl &&
          html`<a
            href="${doc.pdfUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block text-[14px] font-semibold text-cyan-bright hover:underline"
            >${t.downloadPdf}</a
          >`}`,
      })
    )}
  </div>`;
}

// ── Blok 2: Dukungan pelanggan ──────────────────────────────────────────────

function customerSupportBlock({ customerSupport, t, lang }) {
  if (!customerSupport?.channels?.length && !customerSupport?.title) return raw('');

  const title = loc(customerSupport.title, lang);
  const description = loc(customerSupport.description, lang);
  const responseTime = loc(customerSupport.responseTime, lang);
  const channels = customerSupport.channels || [];

  return html`<div class="mb-12">
    ${groupHeader(t.customerSupportTitle)}
    ${(title || description) &&
    row({
      label: title || t.customerSupportTitle,
      isLast: channels.length === 0 && !responseTime,
      children: description
        ? html`<p class="text-[15px] text-hkm-300 leading-[1.6]">${description}</p>`
        : raw(''),
    })}
    ${channels.map((ch, i) => {
      const icon = ICONS[ch.type] || ICONS.email;
      const color = CHANNEL_COLOR[ch.type] || '#00B8D9';
      const label = loc(ch.label, lang) || ch.type;
      const isLast = i === channels.length - 1 && !responseTime;

      return row({
        label,
        isLast,
        children: html`<div class="flex items-center gap-3">
          <span style="color:${color};display:inline-flex">${icon}</span>
          ${ch.url
            ? html`<a
                href="${ch.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[15px] font-semibold text-white hover:text-cyan-bright transition-colors"
                >${ch.value}</a
              >`
            : html`<span class="text-[15px] font-semibold text-white">${ch.value}</span>`}
        </div>`,
      });
    })}
    ${responseTime &&
    row({
      label: '',
      isLast: true,
      children: html`<p class="text-[13px] text-hkm-500 leading-[1.5] font-mono">
        ${responseTime}
      </p>`,
    })}
  </div>`;
}

// ── Blok 3: Garansi ─────────────────────────────────────────────────────────

function warrantyBlock({ warranty, summary, t, lang }) {
  if (!warranty?.period && !warranty?.description) return raw('');

  const period = loc(warranty.period, lang);
  const description = loc(warranty.description, lang);
  const ctaLabel = loc(warranty.findServicePointCta?.label, lang);
  const ctaUrl = warranty.findServicePointCta?.url || '/service-points';

  return html`<div class="mb-12">
    ${groupHeader(t.warrantyTitle)}
    ${period &&
    row({
      label: t.warrantyPeriodLabel,
      isLast: !summary,
      children: html`<div class="text-[15px] text-white font-semibold mb-1">${period}</div>
        ${description &&
        html`<p class="text-[13px] text-hkm-500 leading-[1.5] mt-1">${description}</p>`}`,
    })}
    ${summary &&
    row({
      label: t.findServicePoint,
      isLast: true,
      children: servicePointSummary({
        summary,
        lang,
        ctaUrl,
        ctaLabel: ctaLabel || undefined,
      }),
    })}
  </div>`;
}

// ── Blok 4: FAQ ─────────────────────────────────────────────────────────────

function faqsBlock({ faqs, t, lang }) {
  if (!faqs?.length) return raw('');

  return html`<div class="mb-12">
    ${groupHeader(t.faqsTitle)}
    ${faqs.map(
      (faq, i) =>
        html`<details
          class="faq-item"
          style="border-bottom:${i === faqs.length - 1
            ? 'none'
            : '1px solid rgba(255,255,255,0.10)'}"
        >
          <summary
            class="w-full flex items-center justify-between gap-4 py-6 text-left cursor-pointer list-none"
          >
            <span class="font-display font-semibold text-white text-[16px] leading-[1.4]">
              ${loc(faq.question, lang)}
            </span>
            ${ICONS.chevron}
          </summary>
          <p class="text-[15px] text-hkm-300 leading-[1.7] pb-6">${loc(faq.answer, lang)}</p>
        </details>`
    )}
  </div>`;
}

// ── Section utama ───────────────────────────────────────────────────────────

export function supportSection({ product, docs, documentation, summary, t, lang }) {
  const productName = loc(product?.name, lang);

  return html`
    <section class="px-5 lg:px-10 py-[100px]" style="background:#0A0B0E">
      <div class="max-w-[1400px] mx-auto">
        <div class="text-center mb-16">
          <div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
            ${t.supportTitle}
          </div>
          <h2
            class="font-display font-extrabold leading-[0.95] tracking-[-0.04em] mx-auto page-gradient-title"
            style="font-size:clamp(32px,4vw,56px);max-width:700px"
          >
            ${t.getHelp} <span>${productName}.</span>
          </h2>
        </div>

        <div class="max-w-[1100px] mx-auto">
          ${documentationBlock({ documentation, docs, t, lang })}
          ${customerSupportBlock({ customerSupport: product?.customerSupport, t, lang })}
          ${warrantyBlock({ warranty: product?.warranty, summary, t, lang })}
          ${faqsBlock({ faqs: product?.faqs, t, lang })}

          <div
            class="mt-4 border border-white/[0.06] rounded-[16px] p-6"
            style="background:#131419"
          >
            <div class="spec-row items-center">
              <div class="font-display text-[17px] font-semibold text-white">
                ${t.findServicePoint}
              </div>
              <div>${servicePointSummary({ summary, lang })}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
