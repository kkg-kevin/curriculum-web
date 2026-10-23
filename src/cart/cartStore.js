import { useSyncExternalStore } from 'react';

/**
 * The shopping cart: Store items and Projects, kept in this browser (localStorage) so it survives
 * a refresh and stays in step across tabs. No provider needed — any component reads it with
 * useCart(). Prices here are only for showing; the server reads the real ones when the order is
 * placed (server: modules/orders/orders.service.js).
 *
 * A line: { key, type: 'store_item' | 'project', id, slug, name, image, unitPrice, currency,
 *           quantity, withKit?, kitPrice? }
 * A project is always quantity 1 (it's for one child); its materials kit is `withKit`.
 */

const STORAGE_KEY = 'digifunzi:cart';
const MAX_QTY = 20;
const EMPTY = [];

let lines = EMPTY;
let loaded = false;
const listeners = new Set();

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && l.key && l.id && l.type) : [];
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  lines = read();
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    lines = read();
    listeners.forEach((fn) => fn());
  });
}

function commit(next) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage blocked: the cart still works for this page view.
  }
  listeners.forEach((fn) => fn());
}

const keyOf = (type, id) => `${type}:${id}`;

export const cart = {
  add(item) {
    ensureLoaded();
    const key = keyOf(item.type, item.id);
    const existing = lines.find((l) => l.key === key);
    if (existing) {
      commit(lines.map((l) => (l.key === key
        ? { ...l, ...item, key, quantity: item.type === 'project' ? 1 : Math.min(MAX_QTY, l.quantity + (item.quantity || 1)), withKit: item.type === 'project' ? Boolean(item.withKit || l.withKit) : undefined }
        : l)));
    } else {
      commit([...lines, { ...item, key, quantity: item.type === 'project' ? 1 : Math.min(MAX_QTY, Math.max(1, item.quantity || 1)) }]);
    }
  },
  setQuantity(key, quantity) {
    ensureLoaded();
    const q = Math.min(MAX_QTY, Math.max(1, Number(quantity) || 1));
    commit(lines.map((l) => (l.key === key && l.type === 'store_item' ? { ...l, quantity: q } : l)));
  },
  setKit(key, withKit) {
    ensureLoaded();
    commit(lines.map((l) => (l.key === key ? { ...l, withKit: Boolean(withKit) } : l)));
  },
  remove(key) {
    ensureLoaded();
    commit(lines.filter((l) => l.key !== key));
  },
  clear() {
    ensureLoaded();
    commit([]);
  },
};

function subscribe(fn) {
  ensureLoaded();
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const getSnapshot = () => {
  ensureLoaded();
  return lines;
};

/** The cart's lines, with totals. Re-renders when the cart changes (here or in another tab). */
export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const lineTotal = (l) => (Number(l.unitPrice) || 0) * l.quantity + (l.type === 'project' && l.withKit ? Number(l.kitPrice) || 0 : 0);
  return {
    lines: current,
    count: current.reduce((n, l) => n + l.quantity, 0),
    subtotal: current.reduce((sum, l) => sum + lineTotal(l), 0),
    currency: current[0]?.currency || 'KES',
    hasProjects: current.some((l) => l.type === 'project'),
    hasPhysical: current.some((l) => l.type === 'store_item' || l.withKit),
    lineTotal,
  };
}
