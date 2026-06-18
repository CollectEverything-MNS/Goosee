export const routes = {
  public: {
    home: {
      getHref: (locale: string) => `/${locale}/`,
    },
    account: {
      getHref: (locale: string) => `/${locale}/compte`,
    },
    invoice: {
      getHref: (locale: string, id: string) => `/${locale}/facture/${id}`,
    },
  },
  gooseeAdmin: {
    login: {
      getHref: (locale: string) => `/${locale}/goosee-admin/login`,
    },
    forgotPassword: {
      getHref: (locale: string) => `/${locale}/goosee-admin/forgot-password`,
    },
    dashboard: {
      getHref: (locale: string) => `/${locale}/goosee-admin/dashboard`,
    },
    analytics: {
      getHref: (locale: string) => `/${locale}/goosee-admin/analytics`,
    },
    products: {
      getHref: (locale: string) => `/${locale}/goosee-admin/products`,
    },
    categories: {
      getHref: (locale: string) => `/${locale}/goosee-admin/categories`,
    },
    orders: {
      getHref: (locale: string) => `/${locale}/goosee-admin/orders`,
    },
    counter: {
      getHref: (locale: string) => `/${locale}/goosee-admin/caisse`,
    },
    returnClient: {
      getHref: (locale: string) => `/${locale}/goosee-admin/return-clients`,
    },
    salesHistory: {
      getHref: (locale: string) => `/${locale}/goosee-admin/sales-history`,
    },
    clients: {
      getHref: (locale: string) => `/${locale}/goosee-admin/clients`,
    },
    pages: {
      getHref: (locale: string) => `/${locale}/goosee-admin/pages`,
    },
    pagesCreate: {
      getHref: (locale: string) => `/${locale}/goosee-admin/pages/create`,
    },
    pagesEdit: {
      getHref: (locale: string, id: string) => `/${locale}/goosee-admin/pages/${id}/edit`,
    },
    templates: {
      getHref: (locale: string) => `/${locale}/goosee-admin/templates`,
    },
    menu: {
      getHref: (locale: string) => `/${locale}/goosee-admin/menu`,
    },
    settings: {
      getHref: (locale: string) => `/${locale}/goosee-admin/settings`,
    },
    users: {
      getHref: (locale: string) => `/${locale}/goosee-admin/users`,
    },
    roles: {
      getHref: (locale: string) => `/${locale}/goosee-admin/roles`,
    },
    logs: {
      getHref: (locale: string) => `/${locale}/goosee-admin/logs`,
    },
  },
} as const
