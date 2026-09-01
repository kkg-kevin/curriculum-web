# Brand & media assets

Files in `public/` are copied verbatim into `dist/` at build and served from the
site root. (This note lives at the project root so it doesn't ship.)

## Present in `public/`

| File | Status | Notes |
|---|---|---|
| `hero-students.png` | Real, **unused** | 1360×768 illustration of two students with devices. Candidate for the Home hero background or a cropped OG image. `src/components/home/Hero.jsx` currently uses a CSS gradient. Ships to the site even though nothing references it — remove it from `public/` if you don't want that. |
| `logo-placeholder.svg` | Placeholder | Simple "D" mark. SVG favicon in `index.html`. `src/components/common/Logo.jsx` renders a *text* logo, not this file. |
| `robots.txt` | Generated | The build overwrites it with the right absolute sitemap URL. |
| `.htaccess` | Real | Apache routing / redirects / caching for Truehost. Do not remove. |

## Still needed before launch (spec §9 item 5)

| File | Spec | Wire it into |
|---|---|---|
| `public/favicon.ico` | 16/32/48px multi-size `.ico` | already linked in `index.html` |
| `public/og-default.png` | 1200×630, < 300 KB | `index.html` + `src/components/seo/SeoHead.jsx` — the default social-share image |
| `public/logo.svg` | real brand logo (wordmark or icon) | `src/components/common/Logo.jsx` and the favicon links in `index.html` |

Until `og-default.png` exists, shared links (WhatsApp, Facebook, LinkedIn) show
no preview image.
