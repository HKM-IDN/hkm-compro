/**
 * Section 1: Hero — port dari components/sections/HeroSection.js
 *
 * Perbedaan dari versi React:
 *  - Hover boxShadow tombol CTA (onMouseEnter/onMouseLeave) → class
 *    .btn-primary-glow di main.css.
 *  - Animasi LED pakai inline style `animation` dengan delay berbeda per
 *    LED; di sini jadi class .hero-led dengan nth-child, supaya tidak ada
 *    style dinamis sama sekali.
 */
import { html, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { t as tKey } from '../lib/translations.mjs';
import { langPath } from '../routes.mjs';
import { HERO_LABELS } from '../content/homepage.mjs';

export function heroSection({ data, lang }) {
  const t = HERO_LABELS[lang] || HERO_LABELS.en;

  const title = loc(data?.heroTitle, lang) || 'Power<br/>The Connection.';
  const description =
    loc(data?.heroDescription, lang) || "Indonesia's connectivity, distributed nationwide.";
  const eyebrow = loc(data?.heroEyebrow, lang) || '— Featured Products';

  const ctaPrimary = {
    label: loc(data?.heroCtaPrimary?.label, lang) || t.explore,
    url: data?.heroCtaPrimary?.url || '#categories',
  };
  const ctaSecondary = {
    label: loc(data?.heroCtaSecondary?.label, lang) || t.findSP,
    url: data?.heroCtaSecondary?.url || '#service-points',
  };

  // Anchor (#categories) tidak boleh diberi prefix bahasa — hanya path internal.
  const href = (url) => (url.startsWith('#') ? url : langPath(url, lang));

  return html`
    <section
      id="hero"
      class="relative flex items-center justify-center px-5 lg:px-10 py-[100px] lg:min-h-screen"
      style="background:#0A0B0E;padding-top:max(100px,10vh)"
    >
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,102,255,0.30) 0%, transparent 60%),radial-gradient(ellipse 80% 35% at 50% 62%, rgba(0,255,255,0.16) 0%, transparent 55%)"
      ></div>
      <div
        class="absolute inset-0 pointer-events-none"
        style="background-image:linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%);mask-image:radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)"
      ></div>

      <div class="relative z-[2] text-center max-w-[1400px] w-full">
        <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-6">
          ${eyebrow}
        </p>

        <h1
          class="font-display font-bold leading-[1] tracking-[-0.04em] mb-5 pb-2"
          style="font-size:clamp(48px,9vw,140px);background:linear-gradient(180deg,#FFFFFF 0%,#B8C5D9 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent"
        >
          ${raw(sanitizeHtml(title))}
        </h1>

        <p class="text-hkm-300 font-normal mb-3" style="font-size:clamp(16px,2vw,22px)">
          ${description}
        </p>

        <p
          class="italic font-display font-medium mb-14"
          style="font-size:clamp(13px,1.4vw,17px);color:rgba(0,255,255,0.60)"
        >
          ${tKey('about', 'heroTagline', lang)}
        </p>

        <!-- Ilustrasi perangkat (murni CSS, bukan gambar) -->
        <div class="relative w-full max-w-[900px] mx-auto" style="aspect-ratio:16/9">
          <div
            class="absolute pointer-events-none"
            style="inset:-40px;background:radial-gradient(ellipse, rgba(0,255,255,0.22), transparent 70%);filter:blur(40px)"
          ></div>

          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="relative overflow-hidden"
              style="width:70%;aspect-ratio:16/10;background:linear-gradient(145deg,#2a2a2a 0%,#141414 100%);border-radius:24px;box-shadow:0 60px 120px rgba(0,0,0,0.6),0 0 60px rgba(0,102,255,0.30),0 0 120px rgba(0,255,255,0.22),inset 0 1px 0 rgba(255,255,255,0.1);transform:perspective(1500px) rotateX(8deg) rotateY(-8deg)"
            >
              <div
                class="absolute"
                style="top:12%;left:50%;transform:translateX(-50%);width:32%;height:6px;background:linear-gradient(90deg, transparent, #00ffff, transparent);border-radius:4px;box-shadow:0 0 20px #00ffff"
              ></div>

              <div
                class="absolute"
                style="inset:20% 15% 25% 15%;background:radial-gradient(circle at 30% 30%, rgba(45,212,255,0.3), transparent 50%),linear-gradient(135deg, rgba(45,212,255,0.08) 0%, transparent 60%);border:1px solid rgba(45,212,255,0.2);border-radius:12px"
              ></div>

              <div
                class="absolute flex gap-1.5"
                style="bottom:8%;left:50%;transform:translateX(-50%)"
              >
                <span class="hero-led"></span>
                <span class="hero-led"></span>
                <span class="hero-led"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3.5 justify-center mt-12 flex-wrap">
          <a
            href="${href(ctaPrimary.url)}"
            class="btn-primary-glow inline-flex items-center gap-2 bg-electric-blue text-white px-7 py-3.5 rounded-[8px] font-semibold text-sm no-underline border border-electric-blue transition-all duration-200 hover:-translate-y-0.5"
            >${ctaPrimary.label}</a
          >
          <a
            href="${href(ctaSecondary.url)}"
            class="inline-flex items-center gap-2 bg-transparent text-white px-7 py-3.5 rounded-[8px] font-semibold text-sm no-underline transition-all duration-200 hover:border-cyan-bright hover:text-cyan-bright"
            style="border:1px solid rgba(255,255,255,0.18)"
            >${ctaSecondary.label}</a
          >
        </div>
      </div>
    </section>
  `;
}
