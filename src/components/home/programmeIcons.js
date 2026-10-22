import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';

/**
 * The icon for each programme a family can join themselves, by `key` — shared by the home page's
 * programme buttons (Hero.jsx) and the header Enroll button's chooser (GetStartedPage.jsx), so the
 * same programme always wears the same icon.
 */
export const PROGRAMME_ICONS = {
  bootcamps: RocketLaunchIcon,
  homeSchooling: HomeIcon,
  techClubs: GroupsIcon,
};

export const programmeIcon = (key) => PROGRAMME_ICONS[key] || RocketLaunchIcon;
