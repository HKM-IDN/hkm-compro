/**
 * Thin wrappers around window.gtag so call-sites never reference window directly.
 * All functions are silent no-ops when gtag is absent (SSR, dev, or DNT-disabled).
 */

function dispatch(command, ...args) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag(command, ...args);
}

export function trackEvent(eventName, params = {}) {
  dispatch('event', eventName, params);
}

export function trackProductView({ id, name, category }) {
  trackEvent('view_item', {
    items: [{ item_id: id, item_name: name, item_category: category }],
  });
}

export function trackFormSubmit(formName) {
  trackEvent('form_submit', { form_name: formName });
}

export function trackOutboundClick(url, label) {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: label || url,
    transport_type: 'beacon',
  });
}
