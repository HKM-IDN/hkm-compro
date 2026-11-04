/**
 * Section 7: Instagram — port dari components/sections/InstagramSection.js
 *                        + components/social/InstagramFeed.js
 *
 * Dua mode, diatur dari Sanity Studio tanpa perlu deploy ulang
 * (lihat CLAUDE.md "Instagram Section — Lightwidget Toggle Workflow"):
 *   - link_card   (default) : kartu CTA statis
 *   - lightwidget           : iframe feed Lightwidget
 *
 * Perbedaan dari versi React:
 *  - Skeleton + timer 3 detik + onLoad iframe → src/js/instagram.js.
 *  - `<Script strategy="lazyOnload">` diganti <script defer> biasa yang
 *    hanya dirender saat mode lightwidget aktif.
 *  - Event GA "instagram_feed_view" tetap ada, lewat IntersectionObserver.
 */
import { html, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { INSTAGRAM_LABELS } from '../content/homepage.mjs';

const IG_GLYPH = html`<svg
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#fff"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
  <circle cx="12" cy="12" r="4" />
  <circle cx="17.5" cy="6.5" r="0.5" fill="#fff" stroke="none" />
</svg>`;

const OUTLINE_BTN =
  'inline-flex items-center gap-2 bg-transparent text-white px-7 py-3.5 rounded-[8px] ' +
  'font-semibold text-sm no-underline transition-all duration-200 ' +
  'hover:border-cyan-bright hover:text-cyan-bright';

function sectionHeader({ t, title }) {
  return html`<div class="text-center mb-12">
    <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-[14px]">
      ${t.eyebrow}
    </p>
    <h2
      class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] max-w-[800px] mx-auto mb-4 [&>span]:text-cyan-bright"
      style="font-size:clamp(32px,4.5vw,56px)"
    >
      ${raw(sanitizeHtml(title))}
    </h2>
    <p class="text-[16px] text-hkm-300 max-w-[580px] mx-auto leading-[1.6]">${t.sub}</p>
  </div>`;
}

function linkCard({ t, handle, igUrl }) {
  return html`<div class="flex flex-col items-center gap-8">
    <div
      class="w-full max-w-[560px] mx-auto rounded-[20px] border border-white/10 p-10 flex flex-col items-center gap-6 text-center"
      style="background:linear-gradient(135deg, rgba(0,102,255,0.10), rgba(0,255,255,0.04))"
    >
      <div
        class="w-16 h-16 rounded-[18px] flex items-center justify-center"
        style="background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
      >
        ${IG_GLYPH}
      </div>

      <div>
        <p class="font-display font-bold text-white text-[22px] mb-1">@${handle}</p>
        <p class="text-[15px] text-hkm-300 leading-[1.6] max-w-[380px]">${t.cardDesc}</p>
      </div>

      <a
        href="${igUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="${OUTLINE_BTN.replace('px-7', 'px-8').replace('text-sm', 'text-[14px]')}"
        style="border:1px solid rgba(255,255,255,0.18)"
        >${t.followBtn}</a
      >
    </div>
  </div>`;
}

function lightwidgetFeed({ widgetId, minHeight = 600 }) {
  return html`<div class="relative w-full" data-ig-feed style="min-height:${minHeight}px">
    <!-- Skeleton menutupi iframe kosong sampai fotonya termuat -->
    <div data-ig-skeleton class="absolute inset-0 rounded-[12px] skeleton" aria-hidden="true"></div>

    <iframe
      data-ig-iframe
      title="Instagram feed"
      aria-label="Instagram photos"
      src="https://cdn.lightwidget.com/widgets/${widgetId}.html"
      scrolling="no"
      loading="lazy"
      class="lightwidget-widget"
      style="width:100%;border:0;overflow:hidden;display:block;opacity:0;transition:opacity 0.4s ease;min-height:${minHeight}px"
    ></iframe>

    <!-- Menyesuaikan tinggi iframe setelah foto Instagram termuat.
         SRI tidak dipakai: Lightwidget sering memperbarui JS-nya
         (pengecualian yang sama dengan gtag.js — lihat CLAUDE.md). -->
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js" defer></script>
  </div>`;
}

export function instagramSection({ data, settings, spCount = 0, lang }) {
  // socialFeed.enabled default true — sembunyikan hanya kalau eksplisit false
  if (settings?.socialFeed?.enabled === false) return raw('');

  const t = INSTAGRAM_LABELS[lang] || INSTAGRAM_LABELS.en;

  const rawHandle = settings?.socialFeed?.handle || data?.instagramHandle || 'hkm.idn';
  const handle = rawHandle.replace(/^@/, '');
  const igUrl = settings?.socialInstagram || `https://instagram.com/${handle}`;
  const title = loc(data?.instagramSectionTitle, lang) || t.title;

  const mode = settings?.socialFeed?.mode || 'link_card';
  const widgetId = settings?.socialFeed?.lightwidgetId || null;

  const resolvedT = { ...t, cardDesc: t.cardDesc.replace('{count}', `${spCount}`) };

  const useFeed = mode === 'lightwidget' && widgetId;

  return html`
    <section
      id="instagram"
      class="px-5 md:px-10 py-[80px] lg:py-[120px]"
      style="background:#0A0B0E"
    >
      <div class="max-w-[1400px] mx-auto">
        ${sectionHeader({ t, title })}
        ${useFeed
          ? html`${lightwidgetFeed({ widgetId })}
              <div class="text-center mt-8">
                <p class="font-display text-[18px] text-white mb-4">
                  <a
                    href="${igUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-cyan-bright no-underline hover:underline"
                    >@${handle}</a
                  >
                </p>
                <a
                  href="${igUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="${OUTLINE_BTN}"
                  style="border:1px solid rgba(255,255,255,0.18)"
                  >${t.followBtn}</a
                >
              </div>`
          : linkCard({ t: resolvedT, handle, igUrl })}
      </div>
    </section>
  `;
}

/** Apakah halaman perlu memuat /assets/js/instagram.js */
export function needsInstagramScript(settings) {
  return (
    settings?.socialFeed?.mode === 'lightwidget' && Boolean(settings?.socialFeed?.lightwidgetId)
  );
}
