import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { learnerBirthDateSchema } from '../forms/schemas.js';
import DateOfBirthField from '../forms/DateOfBirthField.jsx';
import { ageOn } from '../../utils/dates.js';

/**
 * The first step of a diagnostic (a pathway's, or a bootcamp's Enroll): the parent picks the
 * learner's date of birth, and the age it gives decides which diagnostic they take.
 *
 * `checkAge(age)` may return a message to refuse an age (e.g. no diagnostic for it yet);
 * `advice(age)` a note shown under the field once a date is picked, without stopping them (e.g.
 * outside a bootcamp's ages); `onSubmit(dateOfBirth, age)` gets both once it passes. `intro` is
 * optional, `sx` adds to the form's own styles.
 */
export default function BirthDateStep({ onSubmit, defaultDateOfBirth, checkAge, advice, intro, sx }) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(learnerBirthDateSchema),
    defaultValues: { dateOfBirth: defaultDateOfBirth || '' },
    mode: 'onTouched',
  });
  const pickedAge = ageOn(watch('dateOfBirth'));
  const note = advice && pickedAge !== null && pickedAge >= 0 ? advice(pickedAge) : null;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(({ dateOfBirth }) => {
        const age = ageOn(dateOfBirth);
        const refusal = checkAge?.(age);
        if (refusal) {
          setError('dateOfBirth', { message: refusal });
          return;
        }
        onSubmit(dateOfBirth, age);
      })}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420, ...sx }}
    >
      {intro && <Typography color="text.secondary">{intro}</Typography>}
      <DateOfBirthField registration={register('dateOfBirth')} value={watch('dateOfBirth')} error={errors.dateOfBirth} />
      {note && !errors.dateOfBirth && <Alert severity="info" sx={{ mt: -1 }}>{note}</Alert>}
      <Button type="submit" variant="contained" size="large">
        Continue
      </Button>
    </Box>
  );
}
