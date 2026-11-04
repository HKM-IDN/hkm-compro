/**
 * Section 8: Credibility — port dari components/sections/CredibilitySection.js
 *
 * Isi: grid statistik + marquee logo partner yang berjalan terus.
 *
 * Perbedaan dari versi React:
 *  - Pause marquee saat hover dulu diatur onMouseEnter/onMouseLeave yang
 *    menyetel animationPlayState. Di sini CSS murni:
 *    .marquee-track:hover { animation-play-state: paused }.
 *    Efek sampingnya justru lebih baik — pause juga berlaku saat fokus
 *    keyboard, jadi pengguna keyboard bisa mengejar link partner.
 */
import { html, raw, cls, attrs } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { CREDIBILITY_LABELS } from '../content/homepage.mjs';

const CARD_CLASS =
  'flex-shrink-0 flex items-center justify-center rounded-[12px] border transition-all ' +
  'duration-200 border-white/10 hover:border-cyan-bright/30 hover:bg-white/[0.03]';
const CARD_STYLE = 'background:#131419;width:200px;padding:24px';

/** Satu kartu partner. `duplicate` = salinan untuk loop mulus, disembunyikan dari screen reader. */
function partnerCard({ partner, duplicate = false }) {
  const inner = html`<span
    class="font-display text-[15px] font-semibold text-white/70 tracking-[-0.02em] text-center leading-tight whitespace-nowrap"
    >${partner.name}</span
  >`;

  if (partner.url) {
    return html`<a
      href="${partner.url}"
      target="_blank"
      rel="noopener noreferrer"
      class="${CARD_CLASS} no-underline"
      style="${CARD_STYLE}"
      ${attrs({ 'aria-hidden': duplicate ? 'true' : null, tabindex: duplicate ? '-1' : null })}
      >${inner}</a
    >`;
  }

  return html`<div
    class="${CARD_CLASS}"
    style="${CARD_STYLE}"
    ${attrs({ 'aria-hidden': duplicate ? 'true' : null })}
  >
    ${inner}
  </div>`;
}

export function credibilitySection({ data, lang }) {
  const t = CREDIBILITY_LABELS[lang] || CREDIBILITY_LABELS.en;

  const stats = data?.credibilityStats || [];
  const partners = data?.partners || [];
  const partnersTitle = loc(data?.partnersTitle, lang) || t.partnersLabel;

  if (!stats.length && !partners.length) return raw('');

  // Kolom menyesuaikan jumlah statistik supaya rata tengah, bukan rata kiri
  const colClass =
    ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4'][
      Math.min(stats.length, 4)
    ] || 'lg:grid-cols-4';

  return html`
    <section class="px-10 py-[100px]" style="background:#0A0B0E">
      <div class="max-w-[1400px] mx-auto">
        ${stats.length > 0
          ? html`<div
              data-testid="credibility-stats"
              class="${cls('grid grid-cols-2 gap-8 mb-20', colClass)}"
            >
              ${stats.map(
                (stat) =>
                  html`<div
                    class="text-center py-8 px-4 border-r border-white/10 last:border-r-0 min-w-0"
                  >
                    <!-- Tanpa overflow-hidden: itu memotong teks bergradien
                       (-webkit-text-fill-color). Ukuran font dikecilkan supaya
                       nilai multi-kata seperti "1 Million+" tetap satu baris. -->
                    <div
                      class="font-display font-bold tracking-[-0.04em] leading-tight mb-2 pb-1 break-words"
                      style="font-size:clamp(28px,3.5vw,44px);background:linear-gradient(135deg,#FFFFFF 0%,#0066ff 60%,#00ffff 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent"
                    >
                      ${stat.value}
                    </div>
                    <p
                      class="text-[11px] text-hkm-300 font-medium uppercase tracking-[0.08em] leading-snug break-words"
                    >
                      ${loc(stat.label, lang)}
                    </p>
                  </div>`
              )}
            </div>`
          : raw('')}
        ${partners.length > 0
          ? html`<div class="${stats.length > 0 ? 'pt-[60px] border-t border-white/10' : ''}">
              <p
                class="font-mono text-[12px] text-hkm-500 uppercase tracking-[0.2em] mb-8 text-center"
              >
                ${partnersTitle}
              </p>

              <div class="relative overflow-hidden">
                <div
                  class="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                  style="background:linear-gradient(to right, #0A0B0E, transparent)"
                ></div>
                <div
                  class="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                  style="background:linear-gradient(to left, #0A0B0E, transparent)"
                ></div>

                <!-- Daftar digandakan supaya loop-nya mulus (translateX -50%) -->
                <div class="flex marquee-track" style="gap:24px;width:max-content">
                  ${partners.map((partner) => partnerCard({ partner }))}
                  ${partners.map((partner) => partnerCard({ partner, duplicate: true }))}
                </div>
              </div>
            </div>`
          : raw('')}
      </div>
    </section>
  `;
}
