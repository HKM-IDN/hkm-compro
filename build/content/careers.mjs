/**
 * Teks halaman /careers dan /careers/[slug] — diekstrak dari
 * components/careers/CareersContent.js + JobDetailContent.js.
 *
 * Versi React menulis semua label statis dalam bahasa Inggris (hanya field
 * Sanity yang dwibahasa). Di sini halaman /id ikut diterjemahkan supaya
 * sesuai aturan CLAUDE.md "semua label harus EN/ID". Teks EN tidak diubah.
 */

// ── Label departemen & tipe kerja (nilai enum dari schema jobPosting) ───────

export const DEPT_LABELS = {
  en: {
    sales: 'Sales',
    marketing: 'Marketing',
    operations: 'Operations',
    finance: 'Finance',
    'customer-service': 'Customer Service',
    tech: 'Technology / IT',
    hr: 'HR',
    other: 'Other',
  },
  id: {
    sales: 'Sales',
    marketing: 'Marketing',
    operations: 'Operasional',
    finance: 'Keuangan',
    'customer-service': 'Layanan Pelanggan',
    tech: 'Teknologi / IT',
    hr: 'HR',
    other: 'Lainnya',
  },
};

export const TYPE_LABELS = {
  en: {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
  },
  id: {
    'full-time': 'Penuh waktu',
    'part-time': 'Paruh waktu',
    contract: 'Kontrak',
    internship: 'Magang',
  },
};

export function deptLabel(value, lang) {
  return (DEPT_LABELS[lang] || DEPT_LABELS.en)[value] || value || '';
}

export function typeLabel(value, lang) {
  return (TYPE_LABELS[lang] || TYPE_LABELS.en)[value] || value || '';
}

/**
 * "Posted X ago" — sama dengan postedAgo() di React, tapi `now` dialirkan
 * (ctx.buildTime) karena template tidak boleh memanggil Date.now().
 * Nilai ini hanya fallback: src/js/careers.js menghitung ulang di browser
 * (seperti React yang menghitung saat halaman dilihat).
 * Logika yang sama diduplikasi di src/js/careers.js — ubah keduanya.
 */
