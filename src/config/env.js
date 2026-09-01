/**
 * Runtime environment access for the app (browser bundle only).
 * Build scripts read process.env directly instead.
 */
import { FALLBACK_SITE_URL } from './site.js';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const SITE_URL = (import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, '');

export const IS_DEV = import.meta.env.DEV;
