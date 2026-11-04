/**
 * /careers — port dari app/careers/page.js + components/careers/CareersContent.js
 *
 * Perbedaan dari versi React:
 *  - Filter departemen (useState) → SEMUA lowongan dirender di HTML,
 *    src/js/careers.js hanya menyembunyikan/menampilkan. Tanpa JS semua
 *    lowongan tetap tampil dan terbaca crawler.
 *  - "Posted X ago" dihitung dari ctx.buildTime sebagai fallback, lalu
 *    dihitung ulang di browser (React menghitungnya saat halaman dilihat).
 *  - <style> per-kartu di React (diulang tiap JobCard) digabung jadi satu.
 *  - Label statis diterjemahkan untuk /id (React hanya bahasa Inggris).
 *  - Offset atas: React = pt 64 (layout) + pt 64 (main halaman) = 128px.
 *    Layout vanilla sudah pt 80, jadi wrapper di sini menambah 48px.
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import { buildMeta } from '../lib/seo.mjs';
import { loc } from '../lib/i18n.mjs';
import { langPath, careerUrl, slugOf } from '../routes.mjs';
import { LISTING, ICONS, deptLabel, typeLabel, postedAgo } from '../content/careers.mjs';

// ── Style bersama (disalin dari inline style React) ─────────────────────────

const MONO = 'font-family:var(--font-jetbrains-mono), monospace';
const DISPLAY = 'font-family:var(--font-space-grotesk), sans-serif';
const GRAD_TEXT =
  'background:linear-gradient(135deg, #0066ff, #00ffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text';
const EYEBROW = `${MONO};font-size:11px;color:#00ffff;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:16px`;
const H2 = `${DISPLAY};font-size:clamp(32px, 4vw, 48px);font-weight:800;line-height:1.05;letter-spacing:-0.03em`;
const SECTION_HEAD = 'text-align:center;max-width:720px;margin-left:auto;margin-right:auto';

// Gaya chip filter aktif / tidak aktif. Dikirim juga ke src/js/careers.js
// lewat data-attribute supaya kedua sisi selalu sama.
const CHIP_BASE = `padding:8px 16px;border-radius:100px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;${MONO};text-transform:uppercase;letter-spacing:0.08em`;
const chipState = (active) =>
  active
    ? 'background:#0066ff;border:1px solid #0066ff;color:#fff'
    : 'background:#262626;border:1px solid rgba(255,255,255,0.10);color:#E2E7EF';

const PAGE_CSS = `
.job-card-link:hover { border-color: #0066ff !important; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,102,255,0.12); }
.job-card-link:hover .job-view-btn { border-color: #00ffff !important; color: #00ffff !important; }
.faq-detail[open] { border-color: #0066ff !important; }
.faq-sum::-webkit-details-marker { display: none; }
@media (max-width: 979px) {
  .job-card-link { grid-template-columns: 1fr !important; gap: 16px !important; padding: 24px !important; }
  .job-view-btn { width: 100%; justify-content: center; }
  .why-grid-responsive { grid-template-columns: 1fr !important; gap: 16px !important; }
  .why-card-hover { padding: 28px !important; }
  .process-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; gap: 32px 16px !important; }
  .process-line { display: none !important; }
}
.why-card-hover:hover { border-color: #0066ff !important; transform: translateY(-4px); }
`;

function sectionHead({ eyebrow, a, accent, desc, mb }) {
  return html`<div style="${SECTION_HEAD};margin-bottom:${mb}px">
    <div style="${EYEBROW}">${eyebrow}</div>
    <h2 style="${H2}${desc ? ';margin-bottom:16px' : ''}">
      ${a} <span style="${GRAD_TEXT}">${accent}</span>
    </h2>
    ${desc ? html`<p style="font-size:17px;color:#B8C5D9;line-height:1.6">${desc}</p>` : ''}
  </div>`;
}

// ── Kartu lowongan ──────────────────────────────────────────────────────────

function jobCard({ job, lang, t, now }) {
  const title = loc(job.title, lang);
  const dept = deptLabel(job.department, lang);
  const type = typeLabel(job.employmentType, lang);
  const href = langPath(careerUrl(slugOf(job.slug)), lang);

  return html`<a
    href="${href}"
    class="job-card-link"
    data-dept="${job.department || ''}"
    style="background:#262626;border:1px solid rgba(255,255,255,0.10);border-radius:16px;padding:28px 32px;transition:all 0.3s;cursor:pointer;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;text-decoration:none;color:inherit"
  >
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
        <span
          style="display:inline-block;padding:4px 10px;background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.2);border-radius:100px;color:#00ffff;font-size:10px;${MONO};text-transform:uppercase;letter-spacing:0.15em;font-weight:500"
          >${dept}</span
        >
        ${
          type &&
          html`<span
            style="font-size:11px;color:#7C8694;${MONO};text-transform:uppercase;letter-spacing:0.1em"
            >· ${type}</span
          >`
        }
        ${
          job.isUrgent &&
          html`<span
            style="display:inline-block;padding:3px 8px;background:rgba(255,100,0,0.15);border:1px solid rgba(255,100,0,0.3);border-radius:100px;color:#ff7744;font-size:10px;${MONO};text-transform:uppercase;letter-spacing:0.1em"
            >${t.urgent}</span
          >`
        }
      </div>
      <h3 style="${DISPLAY};font-size:22px;font-weight:700;line-height:1.25;margin-bottom:10px">
        ${title}
      </h3>
      <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:13px;color:#B8C5D9">
        ${
          job.location &&
          html`<span style="display:flex;gap:6px;align-items:center"
            >${raw(ICONS.metaPin)}${job.location}</span
          >`
        }
        ${
          job.publishedAt &&
          html`<span style="display:flex;gap:6px;align-items:center"
            >${raw(ICONS.metaClock)}${t.posted}
            <span data-posted="${job.publishedAt}" data-lang="${lang}"
              >${postedAgo(job.publishedAt, now, lang)}</span
            ></span
          >`
        }
        ${
          job.experienceRequired &&
          html`<span style="display:flex;gap:6px;align-items:center"
            >${raw(ICONS.metaUser)}${job.experienceRequired}</span
          >`
        }
      </div>
    </div>
    <span
      class="job-view-btn"
      style="display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:transparent;border:1px solid rgba(255,255,255,0.18);color:#fff;border-radius:8px;font-weight:600;font-size:13px;white-space:nowrap;transition:all 0.2s"
      >${t.viewPosition}</span
    >
  </a>`;
}

function faqItem({ q, a }) {
  // Catatan: React punya rule `.faq-detail[open] .faq-icon { content: '−' }`
  // yang tidak berefek (content hanya berlaku di pseudo-element) — ikon
  // tetap "+". Dibiarkan sama supaya visual identik.
  return html`<details
    class="faq-detail"
    style="background:#262626;border:1px solid rgba(255,255,255,0.10);border-radius:14px;overflow:hidden;transition:all 0.2s"
  >
    <summary
      class="faq-sum"
      style="padding:20px 24px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:16px;font-weight:600;color:#fff;list-style:none;user-select:none"
    >
      ${q}
      <span
        class="faq-icon"
        style="${DISPLAY};font-size:24px;font-weight:400;color:#00ffff;flex-shrink:0"
        >+</span
      >
    </summary>
    <div style="padding:0 24px 20px;font-size:14px;color:#B8C5D9;line-height:1.7">${a}</div>
  </details>`;
}

// ── Body halaman ────────────────────────────────────────────────────────────

function careersBody({ jobs, lang, now }) {
  const t = LISTING[lang] || LISTING.en;

  // Jumlah per departemen (urutan = urutan kemunculan, sama seperti React)
  const counts = { all: jobs.length };
  for (const j of jobs) {
    if (j.department) counts[j.department] = (counts[j.department] || 0) + 1;
  }
  const filters = [
    { value: 'all', label: t.filterAll },
    ...Object.keys(counts)
      .filter((d) => d !== 'all')
      .map((d) => ({ value: d, label: deptLabel(d, lang) })),
  ];

  return html`
    <style>
      ${raw(PAGE_CSS)}
    </style>
    <div style="padding-top:48px;background:#0A0B0E;min-height:100vh">
      <!-- ── Hero ─────────────────────────────────────────────── -->
      <section
        style="padding:96px 40px 80px;background:#0A0B0E;position:relative;overflow:hidden;min-height:60vh;display:flex;align-items:center"
      >
        <div
          style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 30% 50%, rgba(0,102,255,0.30), transparent 60%), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(0,255,255,0.22), transparent 60%);pointer-events:none"
        ></div>
        <div
          style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%);mask-image:radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%);pointer-events:none"
        ></div>
        <div style="max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%">
          <nav
            aria-label="Breadcrumb"
            style="${MONO};font-size:12px;color:#B8C5D9;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.1em"
          >
            <a href="${langPath('/', lang)}" style="color:#B8C5D9;text-decoration:none"
              >${t.home}</a
            >
            <span style="margin:0 8px">/</span>
            <span>${t.careers}</span>
          </nav>
          <div
            style="${MONO};font-size:13px;color:#00ffff;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:24px"
          >
            ${t.heroEyebrow}
          </div>
          <h1
            style="${DISPLAY};font-size:clamp(40px, 6.5vw, 84px);font-weight:800;line-height:1.0;margin-bottom:24px;max-width:1000px;letter-spacing:-0.04em;background:linear-gradient(180deg, #FFFFFF 30%, #B8C5D9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text"
          >
            ${t.heroTitleA} <span style="${GRAD_TEXT}">${t.heroTitleAccent}</span>
            ${t.heroTitleB}
          </h1>
          <p
            style="font-size:18px;color:#B8C5D9;max-width:720px;line-height:1.65;margin-bottom:32px"
          >
            ${t.heroDesc}
          </p>
          <a
            href="#open-positions"
            style="display:inline-flex;align-items:center;gap:8px;background:#0066ff;color:#fff;padding:14px 28px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s"
            >${t.heroCta}</a
          >
        </div>
      </section>

      <!-- ── Why HKM ──────────────────────────────────────────── -->
      <section style="padding:100px 40px;background:#0A0B0E">
        ${sectionHead({
          eyebrow: t.whyEyebrow,
          a: t.whyTitleA,
          accent: t.whyTitleAccent,
          desc: t.whyDesc,
          mb: 56,
        })}
        <div
          class="why-grid-responsive"
          style="max-width:1400px;margin:0 auto;display:grid;grid-template-columns:repeat(3, 1fr);gap:24px"
        >
          ${t.whyCards.map(
            (card) =>
              html`<div
                class="why-card-hover"
                style="background:#262626;border:1px solid rgba(255,255,255,0.10);border-radius:18px;padding:36px;transition:all 0.3s"
              >
                <div
                  style="width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,255,255,0.05));border:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;color:#00ffff;margin-bottom:20px"
                >
                  ${raw(ICONS[card.icon])}
                </div>
                <h3
                  style="${DISPLAY};font-size:19px;font-weight:700;line-height:1.25;margin-bottom:10px"
                >
                  ${card.title}
                </h3>
                <p style="font-size:14px;color:#B8C5D9;line-height:1.6">${card.desc}</p>
              </div>`
          )}
        </div>
      </section>

      <!-- ── Open Positions ───────────────────────────────────── -->
      <section id="open-positions" style="padding:120px 40px;background:#0A0B0E">
        ${sectionHead({
          eyebrow: t.openEyebrow,
          a: t.openTitleA,
          accent: t.openTitleAccent,
          desc: t.openDesc,
          mb: 48,
        })}

        <div
          data-careers-filter
          data-chip-active="${chipState(true)}"
          data-chip-idle="${chipState(false)}"
          style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:40px"
        >
          ${filters.map(
            (f) =>
              html`<button
                type="button"
                data-dept-filter="${f.value}"
                aria-pressed="${f.value === 'all' ? 'true' : 'false'}"
                style="${CHIP_BASE};${chipState(f.value === 'all')}"
              >
                ${f.label}
                <span style="opacity:0.7;margin-left:4px">(${counts[f.value] || 0})</span>
              </button>`
          )}
        </div>

        <div
          data-careers-list
          style="max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:12px"
        >
          ${jobs.map((job) => jobCard({ job, lang, t, now }))}
          <div
            data-careers-empty
            ${jobs.length ? raw('hidden') : ''}
            style="text-align:center;padding:60px 20px"
          >
            <div
              style="width:64px;height:64px;margin:0 auto 20px;border-radius:16px;background:rgba(0,102,255,0.1);display:flex;align-items:center;justify-content:center;color:#00ffff"
            >
              ${raw(ICONS.search32)}
            </div>
            <p style="${DISPLAY};font-size:18px;font-weight:700;margin-bottom:8px">
              ${t.emptyTitle}
            </p>
            <p style="font-size:14px;color:#7C8694;line-height:1.6">${t.emptyDesc}</p>
          </div>
        </div>
      </section>

      <!-- ── Application Process ──────────────────────────────── -->
      <section style="padding:120px 40px;background:#0A0B0E">
        ${sectionHead({
          eyebrow: t.processEyebrow,
          a: t.processTitleA,
          accent: t.processTitleAccent,
          desc: t.processDesc,
          mb: 64,
        })}
        <div
          class="process-grid-responsive"
          style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;position:relative"
        >
          <div
            class="process-line"
            style="position:absolute;top:28px;left:12%;right:12%;height:1px;background:linear-gradient(90deg, #00ffff, #0066ff, #00ffff);opacity:0.3;z-index:0"
          ></div>
          ${t.steps.map(
            (step) =>
              html`<div style="position:relative;z-index:2;text-align:center;padding:0 12px">
                <div
                  style="width:56px;height:56px;margin:0 auto 20px;border-radius:50%;background:#262626;border:2px solid #0066ff;display:flex;align-items:center;justify-content:center;${DISPLAY};font-weight:800;font-size:22px;color:#00ffff;box-shadow:0 0 24px rgba(0,255,255,0.22)"
                >
                  ${step.num}
                </div>
                <h3 style="${DISPLAY};font-size:17px;font-weight:700;margin-bottom:8px">
                  ${step.title}
                </h3>
                <p style="font-size:13px;color:#B8C5D9;line-height:1.5">${step.desc}</p>
              </div>`
          )}
        </div>
      </section>

      <!-- ── FAQ ──────────────────────────────────────────────── -->
      <section style="padding:120px 40px;background:#0A0B0E">
        ${sectionHead({
          eyebrow: t.faqEyebrow,
          a: t.faqTitleA,
          accent: t.faqTitleAccent,
          desc: null,
          mb: 56,
        })}
        <div style="max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:12px">
          ${t.faqs.map((f) => faqItem(f))}
        </div>
      </section>

      <!-- ── Bottom CTA ───────────────────────────────────────── -->
      <section style="padding:120px 40px;background:#0A0B0E">
        <div
          style="max-width:1100px;margin:0 auto;padding:72px 60px;background:linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,255,255,0.03));border:1px solid rgba(255,255,255,0.18);border-radius:24px;text-align:center;position:relative;overflow:hidden"
        >
          <div
            style="position:absolute;inset:0;background:radial-gradient(ellipse at top right, rgba(0,255,255,0.22), transparent 60%);pointer-events:none"
          ></div>
          <div style="position:relative;z-index:2">
            <div style="${EYEBROW}">${t.ctaEyebrow}</div>
            <h2
              style="${DISPLAY};font-size:clamp(28px, 4vw, 44px);font-weight:800;line-height:1.1;margin-bottom:16px"
            >
              ${t.ctaTitleA} <span style="${GRAD_TEXT}">${t.ctaTitleAccent}</span>
            </h2>
            <p
              style="font-size:17px;color:#B8C5D9;max-width:580px;margin:0 auto 32px;line-height:1.6"
            >
              ${t.ctaDesc}
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
              <a
                href="mailto:careers@hkm.co.id"
                style="background:#0066ff;color:#fff;padding:14px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:8px;text-decoration:none;transition:all 0.2s"
                >${t.ctaEmail}</a
              >
              <a
                href="${langPath('/about', lang)}"
                style="background:transparent;color:#fff;padding:14px 28px;border-radius:8px;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.18);display:inline-flex;align-items:center;gap:8px;text-decoration:none;transition:all 0.2s"
                >${t.ctaAbout}</a
              >
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

// ── Route ───────────────────────────────────────────────────────────────────

export const route = {
  name: 'careers',
  path: '/careers',
  render({ jobs, settings, lang, buildYear, buildTime, gaId }) {
    return page({
      meta: buildMeta({
        title: 'Karir di HKM — Bergabung dengan Tim Konektivitas Indonesia',
        description:
          'Bergabunglah dengan PT. Harapan Karunia Makmur dan bantu memperluas jaringan konektivitas Indonesia. Posisi terbuka di Sales, Marketing, Operations, dan Technical Support.',
        path: '/careers',
      }),
      lang,
      path: '/careers',
      settings,
      buildYear,
      gaId,
      scripts: ['/assets/js/careers.js'],
      body: careersBody({ jobs: jobs || [], lang, now: buildTime }),
    });
  },
};
