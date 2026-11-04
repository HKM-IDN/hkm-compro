/**
 * HTML templating — pengganti JSX.
 *
 * Pakai tagged template literal `html`. Semua nilai yang di-interpolasi
 * OTOMATIS di-escape, jadi aman dari XSS secara default.
 *
 *   html`<h1>${userInput}</h1>`        → aman, di-escape
 *   html`<div>${raw(trustedHtml)}</div>` → sengaja tidak di-escape
 *
 * Array otomatis di-join (untuk hasil .map()).
 * null / undefined / false jadi string kosong (untuk render kondisional).
 */

const RAW = Symbol('raw-html');

/** Tandai string sebagai HTML mentah — JANGAN di-escape. */
export function raw(value) {
  return { [RAW]: true, value: value == null ? '' : String(value) };
}

/** Escape karakter HTML. */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape untuk dipakai di dalam atribut (sama + backtick). */
export function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function resolve(value) {
  if (value == null || value === false || value === true) return '';
  if (typeof value === 'object' && value[RAW]) return value.value;
  if (Array.isArray(value)) return value.map(resolve).join('');
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += resolve(values[i]) + strings[i + 1];
  }
  return raw(out);
}

/** Ubah hasil html`` jadi string biasa (dipakai saat tulis ke file). */
export function render(node) {
  return resolve(node);
}

/**
 * Gabung class name secara kondisional.
 *   cls('a', cond && 'b', 'c')  → "a c"
 */
export function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Serialisasi objek jadi atribut HTML.
 *   attrs({ href: '/x', 'data-id': 3, hidden: true, skip: null })
 *   → ` href="/x" data-id="3" hidden`
 */
export function attrs(map) {
  const out = [];
  for (const [key, value] of Object.entries(map)) {
    if (value == null || value === false) continue;
    if (value === true) {
      out.push(key);
      continue;
    }
    out.push(`${key}="${escapeAttr(value)}"`);
  }
  return raw(out.length ? ' ' + out.join(' ') : '');
}

/** Embed JSON dengan aman di dalam <script>. */
export function jsonScript(data) {
  return raw(JSON.stringify(data).replace(/</g, '\u003c').replace(/>/g, '\u003e'));
}
