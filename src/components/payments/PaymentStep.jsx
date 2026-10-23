import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SendToMobileRoundedIcon from '@mui/icons-material/SendToMobileRounded';
import MpesaPayNow from './MpesaPayNow.jsx';
import { publicApi } from '../../services/api.js';

const ICONS = {
  paybill: PhoneIphoneRoundedIcon,
  send_money: SendToMobileRoundedIcon,
  bank_transfer: AccountBalanceRoundedIcon,
  cheque: ReceiptLongRoundedIcon,
  cash: PaymentsRoundedIcon,
};

const SHORT = {
  paybill: 'Pay to our Paybill',
  send_money: 'Send to our phone number',
  bank_transfer: 'Transfer to our bank account',
  cheque: 'Write us a cheque',
  cash: 'Pay at your hub',
};

// What the family types in to tell us they've paid, per method.
const REFERENCE = {
  paybill: { label: 'M-Pesa code', placeholder: 'e.g. SJK3XYZ12A', help: 'From the M-Pesa confirmation message — 10 letters and numbers.' },
  send_money: { label: 'M-Pesa code', placeholder: 'e.g. SJK3XYZ12A', help: 'From the M-Pesa confirmation message — 10 letters and numbers.' },
  bank_transfer: { label: 'Transfer reference', placeholder: 'e.g. FT26296ABC12', help: 'The reference your bank gave the transfer.' },
  cheque: { label: 'Cheque number', placeholder: 'e.g. 000123', help: '' },
};

const MPESA = ['paybill', 'send_money'];
const looksLikeMpesaCode = (value) => /^[A-Z0-9]{10}$/.test(String(value || '').replace(/\s+/g, '').toUpperCase());

function formatKsh(amount) {
  return `KSh ${Number(amount || 0).toLocaleString('en-KE')}`;
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75, borderTop: '1px dashed', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', wordBreak: 'break-word' }}>{value}</Typography>
    </Box>
  );
}

// How to pay with the chosen method.
function Instructions({ method, amountDue }) {
  if (method.key === 'paybill') {
    return (
      <>
        <Typography variant="body2" sx={{ mb: 1 }}>On your phone: <strong>M-Pesa → Lipa na M-Pesa → Pay Bill</strong>.</Typography>
        <Detail label="Business number" value={method.paybill} />
        <Detail label="Account number" value={method.account} />
        <Detail label="Amount" value={formatKsh(amountDue)} />
        <Detail label="Paid to" value={method.accountName} />
      </>
    );
  }
  if (method.key === 'send_money') {
    return (
      <>
        <Typography variant="body2" sx={{ mb: 1 }}>On your phone: <strong>M-Pesa → Send Money</strong>.</Typography>
        <Detail label="Phone number" value={method.phone} />
        <Detail label="Name shown" value={method.name} />
        <Detail label="Amount" value={formatKsh(amountDue)} />
      </>
    );
  }
  if (method.key === 'bank_transfer') {
    return (
      <>
        <Detail label="Bank" value={method.bankName} />
        <Detail label="Branch" value={method.branch} />
        <Detail label="Account name" value={method.accountName} />
        <Detail label="Account number" value={method.accountNumber} />
        <Detail label="Reference" value={method.reference} />
        <Detail label="Amount" value={formatKsh(amountDue)} />
        {method.instructions && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{method.instructions}</Typography>}
      </>
    );
  }
  if (method.key === 'cheque') {
    return (
      <>
        <Detail label="Payable to" value={method.payableTo} />
        <Detail label="Amount" value={formatKsh(amountDue)} />
        <Detail label="Write on the back" value={method.reference} />
        {method.instructions && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{method.instructions}</Typography>}
      </>
    );
  }
  return (
    <>
      <Typography variant="body2">{method.instructions || 'Pay in cash to our team and ask for a receipt.'}</Typography>
      <Detail label="Amount" value={formatKsh(amountDue)} />
    </>
  );
}

// "I've paid" — the code / reference, the amount and (for M-Pesa) the phone it came from.
function NoticeForm({ method, token, amountDue, defaultPhone, onSent }) {
  const ref = REFERENCE[method.key];
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState(String(amountDue || ''));
  const [phone, setPhone] = useState(defaultPhone || '');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const isMpesa = MPESA.includes(method.key);
  const isCash = method.key === 'cash';
  const valid = isCash || (isMpesa ? looksLikeMpesaCode(reference) : reference.trim().length >= 3);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      const notice = await publicApi.submitPaymentNotice(token, {
        method: method.key,
        reference: isCash ? null : reference,
        amount: Number(amount) || null,
        phone: isMpesa ? phone : null,
      });
      onSent(notice);
      setReference('');
    } catch (err) {
      setError(err.message || 'We couldn’t send that. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {!isCash && (
        <>
          <Typography sx={{ fontWeight: 800 }}>Paid? Tell us here</Typography>
          <TextField
            label={ref.label}
            value={reference}
            onChange={(e) => setReference(isMpesa ? e.target.value.toUpperCase() : e.target.value)}
            placeholder={ref.placeholder}
            helperText={ref.help}
            size="small"
            fullWidth
            required
            slotProps={{ htmlInput: { maxLength: isMpesa ? 12 : 60, autoCapitalize: 'characters' } }}
          />
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: isMpesa ? '1fr 1fr' : '1fr' } }}>
            <TextField
              label="Amount paid (KSh)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: amountDue, step: 'any' } }}
            />
            {isMpesa && (
              <TextField label="Phone you paid from" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" inputMode="tel" size="small" fullWidth />
            )}
          </Box>
        </>
      )}
      <Button type="submit" variant="contained" disabled={sending || !valid} sx={{ justifySelf: { sm: 'start' } }}>
        {sending ? 'Sending…' : isCash ? 'I’ll pay in cash' : 'I’ve paid — confirm my payment'}
      </Button>
    </Box>
  );
}

