/**
 * Who Digifunzi is, in the organisation's own words — shared by the Home, About and Schools
 * pages so the three never drift apart.
 */

export const whoWeAre =
  'Digifunzi is an impact-driven digital literacy programme. We aim to foster creativity, collaboration and leadership in kids aged 5–17 and give them the skills to compete for opportunities in the digital economy.';

/** Vision, mission and the 2030 goal. `key` picks the icon in components/home/Purpose.jsx. */
export const purpose = [
  { key: 'vision', title: 'Vision', body: 'Enable skills development in Africa through EdTech.' },
  { key: 'mission', title: 'Mission', body: 'Empower the youth in Africa with skills for the digital economy.' },
  {
    key: 'goal',
    title: '2030 Goal',
    body: 'Get 1 million learners in Africa to write their first line of code by 2030.',
  },
];

/**
 * Schools and organisations Digifunzi has worked with. Each shows its own logo above its name
 * (files in public/clients/, taken from each school's official website). One without a `logo`
 * yet shows an icon for its `kind` instead (school, media, club or organisation) — add the file
 * to public/clients/ and a `logo: '/clients/<file>'` here to replace it.
 */
export const clients = [
  { name: 'Braeburn Schools', kind: 'school', logo: '/clients/braeburn-schools.svg' },
  { name: 'Rosslyn Academy', kind: 'school', logo: '/clients/rosslyn-academy.png' },
  { name: 'Woodcreek School', kind: 'school', logo: '/clients/woodcreek-school.png' },
  { name: 'Arya Vedic Academy', kind: 'school', logo: '/clients/arya-vedic-academy.jpg' },
  { name: 'Nation', kind: 'media' },
  { name: 'Parklands Sports Club', kind: 'club' },
  { name: 'GrandStart', kind: 'organisation' },
  { name: 'Foresight Academy', kind: 'school' },
];
