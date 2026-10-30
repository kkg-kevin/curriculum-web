import { ORG, isPlaceholderPhone } from '../config/site.js';
import { SITE_URL } from '../config/env.js';

/**
 * Renders a DOM node to a real, downloadable multi-page A4 PDF — used by the diagnostic
 * report's "Download PDF" button so the visitor gets an actual .pdf file rather than the
 * browser's print dialog. The node is DiagnosticReportDocument (the report laid out for paper),
 * not the on-screen card.
 *
 * Every page gets the Digifunzi letterhead: the wordmark and the report's title across the top,
 * the website, email, phone and office plus "Page n of N" along the bottom. These are drawn by
 * jsPDF itself (real text, crisp at any zoom), and the captured content is placed between them.
 *
 * html2canvas + jsPDF are loaded lazily (dynamic import) so ~500KB of PDF machinery only
 * enters the bundle when someone actually clicks download. The document is styled with
 * literal hex colours only, so html2canvas has nothing (oklch/lab) it can't parse.
 *
 * Page breaks are CONTENT-AWARE: every atomic unit that must never be split (the elements marked
 * `data-pdf-block` — the title, each section, each competency) is measured in the live DOM first;
 * a page break is only ever placed in a GAP between two blocks, never inside one. A single block
 * taller than a whole page (unusual) has no valid gap to use and falls back to a raw pixel cut
 * for just that block, rather than failing outright.
 */

const MARGIN_X = 40; // pt — left/right page margin
const HEADER_H = 64; // pt — space reserved at the top of every page for the letterhead
const FOOTER_H = 58; // pt — and at the bottom for the contact line + page number
const CONTENT_GAP = 14; // pt — breathing room between the letterhead and the content

const NAVY = [26, 53, 80];
const ACCENT = [37, 71, 106];
const SKY = [56, 170, 225];
const MUTED = [107, 114, 128];
const LINE = [229, 231, 235];

// The brand wordmark (public/wordmark.png, 2335×753) as a data URL — or null if it can't be
// loaded, in which case the header falls back to the name in bold type.
async function loadWordmark() {
  try {
    const res = await fetch('/wordmark.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new window.FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawHeader(pdf, { pageW, wordmark, title, subtitle }) {
  // A brand-coloured band along the very top edge: navy, finished with a sky-blue tail.
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, pageW * 0.72, 5, 'F');
  pdf.setFillColor(...SKY);
  pdf.rect(pageW * 0.72, 0, pageW * 0.28, 5, 'F');

  const logoH = 24;
  const logoY = 22;
  if (wordmark) {
    pdf.addImage(wordmark, 'PNG', MARGIN_X, logoY, (logoH * 2335) / 753, logoH);
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(...NAVY);
    pdf.text(ORG.name, MARGIN_X, logoY + 18);
  }

  const right = pageW - MARGIN_X;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(...ACCENT);
  pdf.text(title, right, logoY + 9, { align: 'right' });
  if (subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...MUTED);
    pdf.text(subtitle, right, logoY + 21, { align: 'right' });
  }

  pdf.setDrawColor(...LINE);
  pdf.setLineWidth(0.75);
  pdf.line(MARGIN_X, HEADER_H - 4, right, HEADER_H - 4);
}

function drawFooter(pdf, { pageW, pageH, page, pages, contactLine, addressLine }) {
  const right = pageW - MARGIN_X;
  const top = pageH - FOOTER_H + 10;

  pdf.setDrawColor(...LINE);
  pdf.setLineWidth(0.75);
  pdf.line(MARGIN_X, top, right, top);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...NAVY);
  pdf.text(contactLine, MARGIN_X, top + 16);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text(addressLine, MARGIN_X, top + 28);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...ACCENT);
  pdf.text(`Page ${page} of ${pages}`, right, top + 16, { align: 'right' });

  // The same brand band as the header, mirrored along the bottom edge.
  pdf.setFillColor(...SKY);
  pdf.rect(0, pageH - 5, pageW * 0.28, 5, 'F');
  pdf.setFillColor(...NAVY);
  pdf.rect(pageW * 0.28, pageH - 5, pageW * 0.72, 5, 'F');
}

/**
 * @param {HTMLElement} node      the laid-out document to capture
 * @param {string}      filename
 * @param {object}      meta      { title, subtitle } — the letterhead's right-hand text
 */
