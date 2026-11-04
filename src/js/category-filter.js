/**
 * category-filter.js — filter merek + flagship + pengurutan
 * di halaman /products/[category].
 *
 * Menggantikan useState/useMemo di CategoryContent.js.
 *
 * Semua produk sudah ada di HTML. Skrip ini hanya:
 *  - menyembunyikan yang tidak lolos filter (element.hidden)
 *  - mengurutkan ulang lewat CSS `order` (tidak memindah node DOM)
 *
 * Peringkat untuk tiap urutan sudah dihitung saat build dan ditaruh di
 * data-rank-featured / data-rank-newest / data-rank-name. Jadi di browser
 * tidak ada perbandingan tanggal atau localeCompare sama sekali.
 */
(function () {
  'use strict';

  const root = document.querySelector('[data-cat-filter]');
  if (!root) return;

  const items = [...root.querySelectorAll('[data-product]')];
  const brandBoxes = [...root.querySelectorAll('[data-brand]')].filter(
    (el) => el.tagName === 'INPUT'
  );
  const featuredBox = root.querySelector('[data-featured-only]');
  const sortSelect = root.querySelector('[data-sort]');
  const clearBtn = root.querySelector('[data-clear-filters]');
  const shownCount = root.querySelector('[data-shown-count]');
  const noResults = root.querySelector('[data-no-results]');
  const featuredWrap = root.querySelector('[data-featured-wrap]');

  if (!items.length) return;

  const BORDER = '1px solid rgba(255,255,255,0.06)';

  function update() {
    const selectedBrands = brandBoxes.filter((b) => b.checked).map((b) => b.dataset.brand);
    const featuredOnly = Boolean(featuredBox && featuredBox.checked);
    const sort = sortSelect ? sortSelect.value : 'featured';
    const rankAttr = 'rank' + sort.charAt(0).toUpperCase() + sort.slice(1);

    let visible = 0;

    items.forEach(function (item) {
      const brandOk =
        selectedBrands.length === 0 || selectedBrands.indexOf(item.dataset.brand) !== -1;
      const featuredOk = !featuredOnly || item.dataset.featured === '1';
      const show = brandOk && featuredOk;

      item.hidden = !show;
      item.style.order = item.dataset[rankAttr] || 0;
      if (show) visible++;
    });

    if (shownCount) shownCount.textContent = String(visible);
    if (noResults) noResults.hidden = visible !== 0;

    // Tombol "hapus filter" + garis pemisah hanya muncul saat ada filter aktif
    const hasFilters = selectedBrands.length > 0 || featuredOnly;
    if (clearBtn) clearBtn.hidden = !hasFilters;
    if (featuredWrap) {
      featuredWrap.classList.toggle('mb-7', hasFilters);
      featuredWrap.classList.toggle('pb-6', hasFilters);
      featuredWrap.style.borderBottom = hasFilters ? BORDER : '';
    }
  }

  brandBoxes.forEach(function (box) {
    box.addEventListener('change', update);
  });
  if (featuredBox) featuredBox.addEventListener('change', update);
  if (sortSelect) sortSelect.addEventListener('change', update);

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      brandBoxes.forEach(function (b) {
        b.checked = false;
      });
      if (featuredBox) featuredBox.checked = false;
      update();
    });
  }

  update();
})();
