import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import SeoHead from '../components/seo/SeoHead.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import { useDiagnosticReport } from '../hooks/useDiagnostic.js';
import DiagnosticReport from '../components/diagnostic/DiagnosticReport.jsx';

/**
 * /pathways/:slug/diagnostic/report/:attemptId — the permanent, shareable graded report.
 *
 * The link is handed to the visitor on the diagnostic flow's final step and is stable forever
 * (the attempt row is write-once, kept indefinitely). Anyone with the link sees the report —
 * the attemptId uuid in the URL is the only access control, matching the backend's posture.
 *
 * "Download PDF" lives INSIDE the report card (DiagnosticReport's hero) and produces a real
 * .pdf file via html2canvas + jsPDF (see src/utils/reportPdf.js), falling back to the
 * browser's print-to-PDF if generation fails. The `@media print` rules (in styles/global.css)
 * still hide the site chrome for that fallback.
 */
export default function DiagnosticReportPage() {
  const { slug, attemptId } = useParams();
  const { data, isLoading, isError, error, refetch } = useDiagnosticReport(attemptId);

  const pathwayName = data?.pathwayName || 'Pathway';

  return (
    <>
      <SeoHead title={`${pathwayName} Diagnostic Report`} noindex />

      <Container maxWidth="md" sx={{ pt: 3 }} className="no-print">
        <Breadcrumbs>
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/pathways" underline="hover" color="inherit">
            Pathways
          </Link>
          {slug && (
            <Link component={RouterLink} to={`/pathways/${slug}`} underline="hover" color="inherit">
              {pathwayName}
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
              <Box className="no-print" sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  component={RouterLink}
                  to={`/enroll?flow=pathway&referenceId=${encodeURIComponent(slug)}`}
                  variant="contained"
                  size="large"
                >
                  Enroll in this pathway
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Section>
    </>
  );
}
