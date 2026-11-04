/**
 * /careers/[slug] — port dari app/careers/[slug]/page.js +
 * components/careers/JobDetailContent.js
 *
 * Perbedaan dari versi React:
 *  - Form lamaran: React TIDAK mengirim ke server — ia membuka mailto: ke
 *    applicationEmail berisi data form. Perilaku itu dipertahankan apa
 *    adanya (src/js/careers.js). Input "Upload CV" di React juga tidak
 *    tersambung ke apa pun (tanpa name, tidak ikut terkirim); UI-nya
 *    disalin sama persis.
 *  - State "Application Sent!" (useState) → kartu sukses dirender di HTML
 *    dengan atribut hidden, ditukar oleh JS.
 *  - Link share LinkedIn: React membaca window.location saat render
 *    (kosong saat SSR). Di sini URL kanonik halaman ditulis saat build.
 *  - "Other Open Positions": React memakai loc(title, 'en') (bug — selalu
 *    Inggris). Di sini mengikuti bahasa halaman.
 *  - Label statis diterjemahkan untuk /id; offset atas 48px (lihat careers.mjs).
 */
import { page } from '../layout.mjs';
import { html, raw } from '../html.mjs';
import { buildMeta, jsonLd, schemaBreadcrumb, SITE_URL } from '../lib/seo.mjs';
import { loc, formatDate } from '../lib/i18n.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { langPath, careerUrl, slugOf } from '../routes.mjs';
import { fetchGroq } from '../sanity.mjs';
import { CAREER_DETAIL_QUERY } from '../lib/queries.mjs';
import { DETAIL, ICONS, deptLabel, typeLabel, postedAgo } from '../content/careers.mjs';

// ── Style bersama ───────────────────────────────────────────────────────────

const MONO = 'font-family:var(--font-jetbrains-mono), monospace';
const DISPLAY = 'font-family:var(--font-space-grotesk), sans-serif';
const BORDER = 'rgba(255,255,255,0.10)';

const PAGE_CSS = `
.other-job-link:hover { border-color: #0066ff !important; transform: translateY(-2px); }
@media (max-width: 979px) {
  .job-layout-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
  .apply-sticky-col { position: static !important; }
}
`;

const SHARE_BTN =
  'width:32px;height:32px;border-radius:8px;background:#2e2e2e;border:1px solid rgba(255,255,255,0.10);display:inline-flex;align-items:center;justify-content:center;color:#B8C5D9;transition:all 0.2s;cursor:pointer;text-decoration:none';

// Class input/textarea — sama dengan components/ui/Input.js & Textarea.js.
// State error (border-red-400) ditukar oleh src/js/careers.js.
const FIELD_CLS =
  'w-full px-4 py-3 rounded-[8px] text-[15px] text-white font-sans bg-[#1c1e24] border transition-all duration-200 focus:outline-none focus:border-cyan-bright focus:ring-1 focus:ring-cyan-bright/40 placeholder:text-hkm-500 border-white/10';

// ── Sub-komponen ────────────────────────────────────────────────────────────

/** localeText → paragraf, dipecah per baris (sama dengan renderParagraphs React). */
function paragraphs(text) {
  if (!text) return '';
  return text
    .split('\n')
    .filter(Boolean)
    .map((p) => html`<p style="margin-bottom:16px">${p}</p>`);
}

/** Daftar bullet dengan dukungan **tebal** (disanitasi, mode inline). */
function bulletList(items) {
  if (!items?.length) return '';
  return html`<ul style="list-style:none;padding:0">
    ${items.map(
      (item, i) =>
        html`<li
          style="padding:10px 0 10px 28px;position:relative;font-size:15px;line-height:1.65;border-bottom:1px solid ${BORDER};border-top:${
            i === 0 ? `1px solid ${BORDER}` : 'none'
          }"
        >
          <span
            style="position:absolute;left:0;color:#00ffff;font-weight:700;font-size:18px;line-height:1.5"
            >+</span
          >
          <span
            >${raw(
              sanitizeHtml(
                String(item).replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong style="color:#fff;font-weight:600">$1</strong>'
                ),
                'inline'
              )
            )}</span
          >
        </li>`
    )}
  </ul>`;
}

