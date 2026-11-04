/**
 * Routing helper — pengganti next/link + next/navigation.
 *
 * Skema URL:
 *   EN (default) → /products/ip-camera/ezviz-c6n
 *   ID           → /id/products/ip-camera/ezviz-c6n
 *
 * Di versi Next lama, bahasa disimpan di localStorage dan teks ditukar
 * di client. Di versi vanilla kita generate dua set halaman. Konsekuensinya:
 * Google bisa meng-index kedua bahasa (dulu tidak bisa).
 */

export const LANGS = ['en', 'id'];
export const DEFAULT_LANG = 'en';

/** Buang prefix /id dari sebuah path → path kanonik (EN). */
export function stripLang(path) {
  if (!path) return '/';
  const out = path.replace(/^\/id(?=\/|$)/, '');
  return out === '' ? '/' : out;
}

/** Tambahkan prefix bahasa ke path. EN tidak pakai prefix. */
export function langPath(path, lang = DEFAULT_LANG) {
  // Link eksternal / anchor / mailto / tel dibiarkan apa adanya.
  if (!path || !path.startsWith('/')) return path || '#';

  const clean = stripLang(path);
  if (lang === DEFAULT_LANG) return clean;
  return clean === '/' ? '/id/' : `/id${clean}`;
}

/** Bahasa yang satunya. */
export function otherLang(lang) {
  return lang === 'id' ? 'en' : 'id';
}

/** Path file output untuk sebuah route. '/products' → 'products/index.html' */
export function outputPath(path, lang = DEFAULT_LANG) {
  const full = langPath(path, lang);
  const clean = full.replace(/^\/+|\/+$/g, '');
  return clean === '' ? 'index.html' : `${clean}/index.html`;
}

/** URL route produk. */
export function productUrl(categorySlug, slug) {
  return `/products/${categorySlug}/${slug}`;
}

/** URL route kategori. */
export function categoryUrl(slug) {
  return `/products/${slug}`;
}

export function newsUrl(slug) {
  return `/news/${slug}`;
}

export function careerUrl(slug) {
  return `/careers/${slug}`;
}

/** Ambil nilai slug dari field Sanity (bisa string atau {current}). */
export function slugOf(slug) {
  if (!slug) return null;
  return typeof slug === 'string' ? slug : slug.current || null;
}
