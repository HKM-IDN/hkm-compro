/**
 * Teks default section homepage — diekstrak apa adanya dari
 * components/sections/*.js. Dipakai sebagai fallback kalau field
 * Sanity kosong.
 */

// ── HeroSection ──
export const HERO_LABELS = {
  en: { explore: 'Explore Products →', findSP: 'Find Service Point' },
  id: { explore: 'Lihat Produk →', findSP: 'Cari Service Point' },
};

// ── CategoriesSection ──
export const CATEGORIES_LABELS = {
  en: {
    eyebrow: '— Our Lineup',
    title: 'Connectivity hardware & solutions, end-to-end.',
    sub: 'Six product categories trusted by retail customers and B2B partners across Indonesia.',
    viewLink: 'View products →',
    products: 'Products',
  },
  id: {
    eyebrow: '— Lini Produk',
    title: 'Perangkat & solusi konektivitas, lengkap dari ujung ke ujung.',
    sub: 'Enam kategori produk yang dipercaya pelanggan retail dan mitra B2B di seluruh Indonesia.',
    viewLink: 'Lihat produk →',
    products: 'Produk',
  },
};

// ── SpotlightSection ──
export const SPOTLIGHT_LABELS = {
  en: {
    eyebrow: '— Featured Products',
    title: 'Built for Indonesia. <span>Trusted nationwide.</span>',
    sub: 'A closer look at the products powering connectivity for thousands of homes and businesses.',
    viewDetail: 'View Details →',
    availOn: 'Available on',
  },
  id: {
    eyebrow: '— Produk Unggulan',
    title: 'Dibuat untuk Indonesia. <span>Dipercaya nasional.</span>',
    sub: 'Lebih dekat dengan produk yang menggerakkan konektivitas ribuan rumah dan bisnis.',
    viewDetail: 'Lihat Detail →',
    availOn: 'Tersedia di',
  },
};

// ── YouTubeSection ──
export const YOUTUBE_LABELS = {
  en: {
    eyebrow: '— Reviews & Tutorials',
    title: 'See our products <span>in action.</span>',
    sub: 'Real reviews and walkthroughs from creators using HKM products.',
    channelBtn: 'View Our YouTube Channel →',
    channel: 'HKM Official',
    views: 'views',
  },
  id: {
    eyebrow: '— Review & Tutorial',
    title: 'Lihat produk kami <span>beraksi.</span>',
    sub: 'Review nyata dan tutorial dari kreator yang menggunakan produk HKM.',
    channelBtn: 'Kunjungi Channel YouTube →',
    channel: 'HKM Official',
    views: 'tayangan',
  },
};

// ── InstagramSection ──
export const INSTAGRAM_LABELS = {
  en: {
    eyebrow: '— On Instagram',
    title: 'Follow us on <span>Instagram.</span>',
    sub: 'Product launches, behind-the-scenes, and updates from across our network.',
    cardHeadline: 'Stay in the loop',
    cardDesc:
      'Follow our Instagram for product launches, behind-the-scenes content, and updates from our {count}+ service points across Indonesia.',
    followBtn: 'Follow on Instagram →',
  },
  id: {
    eyebrow: '— Di Instagram',
    title: 'Ikuti kami di <span>Instagram.</span>',
    sub: 'Peluncuran produk, behind-the-scenes, dan update dari seluruh jaringan kami.',
    cardHeadline: 'Tetap terhubung',
    cardDesc:
      'Ikuti Instagram kami untuk peluncuran produk, konten behind-the-scenes, dan update dari {count}+ service point kami di seluruh Indonesia.',
    followBtn: 'Ikuti di Instagram →',
  },
};

