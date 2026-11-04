/**
 * Sanity client untuk build-time fetch.
 * Pakai @sanity/client langsung (tanpa next-sanity).
 */
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env.local') });

/**
 * Baca variabel environment.
 *
 * Project ini tidak lagi memakai Next.js, jadi awalan NEXT_PUBLIC_ sudah
 * tidak punya arti. Tapi .env.local yang ada sekarang masih memakai nama
 * lama, jadi keduanya didukung: nama baru dipakai lebih dulu, nama lama
 * jadi cadangan. Jadi file .env.local lama bisa langsung dipakai, dan
 * nanti bisa dirapikan tanpa mengubah kode.
 */
function env(name, fallback = undefined) {
  return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`] ?? fallback;
}

export const SANITY_PROJECT_ID = env('SANITY_PROJECT_ID');
export const SANITY_DATASET = env('SANITY_DATASET', 'production');
export const SANITY_API_VERSION = env('SANITY_API_VERSION', '2024-01-01');
export const SITE_URL = env('SITE_URL', 'https://hkm.co.id');

export const GA_MEASUREMENT_ID = env('GA_MEASUREMENT_ID', null);
export const GOOGLE_MAPS_API_KEY = env('GOOGLE_MAPS_API_KEY', null);
export const FORMSPREE_CONTACT_ENDPOINT = env('FORMSPREE_CONTACT_ENDPOINT', null);

if (!SANITY_PROJECT_ID) {
  throw new Error(
    [
      'SANITY_PROJECT_ID belum di-set.',
      `Buat file .env.local di ${ROOT}`,
      'Contoh isinya ada di .env.example.',
    ].join('\n')
  );
}

export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: false, // build-time: selalu ambil data paling segar
});

export const builder = createImageUrlBuilder(client);

/** urlFor(image).width(800).url() */
export function urlFor(source) {
  return builder.image(source);
}

/**
 * Cache fetch per proses build.
 *
 * Halaman dinamis dirender dua kali (EN + ID) dari data Sanity yang sama,
 * karena terjemahan ada di dalam dokumen. Tanpa cache, tiap produk dan
 * kategori ditarik dua kali — 100+ request yang tidak perlu.
 *
 * Dibuang sendirinya saat proses build selesai.
 */
const cache = new Map();

/** Fetch GROQ (di-cache). Kalau gagal, lempar error dengan konteks yang jelas. */
export async function fetchGroq(query, params = {}, label = 'query') {
  const key = query + '::' + JSON.stringify(params);
  if (cache.has(key)) return cache.get(key);

  // Simpan promise-nya, bukan hasilnya: kalau dua halaman meminta data yang
  // sama secara bersamaan, keduanya menunggu request yang sama.
  const pending = client.fetch(query, params).catch((err) => {
    cache.delete(key); // biar percobaan berikutnya tidak ikut gagal
    throw new Error(`Sanity fetch gagal (${label}): ${err.message}`);
  });

  cache.set(key, pending);
  return pending;
}
