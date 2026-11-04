/**
 * Section 9: B2B / Reseller — port dari components/sections/B2bSection.js
 *
 * Perbedaan dari versi React:
 *  - Form React memakai onSubmit + fetch. Kalau JavaScript gagal dimuat,
 *    tombol kirim TIDAK melakukan apa pun — pengunjung mengira sudah
 *    terkirim padahal tidak. Di sini <form> punya `action` dan
 *    `method="POST"` asli ke Formspree, jadi tetap terkirim tanpa JS.
 *    src/js/b2b-form.js lalu mengambil alih agar halaman tidak reload.
 *  - State submitted / loading / error → tiga blok di HTML yang
 *    ditampilkan bergantian oleh JS.
 */
import { html, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { sanitizeHtml } from '../lib/sanitize.mjs';
import { langPath } from '../routes.mjs';
import { B2B_LABELS } from '../content/homepage.mjs';

const INPUT_CLASS =
  'w-full bg-black/30 border border-white/10 text-white placeholder-hkm-500 px-3.5 py-3 ' +
  'rounded-[8px] text-sm outline-none transition-colors duration-200 focus:border-cyan-bright font-sans';

export function b2bSection({ data, categories = [], lang, formspreeUrl }) {
  const t = B2B_LABELS[lang] || B2B_LABELS.en;

  const title = loc(data?.b2bTitle, lang) || t.title;
  const desc = loc(data?.b2bDescription, lang) || t.desc;
  const btnLabel = loc(data?.b2bButtonLabel, lang) || t.emailBtn;
  const formUrl = data?.b2bFormUrl || formspreeUrl || null;
  const salesEmail = data?.salesEmail || 'sales@hkm.co.id';

  return html`
    <section id="contact" class="px-10 py-[60px] pb-[120px]" style="background:#0A0B0E">
      <div class="max-w-[1400px] mx-auto">
        <div
          class="relative overflow-hidden rounded-[24px] border border-white/10"
          style="background:radial-gradient(ellipse at top right, rgba(0,255,255,0.22), transparent 60%),linear-gradient(135deg,#002a8a 0%,#001a55 100%);padding:clamp(40px,6vw,80px) clamp(24px,5vw,64px)"
        >
          <div
            class="absolute inset-0 pointer-events-none"
            style="background-image:linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);background-size:40px 40px;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 70% 50%, black, transparent);mask-image:radial-gradient(ellipse 70% 60% at 70% 50%, black, transparent)"
          ></div>

          <div
            class="relative z-[2] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[60px] items-center"
          >
            <!-- Kiri: teks -->
            <div>
              <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-4">
                ${t.eyebrow}
              </p>
              <h2
                class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] mb-4 [&>span]:text-cyan-bright"
                style="font-size:clamp(28px,4vw,44px)"
              >
                ${raw(sanitizeHtml(title))}
              </h2>
              <p class="text-[15px] text-hkm-300 leading-[1.6] mb-7">${desc}</p>
              <a
                href="${langPath('/contact', lang)}?type=reseller_dealer"
                class="inline-flex items-center gap-2 bg-electric-blue text-white px-7 py-3.5 rounded-[8px] font-semibold text-sm no-underline border border-electric-blue transition-all duration-200 hover:bg-cyan-bright hover:border-cyan-bright hover:text-dark-2"
                >${btnLabel}</a
              >
            </div>

            <!-- Kanan: form -->
            <div
              class="rounded-[16px] p-7 border border-white/10"
              style="background:rgba(255,255,255,0.04);backdrop-filter:blur(10px)"
            >
              <p class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.15em] mb-5">
                ${t.formLabel}
              </p>

              ${!formUrl
                ? html`<div class="py-8 text-center">
                    <p class="text-hkm-300 text-sm leading-[1.6] mb-3">${t.formUnavailable}</p>
                    <a
                      href="mailto:${salesEmail}"
                      class="text-cyan-bright text-sm font-semibold no-underline hover:underline"
                      >${salesEmail}</a
                    >
                  </div>`
                : html`
                    <!-- Pesan sukses — disembunyikan sampai JS menampilkannya -->
                    <div data-b2b-success hidden class="py-8 text-center">
                      <p class="text-white text-sm leading-[1.6] mb-4">${t.successMsg}</p>
                      <button
                        type="button"
                        data-b2b-reset
                        class="text-[12px] text-cyan-bright underline cursor-pointer bg-transparent border-none"
                      >
                        ${t.successReset}
                      </button>
                    </div>

                    <form
                      data-b2b-form
                      action="${formUrl}"
                      method="POST"
                      class="flex flex-col gap-3"
                    >
                      <label class="sr-only" for="b2b-company">${t.companyHolder}</label>
                      <input
                        id="b2b-company"
                        type="text"
                        name="company"
                        placeholder="${t.companyHolder}"
                        class="${INPUT_CLASS}"
                        required
                      />

                      <label class="sr-only" for="b2b-email">${t.emailHolder}</label>
                      <input
                        id="b2b-email"
                        type="email"
                        name="email"
                        placeholder="${t.emailHolder}"
                        class="${INPUT_CLASS}"
                        required
                      />

                      <label class="sr-only" for="b2b-wa">${t.waHolder}</label>
                      <input
                        id="b2b-wa"
                        type="tel"
                        name="whatsapp"
                        placeholder="${t.waHolder}"
                        class="${INPUT_CLASS}"
                      />

                      <label class="sr-only" for="b2b-category">${t.selectHolder}</label>
                      <select
                        id="b2b-category"
                        name="category"
                        class="${INPUT_CLASS}"
                        style="color-scheme:dark"
                      >
                        <option value="">${t.selectHolder}</option>
                        ${categories.map((cat) => {
                          const name = loc(cat.name, lang);
                          return html`<option value="${name}">${name}</option>`;
                        })}
                        <option value="all">${t.selectAll}</option>
                      </select>

                      <div
                        data-b2b-error
                        hidden
                        class="rounded-[8px] px-4 py-3 text-sm"
                        style="background:rgba(255,80,80,0.12);border:1px solid rgba(255,80,80,0.25)"
                      >
                        <p class="text-red-400 mb-1">${t.errorMsg}</p>
                        <a
                          href="mailto:${salesEmail}"
                          class="text-cyan-bright font-semibold no-underline hover:underline"
                          >${salesEmail}</a
                        >
                      </div>

                      <button
                        type="submit"
                        data-b2b-submit
                        data-label="${t.submitBtn}"
                        class="w-full flex items-center justify-center gap-2 bg-electric-blue text-white px-7 py-3.5 rounded-[8px] font-semibold text-sm border border-electric-blue transition-all duration-200 hover:bg-cyan-bright hover:border-cyan-bright hover:text-dark-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                      >
                        ${t.submitBtn}
                      </button>
                    </form>
                  `}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
