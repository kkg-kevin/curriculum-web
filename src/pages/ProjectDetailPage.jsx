import { useParams, Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SeoHead from '../components/seo/SeoHead.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import { DetailHeading } from '../components/common/DetailSection.jsx';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import JsonLd, { organizationSchema, productSchema, breadcrumbSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import MediaGallery from '../components/media/MediaGallery.jsx';
import BuyBox from '../components/catalog/BuyBox.jsx';
import BuyAside from '../components/catalog/BuyAside.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { usePublicProject } from '../hooks/usePublicProjects.js';
import { usePublicStore } from '../hooks/usePublicStore.js';
import { ageLabel, formatPrice } from '../utils/format.js';
import { formatKsh } from '../cart/format.js';
import { resolveMediaUrl } from '../utils/media.js';
import { titleWithKind } from '../utils/seo.js';
import { projectPath, storeItemPath, STORE_PROJECTS_PATH } from '../utils/storePaths.js';
import { PROSE_MAX_WIDTH } from '../theme/layout.js';
import DetailLayout from '../components/common/DetailLayout.jsx';
import { RelatedInStore } from '../components/common/Related.jsx';
import { PRICING_IS_PLACEHOLDER } from '../content/catalog.js';

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// One numbered step in the project's build journey (a milestone).
function BuildStep({ index, total, step }) {
  const isLast = index === total - 1;
  return (
    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: '#fff',
            bgcolor: 'primary.main',
            zIndex: 1,
          }}
        >
          {index + 1}
        </Box>
        {!isLast && (
          <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', minHeight: 20, mt: 0.5 }} />
        )}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 3.5, minWidth: 0 }}>
        <Typography variant="h5" component="h3">
          {step.name}
        </Typography>
        {step.description && (
          <Typography sx={{ color: 'text.secondary', mt: 0.5, whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH }}>
            {step.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Stands in for the photo gallery when a project has no photos yet, so the top of the page isn't
// half empty: the brand band with the project's numbers on it.
function ProjectCoverArt({ facts }) {
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '4 / 3',
        borderRadius: 3,
        overflow: 'hidden',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        p: { xs: 2.5, sm: 3 },
        boxShadow: 'shadow.md',
        background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute', right: '-18%', top: '-40%', width: '75%', paddingBottom: '75%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      <BuildCircleOutlinedIcon aria-hidden sx={{ position: 'absolute', right: 24, top: 20, fontSize: 132, opacity: 0.22 }} />
      <Typography sx={{ position: 'relative', fontSize: 12, fontWeight: 800, letterSpacing: '0.09em', opacity: 0.85, mb: 1.5 }}>
        GUIDED BUILD PROJECT
      </Typography>
      <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))`, gap: 1.25 }}>
        {facts.map((f) => (
          <Box key={f.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 800, lineHeight: 1.1 }}>{f.value}</Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.85, mt: 0.25 }}>{f.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// A "What you get" tile — the same look as on a Store item's page.
function GetTile({ icon, title, body }) {
  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        '& > svg': { fontSize: 22, color: 'primary.main', mt: 0.25, flexShrink: 0 },
      }}
    >
      {icon}
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        {body && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{body}</Typography>}
      </Box>
    </Box>
  );
}

// A thing on "What you'll need" that the Store sells — matched by name, so a family can get it in
// the same order.
function findInStore(requirement, items) {
  const want = requirement.trim().toLowerCase();
  if (!want) return null;
  return (
    items.find((it) => it.name.toLowerCase() === want) ||
    items.find((it) => want.includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(want)) ||
    null
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, error, refetch } = usePublicProject(slug);
  const { data: storeItems = [] } = usePublicStore();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width="55%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="rounded" height={260} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Project not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This project doesn’t exist or isn’t for sale right now.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to={STORE_PROJECTS_PATH} variant="outlined">
            See all projects
          </Button>
        </Box>
      </Container>
    );
  }

  const {
    name, tagline, description, overview, level, ageMin, ageMax, coverImage, price,
    deliverables = [], milestones = [], requirements = [], gallery = [], kitPrice = null,
  } = data;

  const age = ageLabel(ageMin, ageMax);
  const path = projectPath(slug);
  const enquireTo = `/enroll?interestedIn=project&referenceId=${encodeURIComponent(slug)}`;
  const contactTo = `/contact?subject=${encodeURIComponent(`${name} — project enquiry`)}`;
  const buyItem = { id: data.id, slug, name, image: coverImage, price, kitPrice };

  const coverFacts = [
    milestones.length > 0 && { value: milestones.length, label: milestones.length === 1 ? 'guided step' : 'guided steps' },
    deliverables.length > 0 && { value: deliverables.length, label: deliverables.length === 1 ? 'thing to build' : 'things to build' },
    (ageMin != null || ageMax != null) && { value: age.replace(/^Ages /, ''), label: 'years old' },
  ].filter(Boolean);

  const whatYouGet = [
    { icon: <CheckCircleIcon />, title: 'Lifetime access for one learner', body: 'Theirs to come back to — redo a step or show it off any time.' },
    milestones.length > 0 && {
      icon: <FormatListNumberedIcon />,
      title: `${plural(milestones.length, 'guided step', 'guided steps')}`,
      body: 'Worked through at their own pace, each one ending with something working.',
    },
    deliverables.length > 0 && {
      icon: <BuildCircleIcon />,
      title: `${plural(deliverables.length, 'thing', 'things')} to build and show`,
      body: deliverables.map((d) => d.name).join(' · '),
    },
    { icon: <InfoOutlinedIcon />, title: 'In their Digifunzi learner account', body: 'It opens there as soon as your payment is confirmed.' },
    kitPrice && {
      icon: <CardGiftcardIcon />,
      title: `Optional materials kit (+${formatKsh(kitPrice.amount, kitPrice.currency)})`,
      body: 'Everything under “What you’ll need”, ready to build with. Tick it when you buy.',
    },
  ].filter(Boolean);

  return (
    <>
      <SeoHead
        title={titleWithKind(name, 'Project')}
        description={tagline || description}
        image={resolveMediaUrl(coverImage) || undefined}
        type="product"
      />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Store', path: '/store' },
            { name, path },
          ]),
          productSchema(
            {
              name,
              slug,
              summary: tagline || description,
              description,
              image: resolveMediaUrl(coverImage),
              price: price ? { amount: price.amount, currency: price.currency } : null,
              kind: 'project',
            },
            path,
            { pricingIsPlaceholder: PRICING_IS_PLACEHOLDER },
          ),
        ]}
      />

      {/* header band */}
      <DetailHero
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Store', to: '/store' },
          { label: 'Projects', to: STORE_PROJECTS_PATH },
          { label: name },
        ]}
      >
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 3, md: 5 },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label="Guided project"
                sx={{ bgcolor: (t) => alpha(t.palette.primary.dark, 0.102), color: 'text.primary', fontWeight: 600 }}
              />
              <Chip color="success" label="Available now" sx={{ fontWeight: 600 }} />
              {level && <Chip variant="outlined" label={LEVEL_LABEL[level]} sx={{ fontWeight: 600 }} />}
              {age && <Chip variant="outlined" label={age} sx={{ fontWeight: 600 }} />}
            </Box>

            <Typography variant="h1" component="h1" sx={{ mb: 1.5 }}>
              {name}
            </Typography>
            {tagline && (
              <Typography
                variant="h4"
                component="p"
                sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 620 }}
              >
                {tagline}
              </Typography>
            )}

            {/* price + buy */}
            <Box sx={{ mt: 3 }}>
              <BuyBox kind="project" item={buyItem} enquireTo={enquireTo} contactTo={contactTo} />
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 460 }, flexShrink: 0 }}>
            {coverImage ? (
              <MediaGallery images={[coverImage, ...gallery]} alt={name} ratio="4 / 3" />
            ) : (
              <ProjectCoverArt facts={coverFacts} />
            )}
          </Box>
        </Box>
      </DetailHero>

      <Section>
        <DetailLayout
          aside={(
            <BuyAside
              title={`Get ${name} for your learner`}
              kind="project"
              item={buyItem}
              enquireTo={enquireTo}
              contactTo={contactTo}
            />
          )}
        >
          {(description || overview) && (
            <Box sx={{ maxWidth: 760, mb: 6 }}>
              <DetailHeading title="About this project" icon={<InfoOutlinedIcon />} />
              {description && (
                <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.7 }}>
                  {description}
                </Typography>
              )}
              {overview && (
                <Typography
                  sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.7, mt: 2 }}
                >
                  {overview}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ mb: 6 }}>
            <DetailHeading title="What you get" icon={<Inventory2Icon />} />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {whatYouGet.map((g) => <GetTile key={g.title} {...g} />)}
            </Box>
          </Box>

          {milestones.length > 0 && (
            <Box sx={{ maxWidth: 820, mb: 6 }}>
              <DetailHeading
                title="The build, step by step"
                icon={<FormatListNumberedIcon />}
                lead="Worked through in order — each step builds on the last, and ends with something working."
                sx={{ mb: 1.5 }}
              />
              {milestones.map((m, i) => (
                <BuildStep key={`${m.name}-${i}`} index={i} total={milestones.length} step={m} />
              ))}
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', md: deliverables.length && requirements.length ? '1fr 1fr' : '1fr' },
            }}
          >
            {deliverables.length > 0 && (
              <Box>
                <DetailHeading title="What you’ll build" icon={<BuildCircleIcon />} />
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
                  {deliverables.map((d, i) => (
                    <Box component="li" key={`${d.name}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{d.name}</Typography>
                        {d.description && (
                          <Typography variant="body2" color="text.secondary">
                            {d.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {requirements.length > 0 && (
              <Box>
                <DetailHeading title="What you’ll need" icon={<Inventory2Icon />} />
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25 }}>
                  {requirements.map((r, i) => {
                    const inStore = findInStore(r, storeItems);
                    return (
                      <Box component="li" key={`${r}-${i}`} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: inStore ? 'primary.main' : 'text.disabled', flexShrink: 0, mt: 0.25 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography>{r}</Typography>
                          {inStore && (
                            <Box
                              component={RouterLink}
                              to={storeItemPath(inStore.slug)}
                              sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 0.25,
                                fontSize: 13, fontWeight: 700, color: 'primary.main', textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {inStore.price ? `In our store · ${formatPrice(inStore.price)}` : 'In our store'}
                              <ArrowForwardIcon sx={{ fontSize: 16 }} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                {kitPrice && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Or add the materials kit (+{formatKsh(kitPrice.amount, kitPrice.currency)}) when you buy the project.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DetailLayout>
      </Section>

      <RelatedInStore currentKey={`project:${slug}`} />

      <CTABanner
        heading="Buying projects for a class?"
        body="Tell us how many learners you have — we'll put together a classroom licence quote."
        primary={{ label: 'Request a quote', to: '/contact?subject=Classroom%20project%20licence' }}
        secondary={{ label: 'Back to the store', to: '/store' }}
      />
    </>
  );
}
