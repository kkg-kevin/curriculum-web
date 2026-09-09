/**
 * Static catalogue for the Store — PHYSICAL goods only: the Quarky robot,
 * classroom bundles and accessories. Projects you buy (digital, course-style)
 * are their own section — src/content/projects.js.
 *
 * ⚠️ PLACEHOLDER content and prices — see src/content/catalog.js. There is no
 * commerce API yet; "Enquire to buy" posts a lead via /api/public/leads.
 *
 * Item shape + PRICING_IS_PLACEHOLDER: src/content/catalog.js.
 */
import { PRICING_IS_PLACEHOLDER } from './catalog.js';

export { PRICING_IS_PLACEHOLDER };

/** Store categories, in display order. `key` matches item.kind. */
export const STORE_CATEGORIES = [
  { key: 'all', label: 'Everything' },
  { key: 'kit', label: 'Robots & kits' },
  { key: 'bundle', label: 'Bundles' },
  { key: 'accessory', label: 'Accessories' },
];

const rawItems = [
  // ---- Quarky — migrated verbatim from the old content/quarky.js -------------
  {
    slug: 'quarky',
    icon: 'robot',
    name: 'Quarky',
    kind: 'kit',
    nature: 'physical',
    tagline: 'The hands-on robot at the heart of Digifunzi',
    summary:
      'A compact, rugged learning robot: wire sensors, drive motors and write real code to make it move, sense and react.',
    description:
      'Quarky is a compact, rugged learning robot built for the classroom. Learners wire sensors, drive motors and write real code to make it move, sense and react — the same board runs through most Digifunzi courses.',
    price: { amount: 14500, currency: 'KES', unit: 'each', compareAt: null },
    priceNote: 'School and bulk pricing available — ask us for a quote for a class set.',
    status: 'available',
    badge: 'Core kit',
    image: null, // TODO: /store/quarky-hero.jpg
    gallery: [],
    highlights: [
      'Beginner-friendly block coding and a smooth path to Python',
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
      { label: 'Programming', value: 'Block-based editor and Python' }, // TODO confirm
      { label: 'Connectivity', value: 'USB and wireless' }, // TODO confirm
      { label: 'Sensors', value: 'Light, distance, sound, motion, temperature' }, // TODO confirm
      { label: 'Expansion', value: 'Motor ports, servo ports, add-on modules' }, // TODO confirm
      { label: 'Power', value: 'Rechargeable battery' }, // TODO confirm
      { label: 'Recommended age', value: '8 and up' }, // TODO confirm
    ],
    audience: 'Ages 8 and up',
    usedIn: ['Intro to Robotics', 'Creative Electronics', 'Junior Robotics Bootcamp'],
    faqs: [
      {
        q: 'Do learners need to buy a Quarky to join a course?',
        a: 'No. Kits are provided during in-person classes. Families who want one for home practice can buy their own.',
      },
      {
        q: 'Can our school buy a class set?',
        a: 'Yes — get in touch through the contact form and we will put together a quote for the number of learners you have.',
      },
      {
        q: 'What software does it need?',
        a: 'A modern web browser for the block editor. Python projects need a laptop with Python installed; we help you set it up.',
      },
    ],
  },

  // ---- A bundle — robot + projects sold together ---------------------------
  {
    slug: 'home-starter-bundle',
    icon: 'box',
    name: 'Home Starter Bundle',
    kind: 'bundle',
    nature: 'physical',
    tagline: 'A Quarky plus three projects to build with it',
    summary:
      'Everything a family needs to start building at home: one Quarky robot and lifetime access to three beginner projects, for less than buying them separately.',
    description:
      'The Home Starter Bundle pairs the Quarky robot with the Smart Home Starter, Line-Following Robot and Build a Weather Station projects. It is the simplest way to go from nothing to a learner who is building independently — the robot arrives, the projects are already unlocked, and there is a clear order to work through them.',
    price: { amount: 19500, currency: 'KES', unit: 'one-off', compareAt: 21300 },
    priceNote: 'Bundle price — about 8% below buying the robot and three projects on their own.',
    status: 'available',
    badge: 'Best value',
    image: null,
    gallery: [],
    highlights: [
      'One Quarky robot, shipped to you',
      'Lifetime access to three beginner projects',
      'A suggested order to work through them',
      'Cheaper than buying the parts separately',
    ],
    includes: [
      'Quarky robot with battery, cable and starter cards',
      'Smart Home Starter project (lifetime access)',
      'Line-Following Robot project (lifetime access)',
      'Build a Weather Station project (lifetime access)',
    ],
    specs: [
      { label: 'Contains', value: '1 robot + 3 digital projects' },
      { label: 'Projects access', value: 'Lifetime, one learner' },
      { label: 'Recommended age', value: '8–14' },
    ],
    audience: 'Ages 8–14',
    usedIn: ['Robotics pathway'],
    // Projects bundled in — the detail page links these through to /projects/:slug.
    bundledProjects: [
      'smart-home-starter-project',
      'line-following-robot-project',
      'weather-station-data-project',
    ],
    faqs: [
      {
        q: 'Can I buy the bundle for more than one child?',
        a: 'Each bundle covers one learner for the project access. For siblings sharing one robot, ask us about adding extra learner seats to the projects.',
      },
    ],
  },

  // ---- An accessory — a "coming soon" example ------------------------------
  {
    slug: 'quarky-expansion-pack',
    icon: 'cable',
    name: 'Quarky Expansion Pack',
    kind: 'accessory',
    nature: 'physical',
    tagline: 'Extra motors, servos and parts for bigger builds',
    summary:
      'A set of add-on motors, servos, wheels and connectors for learners who have outgrown the base Quarky and want to build larger machines.',
    description:
      'The Expansion Pack adds the parts most requested by learners moving on to open-ended builds: two extra geared motors, two servos, a second set of wheels, and a bag of structural connectors. Designed to clip straight onto the Quarky ports with no soldering.',
    price: { amount: 4200, currency: 'KES', unit: 'each', compareAt: null },
    priceNote: 'Ships with the Quarky or on its own once available.',
    status: 'coming-soon',
    badge: null,
    image: null,
    gallery: [],
    highlights: [
      'Two extra geared motors and two servos',
      'A second set of wheels for larger builds',
      'Structural connectors — no soldering',
      'Clips onto the standard Quarky ports',
    ],
    includes: [
      '2 × geared motor',
      '2 × servo',
      '2 × wheel',
      'Connector and bracket set',
    ],
    specs: [
      { label: 'Compatibility', value: 'Quarky main board' },
      { label: 'Assembly', value: 'No soldering — clip-on ports' },
    ],
    audience: 'Existing Quarky owners',
    usedIn: ['Creative Electronics'],
    faqs: [
      {
        q: 'When will this be available?',
        a: 'We are finalising the parts list. Send an enquiry from this page and we will tell you as soon as it is in stock.',
      },
    ],
  },
];

/** Full store catalogue (physical goods). */
export const storeItems = rawItems;

/** One item by slug, or null. */
export function getStoreItem(slug) {
  return storeItems.find((it) => it.slug === slug) || null;
}

/** Items of a given kind ('all' returns everything). */
export function storeItemsByCategory(categoryKey) {
  if (!categoryKey || categoryKey === 'all') return storeItems;
  return storeItems.filter((it) => it.kind === categoryKey);
}

/** Only the categories that actually have at least one item (plus 'all'). */
export function activeStoreCategories() {
  return STORE_CATEGORIES.filter(
    (c) => c.key === 'all' || storeItems.some((it) => it.kind === c.key),
  );
}
