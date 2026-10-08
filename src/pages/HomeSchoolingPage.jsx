import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';
import Reveal from '../components/common/Reveal.jsx';
import FaqList from '../components/common/FaqList.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import PriceCalculator from '../components/homeSchooling/PriceCalculator.jsx';
import PackageCard from '../components/homeSchooling/PackageCard.jsx';
import { usePublicHomeLearningPackages } from '../hooks/usePublicHomeLearning.js';
import {
  formatKsh, homeSchoolingBenefits, homeSchoolingEnquiryPath, homeSchoolingFaqs, homeSchoolingHero, homeSchoolingSignupPath, homeSchoolingSteps,
  maxChildrenOffered, perChildAmount,
} from '../content/homeSchooling.js';

const BENEFIT_ICONS = { home: HomeRoundedIcon, level: SchoolRoundedIcon, progress: AutoGraphRoundedIcon, billing: ReceiptLongRoundedIcon };

const packagesGridSx = {
  display: 'grid',
  gap: { xs: 4, md: 3 },
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(280px, 1fr))' },
  alignItems: 'stretch',
  pt: 2,
};

function PackageSkeleton() {
  return (
    <Box sx={{ p: 3.5, borderRadius: 5, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card' }}>
      <Skeleton variant="rounded" width={110} height={26} />
      <Skeleton variant="text" width="55%" height={36} sx={{ mt: 1.5 }} />
      <Skeleton variant="text" width="45%" height={56} sx={{ mt: 1 }} />
      <Skeleton variant="text" width="90%" sx={{ mt: 2 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rounded" height={46} sx={{ mt: 3 }} />
    </Box>
  );
}

function Hero({ packages, isLoading }) {
  const lowest = packages.length ? Math.min(...packages.map((p) => p.monthlyAmount)) : null;
  const largestFamily = maxChildrenOffered(packages);
  const facts = [
    lowest != null && `From ${formatKsh(lowest)} a month`,
    largestFamily > 1 && `Families of up to ${largestFamily} children`,
    'Sign up online in minutes',
  ].filter(Boolean);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 6, md: 10 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: (t) => `linear-gradient(135deg, ${t.palette.surface.heroFrom} 0%, ${t.palette.surface.heroVia} 50%, ${t.palette.surface.heroTo} 100%)`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: (t) => `radial-gradient(600px circle at 10% 0%, ${t.palette.surface.heroGlow}, transparent 70%), radial-gradient(700px circle at 95% 100%, ${t.palette.surface.heroGlowWarm}, transparent 70%)`,
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box sx={{ display: 'grid', gap: { xs: 5, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, alignItems: 'center' }}>
          <Box>
            <Reveal as="p" sx={{ m: 0, mb: 2, display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: 999, bgcolor: 'background.paper', boxShadow: 'shadow.sm', border: '1px solid', borderColor: 'surface.ring' }}>
              <HomeRoundedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
              <Box component="span" sx={{ typography: 'overline', lineHeight: 1.8, color: 'primary.main' }}>{homeSchoolingHero.eyebrow}</Box>
            </Reveal>
            <Reveal delay={60}>
              <Typography variant="h1" component="h1" sx={{ mb: 2.5, letterSpacing: '-0.03em' }}>
                {homeSchoolingHero.heading}
              </Typography>
            </Reveal>
            <Reveal delay={120}>
              <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, color: 'text.secondary', maxWidth: 560, mb: 4 }}>
                {homeSchoolingHero.sub}
              </Typography>
            </Reveal>
            <Reveal delay={180} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
              <Button component="a" href="#packages" variant="contained" size="large" endIcon={<ArrowDownwardRoundedIcon />}>
                See packages &amp; prices
              </Button>
              <Button component={RouterLink} to={homeSchoolingEnquiryPath()} variant="outlined" size="large">
                Ask us a question
              </Button>
            </Reveal>
            <Reveal delay={240} as="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexWrap: 'wrap', gap: { xs: 1.25, sm: 3 } }}>
              {isLoading
                ? <Box component="li"><Skeleton variant="text" width={320} /></Box>
                : facts.map((fact) => (
                  <Box component="li" key={fact} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.92rem', fontWeight: 600 }}>
                    <CheckRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} /> {fact}
                  </Box>
                ))}
            </Reveal>
          </Box>
          <Reveal delay={200} y={24}>
            <PriceCalculator packages={packages} isLoading={isLoading} />
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
}

function Benefits() {
  return (
    <Section>
      <SectionHeading
        eyebrow="What your family gets"
        title="Structured learning, in your own home"
        lead="Each child learns at their own level, taught at home by a Digifunzi educator — with progress you can follow."
        align="center"
      />
      <Box sx={{ mt: { xs: 5, md: 7 }, display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        {homeSchoolingBenefits.map((benefit, i) => {
          const Icon = BENEFIT_ICONS[benefit.icon] || HomeRoundedIcon;
          return (
            <Reveal key={benefit.title} delay={i * 80} sx={{ height: '100%' }}>
              <Box sx={{ height: '100%', p: 3, borderRadius: 4, bgcolor: 'surface.card', border: '1px solid', borderColor: 'surface.ring', boxShadow: 'shadow.sm' }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    mb: 2,
                    borderRadius: 3,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    background: (t) => `linear-gradient(150deg, ${t.palette.primary.main}22, ${t.palette.secondary.main}1f)`,
                  }}
                >
                  <Icon />
                </Box>
                <Typography variant="h5" component="h3" sx={{ mb: 1 }}>{benefit.title}</Typography>
                <Typography variant="body2" color="text.secondary">{benefit.body}</Typography>
              </Box>
            </Reveal>
          );
        })}
      </Box>
    </Section>
  );
}

function Packages({ packages, isLoading, isError, error, refetch }) {
  const perChildPrices = packages.map(perChildAmount);
  const highestPerChild = packages.length ? Math.max(...perChildPrices) : 0;
  // Only claim bigger families pay less per child when the published prices actually say so.
  const volumeDiscount = packages.length > 1 && Math.min(...perChildPrices) < highestPerChild;
  const extraPrices = packages.filter((p) => p.allowExtraChildren && p.extraChildAmount != null).map((p) => p.extraChildAmount);
  const lowestExtra = extraPrices.length ? Math.min(...extraPrices) : null;

  return (
    <Section id="packages" tone="subtle" dots sx={{ scrollMarginTop: 72 }}>
      <SectionHeading
        eyebrow="Packages"
        title="Simple monthly packages"
        lead={`One price covers the whole family each month.${volumeDiscount ? ' The more children learning, the less you pay per child.' : ''}`}
        align="center"
      />

      <Box sx={{ mt: { xs: 5, md: 7 } }}>
        {isLoading && (
          <Box sx={packagesGridSx} role="status" aria-label="Loading packages">
            {[0, 1, 2].map((i) => <PackageSkeleton key={i} />)}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {!isLoading && !isError && packages.length === 0 && (
          <EmptyBlock
            title="Packages are being finalised"
            body="We're putting the finishing touches on our Home Schooling packages. Send us an enquiry and we'll talk you through the options for your family."
          />
        )}

        {!isLoading && !isError && packages.length > 0 && (
          <Box sx={packagesGridSx}>
            {packages.map((pkg, i) => (
              <Reveal key={pkg.slug} delay={i * 90} sx={{ height: '100%' }}>
                <PackageCard pkg={pkg} highestPerChild={highestPerChild} />
              </Reveal>
            ))}
          </Box>
        )}
      </Box>

      <Reveal>
        <Box
          sx={{
            mt: { xs: 5, md: 6 },
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            borderRadius: 4,
            bgcolor: 'surface.card',
            border: '1px solid',
            borderColor: 'surface.ring',
            boxShadow: 'shadow.sm',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h3" sx={{ mb: 0.5 }}>
              {lowestExtra != null ? 'Have a bigger family?' : 'Not sure which package fits?'}
            </Typography>
            <Typography color="text.secondary">
              {lowestExtra != null
                ? `Extra children start from ${formatKsh(lowestExtra)} a month each. Use the price calculator above, or ask and our team will confirm your family's total.`
                : 'Tell us about your family and our team will recommend the right package.'}
            </Typography>
          </Box>
          <Button component={RouterLink} to={homeSchoolingEnquiryPath()} variant="outlined" sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
            Ask about family pricing
          </Button>
        </Box>
      </Reveal>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Prices are per month, in Kenyan shillings. Signing up creates your family’s accounts; you pay the first month in cash and we unlock them once it’s confirmed.
      </Typography>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section>
      <SectionHeading eyebrow="How it works" title="From enquiry to first lesson" align="center" />
      <Box
        component="ol"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          mt: { xs: 5, md: 7 },
          display: 'grid',
          gap: { xs: 3, md: 4 },
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          position: 'relative',
        }}
      >
        {/* connecting rule behind the step numbers (desktop) */}
        <Box aria-hidden sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: 24, left: '12.5%', right: '12.5%', borderTop: '2px dashed', borderColor: 'divider' }} />
        {homeSchoolingSteps.map((step, i) => (
          <Reveal as="li" key={step.title} delay={i * 90} sx={{ position: 'relative', textAlign: { md: 'center' } }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                mx: { md: 'auto' },
                mb: 2,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'primary.contrastText',
                bgcolor: i === homeSchoolingSteps.length - 1 ? 'secondary.main' : 'primary.main',
                boxShadow: 'shadow.md',
                position: 'relative',
              }}
            >
              {i + 1}
            </Box>
            <Typography variant="h5" component="h3" sx={{ mb: 1 }}>{step.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: { md: 240 }, mx: { md: 'auto' } }}>{step.body}</Typography>
          </Reveal>
        ))}
      </Box>
    </Section>
  );
}

function Faq({ packages }) {
  const extraPrices = packages.filter((p) => p.allowExtraChildren && p.extraChildAmount != null).map((p) => p.extraChildAmount);
  const faqs = homeSchoolingFaqs(extraPrices.length ? Math.min(...extraPrices) : null);
  return (
    <Section tone="subtle">
      <Box sx={{ display: 'grid', gap: { xs: 4, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '4fr 7fr' }, alignItems: 'start' }}>
        <SectionHeading eyebrow="Questions" title="Good to know" lead="The things parents ask us most. Anything else — just ask." />
        <Box>
          <FaqList faqs={faqs} />
        </Box>
      </Box>
    </Section>
  );
}

export default function HomeSchoolingPage() {
  const { data: packages = [], isLoading, isError, error, refetch } = usePublicHomeLearningPackages();

  return (
    <>
      <SeoHead
        title="Home Schooling Packages for Families in Kenya"
        description="An educator teaches your children at home, each at the right level. Simple monthly family packages — see prices and enquire for free."
      />
      <JsonLd data={organizationSchema()} />

      <Hero packages={packages} isLoading={isLoading} />
      <Benefits />
      <Packages packages={packages} isLoading={isLoading} isError={isError} error={error} refetch={refetch} />
      <HowItWorks />
      <Faq packages={packages} />
      <Box sx={{ pt: { xs: 7, md: 10 } }}>
        <CTABanner
          heading="Ready to bring learning home?"
          body="Sign up in a few minutes — choose a package, add your children and your home. Rather talk first? Ask us anything."
          primary={{ label: 'Sign up now', to: homeSchoolingSignupPath() }}
          secondary={{ label: 'Ask a question', to: homeSchoolingEnquiryPath() }}
        />
      </Box>
    </>
  );
}
