import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import SeoHead from '../components/seo/SeoHead.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import { useBootcampDiagnosticReport } from '../hooks/useBootcampDiagnostic.js';
import DiagnosticReport from '../components/diagnostic/DiagnosticReport.jsx';
import BootcampNextStepsPanel from '../components/diagnostic/BootcampNextStepsPanel.jsx';
import { whatsAppUrl } from '../config/site.js';

/**
 * /bootcamps/:slug/diagnostic/report/:attemptId — the permanent, shareable graded report.
 * The Bootcamp counterpart to DiagnosticReportPage.jsx (Pathways) — same posture (the attemptId
 * uuid in the URL is the only access control), see that file's own comments.
 */
export default function BootcampDiagnosticReportPage() {
  const { slug, attemptId } = useParams();
  const { data, isLoading, isError, error, refetch } = useBootcampDiagnosticReport(attemptId);

  const bootcampName = data?.bootcampName || 'Bootcamp';
  const mentorWhatsApp = whatsAppUrl(
    `Hi Digifunzi — my child ${data?.childName ? `(${data.childName}) ` : ''}just did the ${bootcampName} diagnostic and I'd like to talk through next steps.`,
  );
  const mentorHref = mentorWhatsApp || '/contact?subject=Diagnostic%20follow-up';
  const mentorIsExternal = Boolean(mentorWhatsApp);

  return (
    <>
      <SeoHead title={`${bootcampName} Diagnostic Report`} noindex />

      <Container maxWidth="md" sx={{ pt: 3 }} className="no-print">
        <Breadcrumbs>
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/bootcamps" underline="hover" color="inherit">
            Bootcamps
          </Link>
          {slug && (
            <Link component={RouterLink} to={`/bootcamps/${slug}`} underline="hover" color="inherit">
              {bootcampName}
            </Link>
          )}
          <Typography color="text.primary">Diagnostic report</Typography>
        </Breadcrumbs>
      </Container>

      <Section maxWidth="md" sx={{ pt: 2 }}>
        {isLoading && <LoadingBlock label="Loading the report…" />}

        {isError && (
          <ErrorBlock
            error={{
              message:
                error?.status === 404
                  ? 'This report link is not valid, or the report has been removed.'
                  : error?.message,
            }}
            onRetry={error?.status === 404 ? undefined : refetch}
          />
        )}

        {data && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box className="printable-report">
              <DiagnosticReport report={data} />
            </Box>

            {slug && (
              <Box className="no-print" sx={{ maxWidth: 640, mx: 'auto', width: '100%' }}>
                <BootcampNextStepsPanel
                  bootcampSlug={slug}
                  bootcampName={bootcampName}
                  mentorHref={mentorHref}
                  mentorIsExternal={mentorIsExternal}
                  defaultLearnerName={data?.childName}
                  defaultLearnerAge={data?.childAge}
                />
              </Box>
            )}
          </Box>
        )}
      </Section>
    </>
  );
}
