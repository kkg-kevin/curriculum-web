// Home Schooling helpers and page copy. The packages themselves come from the curriculum system
// (GET /api/public/home-learning/packages — see src/hooks/usePublicHomeLearning.js), where the
// team creates, prices and publishes them.

export function formatKsh(amount) {
  return `KSh ${Number(amount).toLocaleString('en-KE')}`;
}

export function childrenLabel(count) {
  return `${count} ${Number(count) === 1 ? 'child' : 'children'}`;
}

/*
 * How often a package is billed (`billingPeriod`, set by the team in the curriculum system):
 * weekly, monthly, quarterly or yearly on the website (a daily package is never published).
 * `amount` is the price per period. Packages on different periods are compared by what they come
 * to over a month.
 */
const UNIT = { daily: 'day', weekly: 'week', monthly: 'month', quarterly: 'quarter', annually: 'year' };
const PER_MONTH = { daily: 30, weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, annually: 1 / 12 };

export const periodOf = (pkg) => pkg?.billingPeriod || 'monthly';

/** "month", "week", … for a package or a billingPeriod. */
export function periodUnit(pkgOrPeriod) {
  const period = typeof pkgOrPeriod === 'string' ? pkgOrPeriod : periodOf(pkgOrPeriod);
  return UNIT[period] || 'month';
}

/** What an amount on `billingPeriod` comes to over a month — only for comparing packages. */
export function monthlyEquivalent(amount, billingPeriod) {
  return Number(amount) * (PER_MONTH[billingPeriod] ?? 1);
}

/** The cheapest package price on offer: { amount, billingPeriod } or null. */
export function cheapestPrice(packages) {
  let best = null;
  for (const pkg of packages || []) {
    const price = { amount: pkg.amount, billingPeriod: periodOf(pkg) };
    if (!best || monthlyEquivalent(price.amount, price.billingPeriod) < monthlyEquivalent(best.amount, best.billingPeriod)) best = price;
  }
  return best;
}

/** The cheapest extra-child price on offer: { amount, billingPeriod } or null. */
export function cheapestExtra(packages) {
  return cheapestPrice((packages || []).filter((p) => p.allowExtraChildren && p.extraChildAmount != null).map((p) => ({ ...p, amount: p.extraChildAmount })));
}

/** "From KSh 2,500 a week" — `price` from cheapestPrice. */
export function fromLabel(price, joiner = ' a ') {
  return price ? `From ${formatKsh(price.amount)}${joiner}${periodUnit(price.billingPeriod)}` : '';
}

/** "monthly", "weekly", … when every package shares one period, else null. */
export function sharedPeriodWord(packages) {
  const periods = new Set((packages || []).map(periodOf));
  if (periods.size !== 1) return null;
  return { weekly: 'weekly', monthly: 'monthly', quarterly: 'quarterly', annually: 'yearly' }[[...periods][0]] || null;
}

/**
 * What a package costs for `requested` children — mirrors the curriculum system's
 * priceForPackage (server/src/modules/home-learning/home-learning.pricing.js). A family smaller
 * than the package still pays for (and gets) the included places; more than that is only
 * possible on a package that takes extra children. Returns null when the package can't take them.
 */
export function priceForPackage(pkg, requested) {
  if (!pkg) return null;
  const count = requested == null || requested === '' ? pkg.childrenIncluded : Number(requested);
  if (!Number.isInteger(count) || count < 1) return null;
  const billingPeriod = periodOf(pkg);
  if (count <= pkg.childrenIncluded) return { childCount: pkg.childrenIncluded, amount: pkg.amount, billingPeriod };
  if (!pkg.allowExtraChildren || count > pkg.maxChildren) return null;
  return { childCount: count, amount: pkg.amount + (count - pkg.childrenIncluded) * (pkg.extraChildAmount || 0), billingPeriod };
}

/** The cheapest package for a family of `count` children: { pkg, price } or null. */
export function bestPackageFor(packages, count) {
  let best = null;
  for (const pkg of packages) {
    const price = priceForPackage(pkg, count);
    const cost = price && monthlyEquivalent(price.amount, price.billingPeriod);
    if (price && (!best || cost < monthlyEquivalent(best.price.amount, best.price.billingPeriod))) best = { pkg, price };
  }
  return best;
}

/** The largest family any published package can take. */
export function maxChildrenOffered(packages) {
  return packages.reduce((max, pkg) => Math.max(max, pkg.allowExtraChildren ? pkg.maxChildren || pkg.childrenIncluded : pkg.childrenIncluded), 0);
}

/** A package's price per child, per its own period. */
export function perChildAmount(pkg) {
  return Math.round(pkg.amount / pkg.childrenIncluded);
}

/**
 * What a child costs on the smallest package billed on the same period as `pkg` — what a bigger
 * family package's per-child price is compared with ("Save KSh … per child"). Never compares
 * packages on different periods.
 */
export function perChildBaseline(packages, pkg) {
  const same = (packages || []).filter((p) => periodOf(p) === periodOf(pkg));
  const minIncluded = Math.min(...same.map((p) => p.childrenIncluded));
  if (!same.length || pkg.childrenIncluded <= minIncluded) return perChildAmount(pkg);
  return Math.max(0, ...same.filter((p) => p.childrenIncluded === minIncluded).map(perChildAmount));
}

