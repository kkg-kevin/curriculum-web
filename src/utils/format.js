/** Display formatting helpers. */

export function ageLabel(min, max) {
  if (min == null && max == null) return '';
  if (min != null && max != null) return `Ages ${min}–${max}`;
  if (min != null) return `Ages ${min}+`;
  return `Up to age ${max}`;
}

/**
 * Format a Store price object `{ amount, currency, unit }` for display.
 * Returns just the money part, e.g. "KES 14,500" — callers append the unit
 * ("/ learner") and any "indicative" treatment themselves.
 *
 * `amount` is in the currency's major unit (KES shillings, not cents).
 */
export function formatPrice(price) {
  if (!price || typeof price.amount !== 'number') return '';
  const currency = price.currency || 'KES';
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price.amount);
  } catch {
    // Unknown currency code — fall back to "<CODE> <grouped number>".
    return `${currency} ${price.amount.toLocaleString('en-KE')}`;
  }
}

/** Short human label for a Store item's availability status. */
export function storeStatusLabel(status) {
  switch (status) {
    case 'preorder':
      return 'Pre-order';
    case 'coming-soon':
      return 'Coming soon';
    case 'available':
    default:
      return 'Available now';
  }
}
