/**
 * Static content for the Quarky product page (spec §4.4, Option A).
 * Quarky does not exist in the main system's database at all — this section is
 * entirely hand-authored until/unless it is modelled on the backend (Option B).
 *
 * TODO: replace placeholder specs, price and photos with the real product data.
 */
export const quarky = {
  name: 'Quarky',
  tagline: 'The hands-on robot at the heart of Digifunzi',
  description:
    'Quarky is a compact, rugged learning robot built for the classroom. Learners wire sensors, drive motors and write real code to make it move, sense and react — the same board runs through most Digifunzi courses.',
  // TODO: confirm whether Quarky is sold, and at what price, before showing this.
  priceNote: 'Available to schools and families. Contact us for current pricing and bulk orders.',
  image: null, // TODO: /quarky-hero.jpg
  gallery: [], // TODO: product photos with alt text

  highlights: [
    'Beginner-friendly block coding and a smooth path to Python',
    'Built-in sensors: light, distance, sound, motion',
    'Motor and servo ports for building custom machines',
    'Rechargeable and classroom-durable',
  ],

  specs: [
    { label: 'Programming', value: 'Block-based editor and Python' }, // TODO confirm
    { label: 'Connectivity', value: 'USB and wireless' }, // TODO confirm
    { label: 'Sensors', value: 'Light, distance, sound, motion, temperature' }, // TODO confirm
    { label: 'Expansion', value: 'Motor ports, servo ports, add-on modules' }, // TODO confirm
    { label: 'Power', value: 'Rechargeable battery' }, // TODO confirm
    { label: 'Recommended age', value: '8 and up' }, // TODO confirm
  ],

  usedIn: [
    'Intro to Robotics',
    'Creative Electronics',
    'Junior Robotics Bootcamp',
  ],

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
};