export async function downloadReportPdf(node, filename = 'diagnostic-report.pdf', meta = {}) {
  if (!node) return;

  const [{ default: html2canvas }, { jsPDF }, wordmark] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
    loadWordmark(),
  ]);

  // Block boundaries measured BEFORE the canvas capture, in the live node's own coordinate
  // space (top/bottom relative to `node`, in CSS px), then mapped onto the canvas below.
  const nodeRect = node.getBoundingClientRect();
  const blocks = [...node.querySelectorAll('[data-pdf-block]')]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - nodeRect.top, bottom: r.bottom - nodeRect.top };
    })
    .sort((a, b) => a.top - b.top);

  // html2canvas finds each font's baseline with a 1×1 data-GIF <img> it adds to this page for a
  // moment; the site's `img { display: block }` reset (global.css) pushes that image onto its own
  // line, so every line of text was painted a few px too low — off its bars and badges. This puts
  // just that probe image back inline while the capture runs; nothing else on the page matches.
  const probeFix = document.createElement('style');
  probeFix.textContent = 'img[src^="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP"] { display: inline !important; }';
  document.head.appendChild(probeFix);
  let canvas;
  try {
    canvas = await html2canvas(node, {
      scale: 2, // crisp on retina / when zoomed
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
  } finally {
    probeFix.remove();
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // The printable area between the letterhead and the footer.
  const contentTop = HEADER_H + CONTENT_GAP;
  const contentW = pageW - MARGIN_X * 2;
  const contentH = pageH - contentTop - FOOTER_H - CONTENT_GAP;

  const pageHeightPx = (canvas.width * contentH) / contentW; // canvas px that fit one page's content area
  const canvasScale = canvas.width / nodeRect.width; // CSS px -> canvas px (matches html2canvas's own `scale`)

  // Never cut through a block: if the naive page boundary would land inside one, pull the cut
  // back to that block's own top, so the whole block moves to the next page. A block taller than
  // a page has no earlier cut point to retreat to, so it spills at the naive boundary.
  function nextCutPx(naiveCutPx, floorPx) {
    const straddling = blocks.find((b) => b.top * canvasScale < naiveCutPx && b.bottom * canvasScale > naiveCutPx);
    if (!straddling) return naiveCutPx;
    const blockTopPx = straddling.top * canvasScale;
    return blockTopPx > floorPx ? blockTopPx : naiveCutPx;
  }

  const slices = [];
  let renderedPx = 0;
  while (renderedPx < canvas.height) {
    const naiveCutPx = Math.min(renderedPx + pageHeightPx, canvas.height);
    const cutPx = naiveCutPx >= canvas.height ? naiveCutPx : nextCutPx(naiveCutPx, renderedPx);
    slices.push([renderedPx, cutPx - renderedPx]);
    renderedPx = cutPx;
  }

  const host = (SITE_URL || '').replace(/^https?:\/\//, '');
  const contactLine = [host, ORG.email, isPlaceholderPhone(ORG.telephone) ? null : ORG.telephone].filter(Boolean).join('   ·   ');
  const { streetAddress, addressLocality, addressRegion } = ORG.address || {};
  const addressLine = [streetAddress, addressLocality, addressRegion, 'Kenya'].filter(Boolean).join(', ');
  const title = meta.title || 'Diagnostic report';

  slices.forEach(([fromPx, heightPx], i) => {
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = heightPx;
    slice.getContext('2d').drawImage(canvas, 0, fromPx, canvas.width, heightPx, 0, 0, canvas.width, heightPx);
    if (i > 0) pdf.addPage();
    pdf.addImage(
      slice.toDataURL('image/png'),
      'PNG',
      MARGIN_X,
      contentTop,
      contentW,
      (heightPx * contentW) / canvas.width,
      undefined,
      'FAST',
    );
    drawHeader(pdf, { pageW, wordmark, title, subtitle: meta.subtitle });
    drawFooter(pdf, {
      pageW,
      pageH,
      page: i + 1,
      pages: slices.length,
      contactLine,
      addressLine,
    });
  });

  pdf.setProperties({
    title: meta.subtitle ? `${title} — ${meta.subtitle}` : title,
    author: ORG.name,
    creator: ORG.name,
  });
  pdf.save(filename);
}

/** A filesystem-safe filename from the report's names. */
export function reportFilename(report) {
  const subjectName = report?.pathwayName || report?.bootcampName;
  const parts = [report?.childName, subjectName, 'diagnostic']
    .filter(Boolean)
    .join(' ')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${parts || 'diagnostic-report'}.pdf`;
}
