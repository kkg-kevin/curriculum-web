import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './styles/global.css';

import App from './App.jsx';
import { ColorModeProvider } from './theme/ColorModeProvider.jsx';
import { installPrerenderSignal } from './utils/prerenderSignal.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

installPrerenderSignal(queryClient);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ColorModeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ColorModeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
