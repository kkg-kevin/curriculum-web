import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import PlaceIcon from '@mui/icons-material/Place';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import { useLocations } from '../hooks/usePublicLocations.js';
import { locationPath, townCounts, townHeadings } from '../utils/locations.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../theme/layout.js';

const GRID_SX = { display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: CARD_GRID_COLUMNS };

// One town: its name, its county, what it has, and the places by name.
function TownCard({ town }) {
  const Icon = town.online ? LanguageIcon : PlaceIcon;
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 'shadow.lg', borderColor: 'primary.main' },
        '&:hover .town-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea component={RouterLink} to={locationPath(town.slug)} sx={{ height: '100%', p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h3" component="h2" sx={{ fontSize: '1.35rem' }}>{town.town}</Typography>
            {town.county && <Typography variant="body2" color="text.secondary">{town.county}</Typography>}
          </Box>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{townCounts(town)}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {town.places.map((p) => p.name).join(' · ')}
        </Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: 'primary.main', fontWeight: 700, fontSize: '0.95rem' }}>
          {town.online ? 'See online classes' : `See ${town.town}`}
          <ArrowForwardIcon className="town-arrow" fontSize="small" sx={{ transition: 'transform 200ms ease' }} />
        </Box>
      </CardActionArea>
    </Card>
  );
}

/**
 * Locations (`/locations`, 25 Nov 2026) — every town Digifunzi teaches in, from the website's hubs
 * (GET /api/public/locations), each opening its own town page. Online last.
 */
export default function LocationsPage() {
  const { data: towns = [], isLoading, isError, error, refetch } = useLocations();
  const named = towns.filter((t) => !t.online).map((t) => t.town);

  return (
    <>
      <SeoHead
        title="Where We Teach: Coding & Robotics for Kids in Kenya"
        description={`Find Digifunzi coding, robotics and AI classes for kids near you${named.length ? ` in ${named.slice(0, 5).join(', ')}` : ''}${towns.some((t) => t.online) ? ', and online' : ''}. See each place's days, hours and what runs there.`}
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(towns.map((t) => ({ name: townHeadings(t).h1, url: locationPath(t.slug) })), { name: 'Where Digifunzi teaches' }),
        ]}
      />

      <PageHeader
        title="Where we teach"
        lead="Clubs, hubs and holiday bootcamps where children learn coding, robotics and AI with Digifunzi. Choose your town to see each place, its days and hours, and what runs there."
      />

      <Section dots>
        {isLoading && (
          <Box sx={GRID_SX}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 4 }} />
            ))}
          </Box>
        )}
        {isError && <ErrorBlock error={error} onRetry={refetch} />}
        {!isLoading && !isError && towns.length === 0 && (
          <EmptyBlock title="New places are on the way" body="Contact us and we'll tell you when Digifunzi opens near you." />
        )}
        {!isLoading && !isError && towns.length > 0 && (
          <Box sx={{ ...GRID_SX, ...shortListSx(towns.length) }}>
            {towns.map((t) => <TownCard key={t.slug} town={t} />)}
          </Box>
        )}
      </Section>
    </>
  );
}
