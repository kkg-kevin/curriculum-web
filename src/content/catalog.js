/**
 * Shared bits for everything Digifunzi sells — Projects (src/content/projects.js)
 * and the Store's physical goods (src/content/store.js). Both are hand-authored
 * static catalogues (Option A) with no backing API yet; when the curriculum
 * system grows a real commerce API, these content files are the only things that
 * change.
 *
 * ⚠️ EVERYTHING IN THOSE FILES IS PLACEHOLDER — names, copy, images and
 * (especially) prices. `PRICING_IS_PLACEHOLDER` gates the "indicative price" UI
 * treatment shown on every price until real pricing + checkout are live. Do not
 * treat any number as a quote.
 *
 * ---- the item shape (both catalogues share it) ------------------------------
 * {
 *   slug        string   — URL id, kept stable across renames where possible
 *   name        string
 *   kind        'project' | 'kit' | 'bundle' | 'accessory'
 *   nature      'physical' | 'digital'   — physical ships; digital = buy access
 *   tagline     string   — one line under the name
 *   summary     string   — 1–2 sentences for cards
 *   description string   — full paragraph for the detail page
 *   price {
 *     amount    number   — in the currency's major unit (KES shillings)
 *     currency  string   — ISO 4217, 'KES'
 *     unit      string|null — 'each', 'per learner', 'one-off', …
 *     compareAt number|null — optional "was" price
 *   }
 *   priceNote   string   — bulk / school / licensing caveat under the price
 *   status      'available' | 'preorder' | 'coming-soon'
 *   badge       string|null — short marketing tag ('Most popular', 'New')
 *   image       string|null — SmartImage src (absolute URL / data: / null)
 *   icon        string|null — glyph name for the no-photo visual
 *                             (robot|arm|chip|puzzle|route|sensor|data|home|box|cable)
 *   gallery     string[]    — extra images, same rules
 *   highlights  string[]    — bullet selling points
 *   includes    string[]    — "what you get" (lessons, parts, access, …)
 *   specs       {label,value}[] — spec / details table
 *   audience    string|null — "Ages 8–13", "Whole class", …
 *   usedIn      string[]    — course / pathway names this supports
 *   faqs        {q,a}[]
 *
 *   // projects only:
 *   level       'beginner' | 'intermediate' | 'advanced'
 *   track       string   — the pathway/subject family ('Robotics', 'Data & AI', …)
 * }
 */

/** Flip to false the day real prices + a real checkout go live. */
export const PRICING_IS_PLACEHOLDER = true;

/**
 * Map an item's `kind` onto the lead API's `interestedIn` enum, which only
 * accepts bootcamp | project | quarky | general (WEBSITE_INTEGRATION_CONTRACT
 * §4.1). The exact item still travels in `referenceId`, so staff see precisely
 * what was enquired about regardless of this bucket.
 */
export function interestForKind(kind, slug) {
  if (kind === 'project') return 'project';
  if (kind === 'kit' || slug === 'quarky') return 'quarky';
  return 'general';
}
