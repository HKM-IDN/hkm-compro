/**
 * smoke-check.mjs — audit browser untuk build statis.
 *
 * Memenuhi kolom "Playwright only" di Audit Protocol (CLAUDE.md):
 * console error, h1 yang berbeda per halaman, dan overflow horizontal —
 * tiga hal yang TIDAK bisa dideteksi content-audit.mjs.
 *
 * Pakai:
 *   # layani dist/ dulu di port 4000, lalu:
 *   node vanilla/scripts/smoke-check.mjs
 *   node vanilla/scripts/smoke-check.mjs --base http://localhost:4000 --shots
 */
import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', process.env.DIST_DIR || 'dist');

const args = process.argv.slice(2);
const BASE = (() => {
  const i = args.indexOf('--base');
  return i >= 0 ? args[i + 1] : 'http://localhost:4000';
})();
const SHOTS = args.includes('--shots');
const SHOT_DIR = path.join(__dirname, '..', 'screenshots');

/** Cari semua route dari file HTML yang ada di dist/. */
async function discoverRoutes() {
  const routes = [];
  async function walk(dir, prefix = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        if (e.name === 'assets') continue;
        await walk(path.join(dir, e.name), `${prefix}/${e.name}`);
      } else if (e.name === 'index.html') {
        routes.push(prefix === '' ? '/' : `${prefix}/`);
      }
    }
  }
  await walk(DIST);
  return routes.sort();
}

async function main() {
  const routes = await discoverRoutes();
  if (!routes.length) {
    console.error('✖ Tidak ada index.html di dist/. Jalankan build dulu.');
    process.exit(1);
  }

  console.log(`\n─── Smoke check: ${routes.length} route di ${BASE} ───\n`);
  if (SHOTS) await fs.mkdir(SHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const problems = [];
  const h1ByRoute = new Map();

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });

    for (const route of routes) {
      const consoleErrors = [];
      const onConsole = (m) => {
        if (m.type() === 'error') consoleErrors.push(m.text());
      };
      const onPageError = (e) => consoleErrors.push(`pageerror: ${e.message}`);
      page.on('console', onConsole);
      page.on('pageerror', onPageError);

      const url = BASE + route;
      let status = 0;
      try {
        const resp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        status = resp?.status() ?? 0;

        // Tunggu font web selesai dimuat SEBELUM mengukur tata letak.
        // Sebelum font kustom siap, browser memakai font cadangan yang lebih
        // lebar — lebar teks sementara lebih besar dan memicu laporan
        // overflow palsu. Ini pernah bikin 8 halaman produk dilaporkan
        // bermasalah padahal tidak.
        // Harus async/await di dalam: document.fonts.ready mengembalikan
        // FontFaceSet yang tidak bisa diserialisasi Playwright — kalau
        // dikembalikan langsung, evaluate melempar dan .catch() menelannya,
        // jadi tidak menunggu apa pun.
        await page
          .evaluate(async () => {
            if (document.fonts) await document.fonts.ready;
          })
          .catch(() => {});
        await page.waitForTimeout(150);
      } catch (err) {
        problems.push({ route, viewport: viewport.name, kind: 'navigasi', detail: err.message });
        page.off('console', onConsole);
        page.off('pageerror', onPageError);
        continue;
      }

      if (status !== 200) {
        problems.push({ route, viewport: viewport.name, kind: 'status', detail: `HTTP ${status}` });
      }

      // h1 wajib ada dan tidak kosong
      const h1 =
        (
          await page
            .locator('h1')
            .first()
            .textContent()
            .catch(() => null)
        )?.trim() || '';
      if (!h1) {
        problems.push({ route, viewport: viewport.name, kind: 'h1 kosong', detail: '-' });
      }
      if (viewport.name === 'desktop') h1ByRoute.set(route, h1);

      // Overflow horizontal — penyebab scroll samping / teks terpotong di mobile
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      if (overflow) {
        const culprits = await page.evaluate(() => {
          const w = document.documentElement.clientWidth;

          // Elemen position:fixed (dan anak-anaknya) TIDAK menambah lebar
          // dokumen, jadi tidak pernah jadi penyebab scroll horizontal.
          // Tanpa filter ini, laci nav mobile — yang sengaja digeser ke luar
          // layar pakai translate-x-full — selalu muncul sebagai tersangka palsu.
          function inFixed(el) {
            for (let n = el; n; n = n.parentElement) {
              if (getComputedStyle(n).position === 'fixed') return true;
            }
            return false;
          }

          return [...document.querySelectorAll('body *')]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.right > w + 1 && !inFixed(el);
            })
            .slice(0, 3)
            .map((el) => {
              const r = el.getBoundingClientRect();
              const cls = typeof el.className === 'string' ? el.className.split(' ')[0] : '';
              return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} (kanan ${Math.round(r.right)}px)`;
            });
        });
        problems.push({
          route,
          viewport: viewport.name,
          kind: 'overflow-x',
          detail: culprits.join(' | ') || 'tidak terdeteksi',
        });
      }

      if (consoleErrors.length) {
        problems.push({
          route,
          viewport: viewport.name,
          kind: 'console error',
          detail: consoleErrors.slice(0, 3).join(' | '),
        });
      }

      if (SHOTS && viewport.name === 'desktop') {
        const name = (route === '/' ? '_root' : route.replace(/\//g, '_')).replace(/^_|_$/g, '');
        await page.screenshot({ path: path.join(SHOT_DIR, `${name || 'root'}.png`) });
      }

      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    }

    await page.close();
  }

  await browser.close();

  // Deteksi h1 duplikat antar halaman produk — bug "semua produk tampil HKM127+"
  const productRoutes = [...h1ByRoute.entries()].filter(([r]) =>
    /^\/products\/[^/]+\/[^/]+\/$/.test(r)
  );
  const byH1 = new Map();
  for (const [route, h1] of productRoutes) {
    if (!byH1.has(h1)) byH1.set(h1, []);
    byH1.get(h1).push(route);
  }
  for (const [h1, rs] of byH1) {
    if (rs.length > 1) {
      problems.push({
        route: rs.join(', '),
        viewport: 'desktop',
        kind: 'h1 duplikat',
        detail: `${rs.length} halaman produk sama-sama menampilkan "${h1}"`,
      });
    }
  }

  if (!problems.length) {
    console.log(`✓ ${routes.length} route bersih — tidak ada error, overflow, atau h1 kosong.\n`);
    return;
  }

  console.error(`✖ ${problems.length} masalah:\n`);
  for (const p of problems) {
    console.error(`  [${p.kind}] ${p.route} (${p.viewport})`);
    console.error(`      ${p.detail}`);
  }
  console.error('');
  process.exit(1);
}

main().catch((err) => {
  console.error('✖ Smoke check gagal:', err.message);
  process.exit(1);
});
