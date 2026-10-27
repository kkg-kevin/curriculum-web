import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import { publicApi } from '../../services/api.js';

const POLL_MS = 3000;
const GIVE_UP_MS = 150 * 1000;

// A Kenyan mobile number as typed (0712 345 678, +254 712…, 712…) — the server checks it properly.
const looksLikePhone = (value) => /^(?:\+?254|0)?[17]\d{8}$/.test(String(value || '').replace(/[\s-]/g, ''));

function formatKsh(amount) {
  return `KSh ${Number(amount || 0).toLocaleString('en-KE')}`;
}

/**
 * "Pay now with M-Pesa" at the end of a sign-up — no login needed. Sends the "enter your M-Pesa
 * PIN" prompt to the parent's phone for the sign-up's first invoice, then follows it until it's
 * paid. Paying it in full switches the family's accounts on straight away.
 *
 * `pay` is what the sign-up answered with: { token, paybill, account } (null when M-Pesa is off —
 * then nothing renders). `amountDue` is the invoice's amount; `defaultPhone` the number the parent
 * gave on the form. `paidMessage` is what to say once the money has arrived. `bare` drops its own
 * card and Paybill line, for use inside PaymentStep's Paybill option (which shows those itself).
 */
export default function MpesaPayNow({ pay, amountDue, defaultPhone = '', paidMessage, bare = false }) {
  // The prompt asks for `amountDue` — all that's owed, or the part of a payment plan due now.
  // M-Pesa takes whole shillings.
  const [phone, setPhone] = useState(defaultPhone || '');
  const [stage, setStage] = useState('form'); // form | sending | waiting | done
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');
  const startedAt = useRef(0);

  // Follow the prompt until it's answered, or stop waiting after a couple of minutes.
  useEffect(() => {
    if (stage !== 'waiting' || !request?.id || !pay?.token) return undefined;
    let stopped = false;
    const timer = setInterval(async () => {
      if (Date.now() - startedAt.current > GIVE_UP_MS) {
        clearInterval(timer);
        if (!stopped) setStage('done');
        return;
      }
      try {
        const latest = await publicApi.getPaymentRequest(pay.token, request.id);
        if (stopped) return;
        setRequest(latest);
        if (latest.status !== 'pending') {
          clearInterval(timer);
          setStage('done');
        }
      } catch {
        // A dropped poll is fine — the next one tries again.
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [stage, request?.id, pay?.token]);

  if (!pay?.token) return null;

  const send = async (event) => {
    event.preventDefault();
    setError('');
    setStage('sending');
    try {
      const sent = await publicApi.payByMpesa(pay.token, { phone, ...(amountDue ? { amount: Math.ceil(Number(amountDue)) } : {}) });
      startedAt.current = Date.now();
      setRequest(sent);
      setStage('waiting');
    } catch (err) {
      setError(err.message || 'The payment prompt couldn’t be sent. Please try again.');
      setStage('form');
    }
  };

  const paid = request?.status === 'successful';
  const failed = stage === 'done' && !paid;

  return (
    <Box
      sx={bare ? { textAlign: 'left', mb: 2 } : {
        textAlign: 'left', p: { xs: 2, sm: 2.5 }, mb: 3, mx: 'auto', maxWidth: 520, borderRadius: 3,
        border: '1px solid', borderColor: paid ? 'success.main' : 'divider', bgcolor: 'background.paper',
      }}
    >
      {paid ? (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <CheckCircleRoundedIcon color="success" />
          <Box>
            <Typography sx={{ fontWeight: 800 }}>Payment received — thank you!</Typography>
            <Typography variant="body2" color="text.secondary">
              {request.receiptNumber ? `M-Pesa ${request.receiptNumber}. ` : ''}
              {paidMessage || 'Your account is active. You can sign in now.'}
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
            <PhoneIphoneRoundedIcon sx={{ color: '#15803D' }} />
            <Typography sx={{ fontWeight: 800 }}>Pay now with M-Pesa</Typography>
          </Box>

          {stage === 'waiting' && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', py: 1 }}>
              <CircularProgress size={22} />
              <Typography variant="body2">
                Check your phone ({request?.phone}) and enter your M-Pesa PIN to pay {formatKsh(request?.amount)}.
              </Typography>
            </Box>
          )}

          {(stage === 'form' || stage === 'sending' || failed) && (
            <Box component="form" onSubmit={send} sx={{ display: 'grid', gap: 1.5 }}>
              {failed && (
                <Alert severity="warning">
                  {request?.status === 'pending'
                    ? 'We didn’t hear back yet. If you paid, your account switches on by itself in a few minutes — otherwise try again.'
                    : request?.message || 'The payment didn’t go through.'}
                </Alert>
              )}
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="M-Pesa phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                inputMode="tel"
                size="small"
                fullWidth
                helperText={`We’ll send a prompt for ${formatKsh(amountDue)} to this phone.`}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={stage === 'sending' || !looksLikePhone(phone)}
                sx={{ bgcolor: '#15803D', '&:hover': { bgcolor: '#166534' } }}
              >
                {stage === 'sending' ? 'Sending…' : failed ? 'Try again' : `Pay ${formatKsh(amountDue)}`}
              </Button>
            </Box>
          )}

          {!bare && pay.paybill && pay.account && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Or from the M-Pesa menu: Lipa na M-Pesa → Pay Bill, business number <strong>{pay.paybill}</strong>, account number <strong>{pay.account}</strong>.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
