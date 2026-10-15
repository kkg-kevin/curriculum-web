/**
 * Offline mock for GET /api/public/hubs[/types] — the designated admin's ACTIVE, NON-SCHOOL
 * learning hubs and their operational schedule, for the enrolment flow's "Type" picker.
 */
const D = { in_person: 'In person', virtual: 'Online', hybrid: 'In person or online' };

const raw = [
  {
    id: 'hub-0000-0001',
    name: 'Nairobi Makerspace',
    hubType: 'makerspace',
    hubTypeLabel: 'Makerspace',
    deliveryMode: 'in_person',
    deliveryLabel: D.in_person,
    isVirtual: false,
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
    deliveryMode: 'hybrid',
    deliveryLabel: D.hybrid,
    isVirtual: false,
    town: 'Nairobi, Nairobi',
    schedule: { opensAt: '15:00', closesAt: '18:00', days: ['Tuesday', 'Thursday', 'Saturday'] },
  },
  {
    id: 'hub-0000-0003',
    name: 'Digifunzi Online Club',
    hubType: 'tech_club',
    hubTypeLabel: 'Tech club',
    deliveryMode: 'virtual',
    deliveryLabel: D.virtual,
    isVirtual: true,
    town: 'Online',
    schedule: { opensAt: '16:00', closesAt: '17:30', days: ['Monday', 'Wednesday', 'Friday'] },
  },
  {
    id: 'hub-0000-0004',
    name: 'Thika Co-working Hub',
    hubType: 'co_working_space',
    hubTypeLabel: 'Co-working space',
    deliveryMode: 'in_person',
    deliveryLabel: D.in_person,
    isVirtual: false,
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

/**
 * GET /api/public/hubs/:id for a hub in the list above — the profile shape the real endpoint
 * returns (public-bootcamp.service.js getHub), filled from the list entry, for the Estate Tech
 * Clubs pages in an offline build.
 */
export function hubProfile(id) {
  const h = raw.find((x) => x.id === id);
  if (!h) return null;
  return {
    id: h.id,
    name: h.name,
    description: `${h.name} is a Digifunzi ${h.hubTypeLabel.toLowerCase()} where young learners build robots, games and apps.`,
    address: h.isVirtual ? '' : h.town,
    phone: '',
    email: '',
    contactPerson: '',
    mapLink: '',
    photo: null,
    photos: [],
    amenities: ['wifi', 'desks', 'whiteboard'],
    operatingHours: h.schedule,
    spaces: [],
  };
}

export function hubTypeList() {
  return Object.keys(TYPE_LABELS).map((type) => ({
    type,
    label: TYPE_LABELS[type],
    hubCount: raw.filter((h) => h.hubType === type).length,
  }));
}
