/**
 * Visual port Mobile WiFi — port dari
 * components/products/detail/connectivity/MifiPortsVisual.js
 *
 * Ilustrasi perangkat MiFi: layar dengan indikator sinyal + deretan port
 * di bawahnya, diapit kartu spesifikasi.
 *
 * Perbedaan dari versi React:
 *  - Versi React me-render DeviceBody DUA KALI (sekali untuk desktop
 *    dengan dw=400, sekali untuk mobile dengan dw=260), jadi ilustrasi
 *    yang sama ada dua kali di DOM. Di sini tetap dua, karena ukuran
 *    perangkat (dw) dipakai menghitung setiap dimensi anak lewat s(),
 *    jadi tidak bisa disatukan tanpa mengubah geometrinya. Yang kedua
 *    diberi aria-hidden — sama seperti aslinya.
 *  - Semua perhitungan s() identik supaya proporsinya persis sama.
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';

/** Skala proporsional: semua ukuran anak dihitung dari lebar perangkat. */
const scaler = (dw) => (n) => Math.round((n * dw) / 176);

function signalBars(s) {
  const heights = [4, 6, 9, 12, 15];
  return html`<div style="display:flex;align-items:flex-end;gap:${s(2)}px">
    ${heights.map(
      (h, i) =>
        html`<div
          style="width:${s(4)}px;height:${s(h)}px;border-radius:${s(1)}px;background:${i < 3
            ? '#00B8D9'
            : 'rgba(255,255,255,0.12)'};opacity:${i < 3 ? 0.5 + i * 0.2 : 1}"
        ></div>`
    )}
  </div>`;
}

function wifiArcs(s) {
  return html`<svg
    width="${s(22)}"
    height="${s(17)}"
    viewBox="0 0 22 17"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="11" cy="15" r="2" fill="rgba(0,184,217,0.9)" />
    <path
      d="M5.5 9.5C7.2 7.8 9 7 11 7C13 7 14.8 7.8 16.5 9.5"
      stroke="rgba(0,184,217,0.65)"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M2 6C4.6 3.4 7.6 2 11 2C14.4 2 17.4 3.4 20 6"
      stroke="rgba(0,184,217,0.28)"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>`;
}

/** Bentuk lubang port berbeda menurut jenisnya (SIM memanjang, USB lebih bulat). */
function portShape(shortLabel, s) {
  const l = (shortLabel || '').toUpperCase();
  if (l.includes('SIM')) return { w: s(26), h: s(7), rx: s(1) };
  if (l.includes('USB')) return { w: s(13), h: s(7), rx: s(3) };
  return { w: s(18), h: s(7), rx: s(2) };
}

/** Bodi perangkat — menyesuaikan proporsional ke lebar dw berapa pun. */
function deviceBody({ ports, dw }) {
  const s = scaler(dw);

  return html`<div
    style="width:${dw}px;background:linear-gradient(170deg,#1e2028 0%,#0d0f18 100%);border:1px solid rgba(255,255,255,0.09);border-radius:${s(
      22
    )}px;box-shadow:0 ${s(12)}px ${s(
      48
    )}px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;user-select:none;flex-shrink:0;position:relative;z-index:1"
  >
    <!-- Rel tombol daya di atas -->
    <div
      style="height:${s(4)}px;margin:0 ${s(
        32
      )}px;background:linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);border-radius:0 0 ${s(
        3
      )}px ${s(3)}px"
    ></div>

    <!-- Deret LED + merek -->
    <div
      style="display:flex;align-items:center;justify-content:space-between;padding:${s(14)}px ${s(
        18
      )}px 0"
    >
      <div style="display:flex;gap:${s(5)}px;align-items:center">
        <div
          style="width:${s(7)}px;height:${s(
            7
          )}px;border-radius:50%;background:#00B8D9;box-shadow:0 0 ${s(
            6
          )}px rgba(0,184,217,0.85), 0 0 ${s(12)}px rgba(0,184,217,0.35)"
        ></div>
        <div
          style="width:${s(7)}px;height:${s(7)}px;border-radius:50%;background:#00B8D9;opacity:0.32"
        ></div>
        <div
          style="width:${s(7)}px;height:${s(
            7
          )}px;border-radius:50%;background:rgba(255,255,255,0.10)"
        ></div>
      </div>
      <span
        style="font-family:'JetBrains Mono','Courier New',monospace;font-size:${s(
          8
        )}px;letter-spacing:0.28em;color:rgba(255,255,255,0.16)"
        >HKM</span
      >
    </div>

    <!-- Layar -->
    <div
      style="margin:${s(12)}px ${s(16)}px;height:${s(120)}px;background:#06070e;border-radius:${s(
        10
      )}px;border:1px solid rgba(255,255,255,0.05);box-shadow:inset 0 ${s(2)}px ${s(
        8
      )}px rgba(0,0,0,0.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${s(
        7
      )}px;position:relative;overflow:hidden"
    >
      <div
        style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 30%, rgba(0,184,217,0.06), transparent 70%);pointer-events:none"
      ></div>
      <div
        style="position:absolute;top:${s(7)}px;right:${s(8)}px;width:${s(4)}px;height:${s(
          4
        )}px;border-radius:50%;background:rgba(0,184,217,0.5)"
      ></div>

      ${wifiArcs(s)} ${signalBars(s)}

      <div
        style="font-family:'JetBrains Mono','Courier New',monospace;font-size:${s(
          8
        )}px;color:rgba(0,184,217,0.50);letter-spacing:0.07em;margin-top:${s(1)}px"
      >
        4G LTE
      </div>
    </div>

    <!-- Area port -->
    <div
      style="border-top:1px solid rgba(255,255,255,0.05);padding:${s(12)}px 0 ${s(
        16
      )}px;display:flex;justify-content:center;align-items:center;gap:${ports.length > 2
        ? s(10)
        : s(16)}px"
    >
      ${ports.map((port) => {
        const hl = port.highlighted;
        const label = port.shortLabel || '';
        const { w, h, rx } = portShape(label, s);

        return html`<div
          style="display:flex;flex-direction:column;align-items:center;gap:${s(5)}px"
        >
          <div
            style="width:${w}px;height:${h}px;border-radius:${rx}px;background:${hl
              ? 'linear-gradient(135deg, rgba(0,184,217,0.25), rgba(0,102,255,0.18))'
              : 'rgba(0,0,0,0.80)'};border:1px solid ${hl
              ? '#00B8D9'
              : 'rgba(255,255,255,0.20)'};box-shadow:${hl
              ? `0 0 ${s(8)}px rgba(0,184,217,0.55), inset 0 1px 0 rgba(0,184,217,0.15)`
              : 'inset 0 1px 0 rgba(0,0,0,0.4)'}"
          ></div>
          <span
            style="font-family:'JetBrains Mono','Courier New',monospace;font-size:${s(
              7
            )}px;letter-spacing:0.10em;color:${hl
              ? '#00B8D9'
              : 'rgba(124,134,148,0.65)'};text-transform:uppercase"
            >${label}</span
          >
        </div>`;
      })}
    </div>
  </div>`;
}

