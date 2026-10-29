import TextField from '@mui/material/TextField';
import { ageOn, todayStr } from '../../utils/dates.js';

/**
 * A learner's date of birth — every website form that needs a child's age asks for this instead,
 * and works the age out from it (ageOn). Shows "Age N" under the field as soon as a date is
 * picked, so the parent can see it's right. Pass react-hook-form's `register(name)` as
 * `registration` and the watched value as `value`.
 */
export default function DateOfBirthField({ registration, value, error, label = 'Learner’s date of birth', ...props }) {
  const today = todayStr();
  const earliest = `${Number(today.slice(0, 4)) - 20}${today.slice(4)}`;
  const age = ageOn(value);
  return (
    <TextField
      label={label}
      type="date"
      {...registration}
      error={Boolean(error)}
      helperText={error?.message || (age !== null && age >= 0 ? `Age ${age}` : ' ')}
      slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: earliest, max: today } }}
      fullWidth
      {...props}
    />
  );
}
