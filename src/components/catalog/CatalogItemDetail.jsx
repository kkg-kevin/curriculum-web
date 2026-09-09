import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Section from '../common/Section.jsx';
import SmartImage from '../common/SmartImage.jsx';
import CTABanner from '../home/CTABanner.jsx';
import { catalogVisual } from '../common/catalogVisuals.js';
import PriceTag from './PriceTag.jsx';
import { PRICING_IS_PLACEHOLDER, interestForKind } from '../../content/catalog.js';
import { storeStatusLabel } from '../../utils/format.js';

/**
 * The shared detail-page body for anything Digifunzi sells — used by both
 * ProjectDetailPage (`/projects/:slug`) and StoreItemPage (`/store/:slug`) so
 * the two never drift apart. The parent supplies the item plus a small `nav`
 * describing where this section's breadcrumb / back button / CTA point.
 *
 * Layout: accent header band → gallery + sticky price card → what you get →
 * details/specs → where it's used + FAQ → closing CTA.
 */

function enquireHref(item) {
  return `/enroll?interestedIn=${interestForKind(item.kind, item.slug)}&referenceId=${encodeURIComponent(
    item.slug,
  )}`;
}

function ItemHero({ meta }) {
  const { Icon } = meta;
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        aspectRatio: '4 / 3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${meta.accent} 0%, ${meta.accent}CC 60%, ${meta.accent}99 100%)`,
        boxShadow: 'shadow.lg',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1.6px)',
          backgroundSize: '22px 22px',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-30%',
          left: '-10%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0%, transparent 66%)',
          pointerEvents: 'none',
        }}
      />
      <Icon aria-hidden sx={{ fontSize: { xs: 140, sm: 180 }, color: '#fff', position: 'relative' }} />
    </Box>
  );
}

function PriceCard({ item, meta }) {
  const contactTo = `/contact?subject=${encodeURIComponent(`${item.name} — enquiry`)}`;
  const soldOutish = item.status !== 'available';

  return (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: { md: 96 },
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: 'shadow.md',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
        <Chip size="small" label={meta.label} sx={{ fontWeight: 600 }} />
        <Chip
          size="small"
          label={storeStatusLabel(item.status)}
          color={soldOutish ? 'default' : 'success'}
          variant={soldOutish ? 'outlined' : 'filled'}
          sx={{ fontWeight: 600 }}
        />
        {item.audience && (
          <Chip size="small" variant="outlined" label={item.audience} sx={{ fontWeight: 600 }} />
        )}
      </Box>

      <PriceTag price={item.price} size="lg" sx={{ mb: 1 }} />

      {item.priceNote && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {item.priceNote}
        </Typography>
      )}

      <Button
        component={RouterLink}
        to={soldOutish ? contactTo : enquireHref(item)}
        variant="contained"
        size="large"
        fullWidth
        sx={{ mb: 1 }}
      >
        {soldOutish ? 'Notify me when available' : 'Enquire to buy'}
      </Button>
      <Button component={RouterLink} to={contactTo} variant="text" size="small" fullWidth>
        Ask a question first
      </Button>

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {PRICING_IS_PLACEHOLDER
          ? 'Online checkout is coming soon. Send an enquiry and we’ll confirm the price, take payment and set you up — usually within one working day.'
          : 'We’ll confirm your order and payment details by email.'}
      </Typography>
    </Box>
  );
}

/**
 * @param {object}   props
 * @param {object}   props.item  a catalogue item (see src/content/catalog.js)
 * @param {object}   props.nav   { sectionLabel, sectionTo, backLabel, ctaSecondary: {label,to} }
 * @param {React.ReactNode} [props.extra]  section rendered just before the FAQ
 *                                         (e.g. a bundle's "projects included" list)
 */
