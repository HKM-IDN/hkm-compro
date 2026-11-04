/**
 * /contact — port dari app/contact/page.js
 *            + components/sections/ContactSection.js
 *            + components/contact/ContactChannels.js
 *            + components/ui/Input.js | Textarea.js | Select.js
 *
 * Perbedaan dari versi React:
 *  - Dua "step" (pilih jenis pertanyaan → isi form) dulu useState. Di sini
 *    keduanya ada di HTML; step 2 disembunyikan, dan src/js/contact-form.js
 *    yang menukar tampilan + mengatur field per jenis pertanyaan.
 *  - ?type= dulu dibaca server (searchParams). Halaman statis tidak punya
 *    query string saat build, jadi pre-select dilakukan JS di browser.
 *  - Tidak ada /api/contact (tidak ada server). Form POST langsung ke
 *    Formspree dari browser — honeypot _gotcha + nama field tetap sama.
 *    Kalau endpoint Formspree kosong, form diganti pesan + link email
 *    (pola sama dengan form B2B di homepage).
 *  - Toast sonner → toast vanilla kecil di contact-form.js.
 *  - Judul step 2 jadi <h2> (class sama persis). Di React hanya satu step
 *    yang di-render, jadi dua-duanya boleh <h1>; di sini keduanya ada di
 *    HTML sekaligus, dan satu halaman sebaiknya hanya punya satu <h1>.
 *  - Kontak (email/WA/telepon/jam) diambil dari ctx.settings — query
 *    SITE_SETTINGS sudah memuat field yang sama dengan CONTACT_SETTINGS_QUERY.
 */
import { page } from '../layout.mjs';
import { html, raw, attrs, jsonScript } from '../html.mjs';
import { buildMeta, jsonLd, schemaBreadcrumb, SITE_URL } from '../lib/seo.mjs';
import { loc } from '../lib/i18n.mjs';
import { getT } from '../lib/translations.mjs';
import { PRODUCTS_FOR_CONTACT_QUERY } from '../lib/queries.mjs';
import { langPath } from '../routes.mjs';
import { fetchGroq } from '../sanity.mjs';
import { icon } from '../partials/lucide.mjs';
import {
  INQUIRY_TYPES,
  TITLE_KEY,
  DESC_KEY,
  AUTO_SUBJECT_KEY,
  TYPE_CFG,
  CONTACT_EXTRA,
  CHANNELS_COPY,
} from '../content/contact.mjs';

// ── Komponen form (port Input / Textarea / Select) ──────────────────────────

const CONTROL_BASE =
  'w-full px-4 py-3 rounded-[8px] text-[15px] text-white font-sans bg-[#1c1e24] border border-white/10 transition-all duration-200 focus:outline-none focus:border-cyan-bright focus:ring-1 focus:ring-cyan-bright/40';

const SELECT_BG =
  "background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237C8694' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E&quot;);background-repeat:no-repeat;background-position:right 14px center;padding-right:40px";

/** Label + tanda bintang wajib. Bintang di-toggle JS untuk field yang wajibnya berubah. */
function fieldLabel({ id, label, required }) {
  return html`<label
    for="${id}"
    class="font-mono text-[12px] uppercase tracking-[0.08em] text-hkm-300"
    ><span data-label-text>${label}</span
    ><span class="text-cyan-bright ml-1" aria-hidden="true" data-req ${required ? raw('') : raw('hidden')}
      >*</span
    ></label
  >`;
}

/** Slot pesan error inline — diisi JS saat validasi gagal. */
function fieldError(id) {
  return html`<p
    id="${id}-error"
    data-error
    hidden
    class="text-red-400 text-[13px] leading-snug"
    role="alert"
  ></p>`;
}

function input({ id, name, label, required = false, type = 'text', placeholder, autocomplete }) {
  return html`<div class="flex flex-col gap-1.5" data-field="${name}">
    ${fieldLabel({ id, label, required })}
    <input
      ${attrs({
        id,
        name,
        type,
        placeholder,
        autocomplete,
        class: `${CONTROL_BASE} placeholder:text-hkm-500`,
        'aria-invalid': 'false',
      })}
    />
    ${fieldError(id)}
  </div>`;
}

