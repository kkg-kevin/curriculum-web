import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { publicApi } from '../../services/api.js';
import { referralCodeFromLink } from '../../utils/visitSource.js';

const clean = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * The code of whoever referred the family (an affiliate — modules/affiliates/ in the system).
 * Filled in from the link they followed (?ref=, utils/visitSource.js); otherwise a small "Have a
 * referral code?" that opens the field. Checked as they type (only "recognised" or not — never
 * whose code it is). Optional: a wrong code never stops a sign-up.
 *
 * Use with useReferralCode(): const [referralCode, setReferralCode] = useReferralCode();
 * then send `referralCode: referralCode || undefined` with the sign-up.
 */
export function useReferralCode() {
  return useState(() => referralCodeFromLink() || '');
}

export default function ReferralCodeField({ value, onChange, sx }) {
  const [fromLink] = useState(() => referralCodeFromLink());
  const [open, setOpen] = useState(Boolean(value));
  const code = clean(value);
  const [debounced, setDebounced] = useState(code);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(code), 400);
    return () => window.clearTimeout(t);
  }, [code]);
  const check = useQuery({
    queryKey: ['referral-code', debounced],
    queryFn: () => publicApi.checkReferralCode(debounced),
    enabled: debounced.length >= 4 && debounced.length <= 20,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!open) {
    return (
      <Box sx={sx}>
        <Button size="small" onClick={() => setOpen(true)} sx={{ px: 0.5, minWidth: 0 }}>Have a referral code?</Button>
      </Box>
    );
  }
  const settled = code.length >= 4 && debounced === code && check.data;
  const helper = !code
    ? 'Optional — from a friend or a partner who told you about us'
    : code.length < 4 ? 'Codes are at least 4 letters and numbers'
      : settled && check.data.valid ? (fromLink && code === fromLink ? 'From the link you followed — thank you!' : 'Code recognised — thank you!')
        : settled && !check.data.valid ? 'We don’t recognise this code — check it, or leave it empty'
          : ' ';
  return (
    <TextField
      label="Referral code (optional)"
      value={value}
      onChange={(e) => onChange(clean(e.target.value).slice(0, 20))}
      helperText={helper}
      color={settled && check.data.valid ? 'success' : undefined}
      focused={settled && check.data.valid ? true : undefined}
      inputProps={{ autoCapitalize: 'characters', autoComplete: 'off', spellCheck: 'false', style: { letterSpacing: '0.06em' } }}
      sx={{ maxWidth: 360, ...sx }}
    />
  );
}