/** Kartu spesifikasi. Diekspor karena visual kamera memakai yang sama
 *  (kode React aslinya pun menandai miliknya "identical to MiFi"). */
export function specBadge({ value, label }) {
  return html`<div
    style="background:rgba(8,10,18,0.90);border:1px solid rgba(0,184,217,0.22);border-radius:10px;padding:11px 16px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,184,217,0.05);min-width:110px"
  >
    <div
      style="font-family:'Space Grotesk', sans-serif;font-size:22px;font-weight:800;color:#00B8D9;line-height:1;letter-spacing:-0.02em;white-space:nowrap"
    >
      ${value}
    </div>
    <div
      style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#7C8694;text-transform:uppercase;letter-spacing:0.10em;margin-top:5px;line-height:1.4"
    >
      ${label}
    </div>
  </div>`;
}

export function mifiPortsVisual({ ports = [], highlights = [], lang = 'en' }) {
  if (!ports.length) return raw('');

  const badges = (highlights || []).slice(0, 4);
  const hasBadges = badges.length > 0;
  const leftBadges = [badges[0], badges[2]].filter(Boolean);
  const rightBadges = [badges[1], badges[3]].filter(Boolean);

  return html`<div class="mb-10" aria-hidden="true">
    <!-- Desktop: grid 3 kolom [badge] [perangkat] [badge] -->
    <div class="hidden lg:block">
      <div
        style="display:grid;grid-template-columns:${hasBadges
          ? '1fr auto 1fr'
          : '1fr'};column-gap:40px;align-items:center;justify-items:center"
      >
        ${hasBadges
          ? html`<div
              style="display:flex;flex-direction:column;gap:20px;align-items:flex-end;width:100%"
            >
              ${leftBadges.map((b) => specBadge({ value: b.value, label: loc(b.label, lang) }))}
            </div>`
          : raw('')}

        <div style="position:relative;display:flex;flex-direction:column;align-items:center">
          <div
            style="position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);width:520px;height:520px;border-radius:50%;background:radial-gradient(circle, rgba(0,184,217,0.06) 0%, transparent 65%);pointer-events:none;z-index:0"
          ></div>
          ${deviceBody({ ports, dw: 400 })}
          <div
            style="width:272px;height:14px;margin-top:6px;background:radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,184,217,0.18), transparent 80%);border-radius:50%"
          ></div>
        </div>

        ${hasBadges
          ? html`<div
              style="display:flex;flex-direction:column;gap:20px;align-items:flex-start;width:100%"
            >
              ${rightBadges.map((b) => specBadge({ value: b.value, label: loc(b.label, lang) }))}
            </div>`
          : raw('')}
      </div>
    </div>

    <!-- Mobile: perangkat di tengah + badge 2 kolom di bawah -->
    <div class="lg:hidden">
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px">
        <div style="position:relative;display:flex;flex-direction:column;align-items:center">
          <div
            style="position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);width:340px;height:340px;border-radius:50%;background:radial-gradient(circle, rgba(0,184,217,0.06) 0%, transparent 65%);pointer-events:none;z-index:0"
          ></div>
          ${deviceBody({ ports, dw: 260 })}
          <div
            style="width:177px;height:10px;margin-top:5px;background:radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,184,217,0.15), transparent 80%);border-radius:50%"
          ></div>
        </div>

        ${hasBadges
          ? html`<div
              style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:300px"
            >
              ${badges.map((b) => specBadge({ value: b.value, label: loc(b.label, lang) }))}
            </div>`
          : raw('')}
      </div>
    </div>
  </div>`;
}
