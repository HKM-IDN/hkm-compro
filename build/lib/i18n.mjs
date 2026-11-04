// Picks the correct locale string from a Sanity localeString { en, id } object.
// Falls back to .en if the requested lang is missing.
export function loc(field, lang = 'en') {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || '';
}

// Format a Sanity datetime string for display
export function formatDate(dateStr, lang = 'en') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (lang === 'id') {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
