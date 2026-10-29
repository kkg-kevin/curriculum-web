/**
 * Where things live in the Store. Projects are sold in the Store alongside the goods (Oct 2026 —
 * they had their own /projects section before), each at /store/projects/<slug>; the old /projects
 * addresses redirect here (routes.jsx and public/.htaccess).
 */
export const storeItemPath = (slug) => `/store/${slug}`;
export const projectPath = (slug) => `/store/projects/${slug}`;

/** The Store with only the projects showing. */
export const STORE_PROJECTS_PATH = '/store?category=projects';
