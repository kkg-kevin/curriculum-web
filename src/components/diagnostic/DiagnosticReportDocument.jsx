/**
 * The diagnostic report laid out as a printed document — what "Download PDF" captures, instead
 * of the on-screen card. Rendered off-screen only while a PDF is being made (DiagnosticReport),
 * at a fixed A4-proportioned width, so it always lays out the same whatever the visitor's screen.
 *
 * Unlike the card, nothing here is collapsed: every competency is listed with each of its skills,
 * so the parent has the whole picture on paper. The branded header and footer (logo, contact
 * details, page numbers) are drawn by reportPdf.js on every page, around this content.
 *
 * Same rules as the card: literal hex colours only (html2canvas can't parse oklch/lab), and every
 * unit that must never be split across two pages carries `data-pdf-block`.
 */
import { forwardRef } from 'react';
import { BANDS, bandFor, pct, scoreColor } from './reportBands.js';

const NAVY = '#1a3550';
const ACCENT = '#25476a';
const SKY = '#38aae1';
const SKY_SOFT = '#e8f5fb';
const INK = '#111827';
const INK_MUTED = '#4B5563';
const INK_FAINT = '#9CA3AF';
const LINE = '#E5E7EB';
const PANEL = '#F8FAFC';

/** CSS px width the document is laid out at — reportPdf.js scales it to the page's printable width. */
export const DOCUMENT_WIDTH = 720;

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 4,
            height: 18,
            borderRadius: 2,
            backgroundColor: SKY,
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            color: NAVY,
            letterSpacing: '-0.01em',
          }}
        >
          {children}
        </h2>
      </div>
      {sub && (
        <p
          style={{
            margin: '4px 0 0 14px',
            fontSize: 11.5,
            color: INK_FAINT,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function ScoreRing({ percent }) {
  const size = 112;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const color = scoreColor(clamped);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF2F6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
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
        <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{clamped}%</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: INK_FAINT,
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Score
        </span>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        padding: '10px 14px',
        borderLeft: `1px solid ${LINE}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: INK_FAINT,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 13,
          fontWeight: 700,
          color: INK,
          lineHeight: 1.35,
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

function Bar({ score, color, height = 8 }) {
  return (
    <div
      style={{
        height,
        borderRadius: height,
        backgroundColor: '#EEF2F6',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, score))}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height,
        }}
      />
    </div>
  );
}

// The four result bands as one scale, with the learner's band picked out.
function BandScale({ percent }) {
  const current = bandFor(percent);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {BANDS.map((b) => {
        const active = b.label === current.label;
        return (
          <div
            key={b.label}
            style={{
              flex: '1 1 0',
              padding: '10px 10px 9px',
              borderRadius: 10,
              backgroundColor: active ? b.soft : '#FFFFFF',
              border: `1.5px solid ${active ? b.color : LINE}`,
            }}
          >
            <div
              style={{
                height: 5,
                borderRadius: 3,
                backgroundColor: b.color,
                opacity: active ? 1 : 0.35,
                marginBottom: 7,
              }}
            />
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: active ? b.color : INK_MUTED,
              }}
            >
              {b.label}
            </div>
            <div style={{ fontSize: 10.5, color: INK_FAINT, marginTop: 1 }}>{b.range}</div>
          </div>
        );
      })}
    </div>
  );
}

function CompetencyBlock({ group, index }) {
  const score = pct(group.marksEarned, group.marksPossible);
  const color = scoreColor(score);
  const indicators = group.indicators || [];
  return (
    <div
      data-pdf-block
      style={{
        border: `1px solid ${LINE}`,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div style={{ padding: '12px 14px', backgroundColor: PANEL }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: SKY_SOFT,
              color: ACCENT,
              fontSize: 11,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13.5,
              fontWeight: 800,
              color: INK,
            }}
          >
            {group.name || 'Competency'}
          </span>
          <span style={{ fontSize: 11.5, color: INK_MUTED, whiteSpace: 'nowrap' }}>
            {group.marksEarned} of {group.marksPossible} marks
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 900,
              color,
              width: 46,
              textAlign: 'right',
            }}
          >
            {score}%
          </span>
        </div>
        <Bar score={score} color={color} />
      </div>
      {indicators.length > 0 && (
        <div style={{ padding: '4px 14px 8px' }}>
          {indicators.map((ind, i) => {
            const s = pct(ind.marksEarned, ind.marksPossible);
            const c = scoreColor(s);
            return (
              <div
                key={ind.indicatorId || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '7px 0',
                  borderTop: i === 0 ? 'none' : `1px solid #F1F3F5`,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 12,
                    color: INK_MUTED,
                    lineHeight: 1.4,
                  }}
                >
                  {ind.name || 'Skill'}
                </span>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <Bar score={s} color={c} height={6} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: INK_FAINT,
                    width: 44,
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ind.marksEarned}/{ind.marksPossible}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: c,
                    width: 38,
                    textAlign: 'right',
                  }}
                >
                  {s}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HighlightList({ title, tone, items, empty }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        padding: '12px 14px',
        borderRadius: 12,
        backgroundColor: tone.soft,
        border: `1px solid ${tone.border}`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: tone.color,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {items.length === 0 ? (
        <p
          style={{
            margin: 0,
            fontSize: 11.5,
            color: INK_MUTED,
            lineHeight: 1.5,
          }}
        >
          {empty}
        </p>
      ) : (
        items.map((g, i) => (
          <div
            key={g.competencyId || i}
            style={{
              display: 'flex',
              gap: 8,
              fontSize: 12,
              color: INK,
              lineHeight: 1.5,
              padding: '2px 0',
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>{g.name || 'Competency'}</span>
            <span style={{ fontWeight: 800, color: tone.color }}>{pct(g.marksEarned, g.marksPossible)}%</span>
          </div>
        ))
      )}
    </div>
  );
}

const DiagnosticReportDocument = forwardRef(function DiagnosticReportDocument(
  { report, groups, subjectName, subjectLabel, completedLabel },
  ref,
) {
  const { assessmentName, totalScore = 0, maxScore = 0, childName, childAge, pathwayName } = report || {};
  const percent = pct(totalScore, maxScore);
  const band = bandFor(percent);
  const learner = childName || 'the learner';

  const scored = groups.filter((g) => g.marksPossible > 0);
  const strengths = scored
    .filter((g) => pct(g.marksEarned, g.marksPossible) >= 60)
    .sort((a, b) => pct(b.marksEarned, b.marksPossible) - pct(a.marksEarned, a.marksPossible))
    .slice(0, 3);
  const focus = scored
    .filter((g) => pct(g.marksEarned, g.marksPossible) < 60)
    .sort((a, b) => pct(a.marksEarned, a.marksPossible) - pct(b.marksEarned, b.marksPossible))
    .slice(0, 3);

  return (
    <div
      ref={ref}
      style={{
        width: DOCUMENT_WIDTH,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: INK,
        backgroundColor: '#FFFFFF',
        // Set, not inherited from the site's theme: html2canvas places text lower than the
        // browser does as the line height grows, which pulls labels off their bars.
        lineHeight: 1.3,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* title + headline score */}
      <div data-pdf-block style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: SKY,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {subjectLabel} diagnostic report
            </div>
            <h1
              style={{
                margin: '6px 0 0',
                fontSize: 28,
                fontWeight: 900,
                color: NAVY,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {childName || 'Diagnostic result'}
            </h1>
            {subjectName && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: ACCENT,
                }}
              >
                {subjectName}
              </div>
            )}
            {/* a plain flex row around the badge: html2canvas paints an inline-flex box empty */}
            <div style={{ display: 'flex', marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 999,
                  backgroundColor: band.soft,
                  border: `1px solid ${band.color}`,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: band.color,
                  }}
                />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: band.color }}>{band.label}</span>
                <span style={{ fontSize: 12, color: INK_MUTED }}>
                  · {totalScore} of {maxScore} marks
                </span>
              </div>
            </div>
          </div>
          <ScoreRing percent={percent} />
        </div>

        <div
          style={{
            display: 'flex',
            border: `1px solid ${LINE}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: '1 1 0', minWidth: 0, padding: '10px 14px' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: INK_FAINT,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Learner
            </div>
            <div
              style={{
                marginTop: 3,
                fontSize: 13,
                fontWeight: 700,
                color: INK,
              }}
            >
              {childName || '—'}
            </div>
          </div>
          <Fact label="Age" value={childAge != null ? String(childAge) : null} />
          <Fact label="Diagnostic" value={assessmentName} />
          <Fact label="Completed" value={completedLabel} />
        </div>
      </div>

      {/* what the result means */}
      <div data-pdf-block>
        <SectionTitle sub={`Where ${learner}'s overall score sits.`}>What the result means</SectionTitle>
        <BandScale percent={percent} />
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 12.5,
            color: INK_MUTED,
            lineHeight: 1.6,
          }}
        >
          {band.meaning} This is a starting-point check, not a formal assessment — it helps place {learner}{' '}
          {pathwayName ? `at the right course in the ${pathwayName} pathway.` : `for ${subjectName || 'the programme'}.`}
        </p>
      </div>

      {/* strengths and focus areas */}
      {scored.length > 0 && (
        <div data-pdf-block>
          <SectionTitle>At a glance</SectionTitle>
          <div style={{ display: 'flex', gap: 10 }}>
            <HighlightList
              title="Doing well"
              tone={{ color: '#047857', soft: '#ECFDF5', border: '#A7F3D0' }}
              items={strengths}
              empty="No area reached 60% yet — every area is a place to grow."
            />
            <HighlightList
              title="Areas to work on"
              tone={{ color: '#B45309', soft: '#FFFBEB', border: '#FDE68A' }}
              items={focus}
              empty="Every area scored 60% or more — a strong start across the board."
            />
          </div>
        </div>
      )}

      {/* next steps */}
      <div
        data-pdf-block
        style={{
          padding: '14px 16px',
          borderRadius: 12,
          backgroundColor: SKY_SOFT,
          border: '1px solid #BFE3F5',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: NAVY,
            marginBottom: 4,
          }}
        >
          Next steps
        </div>
        <p style={{ margin: 0, fontSize: 12, color: INK_MUTED, lineHeight: 1.6 }}>
          Our team will use this result to recommend where {learner} should start. To talk it through or to enrol, contact us
          using the details below — we&apos;re happy to help.
        </p>
      </div>

      {/* every competency, with each skill that fed it */}
      {groups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div data-pdf-block>
            <SectionTitle sub="Each area's score, and how each skill within it went.">Competency areas</SectionTitle>
          </div>
          {groups.map((g, i) => (
            <CompetencyBlock key={g.competencyId || i} group={g} index={i} />
          ))}
        </div>
      )}
    </div>
  );
});

export default DiagnosticReportDocument;
