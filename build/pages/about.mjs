/**
 * /about — port dari app/about/page.js + components/about/AboutContent.js
 *
 * Perbedaan dari versi React:
 *  - Hover kartu (boxShadow lewat onMouseEnter/onMouseLeave) → class CSS
 *    .card-hover-blue. Hasil visual sama, tanpa JS.
 *  - ICONS / EmailIcon / WAIcon / dst dipindah ke partials/icons.mjs.
 *  - Teks default ada di content/about.mjs (diekstrak apa adanya).
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import { buildMeta, jsonLd, schemaBreadcrumb, SITE_URL } from '../lib/seo.mjs';
import { loc } from '../lib/i18n.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { t as tKey } from '../lib/translations.mjs';
import { langPath } from '../routes.mjs';
import { CARD_ICONS, CONTACT_ICONS } from '../partials/icons.mjs';
import { LABELS } from '../content/about.mjs';

// ── Sub-komponen ────────────────────────────────────────────────────────────

function whyCard({ card, num, lang }) {
  return html`<div
    class="card-hover-blue bg-dark-3 border border-white/10 rounded-[20px] flex flex-col lg:flex-row gap-4 lg:gap-6 items-start transition-all duration-300 hover:-translate-y-1 hover:border-electric-blue"
    style="padding:clamp(28px,3vw,40px)"
  >
    <div
      class="flex-shrink-0 flex items-center justify-center text-cyan-bright rounded-[14px]"
      style="width:56px;height:56px;background:linear-gradient(135deg,rgba(0,102,255,0.20),rgba(0,255,255,0.05));border:1px solid rgba(255,255,255,0.18)"
    >
      ${CARD_ICONS[card.icon] || CARD_ICONS.star}
    </div>
    <div class="flex-1">
      <p class="font-mono text-[11px] text-hkm-500 uppercase tracking-[0.2em] mb-2.5">${num}</p>
      <h3
        class="font-display text-[20px] font-bold text-white leading-[1.25] tracking-[-0.02em] mb-3"
      >
        ${loc(card.title, lang)}
      </h3>
      <p class="text-[14px] text-hkm-300 leading-[1.6]">${loc(card.description, lang)}</p>
    </div>
  </div>`;
}

function contactItem({ icon, label, value }) {
  return html`<div class="flex gap-3.5 items-start">
    <div
      class="flex-shrink-0 flex items-center justify-center text-cyan-bright rounded-[10px]"
      style="width:38px;height:38px;background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.20)"
    >
      ${icon}
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-mono text-[10px] text-hkm-500 uppercase tracking-[0.15em] mb-1">${label}</p>
      <div class="text-[14px] text-white leading-[1.5]">${value}</div>
    </div>
  </div>`;
}

const LINK_CLS = 'text-white hover:text-cyan-bright transition-colors duration-200 no-underline';

// ── Body halaman ────────────────────────────────────────────────────────────

function aboutBody({ about, settings, spCount, lang }) {
  const t = LABELS[lang] || LABELS.en;
  const resolveCount = (str) => str.replace('{count}', `${spCount}`);
  const link = (url) => langPath(url || '#', lang);

  // Nilai turunan — semua pakai data Sanity dulu, fallback ke teks default
  const heroEyebrow = loc(about?.heroEyebrow, lang) || t.heroEyebrow;
  const heroTitle = loc(about?.heroTitle, lang) || t.heroTitle;
  const heroDesc = loc(about?.heroDescription, lang) || t.heroDesc;

  const stats = about?.stats?.length
    ? about.stats
    : t.defaultStats.map((s) => ({
        value: resolveCount(s.value),
        label: { en: s.label, id: s.label },
      }));

  const storyEyebrow = loc(about?.storyEyebrow, lang) || t.storyEyebrow;
  const storyHeadline = loc(about?.storyHeadline, lang) || t.storyHeadline;
  const storyParagraphs = about?.storyParagraphs?.[lang]?.length
    ? about.storyParagraphs[lang]
    : t.storyParagraphs;

  const whyHeadline = loc(about?.whyHeadline, lang) || t.whyHeadline;
  const whySub = loc(about?.whySubtitle, lang) || t.whySub;
  const whyCards = about?.whyCards?.length
    ? about.whyCards
    : t.defaultCards.map((c) => ({
        icon: c.icon,
        title: { en: c.title, id: c.title },
        description: { en: resolveCount(c.desc), id: resolveCount(c.desc) },
      }));

  const ctaEyebrow = loc(about?.ctaEyebrow, lang) || t.ctaEyebrow;
  const ctaTitle = loc(about?.ctaTitle, lang) || t.ctaTitle;
  const ctaSub = loc(about?.ctaDescription, lang) || t.ctaSub;
  const ctaButtons = about?.ctaButtons?.length
    ? about.ctaButtons
    : t.defaultButtons.map((b) => ({
        label: { en: b.label, id: b.label },
        url: b.url,
        style: b.style,
      }));

  const hasAnyContact =
    settings?.contactEmail || settings?.contactWhatsApp || settings?.contactAddress;

  return html`
    <!-- ── 1. HERO ──────────────────────────────────────────────── -->
    <section
      class="relative overflow-hidden flex items-center"
      style="background:#0A0B0E;padding:clamp(100px,12vw,160px) clamp(20px,3vw,40px) clamp(60px,6vw,80px);min-height:70vh"
    >
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 60% 50% at 30% 50%, rgba(0,102,255,0.30), transparent 60%),radial-gradient(ellipse 40% 40% at 80% 70%, rgba(0,255,255,0.22), transparent 60%)"
      ></div>
      <div
        class="absolute inset-0 pointer-events-none"
        style="background-image:linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%);mask-image:radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)"
      ></div>

      <div class="relative z-[2] max-w-[1400px] mx-auto w-full">
        <nav
          class="font-mono text-[12px] text-hkm-500 uppercase tracking-[0.1em] mb-6"
          aria-label="Breadcrumb"
        >
          <a
            href="${link('/')}"
            class="text-hkm-300 hover:text-cyan-bright transition-colors duration-200 no-underline"
            >${t.breadcrumbHome}</a
          >
          <span class="mx-2">/</span>
          <span>${t.breadcrumbAbout}</span>
        </nav>

        <p class="font-mono text-[13px] text-cyan-bright uppercase tracking-[0.2em] mb-6">
          ${heroEyebrow}
        </p>

        <h1
          class="about-hero-title font-display font-extrabold leading-none tracking-[-0.04em] mb-6 max-w-[1000px]"
          style="font-size:clamp(40px,6.5vw,84px);background:linear-gradient(180deg,#FFFFFF 30%,#B8C5D9);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent"
        >
          ${raw(sanitizeHtml(heroTitle))}
        </h1>

        <p
          class="italic font-display font-medium max-w-[680px] mb-5 leading-[1.4]"
          style="font-size:clamp(16px,2vw,22px);color:rgba(0,255,255,0.72)"
        >
          ${tKey('about', 'heroTagline', lang)}
        </p>

        <p class="text-[18px] text-hkm-300 max-w-[720px] leading-[1.65]">${heroDesc}</p>
      </div>
    </section>

    <!-- ── 2. STATS BAR ─────────────────────────────────────────── -->
    <section style="background:#0A0B0E;padding:clamp(40px,5vw,60px) clamp(20px,3vw,40px)">
      <div class="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        ${stats.map(
          (stat) =>
            html`<div class="about-stat-item text-center px-4">
              <div
                class="font-display font-extrabold leading-none tracking-[-0.04em] mb-2"
                style="font-size:clamp(36px,4vw,56px);background:linear-gradient(135deg,#00ffff,#0066ff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent"
              >
                ${stat.value}
              </div>
              <p class="font-mono text-[12px] text-hkm-300 uppercase tracking-[0.1em]">
                ${loc(stat.label, lang)}
              </p>
            </div>`
        )}
      </div>
    </section>

    <!-- ── 3. STORY ─────────────────────────────────────────────── -->
    <section style="background:#0A0B0E;padding:clamp(60px,10vw,120px) clamp(20px,3vw,40px)">
      <div
        class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-[80px] items-start"
      >
        <div>
          <p class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
            ${storyEyebrow}
          </p>
          <h2
            class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] [&>span]:text-cyan-bright"
            style="font-size:clamp(32px,4vw,48px)"
          >
            ${raw(sanitizeHtml(storyHeadline))}
          </h2>
        </div>

        <div class="about-story-body">
          ${storyParagraphs.map(
            (p) =>
              html`<p class="text-[16px] text-hkm-100 leading-[1.7] mb-5 last:mb-0">
                ${raw(sanitizeHtml(p, 'body'))}
              </p>`
          )}
        </div>
      </div>
    </section>

    <!-- ── 4. WHY HKM ───────────────────────────────────────────── -->
    <section
      class="relative overflow-hidden"
      style="background:#0A0B0E;padding:clamp(60px,10vw,120px) clamp(20px,3vw,40px)"
    >
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,255,255,0.22), transparent 60%)"
      ></div>

      <div class="relative z-[2] text-center mb-16 max-w-[800px] mx-auto">
        <p class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
          ${t.whyEyebrow}
        </p>
        <h2
          class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] mb-4 [&>span]:text-cyan-bright"
          style="font-size:clamp(32px,4vw,48px)"
        >
          ${raw(sanitizeHtml(whyHeadline))}
        </h2>
        <p class="text-[17px] text-hkm-300 leading-[1.6]">${whySub}</p>
      </div>

      <div
        class="relative z-[2] max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      >
        ${whyCards.map((card, i) => whyCard({ card, num: `— 0${i + 1}`, lang }))}
      </div>
    </section>

    <!-- ── 5. CONTACT CTA ───────────────────────────────────────── -->
    <section style="background:#0A0B0E;padding:clamp(60px,10vw,120px) clamp(20px,3vw,40px)">
      <div
        class="max-w-[1100px] mx-auto relative overflow-hidden rounded-[24px] border"
        style="background:linear-gradient(135deg,rgba(0,102,255,0.12),rgba(0,255,255,0.03));border-color:rgba(255,255,255,0.18);padding:clamp(36px,5vw,64px)"
      >
        <div
          class="absolute inset-0 pointer-events-none"
          style="background:radial-gradient(ellipse at top right, rgba(0,255,255,0.22), transparent 60%)"
        ></div>

        <div
          class="relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[56px] items-center"
        >
          <div>
            <p class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.2em] mb-3">
              ${ctaEyebrow}
            </p>
            <h2
              class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.1] mb-4 [&>span]:text-cyan-bright"
              style="font-size:clamp(28px,3.5vw,44px)"
            >
              ${raw(sanitizeHtml(ctaTitle))}
            </h2>
            <p class="text-[16px] text-hkm-300 leading-[1.6] mb-6">${ctaSub}</p>

            <div class="flex gap-2.5 flex-wrap">
              ${ctaButtons.map((btn) => {
                const label = loc(btn.label, lang);
                return btn.style === 'primary'
                  ? html`<a
                      href="${link(btn.url)}"
                      class="inline-flex items-center gap-2 bg-electric-blue text-white px-[22px] py-3 rounded-[8px] font-semibold text-[13px] no-underline transition-all duration-200 hover:bg-cyan-bright hover:text-dark-2"
                      >${label}</a
                    >`
                  : html`<a
                      href="${link(btn.url)}"
                      class="inline-flex items-center gap-2 bg-transparent text-white px-[22px] py-3 rounded-[8px] font-semibold text-[13px] no-underline transition-all duration-200 hover:border-cyan-bright hover:text-cyan-bright"
                      style="border:1px solid rgba(255,255,255,0.18)"
                      >${label}</a
                    >`;
              })}
            </div>
          </div>

          <div
            class="flex flex-col gap-[18px] rounded-[16px] p-8"
            style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.10);backdrop-filter:blur(8px)"
          >
            ${settings?.contactEmail &&
            contactItem({
              icon: CONTACT_ICONS.email,
              label: t.emailLabel,
              value: html`<a href="mailto:${settings.contactEmail}" class="${LINK_CLS}"
                >${settings.contactEmail}</a
              >`,
            })}
            ${settings?.contactWhatsApp &&
            contactItem({
              icon: CONTACT_ICONS.whatsapp,
              label: t.waLabel,
              value: html`<a
                href="https://wa.me/${settings.contactWhatsApp.replace(/\D/g, '')}"
                class="${LINK_CLS}"
                >${settings.contactWhatsApp}</a
              >`,
            })}
            ${settings?.contactAddress &&
            contactItem({
              icon: CONTACT_ICONS.map,
              label: t.addressLabel,
              value: html`<span class="whitespace-pre-line">${settings.contactAddress}</span>`,
            })}
            ${settings?.contactHours &&
            contactItem({
              icon: CONTACT_ICONS.clock,
              label: t.hoursLabel,
              value: loc(settings.contactHours, lang),
            })}
            ${!hasAnyContact &&
            html`${contactItem({
              icon: CONTACT_ICONS.email,
              label: t.emailLabel,
              value: html`<a href="mailto:info@hkm.co.id" class="${LINK_CLS}">info@hkm.co.id</a>`,
            })}
            ${contactItem({
              icon: CONTACT_ICONS.map,
              label: t.addressLabel,
              value:
                'Gold Coast Office Tower Eiffel, Lt. 10, Pantai Indah Kapuk, Jakarta Utara 14470',
            })}
            ${contactItem({
              icon: CONTACT_ICONS.clock,
              label: t.hoursLabel,
              value: 'Mon–Fri 09:00–18:00 WIB',
            })}`}
          </div>
        </div>
      </div>
    </section>
  `;
}

// ── Route ───────────────────────────────────────────────────────────────────

export const route = {
  name: 'about',
  path: '/about',
  render({ about, settings, servicePoints, lang, buildYear, gaId }) {
    const spCount = servicePoints?.length || 0;

    return page({
      meta: buildMeta({
        title: 'Tentang HKM — Distributor Konektivitas Terpercaya sejak 2016',
        description:
          'Sejak 2016, PT. Harapan Karunia Makmur menjadi distributor resmi produk konektivitas Indonesia: ' +
          `CPE router, Mobile WiFi, SIM data, IP kamera, dash cam, dan smart home. ${spCount}+ service point nasional.`,
        path: '/about',
      }),
      lang,
      path: '/about',
      settings,
      buildYear,
      gaId,
      schemas: [
        jsonLd(
          schemaBreadcrumb([
            { name: lang === 'id' ? 'Beranda' : 'Home', url: SITE_URL + langPath('/', lang) },
            {
              name: lang === 'id' ? 'Tentang' : 'About',
              url: SITE_URL + langPath('/about', lang),
            },
          ])
        ),
      ],
      body: aboutBody({ about, settings, spCount, lang }),
    });
  },
};
