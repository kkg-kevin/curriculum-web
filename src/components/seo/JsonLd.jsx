import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../../config/env.js';
import { ORG } from '../../config/site.js';
import { pageUrl } from '../../utils/seo.js';

/**
 * Injects a JSON-LD <script> into <head> (spec §7).
 * Pass a plain object; it is serialised safely.
 */
export default function JsonLd({ data }) {
  const payload = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(payload.length === 1 ? payload[0] : payload)}
      </script>
    </Helmet>
  );
}

// ---- Builders ---------------------------------------------------------------

// site.js still carries placeholder contact details (a "TODO Street" address, an all-zero phone
// number) until the real ones are confirmed. Publishing those as structured data is worse than
// leaving them out, so each is only emitted once it looks real.
const isPlaceholderPhone = (tel) => /^(254)?0*$/.test(String(tel || '').replace(/\D/g, ''));
const isPlaceholderText = (v) => !v || /\bTODO\b/i.test(v);

export function organizationSchema() {
  const { address } = ORG;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG.name,
    legalName: ORG.legalName,
    url: pageUrl('/'),
    logo: `${SITE_URL}${ORG.logoPath}`,
    email: ORG.email,
    ...(isPlaceholderPhone(ORG.telephone) ? {} : { telephone: ORG.telephone }),
    address: {
      '@type': 'PostalAddress',
      ...(isPlaceholderText(address.streetAddress) ? {} : { streetAddress: address.streetAddress }),
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
    sameAs: ORG.sameAs,
  };
}

/**
 * BreadcrumbList — mirrors the visible Home › Section › Item trail on detail pages so Google
 * can show it in place of the raw URL. `crumbs` is [{ name, path }], root first.
 */
export function breadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: pageUrl(c.path),
    })),
  };
}

/**
 * Event (or a subtype such as EducationEvent) for something that happens on real dates —
 * a bootcamp run at a hub, a competition season. Returns null when there's no startDate,
 * since an Event without one is invalid; callers filter nulls out.
 *
 * `location` is { name, address } when there's a real venue — never invented. Without one the
 * Event is still valid schema.org, it just won't qualify for Google's event rich result.
 */
export function eventSchema({ type = 'Event', name, description, startDate, endDate, image, path, location }) {
  if (!startDate) return null;
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    ...(description ? { description } : {}),
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    url: pageUrl(path),
    ...(image ? { image } : {}),
    ...(location?.name
      ? {
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: location.name,
            ...(location.address
              ? { address: { '@type': 'PostalAddress', streetAddress: location.address, addressCountry: 'KE' } }
              : {}),
          },
        }
      : {}),
    organizer: { '@type': 'Organization', name: ORG.name, url: pageUrl('/') },
  };
}

/**
 * ItemList schema — used on listing pages (e.g. Pathways) to tell search engines
 * the page is a curated list and what's in it. `items` is an array of
 * { name, url } (url root-relative or absolute).
 */
export function itemListSchema(items, { name } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(name ? { name } : {}),
    itemListElement: (items || []).map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: pageUrl(it.url),
    })),
  };
}

/**
 * Course schema for a Learning Pathway detail page. A pathway is a multi-course
 * track, so it's modelled as a Course with `hasCourseInstance`-style parts listed
 * via `hasPart` (each step is itself a Course).
 */
export function pathwayCourseSchema(pathway, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: pathway.name,
    description: pathway.description,
    url: pageUrl(path),
    provider: { '@type': 'Organization', name: ORG.name, sameAs: SITE_URL },
    ...(Array.isArray(pathway.courses) && pathway.courses.length > 0
      ? {
          hasPart: pathway.courses.map((c) => ({
            '@type': 'Course',
            name: c.name,
            ...(c.description ? { description: c.description } : {}),
            provider: { '@type': 'Organization', name: ORG.name, sameAs: SITE_URL },
          })),
        }
      : {}),
  };
}

/**
 * Product schema for a Store item (spec §7).
 *
 * `product` is a store item ({ name, description, image, price: { amount,
 * currency }, status }). An `offers` block is included only when there's a real
 * price AND pricing is not placeholder — advertising an indicative number as a
 * firm `Offer` would be misleading to search engines and shoppers.
 */
export function productSchema(product, path, { pricingIsPlaceholder = true } = {}) {
  const availabilityMap = {
    available: 'https://schema.org/InStock',
    preorder: 'https://schema.org/PreOrder',
    'coming-soon': 'https://schema.org/PreOrder',
  };
  const hasFirmPrice =
    !pricingIsPlaceholder && product.price && typeof product.price.amount === 'number';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: pageUrl(path),
    brand: { '@type': 'Brand', name: ORG.name },
    ...(product.image
      ? { image: product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}` }
      : {}),
    ...(hasFirmPrice
      ? {
          offers: {
            '@type': 'Offer',
            price: product.price.amount,
            priceCurrency: product.price.currency || 'KES',
            availability: availabilityMap[product.status] || 'https://schema.org/InStock',
            url: pageUrl(path),
          },
        }
      : {}),
  };
}

/**
 * FAQPage schema — can earn expandable Q&A results in Google.
 * `faqs` is an array of { q, a }. Only use where the Q&A is genuinely visible
 * on the page (Google's guideline).
 */
export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