// ── ServiceSection ──
export const SERVICE_LABELS = {
  en: {
    eyebrow: '— Nationwide Coverage',
    title: '{count} service points <span>across Indonesia.</span>',
    desc: 'Sumatera, Jawa, Kalimantan, Sulawesi, Bali — wherever you are, support is nearby.',
    stat1: 'Service Points',
    stat2: 'Provinces',
    stat3: 'Cities Covered',
    stat4: 'Islands Served',
    findBtn: 'Find Nearest →',
    mapTitle: 'Indonesia Service Network',
    mapSub: 'Interactive map · {count} service points',
    viewAll: 'View All Service Points →',
  },
  id: {
    eyebrow: '— Jangkauan Nasional',
    title: '{count} service point <span>di seluruh Indonesia.</span>',
    desc: 'Sumatera, Jawa, Kalimantan, Sulawesi, Bali — di mana pun Anda berada, dukungan kami selalu dekat.',
    stat1: 'Service Point',
    stat2: 'Provinsi',
    stat3: 'Kota',
    stat4: 'Pulau',
    findBtn: 'Cari Terdekat →',
    mapTitle: 'Jaringan Service Indonesia',
    mapSub: 'Peta interaktif · {count} service point',
    viewAll: 'Lihat Semua Service Point →',
  },
};

// ── NewsSection ──
export const NEWS_LABELS = {
  en: {
    eyebrow: '— News & Press',
    title: "What's happening at <span>HKM.</span>",
    sub: 'Press releases, partnership announcements, and company news.',
    allBtn: 'View All News & Press →',
    readMore: 'Read more →',
    tag: {
      'press-release': 'Press Release',
      product: 'Product',
      partnership: 'Partnership',
      company: 'Company',
    },
  },
  id: {
    eyebrow: '— Berita & Press',
    title: 'Yang terjadi di <span>HKM.</span>',
    sub: 'Press release, pengumuman kemitraan, dan berita perusahaan.',
    allBtn: 'Lihat Semua Berita →',
    readMore: 'Baca selengkapnya →',
    tag: {
      'press-release': 'Press Release',
      product: 'Produk',
      partnership: 'Kemitraan',
      company: 'Perusahaan',
    },
  },
};

// ── CredibilitySection ──
export const CREDIBILITY_LABELS = {
  en: { partnersLabel: 'In Partnership With' },
  id: { partnersLabel: 'Bermitra Dengan' },
};

// ── B2bSection ──
export const B2B_LABELS = {
  en: {
    eyebrow: '— B2B / Reseller Inquiry',
    title: 'Become a <span>distribution partner.</span>',
    desc: 'Are you a retailer, dealer, or corporate buyer? Get in touch — our team will reach out within 1 business day.',
    emailBtn: 'Email Sales Team →',
    formLabel: 'Quick Inquiry',
    companyHolder: 'Company / Business name',
    emailHolder: 'Email address',
    waHolder: 'WhatsApp number',
    selectHolder: 'Interested in...',
    selectAll: 'All categories',
    submitBtn: 'Submit Inquiry',
    successMsg: "Thank you! We'll be in touch within 1 business day.",
    successReset: 'Send another inquiry',
    errorMsg: 'Something went wrong. Please email us directly:',
    formUnavailable: 'Online form is currently unavailable. Please reach us directly:',
  },
  id: {
    eyebrow: '— Pendaftaran B2B / Reseller',
    title: 'Jadi <span>mitra distribusi.</span>',
    desc: 'Anda retailer, dealer, atau corporate buyer? Hubungi kami — tim kami akan menghubungi balik dalam 1 hari kerja.',
    emailBtn: 'Email Tim Sales →',
    formLabel: 'Tanya Cepat',
    companyHolder: 'Nama Perusahaan / Bisnis',
    emailHolder: 'Alamat email',
    waHolder: 'Nomor WhatsApp',
    selectHolder: 'Tertarik pada...',
    selectAll: 'Semua kategori',
    submitBtn: 'Kirim Permintaan',
    successMsg: 'Terima kasih! Kami akan menghubungi dalam 1 hari kerja.',
    successReset: 'Kirim permintaan lain',
    errorMsg: 'Terjadi kesalahan. Silakan email kami langsung:',
    formUnavailable: 'Form online sedang tidak tersedia. Hubungi kami langsung:',
  },
};
