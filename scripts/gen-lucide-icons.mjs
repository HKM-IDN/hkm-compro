/**
 * gen-lucide-icons.mjs — sekali jalan: ubah ikon lucide-react jadi SVG statis.
 *
 * Kenapa digenerate, bukan disalin manual:
 *   38 ikon dipakai di seluruh project. Menyalin path SVG satu per satu
 *   rawan salah ketik dan tidak bisa diverifikasi. Skrip ini membaca
 *   definisi asli dari paket lucide-react, jadi hasilnya dijamin identik.
 *
 * Setelah file hasilnya ada, build vanilla TIDAK lagi butuh lucide-react.
 *
 * Jalankan ulang hanya kalau ada ikon baru:
 *   node vanilla/scripts/gen-lucide-icons.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'build', 'partials', 'lucide.mjs');

// Semua ikon yang dipakai di project (hasil pemindaian import lucide-react).
const ICONS = [
  'ArrowUp',
  'Battery',
  'Box',
  'Briefcase',
  'Cable',
  'Check',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'Cloud',
  'Cpu',
  'CreditCard',
  'FileQuestion',
  'Globe',
  'Handshake',
  'HardDrive',
  'Home',
  'Layers',
  'LifeBuoy',
  'Lock',
  'Mail',
  'MapPinOff',
  'MessageCircle',
  'Monitor',
  'Newspaper',
  'Package',
  'PackageX',
  'Phone',
  'ShieldCheck',
  'Signal',
  'Smartphone',
  'Star',
  'Store',
  'Tv',
  'Wifi',
  'X',
  'Zap',
  'ZoomIn',
];

/** PascalCase → kebab-case (nama file di paket lucide). */
function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** [tag, attrs] → string elemen SVG. */
function nodeToSvg([tag, attrs]) {
  const parts = Object.entries(attrs)
    .filter(([k]) => k !== 'key') // `key` hanya dipakai React
    .map(([k, v]) => `${k}="${v}"`);
  return `<${tag} ${parts.join(' ')} />`;
}

const ICON_DIR = path.join(ROOT, 'node_modules', 'lucide-react', 'dist', 'esm', 'icons');

/**
 * Ambil __iconNode untuk satu nama file ikon.
 *
 * Sebagian nama lama (home, file-question) sekarang hanya file alias yang
 * meneruskan `export { default } from './house.mjs'` — tanpa __iconNode.
 * Kalau ketemu begitu, ikuti alias-nya (maks 3 lompatan, cukup untuk
 * rantai alias apa pun di lucide dan aman dari loop).
 */
async function loadIconNode(slug, depth = 0) {
  if (depth > 3) return null;

  const file = path.join(ICON_DIR, `${slug}.mjs`);
  const mod = await import('file://' + file.replace(/\\/g, '/'));
  if (mod.__iconNode) return mod.__iconNode;

  const src = await fs.readFile(file, 'utf8');
  const alias = src.match(/export\s*\{\s*default\s*\}\s*from\s*'\.\/([\w-]+)\.mjs'/);
  if (!alias) return null;

  return loadIconNode(alias[1], depth + 1);
}

const entries = [];
const missing = [];

for (const name of ICONS) {
  try {
    const node = await loadIconNode(toKebab(name));
    if (!node) {
      missing.push(name);
      continue;
    }
    entries.push({ name, body: node.map(nodeToSvg).join('\n    ') });
  } catch {
    missing.push(name);
  }
}

if (missing.length) {
  console.error('✖ Ikon tidak ditemukan di lucide-react:', missing.join(', '));
  process.exit(1);
}

const header = `/**
 * lucide.mjs — ikon lucide sebagai SVG statis.
 *
 * DIGENERATE OTOMATIS oleh vanilla/scripts/gen-lucide-icons.mjs
 * dari paket lucide-react v${JSON.parse(await fs.readFile(path.join(ROOT, 'node_modules/lucide-react/package.json'), 'utf8')).version}.
 * Jangan diedit manual — jalankan ulang skripnya kalau butuh ikon baru.
 *
 * Lisensi lucide: ISC.
 *
 * Pakai:
 *   import { icon } from '../partials/lucide.mjs';
 *   icon('Wifi', { size: 22, strokeWidth: 1.5 })
 */
import { html, raw } from '../html.mjs';

const PATHS = {
`;

const body = entries.map((e) => `  ${e.name}: \`\n    ${e.body}\n  \`,`).join('\n');

const footer = `
};

/**
 * Render satu ikon.
 * @param {string} name       nama ikon (mis. 'Wifi'); tidak dikenal → tidak merender apa pun
 * @param {object} opts
 * @param {number} opts.size
 * @param {number} opts.strokeWidth
 * @param {string} opts.className
 * @param {string} opts.style
 */
export function icon(name, { size = 24, strokeWidth = 2, className = '', style = '' } = {}) {
  const body = PATHS[name];
  if (!body) return raw('');

  return html\`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="\${size}"
    height="\${size}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="\${strokeWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="\${className}"
    style="\${style}"
    aria-hidden="true"
  >\${raw(body)}</svg>\`;
}

/** Daftar nama ikon yang tersedia. */
export const ICON_NAMES = Object.keys(PATHS);
`;

await fs.writeFile(OUT, header + body + footer, 'utf8');
console.log(`✓ ${entries.length} ikon ditulis ke ${path.relative(ROOT, OUT)}`);