/** Whether a bigger family pays less per child on any published package. */
export function hasVolumeDiscount(packages) {
  return (packages || []).some((p) => perChildBaseline(packages, p) > perChildAmount(p));
}

/**
 * Link to the Home Schooling enquiry form, optionally pre-selecting a package by slug and the
 * number of children the family has (from the price calculator).
 */
export function homeSchoolingEnquiryPath(packageSlug, children) {
  const query = `interestedIn=home_schooling&enquiry=1${packageSlug ? `&package=${encodeURIComponent(packageSlug)}` : ''}${packageSlug && children ? `&children=${Number(children)}` : ''}`;
  return `/enroll?${query}`;
}

/** The Home Schooling sign-up form, optionally with a package and number of children chosen. */
export function homeSchoolingSignupPath(packageSlug, children) {
  if (!packageSlug) return '/home-schooling/signup';
  return `/home-schooling/signup?package=${encodeURIComponent(packageSlug)}${children ? `&children=${Number(children)}` : ''}`;
}

/**
 * The enquiry note for a chosen package. Keep the "<n> child/children" wording, and keep the
 * family's count as the FIRST such phrase: the curriculum system reads the first one for the
 * number of children when turning the enquiry into a household.
 */
export function packageEnquiryNote(pkg, children) {
  const unit = periodUnit(pkg);
  const extra = pkg.allowExtraChildren && pkg.extraChildAmount != null
    ? ` Additional children are ${formatKsh(pkg.extraChildAmount)} per ${unit} each.`
    : '';
  const price = children ? priceForPackage(pkg, children) : null;
  if (price) {
    return `Home Schooling for ${childrenLabel(Number(children))}: ${pkg.name} package at ${formatKsh(price.amount)} per ${unit}.${extra}`;
  }
  return `Home Schooling package: ${pkg.name} (${childrenLabel(pkg.childrenIncluded)}) at ${formatKsh(pkg.amount)} per ${unit}.${extra}`;
}

/*
 * Page copy. Every claim here describes something the Home Learning programme actually does in
 * the curriculum system (a visiting educator, a class per child at their own grade, attendance /
 * assessments / reports, one household invoice per billing period) — keep it that way when editing.
 */

export const homeSchoolingHero = {
  eyebrow: 'Home Schooling',
  heading: 'Learning that comes home',
  sub: 'A Digifunzi educator teaches your children at home, with each child on the right curriculum and level for them, and progress you can follow month by month.',
};

export const homeSchoolingBenefits = [
  {
    icon: 'home',
    title: 'An educator comes to you',
    body: 'A Digifunzi educator is assigned to your family and teaches your children in your own home.',
  },
  {
    icon: 'level',
    title: 'The right level for each child',
    body: 'Every child follows their own curriculum and grade, with their own courses — not a one-size-fits-all lesson.',
  },
  {
    icon: 'progress',
    title: 'Progress you can see',
    body: 'Attendance, assessments and progress reports are kept for every child, so you always know how they are doing.',
  },
  {
    icon: 'billing',
    title: 'One simple family fee',
    body: 'One package price for the whole family, with a single invoice each billing period — weekly, monthly, quarterly or yearly, depending on the package.',
  },
];

export const homeSchoolingSteps = [
  { title: 'Sign up', body: 'Choose your package and create logins for you and your children — it takes a few minutes.' },
  { title: 'Pay and get approved', body: 'Pay your first invoice. As soon as we confirm it, your logins unlock.' },
  { title: 'Meet your educator', body: 'We place each child at the right level and assign an educator to teach them at home.' },
  { title: 'Watch them grow', body: 'Lessons, assessments and reports build a clear picture of each child’s progress, month after month.' },
];

/** FAQ entries. `lowestExtra` is the cheapest extra-child price on offer — { amount, billingPeriod } (or null). */
export function homeSchoolingFaqs(lowestExtra) {
  return [
    {
      q: 'Who teaches my children?',
      a: 'A Digifunzi educator assigned to your family. They teach your children at home and follow the curriculum and level set for each child.',
    },
    {
      q: 'What will my children learn?',
      a: 'Each child is placed on a Digifunzi curriculum at the grade or level that suits them, with its own courses, assessments and progress reports.',
    },
    {
      q: 'Can I add another child later?',
      a: lowestExtra != null
        ? `Yes. Some packages let you add children for ${formatKsh(lowestExtra.amount)} per ${periodUnit(lowestExtra.billingPeriod)} each, or you can move to a larger package. Our team will confirm the new total, which starts from your next billing period.`
        : 'Yes — you can move to a larger package at any time. Our team will confirm the new total, which starts from your next billing period.',
    },
    {
      q: 'How does payment work?',
      a: 'Your family receives one invoice for each billing period of your package (every week, month, quarter or year) — the first one when you sign up, then automatically from the day you joined.',
    },
    {
      q: 'How do I sign up and pay?',
      a: 'Choose a package and click Sign up. You create logins for yourself (your email) and each child (a username), then pay the first month in cash to our team. Your logins unlock as soon as we confirm the payment — until then, signing in shows “payment pending”.',
    },
    {
      q: 'Can I ask questions before signing up?',
      a: 'Of course. Use “Ask a question” and our team will call you — it doesn’t commit you to anything.',
    },
  ];
}
