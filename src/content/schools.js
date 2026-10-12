/**
 * Static copy for the Schools page (/schools) — the Robotics, AI & Coding for Schools programme.
 * The home page's schools band reads `programme` and the `features` titles from here too.
 */

export const programme = {
  title: 'Robotics, AI & Coding for Schools',
  lead: 'A hands-on programme that brings robotics, artificial intelligence and coding into your school.',
  body: [
    'Digifunzi’s Robotics, AI & Coding for Schools programme is designed to equip students with essential 21st-century skills through an engaging, hands-on learning approach.',
    'Our curriculum integrates robotics, artificial intelligence (AI) and coding into school education, enabling learners to develop problem-solving, critical thinking and creativity from an early age.',
  ],
  // Pre-fills the Contact page's message (its ?subject= param).
  contactTo: `/contact?subject=${encodeURIComponent('Robotics, AI & Coding for Schools')}`,
};

/** Key features & offerings. `icon` is a key into FEATURE_ICONS in pages/SchoolsPage.jsx. */
export const features = [
  {
    icon: 'curriculum',
    title: 'Comprehensive curriculum',
    body: 'Aligned with global and local education standards, covering block-based and text-based coding, AI applications and robotics.',
  },
  {
    icon: 'robot',
    title: 'Hands-on learning with Quarky',
    body: 'Our AI-powered educational robot fosters deep STEM engagement.',
  },
  {
    icon: 'training',
    title: 'Teacher training & support',
    body: 'We equip teachers with the skills and resources to implement the programme effectively.',
  },
  {
    icon: 'flexible',
    title: 'Flexible implementation',
    body: 'Suitable for integration into primary and secondary school curricula or specialised STEM programmes.',
  },
  {
    icon: 'affordable',
    title: 'Affordable & scalable',
    body: 'Schools of all sizes can implement the programme with minimal infrastructure investment.',
  },
  {
    icon: 'competitions',
    title: 'Global competitions',
    body: 'Students take part in global coding and robotics competitions, with Digifunzi as the Country Partner for Codeavour.',
  },
];

export const implementation = {
  eyebrow: 'Implementation approach',
  title: 'Building capacity for sustainability',
  lead: 'Our implementation strategy is designed to empower schools to teach robotics, AI and coding independently, while ensuring long-term sustainability.',
  steps: [
    {
      title: 'Teacher capacity building',
      body: 'We provide comprehensive teacher training so educators can deliver the curriculum effectively.',
    },
    {
      title: 'Technical mentor support',
      body: 'Experienced Technical Mentors guide schools through the initial implementation phase, offering expertise and troubleshooting support.',
    },
    {
      title: 'Continuous professional development',
      body: 'Teachers receive ongoing learning opportunities to stay updated with the latest advancements in digital education.',
    },
    {
      title: 'School ownership & sustainability',
      body: 'By equipping schools with the necessary skills and knowledge, the programme becomes self-sustaining, reducing reliance on external support over time.',
    },
    {
      title: 'Value for schools & learners',
      body: 'Schools benefit from enhanced academic performance, reputation and financial opportunities, while students gain critical future-ready skills that prepare them for the digital economy.',
    },
  ],
};

export const quarky = {
  eyebrow: 'Meet Quarky',
  title: 'The science behind learning',
  lead: 'Quarky is an AI-powered educational robot that enhances STEM learning through an interactive, hands-on approach.',
  points: [
    { title: 'Learning by doing', body: 'Encourages students to code, build and experiment.' },
    { title: 'Gamified education', body: 'Increases engagement through interactive challenges.' },
    { title: 'AI & IoT integration', body: 'Introduces students to machine learning and automation.' },
    { title: 'Adaptive learning paths', body: 'Supports individualised learning and problem-solving skills.' },
    {
      title: 'Multi-platform compatibility',
      body: 'Quarky can be programmed in Scratch and Python using a desktop app, web app, Android app and iOS app, making it accessible across various devices.',
    },
  ],
};
