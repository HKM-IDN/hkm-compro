/**
 * shoot-section.mjs — screenshot satu section tertentu.
 * Pakai: node vanilla/scripts/shoot-section.mjs http://localhost:4000/ service-points
 */
import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'screenshots', 'sections');

const [url, sectionId] = process.argv.slice(2);
await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
const el = page.locator('#' + sectionId);
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(3500); // beri waktu peta / gambar termuat
const tag = url.includes('3000') ? 'next' : 'vanilla';
await el.screenshot({ path: path.join(OUT, `${sectionId}__${tag}.png`) });

console.log(`✓ ${sectionId} (${tag})`);
console.log(errors.length ? 'console errors:\n' + errors.join('\n') : 'tidak ada console error');
await browser.close();
