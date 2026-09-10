import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
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
const PathwaysListPage = lazy(() => import('../pages/PathwaysListPage.jsx'));
const PathwayDetailPage = lazy(() => import('../pages/PathwayDetailPage.jsx'));
const DiagnosticPage = lazy(() => import('../pages/DiagnosticPage.jsx'));
const DiagnosticReportPage = lazy(() => import('../pages/DiagnosticReportPage.jsx'));
const BootcampsPage = lazy(() => import('../pages/BootcampsPage.jsx'));
const BootcampDetailPage = lazy(() => import('../pages/BootcampDetailPage.jsx'));
const CompetitionsPage = lazy(() => import('../pages/CompetitionsPage.jsx'));
const CompetitionDetailPage = lazy(() => import('../pages/CompetitionDetailPage.jsx'));
const ProjectsListPage = lazy(() => import('../pages/ProjectsListPage.jsx'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage.jsx'));
const StoreListPage = lazy(() => import('../pages/StoreListPage.jsx'));
const StoreItemPage = lazy(() => import('../pages/StoreItemPage.jsx'));
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
      { path: 'pathways', element: <PathwaysListPage /> },
      { path: 'pathways/:slug', element: <PathwayDetailPage /> },
      { path: 'pathways/:slug/diagnostic', element: <DiagnosticPage /> },
      { path: 'pathways/:slug/diagnostic/report/:attemptId', element: <DiagnosticReportPage /> },
      { path: 'projects', element: <ProjectsListPage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      { path: 'bootcamps', element: <BootcampsPage /> },
      { path: 'bootcamps/:slug', element: <BootcampDetailPage /> },
      { path: 'competitions', element: <CompetitionsPage /> },
      { path: 'competitions/:slug', element: <CompetitionDetailPage /> },
      { path: 'store', element: <StoreListPage /> },
      { path: 'store/:slug', element: <StoreItemPage /> },
      // /quarky was the single-product page before the Store existed.
      { path: 'quarky', element: <Navigate to="/store/quarky" replace /> },
      { path: 'enroll', element: <EnrollPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
