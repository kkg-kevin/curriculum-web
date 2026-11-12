/**
 * Rich text written by staff in the portal (an event's description), cleaned before it's shown:
 * only plain formatting tags, no scripts, frames, styles or event handlers, and links only to
 * http(s) / mailto / tel. Falls back to escaped text where there's no DOMParser.
 */
const ALLOWED = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'A', 'SPAN', 'IMG', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'HR']);
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LINK', 'META', 'BASE', 'SVG', 'MATH', 'TEMPLATE', 'NOSCRIPT']);
const ATTRS = { A: ['href'], IMG: ['src', 'alt'], TD: ['colspan', 'rowspan'], TH: ['colspan', 'rowspan'] };
const SAFE_URL = /^(https?:|mailto:|tel:|\/(?!\/))/i;

const escape = (text) => String(text || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function safeHtml(html) {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') return escape(html);
  const doc = new window.DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  // Children first, so an element that's unwrapped only ever lifts already-cleaned content.
  const clean = (el) => {
    [...el.children].forEach(clean);
    if (el === root) return;
    if (DROP.has(el.tagName)) { el.remove(); return; }
    if (!ALLOWED.has(el.tagName)) { el.replaceWith(...el.childNodes); return; }
    [...el.attributes].forEach((attr) => {
      const keep = (ATTRS[el.tagName] || []).includes(attr.name);
      if (!keep || (['href', 'src'].includes(attr.name) && !SAFE_URL.test(attr.value.trim()))) el.removeAttribute(attr.name);
    });
    if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
  };
  clean(root);
  return root.innerHTML;
}
