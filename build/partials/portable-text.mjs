/**
 * Serializer Portable Text → HTML string (server-side, saat build).
 *
 * Port 1:1 dari lib/portableText.js milik project Next (renderer custom,
 * bukan @portabletext/react). Markup keluaran dibuat sama persis:
 *  - block: normal → <p> (paragraf pertama dapat class drop cap), h2, h3, blockquote
 *  - list bullet/number → <ul>/<ol> (item berurutan dengan tipe sama digabung)
 *  - tiap span dibungkus <span>, mark format (strong/em/underline/code) di
 *    dalam, anotasi link di luar
 *  - image → <figure> + figcaption
 *  - statsHighlight → .inline-stats-block
 *
 * Semua teks di-escape lewat `html`. href link hanya diterima kalau
 * skemanya aman (http/https/mailto/tel atau path relatif).
 */
import { html, raw } from '../html.mjs';
import { urlFor } from '../sanity.mjs';
import { dimensions } from '../image.mjs';

const FORMAT_MARKS = new Set(['strong', 'em', 'underline', 'code']);

const CODE_STYLE =
  'font-family:var(--font-jetbrains-mono), monospace;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-size:0.875em';

/** Tolak javascript:/data: dsb. di link dari CMS. */
function safeHref(href) {
  if (!href || typeof href !== 'string') return null;
  const value = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (/^[/#?]/.test(value) && !value.startsWith('//')) return value;
  return null;
}

/** Bungkus teks dengan mark — format di dalam, anotasi (link) di luar. */
function renderInline(text, marks = [], markDefs = []) {
  let node = html`${text}`;
  if (!marks?.length) return node;

  const fmtMarks = marks.filter((m) => FORMAT_MARKS.has(m));
  const annMarks = marks.filter((m) => !FORMAT_MARKS.has(m));

  for (const mark of [...fmtMarks].reverse()) {
    if (mark === 'strong') node = html`<strong>${node}</strong>`;
    else if (mark === 'em') node = html`<em>${node}</em>`;
    else if (mark === 'underline') node = html`<span style="text-decoration:underline">${node}</span>`;
    else if (mark === 'code') node = html`<code style="${CODE_STYLE}">${node}</code>`;
  }

  for (const mark of annMarks) {
    const def = markDefs?.find((d) => d._key === mark);
    if (def?._type === 'link') {
      const href = safeHref(def.href);
      if (href) node = html`<a href="${href}" target="_blank" rel="noopener noreferrer">${node}</a>`;
    }
  }
  return node;
}

function renderChildren(block, markDefs) {
  if (!block.children) return raw('');
  return block.children.map((child) =>
    child._type === 'span'
      ? html`<span>${renderInline(child.text || '', child.marks, markDefs)}</span>`
      : raw('')
  );
}

/** Kelompokkan list item berurutan dengan tipe yang sama. */
function groupListItems(blocks) {
  const result = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.listItem) {
      const type = block.listItem;
      const items = [];
      while (i < blocks.length && blocks[i].listItem === type) {
        items.push(blocks[i]);
        i++;
      }
      result.push({ _type: 'list', listType: type, items });
    } else {
      result.push(block);
      i++;
    }
  }
  return result;
}

function renderImage(block) {
  if (!block.asset) return raw('');
  const { width, height } = dimensions(block) || { width: 900, height: 600 };
  const displayW = 900;
  const displayH = Math.round((displayW * height) / width);
  const url = (w) => urlFor(block).width(w).auto('format').url();

  return html`<figure style="margin:36px 0">
    <img
      src="${url(displayW)}"
      srcset="${url(640)} 640w, ${url(displayW)} 900w, ${url(1800)} 1800w"
      sizes="(max-width: 768px) 100vw, 740px"
      alt="${block.alt || ''}"
      width="${displayW}"
      height="${displayH}"
      loading="lazy"
      decoding="async"
      style="width:100%;height:auto;border-radius:12px;display:block"
    />
    ${block.caption
      ? html`<figcaption
          style="text-align:center;font-size:13px;color:#7C8694;margin-top:10px;font-family:var(--font-jetbrains-mono), monospace"
        >
          ${block.caption}
        </figcaption>`
      : raw('')}
  </figure>`;
}

function renderStats(block) {
  const stats = block.stats || [];
  return html`<div
    class="inline-stats-block"
    style="grid-template-columns:repeat(${Math.min(stats.length, 3)}, 1fr)"
  >
    ${stats.map(
      (s) => html`<div>
        <div class="is-num">${s.value}</div>
        <div class="is-label">${s.label}</div>
      </div>`
    )}
  </div>`;
}

function renderBlock(block, isFirst) {
  const markDefs = block.markDefs || [];

  if (block._type === 'block') {
    const children = renderChildren(block, markDefs);
    switch (block.style) {
      case 'h2':
        return html`<h2>${children}</h2>`;
      case 'h3':
        return html`<h3>${children}</h3>`;
      case 'blockquote':
        return html`<blockquote>${children}</blockquote>`;
      default:
        return isFirst
          ? html`<p class="article-prose-dropcap">${children}</p>`
          : html`<p>${children}</p>`;
    }
  }

  if (block._type === 'image') return renderImage(block);
  if (block._type === 'statsHighlight') return renderStats(block);
  return raw('');
}

function renderList(group) {
  const items = group.items.map(
    (item) => html`<li>${renderChildren(item, item.markDefs || [])}</li>`
  );
  return group.listType === 'number' ? html`<ol>${items}</ol>` : html`<ul>${items}</ul>`;
}

/**
 * Render array block Portable Text jadi HTML (hasil `html`, aman di-interpolasi).
 * @param {Array} blocks
 */
export function renderPortableText(blocks) {
  if (!Array.isArray(blocks)) return raw('');

  const grouped = groupListItems(blocks);
  // Paragraf normal pertama → drop cap (dicari dulu, supaya map() tetap murni)
  const firstIdx = grouped.findIndex(
    (b) => b._type === 'block' && (!b.style || b.style === 'normal') && !b.listItem
  );

  return grouped.map((block, i) =>
    block._type === 'list' ? renderList(block) : renderBlock(block, i === firstIdx)
  );
}
