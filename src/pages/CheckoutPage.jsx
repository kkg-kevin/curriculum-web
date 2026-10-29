import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { EmptyBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import Honeypot from '../components/forms/Honeypot.jsx';
import PrivacyNote from '../components/forms/PrivacyNote.jsx';
import PaymentStep from '../components/payments/PaymentStep.jsx';
import { cart, useCart } from '../cart/cartStore.js';
import { formatKsh } from '../cart/format.js';
import { publicApi } from '../services/api.js';
import { APP_URL } from '../config/env.js';
import { STORE_PROJECTS_PATH } from '../utils/storePaths.js';

const sectionSx = { p: { xs: 2.5, sm: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm' };
const gridSx = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } };
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
const looksLikePhone = (v) => /^[+\d][\d\s()-]{8,28}$/.test(String(v || '').trim());
const looksLikeUsername = (v) => /^[a-zA-Z0-9._-]{3,30}$/.test(String(v || '').trim());

const FULFILMENT_LABEL = { pickup: 'Collect from a hub', delivery: 'Delivery' };

function OrderSummary({ lines, lineTotal, currency, deliveryFee }) {
  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  return (
    <Box sx={{ ...sectionSx, position: { md: 'sticky' }, top: { md: 96 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
        <Typography variant="h5" component="h2">Your order</Typography>
        <Button component={RouterLink} to="/cart" size="small">Edit</Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {lines.map((l) => (
          <Box key={l.key} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{l.name}{l.quantity > 1 ? ` × ${l.quantity}` : ''}</Typography>
              {l.type === 'project' && <Typography variant="caption" color="text.secondary">Project{l.withKit ? ' + materials kit' : ''}</Typography>}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatKsh(lineTotal(l), l.currency)}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1.5, pt: 1.5, display: 'grid', gap: 0.5 }}>
        {deliveryFee > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Delivery</Typography>
            <Typography variant="body2">{formatKsh(deliveryFee, currency)}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800 }}>Total</Typography>
          <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{formatKsh(subtotal + deliveryFee, currency)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

// After the order is placed: what was ordered, the Payment step, and the logins when it had projects.
function Placed({ result, phone }) {
  return (
    <Box sx={{ ...sectionSx, py: { xs: 3, sm: 4 } }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <CheckCircleRoundedIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
        <Typography variant="h3" component="h2" sx={{ mb: 1 }}>Order {result.orderNumber} placed — now pay</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 540, mx: 'auto' }}>
          We&apos;ve emailed you the details.{' '}
          {result.fulfilment.method === 'pickup' && `You'll collect it at ${result.fulfilment.hubName} — we'll email you when it's ready.`}
          {result.fulfilment.method === 'delivery' && "We'll email you when it's on its way."}
          {result.child && ' The projects open in your child’s learner account as soon as your payment is confirmed.'}
        </Typography>
      </Box>

      <PaymentStep
        pay={result.pay}
        amountDue={result.amountDue}
        invoiceNumber={result.invoiceNumber}
        defaultPhone={phone}
        paidMessage={result.child ? 'Paid — the projects are in your child’s account.' : 'Paid — thank you! We’ll get your order ready.'}
        laterNote="Not paying right now? That’s fine — the email we’ve just sent you has a link to pay any time in the next 14 days."
      />

      {result.child && (
        <Box sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
          <Typography variant="overline" color="text.secondary">Your logins</Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1 }}>
            <Box component="li" sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 700 }}>Parent</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in with <strong>{result.parentAccount.email}</strong> and {result.parentAccount.existing ? 'your existing password' : 'the password you chose'}.
              </Typography>
            </Box>
            <Box component="li" sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 700 }}>{result.child.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Username <strong>{result.child.username}</strong>{result.child.created ? ' with the password you chose' : ''}.
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ textAlign: 'center', display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {result.child && <Button href={`${APP_URL}/login`} variant="contained">Go to sign in</Button>}
        <Button component={RouterLink} to="/store" variant={result.child ? 'outlined' : 'contained'}>Back to the store</Button>
      </Box>
    </Box>
  );
}

/**
 * /checkout — buying what's in the cart: your details (and, for projects, your parent account and
 * the child they're for) → how it reaches you (when there's something to send) → review → the
 * Payment step. Placing the order creates it with an invoice (server: modules/orders); paying it
 * runs exactly like a sign-up's payment.
 */
export default function CheckoutPage() {
  const { lines, currency, hasProjects, hasPhysical, lineTotal } = useCart();
  const optionsQuery = useQuery({ queryKey: ['checkout-options'], queryFn: publicApi.getCheckout, staleTime: 5 * 60 * 1000 });
  const options = optionsQuery.data;

  const steps = useMemo(() => ['Your details', ...(hasPhysical ? ['Delivery'] : []), 'Review', 'Payment'], [hasPhysical]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    parentPassword: '', parentPasswordAgain: '',
    childMode: 'new', childName: '', childAge: '', childUsername: '', childPassword: '',
    method: '', hubId: '', address: '', town: '', county: '', note: '',
    consent: false, hp_field: '',
  });
  const [touched, setTouched] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const pickup = options?.pickup;
  const delivery = options?.delivery;
  const method = form.method || (pickup?.enabled ? 'pickup' : delivery?.enabled ? 'delivery' : '');
  const deliveryFee = hasPhysical && method === 'delivery' ? Number(delivery?.fee || 0) : 0;
  const stepName = steps[step];

  if (result) {
    return (
      <>
        <SeoHead title="Order placed" noindex />
        <PageHeader title="Checkout" />
        <Section py={{ xs: 5, md: 8 }}>
          <Box sx={{ maxWidth: 820, mx: 'auto' }}>
            <Stepper activeStep={result.steps.length - 1} alternativeLabel sx={{ mb: 4 }}>
              {result.steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>
            <Placed result={result} phone={form.phone} />
          </Box>
        </Section>
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <SeoHead title="Checkout" noindex />
        <PageHeader title="Checkout" />
        <Section py={{ xs: 5, md: 8 }}>
          <EmptyBlock title="Your cart is empty" body="Add a kit or a project first, then come back here to check out." />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: -4 }}>
            <Button component={RouterLink} to="/store" variant="contained">Visit the store</Button>
            <Button component={RouterLink} to={STORE_PROJECTS_PATH} variant="outlined">See projects</Button>
          </Box>
        </Section>
      </>
    );
  }

  // What's missing on a step, as one sentence each — shown once they've tried to continue.
  const problems = {
    'Your details': [
      form.name.trim().length < 2 && 'Enter your name.',
      !looksLikeEmail(form.email) && 'Enter a valid email address.',
      !looksLikePhone(form.phone) && 'Enter a phone number we can reach you on.',
      ...(hasProjects ? [
        form.parentPassword.length < 6 && 'Choose a parent account password of at least 6 characters.',
        form.parentPassword !== form.parentPasswordAgain && 'The two parent passwords don’t match.',
        ...(form.childMode === 'new' ? [
          form.childName.trim().length < 2 && 'Enter your child’s name.',
          !(Number(form.childAge) >= 3 && Number(form.childAge) <= 19) && 'Enter your child’s age (3–19).',
          !looksLikeUsername(form.childUsername) && 'Choose a username for your child: 3–30 letters, numbers, dots, dashes or underscores.',
          form.childPassword.length < 6 && 'Choose your child’s password, at least 6 characters.',
        ] : [!looksLikeUsername(form.childUsername) && 'Enter your child’s username.']),
      ] : []),
    ].filter(Boolean),
    Delivery: [
      !method && 'Choose how you’d like to get your order.',
      method === 'pickup' && !form.hubId && 'Choose the hub you’ll collect from.',
      method === 'delivery' && (!form.address.trim() || !form.town.trim() || !form.county.trim()) && 'Enter the delivery address, town and county.',
    ].filter(Boolean),
    Review: [!form.consent && 'Please agree before placing your order.'].filter(Boolean),
  };
  const current = problems[stepName] || [];

  const next = () => {
    setTouched(true);
    if (current.length) return;
    setTouched(false);
    setStep((s) => s + 1);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async () => {
    setTouched(true);
    if (current.length) return;
    setError('');
    setPlacing(true);
    try {
      const data = await publicApi.placeOrder({
        lines: lines.map((l) => (l.type === 'project' ? { type: 'project', id: l.id, withKit: Boolean(l.withKit) } : { type: 'store_item', id: l.id, quantity: l.quantity })),
        customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
        fulfilment: hasPhysical
          ? { method, hubId: method === 'pickup' ? form.hubId : null, address: form.address, town: form.town, county: form.county, note: form.note }
          : { method: 'none' },
        ...(hasProjects ? {
          parentPassword: form.parentPassword,
          child: form.childMode === 'new'
            ? { mode: 'new', name: form.childName.trim(), age: Number(form.childAge), username: form.childUsername.trim(), password: form.childPassword }
            : { mode: 'existing', username: form.childUsername.trim() },
        } : {}),
        consent: true,
        hp_field: form.hp_field,
      });
      cart.clear();
      setResult({ ...data, steps });
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'We couldn’t place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const honeypotRegister = (name) => ({ name, value: form.hp_field, onChange: set('hp_field') });

  return (
    <>
      <SeoHead title="Checkout" noindex />
      <PageHeader title="Checkout" lead="A few details and you're done. You'll pay on the last step — by M-Pesa, bank or cash." />
      <Section py={{ xs: 5, md: 8 }}>
        <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 320px' }, alignItems: 'start' }}>
            <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); if (stepName === 'Review') placeOrder(); else next(); }} sx={{ display: 'grid', gap: 2, position: 'relative' }}>
              <Honeypot register={honeypotRegister} />

              {stepName === 'Your details' && (
                <>
                  <Box sx={sectionSx}>
                    <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Your details</Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <TextField label="Your name" value={form.name} onChange={set('name')} required autoComplete="name" />
                      <Box sx={gridSx}>
                        <TextField label="Email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" helperText="We send your order and receipt here." />
                        <TextField label="Phone" value={form.phone} onChange={set('phone')} required autoComplete="tel" inputMode="tel" placeholder="0712 345 678" helperText="For M-Pesa and about delivery." />
                      </Box>
                    </Box>
                  </Box>

                  {hasProjects && (
                    <>
                      <Box sx={sectionSx}>
                        <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>Your parent account</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Projects live in your child’s learner account; you follow along with yours. If this email already has a Digifunzi account, enter its password.
                        </Typography>
                        <Box sx={gridSx}>
                          <TextField label="Password" type="password" value={form.parentPassword} onChange={set('parentPassword')} autoComplete="new-password" helperText="At least 6 characters" />
                          <TextField label="Confirm password" type="password" value={form.parentPasswordAgain} onChange={set('parentPasswordAgain')} autoComplete="new-password" />
                        </Box>
                      </Box>

                      <Box sx={sectionSx}>
                        <Typography variant="h4" component="h2" sx={{ mb: 1 }}>Who are the projects for?</Typography>
                        <RadioGroup row value={form.childMode} onChange={set('childMode')} sx={{ mb: 1.5 }}>
                          <FormControlLabel value="new" control={<Radio />} label="A new child" />
                          <FormControlLabel value="existing" control={<Radio />} label="My child already has a login" />
                        </RadioGroup>
                        {form.childMode === 'new' ? (
                          <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box sx={{ ...gridSx, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' } }}>
                              <TextField label="Child’s name" value={form.childName} onChange={set('childName')} />
                              <TextField label="Age" type="number" value={form.childAge} onChange={set('childAge')} slotProps={{ htmlInput: { min: 3, max: 19 } }} />
                            </Box>
                            <Box sx={gridSx}>
                              <TextField label="Choose a username" value={form.childUsername} onChange={set('childUsername')} autoComplete="off" helperText="Letters, numbers, dots, dashes, underscores" />
                              <TextField label="Child’s password" type="password" value={form.childPassword} onChange={set('childPassword')} autoComplete="new-password" helperText="At least 6 characters" />
                            </Box>
                          </Box>
                        ) : (
                          <TextField label="Your child’s username" value={form.childUsername} onChange={set('childUsername')} fullWidth helperText="The projects are added to that child’s account." />
                        )}
                      </Box>
                    </>
                  )}
                </>
              )}

              {stepName === 'Delivery' && (
                <Box sx={sectionSx}>
                  <Typography variant="h4" component="h2" sx={{ mb: 2 }}>How would you like to get it?</Typography>
                  {optionsQuery.isLoading ? <LoadingBlock label="Loading options…" /> : !pickup?.enabled && !delivery?.enabled ? (
                    <Alert severity="info">We’ll contact you to arrange how you get your order.</Alert>
                  ) : (
                    <>
                      <RadioGroup value={method} onChange={set('method')} sx={{ mb: 2, gap: 1 }}>
                        {pickup?.enabled && <FormControlLabel value="pickup" control={<Radio />} label={<span><strong>{FULFILMENT_LABEL.pickup}</strong> — free</span>} />}
                        {delivery?.enabled && <FormControlLabel value="delivery" control={<Radio />} label={<span><strong>{FULFILMENT_LABEL.delivery}</strong> — {Number(delivery.fee) > 0 ? formatKsh(delivery.fee, currency) : 'free'}</span>} />}
                      </RadioGroup>
                      {method === 'pickup' && (
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          <TextField select label="Hub" value={form.hubId} onChange={set('hubId')} fullWidth>
                            {pickup.hubs.map((h) => <MenuItem key={h.id} value={h.id}>{h.name}{h.town ? ` — ${h.town}` : ''}</MenuItem>)}
                          </TextField>
                          {pickup.note && <Typography variant="body2" color="text.secondary">{pickup.note}</Typography>}
                        </Box>
                      )}
                      {method === 'delivery' && (
                        <Box sx={{ display: 'grid', gap: 2 }}>
                          <TextField label="Address" value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="Building, street, house number" />
                          <Box sx={gridSx}>
                            <TextField label="Town" value={form.town} onChange={set('town')} autoComplete="address-level2" />
                            <TextField label="County" value={form.county} onChange={set('county')} autoComplete="address-level1" />
                          </Box>
                          <TextField label="Directions or notes (optional)" value={form.note} onChange={set('note')} multiline minRows={2} />
                          {delivery.note && <Typography variant="body2" color="text.secondary">{delivery.note}</Typography>}
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}

              {stepName === 'Review' && (
                <Box sx={sectionSx}>
                  <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Check your order</Typography>
                  {[
                    { title: 'You', to: 0, lines: [form.name, form.email, form.phone] },
                    ...(hasProjects ? [{ title: 'Projects for', to: 0, lines: [form.childMode === 'new' ? `${form.childName} (age ${form.childAge}) — username ${form.childUsername}` : `Your child @${form.childUsername}`] }] : []),
                    ...(hasPhysical ? [{
                      title: 'Getting it', to: 1,
                      lines: method === 'pickup'
                        ? [`Collect from ${pickup?.hubs.find((h) => h.id === form.hubId)?.name || 'a hub'}`]
                        : [`Delivery to ${[form.address, form.town, form.county].filter(Boolean).join(', ')}`, form.note],
                    }] : []),
                  ].map((s) => (
                    <Box key={s.title} sx={{ display: 'flex', gap: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="overline" color="text.secondary">{s.title}</Typography>
                        {s.lines.filter(Boolean).map((line) => <Typography key={line} variant="body2">{line}</Typography>)}
                      </Box>
                      <Button size="small" onClick={() => setStep(s.to)}>Edit</Button>
                    </Box>
                  ))}
                  <FormControlLabel
                    sx={{ mt: 1 }}
                    control={<Checkbox checked={form.consent} onChange={set('consent')} />}
                    label="I agree to Digifunzi using these details to process and deliver my order."
                  />
                  <PrivacyNote sx={{ display: 'block' }}>How we use and protect these details is set out in our</PrivacyNote>
                </Box>
              )}

              {touched && current.length > 0 && (
                <Alert severity="warning">{current[0]}</Alert>
              )}
              {error && <Alert severity="error">{error}</Alert>}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                {step > 0 ? <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => { setTouched(false); setStep((s) => s - 1); }}>Back</Button> : <Button component={RouterLink} to="/cart" startIcon={<ArrowBackRoundedIcon />}>Cart</Button>}
                {stepName === 'Review'
                  ? <Button type="submit" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardRoundedIcon />} disabled={placing}>{placing ? 'Placing your order…' : `Place order · ${formatKsh(lines.reduce((s, l) => s + lineTotal(l), 0) + deliveryFee, currency)}`}</Button>
                  : <Button type="submit" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>Continue</Button>}
              </Box>
            </Box>

            <OrderSummary lines={lines} lineTotal={lineTotal} currency={currency} deliveryFee={deliveryFee} />
          </Box>
        </Box>
      </Section>
    </>
  );
}
