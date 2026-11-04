/**
 * Spesifikasi — port dari components/products/detail/SpecsSection.js
 *
 * Perbedaan dari versi React:
 *  - Versi React memakai grid `280px 1fr` dengan gap 60px TANPA breakpoint.
 *    Di layar 390px itu 280+60 = 340px sudah terpakai sebelum nilai
 *    spesifikasinya muncul — kolom kanan terhimpit dan teks meluber.
 *    Di sini jadi satu kolom di mobile (class .spec-row), dua kolom di
 *    desktop. Tampilan desktop persis sama.
 *  - Panel ini dulu hanya dirender saat tab "Spesifikasi" diklik, jadi
 *    tidak pernah terbaca mesin pencari. Sekarang selalu ada di HTML.
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';

/**
 * Nilai spesifikasi bisa berisi beberapa baris:
 *   baris sebelum bullet pertama → judul (putih, tebal)
 *   baris diawali "•"            → poin (abu, bertanda ●)
 *   baris setelah bullet         → catatan kecil
 * Logika ini disalin apa adanya dari SpecValueRenderer.
 */
function specValue(text) {
  if (!text) return raw('');

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const firstBulletIdx = lines.findIndex((l) => l.startsWith('•'));

  const classified = lines.map((line, idx) => {
    if (line.startsWith('•')) return { type: 'bullet', text: line.slice(1).trim() };
    if (firstBulletIdx === -1 || idx < firstBulletIdx) return { type: 'header', text: line };
    return { type: 'note', text: line };
  });

  return html`<div class="flex flex-col gap-1.5">
    ${classified.map((item) => {
      if (item.type === 'header') {
        return html`<span class="font-display font-semibold text-white text-[15px] leading-[1.5]"
          >${item.text}</span
        >`;
      }
      if (item.type === 'bullet') {
        return html`<span class="flex items-start gap-2 text-[15px] text-hkm-300 leading-[1.6]">
          <span style="color:#00B8D9;flex-shrink:0">●</span>${item.text}
        </span>`;
      }
      return html`<span class="text-[13px] text-hkm-500 leading-[1.5]">${item.text}</span>`;
    })}
  </div>`;
}

export function specsSection({ groups = [], t, lang }) {
  return html`
    <section class="px-5 lg:px-10 py-[100px]" style="background:#0A0B0E">
      <div class="max-w-[1400px] mx-auto">
        <div class="text-center mb-16">
          <div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
            ${t.fullSpecs}
          </div>
          <h2
            class="font-display font-extrabold leading-[0.95] tracking-[-0.04em] mx-auto page-gradient-title"
            style="font-size:clamp(32px,4vw,56px);max-width:600px"
          >
            ${t.everyDetail} <span>${t.documented}</span>
          </h2>
        </div>

        <div class="max-w-[1100px] mx-auto">
          ${groups.length === 0
            ? html`<p class="text-hkm-500 text-center py-16">
                ${lang === 'id' ? 'Spesifikasi belum tersedia.' : 'No specifications available.'}
              </p>`
            : groups.map(
                (group) =>
                  html`<div class="mb-12">
                    <div
                      class="font-display font-bold text-white uppercase tracking-[0.02em] pb-5 mb-0 border-b-2 border-white/[0.18]"
                      style="font-size:clamp(28px,3vw,40px)"
                    >
                      ${loc(group.groupName, lang)}
                    </div>

                    ${(group.rows || []).map((row, ri) => {
                      const isLastRow = ri === (group.rows?.length || 0) - 1;
                      return html`<div
                        class="spec-row items-start py-7"
                        style="border-bottom:${isLastRow
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.10)'}"
                      >
                        <div
                          class="font-display text-[17px] font-semibold text-white leading-[1.4]"
                        >
                          ${loc(row.label, lang)}
                        </div>
                        <div>
                          ${specValue(loc(row.value, lang) || '')}
                          ${row.footnote &&
                          html`<div class="text-[12px] text-hkm-500 leading-[1.5] mt-2">
                            ${loc(row.footnote, lang)}
                          </div>`}
                        </div>
                      </div>`;
                    })}
                  </div>`
              )}
        </div>
      </div>
    </section>
  `;
}
