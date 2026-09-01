import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';

/**
 * Keeps <meta name="theme-color"> in step with the active colour mode so the
 * mobile browser chrome matches the page. Rendered once in MainLayout.
 *
 * Prerendered HTML keeps whatever index.html ships; this updates it on the
 * client after hydration.
 */
export default function ThemeColorMeta() {
  const theme = useTheme();
  return (
    <Helmet>
      <meta name="theme-color" content={theme.palette.background.default} />
    </Helmet>
  );
}
