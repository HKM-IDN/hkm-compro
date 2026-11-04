/**
 * Nav — port dari components/nav/Nav.js
 *
 * Perbedaan dari versi React:
 *  - `lang` adalah konstanta build-time (bukan state). Toggle bahasa jadi
 *    <a> ke URL bahasa lain → tidak perlu JS, dan SEO-nya benar.
 *  - Active link dihitung saat build dari `path`, bukan usePathname().
 *  - Drawer mobile dibuka oleh vanilla JS (src/js/nav.js) lewat data-attribute.
 *  - Ikon X dari lucide-react diganti inline SVG.
 */
import { html, cls, attrs } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { langPath, otherLang } from '../routes.mjs';

const LABELS = {
  en: { contactUs: 'Contact Us', closeMenu: 'Close menu', skip: 'Skip to content' },
  id: { contactUs: 'Hubungi Kami', closeMenu: 'Tutup menu', skip: 'Lewati ke konten' },
};

function isActivePath(path, url) {
  if (!url || !url.startsWith('/')) return false;
  if (url === '/') return path === '/';
  return path === url || path.startsWith(url + '/');
}

const ICON_X = html`<svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  aria-hidden="true"
>
  <path d="M18 6 6 18M6 6l12 12" />
</svg>`;

/** Toggle bahasa — dua <a> ke URL bahasa masing-masing. */
function langToggle({ lang, path, inDrawer = false }) {
  const base = inDrawer
    ? 'px-2.5 py-1.5 uppercase transition-all duration-200 no-underline text-center'
    : 'flex-1 uppercase transition-all duration-200 no-underline flex items-center justify-center';

  return html`<div
    class="${cls(
      'flex border border-white/10 rounded-[6px] overflow-hidden text-[11px] font-mono select-none',
      inDrawer && 'mt-5 w-fit'
    )}"
    ${inDrawer ? attrs({}) : attrs({ style: 'width:55px;height:32px' })}
  >
    ${['en', 'id'].map(
      (l) =>
        html`<a
          href="${langPath(path, l)}"
          hreflang="${l}"
          aria-label="Switch to ${l.toUpperCase()}"
          aria-current="${lang === l ? 'true' : null}"
          class="${cls(
            base,
            lang === l ? 'bg-electric-blue text-white font-semibold' : 'bg-transparent text-hkm-300'
          )}"
          >${l}</a
        >`
    )}
  </div>`;
}

export function nav({ settings, lang = 'en', path = '/' }) {
  const t = LABELS[lang] || LABELS.en;
  const navLinks = settings?.navLinks || [];

  // Di halaman detail produk, ProductMobileNav menimpa bar mobile —
  // sembunyikan nav utama di mobile saja (sama seperti versi React).
  const isProductDetail = /^\/products\/[^/]+\/[^/]+/.test(path);

  const link = (url) => langPath(url || '#', lang);

  return html`
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:rounded-[6px] focus:text-white focus:font-semibold focus:text-sm focus:no-underline"
      style="background:#0066ff"
      >${t.skip}</a
    >

    <!-- ── Nav bar utama ── -->
    <nav
      class="${cls(
        'fixed top-0 left-0 right-0 z-[100] items-center',
        isProductDetail ? 'hidden lg:flex' : 'flex'
      )}"
      style="height:80px;background:rgba(5,8,16,0.70);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.10)"
    >
      <!-- DESKTOP -->
      <div class="hidden lg:flex items-center justify-between max-w-[1400px] mx-auto w-full px-10">
        <a href="${link('/')}" class="shrink-0 no-underline">
          <img
            src="/logo.svg"
            alt="HKM"
            width="120"
            height="53"
            class="h-12 w-auto"
            fetchpriority="high"
          />
        </a>

        <ul class="flex items-center gap-12 list-none m-0 p-0">
          ${navLinks.map((l) => {
            const active = isActivePath(path, l.url);
            return html`<li>
              <a
                href="${link(l.url)}"
                class="${cls(
                  'text-[15px] font-medium no-underline transition-colors duration-200',
                  active
                    ? 'text-cyan-bright underline underline-offset-4 decoration-cyan-bright/50'
                    : 'text-white/80 hover:text-white'
                )}"
                ${attrs({ 'aria-current': active ? 'page' : null })}
                >${loc(l.label, lang)}</a
              >
            </li>`;
          })}
        </ul>

        <div class="flex items-center gap-2">
          ${langToggle({ lang, path })}
          <a
            href="${link('/contact')}"
            class="flex items-center justify-center bg-electric-blue text-white rounded-[6px] font-semibold text-[13px] no-underline transition-all duration-200 hover:bg-cyan-bright hover:text-dark-2 hover:shadow-[0_0_16px_rgba(0,255,255,0.22)]"
            style="width:110px;height:32px"
            >${t.contactUs}</a
          >
        </div>
      </div>

      <!-- MOBILE -->
      <div class="flex lg:hidden w-full items-center justify-between px-5">
        <a href="${link('/')}" class="shrink-0 no-underline">
          <img
            src="/logo.svg"
            alt="HKM"
            width="120"
            height="53"
            class="h-8 w-auto"
            fetchpriority="high"
          />
        </a>
        <button
          type="button"
          data-nav-open
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="mobile-drawer"
          class="bg-transparent border border-white/10 rounded-[6px] p-2 cursor-pointer"
        >
          <span class="block w-[18px] h-[2px] bg-white my-1"></span>
          <span class="block w-[18px] h-[2px] bg-white my-1"></span>
          <span class="block w-[18px] h-[2px] bg-white my-1"></span>
        </button>
      </div>
    </nav>

    <!-- Backdrop drawer -->
    <div
      data-nav-backdrop
      hidden
      class="fixed inset-0 z-[190] bg-black/50 lg:hidden"
      aria-hidden="true"
    ></div>

    <!-- Drawer mobile -->
    <div
      id="mobile-drawer"
      data-nav-drawer
      inert
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      class="fixed top-0 right-0 h-full w-4/5 max-w-[320px] z-[200] lg:hidden flex flex-col gap-0 transition-transform duration-300 ease-in-out translate-x-full"
      style="background:#262626;border-left:1px solid rgba(255,255,255,0.10);padding:80px 24px 24px"
    >
      <button
        type="button"
        data-nav-close
        aria-label="${t.closeMenu}"
        class="absolute top-4 right-4 flex items-center justify-center rounded-[8px] text-hkm-300 hover:text-white transition-colors duration-200 cursor-pointer border-none bg-transparent"
        style="width:44px;height:44px"
      >
        ${ICON_X}
      </button>

      ${navLinks.map((l) => {
        const active = isActivePath(path, l.url);
        return html`<a
          href="${link(l.url)}"
          class="${cls(
            'no-underline text-base font-medium py-3 border-b border-white/10 transition-colors duration-200',
            active ? 'text-cyan-bright' : 'text-white'
          )}"
          >${loc(l.label, lang)}</a
        >`;
      })}

      <a
        href="${link('/contact')}"
        class="text-white no-underline text-base font-medium py-3 border-b border-white/10"
        >${t.contactUs}</a
      >

      ${langToggle({ lang, path, inDrawer: true })}
    </div>
  `;
}
