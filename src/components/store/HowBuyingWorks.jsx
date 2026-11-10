import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const STEPS = [
  { icon: <AddShoppingCartRoundedIcon />, title: 'Add what you need', body: 'Pick kits, bundles or projects — your cart keeps them while you browse.' },
  { icon: <PhoneIphoneRoundedIcon />, title: 'Check out and pay', body: 'Give your details, then pay by M-Pesa, bank or cash. We confirm by email.' },
  { icon: <Inventory2OutlinedIcon />, title: 'Collect, or we deliver', body: 'Pick it up at a Digifunzi hub or have it brought to you. Projects open in your child’s account.' },
];

/** "How buying works" — three steps, so nobody wonders what happens after "Add to cart". */
export default function HowBuyingWorks({ sx }) {
  return (
    <Box sx={sx}>
      <Typography component="h2" sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 800, mb: { xs: 2.5, md: 3 } }}>
        How buying works
      </Typography>
      <Box
        component="ol"
        sx={{
          m: 0, p: 0, listStyle: 'none', display: 'grid', gap: { xs: 2, md: 3 },
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, counterReset: 'step',
        }}
      >
        {STEPS.map((s, i) => (
          <Box
            component="li"
            key={s.title}
            sx={{ position: 'relative', p: { xs: 2.5, md: 3 }, borderRadius: 3, bgcolor: 'surface.card', border: '1px solid', borderColor: 'surface.ring' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                aria-hidden
                sx={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', '& svg': { fontSize: 22 } }}
              >
                {s.icon}
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: 'text.secondary' }}>STEP {i + 1}</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{s.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>{s.body}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
