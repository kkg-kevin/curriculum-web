/**
 * Copy for /get-started — where the header's Enroll button leads: the programmes a family can
 * enrol in themselves, each straight into its own sign-up. `key` picks the icon
 * (components/home/programmeIcons.js). The plain enquiry form (/enroll) stays one link away.
 */
export const getStarted = {
  title: 'How would you like your child to learn?',
  lead: 'Choose a programme and enrol yourself — it only takes a few minutes.',
  options: [
    {
      key: 'bootcamps',
      title: 'Bootcamps',
      hint: 'Holiday programmes',
      body: 'Short, intensive holiday programmes — a full robotics or coding build in a week or two, with a showcase at the end.',
      steps: ['Pick a bootcamp', 'Your child takes a short diagnostic', 'Enrol and create their login'],
      cta: 'Choose a bootcamp',
      to: '/bootcamps',
    },
    {
      key: 'homeSchooling',
      title: 'Home Schooling',
      hint: 'An educator at home',
      body: 'A Digifunzi educator teaches your children at home, each at their own level, on a simple monthly family package.',
      steps: ['Choose a family package', 'Add your children and home details', 'Accounts unlock once payment is confirmed'],
      cta: 'Sign up for Home Schooling',
      to: '/home-schooling/signup',
    },
    {
      key: 'techClubs',
      title: 'Tech Clubs',
      hint: 'In your estate',
      body: 'Coding, robotics and AI clubs run in estates and community spaces, so children can learn close to home.',
      steps: ['Find the club near you', 'Choose a package and add your children', 'Accounts unlock once payment is confirmed'],
      cta: 'Find a club',
      to: '/estate-tech-clubs',
    },
  ],
  help: {
    title: 'Not sure which fits?',
    body: 'Send us a question and we’ll help you choose the right programme for your child.',
    cta: 'Ask us',
    to: '/enroll',
  },
};
