import { Link as RouterLink, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import PaymentStep from '../components/payments/PaymentStep.jsx';
import { publicApi } from '../services/api.js';

/**
 * /pay/:token — paying an order (or sign-up) later, from the link in its email. The token opens
 * that one invoice: what's due, the ways to pay it, and the "I've paid" notices already sent
 * (server: payments/payment-links.js). No sign-in needed.
 */
export default function PayPage() {
  const { token } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['payment-link', token],
    queryFn: () => publicApi.getPayment(token),
    enabled: Boolean(token),
    retry: false,
  });

  return (
    <>
      <SeoHead title="Pay for your order" noindex />
      <PageHeader title="Pay for your order" lead="Choose how to pay and tell us once you have — we'll confirm it and get things moving." />
      <Section py={{ xs: 5, md: 8 }}>
        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
          {isLoading && <LoadingBlock label="Loading…" />}
          {isError && <ErrorBlock error={error} onRetry={error?.status >= 500 ? refetch : undefined} />}
          {data && data.paid && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 52, color: 'success.main', mb: 1 }} />
              <Typography variant="h3" component="h2" sx={{ mb: 1 }}>All paid — thank you!</Typography>
              <Typography color="text.secondary">Invoice {data.invoiceNumber} is settled. There&apos;s nothing more to pay.</Typography>
            </Box>
          )}
          {data && !data.paid && (
            <PaymentStep
              pay={{ token, methods: data.methods || [], plans: data.plans || [], ...(data.mpesa?.enabled ? { paybill: data.mpesa.paybill, account: data.mpesa.account } : {}) }}
              amountDue={data.amountDue}
              chosenPlan={data.chosenPlan}
              next={data.next}
              invoiceNumber={data.invoiceNumber}
              initialNotices={data.notices || []}
              paidMessage="Paid — thank you! We'll take it from here."
              laterNote="You can come back to this page from the link in your email whenever you're ready."
            />
          )}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button component={RouterLink} to="/store" variant="text">Back to the store</Button>
          </Box>
        </Box>
      </Section>
    </>
  );
}
