/**
 * Konfigurasi + teks tambahan halaman /contact.
 *
 * Sebagian besar label ada di lib/translations.mjs (namespace `contact`).
 * Yang di sini: konfigurasi jenis pertanyaan (diekstrak apa adanya dari
 * components/sections/ContactSection.js) dan teks yang khusus versi vanilla
 * (fallback kalau endpoint Formspree belum di-set).
 */

// Urutan kartu + ikon lucide per jenis pertanyaan
export const INQUIRY_TYPES = [
  { key: 'product_support', icon: 'LifeBuoy' },
  { key: 'reseller_dealer', icon: 'Store' },
  { key: 'distribution_partnership', icon: 'Handshake' },
  { key: 'media_press', icon: 'Newspaper' },
  { key: 'careers', icon: 'Briefcase' },
  { key: 'general', icon: 'MessageCircle' },
];

// Key terjemahan per jenis — dipakai untuk judul kartu, deskripsi, subjek otomatis
export const TITLE_KEY = {
  product_support: 'typeProductSupportTitle',
  reseller_dealer: 'typeResellerTitle',
  distribution_partnership: 'typeDistributionTitle',
  media_press: 'typeMediaTitle',
  careers: 'typeCareersTitle',
  general: 'typeGeneralTitle',
};
export const DESC_KEY = {
  product_support: 'typeProductSupportDesc',
  reseller_dealer: 'typeResellerDesc',
  distribution_partnership: 'typeDistributionDesc',
  media_press: 'typeMediaDesc',
  careers: 'typeCareersDesc',
  general: 'typeGeneralDesc',
};
export const AUTO_SUBJECT_KEY = {
  product_support: 'subjectAutoProductSupport',
  reseller_dealer: 'subjectAutoReseller',
  distribution_partnership: 'subjectAutoDistribution',
  media_press: 'subjectAutoMedia',
  careers: 'subjectAutoCareers',
  general: 'subjectAutoGeneral',
};

// Field yang tampil + wajib per jenis pertanyaan
export const TYPE_CFG = {
  product_support: {
    phone: true,
    phoneReq: true,
    company: false,
    companyReq: false,
    productFields: true,
  },
  reseller_dealer: {
    phone: true,
    phoneReq: false,
    company: true,
    companyReq: true,
    productFields: false,
  },
  distribution_partnership: {
    phone: true,
    phoneReq: false,
    company: true,
    companyReq: true,
    productFields: false,
  },
  media_press: {
    phone: true,
    phoneReq: false,
    company: true,
    companyReq: false,
    productFields: false,
  },
  careers: {
    phone: false,
    phoneReq: false,
    company: false,
    companyReq: false,
    productFields: false,
  },
  general: { phone: true, phoneReq: false, company: true, companyReq: false, productFields: false },
};

// Teks khusus versi vanilla — sama dengan fallback form B2B di homepage
export const CONTACT_EXTRA = {
  en: {
    formUnavailable: 'Online form is currently unavailable. Please reach us directly:',
  },
  id: {
    formUnavailable: 'Form online sedang tidak tersedia. Hubungi kami langsung:',
  },
};

// Isi blok "Cara lain menghubungi kami" (dari components/contact/ContactChannels.js)
export const CHANNELS_COPY = {
  title: {
    en: "Need help? We're here.",
    id: 'Butuh bantuan? Kami siap membantu.',
  },
  description: {
    en: 'Reach us directly via your preferred channel below.',
    id: 'Hubungi kami langsung lewat channel pilihan Anda di bawah ini.',
  },
};
