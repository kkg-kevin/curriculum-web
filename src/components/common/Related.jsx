import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';
import BootcampCard from '../cards/BootcampCard.jsx';
import CompetitionCard from '../cards/CompetitionCard.jsx';
import PathwayCard from '../cards/PathwayCard.jsx';
import ProjectCard from '../cards/ProjectCard.jsx';
import StoreItemCard from '../cards/StoreItemCard.jsx';
import { usePublicBootcamps } from '../../hooks/usePublicBootcamps.js';
import { usePublicCompetitions } from '../../hooks/usePublicCompetitions.js';
import { usePathways } from '../../hooks/usePathways.js';
import { usePublicProjects } from '../../hooks/usePublicProjects.js';
import { usePublicStore } from '../../hooks/usePublicStore.js';
import { hasEnded } from '../../utils/dates.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../../theme/layout.js';

const MAX_SHOWN = 4;

/**
 * "More like this" at the foot of a detail page — the other bootcamps, pathways, projects…
 * so the page ends on somewhere to go next rather than a dead end. Each Related* below reads
 * the same list its section's index page does, drops the item being viewed, and renders
 * nothing when there's nothing else to show.
 */
function RelatedRow({ title, to, linkLabel, items, renderCard }) {
  if (items.length === 0) return null;
  const shown = items.slice(0, MAX_SHOWN);
  return (
    <Section tone="subtle">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          mb: { xs: 4, md: 5 },
        }}
      >
        <SectionHeading eyebrow="Keep exploring" title={title} />
        <Button component={RouterLink} to={to} variant="outlined">
          {linkLabel}
        </Button>
      </Box>
      <Box sx={{ display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: CARD_GRID_COLUMNS, ...shortListSx(shown.length) }}>
        {shown.map((item) => (
          <Box key={item.id || item.slug}>{renderCard(item)}</Box>
        ))}
      </Box>
    </Section>
  );
}

const others = (list, currentSlug) => (list || []).filter((x) => x.slug !== currentSlug);

export function RelatedBootcamps({ currentSlug }) {
  const { data } = usePublicBootcamps();
  return (
    <RelatedRow
      title="Other bootcamps"
      to="/bootcamps"
      linkLabel="All bootcamps"
      items={others(data, currentSlug).filter((b) => !hasEnded(b.endDate))}
      renderCard={(b) => <BootcampCard bootcamp={b} />}
    />
  );
}

export function RelatedCompetitions({ currentSlug }) {
  const { data } = usePublicCompetitions();
  return (
    <RelatedRow
      title="Other competitions"
      to="/competitions"
      linkLabel="All competitions"
      items={others(data, currentSlug).filter((c) => !hasEnded(c.endDate))}
      renderCard={(c) => <CompetitionCard competition={c} />}
    />
  );
}

export function RelatedPathways({ currentSlug }) {
  const { data } = usePathways();
  return (
    <RelatedRow
      title="Other pathways"
      to="/pathways"
      linkLabel="All pathways"
      items={others(data, currentSlug)}
      renderCard={(p) => <PathwayCard pathway={p} />}
    />
  );
}

export function RelatedProjects({ currentSlug }) {
  const { data } = usePublicProjects();
  return (
    <RelatedRow
      title="Other projects"
      to="/projects"
      linkLabel="All projects"
      items={others(data, currentSlug)}
      renderCard={(p) => <ProjectCard project={p} />}
    />
  );
}

export function RelatedStoreItems({ currentSlug }) {
  const { data } = usePublicStore();
  return (
    <RelatedRow
      title="More from the store"
      to="/store"
      linkLabel="Visit the store"
      items={others(data, currentSlug)}
      renderCard={(it) => <StoreItemCard item={it} />}
    />
  );
}
