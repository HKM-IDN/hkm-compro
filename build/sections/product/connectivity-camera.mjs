/**
 * Visual port IP kamera — port dari
 * components/products/detail/connectivity/CameraPortsVisual.js
 *
 * Ilustrasi kamera: bodi dengan lensa berlapis (cincin IR, elemen kaca,
 * iris, kilau) dan deretan port berikon di bawahnya.
 *
 * Perbedaan dari versi React:
 *  - SpecBadge yang di sana diduplikasi (komentarnya sendiri menyebut
 *    "identical to MiFi") di sini dipakai ulang dari connectivity-mifi.mjs.
 *  - Semua perhitungan s() dan nilai warna disalin apa adanya.
 */
import { html, raw } from '../../html.mjs';
import { loc } from '../../lib/i18n.mjs';
import { specBadge } from './connectivity-mifi.mjs';

// ── Busur WiFi ──────────────────────────────────────────────────────────────

function wifiArcs({ size, highlighted }) {
  const c1 = highlighted ? 'rgba(0,184,217,0.9)' : 'rgba(255,255,255,0.40)';
  const c2 = highlighted ? 'rgba(0,184,217,0.65)' : 'rgba(255,255,255,0.22)';
  const c3 = highlighted ? 'rgba(0,184,217,0.28)' : 'rgba(255,255,255,0.10)';

  return html`<svg
    width="${size}"
    height="${Math.round(size * 0.77)}"
    viewBox="0 0 22 17"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="11" cy="15" r="2" fill="${c1}" />
    <path
      d="M5.5 9.5C7.2 7.8 9 7 11 7C13 7 14.8 7.8 16.5 9.5"
      stroke="${c2}"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M2 6C4.6 3.4 7.6 2 11 2C14.4 2 17.4 3.4 20 6"
      stroke="${c3}"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>`;
}

// ── Ikon port, dipilih dari shortLabel ──────────────────────────────────────

function portIcon({ shortLabel, highlighted, iconSize: sz }) {
  const l = (shortLabel || '').toUpperCase();
  const col = highlighted ? '#00B8D9' : 'rgba(255,255,255,0.38)';
  const fill = highlighted ? 'rgba(0,184,217,0.12)' : 'none';

  if (l.includes('WIFI') || l.includes('WI-FI') || l.includes('WIRELESS')) {
    return wifiArcs({ size: sz, highlighted });
  }

  if (l.includes('POE') || l.includes('ETH') || l.includes('LAN') || l.includes('RJ45')) {
    return html`<svg
      width="${sz}"
      height="${Math.round(sz * 0.82)}"
      viewBox="0 0 20 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="2"
        width="18"
        height="12"
        rx="2"
        stroke="${col}"
        stroke-width="1.2"
        fill="${fill}"
      />
      <rect x="5" y="5" width="10" height="5" rx="1" stroke="${col}" stroke-width="0.9" />
      <line x1="7.5" y1="10" x2="7.5" y2="14" stroke="${col}" stroke-width="0.9" />
      <line x1="10" y1="10" x2="10" y2="14" stroke="${col}" stroke-width="0.9" />
      <line x1="12.5" y1="10" x2="12.5" y2="14" stroke="${col}" stroke-width="0.9" />
    </svg>`;
  }

  if (l.includes('SD') || l.includes('TF') || l.includes('MICRO')) {
    return html`<svg
      width="${Math.round(sz * 0.75)}"
      height="${sz}"
      viewBox="0 0 15 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 5L5 0H15V20H0V5Z" stroke="${col}" stroke-width="1.2" fill="${fill}" />
      <line x1="3.5" y1="7" x2="3.5" y2="17" stroke="${col}" stroke-width="0.8" opacity="0.6" />
      <line x1="7.5" y1="7" x2="7.5" y2="17" stroke="${col}" stroke-width="0.8" opacity="0.6" />
      <line x1="11.5" y1="7" x2="11.5" y2="17" stroke="${col}" stroke-width="0.8" opacity="0.6" />
    </svg>`;
  }

  if (l.includes('USB')) {
    return html`<svg
      width="${Math.round(sz * 0.75)}"
      height="${sz}"
      viewBox="0 0 14 18"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="12"
        height="16"
        rx="3.5"
        stroke="${col}"
        stroke-width="1.2"
        fill="${fill}"
      />
      <rect x="4.5" y="4.5" width="5" height="9" rx="1.5" stroke="${col}" stroke-width="0.8" />
    </svg>`;
  }

  if (
    l.includes('DC') ||
    l.includes('POW') ||
    l.includes('PWR') ||
    l.includes('12V') ||
    l.includes('5V') ||
    l.includes('POWER')
  ) {
    return html`<svg
      width="${sz}"
      height="${sz}"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" stroke="${col}" stroke-width="1.2" fill="${fill}" />
      <circle cx="10" cy="10" r="3" stroke="${col}" stroke-width="1" />
      <line
        x1="2"
        y1="10"
        x2="5"
        y2="10"
        stroke="${col}"
        stroke-width="1.2"
        stroke-linecap="round"
      />
      <line
        x1="15"
        y1="10"
        x2="18"
        y2="10"
        stroke="${col}"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </svg>`;
  }

  if (l.includes('RESET')) {
    return html`<svg
      width="${sz}"
      height="${sz}"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="7" stroke="${col}" stroke-width="1.2" />
      <circle cx="9" cy="9" r="2.5" fill="${col}" opacity="0.7" />
    </svg>`;
  }

  if (l.includes('SPEAK') || l.includes('MIC') || l.includes('AUDIO')) {
    return html`<svg
      width="${Math.round(sz * 0.7)}"
      height="${sz}"
      viewBox="0 0 14 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="1"
        width="8"
        height="11"
        rx="4"
        stroke="${col}"
        stroke-width="1.2"
        fill="${fill}"
      />
      <path
        d="M1 10C1 14.4 6.5 16.5 7 17M13 10C13 14.4 7.5 16.5 7 17M7 17V20"
        stroke="${col}"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </svg>`;
  }

  // Slot generik
  return html`<div
    style="width:${sz}px;height:${Math.round(sz * 0.5)}px;border-radius:${Math.round(
      sz * 0.15
    )}px;border:1px solid ${col};background:${fill}"
  ></div>`;
}

