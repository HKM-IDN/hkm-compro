/**
 * Key highlights — port dari components/products/detail/KeyHighlightsSection.js
 *
 * ── DUA BUG TATA LETAK YANG DIPERBAIKI ────────────────────────────────────
 *
 * 1. Versi React menyetel grid-template-columns ke jumlah highlight (maks 4)
 *    TANPA breakpoint mobile. Di sini 2 kolom di mobile, baru sejumlah
 *    highlight di desktop. Tampilan desktop tidak berubah.
 *
 * 2. splitHighlightValue() mengembalikan seluruh teks sebagai `num` kalau
 *    nilainya tidak diawali angka — misal "Adjustable". Teks sepanjang itu
 *    lalu dirender pada clamp(36px…56px) dan meluber keluar selnya.
 *
 *    Terukur di build production Next (Ezviz Solar Charging Panel, layar
 *    390px): barisnya melebar jadi 685px di dalam kotak 350px — halaman
 *    bisa di-scroll ke samping.
 *
 *    Perbaikannya: nilai tanpa angka dianggap "nilai kata" dan memakai
 *    ukuran font lebih kecil + boleh membungkus. Nilai berangka
 *    ("150 Mbps", "10 m") tetap persis seperti semula.
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';
import { splitHighlightValue } from '../../content/product-labels.mjs';

export function keyHighlights({ highlights, lang }) {
  if (!highlights?.length) return raw('');

  const shown = highlights.slice(0, 4);
  const cols = Math.min(shown.length, 4);

  return html`
    <section class="px-5 lg:px-10 py-[60px]" style="background:#0A0B0E">
      <div
        class="max-w-[1400px] mx-auto grid gap-8 grid-cols-2"
        style="--hl-cols:${cols}"
        data-highlights
      >
        ${shown.map((kh, i) => {
          const { num, unit } = splitHighlightValue(kh.value);
          const isLast = i === shown.length - 1;

          // Nilai tanpa angka sama sekali ("Adjustable", "Smart") tidak muat
          // pada ukuran angka besar. Dikecilkan dan dibiarkan membungkus.
          const isWordValue = !/\d/.test(num);
          const fontSize = isWordValue ? 'clamp(20px,2.4vw,32px)' : 'clamp(36px,4vw,56px)';

          return html`<div
            class="text-center px-4 py-0 highlight-cell min-w-0"
            style="border-right:${isLast ? 'none' : '1px solid rgba(255,255,255,0.10)'}"
          >
            <div
              class="font-display font-extrabold leading-none tracking-[-0.04em] mb-2"
              style="font-size:${fontSize};background:linear-gradient(135deg,#00ffff,#0066ff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;overflow-wrap:anywhere"
            >
              ${num}${unit ? html`<small style="font-size:60%">${unit}</small>` : raw('')}
            </div>
            <div class="font-mono text-[12px] text-hkm-300 uppercase tracking-[0.1em]">
              ${loc(kh.label, lang)}
            </div>
          </div>`;
        })}
      </div>
    </section>
  `;
}
