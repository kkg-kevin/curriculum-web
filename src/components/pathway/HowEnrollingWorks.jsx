import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * "How enrolling works" on a pathway's (or stage's) page — the same steps the enrolment itself
 * takes (PathwayEnrolJourney, then PathwayEnrollForm or the enquiry form):
 * - date of birth, and the stage's short diagnostic when one is offered (it can be skipped);
 * - sold online (`paid` — it has subscription plans): choose a plan and a hub, then details and payment;
 * - not sold online: send your details, then the team gets in touch.
 */
export default function HowEnrollingWorks({ paid, diagnostic, places = [] }) {
  const steps = [
    {
      title: 'Their date of birth',
      body: diagnostic
        ? 'Then a short quiz (you can skip it), so they start at the course that fits.'
        : 'It tells us the stage and course they start at.',
    },
    ...(paid
      ? [
          {
            title: 'Choose a plan and a hub',
            body: places.length ? `Pay by the month, term or year — and where they’re based: ${places.join(', ')}.` : 'Pay by the month, term or year — and where they’re based.',
          },
          { title: 'Your details, then pay', body: 'Pay by M-Pesa or the other ways the hub accepts. The courses open once it’s paid, and it renews automatically.' },
        ]
      : [
          { title: 'Send your details', body: 'Your name and phone number, and your child’s details.' },
          { title: 'We get in touch', body: 'Our team agrees the hub with you and gets them started.' },
        ]),
  ];

  return (
    <Box component="section" aria-labelledby="how-enrolling">
      <Typography id="how-enrolling" variant="h3" component="h2" sx={{ mb: 2.5 }}>
        How enrolling works
      </Typography>
      <Box
        component="ol"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        {steps.map((step, i) => (
          <Box
            component="li"
            key={step.title}
            sx={{ p: 2.25, borderRadius: 3, bgcolor: 'surface.subtle', border: '1px solid', borderColor: 'divider' }}
          >
            <Box
              aria-hidden
              sx={{
                width: 30,
                height: 30,
                mb: 1.25,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 14,
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
              }}
            >
              {i + 1}
            </Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{step.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
              {step.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
