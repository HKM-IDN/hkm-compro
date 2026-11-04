/**
 * map-style.mjs — konfigurasi tampilan Google Map.
 *
 * Diekstrak APA ADANYA dari components/maps/MapWithMarkers.js.
 * Jangan diubah tanpa alasan: kontras darat/laut di sini yang bikin
 * kepulauan Indonesia terbaca di zoom 5.
 */

export const MAP_STYLES = [
  // Default for everything — dark base
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b8c5d9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },

  // ── Land / islands ────────────────────────────────────────────────────────
  // Landmass much brighter than water so every island in the archipelago reads
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1f2a3a' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#1c2737' }] },

  // ── Administrative borders ────────────────────────────────────────────────
  // Whole administrative geometry (fill) matches land colour
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1f2a3a' }] },
  // Country outline — cyan accent makes coastlines visible against dark ocean
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#00b8d9' }, { weight: 0.8 }],
  },
  // Province outline — subtle teal, doesn't compete with country borders
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a4a5a' }, { weight: 0.5 }],
  },
  // Country / province label text
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e7ef' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b8c5d9' }],
  },

  // ── POI — fully hidden so HKM markers are the only pins on the map ────────
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },

  // ── Roads — very muted; don't compete with island shapes at zoom 5 ────────
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2030' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a2030' }] },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5a6478' }],
  },

  // ── Transit — hidden ──────────────────────────────────────────────────────
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  // ── Water — very dark navy, maximum contrast with land ────────────────────
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07090f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3a4d62' }] },
];

export const PIN_PATH =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
