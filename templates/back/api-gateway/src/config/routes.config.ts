const authBasePath = '/auth';
const usersBasePath = '/users';
const rolesBasePath = '/roles';
const logsBasePath = '/logs';
const uploadBasePath = '/upload';
const productsBasePath = '/products';
const categoriesBasePath = '/categories';
const tagsBasePath = '/tags';
const ordersBasePath = '/orders';
const cartBasePath = '/cart';
const paymentsBasePath = '/payments';
const ticketsBasePath = '/tickets';
const stockBasePath = '/stock';
const assistantBasePath = '/assistant';

export const routesConfig = {
  upload: {
    root: uploadBasePath,
    file: {
      path: uploadBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${uploadBasePath}`,
    },
  },
  auth: {
    root: authBasePath,
    login: {
      path: `${authBasePath}/login`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/login`,
    },
    register: {
      path: `${authBasePath}/register`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/register`,
    },
    verifyEmail: {
      path: `${authBasePath}/verify-email`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/verify-email`,
    },
    resendVerificationEmail: {
      path: `${authBasePath}/resend-verification-email`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/resend-verification-email`,
    },
    changePassword: {
      path: `${authBasePath}/change-password`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/change-password`,
    },
    forgetPasswordRequest: {
      path: `${authBasePath}/forget-password-request`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/forget-password-request`,
    },
    forgetPasswordConfirm: {
      path: `${authBasePath}/forget-password-confirm`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/forget-password-confirm`,
    },
    token: {
      revoke: {
        path: `${authBasePath}/revoke-token`,
        link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/revoke-token`,
      },
      refresh: {
        path: `${authBasePath}/refresh-token`,
        link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/refresh-token`,
      },
    },
  },

  user: {
    createUser: {
      path: `${usersBasePath}/create-user`,
      link: (serviceUrl: string) => `${serviceUrl}${usersBasePath}/create-user`,
    },

    getUser: {
      path: `${usersBasePath}/get-user/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}/users/${id}`,
    },

    getUsers: {
      path: `${usersBasePath}`,
      link: (serviceUrl: string) => `${serviceUrl}${usersBasePath}`,
    },

    updateUser: {
      path: `${usersBasePath}/update-user/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}/users/${id}`,
    },

    deleteUser: {
      path: `${usersBasePath}/delete-user/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}/users/${id}`,
    },

    listCustomers: {
      path: `${usersBasePath}/customers`,
      link: (serviceUrl: string) => `${serviceUrl}${usersBasePath}/customers`,
    },

    listAdmins: {
      path: `${usersBasePath}/admins`,
      link: (serviceUrl: string) => `${serviceUrl}${usersBasePath}/admins`,
    },
  },

  role: {
    createRole: {
      path: `${rolesBasePath}`,
      link: (serviceUrl: string) => `${serviceUrl}${rolesBasePath}`,
    },
    listRoles: {
      path: `${rolesBasePath}`,
      link: (serviceUrl: string) => `${serviceUrl}${rolesBasePath}`,
    },
    getRole: {
      path: `${rolesBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${rolesBasePath}/${id}`,
    },
    updateRole: {
      path: `${rolesBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${rolesBasePath}/${id}`,
    },
    deleteRole: {
      path: `${rolesBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${rolesBasePath}/${id}`,
    },
  },

  ticket: {
    createTicket: {
      path: `${ticketsBasePath}`,
      link: (serviceUrl: string) => `${serviceUrl}${ticketsBasePath}`,
    },
    listTickets: {
      path: `${ticketsBasePath}`,
      link: (serviceUrl: string) => `${serviceUrl}${ticketsBasePath}`,
    },
    assignTicket: {
      path: `${ticketsBasePath}/:id/assign`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${ticketsBasePath}/${id}/assign`,
    },
    updateTicketStatus: {
      path: `${ticketsBasePath}/:id/status`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${ticketsBasePath}/${id}/status`,
    },
    closeTicket: {
      path: `${ticketsBasePath}/:id/close`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${ticketsBasePath}/${id}/close`,
    },
    deleteTicket: {
      path: `${ticketsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${ticketsBasePath}/${id}`,
    },
    getTicket: {
      path: `${ticketsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${ticketsBasePath}/${id}`,
    },
  },

  log: {
    listLogs: {
      path: `${logsBasePath}`,
      link: (serviceUrl: string) => `${serviceUrl}${logsBasePath}`,
    },
  },
  product: {
    listProducts: {
      path: productsBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${productsBasePath}`,
    },
    getProduct: {
      path: `${productsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}`,
    },
    createProduct: {
      path: productsBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${productsBasePath}`,
    },
    updateProduct: {
      path: `${productsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}`,
    },
    deleteProduct: {
      path: `${productsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}`,
    },
    // Images
    getImages: {
      path: `${productsBasePath}/:id/images`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}/images`,
    },
    addImage: {
      path: `${productsBasePath}/:id/images`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}/images`,
    },
    deleteImage: {
      path: `${productsBasePath}/:id/images/:imageId`,
      link: (serviceUrl: string, id: string, imageId: string) =>
        `${serviceUrl}${productsBasePath}/${id}/images/${imageId}`,
    },
    setMainImage: {
      path: `${productsBasePath}/:id/images/:imageId/main`,
      link: (serviceUrl: string, id: string, imageId: string) =>
        `${serviceUrl}${productsBasePath}/${id}/images/${imageId}/main`,
    },
    // Tags produit
    listProductTags: {
      path: `${productsBasePath}/:id/tags`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}/tags`,
    },
    addProductTag: {
      path: `${productsBasePath}/:id/tags`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}/tags`,
    },
    deleteProductTag: {
      path: `${productsBasePath}/:id/tags/:tagId`,
      link: (serviceUrl: string, id: string, tagId: string) =>
        `${serviceUrl}${productsBasePath}/${id}/tags/${tagId}`,
    },
    // Attributs produit
    listProductAttributes: {
      path: `${productsBasePath}/:id/attributes`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}/attributes`,
    },
    getProductAttribute: {
      path: `${productsBasePath}/:id/attributes/:attributeId`,
      link: (serviceUrl: string, id: string, attributeId: string) =>
        `${serviceUrl}${productsBasePath}/${id}/attributes/${attributeId}`,
    },
    addProductAttribute: {
      path: `${productsBasePath}/:id/attributes`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${productsBasePath}/${id}/attributes`,
    },
    deleteProductAttribute: {
      path: `${productsBasePath}/:id/attributes/:attributeId`,
      link: (serviceUrl: string, id: string, attributeId: string) =>
        `${serviceUrl}${productsBasePath}/${id}/attributes/${attributeId}`,
    },
  },

  category: {
    listCategories: {
      path: categoriesBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${categoriesBasePath}`,
    },
    getCategory: {
      path: `${categoriesBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${categoriesBasePath}/${id}`,
    },
    createCategory: {
      path: categoriesBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${categoriesBasePath}`,
    },
    updateCategory: {
      path: `${categoriesBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${categoriesBasePath}/${id}`,
    },
    deleteCategory: {
      path: `${categoriesBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${categoriesBasePath}/${id}`,
    },
    listProductsByCategory: {
      path: `${categoriesBasePath}/:id/products`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${categoriesBasePath}/${id}/products`,
    },
  },

  payment: {
    createPayment: {
      path: paymentsBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${paymentsBasePath}`,
    },
    webhook: {
      path: `${paymentsBasePath}/webhook`,
      link: (serviceUrl: string) => `${serviceUrl}${paymentsBasePath}/webhook`,
    },
    getPayment: {
      path: `${paymentsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${paymentsBasePath}/${id}`,
    },
  },

  cart: {
    getCart: {
      path: `${cartBasePath}/:sessionKey`,
      link: (serviceUrl: string, sessionKey: string) =>
        `${serviceUrl}${cartBasePath}/${sessionKey}`,
    },
    addItem: {
      path: `${cartBasePath}/:sessionKey/items`,
      link: (serviceUrl: string, sessionKey: string) =>
        `${serviceUrl}${cartBasePath}/${sessionKey}/items`,
    },
    updateItem: {
      path: `${cartBasePath}/:sessionKey/items/:productId`,
      link: (serviceUrl: string, sessionKey: string, productId: string) =>
        `${serviceUrl}${cartBasePath}/${sessionKey}/items/${productId}`,
    },
    removeItem: {
      path: `${cartBasePath}/:sessionKey/items/:productId`,
      link: (serviceUrl: string, sessionKey: string, productId: string) =>
        `${serviceUrl}${cartBasePath}/${sessionKey}/items/${productId}`,
    },
    clearCart: {
      path: `${cartBasePath}/:sessionKey`,
      link: (serviceUrl: string, sessionKey: string) =>
        `${serviceUrl}${cartBasePath}/${sessionKey}`,
    },
  },

  order: {
    listOrders: {
      path: ordersBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${ordersBasePath}`,
    },
    getOrder: {
      path: `${ordersBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${ordersBasePath}/${id}`,
    },
    createOrder: {
      path: ordersBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${ordersBasePath}`,
    },
    updateOrderStatus: {
      path: `${ordersBasePath}/:id/status`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${ordersBasePath}/${id}/status`,
    },
  },

  tag: {
    listTags: {
      path: tagsBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${tagsBasePath}`,
    },
    getTag: {
      path: `${tagsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${tagsBasePath}/${id}`,
    },
    createTag: {
      path: tagsBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${tagsBasePath}`,
    },
    deleteTag: {
      path: `${tagsBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${tagsBasePath}/${id}`,
    },
  },

  stock: {
    listStock: {
      path: stockBasePath,
      link: (serviceUrl: string) => `${serviceUrl}${stockBasePath}`,
    },
    getStock: {
      path: `${stockBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${stockBasePath}/${id}`,
    },
    adjustStock: {
      path: `${stockBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${stockBasePath}/${id}`,
    },
    listStockMovements: {
      path: `${stockBasePath}/:id/movements`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${stockBasePath}/${id}/movements`,
    },
  },

  assistant: {
    ask: {
      path: `${assistantBasePath}/ask`,
      link: (serviceUrl: string) => `${serviceUrl}${assistantBasePath}/ask`,
    },
    guide: {
      path: `${assistantBasePath}/guide`,
      link: (serviceUrl: string) => `${serviceUrl}${assistantBasePath}/guide`,
    },
  },
};
