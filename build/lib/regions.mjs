/**
 * lib/regions.js — canonical source for Indonesian region data.
 *
 * Used by:
 *  - ServicePointsContent.js  (filter chips)
 *  - ServicePointSummary.js   (region label map)
 */

// All regions in west-to-east display order.
// `filter` is the Sanity region slug used to filter service points.
// `label` maps both the filter value AND individual Sanity region slugs → display text.
export const REGIONS = [
  { value: 'all', en: 'All Regions', id: 'Semua Wilayah' },
  { value: 'sumatera', en: 'Sumatera', id: 'Sumatera' },
  { value: 'jawa', en: 'Jawa', id: 'Jawa' },
  { value: 'bali-ntt', en: 'Bali / NTB / NTT', id: 'Bali / NTB / NTT' },
  { value: 'kalimantan', en: 'Kalimantan', id: 'Kalimantan' },
  { value: 'sulawesi', en: 'Sulawesi', id: 'Sulawesi' },
  { value: 'maluku-papua', en: 'Maluku / Papua', id: 'Maluku / Papua' },
];

// Individual Sanity region slug → display label (for ServicePointSummary region line).
// These differ from REGIONS because Sanity stores fine-grained slugs (bali, ntb, ntt)
// but the filter UI uses combined slugs (bali-ntt).
export const REGION_LABEL = {
  sumatera: 'Sumatera',
  jawa: 'Jawa',
  kalimantan: 'Kalimantan',
  sulawesi: 'Sulawesi',
  bali: 'Bali',
  ntb: 'NTB',
  ntt: 'NTT',
  maluku: 'Maluku',
  papua: 'Papua',
  'bali-ntt': 'Bali / NTB / NTT',
  'maluku-papua': 'Maluku / Papua',
};

// West-to-east sort order for region display line in ServicePointSummary.
export const REGION_ORDER = [
  'sumatera',
  'jawa',
  'bali',
  'bali-ntt',
  'ntb',
  'ntt',
  'kalimantan',
  'sulawesi',
  'maluku',
  'maluku-papua',
  'papua',
];

/** Sort region slugs west-to-east and join with " · ". */
export function formatRegionLine(regions = []) {
  return [...regions]
    .sort((a, b) => {
      const ai = REGION_ORDER.indexOf(a);
      const bi = REGION_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map((r) => REGION_LABEL[r] || r)
    .join(' · ');
}
