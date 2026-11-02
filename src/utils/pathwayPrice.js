import { formatKsh } from '../cart/format.js';
import { ageOn } from './dates.js';

// A pathway's price as the curriculum system sends it (`price` on a pathway — null when it isn't
// sold online): { mode: 'whole', currency, amount } — one price per learner for the pathway — or
// { mode: 'by_course', currency, from } — each course priced, a family pays for the course the
// learner starts at (courses carry their own `price`).

export const isPricedPathway = (pathway) => Boolean(pathway?.price);

// "KSh 15,000 per learner" / "From KSh 4,000 per course".
export function priceLabel(price) {
  if (!price) return null;
  return price.mode === 'whole'
    ? `${formatKsh(price.amount, price.currency)} per learner`
    : `From ${formatKsh(price.from, price.currency)} per course`;
}

// The short form for a chip or card: "KSh 15,000" / "From KSh 4,000".
export function priceShort(price) {
  if (!price) return null;
  return price.mode === 'whole' ? formatKsh(price.amount, price.currency) : `From ${formatKsh(price.from, price.currency)}`;
}

// Where a learner born on `dateOfBirth` starts on the pathway, and what that costs: their stage by
// age, its first course, and the price (the pathway's, or that course's). A guide shown before
// paying — the invoice (worked out on the server, which also uses a diagnostic result) is final.
export function startFor(pathway, dateOfBirth) {
  const age = dateOfBirth ? ageOn(dateOfBirth) : null;
  if (age == null || !pathway) return null;
  const stages = (pathway.stages || []).filter((s) => (s.courses || []).length);
  const stage = stages.find((s) => s.minAge != null && s.maxAge != null && age >= s.minAge && age <= s.maxAge)
    || (stages.length === 1 && !stages[0].name ? stages[0] : null);
  if (!stage) return { age, stage: null, course: null, amount: null };
  const course = stage.courses[0];
  const amount = pathway.price?.mode === 'whole' ? pathway.price.amount : course?.price ?? null;
  return { age, stage, course, amount };
}
