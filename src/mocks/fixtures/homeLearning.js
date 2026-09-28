/**
 * Offline mock for GET /api/public/home-learning/packages[/:idOrSlug] — the designated admin's
 * Home Learning packages ticked "Show on the website" in the portal's Home Learning → Packages.
 * Shape mirrors the real projection (server/src/modules/home-learning/home-learning.pricing.js).
 */
export const homeLearningPackages = [
  {
    id: 'h0000000-0001-4000-8000-000000000001',
    slug: 'one-child',
    name: 'One child',
    summary: 'Monthly Home Learning for 1 child.',
    description: '',
    childrenIncluded: 1,
    monthlyAmount: 8000,
    currency: 'KES',
    allowExtraChildren: false,
    extraChildAmount: null,
    maxChildren: 1,
    features: ['Home visits by a Digifunzi educator', 'Structured curriculum at the right level', 'Progress reports'],
    badge: null,
  },
  {
    id: 'h0000000-0001-4000-8000-000000000002',
    slug: 'three-children',
    name: 'Three children',
    summary: 'Monthly Home Learning for 3 children.',
    description: '',
    childrenIncluded: 3,
    monthlyAmount: 15000,
    currency: 'KES',
    allowExtraChildren: false,
    extraChildAmount: null,
    maxChildren: 3,
    features: ['Home visits by a Digifunzi educator', 'Each child learns at their own level', 'Progress reports'],
    badge: 'Most popular',
  },
  {
    id: 'h0000000-0001-4000-8000-000000000003',
    slug: 'five-children',
    name: 'Five children',
    summary: 'Monthly Home Learning for 5 children.',
    description: '',
    childrenIncluded: 5,
    monthlyAmount: 24000,
    currency: 'KES',
    allowExtraChildren: true,
    extraChildAmount: 7000,
    maxChildren: 20,
    features: ['Home visits by a Digifunzi educator', 'Each child learns at their own level', 'Progress reports'],
    badge: null,
  },
];

export function homeLearningPackageDetail(idOrSlug) {
  return homeLearningPackages.find((pkg) => pkg.slug === idOrSlug || pkg.id === idOrSlug) || null;
}
