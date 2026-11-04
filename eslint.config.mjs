/**
 * ESLint — hanya untuk src/js (skrip yang jalan di browser).
 *
 * File di build/ dijalankan Node saat build dan sudah dicek lewat
 * `node --check` + build itu sendiri, jadi tidak perlu aturan browser.
 */
export default [
  {
    files: ['src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script', // skrip browser biasa, bukan modul
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        CustomEvent: 'readonly',
        IntersectionObserver: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
];
