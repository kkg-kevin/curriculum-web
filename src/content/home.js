/**
 * Static copy for the Home page (spec §1.1).
 */

export const hero = {
  eyebrow: 'Robotics · Coding · STEM for kids',
  heading: 'Where Kenya’s young makers learn to build',
  sub: 'Digifunzi teaches children to design, code and build real things — through structured pathways, competitions, guided projects you buy and keep, and the Quarky robot.',
  primaryCta: { label: 'Enroll a learner', to: '/enroll' },
  secondaryCta: { label: 'Browse pathways', to: '/pathways' },
};

export const valueProps = [
  {
    title: 'Learn by building',
    body: 'Every session ends with something that works — a robot that moves, a program that plays, a circuit that lights up.',
  },
  {
    title: 'Progression that makes sense',
    body: 'Projects, bootcamps and competitions fit together into a path from first steps to confident young engineer.',
  },
  {
    title: 'Mentors, not just teachers',
    body: 'Small groups, hands-on help, and adults who are excited about what your child is making.',
  },
  {
    title: 'Built for Kenyan classrooms',
    body: 'Durable kits, offline-friendly tools, and a curriculum aligned to how schools here actually run their terms.',
  },
];

export const sectionSummaries = [
  {
    title: 'Pathways',
    to: '/pathways',
    blurb: 'Structured, multi-course tracks that take a learner from first steps to job-ready in one area, at their own pace.',
  },
  {
    title: 'Projects',
    to: '/projects',
    blurb: 'Guided build projects you buy once and keep for life — lessons, checkpoints and a finished thing to show.',
  },
  {
    title: 'Bootcamps',
    to: '/bootcamps',
    blurb: 'Short, intensive holiday programmes — a full robotics or coding build packed into a week or two, with a showcase at the end.',
  },
  {
    title: 'Competitions',
    to: '/competitions',
    blurb: 'Friendly, team-based challenges that give learners a real goal to build towards and a stage to present on.',
  },
  {
    title: 'Home Schooling',
    to: '/home-schooling',
    blurb: 'A Digifunzi educator teaches your children at home, each at their own level, on a simple monthly family package.',
  },
  {
    title: 'Store',
    to: '/store',
    blurb: 'The hardware side — the Quarky robot, classroom bundles and accessories to build with.',
  },
];

/**
 * "Questions parents ask" on the home page. Plain-text answers (they are also published as
 * FAQPage structured data). Each answer describes how the site and the programmes work today —
 * keep it that way: when prices, payment or locations change, change the answer.
 */
export const faqs = [
  {
    q: 'What ages do you teach?',
    a: 'Most of our programmes are for children and teenagers from about 5 to 18. Every pathway, bootcamp and competition shows its own age range on its page.',
  },
  {
    q: 'My child has never coded before. Where do we start?',
    a: 'Open a pathway and look for its diagnostic: a short set of questions chosen for your child’s age. You get a report straight away showing the level they should start at. If you would rather talk it through, send us the Enroll form and we will suggest a starting point.',
  },
  {
    q: 'Where do lessons take place?',
    a: 'At Digifunzi learning hubs, or in your own home through Home Schooling, where a Digifunzi educator comes to you. When you enrol in a pathway you choose the kind of hub and can see the days and hours it runs.',
  },
  {
    q: 'How much does it cost?',
    a: 'Where a price is set, you will find it on the page for that bootcamp, project, store item or Home Schooling package. Our team confirms the final price with you when you enquire, before you pay anything.',
  },
  {
    q: 'How do I pay?',
    a: 'You cannot pay on this website yet. After you enquire or sign up, our team confirms the price and arranges payment with you. Bootcamp and Home Schooling accounts are paid for in cash, and unlock fully once we have confirmed your payment.',
  },
  {
    q: 'Do you work with schools?',
    a: 'Yes. Schools bring Digifunzi programmes into their classrooms, buy kits for a class and enter teams in our competitions. Tell us about your learners on the Contact page and we will put a plan and a quote together.',
  },
];

/**
 * Real quotes only, each used with the person's permission. While this is empty the home page
 * leaves the "What parents and schools say" section out altogether — the three quotes that used
 * to sit here were written as stand-ins, not said by anyone.
 *
 * Shape: { quote: '…', name: 'Jane W., parent, Nairobi' }. The first is the large feature card.
 */
export const testimonials = [];
