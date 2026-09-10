/**
 * The graded public-diagnostic report. Rendered in two places from the same props:
 *   1. inline on DiagnosticPage's REPORT step, straight from the
 *      POST /api/public/diagnostics/:slug/submit response `data`.
 *   2. on the standalone shareable page (DiagnosticReportPage), from
 *      GET /api/public/diagnostics/attempts/:attemptId.
 *
 * Visual language is a close port of the curriculum system's public shared-learner-
 * profile card (client/src/modules/learners/pages/PublicLearnerProfilePage.jsx):
 * one white rounded card, a dark-blue gradient hero with an initials avatar + hero
 * pills, then stacked sections divided by hairlines — "Snapshot", a score ring, and
 * "Competency areas" (each competency expandable to the indicators that fed it).
 * There is deliberately NO per-question section. Icons are inline SVG (no react-icons
 * dependency here) and every colour is literal hex — so html2canvas can capture it for
 * the "Download PDF" button, which lives inside the card's hero.
 *
 * Props:
 *   report — { pathwayName, assessmentName, totalScore, maxScore,
 *              competencyBreakdown[] (each { competencyId, name, marksEarned, marksPossible,
 *                indicators: [{ indicatorId, name, marksEarned, marksPossible }] }),
 *              indicatorBreakdown[] (flat fallback for older attempts / backends),
 *              childName?, childAge?, completedAt? }
 */
import { useRef, useState } from 'react';
import { downloadReportPdf, reportFilename } from '../../utils/reportPdf.js';

// Palette lifted from PublicLearnerProfilePage.jsx so the two pages read as one system.
const GRAD_FROM = '#1a3550';
const ACCENT = '#25476a';
const GRAD_TO = '#38aae1';
const BORDER = '#E5E7EB';
const INK = '#111827';
const INK_MUTED = '#6B7280';
const INK_FAINT = '#9CA3AF';
const GOOD = '#059669';
const WARN = '#D97706';
const BAD = '#DC2626';

const HERO_GRADIENT = `linear-gradient(135deg, ${GRAD_FROM} 0%, ${ACCENT} 45%, ${GRAD_TO} 100%)`;
const sectionStyle = { padding: '20px 24px', borderTop: '1px solid #F3F4F6' };

function pct(earned, possible) {
  return possible > 0 ? Math.round((earned / possible) * 100) : 0;
}

function bandLabel(percent) {
  if (percent >= 80) return 'Strong start';
  if (percent >= 60) return 'On track';
  if (percent >= 40) return 'Getting started';
  return 'Early days';
}

function scoreColor(percent) {
  return percent >= 60 ? GOOD : percent >= 40 ? WARN : BAD;
}

/* ---- inline icons (12px, currentColor) ------------------------------------ */
const Icon = {
  award: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
    </svg>
  ),
  checkCircle: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m22 4-10 10.01L9 11" />
    </svg>
  ),
  compass: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  download: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

function SectionHeading({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          backgroundColor: '#e8f5fb',
          color: ACCENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          color: GRAD_TO,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        {children}
      </h2>
    </div>
  );
}

// Initials disc on the hero gradient — a translucent fill + soft ring, exactly like the
// shared-profile Avatar (minus the photo layer, which a diagnostic has no source for).
function Avatar({ name }) {
  const initials =
    (name || '')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '★';
  return (
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.16)',
        border: '3px solid rgba(255,255,255,0.55)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        fontWeight: 800,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function HeroPill({ icon, label, sub }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 12,
        padding: '7px 12px',
      }}
    >
      <span style={{ color: '#fff', flexShrink: 0, display: 'flex' }}>{icon}</span>
      <div style={{ textAlign: 'left' }}>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{label}</p>
        {sub && <p style={{ margin: 0, fontSize: 10.5, color: 'rgba(255,255,255,0.68)', lineHeight: 1.3 }}>{sub}</p>}
      </div>
    </div>
  );
}

function IdentityRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: INK, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// Gold-ringed score dial — the diagnostic's answer to the shared-profile Progress Arc ring.
function ScoreRing({ percent }) {
  const size = 84;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);
  const color = scoreColor(clamped);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F0F2F5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 19, fontWeight: 800, color }}>{clamped}%</span>
      </div>
    </div>
  );
}