// ── Lensa ───────────────────────────────────────────────────────────────────

function lensAssembly(d) {
  return html`<div
    style="width:${d}px;height:${d}px;border-radius:50%;background:linear-gradient(145deg,#2a2d38,#0c0e18);border:2px solid rgba(255,255,255,0.13);box-shadow:0 0 0 4px rgba(255,255,255,0.04), 0 6px 28px rgba(0,0,0,0.75), 0 0 32px rgba(0,184,217,0.09), inset 0 1px 4px rgba(255,255,255,0.07);position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0"
  >
    <!-- Cincin LED inframerah -->
    <div
      style="position:absolute;inset:${Math.round(
        d * 0.055
      )}px;border-radius:50%;border:3px solid rgba(12,8,20,0.95)"
    ></div>

    <!-- Elemen kaca -->
    <div
      style="position:absolute;inset:${Math.round(
        d * 0.13
      )}px;border-radius:50%;background:radial-gradient(circle at 33% 29%, #0a1428, #040810 52%, #010408);border:1px solid rgba(0,100,180,0.22);overflow:hidden;box-shadow:inset 0 0 ${Math.round(
        d * 0.18
      )}px rgba(0,20,60,0.9)"
    >
      <div
        style="position:absolute;inset:14%;border-radius:50%;border:1px solid rgba(0,120,200,0.20)"
      ></div>
      <div
        style="position:absolute;inset:30%;border-radius:50%;border:1px solid rgba(0,150,220,0.14)"
      ></div>
      <div
        style="position:absolute;inset:44%;border-radius:50%;border:1px solid rgba(0,170,230,0.10)"
      ></div>

      <!-- Iris -->
      <div
        style="position:absolute;inset:50%;border-radius:50%;background:radial-gradient(circle at 42% 38%, rgba(0,40,100,0.85), rgba(0,0,8,0.98));transform:translate(-50%,-50%);width:18%;height:18%"
      ></div>

      <!-- Kilau utama, arah jam 10 -->
      <div
        style="position:absolute;top:17%;left:17%;width:22%;height:9%;border-radius:40%;background:rgba(0,184,217,0.62);filter:blur(${Math.round(
          d * 0.025
        )}px);transform:rotate(-32deg)"
      ></div>

      <!-- Kilau sekunder -->
      <div
        style="position:absolute;bottom:26%;right:22%;width:11%;height:5%;border-radius:50%;background:rgba(130,200,255,0.28);filter:blur(${Math.round(
          d * 0.018
        )}px)"
      ></div>
    </div>
  </div>`;
}

// ── Bodi kamera ─────────────────────────────────────────────────────────────

