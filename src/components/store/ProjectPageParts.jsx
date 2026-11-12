import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import { cart } from '../../cart/cartStore.js';
import { formatKsh } from '../../cart/format.js';
import { publicApi } from '../../services/api.js';
import { storeItemPath } from '../../utils/storePaths.js';
import { DetailHeading } from '../common/DetailSection.jsx';

/**
 * The pieces of a project's page in the Store (pages/ProjectDetailPage.jsx) that turn "looks
 * interesting" into "buy": what the child will make (first, and big), the honest full cost (what
 * else it needs, with one-click "add it too"), what happens after paying, the worries answered,
 * and real parents' words.
 */

/** Stands in for photos when a project has none: the outcome — what the child will build — not a blank. */
export function ProjectOutcomeCover({ name, deliverables = [], facts = [] }) {
  const shown = deliverables.slice(0, 4);
  return (
    <Box sx={{
      position: 'relative', borderRadius: 4, overflow: 'hidden', color: '#fff', p: { xs: 2.5, sm: 3.5 },
      background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 70%, ${t.palette.primary.light} 130%)`,
      boxShadow: 'shadow.md', display: 'grid', gap: 2.5, minHeight: { md: 360 }, alignContent: 'space-between',
    }}>
      <BuildCircleOutlinedIcon aria-hidden sx={{ position: 'absolute', right: -24, top: -24, fontSize: 200, opacity: 0.1 }} />
      <Box sx={{ position: 'relative' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', color: 'secondary.light' }}>YOUR CHILD WILL BUILD</Typography>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1.5, p: 0, display: 'grid', gap: 1.25 }}>
          {(shown.length ? shown : [{ name }]).map((d, i) => (
            <Box component="li" key={`${d.name}-${i}`} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
              <CheckCircleRoundedIcon sx={{ color: 'secondary.light', mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: 17, sm: 19 }, lineHeight: 1.3 }}>{d.name}</Typography>
                {d.description && <Typography sx={{ fontSize: 13.5, opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>{d.description}</Typography>}
              </Box>
            </Box>
          ))}
        </Box>
        {deliverables.length > shown.length && <Typography sx={{ fontSize: 13, opacity: 0.85, mt: 1 }}>…and {deliverables.length - shown.length} more</Typography>}
      </Box>
      {facts.length > 0 && <AtAGlance facts={facts} onDark />}
    </Box>
  );
}

/** "5 guided steps · 3 things to build · ages 9–13 · Beginner" as tiles. */
export function AtAGlance({ facts, onDark = false, sx }) {
  return (
    <Box sx={{ position: 'relative', display: 'grid', gap: 1.25, gridTemplateColumns: { xs: `repeat(${facts.length > 3 ? 2 : facts.length}, minmax(0, 1fr))`, sm: `repeat(${Math.min(facts.length, 4)}, minmax(0, 1fr))` }, ...sx }}>
      {facts.map((f) => (
        <Box key={f.label} sx={{ p: { xs: 1.25, sm: 1.5 }, minWidth: 0, overflowWrap: 'anywhere', borderRadius: 2.5, textAlign: 'center', ...(onDark ? { bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' } : { bgcolor: 'surface.card', border: '1px solid', borderColor: 'divider' }) }}>
          <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 900, lineHeight: 1.1 }}>{f.value}</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, opacity: onDark ? 0.85 : 1, color: onDark ? 'inherit' : 'text.secondary', mt: 0.25 }}>{f.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/** The buy panel's value line: steps, what a step costs, for life. */
export function ValueLine({ price, steps }) {
  if (!price) return null;
  const perStep = steps > 0 ? Math.round(price.amount / steps) : null;
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {steps > 0 && <Chip size="small" label={`${steps} guided steps`} sx={{ fontWeight: 800 }} />}
      {perStep && <Chip size="small" label={`About ${formatKsh(perStep, price.currency)} a step`} sx={{ fontWeight: 800 }} />}
      <Chip size="small" color="success" label="Yours for life" sx={{ fontWeight: 800 }} />
    </Box>
  );
}

/** A thing on "What you'll need" that the Store sells — matched by name. */
export function findInStore(requirement, items) {
  const want = String(requirement || '').trim().toLowerCase();
  if (!want) return null;
  return items.find((it) => it.name.toLowerCase() === want)
    || items.find((it) => want.includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(want))
    || null;
}

/**
 * "You'll need" in the buy panel — the full cost up front, never a surprise after deciding: each
 * thing the project needs, with the Store's price and "Add to cart too", or "I already have one".
 */
export function ProjectNeeds({ requirements = [], storeItems = [], kitPrice = null }) {
  const [state, setState] = useState({});
  if (!requirements.length) return null;
  const rows = requirements.map((r) => ({ name: r, item: findInStore(r, storeItems) }));
  const add = (item) => {
    cart.add({ type: 'store_item', id: item.id, slug: item.slug, name: item.name, image: item.image || null, unitPrice: item.price.amount, currency: item.price.currency || 'KES', quantity: 1 });
    setState((s) => ({ ...s, [item.id]: 'added' }));
  };
  return (
    <Box sx={{ p: 2, borderRadius: 3, border: '1.5px dashed', borderColor: 'secondary.main', bgcolor: 'surface.subtle', display: 'grid', gap: 1.25 }}>
      <Typography sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.75 }}><InfoOutlinedIcon fontSize="small" color="secondary" /> You&rsquo;ll also need</Typography>
      {rows.map(({ name, item }) => {
        const s = item ? state[item.id] : null;
        return (
          <Box key={name} sx={{ display: 'grid', gap: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'baseline' }}>
              {item ? (
                <Typography component={RouterLink} to={storeItemPath(item.slug)} sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{name}</Typography>
              ) : <Typography sx={{ fontWeight: 700 }}>{name}</Typography>}
              {item?.price && <Typography sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{formatKsh(item.price.amount, item.price.currency)}</Typography>}
            </Box>
            {item?.price && (
              s === 'added' ? (
                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 700, display: 'flex', gap: 0.5, alignItems: 'center' }}><DoneAllRoundedIcon fontSize="small" /> Added to your cart</Typography>
              ) : s === 'have' ? (
                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 700, display: 'flex', gap: 0.5, alignItems: 'center' }}><CheckCircleRoundedIcon fontSize="small" /> Great — you&rsquo;re all set</Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" startIcon={<AddShoppingCartRoundedIcon />} onClick={() => add(item)}>Add to cart too</Button>
                  <Button size="small" onClick={() => setState((x) => ({ ...x, [item.id]: 'have' }))}>I already have one</Button>
                </Box>
              )
            )}
          </Box>
        );
      })}
      {kitPrice && <Typography variant="body2" color="text.secondary">Or tick the materials kit above (+{formatKsh(kitPrice.amount, kitPrice.currency)}) for everything else in one go.</Typography>}
    </Box>
  );
}

/** After paying: three steps, so nobody wonders what happens next. */
export function ProjectHowItWorks() {
  const steps = [
    { icon: ShoppingCartCheckoutRoundedIcon, title: 'Buy it', text: 'Add it to your cart and check out. You say which child it’s for — their Digifunzi login, or make one for them there and then.' },
    { icon: SchoolRoundedIcon, title: 'Pay, and it opens', text: 'Pay the way that suits you. As soon as your payment is confirmed, the project opens in your child’s learner account.' },
    { icon: RocketLaunchRoundedIcon, title: 'They build, step by step', text: 'At their own pace, each step ending with something that works — and it’s theirs to come back to for life.' },
  ];
  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
      {steps.map(({ icon: Icon, title, text }, i) => (
        <Box key={title} sx={{ p: 2.25, borderRadius: 3, bgcolor: 'surface.card', border: '1px solid', borderColor: 'divider', display: 'grid', gap: 0.75, alignContent: 'start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 14 }}>{i + 1}</Box>
            <Icon color="primary" />
          </Box>
          <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{text}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/** The worries parents have before buying a project — answered. */
export function projectFaqs({ requirements = [], ages = null }) {
  return [
    { q: 'Does my child need any coding experience?', a: 'No. The steps start from the beginning and build up one at a time, each ending with something that works. If they get stuck, they can go back over a step as often as they like.' },
    ages && { q: 'Is it right for my child’s age?', a: `It’s written for ${ages.replace(/^Ages /, 'ages ')}. Younger children can do it with a little help from an adult; older ones can race through and add their own ideas.` },
    requirements.length > 0
      ? { q: 'What do we need at home?', a: `A computer or laptop with internet, and ${requirements.join(', ')}. Everything you need is listed on this page, and the things we sell can go in the same order.` }
      : { q: 'What do we need at home?', a: 'A computer or laptop with internet. Nothing else to buy.' },
    { q: 'How does my child get the project after I pay?', a: 'At checkout you say which child it’s for: type their Digifunzi username, or choose a username and password for them there and then. It opens in their learner account as soon as your payment is confirmed, and you follow along from your parent account.' },
    { q: 'Can brothers and sisters share it?', a: 'Each purchase is for one learner, so their progress and work stay their own. Buying for a class or a club? Ask us for a class-set price.' },
    { q: 'What if we have a question along the way?', a: 'Message our team on WhatsApp — real people who teach these projects in our classes.' },
  ].filter(Boolean);
}

/** Real parents' words (shared and featured by the team) — nothing when there are none. */
export function ParentQuotes({ sx }) {
  const { data = [] } = useQuery({ queryKey: ['public-testimonials'], queryFn: publicApi.listTestimonials, staleTime: 10 * 60 * 1000 });
  const quotes = data.filter((t) => t?.quote).slice(0, 2);
  if (!quotes.length) return null;
  return (
    <Box sx={sx}>
    <DetailHeading title="What parents say" icon={<FormatQuoteRoundedIcon />} />
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: quotes.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr' } }}>
      {quotes.map((t, i) => (
        <Box key={i} component="figure" sx={{ m: 0, p: 2.5, borderRadius: 3, bgcolor: 'surface.card', border: '1px solid', borderColor: 'divider' }}>
          <FormatQuoteRoundedIcon color="secondary" />
          <Typography component="blockquote" sx={{ m: 0, fontSize: 16, lineHeight: 1.6 }}>{t.quote}</Typography>
          <Typography component="figcaption" variant="body2" sx={{ mt: 1, color: 'text.secondary', fontWeight: 700 }}>{t.name || 'A Digifunzi parent'}{t.role ? ` · ${t.role}` : ''}</Typography>
        </Box>
      ))}
    </Box>
    </Box>
  );
}
