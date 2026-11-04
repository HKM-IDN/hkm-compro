/**
 * Section 4: YouTube — port dari components/sections/YouTubeSection.js
 *
 * Perbedaan dari versi React:
 *  - Hover (boxShadow kartu besar, translateX kartu kecil) → class CSS
 *    .yt-featured / .yt-item.
 *  - Thumbnail dari img.youtube.com dulu lewat next/image, yang butuh
 *    domain itu didaftarkan di remotePatterns next.config. Sekarang <img>
 *    biasa — tidak ada konfigurasi domain yang perlu dijaga.
 */
import { html, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { urlFor } from '../sanity.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { YOUTUBE_LABELS } from '../content/homepage.mjs';

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  return m ? m[1] : null;
}

function ytThumb(video) {
  if (video?.customThumbnail?.asset) {
    return urlFor(video.customThumbnail).width(640).url();
  }
  const id = getYouTubeId(video?.url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const PLAY_ICON = html`<svg
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill="currentColor"
  style="margin-left:4px"
  aria-hidden="true"
>
  <path d="M8 5v14l11-7z" />
</svg>`;

export function youtubeSection({ data, socialYoutube, lang }) {
  const t = YOUTUBE_LABELS[lang] || YOUTUBE_LABELS.en;

  const title = loc(data?.youtubeSectionTitle, lang) || t.title;
  const sub = loc(data?.youtubeSectionDesc, lang) || t.sub;
  const featured = data?.youtubeFeatured;
  const others = data?.youtubeOthers || [];

  if (!featured && !others.length) return raw('');

  const featuredThumb = ytThumb(featured);
  const featuredTitle = loc(featured?.customTitle, lang) || 'HKM Product Review';
  const featuredDesc = loc(featured?.customDescription, lang);
  const featuredUrl = featured?.url || '#';

  return html`
    <section id="reviews" class="relative px-10 py-[120px]" style="background:#0A0B0E">
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 50% 40% at 30% 40%, rgba(0,102,255,0.18), transparent 60%)"
      ></div>

      <div class="max-w-[1400px] mx-auto relative z-[2]">
        <div class="text-center mb-16">
          <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-[14px]">
            ${t.eyebrow}
          </p>
          <h2
            class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] max-w-[800px] mx-auto mb-4 [&>span]:text-cyan-bright"
            style="font-size:clamp(32px,4.5vw,56px)"
          >
            ${raw(sanitizeHtml(title))}
          </h2>
          <p class="text-[16px] text-hkm-300 max-w-[580px] mx-auto leading-[1.6]">${sub}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          ${featured
            ? html`<a
                href="${featuredUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="yt-featured group bg-dark-3 border border-white/10 rounded-[20px] overflow-hidden no-underline transition-all duration-300 hover:-translate-y-1 hover:border-electric-blue"
              >
                <div
                  class="relative"
                  style="aspect-ratio:16/9;background:linear-gradient(135deg,#262626,#141414)"
                >
                  ${featuredThumb &&
                  html`<img
                    src="${featuredThumb}"
                    alt="${featuredTitle}"
                    loading="lazy"
                    decoding="async"
                    class="absolute inset-0 w-full h-full object-cover"
                  />`}
                  <div
                    class="absolute inset-0 flex items-center justify-center transition-all duration-200"
                    style="background:linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)"
                  >
                    <div
                      class="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center text-red-600 transition-transform duration-200 group-hover:scale-110"
                    >
                      ${PLAY_ICON}
                    </div>
                  </div>
                </div>

                <div class="p-6">
                  <p
                    class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.15em] mb-2"
                  >
                    ${t.channel}
                  </p>
                  <h3
                    class="font-display text-[22px] font-bold text-white leading-[1.3] tracking-[-0.02em] mb-2"
                  >
                    ${featuredTitle}
                  </h3>
                  ${featuredDesc && html`<p class="text-[13px] text-hkm-300">${featuredDesc}</p>`}
                </div>
              </a>`
            : raw('')}
          ${others.length > 0
            ? html`<div class="flex flex-col gap-4">
                ${others.map((video, i) => {
                  const thumb = ytThumb(video);
                  const vTitle = loc(video?.customTitle, lang) || `HKM Video ${i + 1}`;
                  const vUrl = video?.url || '#';

                  return html`<a
                    href="${vUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="yt-item group bg-dark-3 border border-white/10 rounded-[14px] overflow-hidden no-underline transition-all duration-300 hover:border-electric-blue grid"
                    style="grid-template-columns:140px 1fr"
                  >
                    <div
                      class="relative"
                      style="aspect-ratio:16/9;background:linear-gradient(135deg,#2e2e2e,#141414)"
                    >
                      ${thumb &&
                      html`<img
                        src="${thumb}"
                        alt="${vTitle}"
                        loading="lazy"
                        decoding="async"
                        class="absolute inset-0 w-full h-full object-cover"
                      />`}
                      <div
                        class="absolute inset-0 flex items-center justify-center text-white text-[18px]"
                        style="text-shadow:0 2px 6px rgba(0,0,0,0.6)"
                        aria-hidden="true"
                      >
                        ▶
                      </div>
                    </div>

                    <div class="p-3 flex flex-col justify-center">
                      <p
                        class="text-[13px] font-semibold text-white leading-[1.3] mb-1.5 line-clamp-2"
                      >
                        ${vTitle}
                      </p>
                      <p class="text-[11px] text-hkm-500 font-mono">${t.channel}</p>
                    </div>
                  </a>`;
                })}
              </div>`
            : raw('')}
        </div>

        <div class="text-center mt-12">
          <a
            href="${socialYoutube || '#'}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-transparent text-white px-7 py-3.5 rounded-[8px] font-semibold text-sm no-underline transition-all duration-200 hover:border-cyan-bright hover:text-cyan-bright"
            style="border:1px solid rgba(255,255,255,0.18)"
            >${t.channelBtn}</a
          >
        </div>
      </div>
    </section>
  `;
}
