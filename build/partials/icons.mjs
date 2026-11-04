/**
 * icons.mjs — kumpulan ikon SVG inline.
 *
 * Di versi React, ikon-ikon ini tersebar sebagai komponen kecil di dalam
 * AboutContent.js, Footer.js, dll, plus sebagian dari lucide-react.
 * Di sini dikumpulkan jadi satu supaya tidak ada duplikat dan
 * lucide-react bisa dilepas sepenuhnya.
 *
 * Semua nilainya hasil html`` (sudah aman), jadi bisa langsung
 * di-interpolasi ke template lain.
 */
import { html } from '../html.mjs';

/** Ikon kartu "Why HKM" — 26×26, stroke 1.5. Key-nya mengikuti schema whyHkmCard. */
export const CARD_ICONS = {
  location: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>`,

  shield: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>`,

  users: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="17" cy="7" r="3" />
    <path d="M21 21v-2a3 3 0 0 0-2-2.83" />
  </svg>`,

  globe: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path
      d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
    />
  </svg>`,

  star: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
    />
  </svg>`,

  building: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <rect x="3" y="9" width="18" height="13" />
    <path d="M8 22V12h8v10" />
    <path d="M3 9l9-7 9 7" />
  </svg>`,

  heart: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    />
  </svg>`,

  award: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    width="26"
    height="26"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>`,
};

/** Ikon baris kontak — 16×16, stroke 2. */
export const CONTACT_ICONS = {
  email: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>`,

  whatsapp: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    />
  </svg>`,

  map: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>`,

  clock: html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>`,
};

/** Ikon kategori produk — 22×22, stroke 2. Key mengikuti field `icon`
 *  di schema productCategory. Diekstrak dari ProductsContent.js. */
export const CAT_ICONS = {
  router: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="22"
    height="22"
  >
    <rect x="3" y="9" width="18" height="9" rx="2" />
    <path d="M7 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
  </svg>`,
  mifi: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="22"
    height="22"
  >
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>`,
  sim: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="22"
    height="22"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M9 2v4h6V2" />
  </svg>`,
  camera: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="22"
    height="22"
  >
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="10" />
  </svg>`,
  dashcam: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="22"
    height="22"
  >
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>`,
  smarthome: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    width="22"
    height="22"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>`,
};

/** Ikon kategori versi HOMEPAGE. Sengaja dipisah dari CAT_ICONS:
 *  versi ini punya detail lebih (garis LED, polyline pintu) dan
 *  ukurannya diatur class w-6 h-6, bukan atribut width/height.
 *  Diekstrak dari components/sections/CategoriesSection.js. */
export const HOME_CATEGORY_ICONS = {
  router: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="w-6 h-6"
  >
    <rect x="3" y="9" width="18" height="9" rx="2" />
    <path d="M7 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
    <line x1="7" y1="14" x2="7" y2="14.01" />
    <line x1="11" y1="14" x2="11" y2="14.01" />
  </svg>`,
  mifi: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="w-6 h-6"
  >
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>`,
  sim: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="w-6 h-6"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="13" y2="15" />
  </svg>`,
  camera: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="w-6 h-6"
  >
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="10" />
  </svg>`,
  dashcam: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="w-6 h-6"
  >
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>`,
  smarthome: html` <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="w-6 h-6"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>`,
};
