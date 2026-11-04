/**
 * b2b-form.js — kirim form B2B tanpa reload halaman.
 *
 * Ini peningkatan bertahap (progressive enhancement), bukan syarat:
 * <form> sudah punya action + method POST, jadi kalau file ini gagal
 * dimuat, form TETAP terkirim ke Formspree lewat submit biasa.
 * Yang dilakukan skrip ini hanya mencegah reload dan menampilkan
 * pesan sukses/gagal di tempat.
 */
(function () {
  'use strict';

  const form = document.querySelector('[data-b2b-form]');
  if (!form) return;

  const success = document.querySelector('[data-b2b-success]');
  const errorBox = form.querySelector('[data-b2b-error]');
  const submitBtn = form.querySelector('[data-b2b-submit]');
  const resetBtn = document.querySelector('[data-b2b-reset]');

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? '…' : submitBtn.dataset.label;
  }

  form.addEventListener('submit', function (e) {
    // Biarkan browser menangani validasi bawaan dulu
    if (!form.checkValidity()) return;

    e.preventDefault();
    setLoading(true);
    if (errorBox) errorBox.hidden = true;

    const data = Object.fromEntries(new FormData(form).entries());

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Server error');
        form.hidden = true;
        if (success) success.hidden = false;

        if (typeof window.gtag === 'function') {
          window.gtag('event', 'b2b_inquiry_submit', { event_category: 'lead' });
        }
      })
      .catch(function () {
        if (errorBox) errorBox.hidden = false;
      })
      .finally(function () {
        setLoading(false);
      });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      form.hidden = false;
      if (success) success.hidden = true;
      if (errorBox) errorBox.hidden = true;
    });
  }
})();
