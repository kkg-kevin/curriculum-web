import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import PrintIcon from '@mui/icons-material/Print';
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
 * "Download PDF" is the browser's own print-to-PDF (window.print()) rather than a bundled PDF
 * library — zero extra JS, correct pagination, and the report's plain inline styles already
 * render the same in a print window. `@media print` rules (in index.css) hide the site chrome
 * and the action bar so only the report card prints.
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
            <Box
              className="no-print"
              sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}
            >
              <Button
                variant="outlined"
                size="large"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
              >
                Download PDF
              </Button>
              {slug && (
                <Button
                  component={RouterLink}
                  to={`/enroll?interestedIn=project&referenceId=${encodeURIComponent(slug)}`}
                  variant="contained"
                  size="large"
                >
                  Enroll in this pathway
                </Button>
              )}
            </Box>

            <Box className="printable-report">
              <DiagnosticReport report={data} items={data.items} answers={data.answers} />
            </Box>
          </Box>
        )}
      </Section>
    </>
  );
}
