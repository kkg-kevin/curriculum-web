import Box from '@mui/material/Box';
import { GraduationCap, Newspaper, Trophy, Building2 } from 'lucide-react';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { clients } from '../../content/organisation.js';

/**
 * "Some of our clients" — the schools and organisations Digifunzi has worked with. Each card is
 * a white plate with the client's own logo on it and the name underneath; a client with no logo
 * file yet (content/organisation.js) gets an icon for the kind of organisation it is.
 */
const KIND_ICONS = { school: GraduationCap, media: Newspaper, club: Trophy, organisation: Building2 };

// White in both colour modes: the logos are drawn for a white page (dark marks, a JPEG with a
// white ground), and would be lost on the dark theme's cards.
function ClientPlate({ client }) {
  const Icon = KIND_ICONS[client.kind] || Building2;
  return (
    <Box
      sx={{
        height: { xs: 84, md: 104 },
        px: 2,
        py: 1.5,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 2.5,
        backgroundColor: '#fff',
        color: (t) => t.palette.brand.blue[500],
      }}
    >
      {client.logo ? (
        <Box
          component="img"
          src={client.logo}
          alt=""
          loading="lazy"
          sx={{ display: 'block', maxWidth: '100%', maxHeight: { xs: 60, md: 76 }, objectFit: 'contain' }}
        />
      ) : (
        <Icon aria-hidden size={40} strokeWidth={1.5} />
      )}
    </Box>
  );
}

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
                p: 1.25,
                borderRadius: 3,
                backgroundColor: 'surface.card',
                border: '1px solid',
                borderColor: 'surface.ring',
              }}
            >
              <ClientPlate client={c} />
              <Box
                sx={{
                  pt: 1.25,
                  pb: 0.5,
                  px: 0.5,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: { xs: '0.88rem', md: '0.98rem' },
                  lineHeight: 1.3,
                  color: 'text.primary',
                }}
              >
                {c.name}
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Section>
  );
}
