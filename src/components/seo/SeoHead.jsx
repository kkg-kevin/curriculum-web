import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '../../config/env.js';
import { ORG } from '../../config/site.js';

const DEFAULT_OG_IMAGE = `${SITE_URL}${ORG.ogImagePath}`;

/**
 * Per-route <title>, description, canonical, Open Graph + Twitter Card tags.
 * Vite/React ship none of this out of the box (spec §3, §7).
 *
 * Props:
 *  - title:        page title (site name is appended unless titleTemplate=false)
 *  - description:  meta description, written for humans
 *  - image:        OG image — an absolute URL, or a path relative to THIS site's
 *                  origin. API-hosted media (coverImage) must be resolved to an
 *                  absolute URL by the caller (utils/media.js) before it's passed.
 *  - noindex:      set true for thin/utility pages
 *  - canonicalPath override (defaults to current pathname, query stripped)
 *  - type:         og:type (default "website")
 */
export default function SeoHead({
  title,
  description = ORG.description,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  canonicalPath,
  type = 'website',
  titleTemplate = true,
  children,
}) {
  const location = useLocation();
  const path = canonicalPath ?? location.pathname;
  const canonical = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path.replace(/\/$/, '')}`;
  const fullTitle = titleTemplate && title ? `${title} | ${ORG.name}` : title || ORG.name;
  const absImage = image?.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,follow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={ORG.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />

      {children}
    </Helmet>
  );
}
