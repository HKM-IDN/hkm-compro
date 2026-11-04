/**
 * Hero produk — port dari components/products/detail/HeroSection.js
 *
 * Perbedaan dari versi React:
 *  - `useState(() => Date.now())` untuk badge "Baru" diganti waktu build
 *    yang dilewatkan sebagai argumen `now` (aturan CLAUDE.md: jangan panggil
 *    Date.now() di dalam render).
 *  - Hover tombol CTA (ganti background/warna lewat onMouseEnter) → class
 *    .btn-buy-cta.
 *  - Galeri <ImageZoom> diganti partial gallery.mjs + src/js/lightbox.js.
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';
import { urlFor } from '../../sanity.mjs';
import { mediaSlot, hasMedia } from '../../partials/media-slot.mjs';
import { gallery } from '../../partials/gallery.mjs';

/** Perangkat placeholder saat produk belum punya gambar maupun video. */
const DEVICE_PLACEHOLDER = html`<div
  class="relative z-[2] rounded-[24px]"
  style="width:70%;aspect-ratio:1.3/1;background:linear-gradient(145deg,#1a1c24,#0A0B0E);box-shadow:0 50px 100px rgba(0,0,0,0.6), 0 0 80px rgba(0,184,217,0.18), 0 0 50px rgba(0,102,255,0.22);transform:perspective(1500px) rotateX(8deg) rotateY(-10deg);border:1px solid rgba(0,184,217,0.15)"
>
  <div
    class="absolute rounded-full"
    style="top:10%;left:28%;right:28%;height:4px;background:linear-gradient(90deg, transparent, #00B8D9, transparent);box-shadow:0 0 20px #00B8D9"
  ></div>
  <div
    class="absolute rounded-[12px] border"
    style="inset:22% 16%;background:radial-gradient(circle at 30% 30%, rgba(0,184,217,0.2), transparent 60%);border-color:rgba(0,184,217,0.15)"
  ></div>
</div>`;

