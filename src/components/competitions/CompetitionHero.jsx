import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { resolveMediaUrl } from '../../utils/media.js';

/**
 * The competition and track pages' header (20 Nov 2026) — the picture as the background with the
 * details on top of it, the same look as an event's page: a dark wash from the left so the text
 * always reads, the picture showing through on the right. Without a picture, the brand gradient.
 *
 * - `crumbs`   [{ label, to }] — light breadcrumb trail on the picture
 * - `overline` the small line above the title ("Competition · 2027 edition")
 * - `title`, `lead`
 * - `facts`    [{ icon, title, line }] — two columns of key facts with icons
 * - `badges`   small things under the facts (status pill, countdown)
 * - `actions`  the buttons
 * - `aside`    a panel on the right of the picture (the competition's information); under the
 *              rest on phones
 */

export const HERO_WASH = 'linear-gradient(100deg, rgba(16,32,52,0.97) 0%, rgba(16,32,52,0.88) 48%, rgba(16,32,52,0.45) 100%)';
export const HERO_GRADIENT = 'linear-gradient(135deg, #1a3550 0%, #25476a 45%, #2e7db5 80%, #38aae1 100%)';
// Phones: a stronger wash from the top — on a narrow screen the text covers the whole picture, so
// the picture is a tint behind it, never busy under the words.
export const HERO_WASH_PHONE = 'linear-gradient(180deg, rgba(16,32,52,0.82) 0%, rgba(16,32,52,0.9) 55%, rgba(16,32,52,0.97) 100%)';
export const heroBackground = (image) => (image
  ? { xs: `${HERO_WASH_PHONE}, center / cover no-repeat url(${image})`, md: `${HERO_WASH}, center / cover no-repeat url(${image})` }
  : HERO_GRADIENT);

export function HeroFact({ icon, title, line }) {
  if (!title) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', minWidth: 0 }}>
      <Box sx={{ width: 38, height: 38, borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.12)', color: 'secondary.light', '& svg': { fontSize: 21 } }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.35 }}>{title}</Typography>
        {line && <Typography variant="body2" sx={{ opacity: 0.82, lineHeight: 1.45 }}>{line}</Typography>}
      </Box>
    </Box>
  );
}

/** A pill on the dark picture: "Registration open · closes in 12 days". */
export function HeroPill({ children, tone = 'live' }) {
  const live = tone === 'live';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, borderRadius: 999, fontSize: 13.5, fontWeight: 800, bgcolor: live ? 'rgba(46,160,90,0.22)' : 'rgba(255,255,255,0.14)', border: '1px solid', borderColor: live ? 'rgba(110,220,150,0.55)' : 'rgba(255,255,255,0.25)' }}>
      {live && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#5BE38D', boxShadow: '0 0 0 4px rgba(91,227,141,0.2)' }} />}
      {children}
    </Box>
  );
}

// The full description (already-cleaned HTML) on the picture: white text, folded after about five
// lines with Read more / Show less when it's longer (the header shouldn't push the tracks far down).
const FOLD_AT = 132; // px — about five lines
function HeroDescription({ html }) {
  const ref = useRef(null);
  const [long, setLong] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setLong(el.scrollHeight > FOLD_AT + 24);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [html]);
  const folded = long && !open;
  return (
    <Box sx={{ mb: 3, maxWidth: 680 }}>
      <Box
        ref={ref}
        sx={{
          position: 'relative', overflow: 'hidden', maxHeight: folded ? FOLD_AT : 'none',
          fontSize: { xs: 16, md: 17.5 }, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)',
          '& p': { mt: 0, mb: 1.25 }, '& p:last-child': { mb: 0 }, '& ul, & ol': { pl: 3, my: 1 },
          '& a': { color: 'secondary.light' }, '& strong': { color: '#fff' }, '& h2, & h3, & h4': { color: '#fff', fontSize: '1.1em', mt: 1.5, mb: 0.75 },
          '& img': { display: 'none' },
          maskImage: folded ? 'linear-gradient(180deg, #000 60%, transparent 100%)' : 'none',
          WebkitMaskImage: folded ? 'linear-gradient(180deg, #000 60%, transparent 100%)' : 'none',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {long && (
        <Button onClick={() => setOpen((o) => !o)} size="small" aria-expanded={open} sx={{ mt: 0.25, px: 0, minWidth: 0, color: 'secondary.light', fontWeight: 800, fontSize: 14.5, '&:hover': { background: 'none', textDecoration: 'underline' } }}>
          {open ? 'Show less' : 'Read more'}
        </Button>
      )}
    </Box>
  );
}

export default function CompetitionHero({ image, crumbs = [], overline, title, lead, description, facts = [], badges, actions, aside }) {
  const src = resolveMediaUrl(image);
  const trail = crumbs.slice(0, -1);
  const current = crumbs[crumbs.length - 1];
  const shownFacts = facts.filter((f) => f && f.title);
  return (
    <Box sx={{ color: '#fff', background: heroBackground(src), minHeight: { md: 440 }, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 7 } }}>
        {crumbs.length > 0 && (
          <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: { xs: 2, md: 3 }, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.5)' }, '& .MuiBreadcrumbs-ol': { rowGap: 0.25 } }}>
            {trail.map((c) => (
              <Link key={c.to || c.label} component={RouterLink} to={c.to} underline="hover" sx={{ color: 'inherit' }}>{c.label}</Link>
            ))}
            {current && <Typography component="span" aria-current="page" sx={{ fontSize: 'inherit', fontWeight: 700, color: '#fff' }}>{current.label}</Typography>}
          </Breadcrumbs>
        )}
        {/* With an `aside` (a panel on the right of the picture), two columns from md; stacked on phones. */}
        <Box sx={aside ? { display: 'grid', gap: { xs: 4, md: 5 }, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(320px, 400px)' }, alignItems: 'start' } : undefined}>
        <Box sx={{ maxWidth: 780, minWidth: 0 }}>
          {overline && (
            <Typography variant="overline" sx={{ display: 'block', color: 'secondary.light', fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1.6 }}>{overline}</Typography>
          )}
          <Typography variant="h1" component="h1" sx={{ color: '#fff', fontWeight: 900, mt: 0.5, mb: 1.5, lineHeight: 1.08, fontSize: { xs: 32, sm: 40, md: 52 } }}>{title}</Typography>
          {lead && <Typography sx={{ fontSize: { xs: 16.5, md: 19.5 }, opacity: 0.92, mb: 3, maxWidth: 680, lineHeight: 1.55, whiteSpace: 'pre-line' }}>{lead}</Typography>}
          {description && <HeroDescription html={description} />}
          {shownFacts.length > 0 && (
            <Box sx={{ display: 'grid', gap: 1.75, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, mb: 3, maxWidth: 680 }}>
              {shownFacts.map((f, i) => <HeroFact key={i} {...f} />)}
            </Box>
          )}
          {badges && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>{badges}</Box>}
          {actions && <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>{actions}</Box>}
        </Box>
        {aside && <Box sx={{ minWidth: 0 }}>{aside}</Box>}
        </Box>
      </Container>
    </Box>
  );
}
