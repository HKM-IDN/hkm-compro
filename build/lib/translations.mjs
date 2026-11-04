/**
 * lib/translations.js — single source of truth for all UI copy.
 *
 * Structure: TRANSLATIONS[namespace][key] = { en: string, id: string }
 *
 * Rules:
 *  - Every key MUST have both 'en' and 'id'.
 *  - getT(namespace, lang) returns a plain object { key: translated string }
 *    with the same shape as the old inline LABELS, so call sites change minimally.
 *  - t(namespace, key, lang) is for one-off lookups.
 */

const TRANSLATIONS = {
  // ── Product detail pages ────────────────────────────────────────────────────
  product: {
    home: { en: 'Home', id: 'Beranda' },
    products: { en: 'Products', id: 'Produk' },
    overview: { en: 'Overview', id: 'Ikhtisar' },
    specifications: { en: 'Specifications', id: 'Spesifikasi' },
    support: { en: 'Support', id: 'Dukungan' },
    buyNow: { en: 'Buy Now →', id: 'Beli Sekarang →' },
    whereToBuy: { en: 'Where to Buy →', id: 'Tempat Beli →' },
    exploreFeatures: { en: 'Explore Features', id: 'Lihat Fitur' },
    getYoursToday: { en: '— Get Yours Today', id: '— Dapatkan Sekarang' },
    availableOn: {
      en: 'Available now on major marketplaces.',
      id: 'Tersedia di marketplace terkemuka Indonesia.',
    },
    marketplaceDesc: {
      en: "Buy direct from authorized sellers across Indonesia's leading marketplaces. Official warranty, original packaging, fast nationwide delivery.",
      id: 'Beli langsung dari penjual resmi di marketplace terkemuka Indonesia. Garansi resmi, kemasan asli, pengiriman cepat ke seluruh Indonesia.',
    },
    b2bInquiry: { en: 'B2B Bulk Inquiry →', id: 'Pertanyaan B2B →' },
    fullSpecs: { en: '— Full Specifications', id: '— Spesifikasi Lengkap' },
    everyDetail: { en: 'Every detail,', id: 'Setiap detail,' },
    documented: { en: 'documented.', id: 'terdokumentasi.' },
    supportTitle: { en: '— Support & Resources', id: '— Dukungan & Sumber Daya' },
    getHelp: { en: 'Get help with your', id: 'Dapatkan bantuan untuk produk' },
    relatedProducts: { en: 'Related Products', id: 'Produk Terkait' },
    viewAll: { en: 'View all', id: 'Lihat semua' },
    viewDetails: { en: 'View Details →', id: 'Lihat Detail →' },
    downloadDoc: { en: 'Download →', id: 'Unduh →' },
    downloadPdf: { en: 'Download PDF →', id: 'Unduh PDF →' },
    noSupportDocs: {
      en: 'Contact us for documentation and support.',
      id: 'Hubungi kami untuk dokumentasi dan dukungan.',
    },
    viewServicePoints: { en: 'View Service Points →', id: 'Lihat Service Point →' },
    documentation: { en: 'Documentation', id: 'Dokumentasi' },
    quickStartGuide: { en: 'Quick Start Guide', id: 'Panduan Mulai Cepat' },
    fullUserManual: { en: 'Full User Manual', id: 'Manual Pengguna Lengkap' },
    specSheet: { en: 'Spec Sheet', id: 'Lembar Spesifikasi' },
    findServicePoint: { en: 'Find Service Point', id: 'Cari Service Point' },
    viewAllLocations: { en: 'View All Locations →', id: 'Lihat Semua Lokasi →' },
    flagship: { en: 'Flagship', id: 'Flagship' },
    newBadge: { en: 'New', id: 'Baru' },
    buyOnLabel: { en: 'Buy Now →', id: 'Beli Sekarang →' },
    customerSupportTitle: { en: 'Customer Support', id: 'Dukungan Pelanggan' },
    warrantyTitle: { en: 'Service & Warranty', id: 'Servis & Garansi' },
    warrantyPeriodLabel: { en: 'Warranty Period', id: 'Periode Garansi' },
    faqsTitle: { en: 'FAQs', id: 'FAQ' },
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    contactUs: { en: 'Contact Us', id: 'Hubungi Kami' },
    closeMenu: { en: 'Close menu', id: 'Tutup menu' },
  },

  // ── 404 / Not Found ────────────────────────────────────────────────────────
  notFound: {
    eyebrow: { en: '— Page Not Found', id: '— Halaman Tidak Ditemukan' },
    heading: { en: 'Lost in the network.', id: 'Tersesat di jaringan.' },
    description: {
      en: "The page you're looking for doesn't exist or has been moved. Try one of these instead:",
      id: 'Halaman yang Anda cari tidak ada atau telah dipindahkan. Coba salah satu dari ini:',
    },
    browseProducts: { en: 'Browse Products', id: 'Jelajahi Produk' },
    findServicePoint: { en: 'Find Service Point', id: 'Cari Service Point' },
    backHome: { en: 'Back to Home', id: 'Kembali ke Beranda' },
    featuredTitle: { en: 'Or check out these products', id: 'Atau lihat produk ini' },
    viewDetails: { en: 'View Details →', id: 'Lihat Detail →' },
  },

  // ── Contact page ────────────────────────────────────────────────────────────
  contact: {
    eyebrow: { en: '— Contact Us', id: '— Hubungi Kami' },
    title1: { en: "Let's", id: 'Mari' },
    titleSpan: { en: 'connect.', id: 'terhubung.' },
    subtitle: {
      en: "Whether you're inquiring about products, exploring a partnership, or need technical support — we're here to help.",
      id: 'Apakah Anda menanyakan tentang produk, menjajaki kemitraan, atau membutuhkan dukungan teknis — kami siap membantu.',
    },
    labelName: { en: 'Full Name', id: 'Nama Lengkap' },
    labelEmail: { en: 'Email Address', id: 'Alamat Email' },
    labelCompany: { en: 'Company (Optional)', id: 'Perusahaan (Opsional)' },
    labelSubject: { en: 'Subject', id: 'Subjek' },
    labelMessage: { en: 'Message', id: 'Pesan' },
    subjectProduct: { en: 'Product Inquiry', id: 'Pertanyaan Produk' },
    subjectPartnership: { en: 'Partnership', id: 'Kemitraan' },
    subjectSupport: { en: 'Service & Support', id: 'Servis & Dukungan' },
    subjectOther: { en: 'Other', id: 'Lainnya' },
    placeholderName: { en: 'Your full name', id: 'Nama lengkap Anda' },
    placeholderEmail: { en: 'your@email.com', id: 'email@anda.com' },
    placeholderCompany: { en: 'PT. Company Name', id: 'PT. Nama Perusahaan' },
    placeholderSubject: { en: 'Select a subject…', id: 'Pilih subjek…' },
    placeholderMessage: {
      en: 'Tell us how we can help…',
      id: 'Ceritakan bagaimana kami bisa membantu…',
    },
    submitBtn: { en: 'Send Message', id: 'Kirim Pesan' },
    submitting: { en: 'Sending…', id: 'Mengirim…' },
    errorRequired: { en: 'This field is required.', id: 'Kolom ini wajib diisi.' },
    errorEmail: {
      en: 'Please enter a valid email address.',
      id: 'Masukkan alamat email yang valid.',
    },
    errorGeneric: {
      en: 'Something went wrong. Please try again.',
      id: 'Terjadi kesalahan. Silakan coba lagi.',
    },
    successToast: {
      en: "Message sent! We'll get back to you soon.",
      id: 'Pesan terkirim! Kami akan segera menghubungi Anda.',
    },
    successTitle: { en: 'Message sent!', id: 'Pesan terkirim!' },
    successDesc: {
      en: "Thank you for reaching out. We'll reply within 1–2 business days.",
      id: 'Terima kasih telah menghubungi kami. Kami akan membalas dalam 1–2 hari kerja.',
    },
    sendAnother: { en: 'Send another message', id: 'Kirim pesan lain' },
    privacyNote: {
      en: 'We respect your privacy. Your information will never be shared with third parties.',
      id: 'Kami menghormati privasi Anda. Informasi Anda tidak akan dibagikan ke pihak ketiga.',
    },
    infoTitle: { en: 'Other ways to reach us', id: 'Cara lain menghubungi kami' },
    infoAddress: { en: 'Office Address', id: 'Alamat Kantor' },
    infoEmail: { en: 'Email', id: 'Email' },
    infoWhatsApp: { en: 'WhatsApp', id: 'WhatsApp' },
    infoPhone: { en: 'Phone', id: 'Telepon' },
    infoHours: { en: 'Business Hours', id: 'Jam Operasional' },

    // Step 1 — card selection
    step1Eyebrow: { en: '— Get in Touch', id: '— Hubungi Kami' },
    step1Title1: { en: 'How can we', id: 'Bagaimana kami bisa' },
    step1TitleSpan: { en: 'help you?', id: 'membantu Anda?' },
    step1Subtitle: {
      en: 'Select the inquiry type that best describes your question.',
      id: 'Pilih jenis pertanyaan yang paling sesuai dengan kebutuhan Anda.',
    },
    changeType: { en: '← Change inquiry type', id: '← Ganti jenis pertanyaan' },
    selectedType: { en: 'Inquiry type:', id: 'Jenis pertanyaan:' },

    // Inquiry type cards
    typeProductSupportTitle: { en: 'Product Support & Warranty', id: 'Dukungan Produk & Garansi' },
    typeProductSupportDesc: {
      en: 'Troubleshooting, repair, replacement, warranty claims',
      id: 'Troubleshooting, perbaikan, penggantian, klaim garansi',
    },
    typeResellerTitle: { en: 'Become a Reseller', id: 'Jadi Reseller' },
    typeResellerDesc: {
      en: 'For retailers, dealers, corporate buyers',
      id: 'Untuk retailer, dealer, corporate buyer',
    },
    typeDistributionTitle: { en: 'Distribution Partnership', id: 'Kemitraan Distribusi' },
    typeDistributionDesc: {
      en: 'Strategic distribution opportunities',
      id: 'Peluang distribusi strategis',
    },
    typeMediaTitle: { en: 'Media & Press', id: 'Media & Pers' },
    typeMediaDesc: {
      en: 'Journalists, PR, interview requests',
      id: 'Jurnalis, PR, permintaan interview',
    },
    typeCareersTitle: { en: 'Careers', id: 'Karir' },
    typeCareersDesc: {
      en: 'Job inquiries (or visit Careers page)',
      id: 'Pertanyaan lowongan (atau kunjungi halaman Careers)',
    },
    typeGeneralTitle: { en: 'General Inquiry', id: 'Pertanyaan Umum' },
    typeGeneralDesc: { en: 'Other questions', id: 'Pertanyaan lain' },

    // Additional form fields
    labelPhone: { en: 'Phone / WhatsApp', id: 'Telepon / WhatsApp' },
    placeholderPhone: { en: '+62 812-XXXX-XXXX', id: '+62 812-XXXX-XXXX' },
    labelProductModel: { en: 'Product Model (Optional)', id: 'Model Produk (Opsional)' },
    placeholderProductModel: { en: 'Select product model…', id: 'Pilih model produk…' },
    labelPurchaseDate: { en: 'Purchase Date (Optional)', id: 'Tanggal Pembelian (Opsional)' },
    labelSerialNumber: { en: 'Serial Number (Optional)', id: 'Nomor Seri (Opsional)' },
    placeholderSerial: { en: 'e.g. HKM-2024-XXXXX', id: 'mis. HKM-2024-XXXXX' },

    // Auto-suggested subjects per inquiry type
    subjectAutoProductSupport: { en: 'Product Support Request', id: 'Permintaan Dukungan Produk' },
    subjectAutoReseller: { en: 'Reseller/Dealer Inquiry', id: 'Pertanyaan Reseller/Dealer' },
    subjectAutoDistribution: {
      en: 'Distribution Partnership Inquiry',
      id: 'Pertanyaan Kemitraan Distribusi',
    },
    subjectAutoMedia: { en: 'Media/Press Inquiry', id: 'Pertanyaan Media/Pers' },
    subjectAutoCareers: { en: 'Career Inquiry', id: 'Pertanyaan Karir' },
    subjectAutoGeneral: { en: 'General Inquiry', id: 'Pertanyaan Umum' },

    // Additional validation errors
    errorPhone: {
      en: 'Phone number is required for product support.',
      id: 'Nomor telepon wajib diisi untuk dukungan produk.',
    },
    errorCompany: { en: 'Company name is required.', id: 'Nama perusahaan wajib diisi.' },
    errorMinLength: {
      en: 'Message must be at least 20 characters.',
      id: 'Pesan minimal 20 karakter.',
    },

    // Careers note
    careerNote: {
      en: 'For specific job openings, visit our',
      id: 'Untuk lowongan kerja spesifik, kunjungi',
    },
    careersLink: { en: 'Careers page', id: 'halaman Careers' },
  },

  // ── Service Points page ─────────────────────────────────────────────────────
  servicePoints: {
    home: { en: 'Home', id: 'Beranda' },
    title1: { en: 'Service points across', id: 'Titik layanan di seluruh' },
    titleSpan: { en: 'Indonesia.', id: 'Indonesia.' },
    subtitle: {
      en: 'Local support never far away. Visit any of our authorized service points for warranty claims, repairs, technical assistance, and product consultation.',
      id: 'Dukungan lokal selalu dekat. Kunjungi salah satu titik layanan resmi kami untuk klaim garansi, perbaikan, bantuan teknis, dan konsultasi produk.',
    },
    statPoints: { en: 'Service Points', id: 'Service Point' },
    statProvinces: { en: 'Provinces', id: 'Provinsi' },
    statCities: { en: 'Cities Covered', id: 'Kota' },
    statIslands: { en: 'Islands Served', id: 'Pulau' },
    searchPlaceholder: {
      en: 'Search by city, address, or service point name…',
      id: 'Cari kota, alamat, atau nama titik layanan…',
    },
    showing: { en: 'Showing', id: 'Menampilkan' },
    of: { en: 'of', id: 'dari' },
    servicePoints: { en: 'service points', id: 'titik layanan' },
    noResults: {
      en: 'No service points match your search.',
      id: 'Tidak ada titik layanan yang cocok.',
    },
    openNow: { en: 'Open Now', id: 'Buka Sekarang' },
    closedNow: { en: 'Closed', id: 'Tutup' },
    opensAt: { en: 'Opens {time}', id: 'Buka jam {time}' },
    directions: { en: 'Directions', id: 'Petunjuk Arah' },
    whatsapp: { en: 'WhatsApp', id: 'WhatsApp' },
    ctaEyebrow: { en: '— Become a Service Partner', id: '— Bergabung sebagai Mitra' },
    ctaTitle1: { en: 'Interested in joining our', id: 'Tertarik bergabung ke jaringan' },
    ctaTitleSpan: { en: 'service network?', id: 'layanan kami?' },
    ctaDesc: {
      en: "If you operate a service business in a city we haven't yet reached, we'd love to talk. Become an authorized HKM service partner and serve customers in your area.",
      id: 'Jika Anda menjalankan bisnis layanan di kota yang belum kami jangkau, kami ingin bicara. Jadilah mitra layanan HKM resmi dan melayani pelanggan di area Anda.',
    },
    ctaBtn1: { en: 'Partnership Inquiry →', id: 'Hubungi Kami →' },
    ctaBtn2: { en: 'Download Service Partner Brief', id: 'Unduh Brief Mitra Layanan' },
  },

  // ── About page / brand tagline ──────────────────────────────────────────────
  about: {
    heroTagline: {
      en: 'Empowering Connections, Bridging Futures Together',
      id: 'Memberdayakan Koneksi, Menjembatani Masa Depan Bersama',
    },
  },
};

