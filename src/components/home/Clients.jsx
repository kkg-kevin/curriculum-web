import Box from '@mui/material/Box';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { clients } from '../../content/organisation.js';

/**
 * "Some of our clients" — the schools and organisations Digifunzi has worked with. Each shows
 * its logo when the entry has one (content/organisation.js) and its name otherwise.
 */
export default function Clients({ tone = 'default' }) {
  if (clients.length === 0) return null;
  return (
    <Section tone={tone} py={{ xs: 7, md: 10 }}>
      <SectionHeading
        eyebrow="Trusted by"
        title="Some of our clients"
        lead="Schools and organisations we have worked with."
        align="center"
        sx={{ mb: { xs: 4, md: 6 } }}
      />

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gap: { xs: 1.5, md: 2.5 },
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        {clients.map((c, i) => (
          <Reveal key={c.name} as="li" delay={(i % 4) * 70}>
            <Box
              sx={{
                height: '100%',
                minHeight: { xs: 72, md: 92 },
                px: 2,
                py: 1.5,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: 'surface.card',
                border: '1px solid',
                borderColor: 'surface.ring',
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.3,
                color: 'text.primary',
              }}
            >
              {c.logo ? (
                <Box
                  component="img"
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  sx={{ display: 'block', maxWidth: '100%', maxHeight: 56, objectFit: 'contain' }}
                />
              ) : (
                c.name
              )}
            </Box>
          </Reveal>
        ))}
      </Box>
    </Section>
  );
}
