import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

/**
 * Why it's safe and easy to buy here — the same promises everywhere in the Store, so a family
 * reads them once on the shelves and again beside the buy button.
 *
 *   variant  'strip'  four across under the Store's header (two by two on a phone)
 *            'list'   a short list in a product's buy panel (`kind` picks the lines)
 *   kind     'store_item' | 'project' (list only)
 */
const STRIP = [
  { icon: <PaymentsOutlinedIcon />, title: 'Pay your way', body: 'M-Pesa, bank transfer or cash' },
  { icon: <LocalShippingOutlinedIcon />, title: 'Pickup or delivery', body: 'Collect at a Digifunzi hub or have it delivered' },
  { icon: <SchoolOutlinedIcon />, title: 'Made for learning', body: 'Used in our own classes and bootcamps' },
  { icon: <SupportAgentOutlinedIcon />, title: 'Real help', body: 'Questions answered by our team on WhatsApp' },
];

const LIST = {
  store_item: [
    { icon: <PaymentsOutlinedIcon />, text: 'Pay by M-Pesa, bank or cash after checkout' },
    { icon: <LocalShippingOutlinedIcon />, text: 'Collect from a Digifunzi hub or have it delivered' },
    { icon: <VerifiedOutlinedIcon />, text: 'The same kit our educators teach with' },
  ],
  project: [
    { icon: <SchoolOutlinedIcon />, text: 'Opens in your child’s learner account once paid' },
    { icon: <AllInclusiveRoundedIcon />, text: 'Lifetime access — revisit any step, any time' },
    { icon: <PaymentsOutlinedIcon />, text: 'Pay by M-Pesa, bank or cash after checkout' },
  ],
};

export default function StoreAssurances({ variant = 'strip', kind = 'store_item', sx }) {
  if (variant === 'list') {
    return (
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25, ...sx }}>
        {LIST[kind].map((a) => (
          <Box
            component="li"
            key={a.text}
            sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', '& svg': { fontSize: 20, color: 'primary.main', flexShrink: 0, mt: 0.1 } }}
          >
            {a.icon}
            <Typography variant="body2" color="text.secondary">{a.text}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      component="ul"
      aria-label="Buying from Digifunzi"
      sx={{
        m: 0, p: 0, listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
        gap: { xs: 1.5, md: 2 },
        ...sx,
      }}
    >
      {STRIP.map((a) => (
        <Box
          component="li"
          key={a.title}
          sx={{
            display: 'flex', gap: { xs: 1.25, md: 1.5 }, alignItems: { xs: 'center', sm: 'flex-start' }, p: { xs: 1.25, md: 2 },
            borderRadius: 3, bgcolor: 'surface.card', border: '1px solid', borderColor: 'surface.ring',
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: { xs: 34, md: 40 }, height: { xs: 34, md: 40 }, borderRadius: 2.5, flexShrink: 0, display: 'grid', placeItems: 'center',
              bgcolor: 'surface.subtle', color: 'primary.main', '& svg': { fontSize: 22 },
            }}
          >
            {a.icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', md: '0.95rem' }, lineHeight: 1.3 }}>{a.title}</Typography>
            {/* On a phone the four sit two by two — the titles say enough there. */}
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.85rem', mt: 0.25, lineHeight: 1.45 }}>{a.body}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