// ── Validation (dev-only) ────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  for (const [ns, keys] of Object.entries(TRANSLATIONS)) {
    for (const [key, vals] of Object.entries(keys)) {
      if (!vals.en || !vals.id) {
        console.warn(`[translations] Missing lang in ${ns}.${key}:`, vals);
      }
    }
  }
}

/**
 * Returns a flat object of translated strings for a namespace + language.
 * Same shape as the old inline LABELS[lang], so call sites change minimally:
 *   Before: const t = LABELS[lang] || LABELS.en;
 *   After:  const t = getT('product', lang);
 */
export function getT(namespace, lang = 'en') {
  const ns = TRANSLATIONS[namespace];
  if (!ns) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[translations] Unknown namespace: ${namespace}`);
    }
    return {};
  }
  return Object.fromEntries(
    Object.entries(ns).map(([key, vals]) => [key, vals[lang] ?? vals.en ?? key])
  );
}

/**
 * Single-key lookup. Prefer getT() for components that use many keys.
 */
export function t(namespace, key, lang = 'en') {
  return TRANSLATIONS[namespace]?.[key]?.[lang] ?? TRANSLATIONS[namespace]?.[key]?.en ?? key;
}

// Exported for tooling (audit scripts, tests).
export { TRANSLATIONS };
