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
const HubDetailPage = lazy(() => import('../pages/HubDetailPage.jsx'));
const CompetitionsPage = lazy(() => import('../pages/CompetitionsPage.jsx'));
const CompetitionDetailPage = lazy(() => import('../pages/CompetitionDetailPage.jsx'));
const HomeSchoolingPage = lazy(() => import('../pages/HomeSchoolingPage.jsx'));
const HomeSchoolingSignupPage = lazy(() => import('../pages/HomeSchoolingSignupPage.jsx'));
const ProjectsListPage = lazy(() => import('../pages/ProjectsListPage.jsx'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage.jsx'));
const StoreListPage = lazy(() => import('../pages/StoreListPage.jsx'));
const StoreItemPage = lazy(() => import('../pages/StoreItemPage.jsx'));
const EnrollPage = lazy(() => import('../pages/EnrollPage.jsx'));
const ContactPage = lazy(() => import('../pages/ContactPage.jsx'));
const AboutPage = lazy(() => import('../pages/AboutPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));
// The page and its two documents (content/legal.js) travel together, off the main bundle.
const LegalPage = lazy(() => import('../pages/LegalPage.jsx'));

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
      { path: 'bootcamps/:slug/hubs/:hubId', element: <HubDetailPage /> },
      { path: 'competitions', element: <CompetitionsPage /> },
      { path: 'competitions/:slug', element: <CompetitionDetailPage /> },
      { path: 'home-schooling', element: <HomeSchoolingPage /> },
      { path: 'home-schooling/signup', element: <HomeSchoolingSignupPage /> },
      { path: 'store', element: <StoreListPage /> },
      { path: 'store/:slug', element: <StoreItemPage /> },
      // /quarky was the single-product page before the Store existed. Its item's slug is set in
      // the portal's Inventory and can change, so this lands on the Store itself rather than a
      // guessed /store/<slug> that 404s. public/.htaccess does the same as a real 301.
      { path: 'quarky', element: <Navigate to="/store" replace /> },
      { path: 'enroll', element: <EnrollPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <LegalPage doc="privacy" /> },
      { path: 'terms', element: <LegalPage doc="terms" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