export default function CatalogItemDetail({ item, nav, extra = null }) {
  const meta = catalogVisual(item);
  const gallery = [item.image, ...(item.gallery || [])].filter(Boolean);

  return (
    <>
      {/* header band with the kind accent */}
      <Box
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderTop: '4px solid',
          borderTopColor: meta.accent,
          py: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to={nav.sectionTo} underline="hover" color="inherit">
              {nav.sectionLabel}
            </Link>
            <Typography color="text.primary">{item.name}</Typography>
          </Breadcrumbs>
          <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
            {item.name}
          </Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 720 }}>
            {item.tagline}
          </Typography>
        </Container>
      </Box>

      <Section>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
            alignItems: 'start',
          }}
        >
          <Box>
            {gallery.length > 0 ? (
              <SmartImage src={gallery[0]} alt={item.name} eager ratio="4 / 3" />
            ) : (
              <ItemHero meta={meta} />
            )}
            {gallery.length > 1 && (
              <Box
                sx={{
                  mt: 2,
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                }}
              >
                {gallery.slice(1).map((src, i) => (
                  <SmartImage key={src} src={src} alt={`${item.name} — view ${i + 2}`} ratio="1 / 1" />
                ))}
              </Box>
            )}

            <Typography sx={{ color: 'text.secondary', mt: 3, whiteSpace: 'pre-line' }}>
              {item.description}
            </Typography>

            {item.highlights?.length > 0 && (
              <>
                <Typography variant="h4" component="h2" sx={{ mt: 4, mb: 2 }}>
                  Highlights
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {item.highlights.map((h) => (
                    <Box key={h} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', mt: 0.25, flexShrink: 0 }} />
                      <Typography color="text.secondary">{h}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>

          <PriceCard item={item} meta={meta} />
        </Box>
      </Section>

      {item.includes?.length > 0 && (
        <Section tone="subtle" py={{ xs: 6, md: 9 }}>
          <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
            What you get
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              maxWidth: 820,
            }}
          >
            {item.includes.map((inc) => (
              <Box
                key={inc}
                sx={{
                  p: 2.5,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2">{inc}</Typography>
              </Box>
            ))}
          </Box>
        </Section>
      )}

      {item.specs?.length > 0 && (
        <Section py={{ xs: 6, md: 9 }}>
          <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
            {item.nature === 'digital' ? 'Details' : 'Specifications'}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              maxWidth: 820,
            }}
          >
            {item.specs.map((s) => (
              <Box
                key={s.label}
                sx={{
                  p: 2.5,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography>{s.value}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Details are indicative and subject to confirmation.
          </Typography>
        </Section>
      )}

      {extra}

      {(item.usedIn?.length > 0 || item.faqs?.length > 0) && (
        <Section tone="subtle" py={{ xs: 6, md: 9 }}>
          {item.usedIn?.length > 0 && (
            <>
              <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
                Where it&apos;s used
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: item.faqs?.length ? 5 : 0 }}>
                {item.usedIn.map((u) => (
                  <Chip key={u} label={u} variant="outlined" />
                ))}
              </Box>
            </>
          )}

          {item.usedIn?.length > 0 && item.faqs?.length > 0 && <Divider sx={{ mb: 5 }} />}

          {item.faqs?.length > 0 && (
            <>
              <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
                Common questions
              </Typography>
              <Box sx={{ display: 'grid', gap: 3, maxWidth: 760 }}>
                {item.faqs.map((f) => (
                  <Box key={f.q}>
                    <Typography variant="h4" component="h3" gutterBottom>
                      {f.q}
                    </Typography>
                    <Typography color="text.secondary">{f.a}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Section>
      )}

      <CTABanner
        heading={`Interested in ${item.name}?`}
        body="Send an enquiry and we'll confirm pricing, arrange payment and get you set up — no account or commitment needed to ask."
        primary={{
          label: item.status === 'available' ? 'Enquire to buy' : 'Notify me',
          to: enquireHref(item),
        }}
        secondary={nav.ctaSecondary}
      />
    </>
  );
}

/** Small helper the bundle detail uses to link its included projects. */
export function BundledProjectsSection({ projects: list }) {
  if (!list?.length) return null;
  return (
    <Section py={{ xs: 6, md: 9 }}>
      <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
        Projects included
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, maxWidth: 820 }}>
        {list.map((p) => (
          <Box
            key={p.slug}
            component={RouterLink}
            to={`/projects/${p.slug}`}
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              textDecoration: 'none',
              color: 'text.primary',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
            }}
          >
            <Box>
              <Typography variant="h4" component="h3">
                {p.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.tagline}
              </Typography>
            </Box>
            <ArrowForwardIcon sx={{ flexShrink: 0, color: 'primary.main' }} />
          </Box>
        ))}
      </Box>
    </Section>
  );
}