function textarea({ id, name, label, required = false, rows = 4, placeholder }) {
  return html`<div class="flex flex-col gap-1.5" data-field="${name}">
    ${fieldLabel({ id, label, required })}
    <textarea
      ${attrs({
        id,
        name,
        rows,
        placeholder,
        class: `${CONTROL_BASE} resize-y placeholder:text-hkm-500`,
        'aria-invalid': 'false',
      })}
    ></textarea>
    ${fieldError(id)}
  </div>`;
}

function select({ id, name, label, placeholder, options = [] }) {
  return html`<div class="flex flex-col gap-1.5" data-field="${name}">
    ${fieldLabel({ id, label, required: false })}
    <select
      id="${id}"
      name="${name}"
      aria-invalid="false"
      class="${CONTROL_BASE} appearance-none cursor-pointer"
      style="${raw(SELECT_BG)}"
    >
      ${placeholder && html`<option value="" disabled selected>${placeholder}</option>`}
      ${options.map((opt) => html`<option value="${opt.value}">${opt.label}</option>`)}
    </select>
    ${fieldError(id)}
  </div>`;
}

// ── Blok kontak (port ContactChannels → CustomerSupportBlock) ───────────────

const CHANNEL_ICON = { email: 'Mail', whatsapp: 'MessageCircle', phone: 'Phone' };
const CHANNEL_COLOR = { email: '#00B8D9', whatsapp: '#25D366', phone: '#00B8D9' };

function groupHeader(text) {
  return html`<div
    class="font-display font-bold text-white uppercase tracking-[0.02em] pb-5 border-b-2 border-white/[0.18]"
    style="font-size:clamp(28px,3vw,40px)"
  >
    ${text}
  </div>`;
}

function row({ label, isLast, children }) {
  return html`<div
    class="spec-row items-start py-7"
    style="border-bottom:${isLast ? 'none' : '1px solid rgba(255,255,255,0.10)'}"
  >
    <div class="font-display text-[17px] font-semibold text-white leading-[1.4]">${label}</div>
    <div>${children}</div>
  </div>`;
}

function contactChannels({ settings, t, lang }) {
  const channels = [
    settings?.contactWhatsApp && {
      type: 'whatsapp',
      label: { en: 'WhatsApp', id: 'WhatsApp' },
      value: settings.contactWhatsApp,
      url: `https://wa.me/${settings.contactWhatsApp.replace(/\D/g, '')}`,
    },
    settings?.contactEmail && {
      type: 'email',
      label: { en: 'Email', id: 'Email' },
      value: settings.contactEmail,
      url: `mailto:${settings.contactEmail}`,
    },
    settings?.contactPhone && {
      type: 'phone',
      label: { en: 'Phone', id: 'Telepon' },
      value: settings.contactPhone,
      url: `tel:${settings.contactPhone.replace(/\D/g, '')}`,
    },
  ].filter(Boolean);

  if (!channels.length) return raw('');

  const title = loc(CHANNELS_COPY.title, lang);
  const description = loc(CHANNELS_COPY.description, lang);
  const responseTime = loc(settings?.contactHours, lang);

  return html`<div class="mb-12">
    ${groupHeader(t.infoTitle)}
    ${row({
      label: title,
      isLast: false,
      children: html`<p class="text-[15px] text-hkm-300 leading-[1.6]">${description}</p>`,
    })}
    ${channels.map((ch, i) =>
      row({
        label: loc(ch.label, lang),
        isLast: i === channels.length - 1 && !responseTime,
        children: html`<div class="flex items-center gap-3">
          ${icon(CHANNEL_ICON[ch.type], {
            size: 18,
            style: `color:${CHANNEL_COLOR[ch.type]};flex-shrink:0`,
          })}
          <a
            href="${ch.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[15px] font-semibold text-white hover:text-cyan-bright transition-colors"
            >${ch.value}</a
          >
        </div>`,
      })
    )}
    ${responseTime &&
    row({
      label: '',
      isLast: true,
      children: html`<p class="text-[13px] text-hkm-500 leading-[1.5] font-mono">
        ${responseTime}
      </p>`,
    })}
  </div>`;
}

