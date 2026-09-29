import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChildIcons from './ChildIcons.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from '../forms/Honeypot.jsx';
import { homeSchoolingSignupSchema } from '../forms/schemas.js';
import { useHomeLearningSignup } from '../../hooks/usePublicHomeLearning.js';
import { APP_URL } from '../../config/env.js';
import {
  bestPackageFor, childrenLabel, formatKsh, homeSchoolingEnquiryPath, maxChildrenOffered, priceForPackage,
} from '../../content/homeSchooling.js';

const STEPS = ['Package', 'Parent', 'Children', 'Home', 'Review'];
const EMPTY_CHILD = { firstName: '', lastName: '', gender: '', dateOfBirth: '', currentGrade: '', username: '', password: '' };
const sectionSx = { p: { xs: 2.5, sm: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm' };
const gridSx = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } };

// "amina.k47" — a username idea from the child's name (letters/numbers only, plus 2 digits).
function suggestUsername(first, last) {
  const clean = (v) => String(v || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
  const base = [clean(first), clean(last).slice(0, 1)].filter(Boolean).join('.') || 'learner';
  return `${base}${Math.floor(10 + Math.random() * 90)}`.slice(0, 30);
}

function PasswordField({ label, error, helperText, inputProps, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      {...rest}
      label={label}
      type={show ? 'text' : 'password'}
      error={Boolean(error)}
      helperText={error?.message || helperText}
      fullWidth
      slotProps={{
        htmlInput: { autoComplete: 'new-password', ...inputProps },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((v) => !v)} edge="end" size="small">
                {show ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

function Confirmation({ result }) {
  return (
    <Box sx={{ ...sectionSx, textAlign: 'center', py: { xs: 4, sm: 5 } }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
      <Typography variant="h3" component="h2" sx={{ mb: 1 }}>You’re signed up!</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 3 }}>
        We’ve created your family’s accounts for <strong>{result.packageName}</strong>. They unlock as soon as we confirm your payment.
      </Typography>

      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, textAlign: 'left', p: 2.5, mb: 3, borderRadius: 3, bgcolor: 'surface.subtle' }}>
        <PaymentsRoundedIcon color="primary" />
        <Box>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, color: 'primary.main' }}>{formatKsh(result.amountDue)}</Typography>
          <Typography variant="body2" color="text.secondary">
            First month · invoice {result.invoiceNumber}. Pay in cash to our team — we’ll call you on the number you gave us.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'left', maxWidth: 520, mx: 'auto', mb: 3 }}>
        <Typography variant="overline" color="text.secondary">Your logins</Typography>
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1 }}>
          <Box component="li" sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700 }}>Parent</Typography>
            <Typography variant="body2" color="text.secondary">Sign in with <strong>{result.parentEmail}</strong> and your password — you’ll see your children and invoices.</Typography>
          </Box>
          {result.children.map((child) => (
            <Box component="li" key={child.username} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 700 }}>{child.name}</Typography>
              <Typography variant="body2" color="text.secondary">Username <strong>{child.username}</strong> with the password you chose.</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Until your payment is approved, signing in shows “payment pending”. After that you can start straight away.
      </Typography>
      <Button href={`${APP_URL}/login`} variant="contained" size="large">Go to sign in</Button>
    </Box>
  );
}

/**
 * The Home Schooling sign-up: package → parent → children → home → review. Submitting creates the
 * family's accounts (see server: home-learning-signup.service.js); they unlock once our team
 * approves the payment. `packages` are the published packages; `initialSlug` / `initialChildren`
 * come from the package card or price calculator that linked here.
 */