function cameraBody({ ports, dw }) {
  const s = (n) => Math.round((n * dw) / 280);
  const lensD = s(154);
  const bodyH = s(328);
  const portSlots = ports.slice(0, 4);

  return html`<div
    style="width:${dw}px;height:${bodyH}px;background:linear-gradient(170deg,#1e2028 0%,#0d0f18 100%);border:1px solid rgba(255,255,255,0.09);border-radius:${s(
      22
    )}px;box-shadow:0 ${s(12)}px ${s(
      48
    )}px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3);display:flex;flex-direction:column;align-items:center;overflow:hidden;user-select:none;flex-shrink:0;position:relative;z-index:1"
  >
    <div
      style="height:${s(
        4
      )}px;width:100%;background:linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)"
    ></div>

    <!-- LED + merek -->
    <div
      style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:${s(
        10
      )}px ${s(18)}px 0"
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
          style="width:${s(7)}px;height:${s(7)}px;border-radius:50%;background:#00B8D9;opacity:0.28"
        ></div>
      </div>
      <span
        style="font-family:'JetBrains Mono','Courier New',monospace;font-size:${s(
          8
        )}px;letter-spacing:0.28em;color:rgba(255,255,255,0.16)"
        >HKM</span
      >
    </div>

    <!-- Lensa -->
    <div style="margin-top:${s(18)}px;flex-shrink:0">${lensAssembly(lensD)}</div>

    <!-- Deret port -->
    <div
      style="margin-top:auto;border-top:1px solid rgba(255,255,255,0.05);width:100%;padding:${s(
        12
      )}px 0 ${s(
        14
      )}px;display:flex;justify-content:center;align-items:center;gap:${portSlots.length > 3
        ? s(12)
        : s(18)}px"
    >
      ${portSlots.map((port) => {
        const hl = port.highlighted;
        const lbl = port.shortLabel || '';

        return html`<div
          style="display:flex;flex-direction:column;align-items:center;gap:${s(5)}px"
        >
          <div
            style="padding:${s(5)}px ${s(6)}px;border-radius:${s(7)}px;background:${hl
              ? 'rgba(0,184,217,0.10)'
              : 'rgba(0,0,0,0.42)'};border:1px solid ${hl
              ? 'rgba(0,184,217,0.38)'
              : 'rgba(255,255,255,0.09)'};box-shadow:${hl
              ? `0 0 ${s(8)}px rgba(0,184,217,0.22)`
              : 'none'};display:flex;align-items:center;justify-content:center;min-width:${s(
              30
            )}px;min-height:${s(28)}px"
          >
            ${portIcon({ shortLabel: lbl, highlighted: hl, iconSize: s(18) })}
          </div>
          <span
            style="font-family:'JetBrains Mono','Courier New',monospace;font-size:${s(
              7
            )}px;letter-spacing:0.10em;color:${hl
              ? '#00B8D9'
              : 'rgba(124,134,148,0.65)'};text-transform:uppercase"
            >${lbl}</span
          >
        </div>`;
      })}
    </div>
  </div>`;
}

// ── Pembungkus halo + pantulan ──────────────────────────────────────────────

function deviceWithHalo({ ports, dw, haloSize, reflectW }) {
  return html`<div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <!-- Halo melingkar, ujungnya transparan supaya tidak terlihat kotak -->
    <div
      style="position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);width:${haloSize}px;height:${haloSize}px;border-radius:50%;background:radial-gradient(circle, rgba(0,184,217,0.06) 0%, transparent 62%);pointer-events:none;z-index:0"
    ></div>
    ${cameraBody({ ports, dw })}
    <div
      style="width:${reflectW}px;height:12px;margin-top:6px;background:radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,184,217,0.16), transparent 80%);border-radius:50%"
    ></div>
  </div>`;
}

// ── Ekspor utama ────────────────────────────────────────────────────────────

export function cameraPortsVisual({ ports = [], highlights = [], lang = 'en' }) {
  if (!ports.length) return raw('');

  const badges = (highlights || []).slice(0, 4);
  const hasBadges = badges.length > 0;
  const leftBadges = [badges[0], badges[2]].filter(Boolean);
  const rightBadges = [badges[1], badges[3]].filter(Boolean);

  return html`<div class="mb-10" aria-hidden="true">
    <!-- Desktop: [badge] [kamera] [badge] -->
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
        ${deviceWithHalo({ ports, dw: 280, haloSize: 480, reflectW: 190 })}
        ${hasBadges
          ? html`<div
              style="display:flex;flex-direction:column;gap:20px;align-items:flex-start;width:100%"
            >
              ${rightBadges.map((b) => specBadge({ value: b.value, label: loc(b.label, lang) }))}
            </div>`
          : raw('')}
      </div>
    </div>

    <!-- Mobile: kamera di tengah + badge 2 kolom di bawah -->
    <div class="lg:hidden">
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px">
        ${deviceWithHalo({ ports, dw: 200, haloSize: 330, reflectW: 136 })}
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