// ── Step 1: pilih jenis pertanyaan ──────────────────────────────────────────

function step1({ t, settings, lang }) {
  return html`<div data-contact-step1>
    <div class="mb-10 lg:mb-14">
      <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-3">
        ${t.step1Eyebrow}
      </p>
      <h1
        class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] mb-4"
        style="font-size:clamp(36px, 5vw, 60px)"
      >
        ${t.step1Title1} <span class="text-cyan-bright">${t.step1TitleSpan}</span>
      </h1>
      <p class="text-[16px] text-hkm-300 leading-[1.6] max-w-[520px]">${t.step1Subtitle}</p>
    </div>

    <!-- Grid kartu — 3 kolom desktop, 2 tablet, 1 mobile -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
      ${INQUIRY_TYPES.map(
        ({ key, icon: iconName }) =>
          html`<button
            type="button"
            data-inquiry-type="${key}"
            class="group text-left w-full rounded-[16px] p-6 border border-white/10 transition-all duration-200 cursor-pointer hover:border-cyan-bright hover:scale-[1.02] focus-visible:outline-none focus-visible:border-cyan-bright focus-visible:scale-[1.02]"
            style="background:#1e1e1e"
          >
            <div
              class="w-11 h-11 rounded-[10px] flex items-center justify-center mb-4 bg-white/5 transition-colors duration-200 group-hover:bg-cyan-bright/10"
            >
              ${icon(iconName, {
                size: 22,
                className:
                  'text-hkm-300 transition-colors duration-200 group-hover:text-cyan-bright',
              })}
            </div>
            <h3
              class="font-display font-bold text-white text-[15px] leading-snug mb-1.5 transition-colors duration-200 group-hover:text-cyan-bright"
            >
              ${t[TITLE_KEY[key]]}
            </h3>
            <p class="text-[13px] text-hkm-500 leading-[1.5]">${t[DESC_KEY[key]]}</p>
          </button>`
      )}
    </div>

    ${contactChannels({ settings, t, lang })}
  </div>`;
}

// ── Step 2: form ────────────────────────────────────────────────────────────

function successState(t) {
  return html`<div data-contact-success hidden class="py-8 text-center">
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
      style="background:rgba(0,255,255,0.12);border:1px solid rgba(0,255,255,0.3)"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00ffff"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <h2 class="font-display font-bold text-white text-[22px] mb-2">${t.successTitle}</h2>
    <p class="text-hkm-300 text-[15px] leading-[1.6] mb-6">${t.successDesc}</p>
    <button
      type="button"
      data-contact-reset
      class="text-[13px] text-cyan-bright underline underline-offset-4 cursor-pointer bg-transparent border-none"
    >
      ${t.sendAnother}
    </button>
  </div>`;
}

