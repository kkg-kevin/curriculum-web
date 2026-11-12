import { lazy } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import { projectPath, STORE_PROJECTS_PATH } from '../utils/storePaths.js';

// /pathways/<slug>/<stage> → /pathways/<slug>?stage=<stage> (the stage chosen on the pathway's page).
function OldStageAddress() {
  const { slug, stageSlug } = useParams();
  return <Navigate to={`/pathways/${slug}?stage=${encodeURIComponent(stageSlug)}`} replace />;
}

function OldProjectAddress() {
  const { slug } = useParams();
  return <Navigate to={projectPath(slug)} replace />;
}

/**
 * Route table (spec §5). Kept as a plain array so scripts/prerender.js can also
 * reason about the static route list if needed. Detail routes take a :slug.
 *
 * MainLayout + HomePage load eagerly (every visit needs the layout; Home is the
 * most-hit landing target and the LCP path). Everything else is code-split so the
 * initial bundle stays lean (spec §7 — keep the JS bundle small).
 */
const PathwaysListPage = lazy(() => import('../pages/PathwaysListPage.jsx'));
// Becoming an affiliate; /affiliate is where the old private dashboard links land (they now sign in).
const BecomeAffiliatePage = lazy(() => import('../pages/BecomeAffiliatePage.jsx'));
const AffiliateDashboardPage = lazy(() => import('../pages/AffiliateDashboardPage.jsx'));
const PathwayDetailPage = lazy(() => import('../pages/PathwayDetailPage.jsx'));
const DiagnosticPage = lazy(() => import('../pages/DiagnosticPage.jsx'));
const DiagnosticReportPage = lazy(() => import('../pages/DiagnosticReportPage.jsx'));
const BootcampsPage = lazy(() => import('../pages/BootcampsPage.jsx'));
const BootcampDetailPage = lazy(() => import('../pages/BootcampDetailPage.jsx'));
const BootcampEnrollPage = lazy(() => import('../pages/BootcampEnrollPage.jsx'));
const HubDetailPage = lazy(() => import('../pages/HubDetailPage.jsx'));
const EstateTechClubsPage = lazy(() => import('../pages/EstateTechClubsPage.jsx'));
const EstateTechClubPage = lazy(() => import('../pages/EstateTechClubPage.jsx'));
const ClubSignupPage = lazy(() => import('../pages/ClubSignupPage.jsx'));
const CompetitionsPage = lazy(() => import('../pages/CompetitionsPage.jsx'));
const CompetitionDetailPage = lazy(() => import('../pages/CompetitionDetailPage.jsx'));
// General events — showcases, open days (server: modules/general-events/).
const EventsPage = lazy(() => import('../pages/EventsPage.jsx'));
const EventDetailPage = lazy(() => import('../pages/EventDetailPage.jsx'));
const EventRegistrationPage = lazy(() => import('../pages/EventRegistrationPage.jsx'));
const HomeSchoolingPage = lazy(() => import('../pages/HomeSchoolingPage.jsx'));
const HomeSchoolingSignupPage = lazy(() => import('../pages/HomeSchoolingSignupPage.jsx'));
const SchoolsPage = lazy(() => import('../pages/SchoolsPage.jsx'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage.jsx'));
const StoreListPage = lazy(() => import('../pages/StoreListPage.jsx'));
const StoreItemPage = lazy(() => import('../pages/StoreItemPage.jsx'));
const CartPage = lazy(() => import('../pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage.jsx'));
const PayPage = lazy(() => import('../pages/PayPage.jsx'));
const EnrollPage = lazy(() => import('../pages/EnrollPage.jsx'));
const GetStartedPage = lazy(() => import('../pages/GetStartedPage.jsx'));
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
      // A stage's old page (retired Nov 2026 — a pathway's stages are chosen on its own page): open
      // the pathway with that stage chosen. After the fixed diagnostic routes, which outrank it.
      { path: 'pathways/:slug/:stageSlug', element: <OldStageAddress /> },
      // Projects are sold in the Store (Oct 2026); their old addresses lead there. public/.htaccess
      // does the same as real 301s.
      { path: 'projects', element: <Navigate to={STORE_PROJECTS_PATH} replace /> },
      { path: 'projects/:slug', element: <OldProjectAddress /> },
      { path: 'bootcamps', element: <BootcampsPage /> },
      { path: 'bootcamps/:slug', element: <BootcampDetailPage /> },
      { path: 'bootcamps/:slug/enroll', element: <BootcampEnrollPage /> },
      { path: 'bootcamps/:slug/hubs/:hubId', element: <HubDetailPage /> },
      { path: 'competitions', element: <CompetitionsPage /> },
      { path: 'competitions/:slug', element: <CompetitionDetailPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/registration/:token', element: <EventRegistrationPage /> },
      { path: 'events/:slug', element: <EventDetailPage /> },
      { path: 'estate-tech-clubs', element: <EstateTechClubsPage /> },
      { path: 'estate-tech-clubs/:slug', element: <EstateTechClubPage /> },
      { path: 'estate-tech-clubs/:slug/join', element: <ClubSignupPage /> },
      { path: 'home-schooling', element: <HomeSchoolingPage /> },
      { path: 'home-schooling/signup', element: <HomeSchoolingSignupPage /> },
      { path: 'schools', element: <SchoolsPage /> },
      { path: 'store', element: <StoreListPage /> },
      { path: 'store/:slug', element: <StoreItemPage /> },
      { path: 'store/projects/:slug', element: <ProjectDetailPage /> },
      // Buying: the cart, its checkout, and paying an order later from its email link.
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'pay/:token', element: <PayPage /> },
      // /quarky was the single-product page before the Store existed. Its item's slug is set in
      // the portal's Inventory and can change, so this lands on the Store itself rather than a
      // guessed /store/<slug> that 404s. public/.htaccess does the same as a real 301.
      { path: 'quarky', element: <Navigate to="/store" replace /> },
      { path: 'enroll', element: <EnrollPage /> },
      // The header's Enroll button: the programmes a family can enrol in themselves.
      { path: 'get-started', element: <GetStartedPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <LegalPage doc="privacy" /> },
      { path: 'terms', element: <LegalPage doc="terms" /> },
      { path: 'become-an-affiliate', element: <BecomeAffiliatePage /> },
      { path: 'affiliate', element: <AffiliateDashboardPage /> },
      { path: 'affiliate-terms', element: <LegalPage doc="affiliate" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
