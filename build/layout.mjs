/**
 * Layout shell — pengganti app/layout.js
 *
 * Perbedaan dari versi Next:
 *  - Tidak ada LangProvider / Context. `lang` dialirkan sebagai argumen
 *    saat build, jadi tidak ada hydration mismatch (bug lama hilang sendiri).
 *  - Tidak ada <Toaster> dari sonner; toast dibuat vanilla (src/js/toast.js)
 *    dan hanya dimuat di halaman yang punya form.
 *  - Tidak ada nonce CSP. Di static hosting, CSP di-set oleh Nginx —
 *    lihat vanilla/nginx.conf.example.
 *  - Tidak ada PageFade (butuh router client-side). Animasi masuk halaman
 *    dipasang langsung ke <main> via class animate-page-in.
 */
import { html, render, raw } from './html.mjs';
import { head } from './meta.mjs';
import { nav } from './partials/nav.mjs';
import { footer } from './partials/footer.mjs';

/**
 * Script inline kecil di <head>: tidak ada lagi gunanya untuk bahasa
 * (bahasa sudah ditentukan saat build), tapi kita tetap simpan preferensi
 * bahasa pengunjung supaya kunjungan berikutnya bisa diarahkan.
 */
const LANG_MEMORY = `(function(){try{
var m=location.pathname.match(/^\\/id(?=\\/|$)/);
localStorage.setItem('hkm-lang', m ? 'id' : 'en');
}catch(e){}})()`;

/** Snippet Google Analytics 4 — hanya dirender kalau measurement ID ada. */
function analytics(gaId) {
  if (!gaId) return raw('');
  return html`
    <script>
      if (navigator.doNotTrack === '1') {
        window['ga-disable-${gaId}'] = true;
      }
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
  `;
}

/**
 * Bangun satu halaman HTML lengkap.
 *
 * @param {object}   opts
 * @param {object}   opts.meta      hasil buildMeta()
 * @param {string}   opts.lang      'en' | 'id'
 * @param {string}   opts.path      path kanonik (tanpa prefix /id)
 * @param {object}   opts.settings  siteSettings dari Sanity
 * @param {*}        opts.body      isi <main> (hasil html``)
 * @param {string[]} opts.schemas   array string hasil jsonLd()
 * @param {string[]} opts.scripts   path JS tambahan, mis. ['/assets/js/lightbox.js']
 * @param {string}   opts.mainClass class tambahan untuk <main>
 * @param {number}   opts.buildYear tahun build (dilewatkan, bukan Date.now() di template)
 * @param {string}   opts.gaId      GA4 measurement ID
 * @param {string}   opts.preload   URL gambar LCP untuk <link rel=preload>
 * @returns {string} HTML lengkap siap tulis ke file
 */
export function page({
  meta,
  lang = 'en',
  path = '/',
  settings = null,
  body,
  schemas = [],
  scripts = [],
  mainClass = '',
  buildYear,
  gaId = null,
  preload = null,
}) {
  const doc = html`<!doctype html>
    <html lang="${lang}" class="h-full antialiased">
      <head>
        ${head({ meta, lang, path, schemas })}
        ${preload
          ? html`<link rel="preload" as="image" href="${preload}" fetchpriority="high" />`
          : raw('')}
        <script>
          ${raw(LANG_MEMORY)};
        </script>
        ${analytics(gaId)}
      </head>
      <body class="min-h-full flex flex-col bg-dark text-hkm-100">
        ${nav({ settings, lang, path })}

        <main id="main-content" class="flex-1 pt-[80px] animate-page-in ${mainClass}">${body}</main>

        ${footer({ settings, lang, path, buildYear })}

        <!-- Tombol kembali ke atas — muncul setelah scroll 400px -->
        <button
          type="button"
          data-scroll-top
          hidden
          aria-label="${lang === 'id' ? 'Kembali ke atas' : 'Back to top'}"
          class="fixed bottom-6 right-6 z-[150] w-11 h-11 flex items-center justify-center rounded-full border border-white/10 bg-dark-3/90 text-hkm-300 backdrop-blur transition-all duration-200 hover:text-cyan-bright hover:border-cyan-bright/40 cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>

        <script src="/assets/js/main.js" defer></script>
        ${scripts.map((src) => html`<script src="${src}" defer></script>`)}
      </body>
    </html>`;

  return render(doc);
}
