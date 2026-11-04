/**
 * DOMPurify wrapper for sanitizing CMS-sourced HTML strings.
 * Uses isomorphic-dompurify (jsdom on server, browser DOM on client).
 *
 * Usage:
 *   import { sanitizeHtml } from '@/lib/sanitize';
 *   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(cmsTitleField) }} />
 *
 * DO NOT use on JSON-LD scripts — JSON.stringify already escapes all HTML
 * characters and DOMPurify would corrupt the JSON structure.
 */
import DOMPurify from 'isomorphic-dompurify';

// For section headlines: <br>, <span> (cyan accent), <strong>, <em> only.
const HEADLINE_CONFIG = {
  ALLOWED_TAGS: ['br', 'span', 'strong', 'em'],
  ALLOWED_ATTR: ['class', 'style'],
};

// For body copy / paragraphs that may contain links.
const BODY_CONFIG = {
  ALLOWED_TAGS: ['br', 'span', 'strong', 'em', 'p', 'a'],
  ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel'],
  FORCE_BODY: false,
};

// For inline text with light markdown (bold via ** replacement).
const INLINE_CONFIG = {
  ALLOWED_TAGS: ['strong', 'em', 'span', 'br'],
  ALLOWED_ATTR: ['class', 'style'],
};

export function sanitizeHtml(html, mode = 'headline') {
  if (!html) return '';
  const config =
    mode === 'body' ? BODY_CONFIG : mode === 'inline' ? INLINE_CONFIG : HEADLINE_CONFIG;
  return DOMPurify.sanitize(html, config);
}
