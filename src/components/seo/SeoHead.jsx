import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '../../config/env.js';
import { ORG } from '../../config/site.js';
import { pageUrl, pageDescription } from '../../utils/seo.js';

const DEFAULT_OG_IMAGE = `${SITE_URL}${ORG.ogImagePath}`;
// Google shows about 60 characters of a title; past that it's cut off mid-word.
const TITLE_MAX = 60;
// What a page with too short a description is filled out with, unless it passes its own `about`.
const DEFAULT_ABOUT = 'Digifunzi teaches robotics, AI and coding to kids aged 5–17 in Kenya.';

/**
 * Per-route <title>, description, canonical, Open Graph + Twitter Card tags.
 * Vite/React ship none of this out of the box (spec §3, §7).
 *
 * Props:
 *  - title:        page title (" | Digifunzi" is appended unless titleTemplate=false, the
 *                  title already contains the brand name, or it would take the title past 60
 *                  characters — the brand is still og:site_name)
 *  - description:  meta description, written for humans — a string, or several in order of
 *                  preference ([tagline, description]). Long/admin-authored text is trimmed to
 *                  ~155 chars at a word boundary (utils/seo.js) — pass it whole, don't slice.
 *  - about:        one factual sentence about the kind of page, added when the description is
 *                  under ~110 chars (an admin's one-line tagline). Default: what Digifunzi does.
 *  - image:        OG image — an absolute URL, or a path relative to THIS site's
 *                  origin. API-hosted media (coverImage) must be resolved to an
 *                  absolute URL by the caller (utils/media.js) before it's passed.
 *  - noindex:      set true for thin/utility pages (these also get no canonical or og:url —
 *                  pointing either at a page you've asked not to be indexed is a mixed signal)
 *  - canonicalPath override (defaults to current pathname, query stripped)
 *  - type:         og:type (default "website")
 */
export default function SeoHead({
  title,
  description,
  about = DEFAULT_ABOUT,
  image,
  noindex = false,
  canonicalPath,
  type = 'website',
  titleTemplate = true,
  children,
}) {
  const location = useLocation();
  const canonical = pageUrl(canonicalPath ?? location.pathname);
  const brandInTitle = title?.toLowerCase().includes(ORG.name.toLowerCase());
  const branded = `${title} | ${ORG.name}`;
  const fullTitle = titleTemplate && title && !brandInTitle && branded.length <= TITLE_MAX ? branded : title || ORG.name;
  const desc = pageDescription(description, about) || pageDescription(ORG.description);
  const img = image || DEFAULT_OG_IMAGE;
  const absImage = img.startsWith('http') ? img : `${SITE_URL}${img}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {!noindex && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,follow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={ORG.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {!noindex && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={absImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={absImage} />

      {children}
    </Helmet>
  );
}