function contentSection({ eyebrow, title, children }) {
  return html`<div style="margin-bottom:48px">
    <div
      style="${MONO};font-size:11px;color:#00ffff;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:12px"
    >
      ${eyebrow}
    </div>
    <h2 style="${DISPLAY};font-size:24px;font-weight:700;margin-bottom:16px;line-height:1.3">
      ${title}
    </h2>
    ${children}
  </div>`;
}

function metaItem({ icon, label, value }) {
  return html`<div style="display:flex;gap:10px;align-items:center">
    <div
      style="width:32px;height:32px;border-radius:8px;background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.2);display:flex;align-items:center;justify-content:center;color:#00ffff;flex-shrink:0"
    >
      ${raw(icon)}
    </div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div
        style="${MONO};font-size:10px;color:#7C8694;text-transform:uppercase;letter-spacing:0.15em"
      >
        ${label}
      </div>
      <div style="font-size:14px;font-weight:500">${value}</div>
    </div>
  </div>`;
}

/** Field input — markup sama dengan components/ui/Input.js. */
function inputField({ id, name, type = 'text', label, placeholder, required }) {
  return html`<div class="flex flex-col gap-1.5">
    <label for="${id}" class="font-mono text-[12px] uppercase tracking-[0.08em] text-hkm-300">
      ${label}${
        required ? html`<span class="text-cyan-bright ml-1" aria-hidden="true">*</span>` : ''
      }
    </label>
    <input
      id="${id}"
      name="${name}"
      type="${type}"
      placeholder="${placeholder}"
      ${required ? raw('required') : ''}
      aria-invalid="false"
      class="${FIELD_CLS}"
    />
    ${
      required
        ? html`<p
            id="${id}-error"
            data-error-for="${name}"
            hidden
            class="text-red-400 text-[13px] leading-snug"
            role="alert"
          ></p>`
        : ''
    }
  </div>`;
}

function applyCardShell(children) {
  return html`<div
    style="background:#262626;border:1px solid rgba(255,255,255,0.18);border-radius:20px;padding:32px;position:relative;overflow:hidden"
  >
    <div
      style="position:absolute;inset:0;background:radial-gradient(ellipse at top, rgba(0,102,255,0.30), transparent 70%);pointer-events:none"
    ></div>
    <div style="position:relative;z-index:2">${children}</div>
  </div>`;
}

function applyHead(t, desc) {
  return html`<div
      style="${MONO};font-size:11px;color:#00ffff;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:12px"
    >
      ${t.applyEyebrow}
    </div>
    <h3 style="${DISPLAY};font-size:22px;font-weight:700;line-height:1.25;margin-bottom:8px">
      ${t.applyTitle}
    </h3>
    <p style="font-size:13px;color:#B8C5D9;line-height:1.6;margin-bottom:24px">${desc}</p>`;
}

