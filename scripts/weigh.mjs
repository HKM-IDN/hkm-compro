/**
 * weigh.mjs — ukur total byte yang benar-benar diunduh browser untuk satu halaman.
 * Pakai: node vanilla/scripts/weigh.mjs http://localhost:3000/ http://localhost:4000/
 */
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const url of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const byType = {};
  let total = 0,
    count = 0;
  p.on('response', async (res) => {
    try {
      const h = res.headers();
      const len =
        Number(h['content-length'] || 0) || (await res.body().catch(() => Buffer.alloc(0))).length;
      const t = (h['content-type'] || '').split(';')[0] || 'other';
      const key = t.includes('javascript')
        ? 'JS'
        : t.includes('css')
          ? 'CSS'
          : t.includes('html')
            ? 'HTML'
            : t.startsWith('image')
              ? 'Gambar'
              : t.includes('font')
                ? 'Font'
                : 'Lainnya';
      byType[key] = (byType[key] || 0) + len;
      total += len;
      count++;
    } catch {}
  });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1500);
  const label = url.includes('4000') ? 'VANILLA' : 'NEXT.JS';
  console.log(`\n  ${label}  (${url})`);
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${k.padEnd(8)} ${(v / 1024).toFixed(1).padStart(8)} KB`);
  }
  console.log(
    `    ${'TOTAL'.padEnd(8)} ${(total / 1024).toFixed(1).padStart(8)} KB  (${count} request)`
  );
  await p.close();
}
await b.close();