function contactForm({ t, formspreeUrl, productOptions }) {
  return html`<form
    data-contact-form
    action="${formspreeUrl}"
    method="POST"
    novalidate
    class="flex flex-col gap-5"
  >
    <!-- Honeypot — bot mengisi ini; manusia tidak melihatnya -->
    <input
      type="text"
      name="_gotcha"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      style="display:none"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      ${input({
        id: 'c-name',
        name: 'name',
        label: t.labelName,
        required: true,
        placeholder: t.placeholderName,
        autocomplete: 'name',
      })}
      ${input({
        id: 'c-email',
        name: 'email',
        label: t.labelEmail,
        required: true,
        type: 'email',
        placeholder: t.placeholderEmail,
        autocomplete: 'email',
      })}
    </div>

    <!-- Telepon — tampil/wajib tergantung jenis (diatur JS) -->
    ${input({
      id: 'c-phone',
      name: 'phone',
      label: t.labelPhone,
      type: 'tel',
      placeholder: t.placeholderPhone,
      autocomplete: 'tel',
    })}

    <!-- Perusahaan — untuk pertanyaan bisnis (diatur JS) -->
    ${input({
      id: 'c-company',
      name: 'company',
      label: t.labelCompany,
      placeholder: t.placeholderCompany,
      autocomplete: 'organization',
    })}

    <!-- Subjek — terisi otomatis, bisa diedit -->
    ${input({
      id: 'c-subject',
      name: 'subject',
      label: t.labelSubject,
      placeholder: t.placeholderSubject,
    })}

    <!-- Field produk — hanya product_support -->
    <div data-field="product" class="flex flex-col gap-5">
      ${productOptions.length > 0
        ? select({
            id: 'c-product-model',
            name: 'product_model',
            label: t.labelProductModel,
            placeholder: t.placeholderProductModel,
            options: productOptions,
          })
        : input({
            id: 'c-product-model',
            name: 'product_model',
            label: t.labelProductModel,
            placeholder: t.placeholderProductModel,
          })}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        ${input({
          id: 'c-purchase-date',
          name: 'purchase_date',
          label: t.labelPurchaseDate,
          type: 'date',
        })}
        ${input({
          id: 'c-serial',
          name: 'serial_number',
          label: t.labelSerialNumber,
          placeholder: t.placeholderSerial,
        })}
      </div>
    </div>

    ${textarea({
      id: 'c-message',
      name: 'message',
      label: t.labelMessage,
      required: true,
      rows: 6,
      placeholder: t.placeholderMessage,
    })}

    <p class="text-[12px] text-hkm-500 leading-[1.5]">${t.privacyNote}</p>

    <button
      type="submit"
      data-contact-submit
      class="w-full sm:w-auto sm:self-start flex items-center justify-center gap-2 bg-electric-blue text-white px-8 py-3.5 rounded-[8px] font-semibold text-[14px] border border-electric-blue transition-all duration-200 hover:bg-cyan-bright hover:border-cyan-bright hover:text-dark-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      ${t.submitBtn}
    </button>
  </form>`;
}

function formUnavailable({ x, settings }) {
  const email = settings?.contactEmail || 'info@hkm.co.id';
  return html`<div class="py-8 text-center">
    <p class="text-hkm-300 text-sm leading-[1.6] mb-3">${x.formUnavailable}</p>
    <a
      href="mailto:${email}"
      class="text-cyan-bright text-sm font-semibold no-underline hover:underline"
      >${email}</a
    >
  </div>`;
}

function step2({ t, x, settings, lang, formspreeUrl, productOptions }) {
  return html`<div data-contact-step2 hidden>
    <div class="mb-10 lg:mb-12">
      <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-3">
        ${t.eyebrow}
      </p>
      <h2
        class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05]"
        style="font-size:clamp(36px, 5vw, 60px)"
      >
        ${t.title1} <span class="text-cyan-bright">${t.titleSpan}</span>
      </h2>
    </div>

    <div class="flex flex-col gap-12 lg:gap-16">
      <!-- Kartu form -->
      <div class="rounded-[16px] p-7 md:p-10 border border-white/10" style="background:#1e1e1e">
        <div data-contact-formwrap>
          <!-- Badge jenis + link ganti -->
          <div
            class="flex items-center justify-between flex-wrap gap-3 mb-6 pb-6 border-b border-white/10"
          >
            <div class="flex items-center gap-2 min-w-0">
              ${INQUIRY_TYPES.map(
                ({ key, icon: iconName }) =>
                  html`<span data-type-icon="${key}" hidden class="inline-flex shrink-0"
                    >${icon(iconName, { size: 15, className: 'text-cyan-bright shrink-0' })}</span
                  >`
              )}
              <span class="font-mono text-[11px] text-hkm-500 shrink-0">${t.selectedType}</span>
              <span class="text-[13px] font-semibold text-white truncate" data-type-title></span>
            </div>
            <button
              type="button"
              data-contact-change
              class="font-mono text-[11px] text-cyan-bright hover:underline underline-offset-2 bg-transparent border-none cursor-pointer shrink-0"
            >
              ${t.changeType}
            </button>
          </div>

          <!-- Catatan khusus jenis "careers" -->
          <div
            data-careers-note
            hidden
            class="flex items-start gap-3 rounded-[10px] p-4 mb-6 text-[13px] text-hkm-300 leading-[1.5]"
            style="background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.15)"
          >
            ${icon('Briefcase', { size: 14, className: 'text-cyan-bright mt-0.5 shrink-0' })}
            <span
              >${t.careerNote}
              <a
                href="${langPath('/careers', lang)}"
                class="text-cyan-bright font-semibold no-underline hover:underline"
                >${t.careersLink}</a
              >.</span
            >
          </div>

          ${formspreeUrl
            ? contactForm({ t, formspreeUrl, productOptions })
            : formUnavailable({ x, settings })}
        </div>

        ${successState(t)}
      </div>

      ${contactChannels({ settings, t, lang })}
    </div>
  </div>`;
}