// A thin score bar — the exact 6px track/fill spec the shared-profile CompetencyRow uses.
function ScoreBar({ score, color }) {
  return (
    <div style={{ height: 6, borderRadius: 4, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, score))}%`, height: '100%', backgroundColor: color }} />
    </div>
  );
}

// One indicator sub-row inside an expanded competency — smaller, indented, its own mini bar.
function IndicatorSubRow({ name, earned, possible }) {
  const score = pct(earned, possible);
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: INK_MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
          {name || 'Indicator'}
        </p>
        <span style={{ fontSize: 11, color: INK_FAINT, whiteSpace: 'nowrap' }}>
          {earned} / {possible}
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color, whiteSpace: 'nowrap', width: 34, textAlign: 'right' }}>{score}%</span>
      </div>
      <ScoreBar score={score} color={color} />
    </div>
  );
}

// One competency — name + rolled-up score + a thin fill bar, and (when it has indicator
// sub-rows) an expandable disclosure showing how each indicator contributed. Uses a native
// <details>/<summary> so it works with zero JS and prints expanded-if-open.
function CompetencyGroup({ name, earned, possible, indicators = [] }) {
  const score = pct(earned, possible);
  const color = scoreColor(score);
  const hasIndicators = indicators.length > 0;

  const header = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          {hasIndicators && (
            <span className="dr-chevron" style={{ color: INK_FAINT, display: 'flex', flexShrink: 0, transition: 'transform 0.15s' }}>
              {Icon.chevron}
            </span>
          )}
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name || 'Competency'}
          </p>
        </div>
        <span style={{ fontSize: 11, color: ACCENT, whiteSpace: 'nowrap' }}>
          {earned} of {possible} marks
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color, whiteSpace: 'nowrap', width: 38, textAlign: 'right' }}>{score}%</span>
      </div>
      <ScoreBar score={score} color={color} />
    </div>
  );

  if (!hasIndicators) {
    return <div style={{ display: 'flex' }}>{header}</div>;
  }

  return (
    <details className="dr-group">
      <summary
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        {header}
      </summary>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
        {indicators.map((ind, i) => (
          <IndicatorSubRow
            key={ind.indicatorId || i}
            name={ind.name}
            earned={ind.marksEarned}
            possible={ind.marksPossible}
          />
        ))}
      </div>
    </details>
  );
}

export default function DiagnosticReport({ report }) {
  const {
    pathwayName,
    assessmentName,
    totalScore = 0,
    maxScore = 0,
    competencyBreakdown = [],
    indicatorBreakdown = [],
    childName,
    childAge,
    completedAt,
  } = report || {};

  const percent = pct(totalScore, maxScore);

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

  const displayName = childName || 'Diagnostic result';
  const metaLine = [pathwayName, childAge != null ? `Age ${childAge}` : null].filter(Boolean).join('  ·  ');
  const completedLabel = completedAt
    ? new Date(completedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadReportPdf(cardRef.current, reportFilename(report));
    } catch {
      // PDF generation failed (rare) — fall back to the browser's own print-to-PDF.
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      ref={cardRef}
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '100%',
        maxWidth: 760,
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }}
    >
      {/* hero */}
      <div style={{ background: HERO_GRADIENT, padding: '32px 24px 26px', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />

        {/* download — top-right of the hero. data-html2canvas-ignore keeps the button itself
            out of the captured PDF. */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          data-html2canvas-ignore="true"
          className="no-print"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 999,
            border: 'none',
            backgroundColor: '#fff',
            color: ACCENT,
            fontSize: 12.5,
            fontWeight: 800,
            fontFamily: 'inherit',
            cursor: downloading ? 'default' : 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {Icon.download}
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            position: 'relative',
            textAlign: 'center',
          }}
        >
          <Avatar name={displayName} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 900, color: '#fff' }}>{displayName}</h1>
            {metaLine && <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.72)' }}>{metaLine}</span>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
              <HeroPill
                icon={Icon.compass}
                label={`${totalScore} / ${maxScore} · ${percent}%`}
                sub={`${bandLabel(percent)}${completedLabel ? ` · ${completedLabel}` : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* result — the score ring is the one place the headline number lives (besides the hero
          pill). No separate "Snapshot" section: it only repeated the hero + this. */}
      <div style={sectionStyle}>
        <SectionHeading icon={Icon.compass}>Result</SectionHeading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <ScoreRing percent={percent} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: INK }}>
              {bandLabel(percent)} · {totalScore} of {maxScore} marks
            </p>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: INK_MUTED, lineHeight: 1.55 }}>
              A starting-point check, not a formal assessment — it helps place {childName || 'the learner'}{' '}
              at the right course in the {pathwayName} pathway.
            </p>
          </div>
        </div>
      </div>

      {/* the facts, compact — pushed below the result so the score reads first */}
      <div style={sectionStyle}>
        <SectionHeading icon={Icon.award}>Details</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px 16px' }}>
          <IdentityRow label="Pathway" value={pathwayName} />
          <IdentityRow label="Diagnostic" value={assessmentName} />
          {childName && <IdentityRow label="Learner" value={childName} />}
          {childAge != null && <IdentityRow label="Age" value={String(childAge)} />}
          {completedLabel && <IdentityRow label="Completed" value={completedLabel} />}
        </div>
      </div>

      {/* competency breakdown — each competency expandable to its indicators */}
      {groups.length > 0 && (
        <div style={sectionStyle}>
          <SectionHeading icon={Icon.checkCircle}>Competency areas</SectionHeading>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: INK_FAINT }}>
            Tap a competency to see how each skill within it contributed.
          </p>
          <style>{`
            .dr-group > summary::-webkit-details-marker { display: none; }
            .dr-group[open] .dr-chevron { transform: rotate(180deg); }
            @media print { .dr-group { break-inside: avoid; } }
          `}</style>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groups.map((g, i) => (
              <CompetencyGroup
                key={g.competencyId || i}
                name={g.name}
                earned={g.marksEarned}
                possible={g.marksPossible}
                indicators={g.indicators}
              />
            ))}
          </div>
        </div>
      )}

      <p
        style={{
          margin: 0,
          padding: '16px 24px',
          fontSize: 11,
          color: '#D1D5DB',
          textAlign: 'center',
          borderTop: '1px solid #F3F4F6',
        }}
      >
        Digifunzi · Diagnostic report
      </p>
    </div>
  );
}
