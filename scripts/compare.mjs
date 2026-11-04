/**
 * compare.mjs — screenshot halaman yang sama dari versi Next.js (port 3000)
 * dan versi vanilla (port 4000), untuk dibandingkan berdampingan.
 *
 * Pakai: node vanilla/scripts/compare.mjs /privacy-policy/
 */
import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'screenshots', 'compare');

const routes = process.argv.slice(2);
if (!routes.length) {
  console.error('Pakai: node vanilla/scripts/compare.mjs /privacy-policy/ [...route lain]');
  process.exit(1);
}

await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

for (const route of routes) {
  const name = route.replace(/\//g, '_').replace(/^_|_$/g, '') || 'root';
  for (const [label, base] of [
    ['next', process.env.NEXT_BASE || 'http://localhost:3000'],
    ['vanilla', process.env.VANILLA_BASE || 'http://localhost:4000'],
  ]) {
    try {
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 30000 });
      // tunggu animasi fade-in selesai (0.28s) supaya warna terbaca akurat
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(OUT, `${name}__${label}.png`) });
      console.log(`✓ ${label.padEnd(8)} ${route}`);
    } catch (err) {
      console.log(`✖ ${label.padEnd(8)} ${route} — ${err.message.split('\n')[0]}`);
    }
  }
}
await browser.close();
console.log(`\nHasil di: vanilla/screenshots/compare/`);
