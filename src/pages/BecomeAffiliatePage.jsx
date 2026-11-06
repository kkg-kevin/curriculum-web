import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import FamilyRestroomRoundedIcon from '@mui/icons-material/FamilyRestroomRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { LoadingBlock } from '../components/common/StateViews.jsx';
import { publicApi } from '../services/api.js';
import { formatKsh } from '../cart/format.js';

/**
 * "Become an affiliate" (/become-an-affiliate): for people who aren't Digifunzi users — anyone
 * who can send families our way. The offer (from the system's Affiliates → Settings), how it
 * works, and an application: name, email, phone, how they'd share, how they'd like to be paid,
 * agreeing to the affiliate terms (/affiliate-terms). An admin approves; they're then emailed
 * their link, code and private dashboard. Server: modules/affiliates/ (POST
 * /api/public/affiliate-applications).
 */

const card = { p: { xs: 2.5, sm: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm' };
const EMPTY = { name: '', email: '', phone: '', promotion: '', payoutMethod: 'mpesa', payoutPhone: '', payoutDetails: '', acceptTerms: false, hp_field: '' };

function Step({ icon: Icon, title, text }) {
  return (
    <Box sx={{ ...card, display: 'grid', gap: 1, alignContent: 'start' }}>
      <Icon color="primary" sx={{ fontSize: 30 }} />
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Box>
  );
}

export default function BecomeAffiliatePage() {
  const programme = useQuery({ queryKey: ['affiliate-programme'], queryFn: publicApi.getAffiliateProgramme, staleTime: 5 * 60 * 1000 });
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const apply = useMutation({ mutationFn: publicApi.applyAffiliate });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const p = programme.data;

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (form.phone.replace(/\D/g, '').length < 9) next.phone = 'Enter your phone number';
    if (form.payoutMethod === 'bank' && !form.payoutDetails.trim()) next.payoutDetails = 'Enter your bank, account name and number';
    if (!form.acceptTerms) next.acceptTerms = 'Please agree to the affiliate terms';
    setErrors(next);
    if (Object.keys(next).length) return;
    apply.mutate({ ...form, payoutPhone: form.payoutPhone || form.phone });
  };

  return (
    <>
      <SeoHead title="Become an affiliate" description="Know families who'd love Digifunzi? Share your own link and earn when they sign up and pay." />
      <PageHeader
        title="Become an affiliate"
        lead={p?.offer ? `Know families who'd love Digifunzi? Share your own link and earn ${p.offer}.` : 'Know families who’d love Digifunzi? Share your own link and earn when they sign up and pay.'}
      />
      <Section>
        <Box sx={{ maxWidth: 980, mx: 'auto', display: 'grid', gap: 4 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            <Step icon={ShareRoundedIcon} title="1. Share your link" text="Once you're approved you get your own link and a short code. Share them on WhatsApp, at your school, church or estate — anywhere." />
            <Step icon={FamilyRestroomRoundedIcon} title="2. Families sign up" text={`A family who opens your link (within ${p?.attributionDays || 30} days), or types your code when signing up, is credited to you.${p?.programmes?.length ? ` Counts for: ${p.programmes.join(', ')}.` : ''}`} />
            <Step icon={PaymentsRoundedIcon} title="3. You get paid" text={`You earn when they pay${p?.holdDays ? `; each amount can be paid out ${p.holdDays} days later` : ''}. Ask for a payout from ${p ? formatKsh(p.minimumPayout) : 'the minimum'} — by M-Pesa or bank.`} />
          </Box>

          {programme.isLoading ? <LoadingBlock /> : p && !p.open ? (
            <Alert severity="info">We&rsquo;re not taking affiliate applications right now. Please check back later, or <RouterLink to="/contact">contact us</RouterLink>.</Alert>
          ) : apply.isSuccess ? (
            <Box sx={{ ...card, textAlign: 'center', py: 5 }}>
              <CheckCircleRoundedIcon color="success" sx={{ fontSize: 52, mb: 1 }} />
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1 }}>Thank you — we&rsquo;ve got your application</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
                {p?.requireApproval === false
                  ? 'Check your email: your link, your code and your dashboard are on their way.'
                  : 'Our team will look at it and email you once you’re approved — with your own link, your code and your dashboard.'}
              </Typography>
            </Box>
          ) : (
            <Box component="form" noValidate onSubmit={submit} sx={{ ...card, display: 'grid', gap: 2.25, maxWidth: 720, mx: 'auto', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>Apply</Typography>
              {/* Only a bot fills this. */}
              <Box aria-hidden="true" sx={{ position: 'absolute', left: '-9999px', top: 0, width: 1, height: 1, overflow: 'hidden' }}>
                <input tabIndex={-1} name="hp_field" value={form.hp_field} onChange={set('hp_field')} autoComplete="off" />
              </Box>
              <TextField label="Your name" value={form.name} onChange={set('name')} required autoComplete="name" error={Boolean(errors.name)} helperText={errors.name} />
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField label="Email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" error={Boolean(errors.email)} helperText={errors.email || 'Where we send your link and dashboard'} />
                <TextField label="Phone" value={form.phone} onChange={set('phone')} required autoComplete="tel" inputMode="tel" placeholder="0712 345 678" error={Boolean(errors.phone)} helperText={errors.phone} />
              </Box>
              <TextField label="How would you share Digifunzi? (optional)" value={form.promotion} onChange={set('promotion')} multiline minRows={3}
                placeholder="E.g. parents' WhatsApp groups at my children's school, my church youth group, my Instagram page…" />
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>How should we pay you?</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  {[['mpesa', 'M-Pesa'], ['bank', 'Bank transfer']].map(([key, label]) => (
                    <Button key={key} variant={form.payoutMethod === key ? 'contained' : 'outlined'} onClick={() => setForm((f) => ({ ...f, payoutMethod: key }))}>{label}</Button>
                  ))}
                </Box>
                {form.payoutMethod === 'mpesa' ? (
                  <TextField label="M-Pesa number" value={form.payoutPhone} onChange={set('payoutPhone')} placeholder={form.phone || '0712 345 678'} helperText="Leave empty to use your phone number above" fullWidth />
                ) : (
                  <TextField label="Bank, account name and number" value={form.payoutDetails} onChange={set('payoutDetails')} fullWidth error={Boolean(errors.payoutDetails)} helperText={errors.payoutDetails} />
                )}
              </Box>
              <Box>
                <FormControlLabel
                  control={<Checkbox checked={form.acceptTerms} onChange={set('acceptTerms')} />}
                  label={<>I agree to the <RouterLink to="/affiliate-terms" target="_blank">affiliate terms</RouterLink></>}
                />
                {errors.acceptTerms && <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4 }}>{errors.acceptTerms}</Typography>}
              </Box>
              {apply.isError && <Alert severity="error">{apply.error?.message || 'Your application couldn’t be sent. Please try again.'}</Alert>}
              <Button type="submit" variant="contained" size="large" disabled={apply.isPending}>{apply.isPending ? 'Sending…' : 'Send my application'}</Button>
              <Typography variant="body2" color="text.secondary">
                We use these details only to run the affiliate programme and pay you. See our <RouterLink to="/privacy">Privacy Policy</RouterLink>.
              </Typography>
            </Box>
          )}
        </Box>
      </Section>
    </>
  );
}
