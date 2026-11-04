/**
 * Feature sections — port dari components/products/detail/FeatureSections.js
 *
 * Sampai 6 bagian fitur, berselang-seling kiri/kanan, tiap bagian punya
 * glow latar yang berputar (tengah → kiri-atas → kanan-atas).
 *
 * Perbedaan dari versi React:
 *  - Ukuran font judul diberi batas bawah lebih kecil + overflow-wrap.
 *    Sebabnya: judul fitur berbahasa Indonesia lebih panjang dari versi
 *    Inggris. "Komunikasi" pada clamp(80px…) melebar jadi 407px di layar
 *    390px dan memicu scroll horizontal — hanya terlihat di halaman /id.
 *    Versi React punya masalah yang sama, tapi tersembunyi karena bahasa
 *    ditukar lewat localStorage, bukan lewat URL terpisah.
 *  - Tata letak terbalik (gambar di kanan) dulu memakai `direction: rtl`
 *    pada grid lalu `direction: ltr` lagi di tiap anak. Itu trik yang
 *    rapuh: screen reader dan seleksi teks ikut terpengaruh arah teks.
 *    Di sini dipakai `order` CSS — hasil visual sama, urutan baca benar.
 */
import { html, raw, cls } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';
import { mediaSlot, hasMedia } from '../../partials/media-slot.mjs';

const GLOW_STYLES = {
  'glow-c': 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,255,0.22), transparent 60%)',
  'glow-tl': 'radial-gradient(ellipse 50% 50% at 20% 20%, rgba(0,102,255,0.30), transparent 60%)',
  'glow-tr': 'radial-gradient(ellipse 50% 50% at 80% 20%, rgba(0,255,255,0.22), transparent 60%)',
};
const GLOWS = ['glow-c', 'glow-tl', 'glow-tr', 'glow-c', 'glow-tl', 'glow-tr'];

/**
 * Dokumen baru memakai section.media; dokumen lama punya section.image
 * langsung. Keduanya didukung — tidak perlu migrasi data.
 */
function resolveMedia(section) {
  if (section.media?.type) return section.media;
  if (section.image?.asset) return { type: 'image', image: section.image };
  return null;
}

function featureVisual({ media, title }) {
  return html`<div
    class="group relative flex items-center justify-center"
    style="aspect-ratio:1/1;background:linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px),radial-gradient(ellipse at 50% 100%, rgba(0,102,255,0.14), transparent 55%);background-size:40px 40px, 40px 40px, 100% 100%;-webkit-mask-image:radial-gradient(ellipse 88% 88% at 50% 50%, black 40%, transparent 85%);mask-image:radial-gradient(ellipse 88% 88% at 50% 50%, black 40%, transparent 85%)"
  >
    <div
      class="absolute pointer-events-none z-[1] opacity-60 group-hover:opacity-100 transition-opacity duration-[400ms]"
      style="width:60%;aspect-ratio:2/1;bottom:6%;left:50%;transform:translateX(-50%);background:rgba(0,184,217,0.3);filter:blur(28px)"
    ></div>

    ${hasMedia(media)
      ? mediaSlot({ media, alt: title, sizes: '(max-width: 980px) 100vw, 50vw' })
      : html`<div
          class="font-display font-extrabold tracking-[-0.04em] relative z-[2]"
          style="font-size:clamp(60px,8vw,120px);background:linear-gradient(135deg,#FFFFFF,#00ffff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent"
        >
          ${title.charAt(0)}
        </div>`}
  </div>`;
}

export function featureSections({ sections = [], lang }) {
  const usable = sections.slice(0, 6).filter((s) => {
    const t = s.title;
    return (t?.en && t.en.trim()) || (t?.id && t.id.trim());
  });

  if (!usable.length) return raw('');

  return html`${usable.map((section, i) => {
    const media = resolveMedia(section);
    const withMedia = hasMedia(media);
    const isReverse = section.imagePosition === 'right';
    const glow = GLOWS[i % 6];
    const title = loc(section.title, lang);
    const desc = loc(section.description, lang);
    const eyebrow = `— ${String(i + 1).padStart(2, '0')} / ${title}`;

    return html`<section class="px-5 lg:px-10 py-[140px] relative" style="background:#0A0B0E">
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:${GLOW_STYLES[glow]}"
      ></div>

      ${withMedia
        ? html`<div
            class="max-w-[1400px] mx-auto relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[80px] items-center"
          >
            <div class="${cls(isReverse && 'lg:order-2')}">
              <div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
                ${eyebrow}
              </div>
              <h2
                class="font-display font-extrabold leading-[0.95] tracking-[-0.04em] mb-6 page-gradient-title"
                style="font-size:clamp(32px,6vw,88px);overflow-wrap:anywhere"
              >
                <span>${title}.</span>
              </h2>
              ${desc &&
              html`<p class="text-[18px] text-hkm-300 leading-relaxed max-w-[680px]">${desc}</p>`}
            </div>
            <div class="${cls(isReverse && 'lg:order-1')}">${featureVisual({ media, title })}</div>
          </div>`
        : html`<div class="max-w-[1400px] mx-auto relative z-[2] text-center">
            <div class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
              ${eyebrow}
            </div>
            <h2
              class="font-display font-extrabold leading-[0.95] tracking-[-0.04em] mb-6 mx-auto max-w-[900px] page-gradient-title"
              style="font-size:clamp(32px,6vw,88px);overflow-wrap:anywhere"
            >
              <span>${title}.</span>
            </h2>
            ${desc &&
            html`<p class="text-[18px] text-hkm-300 leading-relaxed max-w-[680px] mx-auto mb-12">
              ${desc}
            </p>`}

            <div
              class="mx-auto rounded-[24px] border border-white/10 flex items-center justify-center flex-col"
              style="max-width:1000px;aspect-ratio:16/9;background:radial-gradient(circle at 50% 50%, rgba(0,255,255,0.22), transparent 70%)"
            >
              <div
                class="font-display font-extrabold leading-none tracking-[-0.04em]"
                style="font-size:clamp(40px,14vw,180px);background:linear-gradient(135deg,#FFFFFF,#00ffff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;overflow-wrap:anywhere;max-width:100%"
              >
                ${title.split(' ')[0]}
              </div>
              <div class="font-mono text-[13px] text-hkm-300 uppercase tracking-[0.15em] mt-4">
                ${desc?.split('.')[0]}
              </div>
            </div>
          </div>`}
    </section>`;
  })}`;
}