function SentNotices({ notices }) {
  if (!notices.length) return null;
  return (
    <Box sx={{ display: 'grid', gap: 1, mb: 2.5 }}>
      {notices.map((notice) => (
        <Alert key={notice.id} severity={notice.method === 'cash' ? 'info' : 'success'} icon={notice.method === 'cash' ? <HourglassTopRoundedIcon /> : <CheckCircleRoundedIcon />}>
          {notice.method === 'cash'
            ? <>Got it — we’ll expect <strong>{formatKsh(notice.amount)}</strong> in cash. Your accounts switch on as soon as our team receives it.</>
            : <>Thanks! We’ve got your {notice.methodLabel} of <strong>{formatKsh(notice.amount)}</strong>{notice.reference ? <> ({notice.reference})</> : null}. We’ll check it and switch your accounts on — usually within one working day.</>}
        </Alert>
      ))}
    </Box>
  );
}

/**
 * The Payment step at the end of a Home Learning, Tech Club or Bootcamp sign-up. The sign-up has
 * already created the accounts and the invoice; this shows every way the family can pay it
 * (Settings → Payments on the portal decides which), and the family tells us once they've paid
 * — an M-Pesa code, a bank reference, a cheque number, or that cash is coming. Our team confirms
 * it and the accounts switch on. When M-Pesa's phone prompt is set up on the server (`prompt` on
 * the Paybill), paying that way switches them on straight away.
 *
 * `pay` is what the sign-up answered with: { token, methods, paybill?, account? } (null — e.g. for
 * a bot — shows a short fallback). `amountDue` / `invoiceNumber` are the invoice's.
 * `initialNotices` are "I've paid" notices already sent (the /pay/:token page shows them again).
 * `laterNote` replaces the "not paying right now?" line (a guest Store order has no login).
 */
export default function PaymentStep({ pay, amountDue, invoiceNumber, defaultPhone = '', paidMessage, initialNotices = [], laterNote }) {
  const methods = pay?.methods || [];
  const [selected, setSelected] = useState(methods[0]?.key || null);
  const [notices, setNotices] = useState(initialNotices);
  const method = methods.find((m) => m.key === selected);

  return (
    <Box sx={{ textAlign: 'left', maxWidth: 560, mx: 'auto', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2.5, mb: 2.5, borderRadius: 3, bgcolor: 'surface.subtle', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="overline" color="text.secondary">Amount due</Typography>
          <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.1, color: 'primary.main' }}>{formatKsh(amountDue)}</Typography>
        </Box>
        {invoiceNumber && <Typography variant="body2" color="text.secondary">Invoice <strong>{invoiceNumber}</strong></Typography>}
      </Box>

      <SentNotices notices={notices} />

      {!pay?.token || methods.length === 0 ? (
        <Alert severity="info">Our team will contact you on the phone number you gave us about paying. You’ll also find your invoice when you sign in.</Alert>
      ) : (
        <>
          <Typography variant="h5" component="h3" sx={{ mb: 1.5 }}>How would you like to pay?</Typography>
          <Box role="radiogroup" aria-label="Payment method" sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: methods.length > 2 ? '1fr 1fr' : '1fr' }, mb: 2 }}>
            {methods.map((m) => {
              const Icon = ICONS[m.key] || PaymentsRoundedIcon;
              const active = m.key === selected;
              return (
                <Box
                  key={m.key}
                  component="button"
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(m.key)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit',
                    borderRadius: 2.5, border: '2px solid', borderColor: active ? 'primary.main' : 'divider', bgcolor: active ? 'surface.subtle' : 'background.paper',
                    transition: 'border-color .15s', '&:hover': { borderColor: active ? 'primary.main' : 'text.disabled' },
                  }}
                >
                  <Icon sx={{ color: m.key === 'paybill' || m.key === 'send_money' ? '#15803D' : 'primary.main' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>{m.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{SHORT[m.key]}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {method && (
            <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              {method.key === 'paybill' && method.prompt && (
                <MpesaPayNow bare pay={pay} amountDue={amountDue} defaultPhone={defaultPhone} paidMessage={paidMessage} />
              )}
              {method.key === 'paybill' && !method.prompt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip size="small" label="Coming soon" />
                  <Typography variant="body2" color="text.secondary">Pay with a prompt straight to your phone.</Typography>
                </Box>
              )}
              <Instructions method={method} amountDue={amountDue} />
              {method.key === 'paybill' && method.automatic ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Payments with this account number are matched to your invoice by themselves — your accounts switch on within minutes.</Typography>
              ) : (
                <NoticeForm key={method.key} method={method} token={pay.token} amountDue={amountDue} defaultPhone={defaultPhone} onSent={(n) => setNotices((list) => [n, ...list.filter((x) => x.id !== n.id)])} />
              )}
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {laterNote || 'Not paying right now? That’s fine — your invoice is saved, and you’ll see it and how to pay when you sign in. Our team will also be in touch.'}
          </Typography>
        </>
      )}
    </Box>
  );
}