export function postedAgo(dateStr, now, lang = 'en') {
  if (!dateStr) return '';
  const days = Math.floor((now - new Date(dateStr).getTime()) / 86400000);
  if (lang === 'id') {
    if (days <= 0) return 'Hari ini';
    if (days < 7) return `${days} hari lalu`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} minggu lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Ikon (SVG mentah, dari JSX asli) ────────────────────────────────────────

export const ICONS = {
  pulse:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>',
  team: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><circle cx="17" cy="7" r="3" /><path d="M21 21v-2a3 3 0 0 0-2-2.83" /></svg>',
  pin: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>',
  search32:
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>',
  // Ikon kecil 14px untuk baris meta kartu lowongan (stroke abu-abu)
  metaPin:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C8694" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>',
  metaClock:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C8694" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>',
  metaUser:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C8694" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></svg>',
  // Ikon 14px untuk MetaItem di header detail (stroke currentColor)
  dPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>',
  dUser:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></svg>',
  dCalendar:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>',
  dClock:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>',
  dWarning:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>',
  check:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>',
  upload:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" style="display:block;margin:0 auto 8px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>',
  arrow:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>',
  linkedin:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>',
  link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>',
};

// ── Label halaman listing /careers ──────────────────────────────────────────

export const LISTING = {
  en: {
    home: 'Home',
    careers: 'Careers',
    heroEyebrow: '— Careers at HKM',
    heroTitleA: "Build Indonesia's",
    heroTitleAccent: 'connectivity future',
    heroTitleB: 'with us.',
    heroDesc:
      "Join a team that's expanding reliable connectivity products across Indonesia. We're growing, we're hiring, and we'd love to hear from you.",
    heroCta: 'View Open Positions →',

    whyEyebrow: '— Why Join HKM',
    whyTitleA: 'A place where',
    whyTitleAccent: 'growth meets impact.',
    whyDesc:
      "We're a growing connectivity distribution company with a clear mission and room for ambitious people to make their mark.",
    whyCards: [
      {
        icon: 'pulse',
        title: 'Real growth opportunities',
        desc: 'As HKM expands across Indonesia, your role grows with us. Take ownership early, build new functions, and shape how things work.',
      },
      {
        icon: 'team',
        title: 'Collaborative team culture',
        desc: 'Flat hierarchy, direct access to leadership, and a culture of getting things done. We hire people we trust, then trust them to deliver.',
      },
      {
        icon: 'pin',
        title: 'Meaningful local impact',
        desc: 'The products we distribute connect Indonesian households and businesses to the internet. Your work has real reach across the archipelago.',
      },
    ],

    openEyebrow: '— Open Positions',
    openTitleA: "We're hiring across",
    openTitleAccent: 'multiple teams.',
    openDesc:
      'Find a role that matches your skills and ambitions. New positions are added regularly.',
    filterAll: 'All',
    urgent: 'Urgent',
    posted: 'Posted',
    viewPosition: 'View Position →',
    emptyTitle: 'No open positions in this category',
    emptyDesc: 'Check back soon or send a general application to careers@hkm.co.id',

    processEyebrow: '— How to Apply',
    processTitleA: 'A simple,',
    processTitleAccent: 'respectful process.',
    processDesc:
      "We respect your time. Our process is straightforward, transparent, and we'll keep you updated at every step.",
    steps: [
      {
        num: '1',
        title: 'Submit Application',
        desc: 'Fill out the form on the role page. Upload your CV and answer a few questions.',
      },
      {
        num: '2',
        title: 'Initial Review',
        desc: 'Our HR team reviews your application within 5 business days and reaches out for next steps.',
      },
      {
        num: '3',
        title: 'Interview Process',
        desc: "1–3 conversations with HR, the hiring manager, and team members. We'll respect your time.",
      },
      {
        num: '4',
        title: 'Decision & Offer',
        desc: 'Final decision communicated within 5 business days after final interview, with offer details if accepted.',
      },
    ],

    faqEyebrow: '— Frequently Asked',
    faqTitleA: 'Application',
    faqTitleAccent: 'FAQ.',
    faqs: [
      {
        q: 'Do you accept fresh graduates?',
        a: 'Yes, for selected entry-level positions. Each job posting specifies the experience required. If a posting requires "1–3 years experience" but you\'re a strong fresh graduate, we still welcome your application.',
      },
      {
        q: 'Do you offer remote or hybrid work?',
        a: 'It depends on the role. Most operations and warehouse roles require on-site presence at Jakarta Utara. Marketing, sales, and back-office roles may have hybrid arrangements. The specific work arrangement is listed in each job posting.',
      },
      {
        q: 'How long does the application process take?',
        a: 'Typically 2–3 weeks from application to offer. We commit to responding to your application within 5 business days, and to communicate decisions within 5 business days after each interview round.',
      },
      {
        q: 'Can I apply for multiple positions?',
        a: 'Yes, you can apply for multiple positions. We recommend prioritizing roles that best match your experience and career goals. Our HR team will review all your applications.',
      },
      {
        q: "What if there's no current opening that fits me?",
        a: "You can submit a general application to careers@hkm.co.id with your CV and a brief intro. We'll keep your profile on file and reach out if a relevant position opens.",
      },
      {
        q: 'Do you offer internships?',
        a: 'We periodically offer internship programs for university students, typically for 3–6 month rotations across marketing, operations, and finance teams. Open internship slots will be posted in the open positions section above.',
      },
    ],

    ctaEyebrow: "— Can't Find the Right Role?",
    ctaTitleA: 'Tell us about',
    ctaTitleAccent: 'yourself.',
    ctaDesc:
      "If you don't see a position that fits but believe you'd be a great addition to HKM, send us a general application. We're always interested in connecting with talented people.",
    ctaEmail: 'Email careers@hkm.co.id →',
    ctaAbout: 'Learn More About HKM',
  },

  id: {
    home: 'Beranda',
    careers: 'Karir',
    heroEyebrow: '— Karir di HKM',
    heroTitleA: 'Bangun',
    heroTitleAccent: 'masa depan konektivitas',
    heroTitleB: 'Indonesia bersama kami.',
    heroDesc:
      'Bergabunglah dengan tim yang memperluas produk konektivitas andal ke seluruh Indonesia. Kami terus berkembang, sedang merekrut, dan ingin mendengar dari Anda.',
    heroCta: 'Lihat Posisi Terbuka →',

    whyEyebrow: '— Kenapa Bergabung dengan HKM',
    whyTitleA: 'Tempat di mana',
    whyTitleAccent: 'pertumbuhan bertemu dampak.',
    whyDesc:
      'Kami perusahaan distribusi konektivitas yang terus berkembang, dengan misi yang jelas dan ruang bagi orang-orang ambisius untuk berkontribusi.',
    whyCards: [
      {
        icon: 'pulse',
        title: 'Peluang berkembang yang nyata',
        desc: 'Seiring HKM berekspansi ke seluruh Indonesia, peran Anda ikut tumbuh. Ambil tanggung jawab sejak awal, bangun fungsi baru, dan bentuk cara kerja tim.',
      },
      {
        icon: 'team',
        title: 'Budaya tim yang kolaboratif',
        desc: 'Hierarki datar, akses langsung ke pimpinan, dan budaya yang fokus menyelesaikan pekerjaan. Kami merekrut orang yang kami percaya, lalu memercayai mereka untuk bekerja.',
      },
      {
        icon: 'pin',
        title: 'Dampak lokal yang berarti',
        desc: 'Produk yang kami distribusikan menghubungkan rumah tangga dan bisnis Indonesia ke internet. Pekerjaan Anda menjangkau seluruh Nusantara.',
      },
    ],

    openEyebrow: '— Posisi Terbuka',
    openTitleA: 'Kami merekrut di',
    openTitleAccent: 'berbagai tim.',
    openDesc:
      'Temukan peran yang sesuai dengan keahlian dan ambisi Anda. Posisi baru ditambahkan secara berkala.',
    filterAll: 'Semua',
    urgent: 'Mendesak',
    posted: 'Diposting',
    viewPosition: 'Lihat Posisi →',
    emptyTitle: 'Belum ada posisi terbuka di kategori ini',
    emptyDesc: 'Cek kembali nanti atau kirim lamaran umum ke careers@hkm.co.id',

    processEyebrow: '— Cara Melamar',
    processTitleA: 'Proses yang sederhana',
    processTitleAccent: 'dan menghargai Anda.',
    processDesc:
      'Kami menghargai waktu Anda. Proses kami lugas, transparan, dan Anda akan selalu mendapat kabar di setiap tahap.',
    steps: [
      {
        num: '1',
        title: 'Kirim Lamaran',
        desc: 'Isi formulir di halaman posisi. Unggah CV dan jawab beberapa pertanyaan.',
      },
      {
        num: '2',
        title: 'Peninjauan Awal',
        desc: 'Tim HR meninjau lamaran Anda dalam 5 hari kerja dan menghubungi Anda untuk tahap berikutnya.',
      },
      {
        num: '3',
        title: 'Proses Wawancara',
        desc: '1–3 sesi bersama HR, hiring manager, dan anggota tim. Kami menghargai waktu Anda.',
      },
      {
        num: '4',
        title: 'Keputusan & Penawaran',
        desc: 'Keputusan akhir disampaikan dalam 5 hari kerja setelah wawancara terakhir, beserta detail penawaran jika diterima.',
      },
    ],

    faqEyebrow: '— Pertanyaan Umum',
    faqTitleA: 'FAQ',
    faqTitleAccent: 'Lamaran.',
    faqs: [
      {
        q: 'Apakah HKM menerima fresh graduate?',
        a: 'Ya, untuk posisi entry-level tertentu. Setiap lowongan mencantumkan pengalaman yang dibutuhkan. Jika lowongan meminta "pengalaman 1–3 tahun" namun Anda fresh graduate yang kuat, kami tetap menerima lamaran Anda.',
      },
      {
        q: 'Apakah ada opsi kerja remote atau hybrid?',
        a: 'Tergantung perannya. Sebagian besar posisi operasional dan gudang mengharuskan kehadiran di lokasi Jakarta Utara. Posisi marketing, sales, dan back-office bisa memiliki pengaturan hybrid. Pengaturan kerja spesifik dicantumkan di setiap lowongan.',
      },
      {
        q: 'Berapa lama proses lamaran berlangsung?',
        a: 'Biasanya 2–3 minggu dari lamaran hingga penawaran. Kami berkomitmen merespons lamaran Anda dalam 5 hari kerja, dan menyampaikan keputusan dalam 5 hari kerja setelah setiap tahap wawancara.',
      },
      {
        q: 'Bolehkah melamar lebih dari satu posisi?',
        a: 'Boleh, Anda dapat melamar beberapa posisi. Kami sarankan memprioritaskan peran yang paling sesuai dengan pengalaman dan tujuan karier Anda. Tim HR akan meninjau semua lamaran Anda.',
      },
      {
        q: 'Bagaimana jika belum ada lowongan yang cocok?',
        a: 'Anda dapat mengirim lamaran umum ke careers@hkm.co.id berisi CV dan perkenalan singkat. Kami akan menyimpan profil Anda dan menghubungi jika ada posisi yang relevan.',
      },
      {
        q: 'Apakah HKM membuka program magang?',
        a: 'Kami membuka program magang untuk mahasiswa secara berkala, biasanya rotasi 3–6 bulan di tim marketing, operasional, dan keuangan. Slot magang yang tersedia akan ditampilkan di bagian posisi terbuka di atas.',
      },
    ],

    ctaEyebrow: '— Belum Menemukan Posisi yang Tepat?',
    ctaTitleA: 'Ceritakan tentang',
    ctaTitleAccent: 'diri Anda.',
    ctaDesc:
      'Jika belum ada posisi yang cocok namun Anda yakin bisa menjadi tambahan hebat bagi HKM, kirimkan lamaran umum. Kami selalu tertarik terhubung dengan orang-orang berbakat.',
    ctaEmail: 'Email careers@hkm.co.id →',
    ctaAbout: 'Pelajari Lebih Lanjut Tentang HKM',
  },
};

// ── Label halaman detail /careers/[slug] ────────────────────────────────────

export const DETAIL = {
  en: {
    home: 'Home',
    careers: 'Careers',
    urgent: '🔥 Urgent',
    location: 'Location',
    experience: 'Experience',
    posted: 'Posted',
    type: 'Type',
    closes: 'Closes',
    aboutEyebrow: '— About the Role',
    aboutTitle: "What you'll do",
    respEyebrow: '— Key Responsibilities',
    respTitle: 'Responsibilities',
    reqEyebrow: "— Who We're Looking For",
    reqTitle: 'Requirements',
    niceEyebrow: '— Bonus Points',
    niceTitle: 'Nice to have',
    benEyebrow: '— What You Get',
    benTitle: 'Benefits',

    applyEyebrow: '— Apply Now',
    applyTitle: 'Ready to join HKM?',
    applyExternalDesc: 'This position uses an external application portal. Click below to apply.',
    applyExternalBtn: 'Apply Now →',
    questions: 'Questions? Email',
    applyDesc: 'Submit your application below. Our HR team will respond within 5 business days.',
    fName: 'Full Name',
    fNamePh: 'Nama Lengkap',
    fEmail: 'Email',
    fEmailPh: 'email@example.com',
    fPhone: 'Phone / WhatsApp',
    fPhonePh: '+62 812-XXXX-XXXX',
    fLocation: 'Current Location',
    fLocationPh: 'Jakarta, Indonesia',
    fCv: 'Upload CV',
    fCvClick: 'Click to upload',
    fCvDrag: 'or drag and drop',
    fCvHint: 'PDF, DOC, DOCX · Max 5MB',
    fWhy: 'Why HKM?',
    fWhyPh: "Briefly tell us why you're interested in this role (optional)",
    submit: 'Submit Application',
    consent:
      "By submitting, you agree to HKM's privacy policy. Your CV will be reviewed by HR and shared only with relevant hiring managers.",
    share: 'Share Job',
    copyLink: 'Copy link',
    errName: 'Name is required',
    errEmail: 'Email is required',
    errEmailFormat: 'Invalid email format',
    errPhone: 'WhatsApp number is required',
    sentTitle: 'Application Sent!',
    sentDesc:
      'Your email client should have opened. If not, send your CV and cover letter directly to',
    sentNote: 'Our HR team will respond within 5 business days.',

    otherTitle: 'Other Open Positions',
    viewAll: 'View all positions →',
    viewPosition: 'View Position →',
  },
  id: {
    home: 'Beranda',
    careers: 'Karir',
    urgent: '🔥 Mendesak',
    location: 'Lokasi',
    experience: 'Pengalaman',
    posted: 'Diposting',
    type: 'Tipe',
    closes: 'Ditutup',
    aboutEyebrow: '— Tentang Peran',
    aboutTitle: 'Yang akan Anda kerjakan',
    respEyebrow: '— Tanggung Jawab Utama',
    respTitle: 'Tanggung Jawab',
    reqEyebrow: '— Siapa yang Kami Cari',
    reqTitle: 'Persyaratan',
    niceEyebrow: '— Nilai Tambah',
    niceTitle: 'Diutamakan',
    benEyebrow: '— Yang Anda Dapatkan',
    benTitle: 'Benefit',

    applyEyebrow: '— Lamar Sekarang',
    applyTitle: 'Siap bergabung dengan HKM?',
    applyExternalDesc:
      'Posisi ini menggunakan portal lamaran eksternal. Klik tombol di bawah untuk melamar.',
    applyExternalBtn: 'Lamar Sekarang →',
    questions: 'Ada pertanyaan? Email',
    applyDesc: 'Kirim lamaran Anda di bawah. Tim HR kami akan merespons dalam 5 hari kerja.',
    fName: 'Nama Lengkap',
    fNamePh: 'Nama Lengkap',
    fEmail: 'Email',
    fEmailPh: 'email@example.com',
    fPhone: 'Telepon / WhatsApp',
    fPhonePh: '+62 812-XXXX-XXXX',
    fLocation: 'Lokasi Saat Ini',
    fLocationPh: 'Jakarta, Indonesia',
    fCv: 'Unggah CV',
    fCvClick: 'Klik untuk unggah',
    fCvDrag: 'atau seret dan lepas',
    fCvHint: 'PDF, DOC, DOCX · Maks 5MB',
    fWhy: 'Kenapa HKM?',
    fWhyPh: 'Ceritakan singkat kenapa Anda tertarik dengan posisi ini (opsional)',
    submit: 'Kirim Lamaran',
    consent:
      'Dengan mengirim, Anda menyetujui kebijakan privasi HKM. CV Anda akan ditinjau oleh HR dan hanya dibagikan ke hiring manager terkait.',
    share: 'Bagikan',
    copyLink: 'Salin tautan',
    // Pesan error asli versi React memang berbahasa Indonesia
    errName: 'Nama wajib diisi',
    errEmail: 'Email wajib diisi',
    errEmailFormat: 'Format email tidak valid',
    errPhone: 'Nomor WhatsApp wajib diisi',
    sentTitle: 'Lamaran Terkirim!',
    sentDesc:
      'Aplikasi email Anda seharusnya sudah terbuka. Jika belum, kirim CV dan surat lamaran langsung ke',
    sentNote: 'Tim HR kami akan merespons dalam 5 hari kerja.',

    otherTitle: 'Posisi Terbuka Lainnya',
    viewAll: 'Lihat semua posisi →',
    viewPosition: 'Lihat Posisi →',
  },
};
