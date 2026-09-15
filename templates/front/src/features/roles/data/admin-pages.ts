export type AdminPageGroup = {
  group: string;
  pages: { key: string; label: string }[];
};

export const ADMIN_PAGE_GROUPS: AdminPageGroup[] = [
  {
    group: 'Général',
    pages: [{ key: 'dashboard', label: 'Tableau de bord' }],
  },
  {
    group: 'Accès',
    pages: [
      { key: 'users', label: 'Utilisateurs' },
      { key: 'roles', label: 'Rôles' },
    ],
  },
  {
    group: 'Clients',
    pages: [
      { key: 'clients', label: 'Clients' },
      { key: 'return-clients', label: 'Retours clients' },
      // Habilitation d'action, sans ecran dedie : elle ouvre l'export et
      // l'effacement RGPD depuis la fiche client.
      { key: 'rgpd', label: 'Données personnelles (RGPD)' },
    ],
  },
  {
    group: 'Catalogue',
    pages: [
      { key: 'products', label: 'Produits' },
      { key: 'categories', label: 'Catégories' },
      { key: 'stock', label: 'Stock' },
    ],
  },
  {
    group: 'Ventes',
    pages: [
      { key: 'orders', label: 'Commandes' },
      { key: 'sales-history', label: 'Historique des ventes' },
    ],
  },
  {
    group: 'Personnalisation',
    pages: [
      { key: 'pages', label: 'Pages' },
      { key: 'menu', label: 'Menus' },
      { key: 'settings', label: 'Paramètres' },
      { key: 'templates', label: 'Templates' },
    ],
  },
];

export const ALL_PAGE_KEYS = ADMIN_PAGE_GROUPS.flatMap((g) => g.pages.map((p) => p.key));
