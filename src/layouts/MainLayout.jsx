import { useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import ThemeColorMeta from '../components/common/ThemeColorMeta.jsx';
import { LoadingBlock } from '../components/common/StateViews.jsx';

/** Header + Footer + routed content. Also resets scroll on navigation. */
export default function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ThemeColorMeta />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <Box component="main" id="main-content" sx={{ flexGrow: 1 }}>
        {/* Fallback covers the brief moment a code-split page chunk loads. */}
        <Suspense fallback={<LoadingBlock label="Loading…" />}>
          <Outlet />
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}