export default function HomeSchoolingSignupForm({ packages, initialSlug, initialChildren }) {
  const maxChildren = Math.max(1, maxChildrenOffered(packages));
  const startCount = Math.min(maxChildren, Math.max(1, Number(initialChildren) || packages.find((p) => p.slug === initialSlug)?.childrenIncluded || 1));
  const startSlug = packages.some((p) => p.slug === initialSlug) ? initialSlug : bestPackageFor(packages, startCount)?.pkg.slug || '';

  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const signup = useHomeLearningSignup();
  const {
    control, register, handleSubmit, trigger, watch, setValue, setError, clearErrors, getValues, formState: { errors },
  } = useForm({
    resolver: zodResolver(homeSchoolingSignupSchema),
    mode: 'onTouched',
    defaultValues: {
      packageSlug: startSlug,
      parent: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
      children: Array.from({ length: startCount }, () => ({ ...EMPTY_CHILD })),
      home: { county: '', subCounty: '', town: '', addressLine: '', landmark: '', mapUrl: '' },
      consent: false,
      ...HONEYPOT_DEFAULT,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'children' });

  const slug = watch('packageSlug');
  const pkg = packages.find((p) => p.slug === slug);
  const count = fields.length;
  const price = priceForPackage(pkg, count);
  const better = !price ? bestPackageFor(packages, count) : null;

  if (result) return <Confirmation result={result} />;

  // Validate just the current step before moving on.
  const next = async () => {
    let ok = true;
    if (step === 0) ok = Boolean(pkg && price);
    if (step === 1) {
      ok = await trigger('parent');
      const { password, confirmPassword } = getValues('parent');
      if (ok && password !== confirmPassword) {
        setError('parent.confirmPassword', { message: 'Passwords don’t match' });
        ok = false;
      }
    }
    if (step === 2) {
      ok = await trigger('children');
      const names = getValues('children').map((c) => c.username.trim().toLowerCase());
      names.forEach((name, i) => {
        if (name && names.indexOf(name) !== i) {
          setError(`children.${i}.username`, { message: 'Each child needs a different username' });
          ok = false;
        }
      });
    }
    if (step === 3) ok = await trigger('home');
    if (ok) {
      setStep((s) => s + 1);
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (values) => {
    if (isBot(values)) {
      setResult({ packageName: pkg?.name, amountDue: 0, invoiceNumber: '—', parentEmail: values.parent.email, children: [] });
      return;
    }
    const parent = { ...values.parent };
    delete parent.confirmPassword; // only checked here, never sent
    try {
      const data = await signup.mutateAsync({
        packageSlug: values.packageSlug,
        parent,
        children: values.children,
        home: values.home,
        consent: values.consent,
        hp_field: values.hp_field,
      });
      setResult(data);
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
    } catch {
      // Shown below from signup.error.
    }
  };

  const setCount = (n) => {
    const target = Math.min(maxChildren, Math.max(1, n));
    if (target > count) for (let i = count; i < target; i += 1) append({ ...EMPTY_CHILD }, { shouldFocus: false });
    if (target < count) remove(Array.from({ length: count - target }, (_, i) => count - 1 - i));
  };

  const values = watch();
  const emailTaken = signup.error?.status === 409 && /email/i.test(signup.error?.message || '');

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ position: 'relative' }}>
      <Honeypot register={register} />
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {step === 0 && (
        <Box sx={sectionSx}>
          <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>Choose your package</Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>How many children will be learning, and which monthly package suits your family?</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, mb: 2.5, borderRadius: 3, bgcolor: 'surface.subtle', maxWidth: 360 }}>
            <IconButton aria-label="Fewer children" onClick={() => setCount(count - 1)} disabled={count <= 1} sx={{ bgcolor: 'background.paper' }}><RemoveRoundedIcon /></IconButton>
            <Box sx={{ flexGrow: 1, textAlign: 'center' }} aria-live="polite">
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{count}</Typography>
              <Typography variant="body2" color="text.secondary">{count === 1 ? 'child' : 'children'}</Typography>
            </Box>
            <IconButton aria-label="More children" onClick={() => setCount(count + 1)} disabled={count >= maxChildren} sx={{ bgcolor: 'background.paper' }}><AddRoundedIcon /></IconButton>
          </Box>

          <Box role="radiogroup" aria-label="Package" sx={{ display: 'grid', gap: 1.5 }}>
            {packages.map((p) => {
              const selected = p.slug === slug;
              const fits = priceForPackage(p, count);
              return (
                <Box
                  key={p.slug}
                  component="button"
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setValue('packageSlug', p.slug, { shouldValidate: true })}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2, p: 2, textAlign: 'left', font: 'inherit', cursor: 'pointer',
                    borderRadius: 3, border: '2px solid', borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? 'surface.subtle' : 'background.paper', color: 'text.primary', opacity: fits ? 1 : 0.6,
                  }}
                >
                  <ChildIcons count={p.childrenIncluded} size={20} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }}>{p.name}{p.badge ? ` · ${p.badge}` : ''}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {childrenLabel(p.childrenIncluded)} included{p.allowExtraChildren && p.extraChildAmount != null ? ` · +${formatKsh(p.extraChildAmount)} per extra child` : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 800 }}>{fits ? formatKsh(fits.monthlyAmount) : '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{fits ? 'per month' : `not for ${count}`}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {pkg && !price && (
            <Alert severity="warning" sx={{ mt: 2 }} action={better && <Button color="inherit" size="small" onClick={() => setValue('packageSlug', better.pkg.slug)}>Switch to {better.pkg.name}</Button>}>
              {pkg.name} doesn’t cover {childrenLabel(count)}.{better ? ` ${better.pkg.name} does, for ${formatKsh(better.price.monthlyAmount)} a month.` : ''}
            </Alert>
          )}
          {pkg && price && (
            <Alert severity="info" icon={false} sx={{ mt: 2 }}>
              <strong>{formatKsh(price.monthlyAmount)} a month</strong> for {childrenLabel(count)}
              {price.childCount > count ? ` — includes ${childrenLabel(price.childCount)}, so there’s room for more at no extra cost` : ''}.
            </Alert>
          )}
        </Box>
      )}

      {step === 1 && (
        <Box sx={sectionSx}>
          <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>About you</Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>You’ll use your email and password to sign in and see your children’s progress and invoices.</Typography>
          <Box sx={gridSx}>
            <TextField label="Your full name" autoComplete="name" {...register('parent.name')} error={Boolean(errors.parent?.name)} helperText={errors.parent?.name?.message} fullWidth />
            <TextField label="Phone number" type="tel" autoComplete="tel" {...register('parent.phone')} error={Boolean(errors.parent?.phone)} helperText={errors.parent?.phone?.message || 'We’ll call you about payment'} fullWidth />
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <TextField label="Email address" type="email" autoComplete="email" {...register('parent.email')} error={Boolean(errors.parent?.email)} helperText={errors.parent?.email?.message || 'This is your login'} fullWidth />
            </Box>
            <PasswordField label="Create a password" {...register('parent.password')} error={errors.parent?.password} helperText="At least 8 characters" />
            <PasswordField label="Confirm password" {...register('parent.confirmPassword')} error={errors.parent?.confirmPassword} />
          </Box>
        </Box>
      )}

      {step === 2 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {fields.map((field, index) => {
            const e = errors.children?.[index] || {};
            const child = values.children?.[index] || {};
            return (
              <Box key={field.id} sx={sectionSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" component="h2">{child.firstName ? `${child.firstName}` : `Child ${index + 1}`}</Typography>
                  {fields.length > 1 && <Button size="small" color="inherit" onClick={() => remove(index)}>Remove</Button>}
                </Box>
                <Box sx={gridSx}>
                  <TextField label="First name" {...register(`children.${index}.firstName`)} error={Boolean(e.firstName)} helperText={e.firstName?.message} fullWidth />
                  <TextField label="Last name" {...register(`children.${index}.lastName`)} error={Boolean(e.lastName)} helperText={e.lastName?.message} fullWidth />
                  <Controller
                    control={control}
                    name={`children.${index}.gender`}
                    render={({ field: f }) => (
                      <TextField select label="Gender" {...f} error={Boolean(e.gender)} helperText={e.gender?.message} fullWidth>
                        <MenuItem value="female">Girl</MenuItem>
                        <MenuItem value="male">Boy</MenuItem>
                        <MenuItem value="other">Prefer not to say</MenuItem>
                      </TextField>
                    )}
                  />
                  <TextField label="Date of birth" type="date" {...register(`children.${index}.dateOfBirth`)} error={Boolean(e.dateOfBirth)} helperText={e.dateOfBirth?.message} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                  <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                    <TextField label="Current school and grade (optional)" placeholder="e.g. Grade 4 at Hilltop School" {...register(`children.${index}.currentGrade`)} error={Boolean(e.currentGrade)} helperText={e.currentGrade?.message || 'Helps us place them at the right level'} fullWidth />
                  </Box>
                  <TextField
                    label="Username"
                    {...register(`children.${index}.username`)}
                    error={Boolean(e.username)}
                    helperText={e.username?.message || 'Their own login'}
                    fullWidth
                    slotProps={{
                      htmlInput: { autoComplete: 'off', autoCapitalize: 'none' },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="Suggest a username"
                              title="Suggest a username"
                              size="small"
                              edge="end"
                              onClick={() => { setValue(`children.${index}.username`, suggestUsername(child.firstName, child.lastName), { shouldValidate: true }); clearErrors(`children.${index}.username`); }}
                            >
                              <AutoFixHighRoundedIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <PasswordField label="Their password" {...register(`children.${index}.password`)} error={e.password} helperText="At least 8 characters" />
                </Box>
              </Box>
            );
          })}
          {fields.length < maxChildren && (
            <Button startIcon={<AddRoundedIcon />} onClick={() => append({ ...EMPTY_CHILD })} sx={{ justifySelf: 'start' }}>Add another child</Button>
          )}
          {!price && pkg && (
            <Alert severity="warning">{pkg.name} doesn’t cover {childrenLabel(count)} — go back to Package to choose a larger one.</Alert>
          )}
        </Box>
      )}

      {step === 3 && (
        <Box sx={sectionSx}>
          <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>Your home</Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>Where your children will learn — this is where the educator visits.</Typography>
          <Box sx={gridSx}>
            <TextField label="County" {...register('home.county')} error={Boolean(errors.home?.county)} helperText={errors.home?.county?.message} fullWidth />
            <TextField label="Sub-county (optional)" {...register('home.subCounty')} fullWidth />
            <TextField label="Town / area" {...register('home.town')} error={Boolean(errors.home?.town)} helperText={errors.home?.town?.message} fullWidth />
            <TextField label="Home address" placeholder="Estate, road, house number" {...register('home.addressLine')} error={Boolean(errors.home?.addressLine)} helperText={errors.home?.addressLine?.message} fullWidth />
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <TextField label="Landmark or directions (optional)" placeholder="e.g. Blue gate opposite the church" {...register('home.landmark')} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <TextField
                label="Google Maps link (optional)"
                placeholder="https://maps.app.goo.gl/…"
                {...register('home.mapUrl')}
                error={Boolean(errors.home?.mapUrl)}
                helperText={errors.home?.mapUrl?.message || 'In Google Maps, find your home, tap Share and copy the link.'}
                fullWidth
              />
            </Box>
          </Box>
        </Box>
      )}

      {step === 4 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box sx={sectionSx}>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Check your details</Typography>
            {[
              { title: 'Package', to: 0, lines: [`${pkg?.name || ''} for ${childrenLabel(count)}`, price ? `${formatKsh(price.monthlyAmount)} a month` : ''] },
              { title: 'Parent', to: 1, lines: [values.parent.name, values.parent.email, values.parent.phone] },
              { title: 'Children', to: 2, lines: values.children.map((c) => `${c.firstName} ${c.lastName} — username ${c.username}`) },
              { title: 'Home', to: 3, lines: [[values.home.addressLine, values.home.town, values.home.subCounty, values.home.county].filter(Boolean).join(', '), values.home.landmark] },
            ].map((section) => (
              <Box key={section.title} sx={{ display: 'flex', gap: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="overline" color="text.secondary">{section.title}</Typography>
                  {section.lines.filter(Boolean).map((line) => <Typography key={line} variant="body2">{line}</Typography>)}
                </Box>
                <Button size="small" onClick={() => setStep(section.to)}>Edit</Button>
              </Box>
            ))}
          </Box>

          <Box sx={{ ...sectionSx, bgcolor: 'surface.subtle' }}>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>How payment works</Typography>
            <Typography variant="body2" color="text.secondary">
              Submitting creates your family’s accounts and your first month’s invoice of <strong>{price ? formatKsh(price.monthlyAmount) : '—'}</strong>.
              Pay in cash to our team; once we confirm it, your logins unlock. Until then, signing in shows “payment pending”.
            </Typography>
          </Box>

          <Controller
            control={control}
            name="consent"
            render={({ field: f }) => (
              <FormControlLabel
                control={<Checkbox checked={Boolean(f.value)} onChange={(ev) => f.onChange(ev.target.checked)} />}
                label="I agree to Digifunzi storing my family’s details to provide Home Schooling and contact me about it."
              />
            )}
          />
          {errors.consent && <Typography variant="body2" color="error">{errors.consent.message}</Typography>}

          {signup.isError && (
            <Alert severity="error">
              {signup.error?.message || 'We couldn’t complete your sign-up. Please try again.'}
              {emailTaken && <> <a href={`${APP_URL}/login`}>Sign in</a> or <RouterLink to={homeSchoolingEnquiryPath(slug)}>ask us to add a child</RouterLink>.</>}
            </Alert>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3 }}>
        {step > 0 ? <Button startIcon={<ArrowBackRoundedIcon />} onClick={back}>Back</Button> : <span />}
        {step < STEPS.length - 1
          ? <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={next} disabled={step === 0 && !(pkg && price)}>Continue</Button>
          : <Button type="submit" variant="contained" color="secondary" size="large" disabled={signup.isPending || !price}>{signup.isPending ? 'Creating your accounts…' : 'Create our accounts'}</Button>}
      </Box>
    </Box>
  );
}
