/**
 * /privacy-policy — port dari app/privacy-policy/page.js
 * Halaman ini noindex (masih stub, lihat CLAUDE.md "Legal Stub Pages").
 */
import { page } from '../layout.mjs';
import { legalPage } from '../partials/legal.mjs';
import { buildMeta } from '../lib/seo.mjs';
import { EYEBROW, TITLE, UPDATED_DATE, CONTENT } from '../content/privacy-policy.mjs';

export const route = {
  name: 'privacy-policy',
  path: '/privacy-policy',
  render({ settings, lang, buildYear, gaId }) {
    return page({
      meta: buildMeta({
        title: 'Privacy Policy — PT. Harapan Karunia Makmur',
        description:
          'Privacy policy for the HKM website. Learn how we collect, use, and protect your personal data.',
        path: '/privacy-policy',
        noindex: true,
      }),
      lang,
      path: '/privacy-policy',
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
