/**
 * /terms — port dari app/terms/page.js
 * Halaman ini noindex (masih stub, lihat CLAUDE.md "Legal Stub Pages").
 */
import { page } from '../layout.mjs';
import { legalPage } from '../partials/legal.mjs';
import { buildMeta } from '../lib/seo.mjs';
import { EYEBROW, TITLE, UPDATED_DATE, CONTENT } from '../content/terms.mjs';

export const route = {
  name: 'terms',
  path: '/terms',
  render({ settings, lang, buildYear, gaId }) {
    return page({
      meta: buildMeta({
        title: 'Terms of Service — PT. Harapan Karunia Makmur',
        description:
          'Terms of service for the HKM website. Please read these terms before using our services.',
        path: '/terms',
        noindex: true,
      }),
      lang,
      path: '/terms',
      settings,
      buildYear,
      gaId,
      body: legalPage({
        eyebrow: EYEBROW,
        title: TITLE,
        updatedDate: UPDATED_DATE,
        content: CONTENT,
        email: 'info@hkm.co.id',
        lang,
      }),
    });
  },
};
