/**
 * Renders a DOM node to a real, downloadable multi-page A4 PDF — used by the diagnostic
 * report's "Download PDF" button so the visitor gets an actual .pdf file rather than the
 * browser's print dialog.
 *
 * html2canvas + jsPDF are loaded lazily (dynamic import) so ~500KB of PDF machinery only
 * enters the bundle when someone actually clicks download. The report card is styled with
 * literal hex colours only, so html2canvas has nothing (oklch/lab) it can't parse.
 */
export async function downloadReportPdf(node, filename = 'diagnostic-report.pdf') {
  if (!node) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

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

  if (imgH <= pageH) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
  } else {
    let renderedPx = 0;
    let first = true;
    while (renderedPx < canvas.height) {
      const slicePx = Math.min(pageHeightPx, canvas.height - renderedPx);
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
  const parts = [report?.childName, report?.pathwayName, 'diagnostic']
    .filter(Boolean)
    .join(' ')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${parts || 'diagnostic-report'}.pdf`;
}
