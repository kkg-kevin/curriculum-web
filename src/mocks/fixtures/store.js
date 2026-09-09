import { slugify } from '../../utils/slugify.js';

/**
 * Offline mock for GET /api/public/store[/:idOrSlug] — the designated admin's shared `inventory`
 * items flipped "For sale" in the portal's Inventory panel
 * (WEBSITE_INTEGRATION_CONTRACT.md §3.5/§3.6). Shape mirrors the real projection.
 */
const raw = [
  {
    id: 's0000000-0001-4000-8000-000000000001',
    name: 'Quarky Robot Kit',
    tagline: 'The hands-on robot at the heart of Digifunzi',
    storeCategory: 'kit',
    badge: 'Core kit',
    stockStatus: 'available',
    image: null,
    price: {
      amount: 14500,
      currency: 'KES',
      unit: 'each',
      note: 'School and bulk pricing available — ask us for a class-set quote.',
      compareAt: null,
    },
    description:
      'Quarky is a compact, rugged learning robot built for the classroom. Learners wire sensors, drive motors and write real code to make it move, sense and react — the same board runs through most Digifunzi projects.',
    highlights: [
      'Beginner-friendly block coding with a smooth path to Python',
      'Built-in sensors: light, distance, sound, motion',
      'Motor and servo ports for building custom machines',
      'Rechargeable and classroom-durable',
    ],
    includes: [
      'Quarky main board with built-in sensors',
      'USB cable and rechargeable battery',
      'Quick-start guide and access to the block editor',
      'Starter project cards',
    ],
    specs: [
      { label: 'Programming', value: 'Block-based editor and Python' },
      { label: 'Connectivity', value: 'USB and wireless' },
      { label: 'Sensors', value: 'Light, distance, sound, motion, temperature' },
      { label: 'Power', value: 'Rechargeable battery' },
      { label: 'Recommended age', value: '8 and up' },
    ],
    gallery: [],
  },
  {
    id: 's0000000-0002-4000-8000-000000000002',
    name: 'Quarky Expansion Pack',
    tagline: 'Extra motors, servos and parts for bigger builds',
    storeCategory: 'accessory',
    badge: null,
    stockStatus: 'coming_soon',
    image: null,
    price: { amount: 4200, currency: 'KES', unit: 'each', note: '', compareAt: null },
    description:
      'The Expansion Pack adds the parts most requested by learners moving on to open-ended builds: two extra geared motors, two servos, a second set of wheels, and a bag of structural connectors. Clips straight onto the Quarky ports — no soldering.',
    highlights: [
      'Two extra geared motors and two servos',
      'A second set of wheels for larger builds',
      'Structural connectors — no soldering',
      'Clips onto the standard Quarky ports',
    ],
    includes: ['2 × geared motor', '2 × servo', '2 × wheel', 'Connector and bracket set'],
    specs: [
      { label: 'Compatibility', value: 'Quarky main board' },
      { label: 'Assembly', value: 'No soldering — clip-on ports' },
    ],
    gallery: [],
  },
];

export const store = raw.map((it) => ({
  ...it,
  slug: slugify(it.name),
  highlightCount: it.highlights.length,
}));

// The list projection is the item minus the detail-only fields.
const LIST_FIELDS = [
  'id', 'slug', 'name', 'tagline', 'storeCategory', 'badge', 'stockStatus', 'image', 'price',
  'highlightCount',
];
export const storeList = store.map((it) =>
  Object.fromEntries(LIST_FIELDS.map((k) => [k, it[k]])),
);

export function storeItemDetail(idOrSlug) {
  return store.find((it) => it.id === idOrSlug || it.slug === idOrSlug) || null;
}