function applyCard({ job, title, t, shareUrl }) {
  const email = job.applicationEmail || 'careers@hkm.co.id';

  // Varian 1: portal lamaran eksternal → tombol saja, tanpa form
  if (job.externalApplicationUrl) {
    return applyCardShell(html`
      ${applyHead(t, t.applyExternalDesc)}
      <a
        href="${job.externalApplicationUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="display:flex;align-items:center;justify-content:center;gap:8px;background:#0066ff;color:#fff;padding:14px 20px;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;text-decoration:none;transition:all 0.2s;margin-bottom:16px"
        >${t.applyExternalBtn}</a
      >
      <p style="font-size:11px;color:#7C8694;line-height:1.5">
        ${t.questions}
        <a href="mailto:${email}" style="color:#00ffff;text-decoration:none">${email}</a>
      </p>
    `);
  }

  // Varian 2: form → mailto (perilaku asli React), + kartu sukses tersembunyi
  const form = applyCardShell(html`
    ${applyHead(t, t.applyDesc)}
    <form
      data-apply-form
      data-email="${email}"
      data-title="${title}"
      data-err-name="${t.errName}"
      data-err-email="${t.errEmail}"
      data-err-email-format="${t.errEmailFormat}"
      data-err-phone="${t.errPhone}"
      novalidate
      style="display:flex;flex-direction:column;gap:14px"
    >
      ${inputField({
        id: 'apply-name',
        name: 'name',
        label: t.fName,
        placeholder: t.fNamePh,
        required: true,
      })}
      ${inputField({
        id: 'apply-email',
        name: 'email',
        type: 'email',
        label: t.fEmail,
        placeholder: t.fEmailPh,
        required: true,
      })}
      ${inputField({
        id: 'apply-phone',
        name: 'phone',
        type: 'tel',
        label: t.fPhone,
        placeholder: t.fPhonePh,
        required: true,
      })}
      ${inputField({
        id: 'apply-location',
        name: 'location',
        label: t.fLocation,
        placeholder: t.fLocationPh,
      })}

      <div style="display:flex;flex-direction:column;gap:6px">
        <label
          style="${MONO};font-size:10px;color:#B8C5D9;text-transform:uppercase;letter-spacing:0.15em"
          >${t.fCv}</label
        >
        <label
          style="background:#1c1e24;border:1px dashed rgba(255,255,255,0.18);border-radius:8px;padding:16px;text-align:center;cursor:pointer;display:block;transition:all 0.2s"
        >
          ${raw(ICONS.upload)}
          <div style="font-size:12px;color:#B8C5D9">
            <strong style="color:#00ffff">${t.fCvClick}</strong> ${t.fCvDrag}
          </div>
          <div style="font-size:10px;color:#7C8694;margin-top:4px;${MONO}">${t.fCvHint}</div>
          <input type="file" accept=".pdf,.doc,.docx" style="display:none" />
        </label>
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="apply-why"
          class="font-mono text-[12px] uppercase tracking-[0.08em] text-hkm-300"
          >${t.fWhy}</label
        >
        <textarea
          id="apply-why"
          name="why"
          rows="3"
          placeholder="${t.fWhyPh}"
          aria-invalid="false"
          class="${FIELD_CLS} resize-y"
        ></textarea>
      </div>

      <button
        type="submit"
        style="background:#0066ff;color:#fff;padding:14px 20px;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;transition:all 0.2s;font-family:var(--font-inter), sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:8px"
      >
        ${t.submit} ${raw(ICONS.arrow)}
      </button>
      <p style="font-size:11px;color:#7C8694;line-height:1.5">${t.consent}</p>
    </form>

    <div
      style="display:flex;gap:10px;align-items:center;padding-top:20px;margin-top:20px;border-top:1px solid ${BORDER}"
    >
      <span
        style="${MONO};font-size:10px;color:#7C8694;text-transform:uppercase;letter-spacing:0.15em"
        >${t.share}</span
      >
      <a
        href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        style="${SHARE_BTN}"
        title="LinkedIn"
        aria-label="LinkedIn"
        >${raw(ICONS.linkedin)}</a
      >
      <button
        type="button"
        data-copy-link
        style="${SHARE_BTN}"
        title="${t.copyLink}"
        aria-label="${t.copyLink}"
      >
        ${raw(ICONS.link)}
      </button>
    </div>
  `);

  return html`<div data-apply-card>${form}</div>
    <div
      data-apply-success
      hidden
      style="background:#262626;border:1px solid rgba(0,255,255,0.3);border-radius:20px;padding:32px;text-align:center"
    >
      <div
        style="width:56px;height:56px;border-radius:50%;background:rgba(0,255,255,0.1);border:2px solid #00ffff;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#00ffff"
      >
        ${raw(ICONS.check)}
      </div>
      <h3 style="${DISPLAY};font-size:20px;font-weight:700;margin-bottom:8px">${t.sentTitle}</h3>
      <p style="font-size:13px;color:#B8C5D9;line-height:1.6">
        ${t.sentDesc}
        <a href="mailto:${email}" style="color:#00ffff;text-decoration:none">${email}</a>.
      </p>
      <p style="font-size:12px;color:#7C8694;margin-top:12px">${t.sentNote}</p>
    </div>`;
}

