import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createAppTheme from './createAppTheme.js';
import {
  readStoredPref,
  writeStoredPref,
  resolveMode,
  getSystemMode,
} from './colorMode.js';

/**
 * App-wide colour mode. Wrap the app once (in main.jsx). Anything below can call
 * useColorMode() to read the current preference / resolved mode and change it.
 *
 * Future features need zero theme wiring: build with semantic tokens
 * (see THEME.md) and they inherit light + dark automatically.
 */

const ColorModeContext = createContext({
  pref: 'system', // 'light' | 'dark' | 'system'
  mode: 'light', // resolved: 'light' | 'dark'
  setPref: () => {},
  toggle: () => {},
  cycle: () => {},
});

export function ColorModeProvider({ children }) {
  const [pref, setPrefState] = useState(() => readStoredPref());
  const [systemMode, setSystemMode] = useState(() => getSystemMode());

  // Follow the OS while pref === 'system'.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemMode(mq.matches ? 'dark' : 'light');
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const mode = pref === 'system' ? systemMode : pref;

  // Keep <html> attributes in sync (the boot snippet set the initial value).
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-mode', mode);
    root.style.colorScheme = mode;
  }, [mode]);

  // Sync across tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key && e.key !== 'digifunzi-color-mode') return;
      setPrefState(readStoredPref());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPref = useCallback((next) => {
    setPrefState(next);
    writeStoredPref(next);
  }, []);

  // Simple toggle: flips the *resolved* light/dark (leaves 'system' behind).
  const toggle = useCallback(() => {
    setPref(resolveMode(readStoredPref()) === 'dark' ? 'light' : 'dark');
  }, [setPref]);

  // Cycle light -> dark -> system -> light (for a 3-state control).
  const cycle = useCallback(() => {
    const order = ['light', 'dark', 'system'];
    setPref(order[(order.indexOf(readStoredPref()) + 1) % order.length]);
  }, [setPref]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({ pref, mode, setPref, toggle, cycle }),
    [pref, mode, setPref, toggle, cycle],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
