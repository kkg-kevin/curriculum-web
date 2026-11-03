import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import PathwayCard from '../components/cards/PathwayCard.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import { usePathways } from '../hooks/usePathways.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../theme/layout.js';
import { ADULT_AGE, parseAge, pathwayAgeRange, stageForAge } from '../utils/pathwayAges.js';

const GRID_SX = {
  display: 'grid',
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: CARD_GRID_COLUMNS,
};

function CardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'surface.card',
      }}
    >
      <Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 10', height: 'auto' }} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="75%" height={28} />
        <Skeleton variant="text" width="55%" height={28} />
        <Skeleton variant="text" width="95%" sx={{ mt: 1 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rounded" width={120} height={12} sx={{ mt: 2, borderRadius: 999 }} />
        <Skeleton variant="text" width="40%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

function PathwaySkeletons() {
  return (
    <Box sx={GRID_SX}>
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </Box>
  );
}

/**
 * "My child is [age]" — the first question most parents have. Offers every age from the youngest
 * any pathway takes up to ADULT_AGE ("18 or older").
 */
function AgePicker({ pathways, age, onChange, matches }) {
  const youngest = Math.min(...pathways.map((p) => pathwayAgeRange(p)?.minAge ?? Infinity));
  if (!Number.isFinite(youngest)) return null;
  const options = [];
  for (let a = Math.max(3, youngest); a <= ADULT_AGE; a += 1) options.push(a);

  return (
    <Box
      sx={{
        mb: 4,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'surface.card',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        flexWrap: 'wrap',
      }}
    >
      <Typography component="label" htmlFor="pathway-age" sx={{ fontWeight: 700 }}>
        My child is
      </Typography>
      <TextField
        id="pathway-age"
        select
        size="small"
        value={age ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        sx={{ minWidth: 150 }}
        SelectProps={{ displayEmpty: true }}
      >
        <MenuItem value="">Any age</MenuItem>
        {options.map((a) => (
          <MenuItem key={a} value={a}>
            {a === ADULT_AGE ? '18 or older' : `${a} years old`}
          </MenuItem>
        ))}
      </TextField>
      {age != null && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }} aria-live="polite">
            {matches === 0
              ? 'No pathway for this age yet.'
              : `${matches} ${matches === 1 ? 'pathway fits' : 'pathways fit'} — each shows the stage they'd start in.`}
          </Typography>
          <Button size="small" onClick={() => onChange(null)} sx={{ ml: { sm: 'auto' } }}>
            Show every pathway
          </Button>
        </>
      )}
    </Box>
  );
}

export default function PathwaysListPage() {
  const { data, isLoading, isError, error, refetch } = usePathways();
  const [params, setParams] = useSearchParams();
  const count = data?.length || 0;
  const age = parseAge(params.get('age'));

  // Picked an age: only the pathways with a stage for it (a pathway with no ages set isn't one).
  const list = useMemo(() => {
    const all = data || [];
    return age == null ? all : all.filter((p) => stageForAge(p.stages, age));
  }, [data, age]);

  const setAge = (value) => {
    setParams(
      (prev) => {
        if (value == null) prev.delete('age');
        else prev.set('age', String(value));
        return prev;
      },
      { replace: true },
    );
  };

  return (
    <>
      <SeoHead
        title="Coding, Robotics & AI Pathways for Kids"
        description="Guided tracks of courses a child works through in order — robotics, coding, AI, data, digital design and more — building real skills one course at a time."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            (data || []).map((p) => ({ name: p.name, url: `/pathways/${p.slug}` })),
            { name: 'Digifunzi Learning Pathways' },
          ),
        ]}
      />

      <PageHeader
        title="Learning Pathways"
        lead="A pathway is a set of courses a child works through in order, in stages by age — each course builds on the last. Pick your child's age to see where they'd start."
      >
        {!isLoading && !isError && count > 0 && (
          <Box
            sx={{
              mt: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'surface.card',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {count} {count === 1 ? 'pathway' : 'pathways'} running this term
            </Typography>
          </Box>
        )}
      </PageHeader>

      <Section dots>
        {isLoading && <PathwaySkeletons />}
        {isError && <ErrorBlock error={error} onRetry={refetch} />}
        {!isLoading && !isError && count === 0 && (
          <EmptyBlock
            title="Pathways are being finalised"
            body="Check back soon — or contact us and we’ll talk through the tracks we’re running this term."
          />
        )}
        {!isLoading && !isError && count > 0 && (
          <>
            <AgePicker pathways={data} age={age} onChange={setAge} matches={list.length} />
            {list.length > 0 && (
              <Box sx={{ ...GRID_SX, ...shortListSx(list.length) }}>
                {list.map((p) => (
                  <PathwayCard key={p.id} pathway={p} age={age} />
                ))}
              </Box>
            )}
            {age != null && list.length === 0 && (
              <EmptyBlock
                title={`Nothing for age ${age === ADULT_AGE ? '18+' : age} yet`}
                body="Contact us and we’ll tell you what’s coming up — or look through every pathway."
              />
            )}
          </>
        )}
      </Section>

      <CTABanner
        heading="Not sure which pathway fits?"
        body="Tell us your learner’s age and what they’re into. We’ll recommend a pathway and, if it helps, a short diagnostic to place them at the right step."
      />
    </>
  );
}
