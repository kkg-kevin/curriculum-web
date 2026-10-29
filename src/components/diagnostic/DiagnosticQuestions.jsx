import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

/**
 * The answer controls for one public-diagnostic question, sized for a child on a phone or tablet:
 * big tappable cards rather than small radios. Public-diagnostic equivalent of the portal's
 * AssessmentTaker.jsx, rebuilt with this site's own MUI theme. Only the item kinds the public
 * diagnostic API can send (auto-marked ones — WEBSITE_INTEGRATION_CONTRACT.md §3.8).
 *
 * Same [{itemId, response}] shape as AssessmentTaker — response per kind:
 *   mcqSingle/trueFalse/canDo: string · mcqMultiple: string[] · fillBlank: string[]
 *   ordering: string[] (a reordering of item.sequence) · matching: [{left, right}]
 */

// A friendly colour per answer letter — the same order everywhere, so "A" is always blue.
const LETTER_COLORS = ['#2E7DB5', '#E8833A', '#2E9E6A', '#8B5CF6', '#D9467A', '#0E9AA7'];
const letter = (i) => String.fromCharCode(65 + i);

// The can-do levels, in the order the server marks them (builder.constants.js's CAN_DO_LEVELS);
// a question's own levelLabels replace the wording only.
const CAN_DO_LEVELS = [
  { key: 'independent', label: 'I can do it on my own', color: '#2E9E6A' },
  { key: 'withHelp', label: 'I can do it with help', color: '#E8833A' },
  { key: 'cannot', label: 'I can’t do it yet', color: '#8B5CF6' },
];

/** Whether a question has an answer worth counting as "answered" on the progress dots. */
export function isAnswered(item, value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) {
    if (item.kind === 'fillBlank') return value.some((v) => String(v || '').trim() !== '');
    return value.length > 0;
  }
  return true;
}

// One big answer card. `multi` shows a tick box instead of the letter bubble once picked.
function ChoiceCard({ index, label, selected, multi = false, color, onClick }) {
  const tint = color || LETTER_COLORS[index % LETTER_COLORS.length];
  return (
    <ButtonBase
      onClick={onClick}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        textAlign: 'left',
        gap: 1.75,
        px: { xs: 1.75, sm: 2.25 },
        py: { xs: 1.5, sm: 1.75 },
        borderRadius: 4,
        border: '2px solid',
        borderColor: selected ? tint : 'divider',
        backgroundColor: selected ? `${tint}1F` : 'background.paper',
        boxShadow: selected ? `0 4px 14px ${tint}33` : 'none',
        transition: 'transform .12s ease, border-color .12s ease, background-color .12s ease',
        '&:hover': { borderColor: tint, transform: 'translateY(-1px)' },
        '&:active': { transform: 'scale(0.99)' },
        '&.Mui-focusVisible': { outline: `3px solid ${tint}`, outlineOffset: 2 },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: multi ? 2 : '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 17,
          color: selected ? '#fff' : tint,
          backgroundColor: selected ? tint : `${tint}1A`,
          border: `2px solid ${tint}`,
        }}
      >
        {selected ? <CheckRoundedIcon sx={{ fontSize: 22 }} /> : letter(index)}
      </Box>
      <Typography sx={{ fontSize: { xs: 16, sm: 17 }, fontWeight: selected ? 800 : 600, color: 'text.primary', lineHeight: 1.35 }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

function McqField({ item, value, onChange }) {
  const options = item.options?.length ? item.options : item.kind === 'trueFalse' ? ['True', 'False'] : [];
  const multi = item.kind === 'mcqMultiple';
  const selected = multi ? (Array.isArray(value) ? value : []) : value;
  const pick = (opt) =>
    multi ? onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]) : onChange(opt);
  return (
    <Box role={multi ? 'group' : 'radiogroup'} sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', md: options.length > 2 ? '1fr 1fr' : '1fr' } }}>
      {options.map((opt, i) => (
        <ChoiceCard
          key={opt}
          index={i}
          label={opt}
          multi={multi}
          selected={multi ? selected.includes(opt) : selected === opt}
          onClick={() => pick(opt)}
        />
      ))}
    </Box>
  );
}