export function productHero({ product, name, tagline, description, t, lang, now }) {
  const isFeatured = product.isFeatured;
  const isNew = product.launchDate
    ? now - new Date(product.launchDate).getTime() < 90 * 24 * 60 * 60 * 1000
    : false;

  const heroMedia =
    product.heroVideo?.enabled && product.heroVideo?.mp4Url
      ? {
          type: 'video',
          mp4Url: product.heroVideo.mp4Url,
          webmUrl: product.heroVideo.webmUrl,
          poster: product.heroVideo.poster || product.heroImage,
        }
      : product.heroImage?.asset
        ? { type: 'image', image: product.heroImage }
        : null;

  return html`
    <section
      class="px-5 lg:px-10 relative flex items-center"
      style="background:#0A0B0E;padding-top:80px;padding-bottom:100px;min-height:90vh"
    >
      <!-- Ambient biru untuk kolom teks -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 58% 55% at 30% 45%, rgba(0,102,255,0.17), transparent 65%)"
      ></div>
      <!-- Glow produk — desktop -->
      <div
        class="hidden lg:block absolute inset-0 pointer-events-none"
        style="background:radial-gradient(circle 520px at 68% 50%, rgba(0,184,217,0.13) 0%, transparent 60%)"
      ></div>
      <!-- Glow produk — mobile (produk turun ke bawah teks) -->
      <div
        class="lg:hidden absolute inset-0 pointer-events-none"
        style="background:radial-gradient(circle 280px at 50% 65%, rgba(0,184,217,0.13) 0%, transparent 60%)"
      ></div>
      <!-- Grid overlay -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background-image:linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse 70% 55% at 50% 45%, black 30%, transparent 80%);mask-image:radial-gradient(ellipse 70% 55% at 50% 45%, black 30%, transparent 80%)"
      ></div>
      <!-- Fade bawah, di atas konten supaya tepi glow larut -->
      <div
        class="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]"
        style="height:160px;background:linear-gradient(to bottom, transparent, #0A0B0E)"
      ></div>

      <div class="max-w-[1400px] mx-auto w-full relative z-[2]">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-[60px] items-center">
          <!-- Kiri: info -->
          <div>
            <div class="flex gap-2 mb-5">
              ${isNew
                ? html`<span
                    class="font-mono text-[11px] text-white uppercase tracking-[0.15em] px-3 py-[5px] rounded-full"
                    style="background:#0066ff"
                    >${t.newBadge}</span
                  >`
                : raw('')}
              ${isFeatured
                ? html`<span
                    class="font-mono text-[11px] uppercase tracking-[0.15em] px-3 py-[5px] rounded-full border"
                    style="color:#00ffff;border-color:rgba(0,255,255,0.3);background:rgba(0,255,255,0.05)"
                    >${t.flagship}</span
                  >`
                : raw('')}
            </div>

            ${product.modelNumber &&
            html`<div
              class="font-mono text-[13px] text-cyan-bright uppercase tracking-[0.2em] mb-3"
            >
              ${product.modelNumber}${product.brand ? ` · ${product.brand}` : ''}
            </div>`}

            <h1
              class="font-display font-extrabold leading-[0.95] mb-4"
              style="font-size:clamp(48px,7vw,96px);background:linear-gradient(180deg,#FFFFFF,#B8C5D9);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent"
            >
              ${name}.
            </h1>

            ${tagline &&
            html`<p
              class="font-display font-medium text-cyan-bright mb-6"
              style="font-size:clamp(18px,2vw,24px)"
            >
              ${tagline}
            </p>`}
            ${description &&
            html`<p class="text-[16px] text-hkm-300 leading-relaxed mb-8">${description}</p>`}
            ${product.keyHighlights?.length > 0
              ? html`<div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-9">
                  ${product.keyHighlights.map(
                    (kh) =>
                      html`<div class="flex items-center gap-[10px] text-[14px] text-hkm-100">
                        <span class="text-cyan-bright font-bold text-[18px] flex-shrink-0">+</span>
                        ${kh.value}${kh.label ? ` · ${loc(kh.label, lang)}` : ''}
                      </div>`
                  )}
                </div>`
              : raw('')}

            <div class="flex gap-3 flex-wrap">
              <a
                href="#buy"
                data-tab-goto="overview"
                class="btn-buy-cta inline-flex items-center gap-2 font-semibold text-[14px] px-7 py-[14px] rounded-[8px] text-white no-underline transition-all duration-200 hover:-translate-y-[2px]"
                style="background:#0066ff"
                >${t.whereToBuy}</a
              >
              ${product.featureSections?.length > 0
                ? html`<a
                    href="#features"
                    data-tab-goto="overview"
                    class="inline-flex items-center gap-2 font-semibold text-[14px] px-7 py-[14px] rounded-[8px] text-white no-underline transition-all duration-200 border hover:border-cyan-bright hover:text-cyan-bright"
                    style="border-color:rgba(255,255,255,0.18);background:transparent"
                    >${t.exploreFeatures}</a
                  >`
                : raw('')}
            </div>
          </div>

          <!-- Kanan: visual produk -->
          <div class="group relative flex items-center justify-center" style="aspect-ratio:4/3">
            ${hasMedia(heroMedia)
              ? mediaSlot({
                  media: heroMedia,
                  alt: name,
                  sizes: '(max-width: 980px) 100vw, 55vw',
                  priority: true,
                })
              : DEVICE_PLACEHOLDER}
          </div>
        </div>
      </div>

      <!-- Galeri — hanya kalau produk punya gambar tambahan -->
      ${product.gallery?.length > 0
        ? html`<div
            class="relative z-[2] max-w-[1400px] mx-auto px-5 lg:px-10 pb-[60px]"
            style="border-top:1px solid rgba(255,255,255,0.04)"
          >
            <p class="font-mono text-[11px] text-hkm-500 uppercase tracking-[0.15em] pt-8 mb-4">
              ${lang === 'id' ? 'Galeri Produk' : 'Product Gallery'}
            </p>
            ${gallery({
              images: product.gallery.map((img) => ({
                src: urlFor(img).width(900).fit('max').url(),
                thumb: urlFor(img).width(300).fit('max').url(),
                alt: loc(product.name, lang) || '',
              })),
              lang,
            })}
          </div>`
        : raw('')}
    </section>
  `;
}