// ── Body halaman ────────────────────────────────────────────────────────────

function contactBody({ settings, products, lang, formspreeUrl }) {
  const t = getT('contact', lang);
  const x = CONTACT_EXTRA[lang] || CONTACT_EXTRA.en;

  const productOptions = products.map((p) => ({
    value: p._id,
    label: loc(p.name, lang) || p.name?.en || p._id,
  }));

  // Konfigurasi untuk contact-form.js — semua teks sudah dalam bahasa halaman
  const config = {
    types: Object.fromEntries(
      INQUIRY_TYPES.map(({ key }) => [
        key,
        {
          ...TYPE_CFG[key],
          title: t[TITLE_KEY[key]] || key,
          subject: t[AUTO_SUBJECT_KEY[key]] || '',
        },
      ])
    ),
    labels: {
      company: t.labelCompany,
      companyRequired: t.labelCompany.replace(' (Optional)', '').replace(' (Opsional)', ''),
      submit: t.submitBtn,
      submitting: t.submitting,
    },
    errors: {
      required: t.errorRequired,
      email: t.errorEmail,
      phone: t.errorPhone,
      company: t.errorCompany,
      minLength: t.errorMinLength,
      generic: t.errorGeneric,
    },
    successToast: t.successToast,
  };

  return html`<section class="px-5 md:px-10 py-[80px] lg:py-[120px]" style="background:#141414">
    <div class="max-w-[1400px] mx-auto" data-contact-root>
      ${step1({ t, settings, lang })}
      ${step2({ t, x, settings, lang, formspreeUrl, productOptions })}

      <script type="application/json" data-contact-config>
        ${jsonScript(config)}
      </script>
    </div>
  </section>`;
}

// ── Route ───────────────────────────────────────────────────────────────────

export const route = {
  name: 'contact',
  path: '/contact',
  async render({ settings, lang, buildYear, gaId, formspreeUrl }) {
    const products = await fetchGroq(PRODUCTS_FOR_CONTACT_QUERY, {}, 'productsForContact').catch(
      () => []
    );

    return page({
      meta: buildMeta({
        title: 'Contact Us — HKM Indonesia',
        description:
          'Get in touch with HKM Indonesia for product inquiries, partnership opportunities, service support, and more.',
        path: '/contact',
      }),
      lang,
      path: '/contact',
      settings,
      buildYear,
      gaId,
      scripts: ['/assets/js/contact-form.js'],
      schemas: [
        jsonLd(
          schemaBreadcrumb([
            { name: lang === 'id' ? 'Beranda' : 'Home', url: SITE_URL + langPath('/', lang) },
            {
              name: lang === 'id' ? 'Hubungi Kami' : 'Contact',
              url: SITE_URL + langPath('/contact', lang),
            },
          ])
        ),
      ],
      body: contactBody({ settings, products: products || [], lang, formspreeUrl }),
    });
  },
};
