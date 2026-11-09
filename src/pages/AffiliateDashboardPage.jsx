import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { APP_URL } from '../config/env.js';

/**
 * /affiliate — where the old private dashboard links (/affiliate?token=…, 6 Nov 2026) land. Every
 * affiliate now has a Digifunzi account and signs in to it (server: modules/affiliates/ — Affiliate
 * sign-in, the portal's /affiliate-portal), so this page only points them there: sign in, or set
 * a password first with "Forgot password?" (a new affiliate's welcome email has a set-password
 * link). Never indexed.
 */

const card = { p: { xs: 2.5, sm: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm' };

export default function AffiliateDashboardPage() {
  return (
    <>
      <SeoHead title="Your affiliate account" noindex />
      <PageHeader title="Your affiliate account" lead="Your referrals, earnings and payouts are now in your own Digifunzi account." />
      <Section>
        <Box sx={{ ...card, maxWidth: 620, mx: 'auto', textAlign: 'center', display: 'grid', gap: 2, justifyItems: 'center' }}>
          <LockOpenRoundedIcon color="primary" sx={{ fontSize: 46 }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>Sign in to see your dashboard</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
            Sign in with the email address we have for you. If you haven&rsquo;t set a password yet, use the link in your welcome email, or choose &ldquo;Forgot password?&rdquo; and we&rsquo;ll email you one.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
            <Button href={`${APP_URL}/login`} variant="contained" size="large">Sign in</Button>
            <Button href={`${APP_URL}/forgot-password`} variant="outlined" size="large">Set or reset my password</Button>
          </Box>
        </Box>
      </Section>
    </>
  );
}
