/**
 * serve.mjs — server statis sederhana untuk melihat hasil build.
 *
 * Ini HANYA untuk preview lokal. Di VPS, Nginx yang melayani dist/
 * (lihat vanilla/nginx.conf.example).
 *
 * Pakai: npm run serve:vanilla      → http://localhost:4000
 *        npm run serve:vanilla 5000 → ganti port
 */
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', process.env.DIST_DIR || 'dist');
const PORT = Number(process.argv[2]) || 4000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

async function resolveFile(urlPath) {
  // Cegah path traversal: normalisasi dulu, lalu pastikan masih di dalam DIST.
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = path.join(DIST, path.normalize(decoded));
  if (!target.startsWith(DIST)) return null;

  try {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
      const index = path.join(target, 'index.html');
      await fs.stat(index);
      return index;
    }
    return target;
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  let file = await resolveFile(req.url || '/');

  if (!file) {
    // Tiru perilaku Nginx: jatuh ke 404.html kalau ada
    const notFound = path.join(DIST, '404.html');
    try {
      await fs.stat(notFound);
      const body = await fs.readFile(notFound);
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end(body);
      return;
    } catch {
      res.writeHead(404, { 'Content-Type': TYPES['.txt'] });
      res.end('404 Not Found');
      return;
    }
  }

  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const body = await fs.readFile(file);
  res.writeHead(200, {
    'Content-Type': type,
    // Aset ber-hash boleh di-cache lama; HTML jangan.
    'Cache-Control': file.endsWith('.html') ? 'no-cache' : 'public, max-age=3600',
  });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`\nMelayani vanilla/dist di http://localhost:${PORT}\n`);
  console.log('  Ctrl+C untuk berhenti.\n');
});
