# Theming — light & dark mode

The site supports **light**, **dark**, and **system** (follow-OS) colour modes.
It's built so **any new page or component is theme-correct with zero extra
work** — as long as you follow the one rule below.

---

## The one rule

**Never write a raw colour in a component.** No hex, no `rgb()`, no `grey.500`.
Always reference a semantic theme token.

```jsx
// ❌ never
<Box sx={{ bgcolor: '#F5F7FA', color: '#1A2027', borderColor: '#e0e0e0' }} />
<Box sx={{ bgcolor: 'grey.50' }} />

// ✅ always
<Box sx={{ bgcolor: 'background.paper', color: 'text.primary', borderColor: 'divider' }} />
<Box sx={{ bgcolor: 'surface.subtle' }} />
```

Every token resolves to the right value per mode automatically.

---

## Where colours live

`src/theme/palette.js` — **the only file with hex values.** Two functions'-worth
of tokens, one set for light, one for dark. A rebrand = edit the `BLUE` / `ORANGE`
scales here, nothing else.

`src/theme/createAppTheme.js` — builds the full MUI theme (typography, shape,
component overrides) for a given mode. Overrides here apply to both modes.

`src/theme/colorMode.js` — preference storage (`localStorage`), system detection,
and the no-flash boot snippet (mirrored inline in `index.html` — keep in sync).

`src/theme/ColorModeProvider.jsx` — the provider (wraps the app in `main.jsx`).
Exposes `useColorMode()`.

---

## Token reference

### Standard MUI tokens (use these first)

| Token | Use for |
|---|---|
| `background.default` | the page background |
| `background.paper` | cards, panels, the header, sticky sidebars |
| `text.primary` / `text.secondary` / `text.disabled` | body text |
| `divider` | borders, hairlines, outlines |
| `primary.main` / `.light` / `.dark` / `.contrastText` | brand blue, buttons, links |
| `secondary.*` | brand orange, accents |
| `success` / `error` / `warning` / `info` `.main` etc. | status colours |
| `action.hover` / `action.selected` | hover/selected backgrounds |

### Custom semantic tokens (this project)

| Token | Use for |
|---|---|
| `surface.subtle` | a faint tinted band behind a page header or an alternating section (was `grey.50`) |
| `surface.raised` | a card sitting *on* `surface.subtle` |
| `surface.inverse` | a deliberately dark band in **both** modes (the footer) |
| `surface.inverseText` / `surface.inverseTextDim` / `surface.inverseBorder` | text & borders on `surface.inverse` |
| `surface.heroFrom` / `heroVia` / `heroTo` | the 3-stop hero gradient |
| `surface.imageFrom` / `imageTo` / `imagePlaceholder` | `SmartImage` fallback wash |
| `brand.blue[50..900]` / `brand.orange[50..900]` | raw brand scales, for gradients/marks that must not invert (the logo tile) |

Access custom tokens in `sx` via the theme callback:

```jsx
<Box sx={{ bgcolor: 'surface.subtle' }} />                       // shorthand works
<Box sx={{ background: (t) => `linear-gradient(${t.palette.surface.heroFrom}, ${t.palette.surface.heroTo})` }} />
```

### Section helper

Prefer `<Section tone="...">` over a raw background:

```jsx
<Section>            {/* transparent — page bg shows through */}
<Section tone="subtle">    {/* surface.subtle band */}
<Section tone="primary">   {/* brand band, primary.contrastText */}
<Section tone="inverse">   {/* dark band both modes */}
```

---

## Building a new feature — checklist

- [ ] Backgrounds: `background.default` / `background.paper` / `surface.*` — never `#fff`, never `grey.*`.
- [ ] Text: `text.primary` / `text.secondary` — never `#000` / `grey.900`.
- [ ] Borders: `borderColor: 'divider'`.
- [ ] Brand colour: `primary.*` / `secondary.*`.
- [ ] A gradient or one-off: pull stops from `theme.palette.surface.*` or `theme.palette.brand.*` via `sx={{ ... (t) => ... }}`.
- [ ] Use MUI components (`Card`, `Paper`, `Chip`, `Alert`, `TextField`) — they're already overridden for both modes.
- [ ] If you add an image/illustration, provide a version that reads on both grounds, or wrap it so it sits on `background.paper`.
- [ ] Test both modes: header toggle → Light / Dark / System.

If you only used tokens, there is nothing else to do. No dark-mode CSS, no
conditionals.

---

## The colour-mode control

`src/components/common/ColorModeToggle.jsx` — cycles **Light → Dark → System**.
In the desktop header as an icon button, in the mobile menu as a labelled row.

`useColorMode()` gives you `{ pref, mode, setPref, toggle, cycle }`:
- `pref` — `'light' | 'dark' | 'system'` (what the user chose)
- `mode` — `'light' | 'dark'` (what's actually rendering)
- `setPref(next)` — set explicitly
- `toggle()` — flip light/dark
- `cycle()` — light → dark → system → light

Preference persists in `localStorage` (`digifunzi-color-mode`), syncs across
tabs, and follows the OS while set to `system`.

---

## Prerendering / SEO

- Prerendered HTML (`scripts/prerender.js`) is always captured in **light mode**
  (deterministic). The client switches to the visitor's real preference on
  hydration.
- The inline boot snippet in `index.html` sets `<html data-color-mode>` and a
  background colour **before first paint**, so a dark-mode visitor doesn't get a
  white flash.
- `<meta name="theme-color">` tracks the active mode via
  `src/components/common/ThemeColorMeta.jsx`.

---

## Don't

- Don't add `@media (prefers-color-scheme: dark)` blocks in component CSS — the
  theme handles it.
- Don't read `mode` to branch styles unless it's genuinely unavoidable (a
  third-party embed, a raster image swap). Tokens cover ~everything.
- Don't hard-code a colour "just for now." That's the one thing that breaks a
  mode.
