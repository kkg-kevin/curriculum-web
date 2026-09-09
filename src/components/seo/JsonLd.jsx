import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../../config/env.js';
import { ORG } from '../../config/site.js';

/**
 * Injects a JSON-LD <script> into <head> (spec §7).
 * Pass a plain object; it is serialised safely.
 */
export default function JsonLd({ data }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(payload.length === 1 ? payload[0] : payload)}
      </script>
    </Helmet>
  );
}

// ---- Builders ---------------------------------------------------------------

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG.name,
    legalName: ORG.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}${ORG.logoPath}`,
    email: ORG.email,
    telephone: ORG.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.address.streetAddress,
      addressLocality: ORG.address.addressLocality,
      addressRegion: ORG.address.addressRegion,
      postalCode: ORG.address.postalCode,
      addressCountry: ORG.address.addressCountry,
    },
    sameAs: ORG.sameAs,
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
      url: it.url?.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
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
    url: `${SITE_URL}${path}`,
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
    url: `${SITE_URL}${path}`,
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
            url: `${SITE_URL}${path}`,
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
