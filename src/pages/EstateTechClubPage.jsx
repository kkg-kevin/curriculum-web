import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema, clubSchema } from '../components/seo/JsonLd.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import HubProfile from '../components/hubs/HubProfile.jsx';
import ClubLogo from '../components/hubs/ClubLogo.jsx';
import FactPills from '../components/common/FactPills.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import ActionRow from '../components/common/ActionRow.jsx';
import PlaceIcon from '@mui/icons-material/Place';
import SellIcon from '@mui/icons-material/Sell';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { usePublicHubList, usePublicHub } from '../hooks/usePublicHubs.js';
import { packagesForClub, useClubPackages } from '../hooks/usePublicClubs.js';
import ClubPackages from '../components/clubs/ClubPackages.jsx';
import { ClubFaq, ClubJoinSteps, ClubPriceCard, ClubQuickFacts } from '../components/clubs/ClubSections.jsx';
import { formatKsh } from '../content/homeSchooling.js';
import { CLUBS_PATH, clubJoinPath, clubSlug, scheduleLabel, sessionLines, sortDays } from '../utils/clubs.js';

/**
 * One Estate Tech Club (`/estate-tech-clubs/:slug`). The hub is found in GET /api/public/hubs by
 * the slug of its name (utils/clubs.js), then its full profile comes from GET /api/public/hubs/:id
 * — the same profile a bootcamp's hub page shows (HubProfile). Indexable, unlike that page: this
 * is the club's own address for "coding club <estate>" searches.
 */
export default function EstateTechClubPage() {
  const { slug } = useParams();
  const list = usePublicHubList();
  const hub = (list.data || []).find((h) => clubSlug(h) === slug) || null;
  const profileQuery = usePublicHub(hub?.id);
  const profile = profileQuery.data;
  // The club's membership packages. Never holds the page up: with none (or while they load, or
  // if they fail) the page is the enquiry-only page it always was.
  const packagesQuery = useClubPackages();
  const packages = packagesForClub(packagesQuery.data, hub?.id);
  const canJoin = packages.length > 0;

  if (list.isLoading || (hub && profileQuery.isLoading)) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={220} height={28} />
        <Skeleton variant="text" width="55%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={320} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (list.isError || profileQuery.isError || !hub || !profile) {
    const notFound = !list.isError && (!hub || profileQuery.error?.status === 404);
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Club not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This club doesn’t exist or isn’t open at the moment.' : (list.error || profileQuery.error)?.message }}
          onRetry={notFound ? undefined : () => { list.refetch(); profileQuery.refetch(); }}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to={CLUBS_PATH} variant="outlined">
            See all clubs
          </Button>
        </Box>
      </Container>
    );
  }

  const path = `${CLUBS_PATH}/${slug}`;
  const details = profile.clubDetails || {};
  const hasSessions = sessionLines(details).length > 0;
  const club = {
    ...profile,
    isVirtual: hub.isVirtual,
    // Written for parents (portal → Club details for parents) when the club has it; the venue's
    // own description otherwise.
    description: details.description || profile.description,
    operatingHours: profile.operatingHours && { ...profile.operatingHours, days: sortDays(profile.operatingHours.days) },
  };
  const where = hub.isVirtual ? 'Online' : profile.address || hub.town;
  const fromAmount = canJoin ? Math.min(...packages.map((p) => p.monthlyAmount)) : null;
  const facts = [
    { key: 'where', Icon: PlaceIcon, label: where, href: hub.isVirtual ? undefined : profile.mapLink || undefined },
    { key: 'price', Icon: SellIcon, label: fromAmount != null ? `From ${formatKsh(fromAmount)} / month` : '' },
  ];
  const enquire = `/enroll?club=${encodeURIComponent(hub.name)}`;
  const joinPath = clubJoinPath(hub);
  const description =
    club.description ||
    `Coding, robotics and AI for kids at ${hub.name}${where ? `, ${where}` : ''}. Run by Digifunzi — see the days, hours and how to join.`;

  return (
    <>
      <SeoHead title={hub.name} description={description} image={profile.photos?.[0] || profile.photo || undefined} />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Estate Tech Clubs', path: CLUBS_PATH },
            { name: hub.name, path },
          ]),
          clubSchema(club, path),
        ]}
      />

      <DetailHero crumbs={[{ label: 'Home', to: '/' }, { label: 'Estate Tech Clubs', to: CLUBS_PATH }, { label: hub.name }]}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-end' },
            justifyContent: 'space-between',
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 2.5 } }}>
              <ClubLogo src={profile.photo} name={hub.name} size={72} />
              <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.75rem' }, minWidth: 0, overflowWrap: 'anywhere' }}>
                {hub.name}
              </Typography>
            </Box>
            <FactPills items={facts} sx={{ mt: 2.5 }} />
          </Box>
          <ActionRow sx={{ flexShrink: 0 }}>
            {/* Parents join online; a club with no package on the website yet falls back to an enquiry. */}
            {canJoin ? (
              <Button component={RouterLink} to={joinPath} variant="contained" color="secondary" size="large">
                Join this club
              </Button>
            ) : (
              <Button component={RouterLink} to={enquire} variant="contained" size="large">
                Enquire about this club
              </Button>
            )}
            <Button component={RouterLink} to={CLUBS_PATH} variant="outlined" size="large">
              See all clubs
            </Button>
          </ActionRow>
        </Box>
        <ClubQuickFacts hub={hub} details={details} fallbackSchedule={scheduleLabel(hub.schedule)} />
      </DetailHero>

      <HubProfile
        hub={club}
        aboutHeading="About the club"
        // What a parent decides on comes first: the prices and how joining works. Desk pricing is a co-working thing — left out here.
        hideSpaces
        compactMap
        // With session times set, they replace the venue's opening hours in the side card.
        hideHours={hasSessions}
        sideTop={canJoin ? <ClubPriceCard fromAmount={fromAmount} details={details} joinPath={joinPath} /> : null}
        sideAction={canJoin ? null : (
          <Button component={RouterLink} to={enquire} variant="contained" fullWidth sx={{ mt: 3 }}>
            Enquire about this club
          </Button>
        )}
        beforeDetails={(
          <>
            {canJoin && <ClubPackages hub={hub} packages={packages} />}
            {canJoin && <ClubJoinSteps joinPath={joinPath} />}
          </>
        )}
        afterDetails={<ClubFaq details={details} canJoin={canJoin} enquirePath={enquire} />}
      />

      <CTABanner
        heading={`Want your child to join ${hub.name}?`}
        body={canJoin
          ? 'Sign up in a few minutes — choose a package and create your family’s logins.'
          : "Send us your details and we'll get back to you about places, days and what your child will learn."}
        primary={canJoin ? { label: 'Join now', to: joinPath } : { label: 'Enquire now', to: enquire }}
        secondary={{ label: 'See all clubs', to: CLUBS_PATH }}
      />
    </>
  );
}
