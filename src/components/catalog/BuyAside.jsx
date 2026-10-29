import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { AsideCard } from '../common/DetailLayout.jsx';
import BuyBox from './BuyBox.jsx';

const ASSURANCES = {
  store_item: [
    { icon: <PaymentsOutlinedIcon />, text: 'Pay by M-Pesa, bank or cash after checkout' },
    { icon: <LocalShippingOutlinedIcon />, text: 'Collect from a Digifunzi hub or have it delivered' },
  ],
  project: [
    { icon: <SchoolOutlinedIcon />, text: 'Opens in your child’s learner account once paid' },
    { icon: <AllInclusiveRoundedIcon />, text: 'Lifetime access — revisit any step, any time' },
    { icon: <PaymentsOutlinedIcon />, text: 'Pay by M-Pesa, bank or cash after checkout' },
  ],
};

/**
 * The side panel of a Store page (a good or a project): a heading, the compact BuyBox, and what
 * happens once you've paid. Same props as BuyBox, plus `title`.
 */
export default function BuyAside({ title, kind, ...buyBoxProps }) {
  return (
    <AsideCard>
      <Typography variant="h4" component="p">{title}</Typography>
      <BuyBox kind={kind} {...buyBoxProps} compact />
      <Divider />
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25 }}>
        {ASSURANCES[kind].map((a) => (
          <Box
            component="li"
            key={a.text}
            sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', '& svg': { fontSize: 20, color: 'primary.main', flexShrink: 0 } }}
          >
            {a.icon}
            <Typography variant="body2" color="text.secondary">{a.text}</Typography>
          </Box>
        ))}
      </Box>
    </AsideCard>
  );
}
