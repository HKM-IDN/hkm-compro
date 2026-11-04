/**
 * contact-form.js — halaman /contact.
 *
 * Menggantikan state React di ContactSection.js:
 *  - Step 1 (pilih jenis pertanyaan) ↔ step 2 (form)
 *  - Field yang tampil / wajib per jenis pertanyaan (TYPE_CFG)
 *  - Subjek otomatis, validasi inline, kirim ke Formspree, state sukses
 *  - ?type=reseller_dealer di URL → langsung ke form jenis itu
 *
 * Tidak ada /api/contact di situs statis: data dikirim langsung ke
 * Formspree (action form). Honeypot _gotcha tetap dipakai — kalau terisi,
 * pura-pura sukses tanpa mengirim apa pun (sama seperti route API lama).
 */
(function () {
  'use strict';

  const root = document.querySelector('[data-contact-root]');
  if (!root) return;

  let config;
  try {
    config = JSON.parse(root.querySelector('[data-contact-config]').textContent);
  } catch {
    return;
  }

  const step1El = root.querySelector('[data-contact-step1]');
  const step2El = root.querySelector('[data-contact-step2]');
  const formWrap = root.querySelector('[data-contact-formwrap]');
  const successEl = root.querySelector('[data-contact-success]');
  const titleEl = root.querySelector('[data-type-title]');
  const careersNote = root.querySelector('[data-careers-note]');
  const form = root.querySelector('[data-contact-form]');
  const submitBtn = root.querySelector('[data-contact-submit]');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let inquiryType = null;
  let loading = false;

  // ── Toast kecil (pengganti sonner, gaya sama dengan <Toaster> lama) ───────

  let toastBox = null;
  function toast(message, kind) {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.setAttribute('aria-live', 'polite');
      toastBox.style.cssText =
        'position:fixed;right:24px;bottom:24px;z-index:200;display:flex;flex-direction:column;' +
        'gap:8px;max-width:calc(100vw - 48px);width:356px;pointer-events:none';
      document.body.appendChild(toastBox);
    }
    const item = document.createElement('div');
    item.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    item.style.cssText =
      'background:#1c1e24;border:1px solid rgba(255,255,255,0.12);color:#E2E7EF;' +
      'font-family:var(--font-inter),Inter,sans-serif;font-size:13px;line-height:1.5;' +
      'padding:14px 16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);' +
      'display:flex;gap:10px;align-items:center;opacity:0;transform:translateY(8px);' +
      'transition:opacity .2s,transform .2s';

    const dot = document.createElement('span');
    dot.style.cssText =
      'width:8px;height:8px;border-radius:9999px;flex-shrink:0;background:' +
      (kind === 'error' ? '#FF4D4D' : '#00FF7F');
    const text = document.createElement('span');
    text.textContent = message;
    item.appendChild(dot);
    item.appendChild(text);
    toastBox.appendChild(item);

    window.requestAnimationFrame(function () {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });
    setTimeout(function () {
      item.style.opacity = '0';
      setTimeout(function () {
        item.remove();
      }, 250);
    }, 4000);
  }

  // ── Helper field ──────────────────────────────────────────────────────────

  function fieldWrap(name) {
    return form ? form.querySelector('[data-field="' + name + '"]') : null;
  }

  function control(name) {
    return form ? form.elements.namedItem(name) : null;
  }

  function setError(name, message) {
    const wrap = fieldWrap(name);
    if (!wrap) return;
    const el = wrap.querySelector('input, textarea, select');
    const err = wrap.querySelector('[data-error]');
    if (!el || !err) return;

    if (message) {
      el.classList.remove('border-white/10');
      el.classList.add('border-red-400');
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', err.id);
      err.textContent = message;
      err.hidden = false;
    } else {
      el.classList.remove('border-red-400');
      el.classList.add('border-white/10');
      el.setAttribute('aria-invalid', 'false');
      el.removeAttribute('aria-describedby');
      err.textContent = '';
      err.hidden = true;
    }
  }

  function clearErrors() {
    ['name', 'email', 'phone', 'company', 'message'].forEach(function (n) {
      setError(n, '');
    });
  }

  function setRequired(name, on) {
    const wrap = fieldWrap(name);
    if (!wrap) return;
    const star = wrap.querySelector('[data-req]');
    if (star) star.hidden = !on;
  }

  function show(name, on) {
    const wrap = fieldWrap(name);
    if (wrap) wrap.hidden = !on;
  }

  function value(name) {
    const el = control(name);
    return el && el.value ? String(el.value) : '';
  }

  // ── Ganti step ────────────────────────────────────────────────────────────

  function selectType(key) {
    const cfg = config.types[key];
    if (!cfg) return;
    inquiryType = key;

    if (titleEl) titleEl.textContent = cfg.title;
    root.querySelectorAll('[data-type-icon]').forEach(function (el) {
      el.hidden = el.dataset.typeIcon !== key;
    });
    if (careersNote) careersNote.hidden = key !== 'careers';

    if (form) {
      show('phone', cfg.phone);
      setRequired('phone', cfg.phoneReq);
      show('company', cfg.company);
      setRequired('company', cfg.companyReq);
      const companyLabel = fieldWrap('company');
      const labelText = companyLabel && companyLabel.querySelector('[data-label-text]');
      if (labelText) {
        labelText.textContent = cfg.companyReq
          ? config.labels.companyRequired
          : config.labels.company;
      }
      show('product', cfg.productFields);

      const subject = control('subject');
      if (subject) subject.value = cfg.subject;
      clearErrors();
    }

    if (step1El) step1El.hidden = true;
    if (step2El) step2El.hidden = false;
  }

  function resetType() {
    inquiryType = null;
    if (form) {
      form.reset();
      clearErrors();
    }
    if (formWrap) formWrap.hidden = false;
    if (successEl) successEl.hidden = true;
    if (step2El) step2El.hidden = true;
    if (step1El) step1El.hidden = false;
  }

  root.querySelectorAll('[data-inquiry-type]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectType(btn.dataset.inquiryType);
    });
  });

  root.querySelectorAll('[data-contact-change], [data-contact-reset]').forEach(function (btn) {
    btn.addEventListener('click', resetType);
  });

  // Hapus error field saat diketik (sama dengan set() di React)
  if (form) {
    ['name', 'email', 'phone', 'company', 'message'].forEach(function (n) {
      const el = control(n);
      if (el) {
        el.addEventListener('input', function () {
          setError(n, '');
        });
      }
    });
  }

  // ── Validasi + kirim ──────────────────────────────────────────────────────

  function validate(cfg) {
    const e = config.errors;
    const errs = {};
    const email = value('email').trim();
    const message = value('message').trim();

    if (!value('name').trim()) errs.name = e.required;
    if (!email) errs.email = e.required;
    else if (!EMAIL_RE.test(email)) errs.email = e.email;
    if (cfg.phoneReq && !value('phone').trim()) errs.phone = e.phone;
    if (cfg.companyReq && !value('company').trim()) errs.company = e.company;
    if (!message) errs.message = e.required;
    else if (message.length < 20) errs.message = e.minLength;
    return errs;
  }

  function setLoading(on) {
    loading = on;
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? config.labels.submitting : config.labels.submit;
  }

  function showSuccess() {
    if (formWrap) formWrap.hidden = true;
    if (successEl) successEl.hidden = false;
    toast(config.successToast, 'success');
  }

  /** Payload sama dengan yang dulu dirakit app/api/contact/route.js. */
  function buildPayload(cfg) {
    const payload = {
      name: value('name').trim(),
      email: value('email').trim(),
      message: value('message').trim(),
      inquiry_type: inquiryType,
    };
    const subject = value('subject').trim();
    if (subject) payload.subject = subject;
    payload._subject = '[HKM Contact] ' + cfg.title + ' - ' + (subject || 'Inquiry');

    // Field opsional hanya dikirim kalau tampil untuk jenis ini dan terisi
    if (cfg.company && value('company').trim()) payload.company = value('company').trim();
    if (cfg.phone && value('phone').trim()) payload.phone = value('phone').trim();
    if (cfg.productFields) {
      if (value('product_model').trim()) payload.product_model = value('product_model').trim();
      if (value('purchase_date')) payload.purchase_date = value('purchase_date');
      if (value('serial_number').trim()) payload.serial_number = value('serial_number').trim();
    }
    return payload;
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (loading || !inquiryType) return;

      const cfg = config.types[inquiryType];
      const errs = validate(cfg);
      clearErrors();
      const keys = Object.keys(errs);
      if (keys.length) {
        keys.forEach(function (k) {
          setError(k, errs[k]);
        });
        const first = control(keys[0]);
        if (first && first.focus) first.focus();
        return;
      }

      // Honeypot terisi → bot. Pura-pura sukses, jangan kirim apa pun.
      if (value('_gotcha')) {
        showSuccess();
        return;
      }

      setLoading(true);

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildPayload(cfg)),
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              if (!res.ok) {
                const msg =
                  (data && data.error) ||
                  (data && data.errors && data.errors[0] && data.errors[0].message) ||
                  config.errors.generic;
                toast(msg, 'error');
                return;
              }
              showSuccess();
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'form_submit', {
                  form_name: 'contact',
                  inquiry_type: inquiryType,
                });
              }
            });
        })
        .catch(function () {
          toast(config.errors.generic, 'error');
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }

  // ── ?type= di URL → langsung ke form ──────────────────────────────────────
  const initialType = new URL(window.location.href).searchParams.get('type');
  if (initialType && config.types[initialType]) selectType(initialType);
})();
