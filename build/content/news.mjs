/**
 * Teks & konstanta halaman berita — diekstrak dari
 * components/news/NewsContent.js dan components/news/ArticleContent.js.
 *
 * Versi React menulis label UI langsung dalam bahasa Inggris (tidak ikut
 * berganti saat toggle bahasa). Di sini label EN dibiarkan persis sama,
 * dan versi ID ditambahkan karena halaman /id/news kini benar-benar ada.
 */

/** Urutan chip filter — sama dengan CATEGORIES di NewsContent.js. */
export const NEWS_CATEGORY_KEYS = ['all', 'press-release', 'product', 'partnership', 'company'];

/** Gradient pengganti thumbnail kalau artikel tidak punya gambar. */
export const THUMB_VARIANTS = [
  'radial-gradient(circle at 30% 40%, rgba(0,255,255,0.25), transparent 60%), linear-gradient(135deg, #2e2e2e, #141414)',
  'radial-gradient(circle at 70% 30%, rgba(0,102,255,0.3), transparent 60%), linear-gradient(135deg, #262626, #2e2e2e)',
  'radial-gradient(circle at 50% 60%, rgba(45,212,255,0.25), transparent 60%), linear-gradient(135deg, #2e2e2e, #262626)',
  'radial-gradient(circle at 40% 50%, rgba(0,200,255,0.28), transparent 60%), linear-gradient(135deg, #262626, #141414)',
  'radial-gradient(circle at 60% 40%, rgba(0,150,255,0.3), transparent 60%), linear-gradient(135deg, #2e2e2e, #262626)',
  'radial-gradient(circle at 50% 30%, rgba(0,255,255,0.2), transparent 60%), linear-gradient(135deg, #141414, #2e2e2e)',
];

export const NEWS_LABELS = {
  en: {
    // ── Listing ──
    metaTitle: 'Berita & Siaran Pers HKM — Update Produk Konektivitas Indonesia',
    metaDesc:
      'Berita terbaru, siaran pers, dan update produk dari PT. Harapan Karunia Makmur. Peluncuran produk, partnership, dan kabar jaringan distribusi nasional.',
    home: 'Home',
    crumb: 'News & Press',
    titleA: 'News & ',
    titleB: 'Press.',
    intro:
      "Product launches, partnership announcements, company milestones, and industry insights from across HKM's network.",
    featured: 'Featured',
    latestStory: '— Latest Story',
    readFull: 'Read full story →',
    readMore: 'Read more →',
    newest: 'Newest First',
    oldest: 'Oldest First',
    sortLabel: 'Sort articles',
    filterLabel: 'Filter by category',
    emptyTitle: 'No articles found.',
    emptyDesc: 'Try selecting a different category or clearing the filter.',
    nlEyebrow: '— Stay Updated',
    nlTitleA: 'Get the latest ',
    nlTitleB: 'HKM news',
    nlDesc:
      'Subscribe for product launches, partnership news, and connectivity insights — delivered straight to your inbox.',
    nlPlaceholder: 'Your email address',
    nlButton: 'Subscribe',
    cat: {
      all: 'All',
      'press-release': 'Press Release',
      product: 'Product',
      partnership: 'Partnership',
      company: 'Company',
    },

    // ── Detail ──
    news: 'News',
    published: 'Published',
    readTime: 'Read Time',
    minRead: 'min read',
    shareTwitter: 'Share on Twitter',
    shareLinkedIn: 'Share on LinkedIn',
    copyLink: 'Copy link',
    copied: 'Link copied',
    backToNews: '← Back to News',
    related: 'Related Articles',
    allNews: 'All news →',
    metaSuffix: 'Berita HKM',
    crumbHome: 'Home',
    crumbNews: 'News',
  },
  id: {
    metaTitle: 'Berita & Siaran Pers HKM — Update Produk Konektivitas Indonesia',
    metaDesc:
      'Berita terbaru, siaran pers, dan update produk dari PT. Harapan Karunia Makmur. Peluncuran produk, partnership, dan kabar jaringan distribusi nasional.',
    home: 'Beranda',
    crumb: 'Berita & Pers',
    titleA: 'Berita & ',
    titleB: 'Pers.',
    intro:
      'Peluncuran produk, pengumuman kemitraan, pencapaian perusahaan, dan wawasan industri dari seluruh jaringan HKM.',
    featured: 'Unggulan',
    latestStory: '— Berita Terbaru',
    readFull: 'Baca selengkapnya →',
    readMore: 'Baca selengkapnya →',
    newest: 'Terbaru',
    oldest: 'Terlama',
    sortLabel: 'Urutkan artikel',
    filterLabel: 'Filter kategori',
    emptyTitle: 'Tidak ada artikel ditemukan.',
    emptyDesc: 'Coba pilih kategori lain atau hapus filter.',
    nlEyebrow: '— Tetap Terhubung',
    nlTitleA: 'Dapatkan ',
    nlTitleB: 'berita HKM terbaru',
    nlDesc:
      'Berlangganan untuk info peluncuran produk, kabar kemitraan, dan wawasan konektivitas — langsung ke inbox Anda.',
    nlPlaceholder: 'Alamat email Anda',
    nlButton: 'Berlangganan',
    cat: {
      all: 'Semua',
      'press-release': 'Press Release',
      product: 'Produk',
      partnership: 'Kemitraan',
      company: 'Perusahaan',
    },

    news: 'Berita',
    published: 'Terbit',
    readTime: 'Waktu Baca',
    minRead: 'menit baca',
    shareTwitter: 'Bagikan ke Twitter',
    shareLinkedIn: 'Bagikan ke LinkedIn',
    copyLink: 'Salin tautan',
    copied: 'Tautan disalin',
    backToNews: '← Kembali ke Berita',
    related: 'Artikel Terkait',
    allNews: 'Semua berita →',
    metaSuffix: 'Berita HKM',
    crumbHome: 'Beranda',
    crumbNews: 'Berita',
  },
};

/** Ambil label sesuai bahasa (fallback EN). */
export function newsLabels(lang) {
  return NEWS_LABELS[lang] || NEWS_LABELS.en;
}

/** Label kategori — kategori tak dikenal ditampilkan apa adanya (sama seperti React). */
export function categoryLabel(cat, lang) {
  if (!cat) return '';
  return newsLabels(lang).cat[cat] || cat;
}
