// Home Schooling helpers. The packages themselves come from the curriculum system
// (GET /api/public/home-learning/packages — see src/hooks/usePublicHomeLearning.js), where the
// team creates, prices and publishes them.

export function formatKsh(amount) {
  return `KSh ${Number(amount).toLocaleString('en-KE')}`;
}

export function childrenLabel(count) {
  return `${count} ${Number(count) === 1 ? 'child' : 'children'}`;
}

/** Link to the Home Schooling enquiry form, optionally pre-selecting a package by slug. */
export function homeSchoolingEnquiryPath(packageSlug) {
  const query = `interestedIn=home_schooling&enquiry=1${packageSlug ? `&package=${encodeURIComponent(packageSlug)}` : ''}`;
  return `/enroll?${query}`;
}

/**
 * The enquiry note for a chosen package. Keep the "<n> child/children" wording: the curriculum
 * system reads it for the number of children when turning the enquiry into a household.
 */
export function packageEnquiryNote(pkg) {
  const extra = pkg.allowExtraChildren && pkg.extraChildAmount != null
    ? ` Additional children are ${formatKsh(pkg.extraChildAmount)} per month each.`
    : '';
  return `Home Schooling package: ${pkg.name} (${childrenLabel(pkg.childrenIncluded)}) at ${formatKsh(pkg.monthlyAmount)} per month.${extra}`;
}