function otherJobsSection({ jobs, t, lang }) {
  if (!jobs?.length) return '';
  return html`<section style="padding:100px 40px;background:#0A0B0E">
    <div style="max-width:1100px;margin:0 auto">
      <div
        style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px"
      >
        <h2
          style="${DISPLAY};font-size:clamp(28px, 3vw, 40px);font-weight:800;letter-spacing:-0.03em"
        >
          ${t.otherTitle}
        </h2>
        <a
          href="${langPath('/careers', lang)}"
          style="color:#00ffff;font-size:14px;font-weight:600;text-decoration:none"
          >${t.viewAll}</a
        >
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${jobs.map((j) => {
          const metaLine = [j.location, typeLabel(j.employmentType, lang), j.experienceRequired]
            .filter(Boolean)
            .join(' · ');
          return html`<a
            href="${langPath(careerUrl(slugOf(j.slug)), lang)}"
            class="other-job-link"
            style="background:#262626;border:1px solid ${BORDER};border-radius:14px;padding:24px 28px;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;transition:all 0.3s;text-decoration:none;color:inherit"
          >
            <div>
              <div style="margin-bottom:8px">
                <span
                  style="display:inline-block;padding:3px 9px;background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.2);border-radius:100px;color:#00ffff;font-size:10px;${MONO};text-transform:uppercase;letter-spacing:0.15em;font-weight:500"
                  >${deptLabel(j.department, lang)}</span
                >
              </div>
              <h3 style="${DISPLAY};font-size:18px;font-weight:700;margin-bottom:4px">
                ${loc(j.title, lang)}
              </h3>
              <div
                style="font-size:12px;color:#7C8694;${MONO};text-transform:uppercase;letter-spacing:0.08em"
              >
                ${metaLine}
              </div>
            </div>
            <span style="font-size:13px;color:#00ffff;font-weight:600;white-space:nowrap"
              >${t.viewPosition}</span
            >
          </a>`;
        })}
      </div>
    </div>
  </section>`;
}

// ── Body halaman ────────────────────────────────────────────────────────────

function careerBody({ job, lang, now, path }) {
  const t = DETAIL[lang] || DETAIL.en;
  const pick = (field) => field?.[lang] || field?.en || [];

  const title = loc(job.title, lang);
  const dept = deptLabel(job.department, lang);
  const type = typeLabel(job.employmentType, lang);
  const aboutRole = loc(job.aboutRole, lang);
  const responsibilities = pick(job.responsibilities);
  const requirements = pick(job.requirements);
  const niceToHave = pick(job.niceToHave);
  const benefits = pick(job.benefits);
  const shareUrl = SITE_URL + langPath(path, lang);

  return html`
    <style>
      ${raw(PAGE_CSS)}
    </style>
    <div style="padding-top:48px;background:#0A0B0E;min-height:100vh">
      <!-- ── Header lowongan ──────────────────────────────────── -->
      <section style="padding:80px 40px 60px;background:#0A0B0E;position:relative;overflow:hidden">
        <div
          style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 30% 50%, rgba(0,102,255,0.30), transparent 60%);pointer-events:none"
        ></div>
        <div style="max-width:1100px;margin:0 auto;position:relative;z-index:2">
          <nav
            aria-label="Breadcrumb"
            style="${MONO};font-size:12px;color:#7C8694;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.1em"
          >
            <a href="${langPath('/', lang)}" style="color:#B8C5D9;text-decoration:none"
              >${t.home}</a
            >
            <span style="margin:0 8px">/</span>
            <a href="${langPath('/careers', lang)}" style="color:#B8C5D9;text-decoration:none"
              >${t.careers}</a
            >
            <span style="margin:0 8px">/</span>
            <span>${title}</span>
          </nav>

          <span
            style="display:inline-block;padding:5px 12px;background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.2);border-radius:100px;color:#00ffff;font-size:11px;${MONO};text-transform:uppercase;letter-spacing:0.15em;font-weight:500;margin-bottom:24px"
            >${dept}${type ? ` · ${type}` : ''}${job.isUrgent ? ` · ${t.urgent}` : ''}</span
          >

          <h1
            style="${DISPLAY};font-size:clamp(36px, 5.5vw, 68px);font-weight:800;line-height:1.0;margin-bottom:24px;letter-spacing:-0.04em;background:linear-gradient(180deg, #FFFFFF, #B8C5D9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text"
          >
            ${title}
          </h1>

          <div
            style="display:flex;gap:24px;flex-wrap:wrap;padding-top:24px;border-top:1px solid ${BORDER}"
          >
            ${
              job.location && metaItem({ icon: ICONS.dPin, label: t.location, value: job.location })
            }
            ${
              job.experienceRequired &&
              metaItem({ icon: ICONS.dUser, label: t.experience, value: job.experienceRequired })
            }
            ${
              job.publishedAt &&
              metaItem({
                icon: ICONS.dCalendar,
                label: t.posted,
                value: html`<span data-posted="${job.publishedAt}" data-lang="${lang}"
                  >${postedAgo(job.publishedAt, now, lang)}</span
                >`,
              })
            }
            ${type && metaItem({ icon: ICONS.dClock, label: t.type, value: type })}
            ${
              job.closingDate &&
              metaItem({
                icon: ICONS.dWarning,
                label: t.closes,
                value: formatDate(job.closingDate, lang),
              })
            }
          </div>
        </div>
      </section>

      <!-- ── Konten + kartu lamaran ───────────────────────────── -->
      <section style="padding:80px 40px 100px;background:#0A0B0E">
        <div
          class="job-layout-grid"
          style="max-width:1300px;margin:0 auto;display:grid;grid-template-columns:1fr 380px;gap:60px;align-items:start"
        >
          <div style="font-size:16px;line-height:1.75;color:#E2E7EF">
            ${
              aboutRole &&
              contentSection({
                eyebrow: t.aboutEyebrow,
                title: t.aboutTitle,
                children: paragraphs(aboutRole),
              })
            }
            ${
              responsibilities.length > 0 &&
              contentSection({
                eyebrow: t.respEyebrow,
                title: t.respTitle,
                children: bulletList(responsibilities),
              })
            }
            ${
              requirements.length > 0 &&
              contentSection({
                eyebrow: t.reqEyebrow,
                title: t.reqTitle,
                children: bulletList(requirements),
              })
            }
            ${
              niceToHave.length > 0 &&
              contentSection({
                eyebrow: t.niceEyebrow,
                title: t.niceTitle,
                children: bulletList(niceToHave),
              })
            }
            ${
              benefits.length > 0 &&
              contentSection({
                eyebrow: t.benEyebrow,
                title: t.benTitle,
                children: bulletList(benefits),
              })
            }
          </div>

          <div class="apply-sticky-col" style="position:sticky;top:100px">
            ${applyCard({ job, title, t, shareUrl })}
          </div>
        </div>
      </section>

      ${otherJobsSection({ jobs: job.otherJobs, t, lang })}
    </div>
  `;
}

