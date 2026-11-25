import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema, itemListSchema, clubSchema } from '../components/seo/JsonLd.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import ActionRow from '../components/common/ActionRow.jsx';
import Section from '../components/common/Section.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import ClubCard from '../components/cards/ClubCard.jsx';
import BootcampCard from '../components/cards/BootcampCard.jsx';
import PathwayCard from '../components/cards/PathwayCard.jsx';
import { useLocation as useTown, useLocations } from '../hooks/usePublicLocations.js';
import { usePublicBootcamps } from '../hooks/usePublicBootcamps.js';
import { usePathways } from '../hooks/usePathways.js';
import { packagesForClub, useClubPackages } from '../hooks/usePublicClubs.js';
import { clubPath } from '../utils/clubs.js';
import { LOCATIONS_PATH, listWords, locationPath, townDescription, townHeadings } from '../utils/locations.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../theme/layout.js';

const GRID_SX = { display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: CARD_GRID_COLUMNS };

// A place from the town as ClubCard takes it: the hub (list fields) and its profile (address, photos).
const asHub = (p, town) => ({
  id: p.id, name: p.name, hubTypeLabel: p.typeLabel, deliveryLabel: p.deliveryLabel,
  isVirtual: p.deliveryMode === 'virtual', town: town.town, schedule: p.schedule,
});
const asProfile = (p) => ({ address: p.address, photo: p.logo, photos: p.photos, mapLink: p.mapLink });

/**
 * A town page (`/locations/:slug`, 25 Nov 2026) — "Coding, robotics & AI classes for kids in
 * Thika": for searches that name a place. Everything on it comes from the records (GET
 * /api/public/locations/:slug): the places there (each opening its own club page), the bootcamps
 * running at them and the pathways offered there, shown with the same cards as their own sections;
 * then the other towns. No text is typed for a town, so a new hub or bootcamp shows up by itself.
 */
export default function LocationPage() {
  const { slug } = useParams();
  const { data: town, isLoading, isError, error, refetch } = useTown(slug);
  const { data: towns = [] } = useLocations();
  // The full cards for the town's bootcamps and pathways come from their own lists (same cache as
  // their pages); a list that fails just leaves its section out.
  const bootcampList = usePublicBootcamps();
  const pathwayList = usePathways();
  const { data: packages = [] } = useClubPackages();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={220} height={28} />
        <Skeleton variant="text" width="60%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={280} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError || !town) {
    const notFound = error?.status === 404 || error?.response?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Location not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'We don’t teach in this town yet.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to={LOCATIONS_PATH} variant="outlined">See where we teach</Button>
        </Box>
      </Container>
    );
  }

  const path = locationPath(town.slug);
  const { title, h1 } = townHeadings(town);
  const bootcampBySlug = new Map((bootcampList.data || []).map((b) => [b.slug, b]));
  const pathwayBySlug = new Map((pathwayList.data || []).map((p) => [p.slug, p]));
  const bootcamps = town.bootcamps.map((b) => bootcampBySlug.get(b.slug)).filter(Boolean);
  const pathwayCards = town.pathways.map((p) => pathwayBySlug.get(p.slug)).filter(Boolean);
  const others = towns.filter((t) => t.slug !== town.slug);
  const placeNames = listWords(town.places.map((p) => p.name));
  const lead = town.online
    ? `Children learn coding, robotics and AI with Digifunzi from home: ${placeNames}.`
    : `Where children in and around ${town.town}${town.county ? ` (${town.county})` : ''} learn coding, robotics and AI with Digifunzi: ${placeNames}. See each place's days and hours, and what runs there.`;

  return (
    <>
      <SeoHead title={title} description={townDescription(town)} about="Digifunzi teaches robotics, AI and coding to kids aged 5–17 in Kenya." image={town.places.find((p) => p.photos?.[0])?.photos[0] || undefined} />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Where we teach', path: LOCATIONS_PATH },
            { name: town.town, path },
          ]),
          itemListSchema(town.places.map((p) => ({ name: p.name, url: clubPath(p) })), { name: h1 }),
          ...town.places.map((p) => clubSchema({
            name: p.name, description: p.summary, address: p.address, isVirtual: p.deliveryMode === 'virtual',
            mapLink: p.mapLink, photos: p.photos, photo: p.logo, operatingHours: p.schedule,
          }, clubPath(p))),
        ]}
      />

      <DetailHero crumbs={[{ label: 'Home', to: '/' }, { label: 'Where we teach', to: LOCATIONS_PATH }, { label: town.town }]}>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.75rem' }, overflowWrap: 'anywhere' }}>
          {h1}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 760, fontSize: { md: '1.1rem' } }}>
          {lead}
        </Typography>
        <ActionRow sx={{ mt: 3 }}>
          <Button component={RouterLink} to="/enroll" variant="contained" color="secondary" size="large">
            Enroll a learner
          </Button>
          <Button component={RouterLink} to="/contact" variant="outlined" size="large">
            Ask us a question
          </Button>
        </ActionRow>
      </DetailHero>

      <Section dots>
        <SectionHeading
          title={town.online ? 'Online clubs and classes' : `Clubs and hubs in ${town.town}`}
          lead={town.places.length === 1 ? 'Open it to see the days and hours, the address and how to join.' : 'Open one to see its days and hours, the address and how to join.'}
        />
        <Box sx={{ ...GRID_SX, ...shortListSx(town.places.length), mt: 4 }}>
          {town.places.map((p) => (
            <ClubCard key={p.id} hub={asHub(p, town)} profile={asProfile(p)} packages={packagesForClub(packages, p.id)} />
          ))}
        </Box>
      </Section>

      {bootcamps.length > 0 && (
        <Section tone="subtle">
          <SectionHeading
            title={town.online ? 'Bootcamps you can join online' : `Holiday bootcamps in ${town.town}`}
            lead={`Running at ${listWords([...new Set(town.bootcamps.flatMap((b) => b.places))])}.`}
          />
          <Box sx={{ ...GRID_SX, ...shortListSx(bootcamps.length), mt: 4 }}>
            {bootcamps.map((b) => <BootcampCard key={b.id} bootcamp={b} />)}
          </Box>
        </Section>
      )}

      {pathwayCards.length > 0 && (
        <Section>
          <SectionHeading
            title={town.online ? 'Pathways you can follow online' : `Pathways you can follow in ${town.town}`}
            lead="A pathway is a run of courses, stage by stage, that a child follows at their own pace."
          />
          <Box sx={{ ...GRID_SX, ...shortListSx(pathwayCards.length), mt: 4 }}>
            {pathwayCards.map((p) => <PathwayCard key={p.id} pathway={p} />)}
          </Box>
        </Section>
      )}

      {others.length > 0 && (
        <Section tone="subtle">
          <SectionHeading title="Other places we teach" />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3 }}>
            {others.map((t) => (
              <Button key={t.slug} component={RouterLink} to={locationPath(t.slug)} variant="outlined">
                {t.online ? 'Online' : t.town}
              </Button>
            ))}
          </Box>
        </Section>
      )}

      <CTABanner />
    </>
  );
}
