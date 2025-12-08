export const routes = {
  public: {
    home: {
      getHref: (locale: string) => `/${locale}/`,
    },
  },
  gooseeAdmin: {
    login: {
      getHref: (locale: string) => `/${locale}/goosee-admin/login`,
    },
    dashboard: {
      getHref: (locale: string) => `/${locale}/goosee-admin/dashboard`,
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
    templates: {
      getHref: (locale: string) => `/${locale}/goosee-admin/templates`,
    },
    users: {
      getHref: (locale: string) => `/${locale}/goosee-admin/users`,
    },
    roles: {
      getHref: (locale: string) => `/${locale}/goosee-admin/roles`,
    },
  },
} as const
