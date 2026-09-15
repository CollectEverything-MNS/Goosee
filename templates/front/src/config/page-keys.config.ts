/**
 * Maps admin route segments to their corresponding pageKey for permission checking.
 * The key is the URL segment after /goosee-admin/, the value is the pageKey from the roles system.
 */
export const ROUTE_PAGE_KEY_MAP: Record<string, string> = {
  dashboard: 'dashboard',
  analytics: 'analytics',
  users: 'users',
  roles: 'roles',
  logs: 'logs',
  clients: 'clients',
  'return-clients': 'return-clients',
  products: 'products',
  categories: 'categories',
  stock: 'stock',
  orders: 'orders',
  caisse: 'orders',
  'sales-history': 'sales-history',
  pages: 'pages',
  menu: 'menu',
  settings: 'settings',
  templates: 'templates',
  documentation: 'dashboard',
};

/**
 * Extracts the pageKey from an admin pathname.
 * E.g. /fr/goosee-admin/pages/create -> 'pages'
 */
export function getPageKeyFromPathname(pathname: string): string | null {
  const match = pathname.match(/\/goosee-admin\/([^/]+)/);
  if (!match) return null;
  const segment = match[1];
  return ROUTE_PAGE_KEY_MAP[segment] ?? null;
}
