import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { learnerBirthDateSchema } from '../forms/schemas.js';
import DateOfBirthField from '../forms/DateOfBirthField.jsx';
import { ageOn } from '../../utils/dates.js';

/**
 * The first step of a diagnostic (a pathway's, or a bootcamp's Enroll): the parent picks the
 * learner's date of birth, and the age it gives decides which diagnostic they take.
 *
 * `checkAge(age)` may return a message to refuse an age (e.g. no diagnostic for it yet);
 * `onSubmit(dateOfBirth, age)` gets both once it passes.
 */
export default function BirthDateStep({ onSubmit, defaultDateOfBirth, checkAge, intro }) {
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
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}
    >
      <Typography color="text.secondary">{intro}</Typography>
      <DateOfBirthField registration={register('dateOfBirth')} value={watch('dateOfBirth')} error={errors.dateOfBirth} />
      <Button type="submit" variant="contained" size="large">
        Continue
      </Button>
    </Box>
  );
}
