import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import SmartImage from '../common/SmartImage.jsx';
import { suggestStartingCourse } from '../../utils/placement.js';
import { ageLabel } from '../../utils/format.js';

/**
 * Age-based placement widget on the pathway detail page. No quiz, no backend
 * call — matches the entered age against each course's ageMin/ageMax (already
 * loaded with the pathway) and recommends where to start. The result feeds the
 * Enroll form as `referenceLabel` / a note so staff see the same suggestion.
 */
export default function StartingPointFinder({ pathwaySlug, pathwayName, courses = [], accent }) {
  const [age, setAge] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = Number(age);
    if (!Number.isFinite(parsed) || age === '') return;
    setResult(suggestStartingCourse(courses, parsed));
  };

  const handleChangeAge = (e) => {
    setAge(e.target.value);
    setResult(null);
  };

  const enrollHref = result
    ? `/enroll?interestedIn=project&referenceId=${encodeURIComponent(pathwaySlug)}&course=${encodeURIComponent(result.course.name)}`
    : null;

  return (
    <Box
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Find your starting point
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter the learner’s age and we’ll suggest which {pathwayName} course to start with.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <TextField
          label="Learner’s age"
          type="number"
          value={age}
          onChange={handleChangeAge}
          inputProps={{ min: 3, max: 19 }}
          size="small"
          sx={{ width: 160 }}
        />
        <Button type="submit" variant="outlined" size="large" disabled={age === ''}>
          Suggest a starting course
        </Button>
      </Box>

      {result && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            borderRadius: 2,
            backgroundColor: `${accent}14`,
          }}
        >
          {result.course.coverImage && (
            <Box sx={{ width: 96, flexShrink: 0 }}>
              <SmartImage src={result.course.coverImage} alt={result.course.name} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="overline" sx={{ color: accent, fontWeight: 700 }}>
              Start at step {result.index + 1}
            </Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
              {result.course.name}
            </Typography>
            {ageLabel(result.course.ageMin, result.course.ageMax) && (
              <Chip
                size="small"
                variant="outlined"
                label={ageLabel(result.course.ageMin, result.course.ageMax)}
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          <Button component={RouterLink} to={enrollHref} variant="contained" size="large">
            Enroll for this course
          </Button>
        </Box>
      )}
    </Box>
  );
}
