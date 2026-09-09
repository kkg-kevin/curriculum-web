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
 * pills, then stacked sections divided by hairlines — "Snapshot", a score ring,
 * "Competency areas", "Question by question". Icons are inline SVG (no react-icons
 * dependency here) and every colour is literal — the component carries no theme so it
 * renders identically inside a print / "Save as PDF" window.
 *
 * Props:
 *   report  — { pathwayName, assessmentName, totalScore, maxScore, itemResults[],
 *              indicatorBreakdown[], childName?, childAge?, completedAt? }
 *   items   — the question set's `items` (question text + kind); absent from itemResults itself
 *   answers — the visitor's own [{itemId, response}], for the "Your answer" line per row
 */

// Palette lifted from PublicLearnerProfilePage.jsx so the two pages read as one system.
const GRAD_FROM = '#1a3550';
const ACCENT = '#25476a';
const GRAD_TO = '#38aae1';
const GOLD = '#feb139';
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
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  checkCircle: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m22 4-10 10.01L9 11" />
    </svg>
  ),
  target: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  compass: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  list: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
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

// Gold icon chip + big number, matching the shared-profile "Portfolio Snapshot" Pill.
function SnapshotPill({ icon, label, value, sub }) {
  return (
    <div
      style={{
        backgroundColor: '#FAFBFF',
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          backgroundColor: '#FEF3E2',
          color: GOLD,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: INK }}>{value}</p>
        {sub && <p style={{ margin: '1px 0 0', fontSize: 11, color: INK_MUTED }}>{sub}</p>}
      </div>
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

// One row per competency indicator — name + score + a thin fill bar, the exact 6px
// track/fill spec the shared-profile CompetencyRow uses.
function CompetencyRow({ name, earned, possible }) {
  const score = pct(earned, possible);
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name || 'Indicator'}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: ACCENT }}>
            {earned} of {possible} marks
          </p>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{score}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, Math.max(0, score))}%`, height: '100%', backgroundColor: color }} />
      </div>
    </div>
  );
}

function formatResponse(response) {
  if (response == null || response === '') return <em style={{ color: INK_FAINT }}>No answer given</em>;
  if (Array.isArray(response)) {
    if (response.length && typeof response[0] === 'object') {
      return response.map((p) => `${p.left} → ${p.right}`).join(', ');
    }
    return response.join(', ');
  }
  return String(response);
}

function FeedbackRow({ index, item, response, result }) {
  const good = !!result?.correct;
  const marks = result?.marksAwarded ?? 0;
  const max = result?.maxMarks ?? 0;
  return (
    <div
      style={{
        padding: '12px 14px',
        backgroundColor: good ? '#F3FBF7' : '#FEF6F5',
        border: `1px solid ${good ? '#CDEFDF' : '#F8D7D3'}`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10.5,
            fontWeight: 800,
            color: '#fff',
            backgroundColor: good ? GOOD : BAD,
          }}
        >
          {index + 1}
        </span>
        <div
          style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 1.55 }}
          dangerouslySetInnerHTML={{ __html: item?.question || '' }}
        />
        <span style={{ fontSize: 11, fontWeight: 700, color: good ? GOOD : BAD, whiteSpace: 'nowrap' }}>
          {marks}/{max}
        </span>
      </div>
      <p style={{ margin: '0 0 0 26px', fontSize: 12.5, color: INK_MUTED }}>Your answer: {formatResponse(response)}</p>
    </div>
  );
}

export default function DiagnosticReport({ report, items = [], answers = [] }) {
  const {
    pathwayName,
    assessmentName,
    totalScore = 0,
    maxScore = 0,
    itemResults = [],
    indicatorBreakdown = [],
    childName,
    childAge,
    completedAt,
  } = report || {};

  const itemById = new Map(items.map((item) => [item.id, item]));
  const answerById = new Map(answers.map((a) => [a.itemId, a.response]));
  const percent = pct(totalScore, maxScore);
  const correctCount = itemResults.filter((r) => r.correct).length;

  const displayName = childName || 'Diagnostic result';
  const metaLine = [pathwayName, childAge != null ? `Age ${childAge}` : null].filter(Boolean).join('  ·  ');
  const completedLabel = completedAt
    ? new Date(completedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div
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
              <HeroPill icon={Icon.compass} label={`${totalScore} / ${maxScore}`} sub={`${percent}% · ${bandLabel(percent)}`} />
              {assessmentName && (
                <HeroPill
                  icon={Icon.checkCircle}
                  label={assessmentName}
                  sub={completedLabel || 'Starting-point diagnostic'}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* identity grid */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 16px' }}>
          <IdentityRow label="Pathway" value={pathwayName} />
          <IdentityRow label="Diagnostic" value={assessmentName} />
          {childName && <IdentityRow label="Learner" value={childName} />}
          {childAge != null && <IdentityRow label="Age" value={String(childAge)} />}
          {completedLabel && <IdentityRow label="Completed" value={completedLabel} />}
        </div>
      </div>

      {/* snapshot */}
      <div style={sectionStyle}>
        <SectionHeading icon={Icon.award}>Snapshot</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <SnapshotPill
            icon={Icon.target}
            label="Overall score"
            value={`${totalScore} / ${maxScore}`}
            sub={`${percent}% · ${bandLabel(percent)}`}
          />
          <SnapshotPill
            icon={Icon.check}
            label="Questions correct"
            value={`${correctCount} / ${itemResults.length}`}
            sub={itemResults.length ? `${pct(correctCount, itemResults.length)}% of questions` : undefined}
          />
          {indicatorBreakdown.length > 0 && (
            <SnapshotPill icon={Icon.award} label="Competency areas" value={indicatorBreakdown.length} sub="see the breakdown" />
          )}
        </div>
      </div>

      {/* score ring */}
      <div style={sectionStyle}>
        <SectionHeading icon={Icon.compass}>Result</SectionHeading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <ScoreRing percent={percent} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: INK }}>{bandLabel(percent)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: INK_MUTED, lineHeight: 1.5 }}>
              {correctCount} of {itemResults.length} questions correct — {totalScore} of {maxScore} marks. This is a
              starting-point check, not a formal assessment: it helps place a learner at the right course in the{' '}
              {pathwayName} pathway.
            </p>
          </div>
        </div>
      </div>

      {/* competency breakdown */}
      {indicatorBreakdown.length > 0 && (
        <div style={sectionStyle}>
          <SectionHeading icon={Icon.checkCircle}>Competency areas</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {indicatorBreakdown.map((entry, i) => (
              <CompetencyRow key={entry.indicatorId || i} name={entry.name} earned={entry.marksEarned} possible={entry.marksPossible} />
            ))}
          </div>
        </div>
      )}

      {/* per-question feedback */}
      {itemResults.length > 0 && (
        <div style={sectionStyle}>
          <SectionHeading icon={Icon.list}>Question by question</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {itemResults.map((result, i) => (
              <FeedbackRow
                key={result.itemId}
                index={i}
                item={itemById.get(result.itemId)}
                response={answerById.get(result.itemId)}
                result={result}
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