function CanDoField({ item, value, onChange }) {
  return (
    <Box role="radiogroup" sx={{ display: 'grid', gap: 1.25 }}>
      {CAN_DO_LEVELS.map((level, i) => (
        <ChoiceCard
          key={level.key}
          index={i}
          color={level.color}
          label={item.levelLabels?.[i]?.trim() || level.label}
          selected={value === level.key}
          onClick={() => onChange(level.key)}
        />
      ))}
    </Box>
  );
}

function FillBlankField({ item, value, onChange }) {
  const blanks = item.blanks || [];
  const answers = Array.isArray(value) ? value : [];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 460 }}>
      {blanks.map((_, i) => (
        <TextField
          key={i}
          label={blanks.length > 1 ? `Answer ${i + 1}` : 'Your answer'}
          value={answers[i] || ''}
          onChange={(e) => {
            const next = [...answers];
            next[i] = e.target.value;
            onChange(next);
          }}
          slotProps={{ htmlInput: { style: { fontSize: 18 }, autoComplete: 'off' } }}
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 600 }}>
        Use the arrows to put these in the right order — first at the top.
      </Typography>
      {order.map((step, i) => {
        const tint = LETTER_COLORS[i % LETTER_COLORS.length];
        return (
          <Box
            key={step}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              pl: 1.5,
              pr: 0.75,
              py: 1,
              borderRadius: 4,
              border: '2px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Box sx={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', backgroundColor: tint }}>
              {i + 1}
            </Box>
            <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{step}</Typography>
            <IconButton onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move “${step}” up`} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <KeyboardArrowUpIcon />
            </IconButton>
            <IconButton onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label={`Move “${step}” down`} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <KeyboardArrowDownIcon />
            </IconButton>
          </Box>
        );
      })}
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 600 }}>Pick the one that goes with each.</Typography>
      {pairs.map((p, i) => (
        <Box
          key={p.left}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            p: 1.25,
            borderRadius: 4,
            border: '2px solid',
            borderColor: answerFor(p.left) ? LETTER_COLORS[i % LETTER_COLORS.length] : 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 16, flex: '1 1 160px' }}>{p.left}</Typography>
          <Select
            value={answerFor(p.left)}
            onChange={(e) => setAnswer(p.left, e.target.value)}
            displayEmpty
            sx={{ flex: '1 1 200px', borderRadius: 3, fontSize: 16 }}
          >
            <MenuItem value="">
              <em>Choose…</em>
            </MenuItem>
            {rights.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: 16 }}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ))}
    </Box>
  );
}

/** The answer controls for one question; null for a kind the website can't show. */
export function ItemField({ item, value, onChange }) {
  if (['mcqSingle', 'mcqMultiple', 'trueFalse'].includes(item.kind)) {
    return <McqField item={item} value={value} onChange={onChange} />;
  }
  if (item.kind === 'canDo') return <CanDoField item={item} value={value} onChange={onChange} />;
  if (item.kind === 'fillBlank') return <FillBlankField item={item} value={value} onChange={onChange} />;
  if (item.kind === 'ordering') return <OrderingField item={item} value={value} onChange={onChange} />;
  if (item.kind === 'matching') return <MatchingField item={item} value={value} onChange={onChange} />;
  return null;
}

/** A short hint under the question for the kinds that need one. */
export function kindHint(item) {
  if (item.kind === 'mcqMultiple') return 'Pick all the answers you think are right.';
  if (item.kind === 'canDo') return 'Be honest — there’s no wrong answer here.';
  if (item.kind === 'fillBlank') return 'Type your answer.';
  return null;
}
