# HKM — Build Vanilla JS

Versi situs HKM tanpa Next.js dan tanpa React. Node dipakai hanya saat **build**
untuk menghasilkan file HTML statis; browser pengunjung hanya menerima
HTML + CSS + JavaScript biasa.

---

## Kenapa HTML digenerate saat build, bukan di-fetch di browser

Ini keputusan paling penting di arsitektur ini.

Kalau data Sanity diambil lewat `fetch()` di browser, Google melihat halaman
kosong — teks produk, berita, dan service point tidak ikut terindeks. Untuk
situs korporat yang tujuannya ditemukan di pencarian, itu merusak fungsi
utamanya.

Jadi: Node membaca Sanity saat build, lalu **menulis teksnya langsung ke dalam
file HTML**. Hasilnya tetap "vanilla" dari sisi pengunjung — tidak ada
framework yang dimuat — tapi isi halaman tetap terbaca mesin pencari.

---

## Cara pakai

```bash
# 1. Build semua halaman jadi HTML statis
npm run build:vanilla

# 2. Lihat hasilnya di browser
npm run serve:vanilla        # http://localhost:4000

# 3. Cek tidak ada error (butuh server di atas tetap jalan, terminal lain)
npm run check:vanilla
```

Build membaca `.env.local` di root project secara otomatis — tidak perlu
menulis token di depan perintah.

---

## Struktur folder

```
vanilla/
├── build/
│   ├── build.mjs           Orkestrator: ambil data → render → tulis file
│   ├── html.mjs            Templating (pengganti JSX), auto-escape anti-XSS
│   ├── layout.mjs          Shell halaman (pengganti app/layout.js)
│   ├── meta.mjs            Metadata → tag <head> (pengganti metadata API Next)
│   ├── routes.mjs          Helper URL + bahasa (pengganti next/link)
│   ├── image.mjs           srcset responsif (pengganti next/image)
│   ├── sanity.mjs          Client Sanity + cache build
│   ├── pages/              Satu modul per route (pengganti folder app/)
│   ├── partials/           Komponen bersama: nav, footer, kartu produk, ikon
│   ├── content/            Teks yang diekstrak dari komponen React lama
│   └── lib/                Disalin apa adanya dari lib/ project utama
├── src/
│   ├── css/main.css        Sumber Tailwind (salinan app/globals.css)
│   └── js/                 JavaScript biasa, tanpa dependency
├── scripts/
│   ├── serve.mjs           Server statis untuk preview lokal
│   ├── smoke-check.mjs     Audit browser (console error, overflow, h1)
│   └── compare.mjs         Screenshot Next vs vanilla berdampingan
└── dist/                   HASIL BUILD — tidak di-commit
```

---

## Yang diganti dari Next.js

| Fitur Next.js          | Penggantinya di sini                                 |
| ---------------------- | ---------------------------------------------------- |
| JSX                    | `html` tagged template di `build/html.mjs`           |
| `app/` folder routing  | Registry di `build/pages/index.mjs`                  |
| `generateStaticParams` | Fungsi `paths()` di tiap modul route                 |
| `next/image`           | `build/image.mjs` — srcset + lazy load manual        |
| `next/link`            | `<a>` biasa + helper `langPath()`                    |
| `metadata` export      | `build/meta.mjs` → tag `<head>`                      |
| Server Component fetch | Fetch sekali di `build.mjs`, dialirkan ke template   |
| `useState` (filter)    | JS biasa yang menyembunyikan elemen (`src/js/`)      |
| LangContext + provider | Bahasa jadi argumen saat build                       |
| `sonner` (toast)       | Belum dipakai — akan dibuat vanilla saat form dibuat |
| Nonce CSP (`proxy.js`) | CSP di-set Nginx (statis tidak punya server request) |

---

## Bahasa: EN dan ID

Versi lama menyimpan bahasa di `localStorage` dan menukar teks di browser.
Akibatnya hanya ada satu URL, dan Google cuma bisa mengindeks satu bahasa.

Di sini tiap bahasa punya URL sendiri:

```
/products            → Inggris
/id/products         → Indonesia
```

Keduanya dihasilkan saat build dan saling menunjuk lewat tag `hreflang`.
Tombol bahasa di nav sekarang link biasa, bukan tombol JavaScript.

---

## Catatan untuk deploy (Phase 5)

Isi `vanilla/dist/` tinggal disalin ke VPS. Node **tidak perlu** jalan di
server — Nginx melayani file langsung. Itu sebabnya konsumsi RAM di t2.micro
mendekati nol dibanding menjalankan server Next.js.

---

## Perbaikan yang ikut terbawa

Beberapa bug versi lama hilang saat porting:

1. **Heading halaman legal tidak pernah tampil.** Selector `[&>h2]` menyasar
   anak langsung, padahal strukturnya `div > div > h2`. Diperbaiki jadi
   `[&>div>h2]`.
2. **16px konten tertutup nav.** `<main>` memakai `pt-[64px]` padahal nav
   setinggi 80px. Sekarang 80px.
3. **Katalog produk tidak terbaca crawler.** Filter React hanya me-render
   kategori yang aktif. Sekarang semua kategori ada di HTML.
4. **Link marketplace butuh JS.** Dulu `<button>` bersarang di dalam `<a>`
   (HTML tidak valid) dan perlu `stopPropagation`. Sekarang `<a>` asli
   dengan pola _stretched link_.
