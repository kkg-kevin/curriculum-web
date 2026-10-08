/**
 * Site-wide metadata and organisation details — the single source of truth
 * consumed by the app's SEO components and by the build scripts
 * (scripts/generate-sitemap.js, scripts/prerender.js).
 *
 * This module is deliberately env-agnostic so Node scripts can import it too.
 * The public base URL is resolved separately via src/config/env.js (app) or
 * process.env (scripts).
 *
 * Domain: https://africa.digifunzi.com  (subdomain of digifunzi.com on Truehost;
 * the apex digifunzi.com is used by another system for now)
 *
 * TODO before launch (spec §9):
 *  - Fill in real address, phone, email and social links.
 *  - logoPath points at /logo.png (the mascot cropped from the brand
 *    illustration). Swap for a proper logo mark / wordmark SVG when ready.
 */

export const ORG = {
  name: 'Digifunzi',
  legalName: 'Digifunzi',
  description:
    'Digifunzi teaches robotics, coding and STEM to children across Kenya through structured learning pathways, competitions, buildable projects and the Quarky robot.',
  email: 'hello@digifunzi.com', // TODO confirm
  telephone: '+254-000-000000', // TODO confirm
  // Digits only, full international format, no "+" or spaces — used to build wa.me links
  // ("Speak to a mentor" on the diagnostic report). TODO: confirm the real WhatsApp line.
  whatsappNumber: '254000000000',
  address: {
    // TODO: real registered address for structured data (spec §9 item 2).
    streetAddress: 'TODO Street',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi County',
    postalCode: '00100',
    addressCountry: 'KE',
  },
  sameAs: [
    // TODO: real social profile URLs.
    'https://www.facebook.com/digifunzi',
    'https://www.instagram.com/digifunzi',
    'https://www.linkedin.com/company/digifunzi',
  ],
  // Relative to the site root; callers prefix with the base URL.
  logoPath: '/logo.png',
  // Default link-preview image (WhatsApp/Facebook/LinkedIn) for pages without their own cover.
  // The hero photo (1366×768) stands in until a purpose-made 1200×630 og-default.png is added to
  // public/ — point this at it then. Must be a file that really exists in public/: the host
  // answers a missing file with a 404, so a wrong path here silently kills every preview image.
  ogImagePath: '/hero-students.png',
};

/**
 * Static routes that always exist. Dynamic detail routes (/pathways/:slug,
 * /projects/:slug, /store/:slug) are appended by the sitemap / prerender
 * scripts — all three discovered from live API data (/api/public/*) at build
 * time, or from src/mocks/fixtures/* under VITE_USE_MOCK.
 *
 * changefreq / priority are advisory hints for sitemap.xml. `sitemap: false` keeps a route
 * prerendered but out of sitemap.xml — for pages that are deliberately noindex (listing a URL
 * you've asked search engines not to index is a contradictory signal).
 */
export const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/pathways', changefreq: 'weekly', priority: 0.9 },
  { path: '/projects', changefreq: 'weekly', priority: 0.9 },
  { path: '/bootcamps', changefreq: 'monthly', priority: 0.6 },
  { path: '/competitions', changefreq: 'monthly', priority: 0.7 },
  { path: '/home-schooling', changefreq: 'monthly', priority: 0.8 },
  { path: '/store', changefreq: 'weekly', priority: 0.9 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/enroll', sitemap: false }, // noindex — see EnrollPage
  { path: '/contact', changefreq: 'yearly', priority: 0.5 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms', changefreq: 'yearly', priority: 0.3 },
];

/** Fallback base URL if none is provided by env (e.g. a script run without .env). */
export const FALLBACK_SITE_URL = 'https://africa.digifunzi.com';

/** True while ORG.telephone is still the all-zero stand-in — nothing should show or publish it. */
export const isPlaceholderPhone = (tel) => /^(254)?0*$/.test(String(tel || '').replace(/\D/g, ''));

/**
 * A tap-to-call `tel:` URL for ORG.telephone, or null while the number is still the placeholder,
 * so callers can leave the phone line out rather than show a number nobody answers.
 */
export function phoneUrl() {
  if (isPlaceholderPhone(ORG.telephone)) return null;
  return `tel:+${ORG.telephone.replace(/\D/g, '')}`;
}

/**
 * A "click to chat" WhatsApp URL for ORG.whatsappNumber, with an optional pre-filled message.
 * Returns null when the number is still the placeholder, so callers can hide the CTA rather
 * than link somewhere broken.
 */
export function whatsAppUrl(message) {
  const n = (ORG.whatsappNumber || '').replace(/\D/g, '');
  if (!n || /^2540{6,}$/.test(n) || /^0+$/.test(n)) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${n}${q}`;
}
