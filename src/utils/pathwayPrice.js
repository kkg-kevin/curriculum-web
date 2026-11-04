import { formatKsh } from '../cart/format.js';
import { ageOn } from './dates.js';

// How a pathway is sold on the website: its subscription plans (Billing → Packages → Pathway plans
// in the curriculum system). The one-off price (Settings → Pathways → Price, `price` on a pathway)
// was removed on 4 Nov 2026 — a pathway without plans takes an enquiry.

// Where a learner born on `dateOfBirth` starts on the pathway: their stage by age and its first
// course. A guide shown before signing up — the server (which also uses a diagnostic result) decides.
export function startFor(pathway, dateOfBirth) {
  const age = dateOfBirth ? ageOn(dateOfBirth) : null;
  if (age == null || !pathway) return null;
  const stages = (pathway.stages || []).filter((s) => (s.courses || []).length);
  const stage = stages.find((s) => s.minAge != null && s.maxAge != null && age >= s.minAge && age <= s.maxAge)
    || (stages.length === 1 && !stages[0].name ? stages[0] : null);
  if (!stage) return { age, stage: null, course: null };
  return { age, stage, course: stage.courses[0] };
}

// ---- Subscription plans (Billing → Packages → Pathways in the curriculum system) -------------
// A pathway's `plans`: [{ id, name, amount, billingPeriod, childrenIncluded, allowExtraChildren,
// extraChildAmount, maxChildren, features, badge, currency }] — paid every period, access renews
// while the family pays. `subscription` on a pathway: { from, billingPeriod, currency, count }.

const PERIOD_UNIT = { weekly: 'week', monthly: 'month', quarterly: 'quarter', annually: 'year' };
export const periodUnit = (billingPeriod) => PERIOD_UNIT[billingPeriod] || 'month';

export const hasPlans = (pathway) => (pathway?.plans || []).length > 0;

// Sold online: a published plan, and hubs to choose from.
export const isSoldOnline = (pathway) => hasPlans(pathway) && (pathway?.hubs || []).length > 0;

// What a plan costs a family with `count` children, per period — the server's priceForPackage.
// null when the plan can't take that many.
export function planPrice(plan, count) {
  if (!plan) return null;
  const n = Number(count) || 1;
  if (n <= plan.childrenIncluded) return plan.amount;
  if (!plan.allowExtraChildren || n > plan.maxChildren) return null;
  return plan.amount + (n - plan.childrenIncluded) * (plan.extraChildAmount || 0);
}

// "KSh 3,000 a month"
export const planLabel = (plan, amount = plan?.amount) => (plan ? `${formatKsh(amount, plan.currency)} a ${periodUnit(plan.billingPeriod)}` : null);

// "From KSh 3,000 / month" — the cheapest plan, for cards and chips.
export const subscriptionShort = (sub) => (sub ? `From ${formatKsh(sub.from, sub.currency)} / ${periodUnit(sub.billingPeriod)}` : null);

// "1 child" / "Up to 3 children"
export const planChildren = (plan) => (plan.allowExtraChildren && plan.maxChildren > plan.childrenIncluded
  ? `${plan.childrenIncluded === 1 ? '1 child' : `${plan.childrenIncluded} children`} included, up to ${plan.maxChildren}`
  : plan.childrenIncluded === 1 ? '1 child' : `${plan.childrenIncluded} children`);
