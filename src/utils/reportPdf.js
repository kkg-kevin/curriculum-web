/**
 * Renders a DOM node to a real, downloadable multi-page A4 PDF — used by the diagnostic
 * report's "Download PDF" button so the visitor gets an actual .pdf file rather than the
 * browser's print dialog.
 *
 * html2canvas + jsPDF are loaded lazily (dynamic import) so ~500KB of PDF machinery only
 * enters the bundle when someone actually clicks download. The report card is styled with
 * literal hex colours only, so html2canvas has nothing (oklch/lab) it can't parse.
 *
 * Page breaks are CONTENT-AWARE: a naive "cut every N pixels" slice (the original approach here)
 * has no idea where one row ends and the next begins, so it was regularly cutting straight
 * through a competency row — splitting its text/score-bar across two pages, which reads as
 * overlapping/garbled content once the two halves are stacked. Every atomic unit that must never
 * be split (see DiagnosticReport.jsx's `data-pdf-block` elements — the hero, Result, Details,
 * each competency row, the footer) is measured in the live DOM first; a page break is only ever
 * placed in a GAP between two blocks, never inside one. A single block taller than a whole page
 * (unusual — e.g. a very long expanded competency) has no valid gap to use and falls back to a
 * raw pixel cut for just that block, same as the old behaviour, rather than failing outright.
 */
export async function downloadReportPdf(node, filename = 'diagnostic-report.pdf') {
  if (!node) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // Block boundaries measured BEFORE the canvas capture, in the live node's own coordinate
  // space (top/bottom relative to `node`, in CSS px) — html2canvas's `scale` option is applied
  // uniformly, so multiplying by `canvas.width / node.offsetWidth` (below) maps these cleanly
  // onto the captured canvas's pixel space regardless of the scale factor used.
  const nodeRect = node.getBoundingClientRect();
  const blocks = [...node.querySelectorAll('[data-pdf-block]')]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - nodeRect.top, bottom: r.bottom - nodeRect.top };
    })
    .sort((a, b) => a.top - b.top);

  const canvas = await html2canvas(node, {
    scale: 2, // crisp on retina / when zoomed
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Fit the capture to the page width; if it's taller than one page, slice it into
  // page-height strips and add a page per strip.
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const pageHeightPx = (canvas.width * pageH) / pageW; // source px that map to one PDF page
  const canvasScale = canvas.width / nodeRect.width; // CSS px -> canvas px (matches html2canvas's own `scale`)

  if (imgH <= pageH) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
  } else {
    // Never cut through a block: if the naive next-page boundary would land inside one, pull the
    // cut back to that block's own top instead — so the whole block carries over to the next
    // page together rather than being split across two. A block itself taller than one page
    // (rare) has no valid earlier cut point to retreat to, so it's left to spill across pages at
    // the naive boundary, same as before this fix.
    function nextCutPx(naiveCutPx, floorPx) {
      const straddling = blocks.find(
        (b) => b.top * canvasScale < naiveCutPx && b.bottom * canvasScale > naiveCutPx
      );
      if (!straddling) return naiveCutPx;
      const blockTopPx = straddling.top * canvasScale;
      return blockTopPx > floorPx ? blockTopPx : naiveCutPx;
    }

    let renderedPx = 0;
    let first = true;
    while (renderedPx < canvas.height) {
      const naiveCutPx = Math.min(renderedPx + pageHeightPx, canvas.height);
      const cutPx = naiveCutPx >= canvas.height ? naiveCutPx : nextCutPx(naiveCutPx, renderedPx);
      const slicePx = cutPx - renderedPx;

      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = slicePx;
      slice
        .getContext('2d')
        .drawImage(canvas, 0, renderedPx, canvas.width, slicePx, 0, 0, canvas.width, slicePx);
      const sliceH = (slicePx * imgW) / canvas.width;
      if (!first) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, 0, imgW, sliceH);
      renderedPx += slicePx;
      first = false;
    }
  }

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
