import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { LoadingBlock } from '../components/common/StateViews.jsx';
import { publicApi } from '../services/api.js';
import { formatKsh } from '../cart/format.js';

/**
 * An affiliate's private dashboard (/affiliate?token=…) — for affiliates who aren't users of the
 * system, so have no login. The token comes from their emails (server: modules/affiliates/, an
 * HMAC of their id; staff can make a new one, and the old stops working). Read only, plus asking
 * for a payout: their link and code to share, totals, the families they referred (first names
 * only), what they've earned and their payouts. Payout details show only a hint — to change them
 * they contact us (a leaked link must never be able to redirect a payout). Never indexed.
 */

const card = { p: { xs: 2.25, sm: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm' };
const STATE = { waiting: ['Waiting', 'default'], available: ['Available', 'success'], requested: ['Payout asked', 'warning'], paid: ['Paid', 'primary'], cancelled: ['Cancelled', 'default'] };
const REF = { signed_up: ['Signed up — not paid yet', 'warning'], paid: ['Paying', 'success'], cancelled: ['Not counted', 'default'] };
const METHOD = { mpesa: 'M-Pesa', bank: 'Bank transfer', cash: 'Cash', credit: 'Invoice credit' };
const day = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function Stat({ label, value, note }) {
  return (
    <Box sx={{ ...card, py: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, mt: 0.5 }}>{value}</Typography>
      {note && <Typography variant="body2" color="text.secondary">{note}</Typography>}
    </Box>
  );
}

export default function AffiliateDashboardPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const qc = useQueryClient();
  const [copied, setCopied] = useState('');
  const query = useQuery({ queryKey: ['affiliate-dashboard', token], queryFn: () => publicApi.getAffiliateDashboard(token), enabled: Boolean(token), retry: false });
  const payout = useMutation({
    mutationFn: () => publicApi.requestAffiliatePayout(token),
    onSuccess: (data) => qc.setQueryData(['affiliate-dashboard', token], data),
  });
  const copy = (text, what) => {
    try {
      window.navigator.clipboard.writeText(text).then(() => { setCopied(what); window.setTimeout(() => setCopied(''), 2000); });
    } catch { /* clipboard blocked */ }
  };

  const data = query.data;
  const a = data?.affiliate;
  const t = data?.totals;
  const message = a ? `I recommend Digifunzi for children's digital skills — have a look: ${a.link}  (or use my code ${a.code} when you sign up)` : '';
  const canAsk = t && a?.status === 'active' && t.available > 0 && t.available >= data.programme.minimumPayout && t.requested === 0;

  return (
    <>
      <SeoHead title="Your affiliate dashboard" noindex />
      <PageHeader title={a ? `Hi ${a.name.split(' ')[0]}` : 'Your affiliate dashboard'} lead={data?.programme?.offer ? `You earn ${data.programme.offer}.` : 'Your referrals, earnings and payouts.'} />
      <Section>
        <Box sx={{ maxWidth: 980, mx: 'auto', display: 'grid', gap: 3 }}>
          {!token ? (
            <Alert severity="info">Open this page from the link in one of our emails. Not an affiliate yet? <RouterLink to="/become-an-affiliate">Apply here</RouterLink>.</Alert>
          ) : query.isLoading ? <LoadingBlock /> : query.isError ? (
            <Alert severity="warning">{query.error?.message || 'This link doesn’t work any more — ask us for a new one.'} <RouterLink to="/contact">Contact us</RouterLink></Alert>
          ) : a && (
            <>
              {a.status === 'pending' && <Alert severity="info">Your application is waiting for approval — your link and code work once we approve you.</Alert>}
              {a.status === 'suspended' && <Alert severity="warning">Your referral link is paused. <RouterLink to="/contact">Talk to us</RouterLink> if you think this is a mistake.</Alert>}

              {a.status === 'active' && (
                <Box sx={{ ...card, display: 'grid', gap: 1.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main' }}>Your link and code</Typography>
                  {a.link && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Box component="code" sx={{ flex: '1 1 260px', p: 1.25, borderRadius: 2, bgcolor: 'surface.subtle', overflowWrap: 'anywhere', fontSize: 14 }}>{a.link}</Box>
                      <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={() => copy(a.link, 'link')}>{copied === 'link' ? 'Copied' : 'Copy link'}</Button>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography color="text.secondary">Code</Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.06em' }}>{a.code}</Typography>
                    <Button size="small" startIcon={<ContentCopyRoundedIcon />} onClick={() => copy(a.code, 'code')}>{copied === 'code' ? 'Copied' : 'Copy'}</Button>
                    <Button size="small" variant="contained" color="success" startIcon={<WhatsAppIcon />} href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary">A family who opens your link, or types your code when signing up, is credited to you.</Typography>
                </Box>
              )}

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
                <Stat label="Earned" value={formatKsh(t.earned)} />
                <Stat label="Available" value={formatKsh(t.available)} note={t.waiting > 0 ? `+ ${formatKsh(t.waiting)} waiting` : null} />
                <Stat label="Paid to you" value={formatKsh(t.paid)} />
                <Stat label="Families" value={data.referrals.length} />
              </Box>

              {a.status === 'active' && (
                <Box sx={{ ...card, display: 'grid', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 800 }}>Getting paid</Typography>
                  <Typography variant="body2" color="text.secondary">
                    By {METHOD[a.payoutMethod] || 'M-Pesa'}{a.payoutMethod === 'mpesa' && a.payoutPhone ? ` to ${a.payoutPhone}` : ''}{a.payoutMethod === 'bank' && a.payoutDetails ? ' (details on file)' : ''}. To change this, <RouterLink to="/contact">contact us</RouterLink>.
                    {data.programme.holdDays ? ` Each amount can be paid out ${data.programme.holdDays} days after the family pays.` : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button variant="contained" disabled={!canAsk || payout.isPending} onClick={() => payout.mutate()}>
                      {payout.isPending ? 'Asking…' : `Ask for ${formatKsh(t.available)}`}
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {t.requested > 0 ? `${formatKsh(t.requested)} is being paid.` : t.available < data.programme.minimumPayout ? `Payouts start from ${formatKsh(data.programme.minimumPayout)}.` : ''}
                    </Typography>
                  </Box>
                  {payout.isError && <Alert severity="error">{payout.error?.message}</Alert>}
                  {payout.isSuccess && <Alert severity="success">Thanks — our team will pay it and email you.</Alert>}
                </Box>
              )}

              <Box sx={{ ...card, display: 'grid', gap: 1.25 }}>
                <Typography sx={{ fontWeight: 800 }}>Families you referred</Typography>
                {data.referrals.length === 0 ? <Typography color="text.secondary">No one yet — share your link to get started.</Typography> : data.referrals.map((r) => (
                  <Box key={r.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700 }}>{r.firstName}</Typography>
                      <Typography variant="body2" color="text.secondary">{r.programme} · {day(r.createdAt)} · {r.via === 'code' ? 'used your code' : 'came by your link'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                      {r.earned > 0 && <Typography sx={{ fontWeight: 800 }}>{formatKsh(r.earned)}</Typography>}
                      <Chip size="small" label={REF[r.status]?.[0] || r.status} color={REF[r.status]?.[1] || 'default'} variant="outlined" />
                    </Box>
                  </Box>
                ))}
              </Box>

              {(data.commissions.length > 0 || data.payouts.length > 0) && (
                <Box sx={{ ...card, display: 'grid', gap: 1 }}>
                  <Typography sx={{ fontWeight: 800 }}>What you&rsquo;ve earned</Typography>
                  {data.commissions.map((c) => (
                    <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2">{c.firstName} · {c.programme}{c.periodNumber > 1 ? ` · payment ${c.periodNumber}` : ''} · {day(c.createdAt)}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 800 }}>{formatKsh(c.amount)}</Typography>
                        <Chip size="small" label={c.state === 'waiting' ? `From ${day(c.availableAt)}` : STATE[c.state]?.[0]} color={STATE[c.state]?.[1] || 'default'} variant="outlined" />
                      </Box>
                    </Box>
                  ))}
                  {data.payouts.map((p) => (
                    <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', py: 1 }}>
                      <Typography variant="body2">Payout · {METHOD[p.method]} · {day(p.createdAt)}{p.reference ? ` · ${p.reference}` : ''}{p.note ? ` · ${p.note}` : ''}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 800 }}>{formatKsh(p.amount)}</Typography>
                        <Chip size="small" label={p.status === 'paid' ? 'Paid' : p.status === 'rejected' ? 'Not paid' : 'Being paid'} color={p.status === 'paid' ? 'primary' : p.status === 'rejected' ? 'default' : 'warning'} variant="outlined" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              <Typography variant="body2" color="text.secondary">
                Keep this page&rsquo;s link to yourself. Read the <RouterLink to="/affiliate-terms">affiliate terms</RouterLink>.
              </Typography>
            </>
          )}
        </Box>
      </Section>
    </>
  );
}
