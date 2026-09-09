/**
 * ⚠️ The Store no longer uses hand-authored content.
 *
 * `/store` and `/store/:slug` now read the live API — `GET /api/public/store`, the designated
 * curriculum admin's shared `inventory` items flipped "For sale" in the portal's Inventory
 * panel. See:
 *   - src/hooks/usePublicStore.js          (the query hooks)
 *   - src/pages/StoreListPage.jsx           (the grid)
 *   - src/pages/StoreItemPage.jsx           (the detail page)
 *   - src/components/cards/StoreItemCard.jsx
 *   - Guide/WEBSITE_INTEGRATION_CONTRACT.md §3.5 / §3.6 (the API shapes)
 *
 * The item-shape doc and the `interestForKind` / `PRICING_IS_PLACEHOLDER` helpers still live in
 * src/content/catalog.js (Projects' static file and the shared PriceTag use them). This file is
 * kept only as a redirect for anyone looking for the old static catalogue.
 */
export { PRICING_IS_PLACEHOLDER } from './catalog.js';
