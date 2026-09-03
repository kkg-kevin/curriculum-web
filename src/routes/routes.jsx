import { lazy } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';

/**
 * Route table (spec §5). Kept as a plain array so scripts/prerender.js can also
 * reason about the static route list if needed. Detail routes take a :slug.
 *
 * MainLayout + HomePage load eagerly (every visit needs the layout; Home is the
 * most-hit landing target and the LCP path). Everything else is code-split so the
 * initial bundle stays lean (spec §7 — keep the JS bundle small).
 */
const BootcampsListPage = lazy(() => import('../pages/BootcampsListPage.jsx'));
const BootcampDetailPage = lazy(() => import('../pages/BootcampDetailPage.jsx'));
const ProjectsListPage = lazy(() => import('../pages/ProjectsListPage.jsx'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage.jsx'));
const PathwaysListPage = lazy(() => import('../pages/PathwaysListPage.jsx'));
const PathwayDetailPage = lazy(() => import('../pages/PathwayDetailPage.jsx'));
const CompetitionsPage = lazy(() => import('../pages/CompetitionsPage.jsx'));
const QuarkyPage = lazy(() => import('../pages/QuarkyPage.jsx'));
const EnrollPage = lazy(() => import('../pages/EnrollPage.jsx'));
const ContactPage = lazy(() => import('../pages/ContactPage.jsx'));
const AboutPage = lazy(() => import('../pages/AboutPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

export const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'bootcamps', element: <BootcampsListPage /> },
      { path: 'bootcamps/:slug', element: <BootcampDetailPage /> },
      { path: 'projects', element: <ProjectsListPage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      { path: 'pathways', element: <PathwaysListPage /> },
      { path: 'pathways/:slug', element: <PathwayDetailPage /> },
      { path: 'competitions', element: <CompetitionsPage /> },
      { path: 'quarky', element: <QuarkyPage /> },
      { path: 'enroll', element: <EnrollPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
