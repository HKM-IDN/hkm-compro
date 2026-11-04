/**
 * Visual port router — port dari
 * components/products/detail/connectivity/RouterPortsVisual.js
 *
 * SVG murni, tidak ada logika React selain map() atas daftar port.
 * Semua konstanta geometri disalin apa adanya supaya gambarnya identik.
 */
import { html, raw } from '../../html.mjs';

// Konstanta koordinat SVG — semua geometri port didefinisikan di sini
// supaya konsisten di lebar viewport berapa pun (SVG skala via width="100%").
const VB_W = 520;
const VB_H = 72;
const PORT_W = 28;
const PORT_H = 34;
const PORT_GAP = 12;
const PORT_Y = VB_H - PORT_H - 10;

function portX(i, n) {
  const groupW = PORT_W * n + PORT_GAP * (n - 1);
  return (VB_W - groupW) / 2 + i * (PORT_W + PORT_GAP);
}

export function routerPortsVisual({ ports = [] }) {
  if (!ports.length) return raw('');
  const n = ports.length;

  return html`<div class="mb-10 mx-auto" style="max-width:${VB_W}px">
    <svg viewBox="0 0 ${VB_W} ${VB_H}" width="100%" style="display:block" aria-hidden="true">
      <defs>
        <linearGradient id="rtrBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1a1c24" />
          <stop offset="1" stop-color="#0d0f16" />
        </linearGradient>
        <linearGradient id="rtrPortHlGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#00B8D9" />
          <stop offset="1" stop-color="#0066ff" />
        </linearGradient>
      </defs>

      <!-- Bodi router -->
      <rect
        x="0.5"
        y="0.5"
        width="${VB_W - 1}"
        height="${VB_H - 1}"
        rx="10"
        fill="url(#rtrBodyGrad)"
        stroke="rgba(255,255,255,0.08)"
        stroke-width="1"
      />

      <!-- Lampu indikator kiri-atas -->
      <rect x="16" y="12" width="10" height="4" rx="2" fill="#00B8D9" opacity="0.9" />
      <rect x="30" y="12" width="6" height="4" rx="2" fill="#00B8D9" opacity="0.3" />
      <rect x="40" y="12" width="6" height="4" rx="2" fill="#00B8D9" opacity="0.12" />

      <!-- Label merek kanan-atas -->
      <text
        x="${VB_W - 16}"
        y="17"
        text-anchor="end"
        font-size="9"
        font-family="'JetBrains Mono','Courier New',monospace"
        letter-spacing="2"
        fill="rgba(255,255,255,0.18)"
      >
        HKM
      </text>

      <!-- Lubang port -->
      ${ports.map((port, i) => {
        const x = portX(i, n);
        const y = PORT_Y;
        const hl = port.highlighted;

        return html`<g>
          ${hl
            ? html`<rect
                  x="${x - 7}"
                  y="${y - 7}"
                  width="${PORT_W + 14}"
                  height="${PORT_H + 14}"
                  rx="7"
                  fill="rgba(0,184,217,0.07)"
                />
                <rect
                  x="${x - 4}"
                  y="${y - 4}"
                  width="${PORT_W + 8}"
                  height="${PORT_H + 8}"
                  rx="5"
                  fill="rgba(0,184,217,0.10)"
                  stroke="#00B8D9"
                  stroke-width="0.5"
                  stroke-opacity="0.4"
                />
                <rect
                  x="${x - 1.5}"
                  y="${y - 1.5}"
                  width="${PORT_W + 3}"
                  height="${PORT_H + 3}"
                  rx="4"
                  fill="none"
                  stroke="#00B8D9"
                  stroke-width="0.75"
                  stroke-opacity="0.7"
                />`
            : raw('')}

          <rect
            x="${x}"
            y="${y}"
            width="${PORT_W}"
            height="${PORT_H}"
            rx="3"
            fill="${hl ? 'url(#rtrPortHlGrad)' : '#0A0B0E'}"
            stroke="${hl ? '#00B8D9' : 'rgba(255,255,255,0.18)'}"
            stroke-width="1"
          />
          <!-- Rongga RJ45 di dalam -->
          <rect
            x="${x + 5}"
            y="${y + 5}"
            width="${PORT_W - 10}"
            height="${PORT_H - 11}"
            rx="1.5"
            fill="${hl ? 'rgba(0,8,24,0.7)' : 'rgba(0,0,0,0.82)'}"
            stroke="rgba(255,255,255,0.07)"
            stroke-width="0.75"
          />
          <!-- Detail klip pengunci -->
          <rect
            x="${x + 7}"
            y="${y + PORT_H - 5}"
            width="${PORT_W - 14}"
            height="2"
            rx="1"
            fill="${hl ? 'rgba(0,184,217,0.35)' : 'rgba(255,255,255,0.07)'}"
          />
        </g>`;
      })}
    </svg>

    <!-- Label port — posisi persen agar sejajar dengan tengah port di SVG -->
    <div class="relative mt-2" style="height:18px">
      ${ports.map((port, i) => {
        const centerPct = ((portX(i, n) + PORT_W / 2) / VB_W) * 100;
        return html`<span
          class="absolute font-mono text-[10px] uppercase tracking-[0.1em] whitespace-nowrap -translate-x-1/2"
          style="left:${centerPct}%;top:2px;color:${port.highlighted ? '#00B8D9' : '#7C8694'}"
          >${port.shortLabel || ''}</span
        >`;
      })}
    </div>
  </div>`;
}
