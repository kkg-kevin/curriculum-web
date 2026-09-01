/** Display formatting helpers. */

export function ageLabel(min, max) {
  if (min == null && max == null) return '';
  if (min != null && max != null) return `Ages ${min}–${max}`;
  if (min != null) return `Ages ${min}+`;
  return `Up to age ${max}`;
}
