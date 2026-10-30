/**
 * The diagnostic report's result bands and score colours — shared by the on-screen card
 * (DiagnosticReport) and the printed document (DiagnosticReportDocument) so both always agree.
 * Literal hex only (html2canvas).
 */
export const BANDS = [
  {
    label: 'Early days',
    range: '0–39%',
    min: 0,
    color: '#DC2626',
    soft: '#FEF2F2',
    meaning: 'Most of this is new so far — a gentle, supported start will build confidence quickly.',
  },
  {
    label: 'Getting started',
    range: '40–59%',
    min: 40,
    color: '#D97706',
    soft: '#FFFBEB',
    meaning: 'Some of the basics are already there, with a few gaps to fill first.',
  },
  {
    label: 'On track',
    range: '60–79%',
    min: 60,
    color: '#059669',
    soft: '#ECFDF5',
    meaning: 'A solid grasp of the basics — ready to build on them.',
  },
  {
    label: 'Strong start',
    range: '80–100%',
    min: 80,
    color: '#047857',
    soft: '#ECFDF5',
    meaning: 'A confident result — ready for more of a challenge.',
  },
];

export function pct(earned, possible) {
  return possible > 0 ? Math.round((earned / possible) * 100) : 0;
}

export function bandFor(percent) {
  return [...BANDS].reverse().find((b) => percent >= b.min) || BANDS[0];
}

export function scoreColor(percent) {
  return percent >= 60 ? '#059669' : percent >= 40 ? '#D97706' : '#DC2626';
}
