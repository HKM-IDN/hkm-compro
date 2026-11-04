/**
 * / — Homepage. Port dari app/page.js.
 *
 * Merakit 9 section dari build/sections/. Semua data sudah di-fetch sekali
 * di build.mjs, jadi tidak ada Promise.all di sini — berbeda dari versi
 * Server Component yang mengambil 4 query tiap kali halaman dirender.
 */
import { page } from '../layout.mjs';
import { html } from '../html.mjs';
import { buildMeta, jsonLd, schemaOrganization, schemaWebSite } from '../lib/seo.mjs';
import { LATEST_NEWS_QUERY } from '../lib/queries.mjs';
import { fetchGroq } from '../sanity.mjs';

import { heroSection } from '../sections/hero.mjs';
import { categoriesSection } from '../sections/categories.mjs';
import { spotlightSection } from '../sections/spotlight.mjs';
import { youtubeSection } from '../sections/youtube.mjs';
import { serviceSection } from '../sections/service.mjs';
import { newsSection } from '../sections/news.mjs';
import { instagramSection, needsInstagramScript } from '../sections/instagram.mjs';
import { credibilitySection } from '../sections/credibility.mjs';
import { b2bSection } from '../sections/b2b.mjs';

export const route = {
  name: 'home',
  path: '/',

  async render({
    homepage,
    settings,
    servicePoints,
    lang,
    buildYear,
    gaId,
    mapsApiKey,
    formspreeUrl,
  }) {
    // newsAutoFetch default true — ambil 4 berita terbaru.
    // Kalau dimatikan di Sanity, pakai pilihan manual.
    let news = homepage?.newsManualPicks || [];
    if (homepage?.newsAutoFetch !== false) {
      news = await fetchGroq(LATEST_NEWS_QUERY, {}, 'berita terbaru (homepage)');
    }

    const categories = homepage?.categoriesToShow || [];
    const spCount = homepage?.serviceStats?.pointCount ?? servicePoints?.length ?? 0;

    // Script hanya dimuat kalau section-nya benar-benar butuh
    const scripts = ['/assets/js/map.js', '/assets/js/b2b-form.js'];
    if (needsInstagramScript(settings)) scripts.push('/assets/js/instagram.js');

    return page({
      meta: buildMeta({
        title: 'HKM — Distributor Produk Konektivitas Indonesia',
        description:
          'Router 4G/5G, Mobile WiFi, SIM khusus, IP kamera, dan smart home dari distributor resmi ' +
          `Indonesia. Garansi resmi, ${spCount}+ service point nasional, pengiriman cepat via ` +
          'Tokopedia, Shopee, dan TikTok Shop.',
        path: '',
        type: 'website',
      }),
      lang,
      path: '/',
      settings,
      buildYear,
      gaId,
      scripts,
      schemas: [jsonLd(schemaOrganization()), jsonLd(schemaWebSite())],
      body: html`
        ${heroSection({ data: homepage, lang })} ${categoriesSection({ data: homepage, lang })}
        ${spotlightSection({ data: homepage, lang })}
        ${youtubeSection({ data: homepage, socialYoutube: settings?.socialYoutube, lang })}
        ${serviceSection({ data: homepage, servicePoints, lang, mapsApiKey })}
        ${newsSection({ data: homepage, news, lang })}
        ${instagramSection({ data: homepage, settings, spCount, lang })}
        ${credibilitySection({ data: homepage, lang })}
        ${b2bSection({ data: homepage, categories, lang, formspreeUrl })}
      `,
    });
  },
};
