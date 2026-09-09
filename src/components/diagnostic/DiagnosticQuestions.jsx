import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

/**
 * Public-diagnostic equivalent of client/src/modules/assessments/components/AssessmentTaker.jsx,
 * rebuilt with this site's own MUI theme rather than importing the admin app's inline styles.
 * Only handles the item kinds the public diagnostic API can ever send
 * (WEBSITE_INTEGRATION_CONTRACT.md §3.8) — no file uploads, no deliverables, no
 * open-ended text kinds.
 *
 * Same [{itemId, response}] shape in/out as AssessmentTaker — response per kind:
 *   mcqSingle/trueFalse: string · mcqMultiple: string[] · fillBlank: string[]
 *   ordering: string[] (a reordering of item.sequence) · matching: [{left, right}]
 */

function QuestionCard({ index, item, children }) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
          {index + 1}.
        </Typography>
        <Box
          sx={{ flex: 1, minWidth: 0, '& p': { m: 0 } }}
          dangerouslySetInnerHTML={{ __html: item.question }}
        />
      </Box>
      <Box sx={{ pl: { xs: 0, sm: 3.5 } }}>{children}</Box>
    </Card>
  );
}

function McqField({ item, value, onChange }) {
  const options = item.options?.length ? item.options : item.kind === 'trueFalse' ? ['True', 'False'] : [];

  if (item.kind === 'mcqMultiple') {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt) =>
      onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {options.map((opt) => (
          <FormControlLabel
            key={opt}
            control={<Checkbox checked={selected.includes(opt)} onChange={() => toggle(opt)} />}
            label={opt}
          />
        ))}
      </Box>
    );
  }

  return (
    <RadioGroup value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
      ))}
    </RadioGroup>
  );
}

function FillBlankField({ item, value, onChange }) {
  const blanks = item.blanks || [];
  const answers = Array.isArray(value) ? value : [];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 420 }}>
      {blanks.map((_, i) => (
        <TextField
          key={i}
          size="small"
          placeholder={`Blank ${i + 1}`}
          value={answers[i] || ''}
          onChange={(e) => {
            const next = [...answers];
            next[i] = e.target.value;
            onChange(next);
          }}
        />
      ))}
    </Box>
  );
}

function OrderingField({ item, value, onChange }) {
  const order = Array.isArray(value) && value.length === item.sequence?.length ? value : item.sequence || [];
  const move = (i, dir) => {
    const next = [...order];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {order.map((step, i) => (
        <Box
          key={step}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'surface.subtle',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', width: 18, flexShrink: 0 }}>
            {i + 1}
          </Typography>
          <Typography sx={{ flex: 1, fontSize: 14 }}>{step}</Typography>
          <Box sx={{ display: 'flex', flexShrink: 0 }}>
            <IconButton size="small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
              <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => move(i, 1)}
              disabled={i === order.length - 1}
              aria-label="Move down"
            >
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ))}
      <Typography variant="caption" color="text.secondary" fontStyle="italic">
        Use the arrows to put these in the correct order.
      </Typography>
    </Box>
  );
}

function MatchingField({ item, value, onChange }) {
  const pairs = item.pairs || [];
  const rights = item.rightOptions?.length ? item.rightOptions : pairs.map((p) => p.right);
  const answers = Array.isArray(value) ? value : [];
  const answerFor = (left) => answers.find((a) => a.left === left)?.right || '';
  const setAnswer = (left, right) => {
    const next = answers.filter((a) => a.left !== left);
    if (right) next.push({ left, right });
    onChange(next);
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {pairs.map((p) => (
        <Box key={p.left} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600, minWidth: 140 }}>{p.left}</Typography>
          <Typography color="text.disabled">↔</Typography>
          <Select
            size="small"
            value={answerFor(p.left)}
            onChange={(e) => setAnswer(p.left, e.target.value)}
            displayEmpty
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">
              <em>Choose a match…</em>
            </MenuItem>
            {rights.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ))}
    </Box>
  );
}

function ItemField({ item, value, onChange }) {
  if (['mcqSingle', 'mcqMultiple', 'trueFalse'].includes(item.kind)) {
    return <McqField item={item} value={value} onChange={onChange} />;
  }
  if (item.kind === 'fillBlank') return <FillBlankField item={item} value={value} onChange={onChange} />;
  if (item.kind === 'ordering') return <OrderingField item={item} value={value} onChange={onChange} />;
  if (item.kind === 'matching') return <MatchingField item={item} value={value} onChange={onChange} />;
  return null;
}

/**
 * Props: { items, onChange } — items from GET /api/public/diagnostics/:slug?age=
 * (the `.items` array). Emits the full [{itemId, response}] array on every change,
 * same as AssessmentTaker's onChange contract.
 */
export default function DiagnosticQuestions({ items = [], onChange }) {
  const [answers, setAnswers] = useState(() => new Map());

  const setResponse = (itemId, response) => {
    const next = new Map(answers);
    next.set(itemId, response);
    setAnswers(next);
    onChange?.([...next.entries()].map(([id, resp]) => ({ itemId: id, response: resp })));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item, i) => (
        <QuestionCard key={item.id} index={i} item={item}>
          <ItemField item={item} value={answers.get(item.id)} onChange={(v) => setResponse(item.id, v)} />
        </QuestionCard>
      ))}
    </Box>
  );
}
