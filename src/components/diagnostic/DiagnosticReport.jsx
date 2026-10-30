/**
 * The graded public-diagnostic report. Rendered in three places from the same props:
 *   1. inline on DiagnosticPage's REPORT step, straight from the
 *      POST /api/public/diagnostics/:slug/submit response `data`;
 *   2. on BootcampEnrollPage's report step (against the bootcamp, not the pathway);
 *   3. on the standalone shareable page (DiagnosticReportPage), from
 *      GET /api/public/diagnostics/attempts/:attemptId.
 *
 * On screen it is the same document the PDF is: DiagnosticReportDocument in its "screen" variant
 * (as wide as this card, rows wrapping on a phone), between the same letterhead (wordmark, the
 * report's title) and footer (website, email, phone, office) that reportPdf.js draws on every PDF
 * page. So what a parent reads here is what they download. "Download PDF" lays the document out
 * again off screen in its "print" variant (fixed A4 width) and reportPdf.js puts it on branded A4
 * pages. Every colour is literal hex (html2canvas can't parse oklch/lab).
 *
 * Props:
 *   report — { pathwayName | bootcampName, assessmentName, totalScore, maxScore,
 *              competencyBreakdown[] (each { competencyId, name, marksEarned, marksPossible,
 *                indicators: [{ indicatorId, name, marksEarned, marksPossible }] }),
 *              indicatorBreakdown[] (flat fallback for older attempts / backends),
 *              childName?, childAge?, completedAt? }
 */
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { downloadReportPdf, reportContactLines, reportFilename } from '../../utils/reportPdf.js';
import DiagnosticReportDocument from './DiagnosticReportDocument.jsx';

const NAVY = '#1a3550';
const ACCENT = '#25476a';
const LINE = '#E5E7EB';
const INK = '#111827';
const INK_MUTED = '#4B5563';

const DownloadIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const longDate = (value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

export default function DiagnosticReport({ report }) {
  const {
    pathwayName,
    bootcampName,
    competencyBreakdown = [],
    indicatorBreakdown = [],
    childName,
    completedAt,
  } = report || {};

  // A pathway diagnostic attempt carries pathwayName, a bootcamp one carries bootcampName —
  // never both. Resolved once here so the rest of the component stays domain-agnostic.
  const subjectName = pathwayName || bootcampName;
  const subjectLabel = pathwayName ? 'Pathway' : 'Bootcamp';
  const title = `${subjectLabel} diagnostic report`;
  const subtitle = [childName, subjectName].filter(Boolean).join(' · ');

  // Prefer the competency-grouped breakdown. Fall back to the flat per-indicator list (an older
  // attempt or an older backend that didn't send competencyBreakdown) — render each indicator as
  // its own single-row "competency" with no children so the section still shows.
  const groups =
    competencyBreakdown.length > 0
      ? competencyBreakdown
      : indicatorBreakdown.map((ind) => ({
          competencyId: ind.indicatorId,
          name: ind.name,
          marksEarned: ind.marksEarned,
          marksPossible: ind.marksPossible,
          indicators: [],
        }));

  // A report just taken has no completedAt yet: it was completed today.
  const completedLabel = longDate(completedAt || Date.now());
  const { contactLine, tagline } = reportContactLines(' · ');

  const docRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // Let the off-screen document (rendered while `downloading`) mount and lay out first.
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      await downloadReportPdf(docRef.current, reportFilename(report), { title, subtitle });
    } catch {
      // PDF generation failed (rare) — fall back to the browser's own print-to-PDF.
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const documentProps = { report, groups, subjectName, subjectLabel, completedLabel };

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '100%',
        maxWidth: 760,
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${LINE}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }}
    >
      {/* letterhead — the PDF's page header: wordmark, the report's title, then Download PDF */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '16px clamp(16px, 4vw, 28px)',
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <img src="/wordmark.png" alt="Digifunzi" style={{ height: 26, width: 'auto', display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginLeft: 'auto' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11.5, color: INK_MUTED, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="no-print"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              backgroundColor: ACCENT,
              color: '#fff',
              fontSize: 12.5,
              fontWeight: 800,
              fontFamily: 'inherit',
              cursor: downloading ? 'default' : 'pointer',
              opacity: downloading ? 0.7 : 1,
            }}
          >
            {DownloadIcon}
            {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* the report itself — the same document as the PDF */}
      <div style={{ padding: 'clamp(16px, 4vw, 28px)' }}>
        <DiagnosticReportDocument {...documentProps} variant="screen" />
      </div>

      {/* footer — the PDF's page footer: where to find us */}
      <div style={{ padding: '14px clamp(16px, 4vw, 28px) 16px', borderTop: `1px solid ${LINE}`, backgroundColor: '#F8FAFC' }}>
        {contactLine && <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{contactLine}</div>}
        {tagline && <div style={{ fontSize: 11.5, color: INK_MUTED, marginTop: 3 }}>{tagline}</div>}
      </div>

      {/* The printed layout, mounted only while a PDF is being made — off screen, never seen. */}
      {downloading &&
        createPortal(
          <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: -10000, pointerEvents: 'none' }}>
            <DiagnosticReportDocument ref={docRef} {...documentProps} />
          </div>,
          document.body
        )}
    </div>
  );
}
