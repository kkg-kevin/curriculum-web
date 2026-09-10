/**
 * Offline mock for GET /api/public/hubs[/types] — the designated admin's ACTIVE, NON-SCHOOL
 * learning hubs and their operational schedule, for the enrolment flow's "Type" picker.
 */
const raw = [
  {
    id: 'hub-0000-0001',
    name: 'Nairobi Makerspace',
    hubType: 'makerspace',
    hubTypeLabel: 'Makerspace',
    town: 'Nairobi, Nairobi',
    schedule: {
      opensAt: '09:00',
      closesAt: '18:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  {
    id: 'hub-0000-0002',
    name: 'Westlands Tech Club',
    hubType: 'tech_club',
    hubTypeLabel: 'Tech club',
    town: 'Nairobi, Nairobi',
    schedule: { opensAt: '15:00', closesAt: '18:00', days: ['Tuesday', 'Thursday', 'Saturday'] },
  },
  {
    id: 'hub-0000-0003',
    name: 'Thika Co-working Hub',
    hubType: 'co_working_space',
    hubTypeLabel: 'Co-working space',
    town: 'Thika, Kiambu',
    schedule: {
      opensAt: '08:00',
      closesAt: '17:30',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  },
];

const TYPE_LABELS = {
  co_working_space: 'Co-working space',
  innovation_lab: 'Innovation lab',
  makerspace: 'Makerspace',
  tech_club: 'Tech club',
};

export const hubs = raw;

export function hubList(type) {
  return type ? raw.filter((h) => h.hubType === type) : raw;
}

export function hubTypeList() {
  return Object.keys(TYPE_LABELS).map((type) => ({
    type,
    label: TYPE_LABELS[type],
    hubCount: raw.filter((h) => h.hubType === type).length,
  }));
}
