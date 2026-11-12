import { useRef, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import { DetailHeading } from '../components/common/DetailSection.jsx';
import JsonLd, { organizationSchema, productSchema, breadcrumbSchema, faqSchema } from '../components/seo/JsonLd.jsx';
import FaqList from '../components/common/FaqList.jsx';
import MediaGallery from '../components/media/MediaGallery.jsx';
import ProductLayout from '../components/store/ProductLayout.jsx';
import ProductBuyPanel from '../components/store/ProductBuyPanel.jsx';
import StickyBuyBar from '../components/store/StickyBuyBar.jsx';
import {
  ProjectOutcomeCover, AtAGlance, ValueLine, ProjectNeeds, ProjectHowItWorks, ParentQuotes, projectFaqs,
} from '../components/store/ProjectPageParts.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { usePublicProject } from '../hooks/usePublicProjects.js';
import { usePublicStore } from '../hooks/usePublicStore.js';
import { ageLabel } from '../utils/format.js';
import { formatKsh } from '../cart/format.js';
import { resolveMediaUrl } from '../utils/media.js';
import { titleWithKind } from '../utils/seo.js';
import { projectPath, STORE_PROJECTS_PATH } from '../utils/storePaths.js';
import { PROSE_MAX_WIDTH } from '../theme/layout.js';
import { RelatedInStore } from '../components/common/Related.jsx';
import { PRICING_IS_PLACEHOLDER } from '../content/catalog.js';

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const STEPS_SHOWN = 4;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// One numbered step in the project's build journey (a milestone).
function BuildStep({ index, total, step }) {
  const isLast = index === total - 1;
  return (
    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
            fontWeight: 700, color: '#fff', bgcolor: 'primary.main', zIndex: 1,
          }}
        >
          {index + 1}
        </Box>
        {!isLast && <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', minHeight: 20, mt: 0.5 }} />}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 3.5, minWidth: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h5" component="h3">{step.name}</Typography>
          {index === 0 && <Chip size="small" color="secondary" label="Start here" sx={{ fontWeight: 800 }} />}
        </Box>
        {step.description && (
          <Typography sx={{ color: 'text.secondary', mt: 0.5, whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH }}>
            {step.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// A "What you get" tile — the same look as on a Store item's page.
function GetTile({ icon, title, body }) {
  return (
    <Box
      sx={{
        p: 2.5, display: 'flex', gap: 1.5, alignItems: 'flex-start',
        backgroundColor: 'surface.card', border: '1px solid', borderColor: 'surface.ring', borderRadius: 3,
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

/**
 * A project in the Store (`/store/projects/:slug`), laid out like a Store good (ProductLayout) and
 * ordered the way a parent decides (12 Nov 2026):
 *   cover      the photos, or — with none — what the child will build (ProjectOutcomeCover)
 *   buy panel  price, value line (steps · a step's cost · for life), and "You'll also need" with the
 *              Store's price and "Add to cart too", so the full cost is never a surprise
 *   details    at a glance → what they'll build → about → the steps (folded after four) → what you
 *              get → after you buy → parents' words (real ones only) → questions answered
 * then a buy bar along the bottom once the panel's buttons have scrolled away, and more from the Store.
 */
export default function ProjectDetailPage() {
  const { slug } = useParams();
  const buyRef = useRef(null);
  const [allSteps, setAllSteps] = useState(false);
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
          <Button component={RouterLink} to={STORE_PROJECTS_PATH} variant="outlined">See all projects</Button>
        </Box>
      </Container>
    );
  }

  const {
    name, tagline, description, overview, level, ageMin, ageMax, coverImage, price,
    deliverables = [], milestones = [], requirements = [], gallery = [], kitPrice = null,
  } = data;
  // More than three things to build: shown in two columns.
  const longBuild = deliverables.length > 3;
  // Folded only when it hides a good few steps (never "Show all 5" for one more).
  const foldSteps = milestones.length > STEPS_SHOWN + 2;
  const shownSteps = allSteps || !foldSteps ? milestones : milestones.slice(0, STEPS_SHOWN);

  const hasAges = ageMin != null || ageMax != null;
  const age = ageLabel(ageMin, ageMax);
  const path = projectPath(slug);
  const enquireTo = `/enroll?interestedIn=project&referenceId=${encodeURIComponent(slug)}`;
  const contactTo = `/contact?subject=${encodeURIComponent(`${name} — project enquiry`)}`;
  const buyItem = { id: data.id, slug, name, image: coverImage, price, kitPrice };

  const coverFacts = [
    milestones.length > 0 && { value: milestones.length, label: milestones.length === 1 ? 'guided step' : 'guided steps' },
    deliverables.length > 0 && { value: deliverables.length, label: deliverables.length === 1 ? 'thing to build' : 'things to build' },
    hasAges && { value: age.replace(/^Ages /, ''), label: 'years old' },
    LEVEL_LABEL[level] && { value: LEVEL_LABEL[level], label: 'level' },
  ].filter(Boolean);
  const faqs = projectFaqs({ requirements, ages: hasAges ? age : null });
  // Without photos the cover already lists what they'll build; the full list then only follows when
  // the cover couldn't show it all.
  const showBuildList = deliverables.length > 0 && (Boolean(coverImage) || deliverables.length > 4);

  const whatYouGet = [
    { icon: <CheckCircleIcon />, title: 'Lifetime access for one learner', body: 'Theirs to come back to — redo a step or show it off any time.' },
    milestones.length > 0 && {
      icon: <FormatListNumberedIcon />,
      title: plural(milestones.length, 'guided step', 'guided steps'),
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
      body: 'Everything they need to build with, in one box. Tick it when you buy.',
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
          faqSchema(faqs),
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

      <ProductLayout
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Store', to: '/store' },
          { label: 'Projects', to: STORE_PROJECTS_PATH },
          { label: name },
        ]}
        gallery={coverImage
          ? <MediaGallery images={[coverImage, ...gallery]} alt={name} ratio="4 / 3" />
          : <ProjectOutcomeCover name={name} deliverables={deliverables} facts={coverFacts} />}
        panel={(
          <ProductBuyPanel
            chips={[
              { label: 'Guided project', tone: 'brand' },
              { label: 'Available now', tone: 'good' },
              LEVEL_LABEL[level] && { label: LEVEL_LABEL[level], tone: 'muted' },
              hasAges && { label: age, tone: 'muted' },
            ].filter(Boolean)}
            name={name}
            tagline={tagline}
            kind="project"
            item={buyItem}
            enquireTo={enquireTo}
            contactTo={contactTo}
            buyRef={buyRef}
            extra={(
              <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
                <ValueLine price={price} steps={milestones.length} />
                <ProjectNeeds requirements={requirements} storeItems={storeItems} kitPrice={kitPrice} />
              </Box>
            )}
          />
        )}
      >
        {coverImage && coverFacts.length > 0 && <AtAGlance facts={coverFacts} sx={{ mb: 6 }} />}

        {showBuildList && (
          <Box sx={{ mb: 6 }}>
            <DetailHeading title="What your child will build" icon={<BuildCircleIcon />} />
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', columnGap: 4, rowGap: 1.5, gridTemplateColumns: { xs: '1fr', sm: longBuild ? '1fr 1fr' : '1fr' } }}>
              {deliverables.map((d, i) => (
                <Box component="li" key={`${d.name}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                  <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{d.name}</Typography>
                    {d.description && <Typography variant="body2" color="text.secondary">{d.description}</Typography>}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {(description || overview) && (
          <Box sx={{ maxWidth: 760, mb: 6 }}>
            <DetailHeading title="About this project" icon={<InfoOutlinedIcon />} />
            {description && (
              <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.7 }}>
                {description}
              </Typography>
            )}
            {overview && (
              <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.7, mt: 2 }}>
                {overview}
              </Typography>
            )}
          </Box>
        )}

        {milestones.length > 0 && (
          <Box sx={{ maxWidth: 820, mb: 6 }}>
            <DetailHeading
              title="The build, step by step"
              icon={<FormatListNumberedIcon />}
              lead="Worked through in order — each step builds on the last, and ends with something working."
              sx={{ mb: 1.5 }}
            />
            {shownSteps.map((m, i) => (
              <BuildStep key={`${m.name}-${i}`} index={i} total={shownSteps.length} step={m} />
            ))}
            {foldSteps && (
              <Button
                onClick={() => setAllSteps((v) => !v)}
                endIcon={<ExpandMoreRoundedIcon sx={{ transform: allSteps ? 'rotate(180deg)' : 'none' }} />}
                sx={{ mt: 2, ml: { xs: 6, sm: 7.5 } }}
              >
                {allSteps ? 'Show fewer steps' : `Show all ${milestones.length} steps`}
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ mb: 6 }}>
          <DetailHeading title="What you get" icon={<Inventory2Icon />} />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            {whatYouGet.map((g) => <GetTile key={g.title} {...g} />)}
          </Box>
        </Box>

        <Box sx={{ mb: 6 }}>
          <DetailHeading title="After you buy" icon={<RouteRoundedIcon />} lead="No waiting for a class to start — they can begin the same day." />
          <ProjectHowItWorks />
        </Box>

        <ParentQuotes sx={{ mb: 6 }} />

        <Box sx={{ maxWidth: 820 }}>
          <DetailHeading title="Questions parents ask" icon={<HelpOutlineRoundedIcon />} />
          <FaqList faqs={faqs} />
        </Box>
      </ProductLayout>

      <StickyBuyBar
        watchRef={buyRef}
        kind="project"
        item={buyItem}
        buyable={Boolean(price)}
        enquireTo={enquireTo}
      />

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
