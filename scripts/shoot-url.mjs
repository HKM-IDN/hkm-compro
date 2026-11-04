import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'screenshots', 'sections');
const [url, name, selector] = process.argv.slice(2);
await fs.mkdir(OUT, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
if (selector) {
  const el = p.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1200);
  await el.screenshot({ path: path.join(OUT, name + '.png') });
} else {
  await p.screenshot({ path: path.join(OUT, name + '.png') });
}
console.log('✓ ' + name);
await b.close();
