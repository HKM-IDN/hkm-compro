/**
 * build.mjs — generator situs statis HKM.
 *
 * Pengganti `next build`. Alurnya:
 *   1. Ambil semua data dari Sanity (sekali, di-share ke semua halaman)
 *   2. Render tiap route jadi string HTML, untuk EN dan ID
 *   3. Tulis ke dist/<path>/index.html
 *   4. Compile CSS lewat Tailwind CLI
 *   5. Copy public/ + src/js ke dist/
 *   6. Tulis sitemap.xml + robots.txt
 *
 * Jalankan: node vanilla/build/build.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

import {
  fetchGroq,
  GA_MEASUREMENT_ID,
  GOOGLE_MAPS_API_KEY,
  FORMSPREE_CONTACT_ENDPOINT,
} from './sanity.mjs';
import { LANGS, outputPath } from './routes.mjs';
import { SITE_URL } from './lib/seo.mjs';
import * as queries from './lib/queries.mjs';
import { ROUTES } from './pages/index.mjs';
import * as notFound from './pages/not-found.mjs';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..'); // akar project hkm-compro-vanila
// DIST_DIR=dist-xxx → build ke folder lain (berguna kalau beberapa build jalan bersamaan)
const DIST = path.resolve(ROOT, process.env.DIST_DIR || 'dist');

// Waktu build dihitung SEKALI di sini lalu dialirkan ke semua template.
// Aturan CLAUDE.md: jangan panggil Date.now() di dalam render.
const BUILD_TIME = Date.now();
const BUILD_YEAR = new Date(BUILD_TIME).getFullYear();
const GA_ID = GA_MEASUREMENT_ID;
const MAPS_API_KEY = GOOGLE_MAPS_API_KEY;
const FORMSPREE_URL = FORMSPREE_CONTACT_ENDPOINT;

// ── Util ────────────────────────────────────────────────────────────────────

const t0 = Date.now();
function log(msg) {
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[${secs.padStart(5)}s] ${msg}`);
}

async function writeFile(relPath, contents) {
  const full = path.join(DIST, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, contents, 'utf8');
}

async function copyDir(from, to) {
  await fs.cp(from, to, { recursive: true, force: true });
}

// ── 1. Ambil data ───────────────────────────────────────────────────────────

async function fetchAll() {
  log('Mengambil data dari Sanity…');

  // Semua query dijalankan paralel — jauh lebih cepat daripada satu-satu.
  const [settings, homepage, about, productsPage, servicePoints, newsPage, jobs, productSlugs] =
    await Promise.all([
      fetchGroq(queries.SITE_SETTINGS_QUERY, {}, 'siteSettings'),
      fetchGroq(queries.HOMEPAGE_QUERY, {}, 'homepage'),
      fetchGroq(queries.ABOUT_PAGE_QUERY, {}, 'aboutPage'),
      fetchGroq(queries.PRODUCTS_PAGE_QUERY, {}, 'productsPage'),
      fetchGroq(queries.SERVICE_POINTS_QUERY, {}, 'servicePoint'),
      fetchGroq(queries.NEWS_LISTING_QUERY, {}, 'newsListing'),
      fetchGroq(queries.CAREERS_LISTING_QUERY, {}, 'jobPosting'),
      fetchGroq(queries.PRODUCTS_SLUGS_QUERY, {}, 'productSlugs'),
    ]);

  const data = {
    settings,
    homepage,
    about,
    categories: productsPage?.categories || [],
    products: productsPage?.products || [],
    servicePoints: servicePoints || [],
    news: newsPage?.articles || [],
    newsFeatured: newsPage?.featured || null,
    jobs: jobs || [],
    productSlugs: productSlugs || [],
  };

  log(
    `Data siap — ${data.categories.length} kategori, ${data.products.length} produk, ` +
      `${data.servicePoints.length} service point, ${data.news.length} berita, ` +
      `${data.jobs.length} lowongan`
  );

  if (!settings) {
    console.warn('  ⚠ siteSettings kosong — nav & footer akan tampil minimal.');
  }

  return data;
}

// ── 2–3. Render + tulis semua halaman ───────────────────────────────────────

async function buildPages(data) {
  log('Render halaman…');

  const ctx = {
    ...data,
    buildYear: BUILD_YEAR,
    buildTime: BUILD_TIME,
    gaId: GA_ID,
    mapsApiKey: MAPS_API_KEY,
    formspreeUrl: FORMSPREE_URL,
  };
  const written = [];
  const errors = [];

  for (const route of ROUTES) {
    // Satu route bisa menghasilkan banyak halaman (mis. 46 produk).
    let instances;
    try {
      instances = route.paths ? await route.paths(ctx) : [{ path: route.path }];
    } catch (err) {
      errors.push({ route: route.name, stage: 'paths', message: err.message });
      continue;
    }

    for (const instance of instances) {
      for (const lang of LANGS) {
        try {
          const htmlOut = await route.render({ ...ctx, ...instance, lang });
          if (!htmlOut) continue;
          const out = outputPath(instance.path, lang);
          await writeFile(out, htmlOut);
          written.push(out);
        } catch (err) {
          errors.push({
            route: route.name,
            stage: 'render',
            path: `${instance.path} [${lang}]`,
            message: err.message,
          });
        }
      }
    }
  }

  // Halaman 404 — bukan route biasa, ditulis ke 404.html (EN) + id/404.html (ID).
  // Nginx / scripts/serve.mjs menyajikannya untuk URL yang tidak ada.
  for (const lang of LANGS) {
    try {
      const htmlOut = await notFound.render({ ...ctx, lang });
      if (!htmlOut) continue;
      const out = notFound.OUTPUT[lang];
      await writeFile(out, htmlOut);
      written.push(out);
    } catch (err) {
      errors.push({ route: 'not-found', stage: 'render', path: `[${lang}]`, message: err.message });
    }
  }

  log(`${written.length} file HTML ditulis`);

  if (errors.length) {
    console.error(`\n  ✖ ${errors.length} halaman GAGAL:`);
    for (const e of errors.slice(0, 20)) {
      console.error(`    - ${e.route} ${e.path || ''} (${e.stage}): ${e.message}`);
    }
    if (errors.length > 20) console.error(`    … dan ${errors.length - 20} lagi`);
  }

  return { written, errors };
}

// ── 4. CSS ──────────────────────────────────────────────────────────────────

async function buildCss() {
  log('Compile Tailwind…');

  const input = path.join(ROOT, 'src', 'css', 'main.css');
  const output = path.join(DIST, 'assets', 'main.css');
  await fs.mkdir(path.dirname(output), { recursive: true });

  // Tailwind memindai dist/ untuk cari class yang benar-benar dipakai.
  // Jadi CSS harus di-compile SETELAH HTML ditulis.
  //
  // Dipanggil langsung lewat `node <entry>`, bukan `npx`: di Windows,
  // Node menolak spawn file .cmd tanpa shell (spawn EINVAL), dan memakai
  // shell:true bikin argumen harus di-quote manual. Cara ini jalan sama
  // di Windows, macOS, dan Linux.
  const cliEntry = path.join(ROOT, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');

  await execFileAsync(process.execPath, [cliEntry, '-i', input, '-o', output, '--minify'], {
    cwd: ROOT,
  });

  const { size } = await fs.stat(output);
  log(`CSS: ${(size / 1024).toFixed(1)} KB`);
}

// ── 5. Aset statis ──────────────────────────────────────────────────────────

async function copyAssets() {
  log('Copy aset statis…');

  // public/ → dist/ (logo, favicon, og image, dll)
  const publicDir = path.join(ROOT, 'public');
  try {
    await copyDir(publicDir, DIST);
  } catch (err) {
    console.warn(`  ⚠ gagal copy public/: ${err.message}`);
  }

  // src/js → dist/assets/js
  await copyDir(path.join(ROOT, 'src', 'js'), path.join(DIST, 'assets', 'js'));
}

// ── 6. sitemap.xml + robots.txt ─────────────────────────────────────────────

async function buildSitemap(writtenPaths) {
  log('Tulis sitemap.xml + robots.txt…');

  const urls = writtenPaths
    .map((p) => '/' + p.replace(/index\.html$/, '').replace(/\/$/, ''))
    .map((u) => (u === '/' ? '/' : u))
    // Halaman legal di-noindex, jangan masukkan sitemap
    .filter((u) => !/privacy-policy|terms|404/.test(u))
    .sort();

  const unique = [...new Set(urls)];
  const today = new Date().toISOString().slice(0, 10);

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    unique
      .map(
        (u) =>
          `  <url>\n    <loc>${SITE_URL}${u}</loc>\n` +
          `    <lastmod>${today}</lastmod>\n` +
          `    <changefreq>weekly</changefreq>\n  </url>`
      )
      .join('\n') +
    '\n</urlset>\n';

  await writeFile('sitemap.xml', xml);

  await writeFile(
    'robots.txt',
    ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n')
  );

  log(`sitemap: ${unique.length} URL`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n─── Build situs statis HKM ───\n');

  // Kosongkan ISI dist/, bukan hapus foldernya. Di Windows, folder yang
  // sedang jadi cwd sebuah proses (mis. server statis untuk preview) tidak
  // bisa di-rmdir — hasilnya EBUSY dan build gagal tanpa alasan jelas.
  await fs.mkdir(DIST, { recursive: true });
  for (const entry of await fs.readdir(DIST)) {
    await fs.rm(path.join(DIST, entry), { recursive: true, force: true });
  }

  const data = await fetchAll();
  const { written, errors } = await buildPages(data);
  await copyAssets();
  await buildCss(); // setelah HTML ada, supaya Tailwind lihat class yang dipakai
  await buildSitemap(written);

  console.log(`\n─── Selesai: ${written.length} halaman → ${path.relative(ROOT, DIST)} ───`);

  if (errors.length) {
    console.error(`\n✖ Build selesai dengan ${errors.length} error.\n`);
    process.exit(1);
  }
  console.log('');
}

main().catch((err) => {
  console.error('\n✖ Build gagal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
