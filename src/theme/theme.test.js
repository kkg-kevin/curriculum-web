import { describe, it, expect } from 'vitest';
import { buildPalette } from './palette.js';
import createAppTheme from './createAppTheme.js';
import { resolveMode } from './colorMode.js';

describe('buildPalette', () => {
  it('returns a light palette with all required semantic keys', () => {
    const p = buildPalette('light');
    expect(p.mode).toBe('light');
    for (const key of ['background', 'text', 'divider', 'primary', 'secondary', 'surface', 'brand']) {
      expect(p[key], key).toBeTruthy();
    }
    expect(p.surface.subtle).toBeTruthy();
    expect(p.surface.inverse).toBeTruthy();
    expect(p.brand.blue[500]).toMatch(/^#/);
  });

  it('returns a dark palette with the same shape', () => {
    const light = buildPalette('light');
    const dark = buildPalette('dark');
    expect(dark.mode).toBe('dark');
    // same key set on `surface`
    expect(Object.keys(dark.surface).sort()).toEqual(Object.keys(light.surface).sort());
    // backgrounds actually differ
    expect(dark.background.default).not.toBe(light.background.default);
  });
});

describe('createAppTheme', () => {
  it('builds a usable MUI theme for both modes', () => {
    for (const mode of ['light', 'dark']) {
      const t = createAppTheme(mode);
      expect(t.palette.mode).toBe(mode);
      expect(t.typography.fontFamily).toContain('Inter');
      expect(t.palette.surface.subtle).toBeTruthy();
      // spacing/shape sanity
      expect(t.shape.borderRadius).toBe(10);
    }
  });
});

describe('resolveMode', () => {
  it('passes explicit prefs through', () => {
    expect(resolveMode('light')).toBe('light');
    expect(resolveMode('dark')).toBe('dark');
  });
  it('resolves "system" to a concrete mode', () => {
    expect(['light', 'dark']).toContain(resolveMode('system'));
  });
});
