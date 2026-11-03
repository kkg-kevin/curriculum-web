// A pathway's ages, worked out from its developmental stages (`stages[]` on a pathway from
// GET /api/public/pathways[/:slug] — each { slug, name, minAge, maxAge }). A stage with no ages
// set counts for nothing here: a pathway with none is "ages not set", never "any age".

// The oldest age the age picker offers; a stage running to this age or past it is "N+".
export const ADULT_AGE = 18;

const hasAges = (s) => s && s.minAge != null && s.maxAge != null;

/** "Ages 5–7", or "Ages 17+" for a stage that runs into adulthood. '' with no ages. */
export function stageAgeLabel(minAge, maxAge) {
  if (minAge == null && maxAge == null) return '';
  if (minAge != null && (maxAge == null || maxAge >= ADULT_AGE + 2)) return `Ages ${minAge}+`;
  if (minAge == null) return `Up to age ${maxAge}`;
  return minAge === maxAge ? `Age ${minAge}` : `Ages ${minAge}–${maxAge}`;
}

/** The short form for a stage chip: "5–7", "17+". */
export function stageAgeShort(minAge, maxAge) {
  return stageAgeLabel(minAge, maxAge).replace(/^Ages? /, '');
}

/** { minAge, maxAge } across every stage with ages, or null when none has. */
export function pathwayAgeRange(pathway) {
  const aged = (pathway?.stages || []).filter(hasAges);
  if (!aged.length) return null;
  return { minAge: Math.min(...aged.map((s) => s.minAge)), maxAge: Math.max(...aged.map((s) => s.maxAge)) };
}

/** The pathway's whole age span as a label: "Ages 5–16", "Ages 5+". '' with no ages set. */
export function pathwayAgeLabel(pathway) {
  const range = pathwayAgeRange(pathway);
  return range ? stageAgeLabel(range.minAge, range.maxAge) : '';
}

/** The stage a learner of `age` belongs in, or null. */
export function stageForAge(stages, age) {
  if (!Number.isFinite(age)) return null;
  return (stages || []).find((s) => hasAges(s) && age >= s.minAge && age <= s.maxAge) || null;
}

/** `?age=` from the address: a whole number from 3 to ADULT_AGE, else null. */
export function parseAge(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 3 && n <= ADULT_AGE ? n : null;
}
