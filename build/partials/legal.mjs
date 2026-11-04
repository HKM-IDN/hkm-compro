/**
 * legal.mjs — port dari components/legal/LegalPageContent.js
 *
 * Catatan: versi React memakai class `prose prose-invert prose-lg`, tapi
 * plugin @tailwindcss/typography TIDAK terpasang di project ini — jadi
 * class itu tidak pernah berefek. Yang benar-benar menata teks adalah
 * arbitrary variant `[&>h2]:…`. Itu yang dipertahankan di sini.
 *
 * Versi React juga membungkus dengan <main>, padahal layout sudah punya
 * <main> sendiri (nested <main> — tidak valid). Di sini diganti <div>.
 */
import { html } from '../html.mjs';
import { langPath } from '../routes.mjs';

const LABELS = {
  en: {
    contact: 'Contact Us',
    contactDesc: 'For questions about this document, reach us at',
    lastUpdated: 'Last updated',
    backHome: '← Back to Home',
  },
  id: {
    contact: 'Hubungi Kami',
    contactDesc: 'Untuk pertanyaan mengenai dokumen ini, hubungi kami di',
    lastUpdated: 'Terakhir diperbarui',
    backHome: '← Kembali ke Beranda',
  },
};

const PROSE_CLASSES = [
  'max-w-none text-hkm-300 leading-[1.8]',
  '[&>div>h2]:font-display [&>div>h2]:font-bold [&>div>h2]:text-white',
  '[&>div>h2]:text-[22px] [&>div>h2]:mt-10 [&>div>h2]:mb-4',
  '[&>div>p]:mb-5',
  '[&>div>ul]:mb-5 [&>div>ul]:pl-6 [&>div>ul>li]:mb-2',
].join(' ');

export function legalPage({ eyebrow, title, updatedDate, content, email, lang = 'en' }) {
  const t = LABELS[lang] || LABELS.en;
  const body = content[lang] || content.en;

  return html`
    <div style="background:#0A0B0E">
      <!-- Header -->
      <div
        class="border-b border-white/10 px-5 md:px-10 py-16 md:py-24"
        style="background:linear-gradient(180deg,#0d1117 0%,#0A0B0E 100%)"
      >
        <div class="max-w-[860px] mx-auto">
          <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
            ${eyebrow[lang] || eyebrow.en}
          </p>
          <h1
            class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] mb-4"
            style="font-size:clamp(28px,4vw,48px)"
          >
            ${title[lang] || title.en}
          </h1>
          <p class="text-[14px] text-hkm-500 font-mono">${t.lastUpdated}: ${updatedDate}</p>
        </div>
      </div>

      <!-- Body -->
      <div class="px-5 md:px-10 py-12 md:py-16">
        <div class="max-w-[860px] mx-auto">
          <div class="${PROSE_CLASSES}">
            ${body.map(
              (section) =>
                html`<div>
                  ${section.heading && html`<h2>${section.heading}</h2>`}
                  ${(section.paragraphs || []).map((p) => html`<p>${p}</p>`)}
                  ${section.bullets &&
                  html`<ul class="list-disc">
                    ${section.bullets.map((b) => html`<li>${b}</li>`)}
                  </ul>`}
                </div>`
            )}
          </div>

          ${email &&
          html`<div
            class="mt-12 rounded-[16px] border border-white/10 p-8"
            style="background:rgba(0,102,255,0.06)"
          >
            <p class="font-display font-bold text-white text-[18px] mb-2">${t.contact}</p>
            <p class="text-hkm-300 text-[15px]">
              ${t.contactDesc}
              <a href="mailto:${email}" class="text-cyan-bright hover:underline">${email}</a>
            </p>
          </div>`}

          <div class="mt-10 pt-8 border-t border-white/10">
            <a
              href="${langPath('/', lang)}"
              class="text-hkm-500 hover:text-cyan-bright text-[14px] transition-colors"
              >${t.backHome}</a
            >
          </div>
        </div>
      </div>
    </div>
  `;
}
