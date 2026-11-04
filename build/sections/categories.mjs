/**
 * Section 2: Categories — port dari components/sections/CategoriesSection.js
 *
 * Perbedaan dari versi React:
 *  - Hover kartu DAN hover ikon di dalamnya diatur lewat onMouseEnter/
 *    onMouseLeave (dua handler terpisah). Di sini keduanya jadi CSS:
 *    .cat-card dan .cat-card:hover .cat-card-icon — jadi hover ikon ikut
 *    menyala saat kartunya di-hover, bukan hanya saat kursor tepat di ikon.
 *    (Di versi React, ikon hanya menyala kalau kursor mengenai ikonnya.)
 */
import { html, raw } from '../html.mjs';
import { loc } from '../lib/i18n.mjs';
import { langPath, slugOf } from '../routes.mjs';
import { HOME_CATEGORY_ICONS } from '../partials/icons.mjs';
import { CATEGORIES_LABELS } from '../content/homepage.mjs';

export function categoriesSection({ data, lang }) {
  const t = CATEGORIES_LABELS[lang] || CATEGORIES_LABELS.en;

  const categories = data?.categoriesToShow || [];
  const title = loc(data?.categoriesSectionTitle, lang) || t.title;
  const sub = loc(data?.categoriesSectionDesc, lang) || t.sub;

  if (!categories.length) return raw('');

  return html`
    <section id="categories" class="px-10 py-[100px]" style="background:#0A0B0E">
      <div class="max-w-[1400px] mx-auto">
        <div class="text-center mb-16">
          <p class="font-mono text-[12px] text-cyan-bright uppercase tracking-[0.2em] mb-[14px]">
            ${t.eyebrow}
          </p>
          <h2
            class="font-display font-extrabold text-white tracking-[-0.03em] leading-[1.05] max-w-[800px] mx-auto mb-4"
            style="font-size:clamp(32px,4.5vw,56px)"
          >
            ${title}
          </h2>
          <p class="text-[16px] text-hkm-300 max-w-[580px] mx-auto leading-[1.6]">${sub}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          ${categories.map((cat) => {
            const slug = slugOf(cat.slug) || '';
            const name = loc(cat.name, lang);
            const desc = loc(cat.description, lang);
            const count = cat.productCount > 0 ? `${cat.productCount} ${t.products}` : '';

            return html`<a
              href="${slug ? langPath(`/products/${slug}`, lang) : '#'}"
              class="cat-card group relative overflow-hidden flex flex-col gap-4 bg-dark-3 rounded-[20px] p-7 border border-white/10 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-electric-blue hover:bg-dark-4"
            >
              <div
                class="absolute top-0 right-0 w-[200px] h-[200px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style="background:radial-gradient(circle at 70% 30%, rgba(45,212,255,0.15), transparent 70%)"
              ></div>

              <div
                class="cat-card-icon w-12 h-12 rounded-[12px] flex items-center justify-center text-cyan-bright border border-[rgba(45,212,255,0.2)] transition-all duration-300 group-hover:text-dark-2 group-hover:border-cyan-bright shrink-0"
              >
                ${HOME_CATEGORY_ICONS[cat.icon] || HOME_CATEGORY_ICONS.router}
              </div>

              <div class="flex-1">
                ${count &&
                html`<p
                  class="font-mono text-[11px] text-cyan-bright uppercase tracking-[0.15em] mb-1.5"
                >
                  ${count}
                </p>`}
                <h3 class="font-display text-[20px] font-bold text-white tracking-[-0.02em] mb-2">
                  ${name}
                </h3>
                <p class="text-[13px] text-hkm-300 leading-[1.5]">${desc}</p>
              </div>

              <span
                class="text-white font-semibold text-[13px] flex items-center gap-1.5 transition-all duration-200 group-hover:gap-3 group-hover:text-cyan-bright"
                >${t.viewLink}</span
              >
            </a>`;
          })}
        </div>
      </div>
    </section>
  `;
}
