/**
 * Teks halaman /products — diekstrak apa adanya dari
 * components/products/ProductsContent.js.
 */

export const LABELS = {
  en: {
    breadcrumbHome: 'Home',
    breadcrumbPage: 'Products',
    pageTitle: 'Our <span>Product Lineup.</span>',
    pageSub:
      'Six categories of connectivity hardware and solutions — trusted by resellers and powering homes and businesses across Indonesia.',
    filterLabel: '— Filter',
    filterAll: 'All',
    viewAll: 'View all →',
    viewDetails: 'View Details →',
    productsLabel: (n) => `${n} product${n !== 1 ? 's' : ''}`,
    emptyState: 'Products coming soon.',
  },
  id: {
    breadcrumbHome: 'Beranda',
    breadcrumbPage: 'Produk',
    pageTitle: 'Lini <span>Produk Kami.</span>',
    pageSub:
      'Enam kategori perangkat keras dan solusi konektivitas — dipercaya reseller dan menggerakkan rumah serta bisnis di seluruh Indonesia.',
    filterLabel: '— Filter',
    filterAll: 'Semua',
    viewAll: 'Lihat semua →',
    viewDetails: 'Lihat Detail →',
    productsLabel: (n) => `${n} produk`,
    emptyState: 'Produk segera hadir.',
  },
};
