/**
 * Page width — one place, so the header, every section and the footer line up.
 *
 * Backgrounds and colour bands run edge to edge; the content inside them sits in one centred
 * frame, PAGE_MAX_WIDTH wide including its gutters (about 1400px of content on a large screen).
 * Wider than that and a page built from text, cards and forms is mostly empty space.
 *
 * Wired into every `<Container maxWidth="lg">` (the default) by createAppTheme.js; anything that
 * lays itself out without a Container — the header's Toolbar, the CTA banner — uses these
 * directly.
 */
export const PAGE_MAX_WIDTH = 1536;

/** Side gutter, in theme spacing units per breakpoint: 16 / 24 / 40 / 64px. */
export const PAGE_GUTTER = { xs: 2, sm: 3, lg: 5, xl: 8 };

/** Card grids: one column on phones, then two, three, and four on a large screen. */
export const CARD_GRID_COLUMNS = {
  xs: '1fr',
  sm: 'repeat(2, 1fr)',
  md: 'repeat(3, 1fr)',
  xl: 'repeat(4, 1fr)',
};

/**
 * Extra grid `sx` for a list with only one to three cards: they sit together in the middle at a
 * comfortable width, instead of one small card alone in the corner of a four-column grid. Spread
 * it after the grid's own sx. Four or more cards (or none) need nothing.
 */
export function shortListSx(count) {
  if (!count || count > 3) return {};
  return {
    justifyContent: 'center',
    gridTemplateColumns: {
      xs: '1fr',
      sm: `repeat(${Math.min(count, 2)}, minmax(0, 420px))`,
      md: `repeat(${count}, minmax(0, 420px))`,
    },
  };
}

/** Width of the sticky side panel on detail pages (see components/common/DetailLayout.jsx). */
export const ASIDE_WIDTH = 360;

/** Width of a single centred column — forms and reading pages. */
export const NARROW_COLUMN = 760;

/** Longest comfortable line for a block of running text, however wide the page gets. */
export const PROSE_MAX_WIDTH = '80ch';
