/**
 * Footer — port dari components/footer/Footer.js
 *
 * Perbedaan dari versi React:
 *  - Hover ikon sosial dulu pakai onMouseEnter/onMouseLeave; sekarang CSS
 *    murni (.social-icon / .social-icon-ig di main.css).
 *  - `lang` dan `path` konstanta build-time.
 */
import { html, cls, attrs } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { langPath } from '../routes.mjs';

const ICONS = {
  IG: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
    />
  </svg>`,
  YT: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
    />
  </svg>`,
  LI: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 23.2 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
    />
  </svg>`,
};

const SOCIAL_LABEL = { IG: 'Instagram', YT: 'YouTube', LI: 'LinkedIn' };

// Kolom Partners/B2B statis — link partner eksternal sudah dihapus dari Sanity
// (fix-footer-partners.mjs). Link internal di-hardcode di sini demi keandalan.
const PARTNER_COL = {
  _key: 'static-partner',
  heading: { en: 'Partners', id: 'Mitra' },
  links: [
    {
      _key: 'partner-reseller',
      label: { en: 'Become a Reseller', id: 'Jadi Reseller' },
      url: '/careers',
    },
    { _key: 'partner-b2b', label: { en: 'B2B Inquiry', id: 'Pertanyaan B2B' }, url: '/contact' },
    { _key: 'partner-press', label: { en: 'Press & Media', id: 'Media & Pers' }, url: '/contact' },
  ],
};

const LEGAL_LINKS = [
  { en: 'Privacy Policy', id: 'Kebijakan Privasi', url: '/privacy-policy' },
  { en: 'Terms of Service', id: 'Syarat & Ketentuan', url: '/terms' },
  { en: 'Sitemap', id: 'Sitemap', url: '/sitemap.xml' },
];

function isActivePath(path, url) {
  if (!url || !url.startsWith('/')) return false;
  if (url === '/') return path === '/';
  return path === url || path.startsWith(url + '/');
}

export function footer({ settings, lang = 'en', path = '/', buildYear }) {
  const footerColumns = settings?.footerColumns || [];
  const allColumns = [...footerColumns, PARTNER_COL];

  const copyright =
    loc(settings?.footerCopyright, lang) ||
    `© ${buildYear} PT. Harapan Karunia Makmur — All rights reserved.`;

  const socialLinks = [
    { label: 'IG', url: settings?.socialInstagram },
    { label: 'YT', url: settings?.socialYoutube },
    { label: 'LI', url: settings?.socialLinkedin },
  ].filter((s) => s.url);

  const link = (url) => langPath(url || '#', lang);

  return html`
    <footer
      class="text-hkm-300 pt-16 pb-8 px-10"
      style="background:#141414;border-top:1px solid rgba(255,255,255,0.10)"
    >
      <div
        class="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 mb-12"
      >
        <!-- Kolom brand -->
        <div class="col-span-2 lg:col-span-1">
          <a href="${link('/')}" class="inline-block no-underline mb-4">
            <img src="/logo.svg" alt="HKM" width="120" height="53" class="h-16 w-auto" />
          </a>

          ${settings?.companyTagline &&
          html`<p
            class="mt-4 text-[13px] italic font-display font-medium leading-[1.5] max-w-[280px]"
            style="color:rgba(0,255,255,0.60)"
          >
            ${loc(settings.companyTagline, lang)}
          </p>`}
          ${settings?.contactAddress &&
          html`<div class="mt-5">
            <p
              class="font-mono text-[10px] uppercase tracking-[0.15em] mb-2"
              style="color:rgba(0,255,255,0.45)"
            >
              — ${lang === 'id' ? 'Kunjungi Kantor Pusat' : 'Visit HQ'}
            </p>
            <address
              class="text-[12px] text-hkm-500 leading-[1.6] font-mono not-italic whitespace-pre-line"
            >
              ${settings.contactAddress}
            </address>
          </div>`}
          ${(settings?.contactEmail || settings?.contactPhone) &&
          html`<div class="mt-5">
            <p
              class="font-mono text-[10px] uppercase tracking-[0.15em] mb-2"
              style="color:rgba(0,255,255,0.45)"
            >
              — ${lang === 'id' ? 'Hubungi Kami' : 'Reach Us'}
            </p>
            ${settings.contactEmail &&
            html`<a
              href="mailto:${settings.contactEmail}"
              class="block text-[12px] text-hkm-300 hover:text-cyan-bright font-mono transition-colors no-underline"
              >${settings.contactEmail}</a
            >`}
            ${settings.contactPhone &&
            html`<a
              href="tel:${settings.contactPhone}"
              class="block text-[12px] text-hkm-500 hover:text-hkm-300 font-mono transition-colors no-underline mt-1"
              >${settings.contactPhone}</a
            >`}
          </div>`}
          ${socialLinks.length > 0 &&
          html`<div class="flex gap-2.5 mt-6">
            ${socialLinks.map(
              (s) =>
                html`<a
                  href="${s.url}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="${SOCIAL_LABEL[s.label] || s.label}"
                  class="${cls(
                    'social-icon w-10 h-10 flex items-center justify-center rounded-[8px] transition-all duration-200 no-underline',
                    s.label === 'IG' && 'social-icon-ig'
                  )}"
                  >${ICONS[s.label] || s.label}</a
                >`
            )}
          </div>`}
        </div>

        <!-- 4 kolom link (3 dari Sanity + 1 Partners statis) -->
        ${allColumns.map((col) => {
          // footerColumns dari Sanity pakai `title`; PARTNER_COL pakai `heading`
          const colHeading = col.heading || col.title;
          return html`<div>
            <h4 class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
              ${loc(colHeading, lang)}
            </h4>
            <ul class="list-none p-0 m-0">
              ${(col.links || []).map((l) => {
                const active = isActivePath(path, l.url);
                return html`<li class="mb-2.5">
                  <a
                    href="${link(l.url)}"
                    class="${cls(
                      'no-underline text-[13px] transition-colors duration-200',
                      active ? 'text-cyan-bright' : 'text-hkm-300 hover:text-cyan-bright'
                    )}"
                    ${attrs({ 'aria-current': active ? 'page' : null })}
                    >${loc(l.label, lang)}</a
                  >
                </li>`;
              })}
            </ul>
          </div>`;
        })}
      </div>

      <!-- Bottom bar -->
      <div
        class="max-w-[1400px] mx-auto pt-6 flex justify-between items-center flex-wrap gap-4 text-hkm-500 text-[12px] font-mono"
        style="border-top:1px solid rgba(255,255,255,0.08)"
      >
        <span>${copyright}</span>
        <nav class="flex items-center gap-5" aria-label="Legal links">
          ${LEGAL_LINKS.map(
            (l) =>
              html`<a
                href="${l.url.endsWith('.xml') ? l.url : link(l.url)}"
                class="text-hkm-500 hover:text-hkm-300 no-underline transition-colors"
                >${lang === 'id' ? l.id : l.en}</a
              >`
          )}
        </nav>
      </div>
    </footer>
  `;
}
