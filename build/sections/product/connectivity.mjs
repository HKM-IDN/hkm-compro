/**
 * Konektivitas & port — port dari
 * components/products/detail/ConnectivityPortsSection.js
 *
 * ── BUG LAMA YANG DIPERBAIKI DI SINI ──────────────────────────────────────
 *
 * Versi React memetakan slug kategori → gaya visual begini:
 *
 *   const CATEGORY_STYLE_MAP = {
 *     'cpe-router': 'router-ports',
 *     'mobile-wifi': 'mifi-ports',
 *     'ip-camera': 'camera-ports',
 *     'dash-camera': null,      // ← slug aslinya 'dash-cam', bukan 'dash-camera'
 *     'smart-home': null,
 *     'nomor-cantik': null,
 *   };
 *   return CATEGORY_STYLE_MAP[categorySlug] ?? 'router-ports';
 *
 * Ada dua masalah:
 *
 *   1. Kunci 'dash-camera' tidak cocok dengan slug sebenarnya di Sanity
 *      ('dash-cam'), jadi dash cam tidak pernah kena aturannya.
 *   2. `??` hanya jatuh ke cadangan saat null/undefined — padahal nilainya
 *      MEMANG null. Jadi 'smart-home' dan 'nomor-cantik' yang sengaja
 *      diberi null justru ikut jatuh ke 'router-ports'.
 *
 * Akibatnya (sudah diverifikasi di browser pada build production Next):
 * halaman lampu pintar, kartu SIM, dan dash cam menampilkan gambar
 * BODI ROUTER. 12 produk terdampak.
 *
 * Di sini pemetaannya memakai pengecekan kunci eksplisit, sesuai maksud
 * yang ditulis di komentar kode aslinya: kategori ber-nilai null =
 * tampilkan kartu port saja, tanpa gambar perangkat.
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';
import { routerPortsVisual } from './connectivity-router.mjs';
import { mifiPortsVisual } from './connectivity-mifi.mjs';
import { cameraPortsVisual } from './connectivity-camera.mjs';

// Slug kategori → gaya visual. null = sengaja tanpa gambar perangkat.
const CATEGORY_STYLE_MAP = {
  'cpe-router': 'router-ports',
  'mobile-wifi': 'mifi-ports',
  'ip-camera': 'camera-ports',
  'dash-cam': null,
  'smart-home': null,
  'nomor-cantik': null,
};

function resolveVisualStyle(categorySlug, explicitStyle) {
  if (explicitStyle && explicitStyle !== 'auto') return explicitStyle;

  // Pengecekan kunci eksplisit: null berarti "tanpa visual", bukan
  // "pakai cadangan". Ini yang membedakan dari versi React.
  if (Object.prototype.hasOwnProperty.call(CATEGORY_STYLE_MAP, categorySlug)) {
    return CATEGORY_STYLE_MAP[categorySlug];
  }
  return 'router-ports'; // kategori baru yang belum terdaftar
}

function deviceVisual({ style, ports, highlights, lang }) {
  if (style === 'router-ports') return routerPortsVisual({ ports });
  if (style === 'mifi-ports') return mifiPortsVisual({ ports, highlights, lang });
  if (style === 'camera-ports') return cameraPortsVisual({ ports, highlights, lang });
  return raw(''); // null / tidak dikenal → kartu port saja
}

export function connectivitySection({
  connectivity,
  lang,
  categorySlug = '',
  visualStyle: explicitStyle,
  highlights,
}) {
  if (!connectivity?.ports?.length) return raw('');

  const eyebrow = loc(connectivity.eyebrow, lang);
  const headline = loc(connectivity.headline, lang);
  const ports = connectivity.ports;
  const style = resolveVisualStyle(categorySlug, explicitStyle);

  return html`
    <!-- overflow-x:clip — halo & pantulan pada visual perangkat memakai
         position:absolute dengan lebar lebih besar dari wadahnya (mis. halo
         330px di atas bodi 200px). Itu menambah lebar dokumen dan memicu
         scroll horizontal di layar sempit. Dipakai clip, bukan hidden,
         agar tidak jadi scroll container dan tidak memotong teks bergradien
         (catatan CLAUDE.md). Halo-nya sendiri berujung transparan, jadi
         terpotong pun tidak terlihat. -->
    <section
      class="px-5 lg:px-10 py-16 lg:py-[120px] relative"
      style="background:#0A0B0E;overflow-x:clip"
    >
      <!-- Glow latar, dipusatkan di 55% agar memudar sebelum tepi section -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 60% 45% at 50% 55%, rgba(0,102,255,0.08), transparent 65%)"
      ></div>

      <div class="max-w-[1400px] mx-auto relative z-[2]">
        <div class="text-center mb-14">
          ${eyebrow &&
          html`<div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
            ${eyebrow}
          </div>`}
          <h2
            class="font-display font-extrabold leading-[0.95] tracking-[-0.04em] mx-auto page-gradient-title"
            style="font-size:clamp(32px,5vw,72px);max-width:700px"
          >
            <span>${headline}</span>
          </h2>
        </div>

        <div class="max-w-[860px] mx-auto">
          ${deviceVisual({ style, ports, highlights, lang })}

          <!-- Kartu detail port — selalu tampil -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${ports.map((port) => {
              const name = loc(port.name, lang);
              const caption = loc(port.caption, lang);

              return html`<div
                class="rounded-[14px] p-5 border flex items-start gap-4"
                style="background:${port.highlighted
                  ? 'linear-gradient(135deg, rgba(0,184,217,0.08), rgba(0,102,255,0.06))'
                  : 'linear-gradient(135deg, #1c1e24, #131419)'};border-color:${port.highlighted
                  ? 'rgba(0,184,217,0.30)'
                  : 'rgba(255,255,255,0.08)'}"
              >
                <div
                  class="font-mono font-bold text-[20px] leading-none shrink-0 mt-0.5"
                  style="color:${port.highlighted ? '#00B8D9' : '#7C8694'}"
                >
                  ${port.count || '1×'}
                </div>
                <div>
                  <div class="font-display font-semibold text-white text-[15px] leading-[1.3] mb-1">
                    ${name}
                  </div>
                  ${caption &&
                  html`<div class="font-mono text-[11px] text-hkm-500 leading-[1.5]">
                    ${caption}
                  </div>`}
                </div>
              </div>`;
            })}
          </div>
        </div>
      </div>
    </section>
  `;
}
