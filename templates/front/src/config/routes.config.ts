export const routes = {
  public: {
    home: {
      getHref: () => "/",
    },
  },
    gooseeAdmin: {
      dashboard: {
        getHref: () => "/goosee-admin",
      },
      products: {
        getHref: () => "/goosee-admin/products",
      },
      categories: {
        getHref: () => "/goosee-admin/categories",
      },
      stock: {
        getHref: () => "/goosee-admin/stocks",
      },
      orders: {
        getHref: () => "/goosee-admin/orders",
      },
      messages: {
        getHref: () => "/goosee-admin/messages",
      },
      salesHistory: {
        getHref: () => "/goosee-admin/sales-history",
      },
      clients: {
        getHref: () => "/goosee-admin/clients",
      },
      theme: {
        getHref: () => "/goosee-admin/theme",
      },
      template: {
        getHref: () => "/goosee-admin/template",
      },
      users: {
        getHref: () => "/goosee-admin/users",
      },
      roles: {
        getHref: () => "/goosee-admin/roles",
      },
  },
} as const
