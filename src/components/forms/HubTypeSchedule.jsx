import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PlaceIcon from '@mui/icons-material/Place';
import { useHubTypes, useHubsByType } from '../../hooks/usePublicHubs.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatTime(t) {
  if (!t) return null;
  // "08:00" -> "8:00 AM"
  const [h, m] = String(t).split(':').map(Number);
  if (Number.isNaN(h)) return t;
  const ampm = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

/** The opening/closing time + the week as day pills, matching the portal's Operational Information. */
function ScheduleCard({ hub }) {
  const s = hub.schedule || {};
  const open = formatTime(s.opensAt);
  const close = formatTime(s.closesAt);
  const openDays = new Set(s.days || []);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 700 }}>{hub.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {hub.hubTypeLabel}
        </Typography>
      </Box>

      {hub.town && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, color: 'text.secondary' }}>
          <PlaceIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2">{hub.town}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
        <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {open && close ? `${open} – ${close}` : 'Hours to be confirmed'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, mb: 1 }}>
        <EventAvailableIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Available days
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {DAYS.map((d) => {
          const on = openDays.has(d);
          return (
            <Chip
              key={d}
              size="small"
              label={d.slice(0, 3)}
              variant={on ? 'filled' : 'outlined'}
              color={on ? 'primary' : 'default'}
              sx={{ fontWeight: 600, opacity: on ? 1 : 0.5 }}
            />
          );
        })}
      </Box>
      {(s.days || []).length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Days to be confirmed — our team will let you know.
        </Typography>
      )}
    </Box>
  );
}

/**
 * "Type" + "Schedule for that hub" for the enrolment form. The parent picks a non-school
 * learning-hub type; the matching hubs' real operational schedule (from the curriculum system)
 * is shown read-only, and — if there's more than one — they pick which hub.
 *
 * Controlled: `value` is { hubType, hubId, hubName }, `onChange(next)` fires on either change
 * (hubName carried along so the parent form can put a readable name on the lead). The hubs
 * query is disabled until a type is picked.
 */
export default function HubTypeSchedule({ value, onChange, error }) {
  const { hubType, hubId } = value || {};
  const { data: types = [], isLoading: typesLoading } = useHubTypes();
  const { data: hubs = [], isLoading: hubsLoading } = useHubsByType(hubType);

  const setType = (t) => onChange({ hubType: t || '', hubId: '', hubName: '' });
  const setHub = (id) =>
    onChange({ hubType, hubId: id || '', hubName: hubs.find((h) => h.id === id)?.name || '' });

  const selectedHub = hubs.find((h) => h.id === hubId);

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <TextField
        select
        label="Type of learning hub"
        required
        SelectProps={{ native: true }}
        InputLabelProps={{ shrink: true }}
        value={hubType || ''}
        onChange={(e) => setType(e.target.value)}
        error={Boolean(error)}
        helperText={error || 'Where you’d like the learner to attend — schools run their own admissions.'}
        disabled={typesLoading}
      >
        <option value="">Choose a type…</option>
        {types.map((t) => (
          <option key={t.type} value={t.type} disabled={t.hubCount === 0}>
            {t.label}
            {t.hubCount === 0 ? ' — none available yet' : ''}
          </option>
        ))}
      </TextField>

      {hubType && (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Typography variant="subtitle2">Schedule for that hub</Typography>

          {hubsLoading && <Skeleton variant="rounded" height={160} />}

          {!hubsLoading && hubs.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No {types.find((t) => t.type === hubType)?.label?.toLowerCase() || 'hub'} is listed
              yet — submit anyway and our team will follow up with options.
            </Typography>
          )}

          {!hubsLoading && hubs.length > 1 && (
            <TextField
              select
              label="Which one?"
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
              value={hubId || ''}
              onChange={(e) => setHub(e.target.value)}
            >
              <option value="">Any / not sure</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                  {h.town ? ` — ${h.town}` : ''}
                </option>
              ))}
            </TextField>
          )}

          {!hubsLoading &&
            (selectedHub ? (
              <ScheduleCard hub={selectedHub} />
            ) : (
              hubs.map((h) => <ScheduleCard key={h.id} hub={h} />)
            ))}
        </Box>
      )}
    </Box>
  );
}
