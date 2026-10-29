import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import StoreCardShell from './StoreCardShell.jsx';
import { ageLabel } from '../../utils/format.js';
import { projectPath } from '../../utils/storePaths.js';

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

/**
 * A project in the Store grid — a guided build a child works through at their own pace and keeps
 * for life. Drawn by StoreCardShell, like the Store's goods, with the facts a parent weighs (age,
 * steps, what gets built). Links to /store/projects/:slug.
 *
 * Data shape: { id, slug, name, tagline, level, ageMin, ageMax, coverImage, photoCount, price,
 * kitPrice, deliverableCount, milestoneCount } (see usePublicProjects.js).
 */
export default function ProjectCard({ project }) {
  const {
    id, slug, name, tagline, level, ageMin, ageMax, coverImage, price, kitPrice = null,
    deliverableCount = 0, milestoneCount = 0,
  } = project;

  const facts = [
    ageLabel(ageMin, ageMax),
    milestoneCount > 0 && `${milestoneCount} ${milestoneCount === 1 ? 'step' : 'steps'}`,
    deliverableCount > 0 && `${deliverableCount} ${deliverableCount === 1 ? 'thing' : 'things'} to build`,
    kitPrice && 'Kit available',
  ].filter(Boolean);

  return (
    <StoreCardShell
      to={projectPath(slug)}
      image={coverImage}
      photoCount={project.photoCount}
      kicker={['Project', level && LEVEL_LABEL[level]].filter(Boolean).join(' · ').toUpperCase()}
      name={name}
      tagline={tagline || 'A guided build project a learner works through at their own pace.'}
      price={price}
      facts={facts}
      motif={<BuildCircleOutlinedIcon />}
      badge={{ label: 'Lifetime access' }}
      buy={price ? { kind: 'project', item: { id, slug, name, image: coverImage, price, kitPrice } } : null}
    />
  );
}
