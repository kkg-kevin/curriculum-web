import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

// A password box with a show / hide eye — every sign-up that sets a parent's or a learner's
// password uses it. `error` is a react-hook-form field error (its message replaces helperText).
export default function PasswordField({ label, error, helperText, inputProps, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      {...rest}
      label={label}
      type={show ? 'text' : 'password'}
      error={Boolean(error)}
      helperText={error?.message || helperText}
      fullWidth
      slotProps={{
        htmlInput: { autoComplete: 'new-password', ...inputProps },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((v) => !v)} edge="end" size="small">
                {show ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
