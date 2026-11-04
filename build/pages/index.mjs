/**
 * Registry route — pengganti struktur folder app/ milik Next.js.
 *
 * Tiap entry punya:
 *   name    — label untuk pesan error
 *   path    — path kanonik (EN, tanpa prefix /id). Untuk route statis.
 *   paths   — (opsional) async fn → array { path, ...extra } untuk route
 *             dinamis. Pengganti generateStaticParams().
 *   render  — async fn(ctx) → string HTML lengkap
 *
 * ctx berisi semua data Sanity + { lang, buildYear, gaId } + hasil `paths`.
 *
 * Urutan di array ini = urutan build. Tidak berpengaruh ke hasil.
 */
import * as home from './home.mjs';
import * as about from './about.mjs';
import * as products from './products.mjs';
import * as category from './category.mjs';
import * as product from './product.mjs';
import * as privacyPolicy from './privacy-policy.mjs';
import * as terms from './terms.mjs';

export const ROUTES = [
  home.route,
  about.route,
  products.route,
  category.route,
  product.route,
  privacyPolicy.route,
  terms.route,
];