// ── Route ───────────────────────────────────────────────────────────────────

export const route = {
  name: 'careers/[slug]',

  /** Pengganti generateStaticParams() — satu halaman per lowongan terbuka. */
  paths({ jobs }) {
    // ctx.jobs = CAREERS_LISTING_QUERY (status != "closed") — filter yang
    // sama dengan CAREERS_SLUGS_QUERY, jadi tidak perlu fetch ulang.
    return (jobs || [])
      .map((j) => slugOf(j.slug))
      .filter(Boolean)
      .map((slug) => ({ path: careerUrl(slug), jobSlug: slug }));
  },

  async render({ jobSlug, settings, lang, buildYear, buildTime, gaId }) {
    const job = await fetchGroq(CAREER_DETAIL_QUERY, { slug: jobSlug }, `lowongan ${jobSlug}`);
    if (!job) throw new Error(`lowongan "${jobSlug}" tidak ditemukan di Sanity`);

    const t = DETAIL[lang] || DETAIL.en;
    const path = careerUrl(jobSlug);

    // Metadata — sama dengan generateMetadata versi Next (berbahasa Indonesia,
    // judul dari field EN).
    const metaTitle = loc(job.title, 'en');
    const metaDept = typeof job.department === 'string' ? job.department : '';
    const place = typeof job.location === 'string' ? job.location : '';

    return page({
      meta: buildMeta({
        title: `${metaTitle} — Karir di HKM`,
        description: `Bergabunglah sebagai ${metaTitle}${metaDept ? ' di tim ' + metaDept : ''} PT. Harapan Karunia Makmur${place ? ', ' + place : ', Indonesia'}. Daftar sekarang.`,
        path,
      }),
      lang,
      path,
      settings,
      buildYear,
      gaId,
      schemas: [
        jsonLd(
          schemaBreadcrumb([
            { name: t.home, url: langPath('/', lang) },
            { name: t.careers, url: langPath('/careers', lang) },
            { name: loc(job.title, lang) },
          ])
        ),
      ],
      scripts: ['/assets/js/careers.js'],
      body: careerBody({ job, lang, now: buildTime, path }),
    });
  },
};
